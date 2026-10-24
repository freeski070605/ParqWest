import Image from 'next/image';
import type { BrandImage } from '@/lib/brand-media';

export function BrandImageView({ media, className = '', sizes = '(max-width: 700px) 100vw, 50vw', preload = false }: { media: BrandImage; className?: string; sizes?: string; preload?: boolean }) {
  return <Image className={className} src={media.src} alt={media.alt} width={media.width} height={media.height} sizes={sizes} preload={preload} />;
}
