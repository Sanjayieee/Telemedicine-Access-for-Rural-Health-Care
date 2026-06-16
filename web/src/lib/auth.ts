import {cookies} from 'next/headers';

export type UserRole = 'doctor' | 'health_worker' | 'pharmacy' | 'admin' | 'ngo';

export interface SessionUser {
  name: string;
  email: string;
  role: UserRole;
}

const COOKIE_NAME = 'sp_user';

export async function getCurrentUser(): Promise<SessionUser | null> {
  // Some type definitions may indicate cookies() returns a promise; handle both.
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed && parsed.role) return parsed;
  } catch (e) {
    // ignore
  }
  return null;
}

export function serializeUser(user: SessionUser) {
  return JSON.stringify(user);
}

export function setUserCookie(user: SessionUser) {
  const maybe = cookies() as any;
  const store = typeof maybe.set === 'function' ? maybe : undefined;
  store?.set?.(COOKIE_NAME, serializeUser(user), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8h
  });
}

export function clearUserCookie() {
  const maybe = cookies() as any;
  const store = typeof maybe.delete === 'function' ? maybe : undefined;
  store?.delete?.(COOKIE_NAME);
}

// Simple role -> allowed route prefixes mapping (expand as needed)
export const roleRouteMap: Record<UserRole, string[]> = {
  doctor: ['/', '/dashboard', '/patients', '/cases', '/consultations', '/prescriptions', '/records', '/pharmacy', '/schedule', '/notifications', '/symptom-checker'],
  health_worker: ['/', '/dashboard', '/patients', '/records', '/schedule', '/notifications', '/symptom-checker'],
  pharmacy: ['/', '/dashboard', '/pharmacy', '/prescriptions', '/notifications'],
  admin: ['/', '/dashboard', '/patients', '/cases', '/consultations', '/prescriptions', '/records', '/pharmacy', '/schedule', '/notifications', '/symptom-checker'],
  ngo: ['/', '/dashboard', '/cases', '/patients', '/notifications'],
};

export function isRouteAllowed(role: UserRole, path: string) {
  const prefixes = roleRouteMap[role];
  return prefixes.some(p => path === p || path.startsWith(p + '/'));
}
