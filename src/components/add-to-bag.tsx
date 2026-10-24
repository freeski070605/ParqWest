'use client';
import { useState } from 'react';
import type { ProductInput } from '@/lib/domain';
type Variant = ProductInput['variants'][number];
export function AddToBag({ productId, variants }: { productId: string; variants: Variant[] }) {
  const [sku,setSku] = useState(variants[0]?.sku || ''); const [message,setMessage] = useState('');
  const selected = variants.find(v=>v.sku===sku);
  function add() { const cart = JSON.parse(localStorage.getItem('pw_cart') || '[]') as {productId:string;sku:string;quantity:number}[]; const existing = cart.find(l=>l.sku===sku); if(existing) existing.quantity=Math.min(existing.quantity+1,10); else cart.push({productId,sku,quantity:1}); localStorage.setItem('pw_cart',JSON.stringify(cart)); window.dispatchEvent(new Event('pw_cart_changed')); setMessage('Added to bag.'); }
  return <div><label className="field">Color / Size<select value={sku} onChange={e=>setSku(e.target.value)}>{variants.map(v=><option key={v.sku} value={v.sku} disabled={!v.enabled || v.inventory-v.reserved<1}>{v.color} / {v.size} {v.inventory-v.reserved<1?'— Sold out':''}</option>)}</select></label><button className="btn" style={{width:'100%'}} disabled={!selected || !selected.enabled || selected.inventory-selected.reserved<1} onClick={add}>Add to bag</button><p role="status" aria-live="polite">{message}</p></div>;
}
