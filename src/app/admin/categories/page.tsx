import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { CategoryEditor } from '@/components/category-editor';
import type { Category } from '@/lib/domain';

export default async function CategoriesPage() {
  await requireAdmin('categories');
  const categories = await (await db()).collection<Category>('categories').find({}).sort({ order: 1, name: 1 }).toArray();

  return (
    <>
      <span className="eyebrow">Commerce / Categories</span>
      <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Categories.</h1>
      <p className="muted">Create, reorder, and manage category structure and storefront visibility.</p>
      <CategoryEditor />
      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <h2>Existing categories</h2>
        {categories.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Order</th>
                <th>Visible</th>
                <th>Enabled</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id.toHexString()}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.parentSlug || '—'}</td>
                  <td>{category.order}</td>
                  <td>{category.storefrontVisible ? 'Yes' : 'No'}</td>
                  <td>{category.enabled ? 'Enabled' : 'Disabled'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No categories yet.</div>
        )}
      </div>
    </>
  );
}
