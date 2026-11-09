import { API_CONFIG } from '../config/api';
import { authService } from './supabase';

export interface SendMessagePayload {
  conversation_id?: string;
  contact_id?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'template' | 'interactive' | 'order' | 'location';
  content_text?: string;
  media_url?: string;
  filename?: string;
  reply_to_message_id?: string;
  template_name?: string;
  template_language?: string;
  template_params?: string[];
  template_message_params?: any;
  interactive_payload?: any;
}

export interface QuickReplyItem {
  id: string;
  title: string;
  content_text: string;
  category?: string;
}

export interface CatalogProduct {
  id: string;
  retailer_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  availability: string;
  category?: string;
}

export interface CommerceOrder {
  id: string;
  conversation_id: string;
  order_reference: string;
  status: 'pending' | 'processing' | 'paid' | 'completed' | 'cancelled';
  currency: string;
  total_amount: number;
  items: Array<{
    retailer_id: string;
    name: string;
    quantity: number;
    item_price: number;
    currency: string;
  }>;
  customer_note?: string;
  contact?: {
    id: string;
    name: string;
    phone: string;
  };
  created_at: string;
}

class BackendApiService {
  private async getHeaders(): Promise<Record<string, string>> {
    const session = await authService.getSession();
    const token = session?.access_token || authService.getSessionToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: API_CONFIG.SUPABASE_ANON_KEY,
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      // Pass Supabase SSR cookie headers for Next.js API route handlers
      const projectRef = 'hvgiyzdunzjjnmmiwsis';
      const sessionObj = session || {
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
      };
      headers.Cookie = `sb-${projectRef}-auth-token=${encodeURIComponent(JSON.stringify(sessionObj))}; sb-access-token=${token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null; status: number }> {
    try {
      const headers = await this.getHeaders();
      const url = `${API_CONFIG.API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      const text = await response.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      if (!response.ok) {
        return {
          data: null,
          error: new Error(parsed?.error || parsed?.message || `HTTP ${response.status}`),
          status: response.status,
        };
      }

      return { data: parsed as T, error: null, status: response.status };
    } catch (err: any) {
      return {
        data: null,
        error: new Error(err?.message || 'Network request failed'),
        status: 0,
      };
    }
  }

