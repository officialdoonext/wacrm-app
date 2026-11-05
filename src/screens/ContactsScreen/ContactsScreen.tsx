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
        } catch (err) {
            Alert.alert('Error', 'Could not open conversation');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Top Header Bar */}
                <View style={styles.topHeader}>
                    <View style={styles.brandLeft}>
                        <PaperPlaneIcon size={32} color={Colors.primaryGreen} />
                        <View style={styles.brandTitles}>
                            <Text style={styles.brandTitle}>WhatsAppNext</Text>
                            <Text style={styles.brandTagline}>Automate. Engage. Grow.</Text>
                        </View>
                    </View>

                    <View style={styles.headerRightActions}>
                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                            <SearchIcon size={20} color="#334155" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                            <BellIcon size={20} color="#334155" />
                            <View style={styles.notificationBadgeDot} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.profileAvatarWrap}
                            activeOpacity={0.8}
                            onPress={() => onNavigateTab && onNavigateTab('More')}>
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
                                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                                        {profile?.full_name ? profile.full_name[0].toUpperCase() : 'A'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.onlineIndicator} />
                        </TouchableOpacity>
                    </View>
                </View>

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
                                                    <Text style={styles.addContactBtnText}>Add Contact +</Text>
                                                </TouchableOpacity>
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

            {/* Modal: Add New Contact */}
            <Modal
                visible={addModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}>
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
                        }}>
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
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};