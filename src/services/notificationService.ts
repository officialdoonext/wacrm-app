import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidColor,
  EventType,
  AuthorizationStatus,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, authService } from './supabase';

export interface NotificationPayloadData {
  type?: 'chat' | 'automation' | 'broadcast' | 'deal' | 'system';
  conversationId?: string;
  contactId?: string;
  senderName?: string;
  automationId?: string;
  screen?: string;
  [key: string]: string | undefined;
}

export const NOTIFICATION_CHANNELS = {
  INBOX_MESSAGES: 'inbox_messages',
  AUTOMATIONS: 'automations',
  GENERAL: 'general',
} as const;

let channelsCreated = false;

function getSafeMessaging() {
  try {
    return getMessaging();
  } catch (err) {
    console.warn('[NotificationService] getMessaging failed:', err);
    return null;
  }
}

/**
 * Configure Android notification channels for high importance sound & vibration
 */
export async function setupNotificationChannels(): Promise<void> {
  if (channelsCreated) return;

  try {
    // Channel 1: WhatsApp Inbound Messages
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.INBOX_MESSAGES,
      name: 'WhatsApp Customer Messages',
      description: 'Instant alerts for incoming WhatsApp customer messages',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: AndroidColor.GREEN,
    });

    // Channel 2: CRM Automations
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.AUTOMATIONS,
      name: 'CRM Automations & Workflows',
      description: 'Notifications when automated flows, auto-replies, or rules trigger',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: AndroidColor.BLUE,
    });

    // Channel 3: General Updates
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.GENERAL,
      name: 'General Notifications',
      description: 'System updates, broadcasts, and deal alerts',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });

    channelsCreated = true;
  } catch (err) {
    console.warn('[NotificationService] Channel setup exception:', err);
  }
}

/**
 * Request notification permissions from user (Android 13+ & iOS)
 */
export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  status: AuthorizationStatus;
}> {
  try {
    // 1. Notifee permission check & request (handles runtime POST_NOTIFICATIONS on Android 13+)
    const notifeeSettings = await notifee.requestPermission();
    const isGranted =
      notifeeSettings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

    await setupNotificationChannels();

    return {
      granted: isGranted,
      status: notifeeSettings.authorizationStatus,
    };
  } catch (err) {
    console.warn('[NotificationService] Permission request failed:', err);
    return {
      granted: false,
      status: AuthorizationStatus.DENIED,
    };
  }
}

/**
 * Retrieve device FCM token and register it on backend
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const messagingInstance = getSafeMessaging();
    if (!messagingInstance) return null;

    const token = await getToken(messagingInstance);
    if (token) {
      console.log('[NotificationService] FCM Device Token:', token);
      await AsyncStorage.setItem('@menext_fcm_token', token);
      await syncFCMTokenToBackend(token);
    }
    return token;
  } catch (err) {
    console.warn('[NotificationService] Failed to retrieve FCM token:', err);
    return null;
  }
}

/**
 * Sync device FCM token to Supabase profiles table for remote targeting
 */
export async function syncFCMTokenToBackend(token: string): Promise<void> {
  if (!token) return;

  try {
    const user = await authService.getCurrentUser();
    if (!user) return;

    // Try updating profile with fcm_token
    const { error } = await supabase
      .from('profiles')
      .update({
        fcm_token: token,
      })
      .eq('user_id', user.id);

    if (error) {
      // Column fcm_token might not exist yet in profiles schema; fallback to user_metadata
      try {
        await supabase.auth.updateUser({
          data: { fcm_token: token },
        });
      } catch {
        // ignore fallback error
      }
    }
  } catch (err) {
    console.warn('[NotificationService] Error syncing FCM token:', err);
  }
}

/**
 * Display a heads-up local notification banner on screen
 */
export async function displayLocalNotification(params: {
  title: string;
  body: string;
  subtitle?: string;
  data?: NotificationPayloadData;
  channelId?: string;
}): Promise<string | undefined> {
  const {
    title,
    body,
    subtitle,
    data,
    channelId = NOTIFICATION_CHANNELS.INBOX_MESSAGES,
  } = params;

  try {
    await setupNotificationChannels();

    return await notifee.displayNotification({
      title,
      body,
      subtitle: subtitle || 'menext WhatsApp CRM',
      data: (data as any) || {},
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        color: '#00A859',
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
    });
  } catch (err) {
    console.warn('[NotificationService] Failed to display notification:', err);
    return undefined;
  }
}

/**
 * Convenience helper: Notify when a customer sends a new message in inbox
 */
