import ElementorDocument from '@/components/ElementorDocument';
import AnnouncementBar from '@/components/AnnouncementBar';
import header from '@/data/elementor/header.json';
import home from '@/data/elementor/home.json';
import footer from '@/data/elementor/footer.json';

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <ElementorDocument doc={header} as="header" type="header" postType="elementor_library" className="elementor-location-header" />
      <ElementorDocument doc={home} />
      <ElementorDocument doc={footer} as="footer" type="footer" postType="elementor_library" className="elementor-location-footer" />
    </>
  );
}
