// [lab_progress] and [lab_stations] from the "Lab Sections" plugin. Text lives in data/lab-sections.json.
import saved from '@/data/lab-sections.json';
import { ProgressObserver, StationsScroll } from './LabSectionsClient';

const DEFAULTS = {
  pb_title: '20 (Early Bird)', pb_claimed: 12, pb_total: 100, pb_percent: 24, pb_left: '0', pb_right: '{claimed} / {total} Claimed', pb_note: 'All Inclusive (stay, meals and Services)',
  st_eyebrow: 'The AI Experience Lab', st_heading: 'Five stations. You work every one.',
  st_sub: 'You sit down at each station and use the tools your teachers are already quietly using — and find out exactly where they help, and exactly where they fail.',
  st_footer: 'You leave the Lab with a first-hand map of what it can carry in your school, and what it cannot.',
};
const settings = { ...DEFAULTS, ...saved };

// Card-centre coordinates in the 1100 x 640 SVG space + how far along the path the line
// must be drawn before each station fades in.
const POINTS = [
  { x: 170, y: 60, reveal: 0.02 },
  { x: 820, y: 60, reveal: 0.2 },
  { x: 640, y: 268, reveal: 0.45 },
  { x: 390, y: 476, reveal: 0.76 },
  { x: 1020, y: 476, reveal: 0.95 },
];

export function LabProgress({ atts = {} }) {
  const a = {
    title: settings.pb_title, claimed: settings.pb_claimed, total: settings.pb_total, percent: settings.pb_percent,
    left: settings.pb_left, right: settings.pb_right, note: settings.pb_note, ...atts,
  };
  const claimed = Math.max(0, parseInt(a.claimed, 10) || 0);
  const total = Math.max(1, parseInt(a.total, 10) || 1);
  const percent = Math.max(0, Math.min(100, String(a.percent ?? '').trim() === '' ? (claimed / total) * 100 : parseFloat(a.percent)));
  const right = String(a.right).replaceAll('{claimed}', claimed).replaceAll('{total}', total);

  return (
    <ProgressObserver>
      <h3 className="labsec-progress__title">{a.title}</h3>
      <div className="labsec-progress__wrap">
        <div className="labsec-progress__track" role="progressbar" aria-valuemin="0" aria-valuemax={total} aria-valuenow={claimed} aria-label={a.title}>
          <div className="labsec-progress__fill" style={{ '--labsec-target': `${percent}%` }}></div>
        </div>
        <div className="labsec-progress__labels">
          <span className="labsec-progress__zero">{a.left}</span>
          <span className="labsec-progress__claimed">{right}</span>
        </div>
      </div>
      {String(a.note).trim() !== '' && <p className="labsec-progress__note">{a.note}</p>}
    </ProgressObserver>
  );
}

export function LabStations({ atts = {} }) {
  const a = { eyebrow: settings.st_eyebrow, heading: settings.st_heading, sub: settings.st_sub, footer: settings.st_footer, ...atts };
  return (
    <StationsScroll>
      <header className="labsec-stations__head">
        <p className="labsec-stations__eyebrow">{a.eyebrow}</p>
        <h2 className="labsec-stations__heading">{a.heading}</h2>
        <p className="labsec-stations__sub">{a.sub}</p>
      </header>

      <div className="labsec-stations__map">
        <svg className="labsec-stations__svg" viewBox="0 0 1100 640" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <path className="labsec-stations__path" pathLength="1" d="M 170 60 H 940 A 104 104 0 0 1 940 268 H 210 A 104 104 0 0 0 210 476 H 1030" stroke="#FF7D32" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {settings.stations.slice(0, 5).map((st, i) => (
          <div key={i} className="labsec-station" data-reveal={POINTS[i].reveal} style={{ '--labsec-x': `${(POINTS[i].x / 1100) * 100}%`, '--labsec-y': `${(POINTS[i].y / 640) * 100}%` }}>
            <div className="labsec-station__num"><span>{String(i + 1).padStart(2, '0')}</span></div>
            <div className="labsec-station__text">
              <h3 className="labsec-station__title">{st.title}</h3>
              <p className="labsec-station__desc">{st.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {String(a.footer).trim() !== '' && (
        <div className="labsec-stations__footer">
          <svg className="labsec-stations__door" width="20" height="35" viewBox="0 0 20 35" fill="none" aria-hidden="true">
            <path d="M2 3 L14 0.5 V34.5 L2 32 Z" fill="#FF7D32" />
            <path d="M2 3 H18.5 V32 H2" stroke="#FF7D32" strokeWidth="1.6" fill="none" />
            <circle cx="11" cy="17.5" r="1.4" fill="#FFFFFF" />
          </svg>
          <p>{a.footer}</p>
        </div>
      )}
    </StationsScroll>
  );
}
