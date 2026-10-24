'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CollectionForm = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ARCHIVED';
  hero: string;
  media: string[];
  products: string[];
  releaseAt?: string;
  endAt?: string;
  seoTitle: string;
  seoDescription: string;
};

export function CollectionEditor({ initial, id }: { initial?: Partial<CollectionForm>; id?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const payload: CollectionForm = {
      name: String(form.get('name') ?? ''),
      slug: String(form.get('slug') ?? ''),
      description: String(form.get('description') ?? ''),
      status: String(form.get('status') ?? 'DRAFT') as CollectionForm['status'],
      hero: String(form.get('hero') ?? ''),
      media: String(form.get('media') ?? '')
        .split(/\n|,/)
        .map((value) => value.trim())
        .filter(Boolean),
      products: String(form.get('products') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      releaseAt: form.get('releaseAt') ? new Date(String(form.get('releaseAt'))).toISOString() : undefined,
      endAt: form.get('endAt') ? new Date(String(form.get('endAt'))).toISOString() : undefined,
      seoTitle: String(form.get('seoTitle') ?? ''),
      seoDescription: String(form.get('seoDescription') ?? ''),
    };

    try {
      const response = await fetch(id ? `/api/admin/collections/${id}` : '/api/admin/collections', {
        method: id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to save collection');
      router.push('/admin/collections');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save collection');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="admin-card" style={{ maxWidth: '1080px', marginTop: '2rem' }}>
      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <label className="field">
          Name
          <input name="name" defaultValue={String(initial?.name ?? '')} required />
        </label>
        <label className="field">
          Slug
          <input name="slug" defaultValue={String(initial?.slug ?? '')} required />
        </label>
        <label className="field">
          Status
          <select name="status" defaultValue={String(initial?.status ?? 'DRAFT')}>
            <option value="DRAFT">DRAFT</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="LIVE">LIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </label>
        <label className="field">
          Hero image URL
          <input name="hero" type="url" defaultValue={String(initial?.hero ?? '')} />
        </label>
        <label className="field" style={{ gridColumn: '1 / -1' }}>
          Description
          <textarea name="description" rows={4} defaultValue={String(initial?.description ?? '')} required />
        </label>
        <label className="field" style={{ gridColumn: '1 / -1' }}>
          Media URLs (one per line)
          <textarea name="media" rows={3} defaultValue={(initial?.media ?? []).join('\n')} />
        </label>
        <label className="field">
          Product IDs
          <input name="products" defaultValue={(initial?.products ?? []).join(', ')} />
        </label>
        <label className="field">
          Release date
          <input name="releaseAt" type="datetime-local" defaultValue={initial?.releaseAt ? new Date(initial.releaseAt).toISOString().slice(0, 16) : ''} />
        </label>
        <label className="field">
          End date
          <input name="endAt" type="datetime-local" defaultValue={initial?.endAt ? new Date(initial.endAt).toISOString().slice(0, 16) : ''} />
        </label>
        <label className="field">
          SEO title
          <input name="seoTitle" defaultValue={String(initial?.seoTitle ?? '')} />
        </label>
        <label className="field">
          SEO description
          <input name="seoDescription" defaultValue={String(initial?.seoDescription ?? '')} />
        </label>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <button className="btn" type="submit" disabled={pending}>{pending ? 'Saving…' : id ? 'Update collection' : 'Create collection'}</button>
      </div>
      {error ? <p role="alert" style={{ marginTop: '1rem', color: '#b42318' }}>{error}</p> : null}
    </form>
  );
}
