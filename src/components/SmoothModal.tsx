import React, { useRef, useCallback } from 'react';
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
    ScrollView,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Resolve a height value (number or percentage string) to pixels. */
function resolveSize(value: number | string | undefined, fallback: number): number {
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
    /** Maximum height of the sheet (number px or string like '85%'). Defaults to 88%. */
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
    const resolvedMaxHeight = resolveSize(maxHeight, Math.round(SCREEN_HEIGHT * 0.88));
    const resolvedHeight = resolveSize(height, 0) || undefined;

    // Animated Y offset for drag gesture
    const dragY = useRef(new Animated.Value(0)).current;

    // Reset position when modal opens
    const handleShow = useCallback(() => {
        dragY.setValue(0);
    }, [dragY]);

    // PanResponder: captures downward drag on the handle bar.
    // If the user drags down more than 80px or velocity > 0.5, close the modal.
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disableDragToClose,
            onMoveShouldSetPanResponder: (_, gs) =>
                !disableDragToClose && gs.dy > 5 && Math.abs(gs.dy) > Math.abs(gs.dx),
            onPanResponderMove: (_, gs) => {
                // Only allow dragging downward (positive dy)
                if (gs.dy > 0) {
                    dragY.setValue(gs.dy);
                }
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > 80 || gs.vy > 0.5) {
                    // Snap to closed: animate off screen then call onClose
                    Animated.timing(dragY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 180,
                        useNativeDriver: true,
                    }).start(() => {
                        dragY.setValue(0);
                        onClose();
                    });
                } else {
                    // Snap back to open position
                    Animated.spring(dragY, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 4,
                    }).start();
                }
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
            onShow={handleShow}>
            <View style={styles.modalRoot}>
                {/* Backdrop dismiss touch */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Bottom Sheet — KeyboardAvoidingView pushes content up when keyboard opens */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardWrap}
                    keyboardVerticalOffset={0}
                    pointerEvents="box-none">
                    <Animated.View
                        style={[
                            styles.sheet,
                            { maxHeight: resolvedMaxHeight },
                            resolvedHeight ? { height: resolvedHeight } : null,
                            { transform: [{ translateY: dragY }] },
                        ]}>
                        {/* Drag handle — pan responder attaches here */}
                        <View style={styles.handleWrap} {...panResponder.panHandlers}>
                            <View style={styles.handleBar} />
                        </View>

                        {/* Modal body — ScrollView allows inner content to scroll without
                            conflicting with the outer drag-to-close gesture */}
                        <View style={styles.body}>
                            {children}
                        </View>
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
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 20,
        paddingBottom: Platform.select({ ios: 34, android: 24 }),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 16,
        width: '100%',
        minHeight: 180,
        overflow: 'hidden',
    },
    handleWrap: {
        // The drag handle zone is a bit taller than the pill for easier grab
        paddingTop: 12,
        paddingBottom: 6,
        alignItems: 'center',
        marginHorizontal: -20, // extend full width for easy grab
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
    },
    body: {
        flex: 1,
    },
});
