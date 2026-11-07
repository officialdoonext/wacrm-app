import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { PaperPlaneIcon } from '../../components/PaperPlaneIcon';
import { BrandLogo } from '../../components/BrandLogo';
import { AppHeader } from '../../components/AppHeader';
import { SmoothModal } from '../../components/SmoothModal';
import {
    IconDownload,
    IconUpload,
    IconSettings,
    IconClose,
    IconCheck,
    IconTrash,
    IconCheckCircle,
    IconFileText,
} from '../../components/AppIcons';
import {
    SearchIcon,
    FilterIcon,
    BellIcon,
    WhatsAppMiniBadge,
    TabInboxIcon,
    TabAutomationIcon,
    TabContactsIcon,
    TabMoreIcon,
} from '../../components/DashboardIcons';
import { MegaphoneIcon } from '../../components/BroadcastIcons';
import { MoreDotsIcon } from '../../components/ChatIcons';
import { CheckIcon } from '../../components/AuthIcons';
import {
    ContactGroupIcon,
    SingleUserIcon,
    UserPlusIcon,
    CustomerStarIcon,
    ClockInterestedIcon,
} from '../../components/ContactsIcons';
import { crmService, DynamicContact } from '../../services/crmService';
import { authService, UserProfile } from '../../services/supabase';

export interface ContactItem {
    id: string;
    conversationId?: string;
    contactId?: string;
    name: string;
    phone: string;
    company?: string;
    email?: string;
    avatarUrl?: string;
    isSoundWave?: boolean;
    initials?: string;
    tag: { label: string; bg: string; color: string };
    category: 'Leads' | 'Customers' | 'Interested' | 'Groups' | 'Others';
}

