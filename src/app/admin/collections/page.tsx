import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { CollectionEditor } from '@/components/collection-editor';
import type { CollectionRecord } from '@/lib/domain';

export default async function CollectionsPage() {
  await requireAdmin('collections');
  const collections = await (await db()).collection<CollectionRecord>('collections').find({}).sort({ releaseAt: -1, createdAt: -1 }).toArray();

  return (
    <>
      <span className="eyebrow">Commerce / Collections</span>
      <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Collections.</h1>
      <p className="muted">Build seasonal stories, release windows, and campaign-ready storefront collections.</p>
      <CollectionEditor />
      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <h2>Existing collections</h2>
        {collections.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Release</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection._id.toHexString()}>
                  <td><a href={`/admin/collections/${collection._id.toHexString()}`}>{collection.name}</a></td>
                  <td>{collection.slug}</td>
                  <td>{collection.status}</td>
                  <td>{collection.releaseAt ? new Date(collection.releaseAt).toLocaleDateString() : '—'}</td>
                  <td>{collection.endAt ? new Date(collection.endAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No collections yet.</div>
        )}
      </div>
    </>
  );
}
