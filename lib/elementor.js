// Helpers that reproduce Elementor's PHP rendering rules (class names, images, icons),
// so the original Elementor CSS from WordPress applies to our markup unchanged.
import fs from 'node:fs';
import path from 'node:path';
import attachments from '@/data/attachments.json';

const DEVICES = ['', '_tablet', '_mobile'];

export function cx(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ');
}

// A responsive control with `prefix_class`: '%s' becomes '', '-tablet', '-mobile'.
export function responsiveClasses(s, key, prefix, desktopDefault = '') {
  return DEVICES.map(device => {
    const value = s[key + device] ?? (device === '' ? desktopDefault : '');
    if (value === '' || value == null) return '';
    const p = prefix.includes('%s') ? prefix.replace('%s', device ? '-' + device.slice(1) : '') : prefix;
    return p + value;
  });
}

export function hideClasses(s) {
  return ['desktop', 'tablet', 'mobile'].map(d => (s['hide_' + d] ? 'elementor-' + s['hide_' + d] : ''));
}

// Classes every widget gets from the Advanced tab.
export function commonWidgetClasses(s) {
  return [
    responsiveClasses(s, '_element_width', 'elementor-widget%s__width-'),
    s._position ? 'elementor-' + s._position : '',
    s._css_classes || '',
    hideClasses(s),
  ];
}

export function linkProps(link) {
  if (!link || !link.url) return null;
  const props = { href: link.url };
  if (link.is_external) props.target = '_blank';
  const rel = [link.nofollow ? 'nofollow' : '', link.is_external ? 'noopener' : ''].filter(Boolean).join(' ');
  if (rel) props.rel = rel;
  return props;
}

// wp_get_attachment_image(): pick the registered size, fall back to the full file.
export function attachmentImage(image, size = 'full', customDimension) {
  const att = image?.id ? attachments[image.id] : null;
  if (!att) return image?.url ? { src: image.url, alt: image.alt || '' } : null;
  let pick = { url: att.url, width: att.width, height: att.height };
  if (size === 'custom' && customDimension) {
    const key = `elementor_custom_${customDimension.width || ''}x${customDimension.height || ''}`;
    if (att.sizes[key]) pick = att.sizes[key];
  } else if (size !== 'full' && att.sizes[size]) {
    pick = att.sizes[size];
  }
  const srcSet = att.width && size !== 'custom'
    ? [...Object.values(att.sizes).filter(s => s.width && s.height && Math.abs(s.width / s.height - att.width / att.height) < 0.02 && s.width <= (pick.width || Infinity)), { url: att.url, width: att.width, height: att.height }]
      .filter(s => s.width <= (pick.width || Infinity))
      .sort((a, b) => a.width - b.width)
      .filter((s, i, arr) => arr.findIndex(o => o.width === s.width) === i)
    : [];
  return {
    src: pick.url,
    width: pick.width || undefined,
    height: pick.height || undefined,
    alt: att.alt,
    className: `attachment-${size} size-${size} wp-image-${image.id}`,
    srcSet: srcSet.length > 1 ? srcSet.map(s => `${s.url} ${s.width}w`).join(', ') : undefined,
    sizes: srcSet.length > 1 && pick.width ? `(max-width: ${pick.width}px) 100vw, ${pick.width}px` : undefined,
  };
}

// Icons_Manager::render_icon(): uploaded SVGs are inlined, font icons become <i>.
const svgCache = new Map();
function inlineSvg(url) {
  if (!svgCache.has(url)) {
    const file = path.join(process.cwd(), 'public', decodeURI(url));
    const raw = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    svgCache.set(url, raw.replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '').trim());
  }
  return svgCache.get(url);
}

export function iconHtml(icon, extraClass = '') {
  if (!icon || !icon.value) return '';
  if (icon.library === 'svg') return inlineSvg(icon.value.url);
  return `<i aria-hidden="true" class="${cx(extraClass, icon.value)}"></i>`;
}

export function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function attrs(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');
}

export function linkAttrs(link) {
  const p = linkProps(link);
  return p ? attrs(p) : '';
}

export function imgHtml(img, extra = {}) {
  if (!img) return '';
  return `<img ${attrs({ decoding: 'async', loading: 'lazy', width: img.width, height: img.height, src: img.src, class: img.className, alt: img.alt ?? '', srcset: img.srcSet, sizes: img.sizes, ...extra })} />`;
}
