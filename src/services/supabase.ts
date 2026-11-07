import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { API_CONFIG } from '../config/api';

// Lightweight memory storage provider for React Native sessions
const memoryStore: Record<string, string> = {};

const customStorage = {
  getItem: (key: string): string | null => {
    return memoryStore[key] || null;
  },
  setItem: (key: string, value: string): void => {
    memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    delete memoryStore[key];
  },
};

export const supabase = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export interface UserProfile {
  id: string;
  user_id: string;
  account_id: string;
  account_role: 'owner' | 'admin' | 'agent' | 'viewer';
  full_name: string;
  email: string;
  avatar_url?: string;
  status: 'active' | 'inactive';
  expiry_date?: string | null;
}

class AuthService {
  private currentProfile: UserProfile | null = null;
  private currentSessionToken: string | null = null;

  async getSession() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      this.currentSessionToken = data.session.access_token;
    }
    return data.session;
  }

  getSessionToken(): string | null {
    return this.currentSessionToken;
  }

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  async getProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile:', error.message);
      }
      if (data) {
        this.currentProfile = data as UserProfile;
        return this.currentProfile;
      }
    } catch (err: any) {
      console.warn('Profile fetch exception:', err?.message);
    }

    // Fallback profile if record not found
    return {
      id: user.id,
      user_id: user.id,
      account_id: 'default-account',
      account_role: 'owner',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agent',
      email: user.email || '',
      status: (user.user_metadata?.status as 'active' | 'inactive') || 'inactive',
      expiry_date: user.user_metadata?.expiry_date || null,
    };
  }

  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      this.currentSessionToken = data.session.access_token;
      await this.getProfile();
    }

    return data;
  }

  async signUp(email: string, password: string, fullName: string) {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      this.currentSessionToken = data.session.access_token;
      await this.getProfile();
    }

    return data;
  }

  async signOut() {
    this.currentProfile = null;
    this.currentSessionToken = null;
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}

export const authService = new AuthService();
