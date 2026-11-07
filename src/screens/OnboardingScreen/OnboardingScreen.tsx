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
    Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
            if (isMounted && user?.email && !email) {
                setEmail(user.email);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [email]);

    // High-speed verification check function (manual or background poll)
    const runAccessCheck = useCallback(
        async (isBackground = false) => {
            try {
                if (!isBackground) setIsChecking(true);
                const result = await verifyCurrentUserAccess(email);

                if (result.email) setEmail(result.email);
                setStatus(result.status);
                setExpiryDate(result.expiryDate);
                if (result.reason) setReason(result.reason);

                if (result.isAllowed) {
                    setJustActivated(true);
                    setTimeout(() => {
                        onAccessGranted();
                    }, 650);
                } else if (!isBackground) {
                    const desc =
                        result.reason === 'expired'
                            ? `Your subscription expired on ${formatExpiryDate(result.expiryDate) || 'date'}. Please contact administrator to renew access.`
                            : 'Your account is currently inactive. An administrator has not yet activated it.';
                    Alert.alert('Status Verified', desc);
                }
            } catch (err: any) {
                if (!isBackground) {
                    Alert.alert('Notice', 'Unable to reach server. Please check your network and try again.');
                }
            } finally {
                if (!isBackground) setIsChecking(false);
            }
        },
        [email, onAccessGranted]
    );

    // 6-Second Background Auto-Polling: detects admin approval instantly
    useEffect(() => {
        runAccessCheck(true);

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

    // Status styling constants matching WACRM design language
    const badgeColor = justActivated ? '#10B981' : isExpired ? '#D97706' : '#DC2626';
    const badgeBg = justActivated ? '#ECFDF5' : isExpired ? '#FFFBEB' : '#FEF2F2';
    const badgeBorder = justActivated ? '#A7F3D0' : isExpired ? '#FDE68A' : '#FECACA';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Standard Unified Top Header */}
            <AppHeader
                onBack={onLogout}
                title="Workspace Access"
                subtitle="Account Verification"
            />

            <View style={styles.container}>
                {/* Soft ambient circular halos matching LoginScreen */}
                <View style={styles.bgCircleTopRight} />
                <View style={styles.bgCircleTopLeft} />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>

                    {/* Centered Brand Header */}
                    <View style={styles.brandContainer}>
                        <BrandLogo width={150} height={42} resizeMode="contain" />
                        <Text style={styles.brandSubtitle}>Automate. Engage. Grow.</Text>
                    </View>

                    {/* Main Verification Card */}
                    <View style={styles.card}>
                        {/* Hero Status Icon */}
                        {justActivated ? (
                            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                                <IconCheckCircle size={38} color="#059669" />
                            </View>
                        ) : isExpired ? (
                            <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                                <IconClock size={36} color="#D97706" />
                            </View>
                        ) : (
                            <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                                <IconShieldAlert size={36} color="#DC2626" />
                            </View>
                        )}

                        {/* Screen Heading */}
                        <Text style={styles.mainTitle}>
                            {justActivated
                                ? 'Account Activated!'
                                : isExpired
                                ? 'Subscription Expired'
                                : 'Account Pending Activation'}
                        </Text>

                        {/* Description */}
                        <Text style={styles.subTitle}>
                            {justActivated
                                ? 'Your workspace has been approved by the administrator. Redirecting to your CRM inbox...'
                                : isExpired
                                ? formattedExpiry
                                    ? `Your subscription period expired on ${formattedExpiry}. Please contact the administrator to renew access.`
                                    : 'Your subscription period has expired. Please contact the administrator to renew access.'
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
                                    {justActivated ? 'ACTIVE' : isExpired ? 'EXPIRED' : status.toUpperCase()}
                                </Text>
                            </View>
                        )}

                        {/* Expiry Date Card if expired */}
                        {isExpired && !!formattedExpiry && (
                            <View style={styles.expiryBox}>
                                <IconClock size={16} color="#B45309" />
                                <Text style={styles.expiryText}>
                                    Expired on: <Text style={styles.expiryDateBold}>{formattedExpiry}</Text>
                                </Text>
                            </View>
                        )}

                        {/* How To Activate Info Card */}
                        {!justActivated && (
                            <View style={styles.infoCard}>
                                <Text style={styles.infoCardTitle}>How to activate your workspace:</Text>
                                <Text style={styles.infoCardDescription}>
                                    Reach out to the administrator via WhatsApp or direct phone call.
                                    Once approved in the dashboard, this screen will automatically unlock.
                                </Text>
                            </View>
                        )}

                        {/* Action CTA Buttons */}
                        {justActivated ? (
                            <TouchableOpacity
                                style={styles.activatedBtn}
                                activeOpacity={0.85}
                                onPress={onAccessGranted}>
                                <Text style={styles.activatedBtnText}>Enter CRM Dashboard</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.buttonStack}>
                                {/* WhatsApp Administrator (Primary Green) */}
                                <TouchableOpacity
                                    style={styles.whatsAppBtn}
                                    activeOpacity={0.85}
                                    onPress={handleWhatsAppAdmin}>
                                    <IconWhatsApp size={22} color="#FFFFFF" />
                                    <Text style={styles.whatsAppBtnText}>WhatsApp Administrator</Text>
                                </TouchableOpacity>

                                {/* Direct Phone Call Button (Clean Outlined) */}
                                <TouchableOpacity
                                    style={styles.callBtn}
                                    activeOpacity={0.85}
                                    onPress={handleCallSupport}>
                                    <IconPhone size={19} color="#059669" />
                                    <Text style={styles.callBtnText}>Call to {ADMIN_CONTACT_PHONE}</Text>
                                </TouchableOpacity>

                                {/* Check Status Button (Instant verification) */}
                                <TouchableOpacity
                                    style={styles.refreshBtn}
                                    activeOpacity={0.85}
                                    disabled={isChecking}
                                    onPress={() => runAccessCheck(false)}>
                                    {isChecking ? (
                                        <>
                                            <ActivityIndicator color="#059669" size="small" />
                                            <Text style={styles.refreshBtnText}>Checking Status with Server...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <IconRefresh size={17} color="#059669" />
                                            <Text style={styles.refreshBtnText}>Check Status Again</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Footer Sign Out Option */}
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

                    {/* Security Support Footer */}
                    <View style={styles.securityFooter}>
                        <Text style={styles.securityText}>
                            GrowNext Security • Administrator Hotline:{' '}
                            <Text style={styles.securityHotline} onPress={handleCallSupport}>
                                {ADMIN_CONTACT_PHONE_INTL}
                            </Text>
                        </Text>
                    </View>
                </ScrollView>
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
        position: 'relative',
    },
    // Soft ambient circular halos matching LoginScreen
    bgCircleTopRight: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#E8F8F0',
        opacity: 0.8,
    },
    bgCircleTopLeft: {
        position: 'absolute',
        top: 40,
        left: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F0FAF4',
        opacity: 0.7,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 22,
        paddingTop: Platform.select({ ios: 10, android: 14 }),
        paddingBottom: Platform.select({ ios: 28, android: 24 }),
        alignItems: 'center',
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    brandSubtitle: {
        fontSize: 12.5,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 2,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 24,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 4,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0B1528',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: -0.4,
    },
    subTitle: {
        fontSize: 13.5,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        maxWidth: '100%',
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginRight: 8,
    },
    statusEmail: {
        fontSize: 12.5,
        fontWeight: '600',
        color: '#1F2937',
        maxWidth: 170,
    },
    statusDivider: {
        color: '#9CA3AF',
        marginHorizontal: 6,
        fontSize: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    expiryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: '100%',
        marginBottom: 14,
        justifyContent: 'center',
    },
    expiryText: {
        fontSize: 12.5,
        color: '#92400E',
        fontWeight: '500',
    },
    expiryDateBold: {
        fontWeight: '700',
        color: '#78350F',
    },
    infoCard: {
        backgroundColor: '#E8F8F0',
        borderColor: '#D4F3E2',
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        width: '100%',
        marginBottom: 18,
    },
    infoCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0B1528',
        marginBottom: 4,
    },
    infoCardDescription: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
    },
    buttonStack: {
        width: '100%',
        gap: 10,
    },
    whatsAppBtn: {
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.whatsappGreen,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        shadowColor: Colors.whatsappGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    whatsAppBtnText: {
        color: '#FFFFFF',
        fontSize: 15.5,
        fontWeight: '700',
    },
    callBtn: {
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    callBtnText: {
        color: '#1F2937',
        fontSize: 15,
        fontWeight: '700',
    },
    refreshBtn: {
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0FAF4',
        borderWidth: 1,
        borderColor: '#D4F3E2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    refreshBtnText: {
        color: '#059669',
        fontSize: 14,
        fontWeight: '700',
    },
    activatedBtn: {
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.primaryGreen,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 3,
    },
    activatedBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    footerRow: {
        marginTop: 18,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
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
        marginTop: 18,
        alignItems: 'center',
    },
    securityText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    securityHotline: {
        color: Colors.primaryGreen,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});
