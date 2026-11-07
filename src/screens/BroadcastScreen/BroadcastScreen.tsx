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
    TextInput,
    Alert,
    Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { PaperPlaneIcon } from '../../components/PaperPlaneIcon';
import { BrandLogo } from '../../components/BrandLogo';
import { AppHeader } from '../../components/AppHeader';
import { SmoothModal } from '../../components/SmoothModal';
import { IconCheck } from '../../components/AppIcons';
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

    // 4-Step Broadcast Wizard State (Module 2.6.2)
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
    const [campaignName, setCampaignName] = useState('');
    const [campaignGoal, setCampaignGoal] = useState<'marketing' | 'utility'>('marketing');
    const [templateName, setTemplateName] = useState('welcome_offer');
    const [templateVar1, setTemplateVar1] = useState('Valued Customer');
    const [templateVar2, setTemplateVar2] = useState('DISCOUNT20');
    const [selectedSegment, setSelectedSegment] = useState<'all' | 'leads' | 'customers'>('all');
    const [recipientsCount, setRecipientsCount] = useState('1250');
    const [scheduleMode, setScheduleMode] = useState<'now' | 'scheduled'>('now');
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
                {/* Standard Unified Header: Logo on Left, Profile on Right */}
                <AppHeader
                    onPressProfile={() => onNavigateTab && onNavigateTab('More')}
                    onPressSearch={() => {}}
                    unreadCount={0}
                />

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

            {/* Smooth Modal: 4-Step Broadcast Creation Wizard (Module 2.6.2) */}
            <SmoothModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} maxHeight="90%">
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.select({ ios: 20, android: 40 })}
                    keyboardShouldPersistTaps="handled"
                    enableAutomaticScroll={true}
                    showsVerticalScrollIndicator={false}>
                    {/* Wizard Step Progress Tracker */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    {[
                        { step: 1, label: 'Template' },
                        { step: 2, label: 'Audience' },
                        { step: 3, label: 'Personalize' },
                        { step: 4, label: 'Launch' },
                    ].map((s) => (
                        <View key={s.step} style={{ alignItems: 'center', flex: 1 }}>
                            <View
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: wizardStep >= s.step ? Colors.whatsappGreen : '#F1F5F9',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 4,
                                }}>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '700',
                                        color: wizardStep >= s.step ? '#FFFFFF' : '#64748B',
                                    }}>
                                    {s.step}
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontWeight: wizardStep === s.step ? '700' : '500',
                                    color: wizardStep === s.step ? '#0F172A' : '#94A3B8',
                                }}>
                                {s.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Step 1: Template Selection */}
                {wizardStep === 1 && (
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>
                            Step 1: Select Meta Approved Template
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
                            Mass broadcasts must use pre-approved Meta message templates.
                        </Text>

                        {[
                            { id: 'welcome_offer', cat: 'MARKETING', title: 'Special Festive Welcome Offer', body: 'Hi {{1}}, enjoy exclusive 20% off with promo code {{2}} on your next order!' },
                            { id: 'order_status_update', cat: 'UTILITY', title: 'Order Tracking & Shipping Status', body: 'Hello {{1}}, your order #{{2}} has been dispatched and is out for delivery.' },
                            { id: 'reengage_vip', cat: 'MARKETING', title: 'VIP Customer Re-engagement', body: 'Dear {{1}}, we have reserved your priority consultation session for {{2}}.' },
                        ].map((tpl) => (
                            <TouchableOpacity
                                key={tpl.id}
                                style={{
                                    backgroundColor: templateName === tpl.id ? '#ECFDF5' : '#F8FAFC',
                                    borderWidth: 1.5,
                                    borderColor: templateName === tpl.id ? Colors.whatsappGreen : '#E2E8F0',
                                    borderRadius: 10,
                                    padding: 12,
                                    marginBottom: 10,
                                }}
                                onPress={() => setTemplateName(tpl.id)}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{tpl.title}</Text>
                                    <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#166534' }}>{tpl.cat}</Text>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 11, color: '#475569', lineHeight: 16 }}>{tpl.body}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.whatsappGreen,
                                borderRadius: 10,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 6,
                            }}
                            onPress={() => setWizardStep(2)}>
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Next: Select Audience →</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2: Audience Definition */}
                {wizardStep === 2 && (
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>
                            Step 2: Define Audience Segment
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
                            Filter by CRM contact tags or broadcast to all active customers.
                        </Text>

                        {[
                            { key: 'all', title: 'All CRM Directory Contacts', count: '1,250 recipients' },
                            { key: 'leads', title: 'New Leads & Inquiries', count: '420 recipients' },
                            { key: 'customers', title: 'VIP Repeat Customers', count: '140 recipients' },
                        ].map((seg) => (
                            <TouchableOpacity
                                key={seg.key}
                                style={{
                                    backgroundColor: selectedSegment === seg.key ? '#ECFDF5' : '#F8FAFC',
                                    borderWidth: 1.5,
                                    borderColor: selectedSegment === seg.key ? Colors.whatsappGreen : '#E2E8F0',
                                    borderRadius: 10,
                                    padding: 14,
                                    marginBottom: 10,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                                onPress={() => {
                                    setSelectedSegment(seg.key as any);
                                    setRecipientsCount(seg.key === 'all' ? '1250' : seg.key === 'leads' ? '420' : '140');
                                }}>
                                <View>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{seg.title}</Text>
                                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{seg.count}</Text>
                                </View>
                                <View
                                    style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 9,
                                        borderWidth: 2,
                                        borderColor: selectedSegment === seg.key ? Colors.whatsappGreen : '#CBD5E1',
                                        backgroundColor: selectedSegment === seg.key ? Colors.whatsappGreen : 'transparent',
                                    }}
                                />
                            </TouchableOpacity>
                        ))}

                        <View style={{ backgroundColor: '#F0FDF4', borderRadius: 8, padding: 10, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <IconCheck size={14} color="#166534" />
                            <Text style={{ fontSize: 11, color: '#166534', fontWeight: '600', flex: 1 }}>
                                Safe Broadcast: Automatically skips opted-out contacts and numbers without WhatsApp.
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => setWizardStep(1)}>
                                <Text style={{ color: '#475569', fontWeight: '600', fontSize: 13 }}>← Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: Colors.whatsappGreen, alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => setWizardStep(3)}>
                                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Next: Personalize →</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Step 3: Personalization Mapping */}
                {wizardStep === 3 && (
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>
                            Step 3: Personalization Mapping
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                            Define variable placeholders and campaign identifier.
                        </Text>

                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 4 }}>Campaign Name *</Text>
                        <TextInput
                            style={{ height: 40, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, fontSize: 13, color: '#0F172A', backgroundColor: '#F8FAFC' }}
                            placeholder="e.g. November Flash Sale 2026"
                            value={campaignName}
                            onChangeText={setCampaignName}
                        />

                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 4 }}>Placeholder {'{{1}}'} (Customer Name)</Text>
                        <TextInput
                            style={{ height: 40, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, fontSize: 13, color: '#0F172A', backgroundColor: '#F8FAFC' }}
                            value={templateVar1}
                            onChangeText={setTemplateVar1}
                        />

                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 4 }}>Placeholder {'{{2}}'} (Promo Code / Value)</Text>
                        <TextInput
                            style={{ height: 40, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, marginBottom: 14, fontSize: 13, color: '#0F172A', backgroundColor: '#F8FAFC' }}
                            value={templateVar2}
                            onChangeText={setTemplateVar2}
                        />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => setWizardStep(2)}>
                                <Text style={{ color: '#475569', fontWeight: '600', fontSize: 13 }}>← Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: Colors.whatsappGreen, alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => {
                                    if (!campaignName.trim()) {
                                        Alert.alert('Required', 'Please enter a campaign name');
                                        return;
                                    }
                                    setWizardStep(4);
                                }}>
                                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Next: Review & Schedule →</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Step 4: Review, Throttling & Launch */}
                {wizardStep === 4 && (
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>
                            Step 4: Review & Launch Campaign
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                            Meta safe throttling is enforced to protect your WhatsApp number quality score.
                        </Text>

                        {/* Summary Card */}
                        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>Campaign:</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A' }}>{campaignName}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>Template:</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A' }}>{templateName}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>Recipients:</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#166534' }}>{recipientsCount} contacts</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>Safe Throttling Rate:</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7' }}>20 messages / second</Text>
                            </View>
                        </View>

                        {/* Schedule Timing Choice */}
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6 }}>Dispatch Timing</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: scheduleMode === 'now' ? Colors.whatsappGreen : '#CBD5E1',
                                    backgroundColor: scheduleMode === 'now' ? '#ECFDF5' : '#FFFFFF',
                                    alignItems: 'center',
                                }}
                                onPress={() => setScheduleMode('now')}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: scheduleMode === 'now' ? '#166534' : '#475569' }}>
                                    Send Immediately
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: scheduleMode === 'scheduled' ? Colors.whatsappGreen : '#CBD5E1',
                                    backgroundColor: scheduleMode === 'scheduled' ? '#ECFDF5' : '#FFFFFF',
                                    alignItems: 'center',
                                }}
                                onPress={() => setScheduleMode('scheduled')}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: scheduleMode === 'scheduled' ? '#166534' : '#475569' }}>
                                    Schedule for Later
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => setWizardStep(3)}>
                                <Text style={{ color: '#475569', fontWeight: '600', fontSize: 13 }}>← Back</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ flex: 1.4, height: 44, borderRadius: 10, backgroundColor: Colors.whatsappGreen, alignItems: 'center', justifyContent: 'center' }}
                                disabled={isCreating}
                                onPress={handleCreateBroadcast}>
                                {isCreating ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                                        Launch Official Broadcast
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                </KeyboardAwareScrollView>
            </SmoothModal>
        </SafeAreaView>
    );
};