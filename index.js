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
  console.log('[FCM] Background message:', remoteMessage);

  // Notification payloads are automatically displayed by Android
  // when the app is in the background. Avoid displaying them again through Notifee.
  if (remoteMessage.notification) {
    console.log('[FCM] OS will display this notification');
    return;
  }

  // Data-only messages need to be displayed manually.
  const title =
    remoteMessage.data?.title || 'New WhatsApp Message';

  const body =
    remoteMessage.data?.body || '';

  const channelId =
    remoteMessage.data?.channelId || 'inbox_messages_v2';

  const imageUrl =
    remoteMessage.notification?.imageUrl ||
    remoteMessage.data?.imageUrl ||
    'https://ik.imagekit.io/doonext/menext/app-icon.png';

  try {
    await notifee.displayNotification({
      title,
      body,
      subtitle: 'menext WhatsApp CRM',
      data: remoteMessage.data || {},
      android: {
        channelId,
        smallIcon: 'ic_notification',
        color: '#00A859',
        largeIcon: imageUrl,
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (err) {
    // Fallback if ic_notification drawable not found in installed binary
    await notifee.displayNotification({
      title,
      body,
      subtitle: 'menext WhatsApp CRM',
      data: remoteMessage.data || {},
      android: {
        channelId,
        color: '#00A859',
        largeIcon: imageUrl,
        pressAction: {
          id: 'default',
        },
      },
    });
  }
});

// Register Notifee background event handler for background notification interactions
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('[Notifee] Background notification clicked:', detail.notification);
  }
});

AppRegistry.registerComponent(appName, () => App);
