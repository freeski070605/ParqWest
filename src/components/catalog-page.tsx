import Link from 'next/link';
import { listProducts } from '@/lib/catalog';
import { ProductCard } from './product-card';
import { BrandImageView } from './brand-image';
import { brandMedia } from '@/lib/brand-media';

const imagery = {
  Clothing: brandMedia.studioFull,
  Bags: brandMedia.orangePortrait,
  Accessories: brandMedia.accessories,
  New: brandMedia.pinkHero,
} as const;

export async function CatalogPage({ title, category }: { title: keyof typeof imagery; category?: string }) {
  const { products } = await listProducts({ category, limit: 24 });
  const media = imagery[title];
  return <main className="catalog-page"><header className="catalog-hero"><div><span className="eyebrow">PARQ WEST / Explore</span><h1 className="display">{title}.</h1><Link className="text-link" href="/lookbook">View lookbook ↗</Link></div><BrandImageView media={media} sizes="(max-width: 700px) 100vw, 48vw" preload /></header><div className="container catalog-content">{products.length ? <><div className="section-heading"><span className="eyebrow">Available now</span><span className="eyebrow">{products.length} pieces</span></div><div className="product-grid">{products.map(product => <ProductCard key={product.slug} product={product} />)}</div></> : <div className="catalog-empty"><span className="eyebrow">PARQ WEST / {title}</span><h2 className="display">Nothing available<br/>right now.</h2><p>Explore the images while the catalog takes shape.</p><Link className="text-link" href="/lookbook">Continue to lookbook ↗</Link></div>}</div></main>;
}
