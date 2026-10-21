import './tokens.css';
import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupI18n } from './i18n.js';
import { wireLinks } from './links.js';
import { createRain } from './rain.js';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MOTION = root.classList.contains('motion'); // set in <head>: no reduced-motion preference
const rect = (el) => el.getBoundingClientRect();
const twoFrames = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

/* ---------- Header mega menu: opens on hover (fine pointers) or click, enters from above, leaves downward ---------- */
function setupMegaMenu() {
    const panelOf = (btn) => $('#' + btn.getAttribute('aria-controls'));
    let open = null, timer = 0;
    const hide = (btn, instant) => {
        const panel = panelOf(btn);
        btn.setAttribute('aria-expanded', 'false');
        if (open === btn) open = null;
        if (instant || !MOTION) { panel.hidden = true; panel.removeAttribute('data-state'); return; }
        panel.dataset.state = 'leave';
        setTimeout(() => { if (panel.dataset.state === 'leave') { panel.hidden = true; panel.removeAttribute('data-state'); } }, 300);
    };
    const show = (btn) => {
        clearTimeout(timer);
        if (open === btn) return;
        if (open) hide(open, true);
        const panel = panelOf(btn);
        panel.hidden = false;
        panel.dataset.state = 'from';
        twoFrames(() => { if (panel.dataset.state === 'from') panel.removeAttribute('data-state'); });
        btn.setAttribute('aria-expanded', 'true');
        open = btn;
    };
    const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
    $$('.hnav__group').forEach((group) => {
        const btn = $('.hnav__item', group);
        btn.addEventListener('click', () => (open === btn ? hide(btn) : show(btn)));
        if (hover) {
            group.addEventListener('pointerenter', () => show(btn));
            group.addEventListener('pointerleave', () => { timer = setTimeout(() => { if (open === btn) hide(btn); }, 150); });
        }
        group.addEventListener('focusout', (e) => { if (open === btn && !group.contains(e.relatedTarget)) hide(btn); });
        group.addEventListener('click', (e) => { if (e.target.closest('a[href]')) hide(btn, true); });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { const btn = open; hide(btn); btn.focus(); } });
    document.addEventListener('pointerdown', (e) => { if (open && !e.target.closest('.hnav')) hide(open); });
}

