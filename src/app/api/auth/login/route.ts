import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueSession, type AuthUser } from '@/lib/auth';
const input=z.object({email:z.email().transform(v=>v.toLowerCase()),password:z.string()});
export async function POST(request:Request){try{const data=input.parse(await request.json());const user=await (await db()).collection<AuthUser>('users').findOne({email:data.email});if(!user || !await compare(data.password,user.passwordHash)) return NextResponse.json({error:'Invalid email or password.'},{status:401});await issueSession(user);return NextResponse.json({ok:true,role:user.role});}catch{return NextResponse.json({error:'Unable to sign in.'},{status:400});}}
