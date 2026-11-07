import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
}

export const IconChat: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const IconMegaphone: React.FC<IconProps> = ({ size = 20, color = '#7C3AED' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M11.6 4.4L5.8 8H2v6h3.8l5.8 3.6V4.4zM19 12a7 7 0 0 0-3.6-6.1M15.4 18.1A7 7 0 0 0 19 12M22 12a10 10 0 0 0-5.1-8.7M16.9 20.7A10 10 0 0 0 22 12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const IconUser: React.FC<IconProps> = ({ size = 20, color = '#1E40AF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconUsers: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconDollar: React.FC<IconProps> = ({ size = 20, color = '#D97706' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconChart: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconBot: React.FC<IconProps> = ({ size = 20, color = '#DC2626' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="11" width="18" height="10" rx="2" stroke={color} strokeWidth="2" />
        <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth="2" />
        <Path d="M12 7v4M8 15h.01M16 15h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

export const IconPuzzle: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M19 11h-2a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2a2 2 0 0 1-2 2H7a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const IconStore: React.FC<IconProps> = ({ size = 20, color = '#7C3AED' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconCamera: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconPaperclip: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const IconTrash: React.FC<IconProps> = ({ size = 20, color = '#EF4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconPlay: React.FC<IconProps> = ({ size = 16, color = '#FFFFFF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M5 3l14 9-14 9V3z" />
    </Svg>
);

export const IconPause: React.FC<IconProps> = ({ size = 16, color = '#FFFFFF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Rect x="6" y="4" width="4" height="16" rx="1" />
        <Rect x="14" y="4" width="4" height="16" rx="1" />
    </Svg>
);

export const IconClose: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 16, color = '#10B981' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconDoubleCheck: React.FC<IconProps> = ({ size = 16, color = '#34B7F1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L7 17l-5-5M22 10l-7.5 7.5L13 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconClock: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconTrophy: React.FC<IconProps> = ({ size = 20, color = '#F59E0B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M6 3h12v7a6 6 0 0 1-12 0V3zM12 16v5M8 21h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconSettings: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
        <Path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const IconPhone: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const IconSparkles: React.FC<IconProps> = ({ size = 18, color = '#7C3AED' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.2" />
    </Svg>
);

export const IconSend: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} />
    </Svg>
);

export const IconHeart: React.FC<IconProps> = ({ size = 20, color = '#EF4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
);

export const IconThumbsUp: React.FC<IconProps> = ({ size = 20, color = '#0284C7' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </Svg>
);

export const IconMapPin: React.FC<IconProps> = ({ size = 20, color = '#DC2626' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconFileText: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconZap: React.FC<IconProps> = ({ size = 20, color = '#F59E0B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconKanban: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="5" height="18" rx="1" stroke={color} strokeWidth="2" />
        <Rect x="10" y="3" width="5" height="12" rx="1" stroke={color} strokeWidth="2" />
        <Rect x="17" y="3" width="5" height="15" rx="1" stroke={color} strokeWidth="2" />
    </Svg>
);

export const IconFilter: React.FC<IconProps> = ({ size = 18, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconDownload: React.FC<IconProps> = ({ size = 16, color = '#334155' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconUpload: React.FC<IconProps> = ({ size = 16, color = '#334155' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconCreditCard: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="1" y="4" width="22" height="16" rx="2" stroke={color} strokeWidth="2" />
        <Path d="M1 10h22" stroke={color} strokeWidth="2" />
    </Svg>
);

export const IconTag: React.FC<IconProps> = ({ size = 18, color = '#7C3AED' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="7" cy="7" r="1.5" fill={color} />
    </Svg>
);

export const IconBox: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconPlus: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconCheckCircle: React.FC<IconProps> = ({ size = 20, color = '#10B981' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <Path d="M8 12l2.5 2.5L16 9" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconAlertCircle: React.FC<IconProps> = ({ size = 20, color = '#EF4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <Path d="M12 8v4M12 16h.01" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconChevronBack: React.FC<IconProps> = ({ size = 22, color = '#0F172A' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ size = 18, color = '#94A3B8' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconLock: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" />
        <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconMail: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth="2" />
        <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconSearch: React.FC<IconProps> = ({ size = 18, color = '#94A3B8' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
        <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconBell: React.FC<IconProps> = ({ size = 20, color = '#334155' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconFolder: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconRefresh: React.FC<IconProps> = ({ size = 18, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M23 4v6h-6M1 20v-6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconKey: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 2l-2 2m-3-1l2 2m-4-1l1.5 1.5M10.83 14.17a6 6 0 1 1 2.83-2.83l7.34 7.34v3.32h-3.32l-1.34-1.34v-2.34h-2.34l-3.17-3.15z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const IconBranch: React.FC<IconProps> = ({ size = 20, color = '#D97706' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="18" cy="6" r="3" stroke={color} strokeWidth="2" />
        <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2" />
        <Circle cx="18" cy="18" r="3" stroke={color} strokeWidth="2" />
        <Path d="M6 15V9a6 6 0 0 1 6-6h3M12 9a6 6 0 0 1 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconCopy: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="2" />
        <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconList: React.FC<IconProps> = ({ size = 18, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconWebhook: React.FC<IconProps> = ({ size = 18, color = '#2563EB' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c0-2.21 1.79-4 4-4h5.5M6 7.02h5.99c1.1 0 1.95-.94 2.48-1.9A4 4 0 0 1 22 7c0 2.21-1.79 4-4 4h-5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconBriefcase: React.FC<IconProps> = ({ size = 18, color = '#059669' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
        <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconPencil: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconWhatsApp: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </Svg>
);

export const IconShieldAlert: React.FC<IconProps> = ({ size = 20, color = '#EF4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 8v4M12 16h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const IconLogOut: React.FC<IconProps> = ({ size = 18, color = '#EF4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);
