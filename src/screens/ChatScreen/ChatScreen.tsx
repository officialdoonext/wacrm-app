import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Image,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
    Linking,
    StyleSheet,
    PermissionsAndroid,
    Alert,
    NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { WhatsAppMiniBadge } from '../../components/DashboardIcons';
import {
    ChevronBackIcon,
    CallIcon,
    VideoIcon,
    MoreDotsIcon,
    MicIcon,
    ClockTickIcon,
    SingleCheckTickIcon,
    DoubleCheckTickIcon,
    SparklesIcon,
    ClipboardIcon,
    ZapIcon,
} from '../../components/ChatIcons';
import {
    IconChat,
    IconCamera,
    IconPaperclip,
    IconTrash,
    IconPlay,
    IconPause,
    IconClose,
    IconSend,
    IconStore,
    IconHeart,
    IconThumbsUp,
    IconSparkles,
    IconFileText,
    IconMapPin,
    IconPhone,
    IconDollar,
    IconCheck,
    IconSmile,
    IconVideo,
} from '../../components/AppIcons';
import { SmoothModal } from '../../components/SmoothModal';
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
    lastMessageAt?: string;
    aiAutoreplyDisabled?: boolean;
}

const EMOJI_SETS: Record<string, string[]> = {
    Smileys: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😎', '🤩', '🥳',
        '😏', '🤔', '🤫', '🤗', '🤐', '😮', '😯', '😲', '😳', '🥺',
        '😭', '😤', '😡', '🤯', '😱', '👋', '🎉', '🔥', '✨', '💯',
    ],
    Gestures: [
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '👆', '👇', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏', '👏',
        '🙌', '👐', '🤲', '💪', '👊', '✊', '🤛', '🤜', '🎯', '⚡',
    ],
    Hearts: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟',
        '💫', '💥', '🎉', '🎊', '🎁', '🎈', '🏆', '🥇', '✔️', '✅',
    ],
    Work: [
        '💼', '📁', '📂', '📄', '📃', '📋', '📊', '📈', '📉', '🏷️',
        '📦', '📬', '📫', '✉️', '📧', '📞', '📱', '💻', '🖥️', '💡',
        '⏰', '📅', '📆', '🗓️', '💰', '💳', '💵', '🤝', '🚀', '📌',
    ],
};

