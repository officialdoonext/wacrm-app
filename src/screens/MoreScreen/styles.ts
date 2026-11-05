import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH <= 375;

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Top Bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.select({ ios: 4, android: 10 }),
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 6,
        marginLeft: -4,
    },
    topTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    placeholderRight: {
        width: 32,
    },

    // Main Scrollable Area
    scrollWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 95,
    },

    // Profile Header Card
    profileHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 14,
    },
    profileAvatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#E2E8F0',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.primaryGreen,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfoCol: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    userName: {
        fontSize: IS_SMALL_SCREEN ? 17 : 19,
        fontWeight: '800',
        color: '#0F172A',
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F8F0',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 16,
        gap: 4,
    },
    editProfileText: {
        color: Colors.primaryGreen,
        fontSize: 11,
        fontWeight: '700',
    },
    userEmail: {
        fontSize: 12.5,
        color: '#64748B',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 12.5,
        color: '#64748B',
        marginBottom: 6,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#E8F8F0',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    planBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primaryGreen,
    },

    // 4 Stats Cards Row
    statsRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    statIconBox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statNumber: {
        fontSize: IS_SMALL_SCREEN ? 12.5 : 13.5,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
    },
    statLabel: {
        fontSize: IS_SMALL_SCREEN ? 8.5 : 9.5,
        color: '#64748B',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 2,
    },

    // Menu Section Box
    menuSectionBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuTextCol: {
        flex: 1,
        marginRight: 8,
    },
    menuTitle: {
        fontSize: 13.5,
        fontWeight: '700',
        color: '#0F172A',
    },
    menuSubtitle: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
        lineHeight: 14,
    },

    // Red Logout Button
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 14,
        paddingVertical: 12,
        marginTop: 6,
        gap: 8,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#EF4444',
    },

    // Bottom Navigation Bar
    bottomTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: Platform.OS === 'ios' ? 64 : 58,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingBottom: Platform.select({ ios: 10, android: 4 }),
        zIndex: 10,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingHorizontal: 8,
    },
    tabLabel: {
        fontSize: 10.5,
        fontWeight: '500',
        color: '#94A3B8',
        marginTop: 3,
    },
    tabLabelActive: {
        color: Colors.primaryGreen,
        fontWeight: '700',
    },
    tabIndicatorDot: {
        position: 'absolute',
        top: 0,
        right: 14,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
});