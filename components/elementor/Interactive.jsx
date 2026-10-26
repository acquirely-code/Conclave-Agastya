'use client';
// Client behaviour for interactive Elementor widgets, ported from Elementor's frontend handlers.
import { useEffect, useRef } from 'react';

const BREAKPOINTS = { mobile: 767, tablet: 1024 };

export default function Interactive({ kind, id, settings, html, children, ...wrapper }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const behaviour = BEHAVIOURS[kind];
    if (!el || !behaviour) return;
    let cleanup;
    let cancelled = false;
    Promise.resolve(behaviour(el, settings || {}, id, kind)).then(fn => {
      if (cancelled) fn?.();
      else cleanup = fn;
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [kind, id, settings]);

  if (html !== undefined) return <div ref={ref} {...wrapper} dangerouslySetInnerHTML={{ __html: html }} />;
  return <div ref={ref} {...wrapper}>{children}</div>;
}

/* ---------- carousels (CarouselHandlerBase + NestedCarousel) ---------- */

const CAROUSEL_DEFAULTS = {
  'image-carousel': { autoplay: 'yes', autoplay_speed: 5000, pause_on_hover: 'yes', pause_on_interaction: 'yes', infinite: 'yes', speed: 500, effect: 'slide', navigation: 'both' },
  'nested-carousel': { autoplay: 'yes', autoplay_speed: 5000, pause_on_hover: 'yes', pause_on_interaction: 'yes', infinite: 'yes', speed: 500, arrows: 'yes', pagination: 'bullets', image_spacing_custom: { size: 10 } },
};

function responsiveSize(s, key, device) {
  const order = device === 'mobile' ? ['_mobile', '_tablet', ''] : device === 'tablet' ? ['_tablet', ''] : [''];
  for (const suffix of order) {
    const v = s[key + suffix]?.size;
    if (v !== undefined && v !== '') return Number(v) || 0;
  }
  return 0;
}

function swiperOptions(s, id, kind, widget) {
  const nested = kind === 'nested-carousel';
  const es = { ...CAROUSEL_DEFAULTS[kind], ...s };
  if (!nested) {
    // image_spacing_custom only exists when "Image Spacing" is set to Custom
    if (es.image_spacing === 'custom') es.image_spacing_custom = s.image_spacing_custom || { size: 20 };
    else delete es.image_spacing_custom;
  }
  const slidesToShow = +es.slides_to_show || 3;
  const single = slidesToShow === 1;
  const o = { slidesPerView: slidesToShow, loop: es.infinite === 'yes', speed: +es.speed, breakpoints: {} };
  let last = slidesToShow;
  for (const name of ['tablet', 'mobile']) {
    const def = name === 'mobile' ? 1 : name === 'tablet' ? (single ? 1 : 2) : last;
    const bp = { slidesPerView: +es[`slides_to_show_${name}`] || def, slidesPerGroup: +es[`slides_to_scroll_${name}`] || 1 };
    if (es.image_spacing_custom) bp.spaceBetween = responsiveSize(es, 'image_spacing_custom', name);
    o.breakpoints[BREAKPOINTS[name]] = bp;
    last = bp.slidesPerView;
  }
  if (es.autoplay === 'yes') o.autoplay = { delay: +es.autoplay_speed, disableOnInteraction: es.pause_on_interaction === 'yes' };
  if (single) {
    o.effect = es.effect || 'slide';
    if (o.effect === 'fade') o.fadeEffect = { crossFade: true };
  } else o.slidesPerGroup = +es.slides_to_scroll || 1;
  if (es.image_spacing_custom) o.spaceBetween = responsiveSize(es, 'image_spacing_custom', 'desktop');

  const showArrows = nested ? es.arrows === 'yes' : ['arrows', 'both'].includes(es.navigation);
  const showPagination = nested ? !!es.pagination : ['dots', 'both'].includes(es.navigation);
  if (showArrows) o.navigation = { prevEl: widget.querySelector('.elementor-swiper-button-prev'), nextEl: widget.querySelector('.elementor-swiper-button-next') };
  if (showPagination) {
    o.pagination = {
      el: widget.querySelector('.swiper-pagination'),
      type: nested ? es.pagination : 'bullets',
      clickable: true,
      renderBullet: (i, cls) => `<span class="${cls}" role="button" tabindex="0" data-bullet-index="${i}" aria-label="Go to slide ${i + 1}"></span>`,
    };
  }
  o.a11y = { enabled: true, prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide', firstSlideMessage: 'This is the first slide', lastSlideMessage: 'This is the last slide' };
  if (nested && !window.matchMedia('(pointer: coarse)').matches) o.shortSwipes = false;

  // Elementor's adjustConfig(): its "max-width" breakpoints become Swiper's "min-width" ones.
  const bps = o.breakpoints;
  const desktop = { slidesPerView: o.slidesPerView, slidesPerGroup: o.slidesPerGroup || 1 };
  o.breakpoints = { 0: bps[BREAKPOINTS.mobile], [BREAKPOINTS.mobile]: bps[BREAKPOINTS.tablet], [BREAKPOINTS.tablet]: desktop };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    o.speed = 0;
    delete o.autoplay;
  }
  return { o, pauseOnHover: es.pause_on_hover === 'yes' && !!o.autoplay };
}

async function carousel(widget, s, id, kind) {
  const container = widget.querySelector(kind === 'nested-carousel' ? '.e-n-carousel' : '.swiper');
  if (!container || container.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide').length < 2) return;
  const { default: Swiper, Navigation, Pagination, Autoplay, EffectFade, A11y } = await import('swiper');
  const { o, pauseOnHover } = swiperOptions(s, id, kind, widget);
  widget.classList.add('e-widget-swiper');
  const swiper = new Swiper(container, { modules: [Navigation, Pagination, Autoplay, EffectFade, A11y], ...o });
  const stop = () => swiper.autoplay?.stop();
  const start = () => swiper.autoplay?.start();
  if (pauseOnHover) {
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
  }
  return () => {
    container.removeEventListener('mouseenter', stop);
    container.removeEventListener('mouseleave', start);
    swiper.destroy(true, true);
  };
}

/* ---------- nested accordion ---------- */

function accordion(widget, s) {
  const duration = s.n_accordion_animation_duration?.size ?? 400;
  const ms = s.n_accordion_animation_duration?.unit === 's' ? duration * 1000 : duration;
  const maxOne = (s.max_items_expended || 'one') === 'one';
  const items = [...widget.querySelectorAll(':scope > .e-n-accordion > .e-n-accordion-item')];

  const animate = (item, open) => {
    const summary = item.querySelector(':scope > summary');
    const from = item.offsetHeight;
    if (open) item.open = true;
    const to = open ? item.offsetHeight : summary.offsetHeight;
    summary.setAttribute('aria-expanded', open ? 'true' : 'false');
    const anim = item.animate({ height: [`${from}px`, `${to}px`] }, { duration: ms, easing: 'ease-out' });
    item.style.overflow = 'hidden';
    anim.onfinish = () => {
      if (!open) item.open = false;
      item.style.overflow = '';
    };
  };

  const handlers = items.map(item => {
    const summary = item.querySelector(':scope > summary');
    const onClick = e => {
      e.preventDefault();
      if (item.open) return animate(item, false);
      if (maxOne) items.forEach(other => other !== item && other.open && animate(other, false));
      animate(item, true);
    };
    const onKey = e => {
      if (e.key === 'Escape' && item.open) animate(item, false);
    };
    summary.addEventListener('click', onClick);
    summary.addEventListener('keydown', onKey);
    return () => {
      summary.removeEventListener('click', onClick);
      summary.removeEventListener('keydown', onKey);
    };
  });
  return () => handlers.forEach(h => h());
}

/* ---------- nav menu (burger toggle, stretched dropdown, active anchors) ---------- */

function navMenu(widget, s) {
  const toggle = widget.querySelector('.elementor-menu-toggle');
  const dropdown = widget.querySelector('nav.elementor-nav-menu--dropdown');
  const cleanups = [];

  // StretchElement.stretch(): full viewport width, shifted back by the dropdown's own offset,
  // and placed just under the toggle.
  const stretch = () => {
    if (s.full_width !== 'stretch' || !dropdown) return;
    dropdown.style.width = '';
    dropdown.style.left = '';
    const offset = dropdown.getBoundingClientRect().left + window.scrollX;
    dropdown.style.width = `${document.documentElement.clientWidth}px`;
    dropdown.style.left = `${-offset}px`;
    if (toggle) dropdown.style.top = `${toggle.offsetHeight}px`;
  };
  const setOpen = open => {
    toggle?.classList.toggle('elementor-active', open);
    toggle?.setAttribute('aria-expanded', String(open));
    dropdown?.setAttribute('aria-hidden', String(!open));
    dropdown?.querySelectorAll('a').forEach(a => (open ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
    if (open) stretch();
  };
  if (toggle) {
    const onToggle = () => setOpen(!toggle.classList.contains('elementor-active'));
    const onKey = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle());
    toggle.addEventListener('click', onToggle);
    toggle.addEventListener('keydown', onKey);
    cleanups.push(() => toggle.removeEventListener('click', onToggle), () => toggle.removeEventListener('keydown', onKey));
  }
  if (dropdown) {
    const onLink = e => e.target.closest('a') && setOpen(false);
    dropdown.addEventListener('click', onLink);
    cleanups.push(() => dropdown.removeEventListener('click', onLink));
  }
  stretch();
  window.addEventListener('resize', stretch);
  cleanups.push(() => window.removeEventListener('resize', stretch));

  // AnchorLinks: highlight the menu link whose section crosses the middle of the viewport.
  const targets = [...widget.querySelectorAll('a.elementor-item-anchor')]
    .map(a => ({ a, target: document.getElementById(decodeURIComponent(a.hash.slice(1))) }))
    .filter(t => t.target);
  if (targets.length && 'IntersectionObserver' in window) {
    const vh = window.innerHeight;
    const observers = targets.map(({ a, target }) => {
      const end = -vh / 2;
      const start = target.offsetHeight > vh / 2 ? end : 0;
      const io = new IntersectionObserver(entries => entries.forEach(entry => {
        a.classList.toggle('elementor-item-active', entry.isIntersecting);
        a.setAttribute('aria-current', entry.isIntersecting ? 'location' : '');
      }), { rootMargin: `${start}px 0px ${end}px 0px` });
      io.observe(target);
      return io;
    });
    cleanups.push(() => observers.forEach(io => io.disconnect()));
  }
  return () => cleanups.forEach(c => c());
}

/* ---------- video (image overlay -> play), Wistia players ---------- */

function loadScript(src, attrs = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const el = document.createElement('script');
  el.src = src;
  el.async = true;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  document.body.appendChild(el);
}

function video(widget) {
  const wistia = widget.querySelector('wistia-player');
  if (wistia) {
    const mediaId = wistia.getAttribute('media-id');
    loadScript('https://fast.wistia.com/player.js');
    loadScript(`https://fast.wistia.com/embed/${mediaId}.js`, { type: 'module' });
  }
  const overlay = widget.querySelector('.elementor-custom-embed-image-overlay');
  if (!overlay) return;
  const play = () => {
    overlay.remove();
    if (wistia) wistia.play?.();
    else widget.querySelector('video')?.play();
  };
  const onKey = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), play());
  overlay.addEventListener('click', play);
  overlay.addEventListener('keydown', onKey);
  return () => {
    overlay.removeEventListener('click', play);
    overlay.removeEventListener('keydown', onKey);
  };
}

/* ---------- HTML widget: run its <script> tags ---------- */

function html(widget, s) {
  const added = (s.scripts || []).map(({ attrs, body }) => {
    if (attrs.src && document.querySelector(`script[src="${attrs.src}"]`)) return null;
    const el = document.createElement('script');
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (body) el.textContent = body;
    widget.appendChild(el);
    return el;
  });
  return () => added.forEach(el => el?.remove());
}

const BEHAVIOURS = {
  'nested-carousel': carousel,
  'image-carousel': carousel,
  'nested-accordion': accordion,
  'nav-menu': navMenu,
  video,
  html,
};
