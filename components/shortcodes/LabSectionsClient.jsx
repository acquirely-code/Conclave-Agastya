'use client';
// Behaviour from lab-sections.js: the progress bar fills when it scrolls into view, and the
// stations' orange line draws itself with the scroll, revealing each station as it is reached.
import { useEffect, useRef } from 'react';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function ProgressObserver({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!('IntersectionObserver' in window) || reducedMotion()) {
      el.classList.add('is-filled');
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-filled');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <section ref={ref} className="labsec-progress" data-labsec-progress="">{children}</section>;
}

export function StationsScroll({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const section = ref.current;
    const path = section.querySelector('.labsec-stations__path');
    const map = section.querySelector('.labsec-stations__map');
    const stations = section.querySelectorAll('.labsec-station');
    if (!path || !map) return;

    if (reducedMotion()) {
      path.style.strokeDashoffset = 0;
      stations.forEach(s => s.classList.add('is-visible'));
      return;
    }

    let ticking = false;
    // 0 when the map's top reaches 85% of the viewport, 1 when its bottom reaches 45%.
    const progress = () => {
      const rect = map.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const start = vh * 0.85;
      const end = vh * 0.45 - rect.height;
      return Math.max(0, Math.min(1, (rect.top - start) / (end - start)));
    };
    const render = () => {
      ticking = false;
      // If the mobile layout hid the SVG, just show everything.
      if (path.getBoundingClientRect().width === 0) {
        stations.forEach(s => s.classList.add('is-visible'));
        return;
      }
      const p = progress();
      path.style.strokeDashoffset = 1 - p;
      stations.forEach(s => s.classList.toggle('is-visible', p >= parseFloat(s.dataset.reveal || '0')));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return <section ref={ref} className="labsec-stations" data-labsec-stations="">{children}</section>;
}
