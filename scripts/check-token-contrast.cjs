// Resolves semantic tokens from src/tokens.css and checks WCAG contrast for the pairs the design system relies on.
const fs = require('fs'); const css = fs.readFileSync((process.argv[2] || 'src/tokens.css'), 'utf8');
const rootBlock = css.split('[data-surface="ink"]')[0]; const inkBlock = css.split('[data-surface="ink"]')[1].split('}')[0];
const parse = (b) => Object.fromEntries([...b.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
const light = parse(rootBlock), ink = { ...light, ...parse(inkBlock) };
const mix = (a, b, pct) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v * pct + B[i] * (1 - pct)).toString(16).padStart(2, '0')).join('').toUpperCase(); };
function res(env, v) { v = v.trim(); let m;
  if ((m = v.match(/^var\((--[a-z0-9-]+)\)$/))) return res(env, env[m[1]]);
  if ((m = v.match(/^color-mix\(in srgb, (.+?) (\d+)%, (.+?)\)$/))) { const a = res(env, m[1]), b = res(env, m[3]); return b === 'transparent' ? a : mix(a, b, +m[2] / 100); }
  return v; }
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const checks = [ // [env, fg, bg, min]. Min 3 = WCAG large text (>= 24px) or a graphic; 4.5 = normal text, including 16px button labels.
  [light, '--color-text-primary', '--color-bg-canvas', 4.5], [light, '--color-text-primary', '--color-bg-surface', 4.5],
  [light, '--color-text-secondary', '--color-bg-canvas', 4.5], [light, '--color-text-secondary', '--color-bg-surface', 4.5],
  [light, '--color-text-tertiary', '--color-bg-canvas', 4.5], [light, '--color-text-tertiary', '--color-bg-subtle', 4.5],
  [light, '--color-text-brand', '--color-bg-canvas', 3], [light, '--color-text-brand', '--color-bg-brand-subtle', 3],
  [light, '--color-text-label', '--color-bg-canvas', 4.5], [light, '--color-text-label', '--color-bg-page', 4.5], [light, '--color-text-label', '--color-bg-brand-subtle', 4.5],
  [light, '--color-action-primary-fg', '--color-action-primary-bg', 4.5], [light, '--color-action-primary-fg', '--color-action-primary-bg-hover', 4.5], [light, '--color-action-primary-fg', '--color-action-primary-bg-active', 4.5],
  [light, '--color-action-outline-fg', '--color-bg-canvas', 4.5], [light, '--color-action-outline-fg', '--color-action-outline-bg-hover', 4.5],
  [light, '--color-link-underline', '--color-bg-canvas', 3], [light, '--color-text-treasury', '--color-bg-canvas', 4.5],
  [light, '--color-status-success-fg', '--color-status-success-bg', 4.5], [light, '--color-status-warning-fg', '--color-status-warning-bg', 4.5],
  [light, '--color-status-danger-fg', '--color-status-danger-bg', 4.5], [light, '--color-status-info-fg', '--color-status-info-bg', 4.5],
  [light, '--color-border-control', '--color-bg-surface', 3], [light, '--color-border-control', '--color-bg-canvas', 3], [light, '--color-focus-ring', '--color-bg-canvas', 3], [light, '--color-focus-ring', '--color-bg-surface', 3],
  [light, '--color-domain-governance-mark', '--color-bg-canvas', 3], [light, '--color-domain-treasury-mark', '--color-bg-canvas', 3],
  [ink, '--color-text-primary', '--color-bg-canvas', 4.5], [ink, '--color-text-secondary', '--color-bg-canvas', 4.5], [ink, '--color-text-secondary', '--color-bg-surface', 4.5], [ink, '--color-text-tertiary', '--color-bg-canvas', 4.5],
  [ink, '--color-text-brand', '--color-bg-canvas', 4.5], [ink, '--color-text-brand', '--color-bg-surface', 4.5], [ink, '--color-text-label', '--color-bg-canvas', 4.5],
  [ink, '--color-domain-governance-mark', '--color-bg-canvas', 3], [ink, '--color-domain-treasury-mark', '--color-bg-canvas', 3],
  [ink, '--color-status-success-fg', '--color-bg-surface', 4.5], [ink, '--color-status-warning-fg', '--color-bg-surface', 4.5],
];
let fail = 0;
for (const [env, f, b, min] of checks) { const F = res(env, env[f]), B = res(env, env[b]); const r = cr(F, B); const ok = r >= min; if (!ok) fail++;
  console.log((env === ink ? 'ink  ' : 'light'), ok ? 'PASS' : 'FAIL', r.toFixed(2).padStart(5), `(>=${min})`, f.replace('--color-', ''), F, 'on', b.replace('--color-', ''), B); }
console.log(fail ? `\n${fail} FAILING` : '\nall pass'); process.exit(fail ? 1 : 0);
