import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Mail Icon
export const MailIcon = ({ size = 20, color = '#9CA3AF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="16" rx="3" />
        <Path d="M3 7l9 6 9-6" />
    </Svg>
);

// Lock Icon
export const LockIcon = ({ size = 20, color = '#9CA3AF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="4" y="11" width="16" height="10" rx="2" />
        <Path d="M8 11V7a4 4 0 018 0v4" />
    </Svg>
);

// Eye Off (Password Hidden)
export const EyeOffIcon = ({ size = 20, color = '#9CA3AF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <Path d="M1 1l22 22" />
    </Svg>
);

// Eye (Password Visible)
export const EyeIcon = ({ size = 20, color = '#9CA3AF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <Circle cx="12" cy="12" r="3" />
    </Svg>
);

// Checkmark Icon
export const CheckIcon = ({ size = 12, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
    </Svg>
);

// Google "G" Full-Color Logo
export const GoogleIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <Path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.31 24 12 24z"
        />
        <Path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z"
        />
        <Path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
    </Svg>
);

// Apple Logo
export const AppleIcon = ({ size = 20, color = '#000000' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.62-.76 1.05-1.81.93-2.87-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.74-.95 2.77 1.02.08 2.06-.51 2.69-1.27z" />
    </Svg>
);