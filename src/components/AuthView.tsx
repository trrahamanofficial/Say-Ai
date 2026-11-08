import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SayAiLogo } from './Logo';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const AuthView: React.FC<{ onGuest: () => void }> = ({ onGuest }) => {
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !supabase) return;
    let active = true;
    const complete = async (url: string) => {
      try {
        const callback = new URL(url);
        const error = callback.searchParams.get('error_description') || callback.searchParams.get('error');
        if (error) throw new Error(error);
        const code = callback.searchParams.get('code');
        if (!code) return;
        setBusy(true);
        await Browser.close().catch(() => undefined);
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
      } catch (err) {
        if (active) setMessage(err instanceof Error ? err.message : 'Google sign-in could not be completed.');
      } finally {
        if (active) setBusy(false);
      }
    };
    let listener: { remove: () => Promise<void> } | undefined;
    void CapacitorApp.addListener('appUrlOpen', ({ url }) => { void complete(url); }).then(value => { listener = value; });
    void CapacitorApp.getLaunchUrl().then(result => { if (result?.url) void complete(result.url); });
    return () => { active = false; void listener?.remove(); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setMessage('Secure sign-in is not configured. Please contact the app administrator.'); return; }
    setBusy(true); setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } }
        });
        if (error) throw error;
        setMessage(data.session ? 'Account created. Signing you in…' : 'Account created. Check your email to confirm, then sign in.');
        if (!data.session) setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not authenticate. Please try again.');
    } finally { setBusy(false); }
  };

  const signInWithGoogle = async () => {
    if (!supabase) { setMessage('Google sign-in is not configured.'); return; }
    setBusy(true); setMessage('');
    try {
      const native = Capacitor.isNativePlatform();
      const redirectTo = native
        ? 'com.trofficial.sayai://login-callback'
        : window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          ...(native ? { skipBrowserRedirect: true } : {}),
          queryParams: { access_type: 'offline', prompt: 'select_account' }
        }
      });
      if (error) throw error;
      if (!data.url) throw new Error('Google sign-in link could not be created.');
      if (native) {
        await Browser.open({ url: data.url, presentationStyle: 'popover' });
        setBusy(false);
      } else {
        window.location.assign(data.url);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <main className="sayai-auth min-h-screen w-full flex items-center justify-center px-4 py-8">
      <section className="sayai-auth-card w-full max-w-md rounded-[30px] p-6 sm:p-8">
        <div className="flex justify-center mb-6"><SayAiLogo size="xl" showSubtitle={false} /></div>
        <p className="text-center text-xs font-bold uppercase tracking-[.22em] text-cyan-700 mb-2">Your personal AI workspace</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="text-sm text-center text-slate-500 mt-2 mb-6">Sign in to continue to SAY AI.</p>
        <button type="button" disabled={busy} onClick={signInWithGoogle} className="sayai-google-button w-full rounded-2xl py-3.5 flex items-center justify-center gap-3 font-bold text-slate-800 disabled:opacity-60">
          <svg viewBox="0 0 48 48" aria-hidden="true" className="w-5 h-5"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"/><path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9V33c3.4 6.7 10.3 11 18.1 11Z"/><path fill="#4CAF50" d="M12.8 27.7a12 12 0 0 1 0-7.4v-5.3H5.9a20 20 0 0 0 0 18Z"/><path fill="#1976D2" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4 16.2 4 9.3 8.3 5.9 15l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2Z"/></svg>
          <span>{busy ? 'Please wait…' : 'Continue with Google'}</span>
        </button>
        <div className="sayai-auth-divider flex items-center gap-3 my-5"><span className="h-px flex-1"/><span className="text-xs text-slate-400 font-semibold">OR CONTINUE WITH EMAIL</span><span className="h-px flex-1"/></div>
        <form onSubmit={submit} className="space-y-3.5">
          {mode === 'signup' && <label className="block text-sm font-semibold text-slate-700">Full name<input required value={name} onChange={e=>setName(e.target.value)} className="sayai-auth-input mt-1.5 w-full rounded-xl px-4 py-3" placeholder="Your name"/></label>}
          <label className="block text-sm font-semibold text-slate-700">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="sayai-auth-input mt-1.5 w-full rounded-xl px-4 py-3" placeholder="you@example.com"/></label>
          <label className="block text-sm font-semibold text-slate-700">Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="sayai-auth-input mt-1.5 w-full rounded-xl px-4 py-3" placeholder="At least 6 characters"/></label>
          <button disabled={busy} className="sayai-primary-button w-full rounded-xl py-3.5 text-white font-bold disabled:opacity-60">{busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
        </form>
        {message && <p role="status" className="mt-4 text-sm text-center text-slate-600 break-words">{message}</p>}
        <button onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('');}} className="w-full mt-5 text-sm font-semibold text-blue-700">{mode==='signin' ? 'New here? Create an account' : 'Already registered? Sign in'}</button>
        <div className="border-t border-slate-200 mt-5 pt-5">
          <button onClick={onGuest} className="sayai-guest-button w-full rounded-xl py-3.5 text-sm font-bold">Continue with Guest</button>
          <p className="text-center text-[11px] text-slate-400 mt-3">Guest sessions stay on this device and do not use a signed-in account.</p>
        </div>
      </section>
    </main>
  );
};
