import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AccountReturns } from '@/components/account-returns';
import type { Order } from '@/lib/domain';

type StoredReturn = {
  id: string;
  orderId: string;
  status: string;
  items: Array<{ sku: string; quantity: number; reason: string }>;
  createdAt: string;
};

export default async function ReturnsPage() {
  const user = await requireUser();
  const orders = await (await db()).collection<Order>('orders').find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).toArray();
  const orderSummary = orders.map((order) => ({
    id: order._id.toHexString(),
    number: order.number,
    items: order.items.map((item) => ({ sku: item.sku, name: item.name, quantity: item.quantity })),
  }));
  const returns = Array.isArray((user as unknown as { returns?: StoredReturn[] }).returns)
    ? ((user as unknown as { returns?: StoredReturn[] }).returns ?? []).map((entry) => ({
        ...entry,
        createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : new Date().toISOString(),
      }))
    : [];

  return (
    <>
      <span className="eyebrow">Account / Returns</span>
      <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Returns.</h1>
      <AccountReturns initialReturns={returns} orderSummary={orderSummary} />
    </>
  );
}
