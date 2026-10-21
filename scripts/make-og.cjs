// Renders scripts/og/og.html to public/og/og-landscape.png (1200x630) and og-square.png (1200x1200) with headless Chrome.
// Usage: node scripts/make-og.cjs   (set CHROME to the browser path if it is not the default Windows location)
const { spawn } = require('child_process'); const http = require('http'); const fs = require('fs'); const path = require('path'); const os = require('os');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const root = path.resolve(__dirname, '..');
const page = 'file:///' + path.join(root, 'scripts/og/og.html').replace(/\\/g, '/').replace(/ /g, '%20');
const variants = [['landscape', 1200, 630], ['square', 1200, 1200]];
const port = 9800 + Math.floor(Math.random() * 150);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--user-data-dir=' + path.join(os.tmpdir(), 'flowfi-og-' + port), '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const get = (u) => new Promise((res, rej) => http.get(u, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let t; for (let i = 0; i < 120; i++) { try { t = await get(`http://127.0.0.1:${port}/json`); break; } catch { await sleep(250); } }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.onopen = r);
  let id = 0; const pend = {}; ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) pend[m.id](m.result); };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  fs.mkdirSync(path.join(root, 'public/og'), { recursive: true });
  await send('Page.enable');
  for (const [name, w, h] of variants) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `${page}#${name}` }); await sleep(1500);
    await send('Runtime.evaluate', { expression: 'document.body.className = location.hash.slice(1); document.fonts.ready.then(() => 1)', awaitPromise: true });
    await sleep(800);
    const s = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
    const file = path.join(root, `public/og/og-${name}.png`);
    fs.writeFileSync(file, Buffer.from(s.data, 'base64')); console.log(file, Math.round(fs.statSync(file).size / 1024) + ' KB');
  }
  ws.close(); chrome.kill();
})().catch((e) => { console.error(e); chrome.kill(); process.exit(1); });
