"""Retraces public/assets/logo.png (the only logo file we have) into crisp vector SVGs.

Method: 3x upscale, light blur to remove the staircase edges, sub-pixel contours, corner detection,
straight segments snapped to exact horizontals/verticals, curved segments fitted with cubic Beziers
(Schneider's algorithm). The two long ribbons of the mark are the same shape, so the lower one reuses
the upper one's path, moved into place.

Writes public/assets/brand/flowfi-logo.svg, flowfi-logo-white.svg, flowfi-mark.svg, flowfi-wordmark.svg
Usage: python scripts/trace-logo.py
"""
import os
import numpy as np
from PIL import Image, ImageFilter
from skimage import measure

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'brand')
os.makedirs(OUT, exist_ok=True)
S = 3  # upscale factor
COLORS = {'orange': '#F45921', 'purple': '#985BE6', 'cyan': '#00AEEA'}


# ---------- Bezier fitting (Schneider, Graphics Gems I) ----------
def bez(ctrl, t):
    t = np.asarray(t)[:, None]
    p0, p1, p2, p3 = ctrl
    mt = 1 - t
    return mt ** 3 * p0 + 3 * mt ** 2 * t * p1 + 3 * mt * t ** 2 * p2 + t ** 3 * p3


def bez_d1(ctrl, t):
    t = np.asarray(t)[:, None]
    p0, p1, p2, p3 = ctrl
    return 3 * (1 - t) ** 2 * (p1 - p0) + 6 * (1 - t) * t * (p2 - p1) + 3 * t ** 2 * (p3 - p2)


def bez_d2(ctrl, t):
    t = np.asarray(t)[:, None]
    p0, p1, p2, p3 = ctrl
    return 6 * (1 - t) * (p2 - 2 * p1 + p0) + 6 * t * (p3 - 2 * p2 + p1)


def chord_param(pts):
    d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))]
    return d / d[-1] if d[-1] > 0 else d


def generate(pts, u, t1, t2):
    p0, p3 = pts[0], pts[-1]
    a1 = t1[None, :] * (3 * (1 - u) ** 2 * u)[:, None]
    a2 = t2[None, :] * (3 * (1 - u) * u ** 2)[:, None]
    c = np.array([[np.sum(a1 * a1), np.sum(a1 * a2)], [np.sum(a1 * a2), np.sum(a2 * a2)]])
    tmp = pts - bez([p0, p0, p3, p3], u)
    x = np.array([np.sum(a1 * tmp), np.sum(a2 * tmp)])
    det = c[0, 0] * c[1, 1] - c[0, 1] * c[1, 0]
    seg = np.linalg.norm(p3 - p0)
    if abs(det) > 1e-12:
        al1 = (x[0] * c[1, 1] - x[1] * c[0, 1]) / det
        al2 = (c[0, 0] * x[1] - c[1, 0] * x[0]) / det
    else:
        al1 = al2 = seg / 3
    if al1 < 1e-6 * seg or al2 < 1e-6 * seg:
        al1 = al2 = seg / 3
    return [p0, p0 + t1 * al1, p3 + t2 * al2, p3]


def reparam(ctrl, pts, u):
    d = bez(ctrl, u) - pts
    d1, d2 = bez_d1(ctrl, u), bez_d2(ctrl, u)
    num = np.sum(d * d1, axis=1)
    den = np.sum(d1 * d1 + d * d2, axis=1)
    with np.errstate(divide='ignore', invalid='ignore'):
        nu = np.where(den != 0, u - num / den, u)
    return np.clip(nu, 0, 1)


def max_error(pts, ctrl, u):
    d = np.linalg.norm(bez(ctrl, u) - pts, axis=1)
    i = int(np.argmax(d))
    return d[i], i


def unit(v):
    n = np.linalg.norm(v)
    return v / n if n else v


def fit(pts, t1, t2, err):
    if len(pts) == 2:
        d = np.linalg.norm(pts[1] - pts[0]) / 3
        return [[pts[0], pts[0] + t1 * d, pts[1] + t2 * d, pts[1]]]
    u = chord_param(pts)
    ctrl = generate(pts, u, t1, t2)
    e, split = max_error(pts, ctrl, u)
    if e < err:
        return [ctrl]
    if e < err * 4:
        for _ in range(20):
            u = reparam(ctrl, pts, u)
            ctrl = generate(pts, u, t1, t2)
            e, split = max_error(pts, ctrl, u)
            if e < err:
                return [ctrl]
    split = min(max(split, 1), len(pts) - 2)
    tc = unit(pts[split - 1] - pts[split + 1])
    return fit(pts[:split + 1], t1, tc, err) + fit(pts[split:], -tc, t2, err)


