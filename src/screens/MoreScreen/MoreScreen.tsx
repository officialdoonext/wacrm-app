import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import {
    ChevronRightIcon,
    WhatsAppMiniBadge,
    TabInboxIcon,
    TabAutomationIcon,
    TabContactsIcon,
    TabMoreIcon,
    BellIcon,
} from '../../components/DashboardIcons';
import {
    ChevronBackIcon,
    CrownBadgeIcon,
    BarChartVectorIcon,
    CalendarVectorIcon,
    ShoppingBagIcon,
    UsersVectorIcon,
    CreditCardVectorIcon,
    LinkChainIcon,
} from '../../components/ChatIcons';
import { SingleUserIcon } from '../../components/ContactsIcons';
import { MegaphoneIcon, MetricPlaneIcon } from '../../components/BroadcastIcons';
import {
    EditPencilIcon,
    CameraBadgeIcon,
    StorefrontIcon,
    PlugIcon,
    MessageSettingsIcon,
    QuestionCircleIcon,
    ShieldSecurityIcon,
    InfoCircleIcon,
    LogoutDoorIcon,
} from '../../components/ProfileIcons';
import { authService, UserProfile } from '../../services/supabase';
import { crmService, DashboardMetrics } from '../../services/crmService';
import { API_CONFIG } from '../../config/api';