export async function notifyNewWhatsAppMessage(params: {
  conversationId: string;
  contactName: string;
  messageText: string;
  contactId?: string;
}): Promise<void> {
  const { conversationId, contactName, messageText, contactId } = params;

  await displayLocalNotification({
    title: `💬 ${contactName || 'New Message'}`,
    body: messageText || 'Sent a WhatsApp message',
    subtitle: 'WhatsApp Customer Message',
    channelId: NOTIFICATION_CHANNELS.INBOX_MESSAGES,
    data: {
      type: 'chat',
      screen: 'Chat',
      conversationId,
      contactId: contactId || '',
      senderName: contactName || 'Customer',
    },
  });
}

/**
 * Convenience helper: Notify when a CRM automation or workflow triggers
 */
export async function notifyAutomationTriggered(params: {
  title: string;
  workflowName: string;
  details?: string;
  automationId?: string;
}): Promise<void> {
  const { title, workflowName, details, automationId } = params;

  await displayLocalNotification({
    title: `⚡ ${title || 'Automation Executed'}`,
    body: `${workflowName}${details ? ` — ${details}` : ''}`,
    subtitle: 'CRM Workflow',
    channelId: NOTIFICATION_CHANNELS.AUTOMATIONS,
    data: {
      type: 'automation',
      screen: 'Automation',
      automationId: automationId || '',
    },
  });
}

/**
 * Listener for foreground notifications (both FCM push and Notifee clicks)
 */
export function initializeNotificationListeners(
  onNotificationNavigate?: (data: NotificationPayloadData) => void
): () => void {
  const messagingInstance = getSafeMessaging();

  let unsubscribeFCM = () => {};
  let unsubscribeNotificationOpened = () => {};
  let unsubscribeTokenRefresh = () => {};

  if (messagingInstance) {
    // 1. Listen for incoming FCM messages while app is open
    unsubscribeFCM = onMessage(messagingInstance, async (remoteMessage: RemoteMessage) => {
      console.log('[NotificationService] Foreground FCM message:', remoteMessage);

      const title =
        remoteMessage.notification?.title ||
        (remoteMessage.data?.title as string) ||
        'New Message';
      const body =
        remoteMessage.notification?.body ||
        (remoteMessage.data?.body as string) ||
        '';
      const channelId =
        (remoteMessage.data?.channelId as string) ||
        NOTIFICATION_CHANNELS.INBOX_MESSAGES;

      await displayLocalNotification({
        title,
        body,
        channelId,
        data: remoteMessage.data as NotificationPayloadData,
      });
    });

    // 2. Handle when app is in background and user clicks the notification to open app
    unsubscribeNotificationOpened = onNotificationOpenedApp(
      messagingInstance,
      (remoteMessage: RemoteMessage) => {
        console.log(
          '[NotificationService] Notification opened from background:',
          remoteMessage.data
        );
        if (remoteMessage.data && onNotificationNavigate) {
          onNotificationNavigate(
            remoteMessage.data as NotificationPayloadData
          );
        }
      }
    );

    // 3. Handle token refresh
    unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, async (newToken: string) => {
      console.log('[NotificationService] FCM token refreshed:', newToken);
      await AsyncStorage.setItem('@menext_fcm_token', newToken);
      await syncFCMTokenToBackend(newToken);
    });

    // 4. Check if app was opened from completely dead / quit state by tapping a notification
    getInitialNotification(messagingInstance)
      .then((remoteMessage: RemoteMessage | null) => {
        if (remoteMessage?.data && onNotificationNavigate) {
          console.log(
            '[NotificationService] App launched from quit state via notification:',
            remoteMessage.data
          );
          onNotificationNavigate(
            remoteMessage.data as NotificationPayloadData
          );
        }
      })
      .catch((err) => {
        console.warn('[NotificationService] getInitialNotification error:', err);
      });
  }

  // 5. Listen for clicks on Notifee notification banner in foreground
  const unsubscribeNotifeeForeground = notifee.onForegroundEvent(
    ({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        console.log(
          '[NotificationService] Notification tapped (foreground):',
          detail.notification.data
        );
        if (onNotificationNavigate) {
          onNotificationNavigate(
            detail.notification.data as NotificationPayloadData
          );
        }
      }
    }
  );

  // Return combined unsubscribe callback
  return () => {
    unsubscribeFCM();
    unsubscribeNotifeeForeground();
    unsubscribeNotificationOpened();
    unsubscribeTokenRefresh();
  };
}
