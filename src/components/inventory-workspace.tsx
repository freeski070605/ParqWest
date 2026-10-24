'use client';

import { useMemo, useState } from 'react';

type InventoryRow = {
  productId: string;
  productName: string;
  slug: string;
  sku: string;
  color: string;
  size: string;
  onHand: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
};

const PAGE_SIZE = 8;

export function InventoryWorkspace({ initialRows }: { initialRows: InventoryRow[] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryRow['status']>('ALL');
  const [sortKey, setSortKey] = useState<'product' | 'available' | 'reserved' | 'onHand'>('product');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(initialRows);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = rows.filter((row) => {
      const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
      const haystack = `${row.productName} ${row.sku} ${row.color} ${row.size}`.toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesStatus && matchesQuery;
    });

    next.sort((a, b) => {
      switch (sortKey) {
        case 'available':
          return b.available - a.available;
        case 'reserved':
          return b.reserved - a.reserved;
        case 'onHand':
          return b.onHand - a.onHand;
        default:
          return a.productName.localeCompare(b.productName) || a.sku.localeCompare(b.sku);
      }
    });

    return next;
  }, [query, rows, sortKey, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function applyAdjustment(row: InventoryRow, delta: number, reason: string) {
    const response = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: row.productId, sku: row.sku, delta, reason }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to adjust stock');
    setRows((list) => list.map((item) => {
      if (item.productId !== row.productId || item.sku !== row.sku) return item;
      const nextOnHand = item.onHand + delta;
      const nextAvailable = Math.max(0, nextOnHand - item.reserved);
      const nextStatus = nextOnHand <= 0 ? 'OUT OF STOCK' : nextAvailable <= item.lowStockThreshold ? 'LOW STOCK' : 'IN STOCK';
      return { ...item, onHand: nextOnHand, available: nextAvailable, status: nextStatus };
    }));
  }

  return (
    <div className="admin-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', alignItems: 'end' }}>
        <label className="field" style={{ flex: '1 1 240px', margin: 0 }}>
          Search
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Product or SKU" />
        </label>
        <label className="field" style={{ minWidth: 180, margin: 0 }}>
          Status
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as typeof statusFilter); setPage(1); }}>
            <option value="ALL">All</option>
            <option value="IN STOCK">In stock</option>
            <option value="LOW STOCK">Low stock</option>
            <option value="OUT OF STOCK">Out of stock</option>
          </select>
        </label>
        <label className="field" style={{ minWidth: 180, margin: 0 }}>
          Sort
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as typeof sortKey)}>
            <option value="product">Product</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="onHand">On hand</option>
          </select>
        </label>
      </div>

      <div className="admin-grid" style={{ marginBottom: '1rem' }}>
        <div className="admin-card"><span className="eyebrow">Rows</span><p style={{ fontSize: '2rem', margin: 0 }}>{rows.length}</p></div>
        <div className="admin-card"><span className="eyebrow">Low stock</span><p style={{ fontSize: '2rem', margin: 0 }}>{rows.filter((row) => row.status === 'LOW STOCK').length}</p></div>
        <div className="admin-card"><span className="eyebrow">Out of stock</span><p style={{ fontSize: '2rem', margin: 0 }}>{rows.filter((row) => row.status === 'OUT OF STOCK').length}</p></div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Color</th>
              <th>Size</th>
              <th>On hand</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Status</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={`${row.productId}:${row.sku}`}>
                <td><a href={`/admin/products/${row.productId}`}>{row.productName}</a></td>
                <td>{row.sku}</td>
                <td>{row.color}</td>
                <td>{row.size}</td>
                <td>{row.onHand}</td>
                <td>{row.reserved}</td>
                <td>{row.available}</td>
                <td><span className="eyebrow">{row.status}</span></td>
                <td>
                  <form
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      const deltaValue = Number(form.get('delta')); 
                      const reason = String(form.get('reason') ?? 'ADJUSTMENT');
                      if (!Number.isFinite(deltaValue) || deltaValue === 0) return;
                      try {
                        await applyAdjustment(row, deltaValue, reason);
                        event.currentTarget.reset();
                      } catch (error) {
                        window.alert(error instanceof Error ? error.message : 'Unable to adjust inventory');
                      }
                    }}
                    style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}
                  >
                    <input type="number" name="delta" min={-999} max={999} defaultValue={0} style={{ width: '86px' }} />
                    <select name="reason" defaultValue="ADJUSTMENT" style={{ minWidth: '120px' }}>
                      <option value="ADJUSTMENT">Adjustment</option>
                      <option value="RESTOCK">Restock</option>
                      <option value="CORRECTION">Correction</option>
                    </select>
                    <button className="btn secondary" type="submit" style={{ padding: '.7rem 1rem' }}>Apply</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <p className="muted">Page {currentPage} of {totalPages}</p>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn secondary" type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</button>
          <button className="btn secondary" type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
        </div>
      </div>
    </div>
  );
}
