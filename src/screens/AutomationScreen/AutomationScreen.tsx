import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    ScrollView,
    Switch,
    Platform,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { PaperPlaneIcon } from '../../components/PaperPlaneIcon';
import { BrandLogo } from '../../components/BrandLogo';
import { AppHeader } from '../../components/AppHeader';
import { SmoothModal } from '../../components/SmoothModal';
import { ArrowRightIcon } from '../../components/WelcomeIcons';
import {
    SearchIcon,
    BellIcon,
    ChevronRightIcon,
    WhatsAppMiniBadge,
    TabInboxIcon,
    TabAutomationIcon,
    TabContactsIcon,
    TabMoreIcon,
} from '../../components/DashboardIcons';
import { MegaphoneIcon } from '../../components/BroadcastIcons';
import { MoreDotsIcon } from '../../components/ChatIcons';
import {
    PlaySentIcon,
    DeliveredCheckIcon,
    ReplyArrowIcon,
    TeamMembersIcon,
    AutoWaveIcon,
    AutoReplyBubbleIcon,
    AutoCalendarIcon,
    AutoTeamIcon,
} from '../../components/AutomationIcons';
import { crmService, DynamicAutomation } from '../../services/crmService';
import { authService, UserProfile, supabase } from '../../services/supabase';

interface AutomationScreenProps {
    onNavigateTab?: (tab: 'Inbox' | 'Automation' | 'Contacts' | 'Broadcast' | 'More') => void;
}

