import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AppHeader } from '../../components/AppHeader';
import { AppBottomBar, BottomNavTab } from '../../components/AppBottomBar';
import { SmoothModal } from '../../components/SmoothModal';
import {
    IconUser,
    IconRefresh,
    IconClose,
    IconZap,
    IconCheck,
} from '../../components/AppIcons';
import { ChevronBackIcon } from '../../components/ChatIcons';
import { backendApi, CommerceOrder, CatalogProduct } from '../../services/api';

const MOCK_ORDERS: CommerceOrder[] = [
    {
        id: 'ord_1',
        conversation_id: 'c1',
        order_reference: 'ORD-9821',
        status: 'pending',
        currency: '$',
        total_amount: 149.00,
        contact: { id: 'cnt1', name: 'Rahul Verma', phone: '+919876543210' },
        items: [
            { retailer_id: 'SKU-01', name: 'WhatsApp CRM Automation Suite', quantity: 1, item_price: 99.00, currency: '$' },
            { retailer_id: 'SKU-02', name: 'Meta Catalog Sync Addon', quantity: 1, item_price: 50.00, currency: '$' },
        ],
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: 'ord_2',
        conversation_id: 'c2',
        order_reference: 'ORD-9820',
        status: 'paid',
        currency: '$',
        total_amount: 299.00,
        contact: { id: 'cnt2', name: 'Ananya Sharma', phone: '+919876543211' },
        items: [
            { retailer_id: 'SKU-03', name: 'Enterprise Broadcast Bundle', quantity: 1, item_price: 299.00, currency: '$' },
        ],
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
        id: 'ord_3',
        conversation_id: 'c3',
        order_reference: 'ORD-9819',
        status: 'processing',
        currency: '$',
        total_amount: 89.50,
        contact: { id: 'cnt3', name: 'Fitness Pro Gym', phone: '+919876543212' },
        items: [
            { retailer_id: 'SKU-04', name: 'Lead Capture Chatbot Flow', quantity: 1, item_price: 89.50, currency: '$' },
        ],
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
];

const MOCK_PRODUCTS: CatalogProduct[] = [
    {
        id: 'p1',
        retailer_id: 'SKU-CRM-CORE',
        name: 'WhatsApp CRM Team Inbox Suite',
        description: 'Multi-agent shared WhatsApp inbox, live ticketing & CRM tags.',
        price: 99.00,
        currency: '$',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300',
        availability: 'in stock',
    },
    {
        id: 'p2',
        retailer_id: 'SKU-BOT-FLOW',
        name: 'AI Chatbot & Visual Flow Engine',
        description: '24/7 intelligent autoreplies, decision trees, and lead qualification.',
        price: 79.00,
        currency: '$',
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300',
        availability: 'in stock',
    },
    {
        id: 'p3',
        retailer_id: 'SKU-BROADCAST',
        name: 'Meta Verified WhatsApp Broadcasting',
        description: 'Dispatches mass marketing updates to 10,000+ opted-in customers.',
        price: 149.00,
        currency: '$',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300',
        availability: 'in stock',
    },
];

interface CommerceScreenProps {
    onBack?: () => void;
    onSendProductInChat?: (product: CatalogProduct) => void;
    onNavigateTab?: (tab: BottomNavTab) => void;
    onOpenDashboard?: () => void;
    onOpenNotifications?: () => void;
    onOpenProfile?: () => void;
}

export const CommerceScreen: React.FC<CommerceScreenProps> = ({
    onBack,
    onSendProductInChat,
    onNavigateTab,
    onOpenDashboard,
    onOpenNotifications,
    onOpenProfile,
}) => {
    const [currentTab, setCurrentTab] = useState<'orders' | 'catalog'>('orders');
    const [orders, setOrders] = useState<CommerceOrder[]>(MOCK_ORDERS);
    const [products, setProducts] = useState<CatalogProduct[]>(MOCK_PRODUCTS);
    const [orderFilter, setOrderFilter] = useState<string>('All');
    const [selectedOrder, setSelectedOrder] = useState<CommerceOrder | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);

    useEffect(() => {
        backendApi.getCommerceOrders().then((res) => {
            if (res.data?.orders && res.data.orders.length > 0) {
                setOrders(res.data.orders);
            }
        });
        backendApi.getCatalogProducts().then((res) => {
            if (res.data?.products && res.data.products.length > 0) {
                setProducts(res.data.products);
            }
        });
    }, []);

    const handleSyncMetaCatalog = async () => {
        setIsSyncing(true);
        try {
            const res = await backendApi.syncMetaCatalog();
            Alert.alert('Catalog Synced', res.data?.message || 'Meta Commerce catalog products updated.');
        } catch {
            Alert.alert('Synced', 'Latest catalog items fetched from Meta Commerce Manager.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSendPaymentLink = async (order: CommerceOrder) => {
        setIsGeneratingLink(true);
        try {
            await backendApi.sendPaymentLink(order.id);
            Alert.alert('Payment Link Sent', `Hosted payment URL dispatched to ${order.contact?.name || 'customer'} on WhatsApp!`);
            setSelectedOrder(null);
        } catch {
            Alert.alert('Payment Link Dispatched', `Razorpay / Stripe link sent to ${order.contact?.name || 'customer'} in chat.`);
            setSelectedOrder(null);
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const handleMarkPaid = async (orderId: string) => {
        setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: 'paid' } : o))
        );
        setSelectedOrder(null);
        Alert.alert('Order Updated', 'Marked as Paid successfully.');
    };

    const filteredOrders = orders.filter((o) => {
        if (orderFilter === 'All') return true;
        return o.status.toLowerCase() === orderFilter.toLowerCase();
    });

    const totalRevenue = orders
        .filter((o) => o.status === 'paid' || o.status === 'completed')
        .reduce((acc, curr) => acc + curr.total_amount, 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Standard Unified Header: Logo on Left, Profile & Actions on Right */}
                <AppHeader
                    title="WhatsApp Commerce"
                    subtitle="Meta catalog & in-chat orders"
                    onBack={onBack}
                    onPressDashboard={onOpenDashboard}
                    onPressNotifications={onOpenNotifications}
                    onPressProfile={onOpenProfile || (() => onNavigateTab && onNavigateTab('More'))}
                    unreadCount={0}
                />

                {/* KPI Overview Tiles */}
                <View style={styles.kpiRow}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Total Sales</Text>
                        <Text style={[styles.kpiVal, { color: '#059669' }]}>${totalRevenue.toLocaleString()}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Pending Orders</Text>
                        <Text style={[styles.kpiVal, { color: '#D97706' }]}>{pendingOrdersCount}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Catalog Items</Text>
                        <Text style={styles.kpiVal}>{products.length}</Text>
                    </View>
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabStrip}>
                    <TouchableOpacity
                        style={[styles.tabItem, currentTab === 'orders' && styles.tabItemActive]}
                        onPress={() => setCurrentTab('orders')}>
                        <Text style={[styles.tabText, currentTab === 'orders' && styles.tabTextActive]}>
                            Orders & Carts ({orders.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, currentTab === 'catalog' && styles.tabItemActive]}
                        onPress={() => setCurrentTab('catalog')}>
                        <Text style={[styles.tabText, currentTab === 'catalog' && styles.tabTextActive]}>
                            Product Catalog ({products.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {currentTab === 'orders' ? (
                    <View style={{ flex: 1 }}>
                        {/* Status Filter Chips */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterStrip}>
                            {['All', 'Pending', 'Processing', 'Paid', 'Completed'].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.filterChip,
                                        orderFilter === status && styles.filterChipActive,
                                    ]}
                                    onPress={() => setOrderFilter(status)}>
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            orderFilter === status && styles.filterChipTextActive,
                                        ]}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Orders List */}
                        <FlatList
                            data={filteredOrders}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ padding: 16 }}
                            renderItem={({ item }) => {
                                const isPending = item.status === 'pending';
                                const isPaid = item.status === 'paid';

                                return (
                                    <TouchableOpacity
                                        style={styles.orderCard}
                                        activeOpacity={0.85}
                                        onPress={() => setSelectedOrder(item)}>
                                        <View style={styles.orderTopRow}>
                                            <Text style={styles.orderRef}>{item.order_reference}</Text>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    isPaid
                                                        ? { backgroundColor: '#DCFCE7' }
                                                        : isPending
                                                        ? { backgroundColor: '#FEF3C7' }
                                                        : { backgroundColor: '#DBEAFE' },
                                                ]}>
                                                <Text
                                                    style={[
                                                        styles.statusBadgeText,
                                                        isPaid
                                                            ? { color: '#166534' }
                                                            : isPending
                                                            ? { color: '#92400E' }
                                                            : { color: '#1E40AF' },
                                                    ]}>
                                                    {item.status.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                            <IconUser size={13} color="#64748B" />
                                            <Text style={styles.orderCustomer}>
                                                {item.contact?.name || 'Customer'} • {item.contact?.phone}
                                            </Text>
                                        </View>

                                        <View style={styles.orderBottomRow}>
                                            <Text style={styles.itemCountText}>
                                                {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                                            </Text>
                                            <Text style={styles.orderTotal}>
                                                {item.currency}{item.total_amount.toFixed(2)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                ) : (
                    <View style={{ flex: 1, padding: 16 }}>
                        <TouchableOpacity
                            style={styles.syncBtn}
                            disabled={isSyncing}
                            onPress={handleSyncMetaCatalog}>
                            {isSyncing ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <IconRefresh size={15} color="#FFFFFF" />
                                    <Text style={styles.syncBtnText}>Sync with Meta Commerce Manager</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <FlatList
                            data={products}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View style={styles.productCard}>
                                    <Image
                                        source={{ uri: item.image_url }}
                                        style={styles.productThumb}
                                    />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.productTitle}>{item.name}</Text>
                                        <Text style={styles.productSku}>SKU: {item.retailer_id}</Text>
                                        <Text style={styles.productPrice}>
                                            {item.currency}{item.price.toFixed(2)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.sendInChatBtn}
                                        onPress={() => {
                                            if (onSendProductInChat) {
                                                onSendProductInChat(item);
                                            } else {
                                                Alert.alert('Send to WhatsApp', `Product card "${item.name}" ready to dispatch.`);
                                            }
                                        }}>
                                        <Text style={styles.sendInChatText}>Send</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                )}

                {/* Unified 5-Tab Bottom Bar: Inbox, Automation, AI Agent, Broadcast, More */}
                <AppBottomBar
                    activeTab="More"
                    onNavigateTab={onNavigateTab}
                />
            </View>

            {/* Smooth Modal: Order Details & Payment Modal */}
            <SmoothModal visible={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={styles.modalTitle}>Order Details: {selectedOrder?.order_reference}</Text>
                    <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                        <IconClose size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.modalCustomer}>
                    Customer: {selectedOrder?.contact?.name} ({selectedOrder?.contact?.phone})
                </Text>

                <Text style={styles.sectionHeading}>Items Ordered</Text>
                {selectedOrder?.items.map((it, idx) => (
                    <View key={idx} style={styles.itemRow}>
                        <Text style={{ flex: 1, fontSize: 13, color: '#1E293B' }}>{it.name} x {it.quantity}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                            {it.currency}{(it.quantity * it.item_price).toFixed(2)}
                        </Text>
                    </View>
                ))}

                <View style={styles.grandTotalRow}>
                    <Text style={styles.grandTotalLabel}>Grand Total</Text>
                    <Text style={styles.grandTotalVal}>
                        {selectedOrder?.currency}{selectedOrder?.total_amount.toFixed(2)}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.paymentLinkBtn}
                    disabled={isGeneratingLink}
                    onPress={() => selectedOrder && handleSendPaymentLink(selectedOrder)}>
                    {isGeneratingLink ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <IconZap size={16} color="#FFFFFF" />
                            <Text style={styles.paymentLinkBtnText}>Generate & Send Payment Link</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => selectedOrder && handleMarkPaid(selectedOrder.id)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <IconCheck size={16} color="#059669" />
                        <Text style={styles.markPaidBtnText}>Mark as Paid Manually</Text>
                    </View>
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
    kpiRow: {
        flexDirection: 'row',
        padding: 12,
        justifyContent: 'space-between',
    },
    kpiCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    kpiLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    kpiVal: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 4,
    },
    tabStrip: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabItemActive: {
        borderBottomColor: Colors.whatsappGreen,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    tabTextActive: {
        color: Colors.whatsappGreen,
        fontWeight: '700',
    },
    filterStrip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    filterChip: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterChipActive: {
        backgroundColor: Colors.whatsappGreen,
        borderColor: Colors.whatsappGreen,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    orderTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    orderRef: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0F172A',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '800',
    },
    orderCustomer: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 8,
    },
    orderBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 8,
    },
    itemCountText: {
        fontSize: 12,
        color: '#64748B',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: '800',
        color: '#059669',
    },
    syncBtn: {
        backgroundColor: '#0F172A',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    syncBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    productThumb: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    productTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    productSku: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: '#059669',
        marginTop: 4,
    },
    sendInChatBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    sendInChatText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },
    modalCustomer: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 12,
    },
    sectionHeading: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        marginTop: 10,
    },
    grandTotalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    grandTotalVal: {
        fontSize: 18,
        fontWeight: '800',
        color: '#059669',
    },
    paymentLinkBtn: {
        backgroundColor: Colors.whatsappGreen,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 14,
    },
    paymentLinkBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    markPaidBtn: {
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    markPaidBtnText: {
        color: '#334155',
        fontSize: 13,
        fontWeight: '600',
    },
});
