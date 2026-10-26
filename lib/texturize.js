// Port of the parts of WordPress's wptexturize() that affect this site's copy:
// curly quotes, apostrophes, dashes, ellipses and the multiplication sign.
// Only text outside HTML tags is changed; <pre>, <code>, <script> and <style> are skipped.
const SKIP_TAGS = /^<(pre|code|kbd|style|script|tt)\b/i;

function texturizeText(t) {
  return t
    .replace(/---/g, '—')
    .replace(/ -- /g, ' — ')
    .replace(/--/g, '–')
    .replace(/ - /g, ' – ')
    .replace(/\.\.\./g, '…')
    .replace(/\(tm\)/gi, '™')
    .replace(/(\d)x(\d)/g, '$1×$2')
    // apostrophes and single quotes
    .replace(/'(\d\d(?:s|\b))/g, '’$1')
    .replace(/(\w)'(\w)/g, '$1’$2')
    .replace(/(^|[\s(\[{" —–-])'/g, '$1‘')
    .replace(/'/g, '’')
    // double quotes
    .replace(/(^|[\s(\[{ —–-])"/g, '$1“')
    .replace(/"/g, '”')
    // primes after digits
    .replace(/(\d)”/g, '$1″')
    .replace(/(\d)’(?!\w)/g, '$1′');
}

export function wptexturize(html) {
  if (!html) return html;
  const parts = html.split(/(<[^>]*>|\[[^\]]*\])/);
  let skipping = null;
  return parts
    .map(part => {
      if (part.startsWith('<')) {
        if (skipping && new RegExp(`^</${skipping}`, 'i').test(part)) skipping = null;
        else if (!skipping && SKIP_TAGS.test(part) && !part.endsWith('/>')) skipping = part.match(SKIP_TAGS)[1];
        return part;
      }
      if (part.startsWith('[') || skipping) return part;
      // keep entities intact while converting the text around them
      return part.split(/(&[#\w]+;)/).map(p => (p.startsWith('&') && p.endsWith(';') ? p : texturizeText(p))).join('');
    })
    .join('');
}
