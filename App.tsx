import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/SplashScreen/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen/SignUpScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen/DashboardScreen';
import { InboxScreen } from './src/screens/InboxScreen/InboxScreen';
import { ChatScreen, ChatParticipant } from './src/screens/ChatScreen/ChatScreen';
import { AutomationScreen } from './src/screens/AutomationScreen/AutomationScreen';
import { ContactsScreen } from './src/screens/ContactsScreen/ContactsScreen';
import { PipelinesScreen } from './src/screens/PipelinesScreen/PipelinesScreen';
import { CommerceScreen } from './src/screens/CommerceScreen/CommerceScreen';
import { FlowsScreen } from './src/screens/FlowsScreen/FlowsScreen';
import { AgentsScreen } from './src/screens/AgentsScreen/AgentsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen/NotificationsScreen';
import { BroadcastScreen } from './src/screens/BroadcastScreen/BroadcastScreen';
import { MoreScreen } from './src/screens/MoreScreen/MoreScreen';
import { SmoothScreenTransition } from './src/components/SmoothScreenTransition';
import { authService } from './src/services/supabase';

type ScreenName =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'dashboard'
  | 'inbox'
  | 'chat'
  | 'automation'
  | 'contacts'
  | 'pipelines'
  | 'commerce'
  | 'flows'
  | 'agents'
  | 'notifications'
  | 'broadcast'
  | 'more';

export default function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [selectedChat, setSelectedChat] = useState<ChatParticipant | null>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    let isMounted = true;
    const checkSessionAndRoute = async () => {
      try {
        const session = await authService.getSession();
        if (isMounted) {
          if (session?.user) {
            setUserEmail(session.user.email || '');
            setCurrentScreen('inbox');
          } else {
            setCurrentScreen('welcome');
          }
        }
      } catch {
        if (isMounted) setCurrentScreen('welcome');
      }
    };

    const timer = setTimeout(() => {
      checkSessionAndRoute();
    }, 2200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleTabNavigation = (
    tab: 'Inbox' | 'Automation' | 'Contacts' | 'Broadcast' | 'More'
  ) => {
    if (tab === 'Inbox') setCurrentScreen('inbox');
    if (tab === 'Automation') setCurrentScreen('automation');
    if (tab === 'Contacts') setCurrentScreen('contacts');
    if (tab === 'Broadcast') setCurrentScreen('broadcast');
    if (tab === 'More') setCurrentScreen('more');
  };

  return (
    <SafeAreaProvider>
      <SmoothScreenTransition key={currentScreen}>
        {currentScreen === 'splash' && <SplashScreen />}

        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onNavigateLogin={() => setCurrentScreen('login')}
            onNavigateSignUp={() => setCurrentScreen('signup')}
          />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            onNavigateRegister={() => setCurrentScreen('signup')}
            onLoginSuccess={(email) => {
              setUserEmail(email);
              setCurrentScreen('inbox');
            }}
          />
        )}

        {currentScreen === 'signup' && (
          <SignUpScreen
            onNavigateLogin={() => setCurrentScreen('login')}
            onSignUpSuccess={(email) => {
              setUserEmail(email);
              setCurrentScreen('onboarding');
            }}
          />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            email={userEmail}
            onAccessGranted={() => setCurrentScreen('inbox')}
            onLogout={async () => {
              await authService.signOut();
              setCurrentScreen('login');
            }}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            onNavigateTab={handleTabNavigation}
            onQuickAction={(action) => {
              if (action === 'new_chat') setCurrentScreen('inbox');
              if (action === 'new_broadcast') setCurrentScreen('broadcast');
              if (action === 'new_contact') setCurrentScreen('contacts');
              if (action === 'new_deal') setCurrentScreen('pipelines');
            }}
          />
        )}

        {currentScreen === 'inbox' && (
          <InboxScreen
            onSelectChat={(chat) => {
              setSelectedChat(chat);
              setCurrentScreen('chat');
            }}
            onNavigateTab={handleTabNavigation}
            onOpenDashboard={() => setCurrentScreen('dashboard')}
            onOpenNotifications={() => setCurrentScreen('notifications')}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            participant={selectedChat || undefined}
            onBack={() => setCurrentScreen('inbox')}
            onOpenDeals={() => setCurrentScreen('pipelines')}
          />
        )}

        {currentScreen === 'contacts' && (
          <ContactsScreen
            onNavigateTab={handleTabNavigation}
            onSelectContact={(contact) => {
              setSelectedChat(contact);
              setCurrentScreen('chat');
            }}
          />
        )}

        {currentScreen === 'pipelines' && (
          <PipelinesScreen
            onBack={() => setCurrentScreen('inbox')}
            onOpenChat={(contactName, phone) => {
              setSelectedChat({
                name: contactName,
                phone,
                tag: { label: 'Lead', bg: '#DCFCE7', color: '#166534' },
              });
              setCurrentScreen('chat');
            }}
          />
        )}

        {currentScreen === 'commerce' && (
          <CommerceScreen
            onBack={() => setCurrentScreen('more')}
            onSendProductInChat={(prod) => {
              if (selectedChat) {
                setCurrentScreen('chat');
              } else {
                setCurrentScreen('inbox');
              }
            }}
          />
        )}

        {currentScreen === 'automation' && (
          <AutomationScreen onNavigateTab={handleTabNavigation} />
        )}

        {currentScreen === 'flows' && (
          <FlowsScreen onBack={() => setCurrentScreen('more')} />
        )}

        {currentScreen === 'agents' && (
          <AgentsScreen onBack={() => setCurrentScreen('more')} />
        )}

        {currentScreen === 'notifications' && (
          <NotificationsScreen onBack={() => setCurrentScreen('inbox')} />
        )}

        {currentScreen === 'broadcast' && (
          <BroadcastScreen onNavigateTab={handleTabNavigation} />
        )}

        {currentScreen === 'more' && (
          <MoreScreen
            onBack={() => setCurrentScreen('inbox')}
            onNavigateTab={handleTabNavigation}
            onLogout={async () => {
              await authService.signOut();
              setCurrentScreen('login');
            }}
            onOpenPipelines={() => setCurrentScreen('pipelines')}
            onOpenCommerce={() => setCurrentScreen('commerce')}
            onOpenFlows={() => setCurrentScreen('flows')}
            onOpenAgents={() => setCurrentScreen('agents')}
            onOpenDashboard={() => setCurrentScreen('dashboard')}
          />
        )}
      </SmoothScreenTransition>
    </SafeAreaProvider>
  );
}
