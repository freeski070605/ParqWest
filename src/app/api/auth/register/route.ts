import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueSession, type AuthUser } from '@/lib/auth';
const input = z.object({ name: z.string().trim().min(2).max(100), email: z.email().transform(v=>v.toLowerCase()), password: z.string().min(12).max(128) });
export async function POST(request: Request) {
  try {
    const data = input.parse(await request.json());
    const user: Omit<AuthUser,'_id'> = { name:data.name, email:data.email, passwordHash:await hash(data.password,12), role:'CUSTOMER', createdAt:new Date() };
    const result = await (await db()).collection<Omit<AuthUser,'_id'>>('users').insertOne(user);
    await issueSession({ ...user, _id:result.insertedId });
    return NextResponse.json({ ok:true });
  } catch(error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error:'Please check your name, email and password (12 characters minimum).' },{status:400});
    if (typeof error === 'object' && error && 'code' in error && error.code === 11000) return NextResponse.json({ error:'An account already exists for this email.' },{status:409});
    return NextResponse.json({ error:'Unable to create account.' },{status:500});
  }
}
