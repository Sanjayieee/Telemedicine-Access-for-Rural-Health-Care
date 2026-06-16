import {login} from '@/lib/auth-actions';
import {getCurrentUser, UserRole} from '@/lib/auth';
import Link from 'next/link';
import {redirect} from 'next/navigation';

const roles: {value: UserRole; label: string}[] = [
  {value: 'doctor', label: 'Doctor'},
  {value: 'health_worker', label: 'Health Worker'},
  {value: 'pharmacy', label: 'Pharmacy'},
  {value: 'admin', label: 'Admin'},
  {value: 'ngo', label: 'NGO'},
];

export default async function LoginPage() {
  const existing = await getCurrentUser();
  if (existing) redirect('/dashboard');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Swasthya Punjab</h1>
          <p className="text-sm text-muted-foreground">Demo login – pick a role to explore the dashboard.</p>
        </div>
        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input id="name" name="name" required className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="you@example.com" />
          </div>
            <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">Role</label>
            <select id="role" name="role" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="">Select a role</option>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Login</button>
        </form>
        <p className="text-[11px] text-muted-foreground text-center">This is a demo; no real authentication yet.</p>
        <p className="text-center text-xs"><Link href="/symptom-checker" className="underline">Try Symptom Checker (may require login)</Link></p>
      </div>
    </div>
  );
}
