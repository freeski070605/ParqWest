import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { money, type Order } from '@/lib/domain';

export default async function Account() {
  const user = await requireUser();
  const [orders, wishlist] = await Promise.all([
    (await db()).collection<Order>('orders').find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).toArray(),
    Array.isArray((user as unknown as { wishlist?: string[] }).wishlist) ? ((user as unknown as { wishlist?: string[] }).wishlist ?? []) : [],
  ]);

  return (
    <>
      <span className="eyebrow">Your PARQ WEST</span>
      <h1 className="display" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Hello, {user.name}.</h1>
      <p className="muted">Track orders, preferences, wishlist items, and shipping details from one place.</p>
      <div className="admin-grid" style={{ marginTop: '2rem' }}>
        <div className="admin-card"><span className="eyebrow">Orders</span><p style={{ fontSize: '2rem', margin: 0 }}>{orders.length}</p></div>
        <div className="admin-card"><span className="eyebrow">Wishlist</span><p style={{ fontSize: '2rem', margin: 0 }}>{wishlist.length}</p></div>
        <div className="admin-card"><span className="eyebrow">Spend</span><p style={{ fontSize: '2rem', margin: 0 }}>{money(orders.reduce((total, order) => total + order.subtotal, 0))}</p></div>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Link className="btn" href="/account/orders">View orders</Link>
        <Link className="btn secondary" href="/account/wishlist" style={{ marginLeft: '1rem' }}>View wishlist</Link>
      </div>
    </>
  );
}
