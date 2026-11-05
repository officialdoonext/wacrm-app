import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { PaperPlaneIcon } from '../../components/PaperPlaneIcon';
import { ArrowRightIcon } from '../../components/WelcomeIcons';
import {
    SearchIcon,
    BellIcon,
    ChevronRightIcon,
    TabInboxIcon,
    TabAutomationIcon,
    TabContactsIcon,
    TabMoreIcon,
} from '../../components/DashboardIcons';
import { MoreDotsIcon, ClockTickIcon } from '../../components/ChatIcons';
import {
    PlaySentIcon,
    DeliveredCheckIcon,
    ReplyArrowIcon,
} from '../../components/AutomationIcons';
import {
    MegaphoneIcon,
    MetricPlaneIcon,
    MetricCheckCircleIcon,
    MetricReplyIcon,
    MetricUsersIcon,
    SpecialOfferIcon,
    DiscountTagIcon,
    BirthdayCakeIcon,
    FailedCrossCircleIcon,
} from '../../components/BroadcastIcons';
import { BroadcastOrbitGraphic } from '../../components/BroadcastOrbitGraphic';
import { crmService, DynamicBroadcast } from '../../services/crmService';
import { authService, UserProfile } from '../../services/supabase';

// Safe SVG Vector for Party Popper
const PartyPopperIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
            d="M2 22l6.5-2L19 9.5l-6.5-6.5L2 13.5V22z"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="1.5"
        />
        <Path d="M12.5 3l3 3M10 5.5l3 3" stroke="#FFFFFF" strokeWidth="1.5" />
        <Path d="M19 4l2-2M15 1l1 2M22 8l-2 1M18 11l3 2" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

interface BroadcastScreenProps {
    onNavigateTab?: (tab: 'Inbox' | 'Automation' | 'Contacts' | 'Broadcast' | 'More') => void;
}