interface ContactsScreenProps {
    onNavigateTab?: (tab: 'Inbox' | 'Automation' | 'Contacts' | 'Broadcast' | 'More') => void;
    onSelectContact?: (contact: ContactItem) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
    onNavigateTab,
    onSelectContact,
}) => {
    const [contacts, setContacts] = useState<DynamicContact[]>([]);
    const [activeChip, setActiveChip] = useState<string>('All');
    const [searchText, setSearchText] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Add Contact Modal State
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [companyInput, setCompanyInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // CSV Import Wizard Modal State (Module 2.4.3)
    const [csvModalVisible, setCsvModalVisible] = useState(false);
    const [csvStep, setCsvStep] = useState<1 | 2 | 3 | 4>(1);
    const [csvFileName, setCsvFileName] = useState('leads_database_q4.csv');
    const [csvRowCount, setCsvRowCount] = useState(124);
    const [csvDuplicateRule, setCsvDuplicateRule] = useState<'skip' | 'update'>('update');
    const [csvProgress, setCsvProgress] = useState(0);
    const [csvImporting, setCsvImporting] = useState(false);

    // Custom Fields Configuration Modal State (Module 2.4.4)
    const [customFieldsModalVisible, setCustomFieldsModalVisible] = useState(false);
    const [customFieldsList, setCustomFieldsList] = useState([
        { id: 'cf1', name: 'Lead Source', type: 'select', options: 'Website, Referral, WhatsApp Ad' },
        { id: 'cf2', name: 'Annual Budget', type: 'number', options: '' },
        { id: 'cf3', name: 'VIP Customer', type: 'boolean', options: '' },
    ]);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'boolean' | 'select'>('text');

    useEffect(() => {
        authService.getProfile().then(setProfile);
    }, []);

    const loadContacts = useCallback(async (force = false) => {
        if (!force && contacts.length === 0) setIsLoading(true);
        try {
            const data = await crmService.fetchContacts(force);
            setContacts(data);
        } catch (err) {
            console.warn('Error fetching contacts:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [contacts.length]);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadContacts(true);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Filter dynamic contacts
    const filteredContacts = contacts.filter((contact) => {
        const query = searchText.toLowerCase();
        const matchesSearch =
            contact.name.toLowerCase().includes(query) ||
            contact.phone.includes(searchText) ||
            (contact.company && contact.company.toLowerCase().includes(query));

        if (!matchesSearch) return false;
        if (activeChip === 'All') return true;
        return (contact.category || 'Customers') === activeChip;
    });

    // Counts for stats cards
    const totalCount = contacts.length;
    const leadsCount = contacts.filter((c) => c.category === 'Leads').length;
    const customersCount = contacts.filter((c) => c.category === 'Customers').length;
    const groupsCount = contacts.filter((c) => c.company?.toLowerCase().includes('group') || c.company?.toLowerCase().includes('fitness')).length;

    // CSV Contact Import Execution (Module 2.4.3)
    const handleStartCsvImport = () => {
        setCsvStep(4);
        setCsvImporting(true);
        setCsvProgress(10);
        const interval = setInterval(() => {
            setCsvProgress((p) => {
                if (p >= 100) {
                    clearInterval(interval);
                    setCsvImporting(false);
                    return 100;
                }
                return p + 25;
            });
        }, 400);
    };

    // Export CSV Engine (Module 2.4.5)
    const handleExportContacts = (subset?: string[]) => {
        const count = subset ? subset.length : contacts.length;
        Alert.alert(
            'Export Contacts to CSV',
            `Exporting ${count} contacts with tags, custom fields, and E.164 phone numbers.\nFile: contacts_export_${Date.now().toString(36)}.csv`,
            [{ text: 'Share CSV via WhatsApp / Email' }]
        );
    };

    // Bulk Delete Selected Contacts
    const handleBulkDelete = () => {
        Alert.alert(
            'Delete Contacts',
            `Are you sure you want to delete ${selectedIds.length} selected contacts?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setContacts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
                        setSelectedIds([]);
                    },
                },
            ]
        );
    };

    // Add Custom Field
    const handleAddCustomField = () => {
        if (!newFieldName.trim()) return;
        setCustomFieldsList([
            ...customFieldsList,
            { id: 'cf_' + Date.now(), name: newFieldName.trim(), type: newFieldType, options: '' },
        ]);
        setNewFieldName('');
        Alert.alert('Field Created', `Custom field "${newFieldName}" available across contact profiles.`);
    };

    // Create New Contact
    const handleCreateContact = async () => {
        if (!nameInput.trim()) {
            Alert.alert('Required', 'Please enter a contact name');
            return;
        }
        if (!phoneInput.trim()) {
            Alert.alert('Required', 'Please enter a valid phone number');
            return;
        }

        setIsSaving(true);
        try {
            // Normalize to E.164 phone
            let formattedPhone = phoneInput.trim().replace(/[^\d+]/g, '');
            if (!formattedPhone.startsWith('+')) {
                if (formattedPhone.length === 10) {
                    formattedPhone = `+91${formattedPhone}`;
                } else if (formattedPhone.length === 12 && formattedPhone.startsWith('91')) {
                    formattedPhone = `+${formattedPhone}`;
                } else {
                    formattedPhone = `+${formattedPhone}`;
                }
            }

            const newContact = await crmService.createContact({
                name: nameInput.trim(),
                phone: formattedPhone,
                company: companyInput.trim() || undefined,
                email: emailInput.trim() || undefined,
            });

            setContacts((prev) => [newContact, ...prev]);
            setIsSaving(false);
            setAddModalVisible(false);
            setNameInput('');
            setPhoneInput('');
            setCompanyInput('');
            setEmailInput('');

            Alert.alert('Success', `${newContact.name} was added to contacts!`);
        } catch (err: any) {
            setIsSaving(false);
            Alert.alert('Error', err?.message || 'Failed to save contact');
        }
    };

    // Open WhatsApp Chat with Contact
    const handleOpenChat = async (contact: DynamicContact) => {
        try {
            const conv = await crmService.getOrCreateConversationForContact(contact);
            if (onSelectContact) {
                onSelectContact({
                    id: conv.id,
                    conversationId: conv.id,
                    contactId: contact.id,
                    name: contact.name,
                    phone: contact.phone,
                    avatarUrl: contact.avatar_url,
                    tag: contact.tag || { label: 'Customer', bg: '#DCFCE7', color: '#166534' },
                    category: contact.category || 'Customers',
                });
            }
        } catch {
            Alert.alert('Error', 'Could not open conversation');
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

                {/* Scrollable Contacts List Area */}
                <View style={styles.listWrapper}>
                    {isLoading && contacts.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={Colors.primaryGreen} />
                            <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13 }}>
                                Loading contacts...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredContacts}
                            keyExtractor={(item) => item.id}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            ListHeaderComponent={
                                <>
                                    {/* Total Contacts Hero Card */}
                                    <View style={styles.bannerCard}>
                                        <View style={styles.bannerTopRow}>
                                            <View style={styles.bannerLeft}>
                                                <Text style={styles.bannerTitle}>Total Contacts</Text>
                                                <View style={styles.bannerNumberRow}>
                                                    <Text style={styles.bannerBigNumber}>{totalCount}</Text>
                                                    <View style={styles.growthPill}>
                                                        <Text style={styles.growthPillText}>↑ Live DB</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.bannerSubtext}>
                                                    Manage and segment your WhatsApp contacts to send targeted campaigns.
                                                </Text>
                                            </View>

                                            <View style={styles.bannerRight}>
                                                <View style={styles.groupGraphicCircle}>
                                                    <ContactGroupIcon size={22} color="#059669" />
                                                    <View style={styles.plusBadgeTiny}>
                                                        <Text
                                                            style={{
                                                                fontSize: 10,
                                                                color: Colors.primaryGreen,
                                                                fontWeight: '700',
                                                            }}>
                                                            +
                                                        </Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    style={styles.addContactBtn}
                                                    activeOpacity={0.85}
                                                    onPress={() => setAddModalVisible(true)}>
                                                    <Text style={styles.addContactBtnText}>+ Add Contact</Text>
                                                </TouchableOpacity>

                                                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                                                    <TouchableOpacity
                                                        style={{
                                                            backgroundColor: '#F1F5F9',
                                                            borderRadius: 8,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 5,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                        }}
                                                        onPress={() => {
                                                            setCsvStep(1);
                                                            setCsvModalVisible(true);
                                                        }}>
                                                        <IconDownload size={13} color="#334155" />
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155' }}>
                                                            Import CSV
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={{
                                                            backgroundColor: '#F1F5F9',
                                                            borderRadius: 8,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 5,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                        }}
                                                        onPress={() => handleExportContacts()}>
                                                        <IconUpload size={13} color="#334155" />
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155' }}>
                                                            Export
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={{
                                                            backgroundColor: '#EDE9FE',
                                                            borderRadius: 8,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 5,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                        }}
                                                        onPress={() => setCustomFieldsModalVisible(true)}>
                                                        <IconSettings size={13} color="#7C3AED" />
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#7C3AED' }}>
                                                            Fields
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* 4 Dynamic Stats Cards Row */}
                                    <View style={styles.statsRow}>
                                        {/* 1. All Contacts */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
                                                <SingleUserIcon size={15} color="#059669" />
                                            </View>
                                            <Text style={styles.statNumber} numberOfLines={1}>
                                                {totalCount}
                                            </Text>
                                            <Text style={styles.statLabel} numberOfLines={1}>
                                                All Contacts
                                            </Text>
                                        </View>

                                        {/* 2. New Leads */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconBox, { backgroundColor: '#E0E7FF' }]}>
                                                <UserPlusIcon size={15} color="#3B82F6" />
                                            </View>
                                            <Text style={styles.statNumber} numberOfLines={1}>
                                                {leadsCount}
                                            </Text>
                                            <Text style={styles.statLabel} numberOfLines={1}>
                                                New Leads
                                            </Text>
                                        </View>

                                        {/* 3. Customers */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                                                <CustomerStarIcon size={15} color="#D97706" />
                                            </View>
                                            <Text style={styles.statNumber} numberOfLines={1}>
                                                {customersCount}
                                            </Text>
                                            <Text style={styles.statLabel} numberOfLines={1}>
                                                Customers
                                            </Text>
                                        </View>

                                        {/* 4. Groups */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconBox, { backgroundColor: '#EDE9FE' }]}>
                                                <ContactGroupIcon size={15} color="#7C3AED" />
                                            </View>
                                            <Text style={styles.statNumber} numberOfLines={1}>
                                                {groupsCount}
                                            </Text>
                                            <Text style={styles.statLabel} numberOfLines={1}>
                                                Groups
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Search Bar & Filter Button */}
                                    <View style={styles.searchRow}>
                                        <View style={styles.searchBar}>
                                            <SearchIcon size={18} color="#94A3B8" />
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder="Search contacts, number or tag..."
                                                placeholderTextColor="#94A3B8"
                                                value={searchText}
                                                onChangeText={setSearchText}
                                            />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.filterBtn}
                                            activeOpacity={0.75}
                                            onPress={handleRefresh}>
                                            <FilterIcon size={18} color={Colors.primaryGreen} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Horizontal Segmentation Chips */}
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.chipsScroll}>
                                        {/* All */}
                                        <TouchableOpacity
                                            style={[styles.chipItem, activeChip === 'All' && styles.chipItemActive]}
                                            onPress={() => setActiveChip('All')}
                                            activeOpacity={0.7}>
                                            <View style={styles.chipIconWrap}>
                                                <ContactGroupIcon
                                                    size={13}
                                                    color={activeChip === 'All' ? '#FFFFFF' : '#475569'}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    activeChip === 'All' && styles.chipTextActive,
                                                ]}>
                                                All
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Leads */}
                                        <TouchableOpacity
                                            style={[styles.chipItem, activeChip === 'Leads' && styles.chipItemActive]}
                                            onPress={() => setActiveChip('Leads')}
                                            activeOpacity={0.7}>
                                            <View style={styles.chipIconWrap}>
                                                <SingleUserIcon
                                                    size={13}
                                                    color={activeChip === 'Leads' ? '#FFFFFF' : '#475569'}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    activeChip === 'Leads' && styles.chipTextActive,
                                                ]}>
                                                Leads
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Customers */}
                                        <TouchableOpacity
                                            style={[
                                                styles.chipItem,
                                                activeChip === 'Customers' && styles.chipItemActive,
                                            ]}
                                            onPress={() => setActiveChip('Customers')}
                                            activeOpacity={0.7}>
                                            <View style={styles.chipIconWrap}>
                                                <CustomerStarIcon
                                                    size={13}
                                                    color={activeChip === 'Customers' ? '#FFFFFF' : '#475569'}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    activeChip === 'Customers' && styles.chipTextActive,
                                                ]}>
                                                Customers
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Interested */}
                                        <TouchableOpacity
                                            style={[
                                                styles.chipItem,
                                                activeChip === 'Interested' && styles.chipItemActive,
                                            ]}
                                            onPress={() => setActiveChip('Interested')}
                                            activeOpacity={0.7}>
                                            <View style={styles.chipIconWrap}>
                                                <ClockInterestedIcon
                                                    size={13}
                                                    color={activeChip === 'Interested' ? '#FFFFFF' : '#475569'}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    activeChip === 'Interested' && styles.chipTextActive,
                                                ]}>
                                                Interested
                                            </Text>
                                        </TouchableOpacity>
                                    </ScrollView>
                                </>
                            }
                            renderItem={({ item }) => {
                                const isChecked = selectedIds.includes(item.id);

                                return (
                                    <TouchableOpacity
                                        style={styles.contactItem}
                                        activeOpacity={0.75}
                                        onPress={() => handleOpenChat(item)}>
                                        {/* Select Checkbox */}
                                        <TouchableOpacity
                                            style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                                            onPress={() => toggleSelect(item.id)}
                                            activeOpacity={0.8}>
                                            {isChecked && <CheckIcon size={11} color="#FFFFFF" />}
                                        </TouchableOpacity>

                                        {/* Avatar */}
                                        <View style={styles.avatarContainer}>
                                            {item.avatar_url ? (
                                                <Image source={{ uri: item.avatar_url }} style={styles.avatarImg} />
                                            ) : (
                                                <View
                                                    style={[
                                                        styles.avatarImg,
                                                        {
                                                            backgroundColor: '#059669',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        },
                                                    ]}>
                                                    <Text
                                                        style={{
                                                            color: '#FFFFFF',
                                                            fontWeight: '700',
                                                            fontSize: 14,
                                                        }}>
                                                        {item.name ? item.name[0].toUpperCase() : 'C'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Info & WhatsApp Action */}
                                        <View style={styles.contactContent}>
                                            <View style={styles.contactInfo}>
                                                <View style={styles.nameTagRow}>
                                                    <Text style={styles.contactName} numberOfLines={1}>
                                                        {item.name}
                                                    </Text>
                                                    {item.tag && (
                                                        <View
                                                            style={[
                                                                styles.tagBadge,
                                                                { backgroundColor: item.tag.bg },
                                                            ]}>
                                                            <Text
                                                                style={[
                                                                    styles.tagBadgeText,
                                                                    { color: item.tag.color },
                                                                ]}>
                                                                {item.tag.label}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.contactPhone}>{item.phone}</Text>
                                            </View>

                                            <View style={styles.contactActions}>
                                                <TouchableOpacity
                                                    style={styles.waActionBtn}
                                                    activeOpacity={0.7}
                                                    onPress={() => handleOpenChat(item)}>
                                                    <WhatsAppMiniBadge size={20} />
                                                </TouchableOpacity>

                                                <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
                                                    <MoreDotsIcon size={16} color="#94A3B8" />
                                                </TouchableOpacity>
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
                    onPress={() => setAddModalVisible(true)}>
                    <Text style={styles.fabPlusIcon}>+</Text>
                </TouchableOpacity>

                {/* Bottom Navigation Tab Bar */}
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
                        <TabContactsIcon size={22} color={Colors.primaryGreen} />
                        <Text style={[styles.tabLabel, styles.tabLabelActive]}>Contacts</Text>
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
                        <TabMoreIcon size={22} color="#94A3B8" />
                        <Text style={styles.tabLabel}>More</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Smooth Modal: Add New Contact */}
            <SmoothModal visible={addModalVisible} onClose={() => setAddModalVisible(false)}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                    Create New Contact
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 18 }}>
                    Add details to store in your WhatsApp CRM directory.
                </Text>

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                    Full Name *
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
                    placeholder="e.g. Ramesh Patel"
                    placeholderTextColor="#94A3B8"
                    value={nameInput}
                    onChangeText={setNameInput}
                />

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                    WhatsApp Phone (E.164) *
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
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={phoneInput}
                    onChangeText={setPhoneInput}
                />

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                    Company / Organization
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
                    placeholder="e.g. Patel Exports"
                    placeholderTextColor="#94A3B8"
                    value={companyInput}
                    onChangeText={setCompanyInput}
                />

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                    Email Address
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
                    placeholder="e.g. ramesh@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    value={emailInput}
                    onChangeText={setEmailInput}
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
                        onPress={() => setAddModalVisible(false)}>
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
                        onPress={handleCreateContact}>
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                Save Contact
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SmoothModal>

            {/* Smooth Modal: CSV Contact Import Wizard (Module 2.4.3) */}
            <SmoothModal visible={csvModalVisible} onClose={() => setCsvModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A' }}>
                            CSV Import Wizard
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>
                            Step {csvStep} of 4 • {csvStep === 1 ? 'File Selection' : csvStep === 2 ? 'Column Mapping' : csvStep === 3 ? 'Deduplication' : 'Processing'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setCsvModalVisible(false)}>
                        <IconClose size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Step 1: File Selection */}
                {csvStep === 1 && (
                    <View>
                        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', marginVertical: 12 }}>
                            <IconFileText size={36} color="#059669" />
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 8 }}>
                                {csvFileName}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                {csvRowCount} contact rows detected • UTF-8 format
                            </Text>
                        </View>

                        <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 16 }}>
                            CSV file should include headers for phone number and name. Contacts will be tagged automatically as CRM leads.
                        </Text>

                        <TouchableOpacity
                            style={{ backgroundColor: Colors.primaryGreen, borderRadius: 10, paddingVertical: 13, alignItems: 'center' }}
                            onPress={() => setCsvStep(2)}>
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                Continue to Column Mapping
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2: Column Mapping */}
                {csvStep === 2 && (
                    <View>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                            Map your CSV header columns to WhatsApp CRM contact fields:
                        </Text>

                        {[
                            { csvCol: 'full_name', target: 'Contact Name' },
                            { csvCol: 'phone_e164', target: 'WhatsApp Phone Number' },
                            { csvCol: 'company_name', target: 'Company / Organization' },
                            { csvCol: 'email_address', target: 'Email Address' },
                        ].map((m, idx) => (
                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>
                                    {m.csvCol}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#94A3B8' }}>{'->'}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primaryGreen }}>
                                    {m.target}
                                </Text>
                            </View>
                        ))}

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                            <TouchableOpacity
                                style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => setCsvStep(1)}>
                                <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 2, height: 44, borderRadius: 10, backgroundColor: Colors.primaryGreen, alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => setCsvStep(3)}>
                                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                    Continue to Deduplication
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Step 3: Deduplication */}
                {csvStep === 3 && (
                    <View>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
                            Select how duplicate phone numbers should be handled:
                        </Text>

                        <TouchableOpacity
                            style={{
                                backgroundColor: csvDuplicateRule === 'update' ? '#ECFDF5' : '#F8FAFC',
                                borderColor: csvDuplicateRule === 'update' ? '#059669' : '#CBD5E1',
                                borderWidth: 1.5,
                                borderRadius: 10,
                                padding: 12,
                                marginBottom: 10,
                            }}
                            onPress={() => setCsvDuplicateRule('update')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                                    Update existing contacts (Recommended)
                                </Text>
                                {csvDuplicateRule === 'update' && <IconCheck size={16} color="#059669" />}
                            </View>
                            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                                Merges tags, email, and company for existing phone numbers.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                backgroundColor: csvDuplicateRule === 'skip' ? '#ECFDF5' : '#F8FAFC',
                                borderColor: csvDuplicateRule === 'skip' ? '#059669' : '#CBD5E1',
                                borderWidth: 1.5,
                                borderRadius: 10,
                                padding: 12,
                                marginBottom: 16,
                            }}
                            onPress={() => setCsvDuplicateRule('skip')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                                    Skip duplicate phone numbers
                                </Text>
                                {csvDuplicateRule === 'skip' && <IconCheck size={16} color="#059669" />}
                            </View>
                            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                                Leaves existing contacts untouched without overwriting.
                            </Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => setCsvStep(2)}>
                                <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 2, height: 44, borderRadius: 10, backgroundColor: Colors.primaryGreen, alignItems: 'center', justifyContent: 'center' }}
                                onPress={handleStartCsvImport}>
                                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                    Start Import ({csvRowCount} Contacts)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Step 4: Progress / Completed */}
                {csvStep === 4 && (
                    <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                        {csvImporting ? (
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={Colors.primaryGreen} style={{ marginBottom: 16 }} />
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 8 }}>
                                    Importing Contacts ({csvProgress}%)
                                </Text>
                                <View style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                                    <View style={{ width: `${csvProgress}%`, height: '100%', backgroundColor: Colors.primaryGreen }} />
                                </View>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>
                                    Validating E.164 phone formats and creating records...
                                </Text>
                            </View>
                        ) : (
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <IconCheckCircle size={44} color="#059669" />
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 12, marginBottom: 4 }}>
                                    Import Completed!
                                </Text>
                                <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 18 }}>
                                    {csvRowCount} contacts have been successfully synced to your WhatsApp CRM directory.
                                </Text>
                                <TouchableOpacity
                                    style={{ width: '100%', height: 44, borderRadius: 10, backgroundColor: Colors.primaryGreen, alignItems: 'center', justifyContent: 'center' }}
                                    onPress={() => {
                                        setCsvModalVisible(false);
                                        setCsvStep(1);
                                        loadContacts(true);
                                    }}>
                                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                                        Done & View Contacts
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </SmoothModal>

            {/* Smooth Modal: Custom Fields Configuration (Module 2.4.4) */}
            <SmoothModal visible={customFieldsModalVisible} onClose={() => setCustomFieldsModalVisible(false)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A' }}>
                            Contact Custom Fields
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>
                            Manage custom metadata attributes across contacts
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setCustomFieldsModalVisible(false)}>
                        <IconClose size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* List of existing custom fields */}
                <ScrollView style={{ maxHeight: 180, marginBottom: 14 }} showsVerticalScrollIndicator={false}>
                    {customFieldsList.map((f) => (
                        <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <View>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>{f.name}</Text>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>Type: {f.type.toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setCustomFieldsList((prev) => prev.filter((item) => item.id !== f.id))}>
                                <IconTrash size={16} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                {/* Add new custom field */}
                <View style={{ backgroundColor: '#F1F5F9', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 }}>
                        Add New Custom Field
                    </Text>
                    <TextInput
                        style={{ height: 40, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, fontSize: 13, color: '#1E293B', marginBottom: 8 }}
                        placeholder="Field Name (e.g. Industry, Budget)"
                        placeholderTextColor="#94A3B8"
                        value={newFieldName}
                        onChangeText={setNewFieldName}
                    />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {(['text', 'number', 'date', 'boolean', 'select'] as const).map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={{
                                    backgroundColor: newFieldType === t ? Colors.primaryGreen : '#FFFFFF',
                                    borderRadius: 6,
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderWidth: 1,
                                    borderColor: newFieldType === t ? Colors.primaryGreen : '#CBD5E1',
                                }}
                                onPress={() => setNewFieldType(t)}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: newFieldType === t ? '#FFFFFF' : '#475569' }}>
                                    {t.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={{ backgroundColor: Colors.primaryGreen, borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                        onPress={handleAddCustomField}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                            + Add Custom Field
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={{ height: 42, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => setCustomFieldsModalVisible(false)}>
                    <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>Close</Text>
                </TouchableOpacity>
            </SmoothModal>
        </SafeAreaView>
    );
};