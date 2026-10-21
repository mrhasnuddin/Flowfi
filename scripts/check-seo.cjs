// Checks dist/index.html for the metadata and answer-engine basics. Run after `npm run build`: node scripts/check-seo.cjs
const fs = require('fs'); const path = require('path');
const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const results = []; const check = (ok, label, detail = '') => results.push([ok, label, detail]);
const all = (re) => [...html.matchAll(re)];
const meta = (attr, name) => (html.match(new RegExp(`<meta[^>]+${attr}="${name}"[^>]+content="([^"]*)"`)) || [])[1];
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

check(all(/<title>/g).length === 1, 'one <title>', (html.match(/<title>([^<]*)/) || [])[1]);
check(all(/<meta name="description"/g).length === 1 && meta('name', 'description').length <= 165, 'one description, <= 165 chars', String((meta('name', 'description') || '').length));
const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
check(!!canon && /^https:\/\//.test(canon) && !canon.includes('__SITE_URL__'), 'canonical is absolute', canon);
check(meta('property', 'og:url') === canon, 'og:url equals canonical');
const ogImages = all(/<meta property="og:image" content="([^"]+)"/g).map((m) => m[1]);
check(ogImages.length === 2 && ogImages.every((u) => u.startsWith(canon.replace(/\/$/, '') + '/og/')), 'two absolute og:image (landscape, square)', ogImages.join(' , '));
check(meta('name', 'twitter:card') === 'summary_large_image' && /^https:\/\//.test(meta('name', 'twitter:image')), 'twitter card with absolute image');
for (const u of ogImages) check(fs.existsSync(path.join(dist, new URL(u).pathname)), 'image file exists: ' + new URL(u).pathname);
check(!html.includes('__SITE_URL__') && !html.includes('{{link:'), 'no unreplaced placeholders');
check(/<html lang="en"/.test(html), '<html lang="en">');

const ld = all(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((m) => m[1]);
let graph = []; try { graph = JSON.parse(ld[0])['@graph']; check(true, 'JSON-LD parses', graph.map((n) => n['@type']).join(', ')); } catch (e) { check(false, 'JSON-LD parses', e.message); }
const faq = graph.find((n) => n['@type'] === 'FAQPage');
const visible = all(/<details name="faq"><summary[^>]*>([\s\S]*?)<\/summary><p[^>]*>([\s\S]*?)<\/p><\/details>/g).map((m) => [strip(m[1]), strip(m[2])]);
check(!!faq && faq.mainEntity.length === visible.length, 'FAQ schema count equals visible FAQ count', `${faq && faq.mainEntity.length} vs ${visible.length}`);
if (faq) faq.mainEntity.forEach((q, i) => {
  const v = visible[i]; if (!v) return;
  check(q.name === v[0], 'FAQ question matches page: ' + q.name);
  const a = q.acceptedAnswer.text.replace(/\s+/g, ' ').trim();
  check(v[1].startsWith(a.replace(/ https?:\/\/\S+$/, '').replace(/:$/, '')) , 'FAQ answer matches page: ' + q.name);
});

const heads = all(/<h([1-6])[\s>]/g).map((m) => +m[1]);
check(heads.filter((h) => h === 1).length === 1, 'exactly one h1');
check(heads.every((h, i) => i === 0 || h <= heads[i - 1] + 1), 'no heading level skipped', heads.join(''));
check(all(/<img(?![^>]*\balt=)/g).length === 0, 'every <img> has an alt attribute');
check(all(/href="(#?)"/g).length === 0, 'no empty or bare "#" links');
const ids = all(/\sid="([^"]+)"/g).map((m) => m[1]); check(new Set(ids).size === ids.length, 'ids are unique');
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'manifest.webmanifest', 'favicon.ico', 'apple-touch-icon.png']) check(fs.existsSync(path.join(dist, f)), 'dist has ' + f);
const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8'); check(robots.includes('Sitemap: ' + canon.replace(/\/$/, '') + '/sitemap.xml'), 'robots.txt points at the sitemap');

let bad = 0; for (const [ok, label, detail] of results) { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + label + (detail ? '  [' + detail + ']' : '')); }
console.log(bad ? `\n${bad} FAILING` : `\nall ${results.length} pass`); process.exit(bad ? 1 : 0);
