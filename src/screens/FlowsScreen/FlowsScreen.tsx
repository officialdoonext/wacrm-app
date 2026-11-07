import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import { SmoothModal } from '../../components/SmoothModal';
import {
    IconZap,
    IconPlay,
    IconCheck,
    IconPuzzle,
    IconClose,
} from '../../components/AppIcons';
import { ChevronBackIcon } from '../../components/ChatIcons';

interface FlowNode {
    id: string;
    type: 'start' | 'send_message' | 'send_buttons' | 'collect_input' | 'condition' | 'handoff' | 'end';
    title: string;
    description: string;
    nextNodeId?: string;
}

interface FlowItem {
    id: string;
    name: string;
    triggerKeyword: string;
    isActive: boolean;
    runsCount: number;
    completionRate: number;
    nodes: FlowNode[];
}

const MOCK_FLOWS: FlowItem[] = [
    {
        id: 'f1',
        name: 'Lead Qualification & Appointment Booking',
        triggerKeyword: 'demo, book',
        isActive: true,
        runsCount: 342,
        completionRate: 78,
        nodes: [
            { id: 'n1', type: 'start', title: 'Trigger: Keyword "demo"', description: 'Listens for customer inbound keyword' },
            { id: 'n2', type: 'send_buttons', title: 'Welcome & Choose Service', description: 'Interactive buttons: SaaS / Custom / Support' },
            { id: 'n3', type: 'collect_input', title: 'Collect Email & Phone', description: 'Store into CRM contact fields' },
            { id: 'n4', type: 'condition', title: 'Check VIP Lead', description: 'If budget > $5,000 branch to priority handoff' },
            { id: 'n5', type: 'handoff', title: 'Handoff to Human Agent', description: 'Assigns chat to sales team member' },
        ],
    },
    {
        id: 'f2',
        name: '24/7 FAQ & Order Status Assistant',
        triggerKeyword: 'order, tracking',
        isActive: true,
        runsCount: 520,
        completionRate: 91,
        nodes: [
            { id: 'n21', type: 'start', title: 'Trigger: Keyword "order"', description: 'Inbound message match' },
            { id: 'n22', type: 'collect_input', title: 'Request Order Reference ID', description: 'Prompt: "Please reply with your #ORD-XXXX ID"' },
            { id: 'n23', type: 'send_message', title: 'Lookup Order in Database', description: 'Sends live status & tracking URL' },
            { id: 'n24', type: 'end', title: 'Resolved & Closed', description: 'Mark conversation as resolved' },
        ],
    },
];

interface FlowsScreenProps {
    onBack?: () => void;
}

