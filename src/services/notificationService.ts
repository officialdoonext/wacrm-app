import { Platform, PermissionsAndroid, Alert } from 'react-native';
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

// Versioned channel IDs ensure Android OS updates channel settings (sound/vibration/high importance)
export const NOTIFICATION_CHANNELS = {
  INBOX_MESSAGES: 'inbox_messages_v2',
  AUTOMATIONS: 'automations_v2',
  GENERAL: 'general_v2',
} as const;

export const APP_NOTIFICATION_IMAGE_URL =
  'https://ik.imagekit.io/doonext/menext/app-icon.png';

let channelsCreated = false;
let globalSubscriptionChannel: any = null;
let activeChatConversationId: string | null = null;
const recentNotificationDedupe = new Map<string, number>();

function isDuplicateNotification(key: string, windowMs = 25000): boolean {
  const now = Date.now();
  const lastTime = recentNotificationDedupe.get(key);
  if (lastTime && now - lastTime < windowMs) {
    return true;
  }
  recentNotificationDedupe.set(key, now);

  // Clean old entries
  if (recentNotificationDedupe.size > 200) {
    for (const [k, time] of recentNotificationDedupe.entries()) {
      if (now - time > windowMs) {
        recentNotificationDedupe.delete(k);
      }
    }
  }
  return false;
}

export function setActiveChatConversationId(id: string | null): void {
  activeChatConversationId = id;
}

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
    console.log('[NotificationService] High-importance notification channels registered.');
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
    // Explicit Android 13+ runtime POST_NOTIFICATIONS dialog prompt
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const androidPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('[NotificationService] Android 13+ POST_NOTIFICATIONS:', androidPermission);
      } catch (pErr) {
        console.warn('[NotificationService] Android permission request error:', pErr);
      }
    }

    // Notifee permission check & request
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
export async function syncFCMTokenToBackend(token?: string): Promise<void> {
  const effectiveToken =
    token || (await AsyncStorage.getItem('@menext_fcm_token')) || '';
  if (!effectiveToken) return;

  try {
    const user = await authService.getCurrentUser();
    if (!user) return;

    // Try updating profile with fcm_token
    const { error } = await supabase
      .from('profiles')
      .update({
        fcm_token: effectiveToken,
      })
      .eq('user_id', user.id);

    if (error) {
      // Column fcm_token might not exist yet in profiles schema; fallback to user_metadata
      try {
        await supabase.auth.updateUser({
          data: { fcm_token: effectiveToken },
        });
      } catch {
        // ignore fallback error
      }
    }
    console.log('[NotificationService] Synced FCM token to backend for user:', user.email);
  } catch (err) {
    console.warn('[NotificationService] Error syncing FCM token:', err);
  }
}

/**
 * Display a heads-up notification banner on screen (with resilient icon fallback)
 */
