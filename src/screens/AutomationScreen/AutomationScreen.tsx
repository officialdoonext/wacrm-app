import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ScrollView,
    Switch,
    Platform,
    ActivityIndicator,
    TextInput,
    Alert,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import { SmoothModal } from '../../components/SmoothModal';
import { ArrowRightIcon } from '../../components/WelcomeIcons';
import {
    TabInboxIcon,
    TabAutomationIcon,
    TabContactsIcon,
    TabMoreIcon,
    WhatsAppMiniBadge,
} from '../../components/DashboardIcons';
import { MegaphoneIcon } from '../../components/BroadcastIcons';
import { MoreDotsIcon } from '../../components/ChatIcons';
import {
    IconZap,
    IconPlus,
    IconCheck,
    IconPlay,
    IconCopy,
    IconTrash,
    IconPencil,
    IconFileText,
    IconClose,
    IconClock,
    IconBranch,
    IconList,
    IconWebhook,
    IconBriefcase,
    IconUser,
    IconTag,
    IconPhone,
    IconChat,
    IconAlertCircle,
    IconCheckCircle,
    IconSparkles,
    IconFolder,
} from '../../components/AppIcons';
import {
    crmService,
    DynamicAutomation,
    AutomationStepItem,
    AutomationLogItem,
    AutomationStepType,
    AutomationTriggerType,
} from '../../services/crmService';
import { authService, UserProfile } from '../../services/supabase';

// -------------------------------------------------------------
// Quick-Start Templates (Exact match to Web AUTOMATION_TEMPLATES)
// -------------------------------------------------------------
interface StarterTemplate {
    slug: string;
    name: string;
    description: string;
    trigger_type: AutomationTriggerType;
    trigger_config: Record<string, any>;
    steps: AutomationStepItem[];
    iconBg: string;
    iconColor: string;
    type: 'welcome' | 'clock' | 'users' | 'phone';
}

const STARTER_TEMPLATES: StarterTemplate[] = [
    {
        slug: 'welcome_message',
        name: 'Welcome Message',
        description: 'Send automated welcome when a new contact messages',
        trigger_type: 'first_inbound_message',
        trigger_config: {},
        steps: [
            {
                step_type: 'send_message',
                step_config: { text: 'Hello {{ contact.name }}! Thanks for reaching out to us. How can we help you today?' },
                position: 0,
            },
            {
                step_type: 'add_tag',
                step_config: { tag_name: 'Lead' },
                position: 1,
            },
            {
                step_type: 'assign_conversation',
                step_config: { mode: 'round_robin' },
                position: 2,
            },
        ],
        iconBg: '#DCFCE7',
        iconColor: '#166534',
        type: 'welcome',
    },
    {
        slug: 'out_of_office',
        name: 'Out of Office',
        description: 'Auto-reply outside working business hours',
        trigger_type: 'new_message_received',
        trigger_config: {},
        steps: [
            {
                step_type: 'condition',
                step_config: { subject: 'time_of_day', operand: '18:00-09:00' },
                position: 0,
            },
            {
                step_type: 'send_message',
                step_config: { text: 'We are currently away. Our office hours are Mon-Fri 9:00 - 18:00. We will reply as soon as we are back online!' },
                position: 1,
            },
        ],
        iconBg: '#DBEAFE',
        iconColor: '#1E40AF',
        type: 'clock',
    },
    {
        slug: 'lead_qualifier',
        name: 'Lead Qualifier',
        description: 'Ask qualifying questions and tag interested leads',
        trigger_type: 'keyword_match',
        trigger_config: { keywords: 'demo, price, quote, buy', match_type: 'contains' },
        steps: [
            {
                step_type: 'send_buttons',
                step_config: {
                    text: 'Thank you for your interest! What service would you like to explore?',
                    btn1: 'Book Demo',
                    btn2: 'Pricing Plans',
                    btn3: 'Talk to Sales',
                },
                position: 0,
            },
            {
                step_type: 'add_tag',
                step_config: { tag_name: 'Qualified Lead' },
                position: 1,
            },
            {
                step_type: 'wait',
                step_config: { amount: 10, unit: 'minutes' },
                position: 2,
            },
            {
                step_type: 'create_deal',
                step_config: { title: 'Qualified WhatsApp Lead', value: 2500 },
                position: 3,
            },
        ],
        iconBg: '#EDE9FE',
        iconColor: '#7C3AED',
        type: 'users',
    },
    {
        slug: 'follow_up_reminder',
        name: 'Follow-Up Reminder',
        description: 'Nudge inactive leads after 24 hours',
        trigger_type: 'time_based',
        trigger_config: { delay_hours: 24 },
        steps: [
            {
                step_type: 'wait',
                step_config: { amount: 1, unit: 'days' },
                position: 0,
            },
            {
                step_type: 'condition',
                step_config: { subject: 'no_reply', operand: '24h' },
                position: 1,
            },
            {
                step_type: 'send_template',
                step_config: { template_name: 'follow_up_reminder', language: 'en_US' },
                position: 2,
            },
        ],
        iconBg: '#FEF3C7',
        iconColor: '#D97706',
        type: 'phone',
    },
];

