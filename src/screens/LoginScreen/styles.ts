import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH <= 375;

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 22,
        paddingTop: Platform.select({ ios: 8, android: 16 }),
        paddingBottom: Platform.select({ ios: 28, android: 24 }),
        alignItems: 'center',
    },

    // Soft ambient circular halos
    bgCircleTopRight: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#E8F8F0',
        opacity: 0.8,
    },
    bgCircleTopLeft: {
        position: 'absolute',
        top: 30,
        left: -40,
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#F0FAF4',
        opacity: 0.7,
    },

    // Brand Header
    brandContainer: {
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 18,
    },
    brandTitle: {
        fontSize: IS_SMALL_SCREEN ? 22 : 25,
        fontWeight: '900',
        color: '#0B1528',
        letterSpacing: -0.5,
        marginTop: 6,
    },
    brandSubtitle: {
        fontSize: 12.5,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 2,
    },

    // Screen Title & Description
    headerSection: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    mainTitle: {
        fontSize: IS_SMALL_SCREEN ? 24 : 27,
        fontWeight: '900',
        color: '#0B1528',
        marginBottom: 6,
        letterSpacing: -0.4,
    },
    subTitle: {
        fontSize: IS_SMALL_SCREEN ? 13 : 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Form Fields
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 12,
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
    },
    inputWrapperFocused: {
        borderColor: Colors.primaryGreen,
    },
    inputWrapperError: {
        borderColor: '#EF4444',
        backgroundColor: '#FFF5F5',
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: '#111827',
        paddingVertical: 0,
    },
    eyeButton: {
        padding: 6,
    },

    // Under-input Toast Notification Pill
    toastBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    toastDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#DC2626',
        marginRight: 7,
    },
    toastText: {
        color: '#B91C1C',
        fontSize: 12.5,
        fontWeight: '600',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12.5,
        fontWeight: '500',
        marginTop: 5,
        marginLeft: 4,
    },

    // Remember & Forgot Password Row
    rowOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 18,
    },
    rememberMeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    checkboxActive: {
        backgroundColor: Colors.primaryGreen,
        borderColor: Colors.primaryGreen,
    },
    rememberText: {
        fontSize: 13.5,
        color: '#4B5563',
        fontWeight: '500',
    },
    forgotText: {
        fontSize: 13.5,
        color: Colors.primaryGreen,
        fontWeight: '600',
    },

    // Main Login Button
    loginBtn: {
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.primaryGreen,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 3,
    },
    loginBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },

    // Divider (OR)
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 18,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12.5,
        color: '#9CA3AF',
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Social Auth Buttons
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
    },
    socialBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 10,
    },

    // Bottom "Create an Account" Card
    createAccountCard: {
        width: '100%',
        backgroundColor: '#E8F8F0',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        borderWidth: 1,
        borderColor: '#D4F3E2',
    },
    cardLeft: {
        flex: 1,
        paddingRight: 10,
    },
    cardSubHeader: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0B1528',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 11.5,
        color: '#6B7280',
        lineHeight: 16,
    },
    createAccountPillBtn: {
        backgroundColor: Colors.primaryGreen,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    createAccountPillText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        marginRight: 4,
    },
});