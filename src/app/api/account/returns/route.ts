import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireUser, type AccountReturn, type AuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { returnRequestSchema, type Order } from '@/lib/domain';

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    const data = returnRequestSchema.parse(await request.json());
    if (!ObjectId.isValid(data.orderId)) {
      return NextResponse.json({ error: 'Invalid order id.' }, { status: 400 });
    }

    const d = await db();
    const order = await d.collection<Order>('orders').findOne({ _id: new ObjectId(data.orderId), userId: user._id });
    if (!order) {
      return NextResponse.json({ error: 'Order not found for this account.' }, { status: 404 });
    }

    const orderedItem = order.items.find((entry) => entry.sku === data.sku);
    if (!orderedItem) {
      return NextResponse.json({ error: 'This item was not purchased on this order.' }, { status: 400 });
    }

    const existingReturns = Array.isArray((user as unknown as { returns?: Array<{ orderId: string; items: Array<{ sku: string; quantity: number }> }> }).returns)
      ? ((user as unknown as { returns?: Array<{ orderId: string; items: Array<{ sku: string; quantity: number }> }> }).returns ?? [])
      : [];

    const alreadyReturned = existingReturns
      .filter((entry) => entry.orderId === data.orderId)
      .reduce((total, entry) => total + (entry.items
        .filter((item) => item.sku === data.sku)
        .reduce((sum, item) => sum + item.quantity, 0)), 0);

    if (alreadyReturned + data.quantity > orderedItem.quantity) {
      return NextResponse.json({ error: 'Return quantity exceeds items purchased on this order.' }, { status: 400 });
    }

    const record: AccountReturn = {
      id: new ObjectId().toHexString(),
      orderId: data.orderId,
      status: 'REQUESTED',
      items: [{ sku: data.sku, quantity: data.quantity, reason: data.reason }],
      createdAt: new Date(),
    };

    const users = d.collection<AuthUser & { returns?: AccountReturn[] }>('users');
    await users.updateOne({ _id: user._id }, { $push: { returns: record } });
    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: (error as { issues: Array<{ message: string }> }).issues[0]?.message ?? 'Invalid return request' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save return request' }, { status: 400 });
  }
}
