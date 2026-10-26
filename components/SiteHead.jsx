// <head> contents shared by every page: stylesheets in WordPress's load order, fonts, Meta Pixel.
import site from '@/data/site.json';

const WP = '/wp-content';

export const STYLESHEETS = [
  `${WP}/themes/hello-elementor/assets/css/reset.css`,
  `${WP}/themes/hello-elementor/assets/css/theme.css`,
  `${WP}/themes/hello-elementor/assets/css/header-footer.css`,
  `${WP}/plugins/header-footer-elementor/assets/css/header-footer-elementor.css`,
  `${WP}/plugins/elementor/assets/css/frontend.min.css`,
  `${WP}/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css`,
  `${WP}/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css`,
  `${WP}/plugins/elementor/assets/css/conditionals/e-swiper.min.css`,
  `${WP}/uploads/elementor/css/post-6.css`,
  `${WP}/plugins/elementor-pro/assets/css/widget-nav-menu.min.css`,
  `${WP}/plugins/elementor-pro/assets/css/widget-carousel-module-base.min.css`,
  `${WP}/plugins/elementor-pro/assets/css/widget-nested-carousel.min.css`,
  ...['heading', 'text-editor', 'icon-box', 'image', 'image-carousel', 'icon-list', 'video', 'image-box', 'divider', 'nested-accordion']
    .map(w => `${WP}/plugins/elementor/assets/css/widget-${w}.min.css`),
  `${WP}/plugins/elementor/assets/lib/font-awesome/css/fontawesome.min.css`,
  `${WP}/plugins/elementor/assets/lib/font-awesome/css/solid.min.css`,
  `${WP}/plugins/elementor/assets/lib/font-awesome/css/regular.min.css`,
  `${WP}/plugins/elementor/assets/lib/font-awesome/css/brands.min.css`,
  `${WP}/plugins/agastya-testimonials-7/assets/agastya-testimonials.css`,
];

// Fonts used across the Elementor kit, page CSS and plugins.
const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@100..900&display=swap';

const PIXEL = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${site.metaPixelId}');
fbq('track', 'PageView');`;

// `pageStyles`: Elementor post CSS for the documents on this page, then plugin CSS printed in the footer.
export default function SiteHead({ pageStyles = [] }) {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {[...STYLESHEETS, ...pageStyles].map(href => <link key={href} rel="stylesheet" href={href} />)}
      <link rel="stylesheet" href={GOOGLE_FONTS} />
      <link rel="stylesheet" href={`${WP}/custom.css`} />
      <script dangerouslySetInnerHTML={{ __html: PIXEL }} />
    </head>
  );
}

export function PixelNoscript() {
  return (
    <noscript>
      <img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${site.metaPixelId}&ev=PageView&noscript=1`} />
    </noscript>
  );
}

export const siteIcons = {
  icon: [{ url: site.icons[32], sizes: '32x32' }, { url: site.icons[192], sizes: '192x192' }],
  apple: [{ url: site.icons[180] }],
};
