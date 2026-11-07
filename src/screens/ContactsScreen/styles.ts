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
        backgroundColor: '#FFFFFF',
    },

    // Top App Header
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.select({ ios: 4, android: 10 }),
        paddingBottom: 8,
        backgroundColor: '#FFFFFF',
    },
    brandLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandTitles: {
        marginLeft: 8,
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0B1528',
        letterSpacing: -0.4,
    },
    brandTagline: {
        fontSize: 9.5,
        color: '#6B7280',
        fontWeight: '500',
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        padding: 6,
        position: 'relative',
    },
    notificationBadgeDot: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    profileAvatarWrap: {
        position: 'relative',
    },
    profileAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E2E8F0',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10B981',
        borderWidth: 1.8,
        borderColor: '#FFFFFF',
    },

    // FlatList Scroll Container with flex: 1 for iOS momentum scrolling
    listWrapper: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 95,
    },

    // Total Contacts Banner Card
    bannerCard: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
        borderRadius: 18,
        backgroundColor: '#EBF8F2',
        padding: 16,
        borderWidth: 1,
        borderColor: '#DCF3E8',
    },
    bannerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bannerLeft: {
        flex: 1,
        paddingRight: 10,
    },
    bannerTitle: {
        fontSize: 12.5,
        fontWeight: '600',
        color: '#334155',
    },
    bannerNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginBottom: 6,
        gap: 8,
    },
    bannerBigNumber: {
        fontSize: IS_SMALL_SCREEN ? 24 : 28,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    growthPill: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    growthPillText: {
        color: '#059669',
        fontSize: 11,
        fontWeight: '700',
    },
    bannerSubtext: {
        fontSize: 11.5,
        color: '#64748B',
        lineHeight: 16,
    },
    bannerRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    bannerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#DCF3E8',
        flexWrap: 'wrap',
        gap: 8,
    },
    bannerBtnGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    groupGraphicCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    plusBadgeTiny: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addContactBtn: {
        backgroundColor: Colors.primaryGreen,
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    addContactBtnText: {
        color: '#FFFFFF',
        fontSize: 11.5,
        fontWeight: '700',
    },

    // 4 Stats Cards Grid
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 6,
        marginBottom: 14,
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: '#EBF0F5',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    statIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statNumber: {
        fontSize: IS_SMALL_SCREEN ? 13 : 14.5,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
    },
    statLabel: {
        fontSize: IS_SMALL_SCREEN ? 9 : 10,
        color: '#64748B',
        fontWeight: '500',
        marginTop: 2,
        textAlign: 'center',
    },

    // Search & Filter Bar
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        height: 42,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 8,
        fontSize: 13,
        color: '#1E293B',
        paddingVertical: 0,
    },
    filterBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#E8F8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Horizontal Filter Chips
    chipsScroll: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        gap: 8,
    },
    chipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipItemActive: {
        backgroundColor: Colors.primaryGreen,
        borderColor: Colors.primaryGreen,
    },
    chipIconWrap: {
        marginRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    chipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    chipDotRed: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
        marginLeft: 4,
    },

    // Contacts List Item
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: Colors.primaryGreen,
        borderColor: Colors.primaryGreen,
    },
    avatarContainer: {
        marginRight: 10,
    },
    avatarImg: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#F1F5F9',
    },
    avatarSoundwave: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitialsText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#15803D',
    },

    // Divider Inset Container
    contactContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    contactInfo: {
        flex: 1,
        marginRight: 8,
    },
    nameTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    contactName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    tagBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 6,
    },
    tagBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    contactPhone: {
        fontSize: 11.5,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '400',
    },
    contactActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    waActionBtn: {
        padding: 4,
    },
    moreBtn: {
        padding: 4,
    },

    // Floating Action Button (+)
    fab: {
        position: 'absolute',
        bottom: 74,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.primaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    fabPlusIcon: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: '400',
        lineHeight: 30,
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