import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Product } from '@/lib/domain';

const input = z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i),
  sku: z.string().trim().min(1),
  delta: z.number().int(),
  reason: z.string().trim().min(1).max(80).default('ADJUSTMENT'),
}).refine((value) => value.delta !== 0, 'Inventory delta cannot be zero');

export async function POST(request: Request) {
  await requireAdmin('inventory');

  try {
    const data = input.parse(await request.json());
    const d = await db();
    const productId = new ObjectId(data.productId);
    const product = await d.collection<Product>('products').findOne({ _id: productId, 'variants.sku': data.sku });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const variant = product.variants.find((entry) => entry.sku === data.sku);
    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const nextInventory = variant.inventory + data.delta;
    if (nextInventory < variant.reserved) {
      return NextResponse.json({ error: 'On-hand inventory cannot fall below reserved inventory.' }, { status: 400 });
    }

    await d.collection<Product>('products').updateOne(
      { _id: productId, 'variants.sku': data.sku },
      { $inc: { 'variants.$.inventory': data.delta }, $set: { updatedAt: new Date() } },
    );

    await d.collection('inventoryMovements').insertOne({
      productId,
      sku: data.sku,
      delta: data.delta,
      reservedDelta: 0,
      reason: data.reason,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid inventory request' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to adjust inventory' }, { status: 400 });
  }
}
