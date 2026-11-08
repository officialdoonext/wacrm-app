import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import {
    TabInboxIcon,
    TabAutomationIcon,
    TabMoreIcon,
} from './DashboardIcons';
import { MegaphoneIcon } from './BroadcastIcons';
import { BotIcon } from './AgentIcons';

export type BottomNavTab = 'Inbox' | 'Automation' | 'Agents' | 'Broadcast' | 'More';

export interface AppBottomBarProps {
    activeTab?: BottomNavTab | string;
    onNavigateTab?: (tab: BottomNavTab) => void;
    unreadCount?: number;
}

export const AppBottomBar: React.FC<AppBottomBarProps> = ({
    activeTab,
    onNavigateTab,
    unreadCount = 0,
}) => {
    const isTabActive = (tab: BottomNavTab) => activeTab === tab;

    const handlePress = (tab: BottomNavTab) => {
        if (onNavigateTab) {
            onNavigateTab(tab);
        }
    };

    return (
        <View style={styles.bottomTabBar}>
            {/* 1. Inbox */}
            <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => handlePress('Inbox')}>
                <TabInboxIcon
                    size={22}
                    color={isTabActive('Inbox') ? Colors.primaryGreen : '#94A3B8'}
                />
                {unreadCount > 0 && <View style={styles.tabIndicatorDot} />}
                <Text
                    style={[
                        styles.tabLabel,
                        isTabActive('Inbox') && styles.tabLabelActive,
                    ]}>
                    Inbox
                </Text>
            </TouchableOpacity>

            {/* 2. Automation */}
            <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => handlePress('Automation')}>
                <TabAutomationIcon
                    size={22}
                    color={isTabActive('Automation') ? Colors.primaryGreen : '#94A3B8'}
                />
                <Text
                    style={[
                        styles.tabLabel,
                        isTabActive('Automation') && styles.tabLabelActive,
                    ]}>
                    Automation
                </Text>
            </TouchableOpacity>

            {/* 3. AI Agent (CENTER - replacing Contacts as requested) */}
            <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => handlePress('Agents')}>
                <BotIcon
                    size={22}
                    color={isTabActive('Agents') ? Colors.primaryGreen : '#94A3B8'}
                />
                <Text
                    style={[
                        styles.tabLabel,
                        isTabActive('Agents') && styles.tabLabelActive,
                    ]}>
                    AI Agent
                </Text>
            </TouchableOpacity>

            {/* 4. Broadcast */}
            <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => handlePress('Broadcast')}>
                <MegaphoneIcon
                    size={22}
                    color={isTabActive('Broadcast') ? Colors.primaryGreen : '#94A3B8'}
                />
                <Text
                    style={[
                        styles.tabLabel,
                        isTabActive('Broadcast') && styles.tabLabelActive,
                    ]}>
                    Broadcast
                </Text>
            </TouchableOpacity>

            {/* 5. More */}
            <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => handlePress('More')}>
                <TabMoreIcon
                    size={22}
                    color={isTabActive('More') ? Colors.primaryGreen : '#94A3B8'}
                />
                <Text
                    style={[
                        styles.tabLabel,
                        isTabActive('More') && styles.tabLabelActive,
                    ]}>
                    More
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: Platform.OS === 'ios' ? 64 : 58,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingBottom: Platform.select({ ios: 10, android: 4 }),
        zIndex: 10,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingHorizontal: 6,
        minWidth: 56,
    },
    tabLabel: {
        fontSize: 10.5,
        fontWeight: '500',
        color: '#94A3B8',
        marginTop: 3,
    },
    tabLabelActive: {
        color: Colors.primaryGreen,
        fontWeight: '700',
    },
    tabIndicatorDot: {
        position: 'absolute',
        top: 0,
        right: 12,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
});

