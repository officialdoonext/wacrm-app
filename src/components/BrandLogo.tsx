import React from 'react';
import {
    Image,
    ImageStyle,
    StyleProp,
    View,
    Text,
    StyleSheet,
    ViewStyle,
} from 'react-native';

export interface BrandLogoProps {
    size?: number;
    width?: number;
    height?: number;
    style?: StyleProp<ViewStyle | ImageStyle>;
    resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
    variant?: 'auto' | 'horizontal' | 'full' | 'icon';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
    size,
    width = 120,
    height = 36,
    style,
    resizeMode = 'contain',
    variant = 'auto',
}) => {
    const finalWidth = size ? size : width;
    const finalHeight = size ? size : height;

    const isHorizontal =
        variant === 'horizontal' ||
        (variant === 'auto' && finalWidth >= finalHeight * 2.2);

    if (isHorizontal) {
        const iconSize = Math.max(22, Math.min(finalHeight - 2, 34));
        const fontSize = Math.max(16, Math.min(iconSize * 0.78, 22));

        return (
            <View style={[styles.horizontalContainer, { height: finalHeight }, style]}>
                <Image
                    source={require('../assets/app-icon.png')}
                    style={{
                        width: iconSize,
                        height: iconSize,
                        borderRadius: iconSize * 0.24,
                        marginRight: 6,
                    }}
                    resizeMode="contain"
                />
                <View style={styles.textWrap}>
                    <Text style={[styles.brandMe, { fontSize, lineHeight: fontSize + 2 }]}>me</Text>
                    <Text style={[styles.brandNext, { fontSize, lineHeight: fontSize + 2 }]}>next</Text>
                </View>
            </View>
        );
    }

    return (
        <Image
            source={require('../assets/app-icon.png')}
            style={[
                {
                    width: finalWidth,
                    height: finalHeight,
                    borderRadius: Math.min(finalWidth, finalHeight) * 0.22,
                },
                style as ImageStyle,
            ]}
            resizeMode={resizeMode}
        />
    );
};

const styles = StyleSheet.create({
    horizontalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandMe: {
        fontWeight: '900',
        color: '#002B49',
        letterSpacing: -0.6,
    },
    brandNext: {
        fontWeight: '900',
        color: '#00A859',
        letterSpacing: -0.6,
    },
});
