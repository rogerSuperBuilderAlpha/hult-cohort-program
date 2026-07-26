'use client';
import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function LoginPage(){
 const supabase=createClient(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 const submit=async(e:FormEvent)=>{e.preventDefault();setLoading(true);setError('');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else window.location.href='/';setLoading(false)};
 return <main className="auth-page"><div className="auth-card"><div className="auth-logo"><Sparkles/></div><h1>Welcome back</h1><p>Sign in to Hult Hub and join the conversation.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"/></label>{error&&<div className="auth-error">{error}</div>}<button className="auth-submit" disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><div className="auth-switch">New to the cohort? <Link href="/signup">Create an account</Link></div></div></main>
}
