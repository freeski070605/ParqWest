import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

const input = z.object({ items: z.array(z.string().trim().min(1)).max(50).default([]) });

export async function GET() {
  const user = await requireUser();
  const wishlist = Array.isArray((user as unknown as { wishlist?: string[] }).wishlist) ? ((user as unknown as { wishlist?: string[] }).wishlist ?? []) : [];
  return NextResponse.json({ items: wishlist });
}

export async function POST(request: Request) {
  const user = await requireUser();
  try {
    const data = input.parse(await request.json());
    const items = Array.from(new Set(data.items)).slice(0, 50);
    await (await db()).collection('users').updateOne({ _id: user._id }, { $set: { wishlist: items, updatedAt: new Date() } });
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid wishlist request' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update wishlist' }, { status: 400 });
  }
}
