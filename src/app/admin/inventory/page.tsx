import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { InventoryWorkspace } from '@/components/inventory-workspace';
import type { Product } from '@/lib/domain';

export default async function InventoryPage() {
  await requireAdmin('inventory');
  const products = await (await db()).collection<Product>('products').find({}).sort({ updatedAt: -1 }).toArray();

  const rows = products.flatMap((product) => product.variants.map((variant) => {
    const onHand = variant.inventory;
    const reserved = variant.reserved ?? 0;
    const available = onHand - reserved;
    const status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = onHand <= 0 ? 'OUT OF STOCK' : available <= 5 ? 'LOW STOCK' : 'IN STOCK';

    return {
      productId: product._id.toHexString(),
      productName: product.name,
      slug: product.slug,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      onHand,
      reserved,
      available,
      lowStockThreshold: 5,
      status,
    };
  }));

  return (
    <>
      <span className="eyebrow">Command Center / Inventory</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Inventory.</h1>
      </div>
      <p className="muted">Track on-hand inventory, reservations, low-stock risk, and operational adjustments.</p>
      <InventoryWorkspace initialRows={rows} />
    </>
  );
}
