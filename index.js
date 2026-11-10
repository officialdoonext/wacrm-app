/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Initialize messaging instance
const messagingInstance = getMessaging();

// Register FCM background message handler (runs when app is backgrounded or killed)
setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
  console.log('[FCM] Background push notification received:', remoteMessage);

  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title ||
    'New WhatsApp Message';
  const body =
    remoteMessage.notification?.body ||
    remoteMessage.data?.body ||
    '';
  const channelId =
    remoteMessage.data?.channelId || 'inbox_messages';

  // Display heads-up notification via Notifee
  await notifee.displayNotification({
    title,
    body,
    subtitle: 'menext WhatsApp CRM',
    data: remoteMessage.data || {},
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      color: '#00A859',
      pressAction: {
        id: 'default',
      },
    },
  });
});

// Register Notifee background event handler for background notification interactions
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('[Notifee] Background notification clicked:', detail.notification);
  }
});

AppRegistry.registerComponent(appName, () => App);
