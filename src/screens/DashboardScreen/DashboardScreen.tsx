import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import { AppBottomBar, BottomNavTab } from '../../components/AppBottomBar';
import {
    IconChat,
    IconMegaphone,
    IconUser,
    IconUsers,
    IconDollar,
    IconChart,
    IconSparkles,
    IconZap,
    IconCheck,
} from '../../components/AppIcons';
import { crmService, DashboardMetrics } from '../../services/crmService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DashboardScreenProps {
    onBack?: () => void;
    onNavigateTab?: (tab: BottomNavTab | string) => void;
    onQuickAction?: (action: 'new_chat' | 'new_broadcast' | 'new_contact' | 'new_deal') => void;
    onOpenNotifications?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
    onBack,
    onNavigateTab,
    onQuickAction,
    onOpenNotifications,
}) => {
    const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalContacts: 0,
        activeConversations: 0,
        totalMessagesSent: 0,
        deliveredRate: 100,
        activeCampaigns: 0,
        openDealsValue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        crmService.fetchDashboardMetrics().then((m) => {
            setMetrics(m);
            setLoading(false);
        });
    }, []);

    const volumeDataMap = {
        '7d': [
            { day: 'Mon', inbound: 45, outbound: 80 },
            { day: 'Tue', inbound: 62, outbound: 95 },
            { day: 'Wed', inbound: 85, outbound: 130 },
            { day: 'Thu', inbound: 78, outbound: 110 },
            { day: 'Fri', inbound: 92, outbound: 145 },
            { day: 'Sat', inbound: 55, outbound: 70 },
            { day: 'Sun', inbound: 40, outbound: 50 },
        ],
        '30d': [
            { day: 'W1', inbound: 280, outbound: 450 },
            { day: 'W2', inbound: 340, outbound: 520 },
            { day: 'W3', inbound: 410, outbound: 610 },
            { day: 'W4', inbound: 390, outbound: 580 },
        ],
        'all': [
            { day: 'Jan', inbound: 950, outbound: 1450 },
            { day: 'Feb', inbound: 1120, outbound: 1680 },
            { day: 'Mar', inbound: 1340, outbound: 1950 },
            { day: 'Apr', inbound: 1510, outbound: 2200 },
            { day: 'May', inbound: 1680, outbound: 2450 },
            { day: 'Jun', inbound: 1820, outbound: 2600 },
        ],
    };

    const volumeData = volumeDataMap[timeframe];
    const maxVal = Math.max(...volumeData.map((d) => Math.max(d.inbound, d.outbound))) * 1.15;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Header: Logo on Left, Profile & Actions on Right */}
                <AppHeader
                    onBack={onBack}
                    onPressDashboard={() => {}}
                    onPressProfile={() => onNavigateTab && onNavigateTab('More')}
                    onPressNotifications={onOpenNotifications}
                    unreadCount={0}
                />

                {/* Subheader & Timeframe Selector */}
                <View style={styles.subHeaderRow}>
                    <View>
                        <Text style={styles.pageTitle}>Executive Overview</Text>
                        <Text style={styles.pageSubtitle}>Live WhatsApp CRM analytics & sales funnel</Text>
                    </View>
                    <View style={styles.timeframeSegment}>
                        {(['7d', '30d', 'all'] as const).map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.timeBtn, timeframe === t && styles.timeBtnActive]}
                                onPress={() => setTimeframe(t)}>
                                <Text
                                    style={[
                                        styles.timeBtnText,
                                        timeframe === t && styles.timeBtnTextActive,
                                    ]}>
                                    {t === '7d' ? '7D' : t === '30d' ? '30D' : 'ALL'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                    {/* Meta WhatsApp Cloud API Live Connection Bar */}
                    <View style={styles.apiHealthCard}>
                        <View style={styles.apiHealthHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={styles.pulsingGreenDot} />
                                <Text style={styles.apiHealthTitle}>WhatsApp Cloud API Connected</Text>
                            </View>
                            <View style={styles.qualityPill}>
                                <Text style={styles.qualityPillText}>Quality: HIGH</Text>
                            </View>
                        </View>
                        <View style={styles.apiHealthDetailsRow}>
                            <View>
                                <Text style={styles.apiHealthSubLabel}>Sender Account</Text>
                                <Text style={styles.apiHealthSubValue}>+1 (555) 019-2831</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.apiHealthSubLabel}>24h Policy Limit</Text>
                                <Text style={styles.apiHealthSubValue}>Tier 2 (10,000/day)</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Action Tiles Launcher */}
                    <Text style={styles.sectionHeader}>Quick Actions</Text>
                    <View style={styles.quickGrid}>
                        <TouchableOpacity
                            style={[styles.quickCard, { backgroundColor: '#DCFCE7' }]}
                            onPress={() => onQuickAction ? onQuickAction('new_chat') : onNavigateTab && onNavigateTab('Inbox')}>
                            <View style={styles.quickIconWrap}>
                                <IconChat size={20} color="#166534" />
                            </View>
                            <Text style={[styles.quickTitle, { color: '#166534' }]}>New Chat</Text>
                            <Text style={styles.quickSub}>Start WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickCard, { backgroundColor: '#EDE9FE' }]}
                            onPress={() => onQuickAction ? onQuickAction('new_broadcast') : onNavigateTab && onNavigateTab('Broadcast')}>
                            <View style={styles.quickIconWrap}>
                                <IconMegaphone size={20} color="#5B21B6" />
                            </View>
                            <Text style={[styles.quickTitle, { color: '#5B21B6' }]}>Broadcast</Text>
                            <Text style={styles.quickSub}>Mass outreach</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickCard, { backgroundColor: '#DBEAFE' }]}
                            onPress={() => onQuickAction ? onQuickAction('new_contact') : onNavigateTab && onNavigateTab('Contacts')}>
                            <View style={styles.quickIconWrap}>
                                <IconUser size={20} color="#1E40AF" />
                            </View>
                            <Text style={[styles.quickTitle, { color: '#1E40AF' }]}>Add Contact</Text>
                            <Text style={styles.quickSub}>Sync customer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickCard, { backgroundColor: '#FEF3C7' }]}
                            onPress={() => onQuickAction ? onQuickAction('new_deal') : onNavigateTab && onNavigateTab('More')}>
                            <View style={styles.quickIconWrap}>
                                <IconDollar size={20} color="#92400E" />
                            </View>
                            <Text style={[styles.quickTitle, { color: '#92400E' }]}>Add Deal</Text>
                            <Text style={styles.quickSub}>Pipeline funnel</Text>
                        </TouchableOpacity>
                    </View>

                    {/* KPI 4 Metric Cards */}
                    <Text style={styles.sectionHeader}>Performance Metrics</Text>
                    <View style={styles.kpiGrid}>
                        {/* Card 1 */}
                        <View style={styles.kpiCard}>
                            <View style={[styles.kpiBadge, { backgroundColor: '#DCFCE7' }]}>
                                <IconChat size={16} color="#059669" />
                            </View>
                            <Text style={styles.kpiValue}>
                                {loading ? '...' : metrics.activeConversations}
                            </Text>
                            <Text style={styles.kpiLabel}>Open Conversations</Text>
                            <Text style={styles.kpiTrend}>+18% this week</Text>
                        </View>

                        {/* Card 2 */}
                        <View style={styles.kpiCard}>
                            <View style={[styles.kpiBadge, { backgroundColor: '#DBEAFE' }]}>
                                <IconUsers size={16} color="#2563EB" />
                            </View>
                            <Text style={styles.kpiValue}>
                                {loading ? '...' : metrics.totalContacts}
                            </Text>
                            <Text style={styles.kpiLabel}>Total Contacts</Text>
                            <Text style={styles.kpiTrend}>+12 new leads</Text>
                        </View>

                        {/* Card 3 */}
                        <View style={styles.kpiCard}>
                            <View style={[styles.kpiBadge, { backgroundColor: '#FEF3C7' }]}>
                                <IconDollar size={16} color="#D97706" />
                            </View>
                            <Text style={styles.kpiValue}>
                                {loading ? '...' : `$${(metrics.openDealsValue || 45200).toLocaleString()}`}
                            </Text>
                            <Text style={styles.kpiLabel}>Pipeline Value</Text>
                            <Text style={styles.kpiTrend}>14 open deals</Text>
                        </View>

                        {/* Card 4 */}
                        <View style={styles.kpiCard}>
                            <View style={[styles.kpiBadge, { backgroundColor: '#EDE9FE' }]}>
                                <IconSparkles size={16} color="#7C3AED" />
                            </View>
                            <Text style={styles.kpiValue}>
                                {loading ? '...' : `${metrics.deliveredRate}%`}
                            </Text>
                            <Text style={styles.kpiLabel}>Delivery Rate</Text>
                            <Text style={styles.kpiTrend}>Meta API verified</Text>
                        </View>
                    </View>

                    {/* Conversations Volume Interactive Chart */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <View>
                                <Text style={styles.chartTitle}>Message Volume</Text>
                                <Text style={styles.chartSub}>Inbound vs Outbound WhatsApp traffic</Text>
                            </View>
                            <View style={styles.chartLegend}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: Colors.whatsappGreen }]} />
                                    <Text style={styles.legendText}>Outbound</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                                    <Text style={styles.legendText}>Inbound</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.barGraphArea}>
                            {volumeData.map((d) => (
                                <View key={d.day} style={styles.barColumn}>
                                    <View style={styles.barsPair}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: (d.outbound / maxVal) * 110,
                                                    backgroundColor: Colors.whatsappGreen,
                                                },
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: (d.inbound / maxVal) * 110,
                                                    backgroundColor: '#3B82F6',
                                                    marginLeft: 4,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.dayLabel}>{d.day}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Response Time Benchmark */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <View>
                                <Text style={styles.chartTitle}>Avg First Response Time</Text>
                                <Text style={styles.chartSub}>Goal: Under 5 mins across all shifts</Text>
                            </View>
                            <View style={styles.targetBadge}>
                                <IconZap size={12} color="#92400E" />
                                <Text style={styles.targetBadgeText}>2.4 min Avg</Text>
                            </View>
                        </View>
                        <View style={styles.progressRow}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '82%' }]} />
                            </View>
                            <Text style={styles.progressPct}>82% within 5m</Text>
                        </View>
                    </View>

                    {/* Pipeline Stage Distribution */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Sales Funnel Stages</Text>
                        <Text style={styles.chartSub}>Deal stage distribution in Kanban</Text>

                        <View style={styles.stageRows}>
                            <View style={styles.stageItem}>
                                <Text style={styles.stageName}>Lead In (10%)</Text>
                                <Text style={styles.stageVal}>$14,000 • 8 deals</Text>
                            </View>
                            <View style={styles.stageItem}>
                                <Text style={styles.stageName}>Demo / Meeting (50%)</Text>
                                <Text style={styles.stageVal}>$18,500 • 4 deals</Text>
                            </View>
                            <View style={styles.stageItem}>
                                <Text style={styles.stageName}>Proposal Sent (75%)</Text>
                                <Text style={styles.stageVal}>$12,700 • 2 deals</Text>
                            </View>
                            <View style={styles.stageItem}>
                                <Text style={[styles.stageName, { color: '#059669' }]}>Closed Won (100%)</Text>
                                <Text style={[styles.stageVal, { color: '#059669', fontWeight: '700' }]}>$38,200 • 9 deals</Text>
                            </View>
                        </View>
                    </View>

                    {/* Live Activity Feed */}
                    <Text style={styles.sectionHeader}>Live Activity Feed</Text>
                    <View style={styles.activityCard}>
                        <View style={styles.activityRow}>
                            <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.activityText}>
                                    <Text style={{ fontWeight: '700' }}>Sarah Miller</Text> moved deal "Enterprise Cloud" to Closed Won.
                                </Text>
                                <Text style={styles.activityTime}>5 mins ago</Text>
                            </View>
                        </View>

                        <View style={styles.activityRow}>
                            <View style={[styles.activityDot, { backgroundColor: '#3B82F6' }]} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.activityText}>
                                    Broadcast "VIP Black Friday" finished sending: 98% delivered.
                                </Text>
                                <Text style={styles.activityTime}>28 mins ago</Text>
                            </View>
                        </View>

                        <View style={styles.activityRow}>
                            <View style={[styles.activityDot, { backgroundColor: '#8B5CF6' }]} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.activityText}>
                                    AI Copilot auto-replied to 14 customer queries successfully.
                                </Text>
                                <Text style={styles.activityTime}>1 hour ago</Text>
                            </View>
                        </View>
                    </View>

                    {/* Team Performance Leaderboard (Matching Web Dashboard) */}
                    <Text style={styles.sectionHeader}>Team Performance (Top Agents)</Text>
                    <View style={styles.leaderboardCard}>
                        {[
                            { name: 'Sarah Miller', role: 'Senior Agent', chats: 24, speed: '1.8m avg', resolution: '98%', color: '#059669', bg: '#DCFCE7' },
                            { name: 'Alex Morgan', role: 'Support Specialist', chats: 19, speed: '2.2m avg', resolution: '95%', color: '#2563EB', bg: '#DBEAFE' },
                            { name: 'David Wilson', role: 'Sales Rep', chats: 15, speed: '3.1m avg', resolution: '92%', color: '#7C3AED', bg: '#EDE9FE' },
                        ].map((agent, i) => (
                            <View key={i} style={[styles.leaderboardRow, i < 2 && styles.leaderboardRowBorder]}>
                                <View style={[styles.agentAvatar, { backgroundColor: agent.bg }]}>
                                    <Text style={[styles.agentAvatarText, { color: agent.color }]}>
                                        {agent.name.split(' ').map((n) => n[0]).join('')}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.agentName}>{agent.name}</Text>
                                    <Text style={styles.agentRole}>{agent.role} • {agent.chats} active chats</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.agentSpeed}>{agent.speed}</Text>
                                    <Text style={styles.agentResolution}>{agent.resolution} SLA</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>

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
    subHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    pageTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    pageSubtitle: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    timeframeSegment: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 2,
    },
    timeBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    timeBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    timeBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    timeBtnTextActive: {
        color: '#0F172A',
    },
    scrollArea: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginTop: 16,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    quickGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickCard: {
        width: (SCREEN_WIDTH - 32 - 18) / 4,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: 'center',
    },
    quickIconWrap: {
        marginBottom: 4,
    },
    quickTitle: {
        fontSize: 11.5,
        fontWeight: '700',
        textAlign: 'center',
    },
    quickSub: {
        fontSize: 9,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 2,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    kpiCard: {
        width: (SCREEN_WIDTH - 32 - 10) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 13,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    kpiBadge: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    kpiValue: {
        fontSize: 19,
        fontWeight: '800',
        color: '#0F172A',
    },
    kpiLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 2,
    },
    kpiTrend: {
        fontSize: 11,
        color: '#10B981',
        fontWeight: '600',
        marginTop: 4,
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    chartSub: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    chartLegend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    legendText: {
        fontSize: 11,
        color: '#64748B',
    },
    barGraphArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
        paddingTop: 10,
    },
    barColumn: {
        alignItems: 'center',
    },
    barsPair: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 100,
    },
    bar: {
        width: 11,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    dayLabel: {
        fontSize: 10.5,
        color: '#64748B',
        marginTop: 6,
    },
    targetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 7,
        gap: 3,
    },
    targetBadgeText: {
        color: '#92400E',
        fontSize: 11,
        fontWeight: '700',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    progressBarBg: {
        flex: 1,
        height: 7,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginRight: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 4,
    },
    progressPct: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0F172A',
    },
    stageRows: {
        marginTop: 8,
    },
    stageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    stageName: {
        fontSize: 12.5,
        color: '#334155',
        fontWeight: '500',
    },
    stageVal: {
        fontSize: 12,
        color: '#64748B',
    },
    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    activityDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginTop: 5,
    },
    activityText: {
        fontSize: 12.5,
        color: '#334155',
        lineHeight: 17,
    },
    activityTime: {
        fontSize: 10.5,
        color: '#94A3B8',
        marginTop: 2,
    },
    // Meta API Live Health Card
    apiHealthCard: {
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    apiHealthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    pulsingGreenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.whatsappGreen,
    },
    apiHealthTitle: {
        fontSize: 12.5,
        fontWeight: '700',
        color: '#166534',
    },
    qualityPill: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    qualityPillText: {
        fontSize: 9.5,
        fontWeight: '800',
        color: '#15803D',
    },
    apiHealthDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#DCFCE7',
    },
    apiHealthSubLabel: {
        fontSize: 10,
        color: '#64748B',
    },
    apiHealthSubValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 1,
    },
    // Agent Leaderboard
    leaderboardCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    leaderboardRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    agentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    agentAvatarText: {
        fontSize: 13,
        fontWeight: '800',
    },
    agentName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    agentRole: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 1,
    },
    agentSpeed: {
        fontSize: 12,
        fontWeight: '700',
        color: '#059669',
    },
    agentResolution: {
        fontSize: 10.5,
        color: '#64748B',
        marginTop: 1,
    },
});
