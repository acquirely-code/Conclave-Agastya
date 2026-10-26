// An Elementor document (page, header or footer template) with its wrapper, as Elementor prints it.
import { Elements } from './elementor/Element';

export default function ElementorDocument({ doc, type = 'wp-page', postType = 'page', as: Tag = 'div', className = '' }) {
  return (
    <Tag data-elementor-type={type} data-elementor-id={doc.id} className={`elementor elementor-${doc.id}${className ? ' ' + className : ''}`} data-elementor-post-type={postType}>
      <Elements elements={doc.elements} />
    </Tag>
  );
}