export const AutomationScreen: React.FC<AutomationScreenProps> = ({ onNavigateTab }) => {
    const [activeCategory, setActiveCategory] = useState<string>('All Automations');
    const [rules, setRules] = useState<DynamicAutomation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Create Modal State
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [triggerType, setTriggerType] = useState('new_message');
    const [descriptionInput, setDescriptionInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        authService.getProfile().then(setProfile);
    }, []);

    const loadAutomations = useCallback(async (force = false) => {
        if (!force && rules.length === 0) setIsLoading(true);
        try {
            const data = await crmService.fetchAutomations(force);
            setRules(data);
        } catch (err) {
            console.warn('Error loading automations:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [rules.length]);

    useEffect(() => {
        loadAutomations();
    }, [loadAutomations]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadAutomations(true);
    };

    const toggleRule = async (id: string, currentActive: boolean) => {
        // Optimistic UI update
        setRules((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isActive: !currentActive } : item))
        );
        // Persist to Supabase live
        await crmService.toggleAutomation(id, currentActive);
    };

    const handleCreateAutomation = async () => {
        if (!nameInput.trim()) {
            Alert.alert('Required', 'Please enter an automation title');
            return;
        }

        setIsSaving(true);
        try {
            const user = await authService.getCurrentUser();
            const prof = await authService.getProfile();

            const { data, error } = await supabase
                .from('automations')
                .insert({
                    account_id: prof?.account_id,
                    user_id: user?.id,
                    name: nameInput.trim(),
                    trigger_type: triggerType,
                    description: descriptionInput.trim() || `Automated ${triggerType} workflow`,
                    is_active: true,
                })
                .select()
                .single();

            if (error) throw error;

            const newRule: DynamicAutomation = {
                id: data.id,
                title: data.name,
                description: data.description || 'WhatsApp automated trigger',
                category: 'Others',
                isActive: true,
                trigger_type: data.trigger_type,
                metrics: { sent: 0, delivered: 0, replied: 0 },
            };

            setRules((prev) => [newRule, ...prev]);
            setIsSaving(false);
            setCreateModalVisible(false);
            setNameInput('');
            setDescriptionInput('');

            Alert.alert('Success', `Automation "${newRule.title}" created!`);
        } catch (err: any) {
            setIsSaving(false);
            Alert.alert('Error', err?.message || 'Failed to create automation');
        }
    };

    const filteredRules = rules.filter((item) => {
        if (activeCategory === 'All Automations') return true;
        return item.category === activeCategory;
    });

    const renderMetricIcon = (type: string) => {
        switch (type) {
            case 'sent':
                return <PlaySentIcon size={12} color="#10B981" />;
            case 'delivered':
                return <DeliveredCheckIcon size={13} color="#10B981" />;
            case 'replied':
                return <ReplyArrowIcon size={13} color="#64748B" />;
            default:
                return <TeamMembersIcon size={13} color="#64748B" />;
        }
    };

    const renderRuleIcon = (category: string) => {
        switch (category) {
            case 'Welcome':
                return <AutoWaveIcon size={22} color="#F59E0B" />;
            case 'Auto Reply':
                return <AutoReplyBubbleIcon size={20} color="#3B82F6" />;
            case 'Follow Up':
                return <AutoCalendarIcon size={20} color="#7C3AED" />;
            default:
                return <AutoTeamIcon size={22} color="#10B981" />;
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

                {/* Scrollable Main FlatList */}
                <View style={styles.listContainer}>
                    {isLoading && rules.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={Colors.primaryGreen} />
                            <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13 }}>
                                Loading automations...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredRules}
                            keyExtractor={(item) => item.id}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            ListHeaderComponent={
                                <>
                                    {/* Hero Green Banner Card */}
                                    <View style={styles.heroBanner}>
                                        <View style={styles.heroBannerBgOverlay} />

                                        {/* Left Content */}
                                        <View style={styles.heroContentLeft}>
                                            <Text style={styles.heroTitle}>
                                                Automate Your{'\n'}Customer Conversations
                                            </Text>
                                            <Text style={styles.heroSubtitle}>
                                                Trigger smart WhatsApp replies, keyword matchers, and auto-assignments.
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.createBtn}
                                                activeOpacity={0.85}
                                                onPress={() => setCreateModalVisible(true)}>
                                                <Text style={styles.createBtnText}>Create Automation</Text>
                                                <ArrowRightIcon size={14} color="#009B4D" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Right Diagram Orbit with SVGs */}
                                        <View style={styles.heroNetworkArea}>
                                            <View style={styles.centralWhatsAppGlow}>
                                                <WhatsAppMiniBadge size={32} />
                                            </View>

                                            <View style={[styles.networkMiniPill, styles.pillWelcome]}>
                                                <View style={styles.networkPillIconWrap}>
                                                    <AutoWaveIcon size={12} color="#F59E0B" />
                                                </View>
                                                <Text style={styles.networkPillText}>Welcome</Text>
                                            </View>

                                            <View style={[styles.networkMiniPill, styles.pillAutoReply]}>
                                                <View style={styles.networkPillIconWrap}>
                                                    <AutoReplyBubbleIcon size={11} color="#3B82F6" />
                                                </View>
                                                <Text style={styles.networkPillText}>Auto Reply</Text>
                                            </View>

                                            <View style={[styles.networkMiniPill, styles.pillFollowUp]}>
                                                <View style={styles.networkPillIconWrap}>
                                                    <AutoCalendarIcon size={11} color="#7C3AED" />
                                                </View>
                                                <Text style={styles.networkPillText}>Follow Up</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Category Chips Scroll */}
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.chipsScroll}>
                                        {['All Automations', 'Welcome', 'Auto Reply', 'Follow Up', 'Others'].map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={[styles.chipItem, activeCategory === cat && styles.chipItemActive]}
                                                onPress={() => setActiveCategory(cat)}
                                                activeOpacity={0.7}>
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        activeCategory === cat && styles.chipTextActive,
                                                    ]}>
                                                    {cat}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.automationCard} activeOpacity={0.85}>
                                    {/* Top Row: Icon, Title, Status, Switch, More */}
                                    <View style={styles.cardTopRow}>
                                        <View style={[styles.cardIconBox, { backgroundColor: '#DCFCE7' }]}>
                                            {renderRuleIcon(item.category)}
                                        </View>

                                        <View style={styles.cardHeaderInfo}>
                                            <View style={styles.titleBadgeRow}>
                                                <Text style={styles.cardTitle}>{item.title}</Text>
                                                <View
                                                    style={[
                                                        styles.statusBadge,
                                                        item.isActive ? styles.statusBadgeActive : styles.statusBadgePaused,
                                                    ]}>
                                                    <Text
                                                        style={
                                                            item.isActive
                                                                ? styles.statusBadgeTextActive
                                                                : styles.statusBadgeTextPaused
                                                        }>
                                                        {item.isActive ? 'Active' : 'Paused'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.cardDescription}>{item.description}</Text>
                                        </View>

                                        <View style={styles.cardActionsRight}>
                                            <Switch
                                                value={item.isActive}
                                                onValueChange={() => toggleRule(item.id, item.isActive)}
                                                trackColor={{ false: '#CBD5E1', true: Colors.primaryGreen }}
                                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                                                ios_backgroundColor="#CBD5E1"
                                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                            />
                                            <TouchableOpacity activeOpacity={0.7}>
                                                <MoreDotsIcon size={16} color="#94A3B8" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Bottom Metrics Bar */}
                                    <View style={styles.metricsRow}>
                                        <View style={styles.metricItem}>
                                            {renderMetricIcon('sent')}
                                            <View style={styles.metricTextWrap}>
                                                <Text style={styles.metricValue}>{item.metrics.sent.toLocaleString()}</Text>
                                                <Text style={styles.metricLabel}>Sent</Text>
                                            </View>
                                        </View>

                                        <View style={styles.metricItem}>
                                            {renderMetricIcon('delivered')}
                                            <View style={styles.metricTextWrap}>
                                                <Text style={styles.metricValue}>{item.metrics.delivered.toLocaleString()}</Text>
                                                <Text style={styles.metricLabel}>Delivered</Text>
                                            </View>
                                        </View>

                                        <View style={styles.metricItem}>
                                            {renderMetricIcon('replied')}
                                            <View style={styles.metricTextWrap}>
                                                <Text style={styles.metricValue}>{item.metrics.replied.toLocaleString()}</Text>
                                                <Text style={styles.metricLabel}>Replied</Text>
                                            </View>
                                        </View>

                                        <View style={styles.chevronWrapper}>
                                            <ChevronRightIcon size={14} color="#94A3B8" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
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

                {/* Bottom Tab Bar */}
                <View style={styles.bottomTabBar}>
                    <TouchableOpacity
                        style={styles.tabItem}
                        onPress={() => onNavigateTab && onNavigateTab('Inbox')}
                        activeOpacity={0.7}>
                        <TabInboxIcon size={22} color="#94A3B8" />
                        <View style={styles.tabIndicatorDot} />
                        <Text style={styles.tabLabel}>Inbox</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        onPress={() => onNavigateTab && onNavigateTab('Automation')}
                        activeOpacity={0.7}>
                        <TabAutomationIcon size={22} color={Colors.primaryGreen} />
                        <Text style={[styles.tabLabel, styles.tabLabelActive]}>Automation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        onPress={() => onNavigateTab && onNavigateTab('Contacts')}
                        activeOpacity={0.7}>
                        <TabContactsIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>Contacts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        onPress={() => onNavigateTab && onNavigateTab('Broadcast')}
                        activeOpacity={0.7}>
                        <MegaphoneIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>Broadcast</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        onPress={() => onNavigateTab && onNavigateTab('More')}
                        activeOpacity={0.7}>
                        <TabMoreIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>More</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Smooth Modal: Create Automation */}
            <SmoothModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                    Create Automation
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 18 }}>
                    Set up rules that automatically respond to incoming customer messages.
                </Text>

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                    Automation Title *
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
                    placeholder="e.g. Instant Pricing Quote"
                    placeholderTextColor="#94A3B8"
                    value={nameInput}
                    onChangeText={setNameInput}
                />

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                    Trigger Type
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {['new_message', 'keyword_match', 'tag_added'].map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 6,
                                backgroundColor: triggerType === t ? Colors.primaryGreen : '#F1F5F9',
                            }}
                            onPress={() => setTriggerType(t)}>
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: '600',
                                    color: triggerType === t ? '#FFFFFF' : '#475569',
                                }}>
                                {t.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                    Description
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
                    placeholder="e.g. Automatically send catalog when user asks for pricing"
                    placeholderTextColor="#94A3B8"
                    value={descriptionInput}
                    onChangeText={setDescriptionInput}
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
                        disabled={isSaving}
                        onPress={handleCreateAutomation}>
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                Save Automation
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SmoothModal>
        </SafeAreaView>
    );
};