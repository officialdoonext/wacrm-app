import React from 'react';
import { Image, ImageStyle, StyleProp, View, StyleSheet } from 'react-native';

interface BrandLogoProps {
    size?: number;
    width?: number;
    height?: number;
    style?: StyleProp<ImageStyle>;
    resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
    size,
    width = 120,
    height = 40,
    style,
    resizeMode = 'contain',
}) => {
    const finalWidth = size ? size : width;
    const finalHeight = size ? size : height;

    return (
        <Image
            source={require('../assets/logo.png')}
            style={[{ width: finalWidth, height: finalHeight }, style]}
            resizeMode={resizeMode}
        />
    );
};