# ---------- contour -> clean path ----------
def corners(c, k, thresh_deg):
    n = len(c)
    ang = np.zeros(n)
    for i in range(n):
        a = c[i] - c[(i - k) % n]
        b = c[(i + k) % n] - c[i]
        cosv = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9)
        ang[i] = np.degrees(np.arccos(np.clip(cosv, -1, 1)))
    idx = [i for i in range(n) if ang[i] > thresh_deg and ang[i] >= ang[(i - 1) % n] and ang[i] >= ang[(i + 1) % n]]
    # keep one per cluster
    out = []
    for i in idx:
        if not out or i - out[-1] > k:
            out.append(i)
    if len(out) > 1 and (out[0] + n - out[-1]) <= k:
        out.pop()
    return out


def contour_to_segments(c, err, snap, k=7, thresh=38):
    """Returns list of segments: ('L', p0, p1) or ('C', ctrl). c is (N,2) x,y in upscaled pixels, closed."""
    c = c[:-1]
    n = len(c)
    cs = corners(c, k, thresh)
    if len(cs) < 2:
        cs = [0, n // 2]
    pts = c.copy()
    segs_idx = [(cs[i], cs[(i + 1) % len(cs)]) for i in range(len(cs))]
    # classify straight segments and snap their corners
    straight = []
    for a, b in segs_idx:
        run = pts[a:b + 1] if b > a else np.vstack([pts[a:], pts[:b + 1]])
        p0, p1 = run[0], run[-1]
        chord = p1 - p0
        L = np.linalg.norm(chord)
        if L < 1:
            straight.append(False)
            continue
        dist = np.abs(chord[0] * (run[:, 1] - p0[1]) - chord[1] * (run[:, 0] - p0[0])) / L
        straight.append(dist.max() < err * 1.2)
    if snap:
        for (a, b), st in zip(segs_idx, straight):
            if not st:
                continue
            p0, p1 = pts[a], pts[b]
            d = p1 - p0
            if abs(d[1]) < abs(d[0]) * 0.05:  # near horizontal
                y = (p0[1] + p1[1]) / 2
                pts[a, 1] = pts[b, 1] = y
            elif abs(d[0]) < abs(d[1]) * 0.05:  # near vertical
                x = (p0[0] + p1[0]) / 2
                pts[a, 0] = pts[b, 0] = x
    segs = []
    for (a, b), st in zip(segs_idx, straight):
        run = pts[a:b + 1] if b > a else np.vstack([pts[a:], pts[:b + 1]])
        if st:
            segs.append(('L', run[0], run[-1]))
        else:
            t1 = unit(run[min(3, len(run) - 1)] - run[0])
            t2 = unit(run[max(-4, -len(run))] - run[-1])
            for ctrl in fit(run, t1, t2, err):
                segs.append(('C', ctrl))
    return segs


def clean_shape(c, sigma=18, corner_tol=14, err=3.5):
    """For stair-stepped sources: find the real corners on a coarse polygon, smooth each edge between them
    with a Gaussian along the curve (ends pinned), snap near-horizontal edges, fit few Beziers."""
    from scipy.ndimage import gaussian_filter1d
    c = c[:-1]
    n = len(c)
    coarse = measure.approximate_polygon(np.vstack([c, c[:1]]), tolerance=corner_tol)[:-1]
    # index of each coarse vertex on the dense contour
    vidx = [int(np.argmin(np.linalg.norm(c - v, axis=1))) for v in coarse]
    m = len(vidx)
    keep = []
    for j in range(m):
        a, b, d = coarse[j - 1], coarse[j], coarse[(j + 1) % m]
        u, v = unit(b - a), unit(d - b)
        turn = np.degrees(np.arccos(np.clip(np.dot(u, v), -1, 1)))
        if turn > 28:
            keep.append(vidx[j])
    keep = sorted(set(keep))
    pts = c.copy()
    segs = []
    for j in range(len(keep)):
        a, b = keep[j], keep[(j + 1) % len(keep)]
        run = pts[a:b + 1] if b > a else np.vstack([pts[a:], pts[:b + 1]])
        p0, p1 = run[0].copy(), run[-1].copy()
        chord = p1 - p0
        L = np.linalg.norm(chord)
        dev = np.abs(chord[0] * (run[:, 1] - p0[1]) - chord[1] * (run[:, 0] - p0[0])) / max(L, 1e-6)
        if abs(chord[1]) < abs(chord[0]) * 0.06 and dev.max() < corner_tol:
            y = (p0[1] + p1[1]) / 2
            segs.append(('L', np.array([p0[0], y]), np.array([p1[0], y])))
            continue
        if len(run) > 8:
            sm = np.stack([gaussian_filter1d(run[:, 0], sigma, mode='nearest'), gaussian_filter1d(run[:, 1], sigma, mode='nearest')], 1)
            w = np.clip(np.minimum(np.arange(len(run)), np.arange(len(run))[::-1]) / sigma, 0, 1)[:, None]
            run = sm * w + run * (1 - w)  # pin the ends to the corners
        k = max(2, min(16, len(run) // 4))  # tangent baseline long enough to step over residual stair noise
        t1 = unit(run[k] - run[0])
        t2 = unit(run[-1 - k] - run[-1])
        for ctrl in fit(run, t1, t2, err):
            segs.append(('C', ctrl))
    # make consecutive segments share exact endpoints after snapping
    for j in range(len(segs)):
        nxt = segs[(j + 1) % len(segs)]
        end = segs[j][2] if segs[j][0] == 'L' else segs[j][1][3]
        if nxt[0] == 'L':
            nxt[1][:] = end if abs(nxt[1][1] - end[1]) > 0 else nxt[1]
        else:
            nxt[1][0] = end
    return segs


def symmetrize(c):
    """The ribbon is point-symmetric: average each point with its 180-degree twin to cancel the stair-step noise."""
    from scipy.spatial import cKDTree
    centre = (c.min(axis=0) + c.max(axis=0)) / 2
    r = 2 * centre - c
    dist, idx = cKDTree(r).query(c)
    print('  symmetry check: mean %.2f px, max %.2f px (source pixels)' % (dist.mean() / S, dist.max() / S))
    return (c + r[idx]) / 2


def segs_to_d(segs, scale, dx=0, dy=0):
    def P(p):
        return '%.2f %.2f' % (p[0] / scale + dx, p[1] / scale + dy)
    first = segs[0][1] if segs[0][0] == 'L' else segs[0][1][0]
    d = ['M' + P(first)]
    for s in segs:
        if s[0] == 'L':
            d.append('L' + P(s[2]))
        else:
            c = s[1]
            d.append('C' + P(c[1]) + ' ' + P(c[2]) + ' ' + P(c[3]))
    return ''.join(d) + 'Z'


def trace(img, err, snap, blur):
    a = np.array(img.getchannel('A')).astype(np.float32) / 255
    big = Image.fromarray((a * 255).astype(np.uint8)).resize((img.width * S, img.height * S), Image.BICUBIC)
    big = big.filter(ImageFilter.GaussianBlur(blur))
    A = np.array(big).astype(np.float32) / 255
    cs = measure.find_contours(np.pad(A, 2), 0.5)
    out = []
    for c in cs:
        if len(c) < 60:
            continue
        c = (c - 2)[:, ::-1]  # to x,y
        out.append(c)
    return out


def bbox_of(contours):
    allp = np.vstack(contours)
    return allp.min(axis=0) / S, allp.max(axis=0) / S


def main():
    src = Image.open(os.path.join(ROOT, 'public', 'assets', 'logo.png')).convert('RGBA')
    rgb = np.array(src)[:, :, :3]

    # ---- mark (left part) ----
    mark_img = src.crop((0, 0, 860, src.height))
    mcs = trace(mark_img, err=1.0, snap=True, blur=4.0)
    shapes = []
    for c in mcs:
        cx, cy = c.mean(axis=0) / S
        col = rgb[int(cy), int(cx)]
        name = min(COLORS, key=lambda k: np.sum((np.array([int(COLORS[k][i:i + 2], 16) for i in (1, 3, 5)]) - col) ** 2))
        shapes.append((name, c))
    by = {n: c for n, c in shapes}
    assert set(by) == set(COLORS), by.keys()
    # the cyan ribbon is the purple ribbon moved; measure the offset from the centroids
    off = by['cyan'].mean(axis=0) - by['purple'].mean(axis=0)
    paths = {}
    paths['orange'] = clean_shape(by['orange'])
    paths['purple'] = clean_shape(by['purple'])
    (x0, y0), (x1, y1) = bbox_of([by['orange'], by['purple'], by['cyan']])
    pad = 4
    ox, oy = -x0 + pad, -y0 + pad
    W, H = x1 - x0 + 2 * pad, y1 - y0 + 2 * pad
    d_orange = segs_to_d(paths['orange'], S, ox, oy)
    d_purple = segs_to_d(paths['purple'], S, ox, oy)
    d_cyan = segs_to_d(paths['purple'], S, ox + off[0] / S, oy + off[1] / S)
    mark_body = (f'<path fill="{COLORS["orange"]}" d="{d_orange}"/>'
                 f'<path fill="{COLORS["purple"]}" d="{d_purple}"/>'
                 f'<path fill="{COLORS["cyan"]}" d="{d_cyan}"/>')
    mark_svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" role="img" aria-label="FlowFi">{mark_body}</svg>\n'

    # ---- wordmark (right part) ----
    word_img = src.crop((860, 0, src.width, src.height))
    wcs = trace(word_img, err=1.0, snap=True, blur=1.8)
    wsegs = [contour_to_segments(c, err=1.1 * S / 3, snap=True, k=6, thresh=40) for c in wcs]
    (wx0, wy0), (wx1, wy1) = bbox_of(wcs)
    word_d = ''.join(segs_to_d(sg, S, -wx0, -wy0) for sg in wsegs)
    WW, WH = wx1 - wx0, wy1 - wy0
    word_svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WW:.0f} {WH:.0f}" role="img" aria-label="FlowFi"><path fill="currentColor" fill-rule="evenodd" d="{word_d}"/></svg>\n'

    # ---- full lockup: keep the original spacing between mark and wordmark ----
    gap = (wx0 + 860) - x1  # in source pixels
    word_dy = (wy0 - y0)  # vertical offset of wordmark relative to the mark's top
    LW = (x1 - x0) + gap + WW + 2 * pad
    LH = H
    lock_word = ''.join(segs_to_d(sg, S, -wx0 + (x1 - x0) + gap + pad, -wy0 + word_dy + pad) for sg in wsegs)
    def lockup(word_fill):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LW:.0f} {LH:.0f}" role="img" aria-label="FlowFi">'
                f'{mark_body}<path fill="{word_fill}" fill-rule="evenodd" d="{lock_word}"/></svg>\n')

    for name, text in [('flowfi-mark.svg', mark_svg), ('flowfi-wordmark.svg', word_svg),
                       ('flowfi-logo.svg', lockup('#000')), ('flowfi-logo-white.svg', lockup('#fff'))]:
        with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
            f.write(text)
        print(name, len(text), 'bytes')
    print('mark viewBox', round(W), round(H), 'cyan offset', off / S, 'segments', {k: len(v) for k, v in paths.items()}, 'word segs', sum(len(s) for s in wsegs))