export const FlowsScreen: React.FC<FlowsScreenProps> = ({ onBack }) => {
    const [flows, setFlows] = useState<FlowItem[]>(MOCK_FLOWS);
    const [selectedFlow, setSelectedFlow] = useState<FlowItem | null>(null);
    const [simulatorVisible, setSimulatorVisible] = useState(false);
    const [simMessages, setSimMessages] = useState<Array<{ sender: string; text: string }>>([]);
    const [simInput, setSimInput] = useState('');

    const toggleFlow = (id: string) => {
        setFlows((prev) =>
            prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
        );
    };

    const handleRunSimulator = (flow: FlowItem) => {
        setSelectedFlow(flow);
        setSimMessages([
            { sender: 'bot', text: `[Flow: ${flow.name} Activated]` },
            { sender: 'bot', text: flow.nodes[1]?.description || 'Hello! How can we help you today?' },
        ]);
        setSimulatorVisible(true);
    };

    const handleSimSend = () => {
        if (!simInput.trim()) return;
        const userMsg = simInput.trim();
        setSimMessages((prev) => [
            ...prev,
            { sender: 'user', text: userMsg },
            { sender: 'bot', text: `Received: "${userMsg}". Next step: Verified and updated CRM contact tags!` },
        ]);
        setSimInput('');
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Header: Logo on Left, Profile on Right */}
                <AppHeader
                    title="Visual Chatbot Flows"
                    subtitle="Interactive multi-turn conversation trees"
                    onBack={onBack}
                />

                <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
                    {flows.map((flow) => (
                        <View key={flow.id} style={styles.flowCard}>
                            <View style={styles.flowTop}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.flowName}>{flow.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                        <IconZap size={12} color="#D97706" />
                                        <Text style={styles.triggerBadge}>Trigger: {flow.triggerKeyword}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[
                                        styles.switchBadge,
                                        flow.isActive ? { backgroundColor: '#DCFCE7' } : { backgroundColor: '#F1F5F9' },
                                    ]}
                                    onPress={() => toggleFlow(flow.id)}>
                                    <Text
                                        style={[
                                            styles.switchBadgeText,
                                            flow.isActive ? { color: '#166534' } : { color: '#64748B' },
                                        ]}>
                                        {flow.isActive ? 'ACTIVE' : 'PAUSED'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.metricsRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <IconPlay size={10} color="#059669" />
                                    <Text style={styles.metricText}>{flow.runsCount} executions</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <IconCheck size={11} color="#2563EB" />
                                    <Text style={styles.metricText}>{flow.completionRate}% completion</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <IconPuzzle size={11} color="#7C3AED" />
                                    <Text style={styles.metricText}>{flow.nodes.length} nodes</Text>
                                </View>
                            </View>

                            {/* Node Sequence Preview */}
                            <View style={styles.nodesTimeline}>
                                {flow.nodes.map((node, i) => (
                                    <View key={node.id} style={styles.nodeItem}>
                                        <View style={styles.nodeBullet}>
                                            <Text style={styles.nodeNum}>{i + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={styles.nodeTitle}>{node.title}</Text>
                                            <Text style={styles.nodeDesc}>{node.description}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.flowActions}>
                                <TouchableOpacity
                                    style={styles.testBtn}
                                    onPress={() => handleRunSimulator(flow)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <IconPlay size={12} color="#FFFFFF" />
                                        <Text style={styles.testBtnText}>Test in Simulator</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Smooth Modal: In-App Flow Simulator */}
            <SmoothModal visible={simulatorVisible} onClose={() => setSimulatorVisible(false)}>
                <View style={styles.simHeader}>
                    <Text style={styles.simTitle}>Flow Simulator: {selectedFlow?.name}</Text>
                    <TouchableOpacity onPress={() => setSimulatorVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.simChatArea}>
                    {simMessages.map((m, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.simBubble,
                                m.sender === 'user' ? styles.simUser : styles.simBot,
                            ]}>
                            <Text
                                style={[
                                    styles.simText,
                                    m.sender === 'user' ? { color: '#0F172A' } : { color: '#0F172A' },
                                ]}>
                                {m.text}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.simInputRow}>
                    <TextInput
                        style={styles.simInput}
                        placeholder="Simulate customer reply..."
                        placeholderTextColor="#94A3B8"
                        value={simInput}
                        onChangeText={setSimInput}
                        onSubmitEditing={handleSimSend}
                    />
                    <TouchableOpacity style={styles.simSendBtn} onPress={handleSimSend}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Send</Text>
                    </TouchableOpacity>
                </View>
            </SmoothModal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backBtn: {
        padding: 6,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    headerSub: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    flowCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    flowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    flowName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    triggerBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
        marginTop: 4,
    },
    switchBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    switchBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 8,
        marginTop: 10,
    },
    metricText: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '500',
    },
    nodesTimeline: {
        marginTop: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#E2E8F0',
        marginLeft: 10,
        paddingLeft: 12,
    },
    nodeItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    nodeBullet: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.whatsappGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -23,
    },
    nodeNum: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
    nodeTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    nodeDesc: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    flowActions: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 10,
        marginTop: 6,
        alignItems: 'flex-end',
    },
    testBtn: {
        backgroundColor: '#0F172A',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    testBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    simCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '75%',
        padding: 16,
    },
    simHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    simTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    simChatArea: {
        flex: 1,
        paddingVertical: 12,
    },
    simBubble: {
        maxWidth: '80%',
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
    },
    simBot: {
        backgroundColor: '#F1F5F9',
        alignSelf: 'flex-start',
    },
    simUser: {
        backgroundColor: Colors.whatsappOutgoingBubble,
        alignSelf: 'flex-end',
    },
    simText: {
        fontSize: 13,
    },
    simInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 10,
    },
    simInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
    },
    simSendBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 9,
        marginLeft: 8,
    },
});
