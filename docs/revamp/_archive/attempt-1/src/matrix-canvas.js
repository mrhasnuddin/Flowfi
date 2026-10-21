// FlowFi Dot-Matrix Canvas Engine (Reverse-engineered from Taiko's class y / class C)
// Tailored with FlowFi's original branding palette: FlowFi Purple (#7B5CFA), Lavender (#B9A9FF), Treasury Gold (#F2C94C), and subtle Gray (#E6E8EE)

class MatrixColumn {
    constructor(ctx, canvas, options) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.options = options;
        this.dots = [];
        this.offsetY = options.offsetY || 0;
        this.setup();
    }

    setup() {
        for (let i = 0; i < this.options.dotsCount; i++) {
            this.dots.push({
                x: this.options.offsetX,
                y: i * (this.options.dotSize + this.options.dotGapY) + this.offsetY,
                alpha: i * this.options.offsetAlpha,
                sideMp: 1,
                entry: false
            });
        }
    }

    update() {
        const fade = this.options.fadeSpeed;
        for (let dot of this.dots) {
            if (dot.entry) {
                let nextAlpha = dot.alpha + fade * dot.sideMp;
                if (nextAlpha >= 1) dot.sideMp = -1;
                if (nextAlpha <= 0) dot.sideMp = 1;
                dot.alpha = nextAlpha;
                dot.y += this.options.moveSpeed;

                if (dot.y + this.options.dotSize > this.canvas.height) {
                    dot.y = -this.options.dotSize;
                }
            } else {
                dot.alpha += fade;
                dot.y += this.options.moveSpeed;
                dot.entry = dot.alpha >= 0;
            }
        }
    }

    draw() {
        const { ctx, options } = this;
        for (let dot of this.dots) {
            ctx.save();
            ctx.fillStyle = options.color;
            ctx.globalAlpha = Math.max(0, Math.min(1, dot.alpha));
            ctx.fillRect(dot.x, dot.y, options.dotSize, options.dotSize);
            ctx.restore();
        }
    }
}

function randRange(min, max, precision = 1) {
    return min + Math.round(Math.random() * (max - min) * precision) / precision;
}

export class FlowFiMatrixCanvas {
    constructor(canvasElement, customOptions = {}) {
        if (!canvasElement) return;
        this.canvas = canvasElement;
        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;
        this.ctx = ctx;
        this.group = [];
        this.raf = null;

        // FlowFi Original Brand Palette
        this.options = Object.assign({
            countDots: 5,
            cols: 28,
            dotSize: 5,
            dotGapY: 8,
            margin: 36,
            fadeSpeed: 0.018,
            moveSpeed: 0.45,
            colors: ['#7B5CFA', '#B9A9FF', '#F2C94C', '#E6E8EE', '#D1D5DB']
        }, customOptions);

        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);

        this.resize();
        this.setup();
        this.animate();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        this.canvasWidth = this.canvas.width = parent ? parent.offsetWidth : window.innerWidth;
        this.canvasHeight = this.canvas.height = parent ? parent.offsetHeight : 600;
    }

    setup() {
        window.addEventListener('resize', this.resize);
        this.group = [];

        const totalWidth = this.canvasWidth;
        const colWidth = this.options.dotSize + this.options.margin;
        const actualCols = Math.max(12, Math.floor(totalWidth / colWidth));

        for (let col = 0; col < actualCols; col++) {
            const dotSize = this.options.dotSize;
            const x = col * colWidth + (colWidth / 2);
            const color = this.options.colors[Math.floor(this.options.colors.length * Math.random())];

            this.group.push(new MatrixColumn(this.ctx, this.canvas, {
                dotsCount: this.options.countDots,
                dotGapY: this.options.dotGapY,
                dotSize: dotSize,
                fadeSpeed: this.options.fadeSpeed,
                moveSpeed: randRange(this.options.moveSpeed * 0.7, this.options.moveSpeed * 1.3, 10),
                color: color,
                offsetAlpha: -Math.random(),
                offsetX: x,
                offsetY: -(Math.random() * this.canvasHeight)
            }));
        }
    }

    draw() {
        this.group.forEach(col => {
            col.update();
            col.draw();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.draw();
        this.raf = requestAnimationFrame(this.animate);
    }

    destroy() {
        if (this.raf) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }
        this.group = [];
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        window.removeEventListener('resize', this.resize);
    }
}
