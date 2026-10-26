// Hello theme's single-page template. The page title is hidden ("Hide Title" is on for both pages).
import ElementorDocument from './ElementorDocument';

export default function DefaultPage({ doc }) {
  return (
    <main id="content" className={`site-main post-${doc.id} page type-page status-publish hentry`}>
      <div className="page-content">
        <ElementorDocument doc={doc} />
      </div>
    </main>
  );
}
