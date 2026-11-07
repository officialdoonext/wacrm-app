import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    Dimensions,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { BrandLogo } from '../../components/BrandLogo';
import { AppHeader } from '../../components/AppHeader';
import { SmoothModal } from '../../components/SmoothModal';
import {
    IconUser,
    IconChat,
    IconClock,
    IconClose,
} from '../../components/AppIcons';
import { ChevronBackIcon } from '../../components/ChatIcons';
import { supabase, authService } from '../../services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DealItem {
    id: string;
    title: string;
    contactName: string;
    contactPhone?: string;
    value: number;
    currency: string;
    stageId: string;
    closeDate: string;
    assignedTo?: string;
}

interface StageColumn {
    id: string;
    name: string;
    probability: number;
    color: string;
}

const DEFAULT_STAGES: StageColumn[] = [
    { id: 'stage_1', name: 'Lead In', probability: 10, color: '#3B82F6' },
    { id: 'stage_2', name: 'Contact Made', probability: 25, color: '#6366F1' },
    { id: 'stage_3', name: 'Demo / Meeting', probability: 50, color: '#8B5CF6' },
    { id: 'stage_4', name: 'Proposal Sent', probability: 75, color: '#F59E0B' },
    { id: 'stage_5', name: 'Closed Won', probability: 100, color: '#10B981' },
    { id: 'stage_6', name: 'Closed Lost', probability: 0, color: '#EF4444' },
];

const INITIAL_DEALS: DealItem[] = [
    { id: 'd1', title: '50 Enterprise Licenses', contactName: 'Rahul Verma', value: 12000, currency: '$', stageId: 'stage_1', closeDate: 'Nov 18' },
    { id: 'd2', title: 'Annual SaaS Plan', contactName: 'Ananya Sharma', value: 4500, currency: '$', stageId: 'stage_2', closeDate: 'Nov 22' },
    { id: 'd3', title: 'WhatsApp Automation Onboarding', contactName: 'Suresh Patel', value: 8200, currency: '$', stageId: 'stage_3', closeDate: 'Nov 25' },
    { id: 'd4', title: 'Custom Bot Flow Integration', contactName: 'Vikram Joshi', value: 6500, currency: '$', stageId: 'stage_4', closeDate: 'Nov 30' },
    { id: 'd5', title: 'Gym Chain Multi-Location Suite', contactName: 'Fitness Pro Club', value: 14000, currency: '$', stageId: 'stage_5', closeDate: 'Oct 30' },
];

interface PipelinesScreenProps {
    onBack?: () => void;
    onOpenChat?: (contactName: string, phone?: string) => void;
}

