import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    Switch,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import { AppBottomBar, BottomNavTab } from '../../components/AppBottomBar';
import { SmoothModal } from '../../components/SmoothModal';
import { ChevronBackIcon } from '../../components/ChatIcons';
import {
    SparklesIcon,
    BotIcon,
    Settings2Icon,
    BookOpenIcon,
    BarChart3Icon,
    RotateCcwIcon,
    SendPlaneIcon,
    EyeIcon,
    EyeOffIcon,
    KeyIcon,
    UserHandoffIcon,
} from '../../components/AgentIcons';
import {
    CheckCircleIcon,
    ClockIcon,
    UsersGroupIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    CloseIcon,
} from '../../components/FlowIcons';
import {
    crmService,
    DynamicAiConfig,
    DynamicAiKnowledgeDoc,
    DynamicAiUsage,
    AiProvider,
} from '../../services/crmService';

const MASKED_KEY = '••••••••••••••••';

const POPULAR_MODELS: Record<AiProvider, string[]> = {
    openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-5.4-mini'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-haiku-4-5-20251001'],
    gemini: ['gemini-1.5-flash', 'gemini-3.5-flash', 'gemini-3.8-flash'],
    openai_compatible: ['llama-3.3-70b', 'deepseek-v3', 'mistral-large'],
};

const KEY_PLACEHOLDERS: Record<AiProvider, string> = {
    openai: 'sk-...',
    anthropic: 'sk-ant-...',
    gemini: 'AIzaSy...',
    openai_compatible: 'your-api-key',
};

const SYSTEM_PROMPT_PRESETS = [
    {
        title: 'Customer Support',
        prompt:
            'You are the official WhatsApp assistant for our business. Answer questions concisely, politely, and accurately based on company FAQs. If the customer asks for a person, human agent, or representative, offer a transfer.',
    },
    {
        title: 'Sales & Booking',
        prompt:
            'You are our sales & appointment booking representative. Help prospects choose the right plan, explain our pricing options, and collect their contact details for a scheduled demo.',
    },
    {
        title: 'Strict FAQ Only',
        prompt:
            'You are a strict FAQ answering agent. Only answer using the verified facts in the knowledge base. If an answer cannot be determined from the knowledge base, state that clearly and offer a human handoff.',
    },
];

export interface AgentsScreenProps {
    onBack?: () => void;
    onNavigateTab?: (tab: BottomNavTab) => void;
    onOpenDashboard?: () => void;
    onOpenNotifications?: () => void;
    onOpenProfile?: () => void;
}

