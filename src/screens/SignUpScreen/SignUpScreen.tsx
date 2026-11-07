import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import {
    IconUser,
    IconMail,
    IconLock,
    IconClose,
    IconCheck,
} from '../../components/AppIcons';
import { EyeIcon, EyeOffIcon } from '../../components/AuthIcons';
import { supabase } from '../../services/supabase';

interface SignUpScreenProps {
    onNavigateLogin: () => void;
    onSignUpSuccess: (email: string) => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
    onNavigateLogin,
    onSignUpSuccess,
}) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignUp = async () => {
        setErrorMessage('');
        if (!fullName.trim()) {
            setErrorMessage('Please enter your full name');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setErrorMessage('Please enter a valid work email');
            return;
        }
        if (!companyName.trim()) {
            setErrorMessage('Please enter your company or workspace name');
            return;
        }
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        full_name: fullName.trim(),
                        company_name: companyName.trim(),
                    },
                },
            });

            if (error) {
                setErrorMessage(error.message);
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
            Alert.alert(
                'Account Created',
                'Verification email sent. Please verify your email to access your workspace.',
                [{ text: 'Proceed', onPress: () => onSignUpSuccess(email.trim()) }]
            );
        } catch (err: any) {
            setIsLoading(false);
            setErrorMessage(err?.message || 'Could not register workspace');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Header */}
                <AppHeader onBack={onNavigateLogin} title="Create Workspace" />

                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.select({ ios: 20, android: 40 })}
                    keyboardShouldPersistTaps="handled"
                    enableAutomaticScroll={true}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.headingTitle}>Get Started with menext</Text>
                        <Text style={styles.headingSubtitle}>
                            Create your official Meta WhatsApp Business multi-agent CRM workspace.
                        </Text>

                        {!!errorMessage && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        )}

                        {/* Full Name */}
                        <Text style={styles.fieldLabel}>Full Name *</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.iconWrap}>
                                <IconUser size={18} color="#94A3B8" />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Ramesh Patel"
                                placeholderTextColor="#94A3B8"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        {/* Work Email */}
                        <Text style={styles.fieldLabel}>Work Email *</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.iconWrap}>
                                <IconMail size={18} color="#94A3B8" />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="name@company.com"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        {/* Workspace / Company Name */}
                        <Text style={styles.fieldLabel}>Workspace / Company Name *</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.iconWrap}>
                                <IconCheck size={18} color="#94A3B8" />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Acme Technologies"
                                placeholderTextColor="#94A3B8"
                                value={companyName}
                                onChangeText={setCompanyName}
                            />
                        </View>

                        {/* Password */}
                        <Text style={styles.fieldLabel}>Password (8+ characters) *</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.iconWrap}>
                                <IconLock size={18} color="#94A3B8" />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="••••••••"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOffIcon size={20} color="#94A3B8" />
                                ) : (
                                    <EyeIcon size={20} color="#94A3B8" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <Text style={styles.fieldLabel}>Confirm Password *</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.iconWrap}>
                                <IconLock size={18} color="#94A3B8" />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="••••••••"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitBtn}
                            activeOpacity={0.85}
                            disabled={isLoading}
                            onPress={handleSignUp}>
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.submitBtnText}>Create Account & Workspace</Text>
                            )}
                        </TouchableOpacity>

                        {/* Footer: Already have an account */}
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={onNavigateLogin}>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 24,
    },
    headingTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 6,
    },
    headingSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 20,
        lineHeight: 19,
    },
    errorBox: {
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '600',
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 6,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 14,
    },
    iconWrap: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
    },
    eyeBtn: {
        padding: 4,
    },
    submitBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 10,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#64748B',
    },
    footerLink: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.whatsappGreen,
    },
});

