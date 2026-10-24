'use client';

import { useState } from 'react';

type Preferences = {
  emailMarketing: boolean;
  smsMarketing: boolean;
  restockAlerts: boolean;
  orderUpdates: boolean;
};

export function AccountPreferences({ initialPreferences }: { initialPreferences: Preferences }) {
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [error, setError] = useState('');

  async function save() {
    const response = await fetch('/api/account/preferences', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ preferences }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to update preferences');
  }

  return (
    <div className="admin-card" style={{ maxWidth: '720px' }}>
      <span className="eyebrow">Alerts</span>
      <h2 style={{ margin: '.4rem 0 1rem' }}>Notifications and preferences.</h2>
      <div style={{ display: 'grid', gap: '.8rem' }}>
        {[
          ['Email marketing', 'emailMarketing'],
          ['SMS marketing', 'smsMarketing'],
          ['Restock alerts', 'restockAlerts'],
          ['Order communication updates', 'orderUpdates'],
        ].map(([label, key]) => (
          <label key={key} className="field" style={{ margin: 0 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
              <span>{label}</span>
              <input
                type="checkbox"
                checked={Boolean(preferences[key as keyof Preferences])}
                onChange={(event) => setPreferences((next) => ({ ...next, [key]: event.target.checked }))}
              />
            </span>
          </label>
        ))}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <button className="btn" type="button" onClick={async () => {
          setError('');
          try { await save(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to update preferences'); }
        }}>Save preferences</button>
      </div>
      {error ? <p role="alert" style={{ marginTop: '1rem', color: '#b42318' }}>{error}</p> : null}
    </div>
  );
}
