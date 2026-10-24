'use client';

import { useState } from 'react';

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export function AccountAddresses({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [error, setError] = useState('');

  async function save(next: Address[]) {
    const response = await fetch('/api/account/addresses', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ addresses: next }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to save address');
    setAddresses(next);
  }

  function addAddress() {
    const next: Address = {
      id: `${Date.now()}`,
      firstName: 'New',
      lastName: 'Customer',
      company: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      isDefaultShipping: false,
      isDefaultBilling: false,
    };
    setAddresses((list) => [...list, next]);
  }

  return (
    <div className="admin-card" style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="eyebrow">Delivery</span>
          <h2 style={{ margin: '.4rem 0 0' }}>Addresses.</h2>
        </div>
        <button className="btn secondary" type="button" onClick={addAddress}>Add address</button>
      </div>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {addresses.map((address, index) => (
          <div key={address.id ?? index} className="admin-card" style={{ borderStyle: 'dashed' }}>
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <label className="field"><span>First name</span><input value={address.firstName} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, firstName: event.target.value } : item))} /></label>
              <label className="field"><span>Last name</span><input value={address.lastName} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, lastName: event.target.value } : item))} /></label>
              <label className="field"><span>Company</span><input value={address.company} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, company: event.target.value } : item))} /></label>
              <label className="field"><span>Country</span><input value={address.country} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, country: event.target.value } : item))} /></label>
              <label className="field" style={{ gridColumn: '1 / -1' }}><span>Address line 1</span><input value={address.line1} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, line1: event.target.value } : item))} /></label>
              <label className="field" style={{ gridColumn: '1 / -1' }}><span>Address line 2</span><input value={address.line2} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, line2: event.target.value } : item))} /></label>
              <label className="field"><span>City</span><input value={address.city} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, city: event.target.value } : item))} /></label>
              <label className="field"><span>State</span><input value={address.state} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, state: event.target.value } : item))} /></label>
              <label className="field"><span>Postal code</span><input value={address.postalCode} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, postalCode: event.target.value } : item))} /></label>
              <div style={{ display: 'grid', gap: '.7rem', alignContent: 'start' }}>
                <label className="field" style={{ margin: 0 }}><input type="checkbox" checked={address.isDefaultShipping} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, isDefaultShipping: event.target.checked } : { ...item, isDefaultShipping: false }))} /> Default shipping</label>
                <label className="field" style={{ margin: 0 }}><input type="checkbox" checked={address.isDefaultBilling} onChange={(event) => setAddresses((list) => list.map((item, itemIndex) => itemIndex === index ? { ...item, isDefaultBilling: event.target.checked } : { ...item, isDefaultBilling: false }))} /> Default billing</label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className="btn secondary" type="button" onClick={() => setAddresses((list) => list.filter((_, itemIndex) => itemIndex !== index))}>Delete</button>
              <button className="btn" type="button" onClick={async () => {
                setError('');
                try { await save(addresses); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save address'); }
              }}>Save</button>
            </div>
          </div>
        ))}
      </div>
      {error ? <p role="alert" style={{ marginTop: '1rem', color: '#b42318' }}>{error}</p> : null}
    </div>
  );
}