  // SCREEN 4 & 5: SEND MESSAGE & MEDIA
  async sendWhatsAppMessage(payload: SendMessagePayload) {
    return this.request<{ success: boolean; message_id?: string; message?: any }>(
      '/whatsapp/send',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  // SCREEN 4: EMOJI REACTIONS
  async reactToMessage(messageId: string, emoji: string) {
    return this.request<{ success: boolean }>(
      '/whatsapp/react',
      {
        method: 'POST',
        body: JSON.stringify({ message_id: messageId, emoji }),
      }
    );
  }

  // SCREEN 5: QUICK REPLIES
  async getQuickReplies() {
    return this.request<{ quick_replies: QuickReplyItem[] }>(
      '/quick-replies',
      { method: 'GET' }
    );
  }

  // SCREEN 5: AI DRAFT
  async getAIDraft(conversationId: string) {
    return this.request<{ draft: string }>(
      '/ai/draft',
      {
        method: 'POST',
        body: JSON.stringify({ conversation_id: conversationId }),
      }
    );
  }

  // SCREEN 7: AI AUTO-REPLY TOGGLE
  async setAIAutoReply(conversationId: string, paused: boolean, assignToMe = false) {
    return this.request<{ success: boolean }>(
      `/ai/autoreply/${conversationId}`,
      {
        method: 'POST',
        body: JSON.stringify({ paused, assign_to_me: assignToMe }),
      }
    );
  }

  // SCREEN 6: CONTACT TAGS
  async addContactTag(contactId: string, tagId: string) {
    return this.request<{ success: boolean }>(
      `/contacts/${contactId}/tags`,
      {
        method: 'POST',
        body: JSON.stringify({ tag_id: tagId }),
      }
    );
  }

  async removeContactTag(contactId: string, tagId: string) {
    return this.request<{ success: boolean }>(
      `/contacts/${contactId}/tags`,
      {
        method: 'DELETE',
        body: JSON.stringify({ tag_id: tagId }),
      }
    );
  }

  // SCREEN 10: BROADCASTS
  async createBroadcast(data: {
    name: string;
    template_name: string;
    template_language?: string;
    recipients: Array<{ to: string; params?: string[] }>;
  }) {
    return this.request<{ success: boolean; broadcast_id: string }>(
      '/v1/broadcasts',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getBroadcastStatus(broadcastId: string) {
    return this.request<any>(
      `/v1/broadcasts/${broadcastId}`,
      { method: 'GET' }
    );
  }

  // SCREEN 12: AI ASSISTANT CONFIG & PLAYGROUND
  async getAIConfig() {
    return this.request<{
      configured: boolean;
      provider?: string;
      model?: string;
      base_url?: string | null;
      system_prompt?: string | null;
      is_active?: boolean;
      auto_reply_enabled?: boolean;
      auto_reply_max_per_conversation?: number;
      handoff_agent_id?: string | null;
      has_key?: boolean;
      has_embeddings_key?: boolean;
    }>('/ai/config', { method: 'GET' });
  }

  async saveAIConfig(body: any) {
    return this.request<{ success: boolean }>('/ai/config', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteAIConfig() {
    return this.request<{ success: boolean }>('/ai/config', {
      method: 'DELETE',
    });
  }

  async testAIKey(body: {
    provider: string;
    model: string;
    api_key?: string;
    base_url?: string;
  }) {
    return this.request<{ success: boolean; latency_ms?: number; message?: string }>('/ai/test', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async testAIPlayground(message: string) {
    return this.sendAIPlayground([{ role: 'user', content: message }]);
  }

  async sendAIPlayground(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
    return this.request<{ reply: string; handoff?: boolean }>('/ai/playground', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async getAIKnowledge() {
    return this.request<{
      documents: Array<{
        id: string;
        title: string;
        updated_at: string;
        content?: string;
      }>;
    }>('/ai/knowledge', { method: 'GET' });
  }

  async createAIKnowledge(title: string, content: string) {
    return this.request<{ success: boolean; id: string; warning?: string }>('/ai/knowledge', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  async updateAIKnowledge(id: string, title: string, content: string) {
    return this.request<{ success: boolean; warning?: string }>(`/ai/knowledge/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, content }),
    });
  }

  async deleteAIKnowledge(id: string) {
    return this.request<{ success: boolean }>(`/ai/knowledge/${id}`, {
      method: 'DELETE',
    });
  }

  async getAIUsage(days = 30) {
    return this.request<{
      window_days: number;
      truncated: boolean;
      totals: {
        calls: number;
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
      by_mode: {
        auto_reply: { calls: number; tokens: number };
        draft: { calls: number; tokens: number };
      };
      by_model: Array<{
        model: string;
        provider: string;
        calls: number;
        tokens: number;
      }>;
      daily: Array<{
        date: string;
        tokens: number;
        calls: number;
      }>;
    }>(`/ai/usage?days=${days}`, { method: 'GET' });
  }

  // FLOWS API (matches web project /api/flows)
  async getFlows() {
    return this.request<{ flows: any[] }>('/flows', { method: 'GET' });
  }

  async getFlowTemplates() {
    return this.request<{
      templates: Array<{
        slug: string;
        name: string;
        description: string;
        icon: string;
        trigger_type: string;
        node_count: number;
      }>;
    }>('/flows/templates', { method: 'GET' });
  }

  async createFlow(body: {
    name?: string;
    description?: string;
    trigger_type?: string;
    trigger_config?: any;
    template_slug?: string;
  }) {
    return this.request<{ flow: any }>('/flows', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteFlow(id: string) {
    return this.request<{ success: boolean }>(`/flows/${id}`, {
      method: 'DELETE',
    });
  }

  async activateFlow(id: string, status: 'active' | 'draft' | 'archived') {
    return this.request<{ success: boolean; status: string }>(`/flows/${id}/activate`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // SCREEN 14: TEAM MEMBERS & ROLES
  async getTeamMembers() {
    return this.request<
      Array<{
        user_id: string;
        full_name: string;
        email: string;
        role: string;
        joined_at: string;
      }>
    >('/account/members', { method: 'GET' });
  }

  async createTeamInvitation(role: string, label?: string) {
    return this.request<{
      invitation: any;
      token: string;
      url: string;
    }>('/account/invitations', {
      method: 'POST',
      body: JSON.stringify({ role, label }),
    });
  }

  // SCREEN 15: WHATSAPP COMMERCE & META CATALOG
  async getCatalogProducts(limit = 50, search = '') {
    const q = search ? `&q=${encodeURIComponent(search)}` : '';
    return this.request<{ products: CatalogProduct[]; count: number }>(
      `/whatsapp/catalog/products?limit=${limit}${q}`,
      { method: 'GET' }
    );
  }

  async sendCatalogProduct(payload: {
    conversation_id: string;
    catalog_kind: 'product' | 'product_list' | 'catalog_message';
    product_retailer_id?: string;
    product_name?: string;
    product_price?: number;
    product_currency?: string;
    header_text?: string;
    body_text?: string;
    footer_text?: string;
    sections?: any[];
  }) {
    return this.request<{ success: boolean }>(
      '/whatsapp/catalog/send',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async syncMetaCatalog() {
    return this.request<{ success: boolean; synced: number; message: string }>(
      '/whatsapp/catalog/sync',
      { method: 'POST' }
    );
  }

  // SCREEN 16: COMMERCE ORDERS & PAYMENT
  async getCommerceOrders(status = 'all') {
    return this.request<{
      orders: CommerceOrder[];
      metrics: {
        totalRevenue: number;
        pendingCount: number;
        paidCount: number;
        totalOrders: number;
      };
    }>(`/whatsapp/commerce/orders?status=${status}`, { method: 'GET' });
  }

  async sendPaymentLink(orderId: string) {
    return this.request<{
      success: boolean;
      payment_url: string;
      provider: string;
      sent_to_whatsapp: boolean;
    }>(`/whatsapp/commerce/orders/${orderId}/pay-link`, { method: 'POST' });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request<{ success: boolean }>(
      `/whatsapp/commerce/orders/${orderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  }
}

export const backendApi = new BackendApiService();
