'use client';
// "Request A Call Back" pop-up: saves the principal's details and ad attribution to the Google Sheet (data/site.json → leadSheetUrl).
import { useEffect, useRef, useState } from 'react';
import site from '@/data/site.json';

const OPEN_LINK = 'a[href="#request-call"]';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'fbclid'];
const STORED_PARAMS = 'conclave_attribution';

const BOARDS = ['CBSE', 'IB', 'IGCSE', 'ICSE', 'State Board', 'Other'];
const ROLES = ['Founder / Owner', 'Principal / Head of School', 'Academic / Curriculum Head'];
const CALL_TIMES = ['9am - 1pm', '1pm - 4pm', '4pm - 7pm'];

// Storage can be blocked by the browser; tracking must never break the form.
function readAttribution() {
  try { return JSON.parse(sessionStorage.getItem(STORED_PARAMS)) || {}; } catch { return {}; }
}

function storeAttribution() {
  const landing = new URLSearchParams(location.search);
  const found = PARAMS.filter(p => landing.get(p)).map(p => [p, landing.get(p)]);
  if (!found.length) return;
  try { sessionStorage.setItem(STORED_PARAMS, JSON.stringify(Object.fromEntries(found))); } catch {}
}

// The form shows +91 itself, so remove any country code or leading 0 that was pasted or autofilled.
const phoneDigits = value => value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
const PHONE_ERROR = 'Please fill the correct 10-digit phone number';

function Field({ label, children }) {
  return (
    <label className="callback-form__field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Select({ name, options, required }) {
  return (
    <select name={name} required={required} defaultValue="">
      <option value="" disabled>Select</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

// Bottom bar on phones and tablets, hidden until the visitor scrolls down.
export function CallBackSticky() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 100);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`callback-sticky${visible ? ' is-visible' : ''}`}>
      <a href="#request-call">Request A Call Back</a>
    </div>
  );
}

export default function CallBackForm() {
  const dialog = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | sending | error | done

  useEffect(() => {
    storeAttribution();
    const onClick = e => {
      if (!e.target.closest(OPEN_LINK)) return;
      e.preventDefault();
      dialog.current.showModal();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const onSubmit = async e => {
    e.preventDefault();
    setStatus('sending');
    const leadId = crypto.randomUUID();
    try {
      // text/plain keeps this a simple request, which Google Apps Script can accept from another site.
      const fields = Object.fromEntries(new FormData(e.target));
      const res = await fetch(site.leadSheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...fields, phone: `+91${fields.phone}`, ...readAttribution(), lead_id: leadId }),
      });
      if (!res.ok || !(await res.json()).ok) throw new Error('Not saved');
    } catch {
      setStatus('error');
      return;
    }
    setStatus('done');
    window.fbq?.('track', 'Lead', { content_name: 'Conclave Call Back' }, { eventID: leadId });
  };

  return (
    <dialog ref={dialog} className="callback-form" onClick={e => e.target === dialog.current && dialog.current.close()}>
      <div className="callback-form__panel">
        <button type="button" className="callback-form__close" aria-label="Close" onClick={() => dialog.current.close()}>&times;</button>
        {status === 'done' ? (
          <div className="callback-form__thanks" role="status">
            <span className="callback-form__tick" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <p className="callback-form__eyebrow">The Education Leaders Conclave 2026</p>
            <h2>Thank you for filling the details.</h2>
            <p>Our team will contact you soon.</p>
            <button type="button" className="callback-form__submit" onClick={() => dialog.current.close()}>Done</button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <h2>Request A Call Back</h2>
            <Field label="Name *"><input name="name" autoComplete="name" required /></Field>
            <Field label="Phone *">
              <span className="callback-form__phone">
                <span>+91</span>
                <input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" pattern="[0-9]{10}" required onInvalid={e => e.target.setCustomValidity(PHONE_ERROR)} onInput={e => { e.target.setCustomValidity(''); e.target.value = phoneDigits(e.target.value); }} />
              </span>
            </Field>
            <Field label="Email *"><input name="email" type="email" autoComplete="email" required /></Field>
            <Field label="School name and city *"><input name="school" autoComplete="organization" required /></Field>
            <div className="callback-form__row">
              <Field label="Board *"><Select name="board" options={BOARDS} required /></Field>
              <Field label="State *"><input name="state" autoComplete="address-level1" required /></Field>
            </div>
            <Field label="Your role *"><Select name="role" options={ROLES} required /></Field>
            <Field label="Preferred time for the call *"><Select name="call_time" options={CALL_TIMES} required /></Field>
            {status === 'error' && <p className="callback-form__error" role="alert">Sorry, we couldn&rsquo;t save your details. Please try again, or call us on +91 80411 24132.</p>}
            <button type="submit" className="callback-form__submit" disabled={status === 'sending'}>{status === 'sending' ? 'Submitting…' : 'Submit'}</button>
          </form>
        )}
      </div>
    </dialog>
  );
}
