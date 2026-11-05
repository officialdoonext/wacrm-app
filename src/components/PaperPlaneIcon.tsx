import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface IconProps {
    size?: number;
    color?: string;
}

export const PaperPlaneIcon: React.FC<IconProps> = ({
    size = 90,
    color = Colors.primaryGreen,
}) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            style={{ transform: [{ rotate: '-8deg' }] }}>
            {/* Paper airplane body */}
            <Path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill={color}
            />
        </Svg>
    );
};