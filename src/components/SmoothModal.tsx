import React from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    Modal,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SmoothModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: number | string;
    height?: number | string;
}

export const SmoothModal: React.FC<SmoothModalProps> = ({
    visible,
    onClose,
    children,
    maxHeight,
    height,
}) => {
    // Resolve height and maxHeight to numeric pixels to prevent Yoga layout 0-height collapse
    const resolvedMaxHeight: number =
        typeof maxHeight === 'number'
            ? maxHeight
            : typeof maxHeight === 'string' && maxHeight.endsWith('%')
            ? (SCREEN_HEIGHT * parseFloat(maxHeight)) / 100
            : Math.round(SCREEN_HEIGHT * 0.88);

    const resolvedHeight: number | undefined =
        typeof height === 'number'
            ? height
            : typeof height === 'string' && height.endsWith('%')
            ? (SCREEN_HEIGHT * parseFloat(height)) / 100
            : undefined;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent={true}>
            <View style={styles.modalRoot}>
                {/* Backdrop dismiss touch */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Bottom Sheet */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardWrap}
                    pointerEvents="box-none">
                    <View
                        style={[
                            styles.sheet,
                            {
                                maxHeight: resolvedMaxHeight,
                            },
                            resolvedHeight ? { height: resolvedHeight } : null,
                        ]}>
                        {/* Top drag pill handle */}
                        <View style={styles.handleBar} />
                        {children}
                    </View>
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
        paddingTop: 12,
        paddingBottom: Platform.select({ ios: 34, android: 24 }),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 16,
        width: '100%',
        minHeight: 180,
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