// -------------------------------------------------------------
// Trigger Definitions (Metadata matching Web)
// -------------------------------------------------------------
const TRIGGER_DEFS: Record<string, { label: string; hint: string; pillBg: string; pillColor: string }> = {
    new_message_received: {
        label: 'New Message Received',
        hint: 'Any incoming WhatsApp message',
        pillBg: '#DBEAFE',
        pillColor: '#1E40AF',
    },
    first_inbound_message: {
        label: 'First Message from Contact',
        hint: 'First time contact ever messages you',
        pillBg: '#DCFCE7',
        pillColor: '#166534',
    },
    keyword_match: {
        label: 'Keyword Match',
        hint: 'Message contains specific keyword(s)',
        pillBg: '#FEF3C7',
        pillColor: '#D97706',
    },
    interactive_reply: {
        label: 'Button / List Reply',
        hint: 'Customer taps an interactive button or list item',
        pillBg: '#EDE9FE',
        pillColor: '#7C3AED',
    },
    new_contact_created: {
        label: 'New Contact Created',
        hint: 'When a new contact is added to CRM directory',
        pillBg: '#CCFBF1',
        pillColor: '#0F766E',
    },
    conversation_assigned: {
        label: 'Conversation Assigned',
        hint: 'When chat thread is assigned to an agent',
        pillBg: '#E0E7FF',
        pillColor: '#3730A3',
    },
    tag_added: {
        label: 'Tag Added',
        hint: 'When a tag is applied to a contact',
        pillBg: '#FCE7F3',
        pillColor: '#9D174D',
    },
    time_based: {
        label: 'Time-Based Schedule',
        hint: 'Recurring cron or inactivity delay',
        pillBg: '#F1F5F9',
        pillColor: '#475569',
    },
};

// -------------------------------------------------------------
// Step Definitions (13 Step Types matching Web)
// -------------------------------------------------------------
const STEP_DEFS: Record<AutomationStepType, { label: string; desc: string; color: string }> = {
    send_message: { label: 'Send Message', desc: 'Send custom text message to customer', color: '#059669' },
    send_buttons: { label: 'Send Buttons', desc: 'Send message with up to 3 quick action buttons', color: '#2563EB' },
    send_list: { label: 'Send List Menu', desc: 'Send interactive menu with selectable rows', color: '#059669' },
    send_template: { label: 'Send Template', desc: 'Send approved Meta WhatsApp business template', color: '#D97706' },
    add_tag: { label: 'Add Tag', desc: 'Apply a CRM directory tag to the contact', color: '#7C3AED' },
    remove_tag: { label: 'Remove Tag', desc: 'Remove an existing tag from the contact', color: '#DC2626' },
    assign_conversation: { label: 'Assign Conversation', desc: 'Assign chat thread to agent (round-robin / specific)', color: '#1E40AF' },
    update_contact_field: { label: 'Update Contact Field', desc: 'Update contact metadata property', color: '#0F766E' },
    create_deal: { label: 'Create Deal', desc: 'Create a deal in sales pipeline board', color: '#D97706' },
    wait: { label: 'Wait / Delay', desc: 'Pause workflow execution for a set duration', color: '#64748B' },
    condition: { label: 'Condition (If/Else)', desc: 'Branch workflow based on tag, field, or time of day', color: '#D97706' },
    send_webhook: { label: 'Send Webhook', desc: 'Dispatch HTTP POST webhook to external URL', color: '#2563EB' },
    close_conversation: { label: 'Close Conversation', desc: 'Mark conversation as resolved and close thread', color: '#64748B' },
};

interface AutomationScreenProps {
    onNavigateTab?: (tab: 'Inbox' | 'Automation' | 'Contacts' | 'Broadcast' | 'More') => void;
}

