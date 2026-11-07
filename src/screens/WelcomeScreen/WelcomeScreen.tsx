import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    ActivityIndicator,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { BrandLogo } from '../../components/BrandLogo';
import {
    LightningIcon,
    ChartBarIcon,
    PeopleIcon,
    ClockIcon,
    ArrowRightIcon,
    CartMini,
    CalendarMini,
    HeadsetMini,
    CouponMini,
    BoxMini,
    ChatMini,
    ChartMini,
    TeamMini,
    SlidersMini,
    DoubleCheckMini,
} from '../../components/WelcomeIcons';
import { authService } from '../../services/supabase';
import { verifyCurrentUserAccess } from '../../services/accessGuardService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BadgeIconType = 'lightning' | 'chart' | 'people' | 'clock';
type QuickReplyIconKey = 'cart' | 'calendar' | 'headset' | 'coupon' | 'box' | 'chat' | 'chart' | 'team' | 'sliders';

interface SlideItem {
    id: string;
    titlePart1: string;
    titleHighlight: string;
    description: string;
    phoneChat: {
        botGreeting: string;
        quickReplies: { icon: QuickReplyIconKey; text: string }[];
        userChoice: string;
        botFollowup: string;
    };
    badges: {
        topLeft: { label: string; icon: BadgeIconType };
        bottomLeft: { label: string; icon: BadgeIconType };
        topRight: { label: string; icon: BadgeIconType };
        bottomRight: { label: string; icon: BadgeIconType };
    };
}

const SLIDES_DATA: SlideItem[] = [
    {
        id: 'slide_1',
        titlePart1: 'Grow Your Business',
        titleHighlight: 'with WhatsApp',
        description:
            'Automate conversations, engage customers and boost your sales with powerful WhatsApp automation.',
        phoneChat: {
            botGreeting: 'Hi there!\nWelcome to our business.\nHow can we help you today?',
            quickReplies: [
                { icon: 'cart', text: 'View Products' },
                { icon: 'calendar', text: 'Book a Demo' },
                { icon: 'headset', text: 'Talk to Support' },
            ],
            userChoice: 'Book a Demo',
            botFollowup: 'Great! Please share your name and mobile number to schedule a demo.',
        },
        badges: {
            topLeft: { label: 'Automate\nChats', icon: 'lightning' },
            bottomLeft: { label: 'Engage\nCustomers', icon: 'people' },
            topRight: { label: 'Boost\nSales', icon: 'chart' },
            bottomRight: { label: 'Save\nTime', icon: 'clock' },
        },
    },
    {
        id: 'slide_2',
        titlePart1: 'Broadcast Messages',
        titleHighlight: 'Without Getting Blocked',
        description:
            'Send verified notifications, promotions, and updates to thousands of opted-in customers with high delivery rates.',
        phoneChat: {
            botGreeting: 'Flash Sale Alert!\nGet 30% OFF on all packages. Valid today only!',
            quickReplies: [
                { icon: 'coupon', text: 'Apply Coupon' },
                { icon: 'box', text: 'View Catalog' },
                { icon: 'chat', text: 'Live Agent' },
            ],
            userChoice: 'Apply Coupon',
            botFollowup: 'Coupon WNEXT30 applied! Your checkout link is ready.',
        },
        badges: {
            topLeft: { label: 'Verified\nSender', icon: 'lightning' },
            bottomLeft: { label: 'High\nDelivery', icon: 'people' },
            topRight: { label: 'Boost\nSales', icon: 'chart' },
            bottomRight: { label: 'Save\nTime', icon: 'clock' },
        },
    },
    {
        id: 'slide_3',
        titlePart1: 'Real-Time Insights',
        titleHighlight: '& Shared Team Inbox',
        description:
            'Empower your team with a multi-agent dashboard, quick replies, and instant analytics on customer interactions.',
        phoneChat: {
            botGreeting: 'Weekly CRM Report:\n850 conversations resolved\n94% positive response rate',
            quickReplies: [
                { icon: 'chart', text: 'Open Dashboard' },
                { icon: 'team', text: 'Assign Agent' },
                { icon: 'sliders', text: 'Manage Tags' },
            ],
            userChoice: 'Open Dashboard',
            botFollowup: 'Redirecting to your Analytics portal...',
        },
        badges: {
            topLeft: { label: 'Shared\nInbox', icon: 'people' },
            bottomLeft: { label: 'Auto\nAssign', icon: 'lightning' },
            topRight: { label: 'Track\nROI', icon: 'chart' },
            bottomRight: { label: 'Quick\nReply', icon: 'clock' },
        },
    },
];

