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

    // Top Header
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

    // Hero Banner Card
    heroBanner: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: '#E8F8F0',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 160,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#DCF3E8',
    },
    heroContentLeft: {
        flex: 1.15,
        justifyContent: 'space-between',
        zIndex: 2,
    },
    heroTitle: {
        fontSize: IS_SMALL_SCREEN ? 17 : 19,
        fontWeight: '900',
        color: '#0B1528',
        lineHeight: IS_SMALL_SCREEN ? 22 : 24,
        letterSpacing: -0.3,
    },
    heroSubtitle: {
        fontSize: 11,
        color: '#64748B',
        lineHeight: 15,
        marginTop: 6,
        fontWeight: '400',
    },
    createBtn: {
        backgroundColor: Colors.primaryGreen,
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 12,
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    createBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        marginRight: 4,
    },

    // Hero Orbit Diagram Area
    heroNetworkArea: {
        flex: 0.95,
        height: 145,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },

    // 4 Top Stats Cards Row: Vertically stacked to prevent text clipping
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 6,
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 2,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
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
        marginBottom: 4,
    },
    statNumber: {
        fontSize: IS_SMALL_SCREEN ? 11.5 : 12.5,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
    },
    statLabel: {
        fontSize: IS_SMALL_SCREEN ? 8.2 : 9.2,
        color: '#64748B',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 1.5,
    },

    // Category Filter Chips
    chipsScroll: {
        paddingHorizontal: Platform.select({ ios: 10, android: 12 }),
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Platform.select({ ios: 4, android: 4.5 }),
    },
    chipItem: {
        paddingHorizontal: Platform.select({
            ios: IS_SMALL_SCREEN ? 7 : 8.5,
            android: IS_SMALL_SCREEN ? 7.5 : 9,
        }),
        paddingVertical: 6,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipItemActive: {
        backgroundColor: Colors.primaryGreen,
        borderColor: Colors.primaryGreen,
    },
    chipText: {
        fontSize: Platform.select({
            ios: IS_SMALL_SCREEN ? 10.5 : 11.2,
            android: IS_SMALL_SCREEN ? 10.8 : 11.5,
        }),
        fontWeight: '600',
        color: '#475569',
    },
    chipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    // Campaigns List Area
    listWrapper: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 95,
    },
    campaignCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    cardIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardHeaderInfo: {
        flex: 1,
    },
    titleBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 3,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 6,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    cardDescriptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    cardDescription: {
        fontSize: 11.5,
        color: '#64748B',
        lineHeight: 16,
    },
    inlineEmojiSvg: {
        marginLeft: 3,
        alignSelf: 'center',
    },
    cardMetaRight: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 42,
        marginLeft: 6,
    },
    dateText: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '500',
        textAlign: 'right',
    },

    // Bottom Metrics Row: Starts directly under the description text (indented 54px)
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
        paddingLeft: 54, // Exactly matches icon width (44px) + margin (10px)
        gap: 16,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metricTextWrap: {
        flexDirection: 'column',
    },
    metricValue: {
        fontSize: 11,
        fontWeight: '800',
        color: '#0F172A',
    },
    metricLabel: {
        fontSize: 9,
        color: '#94A3B8',
        fontWeight: '500',
    },
    chevronWrapper: {
        marginLeft: 'auto',
        alignSelf: 'center',
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