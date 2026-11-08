import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
} from 'react-native';
import { BrandLogo } from './BrandLogo';
import { Colors } from '../theme/colors';
import { ChevronBackIcon } from './ChatIcons';
import { SearchIcon, BellIcon } from './DashboardIcons';
import { IconChart } from './AppIcons';
import { authService, UserProfile } from '../services/supabase';

interface AppHeaderProps {
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    onPressProfile?: () => void;
    onPressSearch?: () => void;
    onPressNotifications?: () => void;
    onPressDashboard?: () => void;
    unreadCount?: number;
    rightElement?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    subtitle,
    onBack,
    onPressProfile,
    onPressSearch,
    onPressNotifications,
    onPressDashboard,
    unreadCount = 0,
    rightElement,
}) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        authService.getProfile().then(setProfile);
    }, []);

    const userInitial = profile?.full_name ? profile.full_name[0].toUpperCase() : 'A';

    return (
        <View style={styles.headerContainer}>
            {/* Left Side: Back Arrow (if provided) + Brand Logo */}
            <View style={styles.leftContainer}>
                {onBack && (
                    <TouchableOpacity
                        style={styles.backBtn}
                        activeOpacity={0.7}
                        onPress={onBack}>
                        <ChevronBackIcon size={22} color="#0F172A" />
                    </TouchableOpacity>
                )}
                <View style={styles.logoWrap}>
                    <BrandLogo width={128} height={32} resizeMode="contain" />
                </View>
                {title && (
                    <View style={styles.titleWrap}>
                        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
                        {subtitle && <Text style={styles.subText} numberOfLines={1}>{subtitle}</Text>}
                    </View>
                )}
            </View>

            {/* Right Side: Actions + Profile Avatar (Identical across all screens) */}
            <View style={styles.rightContainer}>
                {rightElement && (
                    <View style={styles.extraActionWrap}>{rightElement}</View>
                )}

                {onPressDashboard && (
                    <TouchableOpacity
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                        onPress={onPressDashboard}>
                        <IconChart size={19} color="#334155" />
                    </TouchableOpacity>
                )}

                {onPressSearch && (
                    <TouchableOpacity
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                        onPress={onPressSearch}>
                        <SearchIcon size={19} color="#334155" />
                    </TouchableOpacity>
                )}

                {onPressNotifications && (
                    <TouchableOpacity
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                        onPress={onPressNotifications}>
                        <BellIcon size={19} color="#334155" />
                        {unreadCount > 0 && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.avatarWrap}
                    activeOpacity={0.85}
                    onPress={onPressProfile}>
                    {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{userInitial}</Text>
                        </View>
                    )}
                    <View style={styles.onlineDot} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.select({ ios: 4, android: 10 }),
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        zIndex: 50,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backBtn: {
        padding: 4,
        marginRight: 6,
    },
    logoWrap: {
        justifyContent: 'center',
    },
    titleWrap: {
        marginLeft: 10,
        justifyContent: 'center',
        flex: 1,
    },
    titleText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    subText: {
        fontSize: 10,
        color: '#64748B',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    extraActionWrap: {
        marginRight: 2,
    },
    iconBtn: {
        padding: 6,
        position: 'relative',
    },
    unreadDot: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    avatarWrap: {
        position: 'relative',
        marginLeft: 4,
    },
    avatarImg: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#E2E8F0',
    },
    avatarPlaceholder: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.whatsappTeal,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: '#10B981',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
});
