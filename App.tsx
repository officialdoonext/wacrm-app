import React, { useEffect } from 'react';
import { enableScreens } from 'react-native-screens';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  requestNotificationPermission,
  getFCMToken,
  initializeNotificationListeners,
} from './src/services/notificationService';

import { SplashScreen } from './src/screens/SplashScreen/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen/SignUpScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen/DashboardScreen';
import { InboxScreen } from './src/screens/InboxScreen/InboxScreen';
import { ChatScreen, ChatParticipant } from './src/screens/ChatScreen/ChatScreen';
import { AutomationScreen } from './src/screens/AutomationScreen/AutomationScreen';
import { ContactsScreen, ContactItem } from './src/screens/ContactsScreen/ContactsScreen';
import { PipelinesScreen } from './src/screens/PipelinesScreen/PipelinesScreen';
import { CommerceScreen } from './src/screens/CommerceScreen/CommerceScreen';
import { FlowsScreen } from './src/screens/FlowsScreen/FlowsScreen';
import { AgentsScreen } from './src/screens/AgentsScreen/AgentsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen/NotificationsScreen';
import { BroadcastScreen } from './src/screens/BroadcastScreen/BroadcastScreen';
import { MoreScreen } from './src/screens/MoreScreen/MoreScreen';
import { authService } from './src/services/supabase';
import { verifyCurrentUserAccess } from './src/services/accessGuardService';

// Enable native hardware screens for optimal memory & 60fps performance
enableScreens();

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  Onboarding:
    | {
        email?: string;
        reason?: string;
        expiryDate?: string | null;
        status?: string;
      }
    | undefined;
  Dashboard: undefined;
  Inbox: undefined;
  Chat: { participant?: ChatParticipant } | undefined;
  Automation: undefined;
  Contacts: undefined;
  Pipelines: undefined;
  Commerce: undefined;
  Flows: undefined;
  Agents: undefined;
  Notifications: undefined;
  Broadcast: undefined;
  More: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// -------------------------------------------------------------
// Screen Wrappers with Native Navigation Integration
// -------------------------------------------------------------

function SplashScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Splash'>) {
  useEffect(() => {
    let isMounted = true;
    const checkSessionAndRoute = async () => {
      try {
        const session = await authService.getSession();
        if (isMounted) {
          if (session?.user) {
            // Strict fail-closed subscription & status access check
            const access = await verifyCurrentUserAccess();
            if (isMounted) {
              if (access.isAllowed) {
                navigation.replace('Inbox');
              } else {
                navigation.replace('Onboarding', {
                  email: session.user.email || '',
                  reason: access.reason || 'inactive',
                  expiryDate: access.expiryDate,
                  status: access.status,
                });
              }
            }
          } else {
            navigation.replace('Welcome');
          }
        }
      } catch {
        if (isMounted) navigation.replace('Welcome');
      }
    };

    const timer = setTimeout(() => {
      checkSessionAndRoute();
    }, 1800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return <SplashScreen onFinish={() => navigation.replace('Welcome')} />;
}

function WelcomeScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Welcome'>) {
  return (
    <WelcomeScreen
      onNavigateLogin={() => navigation.navigate('Login')}
      onNavigateOnboarding={(params) => navigation.replace('Onboarding', params)}
      onAccessGranted={() => navigation.replace('Inbox')}
    />
  );
}

function LoginScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  return (
    <LoginScreen
      onNavigateRegister={() => navigation.navigate('SignUp')}
      onLoginSuccess={(email) => {
        navigation.replace('Inbox');
      }}
      onLoginRestricted={(email, reason, expiryDate, status) => {
        navigation.replace('Onboarding', { email, reason, expiryDate, status });
      }}
    />
  );
}

function SignUpScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'SignUp'>) {
  return (
    <SignUpScreen
      onNavigateLogin={() => navigation.navigate('Login')}
      onSignUpSuccess={(email) =>
        navigation.navigate('Onboarding', { email, reason: 'inactive', status: 'inactive' })
      }
    />
  );
}

function OnboardingScreenWrapper({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Onboarding'>) {
  return (
    <OnboardingScreen
      email={route.params?.email || ''}
      reason={route.params?.reason || 'inactive'}
      expiryDate={route.params?.expiryDate || null}
      status={route.params?.status || 'inactive'}
      onAccessGranted={() => navigation.replace('Inbox')}
      onLogout={async () => {
        await authService.signOut();
        navigation.replace('Login');
      }}
    />
  );
}

function DashboardScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Dashboard'>) {
  return (
    <DashboardScreen
      onBack={() => navigation.goBack()}
      onNavigateTab={(tab) => navigation.navigate(tab as any)}
      onQuickAction={(action) => {
        if (action === 'new_chat') navigation.navigate('Inbox');
        if (action === 'new_broadcast') navigation.navigate('Broadcast');
        if (action === 'new_contact') navigation.navigate('Contacts');
        if (action === 'new_deal') navigation.navigate('Pipelines');
      }}
      onOpenNotifications={() => navigation.navigate('Notifications')}
    />
  );
}

function InboxScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Inbox'>) {
  return (
    <InboxScreen
      onSelectChat={(chat) => navigation.navigate('Chat', { participant: chat })}
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
    />
  );
}

