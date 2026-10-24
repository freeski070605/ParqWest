'use client';

import { useEffect, useRef } from 'react';

export function EditorialVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visible = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !motion.matches) void video.play().catch(() => {});
      else video.pause();
    }, { rootMargin: '100px' });
    visible.observe(video);
    const updateMotion = () => { if (motion.matches) video.pause(); };
    motion.addEventListener('change', updateMotion);
    return () => { visible.disconnect(); motion.removeEventListener('change', updateMotion); video.pause(); };
  }, []);
  return <video ref={ref} className="editorial-video" src={src} poster={poster} aria-label={label} muted loop playsInline preload="none" />;
}