interface ChatScreenProps {
    participant?: ChatParticipant;
    onBack: () => void;
    onOpenDeals?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
    participant = {
        name: 'Customer',
        tag: { label: 'Customer', bg: '#DCFCE7', color: '#166534' },
    },
    onBack,
    onOpenDeals,
}) => {
    const [messages, setMessages] = useState<DynamicMessage[]>([]);
    const [hasMoreOlder, setHasMoreOlder] = useState(true);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isDraftingAI, setIsDraftingAI] = useState(false);
    const [aiPaused, setAiPaused] = useState(!!participant.aiAutoreplyDisabled);

    // Smooth Bottom Sheets
    const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [crmDrawerVisible, setCrmDrawerVisible] = useState(false);
    const [quickRepliesVisible, setQuickRepliesVisible] = useState(false);
    const [interactiveModalVisible, setInteractiveModalVisible] = useState(false);

    // Real Device Picked Media State (for preview & caption confirmation before sending)
    const [pickedMediaPreviewVisible, setPickedMediaPreviewVisible] = useState(false);
    const [pickedMediaData, setPickedMediaData] = useState<{
        type: 'image' | 'video' | 'document';
        uri: string;
        name: string;
        size?: number;
    } | null>(null);
    const [pickedMediaCaption, setPickedMediaCaption] = useState('');

    // Audio Recorder State
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [recordingSecs, setRecordingSecs] = useState(0);
    const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Playback state
    const [playbackSpeeds, setPlaybackSpeeds] = useState<Record<string, number>>({});
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

    // Quoted Reply
    const [quotedMessage, setQuotedMessage] = useState<DynamicMessage | null>(null);

    // Floating Reactions Tray
    const [reactionTargetId, setReactionTargetId] = useState<string | null>(null);
    const [messageReactions, setMessageReactions] = useState<Record<string, string>>({});

    // Curated Emoji Picker Tray State
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState<'Smileys' | 'Gestures' | 'Hearts' | 'Work'>('Smileys');

    // Template Picker
    const [selectedTemplateName, setSelectedTemplateName] = useState('welcome_offer');
    const [templateVar1, setTemplateVar1] = useState(participant.name || 'Valued Customer');
    const [templateVar2, setTemplateVar2] = useState('OFFER20');

    // Interactive Buttons
    const [btnPromptText, setBtnPromptText] = useState('Would you like to book a demo or view packages?');
    const [btn1Text, setBtn1Text] = useState('Book a Demo');
    const [btn2Text, setBtn2Text] = useState('View Pricing');

    // Internal Notes
    const [contactNotes, setContactNotes] = useState<string[]>([
        'Customer requested demo for WhatsApp CRM multi-agent inbox.',
        'Sent proposal for Annual Enterprise Plan.',
    ]);
    const [newNoteText, setNewNoteText] = useState('');

    const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
    const isPrependingOlderRef = useRef(false);
    const prevContentHeightRef = useRef<number>(0);
    const isInitialLoadRef = useRef(true);
    const conversationId = participant.conversationId || participant.id || '';

    // Check 24-Hour Policy Window
    const is24hWindowActive = React.useMemo(() => {
        if (!participant.lastMessageAt) return true;
        try {
            const lastMsgDate = new Date(participant.lastMessageAt).getTime();
            const diffHours = (Date.now() - lastMsgDate) / (1000 * 60 * 60);
            return diffHours < 24;
        } catch {
            return true;
        }
    }, [participant.lastMessageAt]);

    // Keyboard listener to smoothly scroll message list to bottom
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const showSubscription = Keyboard.addListener(showEvent, () => {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 60);
        });

        return () => {
            showSubscription.remove();
        };
    }, []);

    // Load messages dynamically ONLY when conversationId changes
    const loadMessages = useCallback(async (force = false) => {
        if (!conversationId) return;
        setIsLoading(true);

        try {
            const data = await crmService.fetchMessages(conversationId, force, { limit: 24 });
            setMessages(data);
            setHasMoreOlder(data.length === 24);
        } catch (err) {
            console.warn('Error loading messages:', err);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId]);

    // On scroll to top: fetch next 24 older messages
    const loadOlderMessages = useCallback(async () => {
        if (!hasMoreOlder || isLoadingOlder || messages.length === 0 || !conversationId) return;
        setIsLoadingOlder(true);

        try {
            const oldestMessage = messages[0];
            const olderSlice = await crmService.fetchMessages(conversationId, true, {
                limit: 24,
                beforeTimestamp: oldestMessage.created_at,
            });

            if (olderSlice.length < 24) {
                setHasMoreOlder(false);
            }

            if (olderSlice.length > 0) {
                isPrependingOlderRef.current = true;
                setMessages((prev) => [...olderSlice, ...prev]);
            }
        } catch (err) {
            console.warn('Error loading older messages:', err);
        } finally {
            setIsLoadingOlder(false);
        }
    }, [hasMoreOlder, isLoadingOlder, messages, conversationId]);

    // Load messages when conversationId changes
    useEffect(() => {
        isInitialLoadRef.current = true;
        loadMessages();
    }, [loadMessages]);

    // Supabase Realtime channel subscription — only re-run when conversationId changes
    useEffect(() => {
        if (!conversationId) return;
        const unsubscribe = crmService.subscribeToLiveChat(
            conversationId,
            (newMsg) => {
                setMessages((prev) => {
                    // Check if this incoming message matches an optimistic or existing record
                    const exists = prev.some((m) => m.id === newMsg.id);
                    if (exists) return prev;

                    const optIdx = prev.findIndex(
                        (m) =>
                            m.id.startsWith('opt-') &&
                            (m.content_text || '').trim() === (newMsg.content_text || '').trim()
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
                    prev.map((m) =>
                        m.id === updatedMsg.id ? { ...m, status: updatedMsg.status } : m
                    )
                );
            }
        );

        return () => {
            unsubscribe();
        };
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Scroll to bottom when messages count changes, EXCEPT when prepending older messages
    useEffect(() => {
        if (isPrependingOlderRef.current) {
            return;
        }
        if (messages.length > 0 && !isInitialLoadRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 80);
        }
    }, [messages.length]);

    // Preserve scroll position when older messages are loaded into the top
    const handleContentSizeChange = (_w: number, newHeight: number) => {
        if (isPrependingOlderRef.current) {
            const diff = newHeight - prevContentHeightRef.current;
            if (diff > 0) {
                scrollViewRef.current?.scrollTo({ y: diff, animated: false });
            }
            isPrependingOlderRef.current = false;
        } else if (isInitialLoadRef.current && messages.length > 0) {
            isInitialLoadRef.current = false;
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 60);
        }
        prevContentHeightRef.current = newHeight;
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    // Send Message Handler
    const handleSend = async (
        customText?: string,
        customType: DynamicMessage['content_type'] = 'text',
        customMediaUrl?: string
    ) => {
        const textToSend = (customText !== undefined ? customText : inputText).trim();
        if (!textToSend && !customMediaUrl) return;
        if (!conversationId) return;

        setInputText('');
        const replyToId = quotedMessage?.id;
        setQuotedMessage(null);
        setIsSending(true);

        const optimisticId = 'opt-' + Date.now();
        const optimisticMsg: DynamicMessage = {
            id: optimisticId,
            conversation_id: conversationId,
            sender_type: 'agent',
            content_type: customType,
            content_text: textToSend,
            media_url: customMediaUrl,
            status: 'delivered',
            created_at: new Date().toISOString(),
            reply_to_message_id: replyToId,
        };

        // Immediately append to local state
        setMessages((prev) => [...prev, optimisticMsg]);
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 50);

        try {
            const confirmedMsg = await crmService.sendMessage({
                conversationId,
                contactId: participant.contactId,
                text: textToSend,
                messageType: customType,
                mediaUrl: customMediaUrl,
                replyToMessageId: replyToId,
                optimisticId,
            });

            // Update in place so it NEVER disappears
            setMessages((prev) => {
                const hasOptimistic = prev.some((m) => m.id === optimisticId);
                if (hasOptimistic) {
                    return prev.map((m) => (m.id === optimisticId ? confirmedMsg : m));
                }
                return prev.map((m) =>
                    m.id === confirmedMsg.id ? { ...m, status: 'delivered' } : m
                );
            });
        } catch {
            setMessages((prev) =>
                prev.map((m) => (m.id === optimisticId ? { ...m, status: 'delivered' } : m))
            );
        } finally {
            setIsSending(false);
        }
    };

    // -------------------------------------------------------------
    // Device Permissions & Native Media / Voice Pickers
    // -------------------------------------------------------------
    const requestAudioRecordingPermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') return true;
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: 'Microphone Permission Required',
                    message: 'menext requires microphone access to record and send WhatsApp voice notes.',
                    buttonPositive: 'Allow',
                    buttonNegative: 'Deny',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                Alert.alert(
                    'Microphone Permission Denied',
                    'Microphone permission is required to record voice notes. Please grant permission in your device Settings.'
                );
                return false;
            }
        } catch (err) {
            console.warn('Microphone permission error:', err);
            return false;
        }
    };

    const requestMediaPermission = async (type: 'image' | 'video' | 'document'): Promise<boolean> => {
        if (Platform.OS !== 'android') return true;
        try {
            const perms: any[] = [];
            if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
                if (type === 'image') perms.push('android.permission.READ_MEDIA_IMAGES');
                else if (type === 'video') perms.push('android.permission.READ_MEDIA_VIDEO');
                else perms.push('android.permission.READ_MEDIA_IMAGES');
            } else {
                perms.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            }
            perms.push(PermissionsAndroid.PERMISSIONS.CAMERA);

            await PermissionsAndroid.requestMultiple(perms);
            return true;
        } catch (err) {
            console.warn('Storage permission error:', err);
            return true;
        }
    };

    const { NativeMediaPicker } = NativeModules;

    const handlePickPhoto = async () => {
        setAttachmentModalVisible(false);
        const hasPermission = await requestMediaPermission('image');
        if (!hasPermission) return;

        try {
            if (NativeMediaPicker?.pickImage) {
                const result = await NativeMediaPicker.pickImage();
                if (result && result.uri) {
                    setPickedMediaData({
                        type: 'image',
                        uri: result.uri,
                        name: result.name || 'Photo.jpg',
                        size: result.size,
                    });
                    setPickedMediaCaption('');
                    setPickedMediaPreviewVisible(true);
                }
            } else {
                Alert.alert(
                    'Device Photo Library',
                    'Native photo picker module is configured. Please rebuild with "npx react-native run-android" to enable device gallery access.',
                    [{ text: 'OK' }]
                );
            }
        } catch (err: any) {
            if (err?.code !== 'CANCELLED') {
                console.warn('Pick photo error:', err);
            }
        }
    };

    const handlePickVideo = async () => {
        setAttachmentModalVisible(false);
        const hasPermission = await requestMediaPermission('video');
        if (!hasPermission) return;

        try {
            if (NativeMediaPicker?.pickVideo) {
                const result = await NativeMediaPicker.pickVideo();
                if (result && result.uri) {
                    setPickedMediaData({
                        type: 'video',
                        uri: result.uri,
                        name: result.name || 'Video.mp4',
                        size: result.size,
                    });
                    setPickedMediaCaption('');
                    setPickedMediaPreviewVisible(true);
                }
            } else {
                Alert.alert(
                    'Device Video Library',
                    'Native video picker module is configured. Please rebuild with "npx react-native run-android" to enable device video library access.'
                );
            }
        } catch (err: any) {
            if (err?.code !== 'CANCELLED') {
                console.warn('Pick video error:', err);
            }
        }
    };

    const handlePickDocument = async () => {
        setAttachmentModalVisible(false);
        const hasPermission = await requestMediaPermission('document');
        if (!hasPermission) return;

        try {
            if (NativeMediaPicker?.pickDocument) {
                const result = await NativeMediaPicker.pickDocument();
                if (result && result.uri) {
                    setPickedMediaData({
                        type: 'document',
                        uri: result.uri,
                        name: result.name || 'Document.pdf',
                        size: result.size,
                    });
                    setPickedMediaCaption('');
                    setPickedMediaPreviewVisible(true);
                }
            } else {
                Alert.alert(
                    'Device Document Picker',
                    'Native document picker module is configured. Please rebuild with "npx react-native run-android" to enable device document access.'
                );
            }
        } catch (err: any) {
            if (err?.code !== 'CANCELLED') {
                console.warn('Pick document error:', err);
            }
        }
    };

    const handleConfirmSendPickedMedia = () => {
        if (!pickedMediaData) return;
        const textToSend = pickedMediaCaption.trim() || pickedMediaData.name;
        handleSend(textToSend, pickedMediaData.type, pickedMediaData.uri);
        setPickedMediaPreviewVisible(false);
        setPickedMediaData(null);
        setPickedMediaCaption('');
    };

    // Voice Recorder Actions with Android Runtime Permission and Native Microphone
    const handleStartRecording = async () => {
        const hasPermission = await requestAudioRecordingPermission();
        if (!hasPermission) return;

        try {
            if (NativeMediaPicker?.startAudioRecording) {
                await NativeMediaPicker.startAudioRecording();
            }
        } catch (err) {
            console.warn('Native audio start error:', err);
        }

        setIsRecordingVoice(true);
        setRecordingSecs(0);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        recordTimerRef.current = setInterval(() => {
            setRecordingSecs((s) => s + 1);
        }, 1000);
    };

    const handleCancelRecording = async () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        setIsRecordingVoice(false);
        setRecordingSecs(0);
        try {
            if (NativeMediaPicker?.cancelAudioRecording) {
                await NativeMediaPicker.cancelAudioRecording();
            }
        } catch {
            // ignore
        }
    };

    const handleSendVoiceNote = async () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        setIsRecordingVoice(false);
        const durationStr = `0:${recordingSecs < 10 ? '0' : ''}${recordingSecs}`;
        setRecordingSecs(0);

        let finalAudioUri = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
        try {
            if (NativeMediaPicker?.stopAudioRecording) {
                const res = await NativeMediaPicker.stopAudioRecording();
                if (res && res.uri) {
                    finalAudioUri = res.uri;
                }
            }
        } catch (err) {
            console.warn('Native audio stop error:', err);
        }

        handleSend(`Voice message (${durationStr})`, 'audio', finalAudioUri);
    };

    // AI Copilot Draft
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
                    `Hello ${participant.name.split(' ')[0]}! Thanks for contacting us. How can our team help you with your WhatsApp automation today?`
                );
            }
        } catch {
            setInputText(
                `Hi ${participant.name.split(' ')[0]}, I am reviewing your request and will provide full details shortly!`
            );
        } finally {
            setIsDraftingAI(false);
        }
    };

    // Toggle AI Auto-Reply
    const handleToggleAI = async () => {
        const nextState = !aiPaused;
        setAiPaused(nextState);
        try {
            await backendApi.setAIAutoReply(conversationId, nextState);
        } catch {
            // Keep state
        }
    };

    // Emoji reaction
    const handleReact = (reactionKey: string) => {
        if (!reactionTargetId) return;
        setMessageReactions((prev) => ({ ...prev, [reactionTargetId]: reactionKey }));
        setReactionTargetId(null);
        backendApi.reactToMessage(reactionTargetId, reactionKey).catch(() => {});
    };

    // Dispatch Meta Template
    const handleSendMetaTemplate = () => {
        const preview = `Template [${selectedTemplateName}]: Hello ${templateVar1}, use code ${templateVar2} to activate special discount on WhatsApp CRM plans!`;
        setTemplateModalVisible(false);
        handleSend(preview, 'template');
    };

    // Dispatch Interactive Buttons
    const handleSendButtons = () => {
        const btns = `${btnPromptText}\n\n[Action 1: ${btn1Text}]\n[Action 2: ${btn2Text}]`;
        setInteractiveModalVisible(false);
        handleSend(btns, 'interactive');
    };

    // Add note
    const handleAddNote = () => {
        if (!newNoteText.trim()) return;
        setContactNotes([newNoteText.trim(), ...contactNotes]);
        setNewNoteText('');
    };

    // Call contact
    const handleCallContact = () => {
        if (participant.phone) {
            Linking.openURL(`tel:${participant.phone}`);
        }
    };

    return (
        <SafeAreaView style={localStyles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* WhatsApp Conversation Header Bar */}
            <View style={localStyles.headerBar}>
                <View style={localStyles.headerLeft}>
                    <TouchableOpacity onPress={onBack} style={localStyles.backButton} activeOpacity={0.7}>
                        <ChevronBackIcon size={22} color="#0F172A" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={localStyles.avatarWrapper}
                        activeOpacity={0.85}
                        onPress={() => setCrmDrawerVisible(true)}>
                        {participant.avatarUrl ? (
                            <Image source={{ uri: participant.avatarUrl }} style={localStyles.avatar} />
                        ) : (
                            <View style={localStyles.avatarPlaceholder}>
                                <Text style={localStyles.avatarText}>
                                    {participant.name ? participant.name[0].toUpperCase() : 'C'}
                                </Text>
                            </View>
                        )}
                        <View style={localStyles.waBadge}>
                            <WhatsAppMiniBadge size={13} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={localStyles.headerUserInfo}
                        activeOpacity={0.8}
                        onPress={() => setCrmDrawerVisible(true)}>
                        <Text style={localStyles.headerName} numberOfLines={1}>
                            {participant.name}
                        </Text>
                        <View style={localStyles.presenceRow}>
                            <View style={localStyles.onlineDot} />
                            <Text style={localStyles.onlineText}>online</Text>
                            <View style={[localStyles.tagBadge, { backgroundColor: participant.tag.bg }]}>
                                <Text style={[localStyles.tagBadgeText, { color: participant.tag.color }]}>
                                    {participant.tag.label}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={localStyles.headerRight}>
                    <TouchableOpacity
                        style={[
                            localStyles.headerActionBtn,
                            aiPaused && { backgroundColor: '#FEE2E2', borderRadius: 6 },
                        ]}
                        activeOpacity={0.7}
                        onPress={handleToggleAI}>
                        <SparklesIcon size={18} color={aiPaused ? '#DC2626' : '#7C3AED'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={localStyles.headerActionBtn} activeOpacity={0.7} onPress={handleCallContact}>
                        <IconPhone size={18} color="#334155" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={localStyles.headerActionBtn}
                        activeOpacity={0.7}
                        onPress={() => setCrmDrawerVisible(true)}>
                        <MoreDotsIcon size={18} color="#334155" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 24-Hour WhatsApp Policy Status Banner */}
            {is24hWindowActive ? (
                <View style={localStyles.policyBannerActive}>
                    <View style={localStyles.policyBannerLeft}>
                        <ZapIcon size={12} color="#166534" />
                        <Text style={localStyles.policyActiveText}>
                            24h WhatsApp Session Active • Direct replies enabled
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleAIDraft}
                        disabled={isDraftingAI}
                        style={localStyles.aiDraftBtn}>
                        <SparklesIcon size={10} color="#FFFFFF" />
                        <Text style={localStyles.aiDraftBtnText}>
                            {isDraftingAI ? 'Drafting...' : 'AI Draft'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={localStyles.policyBannerExpired}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={localStyles.policyExpiredTitle}>
                            24-Hour WhatsApp Window Expired
                        </Text>
                        <Text style={localStyles.policyExpiredSub}>
                            Only approved Meta templates can be dispatched to re-engage.
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setTemplateModalVisible(true)}
                        style={localStyles.sendTemplateBtn}>
                        <Text style={localStyles.sendTemplateBtnText}>Send Template</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Main Chat Messages & Composer */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
                <View style={localStyles.chatContainer}>
                    {/* Message Stream */}
                    {isLoading && messages.length === 0 ? (
                        <View style={localStyles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.whatsappGreen} />
                            <Text style={localStyles.loadingText}>Loading conversation...</Text>
                        </View>
                    ) : (
                        <ScrollView
                            ref={scrollViewRef}
                            style={localStyles.scrollArea}
                            contentContainerStyle={localStyles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            onContentSizeChange={handleContentSizeChange}
                            onScroll={({ nativeEvent }) => {
                                if (nativeEvent.contentOffset.y <= 15 && hasMoreOlder && !isLoadingOlder) {
                                    loadOlderMessages();
                                }
                            }}
                            scrollEventThrottle={32}
                            refreshControl={
                                hasMoreOlder ? (
                                    <RefreshControl
                                        refreshing={isLoadingOlder}
                                        onRefresh={loadOlderMessages}
                                        tintColor={Colors.whatsappGreen}
                                        title="Loading older messages..."
                                    />
                                ) : undefined
                            }>

                            {isLoadingOlder && (
                                <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={Colors.whatsappGreen} />
                                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                                        Loading earlier messages...
                                    </Text>
                                </View>
                            )}

                            {messages.length === 0 && (
                                <View style={localStyles.emptyContainer}>
                                    <View style={localStyles.emptyIconCircle}>
                                        <IconChat size={30} color={Colors.whatsappGreen} />
                                    </View>
                                    <Text style={localStyles.emptyTitle}>No messages yet</Text>
                                    <Text style={localStyles.emptySubtitle}>
                                        Type a WhatsApp message below to chat with {participant.name}.
                                    </Text>
                                </View>
                            )}

                            {messages.map((item) => {
                                const isOutgoing = item.sender_type === 'agent' || item.sender_type === 'bot';
                                const reaction = messageReactions[item.id];

                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        activeOpacity={0.9}
                                        onLongPress={() => setReactionTargetId(item.id)}
                                        style={[
                                            isOutgoing ? localStyles.bubbleOutgoing : localStyles.bubbleIncoming,
                                        ]}>
                                        {/* Quoted Message Preview */}
                                        {!!item.reply_to_message_id && (
                                            <View style={localStyles.quotedPreviewBox}>
                                                <Text style={localStyles.quotedPreviewLabel}>Replying to previous message</Text>
                                            </View>
                                        )}

                                        {/* 1. Image message */}
                                        {item.content_type === 'image' && item.media_url ? (
                                            <View style={{ marginBottom: 6 }}>
                                                <Image
                                                    source={{ uri: item.media_url }}
                                                    style={localStyles.mediaImage}
                                                    resizeMode="cover"
                                                />
                                                {!!item.content_text && (
                                                    <Text style={localStyles.bubbleText}>{item.content_text}</Text>
                                                )}
                                            </View>
                                        ) : item.content_type === 'audio' ? (
                                            /* 2. Audio voice note */
                                            <View style={localStyles.audioRow}>
                                                <TouchableOpacity
                                                    onPress={() => setPlayingAudioId(playingAudioId === item.id ? null : item.id)}
                                                    style={localStyles.audioPlayBtn}>
                                                    {playingAudioId === item.id ? (
                                                        <IconPause size={14} color="#FFFFFF" />
                                                    ) : (
                                                        <IconPlay size={14} color="#FFFFFF" />
                                                    )}
                                                </TouchableOpacity>

                                                <View style={{ flex: 1 }}>
                                                    <View style={localStyles.waveformRow}>
                                                        {[6, 14, 10, 18, 12, 16, 8, 14, 20, 10, 16, 12, 8, 14, 10].map((h, i) => (
                                                            <View
                                                                key={i}
                                                                style={[
                                                                    localStyles.waveBar,
                                                                    {
                                                                        height: h,
                                                                        backgroundColor: playingAudioId === item.id ? Colors.whatsappGreen : '#94A3B8',
                                                                    },
                                                                ]}
                                                            />
                                                        ))}
                                                    </View>
                                                    <Text style={localStyles.audioDurationText}>
                                                        {playingAudioId === item.id ? 'Playing • 0:14' : item.content_text || 'Voice note • 0:24'}
                                                    </Text>
                                                </View>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        const cur = playbackSpeeds[item.id] || 1;
                                                        const next = cur === 1 ? 1.5 : cur === 1.5 ? 2 : 1;
                                                        setPlaybackSpeeds({ ...playbackSpeeds, [item.id]: next });
                                                    }}
                                                    style={localStyles.speedPill}>
                                                    <Text style={localStyles.speedPillText}>{playbackSpeeds[item.id] || 1}x</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : item.content_type === 'template' ? (
                                            /* 3. Meta Template message */
                                            <View>
                                                <View style={localStyles.templateBadge}>
                                                    <Text style={localStyles.templateBadgeText}>META VERIFIED TEMPLATE</Text>
                                                </View>
                                                <Text style={localStyles.bubbleText}>{item.content_text}</Text>
                                                <View style={localStyles.templateCtaRow}>
                                                    <IconStore size={14} color={Colors.whatsappTeal} />
                                                    <Text style={localStyles.templateCtaText}>View Details & Offers</Text>
                                                </View>
                                            </View>
                                        ) : item.content_type === 'interactive' ? (
                                            /* 4. Interactive message */
                                            <View>
                                                <Text style={localStyles.bubbleText}>{item.content_text}</Text>
                                            </View>
                                        ) : (
                                            /* 5. Regular text */
                                            <Text style={localStyles.bubbleText}>{item.content_text}</Text>
                                        )}

                                        {/* Status ticks & timestamp */}
                                        <View style={localStyles.bubbleFooterRow}>
                                            <Text style={localStyles.timeText}>{formatTime(item.created_at)}</Text>
                                            {isOutgoing && (
                                                <View style={{ marginLeft: 4 }}>
                                                    {item.status === 'sending' ? (
                                                        <ClockTickIcon size={11} color="#94A3B8" />
                                                    ) : item.status === 'sent' ? (
                                                        <SingleCheckTickIcon size={12} color="#94A3B8" />
                                                    ) : item.status === 'failed' ? (
                                                        <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '800' }}>!</Text>
                                                    ) : (
                                                        <DoubleCheckTickIcon
                                                            size={13}
                                                            color={item.status === 'read' ? Colors.whatsappBlueTick : Colors.whatsappGrayTick}
                                                        />
                                                    )}
                                                </View>
                                            )}
                                        </View>

                                        {/* Reaction overlay */}
                                        {!!reaction && (
                                            <View style={[localStyles.reactionBadge, isOutgoing ? { right: 8 } : { left: 8 }]}>
                                                {reaction === 'heart' ? (
                                                    <IconHeart size={14} color="#EF4444" />
                                                ) : reaction === 'thumbsup' ? (
                                                    <IconThumbsUp size={14} color="#0284C7" />
                                                ) : (
                                                    <IconSparkles size={14} color="#F59E0B" />
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}

                    {/* Quoted Message Active Bar */}
                    {!!quotedMessage && (
                        <View style={localStyles.quotedActiveBar}>
                            <View style={{ flex: 1 }}>
                                <Text style={localStyles.quotedAuthorText}>
                                    Replying to {quotedMessage.sender_type === 'customer' ? participant.name : 'You'}
                                </Text>
                                <Text style={localStyles.quotedSnippetText} numberOfLines={1}>
                                    {quotedMessage.content_text || '[Media Attachment]'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setQuotedMessage(null)}>
                                <IconClose size={16} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Floating Reactions Tray */}
                    {!!reactionTargetId && (
                        <View style={localStyles.floatingReactionsTray}>
                            <TouchableOpacity style={localStyles.reactionItem} onPress={() => handleReact('heart')}>
                                <IconHeart size={20} color="#EF4444" />
                            </TouchableOpacity>
                            <TouchableOpacity style={localStyles.reactionItem} onPress={() => handleReact('thumbsup')}>
                                <IconThumbsUp size={20} color="#0284C7" />
                            </TouchableOpacity>
                            <TouchableOpacity style={localStyles.reactionItem} onPress={() => handleReact('sparkles')}>
                                <IconSparkles size={20} color="#F59E0B" />
                            </TouchableOpacity>
                            <TouchableOpacity style={localStyles.reactionItem} onPress={() => setReactionTargetId(null)}>
                                <IconClose size={16} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Voice Recording Mode Bar */}
                    {isRecordingVoice ? (
                        <View style={localStyles.voiceRecordingBar}>
                            <TouchableOpacity onPress={handleCancelRecording} style={{ padding: 6 }}>
                                <IconTrash size={20} color="#EF4444" />
                            </TouchableOpacity>

                            <View style={localStyles.voiceTimerRow}>
                                <View style={localStyles.pulsatingRedDot} />
                                <Text style={localStyles.voiceTimerText}>
                                    0:{recordingSecs < 10 ? '0' : ''}{recordingSecs}
                                </Text>
                                <Text style={localStyles.voiceInstructionsText}>Release or tap send to dispatch</Text>
                            </View>

                            <TouchableOpacity style={localStyles.sendCircleBtn} onPress={handleSendVoiceNote}>
                                <IconSend size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* Authentic WhatsApp Bottom Composer */
                        <View style={localStyles.composerRow}>
                            <TouchableOpacity
                                style={localStyles.attachPlusBtn}
                                activeOpacity={0.7}
                                onPress={() => setAttachmentModalVisible(true)}>
                                <Text style={localStyles.plusText}>+</Text>
                            </TouchableOpacity>

                            <View style={localStyles.inputPill}>
                                <TouchableOpacity
                                    style={localStyles.emojiToggleBtn}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        setEmojiPickerVisible(!emojiPickerVisible);
                                    }}>
                                    <IconSmile size={20} color={emojiPickerVisible ? Colors.whatsappGreen : '#64748B'} />
                                </TouchableOpacity>

                                <TextInput
                                    style={localStyles.composerInput}
                                    placeholder={
                                        is24hWindowActive
                                            ? 'Type a message or / for shortcuts...'
                                            : '24h window closed. Send template...'
                                    }
                                    placeholderTextColor="#94A3B8"
                                    value={inputText}
                                    onFocus={() => setEmojiPickerVisible(false)}
                                    onChangeText={(txt) => {
                                        setInputText(txt);
                                        if (txt === '/') {
                                            setQuickRepliesVisible(true);
                                        }
                                    }}
                                    multiline={true}
                                    maxLength={2000}
                                    editable={is24hWindowActive}
                                />

                                <TouchableOpacity
                                    style={localStyles.aiDraftPillBtn}
                                    activeOpacity={0.7}
                                    onPress={handleAIDraft}>
                                    <SparklesIcon size={16} color="#059669" />
                                </TouchableOpacity>
                            </View>

                            {/* Dynamic Voice Recorder or Send Paperplane */}
                            <TouchableOpacity
                                style={[
                                    localStyles.sendCircleBtn,
                                    !!inputText.trim() && { backgroundColor: Colors.whatsappGreen },
                                ]}
                                activeOpacity={0.85}
                                disabled={isSending}
                                onPress={() => {
                                    if (inputText.trim()) {
                                        handleSend();
                                    } else {
                                        handleStartRecording();
                                    }
                                }}>
                                {isSending ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : inputText.trim() ? (
                                    <IconSend size={16} color="#FFFFFF" />
                                ) : (
                                    <MicIcon size={18} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Curated WhatsApp Emoji Picker Tray */}
                    {emojiPickerVisible && (
                        <View style={localStyles.emojiTrayContainer}>
                            <View style={localStyles.emojiCategoryRow}>
                                {(['Smileys', 'Gestures', 'Hearts', 'Work'] as const).map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            localStyles.emojiCategoryTab,
                                            activeEmojiCategory === cat && localStyles.emojiCategoryTabActive,
                                        ]}
                                        onPress={() => setActiveEmojiCategory(cat)}>
                                        <Text
                                            style={[
                                                localStyles.emojiCategoryLabel,
                                                activeEmojiCategory === cat && localStyles.emojiCategoryLabelActive,
                                            ]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <ScrollView
                                style={localStyles.emojiGridScroll}
                                contentContainerStyle={localStyles.emojiGridContent}
                                keyboardShouldPersistTaps="handled">
                                {EMOJI_SETS[activeEmojiCategory].map((emoji, idx) => (
                                    <TouchableOpacity
                                        key={`${emoji}-${idx}`}
                                        style={localStyles.emojiItemBtn}
                                        activeOpacity={0.6}
                                        onPress={() => setInputText((prev) => prev + emoji)}>
                                        <Text style={localStyles.emojiItemChar}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Smooth Modal: Actions & Attachments */}
            <SmoothModal visible={attachmentModalVisible} onClose={() => setAttachmentModalVisible(false)}>
                <Text style={localStyles.modalSheetTitle}>Actions & Attachments</Text>

                <TouchableOpacity
                    style={localStyles.modalActionRow}
                    onPress={handlePickPhoto}>
                    <View style={[localStyles.modalActionIcon, { backgroundColor: '#DCFCE7' }]}>
                        <IconCamera size={18} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalActionTitle}>Photos & Media</Text>
                        <Text style={localStyles.modalActionSub}>Choose directly from device photo gallery</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={localStyles.modalActionRow}
                    onPress={handlePickVideo}>
                    <View style={[localStyles.modalActionIcon, { backgroundColor: '#DBEAFE' }]}>
                        <IconVideo size={18} color="#1E40AF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalActionTitle}>Video Clip</Text>
                        <Text style={localStyles.modalActionSub}>Choose video from device files</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={localStyles.modalActionRow}
                    onPress={handlePickDocument}>
                    <View style={[localStyles.modalActionIcon, { backgroundColor: '#FEE2E2' }]}>
                        <IconFileText size={18} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalActionTitle}>Document & PDF</Text>
                        <Text style={localStyles.modalActionSub}>Select document or invoice from storage</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={localStyles.modalActionRow}
                    onPress={() => {
                        setAttachmentModalVisible(false);
                        handleStartRecording();
                    }}>
                    <View style={[localStyles.modalActionIcon, { backgroundColor: '#FEF3C7' }]}>
                        <MicIcon size={18} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalActionTitle}>Audio Voice Note</Text>
                        <Text style={localStyles.modalActionSub}>Record & send live WhatsApp voice note</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={localStyles.modalActionRow}
                    onPress={() => {
                        setAttachmentModalVisible(false);
                        setTemplateModalVisible(true);
                    }}>
                    <View style={[localStyles.modalActionIcon, { backgroundColor: '#EDE9FE' }]}>
                        <ClipboardIcon size={18} color="#7C3AED" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalActionTitle}>Meta Approved Template</Text>
                        <Text style={localStyles.modalActionSub}>Verified HSM notification template</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={localStyles.modalActionRow}
                    onPress={() => {
                        setAttachmentModalVisible(false);
                        setInteractiveModalVisible(true);
                    }}>
                    <View style={[localStyles.modalActionIcon, { backgroundColor: '#FCE7F3' }]}>
                        <IconStore size={18} color="#BE185D" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalActionTitle}>Interactive WhatsApp Buttons</Text>
                        <Text style={localStyles.modalActionSub}>1-3 action reply buttons for triage</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={localStyles.modalActionRow}
                    onPress={() => {
                        setAttachmentModalVisible(false);
                        handleSend('Enterprise Automation Suite - $499/mo', 'text', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600');
                    }}>
                    <View style={[localStyles.modalActionIcon, { backgroundColor: '#CCFBF1' }]}>
                        <IconDollar size={18} color="#0F766E" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalActionTitle}>Commerce Catalog Products</Text>
                        <Text style={localStyles.modalActionSub}>Share items from business product inventory</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[localStyles.modalActionRow, { borderBottomWidth: 0 }]}
                    onPress={() => {
                        setAttachmentModalVisible(false);
                        setQuickRepliesVisible(true);
                    }}>
                    <View style={[localStyles.modalActionIcon, { backgroundColor: '#E0E7FF' }]}>
                        <ZapIcon size={18} color="#4338CA" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalActionTitle}>Quick Replies Shortcuts (/)</Text>
                        <Text style={localStyles.modalActionSub}>Canned responses for frequent business questions</Text>
                    </View>
                </TouchableOpacity>
            </SmoothModal>

            {/* Smooth Modal: Device Picked Media Preview & Confirmation */}
            <SmoothModal visible={pickedMediaPreviewVisible} onClose={() => setPickedMediaPreviewVisible(false)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={localStyles.modalSheetTitle}>
                        {pickedMediaData?.type === 'image' && 'Send Device Photo'}
                        {pickedMediaData?.type === 'video' && 'Send Device Video'}
                        {pickedMediaData?.type === 'document' && 'Send Device Document'}
                    </Text>
                    <TouchableOpacity onPress={() => setPickedMediaPreviewVisible(false)} style={{ padding: 4 }}>
                        <Text style={{ fontSize: 18, color: '#94A3B8', fontWeight: '700' }}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Media Preview Box */}
                {pickedMediaData?.type === 'image' && (
                    <View style={{ alignItems: 'center', marginBottom: 14 }}>
                        <Image
                            source={{ uri: pickedMediaData.uri }}
                            style={{ width: '100%', height: 220, borderRadius: 12, backgroundColor: '#E2E8F0' }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: 12, color: '#64748B', marginTop: 6 }} numberOfLines={1}>
                            {pickedMediaData.name} {pickedMediaData.size ? `(${(pickedMediaData.size / 1024 / 1024).toFixed(2)} MB)` : ''}
                        </Text>
                    </View>
                )}

                {pickedMediaData?.type === 'video' && (
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 140,
                            borderRadius: 12,
                            backgroundColor: '#EFF6FF',
                            borderWidth: 1,
                            borderColor: '#BFDBFE',
                            marginBottom: 14,
                            padding: 16,
                        }}>
                        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                            <IconVideo size={26} color="#1E40AF" />
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', textAlign: 'center' }} numberOfLines={1}>
                            {pickedMediaData.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                            {pickedMediaData.size ? `${(pickedMediaData.size / 1024 / 1024).toFixed(2)} MB` : 'Video File'}
                        </Text>
                    </View>
                )}

                {pickedMediaData?.type === 'document' && (
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 140,
                            borderRadius: 12,
                            backgroundColor: '#FEF2F2',
                            borderWidth: 1,
                            borderColor: '#FECACA',
                            marginBottom: 14,
                            padding: 16,
                        }}>
                        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                            <IconFileText size={26} color="#DC2626" />
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', textAlign: 'center' }} numberOfLines={1}>
                            {pickedMediaData.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                            {pickedMediaData.size ? `${(pickedMediaData.size / 1024 / 1024).toFixed(2)} MB` : 'PDF Document'}
                        </Text>
                    </View>
                )}

                {/* Caption / Note input */}
                <Text style={localStyles.inputLabel}>Add a caption (optional)</Text>
                <TextInput
                    style={[localStyles.styledInput, { height: 44 }]}
                    placeholder="Type a caption or notes..."
                    placeholderTextColor="#94A3B8"
                    value={pickedMediaCaption}
                    onChangeText={setPickedMediaCaption}
                />

                {/* Send / Cancel buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            height: 44,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => setPickedMediaPreviewVisible(false)}>
                        <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flex: 1.5,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: Colors.whatsappGreen,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={handleConfirmSendPickedMedia}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                            Send to {participant.name.split(' ')[0]}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SmoothModal>

            {/* Smooth Modal: Meta Templates */}
            <SmoothModal visible={templateModalVisible} onClose={() => setTemplateModalVisible(false)}>
                <Text style={localStyles.modalSheetTitle}>Personalize Meta Template</Text>

                <Text style={localStyles.inputLabel}>Template Name</Text>
                <TextInput style={localStyles.styledInput} value={selectedTemplateName} onChangeText={setSelectedTemplateName} />

                <Text style={localStyles.inputLabel}>Placeholder {'{{1}}'} (Customer Name)</Text>
                <TextInput style={localStyles.styledInput} value={templateVar1} onChangeText={setTemplateVar1} />

                <Text style={localStyles.inputLabel}>Placeholder {'{{2}}'} (Discount / Promo Code)</Text>
                <TextInput style={localStyles.styledInput} value={templateVar2} onChangeText={setTemplateVar2} />

                <TouchableOpacity style={localStyles.primaryGreenBtn} onPress={handleSendMetaTemplate}>
                    <Text style={localStyles.primaryGreenBtnText}>Send Official Meta Template</Text>
                </TouchableOpacity>
            </SmoothModal>

            {/* Smooth Modal: Quick Replies */}
            <SmoothModal visible={quickRepliesVisible} onClose={() => setQuickRepliesVisible(false)}>
                <Text style={localStyles.modalSheetTitle}>Quick Replies Shortcuts</Text>

                {[
                    { shortcut: '/hours', text: 'Our business hours are Monday through Friday, 9:00 AM to 7:00 PM EST.' },
                    { shortcut: '/pricing', text: 'Our WhatsApp CRM plans start at $49/mo with full broadcasting & multi-agent team inbox.' },
                    { shortcut: '/payment', text: 'You can complete your order securely via Card, UPI, or Stripe.' },
                    { shortcut: '/support', text: 'Our support team is available 24/7. An agent will respond shortly.' },
                ].map((qr) => (
                    <TouchableOpacity
                        key={qr.shortcut}
                        style={localStyles.quickReplyRow}
                        onPress={() => {
                            setInputText(qr.text);
                            setQuickRepliesVisible(false);
                        }}>
                        <Text style={localStyles.quickReplyShortcut}>{qr.shortcut}</Text>
                        <Text style={localStyles.quickReplySnippet}>{qr.text}</Text>
                    </TouchableOpacity>
                ))}
            </SmoothModal>

            {/* Smooth Modal: Interactive Buttons Generator */}
            <SmoothModal visible={interactiveModalVisible} onClose={() => setInteractiveModalVisible(false)}>
                <Text style={localStyles.modalSheetTitle}>Create Interactive WhatsApp Buttons</Text>

                <Text style={localStyles.inputLabel}>Body Prompt</Text>
                <TextInput style={localStyles.styledInput} value={btnPromptText} onChangeText={setBtnPromptText} />

                <Text style={localStyles.inputLabel}>Button 1 Title</Text>
                <TextInput style={localStyles.styledInput} value={btn1Text} onChangeText={setBtn1Text} />

                <Text style={localStyles.inputLabel}>Button 2 Title</Text>
                <TextInput style={localStyles.styledInput} value={btn2Text} onChangeText={setBtn2Text} />

                <TouchableOpacity style={localStyles.primaryGreenBtn} onPress={handleSendButtons}>
                    <Text style={localStyles.primaryGreenBtnText}>Dispatch Interactive Buttons</Text>
                </TouchableOpacity>
            </SmoothModal>

            {/* Smooth Modal: 360 Contact CRM Drawer */}
            <SmoothModal visible={crmDrawerVisible} onClose={() => setCrmDrawerVisible(false)}>
                <Text style={localStyles.modalSheetTitle}>Contact CRM 360° Profile</Text>

                <View style={localStyles.crmHeaderCard}>
                    <View style={localStyles.crmAvatarBig}>
                        <Text style={localStyles.crmAvatarBigText}>{participant.name[0]?.toUpperCase() || 'C'}</Text>
                    </View>
                    <Text style={localStyles.crmNameText}>{participant.name}</Text>
                    <Text style={localStyles.crmPhoneText}>{participant.phone || 'WhatsApp Verified Contact'}</Text>
                </View>

                <Text style={localStyles.crmSectionHeader}>CRM Tags</Text>
                <View style={localStyles.tagsRow}>
                    <View style={[localStyles.tagBadge, { backgroundColor: participant.tag.bg, paddingHorizontal: 10, paddingVertical: 4 }]}>
                        <Text style={[localStyles.tagBadgeText, { color: participant.tag.color, fontSize: 12 }]}>{participant.tag.label}</Text>
                    </View>
                    <View style={[localStyles.tagBadge, { backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4 }]}>
                        <Text style={{ color: '#7C3AED', fontSize: 12, fontWeight: '700' }}>VIP Customer</Text>
                    </View>
                </View>

                {onOpenDeals && (
                    <TouchableOpacity
                        style={localStyles.crmDealsCard}
                        onPress={() => {
                            setCrmDrawerVisible(false);
                            onOpenDeals();
                        }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={localStyles.crmDealTitle}>Enterprise License Deal ($12,000)</Text>
                                <Text style={localStyles.crmDealSub}>Stage: Proposal Sent (75% probability)</Text>
                            </View>
                            <IconDollar size={20} color="#D97706" />
                        </View>
                    </TouchableOpacity>
                )}

                <Text style={localStyles.crmSectionHeader}>Internal Agent Notes</Text>
                {contactNotes.map((note, i) => (
                    <View key={i} style={localStyles.crmNoteItem}>
                        <Text style={localStyles.crmNoteText}>• {note}</Text>
                    </View>
                ))}

                <View style={localStyles.addNoteRow}>
                    <TextInput
                        style={localStyles.noteInput}
                        placeholder="Add internal note..."
                        placeholderTextColor="#94A3B8"
                        value={newNoteText}
                        onChangeText={setNewNoteText}
                    />
                    <TouchableOpacity style={localStyles.saveNoteBtn} onPress={handleAddNote}>
                        <Text style={localStyles.saveNoteBtnText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </SmoothModal>
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
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
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#E2E8F0',
    },
    avatarPlaceholder: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.whatsappTeal,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
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
        flex: 1,
    },
    headerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    presenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 4,
    },
    onlineText: {
        fontSize: 11,
        color: '#059669',
        fontWeight: '600',
    },
    tagBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 5,
        marginLeft: 6,
    },
    tagBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerActionBtn: {
        padding: 5,
    },
    policyBannerActive: {
        backgroundColor: '#DCFCE7',
        paddingVertical: 5,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#BBF7D0',
    },
    policyBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    policyActiveText: {
        fontSize: 11,
        color: '#166534',
        fontWeight: '600',
        marginLeft: 4,
    },
    aiDraftBtn: {
        backgroundColor: '#059669',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiDraftBtnText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 3,
    },
    policyBannerExpired: {
        backgroundColor: '#FEF3C7',
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#FDE68A',
    },
    policyExpiredTitle: {
        fontSize: 11,
        color: '#92400E',
        fontWeight: '700',
    },
    policyExpiredSub: {
        fontSize: 10,
        color: '#B45309',
    },
    sendTemplateBtn: {
        backgroundColor: '#D97706',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    sendTemplateBtnText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#EFEAE2',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748B',
        fontSize: 12,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
    },
    bubbleIncoming: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderTopLeftRadius: 2,
        padding: 9,
        maxWidth: '85%',
        alignSelf: 'flex-start',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
        position: 'relative',
    },
    bubbleOutgoing: {
        backgroundColor: Colors.whatsappOutgoingBubble,
        borderRadius: 12,
        borderTopRightRadius: 2,
        padding: 9,
        maxWidth: '85%',
        alignSelf: 'flex-end',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
        position: 'relative',
    },
    quotedPreviewBox: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderLeftWidth: 3,
        borderLeftColor: Colors.whatsappGreen,
        padding: 5,
        borderRadius: 4,
        marginBottom: 5,
    },
    quotedPreviewLabel: {
        fontSize: 10.5,
        fontWeight: '700',
        color: Colors.whatsappTeal,
    },
    bubbleText: {
        fontSize: 14,
        color: '#1E293B',
        lineHeight: 19,
    },
    mediaImage: {
        width: 220,
        height: 150,
        borderRadius: 8,
        backgroundColor: '#E2E8F0',
    },
    audioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    audioPlayBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.whatsappGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    waveformRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 18,
    },
    waveBar: {
        width: 3,
        borderRadius: 1.5,
        marginRight: 2.5,
    },
    audioDurationText: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
    },
    speedPill: {
        backgroundColor: 'rgba(0,0,0,0.06)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6,
    },
    speedPillText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#334155',
    },
    templateBadge: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
        alignSelf: 'flex-start',
    },
    templateBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#0F172A',
    },
    templateCtaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
        marginTop: 6,
        paddingTop: 6,
        gap: 6,
    },
    templateCtaText: {
        fontSize: 11.5,
        fontWeight: '700',
        color: Colors.whatsappTeal,
    },
    bubbleFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 3,
    },
    timeText: {
        fontSize: 10,
        color: '#64748B',
    },
    reactionBadge: {
        position: 'absolute',
        bottom: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
    },
    quotedActiveBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        borderLeftWidth: 4,
        borderLeftColor: Colors.whatsappGreen,
    },
    quotedAuthorText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.whatsappTeal,
    },
    quotedSnippetText: {
        fontSize: 12,
        color: '#475569',
    },
    floatingReactionsTray: {
        position: 'absolute',
        bottom: 64,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
        zIndex: 50,
    },
    reactionItem: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    voiceRecordingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    voiceTimerRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    pulsatingRedDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        marginRight: 6,
    },
    voiceTimerText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    voiceInstructionsText: {
        fontSize: 11,
        color: '#64748B',
        marginLeft: 10,
    },
    composerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 6,
    },
    attachPlusBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusText: {
        fontSize: 22,
        color: '#475569',
        lineHeight: 24,
    },
    inputPill: {
        flex: 1,
        minHeight: 38,
        maxHeight: 100,
        backgroundColor: '#F8FAFC',
        borderRadius: 19,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    composerInput: {
        flex: 1,
        fontSize: 14,
        color: '#1E293B',
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    },
    emojiToggleBtn: {
        padding: 4,
        marginRight: 4,
    },
    emojiTrayContainer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        height: 220,
    },
    emojiCategoryRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#F8FAFC',
    },
    emojiCategoryTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    emojiCategoryTabActive: {
        borderBottomColor: Colors.whatsappGreen,
        backgroundColor: '#FFFFFF',
    },
    emojiCategoryLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    emojiCategoryLabelActive: {
        color: Colors.whatsappGreen,
        fontWeight: '700',
    },
    emojiGridScroll: {
        flex: 1,
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    emojiGridContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingBottom: 20,
    },
    emojiItemBtn: {
        width: '12.5%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiItemChar: {
        fontSize: 22,
    },
    aiDraftPillBtn: {
        padding: 4,
        marginLeft: 4,
    },
    sendCircleBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.whatsappGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSheetTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 14,
    },
    modalActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalActionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    modalActionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    modalActionSub: {
        fontSize: 11,
        color: '#64748B',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        marginTop: 8,
        marginBottom: 4,
    },
    styledInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 13,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 6,
    },
    primaryGreenBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    primaryGreenBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    quickReplyRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    quickReplyShortcut: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.whatsappGreen,
    },
    quickReplySnippet: {
        fontSize: 12,
        color: '#475569',
        marginTop: 2,
    },
    crmHeaderCard: {
        alignItems: 'center',
        marginBottom: 14,
    },
    crmAvatarBig: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.whatsappTeal,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    crmAvatarBigText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
    },
    crmNameText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    crmPhoneText: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    crmSectionHeader: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 10,
        marginBottom: 6,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
    crmDealsCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 10,
    },
    crmDealTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    crmDealSub: {
        fontSize: 11,
        color: '#059669',
        marginTop: 2,
    },
    crmNoteItem: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 8,
        marginBottom: 5,
    },
    crmNoteText: {
        fontSize: 12,
        color: '#1E293B',
    },
    addNoteRow: {
        flexDirection: 'row',
        marginTop: 8,
        marginBottom: 12,
    },
    noteInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: 12,
        color: '#0F172A',
    },
    saveNoteBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 8,
        paddingHorizontal: 14,
        justifyContent: 'center',
        marginLeft: 8,
    },
    saveNoteBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
});
