import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

const input = z.object({
  preferences: z.object({
    emailMarketing: z.boolean().default(false),
    smsMarketing: z.boolean().default(false),
    restockAlerts: z.boolean().default(false),
    orderUpdates: z.boolean().default(true),
  }).default({
    emailMarketing: false,
    smsMarketing: false,
    restockAlerts: false,
    orderUpdates: true,
  }),
});

export async function PUT(request: Request) {
  const user = await requireUser();
  try {
    const { preferences } = input.parse(await request.json());
    await (await db()).collection('users').updateOne({ _id: user._id }, { $set: { preferences, updatedAt: new Date() } });
    return NextResponse.json({ ok: true, preferences });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid preference payload' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update preferences' }, { status: 400 });
  }
}
