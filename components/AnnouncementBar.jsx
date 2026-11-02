// Scrolling announcement strip above the header. Text lives in data/site.json → announcement (empty hides it).
import site from '@/data/site.json';

export default function AnnouncementBar() {
  const text = String(site.announcement ?? '').trim();
  if (!text) return null;
  // The text is repeated so the strip loops seamlessly: the track scrolls by exactly one half.
  const half = Array.from({ length: 3 }, (_, i) => <span key={i} className="announce-bar__item">{text}</span>);
  return (
    <div className="announce-bar" role="region" aria-label="Announcement">
      <p className="screen-reader-text">{text}</p>
      <div className="announce-bar__track" aria-hidden="true">
        {half}
        {half}
      </div>
    </div>
  );
}
