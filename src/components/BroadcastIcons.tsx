import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

// Megaphone icon for Bottom Bar & Cards
export const MegaphoneIcon = ({ size = 22, color = '#10B981' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 11l15-5v12L3 13v-2z" />
        <Path d="M11.6 16.8L14 21l3-1.8-2.4-4.2" />
        <Path d="M18 8a4 4 0 0 1 0 8" />
    </Svg>
);

// Paper plane icon for metric card
export const MetricPlaneIcon = ({ size = 16, color = '#10B981' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </Svg>
);

// Green Check Circle
export const MetricCheckCircleIcon = ({ size = 16, color = '#10B981' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </Svg>
);

// Blue Reply Arrow
export const MetricReplyIcon = ({ size = 16, color = '#3B82F6' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
    </Svg>
);

// Purple Campaign Users Icon
export const MetricUsersIcon = ({ size = 16, color = '#8B5CF6' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </Svg>
);

// Special Offer Tag Badge
export const SpecialOfferIcon = ({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <Line x1="7" y1="7" x2="7.01" y2="7" />
    </Svg>
);

// Discount Percent Tag
export const DiscountTagIcon = ({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9A2 2 0 0 0 13 21a2 2 0 0 0 1.41-.59l7-7a2 2 0 0 0 0-2.83zM8.5 7A1.5 1.5 0 1 1 7 8.5 1.5 1.5 0 0 1 8.5 7zm2.79 8.71l-5.5-5.5 1.41-1.41 5.5 5.5-1.41 1.41zm3.71-.71a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5z" />
    </Svg>
);

// Birthday Cake Icon
export const BirthdayCakeIcon = ({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 6a2 2 0 0 0 2-2c0-.38-.1-.73-.29-1.03L12 1l-1.71 1.97A1.992 1.992 0 0 0 10 4c0 1.1.9 2 2 2zm6 3h-1V8c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v1H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V11c0-1.1-.9-2-2-2zm0 12H6v-3h12v3zm0-5H6v-4h12v4z" />
    </Svg>
);

// Failed Red Cross Circle
export const FailedCrossCircleIcon = ({ size = 13, color = '#EF4444' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </Svg>
);