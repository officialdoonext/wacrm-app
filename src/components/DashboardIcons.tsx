import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// Search Magnifier
export const SearchIcon = ({ size = 18, color = '#94A3B8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="11" cy="11" r="8" />
        <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
);

// Filter sliders button icon
export const FilterIcon = ({ size = 18, color = '#00B359' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="4" y1="21" x2="4" y2="14" />
        <Line x1="4" y1="10" x2="4" y2="3" />
        <Line x1="12" y1="21" x2="12" y2="12" />
        <Line x1="12" y1="8" x2="12" y2="3" />
        <Line x1="20" y1="21" x2="20" y2="16" />
        <Line x1="20" y1="12" x2="20" y2="3" />
        <Line x1="1" y1="14" x2="7" y2="14" />
        <Line x1="9" y1="8" x2="15" y2="8" />
        <Line x1="17" y1="16" x2="23" y2="16" />
    </Svg>
);

// Notification Bell
export const BellIcon = ({ size = 20, color = '#64748B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
);

// Chevron Right
export const ChevronRightIcon = ({ size = 16, color = '#CBD5E1' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 18l6-6-6-6" />
    </Svg>
);

// WhatsApp Badge Logo for Avatars
export const WhatsAppMiniBadge = ({ size = 15 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
        <Path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
        <Path fill="#FFFFFF" d="M17.47 14.38c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.13 3.25 5.15 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </Svg>
);

// Tab 1: Inbox
export const TabInboxIcon = ({ size = 22, color = '#00B359' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
        <Rect x="7" y="9" width="10" height="2" rx="1" fill="#FFFFFF" />
    </Svg>
);

// Tab 2: Automation (Lightning)
export const TabAutomationIcon = ({ size = 22, color = '#94A3B8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
);

// Tab 3: Contacts
export const TabContactsIcon = ({ size = 22, color = '#94A3B8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <Circle cx="9" cy="7" r="4" />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
);

// Tab 4: Templates
export const TabTemplatesIcon = ({ size = 22, color = '#94A3B8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="4" y="3" width="16" height="18" rx="2" />
        <Line x1="8" y1="8" x2="16" y2="8" />
        <Line x1="8" y1="12" x2="16" y2="12" />
        <Line x1="8" y1="16" x2="12" y2="16" />
    </Svg>
);

// Tab 5: More (Grid)
export const TabMoreIcon = ({ size = 22, color = '#94A3B8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="3" width="7" height="7" rx="2" />
        <Rect x="14" y="3" width="7" height="7" rx="2" />
        <Rect x="14" y="14" width="7" height="7" rx="2" />
        <Rect x="3" y="14" width="7" height="7" rx="2" />
    </Svg>
);