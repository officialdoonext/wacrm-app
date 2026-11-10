import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Animated,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Resolve a height value (number or percentage string) to pixels. */
function resolveSize(value: number | string | undefined, fallback?: number): number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.endsWith('%')) {
        return Math.round((SCREEN_HEIGHT * parseFloat(value)) / 100);
    }
    return fallback;
}

interface SmoothModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    /** Maximum height of the sheet (number px or string like '85%'). Defaults to 90%. */
    maxHeight?: number | string;
    /** Fixed height of the sheet (overrides maxHeight when provided). */
    height?: number | string;
    /** Whether to disable the drag-down-to-close gesture (default false). */
    disableDragToClose?: boolean;
}

export const SmoothModal: React.FC<SmoothModalProps> = ({
    visible,
    onClose,
    children,
    maxHeight,
    height,
    disableDragToClose = false,
}) => {
    const resolvedMaxHeight = resolveSize(maxHeight, Math.round(SCREEN_HEIGHT * 0.90));
    const resolvedHeight = resolveSize(height, undefined);

    // Keep fresh reference to onClose callback so PanResponder closure never goes stale
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Animated Y offset for drag gesture
    const dragY = useRef(new Animated.Value(0)).current;

    // Reset position whenever modal becomes visible
    useEffect(() => {
        if (visible) {
            dragY.setValue(0);
        }
    }, [visible, dragY]);

    // PanResponder: captures downward drag on the handle bar.
    // If the user drags down > 50px or flicks down (velocity > 0.3), close the modal.
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disableDragToClose,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: (_, gs) =>
                !disableDragToClose && gs.dy > 2 && Math.abs(gs.dy) > Math.abs(gs.dx),
            onMoveShouldSetPanResponderCapture: (_, gs) =>
                !disableDragToClose && gs.dy > 2 && Math.abs(gs.dy) > Math.abs(gs.dx),
            onPanResponderGrant: () => {
                dragY.stopAnimation();
            },
            onPanResponderMove: (_, gs) => {
                // Drag down smoothly follows finger; dragging up clamps at 0
                dragY.setValue(Math.max(0, gs.dy));
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > 50 || (gs.dy > 15 && gs.vy > 0.3)) {
                    // Animate off-screen smoothly down
                    Animated.timing(dragY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 180,
                        useNativeDriver: true,
                    }).start(({ finished }) => {
                        if (finished) {
                            onCloseRef.current?.();
                        }
                    });
                } else {
                    // Snap back to open position
                    Animated.spring(dragY, {
                        toValue: 0,
                        tension: 65,
                        friction: 9,
                        useNativeDriver: true,
                    }).start();
                }
            },
            onPanResponderTerminate: () => {
                Animated.spring(dragY, {
                    toValue: 0,
                    tension: 65,
                    friction: 9,
                    useNativeDriver: true,
                }).start();
            },
        })
    ).current;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent={true}
            onShow={() => {
                dragY.setValue(0);
            }}>
            <View style={styles.modalRoot}>
                {/* Backdrop dismiss touch */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Bottom Sheet — KeyboardAvoidingView moves input and sheet above keyboard */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardWrap}
                    keyboardVerticalOffset={0}
                    pointerEvents="box-none">
                    <Animated.View
                        style={[
                            styles.sheet,
                            resolvedMaxHeight ? { maxHeight: resolvedMaxHeight } : null,
                            resolvedHeight ? { height: resolvedHeight } : null,
                            { transform: [{ translateY: dragY }] },
                        ]}>
                        {/* Drag handle pill — pan responder attaches here with generous touch area */}
                        <View
                            style={styles.handleWrap}
                            hitSlop={{ top: 15, bottom: 20, left: 40, right: 40 }}
                            {...panResponder.panHandlers}>
                            <View style={styles.handleBar} />
                        </View>

                        {/* Render children directly — no artificial flex: 1 wrapper */}
                        {children}
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
    },
    keyboardWrap: {
        flex: 1,
        justifyContent: 'flex-end',
        pointerEvents: 'box-none',
        width: '100%',
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: Platform.select({ ios: 34, android: 24 }),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 16,
        width: '100%',
    },
    handleWrap: {
        paddingTop: 12,
        paddingBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    handleBar: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#CBD5E1',
    },
});