function ChatScreenWrapper({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Chat'>) {
  return (
    <ChatScreen
      participant={route.params?.participant}
      onBack={() => navigation.goBack()}
      onOpenDeals={() => navigation.navigate('Pipelines')}
    />
  );
}

function AutomationScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Automation'>) {
  return (
    <AutomationScreen
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
    />
  );
}

function ContactsScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Contacts'>) {
  return (
    <ContactsScreen
      onBack={() => navigation.goBack()}
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
      onSelectContact={(contact: ContactItem) => {
        navigation.navigate('Chat', {
          participant: {
            id: contact.id,
            conversationId: contact.conversationId,
            contactId: contact.contactId || contact.id,
            name: contact.name,
            phone: contact.phone,
            avatarUrl: contact.avatarUrl,
            tag: contact.tag,
          },
        });
      }}
    />
  );
}

function PipelinesScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Pipelines'>) {
  return (
    <PipelinesScreen
      onBack={() => navigation.goBack()}
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
      onOpenChat={(contactName, phone) => {
        navigation.navigate('Chat', {
          participant: {
            name: contactName,
            phone,
            tag: { label: 'Lead', bg: '#DCFCE7', color: '#166534' },
          },
        });
      }}
    />
  );
}

function CommerceScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Commerce'>) {
  return (
    <CommerceScreen
      onBack={() => navigation.goBack()}
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
      onSendProductInChat={() => {
        navigation.navigate('Inbox');
      }}
    />
  );
}

function FlowsScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Flows'>) {
  return (
    <FlowsScreen
      onBack={() => navigation.goBack()}
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
    />
  );
}

function AgentsScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Agents'>) {
  return (
    <AgentsScreen
      onBack={() => navigation.goBack()}
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
    />
  );
}

function NotificationsScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Notifications'>) {
  return (
    <NotificationsScreen
      onBack={() => navigation.goBack()}
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
    />
  );
}

function BroadcastScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Broadcast'>) {
  return (
    <BroadcastScreen
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
    />
  );
}

function MoreScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'More'>) {
  return (
    <MoreScreen
      onBack={() => navigation.goBack()}
      onNavigateTab={(tab) => navigation.navigate(tab)}
      onLogout={async () => {
        await authService.signOut();
        navigation.replace('Login');
      }}
      onOpenPipelines={() => navigation.navigate('Pipelines')}
      onOpenCommerce={() => navigation.navigate('Commerce')}
      onOpenFlows={() => navigation.navigate('Flows')}
      onOpenAgents={() => navigation.navigate('Agents')}
      onOpenDashboard={() => navigation.navigate('Dashboard')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
      onOpenContacts={() => navigation.navigate('Contacts')}
    />
  );
}

// -------------------------------------------------------------
// Main Application Root with Push & Local Notifications
// -------------------------------------------------------------

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App(): React.JSX.Element {
  useEffect(() => {
    // 1. Request notification permission & set up sound/vibration channels
    requestNotificationPermission().then(() => {
      // 2. Retrieve & sync FCM token
      getFCMToken();
    });

    // 3. Listen for foreground FCM push & Notifee banner clicks
    const unsubscribeNotifications = initializeNotificationListeners((data) => {
      if (navigationRef.isReady()) {
        if (data.type === 'chat' && data.conversationId) {
          navigationRef.navigate('Chat', {
            participant: {
              id: data.conversationId,
              conversationId: data.conversationId,
              contactId: data.contactId,
              name: data.senderName || 'Customer',
              tag: { label: 'Customer', bg: '#DCFCE7', color: '#166534' },
            },
          });
        } else if (data.screen === 'Automation' || data.type === 'automation') {
          navigationRef.navigate('Automation');
        } else if (data.screen === 'Inbox') {
          navigationRef.navigate('Inbox');
        } else if (data.screen === 'Notifications') {
          navigationRef.navigate('Notifications');
        }
      }
    });

    return () => {
      unsubscribeNotifications();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}>
          <Stack.Screen name="Splash" component={SplashScreenWrapper} />
          <Stack.Screen name="Welcome" component={WelcomeScreenWrapper} />
          <Stack.Screen name="Login" component={LoginScreenWrapper} />
          <Stack.Screen name="SignUp" component={SignUpScreenWrapper} />
          <Stack.Screen name="Onboarding" component={OnboardingScreenWrapper} />
          <Stack.Screen name="Dashboard" component={DashboardScreenWrapper} />
          <Stack.Screen name="Inbox" component={InboxScreenWrapper} />
          <Stack.Screen name="Chat" component={ChatScreenWrapper} />
          <Stack.Screen name="Automation" component={AutomationScreenWrapper} />
          <Stack.Screen name="Contacts" component={ContactsScreenWrapper} />
          <Stack.Screen name="Pipelines" component={PipelinesScreenWrapper} />
          <Stack.Screen name="Commerce" component={CommerceScreenWrapper} />
          <Stack.Screen name="Flows" component={FlowsScreenWrapper} />
          <Stack.Screen name="Agents" component={AgentsScreenWrapper} />
          <Stack.Screen name="Notifications" component={NotificationsScreenWrapper} />
          <Stack.Screen name="Broadcast" component={BroadcastScreenWrapper} />
          <Stack.Screen name="More" component={MoreScreenWrapper} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
