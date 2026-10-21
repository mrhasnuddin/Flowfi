import './style.css';
import { setupI18n } from './i18n.js';
import { FlowFiMatrixCanvas } from './matrix-canvas.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize i18n
    setupI18n();

    // 2. Initialize Taiko-style FlowFi Dot-Matrix Canvas in Triad Section
    const matrixCanvas = document.getElementById('matrix-canvas');
    if (matrixCanvas) {
        new FlowFiMatrixCanvas(matrixCanvas, {
            countDots: 6,
            dotSize: 5,
            dotGapY: 10,
            margin: 40,
            fadeSpeed: 0.016,
            moveSpeed: 0.42,
            colors: ['#7B5CFA', '#B9A9FF', '#F2C94C', '#E6E8EE', '#CBD5E1']
        });
    }

    // 3. 3D Interactive Mouse Perspective Tilt on Hero 3D Emblem
    const heroWrapper = document.getElementById('hero-3d-wrapper');
    const heroImg = document.getElementById('hero-3d-img');

    if (heroWrapper && heroImg) {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        const maxTilt = 16; // max degrees

        window.addEventListener('mousemove', (e) => {
            const rect = heroWrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const normalizedX = (e.clientX - centerX) / (window.innerWidth / 2);
            const normalizedY = (e.clientY - centerY) / (window.innerHeight / 2);

            mouseX = Math.max(-1, Math.min(1, normalizedX)) * maxTilt;
            mouseY = Math.max(-1, Math.min(1, normalizedY)) * maxTilt;
        }, { passive: true });

        function tiltLoop() {
            // Smooth lerp
            currentX += (mouseX - currentX) * 0.08;
            currentY += (mouseY - currentY) * 0.08;

            heroImg.style.transform = `perspective(1000px) rotateY(${currentX.toFixed(2)}deg) rotateX(${(-currentY).toFixed(2)}deg)`;
            requestAnimationFrame(tiltLoop);
        }
        requestAnimationFrame(tiltLoop);
    }

    // 4. Interactive Treasury Yield & Consensus Calculator
    const slider = document.getElementById('treasury-slider');
    const sizeVal = document.getElementById('sim-treasury-val');
    const yieldVal = document.getElementById('sim-yield-val');
    const powerVal = document.getElementById('sim-power-val');

    if (slider && sizeVal && yieldVal && powerVal) {
        function formatUSD(num) {
            if (num >= 1_000_000) {
                return `$${(num / 1_000_000).toFixed(1)}M`;
            }
            return `$${(num / 1_000).toFixed(0)}k`;
        }

        function updateSimulator() {
            const rawVal = parseFloat(slider.value); // e.g. 5000000
            sizeVal.innerText = formatUSD(rawVal);

            // Estimated 8.4% annualized backflow
            const estYield = rawVal * 0.084;
            yieldVal.innerText = `${formatUSD(estYield)} / yr`;

            // Consensus voting power calculation (stake weight multiplier)
            const votes = Math.round((rawVal / 1000) * 1.45);
            powerVal.innerText = `${votes.toLocaleString()} Votes`;
        }

        slider.addEventListener('input', updateSimulator);
        updateSimulator();
    }

    // 5. Scroll Intersection Observer for Entrance Transitions
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    scrollElements.forEach(el => observer.observe(el));

    // 6. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const isClosed = mobileMenu.classList.contains('translate-x-full');
            if (isClosed) {
                mobileMenu.classList.remove('translate-x-full');
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenu.classList.add('translate-x-full');
                document.body.style.overflow = '';
            }
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
                document.body.style.overflow = '';
            });
        });
    }
});
