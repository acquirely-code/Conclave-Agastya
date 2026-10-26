// The WordPress shortcodes used on the site, each ported from its custom plugin.
import { LabProgress, LabStations } from './LabSections';
import Testimonials from './Testimonials';
import { ThankYouReserved, ThankYouCallback } from './ThankYou';

const SHORTCODES = {
  lab_progress: LabProgress,
  lab_stations: LabStations,
  agastya_testimonials: Testimonials,
  conclave_thankyou_reserved: ThankYouReserved,
  conclave_thankyou_callback: ThankYouCallback,
};

export const SHORTCODE_RE = new RegExp(`\\[(${Object.keys(SHORTCODES).join('|')})([^\\]]*)\\]`);

function parseAtts(str) {
  const atts = {};
  str.replace(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g, (_, k, a, b, c) => {
    atts[k.toLowerCase()] = a ?? b ?? c;
  });
  return atts;
}

export default function Shortcode({ code }) {
  const m = code.match(SHORTCODE_RE);
  if (!m) return code;
  const Component = SHORTCODES[m[1]];
  return <Component atts={parseAtts(m[2] || '')} />;
}
