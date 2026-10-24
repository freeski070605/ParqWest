import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db, databaseConfigured } from '@/lib/db';
import { ProductCard } from '@/components/product-card';
import { BrandImageView } from '@/components/brand-image';
import { brandMedia } from '@/lib/brand-media';
import { publishedFilter, type Product } from '@/lib/domain';

type Collection = { slug: string; name: string; description: string; status: string; releaseAt?: Date; hero?: string; demo?: boolean };

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!databaseConfigured()) notFound();
  const database = await db();
  const collection = await database.collection<Collection>('collections').findOne({ slug, status: 'LIVE', demo: { $ne: true }, $or: [{ releaseAt: { $exists: false } }, { releaseAt: { $lte: new Date() } }] });
  if (!collection) notFound();
  const products = await database.collection<Product>('products').find({ collectionSlugs: slug, ...publishedFilter() }).limit(48).toArray();
  const media = collection.hero?.startsWith('/') || collection.hero?.startsWith('https://res.cloudinary.com/') ? { src: collection.hero, alt: `${collection.name} campaign image`, width: 1080, height: 1350 } : brandMedia.pinkStreet;
  return <main className="collection-page"><header className="catalog-hero"><div><span className="eyebrow">PARQ WEST / Collection</span><h1 className="display">{collection.name}.</h1><p>{collection.description}</p></div><BrandImageView media={media} sizes="(max-width: 700px) 100vw, 48vw" preload /></header><div className="container catalog-content">{products.length ? <div className="product-grid">{products.map(product => <ProductCard key={product.slug} product={product} />)}</div> : <div className="catalog-empty"><span className="eyebrow">PARQ WEST / {collection.name}</span><h2 className="display">Nothing available<br/>right now.</h2><Link className="text-link" href="/lookbook">Explore the lookbook ↗</Link></div>}</div></main>;
}
