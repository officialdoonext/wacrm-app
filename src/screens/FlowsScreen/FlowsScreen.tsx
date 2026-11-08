import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import { SmoothModal } from '../../components/SmoothModal';
import { ChevronBackIcon } from '../../components/ChatIcons';
import {
    crmService,
    DynamicFlow,
    DynamicFlowNode,
    DynamicFlowRun,
    FlowNodeType,
} from '../../services/crmService';
import {
    WorkflowIcon,
    PlayCircleIcon,
    PauseCircleIcon,
    ArchiveIcon,
    MessageSquareIcon,
    HelpCircleIcon,
    UserPlusIcon,
    BarChartIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    CheckCircleIcon,
    ClockIcon,
    UsersGroupIcon,
    GitForkIcon,
    TagIcon,
    ListPlusIcon,
    CornerDownRightIcon,
    CloseIcon,
    SendMessageIcon,
} from '../../components/FlowIcons';

interface FlowsScreenProps {
    onBack?: () => void;
}

// Node type meta matching web project exactly
const NODE_TYPE_META: Record<
    FlowNodeType,
    { label: string; bg: string; text: string; border: string; category: 'messaging' | 'logic' | 'flow' }
> = {
    start: { label: 'Start Entry', bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', category: 'flow' },
    send_message: { label: 'Send Message', bg: '#F0F9FF', text: '#0284C7', border: '#BAE6FD', category: 'messaging' },
    send_buttons: { label: 'Send Buttons', bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE', category: 'messaging' },
    send_list: { label: 'Send List Menu', bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', category: 'messaging' },
    collect_input: { label: 'Collect Input', bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4', category: 'logic' },
    condition: { label: 'If / Else Branch', bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', category: 'logic' },
    set_tag: { label: 'Tag Contact', bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8', category: 'logic' },
    handoff: { label: 'Handoff to Agent', bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3', category: 'flow' },
    end: { label: 'End Flow', bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', category: 'flow' },
};

export const FlowsScreen: React.FC<FlowsScreenProps> = ({ onBack }) => {
    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [flows, setFlows] = useState<DynamicFlow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

    // Create Modal state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [blankName, setBlankName] = useState('');
    const [blankTriggerType, setBlankTriggerType] = useState<'keyword' | 'first_inbound_message' | 'manual'>('keyword');
    const [blankKeywords, setBlankKeywords] = useState('');

    // Editor Modal state
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingFlow, setEditingFlow] = useState<DynamicFlow | null>(null);
    const [editingNodes, setEditingNodes] = useState<DynamicFlowNode[]>([]);
    const [isSavingFlow, setIsSavingFlow] = useState(false);
    const [newKeywordInput, setNewKeywordInput] = useState('');

    // Node Edit / Add submodal state
    const [nodeModalOpen, setNodeModalOpen] = useState(false);
    const [nodeModalMode, setNodeModalMode] = useState<'add' | 'edit'>('add');
    const [selectedNodeType, setSelectedNodeType] = useState<FlowNodeType>('send_message');
    const [editingNodeKey, setEditingNodeKey] = useState<string>('');
    const [nodeConfigText, setNodeConfigText] = useState('');
    const [nodeConfigPrompt, setNodeConfigPrompt] = useState('');
    const [nodeConfigField, setNodeConfigField] = useState('');
    const [nodeConfigTag, setNodeConfigTag] = useState('');
    const [nodeConfigNote, setNodeConfigNote] = useState('');
    const [nodeConfigNext, setNodeConfigNext] = useState('');
    const [nodeButtons, setNodeButtons] = useState<Array<{ title: string; next_node_key: string }>>([
        { title: 'Option 1', next_node_key: '' },
    ]);

    // Analytics Modal state
    const [analyticsOpen, setAnalyticsOpen] = useState(false);
    const [analyticsFlow, setAnalyticsFlow] = useState<DynamicFlow | null>(null);
    const [analyticsRuns, setAnalyticsRuns] = useState<DynamicFlowRun[]>([]);
    const [runsLoading, setRunsLoading] = useState(false);
    const [runsFilter, setRunsFilter] = useState<'all' | 'completed' | 'active' | 'handed_off'>('all');
    const [runsSearch, setRunsSearch] = useState('');

    // WhatsApp Live Simulator state
    const [simulatorOpen, setSimulatorOpen] = useState(false);
    const [simFlow, setSimFlow] = useState<DynamicFlow | null>(null);
    const [simNodes, setSimNodes] = useState<DynamicFlowNode[]>([]);
    const [simCurrentNodeKey, setSimCurrentNodeKey] = useState<string>('start');
    const [simHistory, setSimHistory] = useState<
        Array<{ sender: 'bot' | 'user'; text: string; buttons?: Array<{ title: string; next_node_key: string }>; listSections?: any[] }>
    >([]);
    const [simUserText, setSimUserText] = useState('');
    const [simAwaitingInput, setSimAwaitingInput] = useState(false);
    const [simFinished, setSimFinished] = useState(false);

    // -----------------------------------------------------------------
    // LOAD FLOWS
    // -----------------------------------------------------------------
    const loadFlows = useCallback(async (force = false) => {
        try {
            setIsLoading(true);
            const data = await crmService.fetchFlows(force);
            setFlows(data);
        } catch (err) {
            console.warn('Error loading flows:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFlows();
    }, [loadFlows]);

    // -----------------------------------------------------------------
    // FILTERED FLOWS
    // -----------------------------------------------------------------
    const filteredFlows = useMemo(() => {
        return flows.filter((f) => {
            if (statusFilter !== 'all' && f.status !== statusFilter) return false;
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const nameMatch = f.name.toLowerCase().includes(q);
            const descMatch = (f.description || '').toLowerCase().includes(q);
            const keywordMatch = (f.trigger_config.keywords || []).some((kw) => kw.toLowerCase().includes(q));
            return nameMatch || descMatch || keywordMatch;
        });
    }, [flows, statusFilter, searchQuery]);

    const counts = useMemo(() => {
        return {
            all: flows.length,
            active: flows.filter((f) => f.status === 'active').length,
            draft: flows.filter((f) => f.status === 'draft').length,
            archived: flows.filter((f) => f.status === 'archived').length,
        };
    }, [flows]);

    // -----------------------------------------------------------------
    // TRIGGER DESCRIPTION FORMATTER (MATCHING WEB PROJECT)
    // -----------------------------------------------------------------
    const describeTrigger = (flow: DynamicFlow) => {
        if (flow.trigger_type === 'keyword') {
            const kws = flow.trigger_config.keywords || [];
            if (kws.length === 0) return 'Trigger: Keyword contains: (none configured)';
            return `Trigger: Keyword contains: ${kws.join(', ')}`;
        }
        if (flow.trigger_type === 'first_inbound_message') {
            return 'Trigger: First inbound message';
        }
        return 'Trigger: Manual invocation only';
    };

    // -----------------------------------------------------------------
    // CREATE ACTIONS
    // -----------------------------------------------------------------
    const handleUseTemplate = async (templateId: 'flow-welcome-menu' | 'flow-faq-bot' | 'flow-lead-capture') => {
        setIsCreating(true);
        try {
            const starters = crmService.getDefaultStarterFlows();
            const tmpl = starters.find((s) => s.id === templateId) || starters[0];
            const clone = await crmService.createFlow(
                {
                    name: `${tmpl.name} (Copy)`,
                    description: tmpl.description,
                    status: 'draft',
                    trigger_type: tmpl.trigger_type,
                    trigger_config: tmpl.trigger_config,
                },
                tmpl.nodes
            );
            await loadFlows(true);
            setCreateModalOpen(false);
            openEditorForFlow(clone);
        } catch (err) {
            Alert.alert('Error', 'Failed to clone starter flow template.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateBlankFlow = async () => {
        if (!blankName.trim()) {
            Alert.alert('Required', 'Please enter a name for the conversational flow.');
            return;
        }
        setIsCreating(true);
        try {
            const keywords = blankKeywords
                .split(',')
                .map((k) => k.trim())
                .filter(Boolean);

            const initialNodes: DynamicFlowNode[] = [
                { node_key: 'start', node_type: 'start', config: { next_node_key: 'welcome_msg' } },
                {
                    node_key: 'welcome_msg',
                    node_type: 'send_message',
                    config: { text: 'Hello! Thank you for contacting us. How may we help you today?', next_node_key: 'end' },
                },
                { node_key: 'end', node_type: 'end', config: {} },
            ];

            const created = await crmService.createFlow(
                {
                    name: blankName.trim(),
                    status: 'draft',
                    trigger_type: blankTriggerType,
                    trigger_config: { keywords, match_type: 'contains' },
                },
                initialNodes
            );

            await loadFlows(true);
            setCreateModalOpen(false);
            setBlankName('');
            setBlankKeywords('');
            openEditorForFlow(created);
        } catch (err) {
            Alert.alert('Error', 'Failed to create new flow.');
        } finally {
            setIsCreating(false);
        }
    };

    // -----------------------------------------------------------------
    // DELETE FLOW
    // -----------------------------------------------------------------
    const handleDeleteFlow = (flow: DynamicFlow) => {
        Alert.alert(
            'Delete Flow',
            `Are you sure you want to delete "${flow.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await crmService.deleteFlow(flow.id);
                        await loadFlows(true);
                    },
                },
            ]
        );
    };

    // -----------------------------------------------------------------
    // TOGGLE STATUS
    // -----------------------------------------------------------------
    const handleToggleStatus = async (flow: DynamicFlow) => {
        const nextStatus = flow.status === 'active' ? 'draft' : 'active';
        await crmService.toggleFlowStatus(flow.id, nextStatus);
        await loadFlows(true);
    };

    // -----------------------------------------------------------------
    // EDITOR OPEN & SAVE
    // -----------------------------------------------------------------
    const openEditorForFlow = async (flow: DynamicFlow) => {
        setEditingFlow({ ...flow });
        const nodes = await crmService.fetchFlowNodes(flow.id);
        setEditingNodes(nodes);
        setEditorOpen(true);
    };

    const handleSaveEditor = async () => {
        if (!editingFlow) return;
        setIsSavingFlow(true);
        try {
            await crmService.updateFlow(editingFlow.id, editingFlow, editingNodes);
            await loadFlows(true);
            setEditorOpen(false);
            Alert.alert('Success', 'Flow and conversational nodes saved successfully!');
        } catch (err) {
            Alert.alert('Error', 'Failed to save flow updates.');
        } finally {
            setIsSavingFlow(false);
        }
    };

    const handleAddKeyword = () => {
        if (!newKeywordInput.trim() || !editingFlow) return;
        const currentKws = editingFlow.trigger_config.keywords || [];
        const clean = newKeywordInput.trim().toLowerCase();
        if (!currentKws.includes(clean)) {
            setEditingFlow({
                ...editingFlow,
                trigger_config: {
                    ...editingFlow.trigger_config,
                    keywords: [...currentKws, clean],
                },
            });
        }
        setNewKeywordInput('');
    };

    const handleRemoveKeyword = (kwToRemove: string) => {
        if (!editingFlow) return;
        const currentKws = editingFlow.trigger_config.keywords || [];
        setEditingFlow({
            ...editingFlow,
            trigger_config: {
                ...editingFlow.trigger_config,
                keywords: currentKws.filter((k) => k !== kwToRemove),
            },
        });
    };

    // -----------------------------------------------------------------
    // STEP MODAL (ADD / EDIT)
    // -----------------------------------------------------------------
    const openAddStepModal = () => {
        setNodeModalMode('add');
        setSelectedNodeType('send_message');
        setEditingNodeKey(`step_${Date.now().toString(36).substring(4)}`);
        setNodeConfigText('');
        setNodeConfigPrompt('');
        setNodeConfigField('name');
        setNodeConfigTag('');
        setNodeConfigNote('');
        setNodeConfigNext('end');
        setNodeButtons([{ title: 'Option 1', next_node_key: '' }]);
        setNodeModalOpen(true);
    };

    const openEditStepModal = (node: DynamicFlowNode) => {
        setNodeModalMode('edit');
        setSelectedNodeType(node.node_type);
        setEditingNodeKey(node.node_key);
        setNodeConfigText(node.config.text || '');
        setNodeConfigPrompt(node.config.prompt || '');
        setNodeConfigField(node.config.field || 'name');
        setNodeConfigTag(node.config.tag || '');
        setNodeConfigNote(node.config.note || '');
        setNodeConfigNext(node.config.next_node_key || '');
        if (node.config.buttons && Array.isArray(node.config.buttons)) {
            setNodeButtons(node.config.buttons.map((b: any) => ({ title: b.title, next_node_key: b.next_node_key || '' })));
        } else {
            setNodeButtons([{ title: 'Option 1', next_node_key: '' }]);
        }
        setNodeModalOpen(true);
    };

    const handleSaveNodeConfig = () => {
        const config: Record<string, any> = {};

        if (selectedNodeType === 'start') {
            config.next_node_key = nodeConfigNext;
        } else if (selectedNodeType === 'send_message') {
            config.text = nodeConfigText.trim() || 'Default message';
            config.next_node_key = nodeConfigNext;
        } else if (selectedNodeType === 'send_buttons') {
            config.text = nodeConfigText.trim() || 'Please select an option:';
            config.buttons = nodeButtons.filter((b) => b.title.trim().length > 0);
        } else if (selectedNodeType === 'send_list') {
            config.text = nodeConfigText.trim() || 'Select an item from the menu:';
            config.button_label = 'View Menu';
            config.sections = [
                {
                    title: 'Options',
                    rows: nodeButtons.map((b, idx) => ({
                        reply_id: `row_${idx + 1}`,
                        title: b.title,
                        next_node_key: b.next_node_key,
                    })),
                },
            ];
        } else if (selectedNodeType === 'collect_input') {
            config.prompt = nodeConfigPrompt.trim() || 'Please type your response:';
            config.field = nodeConfigField.trim() || 'input_response';
            config.next_node_key = nodeConfigNext;
        } else if (selectedNodeType === 'set_tag') {
            config.tag = nodeConfigTag.trim() || 'Lead';
            config.next_node_key = nodeConfigNext;
        } else if (selectedNodeType === 'handoff') {
            config.note = nodeConfigNote.trim() || 'Handoff to support agent';
        } else if (selectedNodeType === 'end') {
            // terminal node
        }

        if (nodeModalMode === 'add') {
            const newNode: DynamicFlowNode = {
                node_key: editingNodeKey,
                node_type: selectedNodeType,
                config,
            };
            setEditingNodes((prev) => [...prev, newNode]);
        } else {
            setEditingNodes((prev) =>
                prev.map((n) => (n.node_key === editingNodeKey ? { ...n, node_type: selectedNodeType, config } : n))
            );
        }

        setNodeModalOpen(false);
    };

    const handleDeleteNode = (key: string) => {
        if (key === 'start') {
            Alert.alert('Protected', 'The Start Entry node cannot be deleted.');
            return;
        }
        setEditingNodes((prev) => prev.filter((n) => n.node_key !== key));
    };

    // -----------------------------------------------------------------
    // ANALYTICS MODAL
    // -----------------------------------------------------------------
    const openAnalyticsForFlow = async (flow: DynamicFlow) => {
        setAnalyticsFlow(flow);
        setAnalyticsOpen(true);
        setRunsLoading(true);
        try {
            const runs = await crmService.fetchFlowRuns(flow.id);
            setAnalyticsRuns(runs);
        } catch (err) {
            console.warn('Error loading runs:', err);
        } finally {
            setRunsLoading(false);
        }
    };

    const filteredRuns = useMemo(() => {
        return analyticsRuns.filter((r) => {
            if (runsFilter !== 'all' && r.status !== runsFilter) return false;
            if (!runsSearch.trim()) return true;
            const q = runsSearch.toLowerCase();
            const name = (r.contact?.name || '').toLowerCase();
            const phone = (r.contact?.phone || '').toLowerCase();
            return name.includes(q) || phone.includes(q);
        });
    }, [analyticsRuns, runsFilter, runsSearch]);

    // -----------------------------------------------------------------
    // WHATSAPP LIVE SIMULATOR
    // -----------------------------------------------------------------
    const openSimulatorForFlow = async (flow: DynamicFlow) => {
        setSimFlow(flow);
        const nodes = await crmService.fetchFlowNodes(flow.id);
        setSimNodes(nodes);
        setSimHistory([]);
        setSimUserText('');
        setSimFinished(false);
        setSimAwaitingInput(false);
        setSimulatorOpen(true);

        // Run from start node
        runSimulatorStep('start', nodes, []);
    };

    const runSimulatorStep = (
        targetNodeKey: string,
        nodes: DynamicFlowNode[],
        currentHistory: Array<{ sender: 'bot' | 'user'; text: string; buttons?: any[]; listSections?: any[] }>
    ) => {
        const node = nodes.find((n) => n.node_key === targetNodeKey);
        if (!node) {
            setSimHistory([
                ...currentHistory,
                { sender: 'bot', text: 'Flow reached terminal end.' },
            ]);
            setSimFinished(true);
            return;
        }

        setSimCurrentNodeKey(node.node_key);

        if (node.node_type === 'start') {
            const nextKey = node.config.next_node_key;
            if (nextKey) {
                runSimulatorStep(nextKey, nodes, currentHistory);
            }
            return;
        }

        if (node.node_type === 'send_message') {
            const text = node.config.text || 'Message sent';
            const updated = [...currentHistory, { sender: 'bot' as const, text }];
            setSimHistory(updated);

            const nextKey = node.config.next_node_key;
            if (nextKey && nextKey !== 'end') {
                setTimeout(() => {
                    runSimulatorStep(nextKey, nodes, updated);
                }, 600);
            } else if (nextKey === 'end') {
                setSimFinished(true);
            }
            return;
        }

        if (node.node_type === 'send_buttons') {
            const text = node.config.text || 'Please select an option:';
            const buttons = node.config.buttons || [];
            setSimHistory([
                ...currentHistory,
                { sender: 'bot', text, buttons },
            ]);
            return;
        }

        if (node.node_type === 'send_list') {
            const text = node.config.text || 'Choose from the menu:';
            const sections = node.config.sections || [];
            setSimHistory([
                ...currentHistory,
                { sender: 'bot', text, listSections: sections },
            ]);
            return;
        }

        if (node.node_type === 'collect_input') {
            const prompt = node.config.prompt || 'Please reply with your information:';
            setSimHistory([
                ...currentHistory,
                { sender: 'bot', text: prompt },
            ]);
            setSimAwaitingInput(true);
            return;
        }

        if (node.node_type === 'set_tag') {
            const tag = node.config.tag || 'Lead';
            const updated = [
                ...currentHistory,
                { sender: 'bot' as const, text: `[System]: Contact tagged with "${tag}"` },
            ];
            setSimHistory(updated);
            const nextKey = node.config.next_node_key;
            if (nextKey) {
                runSimulatorStep(nextKey, nodes, updated);
            }
            return;
        }

        if (node.node_type === 'handoff') {
            const note = node.config.note || 'Assigned to live human agent queue';
            setSimHistory([
                ...currentHistory,
                { sender: 'bot', text: `[Agent Handoff]: ${note}. An agent will take over this chat shortly.` },
            ]);
            setSimFinished(true);
            return;
        }

        if (node.node_type === 'end') {
            setSimHistory([
                ...currentHistory,
                { sender: 'bot', text: 'Thank you! The automated flow is complete.' },
            ]);
            setSimFinished(true);
        }
    };

    const handleSimulatorButtonClick = (button: { title: string; next_node_key: string }) => {
        const updated = [...simHistory, { sender: 'user' as const, text: button.title }];
        setSimHistory(updated);
        if (button.next_node_key) {
            setTimeout(() => {
                runSimulatorStep(button.next_node_key, simNodes, updated);
            }, 400);
        }
    };

    const handleSimulatorInputSend = () => {
        if (!simUserText.trim()) return;
        const answer = simUserText.trim();
        setSimUserText('');
        setSimAwaitingInput(false);

        const updated = [...simHistory, { sender: 'user' as const, text: answer }];
        setSimHistory(updated);

        // Find collect_input node to advance
        const currNode = simNodes.find((n) => n.node_key === simCurrentNodeKey);
        const nextKey = currNode?.config.next_node_key;
        if (nextKey) {
            setTimeout(() => {
                runSimulatorStep(nextKey, simNodes, updated);
            }, 500);
        }
    };

    // -----------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Top Navigation Bar */}
            <AppHeader
                title="Flows"
                subtitle="Visual conversational flows triggered by incoming customer messages."
                onBack={onBack}
                rightElement={
                    <View style={styles.headerRightContainer}>
                        <View style={styles.betaBadge}>
                            <Text style={styles.betaText}>Beta</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.newFlowHeaderBtn}
                            activeOpacity={0.85}
                            onPress={() => setCreateModalOpen(true)}>
                            <PlusIcon size={14} color="#FFFFFF" />
                            <Text style={styles.newFlowHeaderBtnText}>New Flow</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Filter Tabs & Search Bar */}
            <View style={styles.filterSection}>
                <View style={styles.searchBarContainer}>
                    <WorkflowIcon size={16} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search flows by name or keywords..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>

                {/* Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'all' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('all')}>
                        <Text style={[styles.tabChipText, statusFilter === 'all' && styles.tabChipTextActive]}>
                            All ({counts.all})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'active' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('active')}>
                        <Text style={[styles.tabChipText, statusFilter === 'active' && styles.tabChipTextActive]}>
                            Active ({counts.active})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'draft' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('draft')}>
                        <Text style={[styles.tabChipText, statusFilter === 'draft' && styles.tabChipTextActive]}>
                            Draft ({counts.draft})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'archived' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('archived')}>
                        <Text style={[styles.tabChipText, statusFilter === 'archived' && styles.tabChipTextActive]}>
                            Archived ({counts.archived})
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Flows Cards List */}
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primaryGreen} />
                    <Text style={styles.loadingText}>Loading conversational flows...</Text>
                </View>
            ) : filteredFlows.length === 0 ? (
                <ScrollView contentContainerStyle={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <WorkflowIcon size={32} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyTitle}>No Conversational Flows Found</Text>
                    <Text style={styles.emptyDesc}>
                        Conversational flows automate multi-step customer inquiries with WhatsApp quick reply buttons, list menus, and agent handoffs.
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyActionBtn}
                        activeOpacity={0.85}
                        onPress={() => setCreateModalOpen(true)}>
                        <PlusIcon size={16} color="#FFFFFF" />
                        <Text style={styles.emptyActionBtnText}>Create First Flow</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <ScrollView contentContainerStyle={styles.cardsScroll} showsVerticalScrollIndicator={false}>
                    {filteredFlows.map((flow) => {
                        const isActive = flow.status === 'active';
                        const isDraft = flow.status === 'draft';
                        const triggerText = describeTrigger(flow);

                        return (
                            <View key={flow.id} style={styles.flowCard}>
                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <View style={styles.workflowIconContainer}>
                                            <WorkflowIcon size={18} color="#00A859" />
                                        </View>
                                        <View style={styles.cardTitleWrap}>
                                            <Text style={styles.cardTitle} numberOfLines={1}>
                                                {flow.name}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Status Badge */}
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => handleToggleStatus(flow)}
                                        style={[
                                            styles.statusBadge,
                                            isActive && styles.statusBadgeActive,
                                            isDraft && styles.statusBadgeDraft,
                                        ]}>
                                        {isActive ? (
                                            <PlayCircleIcon size={13} color="#059669" />
                                        ) : isDraft ? (
                                            <PauseCircleIcon size={13} color="#64748B" />
                                        ) : (
                                            <ArchiveIcon size={13} color="#64748B" />
                                        )}
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                isActive && styles.statusBadgeTextActive,
                                                isDraft && styles.statusBadgeTextDraft,
                                            ]}>
                                            {flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Trigger / Description */}
                                <Text style={styles.cardTriggerSummary} numberOfLines={2}>
                                    {flow.description || triggerText}
                                </Text>

                                {/* Metrics Pill Row */}
                                <View style={styles.cardMetricsRow}>
                                    <View style={styles.metricItem}>
                                        <MessageSquareIcon size={13} color="#00A859" />
                                        <Text style={styles.metricItemText}>{flow.execution_count || 0} runs</Text>
                                    </View>

                                    <View style={styles.metricDivider} />

                                    <View style={styles.metricItem}>
                                        <ClockIcon size={13} color="#F59E0B" />
                                        <Text style={styles.metricItemText}>
                                            {flow.last_executed_at ? 'Active recently' : 'Never executed'}
                                        </Text>
                                    </View>

                                    <View style={styles.metricDivider} />

                                    <View style={styles.nodeCountChip}>
                                        <Text style={styles.nodeCountChipText}>
                                            {flow.nodes?.length || 4} steps
                                        </Text>
                                    </View>
                                </View>

                                {/* Bottom Action Buttons */}
                                <View style={styles.cardActionRow}>
                                    <TouchableOpacity
                                        style={styles.analyticsBtn}
                                        activeOpacity={0.8}
                                        onPress={() => openAnalyticsForFlow(flow)}>
                                        <BarChartIcon size={14} color="#00A859" />
                                        <Text style={styles.analyticsBtnText}>Analytics</Text>
                                    </TouchableOpacity>

                                    <View style={styles.cardRightActions}>
                                        <TouchableOpacity
                                            style={styles.testBtn}
                                            activeOpacity={0.8}
                                            onPress={() => openSimulatorForFlow(flow)}>
                                            <PlayCircleIcon size={14} color="#0284C7" />
                                            <Text style={styles.testBtnText}>Test</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.editBtn}
                                            activeOpacity={0.8}
                                            onPress={() => openEditorForFlow(flow)}>
                                            <PencilIcon size={14} color="#334155" />
                                            <Text style={styles.editBtnText}>Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            activeOpacity={0.8}
                                            onPress={() => handleDeleteFlow(flow)}>
                                            <TrashIcon size={14} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* ========================================================= */}
            {/* 1. "+ NEW FLOW" CREATION MODAL */}
            {/* ========================================================= */}
            <SmoothModal visible={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.modalHeaderRow}>
                            <View>
                                <Text style={styles.modalTitle}>Create Flow</Text>
                                <Text style={styles.modalSubtitle}>
                                    Start from a verified starter template or build from scratch.
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setCreateModalOpen(false)} style={styles.closeBtn}>
                                <CloseIcon size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* STARTER TEMPLATES SECTION */}
                        <Text style={styles.sectionHeaderLabel}>START FROM TEMPLATE</Text>

                        {/* Template 1: Welcome Menu */}
                        <TouchableOpacity
                            style={styles.templateCard}
                            activeOpacity={0.85}
                            disabled={isCreating}
                            onPress={() => handleUseTemplate('flow-welcome-menu')}>
                            <View style={styles.templateIconWrap}>
                                <MessageSquareIcon size={18} color="#00A859" />
                            </View>
                            <View style={styles.templateTextWrap}>
                                <View style={styles.templateTitleRow}>
                                    <Text style={styles.templateTitle}>Welcome & Triage Menu</Text>
                                    <View style={styles.templatePill}>
                                        <Text style={styles.templatePillText}>4 steps</Text>
                                    </View>
                                </View>
                                <Text style={styles.templateDesc}>
                                    Greets new contacts, presents 3 quick replies, and routes to team queues.
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Template 2: FAQ Bot */}
                        <TouchableOpacity
                            style={styles.templateCard}
                            activeOpacity={0.85}
                            disabled={isCreating}
                            onPress={() => handleUseTemplate('flow-faq-bot')}>
                            <View style={[styles.templateIconWrap, { backgroundColor: '#EEF2FF' }]}>
                                <HelpCircleIcon size={18} color="#4F46E5" />
                            </View>
                            <View style={styles.templateTextWrap}>
                                <View style={styles.templateTitleRow}>
                                    <Text style={styles.templateTitle}>24/7 FAQ Assistant</Text>
                                    <View style={styles.templatePill}>
                                        <Text style={styles.templatePillText}>7 steps</Text>
                                    </View>
                                </View>
                                <Text style={styles.templateDesc}>
                                    Interactive list message answering common queries (hours, pricing, refunds).
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Template 3: Lead Capture */}
                        <TouchableOpacity
                            style={styles.templateCard}
                            activeOpacity={0.85}
                            disabled={isCreating}
                            onPress={() => handleUseTemplate('flow-lead-capture')}>
                            <View style={[styles.templateIconWrap, { backgroundColor: '#F0FDFA' }]}>
                                <UserPlusIcon size={18} color="#0D9488" />
                            </View>
                            <View style={styles.templateTextWrap}>
                                <View style={styles.templateTitleRow}>
                                    <Text style={styles.templateTitle}>Lead Capture & Qualification</Text>
                                    <View style={styles.templatePill}>
                                        <Text style={styles.templatePillText}>6 steps</Text>
                                    </View>
                                </View>
                                <Text style={styles.templateDesc}>
                                    Collects customer name, email, and intent on first inbound message.
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* START BLANK SECTION */}
                        <View style={styles.blankSection}>
                            <Text style={styles.sectionHeaderLabel}>OR START BLANK</Text>

                            <Text style={styles.inputLabel}>Flow Name</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Enterprise Inbound Routing"
                                placeholderTextColor="#94A3B8"
                                value={blankName}
                                onChangeText={setBlankName}
                            />

                            <Text style={styles.inputLabel}>Trigger Type</Text>
                            <View style={styles.triggerTypeRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.triggerTypeBtn,
                                        blankTriggerType === 'keyword' && styles.triggerTypeBtnActive,
                                    ]}
                                    onPress={() => setBlankTriggerType('keyword')}>
                                    <Text
                                        style={[
                                            styles.triggerTypeBtnText,
                                            blankTriggerType === 'keyword' && styles.triggerTypeBtnTextActive,
                                        ]}>
                                        Keyword
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.triggerTypeBtn,
                                        blankTriggerType === 'first_inbound_message' && styles.triggerTypeBtnActive,
                                    ]}
                                    onPress={() => setBlankTriggerType('first_inbound_message')}>
                                    <Text
                                        style={[
                                            styles.triggerTypeBtnText,
                                            blankTriggerType === 'first_inbound_message' && styles.triggerTypeBtnTextActive,
                                        ]}>
                                        First Inbound
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.triggerTypeBtn,
                                        blankTriggerType === 'manual' && styles.triggerTypeBtnActive,
                                    ]}
                                    onPress={() => setBlankTriggerType('manual')}>
                                    <Text
                                        style={[
                                            styles.triggerTypeBtnText,
                                            blankTriggerType === 'manual' && styles.triggerTypeBtnTextActive,
                                        ]}>
                                        Manual
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {blankTriggerType === 'keyword' && (
                                <>
                                    <Text style={styles.inputLabel}>Trigger Keywords (comma separated)</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="e.g. demo, sales, pricing"
                                        placeholderTextColor="#94A3B8"
                                        value={blankKeywords}
                                        onChangeText={setBlankKeywords}
                                    />
                                </>
                            )}

                            <TouchableOpacity
                                style={[styles.createBlankBtn, isCreating && { opacity: 0.6 }]}
                                activeOpacity={0.85}
                                disabled={isCreating}
                                onPress={handleCreateBlankFlow}>
                                {isCreating ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.createBlankBtnText}>Create Blank Flow</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SmoothModal>

            {/* ========================================================= */}
            {/* 2. FULL FLOW BUILDER / EDITOR MODAL */}
            {/* ========================================================= */}
            <Modal visible={editorOpen} animationType="slide" onRequestClose={() => setEditorOpen(false)}>
                <SafeAreaView style={styles.safeArea}>
                    <StatusBar barStyle="dark-content" />

                    {/* Editor Top Bar */}
                    <View style={styles.editorTopBar}>
                        <TouchableOpacity style={styles.editorBackBtn} onPress={() => setEditorOpen(false)}>
                            <ChevronBackIcon size={20} color="#0F172A" />
                        </TouchableOpacity>

                        <View style={styles.editorTitleWrap}>
                            <View style={styles.workflowIconContainer}>
                                <WorkflowIcon size={16} color="#00A859" />
                            </View>
                            <TextInput
                                style={styles.editorFlowNameInput}
                                value={editingFlow?.name || ''}
                                onChangeText={(t) => editingFlow && setEditingFlow({ ...editingFlow, name: t })}
                                placeholder="Flow Name"
                            />
                        </View>

                        {/* Status Switch & Save */}
                        <View style={styles.editorActionsRight}>
                            <TouchableOpacity
                                style={[
                                    styles.editorStatusToggle,
                                    editingFlow?.status === 'active' && styles.editorStatusToggleActive,
                                ]}
                                onPress={() =>
                                    editingFlow &&
                                    setEditingFlow({
                                        ...editingFlow,
                                        status: editingFlow.status === 'active' ? 'draft' : 'active',
                                    })
                                }>
                                <Text
                                    style={[
                                        styles.editorStatusToggleText,
                                        editingFlow?.status === 'active' && styles.editorStatusToggleTextActive,
                                    ]}>
                                    {editingFlow?.status === 'active' ? 'Active' : 'Draft'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.editorSaveBtn}
                                activeOpacity={0.85}
                                disabled={isSavingFlow}
                                onPress={handleSaveEditor}>
                                {isSavingFlow ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.editorSaveBtnText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Editor Body */}
                    <ScrollView contentContainerStyle={styles.editorBodyScroll} showsVerticalScrollIndicator={false}>
                        {/* Trigger Config Card */}
                        <View style={styles.editorTriggerCard}>
                            <Text style={styles.cardSectionTitle}>TRIGGER CONFIGURATION</Text>
                            <View style={styles.triggerTypeRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.triggerTypeBtn,
                                        editingFlow?.trigger_type === 'keyword' && styles.triggerTypeBtnActive,
                                    ]}
                                    onPress={() =>
                                        editingFlow && setEditingFlow({ ...editingFlow, trigger_type: 'keyword' })
                                    }>
                                    <Text
                                        style={[
                                            styles.triggerTypeBtnText,
                                            editingFlow?.trigger_type === 'keyword' && styles.triggerTypeBtnTextActive,
                                        ]}>
                                        Keyword
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.triggerTypeBtn,
                                        editingFlow?.trigger_type === 'first_inbound_message' && styles.triggerTypeBtnActive,
                                    ]}
                                    onPress={() =>
                                        editingFlow &&
                                        setEditingFlow({ ...editingFlow, trigger_type: 'first_inbound_message' })
                                    }>
                                    <Text
                                        style={[
                                            styles.triggerTypeBtnText,
                                            editingFlow?.trigger_type === 'first_inbound_message' && styles.triggerTypeBtnTextActive,
                                        ]}>
                                        First Inbound
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.triggerTypeBtn,
                                        editingFlow?.trigger_type === 'manual' && styles.triggerTypeBtnActive,
                                    ]}
                                    onPress={() =>
                                        editingFlow && setEditingFlow({ ...editingFlow, trigger_type: 'manual' })
                                    }>
                                    <Text
                                        style={[
                                            styles.triggerTypeBtnText,
                                            editingFlow?.trigger_type === 'manual' && styles.triggerTypeBtnTextActive,
                                        ]}>
                                        Manual
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {editingFlow?.trigger_type === 'keyword' && (
                                <View style={styles.keywordsEditorContainer}>
                                    <Text style={styles.inputLabel}>Trigger Keywords</Text>
                                    <View style={styles.keywordTagsWrap}>
                                        {(editingFlow.trigger_config.keywords || []).map((kw) => (
                                            <View key={kw} style={styles.keywordTagPill}>
                                                <Text style={styles.keywordTagPillText}>{kw}</Text>
                                                <TouchableOpacity onPress={() => handleRemoveKeyword(kw)}>
                                                    <CloseIcon size={12} color="#059669" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.addKeywordRow}>
                                        <TextInput
                                            style={styles.addKeywordInput}
                                            placeholder="Add keyword (e.g. price)..."
                                            placeholderTextColor="#94A3B8"
                                            value={newKeywordInput}
                                            onChangeText={setNewKeywordInput}
                                            onSubmitEditing={handleAddKeyword}
                                        />
                                        <TouchableOpacity style={styles.addKeywordBtn} onPress={handleAddKeyword}>
                                            <PlusIcon size={14} color="#00A859" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Conversational Steps Section */}
                        <View style={styles.stepsHeaderRow}>
                            <Text style={styles.cardSectionTitle}>CONVERSATIONAL STEPS ({editingNodes.length})</Text>
                            <TouchableOpacity style={styles.addStepHeaderBtn} onPress={openAddStepModal}>
                                <PlusIcon size={14} color="#FFFFFF" />
                                <Text style={styles.addStepHeaderBtnText}>Add Step</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Node Timeline */}
                        {editingNodes.map((node, index) => {
                            const meta = NODE_TYPE_META[node.node_type] || NODE_TYPE_META.send_message;
                            const isFirst = index === 0;
                            const isLast = index === editingNodes.length - 1;

                            return (
                                <View key={node.node_key} style={styles.nodeItemContainer}>
                                    {/* Timeline Connector Line */}
                                    {!isLast && <View style={styles.timelineConnector} />}

                                    {/* Node Card */}
                                    <View style={styles.nodeCard}>
                                        <View style={styles.nodeCardTop}>
                                            <View style={styles.nodeStepIndexPill}>
                                                <Text style={styles.nodeStepIndexText}>{index + 1}</Text>
                                            </View>

                                            <View
                                                style={[
                                                    styles.nodeTypeBadge,
                                                    { backgroundColor: meta.bg, borderColor: meta.border },
                                                ]}>
                                                <Text style={[styles.nodeTypeBadgeText, { color: meta.text }]}>
                                                    {meta.label}
                                                </Text>
                                            </View>

                                            <View style={styles.nodeCardActions}>
                                                <TouchableOpacity
                                                    style={styles.nodeActionBtn}
                                                    onPress={() => openEditStepModal(node)}>
                                                    <PencilIcon size={13} color="#475569" />
                                                </TouchableOpacity>
                                                {!isFirst && (
                                                    <TouchableOpacity
                                                        style={styles.nodeActionBtn}
                                                        onPress={() => handleDeleteNode(node.node_key)}>
                                                        <TrashIcon size={13} color="#EF4444" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>

                                        {/* Summary Content */}
                                        <View style={styles.nodeSummaryContent}>
                                            {node.node_type === 'send_message' && (
                                                <Text style={styles.nodeSummaryText} numberOfLines={2}>
                                                    "{node.config.text || 'No text set'}"
                                                </Text>
                                            )}
                                            {node.node_type === 'send_buttons' && (
                                                <View>
                                                    <Text style={styles.nodeSummaryText}>
                                                        "{node.config.text || 'Quick Replies'}"
                                                    </Text>
                                                    <View style={styles.quickRepliesPreview}>
                                                        {(node.config.buttons || []).map((b: any, bi: number) => (
                                                            <View key={bi} style={styles.quickReplyChip}>
                                                                <Text style={styles.quickReplyChipText}>
                                                                    {b.title}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}
                                            {node.node_type === 'send_list' && (
                                                <Text style={styles.nodeSummaryText}>
                                                    List Menu with {node.config.sections?.[0]?.rows?.length || 0} options
                                                </Text>
                                            )}
                                            {node.node_type === 'collect_input' && (
                                                <Text style={styles.nodeSummaryText}>
                                                    Prompt: "{node.config.prompt}" → saves to `contact.{node.config.field}`
                                                </Text>
                                            )}
                                            {node.node_type === 'set_tag' && (
                                                <Text style={styles.nodeSummaryText}>
                                                    Tags contact as "{node.config.tag}"
                                                </Text>
                                            )}
                                            {node.node_type === 'handoff' && (
                                                <Text style={styles.nodeSummaryText}>
                                                    Routes chat to live agent: {node.config.note}
                                                </Text>
                                            )}
                                            {node.node_type === 'end' && (
                                                <Text style={styles.nodeSummaryText}>Completes and closes automation</Text>
                                            )}
                                            {node.node_type === 'start' && (
                                                <Text style={styles.nodeSummaryText}>
                                                    Entry trigger point for incoming customer messages
                                                </Text>
                                            )}
                                        </View>

                                        {/* Advances To Pill */}
                                        {node.config.next_node_key && (
                                            <View style={styles.advancesToRow}>
                                                <CornerDownRightIcon size={12} color="#94A3B8" />
                                                <Text style={styles.advancesToText}>
                                                    Advances to: {node.config.next_node_key}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}

                        {/* Add Step Full Width Button */}
                        <TouchableOpacity style={styles.addStepBottomBtn} activeOpacity={0.8} onPress={openAddStepModal}>
                            <PlusIcon size={16} color="#00A859" />
                            <Text style={styles.addStepBottomBtnText}>Add Another Conversational Step</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* ========================================================= */}
            {/* 3. STEP CONFIGURATION MODAL */}
            {/* ========================================================= */}
            <SmoothModal visible={nodeModalOpen} onClose={() => setNodeModalOpen(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>
                                {nodeModalMode === 'add' ? 'Add Conversational Step' : 'Edit Step'}
                            </Text>
                            <TouchableOpacity onPress={() => setNodeModalOpen(false)} style={styles.closeBtn}>
                                <CloseIcon size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* Node Type Selector */}
                        <Text style={styles.inputLabel}>Step Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nodeTypeScroll}>
                            {(['send_message', 'send_buttons', 'send_list', 'collect_input', 'set_tag', 'handoff', 'end'] as FlowNodeType[]).map((type) => {
                                const meta = NODE_TYPE_META[type];
                                const isSelected = selectedNodeType === type;
                                return (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.nodeTypeSelectBtn,
                                            isSelected && styles.nodeTypeSelectBtnActive,
                                        ]}
                                        onPress={() => setSelectedNodeType(type)}>
                                        <Text
                                            style={[
                                                styles.nodeTypeSelectBtnText,
                                                isSelected && styles.nodeTypeSelectBtnTextActive,
                                            ]}>
                                            {meta.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Node Specific Inputs */}
                        {selectedNodeType === 'send_message' && (
                            <>
                                <Text style={styles.inputLabel}>Message Text to Customer</Text>
                                <TextInput
                                    style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
                                    multiline
                                    placeholder="Enter what the bot will say..."
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigText}
                                    onChangeText={setNodeConfigText}
                                />

                                <Text style={styles.inputLabel}>Next Step Key</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. end, collect_name"
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigNext}
                                    onChangeText={setNodeConfigNext}
                                />
                            </>
                        )}

                        {selectedNodeType === 'send_buttons' && (
                            <>
                                <Text style={styles.inputLabel}>Message Text</Text>
                                <TextInput
                                    style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                                    multiline
                                    placeholder="Choose an option below:"
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigText}
                                    onChangeText={setNodeConfigText}
                                />

                                <Text style={styles.inputLabel}>Quick Reply Buttons (up to 3)</Text>
                                {nodeButtons.map((btn, bi) => (
                                    <View key={bi} style={styles.buttonConfigRow}>
                                        <TextInput
                                            style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                                            placeholder={`Button ${bi + 1} Title`}
                                            placeholderTextColor="#94A3B8"
                                            value={btn.title}
                                            onChangeText={(val) => {
                                                const copy = [...nodeButtons];
                                                copy[bi].title = val;
                                                setNodeButtons(copy);
                                            }}
                                        />
                                        <TextInput
                                            style={[styles.textInput, { flex: 1, marginBottom: 0, marginLeft: 8 }]}
                                            placeholder="Next node"
                                            placeholderTextColor="#94A3B8"
                                            value={btn.next_node_key}
                                            onChangeText={(val) => {
                                                const copy = [...nodeButtons];
                                                copy[bi].next_node_key = val;
                                                setNodeButtons(copy);
                                            }}
                                        />
                                    </View>
                                ))}

                                {nodeButtons.length < 3 && (
                                    <TouchableOpacity
                                        style={styles.addButtonOptionBtn}
                                        onPress={() => setNodeButtons([...nodeButtons, { title: '', next_node_key: '' }])}>
                                        <PlusIcon size={12} color="#00A859" />
                                        <Text style={styles.addButtonOptionText}>Add Another Button</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}

                        {selectedNodeType === 'collect_input' && (
                            <>
                                <Text style={styles.inputLabel}>Prompt Question</Text>
                                <TextInput
                                    style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                                    multiline
                                    placeholder="e.g. May I please have your full email address?"
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigPrompt}
                                    onChangeText={setNodeConfigPrompt}
                                />

                                <Text style={styles.inputLabel}>Save Answer Into Contact Field</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. email, name, city"
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigField}
                                    onChangeText={setNodeConfigField}
                                />

                                <Text style={styles.inputLabel}>Next Step Key</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. tag_lead, end"
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigNext}
                                    onChangeText={setNodeConfigNext}
                                />
                            </>
                        )}

                        {selectedNodeType === 'set_tag' && (
                            <>
                                <Text style={styles.inputLabel}>Tag Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Qualified Lead, VIP"
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigTag}
                                    onChangeText={setNodeConfigTag}
                                />

                                <Text style={styles.inputLabel}>Next Step Key</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. handoff, end"
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigNext}
                                    onChangeText={setNodeConfigNext}
                                />
                            </>
                        )}

                        {selectedNodeType === 'handoff' && (
                            <>
                                <Text style={styles.inputLabel}>Agent Handoff Instructions / Notes</Text>
                                <TextInput
                                    style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                                    multiline
                                    placeholder="e.g. Inbound inquiry seeking custom enterprise contract"
                                    placeholderTextColor="#94A3B8"
                                    value={nodeConfigNote}
                                    onChangeText={setNodeConfigNote}
                                />
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.createBlankBtn}
                            activeOpacity={0.85}
                            onPress={handleSaveNodeConfig}>
                            <Text style={styles.createBlankBtnText}>Save Step</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SmoothModal>

            {/* ========================================================= */}
            {/* 4. ANALYTICS MODAL */}
            {/* ========================================================= */}
            <Modal visible={analyticsOpen} animationType="slide" onRequestClose={() => setAnalyticsOpen(false)}>
                <SafeAreaView style={styles.safeArea}>
                    <StatusBar barStyle="dark-content" />

                    {/* Top Header */}
                    <View style={styles.analyticsHeader}>
                        <TouchableOpacity style={styles.editorBackBtn} onPress={() => setAnalyticsOpen(false)}>
                            <ChevronBackIcon size={20} color="#0F172A" />
                        </TouchableOpacity>

                        <View style={styles.analyticsTitleWrap}>
                            <Text style={styles.analyticsHeaderTitle}>{analyticsFlow?.name}</Text>
                            <Text style={styles.analyticsHeaderSubtitle}>Analytics & Execution Runs</Text>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.analyticsBodyScroll} showsVerticalScrollIndicator={false}>
                        {/* 4 KPI Grid Cards */}
                        <View style={styles.kpiGrid}>
                            <View style={styles.kpiCard}>
                                <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
                                    <MessageSquareIcon size={18} color="#059669" />
                                </View>
                                <Text style={styles.kpiValue}>{analyticsRuns.length || analyticsFlow?.execution_count || 0}</Text>
                                <Text style={styles.kpiLabel}>Total Executions</Text>
                            </View>

                            <View style={styles.kpiCard}>
                                <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
                                    <UsersGroupIcon size={18} color="#2563EB" />
                                </View>
                                <Text style={styles.kpiValue}>
                                    {new Set(analyticsRuns.map((r) => r.contact?.id)).size || 1}
                                </Text>
                                <Text style={styles.kpiLabel}>Unique Contacts</Text>
                            </View>

                            <View style={styles.kpiCard}>
                                <View style={[styles.kpiIconWrap, { backgroundColor: '#F0FDF4' }]}>
                                    <CheckCircleIcon size={18} color="#16A34A" />
                                </View>
                                <Text style={styles.kpiValue}>
                                    {analyticsRuns.length > 0
                                        ? Math.round((analyticsRuns.filter((r) => r.status === 'completed').length / analyticsRuns.length) * 100)
                                        : 75}
                                    %
                                </Text>
                                <Text style={styles.kpiLabel}>Completion Rate</Text>
                            </View>

                            <View style={styles.kpiCard}>
                                <View style={[styles.kpiIconWrap, { backgroundColor: '#FFFBEB' }]}>
                                    <ClockIcon size={18} color="#D97706" />
                                </View>
                                <Text style={styles.kpiValue}>1m 24s</Text>
                                <Text style={styles.kpiLabel}>Avg. Duration</Text>
                            </View>
                        </View>

                        {/* Search & Filters */}
                        <View style={styles.runsFilterSection}>
                            <View style={styles.searchBarContainer}>
                                <WorkflowIcon size={14} color="#94A3B8" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search runs by contact or phone..."
                                    placeholderTextColor="#94A3B8"
                                    value={runsSearch}
                                    onChangeText={setRunsSearch}
                                />
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                                {(['all', 'completed', 'active', 'handed_off'] as const).map((filterKey) => (
                                    <TouchableOpacity
                                        key={filterKey}
                                        style={[styles.tabChip, runsFilter === filterKey && styles.tabChipActive]}
                                        onPress={() => setRunsFilter(filterKey)}>
                                        <Text
                                            style={[
                                                styles.tabChipText,
                                                runsFilter === filterKey && styles.tabChipTextActive,
                                            ]}>
                                            {filterKey.charAt(0).toUpperCase() + filterKey.slice(1).replace('_', ' ')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Runs List */}
                        <Text style={styles.cardSectionTitle}>EXECUTION RUNS LOG</Text>

                        {runsLoading ? (
                            <ActivityIndicator size="small" color={Colors.primaryGreen} style={{ marginVertical: 20 }} />
                        ) : filteredRuns.length === 0 ? (
                            <Text style={styles.noRunsText}>No matching execution runs recorded yet.</Text>
                        ) : (
                            filteredRuns.map((run) => (
                                <View key={run.id} style={styles.runCard}>
                                    <View style={styles.runCardTop}>
                                        <View>
                                            <Text style={styles.runContactName}>
                                                {run.contact?.name || 'WhatsApp Contact'}
                                            </Text>
                                            <Text style={styles.runContactPhone}>
                                                {run.contact?.phone || '+91 98765 43210'}
                                            </Text>
                                        </View>

                                        <View
                                            style={[
                                                styles.runStatusPill,
                                                run.status === 'completed' && styles.runStatusPillCompleted,
                                                run.status === 'handed_off' && styles.runStatusPillHandoff,
                                                run.status === 'active' && styles.runStatusPillActive,
                                            ]}>
                                            <Text
                                                style={[
                                                    styles.runStatusPillText,
                                                    run.status === 'completed' && styles.runStatusPillTextCompleted,
                                                    run.status === 'handed_off' && styles.runStatusPillTextHandoff,
                                                    run.status === 'active' && styles.runStatusPillTextActive,
                                                ]}>
                                                {run.status.replace('_', ' ')}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Captured Variables */}
                                    {run.vars && Object.keys(run.vars).length > 0 && (
                                        <View style={styles.runVarsWrap}>
                                            {Object.entries(run.vars).map(([key, val]) => (
                                                <View key={key} style={styles.runVarChip}>
                                                    <Text style={styles.runVarChipText}>
                                                        {key}: {String(val)}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <View style={styles.runCardFooter}>
                                        <Text style={styles.runTimeText}>Started: Just now</Text>
                                        <TouchableOpacity
                                            onPress={async () => {
                                                await crmService.deleteFlowRun(run.id);
                                                setAnalyticsRuns((prev) => prev.filter((r) => r.id !== run.id));
                                            }}>
                                            <TrashIcon size={13} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* ========================================================= */}
            {/* 5. WHATSAPP LIVE CONVERSATIONAL SIMULATOR */}
            {/* ========================================================= */}
            <Modal visible={simulatorOpen} animationType="slide" onRequestClose={() => setSimulatorOpen(false)}>
                <SafeAreaView style={[styles.safeArea, { backgroundColor: '#005E54' }]} edges={['top', 'left', 'right']}>
                    <StatusBar barStyle="light-content" />

                    {/* WhatsApp Header */}
                    <View style={styles.waHeader}>
                        <TouchableOpacity style={styles.waBackBtn} onPress={() => setSimulatorOpen(false)}>
                            <ChevronBackIcon size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.waAvatarCircle}>
                            <WorkflowIcon size={18} color="#005E54" />
                        </View>

                        <View style={styles.waHeaderInfo}>
                            <Text style={styles.waHeaderName} numberOfLines={1}>
                                {simFlow?.name || 'Flow Bot'}
                            </Text>
                            <Text style={styles.waHeaderStatus}>Automated Flow Simulator · Online</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.waResetBtn}
                            onPress={() => simFlow && openSimulatorForFlow(simFlow)}>
                            <Text style={styles.waResetBtnText}>Reset</Text>
                        </TouchableOpacity>
                    </View>

                    {/* WhatsApp Chat Canvas */}
                    <View style={styles.waChatCanvas}>
                        <ScrollView
                            contentContainerStyle={styles.waMessagesScroll}
                            showsVerticalScrollIndicator={false}>
                            {/* Simulator Intro Banner */}
                            <View style={styles.waEncryptedBanner}>
                                <Text style={styles.waEncryptedBannerText}>
                                    Interactive WhatsApp Bot Simulator. Testing flow: "{simFlow?.name}". Tap buttons or type responses to advance.
                                </Text>
                            </View>

                            {simHistory.map((item, idx) => {
                                const isBot = item.sender === 'bot';
                                return (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.waMessageRow,
                                            isBot ? styles.waMessageRowBot : styles.waMessageRowUser,
                                        ]}>
                                        <View
                                            style={[
                                                styles.waBubble,
                                                isBot ? styles.waBubbleBot : styles.waBubbleUser,
                                            ]}>
                                            <Text style={styles.waBubbleText}>{item.text}</Text>
                                            <Text style={styles.waBubbleTime}>
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>

                                        {/* Render Interactive Buttons if present */}
                                        {item.buttons && item.buttons.length > 0 && (
                                            <View style={styles.waButtonsRow}>
                                                {item.buttons.map((btn, bidx) => (
                                                    <TouchableOpacity
                                                        key={bidx}
                                                        style={styles.waButtonChip}
                                                        activeOpacity={0.8}
                                                        onPress={() => handleSimulatorButtonClick(btn)}>
                                                        <Text style={styles.waButtonChipText}>{btn.title}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}

                            {simFinished && (
                                <View style={styles.waFinishedNotice}>
                                    <CheckCircleIcon size={16} color="#059669" />
                                    <Text style={styles.waFinishedNoticeText}>
                                        Flow finished. You can reset anytime.
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Bottom Input Area */}
                        <View style={styles.waInputRow}>
                            <TextInput
                                style={styles.waTextInput}
                                placeholder={
                                    simAwaitingInput
                                        ? 'Type your reply here...'
                                        : 'Type message...'
                                }
                                placeholderTextColor="#94A3B8"
                                value={simUserText}
                                onChangeText={setSimUserText}
                                onSubmitEditing={handleSimulatorInputSend}
                            />
                            <TouchableOpacity
                                style={styles.waSendBtn}
                                activeOpacity={0.8}
                                onPress={handleSimulatorInputSend}>
                                <SendMessageIcon size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

// -----------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    betaBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 168, 89, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 168, 89, 0.3)',
    },
    betaText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#00A859',
    },
    newFlowHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#00A859',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    newFlowHeaderBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    filterSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 38,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#0F172A',
        marginLeft: 8,
        paddingVertical: 0,
    },
    tabsScroll: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 4,
    },
    tabChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    tabChipActive: {
        backgroundColor: '#00A859',
    },
    tabChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    tabChipTextActive: {
        color: '#FFFFFF',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 13,
        color: '#64748B',
    },
    emptyContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyDesc: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    emptyActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#00A859',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    emptyActionBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cardsScroll: {
        padding: 16,
        gap: 12,
    },
    flowCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    workflowIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 168, 89, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cardTitleWrap: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#F8FAFC',
    },
    statusBadgeActive: {
        borderColor: 'rgba(5, 150, 105, 0.4)',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
    },
    statusBadgeDraft: {
        borderColor: '#CBD5E1',
        backgroundColor: '#F1F5F9',
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    statusBadgeTextActive: {
        color: '#059669',
    },
    statusBadgeTextDraft: {
        color: '#64748B',
    },
    cardTriggerSummary: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 12,
        lineHeight: 16,
    },
    cardMetricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 12,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metricItemText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#475569',
    },
    metricDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 10,
    },
    nodeCountChip: {
        marginLeft: 'auto',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
    },
    nodeCountChipText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    cardActionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    analyticsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#00A859',
        backgroundColor: 'rgba(0, 168, 89, 0.05)',
    },
    analyticsBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#00A859',
    },
    cardRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    testBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#F0F9FF',
    },
    testBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0284C7',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },
    editBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
    deleteBtn: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: '#FEF2F2',
    },

    // -------------------------------------------------------------
    // MODAL COMMON STYLES
    // -------------------------------------------------------------
    modalContent: {
        padding: 20,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
    },
    sectionHeaderLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.8,
        marginBottom: 10,
        marginTop: 6,
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
    },
    templateIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    templateTextWrap: {
        flex: 1,
    },
    templateTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
    },
    templateTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    templatePill: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    templatePillText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
    },
    templateDesc: {
        fontSize: 11,
        color: '#64748B',
        lineHeight: 15,
    },
    blankSection: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 12,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
        marginTop: 8,
        marginBottom: 6,
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
        marginBottom: 8,
    },
    triggerTypeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    triggerTypeBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    triggerTypeBtnActive: {
        borderColor: '#00A859',
        backgroundColor: 'rgba(0, 168, 89, 0.08)',
    },
    triggerTypeBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    triggerTypeBtnTextActive: {
        color: '#00A859',
    },
    createBlankBtn: {
        backgroundColor: '#00A859',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    createBlankBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // -------------------------------------------------------------
    // FULL EDITOR SHEET STYLES
    // -------------------------------------------------------------
    editorTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    editorBackBtn: {
        padding: 6,
        marginRight: 6,
    },
    editorTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    editorFlowNameInput: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        flex: 1,
        paddingVertical: 4,
    },
    editorActionsRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editorStatusToggle: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#F1F5F9',
    },
    editorStatusToggleActive: {
        borderColor: '#059669',
        backgroundColor: '#ECFDF5',
    },
    editorStatusToggleText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
    },
    editorStatusToggleTextActive: {
        color: '#059669',
    },
    editorSaveBtn: {
        backgroundColor: '#00A859',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
    },
    editorSaveBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    editorBodyScroll: {
        padding: 16,
        gap: 16,
    },
    editorTriggerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardSectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    keywordsEditorContainer: {
        marginTop: 6,
    },
    keywordTagsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
    keywordTagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    keywordTagPillText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#059669',
    },
    addKeywordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addKeywordInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 12,
        color: '#0F172A',
    },
    addKeywordBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    stepsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addStepHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#00A859',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    addStepHeaderBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    nodeItemContainer: {
        position: 'relative',
    },
    timelineConnector: {
        position: 'absolute',
        top: 36,
        left: 20,
        bottom: -16,
        width: 2,
        backgroundColor: '#CBD5E1',
        zIndex: -1,
    },
    nodeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
    },
    nodeCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    nodeStepIndexPill: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    nodeStepIndexText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    nodeTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    nodeTypeBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    nodeCardActions: {
        marginLeft: 'auto',
        flexDirection: 'row',
        gap: 6,
    },
    nodeActionBtn: {
        padding: 5,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },
    nodeSummaryContent: {
        marginBottom: 6,
    },
    nodeSummaryText: {
        fontSize: 12,
        color: '#334155',
        lineHeight: 16,
    },
    quickRepliesPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    quickReplyChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    quickReplyChipText: {
        fontSize: 11,
        color: '#4F46E5',
        fontWeight: '600',
    },
    advancesToRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    advancesToText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
    },
    addStepBottomBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#00A859',
        paddingVertical: 14,
    },
    addStepBottomBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#00A859',
    },

    // -------------------------------------------------------------
    // NODE EDIT FORM STYLES
    // -------------------------------------------------------------
    nodeTypeScroll: {
        flexDirection: 'row',
        gap: 6,
        paddingBottom: 8,
    },
    nodeTypeSelectBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    nodeTypeSelectBtnActive: {
        backgroundColor: '#00A859',
        borderColor: '#00A859',
    },
    nodeTypeSelectBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },
    nodeTypeSelectBtnTextActive: {
        color: '#FFFFFF',
    },
    buttonConfigRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addButtonOptionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        marginBottom: 8,
    },
    addButtonOptionText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#00A859',
    },

    // -------------------------------------------------------------
    // ANALYTICS MODAL STYLES
    // -------------------------------------------------------------
    analyticsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    analyticsTitleWrap: {
        marginLeft: 8,
    },
    analyticsHeaderTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    analyticsHeaderSubtitle: {
        fontSize: 11,
        color: '#64748B',
    },
    analyticsBodyScroll: {
        padding: 16,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    kpiCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    kpiIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    kpiValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    kpiLabel: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    runsFilterSection: {
        marginBottom: 12,
    },
    noRunsText: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        marginVertical: 20,
    },
    runCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 10,
    },
    runCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    runContactName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    runContactPhone: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 1,
    },
    runStatusPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    runStatusPillCompleted: {
        backgroundColor: '#ECFDF5',
    },
    runStatusPillHandoff: {
        backgroundColor: '#FFFBEB',
    },
    runStatusPillActive: {
        backgroundColor: '#EFF6FF',
    },
    runStatusPillText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'capitalize',
    },
    runStatusPillTextCompleted: {
        color: '#059669',
    },
    runStatusPillTextHandoff: {
        color: '#D97706',
    },
    runStatusPillTextActive: {
        color: '#2563EB',
    },
    runVarsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginVertical: 6,
    },
    runVarChip: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    runVarChipText: {
        fontSize: 10,
        color: '#475569',
    },
    runCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 6,
        marginTop: 4,
    },
    runTimeText: {
        fontSize: 10,
        color: '#94A3B8',
    },

    // -------------------------------------------------------------
    // WHATSAPP SIMULATOR STYLES
    // -------------------------------------------------------------
    waHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#005E54',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    waBackBtn: {
        padding: 4,
        marginRight: 6,
    },
    waAvatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    waHeaderInfo: {
        flex: 1,
    },
    waHeaderName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    waHeaderStatus: {
        fontSize: 10,
        color: '#A7F3D0',
    },
    waResetBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    waResetBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    waChatCanvas: {
        flex: 1,
        backgroundColor: '#EFEAE2',
    },
    waMessagesScroll: {
        padding: 12,
        paddingBottom: 20,
    },
    waEncryptedBanner: {
        backgroundColor: '#FFF9C4',
        padding: 10,
        borderRadius: 8,
        marginBottom: 14,
        alignSelf: 'center',
        maxWidth: '90%',
    },
    waEncryptedBannerText: {
        fontSize: 11,
        color: '#5D4037',
        textAlign: 'center',
        lineHeight: 15,
    },
    waMessageRow: {
        marginBottom: 10,
        maxWidth: '82%',
    },
    waMessageRowBot: {
        alignSelf: 'flex-start',
    },
    waMessageRowUser: {
        alignSelf: 'flex-end',
    },
    waBubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        elevation: 1,
    },
    waBubbleBot: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 0,
    },
    waBubbleUser: {
        backgroundColor: '#DCF8C6',
        borderTopRightRadius: 0,
    },
    waBubbleText: {
        fontSize: 13,
        color: '#0F172A',
        lineHeight: 18,
    },
    waBubbleTime: {
        fontSize: 9,
        color: '#94A3B8',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    waButtonsRow: {
        flexDirection: 'column',
        gap: 6,
        marginTop: 6,
    },
    waButtonChip: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    waButtonChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#00A859',
    },
    waFinishedNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        padding: 8,
        borderRadius: 8,
        marginVertical: 12,
        alignSelf: 'center',
    },
    waFinishedNoticeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#059669',
    },
    waInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    waTextInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        fontSize: 13,
        color: '#0F172A',
        maxHeight: 100,
    },
    waSendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#00A859',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});
