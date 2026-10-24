'use client';

import { useState } from 'react';

type ReturnItem = { sku: string; quantity: number; reason: string };

type ReturnRequest = {
  id: string;
  orderId: string;
  status: string;
  items: ReturnItem[];
  createdAt: string;
};

export function AccountReturns({ initialReturns, orderSummary }: { initialReturns: ReturnRequest[]; orderSummary: Array<{ id: string; number: string; items: Array<{ sku: string; name: string; quantity: number }> }> }) {
  const [returns, setReturns] = useState<ReturnRequest[]>(initialReturns);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(orderSummary[0]?.id ?? '');
  const [selectedSku, setSelectedSku] = useState(orderSummary[0]?.items[0]?.sku ?? '');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      orderId: String(form.get('orderId') ?? selectedOrderId),
      sku: String(form.get('sku') ?? selectedSku),
      quantity: Number(form.get('quantity') ?? 1),
      reason: String(form.get('reason') ?? 'DEFECTIVE'),
    };

    try {
      const response = await fetch('/api/account/returns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to submit return');
      setReturns((list) => [{
        id: String(result.id ?? Date.now()),
        orderId: payload.orderId,
        status: 'REQUESTED',
        items: [{ sku: payload.sku, quantity: payload.quantity, reason: payload.reason }],
        createdAt: new Date().toISOString(),
      }, ...list]);
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to submit return');
    }
  }

  const currentOrder = orderSummary.find((order) => order.id === selectedOrderId) ?? orderSummary[0];

  return (
    <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '980px' }}>
      <div className="admin-card">
        <span className="eyebrow">Returns</span>
        <h2 style={{ margin: '.4rem 0 1rem' }}>Start a return.</h2>
        <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
          <label className="field" style={{ margin: 0 }}>
            Order
            <select name="orderId" value={selectedOrderId} onChange={(event) => {
              setSelectedOrderId(event.target.value);
              const order = orderSummary.find((item) => item.id === event.target.value);
              setSelectedSku(order?.items[0]?.sku ?? '');
            }}>
              {orderSummary.map((order) => (
                <option key={order.id} value={order.id}>{order.number}</option>
              ))}
            </select>
          </label>
          <label className="field" style={{ margin: 0 }}>
            Item
            <select name="sku" value={selectedSku} onChange={(event) => setSelectedSku(event.target.value)}>
              {(currentOrder?.items ?? []).map((item) => (
                <option key={`${currentOrder.id}-${item.sku}`} value={item.sku}>{item.name} / {item.sku}</option>
              ))}
            </select>
          </label>
          <label className="field" style={{ margin: 0 }}>
            Quantity
            <input type="number" name="quantity" min={1} defaultValue={1} />
          </label>
          <label className="field" style={{ margin: 0 }}>
            Reason
            <select name="reason" defaultValue="DEFECTIVE">
              <option value="DEFECTIVE">Defective</option>
              <option value="ARRIVED_LATE">Arrived late</option>
              <option value="WRONG_ITEM">Wrong item</option>
              <option value="CHANGED_MIND">Changed my mind</option>
            </select>
          </label>
          <button className="btn" type="submit">Submit return</button>
        </form>
        {error ? <p role="alert" style={{ marginTop: '1rem', color: '#b42318' }}>{error}</p> : null}
      </div>

      <div className="admin-card">
        <span className="eyebrow">History</span>
        <h2 style={{ margin: '.4rem 0 1rem' }}>Return requests.</h2>
        {returns.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((request) => (
                <tr key={request.id}>
                  <td>{request.orderId}</td>
                  <td>{request.items.map((item) => `${item.sku} × ${item.quantity}`).join(', ')}</td>
                  <td>{request.status}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No return requests yet.</div>
        )}
      </div>
    </div>
  );
}
