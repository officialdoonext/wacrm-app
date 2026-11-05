import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const IS_SMALL_SCREEN = SCREEN_WIDTH <= 375;
const PHONE_WIDTH = Math.min(SCREEN_WIDTH * 0.52, 210);
const PHONE_HEIGHT = PHONE_WIDTH * 1.84;
const BADGE_SIZE = Math.min(SCREEN_WIDTH * 0.17, 72);

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: Platform.select({ ios: 6, android: 12 }),
        paddingBottom: Platform.select({ ios: 14, android: 4 }), // Gives iOS safe breathing room below the brand tagline
        zIndex: 10,
    },
    brandHeader: {
        alignItems: 'flex-start',
    },
    brandName: {
        fontSize: IS_SMALL_SCREEN ? 22 : 25,
        fontWeight: '900',
        color: '#0B1528',
        letterSpacing: -0.5,
        marginTop: 4,
    },
    brandSub: {
        fontSize: 12.5,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 1,
    },
    skipBtn: {
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    skipText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },

    // Carousel Slide Container
    slideItem: {
        width: SCREEN_WIDTH,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: Platform.select({ ios: 'flex-start', android: 'center' }), // Prevents upward collision on iOS
        paddingTop: Platform.select({ ios: 10, android: 0 }),
    },

    // Hero Titles
    heroTextContainer: {
        marginTop: Platform.select({
            ios: 12,
            android: Math.max(SCREEN_HEIGHT * 0.015, 10),
        }),
        marginBottom: Platform.select({
            ios: 16,
            android: Math.max(SCREEN_HEIGHT * 0.01, 8),
        }),
        width: '100%',
    },
    heroHeading: {
        fontSize: IS_SMALL_SCREEN ? 24 : 28,
        fontWeight: '900',
        color: '#0B1528',
        lineHeight: IS_SMALL_SCREEN ? 30 : 34,
        letterSpacing: -0.6,
    },
    heroGreen: {
        color: Colors.primaryGreen,
    },
    heroSubheading: {
        marginTop: 6,
        fontSize: IS_SMALL_SCREEN ? 13 : 14,
        color: '#6B7280',
        lineHeight: 19,
        fontWeight: '400',
    },

    // Central Mockup & Badges
    showcaseContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        height: PHONE_HEIGHT + 24,
        width: '100%',
    },
    phoneFrame: {
        width: PHONE_WIDTH,
        height: PHONE_HEIGHT,
        borderRadius: 26,
        borderWidth: 4.5,
        borderColor: '#1E293B',
        backgroundColor: Colors.phoneBg,
        paddingHorizontal: 6,
        paddingTop: 8,
        overflow: 'hidden',
        alignItems: 'center',
    },
    phoneIsland: {
        width: 44,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0F172A',
        marginBottom: 8,
    },
    chatStack: {
        width: '100%',
    },
    incomingBubble: {
        backgroundColor: Colors.chatBubbleWhite,
        borderRadius: 10,
        borderTopLeftRadius: 2,
        padding: 6,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },
    chatMsgText: {
        fontSize: 7.5,
        color: '#1E293B',
        lineHeight: 10.5,
        fontWeight: '500',
    },
    chatTime: {
        fontSize: 6,
        color: '#94A3B8',
        alignSelf: 'flex-end',
        marginTop: 2,
    },
    menuOption: {
        backgroundColor: Colors.chatBubbleWhite,
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 7,
        marginVertical: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuEmoji: {
        fontSize: 8.5,
    },
    menuOptionText: {
        fontSize: 7.2,
        fontWeight: '600',
        color: '#334155',
        marginLeft: 4,
    },
    outgoingBubble: {
        backgroundColor: Colors.chatBubbleGreen,
        borderRadius: 10,
        borderTopRightRadius: 2,
        padding: 5,
        alignSelf: 'flex-end',
        marginTop: 4,
        marginBottom: 4,
    },
    outgoingText: {
        fontSize: 7.5,
        color: '#064E3B',
        fontWeight: '500',
    },
    outgoingChatTime: {
        fontSize: 6,
        color: '#059669',
        alignSelf: 'flex-end',
        marginTop: 2,
    },

    // Floating Badges
    floatingBadge: {
        position: 'absolute',
        width: BADGE_SIZE,
        paddingVertical: 7,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    badgeTopLeft: {
        left: '1%',
        top: '20%',
    },
    badgeBottomLeft: {
        left: '2%',
        bottom: '12%',
    },
    badgeTopRight: {
        right: '1%',
        top: '22%',
    },
    badgeBottomRight: {
        right: '2%',
        bottom: '14%',
    },
    badgeIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primaryGreenSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 3,
    },
    badgeLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
        lineHeight: 11.5,
    },

    // Smooth Carousel Dots
    smoothDot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 24,
        marginVertical: Platform.select({ ios: 12, android: 8 }),
    },

    // Action Buttons
    actionsContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.select({ ios: 16, android: 16 }),
        gap: 10,
    },
    primaryBtn: {
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.primaryGreen,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 3,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 6,
    },
    secondaryBtn: {
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: Colors.primaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: Colors.primaryGreen,
        fontSize: 16,
        fontWeight: '700',
    },
});