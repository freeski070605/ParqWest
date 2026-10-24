import Link from 'next/link';
import { db, databaseConfigured } from '@/lib/db';
import { BrandImageView } from '@/components/brand-image';
import { brandMedia } from '@/lib/brand-media';

export const dynamic = 'force-dynamic';
type Collection = { slug: string; name: string; description: string; status: string; releaseAt?: Date; demo?: boolean };

export default async function Collections() {
  const collections = databaseConfigured() ? await (await db()).collection<Collection>('collections').find({ status: 'LIVE', demo: { $ne: true }, $or: [{ releaseAt: { $exists: false } }, { releaseAt: { $lte: new Date() } }] }).toArray() : [];
  return <main className="collections-page"><header className="catalog-hero"><div><span className="eyebrow">PARQ WEST / Explore</span><h1 className="display">Collections.</h1><Link className="text-link" href="/lookbook">View lookbook ↗</Link></div><BrandImageView media={brandMedia.orangeNight} sizes="(max-width: 700px) 100vw, 48vw" preload /></header><div className="container collections-content">{collections.length ? collections.map(collection => <Link className="collection-row" key={collection.slug} href={`/collections/${collection.slug}`}><span className="eyebrow">Collection</span><h2 className="display">{collection.name}</h2><p>{collection.description}</p><span className="text-link">Explore ↗</span></Link>) : <div className="catalog-empty"><span className="eyebrow">PARQ WEST / Collections</span><h2 className="display">More to see soon.</h2><p>Explore the visual stories in the meantime.</p><Link className="text-link" href="/lookbook">View lookbook ↗</Link></div>}</div></main>;
}