interface MoreScreenProps {
    onBack?: () => void;
    onNavigateTab?: (tab: 'Inbox' | 'Automation' | 'Contacts' | 'Broadcast' | 'More') => void;
    onLogout?: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
    onBack,
    onNavigateTab,
    onLogout,
}) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalContacts: 8,
        activeConversations: 6,
        totalMessagesSent: 24580,
        deliveredRate: 95,
        activeCampaigns: 5,
        openDealsValue: 42500,
    });
    const [commerceModalVisible, setCommerceModalVisible] = useState(false);

    useEffect(() => {
        authService.getProfile().then(setProfile);
        crmService.fetchDashboardMetrics().then(setMetrics);
    }, []);

    const handleLogout = async () => {
        Alert.alert('Log Out', 'Are you sure you want to log out of WhatsAppNext?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    await authService.signOut();
                    if (onLogout) onLogout();
                },
            },
        ]);
    };

    const displayName = profile?.full_name || 'Agent User';
    const displayEmail = profile?.email || '';
    const displayRole = (profile?.account_role || 'Agent').toUpperCase();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Top App Header */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        activeOpacity={0.7}
                        onPress={onBack || (() => onNavigateTab && onNavigateTab('Inbox'))}>
                        <ChevronBackIcon size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Profile & Settings</Text>
                    <View style={styles.placeholderRight} />
                </View>

                {/* Scrollable Content */}
                <View style={styles.scrollWrapper}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}>
                        {/* User Profile Header Card */}
                        <View style={styles.profileHeaderRow}>
                            <View style={styles.avatarContainer}>
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
                                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 24 }}>
                                            {displayName[0]?.toUpperCase() || 'A'}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
                                    <CameraBadgeIcon size={12} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.userInfoCol}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.userName}>{displayName}</Text>
                                    <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.8}>
                                        <EditPencilIcon size={12} color={Colors.primaryGreen} />
                                        <Text style={styles.editProfileText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.userEmail}>{displayEmail}</Text>
                                <Text style={styles.userPhone}>Role: {displayRole}</Text>
                                <View style={styles.planBadge}>
                                    <CrownBadgeIcon size={12} color="#F59E0B" />
                                    <Text style={styles.planBadgeText}>Enterprise Business Plan</Text>
                                </View>
                            </View>
                        </View>

                        {/* WhatsApp API Connection Status Pill */}
                        <View
                            style={{
                                backgroundColor: '#ECFDF5',
                                borderRadius: 12,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: '#A7F3D0',
                                marginBottom: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                <WhatsAppMiniBadge size={22} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#065F46' }}>
                                        Meta WhatsApp Cloud API
                                    </Text>
                                    <Text style={{ fontSize: 11, color: '#047857' }} numberOfLines={1}>
                                        Connected: {API_CONFIG.API_BASE_URL}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    backgroundColor: '#059669',
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 6,
                                }}>
                                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                                    Active
                                </Text>
                            </View>
                        </View>

                        {/* 4 Dynamic Stats Cards */}
                        <View style={styles.statsRow}>
                            {/* Total Contacts */}
                            <View style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <SingleUserIcon size={14} color="#059669" />
                                </View>
                                <Text style={styles.statNumber} numberOfLines={1}>
                                    {metrics.totalContacts.toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel} numberOfLines={1}>
                                    Total Contacts
                                </Text>
                            </View>

                            {/* Messages Sent */}
                            <View style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <MetricPlaneIcon size={14} color="#059669" />
                                </View>
                                <Text style={styles.statNumber} numberOfLines={1}>
                                    {metrics.totalMessagesSent.toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel} numberOfLines={1}>
                                    Messages Sent
                                </Text>
                            </View>

                            {/* Delivery Rate */}
                            <View style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <BarChartVectorIcon size={14} color="#059669" />
                                </View>
                                <Text style={styles.statNumber} numberOfLines={1}>
                                    {metrics.deliveredRate}%
                                </Text>
                                <Text style={styles.statLabel} numberOfLines={1}>
                                    Delivery Rate
                                </Text>
                            </View>

                            {/* Active Campaigns */}
                            <View style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <CalendarVectorIcon size={14} color="#059669" />
                                </View>
                                <Text style={styles.statNumber} numberOfLines={1}>
                                    {metrics.activeCampaigns}
                                </Text>
                                <Text style={styles.statLabel} numberOfLines={1}>
                                    Campaigns
                                </Text>
                            </View>
                        </View>

                        {/* Menu Group 1: Commerce & Meta Catalog */}
                        <View style={styles.menuSectionBox}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => setCommerceModalVisible(true)}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#EDE9FE' }]}>
                                    <ShoppingBagIcon size={18} color="#7C3AED" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>WhatsApp Commerce & Meta Catalog</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Manage product catalog, carts & in-chat payment links
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() =>
                                    Alert.alert(
                                        'Team Members',
                                        `Account ID: ${profile?.account_id || 'default'}\nCurrent Role: ${displayRole}`
                                    )
                                }>
                                <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <UsersVectorIcon size={18} color="#059669" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Team Members & Roles</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Manage teammates and agent assignments
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, styles.menuItemLast]}
                                activeOpacity={0.7}
                                onPress={() =>
                                    Alert.alert(
                                        'Subscription & Billing',
                                        'Enterprise Business Plan: Unlimited WhatsApp conversations, AI draft assistant, and live Meta Catalog sync active.'
                                    )
                                }>
                                <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                                    <CreditCardVectorIcon size={18} color="#D97706" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Subscription & Billing</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Enterprise Plan • All features enabled
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Menu Group 2: Integrations & Settings */}
                        <View style={styles.menuSectionBox}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() =>
                                    Alert.alert(
                                        'WhatsApp Connection',
                                        `Connected to API: ${API_CONFIG.API_BASE_URL}\nWebhook Status: Healthy\nMeta WABA ID: Verified`
                                    )
                                }>
                                <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <WhatsAppMiniBadge size={22} />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>WhatsApp Business API Setup</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Manage phone ID, WABA ID and Webhooks
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() =>
                                    Alert.alert(
                                        'AI Assistant Status',
                                        'OpenAI GPT-4o Auto-reply Bot: Active\nMax replies per conversation: 5\nCustom knowledge base: Enabled'
                                    )
                                }>
                                <View style={[styles.menuIconBox, { backgroundColor: '#E0E7FF' }]}>
                                    <PlugIcon size={20} color="#3B82F6" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>AI Bot & Integrations</Text>
                                    <Text style={styles.menuSubtitle}>
                                        GPT-4o auto-replies, smart draft & webhooks
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, styles.menuItemLast]}
                                activeOpacity={0.7}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
                                    <MessageSettingsIcon size={20} color="#EF4444" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Message & Template Settings</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Meta templates, quick replies & working hours
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Menu Group 3: Help & About */}
                        <View style={styles.menuSectionBox}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() =>
                                    Alert.alert(
                                        'Help & Support',
                                        'Need help? Visit https://autonext.doonext.app or email support@doonext.app'
                                    )
                                }>
                                <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <QuestionCircleIcon size={20} color="#059669" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Help & Support</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Documentation, guides & API references
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, styles.menuItemLast]}
                                activeOpacity={0.7}
                                onPress={() =>
                                    Alert.alert(
                                        'About WhatsAppNext',
                                        'Version 1.0.0 (Production)\nConnected to autonext.doonext.app\nSupabase Realtime & PostgreSQL RLS'
                                    )
                                }>
                                <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
                                    <InfoCircleIcon size={20} color="#475569" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>About WhatsAppNext</Text>
                                    <Text style={styles.menuSubtitle}>Version 1.0.0 • Connected to Live API</Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Red Log Out Button */}
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            activeOpacity={0.85}
                            onPress={handleLogout}>
                            <LogoutDoorIcon size={18} color="#EF4444" />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Bottom Navigation Bar */}
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
                        <MegaphoneIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>Broadcast</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        activeOpacity={0.7}
                        onPress={() => onNavigateTab && onNavigateTab('More')}>
                        <TabMoreIcon size={22} color={Colors.primaryGreen} />
                        <Text style={[styles.tabLabel, styles.tabLabelActive]}>More</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal: WhatsApp Commerce & Catalog (Screens 15 & 16) */}
            <Modal
                visible={commerceModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCommerceModalVisible(false)}>
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
                            maxHeight: '80%',
                        }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                            WhatsApp Commerce & Orders
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                            Meta Catalog sync & in-chat payment links (Razorpay, Stripe, UPI).
                        </Text>

                        {/* Orders List / Empty State */}
                        <View
                            style={{
                                backgroundColor: '#F8FAFC',
                                borderRadius: 12,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                                marginBottom: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <ShoppingBagIcon size={32} color="#94A3B8" />
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B', marginTop: 10, marginBottom: 4 }}>
                                No Active Orders
                            </Text>
                            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                                Orders placed by customers from your WhatsApp Meta Catalog will appear here.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={{
                                height: 44,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => setCommerceModalVisible(false)}>
                            <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};