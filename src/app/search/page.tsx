import Link from 'next/link';
import { listProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
import { BrandImageView } from '@/components/brand-image';
import { brandMedia } from '@/lib/brand-media';

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { products } = q ? await listProducts({ q, limit: 24 }) : { products: [] };
  return <main className="container search-page"><div className="page-title"><span className="eyebrow">PARQ WEST / Discover</span><h1 className="display">Search.</h1></div><form action="/search" className="shop-search"><label className="field">Search products<input name="q" defaultValue={q || ''} autoFocus placeholder="Search the catalog" /></label><button className="btn" type="submit">Search</button></form>{q && (products.length ? <div className="product-grid">{products.map(product => <ProductCard key={product.slug} product={product} />)}</div> : <section className="search-empty"><BrandImageView media={brandMedia.pinkClose} sizes="(max-width: 700px) 100vw, 42vw" /><div><span className="eyebrow">No results</span><h2 className="display">Nothing found<br/>for “{q}”.</h2><Link className="text-link" href="/lookbook">Explore lookbook ↗</Link></div></section>)}</main>;
}
