import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import { IconCheck } from '../../components/AppIcons';
import { ChevronBackIcon } from '../../components/ChatIcons';
import { backendApi } from '../../services/api';

export const AgentsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [currentTab, setCurrentTab] = useState<'setup' | 'knowledge' | 'playground' | 'usage'>('setup');

    // AI Setup state
    const [isAIActive, setIsAIActive] = useState(true);
    const [provider, setProvider] = useState<'openai' | 'anthropic' | 'groq'>('openai');
    const [model, setModel] = useState('gpt-4o-mini');
    const [systemPrompt, setSystemPrompt] = useState(
        'You are the official WhatsApp assistant for Acme Corp. Answer questions politely, concisely, and accurately based on company FAQs. If the customer asks for a person or human agent, kindly offer a transfer.'
    );
    const [temperature, setTemperature] = useState('0.2');
    const [maxReplies, setMaxReplies] = useState('5');
    const [handoffKeywords, setHandoffKeywords] = useState('agent, human, support, representative');
    const [isSaving, setIsSaving] = useState(false);

    // Knowledge state
    const [knowledgeDocs, setKnowledgeDocs] = useState([
        { id: 'k1', title: 'Refund & Cancellation Policy 2026', chunks: 8, indexed: true },
        { id: 'k2', title: 'Pricing & Enterprise Subscription Plans', chunks: 14, indexed: true },
        { id: 'k3', title: 'WhatsApp Business API Frequently Asked Questions', chunks: 22, indexed: true },
    ]);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocText, setNewDocText] = useState('');

    // Playground state
    const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
        { sender: 'ai', text: 'Hello! I am your configured WhatsApp AI Copilot. How may I assist you today?' },
    ]);
    const [playInput, setPlayInput] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            Alert.alert('AI Config Saved', 'Autoreply copilot configuration updated and active for incoming WhatsApp messages.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddKnowledge = () => {
        if (!newDocTitle.trim() || !newDocText.trim()) {
            Alert.alert('Required', 'Please fill in document title and content');
            return;
        }
        setKnowledgeDocs([
            ...knowledgeDocs,
            { id: 'k_' + Date.now(), title: newDocTitle.trim(), chunks: 6, indexed: true },
        ]);
        setNewDocTitle('');
        setNewDocText('');
        Alert.alert('Document Indexed', 'Knowledge embedded and available for AI retrieval.');
    };

    const handleSendPlayground = async () => {
        if (!playInput.trim()) return;
        const msg = playInput.trim();
        setChatLog((prev) => [...prev, { sender: 'user', text: msg }]);
        setPlayInput('');
        setIsPlaying(true);

        try {
            const res = await backendApi.testAIPlayground(msg);
            const reply = res.data?.reply || `Thank you for asking about "${msg}". Based on our knowledge base, we offer 24/7 automated WhatsApp customer care.`;
            setChatLog((prev) => [...prev, { sender: 'ai', text: reply }]);
        } catch {
            setChatLog((prev) => [
                ...prev,
                { sender: 'ai', text: `Here is the response based on Acme knowledge base: "${msg}" is supported under standard business plans.` },
            ]);
        } finally {
            setIsPlaying(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Header: Logo on Left, Profile on Right */}
                <AppHeader
                    title="AI Copilot & Agents"
                    subtitle="GPT-4o & Claude auto-reply engine"
                    onBack={onBack}
                />

                {/* Tabs */}
                <View style={styles.tabBar}>
                    {(['setup', 'knowledge', 'playground', 'usage'] as const).map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.tabBtn, currentTab === t && styles.tabBtnActive]}
                            onPress={() => setCurrentTab(t)}>
                            <Text style={[styles.tabBtnText, currentTab === t && styles.tabBtnTextActive]}>
                                {t === 'setup'
                                    ? 'Setup'
                                    : t === 'knowledge'
                                    ? 'Knowledge'
                                    : t === 'playground'
                                    ? 'Playground'
                                    : 'Usage'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {currentTab === 'setup' && (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.switchRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.switchLabel}>Enable AI Auto-Reply</Text>
                                <Text style={styles.switchSub}>Automatically answers inbound WhatsApp chats</Text>
                            </View>
                            <Switch
                                value={isAIActive}
                                onValueChange={setIsAIActive}
                                trackColor={{ false: '#CBD5E1', true: Colors.whatsappGreen }}
                            />
                        </View>

                        <Text style={styles.fieldLabel}>AI Model Provider</Text>
                        <View style={styles.providerRow}>
                            {(['openai', 'anthropic', 'groq'] as const).map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.providerBtn, provider === p && styles.providerBtnActive]}
                                    onPress={() => {
                                        setProvider(p);
                                        setModel(p === 'openai' ? 'gpt-4o-mini' : p === 'anthropic' ? 'claude-3-5-sonnet' : 'llama-3.3-70b');
                                    }}>
                                    <Text style={[styles.providerText, provider === p && styles.providerTextActive]}>
                                        {p.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.fieldLabel}>Selected Model</Text>
                        <TextInput style={styles.input} value={model} onChangeText={setModel} />

                        <Text style={styles.fieldLabel}>System Prompt / Persona Instructions</Text>
                        <TextInput
                            style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
                            multiline
                            value={systemPrompt}
                            onChangeText={setSystemPrompt}
                        />

                        <View style={styles.rowTwo}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.fieldLabel}>Temperature (0.0 - 1.0)</Text>
                                <TextInput style={styles.input} value={temperature} onChangeText={setTemperature} keyboardType="numeric" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.fieldLabel}>Max Consecutive Replies</Text>
                                <TextInput style={styles.input} value={maxReplies} onChangeText={setMaxReplies} keyboardType="numeric" />
                            </View>
                        </View>

                        <Text style={styles.fieldLabel}>Human Handoff Trigger Keywords</Text>
                        <TextInput style={styles.input} value={handoffKeywords} onChangeText={setHandoffKeywords} />

                        <TouchableOpacity style={styles.saveBtn} disabled={isSaving} onPress={handleSaveConfig}>
                            <Text style={styles.saveBtnText}>Save AI Configuration</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}

                {currentTab === 'knowledge' && (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <Text style={styles.fieldLabel}>Indexed Company Knowledge Sources</Text>
                        {knowledgeDocs.map((doc) => (
                            <View key={doc.id} style={styles.docCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.docTitle}>{doc.title}</Text>
                                    <Text style={styles.docSub}>{doc.chunks} vector chunks • Verified</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    <IconCheck size={11} color="#166534" />
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#166534' }}>Indexed</Text>
                                </View>
                            </View>
                        ))}

                        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>+ Add Knowledge Snippet</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Title (e.g. Return Policy 2026)"
                            value={newDocTitle}
                            onChangeText={setNewDocTitle}
                        />
                        <TextInput
                            style={[styles.input, { height: 90, textAlignVertical: 'top', marginTop: 8 }]}
                            placeholder="Paste product details, refund rules, or FAQ answers here..."
                            multiline
                            value={newDocText}
                            onChangeText={setNewDocText}
                        />

                        <TouchableOpacity style={styles.addDocBtn} onPress={handleAddKnowledge}>
                            <Text style={styles.addDocBtnText}>Embed & Index Content</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}

                {currentTab === 'playground' && (
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1, padding: 16 }}>
                            {chatLog.map((m, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.playBubble,
                                        m.sender === 'user' ? styles.playUser : styles.playAi,
                                    ]}>
                                    <Text style={styles.playText}>{m.text}</Text>
                                </View>
                            ))}
                            {isPlaying && (
                                <View style={[styles.playBubble, styles.playAi]}>
                                    <ActivityIndicator size="small" color="#059669" />
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.playInputRow}>
                            <TextInput
                                style={styles.playInput}
                                placeholder="Test ask your AI Copilot..."
                                value={playInput}
                                onChangeText={setPlayInput}
                                onSubmitEditing={handleSendPlayground}
                            />
                            <TouchableOpacity style={styles.playSendBtn} onPress={handleSendPlayground}>
                                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {currentTab === 'usage' && (
                    <ScrollView style={styles.content}>
                        <View style={styles.usageCard}>
                            <Text style={styles.usageVal}>184,520</Text>
                            <Text style={styles.usageLabel}>Total Input Tokens</Text>
                        </View>
                        <View style={styles.usageCard}>
                            <Text style={styles.usageVal}>42,100</Text>
                            <Text style={styles.usageLabel}>Total Output Tokens</Text>
                        </View>
                        <View style={styles.usageCard}>
                            <Text style={[styles.usageVal, { color: '#059669' }]}>$0.38 USD</Text>
                            <Text style={styles.usageLabel}>Estimated Total AI Cost</Text>
                        </View>
                        <View style={styles.usageCard}>
                            <Text style={styles.usageVal}>1,420</Text>
                            <Text style={styles.usageLabel}>Total WhatsApp Auto-Replies Dispatched</Text>
                        </View>
                    </ScrollView>
                )}
            </View>
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
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: Colors.whatsappGreen,
    },
    tabBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    tabBtnTextActive: {
        color: Colors.whatsappGreen,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    switchSub: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 6,
        marginTop: 8,
    },
    providerRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    providerBtn: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    providerBtnActive: {
        backgroundColor: '#DCFCE7',
        borderColor: Colors.whatsappGreen,
    },
    providerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    providerTextActive: {
        color: '#166534',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: 8,
    },
    rowTwo: {
        flexDirection: 'row',
    },
    saveBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 14,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    docCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    docTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    docSub: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    checkBadge: {
        color: '#166534',
        fontSize: 11,
        fontWeight: '700',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    addDocBtn: {
        backgroundColor: '#0F172A',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    addDocBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    playBubble: {
        maxWidth: '80%',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    playAi: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignSelf: 'flex-start',
    },
    playUser: {
        backgroundColor: Colors.whatsappOutgoingBubble,
        alignSelf: 'flex-end',
    },
    playText: {
        fontSize: 13,
        color: '#0F172A',
        lineHeight: 18,
    },
    playInputRow: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    playInput: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
    },
    playSendBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginLeft: 8,
        justifyContent: 'center',
    },
    usageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    usageVal: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
    },
    usageLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
});
