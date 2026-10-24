import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

const input = z.object({
  orderId: z.string().min(1),
  sku: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(20),
  reason: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  const user = await requireUser();
  try {
    const data = input.parse(await request.json());
    const item = { sku: data.sku, quantity: data.quantity, reason: data.reason };
    const record = {
      id: `${Date.now()}`,
      orderId: data.orderId,
      status: 'REQUESTED',
      items: [item],
      createdAt: new Date(),
    };

    const update: Record<string, unknown> = { $push: { returns: record } };
    await (await db()).collection('users').updateOne({ _id: user._id }, update);

    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid return request' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save return request' }, { status: 400 });
  }
}
