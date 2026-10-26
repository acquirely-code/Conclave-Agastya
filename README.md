# Education Leaders Conclave 2026 — conclave.agastya.org

The landing site for Agastya International Foundation's **Education Leaders Conclave 2026** (10–12 Dec 2026, Agastya Creativity Campus, Kuppam).

It was originally a WordPress + Elementor site on Hostinger. This repo rebuilds it in **Next.js (React)** from that site's backup. The layout and styling are the same, but it needs no PHP or database: it exports to static files and deploys to Vercel.

## Pages

| URL | What it is |
|---|---|
| `/` | Home page |
| `/welcome-to-kuppam` | Thank-you page after buying a seat (Razorpay) |
| `/thank-you` | Thank-you page after requesting a call back (Zoho form) |

Payments and call-back requests are handled by external services:
- Razorpay: `https://rzp.io/rzp/ELC2026`
- Zoho Forms: `https://zfrmz.in/Tcz7v0rVoMUDoBoxPyJg`

## Quick start

Requires Node.js 18.18 or newer.

```bash
npm install
npm run dev      # http://localhost:3000 with live reload
```

Production build:

```bash
npm run build    # static site written to out/
npm start        # serve out/ on http://localhost:3000
```

## Editing content

All content is in `data/`. Edit the file, save, and the dev server reloads.

| To change | Edit |
|---|---|
| Wistia video for each video slot | `data/videos.json` (paste the Wistia media ID, the last part of the Wistia link) |
| Seats claimed / progress bar title | `data/lab-sections.json` → `pb_claimed`, `pb_total`, `pb_title` |
| The five AI Lab stations | `data/lab-sections.json` → `stations` |
| Testimonials slider | `data/testimonials.json` |
| Header menu links | `data/site.json` → `menu` |
| Meta Pixel ID | `data/site.json` → `metaPixelId` |
| Any other text, price or link on a page | search for the text in `data/elementor/*.json` and edit it in place |

Images and other media live in `public/wp-content/uploads/`, with the same paths they had on WordPress.

## Project structure

```
app/                         Next.js routes
  (full-width)/              home page with its own <html>/<body> layout
  (default)/                 thank-you pages (welcome-to-kuppam, thank-you)
  lightbox.css
components/
  elementor/                 renders Elementor layouts as React
    Element.jsx              containers and widgets
    markup.jsx               carousel, accordion, menu, video markup
    Interactive.jsx          client-side behaviour (Swiper carousels, accordion, mobile menu, video)
    Frontend.jsx             smooth anchor scrolling and image lightbox
  shortcodes/                the custom WordPress plugins, ported to React
  SiteHead.jsx               stylesheets, fonts, Meta Pixel
  ElementorDocument.jsx, DefaultPage.jsx
lib/
  elementor.js               Elementor class names, image sizes, icons
  widgets.js                 static widgets (heading, text, image, button, ...)
  texturize.js               WordPress-style curly quotes and dashes
data/                        page content (see "Editing content")
public/wp-content/           original Elementor/theme CSS, fonts, icons and uploaded media
scripts/                     one-off import from the WordPress backup
```

### How the rendering works

Elementor stores each page as a JSON tree of containers and widgets (`data/elementor/*.json`). The components in `components/elementor/` turn that tree into the same HTML that Elementor 4.3 would output. The original stylesheets in `public/wp-content/` then style it exactly as on WordPress, including Elementor's generated per-page CSS in `uploads/elementor/css/post-*.css`.

If you change layout or styles in a JSON file, also check the matching `post-<id>.css` file: Elementor's styles are keyed to element IDs (`.elementor-element-<id>`).

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, go to **Add New → Project**, import the repo and keep the defaults (Vercel detects Next.js).
3. Check the `*.vercel.app` preview URL.
4. Go to **Settings → Domains** and add `conclave.agastya.org`.
5. At the DNS provider for `agastya.org`, point the `conclave` record to `cname.vercel-dns.com` with a CNAME, and remove the old record pointing to Hostinger.

Every push to `main` redeploys automatically.

## Re-importing from WordPress (optional)

`scripts/` contains the tools that produced `data/` and `public/wp-content/` from the Hostinger backup. You only need them to re-import from a newer backup:

```bash
node scripts/parse-dump.js  <u212220198_nWJio.sql>  <tmp-dir>
node scripts/import-wordpress.js  <tmp-dir>  <backup>/public_html  .
```

Never commit the backup itself (`.sql`, `.tar.gz`). It contains database credentials and personal data, and `.gitignore` excludes it.

## Known gaps compared with the WordPress site

- The cookie-consent banner and accessibility widget were paid Elementor plugins and are not included.
- The three principal testimonial videos (150–230 MB each) are too big for GitHub or Vercel. Upload them to Wistia and add their IDs to `data/videos.json`.