export const AutomationScreen: React.FC<AutomationScreenProps> = ({ onNavigateTab }) => {
    const [activeCategory, setActiveCategory] = useState<string>('All Automations');
    const [rules, setRules] = useState<DynamicAutomation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Selected Automation for Options / Details
    const [selectedAutomation, setSelectedAutomation] = useState<DynamicAutomation | null>(null);
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);

    // Multi-Step Visual Builder Modal State
    const [builderModalVisible, setBuilderModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [builderName, setBuilderName] = useState('');
    const [builderDesc, setBuilderDesc] = useState('');
    const [builderIsActive, setBuilderIsActive] = useState(true);
    const [builderTriggerType, setBuilderTriggerType] = useState<AutomationTriggerType>('first_inbound_message');
    const [builderKeywords, setBuilderKeywords] = useState('demo, price, quote');
    const [builderMatchType, setBuilderMatchType] = useState<'contains' | 'word' | 'exact'>('contains');
    const [builderReplyIds, setBuilderReplyIds] = useState('btn_demo, btn_pricing');
    const [builderTagName, setBuilderTagName] = useState('Hot Lead');
    const [builderSteps, setBuilderSteps] = useState<AutomationStepItem[]>([]);
    const [stepPickerModalVisible, setStepPickerModalVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Execution Logs Modal State
    const [logsModalVisible, setLogsModalVisible] = useState(false);
    const [executionLogs, setExecutionLogs] = useState<AutomationLogItem[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

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

    // Toggle Active / Paused with Instant Optimistic UI
    const toggleRule = async (id: string, currentActive: boolean) => {
        setRules((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isActive: !currentActive } : item))
        );
        await crmService.toggleAutomation(id, currentActive);
    };

    // Open Visual Builder for New Automation
    const handleOpenCreateNew = () => {
        setIsEditing(false);
        setBuilderName('');
        setBuilderDesc('');
        setBuilderIsActive(true);
        setBuilderTriggerType('first_inbound_message');
        setBuilderKeywords('');
        setBuilderReplyIds('');
        setBuilderTagName('New Lead');
        setBuilderSteps([
            {
                step_type: 'send_message',
                step_config: { text: 'Hello! Thanks for reaching out. How can we help you today?' },
                position: 0,
            },
            {
                step_type: 'add_tag',
                step_config: { tag_name: 'Lead' },
                position: 1,
            },
        ]);
        setBuilderModalVisible(true);
    };

    // Open Visual Builder Pre-filled from Starter Template
    const handleStartFromTemplate = (template: StarterTemplate) => {
        setIsEditing(false);
        setBuilderName(template.name);
        setBuilderDesc(template.description);
        setBuilderIsActive(true);
        setBuilderTriggerType(template.trigger_type);
        setBuilderKeywords(template.trigger_config.keywords || '');
        setBuilderMatchType(template.trigger_config.match_type || 'contains');
        setBuilderSteps(JSON.parse(JSON.stringify(template.steps)));
        setBuilderModalVisible(true);
    };

    // Open Visual Builder for Editing Existing Automation
    const handleOpenEdit = async (auto: DynamicAutomation) => {
        setOptionsModalVisible(false);
        setIsEditing(true);
        setSelectedAutomation(auto);
        setBuilderName(auto.title);
        setBuilderDesc(auto.description);
        setBuilderIsActive(auto.isActive);
        setBuilderTriggerType((auto.trigger_type as AutomationTriggerType) || 'new_message_received');
        setBuilderKeywords(auto.trigger_config?.keywords || '');
        setBuilderMatchType(auto.trigger_config?.match_type || 'contains');
        setBuilderReplyIds(auto.trigger_config?.reply_ids || '');
        setBuilderTagName(auto.trigger_config?.tag_name || 'Lead');

        // Fetch steps
        const steps = await crmService.fetchAutomationSteps(auto.id);
        if (steps && steps.length > 0) {
            setBuilderSteps(steps);
        } else {
            setBuilderSteps([
                {
                    step_type: 'send_message',
                    step_config: { text: 'Hi {{ contact.name }}, thanks for reaching out!' },
                    position: 0,
                },
            ]);
        }
        setBuilderModalVisible(true);
    };

    // Duplicate Automation
    const handleDuplicate = async (auto: DynamicAutomation) => {
        setOptionsModalVisible(false);
        setIsLoading(true);
        const dup = await crmService.duplicateAutomation(auto.id);
        setIsLoading(false);
        if (dup) {
            loadAutomations(true);
            Alert.alert('Automation Duplicated', `"${dup.title}" has been created as draft.`);
        } else {
            Alert.alert('Error', 'Failed to duplicate automation.');
        }
    };

    // View Execution Logs
    const handleOpenLogs = async (auto: DynamicAutomation) => {
        setOptionsModalVisible(false);
        setSelectedAutomation(auto);
        setIsLoadingLogs(true);
        setLogsModalVisible(true);
        const logs = await crmService.fetchAutomationLogs(auto.id);
        setExecutionLogs(logs);
        setIsLoadingLogs(false);
    };

    // Delete Automation
    const handleDeleteAutomation = (auto: DynamicAutomation) => {
        setOptionsModalVisible(false);
        Alert.alert(
            'Delete Automation',
            `Are you sure you want to delete "${auto.title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await crmService.deleteAutomation(auto.id);
                        if (success) {
                            setRules((prev) => prev.filter((r) => r.id !== auto.id));
                            Alert.alert('Deleted', 'Automation permanently removed.');
                        } else {
                            Alert.alert('Error', 'Failed to delete automation.');
                        }
                    },
                },
            ]
        );
    };

    // Add Step to Builder
    const handleAddStepToWorkflow = (stepType: AutomationStepType) => {
        let initialConfig: Record<string, any> = {};
        switch (stepType) {
            case 'send_message':
                initialConfig = { text: 'Hello! How can we assist you today?' };
                break;
            case 'send_buttons':
                initialConfig = {
                    text: 'Please select an option below:',
                    btn1: 'Option 1',
                    btn2: 'Option 2',
                    btn3: 'Option 3',
                };
                break;
            case 'send_list':
                initialConfig = {
                    header: 'Select Service',
                    text: 'Choose from our service catalogue:',
                    button: 'View Options',
                    rows: ['Enterprise Suite', 'Team Inbox', 'Custom Integration'],
                };
                break;
            case 'send_template':
                initialConfig = { template_name: 'welcome_offer', language: 'en_US' };
                break;
            case 'add_tag':
            case 'remove_tag':
                initialConfig = { tag_name: 'Lead' };
                break;
            case 'assign_conversation':
                initialConfig = { mode: 'round_robin' };
                break;
            case 'update_contact_field':
                initialConfig = { field: 'name', value: '' };
                break;
            case 'create_deal':
                initialConfig = { title: 'WhatsApp Inbound Deal', value: 1000 };
                break;
            case 'wait':
                initialConfig = { amount: 10, unit: 'minutes' };
                break;
            case 'condition':
                initialConfig = { subject: 'time_of_day', operand: '18:00-09:00' };
                break;
            case 'send_webhook':
                initialConfig = { url: 'https://api.example.com/webhook', headers: '{}', body: '{"event": "lead"}' };
                break;
            case 'close_conversation':
                initialConfig = {};
                break;
        }

        const newStep: AutomationStepItem = {
            step_type: stepType,
            step_config: initialConfig,
            position: builderSteps.length,
        };

        setBuilderSteps([...builderSteps, newStep]);
        setStepPickerModalVisible(false);
    };

    // Remove Step from Builder
    const handleRemoveStep = (index: number) => {
        setBuilderSteps(builderSteps.filter((_, i) => i !== index));
    };

    // Move Step Up/Down
    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === builderSteps.length - 1) return;
        const newArr = [...builderSteps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newArr[index];
        newArr[index] = newArr[targetIndex];
        newArr[targetIndex] = temp;
        setBuilderSteps(newArr);
    };

    // Update Step Config
    const handleUpdateStepConfig = (index: number, key: string, value: any) => {
        const newArr = [...builderSteps];
        newArr[index].step_config = {
            ...newArr[index].step_config,
            [key]: value,
        };
        setBuilderSteps(newArr);
    };

    // Save Automation (Create or Update)
    const handleSaveAutomation = async () => {
        if (!builderName.trim()) {
            Alert.alert('Required', 'Please enter an automation title.');
            return;
        }

        setIsSaving(true);
        try {
            const triggerConfig: Record<string, any> = {};
            if (builderTriggerType === 'keyword_match') {
                triggerConfig.keywords = builderKeywords;
                triggerConfig.match_type = builderMatchType;
            } else if (builderTriggerType === 'interactive_reply') {
                triggerConfig.reply_ids = builderReplyIds;
            } else if (builderTriggerType === 'tag_added') {
                triggerConfig.tag_name = builderTagName;
            }

            if (isEditing && selectedAutomation) {
                const ok = await crmService.updateAutomation(selectedAutomation.id, {
                    name: builderName.trim(),
                    description: builderDesc.trim() || undefined,
                    trigger_type: builderTriggerType,
                    trigger_config: triggerConfig,
                    is_active: builderIsActive,
                    steps: builderSteps,
                });
                if (ok) {
                    Alert.alert('Saved', `Automation "${builderName}" updated successfully!`);
                    loadAutomations(true);
                    setBuilderModalVisible(false);
                } else {
                    Alert.alert('Error', 'Failed to update automation.');
                }
            } else {
                await crmService.createAutomation({
                    name: builderName.trim(),
                    description: builderDesc.trim() || undefined,
                    trigger_type: builderTriggerType,
                    trigger_config: triggerConfig,
                    is_active: builderIsActive,
                    steps: builderSteps,
                });
                Alert.alert('Created', `Automation "${builderName}" created and active!`);
                loadAutomations(true);
                setBuilderModalVisible(false);
            }
        } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to save automation');
        } finally {
            setIsSaving(false);
        }
    };

    // Filter rules
    const filteredRules = rules.filter((item) => {
        if (activeCategory === 'All Automations') return true;
        if (activeCategory === 'Keyword Match') return item.trigger_type === 'keyword_match';
        return item.category === activeCategory;
    });

    const formatRelativeTime = (timestamp?: string | null) => {
        if (!timestamp) return 'never';
        try {
            const diffMin = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
            if (diffMin < 2) return 'just now';
            if (diffMin < 60) return `${diffMin}m ago`;
            const diffHours = Math.floor(diffMin / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${Math.floor(diffHours / 24)}d ago`;
        } catch {
            return 'recently';
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

                {/* Main Content List */}
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
                                    {/* Hero Banner Card */}
                                    <View style={styles.heroBanner}>
                                        <View style={styles.heroBannerBgOverlay} />

                                        {/* Left Content */}
                                        <View style={styles.heroContentLeft}>
                                            <Text style={styles.heroTitle}>
                                                Automate Your{'\n'}Customer Workflows
                                            </Text>
                                            <Text style={styles.heroSubtitle}>
                                                React to WhatsApp® events automatically with smart branching and CRM tags.
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.createBtn}
                                                activeOpacity={0.85}
                                                onPress={handleOpenCreateNew}>
                                                <Text style={styles.createBtnText}>+ Create Automation</Text>
                                                <ArrowRightIcon size={14} color="#009B4D" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Right Diagram Orbit */}
                                        <View style={styles.heroNetworkArea}>
                                            <View style={styles.centralWhatsAppGlow}>
                                                <WhatsAppMiniBadge size={32} />
                                            </View>

                                            <View style={[styles.networkMiniPill, styles.pillWelcome]}>
                                                <View style={styles.networkPillIconWrap}>
                                                    <IconChat size={11} color="#F59E0B" />
                                                </View>
                                                <Text style={styles.networkPillText}>Welcome</Text>
                                            </View>

                                            <View style={[styles.networkMiniPill, styles.pillAutoReply]}>
                                                <View style={styles.networkPillIconWrap}>
                                                    <IconZap size={11} color="#3B82F6" />
                                                </View>
                                                <Text style={styles.networkPillText}>Auto Reply</Text>
                                            </View>

                                            <View style={[styles.networkMiniPill, styles.pillFollowUp]}>
                                                <View style={styles.networkPillIconWrap}>
                                                    <IconClock size={11} color="#7C3AED" />
                                                </View>
                                                <Text style={styles.networkPillText}>Follow Up</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Quick-Start Templates Section (Exact match to Web) */}
                                    <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 10 }}>
                                            Quick-Start Templates
                                        </Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                                            {STARTER_TEMPLATES.map((tpl) => (
                                                <TouchableOpacity
                                                    key={tpl.slug}
                                                    style={{
                                                        width: 175,
                                                        backgroundColor: '#FFFFFF',
                                                        borderRadius: 14,
                                                        padding: 12,
                                                        borderWidth: 1,
                                                        borderColor: '#E2E8F0',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 1 },
                                                        shadowOpacity: 0.05,
                                                        shadowRadius: 3,
                                                        elevation: 1,
                                                    }}
                                                    activeOpacity={0.8}
                                                    onPress={() => handleStartFromTemplate(tpl)}>
                                                    <View
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 8,
                                                            backgroundColor: tpl.iconBg,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginBottom: 8,
                                                        }}>
                                                        {tpl.type === 'welcome' && <IconChat size={16} color={tpl.iconColor} />}
                                                        {tpl.type === 'clock' && <IconClock size={16} color={tpl.iconColor} />}
                                                        {tpl.type === 'users' && <IconUser size={16} color={tpl.iconColor} />}
                                                        {tpl.type === 'phone' && <IconPhone size={16} color={tpl.iconColor} />}
                                                    </View>
                                                    <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A', marginBottom: 4 }} numberOfLines={1}>
                                                        {tpl.name}
                                                    </Text>
                                                    <Text style={{ fontSize: 10.5, color: '#64748B', lineHeight: 14 }} numberOfLines={2}>
                                                        {tpl.description}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {/* Category Filter Chips */}
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.chipsScroll}>
                                        {['All Automations', 'Welcome', 'Auto Reply', 'Follow Up', 'Keyword Match', 'Others'].map((cat) => (
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
                            renderItem={({ item }) => {
                                const trgMeta = TRIGGER_DEFS[item.trigger_type] || TRIGGER_DEFS.new_message_received;
                                return (
                                    <TouchableOpacity
                                        style={styles.automationCard}
                                        activeOpacity={0.85}
                                        onPress={() => handleOpenEdit(item)}>
                                        {/* Top Row: Icon, Title, Status, Switch, More */}
                                        <View style={styles.cardTopRow}>
                                            <View style={[styles.cardIconBox, { backgroundColor: item.isActive ? '#DCFCE7' : '#F1F5F9' }]}>
                                                <IconZap size={20} color={item.isActive ? Colors.primaryGreen : '#94A3B8'} />
                                            </View>

                                            <View style={styles.cardHeaderInfo}>
                                                <View style={styles.titleBadgeRow}>
                                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                                    {item.isActive && (
                                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryGreen, marginLeft: 2 }} />
                                                    )}
                                                </View>
                                                <Text style={styles.cardDescription} numberOfLines={2}>
                                                    {item.description}
                                                </Text>

                                                {/* Trigger Pill Badge */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 6 }}>
                                                    <View
                                                        style={{
                                                            backgroundColor: trgMeta.pillBg,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 2.5,
                                                            borderRadius: 12,
                                                        }}>
                                                        <Text style={{ fontSize: 10, fontWeight: '700', color: trgMeta.pillColor }}>
                                                            {trgMeta.label}
                                                        </Text>
                                                    </View>

                                                    {item.trigger_type === 'keyword_match' && item.trigger_config?.keywords && (
                                                        <Text style={{ fontSize: 10.5, color: '#64748B', fontWeight: '500' }}>
                                                            "{item.trigger_config.keywords}"
                                                        </Text>
                                                    )}
                                                </View>
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
                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    onPress={() => {
                                                        setSelectedAutomation(item);
                                                        setOptionsModalVisible(true);
                                                    }}>
                                                    <MoreDotsIcon size={16} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Bottom Metadata Bar: Runs, Last Execution, Steps count */}
                                        <View style={styles.metricsRow}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <IconPlay size={11} color="#059669" />
                                                <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>
                                                    {item.execution_count} {item.execution_count === 1 ? 'run' : 'runs'}
                                                </Text>
                                            </View>

                                            <Text style={{ fontSize: 11, color: '#94A3B8' }}>·</Text>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <IconClock size={11} color="#64748B" />
                                                <Text style={{ fontSize: 11, color: '#64748B' }}>
                                                    last {formatRelativeTime(item.last_executed_at)}
                                                </Text>
                                            </View>

                                            <Text style={{ fontSize: 11, color: '#94A3B8' }}>·</Text>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <IconBranch size={11} color="#7C3AED" />
                                                <Text style={{ fontSize: 11, color: '#7C3AED', fontWeight: '600' }}>
                                                    {(item.steps && item.steps.length) || 2} steps
                                                </Text>
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
                    onPress={handleOpenCreateNew}>
                    <IconPlus size={24} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Bottom Navigation Tab Bar */}
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

            {/* Smooth Modal: Automation Options Sheet */}
            <SmoothModal visible={optionsModalVisible} onClose={() => setOptionsModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>
                        {selectedAutomation?.title}
                    </Text>
                    <TouchableOpacity onPress={() => setOptionsModalVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {selectedAutomation && (
                    <View style={{ gap: 4 }}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
                            onPress={() => handleOpenEdit(selectedAutomation)}>
                            <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <IconPencil size={17} color="#2563EB" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>Edit Automation</Text>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>Modify trigger and multi-step workflow tree</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
                            onPress={() => handleDuplicate(selectedAutomation)}>
                            <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <IconCopy size={17} color="#475569" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>Duplicate Automation</Text>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>Create a copy with same triggers and steps</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
                            onPress={() => handleOpenLogs(selectedAutomation)}>
                            <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <IconFileText size={17} color="#059669" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>View Execution Logs</Text>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>Inspect past WhatsApp trigger runs and status</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
                            onPress={() => handleDeleteAutomation(selectedAutomation)}>
                            <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <IconTrash size={17} color="#DC2626" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>Delete Automation</Text>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>Permanently remove rule and step data</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </SmoothModal>

            {/* Smooth Modal: Full Visual Multi-Step Builder */}
            <SmoothModal visible={builderModalVisible} onClose={() => setBuilderModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>
                            {isEditing ? 'Edit Automation' : 'Create Automation'}
                        </Text>
                        <Text style={{ fontSize: 11.5, color: '#64748B' }}>
                            React to WhatsApp® events with automated multi-step actions
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setBuilderModalVisible(false)}>
                        <IconClose size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.select({ ios: 20, android: 40 })}
                    keyboardShouldPersistTaps="handled"
                    enableAutomaticScroll={true}
                    style={{ maxHeight: 460 }}
                    showsVerticalScrollIndicator={false}>
                    {/* Automation Title & Description */}
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 4 }}>
                        Automation Title *
                    </Text>
                    <TextInput
                        style={{
                            height: 42,
                            borderWidth: 1,
                            borderColor: '#CBD5E1',
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            fontSize: 13,
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                            marginBottom: 10,
                        }}
                        placeholder="e.g. Instant Pricing Quote & Bot Triage"
                        placeholderTextColor="#94A3B8"
                        value={builderName}
                        onChangeText={setBuilderName}
                    />

                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 4 }}>
                        Description (Optional)
                    </Text>
                    <TextInput
                        style={{
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#CBD5E1',
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            fontSize: 12,
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                            marginBottom: 12,
                        }}
                        placeholder="e.g. Dispatches welcome greeting and tags leads"
                        placeholderTextColor="#94A3B8"
                        value={builderDesc}
                        onChangeText={setBuilderDesc}
                    />

                    {/* Active Status Row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B' }}>Activate Workflow</Text>
                            <Text style={{ fontSize: 10.5, color: '#64748B' }}>When active, incoming events trigger this flow</Text>
                        </View>
                        <Switch
                            value={builderIsActive}
                            onValueChange={setBuilderIsActive}
                            trackColor={{ false: '#CBD5E1', true: Colors.primaryGreen }}
                        />
                    </View>

                    {/* Section 1: Trigger Selection */}
                    <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A', marginBottom: 6 }}>
                        1. Select Trigger Event
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {Object.entries(TRIGGER_DEFS).map(([key, def]) => {
                            const isSel = builderTriggerType === key;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={{
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 8,
                                        backgroundColor: isSel ? Colors.primaryGreen : '#F1F5F9',
                                        borderWidth: 1,
                                        borderColor: isSel ? Colors.primaryGreen : '#CBD5E1',
                                    }}
                                    onPress={() => setBuilderTriggerType(key as AutomationTriggerType)}>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: isSel ? '#FFFFFF' : '#475569' }}>
                                        {def.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Conditional Trigger Options */}
                    {builderTriggerType === 'keyword_match' && (
                        <View style={{ backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 4 }}>
                                Trigger Keywords (Comma-separated)
                            </Text>
                            <TextInput
                                style={{ height: 38, backgroundColor: '#FFFFFF', borderRadius: 6, borderWidth: 1, borderColor: '#FCD34D', paddingHorizontal: 8, fontSize: 12, color: '#78350F', marginBottom: 8 }}
                                placeholder="hello, pricing, demo, buy, help"
                                placeholderTextColor="#B45309"
                                value={builderKeywords}
                                onChangeText={setBuilderKeywords}
                            />
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                {(['contains', 'word', 'exact'] as const).map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={{
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 4,
                                            backgroundColor: builderMatchType === m ? '#B45309' : '#FFFFFF',
                                        }}
                                        onPress={() => setBuilderMatchType(m)}>
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: builderMatchType === m ? '#FFFFFF' : '#92400E' }}>
                                            {m === 'contains' ? 'Contains' : m === 'word' ? 'Whole Word' : 'Exact Match'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {builderTriggerType === 'interactive_reply' && (
                        <View style={{ backgroundColor: '#EDE9FE', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#DDD6FE' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#5B21B6', marginBottom: 4 }}>
                                Match Reply IDs (Buttons / List items)
                            </Text>
                            <TextInput
                                style={{ height: 38, backgroundColor: '#FFFFFF', borderRadius: 6, borderWidth: 1, borderColor: '#C4B5FD', paddingHorizontal: 8, fontSize: 12, color: '#4C1D95' }}
                                placeholder="btn_demo, btn_pricing, list_service_1"
                                placeholderTextColor="#7C3AED"
                                value={builderReplyIds}
                                onChangeText={setBuilderReplyIds}
                            />
                        </View>
                    )}

                    {builderTriggerType === 'tag_added' && (
                        <View style={{ backgroundColor: '#FCE7F3', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#FBCFE8' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#9D174D', marginBottom: 4 }}>
                                Trigger on Tag Added
                            </Text>
                            <TextInput
                                style={{ height: 38, backgroundColor: '#FFFFFF', borderRadius: 6, borderWidth: 1, borderColor: '#F9A8D4', paddingHorizontal: 8, fontSize: 12, color: '#831843' }}
                                placeholder="e.g. Hot Lead, High Value, VIP"
                                placeholderTextColor="#BE185D"
                                value={builderTagName}
                                onChangeText={setBuilderTagName}
                            />
                        </View>
                    )}

                    {/* Section 2: Action Sequence Steps */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
                        <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A' }}>
                            2. Workflow Action Steps ({builderSteps.length})
                        </Text>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryGreen, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 }}
                            onPress={() => setStepPickerModalVisible(true)}>
                            <IconPlus size={12} color="#FFFFFF" />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>Add Step</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Steps Timeline Render */}
                    {builderSteps.length === 0 ? (
                        <View style={{ padding: 18, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', alignItems: 'center', marginBottom: 14 }}>
                            <IconBranch size={24} color="#94A3B8" />
                            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>No action steps yet.</Text>
                            <Text style={{ fontSize: 11, color: '#94A3B8' }}>Tap "+ Add Step" to add message, buttons, tags or delays.</Text>
                        </View>
                    ) : (
                        builderSteps.map((step, idx) => {
                            const def = STEP_DEFS[step.step_type] || STEP_DEFS.send_message;
                            return (
                                <View
                                    key={idx}
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: '#E2E8F0',
                                        borderLeftWidth: 4,
                                        borderLeftColor: def.color,
                                        padding: 10,
                                        marginBottom: 10,
                                    }}>
                                    {/* Step Header */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: def.color, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>{idx + 1}</Text>
                                            </View>
                                            <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#1E293B' }}>{def.label}</Text>
                                        </View>

                                        {/* Step Reorder & Delete Actions */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            {idx > 0 && (
                                                <TouchableOpacity onPress={() => handleMoveStep(idx, 'up')}>
                                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>{'^'}</Text>
                                                </TouchableOpacity>
                                            )}
                                            {idx < builderSteps.length - 1 && (
                                                <TouchableOpacity onPress={() => handleMoveStep(idx, 'down')}>
                                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>{'v'}</Text>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity onPress={() => handleRemoveStep(idx)}>
                                                <IconTrash size={14} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Inline Step Config Controls */}
                                    {step.step_type === 'send_message' && (
                                        <View>
                                            <TextInput
                                                style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 8, fontSize: 12, color: '#1E293B', height: 60, textAlignVertical: 'top' }}
                                                multiline
                                                placeholder="Message text (e.g. Hello {{ contact.name }}...)"
                                                placeholderTextColor="#94A3B8"
                                                value={step.step_config.text || ''}
                                                onChangeText={(val) => handleUpdateStepConfig(idx, 'text', val)}
                                            />
                                            <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                                                Supported tags: {'{{ contact.name }}'}, {'{{ message.text }}'}
                                            </Text>
                                        </View>
                                    )}

                                    {step.step_type === 'send_buttons' && (
                                        <View style={{ gap: 6 }}>
                                            <TextInput
                                                style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, height: 36, fontSize: 12, color: '#1E293B' }}
                                                placeholder="Body text"
                                                value={step.step_config.text || ''}
                                                onChangeText={(val) => handleUpdateStepConfig(idx, 'text', val)}
                                            />
                                            <TextInput
                                                style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, height: 32, fontSize: 11, color: '#1E293B' }}
                                                placeholder="Button 1 label (e.g. Book Demo)"
                                                value={step.step_config.btn1 || ''}
                                                onChangeText={(val) => handleUpdateStepConfig(idx, 'btn1', val)}
                                            />
                                            <TextInput
                                                style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, height: 32, fontSize: 11, color: '#1E293B' }}
                                                placeholder="Button 2 label (e.g. View Pricing)"
                                                value={step.step_config.btn2 || ''}
                                                onChangeText={(val) => handleUpdateStepConfig(idx, 'btn2', val)}
                                            />
                                        </View>
                                    )}

                                    {step.step_type === 'add_tag' && (
                                        <TextInput
                                            style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, height: 36, fontSize: 12, color: '#1E293B' }}
                                            placeholder="Tag name to add (e.g. VIP, Lead, Demo Booked)"
                                            value={step.step_config.tag_name || ''}
                                            onChangeText={(val) => handleUpdateStepConfig(idx, 'tag_name', val)}
                                        />
                                    )}

                                    {step.step_type === 'wait' && (
                                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                            <TextInput
                                                style={{ width: 60, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, height: 36, fontSize: 12, color: '#1E293B', textAlign: 'center' }}
                                                keyboardType="numeric"
                                                value={String(step.step_config.amount || 10)}
                                                onChangeText={(val) => handleUpdateStepConfig(idx, 'amount', Number(val) || 1)}
                                            />
                                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                                {(['minutes', 'hours', 'days'] as const).map((u) => (
                                                    <TouchableOpacity
                                                        key={u}
                                                        style={{
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 6,
                                                            borderRadius: 4,
                                                            backgroundColor: step.step_config.unit === u ? '#64748B' : '#F1F5F9',
                                                        }}
                                                        onPress={() => handleUpdateStepConfig(idx, 'unit', u)}>
                                                        <Text style={{ fontSize: 10, fontWeight: '700', color: step.step_config.unit === u ? '#FFFFFF' : '#475569' }}>
                                                            {u}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {step.step_type === 'assign_conversation' && (
                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                            {(['round_robin', 'specific'] as const).map((m) => (
                                                <TouchableOpacity
                                                    key={m}
                                                    style={{
                                                        flex: 1,
                                                        paddingVertical: 6,
                                                        borderRadius: 4,
                                                        backgroundColor: step.step_config.mode === m ? '#1E40AF' : '#F1F5F9',
                                                        alignItems: 'center',
                                                    }}
                                                    onPress={() => handleUpdateStepConfig(idx, 'mode', m)}>
                                                    <Text style={{ fontSize: 10, fontWeight: '700', color: step.step_config.mode === m ? '#FFFFFF' : '#475569' }}>
                                                        {m === 'round_robin' ? 'Round-Robin' : 'Specific Agent'}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {step.step_type === 'create_deal' && (
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            <TextInput
                                                style={{ flex: 2, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, height: 36, fontSize: 12, color: '#1E293B' }}
                                                placeholder="Deal title"
                                                value={step.step_config.title || ''}
                                                onChangeText={(val) => handleUpdateStepConfig(idx, 'title', val)}
                                            />
                                            <TextInput
                                                style={{ flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, height: 36, fontSize: 12, color: '#1E293B' }}
                                                keyboardType="numeric"
                                                placeholder="Value ($)"
                                                value={String(step.step_config.value || '')}
                                                onChangeText={(val) => handleUpdateStepConfig(idx, 'value', Number(val) || 0)}
                                            />
                                        </View>
                                    )}

                                    {step.step_type === 'condition' && (
                                        <View>
                                            <Text style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>
                                                Branch: Subject = {step.step_config.subject} ({step.step_config.operand})
                                            </Text>
                                            <View style={{ backgroundColor: '#F8FAFC', padding: 6, borderRadius: 4 }}>
                                                <Text style={{ fontSize: 10.5, color: '#059669', fontWeight: '700' }}>[Yes Path]: Dispatches when condition is met</Text>
                                                <Text style={{ fontSize: 10.5, color: '#DC2626', fontWeight: '700' }}>[No Path]: Fallback path</Text>
                                            </View>
                                        </View>
                                    )}

                                    {step.step_type === 'close_conversation' && (
                                        <Text style={{ fontSize: 11, color: '#64748B' }}>
                                            Marks chat thread as resolved & closed. No configuration needed.
                                        </Text>
                                    )}
                                </View>
                            );
                        })
                    )}
                </KeyboardAwareScrollView>

                {/* Builder Actions Footer */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity
                        style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => setBuilderModalVisible(false)}>
                        <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flex: 2, height: 44, borderRadius: 10, backgroundColor: Colors.primaryGreen, alignItems: 'center', justifyContent: 'center' }}
                        disabled={isSaving}
                        onPress={handleSaveAutomation}>
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                {isEditing ? 'Save Changes' : 'Save & Activate'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SmoothModal>

            {/* Smooth Modal: Step Type Picker Modal (13 Step Types matching Web) */}
            <SmoothModal visible={stepPickerModalVisible} onClose={() => setStepPickerModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Add Workflow Step</Text>
                    <TouchableOpacity onPress={() => setStepPickerModalVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                    {Object.entries(STEP_DEFS).map(([key, def]) => (
                        <TouchableOpacity
                            key={key}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                                marginBottom: 6,
                                backgroundColor: '#F8FAFC',
                                borderWidth: 1,
                                borderColor: '#E2E8F0',
                            }}
                            onPress={() => handleAddStepToWorkflow(key as AutomationStepType)}>
                            <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: def.color, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                <IconPlus size={16} color="#FFFFFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>{def.label}</Text>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>{def.desc}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SmoothModal>

            {/* Smooth Modal: Execution Logs */}
            <SmoothModal visible={logsModalVisible} onClose={() => setLogsModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
                            Execution Logs
                        </Text>
                        <Text style={{ fontSize: 11, color: '#64748B' }} numberOfLines={1}>
                            {selectedAutomation?.title}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setLogsModalVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {isLoadingLogs ? (
                    <View style={{ padding: 30, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={Colors.primaryGreen} />
                        <Text style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>Loading execution history...</Text>
                    </View>
                ) : executionLogs.length === 0 ? (
                    <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, marginVertical: 8 }}>
                        <IconClock size={32} color="#94A3B8" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', marginTop: 8 }}>No executions yet</Text>
                        <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
                            Trigger this automation from WhatsApp to see execution runs and delivery diagnostics here.
                        </Text>
                    </View>
                ) : (
                    <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                        {executionLogs.map((log) => (
                            <View
                                key={log.id}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 8,
                                    padding: 10,
                                    marginBottom: 8,
                                    borderWidth: 1,
                                    borderColor: '#E2E8F0',
                                }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B' }}>
                                        {log.contact_name}
                                    </Text>
                                    <View
                                        style={{
                                            backgroundColor: log.status === 'success' ? '#DCFCE7' : log.status === 'partial' ? '#FEF3C7' : '#FEE2E2',
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                        }}>
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                fontWeight: '800',
                                                color: log.status === 'success' ? '#166534' : log.status === 'partial' ? '#92400E' : '#991B1B',
                                            }}>
                                            {log.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                                    Event: {log.trigger_event} • {log.steps_executed.length} steps executed
                                </Text>
                                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                                    {formatRelativeTime(log.created_at)}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <TouchableOpacity
                    style={{ height: 42, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}
                    onPress={() => setLogsModalVisible(false)}>
                    <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 13 }}>Close</Text>
                </TouchableOpacity>
            </SmoothModal>
        </SafeAreaView>
    );
};
