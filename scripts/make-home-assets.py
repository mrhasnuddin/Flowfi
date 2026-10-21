"""Generates the decorative layers of the home page (FlowFi's own artwork, built to the same structure as taiko.xyz).

Writes:  public/assets/home/{holder,bg-grid,scaling-lines,explore-grid,wave}.svg
         scripts/snippets/{rays,journey,mark-icon,vault-icon}.svg  (inlined into index.html by the Vite plugin in vite.config.js)
Usage:   python scripts/make-home-assets.py   (then render wave.svg to wave.webp with headless Chrome if the wave changed)
"""
import math, os, random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'home')
SNIP = os.path.join(ROOT, 'scripts', 'snippets')
os.makedirs(OUT, exist_ok=True)
os.makedirs(SNIP, exist_ok=True)
random.seed(7)

INK, PURPLE, PURPLE_D, LAV, LAV_L, GOLD = '#2E2F33', '#7B5CFA', '#5733D4', '#B9A9FF', '#D9CFFF', '#F2C94C'


def write(path, text):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


def catmull(pts, closed=False):
    """Smooth path through points (Catmull-Rom -> cubic Bezier)."""
    n = len(pts)
    d = ['M%.1f %.1f' % pts[0]]
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if (closed or i > 0) else pts[i]
        p1, p2 = pts[i], pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if (closed or i + 2 < n) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append('C%.1f %.1f %.1f %.1f %.1f %.1f' % (c1 + c2 + p2))
    return ''.join(d) + ('Z' if closed else '')


