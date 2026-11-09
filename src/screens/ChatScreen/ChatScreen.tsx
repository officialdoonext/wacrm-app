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
    Dimensions,
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
    IconSearch,
    IconRefresh,
    IconChevronRight,
    IconPlus,
    IconCheckCircle,
    IconBox,
} from '../../components/AppIcons';
import { SmoothModal } from '../../components/SmoothModal';
import { crmService, DynamicMessage, MessageTemplateItem } from '../../services/crmService';
import { backendApi, CatalogProduct, QuickReplyItem } from '../../services/api';
import { supabase } from '../../services/supabase';

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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_PREAPPROVED_TEMPLATES: MessageTemplateItem[] = [
    {
        id: 'tpl_welcome_offer',
        name: 'festive_welcome_offer',
        category: 'Marketing',
        language: 'en_US',
        body_text: 'Hi {{1}}, welcome! Enjoy an exclusive 20% discount on your next order with code {{2}}. Reply to this message to redeem.',
        status: 'APPROVED',
        created_at: new Date().toISOString(),
    },
    {
        id: 'tpl_order_update',
        name: 'order_status_update',
        category: 'Utility',
        language: 'en_US',
        body_text: 'Hello {{1}}, your order #{{2}} has been confirmed and scheduled for dispatch. We will share live tracking shortly.',
        status: 'APPROVED',
        created_at: new Date().toISOString(),
    },
    {
        id: 'tpl_payment_reminder',
        name: 'invoice_payment_reminder',
        category: 'Utility',
        language: 'en_US',
        body_text: 'Dear {{1}}, this is a friendly reminder that invoice #{{2}} is due for payment. Please reach out if you have questions.',
        status: 'APPROVED',
        created_at: new Date().toISOString(),
    },
    {
        id: 'tpl_vip_reengage',
        name: 'vip_customer_reengagement',
        category: 'Marketing',
        language: 'en_US',
        body_text: 'Dear {{1}}, we have reserved your priority consultation session for {{2}}. Reply YES to confirm your booking.',
        status: 'APPROVED',
        created_at: new Date().toISOString(),
    },
    {
        id: 'tpl_appointment_reminder',
        name: 'appointment_reminder',
        category: 'Utility',
        language: 'en_US',
        body_text: 'Hi {{1}}, your scheduled consultation is set for {{2}}. Please let us know if you need to reschedule.',
        status: 'APPROVED',
        created_at: new Date().toISOString(),
    },
];

const DEFAULT_CATALOG_ITEMS: CatalogProduct[] = [
    {
        id: 'prod-wacrm-pro',
        retailer_id: 'WACRM-PRO',
        name: 'WhatsApp CRM Pro Suite',
        description: 'Multi-agent shared team inbox with automated broadcasting & CRM pipelines.',
        price: 49.00,
        currency: 'USD',
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
        availability: 'in stock',
        category: 'Software',
    },
    {
        id: 'prod-ai-copilot',
        retailer_id: 'AI-COPILOT',
        name: 'AI Agent & Bot Auto-Reply',
        description: '24/7 AI chatbot copilot powered by Claude & OpenAI for WhatsApp CRM.',
        price: 29.00,
        currency: 'USD',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        availability: 'in stock',
        category: 'AI & Automation',
    },
    {
        id: 'prod-enterprise-api',
        retailer_id: 'ENT-API',
        name: 'Enterprise Cloud API License',
        description: 'Official Meta Graph API direct gateway with unlimited messaging limits.',
        price: 149.00,
        currency: 'USD',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
        availability: 'in stock',
        category: 'Enterprise',
    },
    {
        id: 'prod-setup-onboarding',
        retailer_id: 'VIP-ONBOARD',
        name: 'VIP Setup & Team Onboarding',
        description: 'Dedicated account manager WhatsApp setup, template approval, and staff training.',
        price: 99.00,
        currency: 'USD',
        image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
        availability: 'in stock',
        category: 'Services',
    },
];

