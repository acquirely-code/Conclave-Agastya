'use client';
// Page-wide behaviour Elementor's frontend.js provides: smooth anchor scrolling and the image lightbox.
import { useEffect, useState, useCallback } from 'react';

export default function Frontend() {
  const [box, setBox] = useState(null); // { images: [url], index }

  useEffect(() => {
    const onClick = e => {
      const a = e.target.closest('a');
      if (!a) return;

      if (a.dataset.elementorOpenLightbox === 'yes') {
        e.preventDefault();
        const group = a.dataset.elementorLightboxSlideshow;
        // Swiper loop mode duplicates slides; keep each image once.
        const links = group ? [...document.querySelectorAll(`a[data-elementor-lightbox-slideshow="${group}"]`)] : [a];
        const images = [...new Set(links.map(l => l.getAttribute('href')))];
        setBox({ images, index: Math.max(0, images.indexOf(a.getAttribute('href'))) });
        return;
      }

      // Same-page anchors scroll smoothly, as Elementor does.
      const url = new URL(a.href, location.href);
      if (url.hash && url.pathname === location.pathname && url.origin === location.origin) {
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
        history.pushState(null, '', url.hash);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const step = useCallback(d => setBox(b => b && { ...b, index: (b.index + d + b.images.length) % b.images.length }), []);

  useEffect(() => {
    if (!box) return;
    const onKey = e => {
      if (e.key === 'Escape') setBox(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [box, step]);

  if (!box) return null;
  const many = box.images.length > 1;
  return (
    <div className="e-lightbox" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && setBox(null)}>
      <button type="button" className="e-lightbox__close" aria-label="Close" onClick={() => setBox(null)}><i className="eicon-close" aria-hidden="true"></i></button>
      {many && <button type="button" className="e-lightbox__nav e-lightbox__prev" aria-label="Previous" onClick={() => step(-1)}><i className="eicon-chevron-left" aria-hidden="true"></i></button>}
      <img src={box.images[box.index]} alt="" />
      {many && <button type="button" className="e-lightbox__nav e-lightbox__next" aria-label="Next" onClick={() => step(1)}><i className="eicon-chevron-right" aria-hidden="true"></i></button>}
      {many && <div className="e-lightbox__counter">{box.index + 1} / {box.images.length}</div>}
    </div>
  );
}