export async function displayLocalNotification(params: {
  title: string;
  body: string;
  subtitle?: string;
  data?: NotificationPayloadData;
  channelId?: string;
  imageUrl?: string;
}): Promise<string | undefined> {
  const {
    title,
    body,
    subtitle,
    data,
    channelId = NOTIFICATION_CHANNELS.INBOX_MESSAGES,
    imageUrl = (data as any)?.imageUrl || APP_NOTIFICATION_IMAGE_URL,
  } = params;

  try {
    await setupNotificationChannels();

    // 1. Try displaying with dedicated monochrome icon + custom image
    try {
      return await notifee.displayNotification({
        title,
        body,
        subtitle: subtitle || 'menext WhatsApp CRM',
        data: (data as any) || {},
        android: {
          channelId,
          smallIcon: 'ic_notification',
          largeIcon: imageUrl,
          color: '#00A859',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
          attachments: imageUrl ? [{ url: imageUrl }] : undefined,
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      });
    } catch (iconErr: any) {
      console.warn(
        '[NotificationService] Failed with ic_notification, retrying with default launcher icon:',
        iconErr?.message
      );
      // 2. Fallback without smallIcon so Android uses default app icon
      return await notifee.displayNotification({
        title,
        body,
        subtitle: subtitle || 'menext WhatsApp CRM',
        data: (data as any) || {},
        android: {
          channelId,
          color: '#00A859',
          largeIcon: imageUrl,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
          attachments: imageUrl ? [{ url: imageUrl }] : undefined,
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      });
    }
  } catch (err: any) {
    console.warn('[NotificationService] Failed to display notification:', err?.message || err);
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
  messageId?: string;
}): Promise<void> {
  const { conversationId, contactName, messageText, contactId, messageId } = params;

  const dedupeKey = messageId || `${conversationId}_${messageText}`;
  if (isDuplicateNotification(dedupeKey)) {
    console.log('[NotificationService] Suppressed duplicate notification for key:', dedupeKey);
    return;
  }

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
 * Global Realtime Inbound Message Listener:
 * Runs persistently across the entire app so notifications trigger on ANY screen.
 */
export function startGlobalInboundNotificationListener(): () => void {
  if (globalSubscriptionChannel) {
    try {
      supabase.removeChannel(globalSubscriptionChannel);
    } catch {}
    globalSubscriptionChannel = null;
  }

  const channelName = `global_inbound_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  console.log('[NotificationService] Starting global realtime message listener on channel:', channelName);

  globalSubscriptionChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      async (payload: any) => {
        const newMsg = payload?.new;
        if (!newMsg) return;

        console.log('[NotificationService] Realtime message event detected:', newMsg.id, newMsg.sender_type);

        // Notify for any customer/inbound message
        const isInbound =
          newMsg.sender_type === 'customer' ||
          newMsg.sender_type === 'inbound' ||
          (newMsg.sender_type && newMsg.sender_type !== 'agent');

        if (isInbound) {
          // If the user is currently reading this specific conversation in ChatScreen, don't show notification
          if (activeChatConversationId && activeChatConversationId === newMsg.conversation_id) {
            return;
          }

          // Fetch contact details
          let contactName = 'Customer';
          try {
            const { data: conv } = await supabase
              .from('conversations')
              .select('contact:contacts(name, phone)')
              .eq('id', newMsg.conversation_id)
              .maybeSingle();

            if (conv?.contact) {
              const c = conv.contact as any;
              contactName = c.name || c.phone || 'Customer';
            }
          } catch {}

          const preview =
            newMsg.content_text ||
            (newMsg.content_type && newMsg.content_type !== 'text'
              ? `Sent a ${newMsg.content_type}`
              : 'Sent a message');

          await notifyNewWhatsAppMessage({
            conversationId: newMsg.conversation_id,
            contactName,
            messageText: preview,
            contactId: newMsg.contact_id,
            messageId: newMsg.id,
          });
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'automation_logs' },
      async (payload: any) => {
        const log = payload?.new;
        if (log) {
          await notifyAutomationTriggered({
            title: 'Automation Executed',
            workflowName: log.automation_name || 'Workflow Rule',
            details: log.contact_name ? `Triggered for ${log.contact_name}` : undefined,
            automationId: log.automation_id,
          });
        }
      }
    )
    .subscribe();

  return () => {
    if (globalSubscriptionChannel) {
      try {
        supabase.removeChannel(globalSubscriptionChannel);
      } catch {}
      globalSubscriptionChannel = null;
    }
  };
}

/**
 * Automatically sync Realtime JWT authentication & tokens whenever user signs in or session is restored
 */
export function setupNotificationAuthSync(): () => void {
  // 1. Initial check for existing active session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      console.log('[NotificationService] Session restored for user:', session.user.email);
      try {
        supabase.realtime.setAuth(session.access_token);
      } catch {}
      startGlobalInboundNotificationListener();
      getFCMToken();
    }
  });

  // 2. Continuous listener for auth state changes
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('[NotificationService] Auth state changed:', event, session?.user?.email);
      if (session?.user) {
        try {
          supabase.realtime.setAuth(session.access_token);
        } catch {}
        startGlobalInboundNotificationListener();
        getFCMToken();
      }
    }
  );

  return () => {
    authListener?.subscription?.unsubscribe();
  };
}

/**
 * Instantly triggers a test notification to verify device sound, banner, and permissions
 */
export async function sendTestNotification(): Promise<void> {
  const perm = await requestNotificationPermission();
  console.log('[NotificationService] Test notification requested, permission:', perm);

  const res = await displayLocalNotification({
    title: '💬 Priya Sharma',
    body: 'Hi! Can you share the WhatsApp CRM pricing and package details?',
    subtitle: 'menext WhatsApp CRM',
    imageUrl: APP_NOTIFICATION_IMAGE_URL,
    channelId: NOTIFICATION_CHANNELS.INBOX_MESSAGES,
    data: {
      type: 'chat',
      conversationId: 'test-demo',
      senderName: 'Priya Sharma',
      imageUrl: APP_NOTIFICATION_IMAGE_URL,
    },
  });

  if (res) {
    Alert.alert(
      'Notification Dispatched',
      'Test notification was sent successfully! Check your notification shade / status bar.'
    );
  } else {
    Alert.alert(
      'Permission Required',
      'Could not display notification. Please ensure Notifications are enabled in your device Settings > Apps > menext.'
    );
  }
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
      console.log('[NotificationService] Foreground FCM message received:', remoteMessage);

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

      const dedupeKey =
        remoteMessage.messageId ||
        `${remoteMessage.data?.conversationId || ''}_${body}`;
      if (isDuplicateNotification(dedupeKey)) {
        console.log('[NotificationService] Suppressed duplicate foreground FCM message:', dedupeKey);
        return;
      }

      const notifImage =
        remoteMessage.notification?.android?.imageUrl ||
        (remoteMessage.notification as any)?.imageUrl ||
        (remoteMessage.data?.imageUrl as string) ||
        APP_NOTIFICATION_IMAGE_URL;

      await displayLocalNotification({
        title,
        body,
        channelId,
        imageUrl: notifImage,
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
