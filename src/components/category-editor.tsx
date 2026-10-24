'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  parentSlug: string;
  order: number;
  enabled: boolean;
  storefrontVisible: boolean;
  seoTitle: string;
  seoDescription: string;
};

export function CategoryEditor({ initial, id }: { initial?: Partial<CategoryForm>; id?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const payload: CategoryForm = {
      name: String(form.get('name') ?? ''),
      slug: String(form.get('slug') ?? ''),
      description: String(form.get('description') ?? ''),
      parentSlug: String(form.get('parentSlug') ?? ''),
      order: Number(form.get('order') ?? 0),
      enabled: String(form.get('enabled') ?? 'true') === 'true',
      storefrontVisible: String(form.get('storefrontVisible') ?? 'true') === 'true',
      seoTitle: String(form.get('seoTitle') ?? ''),
      seoDescription: String(form.get('seoDescription') ?? ''),
    };

    try {
      const response = await fetch(id ? `/api/admin/categories/${id}` : '/api/admin/categories', {
        method: id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to save category');
      router.push('/admin/categories');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save category');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="admin-card" style={{ maxWidth: '960px', marginTop: '2rem' }}>
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
          Parent slug
          <input name="parentSlug" defaultValue={String(initial?.parentSlug ?? '')} />
        </label>
        <label className="field">
          Display order
          <input name="order" type="number" min={0} defaultValue={String(initial?.order ?? 0)} />
        </label>
        <label className="field">
          Enabled
          <select name="enabled" defaultValue={String(initial?.enabled ?? true)}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </label>
        <label className="field">
          Storefront visibility
          <select name="storefrontVisible" defaultValue={String(initial?.storefrontVisible ?? true)}>
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </label>
        <label className="field" style={{ gridColumn: '1 / -1' }}>
          Description
          <textarea name="description" rows={4} defaultValue={String(initial?.description ?? '')} />
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
        <button className="btn" type="submit" disabled={pending}>{pending ? 'Saving…' : id ? 'Update category' : 'Create category'}</button>
      </div>
      {error ? <p role="alert" style={{ marginTop: '1rem', color: '#b42318' }}>{error}</p> : null}
    </form>
  );
}
