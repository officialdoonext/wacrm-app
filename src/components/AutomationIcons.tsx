import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// Play / Sent Triangle
export const PlaySentIcon = ({ size = 12, color = '#10B981' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 3l14 9-14 9V3z" />
    </Svg>
);

// Check Circle / Delivered
export const DeliveredCheckIcon = ({ size = 13, color = '#10B981' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="9" />
        <Path d="M8 12l2.5 2.5L16 9" />
    </Svg>
);

// Curved Reply Arrow
export const ReplyArrowIcon = ({ size = 13, color = '#64748B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 14L4 9l5-5" />
        <Path d="M4 9h11a5 5 0 0 1 5 5v3" />
    </Svg>
);

// Team Members Badge Icon
export const TeamMembersIcon = ({ size = 13, color = '#64748B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="14" rx="3" />
        <Line x1="8" y1="10" x2="16" y2="10" />
    </Svg>
);

// 1. Welcome Wave Icon (👋)
export const AutoWaveIcon = ({ size = 22, color = '#F59E0B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19.5 7.05a1.5 1.5 0 0 0-1.5 1.5V11H17V5.55a1.5 1.5 0 0 0-3 0V11h-1V4.55a1.5 1.5 0 0 0-3 0V11h-1V6.55a1.5 1.5 0 0 0-3 0v7.62c0 4.32 3.51 7.83 7.83 7.83h2.34c3.41 0 6.27-2.6 6.55-5.99l.34-4.46a1.5 1.5 0 0 0-1.52-1.5z" />
    </Svg>
);

// 2. Auto Reply Speech Bubble Icon (💬)
export const AutoReplyBubbleIcon = ({ size = 22, color = '#3B82F6' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        <Circle cx="8" cy="10" r="1.5" fill="#FFFFFF" />
        <Circle cx="12" cy="10" r="1.5" fill="#FFFFFF" />
        <Circle cx="16" cy="10" r="1.5" fill="#FFFFFF" />
    </Svg>
);

// 3. Follow Up Calendar Icon (📅)
export const AutoCalendarIcon = ({ size = 22, color = '#7C3AED' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="18" rx="2" />
        <Line x1="16" y1="2" x2="16" y2="6" />
        <Line x1="8" y1="2" x2="8" y2="6" />
        <Line x1="3" y1="10" x2="21" y2="10" />
        <Circle cx="8" cy="14" r="1" fill={color} />
        <Circle cx="12" cy="14" r="1" fill={color} />
        <Circle cx="16" cy="14" r="1" fill={color} />
    </Svg>
);

// 4. Abandoned Enquiry Tag Icon (🏷️)
export const AutoTagIcon = ({ size = 22, color = '#EF4444' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9A2 2 0 0 0 13 21a2 2 0 0 0 1.41-.59l7-7a2 2 0 0 0 0-2.83zM6.5 8A1.5 1.5 0 1 1 8 6.5 1.5 1.5 0 0 1 6.5 8z" />
    </Svg>
);

// 5. Assign to Team Icon (👥)
export const AutoTeamIcon = ({ size = 22, color = '#10B981' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <Circle cx="9" cy="7" r="4" />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
);