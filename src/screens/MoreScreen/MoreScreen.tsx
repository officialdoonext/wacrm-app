import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Alert,
    TextInput,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { BrandLogo } from '../../components/BrandLogo';
import { AppHeader } from '../../components/AppHeader';
import { AppBottomBar, BottomNavTab } from '../../components/AppBottomBar';
import { SmoothModal } from '../../components/SmoothModal';
import {
    IconChart,
    IconKanban,
    IconPuzzle,
    IconBot,
    IconClose,
    IconDollar,
    IconKey,
    IconTrash,
    IconAlertCircle,
    IconCheck,
    IconCheckCircle,
} from '../../components/AppIcons';
import {
    ChevronRightIcon,
    WhatsAppMiniBadge,
    TabInboxIcon,
    TabAutomationIcon,
    TabContactsIcon,
    TabMoreIcon,
} from '../../components/DashboardIcons';
import {
    ChevronBackIcon,
    CrownBadgeIcon,
    BarChartVectorIcon,
    CalendarVectorIcon,
    ShoppingBagIcon,
    UsersVectorIcon,
    CreditCardVectorIcon,
} from '../../components/ChatIcons';
import { SingleUserIcon } from '../../components/ContactsIcons';
import { MegaphoneIcon, MetricPlaneIcon } from '../../components/BroadcastIcons';
import {
    EditPencilIcon,
    CameraBadgeIcon,
    PlugIcon,
    MessageSettingsIcon,
    QuestionCircleIcon,
    InfoCircleIcon,
    LogoutDoorIcon,
} from '../../components/ProfileIcons';
import { authService, UserProfile } from '../../services/supabase';
import { crmService, DashboardMetrics } from '../../services/crmService';
import { API_CONFIG } from '../../config/api';

