import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/SplashScreen/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen/LoginScreen';
import { InboxScreen } from './src/screens/InboxScreen/InboxScreen';
import { ChatScreen, ChatParticipant } from './src/screens/ChatScreen/ChatScreen';
import { AutomationScreen } from './src/screens/AutomationScreen/AutomationScreen';
import { ContactsScreen } from './src/screens/ContactsScreen/ContactsScreen';
import { BroadcastScreen } from './src/screens/BroadcastScreen/BroadcastScreen';
import { MoreScreen } from './src/screens/MoreScreen/MoreScreen';
import { authService } from './src/services/supabase';

type ScreenName =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'inbox'
  | 'chat'
  | 'automation'
  | 'contacts'
  | 'broadcast'
  | 'more';

export default function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [selectedChat, setSelectedChat] = useState<ChatParticipant | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkSessionAndRoute = async () => {
      try {
        const session = await authService.getSession();
        if (isMounted) {
          if (session?.user) {
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
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'welcome' && (
        <WelcomeScreen onNavigateLogin={() => setCurrentScreen('login')} />
      )}
      {currentScreen === 'login' && (
        <LoginScreen
          onNavigateRegister={() => console.log('Register')}
          onLoginSuccess={() => setCurrentScreen('inbox')}
        />
      )}
      {currentScreen === 'inbox' && (
        <InboxScreen
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            setCurrentScreen('chat');
          }}
          onNavigateTab={handleTabNavigation}
        />
      )}
      {currentScreen === 'automation' && (
        <AutomationScreen onNavigateTab={handleTabNavigation} />
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
        />
      )}
      {currentScreen === 'chat' && (
        <ChatScreen
          participant={selectedChat || undefined}
          onBack={() => setCurrentScreen('inbox')}
        />
      )}
    </SafeAreaProvider>
  );
}