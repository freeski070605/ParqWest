import Link from 'next/link';
import { BrandImageView } from '@/components/brand-image';
import { EditorialVideo } from '@/components/editorial-video';
import { brandMedia } from '@/lib/brand-media';

export const metadata = { title: 'Lookbook' };

export default function Lookbook() {
  return <main className="lookbook"><header className="lookbook-heading container"><span className="eyebrow">PARQ WEST / Image studies</span><h1 className="display">Lookbook.</h1><p>Studio. Street. In motion.</p></header>
    <section className="lookbook-opening"><BrandImageView media={brandMedia.studio} sizes="(max-width: 700px) 100vw, 55vw" preload /><div><span className="eyebrow">01 / Studio</span><h2 className="display">Shape<br/>and stance.</h2></div></section>
    <section className="lookbook-duo"><figure><BrandImageView media={brandMedia.studioPortrait} /><figcaption>Studio / portrait</figcaption></figure><figure><BrandImageView media={brandMedia.studioFull} /><figcaption>Studio / silhouette</figcaption></figure></section>
    <section className="lookbook-banner"><BrandImageView media={brandMedia.orangeHero} sizes="100vw" /><div><span className="eyebrow">02 / Street</span><h2 className="display">The city<br/>in frame.</h2></div></section>
    <section className="lookbook-duo stagger"><figure><BrandImageView media={brandMedia.orangeNight} /><figcaption>Street / after dark</figcaption></figure><figure><BrandImageView media={brandMedia.orangePortrait} /><figcaption>Street / circular form</figcaption></figure></section>
    <section className="lookbook-interlude"><div><span className="eyebrow">PARQ WEST / In motion</span><h2 className="display">Details<br/>in motion.</h2></div><EditorialVideo src={brandMedia.bagVideo} poster={brandMedia.bagPoster} label="Circular bags shown in motion" /></section>
    <section className="lookbook-final"><div className="lookbook-final-lead"><BrandImageView media={brandMedia.pinkHero} /><span className="eyebrow">03 / Daylight</span></div><div className="lookbook-final-side"><h2 className="display">A different<br/>light.</h2><BrandImageView media={brandMedia.pinkWide} /><Link className="text-link" href="/shop">Explore the shop ↗</Link></div></section>
  </main>;
}