interface WelcomeScreenProps {
    onNavigateLogin: () => void;
    onNavigateOnboarding: (params: {
        email?: string;
        reason?: string;
        expiryDate?: string | null;
        status?: string;
    }) => void;
    onAccessGranted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    onNavigateLogin,
    onNavigateOnboarding,
    onAccessGranted,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<any>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stopAutoSlide = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const startAutoSlide = useCallback(() => {
        stopAutoSlide();
        timerRef.current = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % SLIDES_DATA.length;
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setCurrentIndex(nextIndex);
        }, 4000);
    }, [currentIndex, stopAutoSlide]);

    useEffect(() => {
        startAutoSlide();
        return () => stopAutoSlide();
    }, [startAutoSlide, stopAutoSlide]);

    const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    /**
     * Requirement: Only "Get Started" button.
     * On click: If logged in and all checks cleared, move to CRM inbox.
     * Otherwise if logged in but restricted/expired, move to Onboarding screen.
     * Otherwise if not logged in, move to Login screen.
     */
    const handleGetStarted = async () => {
        if (isVerifying) return;
        setIsVerifying(true);
        try {
            const session = await authService.getSession();
            if (session?.user) {
                const access = await verifyCurrentUserAccess(session.user.email);
                if (access.isAllowed) {
                    onAccessGranted();
                } else {
                    onNavigateOnboarding({
                        email: session.user.email || '',
                        reason: access.reason || 'inactive',
                        expiryDate: access.expiryDate,
                        status: access.status,
                    });
                }
            } else {
                onNavigateLogin();
            }
        } catch {
            onNavigateLogin();
        } finally {
            setIsVerifying(false);
        }
    };

    const renderBadgeIcon = (icon: BadgeIconType) => {
        switch (icon) {
            case 'lightning':
                return <LightningIcon size={16} />;
            case 'chart':
                return <ChartBarIcon size={16} />;
            case 'people':
                return <PeopleIcon size={16} />;
            case 'clock':
                return <ClockIcon size={16} />;
        }
    };

    const renderQuickReplyIcon = (icon: QuickReplyIconKey) => {
        switch (icon) {
            case 'cart':
                return <CartMini size={9} color="#059669" />;
            case 'calendar':
                return <CalendarMini size={9} color="#059669" />;
            case 'headset':
                return <HeadsetMini size={9} color="#059669" />;
            case 'coupon':
                return <CouponMini size={9} color="#059669" />;
            case 'box':
                return <BoxMini size={9} color="#059669" />;
            case 'chat':
                return <ChatMini size={9} color="#059669" />;
            case 'chart':
                return <ChartMini size={9} color="#059669" />;
            case 'team':
                return <TeamMini size={9} color="#059669" />;
            case 'sliders':
                return <SlidersMini size={9} color="#059669" />;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Top Header Bar */}
            <View style={styles.topBar}>
                <View style={styles.brandHeader}>
                    <BrandLogo width={140} height={36} resizeMode="contain" />
                    <Text style={styles.brandSub}>Automate. Engage. Grow.</Text>
                </View>
            </View>

            {/* Auto-sliding Carousel */}
            <View style={{ flex: 1 }}>
                <Animated.FlatList
                    ref={flatListRef}
                    data={SLIDES_DATA}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    decelerationRate="fast"
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    onTouchStart={stopAutoSlide}
                    onTouchEnd={startAutoSlide}
                    renderItem={({ item, index }) => {
                        const inputRange = [
                            (index - 1) * SCREEN_WIDTH,
                            index * SCREEN_WIDTH,
                            (index + 1) * SCREEN_WIDTH,
                        ];

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.35, 1, 0.35],
                            extrapolate: 'clamp',
                        });

                        const scale = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.94, 1, 0.94],
                            extrapolate: 'clamp',
                        });

                        return (
                            <View style={styles.slideItem}>
                                <Animated.View style={{ width: '100%', opacity, transform: [{ scale }] }}>
                                    {/* Hero Title Section */}
                                    <View style={styles.heroTextContainer}>
                                        <Text style={styles.heroHeading}>
                                            {item.titlePart1}{'\n'}
                                            <Text style={styles.heroGreen}>{item.titleHighlight}</Text>
                                        </Text>
                                        <Text style={styles.heroSubheading}>{item.description}</Text>
                                    </View>

                                    {/* Central Mockup & Badges */}
                                    <View style={styles.showcaseContainer}>
                                        {/* Top Left Badge */}
                                        <View style={[styles.floatingBadge, styles.badgeTopLeft]}>
                                            <View style={styles.badgeIconWrap}>
                                                {renderBadgeIcon(item.badges.topLeft.icon)}
                                            </View>
                                            <Text style={styles.badgeLabel}>{item.badges.topLeft.label}</Text>
                                        </View>

                                        {/* Bottom Left Badge */}
                                        <View style={[styles.floatingBadge, styles.badgeBottomLeft]}>
                                            <View style={styles.badgeIconWrap}>
                                                {renderBadgeIcon(item.badges.bottomLeft.icon)}
                                            </View>
                                            <Text style={styles.badgeLabel}>{item.badges.bottomLeft.label}</Text>
                                        </View>

                                        {/* Central Phone Mockup */}
                                        <View style={styles.phoneFrame}>
                                            <View style={styles.phoneIsland} />
                                            <View style={styles.chatStack}>
                                                <View style={styles.incomingBubble}>
                                                    <Text style={styles.chatMsgText}>{item.phoneChat.botGreeting}</Text>
                                                    <Text style={styles.chatTime}>10:30 AM</Text>
                                                </View>

                                                {item.phoneChat.quickReplies.map((reply, idx) => (
                                                    <View key={idx} style={styles.menuOption}>
                                                        <View style={{ width: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                            {renderQuickReplyIcon(reply.icon)}
                                                        </View>
                                                        <Text style={styles.menuOptionText}>{reply.text}</Text>
                                                    </View>
                                                ))}

                                                <View style={styles.outgoingBubble}>
                                                    <Text style={styles.outgoingText}>{item.phoneChat.userChoice}</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 }}>
                                                        <Text style={styles.outgoingChatTime}>10:31 AM </Text>
                                                        <DoubleCheckMini size={9} color="#059669" />
                                                    </View>
                                                </View>

                                                <View style={styles.incomingBubble}>
                                                    <Text style={styles.chatMsgText}>{item.phoneChat.botFollowup}</Text>
                                                    <Text style={styles.chatTime}>10:31 AM</Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Top Right Badge */}
                                        <View style={[styles.floatingBadge, styles.badgeTopRight]}>
                                            <View style={styles.badgeIconWrap}>
                                                {renderBadgeIcon(item.badges.topRight.icon)}
                                            </View>
                                            <Text style={styles.badgeLabel}>{item.badges.topRight.label}</Text>
                                        </View>

                                        {/* Bottom Right Badge */}
                                        <View style={[styles.floatingBadge, styles.badgeBottomRight]}>
                                            <View style={styles.badgeIconWrap}>
                                                {renderBadgeIcon(item.badges.bottomRight.icon)}
                                            </View>
                                            <Text style={styles.badgeLabel}>{item.badges.bottomRight.label}</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            </View>
                        );
                    }}
                />
            </View>

            {/* Fluid Dots Indicator */}
            <View style={styles.dotsContainer}>
                {SLIDES_DATA.map((_, i) => {
                    const inputRange = [
                        (i - 1) * SCREEN_WIDTH,
                        i * SCREEN_WIDTH,
                        (i + 1) * SCREEN_WIDTH,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 20, 8],
                        extrapolate: 'clamp',
                    });

                    const backgroundColor = scrollX.interpolate({
                        inputRange,
                        outputRange: ['#D1D5DB', Colors.primaryGreen, '#D1D5DB'],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={i}
                            style={[
                                styles.smoothDot,
                                {
                                    width: dotWidth,
                                    backgroundColor,
                                },
                            ]}
                        />
                    );
                })}
            </View>

            {/* Bottom Action: ONLY "Get Started" Button */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    activeOpacity={0.85}
                    disabled={isVerifying}
                    onPress={handleGetStarted}>
                    {isVerifying ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Text style={styles.primaryBtnText}>Get Started</Text>
                            <ArrowRightIcon size={18} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
