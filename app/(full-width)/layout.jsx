// Home page: Elementor "Full Width" template with the Elementor Pro header (#16) and footer (#29).
import '../lightbox.css';
import SiteHead, { PixelNoscript, siteIcons } from '@/components/SiteHead';
import Frontend from '@/components/elementor/Frontend';

export const metadata = { title: 'Agastya', icons: siteIcons };

const CSS = '/wp-content/uploads/elementor/css';

export default function FullWidthLayout({ children }) {
  return (
    <html lang="en-US">
      <SiteHead pageStyles={[`${CSS}/post-16.css`, `${CSS}/post-29.css`, `${CSS}/post-25.css`, '/wp-content/plugins/lab-sections/assets/css/lab-sections.css']} />
      <body className="home wp-singular page-template page-template-elementor_header_footer page page-id-25 wp-custom-logo wp-embed-responsive wp-theme-hello-elementor hello-elementor-default elementor-default elementor-template-full-width elementor-kit-6 elementor-page elementor-page-25">
        <PixelNoscript />
        <a className="skip-link screen-reader-text" href="#content">Skip to content</a>
        {children}
        <Frontend />
      </body>
    </html>
  );
}
