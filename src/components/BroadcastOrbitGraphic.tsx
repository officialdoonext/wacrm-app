import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
    Path,
    Circle,
    Rect,
    G,
    Defs,
    Filter,
    FeDropShadow,
} from 'react-native-svg';

export const BroadcastOrbitGraphic: React.FC<{ size?: number }> = ({ size = 150 }) => {
    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width="100%" height="100%" viewBox="0 0 170 170" fill="none">
                <Defs>
                    <Filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <FeDropShadow
                            dx="0"
                            dy="4"
                            stdDeviation="6"
                            floodColor="#10B981"
                            floodOpacity="0.22"
                        />
                    </Filter>
                    <Filter id="cardShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <FeDropShadow
                            dx="0"
                            dy="3"
                            stdDeviation="3"
                            floodColor="#000000"
                            floodOpacity="0.08"
                        />
                    </Filter>
                </Defs>

                {/* Dotted Connecting Curved Lines */}
                <Path
                    d="M62 48 C 72 26, 92 18, 114 18"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    strokeDasharray="3 3.5"
                    fill="none"
                />
                <Path
                    d="M74 62 C 92 56, 110 56, 134 56"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    strokeDasharray="3 3.5"
                    fill="none"
                />
                <Path
                    d="M74 88 C 96 92, 115 102, 134 114"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    strokeDasharray="3 3.5"
                    fill="none"
                />
                <Path
                    d="M60 102 C 68 126, 85 146, 104 150"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    strokeDasharray="3 3.5"
                    fill="none"
                />

                {/* Target 1: Top Node */}
                <G filter="url(#cardShadow)">
                    <Rect x="100" y="4" width="36" height="32" rx="9" fill="#FFFFFF" />
                    <Circle cx="118" cy="16" r="4" fill="#10B981" />
                    <Path
                        d="M110.5 28 C110.5 23.5, 113.8 22.5, 118 22.5 C122.2 22.5, 125.5 23.5, 125.5 28 Z"
                        fill="#10B981"
                    />
                </G>

                {/* Target 2: Top-Right Node */}
                <G filter="url(#cardShadow)">
                    <Rect x="126" y="40" width="36" height="32" rx="9" fill="#FFFFFF" />
                    <Circle cx="144" cy="52" r="4" fill="#10B981" />
                    <Path
                        d="M136.5 64 C136.5 59.5, 139.8 58.5, 144 58.5 C148.2 58.5, 151.5 59.5, 151.5 64 Z"
                        fill="#10B981"
                    />
                </G>

                {/* Target 3: Bottom-Right Node */}
                <G filter="url(#cardShadow)">
                    <Rect x="126" y="98" width="36" height="32" rx="9" fill="#FFFFFF" />
                    <Circle cx="144" cy="110" r="4" fill="#10B981" />
                    <Path
                        d="M136.5 122 C136.5 117.5, 139.8 116.5, 144 116.5 C148.2 116.5, 151.5 117.5, 151.5 122 Z"
                        fill="#10B981"
                    />
                </G>

                {/* Target 4: Bottom Node */}
                <G filter="url(#cardShadow)">
                    <Rect x="94" y="134" width="36" height="32" rx="9" fill="#FFFFFF" />
                    <Circle cx="112" cy="146" r="4" fill="#10B981" />
                    <Path
                        d="M104.5 158 C104.5 153.5, 107.8 152.5, 112 152.5 C116.2 152.5, 119.5 153.5, 119.5 158 Z"
                        fill="#10B981"
                    />
                </G>

                {/* Center: Large WhatsApp Badge */}
                <G filter="url(#softGlow)">
                    <Circle cx="50" cy="74" r="33" fill="#FFFFFF" />
                    <Circle cx="50" cy="74" r="28" fill="#25D366" />
                    {/* WhatsApp speech tail */}
                    <Path
                        d="M32 94 L37 83 Q34 78 34 74 Q34 65 40 59 Q46 53 55 53 Q64 53 70 59 Q76 65 76 74 Q76 83 70 89 Q64 95 55 95 Q49 95 44 92 Z"
                        fill="#25D366"
                    />
                    {/* WhatsApp Phone Receiver (White) */}
                    <Path
                        d="M42 63.5 C41.2 63.5 40.5 64.2 40.5 65.2 C40.5 68.2 42.5 73.2 46.8 77.5 C51.1 81.8 56.1 83.8 59.1 83.8 C60.1 83.8 60.8 83.1 60.8 82.3 L60.8 79.5 C60.8 78.8 60.3 78.2 59.6 78 C58.2 77.6 56.8 77.1 55.6 76.5 C55 76.2 54.3 76.3 53.8 76.8 L52.7 78.1 C50.5 76.8 48.7 75 47.4 72.8 L48.7 71.7 C49.2 71.2 49.3 70.5 49 69.9 C48.4 68.7 47.9 67.3 47.5 65.9 C47.3 65.2 46.7 64.7 46 64.7 L43.2 64.7 C42.6 63.8 42 63.5 42 63.5 Z"
                        fill="#FFFFFF"
                    />
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});