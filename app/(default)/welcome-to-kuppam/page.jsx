import DefaultPage from '@/components/DefaultPage';
import doc from '@/data/elementor/welcome-to-kuppam.json';

export const metadata = { title: doc.title };

export default function WelcomeToKuppam() {
  return <DefaultPage doc={doc} />;
}
