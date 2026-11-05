import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    ActivityIndicator,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { PaperPlaneIcon } from '../../components/PaperPlaneIcon';
import {
    SearchIcon,
    FilterIcon,
    BellIcon,
    ChevronRightIcon,
    WhatsAppMiniBadge,
    TabInboxIcon,
    TabAutomationIcon,
    TabContactsIcon,
    TabMoreIcon,
} from '../../components/DashboardIcons';
import { MegaphoneIcon } from '../../components/BroadcastIcons';
import { MessageSquareVectorIcon, UsersVectorIcon } from '../../components/ChatIcons';
import { crmService, DynamicConversation } from '../../services/crmService';
import { authService, UserProfile } from '../../services/supabase';

// Vector SVG Icons for the 4 chips
const ChipAllIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="#059669">
        <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        <Rect x="7" y="10" width="10" height="2" rx="1" fill="#FFFFFF" />
    </Svg>
);

const ChipUnreadIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx="19" cy="5" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
    </Svg>
);

const ChipUserIcon = () => (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
    </Svg>
);

const ChipGroupsIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <Circle cx="9" cy="7" r="4" />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
);

export interface ChatItem {
    id: string;
    conversationId?: string;
    contactId?: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    isGroup?: boolean;
    isSoundWave?: boolean;
    tag: { label: string; bg: string; color: string };
    time: string;
    message: string;
    unreadCount?: number;
    isPinned?: boolean;
}

