import { supabase, authService } from './supabase';

export interface UserProfileStatus {
  status?: string | null;
  expiry_date?: string | null;
  email?: string | null;
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
 * Strict fail-closed user access check:
 * 1. User must be authenticated or have identified email
 * 2. Status MUST be strictly 'active'
 * 3. Expiry date MUST be set and NOT exceeded (must be in the future)
 */
export function checkUserAccess(
  user: any | null | undefined,
  profile?: UserProfileStatus | null
): UserAccessResult {
  const userEmail = profile?.email || user?.email || null;

  if (!user && !userEmail) {
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
    (user?.user_metadata?.status as string | null | undefined) ??
    'inactive';
  const status = typeof rawStatus === 'string' ? rawStatus.trim().toLowerCase() : 'inactive';

  // 2. Resolve expiry date
  const expiryDate =
    (profile?.expiry_date as string | null | undefined) ??
    (user?.user_metadata?.expiry_date as string | null | undefined) ??
    null;

  // 3. Strict Check: Status must be 'active'
  if (status !== 'active') {
    return {
      isAllowed: false,
      reason: 'inactive',
      message: 'Your account is currently inactive. Please contact the administrator to activate your account.',
      status,
      expiryDate,
      email: userEmail,
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
      email: userEmail,
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
      email: userEmail,
    };
  }

  return {
    isAllowed: true,
    reason: null,
    message: 'Access granted.',
    status,
    expiryDate,
    email: userEmail,
  };
}

/**
 * Queries current user's profile directly from Supabase PostgreSQL database.
 * Executes instantaneously (<50ms) without hanging on remote web SSR endpoints.
 * Supports query by user_id and email fallback.
 */
export async function verifyCurrentUserAccess(userEmail?: string | null): Promise<UserAccessResult> {
  try {
    const user = await authService.getCurrentUser();
    const effectiveEmail = user?.email || (userEmail ? userEmail.trim().toLowerCase() : null);

    let profileData: UserProfileStatus | null = null;

    // 1. Attempt query by user_id
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('status, expiry_date, email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          profileData = data;
        }
      } catch (err) {
        console.warn('Profiles query by user_id failed:', err);
      }
    }

    // 2. Fallback query by email if profile was not resolved by user_id
    if (!profileData && effectiveEmail) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('status, expiry_date, email')
          .eq('email', effectiveEmail)
          .maybeSingle();

        if (!error && data) {
          profileData = data;
        }
      } catch (err) {
        console.warn('Profiles query by email failed:', err);
      }
    }

    // If neither session nor email is available, fail closed
    if (!user && !effectiveEmail) {
      return {
        isAllowed: false,
        reason: 'unauthenticated',
        message: 'No active session found.',
        status: 'unauthenticated',
        expiryDate: null,
        email: null,
      };
    }

    const access = checkUserAccess(user || { email: effectiveEmail }, profileData);
    return {
      ...access,
      email: effectiveEmail || access.email,
    };
  } catch (err: any) {
    console.warn('verifyCurrentUserAccess error:', err?.message);
    return {
      isAllowed: false,
      reason: 'inactive',
      message: 'Failed to resolve account status. Please contact support.',
      status: 'error',
      expiryDate: null,
      email: userEmail || null,
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
