// Parse wp_posts / wp_postmeta / wp_options from a MariaDB dump into JSON.
// usage: node scripts/parse-dump.js <dump.sql> <output dir>   (keep the output dir outside the repo)
const fs = require('fs');
const [, , dumpPath, outDir] = process.argv;
const sql = fs.readFileSync(dumpPath, 'utf8');

function parseValues(s, i) {
  const rows = [];
  let row = null, n = s.length;
  while (i < n) {
    const c = s[i];
    if (c === '(') { row = []; i++; continue; }
    if (c === ')') { rows.push(row); row = null; i++; continue; }
    if (c === ';' && row === null) break;
    if (c === ',' || c === ' ' || c === '\n') { i++; continue; }
    if (c === "'") {
      let out = ''; i++;
      while (i < n) {
        const d = s[i];
        if (d === '\\') {
          const e = s[i + 1];
          out += e === 'n' ? '\n' : e === 'r' ? '\r' : e === 't' ? '\t' : e === '0' ? '\0' : e === 'Z' ? '\x1a' : e;
          i += 2;
        } else if (d === "'") {
          if (s[i + 1] === "'") { out += "'"; i += 2; } else { i++; break; }
        } else { out += d; i++; }
      }
      row.push(out); continue;
    }
    let j = i;
    while (j < n && s[j] !== ',' && s[j] !== ')') j++;
    const tok = s.slice(i, j).trim();
    row.push(tok === 'NULL' ? null : tok);
    i = j;
  }
  return [rows, i];
}

function table(name) {
  const rows = [];
  const marker = 'INSERT INTO `' + name + '` VALUES';
  let pos = 0;
  while ((pos = sql.indexOf(marker, pos)) !== -1) {
    const [r, end] = parseValues(sql, pos + marker.length);
    rows.push(...r); pos = end;
  }
  return rows;
}

// wp_posts columns: ID, post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt,
// post_status, comment_status, ping_status, post_password, post_name, to_ping, pinged, post_modified,
// post_modified_gmt, post_content_filtered, post_parent, guid, menu_order, post_type, post_mime_type, comment_count
const posts = table('wp_posts').map(r => ({
  id: +r[0], content: r[4], title: r[5], status: r[7], slug: r[11], parent: +r[17], guid: r[18],
  menu_order: +r[19], type: r[20], mime: r[21], modified: r[14],
}));
const meta = {};
for (const r of table('wp_postmeta')) (meta[r[1]] ||= {})[r[2]] = r[3];
const options = {};
for (const r of table('wp_options')) options[r[1]] = r[2];

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outDir + '/posts.json', JSON.stringify(posts));
fs.writeFileSync(outDir + '/meta.json', JSON.stringify(meta));
fs.writeFileSync(outDir + '/options.json', JSON.stringify(options));

const counts = {};
for (const p of posts) counts[p.type + '/' + p.status] = (counts[p.type + '/' + p.status] || 0) + 1;
console.log(counts);
for (const p of posts.filter(p => p.status === 'publish' && !['attachment', 'revision', 'nav_menu_item', 'customize_changeset', 'oembed_cache'].includes(p.type)))
  console.log(p.id, p.type, p.slug, '|', p.title, '| elementor:', meta[p.id]?._elementor_data ? meta[p.id]._elementor_data.length : 0, '| tpl:', meta[p.id]?._wp_page_template || '', meta[p.id]?._elementor_template_type || '');
