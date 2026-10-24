import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { CollectionEditor } from '@/components/collection-editor';
import type { CollectionRecord } from '@/lib/domain';

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin('collections');
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const collection = await (await db()).collection<CollectionRecord>('collections').findOne({ _id: new ObjectId(id) });
  if (!collection) notFound();

  return (
    <>
      <span className="eyebrow">Commerce / Collection</span>
      <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Edit collection.</h1>
      <CollectionEditor id={id} initial={JSON.parse(JSON.stringify(collection))} />
    </>
  );
}
