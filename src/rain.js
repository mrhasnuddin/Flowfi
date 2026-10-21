// Pixel rain behind the first scaling screen. Same algorithm as taiko.xyz: columns of 4 square dots that fall,
// fade in and pulse, each column with its own size, colour, speed and start offset. FlowFi colours.
const rand = (min, max, step = 1) => min + Math.round(Math.random() * (max - min) * step) / step;

class Column {
    constructor(ctx, canvas, o) {
        this.ctx = ctx; this.canvas = canvas; this.o = o;
        this.dots = Array.from({ length: o.dotsCount }, (_, i) => ({
            y: i * (o.dotSize + o.dotGapY) + o.offsetY, alpha: i * o.offsetAlpha, side: 1, entry: false
        }));
    }
    update() {
        const { fadeSpeed, moveSpeed, dotSize } = this.o;
        for (const d of this.dots) {
            d.y += moveSpeed;
            if (!d.entry) { d.alpha += fadeSpeed; d.entry = d.alpha >= 0; continue; }
            const a = d.alpha + fadeSpeed * d.side;
            if (a >= 1) d.side = -1;
            if (a <= 0) d.side = 1;
            d.alpha = a;
            if (d.y + dotSize > this.canvas.height) d.y = -dotSize;
        }
    }
    draw() {
        const { ctx, o } = this;
        ctx.fillStyle = o.color;
        for (const d of this.dots) { ctx.globalAlpha = Math.max(0, d.alpha); ctx.fillRect(o.offsetX, d.y, o.dotSize, o.dotSize); }
        ctx.globalAlpha = 1;
    }
}

/** Starts the rain on `canvas`. Returns { start, stop }; it only animates while started. */
export function createRain(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { start() {}, stop() {} };
    const o = { countDots: 4, cols: 100, dotSize: [6, 4], dotGapY: 7, margin: 50, fadeSpeed: 0.015, moveSpeed: 0.25, colors: ['#5733D4', '#F2C94C', '#7B5CFA', '#2E2F33'], ...opts };
    let group = [], raf = 0;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    for (let i = 0; i < o.cols; i++) {
        const size = o.dotSize[rand(0, o.dotSize.length - 1)];
        group.push(new Column(ctx, canvas, {
            dotsCount: o.countDots, dotGapY: o.dotGapY, dotSize: size, fadeSpeed: o.fadeSpeed,
            moveSpeed: rand(o.moveSpeed - 0.15, o.moveSpeed + 0.15, 10),
            color: o.colors[Math.floor(o.colors.length * Math.random())],
            offsetAlpha: -Math.random(), offsetX: i * (size + o.margin) - size, offsetY: -(Math.random() * canvas.height)
        }));
    }
    addEventListener('resize', resize);

    const frame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const c of group) { c.update(); c.draw(); }
        raf = requestAnimationFrame(frame);
    };
    return {
        start() { if (!raf) raf = requestAnimationFrame(frame); },
        stop() { cancelAnimationFrame(raf); raf = 0; }
    };
}
