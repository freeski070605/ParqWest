'use client';

import { useEffect, useState } from 'react';

type WishlistProps = {
  initialItems: string[];
};

function readGuestWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem('guestWishlist');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

export function AccountWishlist({ initialItems }: WishlistProps) {
  const guestItems = readGuestWishlist();
  const [items, setItems] = useState<string[]>(() => (initialItems.length ? initialItems : guestItems));

  useEffect(() => {
    window.localStorage.setItem('guestWishlist', JSON.stringify(items));
    if (initialItems.length || items.length) {
      fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      }).catch(() => undefined);
    }
  }, [items, initialItems.length]);

  function addItem() {
    const next = window.prompt('Add a product slug or item identifier', '');
    if (!next) return;
    setItems((list) => [...new Set([...list, next.trim()])].filter(Boolean));
  }

  return (
    <div className="admin-card" style={{ maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <span className="eyebrow">Saved</span>
          <h2 style={{ margin: '.4rem 0 0' }}>Wishlist.</h2>
        </div>
        <button className="btn secondary" type="button" onClick={addItem}>Add item</button>
      </div>
      {items.length ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
          {items.map((item) => (
            <li key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '.7rem' }}>
              <span>{item}</span>
              <button type="button" className="btn secondary" onClick={() => setItems((list) => list.filter((next) => next !== item))}>Remove</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">Your wishlist is empty. Save a few pieces to come back to them later.</div>
      )}
      {guestItems.length > 0 ? <p className="muted" style={{ marginTop: '1rem' }}>Guest wishlist loaded and synced to your account.</p> : null}
    </div>
  );
}