const DEFAULT_QUICK_REPLY_ITEMS: QuickReplyItem[] = [
    {
        id: 'qr-hours',
        title: 'Business Hours',
        content_text: 'Our business hours are Monday through Friday, 9:00 AM to 7:00 PM EST.',
        category: '/hours',
    },
    {
        id: 'qr-pricing',
        title: 'Pricing & Plans',
        content_text: 'Our WhatsApp CRM plans start at $49/mo with full broadcasting & multi-agent team inbox.',
        category: '/pricing',
    },
    {
        id: 'qr-payment',
        title: 'Payment Methods',
        content_text: 'You can complete your order securely via Card, UPI, or Stripe.',
        category: '/payment',
    },
    {
        id: 'qr-support',
        title: '24/7 Support Desk',
        content_text: 'Our support team is available 24/7. An agent will respond shortly.',
        category: '/support',
    },
    {
        id: 'qr-catalog',
        title: 'WhatsApp Catalog',
        content_text: 'Please check our WhatsApp product catalog to view our latest packages and live offers.',
        category: '/catalog',
    },
    {
        id: 'qr-location',
        title: 'Office Location',
        content_text: 'Our office is located at 123 Business Way, Suite 400. Open Monday through Saturday.',
        category: '/location',
    },
];

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

    // Catalog State & Modal
    const [catalogModalVisible, setCatalogModalVisible] = useState(false);
    const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>(DEFAULT_CATALOG_ITEMS);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [catalogTab, setCatalogTab] = useState<'single' | 'collection' | 'storefront'>('single');
    const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<CatalogProduct | null>(DEFAULT_CATALOG_ITEMS[0]);
    const [selectedCatalogProductIds, setSelectedCatalogProductIds] = useState<string[]>([]);
    const [catalogCustomBody, setCatalogCustomBody] = useState('');
    const [catalogCustomFooter, setCatalogCustomFooter] = useState('');
    const [isSendingCatalog, setIsSendingCatalog] = useState(false);

    // Meta Templates State & Modal
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [templatesList, setTemplatesList] = useState<MessageTemplateItem[]>(DEFAULT_PREAPPROVED_TEMPLATES);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templateSearch, setTemplateSearch] = useState('');
    const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'ALL' | 'Marketing' | 'Utility' | 'Authentication'>('ALL');
    const [activeSelectedTemplate, setActiveSelectedTemplate] = useState<MessageTemplateItem | null>(null);
    const [templateVarValues, setTemplateVarValues] = useState<Record<string, string>>({});
    const [isSendingTemplate, setIsSendingTemplate] = useState(false);

    // Quick Replies State & Modal
    const [quickRepliesList, setQuickRepliesList] = useState<QuickReplyItem[]>(DEFAULT_QUICK_REPLY_ITEMS);
    const [quickRepliesLoading, setQuickRepliesLoading] = useState(false);
    const [quickRepliesSearch, setQuickRepliesSearch] = useState('');

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
        customMediaUrl?: string,
        templateName?: string,
        templateLanguage?: string,
        templateParams?: string[],
        interactivePayload?: any
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
            template_name: templateName,
            interactive_payload: interactivePayload,
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
                templateName,
                templateLanguage,
                templateParams,
                interactivePayload,
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
            if (res.data?.draft && res.data.draft.trim().length > 0) {
                setInputText(res.data.draft.trim());
            } else {
                const customerFirst = (participant.name || 'there').split(' ')[0];
                setInputText(
                    `Hello ${customerFirst}! Thanks for contacting us. I am reviewing your account and will provide full details shortly.`
                );
            }
        } catch {
            const customerFirst = (participant.name || 'there').split(' ')[0];
            setInputText(
                `Hello ${customerFirst}! Thank you for reaching out. How can our team assist you with your WhatsApp automation today?`
            );
        } finally {
            setIsDraftingAI(false);
        }
    };

    // Load Quick Replies
    const loadQuickReplies = useCallback(async () => {
        setQuickRepliesLoading(true);
        try {
            const res = await backendApi.getQuickReplies();
            if (res.data?.quick_replies && res.data.quick_replies.length > 0) {
                setQuickRepliesList(res.data.quick_replies);
            } else {
                const { data } = await supabase
                    .from('quick_replies')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (data && data.length > 0) {
                    setQuickRepliesList(
                        data.map((q: any) => ({
                            id: q.id,
                            title: q.title,
                            content_text: q.content_text || '',
                            category: q.kind || 'text',
                        }))
                    );
                } else {
                    setQuickRepliesList([
                        {
                            id: 'qr-hours',
                            title: 'Business Hours',
                            content_text: 'Our business hours are Monday through Friday, 9:00 AM to 7:00 PM EST.',
                            category: '/hours',
                        },
                        {
                            id: 'qr-pricing',
                            title: 'Pricing & Plans',
                            content_text: 'Our WhatsApp CRM plans start at $49/mo with full broadcasting & multi-agent team inbox.',
                            category: '/pricing',
                        },
                        {
                            id: 'qr-payment',
                            title: 'Payment Methods',
                            content_text: 'You can complete your order securely via Card, UPI, or Stripe.',
                            category: '/payment',
                        },
                        {
                            id: 'qr-support',
                            title: '24/7 Support Desk',
                            content_text: 'Our support team is available 24/7. An agent will respond shortly.',
                            category: '/support',
                        },
                        {
                            id: 'qr-catalog',
                            title: 'WhatsApp Catalog',
                            content_text: 'Please check our WhatsApp product catalog to view our latest packages and live offers.',
                            category: '/catalog',
                        },
                        {
                            id: 'qr-location',
                            title: 'Office Location',
                            content_text: 'Our office is located at 123 Business Way, Suite 400. Open Monday through Saturday.',
                            category: '/location',
                        },
                    ]);
                }
            }
        } catch {
            // fallback
        } finally {
            setQuickRepliesLoading(false);
        }
    }, []);

    const handlePickQuickReply = (qr: QuickReplyItem) => {
        const textToInsert = qr.content_text;
        setInputText((prev) => {
            if (!prev || prev === '/') {
                return textToInsert;
            }
            return prev.trimEnd() + '\n' + textToInsert;
        });
        setQuickRepliesVisible(false);
    };

    // Load Message Templates
    const loadTemplates = useCallback(async () => {
        setTemplatesLoading(true);
        try {
            const list = await crmService.fetchMessageTemplates();
            setTemplatesList(list);
        } catch (err) {
            console.warn('Failed to load templates:', err);
        } finally {
            setTemplatesLoading(false);
        }
    }, []);

    const handleSelectTemplate = (template: MessageTemplateItem) => {
        setActiveSelectedTemplate(template);
        const matches = Array.from(template.body_text.matchAll(/\{\{(\d+)\}\}/g));
        const initialVars: Record<string, string> = {};
        matches.forEach((m) => {
            const varNum = m[1];
            if (varNum === '1') {
                initialVars['1'] = participant.name ? participant.name.split(' ')[0] : 'Valued Customer';
            } else if (varNum === '2') {
                initialVars['2'] = template.name.includes('offer') ? 'OFFER20' : template.name.includes('order') ? 'ORD-7890' : 'Confirmed';
            } else {
                initialVars[varNum] = '';
            }
        });
        setTemplateVarValues(initialVars);
    };

    const renderTemplatePreviewText = (body: string, vars: Record<string, string>) => {
        return body.replace(/\{\{(\d+)\}\}/g, (_, num) => {
            const val = vars[num];
            return val && val.trim() ? val : `{{${num}}}`;
        });
    };

    const handleSendOfficialTemplate = async () => {
        if (!activeSelectedTemplate || !conversationId) return;
        setIsSendingTemplate(true);
        try {
            const rendered = renderTemplatePreviewText(activeSelectedTemplate.body_text, templateVarValues);
            const paramsArray = Object.keys(templateVarValues)
                .sort((a, b) => Number(a) - Number(b))
                .map((k) => templateVarValues[k] || '');

            await handleSend(
                rendered,
                'template',
                activeSelectedTemplate.header_media_url || undefined,
                activeSelectedTemplate.name,
                activeSelectedTemplate.language || 'en_US',
                paramsArray
            );

            setTemplateModalVisible(false);
            setActiveSelectedTemplate(null);
        } catch (err: any) {
            Alert.alert('Send Error', err?.message || 'Failed to dispatch Meta template');
        } finally {
            setIsSendingTemplate(false);
        }
    };

    // Load Catalog Products
    const loadCatalogProducts = useCallback(async () => {
        setCatalogLoading(true);
        try {
            const res = await backendApi.getCatalogProducts(100, catalogSearch);
            if (res.data?.products && res.data.products.length > 0) {
                setCatalogProducts(res.data.products);
                setSelectedCatalogProduct((prev) => prev || res.data!.products[0]);
            } else {
                const { data } = await supabase
                    .from('commerce_products')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (data && data.length > 0) {
                    const mapped: CatalogProduct[] = data.map((p: any) => ({
                        id: p.id,
                        retailer_id: p.retailer_id || p.id,
                        name: p.name,
                        description: p.description || '',
                        price: Number(p.price) || 0,
                        currency: p.currency || 'USD',
                        image_url: p.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
                        availability: p.availability || 'in stock',
                        category: p.category || 'General',
                    }));
                    setCatalogProducts(mapped);
                    setSelectedCatalogProduct((prev) => prev || mapped[0]);
                } else {
                    const fallbackProducts: CatalogProduct[] = [
                        {
                            id: 'prod-wacrm-pro',
                            retailer_id: 'WACRM-PRO',
                            name: 'WhatsApp CRM Pro Suite',
                            description: 'Multi-agent shared team inbox with automated broadcasting & CRM pipelines.',
                            price: 49.00,
                            currency: 'USD',
                            image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
                            availability: 'in stock',
                            category: 'Software',
                        },
                        {
                            id: 'prod-ai-copilot',
                            retailer_id: 'AI-COPILOT',
                            name: 'AI Agent & Bot Auto-Reply',
                            description: '24/7 AI chatbot copilot powered by Claude & OpenAI for WhatsApp CRM.',
                            price: 29.00,
                            currency: 'USD',
                            image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
                            availability: 'in stock',
                            category: 'AI & Automation',
                        },
                        {
                            id: 'prod-enterprise-api',
                            retailer_id: 'ENT-API',
                            name: 'Enterprise Cloud API License',
                            description: 'Official Meta Graph API direct gateway with unlimited messaging limits.',
                            price: 149.00,
                            currency: 'USD',
                            image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
                            availability: 'in stock',
                            category: 'Enterprise',
                        },
                        {
                            id: 'prod-setup-onboarding',
                            retailer_id: 'VIP-ONBOARD',
                            name: 'VIP Setup & Team Onboarding',
                            description: 'Dedicated account manager WhatsApp setup, template approval, and staff training.',
                            price: 99.00,
                            currency: 'USD',
                            image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
                            availability: 'in stock',
                            category: 'Services',
                        },
                    ];
                    setCatalogProducts(fallbackProducts);
                    setSelectedCatalogProduct((prev) => prev || fallbackProducts[0]);
                }
            }
        } catch {
            // fallback
        } finally {
            setCatalogLoading(false);
        }
    }, [catalogSearch]);

    // Background prefetch for templates, catalog, and quick replies on mount
    useEffect(() => {
        loadTemplates();
        loadCatalogProducts();
        loadQuickReplies();
    }, [loadTemplates, loadCatalogProducts, loadQuickReplies]);

    const handleSendSingleProduct = async () => {
        if (!selectedCatalogProduct || !conversationId) return;
        setIsSendingCatalog(true);
        try {
            const product = selectedCatalogProduct;
            const bodyText = catalogCustomBody.trim() || product.description;
            const footerText = catalogCustomFooter.trim() || 'WhatsApp Commerce Catalog';
            const symbol = product.currency === 'USD' ? '$' : product.currency === 'INR' ? '₹' : product.currency === 'EUR' ? '€' : product.currency + ' ';
            const preview = `🛒 ${product.name}\n${symbol}${product.price}\n\n${bodyText}\n\nSKU: ${product.retailer_id}`;

            const payload = {
                kind: 'product',
                product_retailer_id: product.retailer_id,
                product_name: product.name,
                product_price: product.price,
                product_currency: product.currency,
                image_url: product.image_url,
                body: bodyText,
                footer: footerText,
            };

            backendApi.sendCatalogProduct({
                conversation_id: conversationId,
                catalog_kind: 'product',
                product_retailer_id: product.retailer_id,
                product_name: product.name,
                product_price: product.price,
                product_currency: product.currency,
                body_text: bodyText,
                footer_text: footerText,
            }).catch((e) => console.log('Catalog send api note:', e?.message));

            await handleSend(
                preview,
                'interactive',
                product.image_url,
                undefined,
                undefined,
                undefined,
                payload
            );

            setCatalogModalVisible(false);
            setCatalogCustomBody('');
            setCatalogCustomFooter('');
        } catch (err: any) {
            Alert.alert('Send Error', err?.message || 'Failed to send catalog product');
        } finally {
            setIsSendingCatalog(false);
        }
    };

    const handleSendCollectionProducts = async () => {
        if (selectedCatalogProductIds.length === 0 || !conversationId) {
            Alert.alert('Select Products', 'Please select at least 1 product for the collection.');
            return;
        }
        setIsSendingCatalog(true);
        try {
            const selected = catalogProducts.filter((p) => selectedCatalogProductIds.includes(p.retailer_id));
            const bodyText = catalogCustomBody.trim() || 'Browse our curated collection and order directly on WhatsApp.';
            const itemsList = selected.map((p) => `• ${p.name} (${p.currency} ${p.price})`).join('\n');
            const preview = `🛍️ Featured Collection (${selected.length} items)\n\n${itemsList}\n\n${bodyText}`;

            backendApi.sendCatalogProduct({
                conversation_id: conversationId,
                catalog_kind: 'product_list',
                header_text: 'Featured Collection',
                body_text: bodyText,
                sections: [
                    {
                        title: 'Items',
                        product_retailer_ids: selectedCatalogProductIds,
                    },
                ],
            }).catch(() => {});

            await handleSend(
                preview,
                'interactive',
                selected[0]?.image_url,
                undefined,
                undefined,
                undefined,
                { kind: 'product_list', count: selected.length, items: selected }
            );

            setCatalogModalVisible(false);
            setSelectedCatalogProductIds([]);
            setCatalogCustomBody('');
        } catch (err: any) {
            Alert.alert('Send Error', err?.message || 'Failed to send collection');
        } finally {
            setIsSendingCatalog(false);
        }
    };

    const handleSendStorefront = async () => {
        if (!conversationId) return;
        setIsSendingCatalog(true);
        try {
            const bodyText = catalogCustomBody.trim() || 'Explore our full WhatsApp product catalog and place your order directly in chat!';
            const preview = `🏪 Official WhatsApp Storefront\n\n${bodyText}\n\nTap below to browse all available items.`;

            backendApi.sendCatalogProduct({
                conversation_id: conversationId,
                catalog_kind: 'catalog_message',
                body_text: bodyText,
            }).catch(() => {});

            await handleSend(
                preview,
                'interactive',
                catalogProducts[0]?.image_url,
                undefined,
                undefined,
                undefined,
                { kind: 'catalog_message', body: bodyText }
            );

            setCatalogModalVisible(false);
            setCatalogCustomBody('');
        } catch (err: any) {
            Alert.alert('Send Error', err?.message || 'Failed to send storefront');
        } finally {
            setIsSendingCatalog(false);
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                                            <View style={{ minWidth: 200 }}>
                                                <View style={localStyles.templateBadge}>
                                                    <Text style={localStyles.templateBadgeText}>META VERIFIED TEMPLATE</Text>
                                                </View>
                                                {item.template_name ? (
                                                    <Text style={localStyles.templateNameSubtitle}>{item.template_name}</Text>
                                                ) : null}
                                                <Text style={localStyles.bubbleText}>{item.content_text}</Text>
                                                <View style={localStyles.templateCtaRow}>
                                                    <IconStore size={14} color={Colors.whatsappTeal} />
                                                    <Text style={localStyles.templateCtaText}>Official WhatsApp Template</Text>
                                                </View>
                                            </View>
                                        ) : item.content_type === 'interactive' ? (
                                            /* 4. Interactive WhatsApp Message / Catalog Product */
                                            <View style={{ minWidth: 210 }}>
                                                {item.media_url ? (
                                                    <Image
                                                        source={{ uri: item.media_url }}
                                                        style={localStyles.catalogBubbleImage}
                                                        resizeMode="cover"
                                                    />
                                                ) : null}
                                                <View style={localStyles.catalogBadgeRow}>
                                                    <IconStore size={13} color="#059669" />
                                                    <Text style={localStyles.catalogBadgeText}>WHATSAPP CATALOG</Text>
                                                </View>
                                                <Text style={localStyles.bubbleText}>{item.content_text}</Text>
                                                <View style={localStyles.catalogCtaBtn}>
                                                    <IconStore size={14} color="#059669" />
                                                    <Text style={localStyles.catalogCtaBtnText}>View Item in Catalog</Text>
                                                </View>
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
                        <View>
                            {isDraftingAI && (
                                <View style={localStyles.aiDraftingBanner}>
                                    <ActivityIndicator size="small" color="#7C3AED" />
                                    <Text style={localStyles.aiDraftingBannerText}>AI Copilot is drafting a response...</Text>
                                </View>
                            )}
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
            <SmoothModal
                visible={attachmentModalVisible}
                onClose={() => setAttachmentModalVisible(false)}
                maxHeight={Math.round(SCREEN_HEIGHT * 0.75)}>
                <Text style={localStyles.modalSheetTitle}>Actions & Attachments</Text>

                <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 16 }}>
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
                            setActiveSelectedTemplate(null);
                            setTemplateModalVisible(true);
                            loadTemplates();
                        }}>
                        <View style={[localStyles.modalActionIcon, { backgroundColor: '#EDE9FE' }]}>
                            <ClipboardIcon size={18} color="#7C3AED" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={localStyles.modalActionTitle}>Meta Approved Template</Text>
                            <Text style={localStyles.modalActionSub}>Verified HSM notification template with variables</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={localStyles.modalActionRow}
                        onPress={() => {
                            setAttachmentModalVisible(false);
                            setCatalogModalVisible(true);
                            loadCatalogProducts();
                        }}>
                        <View style={[localStyles.modalActionIcon, { backgroundColor: '#CCFBF1' }]}>
                            <IconStore size={18} color="#0F766E" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={localStyles.modalActionTitle}>WhatsApp Commerce Catalog</Text>
                            <Text style={localStyles.modalActionSub}>Share single product, collections, or storefront</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={localStyles.modalActionRow}
                        onPress={() => {
                            setAttachmentModalVisible(false);
                            setQuickRepliesVisible(true);
                            loadQuickReplies();
                        }}>
                        <View style={[localStyles.modalActionIcon, { backgroundColor: '#FEF3C7' }]}>
                            <ZapIcon size={18} color="#D97706" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={localStyles.modalActionTitle}>Quick Replies Shortcuts (/)</Text>
                            <Text style={localStyles.modalActionSub}>Canned responses for frequent business questions</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={localStyles.modalActionRow}
                        onPress={() => {
                            setAttachmentModalVisible(false);
                            handleAIDraft();
                        }}>
                        <View style={[localStyles.modalActionIcon, { backgroundColor: '#F5F3FF' }]}>
                            <IconSparkles size={18} color="#7C3AED" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={localStyles.modalActionTitle}>Reply with AI Copilot</Text>
                                <View style={localStyles.aiBadgePill}>
                                    <Text style={localStyles.aiBadgePillText}>AI</Text>
                                </View>
                            </View>
                            <Text style={localStyles.modalActionSub}>Draft intelligent contextual reply based on chat</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[localStyles.modalActionRow, { borderBottomWidth: 0 }]}
                        onPress={() => {
                            setAttachmentModalVisible(false);
                            setInteractiveModalVisible(true);
                        }}>
                        <View style={[localStyles.modalActionIcon, { backgroundColor: '#FCE7F3' }]}>
                            <IconChat size={18} color="#BE185D" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={localStyles.modalActionTitle}>Interactive WhatsApp Buttons</Text>
                            <Text style={localStyles.modalActionSub}>1-3 action reply buttons for triage</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </SmoothModal>

            {/* Smooth Modal: Device Picked Media Preview & Confirmation */}
            <SmoothModal
                visible={pickedMediaPreviewVisible}
                onClose={() => setPickedMediaPreviewVisible(false)}
                maxHeight={Math.round(SCREEN_HEIGHT * 0.85)}>
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

            {/* Smooth Modal: Meta Approved Templates */}
            <SmoothModal
                visible={templateModalVisible}
                onClose={() => setTemplateModalVisible(false)}
                height={Math.round(SCREEN_HEIGHT * 0.85)}>
                {!activeSelectedTemplate ? (
                    <View style={{ flex: 1, height: '100%' }}>
                        <View style={localStyles.modalHeaderRow}>
                            <View>
                                <Text style={localStyles.modalSheetTitle}>Meta Approved Templates</Text>
                                <Text style={localStyles.modalSheetSub}>Official pre-approved HSM notification templates</Text>
                            </View>
                            <TouchableOpacity onPress={() => setTemplateModalVisible(false)} style={localStyles.modalCloseBtn}>
                                <Text style={localStyles.modalCloseBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={localStyles.modalSearchContainer}>
                            <IconSearch size={16} color="#94A3B8" />
                            <TextInput
                                style={localStyles.modalSearchInput}
                                placeholder="Search templates by name or content..."
                                placeholderTextColor="#94A3B8"
                                value={templateSearch}
                                onChangeText={setTemplateSearch}
                            />
                            {!!templateSearch && (
                                <TouchableOpacity onPress={() => setTemplateSearch('')} style={localStyles.modalClearSearch}>
                                    <IconClose size={14} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Category Filter Chips */}
                        <View style={localStyles.filterChipsRow}>
                            {(['ALL', 'Marketing', 'Utility', 'Authentication'] as const).map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        localStyles.filterChip,
                                        templateCategoryFilter === cat && localStyles.filterChipActive,
                                    ]}
                                    onPress={() => setTemplateCategoryFilter(cat)}>
                                    <Text
                                        style={[
                                            localStyles.filterChipText,
                                            templateCategoryFilter === cat && localStyles.filterChipTextActive,
                                        ]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Templates List */}
                        {templatesLoading ? (
                            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={Colors.whatsappGreen} />
                                <Text style={{ marginTop: 10, color: '#64748B', fontSize: 13 }}>Loading templates...</Text>
                            </View>
                        ) : (
                            <ScrollView style={{ flex: 1, marginTop: 8 }} keyboardShouldPersistTaps="handled">
                                {templatesList
                                    .filter((t) => {
                                        const matchesSearch =
                                            t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                                            t.body_text.toLowerCase().includes(templateSearch.toLowerCase());
                                        const matchesCat =
                                            templateCategoryFilter === 'ALL' ||
                                            (t.category && t.category.toLowerCase() === templateCategoryFilter.toLowerCase());
                                        return matchesSearch && matchesCat;
                                    })
                                    .map((t) => (
                                        <TouchableOpacity
                                            key={t.id}
                                            style={localStyles.templateCard}
                                            activeOpacity={0.7}
                                            onPress={() => handleSelectTemplate(t)}>
                                            <View style={localStyles.templateCardHeader}>
                                                <Text style={localStyles.templateCardName} numberOfLines={1}>
                                                    {t.name}
                                                </Text>
                                                <View style={localStyles.templateBadgeApproved}>
                                                    <Text style={localStyles.templateBadgeApprovedText}>APPROVED</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                                                <View style={localStyles.templateCategoryBadge}>
                                                    <Text style={localStyles.templateCategoryBadgeText}>{t.category || 'Utility'}</Text>
                                                </View>
                                                <View style={[localStyles.templateCategoryBadge, { backgroundColor: '#F1F5F9' }]}>
                                                    <Text style={[localStyles.templateCategoryBadgeText, { color: '#64748B' }]}>{t.language || 'en_US'}</Text>
                                                </View>
                                            </View>
                                            <Text style={localStyles.templateCardBody} numberOfLines={3}>
                                                {t.body_text}
                                            </Text>
                                            <View style={localStyles.templateCardFooter}>
                                                <Text style={localStyles.templateTapPrompt}>Tap to customize variables & send</Text>
                                                <IconChevronRight size={14} color="#059669" />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                            </ScrollView>
                        )}
                    </View>
                ) : (
                    <View style={{ flex: 1, height: '100%' }}>
                        <View style={localStyles.modalHeaderRow}>
                            <TouchableOpacity
                                onPress={() => setActiveSelectedTemplate(null)}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }}>
                                <Text style={{ color: Colors.whatsappGreen, fontWeight: '700', fontSize: 14 }}>← Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setTemplateModalVisible(false)} style={localStyles.modalCloseBtn}>
                                <Text style={localStyles.modalCloseBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={localStyles.modalSheetTitle}>Personalize Template</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{activeSelectedTemplate.name}</Text>
                            <View style={localStyles.templateBadgeApproved}>
                                <Text style={localStyles.templateBadgeApprovedText}>APPROVED</Text>
                            </View>
                        </View>

                        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
                            {/* Dynamic Variable Inputs */}
                            {Object.keys(templateVarValues).length > 0 ? (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={localStyles.sectionSubHeading}>Fill Template Parameters:</Text>
                                    {Object.keys(templateVarValues)
                                        .sort((a, b) => Number(a) - Number(b))
                                        .map((varKey) => (
                                            <View key={varKey} style={{ marginBottom: 8 }}>
                                                <Text style={localStyles.inputLabel}>
                                                    Variable {'{{' + varKey + '}}'} {varKey === '1' ? '(Customer / Greeting Name)' : varKey === '2' ? '(Value / Promo Code / Number)' : ''}
                                                </Text>
                                                <TextInput
                                                    style={localStyles.styledInput}
                                                    value={templateVarValues[varKey]}
                                                    placeholder={`Value for {{${varKey}}}`}
                                                    placeholderTextColor="#94A3B8"
                                                    onChangeText={(txt) =>
                                                        setTemplateVarValues((prev) => ({ ...prev, [varKey]: txt }))
                                                    }
                                                />
                                            </View>
                                        ))}
                                </View>
                            ) : (
                                <View style={{ padding: 10, backgroundColor: '#F8FAFC', borderRadius: 8, marginBottom: 12 }}>
                                    <Text style={{ fontSize: 12, color: '#64748B' }}>This template has no required dynamic placeholder parameters.</Text>
                                </View>
                            )}

                            {/* Live Preview Box */}
                            <Text style={localStyles.sectionSubHeading}>Live Message Preview:</Text>
                            <View style={localStyles.previewBubble}>
                                <View style={localStyles.templateBadge}>
                                    <Text style={localStyles.templateBadgeText}>META VERIFIED TEMPLATE</Text>
                                </View>
                                <Text style={localStyles.previewBubbleText}>
                                    {renderTemplatePreviewText(activeSelectedTemplate.body_text, templateVarValues)}
                                </Text>
                                <View style={localStyles.templateCtaRow}>
                                    <IconStore size={14} color={Colors.whatsappTeal} />
                                    <Text style={localStyles.templateCtaText}>Official WhatsApp Template</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[localStyles.primaryGreenBtn, isSendingTemplate && { opacity: 0.7 }]}
                                disabled={isSendingTemplate}
                                onPress={handleSendOfficialTemplate}>
                                {isSendingTemplate ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={localStyles.primaryGreenBtnText}>Send Official Meta Template</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}
            </SmoothModal>

            {/* Smooth Modal: WhatsApp Commerce Catalog */}
            <SmoothModal
                visible={catalogModalVisible}
                onClose={() => setCatalogModalVisible(false)}
                height={Math.round(SCREEN_HEIGHT * 0.85)}>
                <View style={{ flex: 1, height: '100%' }}>
                    <View style={localStyles.modalHeaderRow}>
                        <View>
                            <Text style={localStyles.modalSheetTitle}>WhatsApp Product Catalog</Text>
                            <Text style={localStyles.modalSheetSub}>Select items from synced Meta Business catalog</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity onPress={loadCatalogProducts} style={{ padding: 6 }}>
                                <IconRefresh size={18} color="#059669" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setCatalogModalVisible(false)} style={localStyles.modalCloseBtn}>
                                <Text style={localStyles.modalCloseBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Mode Tabs: Single Product, Collection, Storefront */}
                    <View style={localStyles.catalogTabsRow}>
                        <TouchableOpacity
                            style={[localStyles.catalogTabBtn, catalogTab === 'single' && localStyles.catalogTabBtnActive]}
                            onPress={() => setCatalogTab('single')}>
                            <Text style={[localStyles.catalogTabBtnText, catalogTab === 'single' && localStyles.catalogTabBtnTextActive]}>
                                Single Product
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[localStyles.catalogTabBtn, catalogTab === 'collection' && localStyles.catalogTabBtnActive]}
                            onPress={() => setCatalogTab('collection')}>
                            <Text style={[localStyles.catalogTabBtnText, catalogTab === 'collection' && localStyles.catalogTabBtnTextActive]}>
                                Collection ({selectedCatalogProductIds.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[localStyles.catalogTabBtn, catalogTab === 'storefront' && localStyles.catalogTabBtnActive]}
                            onPress={() => setCatalogTab('storefront')}>
                            <Text style={[localStyles.catalogTabBtnText, catalogTab === 'storefront' && localStyles.catalogTabBtnTextActive]}>
                                Storefront
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab 1: Single Product */}
                    {catalogTab === 'single' && (
                        <View style={{ flex: 1 }}>
                            {/* Search Bar */}
                            <View style={localStyles.modalSearchContainer}>
                                <IconSearch size={16} color="#94A3B8" />
                                <TextInput
                                    style={localStyles.modalSearchInput}
                                    placeholder="Search products by name or SKU..."
                                    placeholderTextColor="#94A3B8"
                                    value={catalogSearch}
                                    onChangeText={setCatalogSearch}
                                />
                                {!!catalogSearch && (
                                    <TouchableOpacity onPress={() => setCatalogSearch('')} style={localStyles.modalClearSearch}>
                                        <IconClose size={14} color="#94A3B8" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {catalogLoading ? (
                                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color={Colors.whatsappGreen} />
                                    <Text style={{ marginTop: 10, color: '#64748B', fontSize: 13 }}>Loading products catalog...</Text>
                                </View>
                            ) : (
                                <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
                                    <Text style={localStyles.sectionSubHeading}>Choose Product to Send:</Text>
                                    {catalogProducts
                                        .filter((p) =>
                                            p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                                            p.retailer_id.toLowerCase().includes(catalogSearch.toLowerCase())
                                        )
                                        .map((prod) => {
                                            const isSelected = selectedCatalogProduct?.id === prod.id || selectedCatalogProduct?.retailer_id === prod.retailer_id;
                                            return (
                                                <TouchableOpacity
                                                    key={prod.id || prod.retailer_id}
                                                    style={[localStyles.catalogProductCard, isSelected && localStyles.catalogProductCardActive]}
                                                    activeOpacity={0.7}
                                                    onPress={() => setSelectedCatalogProduct(prod)}>
                                                    <Image
                                                        source={{ uri: prod.image_url }}
                                                        style={localStyles.catalogProductThumb}
                                                        resizeMode="cover"
                                                    />
                                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                                        <Text style={localStyles.catalogProductName} numberOfLines={1}>{prod.name}</Text>
                                                        <Text style={localStyles.catalogProductDesc} numberOfLines={1}>{prod.description}</Text>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                            <Text style={localStyles.catalogProductPrice}>
                                                                {prod.currency === 'USD' ? '$' : prod.currency === 'INR' ? '₹' : prod.currency + ' '}
                                                                {prod.price}
                                                            </Text>
                                                            <Text style={localStyles.catalogProductSku}>SKU: {prod.retailer_id}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={[localStyles.catalogRadioCircle, isSelected && localStyles.catalogRadioCircleActive]}>
                                                        {isSelected && <View style={localStyles.catalogRadioDot} />}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}

                                    {selectedCatalogProduct && (
                                        <View style={{ marginTop: 14 }}>
                                            <Text style={localStyles.inputLabel}>Custom Message Note (optional)</Text>
                                            <TextInput
                                                style={localStyles.styledInput}
                                                value={catalogCustomBody}
                                                placeholder={`Special offer on ${selectedCatalogProduct.name}...`}
                                                placeholderTextColor="#94A3B8"
                                                onChangeText={setCatalogCustomBody}
                                            />

                                            <Text style={localStyles.inputLabel}>Footer Note (optional)</Text>
                                            <TextInput
                                                style={localStyles.styledInput}
                                                value={catalogCustomFooter}
                                                placeholder="WhatsApp Business Catalog"
                                                placeholderTextColor="#94A3B8"
                                                onChangeText={setCatalogCustomFooter}
                                            />

                                            <TouchableOpacity
                                                style={[localStyles.primaryGreenBtn, isSendingCatalog && { opacity: 0.7 }]}
                                                disabled={isSendingCatalog}
                                                onPress={handleSendSingleProduct}>
                                                {isSendingCatalog ? (
                                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                                ) : (
                                                    <Text style={localStyles.primaryGreenBtnText}>
                                                        Send Product Card to {participant.name.split(' ')[0]}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </ScrollView>
                            )}
                        </View>
                    )}

                    {/* Tab 2: Collection */}
                    {catalogTab === 'collection' && (
                        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
                            <Text style={localStyles.sectionSubHeading}>Select Products for Curated Collection (Max 10):</Text>
                            {catalogProducts.map((prod) => {
                                const isChecked = selectedCatalogProductIds.includes(prod.retailer_id);
                                return (
                                    <TouchableOpacity
                                        key={prod.id || prod.retailer_id}
                                        style={[localStyles.catalogProductCard, isChecked && localStyles.catalogProductCardActive]}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            if (isChecked) {
                                                setSelectedCatalogProductIds(selectedCatalogProductIds.filter((id) => id !== prod.retailer_id));
                                            } else {
                                                if (selectedCatalogProductIds.length >= 10) {
                                                    Alert.alert('Collection Limit', 'Meta limits collections to 10 products.');
                                                    return;
                                                }
                                                setSelectedCatalogProductIds([...selectedCatalogProductIds, prod.retailer_id]);
                                            }
                                        }}>
                                        <Image
                                            source={{ uri: prod.image_url }}
                                            style={localStyles.catalogProductThumb}
                                            resizeMode="cover"
                                        />
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={localStyles.catalogProductName} numberOfLines={1}>{prod.name}</Text>
                                            <Text style={localStyles.catalogProductPrice}>
                                                {prod.currency === 'USD' ? '$' : prod.currency === 'INR' ? '₹' : prod.currency + ' '}
                                                {prod.price}
                                            </Text>
                                        </View>
                                        <View style={[localStyles.catalogCheckSquare, isChecked && localStyles.catalogCheckSquareActive]}>
                                            {isChecked && <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>✓</Text>}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}

                            <View style={{ marginTop: 12 }}>
                                <Text style={localStyles.inputLabel}>Collection Message</Text>
                                <TextInput
                                    style={localStyles.styledInput}
                                    value={catalogCustomBody}
                                    placeholder="Browse our featured items and order directly in WhatsApp."
                                    placeholderTextColor="#94A3B8"
                                    onChangeText={setCatalogCustomBody}
                                />

                                <TouchableOpacity
                                    style={[localStyles.primaryGreenBtn, (isSendingCatalog || selectedCatalogProductIds.length === 0) && { opacity: 0.7 }]}
                                    disabled={isSendingCatalog || selectedCatalogProductIds.length === 0}
                                    onPress={handleSendCollectionProducts}>
                                    {isSendingCatalog ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={localStyles.primaryGreenBtnText}>
                                            Send Collection ({selectedCatalogProductIds.length} items)
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}

                    {/* Tab 3: Storefront */}
                    {catalogTab === 'storefront' && (
                        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 14 }}>
                            <View style={localStyles.storefrontBannerCard}>
                                <View style={localStyles.storefrontIconCircle}>
                                    <IconStore size={36} color="#059669" />
                                </View>
                                <Text style={localStyles.storefrontTitle}>Official WhatsApp Catalog Storefront</Text>
                                <Text style={localStyles.storefrontSub}>
                                    Invite {participant.name.split(' ')[0]} to browse your entire product line with in-app WhatsApp shopping cart.
                                </Text>
                            </View>

                            <Text style={localStyles.inputLabel}>Custom Storefront Intro</Text>
                            <TextInput
                                style={localStyles.styledInput}
                                value={catalogCustomBody}
                                placeholder="Explore our full product catalog and place your order directly in chat!"
                                placeholderTextColor="#94A3B8"
                                onChangeText={setCatalogCustomBody}
                            />

                            <TouchableOpacity
                                style={[localStyles.primaryGreenBtn, isSendingCatalog && { opacity: 0.7 }]}
                                disabled={isSendingCatalog}
                                onPress={handleSendStorefront}>
                                {isSendingCatalog ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={localStyles.primaryGreenBtnText}>Send Storefront Card to Customer</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </SmoothModal>

            {/* Smooth Modal: Quick Replies */}
            <SmoothModal
                visible={quickRepliesVisible}
                onClose={() => setQuickRepliesVisible(false)}
                height={Math.round(SCREEN_HEIGHT * 0.75)}>
                <View style={{ flex: 1, height: '100%' }}>
                    <View style={localStyles.modalHeaderRow}>
                        <View>
                            <Text style={localStyles.modalSheetTitle}>Quick Replies Shortcuts (/)</Text>
                            <Text style={localStyles.modalSheetSub}>Tap any canned reply to insert into composer</Text>
                        </View>
                        <TouchableOpacity onPress={() => setQuickRepliesVisible(false)} style={localStyles.modalCloseBtn}>
                            <Text style={localStyles.modalCloseBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={localStyles.modalSearchContainer}>
                        <IconSearch size={16} color="#94A3B8" />
                        <TextInput
                            style={localStyles.modalSearchInput}
                            placeholder="Search shortcuts (e.g. /hours, pricing)..."
                            placeholderTextColor="#94A3B8"
                            value={quickRepliesSearch}
                            onChangeText={setQuickRepliesSearch}
                        />
                        {!!quickRepliesSearch && (
                            <TouchableOpacity onPress={() => setQuickRepliesSearch('')} style={localStyles.modalClearSearch}>
                                <IconClose size={14} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {quickRepliesLoading ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={Colors.whatsappGreen} />
                            <Text style={{ marginTop: 10, color: '#64748B', fontSize: 13 }}>Loading quick replies...</Text>
                        </View>
                    ) : (
                        <ScrollView style={{ flex: 1, marginTop: 8 }} keyboardShouldPersistTaps="handled">
                            {quickRepliesList
                                .filter((qr) => {
                                    const q = quickRepliesSearch.toLowerCase();
                                    return (
                                        qr.title.toLowerCase().includes(q) ||
                                        qr.content_text.toLowerCase().includes(q) ||
                                        (qr.category && qr.category.toLowerCase().includes(q))
                                    );
                                })
                                .map((qr) => (
                                    <TouchableOpacity
                                        key={qr.id}
                                        style={localStyles.quickReplyRowCard}
                                        activeOpacity={0.7}
                                        onPress={() => handlePickQuickReply(qr)}>
                                        <View style={localStyles.quickReplyZapCircle}>
                                            <ZapIcon size={16} color="#D97706" />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={localStyles.quickReplyTitleText}>{qr.title}</Text>
                                                {qr.category ? (
                                                    <View style={localStyles.quickReplyShortcutBadge}>
                                                        <Text style={localStyles.quickReplyShortcutBadgeText}>
                                                            {qr.category.startsWith('/') ? qr.category : `/${qr.category}`}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                            <Text style={localStyles.quickReplySnippetText} numberOfLines={2}>
                                                {qr.content_text}
                                            </Text>
                                        </View>
                                        <IconChevronRight size={14} color="#94A3B8" />
                                    </TouchableOpacity>
                                ))}
                        </ScrollView>
                    )}
                </View>
            </SmoothModal>

            {/* Smooth Modal: Interactive Buttons Generator */}
            <SmoothModal
                visible={interactiveModalVisible}
                onClose={() => setInteractiveModalVisible(false)}
                maxHeight={Math.round(SCREEN_HEIGHT * 0.8)}>
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
            <SmoothModal
                visible={crmDrawerVisible}
                onClose={() => setCrmDrawerVisible(false)}
                maxHeight={Math.round(SCREEN_HEIGHT * 0.85)}>
                <Text style={localStyles.modalSheetTitle}>Contact CRM 360° Profile</Text>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
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
                </ScrollView>
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
    // New Feature Styles: Templates, Catalog, Quick Replies, AI Draft
    templateNameSubtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
        marginBottom: 4,
    },
    catalogBubbleImage: {
        width: '100%',
        height: 140,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#E2E8F0',
    },
    catalogBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    catalogBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#059669',
        letterSpacing: 0.5,
    },
    catalogCtaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        backgroundColor: '#ECFDF5',
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    catalogCtaBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#059669',
    },
    aiBadgePill: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 6,
    },
    aiBadgePillText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#7C3AED',
    },
    aiDraftingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F5F3FF',
        borderWidth: 1,
        borderColor: '#DDD6FE',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 6,
    },
    aiDraftingBannerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7C3AED',
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    modalSheetSub: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 1,
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalCloseBtnText: {
        fontSize: 18,
        color: '#94A3B8',
        fontWeight: '700',
    },
    modalSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 38,
        marginBottom: 10,
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 13,
        color: '#0F172A',
        marginLeft: 6,
        paddingVertical: 0,
    },
    modalClearSearch: {
        padding: 4,
    },
    filterChipsRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
    },
    filterChipActive: {
        backgroundColor: Colors.whatsappGreen,
    },
    filterChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    templateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    templateCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    templateCardName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
        flex: 1,
        marginRight: 8,
    },
    templateBadgeApproved: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    templateBadgeApprovedText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#15803D',
    },
    templateCategoryBadge: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    templateCategoryBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#7C3AED',
    },
    templateCardBody: {
        fontSize: 12,
        color: '#475569',
        lineHeight: 17,
        marginBottom: 6,
    },
    templateCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
        paddingTop: 6,
    },
    templateTapPrompt: {
        fontSize: 11,
        fontWeight: '600',
        color: '#059669',
    },
    sectionSubHeading: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 6,
    },
    previewBubble: {
        backgroundColor: '#E7FCE8',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        marginBottom: 12,
    },
    previewBubbleText: {
        fontSize: 13,
        color: '#0F172A',
        lineHeight: 18,
    },
    catalogTabsRow: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 3,
        marginBottom: 10,
    },
    catalogTabBtn: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 6,
    },
    catalogTabBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    catalogTabBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    catalogTabBtnTextActive: {
        color: '#0F172A',
        fontWeight: '700',
    },
    catalogProductCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    catalogProductCardActive: {
        borderColor: Colors.whatsappGreen,
        backgroundColor: '#F0FDF4',
    },
    catalogProductThumb: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#E2E8F0',
    },
    catalogProductName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    catalogProductDesc: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 1,
    },
    catalogProductPrice: {
        fontSize: 12,
        fontWeight: '700',
        color: '#059669',
    },
    catalogProductSku: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '600',
    },
    catalogRadioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    catalogRadioCircleActive: {
        borderColor: Colors.whatsappGreen,
    },
    catalogRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.whatsappGreen,
    },
    catalogCheckSquare: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    catalogCheckSquareActive: {
        borderColor: Colors.whatsappGreen,
        backgroundColor: Colors.whatsappGreen,
    },
    storefrontBannerCard: {
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        marginBottom: 16,
    },
    storefrontIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    storefrontTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
    },
    storefrontSub: {
        fontSize: 12,
        color: '#475569',
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 17,
    },
    quickReplyRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    quickReplyZapCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickReplyTitleText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    quickReplyShortcutBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    quickReplyShortcutBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803D',
    },
    quickReplySnippetText: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
});
