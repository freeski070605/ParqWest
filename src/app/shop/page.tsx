import Link from 'next/link';
import { listProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
import { BrandImageView } from '@/components/brand-image';
import { brandMedia } from '@/lib/brand-media';

export const metadata = { title: 'Shop' };

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { products, total } = await listProducts({ category: params.category, q: params.q, page });
  const filtered = Boolean(params.category || params.q);
  return <main className="shop-page"><header className="shop-hero"><div><span className="eyebrow">PARQ WEST / The edit</span><h1 className="display">Shop.</h1><p>Explore clothing, bags and accessories.</p></div><BrandImageView media={brandMedia.pinkHero} sizes="(max-width: 700px) 100vw, 45vw" preload /></header><div className="container shop-content"><nav className="category-nav" aria-label="Shop categories"><Link href="/shop">All</Link><Link href="/clothing">Clothing</Link><Link href="/bags">Bags</Link><Link href="/accessories">Accessories</Link></nav><form action="/shop" className="shop-search"><label className="field">Category<select name="category" defaultValue={params.category || ''}><option value="">All</option><option value="clothing">Clothing</option><option value="bags">Bags</option><option value="accessories">Accessories</option></select></label><label className="field">Search<input name="q" defaultValue={params.q || ''} placeholder="Search the catalog" /></label><button className="btn" type="submit">Apply</button></form>{products.length ? <><div className="product-grid">{products.map(product => <ProductCard product={product} key={product.slug} />)}</div><div className="pagination">{page > 1 && <Link href={`/shop?page=${page - 1}`}>← Previous</Link>}{page * 12 < total && <Link href={`/shop?page=${page + 1}`}>Next →</Link>}</div></> : <div className="catalog-empty"><span className="eyebrow">PARQ WEST / Shop</span><h2 className="display">{filtered ? 'No pieces found.' : 'The edit is taking shape.'}</h2><p>{filtered ? 'Try another search or explore the imagery.' : 'The lookbook is here to explore while pieces are added.'}</p><Link className="text-link" href={filtered ? '/shop' : '/lookbook'}>{filtered ? 'Clear filters' : 'View lookbook'} ↗</Link></div>}</div></main>;
}
