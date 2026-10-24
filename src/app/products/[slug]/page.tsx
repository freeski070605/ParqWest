import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProduct } from '@/lib/catalog';
import { money } from '@/lib/domain';
import { AddToBag } from '@/components/add-to-bag';
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const product = await getProduct(slug); if (!product) notFound();
  return <main className="container" style={{display:'grid',gridTemplateColumns:'minmax(0,1.4fr) minmax(300px,1fr)',gap:'5vw',padding:'3rem 0'}}><div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'.6rem'}}>{product.images.length ? product.images.map((image,i)=><Image key={i} src={image.url} alt={image.alt} width={800} height={1000} style={{width:'100%',height:'auto'}} priority={i===0}/>) : <div style={{background:'#e9e5de',aspectRatio:'3/4',gridColumn:'span 2',display:'grid',placeItems:'center'}}>PARQ WEST</div>}</div><div><span className="eyebrow">PARQ WEST / {product.categorySlug}</span><h1 className="display" style={{fontSize:'clamp(3rem,5vw,6rem)',lineHeight:'.95'}}>{product.name}</h1><p>{money(product.price)} {product.compareAtPrice && <s className="muted">{money(product.compareAtPrice)}</s>}</p><p className="muted">{product.shortDescription}</p><AddToBag productId={product._id.toHexString()} variants={product.variants}/><div style={{borderTop:'1px solid #ccc',marginTop:'2rem',paddingTop:'2rem',lineHeight:1.7}}>{product.description}</div><p className="eyebrow" style={{marginTop:'2rem'}}>Shipping and returns</p><p className="muted">Shipping and return details are confirmed at checkout.</p></div></main>;
}
