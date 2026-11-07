import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Animated,
    StyleSheet,
    TouchableWithoutFeedback,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SmoothModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: number | string;
}

export const SmoothModal: React.FC<SmoothModalProps> = ({
    visible,
    onClose,
    children,
    maxHeight = '85%',
}) => {
    const [rendered, setRendered] = useState(visible);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT * 0.5)).current;

    useEffect(() => {
        if (visible) {
            setRendered(true);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 65,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT * 0.5,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setRendered(false);
            });
        }
    }, [visible, fadeAnim, slideAnim]);

    if (!rendered) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                />
            </TouchableWithoutFeedback>

            {/* Slide-Up Sheet */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardWrap}
                pointerEvents="box-none">
                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            transform: [{ translateY: slideAnim }],
                            maxHeight: maxHeight as any,
                        },
                    ]}>
                    {/* Top drag pill handle */}
                    <View style={styles.handleBar} />
                    {children}
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        zIndex: 998,
    },
    keyboardWrap: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'flex-end',
        zIndex: 999,
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.select({ ios: 34, android: 20 }),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
    },
    handleBar: {
        width: 38,
        height: 4.5,
        borderRadius: 3,
        backgroundColor: '#CBD5E1',
        alignSelf: 'center',
        marginBottom: 14,
    },
});
