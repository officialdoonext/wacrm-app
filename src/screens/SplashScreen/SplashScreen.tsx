import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StatusBar,
    Animated,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { BrandLogo } from '../../components/BrandLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Center Brand Logo & Orbit Graphic */}
                <Animated.View
                    style={[
                        styles.centerSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}>
                    <View style={styles.logoCard}>
                        <BrandLogo size={110} variant="full" />
                        <Text style={{ fontSize: 28, fontWeight: '900', marginTop: 14, letterSpacing: -0.6 }}>
                            <Text style={{ color: '#002B49' }}>me</Text>
                            <Text style={{ color: '#00A859' }}>next</Text>
                        </Text>
                    </View>

                    <Text style={styles.tagline}>Automate. Engage. Grow.</Text>
                    <Text style={styles.subTagline}>Unified WhatsApp CRM & Team Inbox</Text>
                </Animated.View>

                {/* Bottom Spinner & Security Badge */}
                <View style={styles.bottomSection}>
                    <ActivityIndicator
                        size="large"
                        color={Colors.whatsappGreen}
                        style={styles.loader}
                    />
                    <Text style={styles.statusText}>Connecting to WhatsApp Business Cloud...</Text>
                    <Text style={styles.securityText}>Secured WhatsApp Business CRM Engine</Text>
                </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    logoCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    tagline: {
        marginTop: 18,
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    subTagline: {
        marginTop: 6,
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
        textAlign: 'center',
    },
    bottomSection: {
        alignItems: 'center',
        paddingBottom: 16,
    },
    loader: {
        marginBottom: 10,
    },
    statusText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
        marginBottom: 6,
    },
    securityText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
