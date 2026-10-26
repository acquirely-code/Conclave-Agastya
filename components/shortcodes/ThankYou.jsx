// [conclave_thankyou_reserved] and [conclave_thankyou_callback] from the "Thank You Pages" plugin.
const WHATSAPP = '918041124132';

const CALENDAR_URL = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
  encodeURIComponent('Principal Conclave 2026 – Agastya Creativity Campus, Kuppam') +
  '&dates=20261203/20261206' +
  '&details=' + encodeURIComponent('The Principal Conclave 2026. Agastya Creativity Campus, Kuppam.') +
  '&location=' + encodeURIComponent('Agastya Creativity Campus, Kuppam');

const ICONS = {
  check: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 013.6-11.3A8.38 8.38 0 0121 11.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.5a16 16 0 006 6l1.1-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.8 5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-2-1.2 7.4 7.4 0 01-1.3-1.7c-.2-.3 0-.4.1-.6l.4-.5.3-.4v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.5H6.9a1 1 0 00-.7.3 3 3 0 00-1 2.3 5.3 5.3 0 001.1 2.8 12 12 0 004.6 4 15 15 0 001.5.6 3.7 3.7 0 001.7.1 2.8 2.8 0 001.8-1.3 2.3 2.3 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/></svg>',
};

const Icon = ({ name, className }) => <span className={className} dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
// Icons the plugin prints straight inside a link or button, without a wrapper span.
const Inline = ({ name }) => <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;

export function ThankYouReserved() {
  const share = 'https://wa.me/?text=' + encodeURIComponent("I've reserved my seat for the Principal Conclave 2026 in Kuppam (Dec 3–5). You should be in the room too — reserve yours.");
  return (
    <div className="conclave-typ conclave-typ--reserved">
      <div className="conclave-typ__aura"></div>
      <div className="conclave-typ__card">
        <div className="conclave-typ__badge">
          <span className="conclave-typ__badge-ring"></span>
          <Icon name="check" className="conclave-typ__badge-icon" />
        </div>

        <span className="conclave-typ__eyebrow">Principal Conclave 2026</span>
        <h1 className="conclave-typ__headline">Your seat is now <span className="conclave-typ__accent">reserved.</span></h1>

        <p className="conclave-typ__subhead">
          <Icon name="pin" className="conclave-typ__pin" />
          <span>Agastya Creativity Campus, Kuppam &middot; <strong>Dec 3&ndash;5</strong></span>
        </p>

        <p className="conclave-typ__body">
          A confirmation email is on its way with your receipt and details. Over the coming weeks, registered leaders are the first to receive the full agenda, speaker announcements, and travel instructions to Kuppam.
        </p>

        <div className="conclave-typ__divider"><span>What happens next</span></div>

        <ul className="conclave-typ__steps">
          <li className="conclave-typ__step">
            <Icon name="mail" className="conclave-typ__step-icon" />
            <span className="conclave-typ__step-text">
              <strong>Check your inbox</strong> for your confirmation and receipt <em>(do check spam, just in case).</em>
            </span>
          </li>
          <li className="conclave-typ__step">
            <Icon name="calendar" className="conclave-typ__step-icon" />
            <span className="conclave-typ__step-text">
              <strong>Add the dates</strong> &mdash; Dec 3&ndash;5, 2026 &mdash; to your calendar now.{' '}
              <a className="conclave-typ__inline-btn" href={CALENDAR_URL} target="_blank" rel="noopener">
                <Inline name="calendar" /> Add to Calendar
              </a>
            </span>
          </li>
          <li className="conclave-typ__step">
            <Icon name="chat" className="conclave-typ__step-icon" />
            <span className="conclave-typ__step-text">
              <strong>Our team will be in touch</strong> with everything you need before December.
            </span>
          </li>
        </ul>

        <div className="conclave-typ__soft">
          <Icon name="users" className="conclave-typ__soft-icon" />
          <div className="conclave-typ__soft-text">
            <p>Know another school leader who should be in the room? The best cohorts are built on people who bring a peer.</p>
            <a className="conclave-typ__ghost-btn" href={share} target="_blank" rel="noopener">
              <Inline name="whatsapp" /> Share on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThankYouCallback() {
  return (
    <div className="conclave-typ conclave-typ--callback">
      <div className="conclave-typ__aura"></div>
      <div className="conclave-typ__card">
        <div className="conclave-typ__badge conclave-typ__badge--phone">
          <span className="conclave-typ__badge-ring"></span>
          <Icon name="phone" className="conclave-typ__badge-icon" />
        </div>

        <span className="conclave-typ__eyebrow">Principal Conclave 2026</span>
        <h1 className="conclave-typ__headline">Thanks for requesting a <span className="conclave-typ__accent">call back.</span></h1>

        <p className="conclave-typ__body conclave-typ__body--lead">
          One of our team will reach out during the time-slot you&rsquo;ve selected to answer your questions and walk you through everything &mdash; the format, the campus, and how to secure your seat.
        </p>

        <div className="conclave-typ__divider"><span>While you wait</span></div>

        <div className="conclave-typ__cta-panel">
          <Icon name="clock" className="conclave-typ__cta-icon" />
          <div className="conclave-typ__cta-body">
            <p className="conclave-typ__cta-lead"><strong>Seats are capped at 100 &mdash; and moving fast.</strong></p>
            <p>If you already know you want in, you don&rsquo;t have to wait for the call.</p>
            <a className="conclave-typ__primary-btn" href="https://rzp.io/rzp/ELC2026">
              Reserve your seat now <Inline name="arrow" />
            </a>
          </div>
        </div>

        <p className="conclave-typ__note">
          <Icon name="mail" className="conclave-typ__note-icon" />
          Keep an eye on your inbox &mdash; we&rsquo;ll drop you a note shortly.
        </p>

        <div className="conclave-typ__soft">
          <Icon name="chat" className="conclave-typ__soft-icon" />
          <div className="conclave-typ__soft-text">
            <p>Questions before we speak? Reply to our email or reach us here:</p>
            <div className="conclave-typ__contact-row">
              <a className="conclave-typ__ghost-btn" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">
                <Inline name="whatsapp" /> WhatsApp
              </a>
              <a className="conclave-typ__ghost-btn" href={`tel:+${WHATSAPP}`}>
                <Inline name="phone" /> Call us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
