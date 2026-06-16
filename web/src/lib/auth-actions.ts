"use server";
import {redirect} from 'next/navigation';
import {setUserCookie, clearUserCookie, SessionUser, UserRole} from './auth';

export async function login(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const role = String(formData.get('role') || '') as UserRole;
  if (!name || !email || !role) {
    throw new Error('Missing fields');
  }
  const user: SessionUser = {name, email, role};
  setUserCookie(user);
  redirect('/dashboard');
}

export async function logout() {
  clearUserCookie();
  redirect('/login');
}
