import Link from 'next/link';
import { listProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
import { db, databaseConfigured } from '@/lib/db';
import type { HomepageSection } from '@/lib/content';
export const dynamic='force-dynamic';

const preview:HomepageSection[]=[
  {kind:'HERO',heading:'A study in form.',eyebrow:'PARQ WEST / Campaign concept',body:'Clothing, bags and objects shaped by the space between statement and restraint.',cta:'Explore the collection',href:'/shop',imageUrl:'/campaigns/demo-form-study.webp',enabled:true,position:0} as HomepageSection,
  {kind:'PRODUCT_GRID',heading:'New West',eyebrow:'The edit',body:'',cta:'View all',href:'/new',enabled:true,position:1} as HomepageSection,
  {kind:'EDITORIAL',heading:'The Signature Circle.',eyebrow:'An icon, from every angle',body:'A signature shape for every direction.',cta:'Discover bags',href:'/bags',enabled:true,position:2} as HomepageSection,
];
export default async function Home(){
  const configured=databaseConfigured();const now=new Date();
  const sections=configured?await(await db()).collection<HomepageSection>('homepageSections').find({enabled:true,$and:[{$or:[{startsAt:{$exists:false}},{startsAt:{$lte:now}}]},{$or:[{endsAt:{$exists:false}},{endsAt:{$gt:now}}]}]}).sort({position:1}).toArray():preview;
  const needsProducts=sections.some(s=>s.kind==='PRODUCT_GRID');const products=needsProducts?(await listProducts({limit:4})).products:[];
  return <main>{sections.map((s,i)=>s.kind==='HERO'?<section className="hero" key={i} style={{backgroundImage:s.imageUrl?`linear-gradient(90deg,#15141088,transparent 75%),url("${s.imageUrl}")`:undefined}}><div><span className="eyebrow">{s.eyebrow}</span><h1 className="display">{s.heading}</h1><p>{s.body}</p>{s.href&&<Link className="btn" href={s.href}>{s.cta||'Explore'}</Link>}</div></section>:s.kind==='PRODUCT_GRID'?<section className="container" style={{padding:'5rem 0'}} key={i}><span className="eyebrow">{s.eyebrow}</span><div style={{display:'flex',justifyContent:'space-between',alignItems:'end'}}><h2 className="display" style={{fontSize:'clamp(3rem,6vw,6rem)',margin:'.5rem 0 2rem'}}>{s.heading}</h2>{s.href&&<Link href={s.href} className="eyebrow">{s.cta||'View all'} →</Link>}</div>{products.length?<div className="product-grid">{products.map(p=><ProductCard product={p} key={p.slug}/>)}</div>:<div className="empty">{configured?'The collection is taking shape.':'Connect MongoDB Atlas and run the development seed to preview the collection.'}</div>}</section>:<section key={i} style={{background:s.imageUrl?`url("${s.imageUrl}") center/cover`:'#e9e5dc',padding:'8vw'}}><div className="container"><span className="eyebrow">{s.eyebrow}</span><h2 className="display" style={{fontSize:'clamp(4rem,9vw,9rem)',lineHeight:'.9'}}>{s.heading}</h2><p>{s.body}</p>{s.href&&<Link className="btn" href={s.href}>{s.cta||'Explore'}</Link>}</div></section>)}  {!sections.length&&<div className="container empty" style={{margin:'5rem auto'}}>No homepage content is configured yet.</div>}</main>;}
