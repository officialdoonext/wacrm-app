import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// Back Chevron
export const ChevronBackIcon = ({ size = 24, color = '#1E293B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M15 18l-6-6 6-6" />
    </Svg>
);

// Phone Call Icon
export const CallIcon = ({ size = 20, color = '#1E293B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
);

// Video Camera Icon
export const VideoIcon = ({ size = 22, color = '#1E293B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="2" y="5" width="14" height="14" rx="2" />
        <Path d="M22 7l-6 4 6 4V7z" />
    </Svg>
);

// 3 Vertical Dots (Menu)
export const MoreDotsIcon = ({ size = 20, color = '#1E293B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Circle cx="12" cy="5" r="2" />
        <Circle cx="12" cy="12" r="2" />
        <Circle cx="12" cy="19" r="2" />
    </Svg>
);

// Paperclip / Attachment
export const PaperclipIcon = ({ size = 20, color = '#64748B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </Svg>
);

// Camera Icon
export const CameraIcon = ({ size = 20, color = '#64748B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <Circle cx="12" cy="13" r="4" />
    </Svg>
);

// Mic Icon
export const MicIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <Path d="M12 19v4M8 23h8" />
    </Svg>
);

// Download Arrow
export const DownloadArrowIcon = ({ size = 18, color = '#00B359' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 3v13m0 0l-4-4m4 4l4-4M4 20h16" />
    </Svg>
);

// Wave Hand (Bot Greeting)
export const WaveHandIcon = ({ size = 16 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B">
        <Path d="M19.5 7.05a1.5 1.5 0 0 0-1.5 1.5V11H17V5.55a1.5 1.5 0 0 0-3 0V11h-1V4.55a1.5 1.5 0 0 0-3 0V11h-1V6.55a1.5 1.5 0 0 0-3 0v7.62c0 4.32 3.51 7.83 7.83 7.83h2.34c3.41 0 6.27-2.6 6.55-5.99l.34-4.46a1.5 1.5 0 0 0-1.52-1.5z" />
    </Svg>
);

// Shopping Cart (View Products)
export const ShoppingCartIcon = ({ size = 16, color = '#008744' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="9" cy="21" r="1" />
        <Circle cx="20" cy="21" r="1" />
        <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </Svg>
);

// Calendar (Book a Demo)
export const CalendarCheckIcon = ({ size = 16, color = '#008744' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="18" rx="2" />
        <Path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
    </Svg>
);

// Headset (Talk to Support)
export const HeadsetIcon = ({ size = 16, color = '#008744' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </Svg>
);

// Crown (Business Plan)
export const CrownPlanIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </Svg>
);

// Document PDF Icon
export const PdfFileIcon = ({ size = 20, color = '#15803D' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </Svg>
);

// Delivery Status Checkmark Ticks (replaces emoji/unicode checkmarks)
export const ClockTickIcon = ({ size = 11, color = '#94A3B8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="9" />
        <Path d="M12 7v5l3 2" />
    </Svg>
);

export const SingleCheckTickIcon = ({ size = 12, color = '#94A3B8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
    </Svg>
);

export const DoubleCheckTickIcon = ({ size = 14, color = '#38BDF8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6L7 17l-5-5" />
        <Path d="M22 10l-7.5 7.5L13 16" />
    </Svg>
);

// Sparkles / AI Draft Icon
export const SparklesIcon = ({ size = 16, color = '#F59E0B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2l2.4 7.2L21 12l-6.6 2.8L12 22l-2.4-7.2L3 12l6.6-2.8z" />
    </Svg>
);

// Clipboard / Quick Replies Icon
export const ClipboardIcon = ({ size = 16, color = '#059669' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </Svg>
);

// Shopping Bag / Meta Catalog Icon
export const ShoppingBagIcon = ({ size = 16, color = '#7C3AED' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <Line x1="3" y1="6" x2="21" y2="6" />
        <Path d="M16 10a4 4 0 0 1-8 0" />
    </Svg>
);

// Zap / Session Active Icon
export const ZapIcon = ({ size = 14, color = '#D97706' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
);

// Crown Badge Icon
export const CrownBadgeIcon = ({ size = 12, color = '#F59E0B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </Svg>
);

// Bar Chart Icon
export const BarChartVectorIcon = ({ size = 16, color = '#059669' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="18" y1="20" x2="18" y2="10" />
        <Line x1="12" y1="20" x2="12" y2="4" />
        <Line x1="6" y1="20" x2="6" y2="14" />
    </Svg>
);

// Calendar Vector Icon
export const CalendarVectorIcon = ({ size = 16, color = '#059669' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="18" rx="2" />
        <Path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
);

// Users Vector Icon
export const UsersVectorIcon = ({ size = 18, color = '#059669' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <Circle cx="9" cy="7" r="4" />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
);

// Credit Card Vector Icon
export const CreditCardVectorIcon = ({ size = 18, color = '#D97706' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <Line x1="1" y1="10" x2="23" y2="10" />
    </Svg>
);

// Link Chain Icon
export const LinkChainIcon = ({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
);

// Message Square Icon
export const MessageSquareVectorIcon = ({ size = 32, color = '#059669' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
);