export const AgentsScreen: React.FC<AgentsScreenProps> = ({
    onBack,
    onNavigateTab,
    onOpenDashboard,
    onOpenNotifications,
    onOpenProfile,
}) => {
    // -----------------------------------------------------------------
    // TABS
    // -----------------------------------------------------------------
    const [currentTab, setCurrentTab] = useState<'playground' | 'setup' | 'knowledge' | 'usage'>('playground');

    // -----------------------------------------------------------------
    // AI CONFIG STATE (SETUP TAB)
    // -----------------------------------------------------------------
    const [config, setConfig] = useState<DynamicAiConfig>({
        configured: true,
        provider: 'openai',
        model: 'gpt-4o-mini',
        has_key: true,
        is_active: true,
        auto_reply_enabled: true,
        auto_reply_max_per_conversation: 3,
        system_prompt: SYSTEM_PROMPT_PRESETS[0].prompt,
    });
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [isTestingConn, setIsTestingConn] = useState(false);
    const [testConnResult, setTestConnResult] = useState<{ success: boolean; message: string } | null>(null);

    // Form editing states
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [baseUrlInput, setBaseUrlInput] = useState('');
    const [customModelInput, setCustomModelInput] = useState('');

    // -----------------------------------------------------------------
    // PLAYGROUND STATE
    // -----------------------------------------------------------------
    const [playMessages, setPlayMessages] = useState<
        Array<{ role: 'user' | 'assistant'; content: string; handoff?: boolean }>
    >([]);
    const [playInputText, setPlayInputText] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

    // -----------------------------------------------------------------
    // KNOWLEDGE BASE STATE
    // -----------------------------------------------------------------
    const [docs, setDocs] = useState<DynamicAiKnowledgeDoc[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [docModalOpen, setDocModalOpen] = useState(false);
    const [docModalMode, setDocModalMode] = useState<'create' | 'edit'>('create');
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [docTitle, setDocTitle] = useState('');
    const [docContent, setDocContent] = useState('');
    const [isSavingDoc, setIsSavingDoc] = useState(false);

    // -----------------------------------------------------------------
    // USAGE STATE
    // -----------------------------------------------------------------
    const [usageWindow, setUsageWindow] = useState<7 | 30 | 90>(30);
    const [usageData, setUsageData] = useState<DynamicAiUsage | null>(null);
    const [isLoadingUsage, setIsLoadingUsage] = useState(false);

    // -----------------------------------------------------------------
    // LOAD INITIAL DATA
    // -----------------------------------------------------------------
    const loadAiConfig = useCallback(async () => {
        try {
            setIsLoadingConfig(true);
            const cfg = await crmService.fetchAiConfig();
            setConfig(cfg);
            setBaseUrlInput(cfg.base_url || '');
            setCustomModelInput(cfg.model);
            if (cfg.has_key) {
                setApiKeyInput(MASKED_KEY);
            }
        } catch (err) {
            console.warn('Failed to load AI config:', err);
        } finally {
            setIsLoadingConfig(false);
        }
    }, []);

    const loadDocs = useCallback(async () => {
        try {
            setIsLoadingDocs(true);
            const list = await crmService.fetchAiKnowledgeDocs();
            setDocs(list);
        } catch (err) {
            console.warn('Failed to load knowledge docs:', err);
        } finally {
            setIsLoadingDocs(false);
        }
    }, []);

    const loadUsage = useCallback(async (days: 7 | 30 | 90) => {
        try {
            setIsLoadingUsage(true);
            const data = await crmService.fetchAiUsage(days);
            setUsageData(data);
        } catch (err) {
            console.warn('Failed to load usage data:', err);
        } finally {
            setIsLoadingUsage(false);
        }
    }, []);

    useEffect(() => {
        loadAiConfig();
        loadDocs();
        loadUsage(30);
    }, [loadAiConfig, loadDocs, loadUsage]);

    // -----------------------------------------------------------------
    // PLAYGROUND ACTIONS
    // -----------------------------------------------------------------
    const handleSendPlayground = async () => {
        if (!playInputText.trim() || isPlaying) return;
        const userText = playInputText.trim();
        setPlayInputText('');

        const nextTurns = [
            ...playMessages,
            { role: 'user' as const, content: userText },
        ];
        setPlayMessages(nextTurns);
        setIsPlaying(true);

        try {
            const res = await crmService.testAiPlayground(nextTurns, config);
            setPlayMessages([
                ...nextTurns,
                { role: 'assistant', content: res.reply, handoff: res.handoff },
            ]);
        } catch (err) {
            setPlayMessages([
                ...nextTurns,
                {
                    role: 'assistant',
                    content: 'An error occurred while generating AI response. Please check your AI configuration in Setup.',
                },
            ]);
        } finally {
            setIsPlaying(false);
        }
    };

    const handleResetPlayground = () => {
        setPlayMessages([]);
    };

    // -----------------------------------------------------------------
    // SETUP TAB ACTIONS
    // -----------------------------------------------------------------
    const handleSelectProvider = (prov: AiProvider) => {
        const defaultMod = POPULAR_MODELS[prov][0] || 'gpt-4o-mini';
        setConfig((prev) => ({
            ...prev,
            provider: prov,
            model: defaultMod,
        }));
        setCustomModelInput(defaultMod);
        if (prov === 'openai_compatible' && !baseUrlInput) {
            setBaseUrlInput('https://api.groq.com/openai/v1');
        }
    };

    const handleSelectModel = (mod: string) => {
        setConfig((prev) => ({ ...prev, model: mod }));
        setCustomModelInput(mod);
    };

    const handleTestConnection = async () => {
        setIsTestingConn(true);
        setTestConnResult(null);
        try {
            const keyToTest = apiKeyInput === MASKED_KEY ? '' : apiKeyInput;
            const res = await crmService.testAiConnection(
                config.provider,
                config.model,
                keyToTest,
                baseUrlInput
            );
            setTestConnResult(res);
        } catch (err: any) {
            setTestConnResult({
                success: false,
                message: err?.message || 'Connection test failed. Please verify your API key.',
            });
        } finally {
            setIsTestingConn(false);
        }
    };

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            const patch: Partial<DynamicAiConfig> = {
                ...config,
                base_url: baseUrlInput.trim() || null,
                model: customModelInput.trim() || config.model,
            };
            if (apiKeyInput && apiKeyInput !== MASKED_KEY) {
                patch.api_key = apiKeyInput.trim();
            }

            const saved = await crmService.saveAiConfig(patch);
            setConfig(saved);
            Alert.alert('Configuration Saved', 'Your AI agent settings are updated and active for incoming WhatsApp chats.');
        } catch (err) {
            Alert.alert('Error', 'Failed to save AI configuration.');
        } finally {
            setIsSavingConfig(false);
        }
    };

    const handleRemoveConfig = () => {
        Alert.alert(
            'Remove AI Configuration',
            'Are you sure you want to remove this AI agent setup? Autoreply will be disabled.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await crmService.deleteAiConfig();
                        await loadAiConfig();
                        setApiKeyInput('');
                        Alert.alert('Reset', 'AI agent configuration removed.');
                    },
                },
            ]
        );
    };

    // -----------------------------------------------------------------
    // KNOWLEDGE TAB ACTIONS
    // -----------------------------------------------------------------
    const openCreateDocModal = () => {
        setDocModalMode('create');
        setEditingDocId(null);
        setDocTitle('');
        setDocContent('');
        setDocModalOpen(true);
    };

    const openEditDocModal = (doc: DynamicAiKnowledgeDoc) => {
        setDocModalMode('edit');
        setEditingDocId(doc.id);
        setDocTitle(doc.title);
        setDocContent(doc.content);
        setDocModalOpen(true);
    };

    const handleSaveDoc = async () => {
        if (!docTitle.trim() || !docContent.trim()) {
            Alert.alert('Required', 'Please enter a document title and factual content.');
            return;
        }

        setIsSavingDoc(true);
        try {
            if (docModalMode === 'create') {
                await crmService.createAiKnowledgeDoc(docTitle, docContent);
            } else if (editingDocId) {
                await crmService.updateAiKnowledgeDoc(editingDocId, docTitle, docContent);
            }
            await loadDocs();
            setDocModalOpen(false);
        } catch (err) {
            Alert.alert('Error', 'Failed to save knowledge document.');
        } finally {
            setIsSavingDoc(false);
        }
    };

    const handleDeleteDoc = (doc: DynamicAiKnowledgeDoc) => {
        Alert.alert(
            'Delete Knowledge Document',
            `Delete "${doc.title}"? The AI agent will no longer reference this information.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await crmService.deleteAiKnowledgeDoc(doc.id);
                        await loadDocs();
                    },
                },
            ]
        );
    };

    // -----------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <AppHeader
                title="AI Agents"
                subtitle="Autonomous conversational copilot & knowledge bases"
                onBack={onBack}
                onPressDashboard={onOpenDashboard}
                onPressNotifications={onOpenNotifications}
                onPressProfile={onOpenProfile || (() => onNavigateTab && onNavigateTab('More'))}
                unreadCount={0}
                rightElement={
                    <View style={styles.headerRightRow}>
                        <View
                            style={[
                                styles.headerStatusBadge,
                                config.configured && config.is_active
                                    ? styles.headerStatusBadgeActive
                                    : styles.headerStatusBadgeSetup,
                            ]}>
                            <View
                                style={[
                                    styles.headerStatusDot,
                                    {
                                        backgroundColor:
                                            config.configured && config.is_active ? '#00A859' : '#D97706',
                                    },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.headerStatusText,
                                    {
                                        color:
                                            config.configured && config.is_active ? '#00A859' : '#D97706',
                                    },
                                ]}>
                                {config.configured && config.is_active ? 'Ready' : 'Setup'}
                            </Text>
                        </View>
                    </View>
                }
            />

            {/* Top Navigation Tabs */}
            <View style={styles.tabBarContainer}>
                <TouchableOpacity
                    style={[styles.tabBtn, currentTab === 'playground' && styles.tabBtnActive]}
                    onPress={() => setCurrentTab('playground')}>
                    <SparklesIcon
                        size={15}
                        color={currentTab === 'playground' ? '#00A859' : '#64748B'}
                    />
                    <Text
                        style={[
                            styles.tabBtnText,
                            currentTab === 'playground' && styles.tabBtnTextActive,
                        ]}>
                        Playground
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabBtn, currentTab === 'setup' && styles.tabBtnActive]}
                    onPress={() => setCurrentTab('setup')}>
                    <Settings2Icon
                        size={15}
                        color={currentTab === 'setup' ? '#00A859' : '#64748B'}
                    />
                    <Text
                        style={[
                            styles.tabBtnText,
                            currentTab === 'setup' && styles.tabBtnTextActive,
                        ]}>
                        Setup
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabBtn, currentTab === 'knowledge' && styles.tabBtnActive]}
                    onPress={() => setCurrentTab('knowledge')}>
                    <BookOpenIcon
                        size={15}
                        color={currentTab === 'knowledge' ? '#00A859' : '#64748B'}
                    />
                    <Text
                        style={[
                            styles.tabBtnText,
                            currentTab === 'knowledge' && styles.tabBtnTextActive,
                        ]}>
                        Knowledge
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabBtn, currentTab === 'usage' && styles.tabBtnActive]}
                    onPress={() => setCurrentTab('usage')}>
                    <BarChart3Icon
                        size={15}
                        color={currentTab === 'usage' ? '#00A859' : '#64748B'}
                    />
                    <Text
                        style={[
                            styles.tabBtnText,
                            currentTab === 'usage' && styles.tabBtnTextActive,
                        ]}>
                        Usage
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ========================================================= */}
            {/* 1. PLAYGROUND TAB */}
            {/* ========================================================= */}
            {currentTab === 'playground' && (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    {/* Top Playground Status Bar */}
                    <View style={styles.playgroundStatusBar}>
                        <View style={styles.playgroundModelChip}>
                            <BotIcon size={14} color="#00A859" />
                            <Text style={styles.playgroundModelChipText}>
                                {config.provider}: {config.model}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.playgroundResetBtn}
                            onPress={handleResetPlayground}
                            disabled={playMessages.length === 0 || isPlaying}>
                            <RotateCcwIcon size={13} color="#64748B" />
                            <Text style={styles.playgroundResetBtnText}>Reset</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Messages Scroll View */}
                    <ScrollView
                        style={styles.playgroundTranscript}
                        contentContainerStyle={styles.playgroundTranscriptContent}
                        showsVerticalScrollIndicator={false}>
                        {playMessages.length === 0 ? (
                            <View style={styles.playgroundEmptyWrap}>
                                <View style={styles.playgroundEmptyIconCircle}>
                                    <BotIcon size={32} color="#00A859" />
                                </View>
                                <Text style={styles.playgroundEmptyTitle}>Test Your AI Agent</Text>
                                <Text style={styles.playgroundEmptyDesc}>
                                    Ask sample questions to test how your AI agent will respond to incoming WhatsApp customer inquiries before going live.
                                </Text>
                                <TouchableOpacity
                                    style={styles.playgroundGoToSetupBtn}
                                    onPress={() => setCurrentTab('setup')}>
                                    <Text style={styles.playgroundGoToSetupText}>
                                        Configure Persona & Keys in Setup →
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            playMessages.map((msg, idx) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.playMsgRow,
                                            isUser ? styles.playMsgRowUser : styles.playMsgRowAi,
                                        ]}>
                                        <View
                                            style={[
                                                styles.playBubble,
                                                isUser ? styles.playBubbleUser : styles.playBubbleAi,
                                            ]}>
                                            <Text style={styles.playBubbleText}>{msg.content}</Text>
                                        </View>

                                        {/* Handoff Flag */}
                                        {msg.handoff && (
                                            <View style={styles.playHandoffBadge}>
                                                <UserHandoffIcon size={12} color="#E11D48" />
                                                <Text style={styles.playHandoffBadgeText}>
                                                    Agent Handoff Triggered
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}

                        {isPlaying && (
                            <View style={[styles.playMsgRow, styles.playMsgRowAi]}>
                                <View style={[styles.playBubble, styles.playBubbleAi, { paddingVertical: 12 }]}>
                                    <ActivityIndicator size="small" color="#00A859" />
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Bottom Chat Input */}
                    <View style={styles.playgroundInputContainer}>
                        <TextInput
                            style={styles.playgroundTextInput}
                            placeholder="Type a test question (e.g. What is your refund policy?)..."
                            placeholderTextColor="#94A3B8"
                            value={playInputText}
                            onChangeText={setPlayInputText}
                            onSubmitEditing={handleSendPlayground}
                        />
                        <TouchableOpacity
                            style={[
                                styles.playgroundSendBtn,
                                (!playInputText.trim() || isPlaying) && { opacity: 0.5 },
                            ]}
                            disabled={!playInputText.trim() || isPlaying}
                            onPress={handleSendPlayground}>
                            <SendPlaneIcon size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}

            {/* ========================================================= */}
            {/* 2. SETUP TAB */}
            {/* ========================================================= */}
            {currentTab === 'setup' && (
                <ScrollView
                    style={styles.setupScroll}
                    contentContainerStyle={styles.setupContent}
                    showsVerticalScrollIndicator={false}>
                    {/* Master Switches Card */}
                    <View style={styles.setupCard}>
                        <View style={styles.switchRow}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <Text style={styles.switchTitle}>Enable AI Assistant</Text>
                                <Text style={styles.switchSubtitle}>
                                    Master switch for AI drafting and customer responses
                                </Text>
                            </View>
                            <Switch
                                value={config.is_active}
                                onValueChange={(val) => setConfig({ ...config, is_active: val })}
                                trackColor={{ false: '#CBD5E1', true: '#00A859' }}
                            />
                        </View>

                        <View style={styles.cardDivider} />

                        <View style={styles.switchRow}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <Text style={styles.switchTitle}>Inbound WhatsApp Auto-Reply</Text>
                                <Text style={styles.switchSubtitle}>
                                    Automatically answers customer questions 24/7 using company knowledge
                                </Text>
                            </View>
                            <Switch
                                value={config.auto_reply_enabled}
                                onValueChange={(val) => setConfig({ ...config, auto_reply_enabled: val })}
                                trackColor={{ false: '#CBD5E1', true: '#00A859' }}
                            />
                        </View>

                        <View style={styles.cardDivider} />

                        {/* Max Consecutive Replies */}
                        <Text style={styles.fieldLabel}>
                            Max Auto-Replies per Conversation: {config.auto_reply_max_per_conversation}
                        </Text>
                        <Text style={styles.fieldDesc}>
                            Limits bot replies per thread before automatically transferring to an agent queue.
                        </Text>
                        <View style={styles.repliesCountRow}>
                            {[1, 2, 3, 5, 10].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.repliesCountChip,
                                        config.auto_reply_max_per_conversation === num &&
                                            styles.repliesCountChipActive,
                                    ]}
                                    onPress={() =>
                                        setConfig({ ...config, auto_reply_max_per_conversation: num })
                                    }>
                                    <Text
                                        style={[
                                            styles.repliesCountChipText,
                                            config.auto_reply_max_per_conversation === num &&
                                                styles.repliesCountChipTextActive,
                                        ]}>
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Provider & Model Card */}
                    <View style={styles.setupCard}>
                        <Text style={styles.cardHeaderTitle}>AI PROVIDER & MODEL</Text>
                        <Text style={styles.fieldDesc}>
                            Bring your own API key. We connect directly to the provider without markup.
                        </Text>

                        {/* Provider Buttons */}
                        <View style={styles.providerGrid}>
                            {(['openai', 'anthropic', 'gemini', 'openai_compatible'] as AiProvider[]).map(
                                (prov) => {
                                    const isSelected = config.provider === prov;
                                    const label =
                                        prov === 'openai'
                                            ? 'OpenAI'
                                            : prov === 'anthropic'
                                            ? 'Anthropic'
                                            : prov === 'gemini'
                                            ? 'Google Gemini'
                                            : 'Custom Compatible';
                                    return (
                                        <TouchableOpacity
                                            key={prov}
                                            style={[
                                                styles.providerChip,
                                                isSelected && styles.providerChipActive,
                                            ]}
                                            onPress={() => handleSelectProvider(prov)}>
                                            <Text
                                                style={[
                                                    styles.providerChipText,
                                                    isSelected && styles.providerChipTextActive,
                                                ]}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }
                            )}
                        </View>

                        {/* Popular Models Chips */}
                        <Text style={styles.fieldLabel}>Recommended Models</Text>
                        <View style={styles.modelsRow}>
                            {(POPULAR_MODELS[config.provider] || []).map((mod) => {
                                const isSelected = config.model === mod;
                                return (
                                    <TouchableOpacity
                                        key={mod}
                                        style={[
                                            styles.modelChip,
                                            isSelected && styles.modelChipActive,
                                        ]}
                                        onPress={() => handleSelectModel(mod)}>
                                        <Text
                                            style={[
                                                styles.modelChipText,
                                                isSelected && styles.modelChipTextActive,
                                            ]}>
                                            {mod}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Custom Model Input */}
                        <Text style={styles.fieldLabel}>Model Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={customModelInput}
                            onChangeText={setCustomModelInput}
                            placeholder="e.g. gpt-4o-mini"
                            placeholderTextColor="#94A3B8"
                        />

                        {/* Base URL (if openai_compatible) */}
                        {config.provider === 'openai_compatible' && (
                            <>
                                <Text style={styles.fieldLabel}>Custom Base URL</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={baseUrlInput}
                                    onChangeText={setBaseUrlInput}
                                    placeholder="https://api.groq.com/openai/v1"
                                    placeholderTextColor="#94A3B8"
                                />
                            </>
                        )}

                        {/* API Key */}
                        <Text style={styles.fieldLabel}>Provider API Key</Text>
                        <View style={styles.apiKeyInputContainer}>
                            <KeyIcon size={15} color="#94A3B8" />
                            <TextInput
                                style={styles.apiKeyInput}
                                secureTextEntry={!showApiKey}
                                value={apiKeyInput}
                                onChangeText={setApiKeyInput}
                                placeholder={KEY_PLACEHOLDERS[config.provider]}
                                placeholderTextColor="#94A3B8"
                            />
                            <TouchableOpacity
                                style={styles.eyeToggleBtn}
                                onPress={() => setShowApiKey(!showApiKey)}>
                                {showApiKey ? (
                                    <EyeOffIcon size={16} color="#64748B" />
                                ) : (
                                    <EyeIcon size={16} color="#64748B" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Test Connection Result Banner */}
                        {testConnResult && (
                            <View
                                style={[
                                    styles.testResultBanner,
                                    testConnResult.success
                                        ? styles.testResultBannerSuccess
                                        : styles.testResultBannerFail,
                                ]}>
                                <Text
                                    style={[
                                        styles.testResultBannerText,
                                        testConnResult.success
                                            ? styles.testResultBannerTextSuccess
                                            : styles.testResultBannerTextFail,
                                    ]}>
                                    {testConnResult.message}
                                </Text>
                            </View>
                        )}

                        {/* Test Button */}
                        <TouchableOpacity
                            style={styles.testConnectionBtn}
                            activeOpacity={0.8}
                            disabled={isTestingConn}
                            onPress={handleTestConnection}>
                            {isTestingConn ? (
                                <ActivityIndicator size="small" color="#00A859" />
                            ) : (
                                <Text style={styles.testConnectionBtnText}>Test Connection</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Persona & System Prompt Card */}
                    <View style={styles.setupCard}>
                        <Text style={styles.cardHeaderTitle}>PERSONA & SYSTEM INSTRUCTIONS</Text>
                        <Text style={styles.fieldDesc}>
                            Instruct the AI how to represent your brand, its tone, and escalation rules.
                        </Text>

                        {/* Presets */}
                        <Text style={styles.fieldLabel}>Quick Presets</Text>
                        <View style={styles.presetsRow}>
                            {SYSTEM_PROMPT_PRESETS.map((p, pidx) => (
                                <TouchableOpacity
                                    key={pidx}
                                    style={styles.presetChip}
                                    onPress={() => setConfig({ ...config, system_prompt: p.prompt })}>
                                    <Text style={styles.presetChipText}>{p.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.fieldLabel}>System Prompt</Text>
                        <TextInput
                            style={[styles.textInput, { height: 110, textAlignVertical: 'top' }]}
                            multiline
                            value={config.system_prompt || ''}
                            onChangeText={(val) => setConfig({ ...config, system_prompt: val })}
                            placeholder="Enter business persona, tone, and escalation instructions..."
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={styles.saveConfigBtn}
                        activeOpacity={0.85}
                        disabled={isSavingConfig}
                        onPress={handleSaveConfig}>
                        {isSavingConfig ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveConfigBtnText}>Save AI Configuration</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.removeConfigBtn}
                        activeOpacity={0.8}
                        onPress={handleRemoveConfig}>
                        <Text style={styles.removeConfigBtnText}>Remove Configuration</Text>
                    </TouchableOpacity>

                    <View style={{ height: 32 }} />
                </ScrollView>
            )}

            {/* ========================================================= */}
            {/* 3. KNOWLEDGE BASE TAB */}
            {/* ========================================================= */}
            {currentTab === 'knowledge' && (
                <ScrollView
                    style={styles.setupScroll}
                    contentContainerStyle={styles.setupContent}
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.knowledgeHeaderRow}>
                        <View>
                            <Text style={styles.cardHeaderTitle}>COMPANY KNOWLEDGE BASE</Text>
                            <Text style={styles.fieldDesc}>
                                The AI searches these documents to answer WhatsApp customer questions.
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.addDocHeaderBtn} onPress={openCreateDocModal}>
                            <PlusIcon size={14} color="#FFFFFF" />
                            <Text style={styles.addDocHeaderBtnText}>Add Doc</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoadingDocs ? (
                        <ActivityIndicator size="large" color="#00A859" style={{ marginVertical: 32 }} />
                    ) : docs.length === 0 ? (
                        <View style={styles.emptyDocsWrap}>
                            <BookOpenIcon size={32} color="#94A3B8" />
                            <Text style={styles.emptyDocsTitle}>No Knowledge Documents</Text>
                            <Text style={styles.emptyDocsDesc}>
                                Add your company return policy, pricing tables, or FAQs to train your AI agent.
                            </Text>
                        </View>
                    ) : (
                        docs.map((doc) => (
                            <View key={doc.id} style={styles.docCard}>
                                <View style={styles.docCardLeft}>
                                    <View style={styles.docIconCircle}>
                                        <BookOpenIcon size={16} color="#00A859" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.docTitle} numberOfLines={1}>
                                            {doc.title}
                                        </Text>
                                        <Text style={styles.docSubtitle}>
                                            {doc.chunks_count} vector chunks • Verified
                                        </Text>
                                        <Text style={styles.docContentSnippet} numberOfLines={2}>
                                            {doc.content}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.docCardActions}>
                                    <TouchableOpacity
                                        style={styles.docActionBtn}
                                        onPress={() => openEditDocModal(doc)}>
                                        <PencilIcon size={14} color="#334155" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.docActionBtn, { backgroundColor: '#FEF2F2' }]}
                                        onPress={() => handleDeleteDoc(doc)}>
                                        <TrashIcon size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* ========================================================= */}
            {/* 4. USAGE & ANALYTICS TAB */}
            {/* ========================================================= */}
            {currentTab === 'usage' && (
                <ScrollView
                    style={styles.setupScroll}
                    contentContainerStyle={styles.setupContent}
                    showsVerticalScrollIndicator={false}>
                    {/* Window Selector */}
                    <View style={styles.windowSelectorRow}>
                        <Text style={styles.windowLabel}>Reporting Window:</Text>
                        <View style={styles.windowChipsRow}>
                            {([7, 30, 90] as const).map((w) => (
                                <TouchableOpacity
                                    key={w}
                                    style={[
                                        styles.windowChip,
                                        usageWindow === w && styles.windowChipActive,
                                    ]}
                                    onPress={() => {
                                        setUsageWindow(w);
                                        loadUsage(w);
                                    }}>
                                    <Text
                                        style={[
                                            styles.windowChipText,
                                            usageWindow === w && styles.windowChipTextActive,
                                        ]}>
                                        {w} Days
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {isLoadingUsage || !usageData ? (
                        <ActivityIndicator size="large" color="#00A859" style={{ marginVertical: 32 }} />
                    ) : (
                        <>
                            {/* KPI Grid */}
                            <View style={styles.usageKpiGrid}>
                                <View style={styles.usageKpiCard}>
                                    <Text style={styles.usageKpiValue}>
                                        {usageData.totals.calls.toLocaleString()}
                                    </Text>
                                    <Text style={styles.usageKpiLabel}>Total AI Calls</Text>
                                </View>

                                <View style={styles.usageKpiCard}>
                                    <Text style={styles.usageKpiValue}>
                                        {usageData.totals.total_tokens.toLocaleString()}
                                    </Text>
                                    <Text style={styles.usageKpiLabel}>Total Tokens</Text>
                                </View>

                                <View style={styles.usageKpiCard}>
                                    <Text style={styles.usageKpiValue}>
                                        {usageData.totals.prompt_tokens.toLocaleString()}
                                    </Text>
                                    <Text style={styles.usageKpiLabel}>Prompt Tokens</Text>
                                </View>

                                <View style={styles.usageKpiCard}>
                                    <Text style={[styles.usageKpiValue, { color: '#00A859' }]}>
                                        ${usageData.totals.estimated_cost_usd.toFixed(2)} USD
                                    </Text>
                                    <Text style={styles.usageKpiLabel}>Estimated Spend</Text>
                                </View>
                            </View>

                            {/* Mode Breakdown */}
                            <View style={styles.setupCard}>
                                <Text style={styles.cardHeaderTitle}>DISPATCH BREAKDOWN BY MODE</Text>
                                <View style={styles.modeRow}>
                                    <View style={styles.modeItem}>
                                        <Text style={styles.modeTitle}>WhatsApp Auto-Reply</Text>
                                        <Text style={styles.modeStats}>
                                            {usageData.by_mode.auto_reply.calls} calls •{' '}
                                            {usageData.by_mode.auto_reply.tokens.toLocaleString()} tokens
                                        </Text>
                                    </View>
                                    <View style={styles.modePill}>
                                        <Text style={styles.modePillText}>82%</Text>
                                    </View>
                                </View>

                                <View style={styles.cardDivider} />

                                <View style={styles.modeRow}>
                                    <View style={styles.modeItem}>
                                        <Text style={styles.modeTitle}>Agent Inbox Drafts</Text>
                                        <Text style={styles.modeStats}>
                                            {usageData.by_mode.draft.calls} calls •{' '}
                                            {usageData.by_mode.draft.tokens.toLocaleString()} tokens
                                        </Text>
                                    </View>
                                    <View style={[styles.modePill, { backgroundColor: '#EEF2FF' }]}>
                                        <Text style={[styles.modePillText, { color: '#4F46E5' }]}>18%</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Model Breakdown */}
                            <View style={styles.setupCard}>
                                <Text style={styles.cardHeaderTitle}>USAGE BY MODEL</Text>
                                {usageData.by_model.map((m, mi) => (
                                    <View key={mi} style={styles.modelUsageRow}>
                                        <View>
                                            <Text style={styles.modelUsageName}>{m.model}</Text>
                                            <Text style={styles.modelUsageProvider}>{m.provider}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.modelUsageTokens}>
                                                {m.tokens.toLocaleString()} tokens
                                            </Text>
                                            <Text style={styles.modelUsageCalls}>{m.calls} calls</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Daily Log */}
                            <View style={styles.setupCard}>
                                <Text style={styles.cardHeaderTitle}>RECENT DAILY TREND</Text>
                                {usageData.daily.slice(-5).map((d, di) => (
                                    <View key={di} style={styles.dailyTrendRow}>
                                        <Text style={styles.dailyTrendDate}>{d.date}</Text>
                                        <Text style={styles.dailyTrendCalls}>{d.calls} calls</Text>
                                        <Text style={styles.dailyTrendTokens}>
                                            {d.tokens.toLocaleString()} tokens
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </ScrollView>
            )}

            {/* ========================================================= */}
            {/* DOCUMENT ADD / EDIT MODAL */}
            {/* ========================================================= */}
            <SmoothModal visible={docModalOpen} onClose={() => setDocModalOpen(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView contentContainerStyle={styles.docModalContent}>
                        <View style={styles.docModalHeader}>
                            <Text style={styles.docModalTitle}>
                                {docModalMode === 'create'
                                    ? 'Add Knowledge Document'
                                    : 'Edit Knowledge Document'}
                            </Text>
                            <TouchableOpacity onPress={() => setDocModalOpen(false)}>
                                <CloseIcon size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.fieldLabel}>Document Title</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Return & Cancellation Policy 2026"
                            placeholderTextColor="#94A3B8"
                            value={docTitle}
                            onChangeText={setDocTitle}
                        />

                        <Text style={styles.fieldLabel}>Document Content (Factual Knowledge)</Text>
                        <TextInput
                            style={[styles.textInput, { height: 160, textAlignVertical: 'top' }]}
                            multiline
                            placeholder="Paste your policy details, product FAQs, or service guidelines here..."
                            placeholderTextColor="#94A3B8"
                            value={docContent}
                            onChangeText={setDocContent}
                        />

                        <TouchableOpacity
                            style={styles.saveDocBtn}
                            activeOpacity={0.85}
                            disabled={isSavingDoc}
                            onPress={handleSaveDoc}>
                            {isSavingDoc ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveDocBtnText}>
                                    {docModalMode === 'create'
                                        ? 'Vectorize & Add Document'
                                        : 'Update Document'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SmoothModal>

            {/* Unified 5-Tab Bottom Bar: Inbox, Automation, AI Agent (active), Broadcast, More */}
            <AppBottomBar
                activeTab="Agents"
                onNavigateTab={onNavigateTab}
            />
        </SafeAreaView>
    );
};

// -----------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerRightRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    headerStatusBadgeActive: {
        backgroundColor: 'rgba(0, 168, 89, 0.1)',
        borderColor: 'rgba(0, 168, 89, 0.3)',
    },
    headerStatusBadgeSetup: {
        backgroundColor: '#FEF3C7',
        borderColor: '#FDE68A',
    },
    headerStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    headerStatusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    tabBarContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingHorizontal: 12,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 11,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: '#00A859',
    },
    tabBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    tabBtnTextActive: {
        color: '#00A859',
        fontWeight: '700',
    },

    // -------------------------------------------------------------
    // PLAYGROUND TAB STYLES
    // -------------------------------------------------------------
    playgroundStatusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    playgroundModelChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    playgroundModelChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#00A859',
    },
    playgroundResetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },
    playgroundResetBtnText: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '600',
    },
    playgroundTranscript: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    playgroundTranscriptContent: {
        padding: 16,
        paddingBottom: 24,
    },
    playgroundEmptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    playgroundEmptyIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 168, 89, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    playgroundEmptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 6,
        textAlign: 'center',
    },
    playgroundEmptyDesc: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 16,
    },
    playgroundGoToSetupBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    playgroundGoToSetupText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A859',
    },
    playMsgRow: {
        marginBottom: 10,
        maxWidth: '82%',
    },
    playMsgRowUser: {
        alignSelf: 'flex-end',
    },
    playMsgRowAi: {
        alignSelf: 'flex-start',
    },
    playBubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    playBubbleUser: {
        backgroundColor: '#DCF8C6',
        borderTopRightRadius: 2,
    },
    playBubbleAi: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 2,
    },
    playBubbleText: {
        fontSize: 13,
        color: '#0F172A',
        lineHeight: 18,
    },
    playHandoffBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF1F2',
        borderWidth: 1,
        borderColor: '#FECDD3',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    playHandoffBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#E11D48',
    },
    playgroundInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    playgroundTextInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        fontSize: 13,
        color: '#0F172A',
        maxHeight: 100,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    playgroundSendBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#00A859',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },

    // -------------------------------------------------------------
    // SETUP TAB STYLES
    // -------------------------------------------------------------
    setupScroll: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    setupContent: {
        padding: 16,
        gap: 14,
    },
    setupCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardHeaderTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    switchSubtitle: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
        marginTop: 10,
        marginBottom: 6,
    },
    fieldDesc: {
        fontSize: 11,
        color: '#64748B',
        lineHeight: 16,
        marginBottom: 8,
    },
    repliesCountRow: {
        flexDirection: 'row',
        gap: 8,
    },
    repliesCountChip: {
        width: 44,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    repliesCountChipActive: {
        borderColor: '#00A859',
        backgroundColor: '#ECFDF5',
    },
    repliesCountChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    repliesCountChipTextActive: {
        color: '#00A859',
        fontWeight: '700',
    },
    providerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    providerChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#F8FAFC',
    },
    providerChipActive: {
        borderColor: '#00A859',
        backgroundColor: 'rgba(0, 168, 89, 0.08)',
    },
    providerChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    providerChipTextActive: {
        color: '#00A859',
        fontWeight: '700',
    },
    modelsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    modelChip: {
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modelChipActive: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    modelChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },
    modelChipTextActive: {
        color: '#00A859',
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: '#0F172A',
        marginBottom: 6,
    },
    apiKeyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    apiKeyInput: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        fontSize: 13,
        color: '#0F172A',
    },
    eyeToggleBtn: {
        padding: 6,
    },
    testResultBanner: {
        padding: 10,
        borderRadius: 8,
        marginVertical: 6,
    },
    testResultBannerSuccess: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    testResultBannerFail: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECDD3',
    },
    testResultBannerText: {
        fontSize: 11,
        lineHeight: 15,
    },
    testResultBannerTextSuccess: {
        color: '#059669',
    },
    testResultBannerTextFail: {
        color: '#DC2626',
    },
    testConnectionBtn: {
        paddingVertical: 9,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00A859',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 168, 89, 0.05)',
        marginTop: 6,
    },
    testConnectionBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A859',
    },
    presetsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 6,
    },
    presetChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    presetChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#334155',
    },
    saveConfigBtn: {
        backgroundColor: '#00A859',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 4,
    },
    saveConfigBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    removeConfigBtn: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    removeConfigBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#EF4444',
    },

    // -------------------------------------------------------------
    // KNOWLEDGE TAB STYLES
    // -------------------------------------------------------------
    knowledgeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    addDocHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#00A859',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addDocHeaderBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    emptyDocsWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyDocsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 10,
        marginBottom: 4,
    },
    emptyDocsDesc: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    docCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    docCardLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        marginRight: 10,
    },
    docIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 168, 89, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    docTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    docSubtitle: {
        fontSize: 10,
        color: '#059669',
        fontWeight: '600',
        marginTop: 2,
    },
    docContentSnippet: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 4,
        lineHeight: 15,
    },
    docCardActions: {
        flexDirection: 'row',
        gap: 6,
    },
    docActionBtn: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },

    // -------------------------------------------------------------
    // USAGE TAB STYLES
    // -------------------------------------------------------------
    windowSelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    windowLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    windowChipsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    windowChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    windowChipActive: {
        backgroundColor: '#00A859',
        borderColor: '#00A859',
    },
    windowChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    windowChipTextActive: {
        color: '#FFFFFF',
    },
    usageKpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    usageKpiCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    usageKpiValue: {
        fontSize: 17,
        fontWeight: '800',
        color: '#0F172A',
    },
    usageKpiLabel: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
    },
    modeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modeItem: {
        flex: 1,
    },
    modeTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0F172A',
    },
    modeStats: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    modePill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: '#ECFDF5',
    },
    modePillText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
    },
    modelUsageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modelUsageName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0F172A',
    },
    modelUsageProvider: {
        fontSize: 10,
        color: '#64748B',
        textTransform: 'capitalize',
    },
    modelUsageTokens: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
    },
    modelUsageCalls: {
        fontSize: 10,
        color: '#94A3B8',
    },
    dailyTrendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    dailyTrendDate: {
        fontSize: 11,
        fontWeight: '600',
        color: '#334155',
        width: 60,
    },
    dailyTrendCalls: {
        fontSize: 11,
        color: '#64748B',
    },
    dailyTrendTokens: {
        fontSize: 11,
        fontWeight: '600',
        color: '#00A859',
    },

    // -------------------------------------------------------------
    // DOCUMENT MODAL STYLES
    // -------------------------------------------------------------
    docModalContent: {
        padding: 20,
    },
    docModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    docModalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    saveDocBtn: {
        backgroundColor: '#00A859',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveDocBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
