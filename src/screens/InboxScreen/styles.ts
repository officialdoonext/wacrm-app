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
        overflow: 'hidden',
    },

    // Top App Bar
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.select({ ios: 4, android: 10 }),
        paddingBottom: 10,
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

    // 4 Filter Chips Row: Reduced tight spacing, perfectly centered & proportional
    chipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 14,
        paddingBottom: 10,
        gap: Platform.select({ ios: 6, android: 6 }),
    },
    chipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Platform.select({
            ios: IS_SMALL_SCREEN ? 7 : 8.5,
            android: IS_SMALL_SCREEN ? 8 : 9.5,
        }),
        paddingVertical: 6.5,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    chipItemActive: {
        backgroundColor: '#D1FAE5',
    },
    chipIconWrap: {
        marginRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipLabel: {
        fontSize: Platform.select({
            ios: IS_SMALL_SCREEN ? 11.5 : 12,
            android: IS_SMALL_SCREEN ? 11.5 : 12.5,
        }),
        fontWeight: '600',
        color: '#334155',
    },
    chipLabelActive: {
        color: '#065F46',
        fontWeight: '700',
    },
    countPill: {
        paddingHorizontal: 5,
        paddingVertical: 1.5,
        borderRadius: 10,
        marginLeft: 4,
    },
    countPillActive: {
        backgroundColor: '#059669',
    },
    countPillRed: {
        backgroundColor: '#EF4444',
    },
    countPillText: {
        color: '#FFFFFF',
        fontSize: 9.5,
        fontWeight: '700',
    },

    // FlatList Scroll Wrapper
    listWrapper: {
        flex: 1,
        width: '100%',
    },
    chatListContainer: {
        flexGrow: 1,
        paddingBottom: 120,
    },

    // Chat Item Row with Inset Divider
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: '#FFFFFF',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F1F5F9',
    },
    groupAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    blackAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    waBadge: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
    },

    // Inset Divider Content
    chatContent: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    chatHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    nameAndTag: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 6,
    },
    userName: {
        fontSize: 14.5,
        fontWeight: '700',
        color: '#0F172A',
        marginRight: 6,
    },
    tagPill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10.5,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessageText: {
        fontSize: 12.5,
        color: '#64748B',
        flex: 1,
        marginRight: 8,
    },
    badgeAndChevron: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    unreadCounter: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.primaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    unreadCounterText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },

    // Floating Action Button
    fab: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 78 : 68,
        right: 20,
        backgroundColor: Colors.primaryGreen,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 24,
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
        gap: 4,
        zIndex: 999,
    },
    fabPlus: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: '600',
        lineHeight: 24,
    },
    fabCaret: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '700',
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