import DefaultPage from '@/components/DefaultPage';
import doc from '@/data/elementor/thank-you.json';

export const metadata = { title: doc.title };

export default function ThankYou() {
  return <DefaultPage doc={doc} />;
}
