import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    Linking,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { BrandLogo } from '../../components/BrandLogo';
import { AppHeader } from '../../components/AppHeader';
import { IconClock } from '../../components/AppIcons';
import { authService } from '../../services/supabase';
import { API_CONFIG } from '../../config/api';

const ADMIN_PHONE = '+919999999999';

interface OnboardingScreenProps {
    email?: string;
    reason?: 'trial_expired' | 'payment_required' | 'suspended' | 'pending';
    onAccessGranted: () => void;
    onLogout: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
    email = '',
    reason = 'pending',
    onAccessGranted,
    onLogout,
}) => {
    const [isChecking, setIsChecking] = useState(false);

    const handleCallSupport = () => {
        Linking.openURL(`tel:${ADMIN_PHONE}`).catch(() => {
            Alert.alert('Phone Dialer', `Call admin support at: ${ADMIN_PHONE}`);
        });
    };

    const handleWhatsAppAdmin = () => {
        const text = encodeURIComponent(`Hi, I need activation for WhatsApp CRM account: ${email}`);
        const url = `https://wa.me/${ADMIN_PHONE.replace(/[^\d]/g, '')}?text=${text}`;
        Linking.openURL(url).catch(() => {
            Alert.alert('WhatsApp', `Message support at: ${ADMIN_PHONE}`);
        });
    };

    const handleCheckStatus = async () => {
        setIsChecking(true);
        try {
            const res = await fetch(`${API_CONFIG.API_BASE_URL}/account/status`);
            if (res.ok) {
                const data = await res.json();
                if (data.isAllowed || data.status === 'active') {
                    Alert.alert('Activated!', 'Your workspace has been approved.');
                    onAccessGranted();
                    return;
                }
            }
            Alert.alert('Pending Approval', 'Your subscription is currently under review by the workspace admin.');
        } catch {
            Alert.alert('Notice', 'Account approval pending. Please contact support via WhatsApp.');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Top Header */}
                <AppHeader onBack={onLogout} title="Workspace Verification" />

                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <IconClock size={32} color="#D97706" />
                    </View>

                    <Text style={styles.title}>Workspace Pending Activation</Text>
                    <Text style={styles.description}>
                        Your WhatsApp Business CRM workspace ({email || 'your account'}) is currently awaiting billing approval or trial verification.
                    </Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            Connect with our team to activate official WhatsApp Cloud API templates, multi-agent inbox, and automation bots.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.whatsAppBtn}
                        activeOpacity={0.85}
                        onPress={handleWhatsAppAdmin}>
                        <Text style={styles.whatsAppBtnText}>Chat with WhatsApp Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.callBtn}
                        activeOpacity={0.85}
                        onPress={handleCallSupport}>
                        <Text style={styles.callBtnText}>Call Admin / Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.checkBtn}
                        activeOpacity={0.85}
                        disabled={isChecking}
                        onPress={handleCheckStatus}>
                        {isChecking ? (
                            <ActivityIndicator color="#059669" size="small" />
                        ) : (
                            <Text style={styles.checkBtnText}>Check Status Again</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                    <Text style={styles.logoutText}>Log Out / Switch Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
    },
    topLogo: {
        alignItems: 'center',
        marginTop: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    infoBox: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        width: '100%',
    },
    infoText: {
        fontSize: 12,
        color: '#475569',
        lineHeight: 18,
        textAlign: 'center',
    },
    whatsAppBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 12,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    whatsAppBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    callBtn: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    callBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    checkBtn: {
        backgroundColor: '#DCFCE7',
        borderRadius: 12,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
    },
    checkBtnText: {
        color: '#166534',
        fontSize: 14,
        fontWeight: '700',
    },
    logoutBtn: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    logoutText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
});