# ---------- 1. HUD holder behind the hero mark (642 x 357) ----------
def holder():
    L = []
    def ln(x1, y1, x2, y2, c=INK, o=1, w=1.5):
        L.append(f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{c}" stroke-width="{w}" opacity="{o}"/>')
    def cross(x, y, o):
        ln(x, y, x + 9, y + 9, o=o); ln(x + 9, y, x, y + 9, o=o)
    # corner brackets
    for (x, y, sx, sy) in [(120, 8, 1, 1), (522, 8, -1, 1), (120, 349, 1, -1), (522, 349, -1, -1)]:
        ln(x, y, x + 26 * sx, y, PURPLE, .9); ln(x, y, x, y + 26 * sy, PURPLE, .9)
    cross(132, 20, 1); cross(501, 20, .2); cross(132, 328, .2); cross(501, 328, .2)
    # side rulers with T ticks
    for x0, x1 in [(0, 112), (530, 642)]:
        ln(x0, 178, x1, 178, INK, .12)
        tx = x1 - 6 if x0 == 0 else x0 + 6
        ln(tx, 150, tx, 206, PURPLE, .3)
        ln(tx - 6, 150, tx + 6, 150, PURPLE, .5); ln(tx - 6, 206, tx + 6, 206, PURPLE, .5)
    # small squares and dots on the frame
    for x, y in [(319, 4), (319, 349), (114, 120), (524, 236)]:
        L.append(f'<rect x="{x}" y="{y}" width="4" height="4" fill="{PURPLE}"/>')
    for x, y in [(114, 150), (524, 206), (321, 330)]:
        L.append(f'<circle cx="{x}" cy="{y}" r="2" fill="{INK}" opacity=".4"/>')
    # hatch blocks
    for bx, by in [(560, 40), (40, 300)]:
        for i in range(9):
            ln(bx + i * 5, by, bx + i * 5, by + 30, INK, .12, 1)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="642" height="357" viewBox="0 0 642 357" fill="none">{"".join(L)}</svg>\n'


# ---------- 2. Dot matrix that turns into a line grid (behind the hero holder) ----------
def bg_grid():
    W, H, s = 2268, 687, 69
    L = []
    cols, rows = W // s + 1, H // s + 1
    for r in range(rows):
        for c in range(cols):
            x, y = 26 + c * s, 3 + r * s
            L.append(f'<circle cx="{x}" cy="{y}" r="2.3" fill="{INK}" opacity=".13"/>')
            gridness = (x - 900) / 700  # 0 at x=900, 1 at x=1600
            if gridness > random.random() * 0.9:
                if c < cols - 1:
                    L.append(f'<path d="M{x + 8} {y}H{x + s - 8}" stroke="{INK}" stroke-width="1.6" opacity=".09"/>')
                if r < rows - 1:
                    L.append(f'<path d="M{x} {y + 8}V{y + s - 8}" stroke="{INK}" stroke-width="1.6" opacity=".09"/>')
    for (c, r) in [(21, 1), (23, 6)]:
        x, y = 26 + c * s, 3 + r * s
        for i in range(10):
            L.append(f'<path d="M{x + 6 + i * 6} {y + 10}V{y + 58}" stroke="{INK}" stroke-width="1" opacity=".1"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" fill="none">{"".join(L)}</svg>\n'


# ---------- 3. Blueprint geometry behind the horizontal scroller (4529 x 850) ----------
def scaling_lines():
    L = []
    st = f'stroke="{INK}" stroke-width="1.6" opacity=".16"'
    def c(x, y, r): L.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" {st}/>')
    def ln(x1, y1, x2, y2): L.append(f'<path d="M{x1:.0f} {y1:.0f}L{x2:.0f} {y2:.0f}" {st}/>')
    def plus(x, y): L.append(f'<path d="M{x - 7} {y}H{x + 7}M{x} {y - 7}V{y + 7}" stroke="{PURPLE}" stroke-width="2"/>')
    def hatch(x, y):
        for i in range(8): L.append(f'<path d="M{x + i * 6} {y}V{y + 30}" stroke="{INK}" stroke-width="1" opacity=".18"/>')
    ln(0, 425, 4529, 425)
    # A: stacked circles (vault columns)
    for cx in (380, 1130):
        ln(cx, 0, cx, 850)
        for cy, r in [(150, 120), (330, 80), (470, 60), (600, 80), (780, 130)]:
            c(cx, cy, r); ln(cx - r * 1.2, cy, cx + r * 1.2, cy)
        c(cx, 425, 360)
    ln(755, 0, 755, 850); plus(755, 120); plus(755, 700); hatch(700, 90); hatch(780, 690)
    # B: rosette (governance)
    bx, by = 2260, 425
    c(bx, by, 420); c(bx, by, 300); c(bx, by, 180)
    for k in range(8):
        a = k * math.pi / 4 + math.pi / 8
        c(bx + 300 * math.cos(a), by + 300 * math.sin(a), 105)
    for k in range(6):
        a = k * math.pi / 6
        ln(bx - 460 * math.cos(a), by - 460 * math.sin(a), bx + 460 * math.cos(a), by + 460 * math.sin(a))
    hatch(1930, 160); hatch(2560, 660); plus(2260, 425)
    # C: diamonds and lenses (token)
    for dx in (3400, 3780, 4150):
        ln(dx - 380, 425, dx, 0); ln(dx, 0, dx + 380, 425); ln(dx + 380, 425, dx, 850); ln(dx, 850, dx - 380, 425)
        ln(dx, 0, dx, 850)
    for lx in (3400, 4150):
        L.append(f'<path d="M{lx} 425C{lx - 60} 300 {lx - 60} 180 {lx} 90C{lx + 60} 180 {lx + 60} 300 {lx} 425C{lx - 60} 550 {lx - 60} 670 {lx} 760C{lx + 60} 670 {lx + 60} 550 {lx} 425Z" {st}/>')
    plus(3780, 150); plus(3780, 700); plus(3400, 425); hatch(3820, 160); hatch(3820, 690)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="4529" height="850" viewBox="0 0 4529 850" fill="none">{"".join(L)}</svg>\n'


# ---------- 4. Grid behind the explore mark (343 x 461) ----------
def explore_grid():
    L, s = [], 34.3
    for i in range(11):
        x = i * s
        L.append(f'<path d="M{x:.1f} 0V461" stroke="{INK}" stroke-width="1" opacity=".14"/>')
    for j in range(14):
        y = j * s
        L.append(f'<path d="M0 {y:.1f}H343" stroke="{INK}" stroke-width="1" opacity=".14"/>')
    for (i, j) in [(2, 3), (7, 2), (3, 10), (8, 11), (5, 6)]:
        x, y = i * s, j * s
        L.append(f'<path d="M{x - 6:.1f} {y:.1f}H{x + 6:.1f}M{x:.1f} {y - 6:.1f}V{y + 6:.1f}" stroke="{PURPLE}" stroke-width="1.6"/>')
    for k in range(8):
        L.append(f'<path d="M{6 * s + 4 + k * 4:.1f} {8 * s + 5:.1f}V{9 * s - 5:.1f}" stroke="{INK}" stroke-width=".8" opacity=".25"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="343" height="461" viewBox="0 0 343 461" fill="none">{"".join(L)}</svg>\n'


# ---------- 5. Gradient wave that hands the page from light to the ink roadmap (2268 x 1056) ----------
def wave():
    """Concentric arches, blurred together, so the colour bands follow the arch like a sunrise. Bottom is solid ink."""
    def arch(cx, top, half, base):
        return (f'M{cx - half * 1.6:.0f} {base}C{cx - half * 1.05:.0f} {base - (base - top) * .55:.0f} {cx - half * .55:.0f} {top:.0f} {cx:.0f} {top:.0f}'
                f'C{cx + half * .55:.0f} {top:.0f} {cx + half * 1.05:.0f} {base - (base - top) * .5:.0f} {cx + half * 1.75:.0f} {base + 60}L{cx + half * 1.75:.0f} 1400L{cx - half * 1.6:.0f} 1400Z')
    bands = [(GOLD, 40, 1250), ('#F7D774', 120, 1150), (LAV, 250, 1040), (PURPLE, 370, 940), ('#4426A8', 470, 860), ('#17181C', 590, 800)]
    shapes = ''.join(f'<path d="{arch(1134, top, half, 1056)}" fill="{c}"/>' for c, top, half in bands)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="2268" height="1056" viewBox="0 0 2268 1056">
<defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="34"/></filter><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#17181C" stop-opacity="0"/><stop offset=".6" stop-color="#17181C"/></linearGradient></defs>
<g filter="url(#b)">{shapes}</g>
<rect y="720" width="2268" height="336" fill="url(#fade)"/>
</svg>
'''


# ---------- 6. Ribbons in the horizontal scroller (inline, viewBox 5291 x 1193) ----------
# x = 3175 is the centre of the third screen (the svg starts at 40vw and spans 350vw). Each line braids through screen 2,
# makes one wide alpha-loop around the screen-3 title, then rises out through screen 4. Every knot carries its own tangent,
# so the cubic segments join without kinks (the old Catmull-Rom points were uneven and curled through the title).
def _bezier(knots):
    """knots: [(x, y, angle_rad, handle_in, handle_out)] -> SVG path of cubic segments with continuous tangents."""
    d = ['M%.1f %.1f' % knots[0][:2]]
    for (x0, y0, a0, _, h0), (x1, y1, a1, h1, _) in zip(knots, knots[1:]):
        c1 = (x0 + math.cos(a0) * h0, y0 + math.sin(a0) * h0)
        c2 = (x1 - math.cos(a1) * h1, y1 - math.sin(a1) * h1)
        d.append('C%.1f %.1f %.1f %.1f %.1f %.1f' % (c1 + c2 + (x1, y1)))
    return ''.join(d)


def _ribbon(wave_in, wave_out, cx, cy, r, spread=.55):
    knots = []
    pts = wave_in
    # loop: theta measured so (sin, cos) walks bottom -> right -> top -> left -> bottom, heading right at the bottom
    t0, t1 = -spread, 2 * math.pi + spread
    n = 10
    ths = [t0 + (t1 - t0) * k / n for k in range(n + 1)]
    h_arc = 4 / 3 * math.tan((t1 - t0) / n / 4) * r
    loop = [(cx + r * math.sin(t), cy + r * math.cos(t), math.atan2(-math.sin(t), math.cos(t)), h_arc, h_arc) for t in ths]
    def wave(points, first_angle=None, last_angle=None):
        out = []
        for k, (x, y) in enumerate(points):
            if k == 0 and first_angle is not None:
                a = first_angle
            elif k == len(points) - 1 and last_angle is not None:
                a = last_angle
            else:
                a = 0.0  # crests and troughs run level
            out.append([x, y, a, 0, 0])
        return out
    w_in = wave(wave_in + [loop[0][:2]], first_angle=math.atan2(wave_in[1][1] - wave_in[0][1], wave_in[1][0] - wave_in[0][0]), last_angle=loop[0][2])
    w_out = wave([loop[-1][:2]] + wave_out, first_angle=loop[-1][2], last_angle=-0.35)
    for seq in (w_in, w_out):  # handles: 38% of the chord on both sides
        for a, b in zip(seq, seq[1:]):
            chord = math.hypot(b[0] - a[0], b[1] - a[1]) * .38
            a[4] = chord; b[3] = chord
    loop = [list(k) for k in loop]
    loop[0][3] = w_in[-1][3]; loop[-1][4] = w_out[0][4]
    knots = [tuple(k) for k in w_in[:-1]] + [tuple(k) for k in loop] + [tuple(k) for k in w_out[1:]]
    return _bezier(knots)


def rays():
    lines = [  # (colour, wave into the loop, loop centre y, radius, wave out of the loop)
        (LAV,      [(430, 520), (1100, 700), (1700, 480), (2300, 690)], 606, 520, [(3950, 640), (4600, 380), (5280, 300)]),
        (PURPLE_D, [(420, 700), (1100, 470), (1700, 730), (2300, 520)], 596, 600, [(4050, 560), (4700, 760), (5280, 560)]),
        (PURPLE,   [(440, 620), (1100, 390), (1700, 800), (2300, 440)], 588, 455, [(3850, 470), (4500, 690), (5280, 860)]),
    ]
    def grad(i, color, x1, x2):
        stops = ''.join(f'<stop offset="{o}" stop-color="{color}" stop-opacity="{a}"/>' for o, a in [(0, 0), (.06, .2), (.1, .45), (.35, .65), (.6, .85), (.85, .97), (1, 1)])
        return f'<linearGradient id="ray{i}" x1="{x1}" y1="600" x2="{x2}" y2="600" gradientUnits="userSpaceOnUse">{stops}</linearGradient>'
    defs = ''.join(grad(i, c, w[0][0] - 10, 5280) for i, (c, w, *_rest) in enumerate(lines))
    paths = ''.join(f'<path class="scaling-line" d="{_ribbon(w_in, w_out, 3175, cy, r)}" stroke="url(#ray{i})" stroke-width="21" stroke-linecap="round"/>'
                    for i, (c, w_in, cy, r, w_out) in enumerate(lines))
    return f'<svg class="scaling__rays" viewBox="0 0 5291 1193" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>{defs}</defs>{paths}</svg>'


# ---------- 7. Roadmap streaks, revealed by a thick dash path (inline, viewBox 893 x 1065) ----------
def journey():
    mask, x, y = [], 690, 40
    # a staircase of short, slightly tilted strokes from top right to bottom left, then back right
    pts = []
    for k in range(46):
        t = k / 45
        cx = 640 - 560 * math.sin(t * math.pi * 0.95) * (1 - t * .35) + 180 * t
        cy = 40 + t * 980
        pts.append((cx, cy))
    for (cx, cy) in pts:
        w = random.uniform(150, 210)
        tilt = random.uniform(-16, -10)
        mask.append(f'<path d="M{cx - w / 2:.1f} {cy - tilt / 2:.1f}L{cx + w / 2:.1f} {cy + tilt / 2:.1f}" stroke="url(#jm)" stroke-width="1.6"/>')
    reveal = 'M560 -103L520 120L430 300L300 470L230 640L330 820L486 1046'
    return f'''<svg class="journey__svg" viewBox="0 0 893 1065" fill="none" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="jm" x1="0" y1="0" x2="0" y2="1065" gradientUnits="userSpaceOnUse"><stop stop-color="#999"/><stop offset=".78" stop-color="#fff"/></linearGradient>
<linearGradient id="jp" x1="0" y1="0" x2="0" y2="1065" gradientUnits="userSpaceOnUse"><stop stop-color="{LAV}"/><stop offset=".35" stop-color="{PURPLE}"/><stop offset=".7" stop-color="{GOLD}"/><stop offset="1" stop-color="{LAV}"/></linearGradient>
<mask id="jmask" maskUnits="userSpaceOnUse" x="0" y="0" width="893" height="1065" style="mask-type:alpha">{''.join(mask)}</mask>
</defs>
<g mask="url(#jmask)"><path d="M0 0H893V1065H0Z" fill="#999" fill-opacity=".2"/><path class="journey-path" d="{reveal}" stroke="url(#jp)" stroke-width="820"/></g>
</svg>'''


# ---------- 9. Icons for the first scroller screen: FlowFi mark with a sweeping gradient, and a vault cube ----------
def mark_icon(paths, vb):
    body = ''.join(f'<path d="{d}" fill="url(#mkg)"/>' for d in paths)
    return f'''<svg id="s2-mark" viewBox="{vb}" fill="none" aria-hidden="true" focusable="false"><defs><linearGradient id="mkg" class="mk-gradient" x1="560" y1="40" x2="140" y2="560" gradientUnits="userSpaceOnUse"><stop stop-color="#E6E8EE"/><stop offset=".22" stop-color="{PURPLE}"/><stop offset=".42" stop-color="#E6E8EE"/><stop offset="1" stop-color="#E6E8EE"/></linearGradient></defs>{body}</svg>'''


def vault_icon():
    return f'''<svg id="s2-vault" viewBox="0 0 260 300" fill="none" aria-hidden="true" focusable="false"><defs><linearGradient id="vkg" x1="230" y1="40" x2="-20" y2="360" gradientUnits="userSpaceOnUse"><stop stop-color="#E6E8EE"/><stop offset=".22" stop-color="{PURPLE}"/><stop offset=".42" stop-color="#E6E8EE"/><stop offset="1" stop-color="#E6E8EE"/></linearGradient></defs><path d="M130 4L254 76V224L130 296L6 224V76Z M6 76L130 148L254 76 M130 148V296 M68 40L192 112V184 M192 40L68 112V184 M130 4V60 M98 166L130 184L162 166" stroke="url(#vkg)" stroke-width="3" stroke-linejoin="round"/></svg>'''


if __name__ == '__main__':
    write(os.path.join(OUT, 'holder.svg'), holder())
    write(os.path.join(OUT, 'bg-grid.svg'), bg_grid())
    write(os.path.join(OUT, 'scaling-lines.svg'), scaling_lines())
    write(os.path.join(OUT, 'explore-grid.svg'), explore_grid())
    write(os.path.join(OUT, 'wave.svg'), wave())
    write(os.path.join(SNIP, 'rays.svg'), rays())
    write(os.path.join(SNIP, 'journey.svg'), journey())
    mark_svg = open(os.path.join(ROOT, 'public', 'assets', 'brand', 'flowfi-mark.svg'), encoding='utf-8').read()
    import re
    mark_paths = re.findall(r' d="([^"]+)"', mark_svg)
    vb = re.search(r'viewBox="([^"]+)"', mark_svg).group(1)
    write(os.path.join(SNIP, 'mark-icon.svg'), mark_icon(mark_paths, vb))
    write(os.path.join(SNIP, 'vault-icon.svg'), vault_icon())
    for f in sorted(os.listdir(OUT)) + sorted(os.listdir(SNIP)):
        p = os.path.join(OUT, f) if os.path.exists(os.path.join(OUT, f)) else os.path.join(SNIP, f)
        print(f, os.path.getsize(p) // 1024, 'KB')