/* ---------- Full-screen menu (1024px and below). The page behind is inert while it is open. ---------- */
function setupMenu() {
    const btn = $('.header__burger'), menu = $('#menu');
    const behind = [$('main'), $('footer'), $('.pager')];
    const set = (open) => {
        btn.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
        behind.forEach((el) => { el.inert = open; });
        if (open) {
            menu.hidden = false; menu.dataset.state = 'from';
            twoFrames(() => menu.removeAttribute('data-state'));
        } else {
            menu.dataset.state = 'leave';
            setTimeout(() => { if (menu.dataset.state === 'leave') { menu.hidden = true; menu.removeAttribute('data-state'); } }, MOTION ? 400 : 0);
        }
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a[href]')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    matchMedia('(min-width: 1101px)').addEventListener('change', (e) => { if (e.matches && !menu.hidden) set(false); });
}

/* ---------- Hero: the 3D mark falls out of the hero while the flat mark rises into the first scaling screen ---------- */
function heroFall() {
    const s1 = $('#s1-mark'), s2 = $('#s2-mark-wrap');
    gsap.timeline({ scrollTrigger: { trigger: s1, start: 'top 30%', endTrigger: s2, end: 'top 30%', scrub: 1.2, invalidateOnRefresh: true } })
        .to('#s1-mark > img', { y: () => rect(s2).top - rect(s1).top }, 0)
        .fromTo('#s2-icon', { y: () => rect(s1).top - rect(s2).top }, { y: 0 }, 0);
}

/* ---------- Scaling: pinned sideways scroll, a comet of light along the rays, the mark spinning into a vault and back ---------- */
function scaling() {
    const wrap = $('#scaling-wrapper');
    const lines = $$('.scaling-line').map((el) => ({ el, len: el.getTotalLength() }));
    const comet = (p) => lines.forEach(({ el, len }) => {
        const i = (innerHeight + innerWidth) * 0.4;
        gsap.set(el, { strokeDasharray: `${i} ${len - i}`, strokeDashoffset: i + len - (i + len) * p });
    });
    comet(0);

    gsap.to(wrap, {
        x: () => -(wrap.scrollWidth - innerWidth), ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top top', end: 'top+=300% top', pin: true, scrub: 1, invalidateOnRefresh: true }
    });
    gsap.to({}, {
        ease: 'none', onUpdate() { comet(this.progress()); },
        scrollTrigger: { trigger: wrap, start: 'top top', end: 'top+=330% top', scrub: 1.5, invalidateOnRefresh: true }
    });

    const settle = (sel) => () => gsap.set(sel, { rotate: 0 });
    let looping = false;
    gsap.set(['#s2-mark', '#s2-vault'], { transformOrigin: '50% 50%' });
    const spin = gsap.timeline({ paused: true, onComplete: () => { if (looping) spin.restart(); } })
        .to('#s2-mark', { ease: 'power4.in', rotate: 1080, opacity: 0, duration: 0.5, onComplete: settle('#s2-mark') }, 'spin')
        .to('#s2-vault', { ease: 'power4.out', rotate: 1080, opacity: 1, duration: 0.5, onComplete: settle('#s2-vault') }, 'spin+=0.4')
        .to({}, { duration: 2 })
        .to('#s2-vault', { ease: 'power4.in', rotate: 1080, opacity: 0, duration: 0.5, onComplete: settle('#s2-vault') }, 'spinOut')
        .to('#s2-mark', { ease: 'power4.out', rotate: 1080, opacity: 1, duration: 0.5, onComplete: settle('#s2-mark') }, 'spinOut+=0.4')
        .to({}, { duration: 2 });
    ScrollTrigger.create({
        trigger: wrap, start: 'top 20%', end: 'bottom top', invalidateOnRefresh: true,
        onEnter: () => { if (!looping) { looping = true; spin.timeScale(1).restart(); } },
        onLeaveBack: () => { if (looping) { looping = false; spin.timeScale(4); } } // finish the current turn quickly, then stop
    });

    // The light band that sweeps around the flat mark, and the rain, run only while the section is on screen
    const grad = $('.mk-gradient');
    grad.setAttribute('gradientTransform', 'rotate(0 288 254)');
    const sweep = gsap.to(grad, { attr: { gradientTransform: 'rotate(-360 288 254)' }, repeat: -1, duration: 4, ease: 'none', paused: true });
    const rain = createRain($('#rain'));
    ScrollTrigger.create({
        trigger: '#scaling', start: 'top bottom', end: 'bottom top',
        onToggle: (self) => { if (self.isActive) { rain.start(); sweep.play(); } else { rain.stop(); sweep.pause(); } }
    });
}

/* ---------- Explore: pinned while the mark orbits ---------- */
function explore() {
    const end = matchMedia('(min-width: 1025px)').matches ? 'top+=135% bottom' : 'top+=250% bottom';
    ScrollTrigger.create({ trigger: '#explore', start: 'top top', end, scrub: true, pin: true, pinSpacing: true, invalidateOnRefresh: true });
}

/* ---------- Economics: the four cards rise in, one after another, the first time the grid comes into view ---------- */
function economics() {
    gsap.from('.econ__card', { opacity: 0, y: 48, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.econ__list', start: 'top 85%', once: true } });
}

/* ---------- The gradient wave rises over About into the ink roadmap, then sinks away before Governance ---------- */
function wave() {
    gsap.to('.s1-shape', { height: '300vh', scrollTrigger: { trigger: '.wrap__s1', start: 'top top-=100%', end: 'bottom 30%', scrub: 1, invalidateOnRefresh: true } });
    gsap.to('.s3-shape', { height: 0, scrollTrigger: { trigger: '.wrap__s3', start: 'top bottom', end: 'top+=70% bottom', scrub: 1, invalidateOnRefresh: true } });
}

/* ---------- About: grid lines draw once, hatches slide in, the title lights up letter by letter ---------- */
function splitAbout() {
    const text = $('.about__title .sr-only').textContent;
    $('.about-span').replaceChildren(...[...text].map((ch) => Object.assign(document.createElement('span'), { textContent: ch })));
}
let aboutLetters;
function aboutTitle() {
    aboutLetters?.scrollTrigger?.kill();
    aboutLetters?.kill();
    splitAbout();
    if (!MOTION) return;
    aboutLetters = gsap.timeline({ scrollTrigger: { trigger: '.about__title', start: 'top 95%', end: 'bottom 52%', scrub: 0.5 } })
        .to('.about-span span', { opacity: 1, stagger: 0.1 });
}
function about() {
    gsap.to('.about-grid', {
        strokeDashoffset: 0, duration: 3,
        scrollTrigger: { trigger: '#about', start: 'top 75%', once: true, onEnter: () => $('#about').classList.add('is-animated') }
    });
}

/* ---------- Roadmap: the band draws down the streaks and each phase opens as the band reaches it ---------- */
function journey() {
    const path = $('.journey-path'), items = $$('.jitem__content');
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
        strokeDashoffset: 0,
        onUpdate() { const p = this.progress(); items.forEach((el) => { el.style.height = (+el.dataset.progress < p ? el.scrollHeight : 0) + 'px'; }); },
        scrollTrigger: { trigger: '#journey-roadmap', start: 'top 50%', end: 'bottom 90%', invalidateOnRefresh: true, scrub: 3 }
    });
}

/* ---------- Governance: chain coins drift around the FlowFi hub; packets travel each line into the hub; now and then a coin flips ---------- */
function governanceNet() {
    const art = $('.gnet');
    if (!art) return;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = $('.gnet__lines', art), hub = $('.gnet__hub', art);
    const center = (el) => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 });
    const coins = $$('.gnet__node', art).map((el) => {
        const line = document.createElementNS(NS, 'line'), packet = document.createElementNS(NS, 'circle');
        packet.setAttribute('r', '2.6');
        if (el.classList.contains('gnet__node--eni')) line.classList.add('is-home');
        svg.append(line, packet);
        el.addEventListener('pointerenter', () => line.classList.add('is-hot'));
        el.addEventListener('pointerleave', () => line.classList.remove('is-hot'));
        return { el, line, packet, base: { x: 0, y: 0 }, t: Math.random(), speed: 0.16 + Math.random() * 0.14 };
    });
    let hubC = { x: 0, y: 0 };
    const measure = () => {
        svg.setAttribute('viewBox', `0 0 ${art.clientWidth} ${art.clientHeight}`);
        hubC = center(hub);
        coins.forEach((c) => { c.base = center(c.el); });
    };
    const draw = () => coins.forEach((c) => {
        const x = c.base.x + (MOTION ? gsap.getProperty(c.el, 'x') : 0), y = c.base.y + (MOTION ? gsap.getProperty(c.el, 'y') : 0);
        c.line.setAttribute('x1', x); c.line.setAttribute('y1', y);
        c.line.setAttribute('x2', hubC.x); c.line.setAttribute('y2', hubC.y);
        c.packet.setAttribute('cx', x + (hubC.x - x) * c.t);
        c.packet.setAttribute('cy', y + (hubC.y - y) * c.t);
        c.packet.setAttribute('opacity', MOTION ? Math.sin(Math.PI * c.t).toFixed(2) : 0); // fades in at the coin, out at the hub
    });
    measure(); draw();
    new ResizeObserver(() => { measure(); draw(); }).observe(art);
    if (!MOTION) return;

    const drift = [...coins.map((c) => c.el), ...$$('.gnet__dot', art)].map((el) => gsap.to(el, {
        x: 'random(-26, 26)', y: 'random(-16, 16)', duration: 'random(2.8, 5.2)',
        ease: 'sine.inOut', repeat: -1, repeatRefresh: true, paused: true
    }));
    const tick = (time, dt) => {
        coins.forEach((c) => { c.t = (c.t + c.speed * dt / 1000) % 1; });
        draw();
    };
    const flip = gsap.delayedCall(2.4, function () {
        const coin = $('.gnet__coin', coins[Math.floor(Math.random() * coins.length)].el);
        gsap.to(coin, { rotationY: '+=360', duration: 1.2, ease: 'power2.inOut' });
        this.restart(true);
    }).pause();
    ScrollTrigger.create({
        trigger: art, start: 'top bottom', end: 'bottom top',
        onToggle: (self) => {
            drift.forEach((t) => (self.isActive ? t.play() : t.pause()));
            if (self.isActive) { gsap.ticker.add(tick); flip.restart(true); }
            else { gsap.ticker.remove(tick); flip.pause(); }
        }
    });
}

/* ---------- Section rail: marks the section in the middle of the viewport ---------- */
function pager() {
    const nav = $('.pager'), links = $$('.pager a');
    links.forEach((a) => {
        const sec = $(a.getAttribute('href'));
        const span = sec.closest('.wrap__s1, .wrap__s3') || (sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec);
        ScrollTrigger.create({
            trigger: span, start: 'top 50%', end: 'bottom 50%',
            onToggle: (self) => {
                if (!self.isActive) return;
                links.forEach((l) => l.classList.toggle('is-active', l === a));
                nav.classList.toggle('is-ink', sec.id === 'journey');
            }
        });
    });
}

/* ---------- Boot ---------- */
wireLinks();
setupI18n(() => { aboutTitle(); ScrollTrigger.refresh(); });
setupMegaMenu();
setupMenu();
// ScrollTriggers are created in page order: one made before the scaling and explore pins would be measured without their extra scroll length
if (MOTION) {
    heroFall();
    scaling();
    explore();
    economics();
    wave();
    about();
}
aboutTitle();
if (MOTION) journey();
governanceNet();
pager();
document.fonts?.ready.then(() => ScrollTrigger.refresh());
