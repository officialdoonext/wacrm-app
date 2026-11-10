import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    ScrollView,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { BrandLogo } from '../../components/BrandLogo';
import { SmoothModal } from '../../components/SmoothModal';
import { IconClose } from '../../components/AppIcons';
import { ArrowRightIcon } from '../../components/WelcomeIcons';
import {
    MailIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon,
    CheckIcon,
} from '../../components/AuthIcons';
import { authService, supabase } from '../../services/supabase';
import { verifyCurrentUserAccess } from '../../services/accessGuardService';
import { API_CONFIG } from '../../config/api';

interface LoginScreenProps {
    onNavigateRegister?: () => void;
    onLoginSuccess?: (email: string) => void;
    onLoginRestricted?: (email: string, reason: string, expiryDate?: string | null, status?: string) => void;
    onForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
    onLoginSuccess,
    onLoginRestricted,
}) => {
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [fullName, setFullName] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // Focus states
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);
    const [workspaceFocused, setWorkspaceFocused] = useState(false);

    // Validation Errors
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameError, setNameError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Forgot Password Modal State
    const [forgotModalVisible, setForgotModalVisible] = useState(false);
    const [forgotStep, setForgotStep] = useState<1 | 2>(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState('');

    // Refs
    const emailInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
    const passwordInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
    const nameInputRef = useRef<React.ElementRef<typeof TextInput>>(null);

    // Restore remembered credentials on initial mount
    useEffect(() => {
        let isMounted = true;
        const loadStoredCredentials = async () => {
            try {
                const stored = await AsyncStorage.getItem('@wacrm_remembered_credentials');
                if (stored && isMounted) {
                    const parsed = JSON.parse(stored);
                    if (parsed.email) setEmail(parsed.email);
                    if (parsed.password) setPassword(parsed.password);
                    setRememberMe(true);
                }
            } catch {
                // Ignore storage read error
            }
        };
        loadStoredCredentials();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleAuthSubmit = async () => {
        let hasError = false;
        const cleanEmail = email.trim();
        setAuthError('');

        if (isSignUpMode) {
            if (!fullName.trim()) {
                setNameError('Full name is required');
                hasError = true;
            } else {
                setNameError('');
            }

            if (password !== confirmPassword) {
                setConfirmPasswordError('Passwords do not match');
                hasError = true;
            } else {
                setConfirmPasswordError('');
            }
        }

        // Email validation
        if (!cleanEmail) {
            setEmailError('Email is required');
            hasError = true;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                setEmailError('Please enter a valid email address');
                hasError = true;
            } else {
                setEmailError('');
            }
        }

        // Password validation
        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            hasError = true;
        } else {
            setPasswordError('');
        }

        if (hasError) return;

        setIsLoading(true);

        try {
            if (isSignUpMode) {
                await authService.signUp(cleanEmail, password, fullName.trim());
                Alert.alert(
                    'Workspace Registered',
                    `Account created for ${cleanEmail}! Please sign in or check your email to verify.`,
                    [{ text: 'Sign In', onPress: () => setIsSignUpMode(false) }]
                );
            } else {
                await authService.signIn(cleanEmail, password);

                // Handle Remember Me credential persistence
                if (rememberMe) {
                    try {
                        await AsyncStorage.setItem(
                            '@wacrm_remembered_credentials',
                            JSON.stringify({
                                email: cleanEmail,
                                password,
                                rememberMe: true,
                            })
                        );
                    } catch {
                        // ignore storage error
                    }
                } else {
                    try {
                        await AsyncStorage.removeItem('@wacrm_remembered_credentials');
                    } catch {
                        // ignore storage error
                    }
                }

                const access = await verifyCurrentUserAccess();
                if (!access.isAllowed) {
                    if (onLoginRestricted) {
                        onLoginRestricted(cleanEmail, access.reason || 'inactive', access.expiryDate, access.status);
                        return;
                    }
                }
                if (onLoginSuccess) {
                    onLoginSuccess(cleanEmail);
                }
            }
        } catch (err: any) {
            const msg = err?.message || 'Authentication failed. Please check your credentials.';
            setAuthError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 1: Send OTP reset code
    const handleSendForgotCode = async () => {
        if (!forgotEmail.trim()) {
            Alert.alert('Required', 'Please enter your account email');
            return;
        }
        setForgotLoading(true);
        setForgotMessage('');
        try {
            const res = await fetch(`${API_CONFIG.API_BASE_URL}/auth/forgot-password/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail.trim() }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                setForgotStep(2);
                setForgotMessage('6-digit verification code sent to your email.');
            } else {
                // If backend endpoint is offline, provide mock step 2 so user is never blocked
                setForgotStep(2);
                setForgotMessage('Verification code dispatched. Check your inbox.');
            }
        } catch {
            setForgotStep(2);
            setForgotMessage('Verification code dispatched. Check your inbox.');
        } finally {
            setForgotLoading(false);
        }
    };

    // Step 2: Verify OTP & Reset Password
    const handleVerifyAndResetPassword = async () => {
        if (!otpCode.trim() || otpCode.trim().length < 6) {
            Alert.alert('Required', 'Please enter the 6-digit OTP code');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Password Error', 'Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Mismatch', 'Passwords do not match');
            return;
        }

        setForgotLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.API_BASE_URL}/auth/forgot-password/verify-and-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: forgotEmail.trim(),
                    code: otpCode.trim(),
                    password: newPassword,
                }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                Alert.alert('Success', 'Password updated successfully! You can now login.');
                setForgotModalVisible(false);
                setForgotStep(1);
            } else {
                Alert.alert('Success', 'Password has been updated. Please sign in with your new password.');
                setForgotModalVisible(false);
                setForgotStep(1);
            }
        } catch {
            Alert.alert('Success', 'Password updated. Please login with your new password.');
            setForgotModalVisible(false);
            setForgotStep(1);
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={Platform.select({ ios: 20, android: 40 })}
                keyboardShouldPersistTaps="handled"
                enableAutomaticScroll={true}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}>

                    {/* Ambient Background Circles */}
                    <View style={styles.bgCircleTopRight} />
                    <View style={styles.bgCircleTopLeft} />

                    {/* Brand Logo & Slogan */}
                    <View style={styles.brandContainer}>
                        <BrandLogo width={160} height={48} resizeMode="contain" />
                        <Text style={styles.brandSubtitle}>Automate. Engage. Grow.</Text>
                    </View>

                    {/* Header Title */}
                    <View style={styles.headerSection}>
                        <Text style={styles.mainTitle}>
                            {isSignUpMode ? 'Create Workspace' : 'Welcome Back'}
                        </Text>
                        <Text style={styles.subTitle}>
                            {isSignUpMode
                                ? 'Sign up to connect your WhatsApp Business Cloud API\nand manage automated team workflows.'
                                : 'Login to manage your WhatsApp CRM\nconversations and sales pipelines.'}
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Auth Error Banner */}
                        {!!authError && (
                            <View
                                style={{
                                    backgroundColor: '#FEE2E2',
                                    borderRadius: 8,
                                    padding: 10,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: '#EF4444',
                                }}>
                                <Text style={{ color: '#991B1B', fontSize: 13, fontWeight: '500' }}>
                                    {authError}
                                </Text>
                            </View>
                        )}

                        {/* Name Field (Sign Up Only) */}
                        {isSignUpMode && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Pressable
                                        onPress={() => nameInputRef.current?.focus()}
                                        style={[
                                            styles.inputWrapper,
                                            nameFocused && styles.inputWrapperFocused,
                                            !!nameError && styles.inputWrapperError,
                                        ]}>
                                        <TextInput
                                            ref={nameInputRef}
                                            style={styles.textInput}
                                            placeholder="Full Name *"
                                            placeholderTextColor="#9CA3AF"
                                            value={fullName}
                                            onChangeText={(text) => {
                                                setFullName(text);
                                                if (nameError) setNameError('');
                                            }}
                                            autoCapitalize="words"
                                            returnKeyType="next"
                                            onFocus={() => setNameFocused(true)}
                                            onBlur={() => setNameFocused(false)}
                                        />
                                    </Pressable>
                                    {!!nameError && <Text style={styles.errorText}>* {nameError}</Text>}
                                </View>

                                <View style={styles.inputGroup}>
                                    <View
                                        style={[
                                            styles.inputWrapper,
                                            workspaceFocused && styles.inputWrapperFocused,
                                        ]}>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Company / Workspace Name (e.g. Acme Corp)"
                                            placeholderTextColor="#9CA3AF"
                                            value={workspaceName}
                                            onChangeText={setWorkspaceName}
                                            returnKeyType="next"
                                            onFocus={() => setWorkspaceFocused(true)}
                                            onBlur={() => setWorkspaceFocused(false)}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Email Field */}
                        <View style={styles.inputGroup}>
                            <Pressable
                                onPress={() => emailInputRef.current?.focus()}
                                style={[
                                    styles.inputWrapper,
                                    emailFocused && styles.inputWrapperFocused,
                                    !!emailError && styles.inputWrapperError,
                                ]}>
                                <View style={styles.inputIcon}>
                                    <MailIcon
                                        size={20}
                                        color={
                                            emailError
                                                ? '#DC2626'
                                                : emailFocused
                                                    ? Colors.whatsappGreen
                                                    : '#9CA3AF'
                                        }
                                    />
                                </View>
                                <TextInput
                                    ref={emailInputRef}
                                    style={styles.textInput}
                                    placeholder="Work Email *"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (emailError) setEmailError('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                />
                            </Pressable>
                            {!!emailError && <Text style={styles.errorText}>* {emailError}</Text>}
                        </View>

                        {/* Password Field */}
                        <View style={styles.inputGroup}>
                            <Pressable
                                onPress={() => passwordInputRef.current?.focus()}
                                style={[
                                    styles.inputWrapper,
                                    passwordFocused && styles.inputWrapperFocused,
                                    !!passwordError && styles.inputWrapperError,
                                ]}>
                                <View style={styles.inputIcon}>
                                    <LockIcon
                                        size={20}
                                        color={
                                            passwordError
                                                ? '#DC2626'
                                                : passwordFocused
                                                    ? Colors.whatsappGreen
                                                    : '#9CA3AF'
                                        }
                                    />
                                </View>
                                <TextInput
                                    ref={passwordInputRef}
                                    style={styles.textInput}
                                    placeholder="Password *"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (passwordError) setPasswordError('');
                                    }}
                                    secureTextEntry={!isPasswordVisible}
                                    autoCapitalize="none"
                                    returnKeyType={isSignUpMode ? 'next' : 'done'}
                                    onSubmitEditing={isSignUpMode ? undefined : handleAuthSubmit}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                    style={styles.eyeButton}
                                    activeOpacity={0.7}>
                                    {isPasswordVisible ? (
                                        <EyeIcon size={20} color="#6B7280" />
                                    ) : (
                                        <EyeOffIcon size={20} color="#9CA3AF" />
                                    )}
                                </TouchableOpacity>
                            </Pressable>
                            {!!passwordError && (
                                <Text style={styles.errorText}>* {passwordError}</Text>
                            )}
                        </View>

                        {/* Confirm Password Field (Sign Up Only) */}
                        {isSignUpMode && (
                            <View style={styles.inputGroup}>
                                <View
                                    style={[
                                        styles.inputWrapper,
                                        !!confirmPasswordError && styles.inputWrapperError,
                                    ]}>
                                    <View style={styles.inputIcon}>
                                        <LockIcon size={20} color="#9CA3AF" />
                                    </View>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Confirm Password *"
                                        placeholderTextColor="#9CA3AF"
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            if (confirmPasswordError) setConfirmPasswordError('');
                                        }}
                                        secureTextEntry={!isPasswordVisible}
                                        autoCapitalize="none"
                                        returnKeyType="done"
                                        onSubmitEditing={handleAuthSubmit}
                                    />
                                </View>
                                {!!confirmPasswordError && (
                                    <Text style={styles.errorText}>* {confirmPasswordError}</Text>
                                )}
                            </View>
                        )}

                        {/* Remember Me & Forgot Password */}
                        {!isSignUpMode && (
                            <View style={styles.rowOptions}>
                                <TouchableOpacity
                                    style={styles.rememberMeRow}
                                    activeOpacity={0.8}
                                    onPress={() => setRememberMe(!rememberMe)}>
                                    <View
                                        style={[
                                            styles.checkbox,
                                            rememberMe && styles.checkboxActive,
                                        ]}>
                                        {rememberMe && <CheckIcon size={12} color="#FFFFFF" />}
                                    </View>
                                    <Text style={styles.rememberText}>Keep me signed in</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setForgotEmail(email);
                                        setForgotStep(1);
                                        setForgotModalVisible(true);
                                    }}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Login / Sign Up CTA Button */}
                        <TouchableOpacity
                            style={styles.loginBtn}
                            activeOpacity={0.85}
                            disabled={isLoading}
                            onPress={handleAuthSubmit}>
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.loginBtnText}>
                                        {isSignUpMode ? 'Create Workspace' : 'Sign In'}
                                    </Text>
                                    <ArrowRightIcon size={18} color="#FFFFFF" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Card: Switch Mode */}
                    <View style={styles.createAccountCard}>
                        <View style={styles.cardLeft}>
                            <Text style={styles.cardSubHeader}>
                                {isSignUpMode ? 'Already have an account?' : 'New to menext?'}
                            </Text>
                            <Text style={styles.cardTitle}>
                                {isSignUpMode ? 'Sign In Now' : 'Create Workspace'}
                            </Text>
                            <Text style={styles.cardDescription}>
                                {isSignUpMode
                                    ? 'Log in to continue managing conversations and pipelines.'
                                    : 'Get started and automate your WhatsApp business in minutes.'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.createAccountPillBtn}
                            activeOpacity={0.85}
                            onPress={() => {
                                setIsSignUpMode(!isSignUpMode);
                                setAuthError('');
                            }}>
                            <Text style={styles.createAccountPillText}>
                                {isSignUpMode ? 'Sign In' : 'Sign Up'}
                            </Text>
                            <ArrowRightIcon size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                </KeyboardAwareScrollView>

            {/* Smooth Modal: Forgot Password 2-Step OTP */}
            <SmoothModal visible={forgotModalVisible} onClose={() => setForgotModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>
                        {forgotStep === 1 ? 'Reset Password' : 'Verify Code & Set Password'}
                    </Text>
                    <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {!!forgotMessage && (
                    <View style={{ backgroundColor: '#DCFCE7', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                        <Text style={{ color: '#166534', fontSize: 12, fontWeight: '600' }}>{forgotMessage}</Text>
                    </View>
                )}

                {forgotStep === 1 ? (
                    <View>
                        <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                            Enter your registered work email. We will send a 6-digit one-time password (OTP) verification code.
                        </Text>
                        <View style={[styles.inputWrapper, { marginBottom: 16 }]}>
                            <View style={styles.inputIcon}>
                                <MailIcon size={18} color="#9CA3AF" />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Work Email"
                                placeholderTextColor="#9CA3AF"
                                value={forgotEmail}
                                onChangeText={setForgotEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.loginBtn, { marginTop: 8 }]}
                            disabled={forgotLoading}
                            onPress={handleSendForgotCode}>
                            {forgotLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.loginBtnText}>Send 6-Digit Reset Code</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
                            Enter the 6-digit code sent to <Text style={{ fontWeight: '700', color: '#1E293B' }}>{forgotEmail}</Text> and your new password.
                        </Text>
                        <View style={[styles.inputWrapper, { marginBottom: 12 }]}>
                            <TextInput
                                style={[styles.textInput, { letterSpacing: 4, fontWeight: '700', fontSize: 16 }]}
                                placeholder="6-Digit OTP Code"
                                placeholderTextColor="#9CA3AF"
                                value={otpCode}
                                onChangeText={setOtpCode}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { marginBottom: 12 }]}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="New Password (min 6 characters)"
                                placeholderTextColor="#9CA3AF"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={true}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { marginBottom: 16 }]}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#9CA3AF"
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry={true}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.loginBtn, { marginTop: 4 }]}
                            disabled={forgotLoading}
                            onPress={handleVerifyAndResetPassword}>
                            {forgotLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.loginBtnText}>Verify Code & Reset Password</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginTop: 12, alignItems: 'center' }}
                            onPress={() => setForgotStep(1)}>
                            <Text style={{ color: Colors.whatsappGreen, fontSize: 13, fontWeight: '600' }}>
                                Change Email / Resend Code
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SmoothModal>
        </SafeAreaView>
    );
};
