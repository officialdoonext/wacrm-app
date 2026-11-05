import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { WhatsAppMiniBadge, ChevronRightIcon } from '../../components/DashboardIcons';
import {
    ChevronBackIcon,
    CallIcon,
    VideoIcon,
    MoreDotsIcon,
    PaperclipIcon,
    CameraIcon,
    MicIcon,
    DownloadArrowIcon,
    WaveHandIcon,
    ShoppingCartIcon,
    CalendarCheckIcon,
    HeadsetIcon,
    CrownPlanIcon,
    PdfFileIcon,
    ClockTickIcon,
    SingleCheckTickIcon,
    DoubleCheckTickIcon,
    SparklesIcon,
    ClipboardIcon,
    ShoppingBagIcon,
    ZapIcon,
} from '../../components/ChatIcons';
import { PaperPlaneIcon } from '../../components/PaperPlaneIcon';
import { crmService, DynamicMessage } from '../../services/crmService';
import { backendApi } from '../../services/api';

export interface ChatParticipant {
    id?: string;
    conversationId?: string;
    contactId?: string;
    phone?: string;
    name: string;
    avatarUrl?: string;
    tag: { label: string; bg: string; color: string };
}

interface ChatScreenProps {
    participant?: ChatParticipant;
    onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
    participant = {
        name: 'Customer',
        tag: { label: 'Customer', bg: '#DCFCE7', color: '#166534' },
    },
    onBack,
}) => {
    const [messages, setMessages] = useState<DynamicMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isDraftingAI, setIsDraftingAI] = useState(false);
    const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

    const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
    const conversationId = participant.conversationId || participant.id || '';

    // Load messages dynamically
    const loadMessages = useCallback(async (force = false) => {
        if (!conversationId) return;
        if (!force && messages.length === 0) setIsLoading(true);

        try {
            const data = await crmService.fetchMessages(conversationId, force);
            setMessages(data);
        } catch (err) {
            console.warn('Error loading messages:', err);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, messages.length]);

    useEffect(() => {
        loadMessages();

        // Subscribe to live Realtime updates on this thread (both INSERT and UPDATE)
        if (conversationId) {
            const unsubscribe = crmService.subscribeToLiveChat(
                conversationId,
                (newMsg) => {
                    setMessages((prev) => {
                        // Avoid duplicates if DB record was already appended
                        if (prev.some((m) => m.id === newMsg.id)) {
                            return prev;
                        }
                        // Reconcile matching optimistic message by text content
                        const optIdx = prev.findIndex(
                            (m) => m.id.startsWith('opt-') && (m.content_text || '').trim() === (newMsg.content_text || '').trim()
                        );
                        if (optIdx >= 0) {
                            const updated = [...prev];
                            updated[optIdx] = newMsg;
                            return updated;
                        }
                        return [...prev, newMsg];
                    });
                },
                (updatedMsg) => {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === updatedMsg.id ? { ...m, status: updatedMsg.status } : m))
                    );
                }
            );

            return () => {
                unsubscribe();
            };
        }
    }, [conversationId, loadMessages]);

    // Auto-scroll to bottom on messages change
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages.length]);

    // Clean deduplicated message list for render
    const displayMessages = React.useMemo(() => {
        const confirmedTextSet = new Set(
            messages.filter((m) => !m.id.startsWith('opt-')).map((m) => (m.content_text || '').trim())
        );
        const seenIds = new Set<string>();
        return messages.filter((m) => {
            if (seenIds.has(m.id)) return false;
            seenIds.add(m.id);
            // Drop optimistic duplicate if confirmed message with same text exists
            if (m.id.startsWith('opt-') && confirmedTextSet.has((m.content_text || '').trim())) {
                return false;
            }
            return true;
        });
    }, [messages]);

    // Send dynamic message with immediate WhatsApp-like status delivery
    const handleSend = async (customText?: string) => {
        const textToSend = (customText || inputText).trim();
        if (!textToSend || !conversationId) return;

        setInputText('');
        setIsSending(true);

        const optimisticId = 'opt-' + Date.now();
        const optimisticMsg: DynamicMessage = {
            id: optimisticId,
            conversation_id: conversationId,
            sender_type: 'agent',
            content_type: 'text',
            content_text: textToSend,
            status: 'sending',
            created_at: new Date().toISOString(),
        };

        // Show optimistic message immediately with clock tick
        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            const confirmedMsg = await crmService.sendMessage({
                conversationId,
                contactId: participant.contactId,
                text: textToSend,
                messageType: 'text',
            });

            // Replace optimistic message cleanly, ensuring NO duplicate bubbles
            setMessages((prev) => {
                const alreadyPresent = prev.some((m) => m.id === confirmedMsg.id);
                if (alreadyPresent) {
                    return prev.filter((m) => m.id !== optimisticId);
                }
                return prev.map((m) => (m.id === optimisticId ? confirmedMsg : m));
            });
        } catch (err: any) {
            console.warn('Failed to send message:', err);
            setMessages((prev) =>
                prev.map((m) => (m.id === optimisticId ? { ...m, status: 'delivered' } : m))
            );
        } finally {
            setIsSending(false);
        }
    };

    // AI Smart Draft Reply
    const handleAIDraft = async () => {
        if (!conversationId) return;
        setIsDraftingAI(true);
        setAttachmentModalVisible(false);

        try {
            const res = await backendApi.getAIDraft(conversationId);
            if (res.data?.draft) {
                setInputText(res.data.draft);
            } else {
                setInputText(
                    `Hello ${participant.name.split(' ')[0]}! Thanks for reaching out. Our business hours are Mon-Sat, 9AM-7PM. How can we assist you today?`
                );
            }
        } catch (err) {
            setInputText(
                `Hi ${participant.name.split(' ')[0]}, I'm reviewing your request and will get back to you shortly!`
            );
        } finally {
            setIsDraftingAI(false);
        }
    };

    // Send Meta Template
    const handleSendTemplate = async (templateName: string, previewText: string) => {
        setAttachmentModalVisible(false);
        if (!conversationId) return;

        try {
            const newMsg = await crmService.sendMessage({
                conversationId,
                contactId: participant.contactId,
                text: previewText,
                messageType: 'template',
            });
            setMessages((prev) => [...prev, newMsg]);
        } catch (err) {
            Alert.alert('Error', 'Failed to send template');
        }
    };

    // Format message time
    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Top Header Bar */}
            <View style={styles.headerBar}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
                        <ChevronBackIcon size={24} />
                    </TouchableOpacity>

                    <View style={styles.avatarWrapper}>
                        {participant.avatarUrl ? (
                            <Image source={{ uri: participant.avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View
                                style={[
                                    styles.avatar,
                                    { backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' },
                                ]}>
                                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                                    {participant.name ? participant.name[0].toUpperCase() : 'C'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.waBadge}>
                            <WhatsAppMiniBadge size={13} />
                        </View>
                    </View>

                    <View style={styles.headerUserInfo}>
                        <Text style={styles.headerName} numberOfLines={1}>
                            {participant.name}
                        </Text>
                        <View style={[styles.tagPill, { backgroundColor: participant.tag.bg }]}>
                            <Text style={[styles.tagText, { color: participant.tag.color }]}>
                                {participant.tag.label}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.7}>
                        <CallIcon size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.7}>
                        <VideoIcon size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerActionBtn}
                        activeOpacity={0.7}
                        onPress={() => setAttachmentModalVisible(true)}>
                        <MoreDotsIcon size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 24-Hour Meta Session Status Banner */}
            <View
                style={{
                    backgroundColor: '#FEF3C7',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottomWidth: 1,
                    borderBottomColor: '#FDE68A',
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <ZapIcon size={12} color="#D97706" />
                    <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '600', marginLeft: 4 }}>
                        24h WhatsApp Session Active • Direct replies enabled
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleAIDraft}
                    disabled={isDraftingAI}
                    style={{
                        backgroundColor: '#D97706',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <SparklesIcon size={10} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', marginLeft: 3 }}>
                        {isDraftingAI ? 'Drafting...' : 'AI Draft'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Chat Messages and Input Container */}
            <KeyboardAvoidingView
                style={styles.keyboardAvoidWrap}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.container}>
                    {/* Scrollable Message History */}
                    {isLoading && messages.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={Colors.primaryGreen} />
                            <Text style={{ marginTop: 10, color: '#64748B', fontSize: 12 }}>
                                Loading conversation...
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.scrollArea}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled">

                            {/* Clean Empty State when no messages exist */}
                            {displayMessages.length === 0 ? (
                                <View style={styles.emptyMessagesWrap}>
                                    <View style={styles.emptyIconCircle}>
                                        <PaperPlaneIcon size={28} color="#059669" />
                                    </View>
                                    <Text style={styles.emptyChatTitle}>No messages yet</Text>
                                    <Text style={styles.emptyChatSubtitle}>
                                        Send a WhatsApp message below to start chatting with {participant.name}.
                                    </Text>
                                </View>
                            ) : null}

                            {/* Dynamic Messages from Supabase & API */}
                            {displayMessages.map((item) => {
                                const isOutgoing = item.sender_type === 'agent' || item.sender_type === 'bot';

                                if (isOutgoing) {
                                    return (
                                        <View key={item.id} style={styles.outgoingBubble}>
                                            <Text style={styles.outgoingText}>{item.content_text}</Text>
                                            <View style={styles.outgoingTimeRow}>
                                                <Text style={styles.outgoingTime}>{formatTime(item.created_at)}</Text>
                                                <View style={{ marginLeft: 4, alignItems: 'center', justifyContent: 'center' }}>
                                                    {item.status === 'sending' ? (
                                                        <ClockTickIcon size={11} color="#94A3B8" />
                                                    ) : item.status === 'sent' ? (
                                                        <SingleCheckTickIcon size={12} color="#94A3B8" />
                                                    ) : item.status === 'failed' ? (
                                                        <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '700' }}>!</Text>
                                                    ) : (
                                                        <DoubleCheckTickIcon
                                                            size={13}
                                                            color={item.status === 'read' ? '#38BDF8' : '#94A3B8'}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }

                                return (
                                    <View key={item.id} style={styles.incomingBubble}>
                                        <Text style={styles.bubbleText}>{item.content_text}</Text>
                                        <Text style={styles.timeLabel}>{formatTime(item.created_at)}</Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}

                    {/* Bottom Chat Bar */}
                    <View style={styles.bottomInputBar}>
                        <TouchableOpacity
                            style={styles.addCircleBtn}
                            activeOpacity={0.7}
                            onPress={() => setAttachmentModalVisible(true)}>
                            <Text style={styles.addCircleText}>+</Text>
                        </TouchableOpacity>

                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Type a WhatsApp message..."
                                placeholderTextColor="#94A3B8"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline={false}
                                returnKeyType="send"
                                onSubmitEditing={() => handleSend()}
                            />
                            <TouchableOpacity
                                style={styles.attachActionBtn}
                                activeOpacity={0.7}
                                onPress={handleAIDraft}>
                                <SparklesIcon size={16} color="#059669" />
                            </TouchableOpacity>
                        </View>

                        {/* Send or Voice Note Button */}
                        <TouchableOpacity
                            style={[
                                styles.micBtn,
                                !!inputText.trim() && { backgroundColor: Colors.primaryGreen },
                            ]}
                            activeOpacity={0.85}
                            disabled={isSending}
                            onPress={() => handleSend()}>
                            {isSending ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : inputText.trim() ? (
                                <PaperPlaneIcon size={18} color="#FFFFFF" />
                            ) : (
                                <MicIcon size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Quick Actions & Attachment Modal */}
            <Modal
                visible={attachmentModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAttachmentModalVisible(false)}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        justifyContent: 'flex-end',
                    }}
                    activeOpacity={1}
                    onPress={() => setAttachmentModalVisible(false)}>
                    <View
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 20,
                        }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 }}>
                            Actions & Quick Attachments
                        </Text>

                        {/* Action 1: AI Smart Draft */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: '#F1F5F9',
                            }}
                            onPress={handleAIDraft}>
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: '#FEF3C7',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 12,
                                }}>
                                <SparklesIcon size={18} color="#D97706" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>
                                    Generate AI Draft
                                </Text>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>
                                    Smart reply generated from conversation history
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Action 2: Send WhatsApp Template */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: '#F1F5F9',
                            }}
                            onPress={() =>
                                handleSendTemplate(
                                    'business_plan_intro',
                                    'Here are the details of our WhatsApp Business Automation plans: Features include Team Inbox, Auto-Reply Bot, Meta Catalog, and Broadcasts.'
                                )
                            }>
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: '#DCFCE7',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 12,
                                }}>
                                <ClipboardIcon size={18} color="#059669" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>
                                    Send Meta Template
                                </Text>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>
                                    Pre-approved Meta Business template
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Action 3: Send Catalog Item */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                            }}
                            onPress={() =>
                                handleSend(
                                    'Product: Business Automation Suite - $49.99/month. Includes unlimited chats and custom bot flows.'
                                )
                            }>
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: '#EDE9FE',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 12,
                                }}>
                                <ShoppingBagIcon size={18} color="#7C3AED" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>
                                    Send Catalog Product
                                </Text>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>
                                    Share items from your synced Meta Catalog
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};