import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoidWrap: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#EFEAE2', // WhatsApp default background
    },

    // Header Bar
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: Platform.select({ ios: 4, android: 8 }),
        paddingBottom: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        padding: 6,
        marginRight: 4,
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    waBadge: {
        position: 'absolute',
        bottom: -1,
        right: -2,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
    },
    headerUserInfo: {
        justifyContent: 'center',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    tagPill: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    tagText: {
        fontSize: 10,
        color: '#166534',
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerActionBtn: {
        padding: 4,
    },

    // Scroll View & Content
    scrollArea: {
        flex: 1,
    },
    messagesContent: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 24,
    },

    // Incoming Bubble (White)
    incomingBubble: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderTopLeftRadius: 3,
        padding: 10,
        maxWidth: '88%',
        alignSelf: 'flex-start',
        marginBottom: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    greetingHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    bubbleTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    bubbleText: {
        fontSize: 14,
        color: '#1E293B',
        lineHeight: 20,
    },
    timeLabel: {
        fontSize: 10,
        color: '#94A3B8',
        alignSelf: 'flex-end',
        marginTop: 4,
    },

    // Outgoing Bubble (WhatsApp Soft Green)
    outgoingBubble: {
        backgroundColor: '#DCF8C6',
        borderRadius: 14,
        borderTopRightRadius: 3,
        padding: 10,
        maxWidth: '82%',
        alignSelf: 'flex-end',
        marginBottom: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    outgoingText: {
        fontSize: 14,
        color: '#1E293B',
        lineHeight: 19,
    },
    outgoingTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 4,
        gap: 4,
    },
    outgoingTime: {
        fontSize: 10,
        color: '#059669',
    },
    checkMarks: {
        fontSize: 10.5,
        color: '#059669',
        fontWeight: '700',
    },

    // Quick Reply Options Inside Incoming Bubble
    quickRepliesStack: {
        marginTop: 8,
        gap: 6,
    },
    quickReplyRow: {
        backgroundColor: '#F3FBF7',
        borderWidth: 1,
        borderColor: '#D7F3E5',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    quickReplyIconWrap: {
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickReplyLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#008744',
    },

    // Business Plan Card
    planCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 10,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    planIconBox: {
        width: 58,
        height: 58,
        borderRadius: 10,
        backgroundColor: Colors.primaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        padding: 4,
    },
    planIconText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 2,
    },
    planDetails: {
        flex: 1,
    },
    planTitle: {
        fontSize: 13.5,
        fontWeight: '700',
        color: '#0F172A',
    },
    planSub: {
        fontSize: 11,
        color: '#64748B',
        lineHeight: 14,
        marginTop: 2,
    },
    planPrice: {
        fontSize: 13.5,
        fontWeight: '800',
        color: Colors.primaryGreen,
        marginTop: 4,
    },

    // Action Pills
    actionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    actionPillOutline: {
        borderWidth: 1,
        borderColor: Colors.primaryGreen,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
    },
    actionPillOutlineText: {
        fontSize: 11.5,
        color: Colors.primaryGreen,
        fontWeight: '700',
    },

    // PDF Document Box
    pdfContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 10,
        marginTop: 8,
    },
    pdfIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    pdfMeta: {
        flex: 1,
    },
    pdfTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    pdfSize: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 2,
    },
    pdfDownloadBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Yes / Maybe Later Action Row
    decisionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    decisionBtnGreen: {
        flex: 1,
        backgroundColor: Colors.primaryGreen,
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    decisionBtnGreenText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    decisionBtnOutline: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFFFFF',
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    decisionBtnOutlineText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '600',
    },

    // Bottom Input Bar
    bottomInputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 6,
    },
    addCircleBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addCircleText: {
        fontSize: 22,
        color: '#475569',
        lineHeight: 24,
    },
    inputWrap: {
        flex: 1,
        minHeight: 40,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#1E293B',
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    },
    attachActionBtn: {
        padding: 4,
        marginLeft: 4,
    },
    micBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyMessagesWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    emptyChatTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 6,
        textAlign: 'center',
    },
    emptyChatSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
    },
});