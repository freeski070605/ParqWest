'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
export function AuthForm({ mode }: { mode:'login'|'register' }) {
  const [error,setError]=useState('');const [pending,setPending]=useState(false);const router=useRouter();
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setPending(true);setError('');const data=Object.fromEntries(new FormData(e.currentTarget));try{const response=await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});const body=await response.json();if(!response.ok)throw new Error(body.error);router.push(body.role && body.role!=='CUSTOMER'?'/admin':'/account');router.refresh();}catch(err){setError(err instanceof Error?err.message:'Please try again.')}finally{setPending(false)}}
  return <form onSubmit={submit}>{mode==='register' && <label className="field">Name<input name="name" required minLength={2}/></label>}<label className="field">Email<input name="email" type="email" required autoComplete="email"/></label><label className="field">Password<input name="password" type="password" required minLength={mode==='register'?12:1} autoComplete={mode==='register'?'new-password':'current-password'}/></label><button className="btn" disabled={pending}>{pending?'Please wait…':mode==='register'?'Create account':'Sign in'}</button><p role="alert">{error}</p></form>;
}
