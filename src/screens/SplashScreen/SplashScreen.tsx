import React from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles, ICON_SIZE } from './styles';
import { Colors } from '../../theme/colors';
import { PaperPlaneIcon } from '../../components/PaperPlaneIcon';

export const SplashScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Center: Orbit + Icon + Tagline */}
                <View style={styles.centerSection}>
                    <View style={styles.outerOrbit}>
                        {/* Ambient decorative dots */}
                        <View style={styles.dotTopLeft} />
                        <View style={styles.dotBottomLeft} />
                        <View style={styles.dotTopRightHollow} />
                        <View style={styles.dotRightSmall} />

                        {/* Inner green soft circle */}
                        <View style={styles.innerCircle}>
                            <PaperPlaneIcon size={ICON_SIZE} />
                        </View>
                    </View>

                    {/* Tagline */}
                    <Text style={styles.tagline}>Automate. Engage. Grow.</Text>
                </View>

                {/* Bottom: Activity spinner + text */}
                <View style={styles.bottomSection}>
                    <ActivityIndicator
                        size="large"
                        color={Colors.primaryGreen}
                        style={styles.loader}
                    />
                    <Text style={styles.statusText}>Getting things ready...</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};