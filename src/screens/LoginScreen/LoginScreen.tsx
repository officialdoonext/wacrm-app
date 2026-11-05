import React, { useState, useRef } from 'react';
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
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { PaperPlaneIcon } from '../../components/PaperPlaneIcon';
import { ArrowRightIcon } from '../../components/WelcomeIcons';
import {
    MailIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon,
    CheckIcon,
    GoogleIcon,
    AppleIcon,
} from '../../components/AuthIcons';
import { authService } from '../../services/supabase';

interface LoginScreenProps {
    onNavigateRegister?: () => void;
    onLoginSuccess?: (email: string) => void;
    onForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
    onNavigateRegister,
    onLoginSuccess,
    onForgotPassword,
}) => {
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // Focus states
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);

    // Mandatory Validation Error states
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameError, setNameError] = useState('');

    // Refs for keyboard focus control
    const emailInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
    const passwordInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
    const nameInputRef = useRef<React.ElementRef<typeof TextInput>>(null);

    const handleAuthSubmit = async () => {
        let hasError = false;
        const cleanEmail = email.trim();
        setAuthError('');

        if (isSignUpMode && !fullName.trim()) {
            setNameError('Full name is required');
            hasError = true;
        } else {
            setNameError('');
        }

        // 1. Mandatory Email validation
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

        // 2. Mandatory Password validation
        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            hasError = true;
        } else {
            setPasswordError('');
        }

        // Stop if any mandatory field is missing
        if (hasError) {
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);

        try {
            if (isSignUpMode) {
                await authService.signUp(cleanEmail, password, fullName);
            } else {
                await authService.signIn(cleanEmail, password);
            }

            setIsLoading(false);
            if (onLoginSuccess) {
                onLoginSuccess(cleanEmail);
            }
        } catch (err: any) {
            setIsLoading(false);
            setAuthError(err?.message || 'Authentication failed. Please check your credentials.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">

                    {/* Ambient Background Circles */}
                    <View style={styles.bgCircleTopRight} />
                    <View style={styles.bgCircleTopLeft} />

                    {/* Logo & Brand Slogan */}
                    <View style={styles.brandContainer}>
                        <PaperPlaneIcon size={50} color={Colors.primaryGreen} />
                        <Text style={styles.brandTitle}>WhatsAppNext</Text>
                        <Text style={styles.brandSubtitle}>Automate. Engage. Grow.</Text>
                    </View>

                    {/* Header Title */}
                    <View style={styles.headerSection}>
                        <Text style={styles.mainTitle}>
                            {isSignUpMode ? 'Create Account' : 'Welcome Back'}
                        </Text>
                        <Text style={styles.subTitle}>
                            {isSignUpMode
                                ? 'Sign up to connect your WhatsApp Business API\nand manage automated workflows.'
                                : 'Login to manage your WhatsApp automation\nand grow your business.'}
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
                                        onSubmitEditing={() => emailInputRef.current?.focus()}
                                        onFocus={() => setNameFocused(true)}
                                        onBlur={() => setNameFocused(false)}
                                    />
                                </Pressable>
                                {!!nameError && <Text style={styles.errorText}>* {nameError}</Text>}
                            </View>
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
                                                    ? Colors.primaryGreen
                                                    : '#9CA3AF'
                                        }
                                    />
                                </View>
                                <TextInput
                                    ref={emailInputRef}
                                    style={styles.textInput}
                                    placeholder="Email Address *"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (emailError) setEmailError('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    showSoftInputOnFocus={true}
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                />
                            </Pressable>
                            {!!emailError && (
                                <Text style={styles.errorText}>* {emailError}</Text>
                            )}
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
                                                    ? Colors.primaryGreen
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
                                    showSoftInputOnFocus={true}
                                    returnKeyType="done"
                                    onSubmitEditing={handleAuthSubmit}
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
                                    <Text style={styles.rememberText}>Remember me</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={onForgotPassword}>
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
                                        {isSignUpMode ? 'Sign Up' : 'Login'}
                                    </Text>
                                    <ArrowRightIcon size={18} color="#FFFFFF" />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* OR Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Logins */}
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                            <GoogleIcon size={20} />
                            <Text style={styles.socialBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                            <AppleIcon size={20} color="#000000" />
                            <Text style={styles.socialBtnText}>Continue with Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Card: Switch Mode (Create Account / Login) */}
                    <View style={styles.createAccountCard}>
                        <View style={styles.cardLeft}>
                            <Text style={styles.cardSubHeader}>
                                {isSignUpMode ? 'Already have an account?' : 'New to WhatsAppNext?'}
                            </Text>
                            <Text style={styles.cardTitle}>
                                {isSignUpMode ? 'Sign In Now' : 'Create an Account'}
                            </Text>
                            <Text style={styles.cardDescription}>
                                {isSignUpMode
                                    ? 'Log in to continue managing your conversations.'
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
                                {isSignUpMode ? 'Sign In' : 'Create Account'}
                            </Text>
                            <ArrowRightIcon size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};