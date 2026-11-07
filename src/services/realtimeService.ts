/**
 * WHATSAPP CRM (WACRM) - Realtime WebSockets & Presence Tracker Service
 * Aligned with Section 3.3 of Master Specification
 */

import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

class RealtimeService {
    private channels: Record<string, RealtimeChannel> = {};

    /**
     * Subscribe to Live Messages Channel for an Account
     * Listens to INSERT (incoming & outgoing messages) and UPDATE (status ticks)
     */
    subscribeMessages(
        accountId: string,
        onNewMessage: (msg: any) => void,
        onUpdateMessage?: (msg: any) => void
    ): () => void {
        const channelKey = `messages:${accountId}`;
        if (this.channels[channelKey]) {
            supabase.removeChannel(this.channels[channelKey]);
        }

        const channel = supabase
            .channel(channelKey)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => onNewMessage(payload.new)
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages' },
                (payload) => {
                    if (onUpdateMessage) onUpdateMessage(payload.new);
                }
            )
            .subscribe();

        this.channels[channelKey] = channel;

        return () => {
            supabase.removeChannel(channel);
            delete this.channels[channelKey];
        };
    }

    /**
     * Subscribe to Conversations Channel for an Account
     * Tracks thread updates, unread counters, assignments, and status changes
     */
    subscribeConversations(
        accountId: string,
        onConversationChange: (conv: any) => void
    ): () => void {
        const channelKey = `conversations:${accountId}`;
        if (this.channels[channelKey]) {
            supabase.removeChannel(this.channels[channelKey]);
        }

        const channel = supabase
            .channel(channelKey)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                (payload) => onConversationChange(payload.new)
            )
            .subscribe();

        this.channels[channelKey] = channel;

        return () => {
            supabase.removeChannel(channel);
            delete this.channels[channelKey];
        };
    }

    /**
     * Presence Channel: Broadcasts Online Status & Real-time Typing Indicators
     */
    trackPresence(
        accountId: string,
        userId: string,
        onPresenceSync?: (state: any) => void
    ): {
        broadcastTyping: (conversationId: string, isTyping: boolean) => Promise<void>;
        unsubscribe: () => void;
    } {
        const channelKey = `presence:${accountId}`;
        const channel = supabase.channel(channelKey);

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                if (onPresenceSync) onPresenceSync(state);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: userId,
                        online: true,
                        last_seen: new Date().toISOString(),
                    });
                }
            });

        const broadcastTyping = async (conversationId: string, isTyping: boolean) => {
            await channel.track({
                user_id: userId,
                online: true,
                typing_to: isTyping ? conversationId : null,
                last_seen: new Date().toISOString(),
            });
        };

        const unsubscribe = () => {
            supabase.removeChannel(channel);
        };

        return { broadcastTyping, unsubscribe };
    }
}

export const realtimeService = new RealtimeService();

