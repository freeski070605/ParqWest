import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { collectionSchema } from '@/lib/domain';

export async function POST(request: Request) {
  await requireAdmin('collections');

  try {
    const data = collectionSchema.parse(await request.json());
    const d = await db();
    const result = await d.collection('collections').insertOne({
      _id: new ObjectId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true, id: result.insertedId.toHexString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid collection payload' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save collection' }, { status: 400 });
  }
}
