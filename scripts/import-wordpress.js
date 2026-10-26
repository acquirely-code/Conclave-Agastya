// Build the project's data/ and public/wp-content/ from the WordPress backup.
// Run scripts/parse-dump.js first to turn the SQL dump into JSON.
// usage: node scripts/import-wordpress.js <parsed json dir> <backup public_html dir> <project dir>
const fs = require('fs');
const path = require('path');
const [, , dataDir, wpRoot, proj] = process.argv;
const posts = require(path.join(dataDir, 'posts.json'));
const meta = require(path.join(dataDir, 'meta.json'));
const options = require(path.join(dataDir, 'options.json'));

const SITE = 'https://conclave.agastya.org';
const used = new Set(); // wp-content relative paths that must be copied

// Minimal PHP unserialize (strings, ints, floats, bools, null, arrays).
function unserialize(s) {
  let i = 0;
  const buf = Buffer.from(s, 'utf8');
  const str = buf.toString('latin1'); // byte-indexed walk
  function readUntil(ch) { const j = str.indexOf(ch, i); const v = str.slice(i, j); i = j + 1; return v; }
  function val() {
    const t = str[i]; i += 2;
    if (t === 'N') return null;
    if (t === 'b') return readUntil(';') === '1';
    if (t === 'i') return parseInt(readUntil(';'), 10);
    if (t === 'd') return parseFloat(readUntil(';'));
    if (t === 's') {
      const len = parseInt(readUntil(':'), 10); i++;
      const v = Buffer.from(str.slice(i, i + len), 'latin1').toString('utf8'); i += len + 2; return v;
    }
    if (t === 'a') {
      const n = parseInt(readUntil(':'), 10); i++;
      const out = {}; let isList = true;
      for (let k = 0; k < n; k++) { const key = val(); if (key !== k) isList = false; out[key] = val(); }
      i++;
      return isList ? Object.values(out) : out;
    }
    throw new Error('unsupported type ' + t + ' at ' + i);
  }
  return val();
}

