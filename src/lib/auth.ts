import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { db } from './db';
import type { Address, NotificationPreferences } from './domain';

export type Role = 'CUSTOMER' | 'OWNER' | 'MANAGER' | 'FULFILLMENT' | 'MARKETING' | 'CONTENT';
export type AccountReturn = {
  id: string;
  orderId: string;
  status: string;
  items: Array<{ sku: string; quantity: number; reason: string }>;
  createdAt: Date;
};
export type AuthUser = {
  _id: ObjectId;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: Date;
  addresses?: Address[];
  defaultAddress?: Address | null;
  preferences?: NotificationPreferences;
  wishlist?: string[];
  returns?: AccountReturn[];
};
const cookieName = 'pw_session';
function secret() { const value = process.env.AUTH_SECRET; if (!value || value.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters'); return new TextEncoder().encode(value); }
export async function issueSession(user: AuthUser) {
  const token = await new SignJWT({ role: user.role, email: user.email }).setProtectedHeader({ alg: 'HS256' }).setSubject(user._id.toHexString()).setIssuedAt().setExpirationTime('7d').sign(secret());
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 86400 });
}
export async function clearSession() { (await cookies()).delete(cookieName); }
export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || !ObjectId.isValid(payload.sub)) return null;
    const user = await (await db()).collection<AuthUser>('users').findOne({ _id: new ObjectId(payload.sub) });
    return user;
  } catch { return null; }
}
export async function requireUser() { const user = await currentUser(); if (!user) redirect('/login'); return user; }
export function can(role: Role, area: string) {
  if (role === 'OWNER') return true;
  const permissions: Record<Role, string[]> = {
    OWNER: ['*'], CUSTOMER: [], MANAGER: ['products','categories','collections','orders','inventory','customers','segments','campaigns','content','media','discounts','returns','analytics'],
    FULFILLMENT: ['orders','inventory','returns'], MARKETING: ['customers','segments','campaigns','analytics','discounts'], CONTENT: ['products','categories','collections','campaigns','content','media']
  };
  return permissions[role].includes(area);
}
export async function requireAdmin(area?: string) { const user = await requireUser(); if (user.role === 'CUSTOMER' || (area && !can(user.role, area))) redirect('/account'); return user; }
