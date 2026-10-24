import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

const input = z.object({
  addresses: z.array(z.object({
    id: z.string().min(1),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    company: z.string().trim().max(80).default(''),
    line1: z.string().trim().min(1),
    line2: z.string().trim().max(120).default(''),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
    postalCode: z.string().trim().min(2),
    country: z.string().trim().min(2).default('US'),
    isDefaultShipping: z.boolean().default(false),
    isDefaultBilling: z.boolean().default(false),
  })).max(10).default([]),
});

export async function PUT(request: Request) {
  const user = await requireUser();
  try {
    const { addresses } = input.parse(await request.json());
    const normalized = addresses.map((address, index) => ({ ...address, id: address.id || `address-${index}` }));
    const defaults = normalized.filter((address) => address.isDefaultShipping || address.isDefaultBilling);
    if (normalized.some((address) => address.isDefaultShipping && normalized.filter((entry) => entry.isDefaultShipping).length > 1)) {
      return NextResponse.json({ error: 'Only one shipping address can be default' }, { status: 400 });
    }
    if (normalized.some((address) => address.isDefaultBilling && normalized.filter((entry) => entry.isDefaultBilling).length > 1)) {
      return NextResponse.json({ error: 'Only one billing address can be default' }, { status: 400 });
    }
    await (await db()).collection('users').updateOne({ _id: user._id }, { $set: { addresses: normalized, defaultAddress: defaults[0] ?? null, updatedAt: new Date() } });
    return NextResponse.json({ ok: true, addresses: normalized });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid address payload' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update addresses' }, { status: 400 });
  }
}