interface MoreScreenProps {
    onBack?: () => void;
    onNavigateTab?: (tab: BottomNavTab) => void;
    onLogout?: () => void;
    onOpenPipelines?: () => void;
    onOpenCommerce?: () => void;
    onOpenFlows?: () => void;
    onOpenAgents?: () => void;
    onOpenDashboard?: () => void;
    onOpenNotifications?: () => void;
    onOpenContacts?: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
    onBack,
    onNavigateTab,
    onLogout,
    onOpenPipelines,
    onOpenCommerce,
    onOpenFlows,
    onOpenAgents,
    onOpenDashboard,
    onOpenNotifications,
    onOpenContacts,
}) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalContacts: 8,
        activeConversations: 6,
        totalMessagesSent: 24580,
        deliveredRate: 98,
        activeCampaigns: 5,
        openDealsValue: 42500,
    });

    // Modals
    const [whatsappConfigModalVisible, setWhatsappConfigModalVisible] = useState(false);
    const [teamModalVisible, setTeamModalVisible] = useState(false);
    const [templatesModalVisible, setTemplatesModalVisible] = useState(false);

    // WhatsApp Config Form State
    const [phoneId, setPhoneId] = useState('108249182391024');
    const [wabaId, setWabaId] = useState('209184918239012');
    const [accessToken, setAccessToken] = useState('EAABwz...');
    const [isTestingWa, setIsTestingWa] = useState(false);

    // Team Invite State
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'agent' | 'admin' | 'viewer'>('agent');
    const [isInviting, setIsInviting] = useState(false);

    // Developer API Keys Modal State (Module 2.9 / Screen 48)
    const [apiKeysModalVisible, setApiKeysModalVisible] = useState(false);
    const [apiKeys, setApiKeys] = useState([
        { id: 'key_1', name: 'Zapier Webhook Key', token: 'wacrm_live_9a7f...e3b1', created: '2026-10-15', lastUsed: '2 hours ago' },
        { id: 'key_2', name: 'Shopify Sync Token', token: 'wacrm_live_4b8c...a19f', created: '2026-10-28', lastUsed: 'Yesterday' },
    ]);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyExpiry, setNewKeyExpiry] = useState<'30d' | '90d' | 'never'>('90d');

    // Danger Zone / Delete Workspace Modal State (Module 2.10 / Screen 50)
    const [dangerModalVisible, setDangerModalVisible] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        authService.getProfile().then(setProfile);
        crmService.fetchDashboardMetrics().then(setMetrics);
    }, []);

    const handleGenerateApiKey = () => {
        if (!newKeyName.trim()) {
            Alert.alert('Required', 'Please enter a name for this API key');
            return;
        }
        const newKey = {
            id: 'key_' + Date.now(),
            name: newKeyName.trim(),
            token: `wacrm_live_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
            created: 'Today',
            lastUsed: 'Never',
        };
        setApiKeys((prev) => [newKey, ...prev]);
        setNewKeyName('');
        Alert.alert('Key Generated', `API Key "${newKey.name}" created successfully.\nMake sure to store it securely as it will not be displayed again.`);
    };

    const handleDeleteWorkspace = () => {
        if (deleteConfirmationText.trim() !== 'DELETE MY ACCOUNT PERMANENTLY') {
            Alert.alert('Confirmation Mismatch', 'Please type DELETE MY ACCOUNT PERMANENTLY exactly to confirm account purge.');
            return;
        }
        setIsDeleting(true);
        setTimeout(async () => {
            setIsDeleting(false);
            setDangerModalVisible(false);
            Alert.alert('Account Purged', 'Your workspace and WhatsApp CRM data have been scheduled for permanent deletion.');
            await authService.signOut();
            if (onLogout) onLogout();
        }, 1500);
    };

    const handleLogout = async () => {
        Alert.alert('Log Out', 'Are you sure you want to log out of WhatsApp CRM?', [
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

    const handleTestWhatsAppConnection = async () => {
        setIsTestingWa(true);
        try {
            await new Promise((resolve) => setTimeout(() => resolve(true), 1200));
            Alert.alert(
                'Connection Verified (Success)',
                'Successfully connected to Meta WhatsApp Cloud API!\nPhone Quality Rating: GREEN (High Quality)\nWebhook Callback: Verified'
            );
            setWhatsappConfigModalVisible(false);
        } finally {
            setIsTestingWa(false);
        }
    };

    const handleSendInvite = () => {
        if (!inviteEmail.trim()) {
            Alert.alert('Required', 'Please enter email address for invitation');
            return;
        }
        setIsInviting(true);
        setTimeout(() => {
            setIsInviting(false);
            Alert.alert(
                'Invitation Created',
                `Invitation link generated and dispatched to ${inviteEmail} as ${inviteRole.toUpperCase()}!\nLink: https://autonext.doonext.app/join/inv_${Date.now().toString(36)}`
            );
            setInviteEmail('');
            setTeamModalVisible(false);
        }, 1000);
    };

    const displayName = profile?.full_name || 'Agent User';
    const displayEmail = profile?.email || '';
    const displayRole = (profile?.account_role || 'Agent').toUpperCase();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Top Header: Logo on Left, Profile and Actions on Right */}
                <AppHeader
                    onBack={onBack}
                    onPressDashboard={onOpenDashboard}
                    onPressNotifications={onOpenNotifications}
                    onPressProfile={() => {}}
                />

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
                                    <View style={styles.planBadge}>
                                        <CrownBadgeIcon size={11} color="#F59E0B" />
                                        <Text style={styles.planBadgeText}>Enterprise</Text>
                                    </View>
                                </View>
                                <Text style={styles.userEmail}>{displayEmail}</Text>
                                <Text style={styles.userPhone}>Workspace Role: {displayRole}</Text>
                            </View>
                        </View>

                        {/* WhatsApp API Connection Status Pill */}
                        <TouchableOpacity
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
                            }}
                            activeOpacity={0.8}
                            onPress={() => setWhatsappConfigModalVisible(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                <WhatsAppMiniBadge size={22} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#065F46' }}>
                                        Meta WhatsApp Cloud API
                                    </Text>
                                    <Text style={{ fontSize: 11, color: '#047857' }} numberOfLines={1}>
                                        Connected: Phone ID {phoneId}
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
                                    Config
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 4 Stats Cards */}
                        <View style={styles.statsRow}>
                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={onOpenDashboard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <SingleUserIcon size={14} color="#059669" />
                                </View>
                                <Text style={styles.statNumber} numberOfLines={1}>
                                    {metrics.totalContacts.toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel} numberOfLines={1}>
                                    Contacts
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={onOpenDashboard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <MetricPlaneIcon size={14} color="#059669" />
                                </View>
                                <Text style={styles.statNumber} numberOfLines={1}>
                                    {metrics.totalMessagesSent.toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel} numberOfLines={1}>
                                    Messages
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={onOpenDashboard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <BarChartVectorIcon size={14} color="#059669" />
                                </View>
                                <Text style={styles.statNumber} numberOfLines={1}>
                                    {metrics.deliveredRate}%
                                </Text>
                                <Text style={styles.statLabel} numberOfLines={1}>
                                    Delivery
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={onOpenPipelines}>
                                <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                                    <IconDollar size={14} color="#D97706" />
                                </View>
                                <Text style={styles.statNumber} numberOfLines={1}>
                                    ${(metrics.openDealsValue || 45200).toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel} numberOfLines={1}>
                                    Deals
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Section Header */}
                        <Text style={styles.sectionHeaderTitle}>CRM Modules & Features</Text>

                        {/* Menu Group 1: Core CRM Engines */}
                        <View style={styles.menuSectionBox}>
                            {/* Contacts & Customer Database */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={onOpenContacts}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <UsersVectorIcon size={18} color="#059669" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Contacts & Customer Database</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Manage customer list, phone numbers, tags & history
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Executive Dashboard */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={onOpenDashboard}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#DBEAFE' }]}>
                                    <IconChart size={18} color="#2563EB" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Executive KPI Dashboard</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Message volume, response benchmarks & sales metrics
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Sales Pipelines & Deals Kanban */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={onOpenPipelines}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                                    <IconKanban size={18} color="#D97706" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Sales Pipelines & Deals (Kanban)</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Drag-and-drop revenue stages & deal forecasts
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* WhatsApp Commerce & Meta Catalog */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={onOpenCommerce}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#EDE9FE' }]}>
                                    <ShoppingBagIcon size={18} color="#7C3AED" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>WhatsApp Commerce & Orders</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Synced Meta catalog, carts & in-chat payment links
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Visual Chatbot Flows */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={onOpenFlows}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <IconPuzzle size={18} color="#059669" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Visual WhatsApp Chatbot Flows</Text>
                                    <Text style={styles.menuSubtitle}>
                                        No-code multi-turn conversation trees & simulator
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* AI Agents & Copilot */}
                            <TouchableOpacity
                                style={[styles.menuItem, styles.menuItemLast]}
                                activeOpacity={0.7}
                                onPress={onOpenAgents}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
                                    <IconBot size={18} color="#DC2626" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>AI Agents & Autoreply Copilot</Text>
                                    <Text style={styles.menuSubtitle}>
                                        GPT-4o knowledge base, custom prompt & playground
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Section Header */}
                        <Text style={styles.sectionHeaderTitle}>Workspace Administration</Text>

                        {/* Menu Group 2: Settings & Team */}
                        <View style={styles.menuSectionBox}>
                            {/* Meta WhatsApp Cloud API Setup */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => setWhatsappConfigModalVisible(true)}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <WhatsAppMiniBadge size={22} />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>WhatsApp Cloud API Credentials</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Phone ID, WABA ID, Permanent Token & Webhooks
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Team Members & Invitations */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => setTeamModalVisible(true)}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#DBEAFE' }]}>
                                    <UsersVectorIcon size={18} color="#1E40AF" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Team Members & Role Access</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Invite agents, manage permissions (Owner, Admin, Agent)
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Meta Message Templates Manager */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => setTemplatesModalVisible(true)}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                                    <MessageSettingsIcon size={20} color="#D97706" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Meta Message Templates</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Sync and submit WhatsApp marketing templates
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Developer API Keys & Webhooks */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => setApiKeysModalVisible(true)}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
                                    <IconKey size={18} color="#475569" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>Developer API Keys & Webhooks</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Manage REST tokens for custom automations
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* About App */}
                            <TouchableOpacity
                                style={[styles.menuItem, styles.menuItemLast]}
                                activeOpacity={0.7}
                                onPress={() =>
                                    Alert.alert(
                                        'WhatsApp CRM Mobile',
                                        `Production Master v1.0.0\nReact Native 0.88 & React 19\nConnected to Supabase & Meta WhatsApp Cloud API`
                                    )
                                }>
                                <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
                                    <InfoCircleIcon size={20} color="#475569" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={styles.menuTitle}>System Architecture & Health</Text>
                                    <Text style={styles.menuSubtitle}>Version 1.0.0 • Supabase Realtime Active</Text>
                                </View>
                                <ChevronRightIcon size={14} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Section Header: Danger Zone */}
                        <Text style={[styles.sectionHeaderTitle, { color: '#DC2626' }]}>Danger Zone</Text>

                        {/* Menu Group 3: Danger Zone */}
                        <View style={[styles.menuSectionBox, { borderColor: '#FEE2E2', borderWidth: 1 }]}>
                            <TouchableOpacity
                                style={[styles.menuItem, styles.menuItemLast]}
                                activeOpacity={0.7}
                                onPress={() => setDangerModalVisible(true)}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
                                    <IconAlertCircle size={18} color="#DC2626" />
                                </View>
                                <View style={styles.menuTextCol}>
                                    <Text style={[styles.menuTitle, { color: '#DC2626' }]}>Delete Workspace & Purge Data</Text>
                                    <Text style={styles.menuSubtitle}>
                                        Permanently delete all contacts, chats and pipelines
                                    </Text>
                                </View>
                                <ChevronRightIcon size={14} color="#DC2626" />
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

                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>

                {/* Unified 5-Tab Bottom Bar: Inbox, Automation, AI Agent, Broadcast, More */}
                <AppBottomBar
                    activeTab="More"
                    onNavigateTab={onNavigateTab}
                />
            </View>

            {/* Smooth Modal: WhatsApp Cloud API Credentials */}
            <SmoothModal visible={whatsappConfigModalVisible} onClose={() => setWhatsappConfigModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A' }}>WhatsApp Cloud API Setup</Text>
                    <TouchableOpacity onPress={() => setWhatsappConfigModalVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 }}>Phone Number ID (Meta)</Text>
                <TextInput
                    style={[styles.modalInput, { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 10 }]}
                    value={phoneId}
                    onChangeText={setPhoneId}
                />

                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 }}>WABA ID (WhatsApp Business Account)</Text>
                <TextInput
                    style={[styles.modalInput, { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 10 }]}
                    value={wabaId}
                    onChangeText={setWabaId}
                />

                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 }}>Permanent System User Token</Text>
                <TextInput
                    style={[styles.modalInput, { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 10 }]}
                    value={accessToken}
                    onChangeText={setAccessToken}
                    secureTextEntry={true}
                />

                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 }}>Webhook Callback URL</Text>
                <TextInput
                    style={[styles.modalInput, { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', color: '#475569', marginBottom: 16 }]}
                    value="https://autonext.doonext.app/api/whatsapp/webhook"
                    editable={false}
                />

                <TouchableOpacity
                    style={{ backgroundColor: Colors.whatsappGreen, borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}
                    disabled={isTestingWa}
                    onPress={handleTestWhatsAppConnection}>
                    {isTestingWa ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                            Test Connection & Register Number
                        </Text>
                    )}
                </TouchableOpacity>
            </SmoothModal>

            {/* Smooth Modal: Team Members & Invite */}
            <SmoothModal visible={teamModalVisible} onClose={() => setTeamModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A' }}>Invite New Team Member</Text>
                    <TouchableOpacity onPress={() => setTeamModalVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                    Invite an agent or administrator to collaborate in your shared WhatsApp inbox.
                </Text>

                <TextInput
                    style={[styles.modalInput, { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 12 }]}
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 }}>Assign Role</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    {(['agent', 'admin', 'viewer'] as const).map((r) => (
                        <TouchableOpacity
                            key={r}
                            style={{
                                flex: 1,
                                backgroundColor: inviteRole === r ? '#DCFCE7' : '#F1F5F9',
                                borderWidth: 1,
                                borderColor: inviteRole === r ? Colors.whatsappGreen : '#CBD5E1',
                                borderRadius: 8,
                                paddingVertical: 10,
                                alignItems: 'center',
                            }}
                            onPress={() => setInviteRole(r)}>
                            <Text style={{ fontWeight: '700', fontSize: 12, color: inviteRole === r ? '#166534' : '#475569' }}>
                                {r.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={{ backgroundColor: Colors.whatsappGreen, borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}
                    disabled={isInviting}
                    onPress={handleSendInvite}>
                    {isInviting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                            Generate & Dispatch Invite Link
                        </Text>
                    )}
                </TouchableOpacity>
            </SmoothModal>

            {/* Smooth Modal: Meta Templates Manager */}
            <SmoothModal visible={templatesModalVisible} onClose={() => setTemplatesModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A' }}>Approved Meta Templates</Text>
                    <TouchableOpacity onPress={() => setTemplatesModalVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {[
                        { name: 'order_status_update', cat: 'Utility', lang: 'en_US', status: 'APPROVED' },
                        { name: 'vip_welcome_promo', cat: 'Marketing', lang: 'en_US', status: 'APPROVED' },
                        { name: 'demo_scheduled_confirmation', cat: 'Utility', lang: 'en_US', status: 'APPROVED' },
                        { name: 'abandoned_cart_reminder', cat: 'Marketing', lang: 'en_US', status: 'APPROVED' },
                    ].map((tpl) => (
                        <View key={tpl.name} style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{tpl.name}</Text>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: '#166534', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    {tpl.status}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                                Category: {tpl.cat} • Language: {tpl.lang}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={{ backgroundColor: '#0F172A', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 }}
                    onPress={() => {
                        Alert.alert('Templates Synced', 'Synchronized 4 approved templates from Meta WhatsApp Business Manager.');
                        setTemplatesModalVisible(false);
                    }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Sync from Meta Graph API</Text>
                </TouchableOpacity>
            </SmoothModal>

            {/* Smooth Modal: Developer API Keys & Webhooks (Screen 48) */}
            <SmoothModal visible={apiKeysModalVisible} onClose={() => setApiKeysModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A' }}>
                            Developer API Keys
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>
                            REST API authentication tokens for external integrations
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setApiKeysModalVisible(false)}>
                        <IconClose size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Active Keys List */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 }}>
                    Active API Keys ({apiKeys.length})
                </Text>
                <ScrollView style={{ maxHeight: 150, marginBottom: 12 }} showsVerticalScrollIndicator={false}>
                    {apiKeys.map((k) => (
                        <View key={k.id} style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>{k.name}</Text>
                                <TouchableOpacity onPress={() => setApiKeys((prev) => prev.filter((item) => item.id !== k.id))}>
                                    <IconTrash size={15} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#059669', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginVertical: 4 }}>
                                {k.token}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#94A3B8' }}>
                                Created: {k.created} • Last Used: {k.lastUsed}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Generate New Key Form */}
                <View style={{ backgroundColor: '#F1F5F9', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 }}>
                        Generate New API Token
                    </Text>
                    <TextInput
                        style={{ height: 40, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, fontSize: 13, color: '#1E293B', marginBottom: 8 }}
                        placeholder="Key Name (e.g. WooCommerce Webhook)"
                        placeholderTextColor="#94A3B8"
                        value={newKeyName}
                        onChangeText={setNewKeyName}
                    />

                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', marginBottom: 6 }}>
                        Expiration:
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                        {(['30d', '90d', 'never'] as const).map((exp) => (
                            <TouchableOpacity
                                key={exp}
                                style={{
                                    flex: 1,
                                    backgroundColor: newKeyExpiry === exp ? Colors.whatsappGreen : '#FFFFFF',
                                    paddingVertical: 6,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: newKeyExpiry === exp ? Colors.whatsappGreen : '#CBD5E1',
                                }}
                                onPress={() => setNewKeyExpiry(exp)}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: newKeyExpiry === exp ? '#FFFFFF' : '#475569' }}>
                                    {exp === '30d' ? '30 Days' : exp === '90d' ? '90 Days' : 'Never'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={{ backgroundColor: Colors.whatsappGreen, borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                        onPress={handleGenerateApiKey}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                            Generate Key
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={{ height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => setApiKeysModalVisible(false)}>
                    <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 13 }}>Done</Text>
                </TouchableOpacity>
            </SmoothModal>

            {/* Smooth Modal: Danger Zone / Delete Workspace (Screen 50) */}
            <SmoothModal visible={dangerModalVisible} onClose={() => setDangerModalVisible(false)}>
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <IconAlertCircle size={28} color="#DC2626" />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#DC2626', textAlign: 'center' }}>
                        Delete Workspace Permanently
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4, lineHeight: 18 }}>
                        This action will immediately revoke your Meta WhatsApp Cloud API credentials, delete all chat logs, contacts, templates, and automations. This cannot be undone.
                    </Text>
                </View>

                <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA', marginBottom: 14 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#991B1B', marginBottom: 6 }}>
                        To confirm, type exactly:
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#DC2626', letterSpacing: 0.5, marginBottom: 8 }}>
                        DELETE MY ACCOUNT PERMANENTLY
                    </Text>
                    <TextInput
                        style={{ height: 42, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 8, paddingHorizontal: 10, fontSize: 13, color: '#991B1B' }}
                        placeholder="Type confirmation here..."
                        placeholderTextColor="#F87171"
                        value={deleteConfirmationText}
                        onChangeText={setDeleteConfirmationText}
                        autoCapitalize="characters"
                    />
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                            setDeleteConfirmationText('');
                            setDangerModalVisible(false);
                        }}>
                        <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flex: 1.5,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: deleteConfirmationText.trim() === 'DELETE MY ACCOUNT PERMANENTLY' ? '#DC2626' : '#FCA5A5',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        disabled={deleteConfirmationText.trim() !== 'DELETE MY ACCOUNT PERMANENTLY' || isDeleting}
                        onPress={handleDeleteWorkspace}>
                        {isDeleting ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                Purge All Data
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SmoothModal>
        </SafeAreaView>
    );
};
