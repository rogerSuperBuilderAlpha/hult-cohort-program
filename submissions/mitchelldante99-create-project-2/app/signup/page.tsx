'use client';
import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function SignupPage(){
 const supabase=createClient(); const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false); const [done,setDone]=useState(false);
 const submit=async(e:FormEvent)=>{e.preventDefault();setLoading(true);setError('');const {error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name}}});if(error)setError(error.message);else setDone(true);setLoading(false)};
 if(done)return <main className="auth-page"><div className="auth-card"><div className="auth-logo"><Sparkles/></div><h1>Check your email</h1><p>Your Hult Hub account was created. Confirm your email, then sign in.</p><Link className="auth-submit auth-link" href="/login">Go to sign in</Link></div></main>;
 return <main className="auth-page"><div className="auth-card"><div className="auth-logo"><Sparkles/></div><h1>Join Hult Hub</h1><p>Create your cohort account and start collaborating.</p><form onSubmit={submit}><label>Display name<input value={name} onChange={e=>setName(e.target.value)} required placeholder="Your name"/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required placeholder="At least 6 characters"/></label>{error&&<div className="auth-error">{error}</div>}<button className="auth-submit" disabled={loading}>{loading?'Creating account…':'Create account'}</button></form><div className="auth-switch">Already a member? <Link href="/login">Sign in</Link></div></div></main>
}