def outline_3d():
    """Silhouette outline of the 3D mark (logo 3d.png), drawn as a gradient stroke. Used behind the 3D mark in the explore section."""
    img = Image.open(os.path.join(ROOT, 'public', 'assets', 'logo 3d.png')).convert('RGBA')
    cs = trace(img, err=1.0, snap=False, blur=3.0)
    cs = [c for c in cs if len(c) > 200]
    d = ''.join(segs_to_d(clean_shape(c, sigma=10, corner_tol=10, err=2.5), S) for c in cs)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {img.width} {img.height}" fill="none">'
           f'<defs><linearGradient id="o" x1="{img.width}" y1="0" x2="0" y2="{img.height}" gradientUnits="userSpaceOnUse">'
           f'<stop stop-color="#E6E8EE"/><stop offset=".45" stop-color="#E6E8EE"/><stop offset=".8" stop-color="#7B5CFA"/><stop offset="1" stop-color="#B9A9FF"/></linearGradient></defs>'
           f'<path d="{d}" stroke="url(#o)" stroke-width="2.5" fill-rule="evenodd"/></svg>' + chr(10))
    with open(os.path.join(OUT, 'flowfi-mark-3d-outline.svg'), 'w', encoding='utf-8') as f:
        f.write(svg)
    print('flowfi-mark-3d-outline.svg', len(svg), 'bytes', len(cs), 'contours')


if __name__ == '__main__':
    main()
    outline_3d()
