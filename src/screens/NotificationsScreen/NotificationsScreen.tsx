import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import { AppBottomBar, BottomNavTab } from '../../components/AppBottomBar';
import {
    IconUser,
    IconMegaphone,
    IconTrophy,
    IconZap,
} from '../../components/AppIcons';
import { ChevronBackIcon } from '../../components/ChatIcons';

interface NotificationItem {
    id: string;
    type: 'assigned' | 'broadcast' | 'deal' | 'system';
    title: string;
    description: string;
    time: string;
    isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 'n1',
        type: 'assigned',
        title: 'Conversation Assigned',
        description: 'Rahul Verma has been assigned to you by Admin.',
        time: '10m ago',
        isRead: false,
    },
    {
        id: 'n2',
        type: 'broadcast',
        title: 'Broadcast Dispatched',
        description: 'Campaign "October Flash Sale" finished: 1,248 delivered, 82% read rate.',
        time: '45m ago',
        isRead: false,
    },
    {
        id: 'n3',
        type: 'deal',
        title: 'Deal Closed Won!',
        description: 'Deal "50 Enterprise Licenses" ($12,000) successfully won.',
        time: '2h ago',
        isRead: true,
    },
    {
        id: 'n4',
        type: 'system',
        title: 'Meta WhatsApp Status',
        description: 'Phone number quality rating is HIGH. All Cloud API webhooks healthy.',
        time: '1d ago',
        isRead: true,
    },
];

interface NotificationsScreenProps {
    onBack?: () => void;
    onNavigateTab?: (tab: BottomNavTab) => void;
    onOpenDashboard?: () => void;
    onOpenProfile?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
    onBack,
    onNavigateTab,
    onOpenDashboard,
    onOpenProfile,
}) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Header: Logo on Left, Profile & Actions on Right */}
                <AppHeader
                    title="Notifications Feed"
                    subtitle="Workspace alerts & system activity"
                    onBack={onBack}
                    onPressDashboard={onOpenDashboard}
                    onPressNotifications={() => {}}
                    onPressProfile={onOpenProfile || (() => onNavigateTab && onNavigateTab('More'))}
                    unreadCount={0}
                    rightElement={
                        <TouchableOpacity onPress={markAllRead} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F1F5F9', borderRadius: 8 }}>
                            <Text style={styles.markReadText}>Mark all read</Text>
                        </TouchableOpacity>
                    }
                />

                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <View style={[styles.notifCard, !item.isRead && styles.notifUnread]}>
                            <View style={styles.iconCircle}>
                                {item.type === 'assigned' ? (
                                    <IconUser size={18} color="#1E40AF" />
                                ) : item.type === 'broadcast' ? (
                                    <IconMegaphone size={18} color="#7C3AED" />
                                ) : item.type === 'deal' ? (
                                    <IconTrophy size={18} color="#D97706" />
                                ) : (
                                    <IconZap size={18} color="#059669" />
                                )}
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.notifTitle}>{item.title}</Text>
                                    <Text style={styles.notifTime}>{item.time}</Text>
                                </View>
                                <Text style={styles.notifDesc}>{item.description}</Text>
                            </View>
                        </View>
                    )}
                />

                {/* Unified 5-Tab Bottom Bar: Inbox, Automation, AI Agent, Broadcast, More */}
                <AppBottomBar
                    activeTab="More"
                    onNavigateTab={onNavigateTab}
                />
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
    markReadText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.whatsappGreen,
    },
    notifCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    notifUnread: {
        backgroundColor: '#F0FDF4',
        borderColor: '#86EFAC',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    notifTime: {
        fontSize: 11,
        color: '#94A3B8',
    },
    notifDesc: {
        fontSize: 12,
        color: '#475569',
        marginTop: 3,
        lineHeight: 17,
    },
});
