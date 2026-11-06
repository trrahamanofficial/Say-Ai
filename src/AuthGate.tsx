import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { AppShell } from './App';
import type { UserProfile } from './types';

type AuthMode = 'login' | 'signup';

const emptyProfile = (id: string, email: string, name: string, role: 'user' | 'admin' = 'user'): UserProfile => ({
  id,
  email,
  name: name || 'SAY AI User',
  role,
  plan: 'Free',
  avatarUrl: '',
  stats: { chatUsed: 0, chatLimit: 50, imagesUsed: 0, imagesLimit: 20, voiceUsed: 0, voiceLimit: 30 },
  appearance: { theme: 'dark', brightness: 80 }
});

async function loadProfile(userId: string, email: string, metadata: Record<string, unknown> = {}) {
  if (!supabase) return emptyProfile(userId, email, String(metadata.full_name || metadata.name || 'SAY AI User'));
  // This project uses public.profiles. Avoid querying the non-existent users_profiles table.
  // Do not keep the entire app on the security-check screen if the profile query is slow.
  const profileRequest = supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  const profileResult = await Promise.race([
    profileRequest,
    new Promise< never >((_, reject) => window.setTimeout(() => reject(new Error('Profile lookup timed out')), 5000))
  ]).catch(() => ({ data: null, error: null }));
  const row = profileResult.data;
  // Keep the owner account recognized even if the profiles SELECT policy hides the row from the client.
  const isOwner = email.trim().toLowerCase() === 'trrahaman.official0.6@gmail.com';
  const role = String(row?.role || '').trim().toLowerCase() === 'admin' || isOwner ? 'admin' : 'user';
  return {
    ...emptyProfile(userId, email, String(row?.name || row?.full_name || metadata.full_name || 'SAY AI User'), role),
    plan: row?.plan === 'Pro' || row?.plan === 'Enterprise' ? row.plan : 'Free',
    avatarUrl: row?.avatar_url || '',
    stats: {
      chatUsed: Number(row?.chat_used || 0), chatLimit: Number(row?.chat_limit || 50),
      imagesUsed: Number(row?.images_used || 0), imagesLimit: Number(row?.images_limit || 20),
      voiceUsed: Number(row?.voice_used || 0), voiceLimit: Number(row?.voice_limit || 30)
    }
  } as UserProfile;
}

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) { setBusy(false); return; }
    let mounted = true;
    Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('Session check timed out')), 7000))
    ]).then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (!data.session) setBusy(false);
    }).catch(() => {
      if (mounted) { setSession(null); setBusy(false); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let active = true;
    async function resolve() {
      if (!session?.user) { setProfile(null); setBusy(false); return; }
      setBusy(true);
      const next = await loadProfile(session.user.id, session.user.email || '', session.user.user_metadata || {});
      if (active) { setProfile(next); setBusy(false); }
    }
    resolve();
    return () => { active = false; };
  }, [session]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: fullName.trim() || 'SAY AI User' } }
        });
        if (error) throw error;
        if (!data.session) setMessage('Account created. Please check your email to confirm, then sign in.');
        else setMessage('Account created successfully.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally { setBusy(false); }
  };

  const signInWithGoogle = async () => {
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
          queryParams: { access_type: 'offline', prompt: 'select_account' }
        }
      });
      if (error) throw error;
      // Explicitly navigate when the OAuth URL is returned; this avoids leaving
      // embedded browsers on the local loading screen after the provider handoff.
      if (data?.url) window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
      setBusy(false);
    }
  };

  const signOut = async () => { await supabase?.auth.signOut(); setProfile(null); setSession(null); };

  if (!isSupabaseConfigured || !supabase) {
    return <AuthMessage title="SAY AI setup required" detail="Supabase is not configured in this deployment. Add the Supabase project URL and publishable key to the Cloudflare Pages environment, then rebuild the site." />;
  }
  // Keep the account/session check invisible: no blocking "Checking your secure account" screen.
  if (busy) return <div className="min-h-screen bg-[#050614]" aria-hidden="true" />;
  if (session?.user && profile) {
    const isAdmin = profile.role === 'admin';
    const expectedPath = isAdmin ? '/admin' : '/';
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    if (currentPath !== expectedPath) window.history.replaceState({}, '', expectedPath);
    return <AppShell profile={profile} onSignOut={signOut} adminMode={isAdmin} />;
  }

  return (
    <div className="min-h-screen bg-[#050614] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#0a0e2a]/90 p-6 sm:p-8 shadow-[0_0_45px_rgba(139,92,246,0.18)]">
        <div className="text-center mb-7">
          <div className="text-3xl font-black tracking-wide">SAY <span className="text-purple-400">AI</span></div>
          <p className="text-slate-400 text-sm mt-2">Your personal AI universe</p>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-[#050614] p-1 mb-6">
          <button onClick={() => { setMode('login'); setMessage(''); }} className={`rounded-lg py-2.5 text-sm font-semibold ${mode === 'login' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Login</button>
          <button onClick={() => { setMode('signup'); setMessage(''); }} className={`rounded-lg py-2.5 text-sm font-semibold ${mode === 'signup' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sign Up</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && <label className="block text-sm text-slate-300">Full name<input value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" className="mt-1 w-full rounded-xl border border-purple-900/50 bg-[#050614] px-4 py-3 text-white outline-none focus:border-purple-500" placeholder="Your name" /></label>}
          <label className="block text-sm text-slate-300">Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="mt-1 w-full rounded-xl border border-purple-900/50 bg-[#050614] px-4 py-3 text-white outline-none focus:border-purple-500" placeholder="you@example.com" /></label>
          <label className="block text-sm text-slate-300">Password<input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className="mt-1 w-full rounded-xl border border-purple-900/50 bg-[#050614] px-4 py-3 text-white outline-none focus:border-purple-500" placeholder="At least 6 characters" /></label>
          <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Login to SAY AI'}</button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-purple-900/60" /><span>OR</span><span className="h-px flex-1 bg-purple-900/60" /></div>
        <button type="button" onClick={signInWithGoogle} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-600/70 bg-white py-3 font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-60">
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.9 6-15Z"/><path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4.1 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"/><path fill="#4CAF50" d="M12.8 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18l6.9-5.2Z"/><path fill="#1976D2" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.9 15l6.9 5.2c1.6-4.7 6-8.1 11.2-8.1Z"/></svg>
          Continue with Google
        </button>
        {message && <p className="mt-4 rounded-xl border border-purple-500/20 bg-purple-950/30 p-3 text-sm text-slate-200">{message}</p>}
        <p className="mt-6 text-center text-xs text-slate-500">Secure sign-in powered by Supabase</p>
      </div>
    </div>
  );
}

function AuthMessage({ title, detail, action, onAction, onSignOut }: { title: string; detail: string; action?: string; onAction?: () => void; onSignOut?: () => void }) {
  return <div className="min-h-screen bg-[#050614] text-white flex items-center justify-center p-5"><div className="max-w-md w-full rounded-3xl border border-purple-500/30 bg-[#0a0e2a] p-7 text-center"><h1 className="text-2xl font-bold">{title}</h1><p className="text-slate-300 text-sm mt-3">{detail}</p>{action && <button onClick={onAction} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-semibold">{action}</button>}{onSignOut && <button onClick={onSignOut} className="mt-3 block w-full text-sm text-slate-400">Sign out</button>}</div></div>;
}
