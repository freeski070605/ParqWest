import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { categorySchema } from '@/lib/domain';

export async function POST(request: Request) {
  await requireAdmin('categories');

  try {
    const data = categorySchema.parse(await request.json());
    const d = await db();
    const result = await d.collection('categories').insertOne({
      _id: new ObjectId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true, id: result.insertedId.toHexString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid category payload' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save category' }, { status: 400 });
  }
}