interface InboxScreenProps {
    onSelectChat?: (chat: ChatItem) => void;
    onNavigateTab?: (tab: 'Inbox' | 'Automation' | 'Contacts' | 'Broadcast' | 'More') => void;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({
    onSelectChat,
    onNavigateTab,
}) => {
    const [conversations, setConversations] = useState<DynamicConversation[]>([]);
    const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'My Chats' | 'Groups'>('All');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // New Chat Modal state
    const [newChatModalVisible, setNewChatModalVisible] = useState(false);
    const [newChatPhone, setNewChatPhone] = useState('');
    const [newChatName, setNewChatName] = useState('');
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    // Load user profile
    useEffect(() => {
        authService.getProfile().then(setProfile);
    }, []);

    // Load dynamic conversations from Supabase
    const loadConversations = useCallback(async (force = false) => {
        if (!force && conversations.length === 0) {
            setIsLoading(true);
        }
        try {
            const data = await crmService.fetchConversations(force);
            setConversations(data);
        } catch (err) {
            console.warn('Error loading conversations:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [conversations.length]);

    useEffect(() => {
        loadConversations();

        // Subscribe to live Supabase Realtime channel
        const unsubscribe = crmService.subscribeToLiveInbox(() => {
            crmService.fetchConversations().then(setConversations);
        });

        return () => {
            unsubscribe();
        };
    }, [loadConversations]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadConversations(true);
    };

    // Helper format timestamp
    const formatTime = (isoString?: string) => {
        if (!isoString) return 'Just now';
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

            if (diffHours < 24) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (diffHours < 48) {
                return 'Yesterday';
            } else {
                return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
            }
        } catch {
            return 'Recent';
        }
    };

    // Filter dynamic conversations
    const filteredConversations = conversations.filter((conv) => {
        const contactName = conv.contact.name || '';
        const phone = conv.contact.phone || '';
        const lastMsg = conv.last_message_text || '';
        const query = searchText.toLowerCase();

        const matchesSearch =
            contactName.toLowerCase().includes(query) ||
            phone.includes(query) ||
            lastMsg.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        if (activeTab === 'Unread') return conv.unread_count > 0;
        if (activeTab === 'My Chats') return !conv.assigned_agent_id || conv.assigned_agent_id === profile?.user_id;
        if (activeTab === 'Groups') {
            const comp = (conv.contact.company || '').toLowerCase();
            return comp.includes('group') || comp.includes('fitness') || comp.includes('studio');
        }
        return true;
    });

    const unreadCountTotal = conversations.filter((c) => c.unread_count > 0).length;

    // Start New Chat with Phone Number
    const handleStartNewChat = async () => {
        if (!newChatPhone.trim()) {
            Alert.alert('Required', 'Please enter a valid phone number');
            return;
        }

        // Normalize to E.164 phone
        let formattedPhone = newChatPhone.trim().replace(/[^\d+]/g, '');
        if (!formattedPhone.startsWith('+')) {
            if (formattedPhone.length === 10) {
                formattedPhone = `+91${formattedPhone}`;
            } else if (formattedPhone.length === 12 && formattedPhone.startsWith('91')) {
                formattedPhone = `+${formattedPhone}`;
            } else {
                formattedPhone = `+${formattedPhone}`;
            }
        }

        setIsCreatingChat(true);
        try {
            const contact = await crmService.createContact({
                name: newChatName.trim() || formattedPhone,
                phone: formattedPhone,
            });

            const conv = await crmService.getOrCreateConversationForContact(contact);
            await loadConversations(true);

            setIsCreatingChat(false);
            setNewChatModalVisible(false);
            setNewChatPhone('');
            setNewChatName('');

            if (onSelectChat) {
                onSelectChat({
                    id: conv.id,
                    conversationId: conv.id,
                    contactId: contact.id,
                    name: contact.name,
                    phone: contact.phone,
                    avatarUrl: contact.avatar_url,
                    tag: contact.tag || { label: 'New Lead', bg: '#DCFCE7', color: '#166534' },
                    time: 'Just now',
                    message: conv.last_message_text,
                    unreadCount: 0,
                });
            }
        } catch (err: any) {
            setIsCreatingChat(false);
            Alert.alert('Error', err?.message || 'Could not start chat');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Top Header */}
                <View style={styles.topHeader}>
                    <View style={styles.brandLeft}>
                        <PaperPlaneIcon size={32} color={Colors.primaryGreen} />
                        <View style={styles.brandTitles}>
                            <Text style={styles.brandTitle}>WhatsAppNext</Text>
                            <Text style={styles.brandTagline}>Automate. Engage. Grow.</Text>
                        </View>
                    </View>

                    <View style={styles.headerRightActions}>
                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                            <SearchIcon size={20} color="#334155" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                            <BellIcon size={20} color="#334155" />
                            {unreadCountTotal > 0 && <View style={styles.notificationBadgeDot} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.profileAvatarWrap}
                            activeOpacity={0.8}
                            onPress={() => onNavigateTab && onNavigateTab('More')}>
                            {profile?.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} style={styles.profileAvatar} />
                            ) : (
                                <View
                                    style={[
                                        styles.profileAvatar,
                                        {
                                            backgroundColor: '#059669',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        },
                                    ]}>
                                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                                        {profile?.full_name ? profile.full_name[0].toUpperCase() : 'A'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.onlineIndicator} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar & Filter Button */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <SearchIcon size={18} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search conversations, name or number..."
                            placeholderTextColor="#94A3B8"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.filterBtn}
                        activeOpacity={0.75}
                        onPress={handleRefresh}>
                        <FilterIcon size={18} color={Colors.primaryGreen} />
                    </TouchableOpacity>
                </View>

                {/* 4 Dynamic Chips */}
                <View style={styles.chipsContainer}>
                    {/* Chip 1: All */}
                    <TouchableOpacity
                        style={[styles.chipItem, activeTab === 'All' && styles.chipItemActive]}
                        onPress={() => setActiveTab('All')}
                        activeOpacity={0.7}>
                        <View style={styles.chipIconWrap}>
                            <ChipAllIcon />
                        </View>
                        <Text style={[styles.chipLabel, activeTab === 'All' && styles.chipLabelActive]}>
                            All
                        </Text>
                        <View style={[styles.countPill, activeTab === 'All' && styles.countPillActive]}>
                            <Text style={styles.countPillText}>{conversations.length}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Chip 2: Unread */}
                    <TouchableOpacity
                        style={[styles.chipItem, activeTab === 'Unread' && styles.chipItemActive]}
                        onPress={() => setActiveTab('Unread')}
                        activeOpacity={0.7}>
                        <View style={styles.chipIconWrap}>
                            <ChipUnreadIcon />
                        </View>
                        <Text style={[styles.chipLabel, activeTab === 'Unread' && styles.chipLabelActive]}>
                            Unread
                        </Text>
                        {unreadCountTotal > 0 && (
                            <View style={[styles.countPill, styles.countPillRed]}>
                                <Text style={styles.countPillText}>{unreadCountTotal}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Chip 3: My Chats */}
                    <TouchableOpacity
                        style={[styles.chipItem, activeTab === 'My Chats' && styles.chipItemActive]}
                        onPress={() => setActiveTab('My Chats')}
                        activeOpacity={0.7}>
                        <View style={styles.chipIconWrap}>
                            <ChipUserIcon />
                        </View>
                        <Text style={[styles.chipLabel, activeTab === 'My Chats' && styles.chipLabelActive]}>
                            My Chats
                        </Text>
                    </TouchableOpacity>

                    {/* Chip 4: Groups */}
                    <TouchableOpacity
                        style={[styles.chipItem, activeTab === 'Groups' && styles.chipItemActive]}
                        onPress={() => setActiveTab('Groups')}
                        activeOpacity={0.7}>
                        <View style={styles.chipIconWrap}>
                            <ChipGroupsIcon />
                        </View>
                        <Text style={[styles.chipLabel, activeTab === 'Groups' && styles.chipLabelActive]}>
                            Groups
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* FlatList with Dynamic Data */}
                <View style={styles.listWrapper}>
                    {isLoading && conversations.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={Colors.primaryGreen} />
                            <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13 }}>
                                Loading conversations...
                            </Text>
                        </View>
                    ) : filteredConversations.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                            <View style={{ marginBottom: 12 }}>
                                <MessageSquareVectorIcon size={40} color="#059669" />
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
                                No conversations found
                            </Text>
                            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 }}>
                                {searchText
                                    ? `No chats match "${searchText}".`
                                    : 'Start a new WhatsApp chat by tapping the button below.'}
                            </Text>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.primaryGreen,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 20,
                                }}
                                onPress={() => setNewChatModalVisible(true)}>
                                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                                    + Start New Chat
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            style={{ flex: 1 }}
                            data={filteredConversations}
                            keyExtractor={(item) => item.id}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            scrollEnabled={true}
                            bounces={true}
                            alwaysBounceVertical={true}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.chatListContainer}
                            renderItem={({ item }) => {
                                const isGroup =
                                    item.contact.company?.toLowerCase().includes('group') ||
                                    item.contact.company?.toLowerCase().includes('fitness') ||
                                    item.contact.company?.toLowerCase().includes('studio');

                                const chatItemData: ChatItem = {
                                    id: item.id,
                                    conversationId: item.id,
                                    contactId: item.contact_id,
                                    name: item.contact.name || 'Customer',
                                    phone: item.contact.phone,
                                    avatarUrl: item.contact.avatar_url,
                                    isGroup,
                                    tag: item.contact.tag || { label: 'Customer', bg: '#DCFCE7', color: '#166534' },
                                    time: formatTime(item.last_message_at),
                                    message: item.last_message_text || 'No message preview',
                                    unreadCount: item.unread_count,
                                };

                                return (
                                    <TouchableOpacity
                                        style={styles.chatItem}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            crmService.markConversationAsRead(item.id);
                                            if (onSelectChat) onSelectChat(chatItemData);
                                        }}>
                                        {/* Avatar with WhatsApp Badge */}
                                        <View style={styles.avatarContainer}>
                                            {isGroup ? (
                                                <View style={styles.groupAvatarPlaceholder}>
                                                    <UsersVectorIcon size={18} color="#059669" />
                                                </View>
                                            ) : item.contact.avatar_url ? (
                                                <Image
                                                    source={{ uri: item.contact.avatar_url }}
                                                    style={styles.avatarImage}
                                                />
                                            ) : (
                                                <View
                                                    style={[
                                                        styles.avatarImage,
                                                        {
                                                            backgroundColor: '#E0E7FF',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        },
                                                    ]}>
                                                    <Text style={{ color: '#3730A3', fontWeight: '700', fontSize: 16 }}>
                                                        {item.contact.name ? item.contact.name[0].toUpperCase() : 'C'}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={styles.waBadge}>
                                                <WhatsAppMiniBadge size={15} />
                                            </View>
                                        </View>

                                        {/* Chat Content with Inset Divider */}
                                        <View style={styles.chatContent}>
                                            <View style={styles.chatHeaderRow}>
                                                <View style={styles.nameAndTag}>
                                                    <Text style={styles.userName} numberOfLines={1}>
                                                        {item.contact.name}
                                                    </Text>
                                                    <View
                                                        style={[
                                                            styles.tagPill,
                                                            { backgroundColor: chatItemData.tag.bg },
                                                        ]}>
                                                        <Text
                                                            style={[
                                                                styles.tagText,
                                                                { color: chatItemData.tag.color },
                                                            ]}>
                                                            {chatItemData.tag.label}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.timeText}>{chatItemData.time}</Text>
                                            </View>

                                            <View style={styles.messageRow}>
                                                <Text style={styles.lastMessageText} numberOfLines={1}>
                                                    {item.last_message_text}
                                                </Text>
                                                <View style={styles.badgeAndChevron}>
                                                    {!!item.unread_count && item.unread_count > 0 && (
                                                        <View style={styles.unreadCounter}>
                                                            <Text style={styles.unreadCounterText}>
                                                                {item.unread_count}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <ChevronRightIcon size={14} />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}
                </View>

                {/* Floating Action Button (+) */}
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.85}
                    onPress={() => setNewChatModalVisible(true)}>
                    <Text style={styles.fabPlus}>+</Text>
                    <Text style={styles.fabCaret}>˅</Text>
                </TouchableOpacity>

                {/* Bottom Tab Bar */}
                <View style={styles.bottomTabBar}>
                    <TouchableOpacity
                        style={styles.tabItem}
                        activeOpacity={0.7}
                        onPress={() => onNavigateTab && onNavigateTab('Inbox')}>
                        <TabInboxIcon size={22} color={Colors.primaryGreen} />
                        <View style={styles.tabIndicatorDot} />
                        <Text style={[styles.tabLabel, styles.tabLabelActive]}>Inbox</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        activeOpacity={0.7}
                        onPress={() => onNavigateTab && onNavigateTab('Automation')}>
                        <TabAutomationIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>Automation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        activeOpacity={0.7}
                        onPress={() => onNavigateTab && onNavigateTab('Contacts')}>
                        <TabContactsIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>Contacts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        activeOpacity={0.7}
                        onPress={() => onNavigateTab && onNavigateTab('Broadcast')}>
                        <MegaphoneIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>Broadcast</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        activeOpacity={0.7}
                        onPress={() => onNavigateTab && onNavigateTab('More')}>
                        <TabMoreIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>More</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal: Start New Chat */}
            <Modal
                visible={newChatModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setNewChatModalVisible(false)}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'flex-end',
                    }}>
                    <View
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            padding: 24,
                        }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                            Start New WhatsApp Chat
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
                            Enter contact phone number with country code (e.g. +91 98765 43210).
                        </Text>

                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 }}>
                            Contact Name (Optional)
                        </Text>
                        <TextInput
                            style={{
                                height: 44,
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                marginBottom: 14,
                                fontSize: 14,
                                color: '#1E293B',
                            }}
                            placeholder="e.g. John Doe"
                            placeholderTextColor="#94A3B8"
                            value={newChatName}
                            onChangeText={setNewChatName}
                        />

                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 }}>
                            WhatsApp Phone Number *
                        </Text>
                        <TextInput
                            style={{
                                height: 44,
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                marginBottom: 20,
                                fontSize: 14,
                                color: '#1E293B',
                            }}
                            placeholder="+91 98765 43210"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                            value={newChatPhone}
                            onChangeText={setNewChatPhone}
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
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
                                onPress={() => setNewChatModalVisible(false)}>
                                <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    height: 44,
                                    borderRadius: 10,
                                    backgroundColor: Colors.primaryGreen,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                disabled={isCreatingChat}
                                onPress={handleStartNewChat}>
                                {isCreatingChat ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                        Open Chat
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};