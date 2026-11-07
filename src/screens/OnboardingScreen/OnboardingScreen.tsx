import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    Linking,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { BrandLogo } from '../../components/BrandLogo';
import { AppHeader } from '../../components/AppHeader';
import {
    IconClock,
    IconPhone,
    IconWhatsApp,
    IconShieldAlert,
    IconCheckCircle,
    IconRefresh,
    IconLogOut,
} from '../../components/AppIcons';
import {
    ADMIN_CONTACT_PHONE,
    ADMIN_CONTACT_PHONE_INTL,
    buildWhatsAppAdminUrl,
    buildCallAdminUrl,
    formatExpiryDate,
    verifyCurrentUserAccess,
    BlockReason,
} from '../../services/accessGuardService';
import { authService } from '../../services/supabase';

interface OnboardingScreenProps {
    email?: string;
    reason?: BlockReason | string;
    expiryDate?: string | null;
    status?: string;
    onAccessGranted: () => void;
    onLogout: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
    email: initialEmail = '',
    reason: initialReason = 'inactive',
    expiryDate: initialExpiry = null,
    status: initialStatus = 'inactive',
    onAccessGranted,
    onLogout,
}) => {
    const [email, setEmail] = useState<string>(initialEmail);
    const [reason, setReason] = useState<BlockReason>((initialReason as BlockReason) || 'inactive');
    const [status, setStatus] = useState<string>(initialStatus || 'inactive');
    const [expiryDate, setExpiryDate] = useState<string | null>(initialExpiry);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [justActivated, setJustActivated] = useState<boolean>(false);

    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initial user email load
    useEffect(() => {
        let isMounted = true;
        authService.getCurrentUser().then((user) => {
            if (isMounted && user?.email) {
                setEmail(user.email);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    // Verification check function (manual or background poll)
    const runAccessCheck = useCallback(
        async (isBackground = false) => {
            try {
                if (!isBackground) setIsChecking(true);
                const result = await verifyCurrentUserAccess();

                if (result.email) setEmail(result.email);
                setStatus(result.status);
                setExpiryDate(result.expiryDate);
                if (result.reason) setReason(result.reason);

                if (result.isAllowed) {
                    setJustActivated(true);
                    // Automatically redirect to inbox on approval
                    setTimeout(() => {
                        onAccessGranted();
                    }, 700);
                } else if (!isBackground) {
                    const desc =
                        result.reason === 'expired'
                            ? 'Your subscription period has expired. Please contact administrator to renew.'
                            : 'Your account is currently inactive. Please contact the administrator via WhatsApp.';
                    Alert.alert('Access Restricted', desc);
                }
            } catch (err: any) {
                if (!isBackground) {
                    Alert.alert('Notice', 'Unable to reach server. Please try again.');
                }
            } finally {
                if (!isBackground) setIsChecking(false);
            }
        },
        [onAccessGranted]
    );

    // 6-Second Background Auto-Polling
    useEffect(() => {
        // Run initial check
        runAccessCheck(true);

        // Background auto-polling every 6s so the moment admin activates them,
        // the UI immediately confirms and enters the CRM automatically!
        pollTimerRef.current = setInterval(() => {
            runAccessCheck(true);
        }, 6000);

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
            }
        };
    }, [runAccessCheck]);

    const handleCallSupport = () => {
        const url = buildCallAdminUrl();
        Linking.openURL(url).catch(() => {
            Alert.alert('Phone Call', `Call administrator directly at: ${ADMIN_CONTACT_PHONE}`);
        });
    };

    const handleWhatsAppAdmin = () => {
        const url = buildWhatsAppAdminUrl(email);
        Linking.openURL(url).catch(() => {
            Alert.alert('WhatsApp', `Message support at: ${ADMIN_CONTACT_PHONE}`);
        });
    };

    const isExpired = reason === 'expired' || status === 'expired';
    const formattedExpiry = formatExpiryDate(expiryDate);

    // Badge styling
    const badgeColor = justActivated ? '#10B981' : isExpired ? '#F59E0B' : '#EF4444';
    const badgeBg = justActivated ? '#ECFDF5' : isExpired ? '#FFFBEB' : '#FEF2F2';
    const badgeBorder = justActivated ? '#A7F3D0' : isExpired ? '#FDE68A' : '#FECACA';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Standard Unified Top Header with Left Logo & Profile on right */}
            <AppHeader
                onBack={onLogout}
                title="Workspace Access"
                subtitle="Security Verification"
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Main Security Verification Card */}
                <View style={styles.card}>
                    {/* Status Icon Indicator */}
                    {justActivated ? (
                        <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }]}>
                            <IconCheckCircle size={38} color="#059669" />
                        </View>
                    ) : isExpired ? (
                        <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                            <IconClock size={36} color="#D97706" />
                        </View>
                    ) : (
                        <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                            <IconShieldAlert size={36} color="#DC2626" />
                        </View>
                    )}

                    {/* Headline */}
                    <Text style={styles.title}>
                        {justActivated
                            ? 'Account Activated!'
                            : isExpired
                            ? 'Subscription Expired'
                            : 'Account Inactive'}
                    </Text>

                    {/* Description */}
                    <Text style={styles.description}>
                        {justActivated
                            ? 'Your account has been verified by the administrator. Redirecting to your CRM inbox...'
                            : isExpired
                            ? formattedExpiry
                                ? `Your account subscription expired on ${formattedExpiry}. Please contact the administrator to renew access.`
                                : 'Your account subscription period has expired. Please contact the administrator to renew access.'
                            : 'Your account is currently inactive. In order to access the CRM, an administrator must activate your workspace.'}
                    </Text>

                    {/* User & Status Pill */}
                    {!!email && (
                        <View style={[styles.statusPill, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                            <View style={[styles.statusDot, { backgroundColor: badgeColor }]} />
                            <Text style={styles.statusEmail} numberOfLines={1}>
                                {email}
                            </Text>
                            <Text style={styles.statusDivider}>•</Text>
                            <Text style={[styles.statusText, { color: badgeColor }]}>
                                {justActivated ? 'Active' : isExpired ? 'Expired' : status.toUpperCase()}
                            </Text>
                        </View>
                    )}

                    {/* Instructions Banner */}
                    {!justActivated && (
                        <View style={styles.infoBanner}>
                            <Text style={styles.infoBannerTitle}>
                                How to activate your workspace:
                            </Text>
                            <Text style={styles.infoBannerText}>
                                Please reach out to the administrator via WhatsApp or direct phone call.
                                Once approved, this screen will instantly unlock automatically.
                            </Text>
                        </View>
                    )}

                    {/* Actions */}
                    {justActivated ? (
                        <TouchableOpacity
                            style={styles.activatedBtn}
                            activeOpacity={0.85}
                            onPress={onAccessGranted}>
                            <Text style={styles.activatedBtnText}>Enter CRM Dashboard</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            {/* WhatsApp Button */}
                            <TouchableOpacity
                                style={styles.whatsAppBtn}
                                activeOpacity={0.85}
                                onPress={handleWhatsAppAdmin}>
                                <IconWhatsApp size={20} color="#FFFFFF" />
                                <Text style={styles.whatsAppBtnText}>WhatsApp Administrator</Text>
                            </TouchableOpacity>

                            {/* Direct Phone Call Button */}
                            <TouchableOpacity
                                style={styles.callBtn}
                                activeOpacity={0.85}
                                onPress={handleCallSupport}>
                                <IconPhone size={18} color="#FFFFFF" />
                                <Text style={styles.callBtnText}>Call {ADMIN_CONTACT_PHONE}</Text>
                            </TouchableOpacity>

                            {/* Manual Refresh / Status Check Button */}
                            <TouchableOpacity
                                style={styles.checkBtn}
                                activeOpacity={0.85}
                                disabled={isChecking}
                                onPress={() => runAccessCheck(false)}>
                                {isChecking ? (
                                    <ActivityIndicator color="#059669" size="small" />
                                ) : (
                                    <>
                                        <IconRefresh size={16} color="#059669" />
                                        <Text style={styles.checkBtnText}>Check Status Again</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Bottom Logout Row */}
                    <View style={styles.footerRow}>
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            activeOpacity={0.7}
                            onPress={onLogout}>
                            <IconLogOut size={16} color="#DC2626" />
                            <Text style={styles.logoutText}>Sign Out / Switch Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Security Brand Hotline Footer */}
                <View style={styles.securityFooter}>
                    <Text style={styles.securityText}>
                        GrowNext Security • Administrator Hotline:{' '}
                        <Text style={styles.securityHotline} onPress={handleCallSupport}>
                            {ADMIN_CONTACT_PHONE_INTL}
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 18,
        maxWidth: '100%',
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginRight: 8,
    },
    statusEmail: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
        maxWidth: 160,
    },
    statusDivider: {
        color: '#94A3B8',
        marginHorizontal: 6,
        fontSize: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    infoBanner: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        width: '100%',
        marginBottom: 20,
    },
    infoBannerTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 4,
    },
    infoBannerText: {
        fontSize: 12,
        color: '#78350F',
        lineHeight: 18,
    },
    whatsAppBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 14,
        paddingVertical: 14,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
        shadowColor: Colors.whatsappGreen,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 2,
    },
    whatsAppBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    callBtn: {
        backgroundColor: '#0F172A',
        borderRadius: 14,
        paddingVertical: 14,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
    },
    callBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    checkBtn: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 13,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    checkBtnText: {
        color: '#059669',
        fontSize: 14,
        fontWeight: '700',
    },
    activatedBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 14,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
    activatedBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    footerRow: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        width: '100%',
        alignItems: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    logoutText: {
        color: '#DC2626',
        fontSize: 13,
        fontWeight: '600',
    },
    securityFooter: {
        marginTop: 20,
        alignItems: 'center',
    },
    securityText: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
    },
    securityHotline: {
        color: '#059669',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});
