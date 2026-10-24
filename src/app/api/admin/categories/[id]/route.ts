import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { categorySchema } from '@/lib/domain';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin('categories');
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
  }

  try {
    const data = categorySchema.parse(await request.json());
    const d = await db();
    await d.collection('categories').updateOne({ _id: new ObjectId(id) }, { $set: { ...data, updatedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid category payload' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update category' }, { status: 400 });
  }
}
