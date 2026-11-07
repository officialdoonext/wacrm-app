import { supabase, authService } from './supabase';
import { API_CONFIG } from '../config/api';

export interface UserProfileStatus {
  status?: string | null;
  expiry_date?: string | null;
}

export type BlockReason = 'unauthenticated' | 'inactive' | 'expired' | 'no_expiry';

export interface UserAccessResult {
  isAllowed: boolean;
  reason: BlockReason | null;
  message: string;
  status: string;
  expiryDate: string | null;
  email?: string | null;
}

export const ADMIN_CONTACT_PHONE = '8143538314';
export const ADMIN_CONTACT_PHONE_INTL = '+918143538314';
export const WHATSAPP_PREFILLED_MESSAGE = 'request forenable CRM whats app automation';

/**
 * Strict fail-closed user access check matching web production specification:
 * 1. User must be authenticated
 * 2. Status MUST be strictly 'active'
 * 3. Expiry date MUST be set and NOT exceeded (must be in the future)
 */
export function checkUserAccess(
  user: any | null | undefined,
  profile?: UserProfileStatus | null
): UserAccessResult {
  if (!user) {
    return {
      isAllowed: false,
      reason: 'unauthenticated',
      message: 'Please sign in to access your account.',
      status: 'unauthenticated',
      expiryDate: null,
      email: null,
    };
  }

  // 1. Resolve status (check profile row first, fallback to user metadata, default to 'inactive')
  const rawStatus =
    (profile?.status as string | null | undefined) ??
    (user.user_metadata?.status as string | null | undefined) ??
    'inactive';
  const status = typeof rawStatus === 'string' ? rawStatus.trim().toLowerCase() : 'inactive';

  // 2. Resolve expiry date
  const expiryDate =
    (profile?.expiry_date as string | null | undefined) ??
    (user.user_metadata?.expiry_date as string | null | undefined) ??
    null;

  // 3. Strict Check: Status must be 'active'
  if (status !== 'active') {
    return {
      isAllowed: false,
      reason: 'inactive',
      message: 'Your account is currently inactive. Please contact the administrator to activate your account.',
      status,
      expiryDate,
      email: user.email,
    };
  }

  // 4. Strict Check: Expiry date must exist
  if (!expiryDate) {
    return {
      isAllowed: false,
      reason: 'no_expiry',
      message: 'Your account subscription expiry date is not configured. Please contact the administrator.',
      status,
      expiryDate: null,
      email: user.email,
    };
  }

  // 5. Strict Check: Expiry date must not be exceeded
  const expiryTimestamp = new Date(expiryDate).getTime();
  if (isNaN(expiryTimestamp) || expiryTimestamp <= Date.now()) {
    return {
      isAllowed: false,
      reason: 'expired',
      message: 'Your account subscription has expired. Please contact the administrator to renew your access.',
      status,
      expiryDate,
      email: user.email,
    };
  }

  return {
    isAllowed: true,
    reason: null,
    message: 'Access granted.',
    status,
    expiryDate,
    email: user.email,
  };
}

/**
 * Queries current user's profile directly from Supabase Postgres database
 * and performs the strict fail-closed access verification.
 */
export async function verifyCurrentUserAccess(): Promise<UserAccessResult> {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return {
        isAllowed: false,
        reason: 'unauthenticated',
        message: 'No active session found.',
        status: 'unauthenticated',
        expiryDate: null,
        email: null,
      };
    }

    let profileData: UserProfileStatus | null = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('status, expiry_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        profileData = data;
      }
    } catch {
      // fallback to metadata
    }

    // Attempt remote API check if server is reachable
    try {
      const apiRes = await fetch(`${API_CONFIG.API_BASE_URL}/account/status`, {
        headers: {
          Authorization: `Bearer ${authService.getSessionToken() || ''}`,
        },
      });
      if (apiRes.ok) {
        const remoteData = await apiRes.json();
        if (remoteData && typeof remoteData.isAllowed === 'boolean') {
          return {
            isAllowed: remoteData.isAllowed,
            reason: remoteData.reason || null,
            message: remoteData.message || (remoteData.isAllowed ? 'Access granted.' : 'Access restricted.'),
            status: remoteData.status || (profileData?.status ?? 'inactive'),
            expiryDate: remoteData.expiryDate || profileData?.expiry_date || null,
            email: user.email,
          };
        }
      }
    } catch {
      // API endpoint offline or unreachable, rely on direct Supabase check
    }

    return checkUserAccess(user, profileData);
  } catch (err: any) {
    return {
      isAllowed: false,
      reason: 'inactive',
      message: 'Failed to resolve account status. Please contact support.',
      status: 'error',
      expiryDate: null,
      email: null,
    };
  }
}

/**
 * Builds the WhatsApp direct chat link with prefilled message
 */
export function buildWhatsAppAdminUrl(userEmail?: string | null): string {
  const baseMessage = WHATSAPP_PREFILLED_MESSAGE;
  const messageWithEmail = userEmail
    ? `${baseMessage} for account: ${userEmail}`
    : baseMessage;
  const encodedText = encodeURIComponent(messageWithEmail);
  return `https://wa.me/91${ADMIN_CONTACT_PHONE}?text=${encodedText}`;
}

/**
 * Builds the direct tel: link for phone calls
 */
export function buildCallAdminUrl(): string {
  return `tel:${ADMIN_CONTACT_PHONE}`;
}

/**
 * Formats ISO date into human-readable date string (e.g. 'Nov 15, 2026')
 */
export function formatExpiryDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

