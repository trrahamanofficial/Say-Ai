import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SayAiLogo } from './Logo';

export const AuthView: React.FC<{ onGuest: () => void }> = ({ onGuest }) => {
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setMessage('Authentication is not configured. Guest Mode is available.'); return; }
    setBusy(true); setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
        if (error) throw error;
        setMessage(data.session ? 'Account created. Signing you in…' : 'Account created. Check your email to confirm, then sign in.');
        if (data.session) return;
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setMessage('Signed in successfully.');
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not authenticate. Please try again.'); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-[#f4f7fb] text-slate-900">
    <section className="w-full max-w-md rounded-[28px] bg-white border border-slate-200 shadow-xl p-7">
      <div className="flex justify-center mb-6"><SayAiLogo size="lg" showSubtitle={false} /></div>
      <h1 className="text-2xl font-extrabold text-center">{mode === 'signin' ? 'Welcome back' : 'Create your SAY AI account'}</h1>
      <p className="text-sm text-slate-500 text-center mt-2 mb-6">Sign in securely with your SAY AI account.</p>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && <label className="block text-sm font-semibold">Full name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Your name"/></label>}
        <label className="block text-sm font-semibold">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" placeholder="you@example.com"/></label>
        <label className="block text-sm font-semibold">Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" placeholder="At least 6 characters"/></label>
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3">{busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
      </form>
      {message && <p role="status" className="mt-4 text-sm text-center text-slate-600 break-words">{message}</p>}
      <button onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('');}} className="w-full mt-5 text-sm font-semibold text-indigo-700">{mode==='signin' ? 'New here? Create an account' : 'Already registered? Sign in'}</button>
      <div className="border-t border-slate-200 mt-5 pt-5"><button onClick={onGuest} className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700">Continue as Guest</button></div>
    </section>
  </main>;
};
