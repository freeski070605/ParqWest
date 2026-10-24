import Link from 'next/link';
import Image from 'next/image';
import { listProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
import { BrandImageView } from '@/components/brand-image';
import { EditorialVideo } from '@/components/editorial-video';
import { brandMedia } from '@/lib/brand-media';
import { db, databaseConfigured } from '@/lib/db';
import type { HomepageSection } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const now = new Date();
  const [catalog, sections] = await Promise.all([
    listProducts({ limit: 4 }),
    databaseConfigured() ? (await db()).collection<HomepageSection>('homepageSections').find({ enabled: true, demo: { $ne: true }, imageUrl: { $ne: '/campaigns/demo-form-study.webp' }, $and: [{ $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: { $exists: false } }, { endsAt: { $gt: now } }] }] }).sort({ position: 1 }).toArray() : [],
  ]);

  return <main className="brand-home">
    <section className="home-hero" aria-labelledby="home-heading">
      <div className="home-hero-image"><picture><source media="(max-width: 700px)" srcSet={brandMedia.studio.src} /><Image src={brandMedia.hero.src} alt="PARQ WEST studio portrait in a denim look" width={brandMedia.hero.width} height={brandMedia.hero.height} sizes="(max-width: 700px) 100vw, 58vw" loading="eager" fetchPriority="high" /></picture></div>
      <div className="home-hero-copy"><span className="eyebrow">PARQ WEST / Editorial</span><h1 id="home-heading" className="display">PARQ<br/>WEST</h1><Link className="text-link" href="/lookbook">Enter the lookbook <span aria-hidden="true">↗</span></Link></div>
    </section>
    <div className="brand-intro"><span className="eyebrow">The edit</span><p className="display">A change of perspective.</p><Link className="text-link" href="/shop">Explore the shop <span aria-hidden="true">↗</span></Link></div>
    <section className="home-editorial" aria-labelledby="clothing-heading"><div className="home-editorial-image"><BrandImageView media={brandMedia.studioFull} /></div><div className="home-editorial-copy"><span className="eyebrow">01 / Clothing</span><h2 id="clothing-heading" className="display">Form in<br/><em>motion.</em></h2><p>Studio studies in silhouette and detail.</p><Link className="text-link" href="/clothing">Explore clothing <span aria-hidden="true">↗</span></Link></div><div className="home-editorial-detail"><BrandImageView media={brandMedia.studioDetail} sizes="(max-width: 700px) 46vw, 22vw" /></div></section>
    <section className="bag-story" aria-labelledby="bags-heading"><div className="bag-story-image"><BrandImageView media={brandMedia.orangeHero} sizes="100vw" /></div><div className="bag-story-copy"><span className="eyebrow">02 / The circular bag</span><h2 id="bags-heading" className="display">The circle<br/>goes west.</h2><Link className="text-link" href="/bags">Explore bags <span aria-hidden="true">↗</span></Link></div></section>
    <section className="home-motion" aria-labelledby="motion-heading"><div className="motion-copy"><span className="eyebrow">PARQ WEST / In motion</span><h2 id="motion-heading" className="display">A closer<br/>look.</h2><Link className="text-link" href="/lookbook">See the editorial <span aria-hidden="true">↗</span></Link></div><div className="motion-media"><EditorialVideo src={brandMedia.campaignVideo} poster={brandMedia.campaignPoster} label="Black and white PARQ WEST bag editorial video" /></div></section>
    <section className="home-pair" aria-label="More from PARQ WEST"><Link href="/accessories" className="home-pair-item"><BrandImageView media={brandMedia.accessories} /><span className="eyebrow">03 / Accessories</span><strong className="display">The details.</strong><span className="text-link">Explore accessories ↗</span></Link><Link href="/lookbook" className="home-pair-item"><BrandImageView media={brandMedia.pinkHero} /><span className="eyebrow">04 / Street study</span><strong className="display">Out in the open.</strong><span className="text-link">View lookbook ↗</span></Link></section>
    {catalog.products.length > 0 && <section className="container home-products"><div className="section-heading"><div><span className="eyebrow">Available now</span><h2 className="display">The selection.</h2></div><Link className="text-link" href="/shop">Shop all ↗</Link></div><div className="product-grid">{catalog.products.map(product => <ProductCard product={product} key={product.slug} />)}</div></section>}
    {sections.filter(section => section.kind !== 'PRODUCT_GRID').map(section => <section className="cms-editorial" key={section._id.toHexString()}><div className="cms-editorial-copy"><span className="eyebrow">{section.eyebrow}</span><h2 className="display">{section.heading}</h2>{section.body && <p>{section.body}</p>}{section.href && <Link className="text-link" href={section.href}>{section.cta || 'Explore'} ↗</Link>}</div>{section.imageUrl && <div className="cms-editorial-image"><BrandImageView media={{ src: section.imageUrl, alt: section.heading, width: 1080, height: 1350 }} /></div>}</section>)}
    <section className="home-outro"><BrandImageView media={brandMedia.pinkStreet} sizes="(max-width: 700px) 100vw, 42vw" /><div><span className="eyebrow">PARQ WEST / Lookbook</span><h2 className="display">See it<br/>your way.</h2><Link className="text-link" href="/lookbook">Explore the lookbook ↗</Link></div></section>
  </main>;
}
