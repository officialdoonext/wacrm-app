import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

// Persistent storage provider for React Native sessions with in-memory mirroring
const memoryStore: Record<string, string> = {};

const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) {
        memoryStore[key] = val;
        return val;
      }
    } catch {
      // Fallback to memory store if native storage access fails
    }
    return memoryStore[key] || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStore[key] = value;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    delete memoryStore[key];
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
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
    try {
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(
        (k) => k.startsWith('sb-') || k.includes('supabase.auth.token')
      );
      if (authKeys.length > 0) {
        if (typeof (AsyncStorage as any).removeMany === 'function') {
          await (AsyncStorage as any).removeMany(authKeys);
        } else {
          await Promise.all(authKeys.map((k) => AsyncStorage.removeItem(k)));
        }
      }
    } catch {
      // ignore
    }
  }
}

export const authService = new AuthService();
