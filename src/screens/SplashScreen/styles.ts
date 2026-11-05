import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fluid responsive sizing
const ORBIT_SIZE = Math.min(Math.max(SCREEN_WIDTH * 0.72, 220), 320);
const INNER_CIRCLE_SIZE = ORBIT_SIZE * 0.72;
const ICON_SIZE = INNER_CIRCLE_SIZE * 0.46;

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: Platform.select({ ios: 16, android: 24 }),
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    // Dashed orbit circle
    outerOrbit: {
        width: ORBIT_SIZE,
        height: ORBIT_SIZE,
        borderRadius: ORBIT_SIZE / 2,
        borderWidth: 1.5,
        borderColor: Colors.orbitRing,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    // Ambient satellite dots
    dotTopLeft: {
        position: 'absolute',
        top: ORBIT_SIZE * 0.08,
        left: ORBIT_SIZE * 0.22,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.satelliteDot,
    },
    dotBottomLeft: {
        position: 'absolute',
        bottom: ORBIT_SIZE * 0.15,
        left: ORBIT_SIZE * 0.1,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: Colors.satelliteDot,
    },
    dotTopRightHollow: {
        position: 'absolute',
        top: ORBIT_SIZE * 0.2,
        right: ORBIT_SIZE * 0.12,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: Colors.satelliteDot,
        backgroundColor: 'transparent',
    },
    dotRightSmall: {
        position: 'absolute',
        top: ORBIT_SIZE * 0.45,
        right: -4,
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: Colors.satelliteDot,
    },
    // Glowing center circle
    innerCircle: {
        width: INNER_CIRCLE_SIZE,
        height: INNER_CIRCLE_SIZE,
        borderRadius: INNER_CIRCLE_SIZE / 2,
        backgroundColor: Colors.primaryGreenSoft,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for iOS
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        // Elevation for Android
        elevation: 6,
    },
    // Tagline text
    tagline: {
        marginTop: Math.max(SCREEN_HEIGHT * 0.035, 20),
        fontSize: Math.min(Math.max(SCREEN_WIDTH * 0.045, 15), 18),
        fontWeight: '600',
        color: Colors.textTagline,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    // Bottom loader section
    bottomSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Platform.select({ ios: 12, android: 20 }),
    },
    loader: {
        marginBottom: 10,
    },
    statusText: {
        fontSize: Math.min(Math.max(SCREEN_WIDTH * 0.035, 13), 15),
        color: Colors.textMuted,
        fontWeight: '400',
        letterSpacing: 0.2,
    },
});

export { ICON_SIZE };