// Rewrite absolute site URLs to root-relative and remember every upload referenced.
function rewrite(text) {
  return text.replace(/https?:\\?\/\\?\/conclave\.agastya\.org(\\?\/wp-content\\?\/[^"'\s)<>]+)/g, (m, p) => {
    const clean = p.replace(/\\\//g, '/').replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    used.add(decodeURI(clean).replace(/^\/wp-content\//, ''));
    return p;
  });
}

function attachmentUrl(id, size) {
  const file = meta[id]?._wp_attached_file;
  if (!file) return '';
  let rel = file;
  if (size) {
    const md = unserialize(meta[id]._wp_attachment_metadata || 'a:0:{}');
    const s = md.sizes && md.sizes[size];
    if (s) rel = path.posix.join(path.posix.dirname(file), s.file);
  }
  used.add('uploads/' + rel);
  return '/wp-content/uploads/' + rel;
}

const out = p => { const f = path.join(proj, p); fs.mkdirSync(path.dirname(f), { recursive: true }); return f; };

// 1. Elementor documents
const docs = { 25: 'home', 16: 'header', 583: 'header-alt', 29: 'footer', 571: 'welcome-to-kuppam', 572: 'thank-you' };
for (const [id, name] of Object.entries(docs)) {
  const data = JSON.parse(rewrite(meta[id]._elementor_data));
  const post = posts.find(p => p.id === +id);
  fs.writeFileSync(out(`data/elementor/${name}.json`), JSON.stringify({ id: +id, title: post.title, slug: post.slug, elements: data }, null, 1));
}

// 2. Testimonials ([agastya_testimonials])
const testimonials = posts
  .filter(p => p.type === 'agt_testimonial' && p.status === 'publish')
  .sort((a, b) => a.menu_order - b.menu_order || a.id - b.id)
  .map(p => {
    const m = meta[p.id] || {};
    return { name: m._agt_name || p.title, body: m._agt_body || '', foot1: m._agt_foot1 || '', foot2: m._agt_foot2 || '', image: m._thumbnail_id ? attachmentUrl(m._thumbnail_id, 'medium') : '' };
  });
fs.writeFileSync(out('data/testimonials.json'), JSON.stringify(testimonials, null, 1));

// 3. Lab sections settings ([lab_progress], [lab_stations])
fs.writeFileSync(out('data/lab-sections.json'), JSON.stringify(unserialize(options.labsec_settings), null, 1));

// 4. Site settings: logo, favicon, menu
const menu = posts.filter(p => p.type === 'nav_menu_item').sort((a, b) => a.menu_order - b.menu_order)
  .map(p => ({ title: p.title, url: meta[p.id]._menu_item_url }));
const logoMeta = unserialize(meta[21]._wp_attachment_metadata);
const site = {
  name: options.blogname,
  url: SITE,
  logo: { url: attachmentUrl(21), width: logoMeta.width, height: logoMeta.height },
  icons: { 32: attachmentUrl(+options.site_icon, 'site_icon-32') || attachmentUrl(+options.site_icon), 180: attachmentUrl(+options.site_icon, 'site_icon-180'), 192: attachmentUrl(+options.site_icon, 'site_icon-192'), 270: attachmentUrl(+options.site_icon, 'site_icon-270') },
  menu,
  metaPixelId: unserialize(options._transient_facebook_pixel_aam_settings).pixelId,
};
fs.writeFileSync(out('data/site.json'), JSON.stringify(site, null, 1));

// 5. CSS: Elementor-generated post CSS + kit, plugin/theme/library CSS (same paths as WordPress)
for (const f of fs.readdirSync(path.join(wpRoot, 'wp-content/uploads/elementor/css'))) {
  if (!f.endsWith('.css')) continue;
  const css = rewrite(fs.readFileSync(path.join(wpRoot, 'wp-content/uploads/elementor/css', f), 'utf8'));
  fs.writeFileSync(out('public/wp-content/uploads/elementor/css/' + f), css);
}
const copyTree = [
  'plugins/elementor/assets/css/frontend.min.css',
  'plugins/elementor/assets/css/conditionals/e-swiper.min.css',
  ...['heading', 'text-editor', 'icon-box', 'image', 'image-carousel', 'icon-list', 'video', 'image-box', 'divider', 'nested-accordion']
    .map(w => `plugins/elementor/assets/css/widget-${w}.min.css`),
  'plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css',
  'plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css',
  'plugins/elementor/assets/lib/eicons/fonts',
  'plugins/elementor/assets/lib/font-awesome/css/fontawesome.min.css',
  'plugins/elementor/assets/lib/font-awesome/css/solid.min.css',
  'plugins/elementor/assets/lib/font-awesome/css/regular.min.css',
  'plugins/elementor/assets/lib/font-awesome/css/brands.min.css',
  'plugins/elementor/assets/lib/font-awesome/webfonts',
  'plugins/elementor/assets/mask-shapes',
  'plugins/elementor-pro/assets/css/widget-nav-menu.min.css',
  'plugins/elementor-pro/assets/css/widget-nested-carousel.min.css',
  'plugins/elementor-pro/assets/css/widget-carousel-module-base.min.css',
  'themes/hello-elementor/assets/css/reset.css',
  'themes/hello-elementor/assets/css/theme.css',
  'themes/hello-elementor/assets/css/header-footer.css',
  'plugins/lab-sections/assets/css/lab-sections.css',
  'plugins/agastya-testimonials-7/assets/agastya-testimonials.css',
  'plugins/kuppam-thankyou-pages/assets/conclave-thankyou.css',
  'plugins/header-footer-elementor/assets/css/header-footer-elementor.css',
];
for (const rel of copyTree) {
  const src = path.join(wpRoot, 'wp-content', rel);
  if (!fs.existsSync(src)) { console.log('MISSING', rel); continue; }
  fs.cpSync(src, out('public/wp-content/' + rel), { recursive: true });
}
// Custom CSS from the Customizer (Additional CSS)
fs.writeFileSync(out('public/wp-content/custom.css'), posts.find(p => p.id === 775).content);

// 6. Attachment metadata for every image referenced by id (sizes for wp_get_attachment_image)
const attachments = {};
const ids = new Set();
const collectIds = v => {
  if (Array.isArray(v)) return v.forEach(collectIds);
  if (v && typeof v === 'object') { if (v.id && v.url && /\/wp-content\//.test(v.url)) ids.add(+v.id); Object.values(v).forEach(collectIds); }
};
for (const name of Object.values(docs)) collectIds(require(path.join(proj, `data/elementor/${name}.json`)).elements);
for (const id of ids) {
  const p = posts.find(x => x.id === id);
  const m = meta[id];
  if (!p || !m || !m._wp_attached_file) continue;
  const md = m._wp_attachment_metadata ? unserialize(m._wp_attachment_metadata) : {};
  const dir = path.posix.dirname(m._wp_attached_file);
  const sizes = {};
  for (const [k, s] of Object.entries(md.sizes || {})) {
    if (!s.file) continue;
    // Elementor custom sizes are stored relative to the uploads root (elementor/thumbs/...)
    const rel = s.file.includes('/') ? s.file : `${dir}/${s.file}`;
    sizes[k] = { url: `/wp-content/uploads/${rel}`, width: s.width, height: s.height };
    used.add(`uploads/${rel}`);
  }
  used.add('uploads/' + m._wp_attached_file);
  attachments[id] = { url: '/wp-content/uploads/' + m._wp_attached_file, width: md.width || null, height: md.height || null, alt: m._wp_attachment_image_alt || '', title: p.title, mime: p.mime, sizes };
}
fs.writeFileSync(out('data/attachments.json'), JSON.stringify(attachments));

// 7. Copy every referenced upload (the large principal videos are served from Wistia instead)
const SKIP = /\/Dr-.*\.mp4$/;
let missing = 0, bytes = 0;
for (const rel of [...used].sort()) {
  if (SKIP.test(rel)) continue;
  const src = path.join(wpRoot, 'wp-content', rel);
  if (!fs.existsSync(src)) { console.log('MISSING upload', rel); missing++; continue; }
  fs.cpSync(src, out('public/wp-content/' + rel));
  bytes += fs.statSync(src).size;
}
console.log(`copied ${used.size - missing} uploads (${(bytes / 1e6).toFixed(1)} MB), missing ${missing}`);
console.log('testimonials', testimonials.length, 'menu', menu.length, 'pixel', site.metaPixelId);