export const BroadcastScreen: React.FC<BroadcastScreenProps> = ({ onNavigateTab }) => {
    const [broadcasts, setBroadcasts] = useState<DynamicBroadcast[]>([]);
    const [activeChip, setActiveChip] = useState<string>('All Campaigns');
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Create Broadcast Modal State
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [campaignName, setCampaignName] = useState('');
    const [templateName, setTemplateName] = useState('welcome_offer');
    const [recipientsCount, setRecipientsCount] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        authService.getProfile().then(setProfile);
    }, []);

    const loadBroadcasts = useCallback(async (force = false) => {
        if (!force && broadcasts.length === 0) setIsLoading(true);
        try {
            const data = await crmService.fetchBroadcasts(force);
            setBroadcasts(data);
        } catch (err) {
            console.warn('Error fetching broadcasts:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [broadcasts.length]);

    useEffect(() => {
        loadBroadcasts();
    }, [loadBroadcasts]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadBroadcasts(true);
    };

    // Calculate real dynamic metric totals from actual data
    const totalSent = broadcasts.reduce((sum, b) => sum + (b.sent_count || 0), 0);
    const totalDelivered = broadcasts.reduce((sum, b) => sum + (b.delivered_count || 0), 0);
    const totalReplied = broadcasts.reduce((sum, b) => sum + (b.replied_count || 0), 0);
    const campaignsCount = broadcasts.length;
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
    const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

    // Filter dynamic campaigns
    const filteredCampaigns = broadcasts.filter((item) => {
        if (activeChip === 'All Campaigns') return true;
        return item.status === activeChip;
    });

    const handleCreateBroadcast = async () => {
        if (!campaignName.trim()) {
            Alert.alert('Required', 'Please enter a campaign name');
            return;
        }

        setIsCreating(true);
        try {
            const count = parseInt(recipientsCount, 10) || 0;
            const newBroadcast = await crmService.createBroadcastCampaign({
                name: campaignName.trim(),
                templateName: templateName.trim(),
                recipientsCount: count,
            });

            setBroadcasts((prev) => [newBroadcast, ...prev]);
            setIsCreating(false);
            setCreateModalVisible(false);
            setCampaignName('');
            setRecipientsCount('');

            Alert.alert('Success', `Broadcast "${newBroadcast.title}" launched successfully!`);
        } catch (err: any) {
            setIsCreating(false);
            Alert.alert('Error', err?.message || 'Failed to create broadcast');
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
                            <View style={styles.notificationBadgeDot} />
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
                                            justifyContent: 'center',
                                            alignItems: 'center',
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

                {/* Scrollable Main Area */}
                <View style={styles.listWrapper}>
                    {isLoading && broadcasts.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={Colors.primaryGreen} />
                            <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13 }}>
                                Loading broadcasts...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredCampaigns}
                            keyExtractor={(item) => item.id}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            ListHeaderComponent={
                                <>
                                    {/* Hero Reach More Customers Banner */}
                                    <View style={styles.heroBanner}>
                                        <View style={styles.heroContentLeft}>
                                            <Text style={styles.heroTitle}>
                                                Reach More Customers{'\n'}with Broadcast
                                            </Text>
                                            <Text style={styles.heroSubtitle}>
                                                Send bulk WhatsApp messages to your audience using approved Meta templates.
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.createBtn}
                                                activeOpacity={0.85}
                                                onPress={() => setCreateModalVisible(true)}>
                                                <Text style={styles.createBtnText}>Create Broadcast</Text>
                                                <ArrowRightIcon size={14} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.heroNetworkArea}>
                                            <BroadcastOrbitGraphic size={145} />
                                        </View>
                                    </View>

                                    {/* 4 Clean Dynamic Metric Cards */}
                                    <View style={styles.statsRow}>
                                        {/* Total Sent */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                                <MetricPlaneIcon size={14} color="#10B981" />
                                            </View>
                                            <Text style={styles.statNumber} numberOfLines={1}>
                                                {totalSent.toLocaleString()}
                                            </Text>
                                            <Text style={styles.statLabel} numberOfLines={1}>
                                                Total Sent
                                            </Text>
                                        </View>

                                        {/* Delivered */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                                <MetricCheckCircleIcon size={14} color="#10B981" />
                                            </View>
                                            <Text style={styles.statNumber} numberOfLines={1}>
                                                {totalDelivered.toLocaleString()}
                                            </Text>
                                            <Text style={styles.statLabel} numberOfLines={1}>
                                                Delivered {deliveryRate}%
                                            </Text>
                                        </View>

                                        {/* Replied */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconBox, { backgroundColor: '#E0E7FF' }]}>
                                                <MetricReplyIcon size={14} color="#3B82F6" />
                                            </View>
                                            <Text style={styles.statNumber} numberOfLines={1}>
                                                {totalReplied.toLocaleString()}
                                            </Text>
                                            <Text style={styles.statLabel} numberOfLines={1}>
                                                Replied {replyRate}%
                                            </Text>
                                        </View>

                                        {/* Campaigns */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconBox, { backgroundColor: '#EDE9FE' }]}>
                                                <MetricUsersIcon size={14} color="#8B5CF6" />
                                            </View>
                                            <Text style={styles.statNumber} numberOfLines={1}>
                                                {campaignsCount}
                                            </Text>
                                            <Text style={styles.statLabel} numberOfLines={1}>
                                                Campaigns
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Filter Chips */}
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.chipsScroll}>
                                        {['All Campaigns', 'Draft', 'Scheduled', 'Sent', 'Failed'].map((chip) => {
                                            const isSelected = activeChip === chip;
                                            return (
                                                <TouchableOpacity
                                                    key={chip}
                                                    style={[styles.chipItem, isSelected && styles.chipItemActive]}
                                                    onPress={() => setActiveChip(chip)}
                                                    activeOpacity={0.7}>
                                                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                                        {chip}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </>
                            }
                            ListEmptyComponent={
                                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
                                    <MegaphoneIcon size={36} color="#94A3B8" />
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12, marginBottom: 4 }}>
                                        No Broadcast Campaigns
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                                        Create a campaign to send WhatsApp messages to your contacts.
                                    </Text>
                                </View>
                            }
                            renderItem={({ item }) => {
                                const isSent = item.status === 'Sent';
                                const isScheduled = item.status === 'Scheduled';
                                const isFailed = item.status === 'Failed';

                                const statusBg = isSent
                                    ? '#DCFCE7'
                                    : isScheduled
                                    ? '#E0E7FF'
                                    : isFailed
                                    ? '#FEE2E2'
                                    : '#F1F5F9';

                                const statusColor = isSent
                                    ? '#166534'
                                    : isScheduled
                                    ? '#3730A3'
                                    : isFailed
                                    ? '#991B1B'
                                    : '#64748B';

                                return (
                                    <TouchableOpacity style={styles.campaignCard} activeOpacity={0.85}>
                                        {/* Top Row: Icon Box, Title, Status, Date, More */}
                                        <View style={styles.cardTopRow}>
                                            <View
                                                style={[
                                                    styles.cardIconBox,
                                                    { backgroundColor: isSent ? '#10B981' : isScheduled ? '#3B82F6' : '#F59E0B' },
                                                ]}>
                                                <SpecialOfferIcon size={22} color="#FFFFFF" />
                                            </View>

                                            <View style={styles.cardHeaderInfo}>
                                                <View style={styles.titleBadgeRow}>
                                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                                                        <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                                                            {item.status}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <Text style={styles.cardDescription}>
                                                    Meta Template: {item.template_name}
                                                </Text>
                                                <View style={styles.cardDescriptionRow}>
                                                    <Text style={styles.cardDescription}>
                                                        Recipients: {item.total_recipients.toLocaleString()}
                                                    </Text>
                                                    {isSent && (
                                                        <View style={styles.inlineEmojiSvg}>
                                                            <PartyPopperIcon />
                                                        </View>
                                                    )}
                                                </View>
                                            </View>

                                            <View style={styles.cardMetaRight}>
                                                <TouchableOpacity activeOpacity={0.7}>
                                                    <MoreDotsIcon size={16} color="#94A3B8" />
                                                </TouchableOpacity>
                                                <Text style={styles.dateText}>{item.date}</Text>
                                            </View>
                                        </View>

                                        {/* Bottom Metrics Bar */}
                                        <View style={styles.metricsRow}>
                                            <View style={styles.metricItem}>
                                                <PlaySentIcon size={12} color="#10B981" />
                                                <View style={styles.metricTextWrap}>
                                                    <Text style={styles.metricValue}>
                                                        {item.sent_count.toLocaleString()}
                                                    </Text>
                                                    <Text style={styles.metricLabel}>Sent</Text>
                                                </View>
                                            </View>

                                            <View style={styles.metricItem}>
                                                {isFailed ? (
                                                    <FailedCrossCircleIcon size={12} color="#EF4444" />
                                                ) : isScheduled ? (
                                                    <ClockTickIcon size={12} color="#D97706" />
                                                ) : (
                                                    <DeliveredCheckIcon size={12} color="#10B981" />
                                                )}
                                                <View style={styles.metricTextWrap}>
                                                    <Text style={styles.metricValue}>
                                                        {item.delivered_count.toLocaleString()}
                                                    </Text>
                                                    <Text style={styles.metricLabel}>Delivered</Text>
                                                </View>
                                            </View>

                                            {item.replied_count > 0 && (
                                                <View style={styles.metricItem}>
                                                    <ReplyArrowIcon size={12} color="#64748B" />
                                                    <View style={styles.metricTextWrap}>
                                                        <Text style={styles.metricValue}>
                                                            {item.replied_count.toLocaleString()}
                                                        </Text>
                                                        <Text style={styles.metricLabel}>Replied</Text>
                                                    </View>
                                                </View>
                                            )}

                                            <View style={styles.chevronWrapper}>
                                                <ChevronRightIcon size={14} color="#94A3B8" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}
                </View>

                {/* Circular Floating Action Button (+) */}
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.85}
                    onPress={() => setCreateModalVisible(true)}>
                    <Text style={styles.fabPlusIcon}>+</Text>
                </TouchableOpacity>

                {/* Bottom Tab Bar with Broadcast Tab */}
                <View style={styles.bottomTabBar}>
                    <TouchableOpacity
                        style={styles.tabItem}
                        activeOpacity={0.7}
                        onPress={() => onNavigateTab && onNavigateTab('Inbox')}>
                        <TabInboxIcon size={22} color="#94A3B8" />
                        <View style={styles.tabIndicatorDot} />
                        <Text style={styles.tabLabel}>Inbox</Text>
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
                        <MegaphoneIcon size={22} color={Colors.primaryGreen} />
                        <Text style={[styles.tabLabel, styles.tabLabelActive]}>Broadcast</Text>
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

            {/* Modal: Create Broadcast */}
            <Modal
                visible={createModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCreateModalVisible(false)}>
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
                            Create WhatsApp Broadcast
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 18 }}>
                            Send pre-approved Meta message templates to your audience.
                        </Text>

                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                            Campaign Name *
                        </Text>
                        <TextInput
                            style={{
                                height: 42,
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                marginBottom: 12,
                                fontSize: 14,
                                color: '#1E293B',
                            }}
                            placeholder="e.g. Summer Special 2026"
                            placeholderTextColor="#94A3B8"
                            value={campaignName}
                            onChangeText={setCampaignName}
                        />

                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                            Meta Approved Template
                        </Text>
                        <TextInput
                            style={{
                                height: 42,
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                marginBottom: 12,
                                fontSize: 14,
                                color: '#1E293B',
                            }}
                            placeholder="e.g. promo_festive_2026"
                            placeholderTextColor="#94A3B8"
                            value={templateName}
                            onChangeText={setTemplateName}
                        />

                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                            Estimated Recipients
                        </Text>
                        <TextInput
                            style={{
                                height: 42,
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                marginBottom: 20,
                                fontSize: 14,
                                color: '#1E293B',
                            }}
                            placeholder="e.g. 100"
                            placeholderTextColor="#94A3B8"
                            keyboardType="number-pad"
                            value={recipientsCount}
                            onChangeText={setRecipientsCount}
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
                                onPress={() => setCreateModalVisible(false)}>
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
                                disabled={isCreating}
                                onPress={handleCreateBroadcast}>
                                {isCreating ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                        Launch Broadcast
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