export const PipelinesScreen: React.FC<PipelinesScreenProps> = ({
    onBack,
    onOpenChat,
}) => {
    const [deals, setDeals] = useState<DealItem[]>(INITIAL_DEALS);
    const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(null);
    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);

    // Add Deal Form
    const [newTitle, setNewTitle] = useState('');
    const [newContact, setNewContact] = useState('');
    const [newValue, setNewValue] = useState('');
    const [newStage, setNewStage] = useState('stage_1');
    const [isSaving, setIsSaving] = useState(false);

    // Load deals from Supabase if table exists
    useEffect(() => {
        const loadDbDeals = async () => {
            try {
                const { data } = await supabase
                    .from('deals')
                    .select('id, title, value, currency, stage_id, expected_close_date, contacts(name, phone)')
                    .limit(50);
                if (data && data.length > 0) {
                    const mapped: DealItem[] = data.map((d: any) => ({
                        id: d.id,
                        title: d.title,
                        contactName: d.contacts?.name || 'Lead',
                        contactPhone: d.contacts?.phone,
                        value: Number(d.value) || 0,
                        currency: d.currency || '$',
                        stageId: d.stage_id || 'stage_1',
                        closeDate: d.expected_close_date || 'Dec 01',
                    }));
                    setDeals(mapped);
                }
            } catch {
                // Keep default deals
            }
        };
        loadDbDeals();
    }, []);

    const totalPipelineValue = deals.reduce((acc, d) => acc + d.value, 0);

    const handleMoveDeal = (targetStageId: string) => {
        if (!selectedDeal) return;
        setDeals((prev) =>
            prev.map((d) => (d.id === selectedDeal.id ? { ...d, stageId: targetStageId } : d))
        );
        setMoveModalVisible(false);
    };

    const handleCreateDeal = async () => {
        if (!newTitle.trim() || !newContact.trim() || !newValue.trim()) {
            Alert.alert('Required', 'Please fill in title, contact, and deal value');
            return;
        }

        setIsSaving(true);
        try {
            const user = await authService.getCurrentUser();
            const profile = await authService.getProfile();

            const dealPayload = {
                title: newTitle.trim(),
                value: Number(newValue) || 0,
                currency: '$',
                stage_id: newStage,
                status: 'open',
                user_id: user?.id,
                account_id: profile?.account_id,
            };

            const { data } = await supabase.from('deals').insert(dealPayload).select().single();

            const created: DealItem = {
                id: data?.id || 'deal_' + Date.now(),
                title: newTitle.trim(),
                contactName: newContact.trim(),
                value: Number(newValue) || 0,
                currency: '$',
                stageId: newStage,
                closeDate: 'Dec 15',
            };

            setDeals([created, ...deals]);
            setAddModalVisible(false);
            setNewTitle('');
            setNewContact('');
            setNewValue('');
            Alert.alert('Success', 'Deal added to pipeline!');
        } catch (err: any) {
            console.warn('Error saving deal:', err);
            const created: DealItem = {
                id: 'deal_' + Date.now(),
                title: newTitle.trim(),
                contactName: newContact.trim(),
                value: Number(newValue) || 0,
                currency: '$',
                stageId: newStage,
                closeDate: 'Dec 15',
            };
            setDeals([created, ...deals]);
            setAddModalVisible(false);
            setNewTitle('');
            setNewContact('');
            setNewValue('');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Header: Logo on Left, Profile & Actions on Right */}
                <AppHeader
                    title="Sales Pipeline"
                    subtitle={`$${totalPipelineValue.toLocaleString()} • ${deals.length} deals`}
                    onBack={onBack}
                    rightElement={
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => setAddModalVisible(true)}>
                            <Text style={styles.addBtnText}>+ Add Deal</Text>
                        </TouchableOpacity>
                    }
                />

                {/* Horizontal Kanban Board */}
                <ScrollView
                    horizontal
                    pagingEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.kanbanScroll}>
                    {DEFAULT_STAGES.map((stage) => {
                        const stageDeals = deals.filter((d) => d.stageId === stage.id);
                        const stageTotal = stageDeals.reduce((acc, d) => acc + d.value, 0);

                        return (
                            <View key={stage.id} style={styles.stageColumn}>
                                {/* Stage Column Header */}
                                <View style={[styles.columnHeader, { borderTopColor: stage.color }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={[styles.colorDot, { backgroundColor: stage.color }]} />
                                            <Text style={styles.stageTitle}>{stage.name}</Text>
                                        </View>
                                        <View style={styles.dealCountBadge}>
                                            <Text style={styles.dealCountText}>{stageDeals.length}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.stageValueText}>
                                        ${stageTotal.toLocaleString()} ({stage.probability}%)
                                    </Text>
                                </View>

                                {/* Deals List */}
                                <ScrollView style={styles.dealsList} showsVerticalScrollIndicator={false}>
                                    {stageDeals.map((deal) => (
                                        <TouchableOpacity
                                            key={deal.id}
                                            style={styles.dealCard}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                setSelectedDeal(deal);
                                                setMoveModalVisible(true);
                                            }}>
                                            <Text style={styles.dealTitle}>{deal.title}</Text>

                                            <View style={styles.contactRow}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <IconUser size={13} color="#64748B" />
                                                    <Text style={styles.contactName}>{deal.contactName}</Text>
                                                </View>
                                                {!!deal.contactPhone && (
                                                    <TouchableOpacity
                                                        onPress={() => onOpenChat && onOpenChat(deal.contactName, deal.contactPhone)}>
                                                        <IconChat size={14} color="#059669" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            <View style={styles.dealFooter}>
                                                <Text style={styles.dealPrice}>
                                                    {deal.currency}{deal.value.toLocaleString()}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <IconClock size={11} color="#94A3B8" />
                                                    <Text style={styles.dealDate}>{deal.closeDate}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    <TouchableOpacity
                                        style={styles.addCardPrompt}
                                        onPress={() => {
                                            setNewStage(stage.id);
                                            setAddModalVisible(true);
                                        }}>
                                        <Text style={styles.addCardPromptText}>+ Add deal here</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Smooth Modal: Move Stage Action */}
            <SmoothModal visible={moveModalVisible} onClose={() => setMoveModalVisible(false)}>
                <Text style={styles.modalTitle}>Move Deal to Stage</Text>
                <Text style={styles.modalSub}>{selectedDeal?.title}</Text>

                {DEFAULT_STAGES.map((s) => (
                    <TouchableOpacity
                        key={s.id}
                        style={[
                            styles.stageOption,
                            selectedDeal?.stageId === s.id && { backgroundColor: '#DCFCE7' },
                        ]}
                        onPress={() => handleMoveDeal(s.id)}>
                        <View style={[styles.colorDot, { backgroundColor: s.color }]} />
                        <Text style={styles.stageOptionText}>{s.name} ({s.probability}%)</Text>
                    </TouchableOpacity>
                ))}
            </SmoothModal>

            {/* Smooth Modal: Add Deal */}
            <SmoothModal visible={addModalVisible} onClose={() => setAddModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={styles.sheetTitle}>Create New Sales Deal</Text>
                    <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Deal Title *</Text>
                <TextInput
                    style={styles.sheetInput}
                    placeholder="e.g. 100 User Enterprise License"
                    value={newTitle}
                    onChangeText={setNewTitle}
                />

                <Text style={styles.fieldLabel}>Customer / Contact Name *</Text>
                <TextInput
                    style={styles.sheetInput}
                    placeholder="e.g. Acme Corp (John Doe)"
                    value={newContact}
                    onChangeText={setNewContact}
                />

                <Text style={styles.fieldLabel}>Deal Value (USD $) *</Text>
                <TextInput
                    style={styles.sheetInput}
                    placeholder="5000"
                    keyboardType="numeric"
                    value={newValue}
                    onChangeText={setNewValue}
                />

                <TouchableOpacity
                    style={styles.saveDealBtn}
                    onPress={handleCreateDeal}>
                    <Text style={styles.saveDealText}>Save & Add to Pipeline</Text>
                </TouchableOpacity>
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
        backgroundColor: '#F1F5F9',
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
    addBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    addBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
    kanbanScroll: {
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    stageColumn: {
        width: SCREEN_WIDTH * 0.76,
        backgroundColor: '#E2E8F0',
        borderRadius: 14,
        marginRight: 12,
        maxHeight: '100%',
        padding: 10,
    },
    columnHeader: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        borderTopWidth: 4,
        marginBottom: 8,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    stageTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    dealCountBadge: {
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    dealCountText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
    },
    stageValueText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 4,
    },
    dealsList: {
        flex: 1,
    },
    dealCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dealTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 6,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactName: {
        fontSize: 12,
        color: '#475569',
    },
    dealFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
        paddingTop: 6,
    },
    dealPrice: {
        fontSize: 13,
        fontWeight: '800',
        color: '#059669',
    },
    dealDate: {
        fontSize: 11,
        color: '#94A3B8',
    },
    addCardPrompt: {
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        borderRadius: 8,
        marginTop: 4,
    },
    addCardPromptText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    modalSub: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 16,
    },
    stageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 6,
    },
    stageOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    sheetTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
        marginTop: 10,
    },
    sheetInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#0F172A',
    },
    saveDealBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 18,
    },
    saveDealText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
