import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface SmoothScreenTransitionProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const SmoothScreenTransition: React.FC<SmoothScreenTransitionProps> = ({ children, style }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const transAnim = useRef(new Animated.Value(8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(transAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, transAnim]);

    return (
        <Animated.View
            style={[
                styles.container,
                style,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: transAnim }],
                },
            ]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});

