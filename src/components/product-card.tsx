import Image from 'next/image';
import Link from 'next/link';
import { money, type Product } from '@/lib/domain';
export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return <Link className="product-card" href={`/products/${product.slug}`}><div>{image ? <Image src={image.url} alt={image.alt} width={600} height={800}/> : <div className="placeholder">PARQ WEST</div>}</div><h3>{product.name}</h3><p>{money(product.price)}</p></Link>;
}
