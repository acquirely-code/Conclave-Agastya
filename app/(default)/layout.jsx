// Thank-you pages: Hello theme default template, "Header Footer Elementor" header (#583)
// and the Elementor Pro footer (#29).
import '../lightbox.css';
import SiteHead, { PixelNoscript, siteIcons } from '@/components/SiteHead';
import Frontend from '@/components/elementor/Frontend';
import ElementorDocument from '@/components/ElementorDocument';
import headerAlt from '@/data/elementor/header-alt.json';
import footer from '@/data/elementor/footer.json';
import site from '@/data/site.json';

export const metadata = { title: { template: `%s – ${site.name}`, default: site.name }, icons: siteIcons };

const CSS = '/wp-content/uploads/elementor/css';

export default function DefaultLayout({ children }) {
  return (
    <html lang="en-US">
      <SiteHead pageStyles={[`${CSS}/post-583.css`, `${CSS}/post-29.css`, `${CSS}/post-572.css`, '/wp-content/plugins/kuppam-thankyou-pages/assets/conclave-thankyou.css']} />
      <body className="wp-singular page-template-default page wp-custom-logo wp-embed-responsive wp-theme-hello-elementor ehf-header ehf-template-hello-elementor ehf-stylesheet-hello-elementor hello-elementor-default elementor-default elementor-kit-6 elementor-page">
        <PixelNoscript />
        <div id="page" className="hfeed site">
          <a className="skip-link screen-reader-text" href="#content">Skip to content</a>
          <header id="masthead" itemScope itemType="https://schema.org/WPHeader">
            <p className="main-title bhf-hidden" itemProp="headline"><a href="/" title={site.name} rel="home">{site.name}</a></p>
            <ElementorDocument doc={headerAlt} type="wp-post" postType="elementor-hf" />
          </header>
          {children}
          <ElementorDocument doc={footer} as="footer" type="footer" postType="elementor_library" className="elementor-location-footer" />
        </div>
        <Frontend />
      </body>
    </html>
  );
}
