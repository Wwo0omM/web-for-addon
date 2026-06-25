/* AI Toolkit — minimal interactive layer
   Subtle motion. Native APIs. No dependencies. */

(function () {
    'use strict';

    /* ---------- Mobile nav toggle ---------- */
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');

    if (nav && navToggle) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('is-open');
            const expanded = nav.classList.contains('is-open');
            navToggle.setAttribute('aria-expanded', String(expanded));
        });

        // Close menu after tapping a link
        nav.querySelectorAll('.nav__menu a, .nav__actions a').forEach((link) => {
            link.addEventListener('click', () => nav.classList.remove('is-open'));
        });
    }

    /* ---------- Smooth in-page navigation ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (event) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    /* ---------- Scroll reveal (very restrained) ---------- */
    const revealTargets = document.querySelectorAll(
        '.section__head, .cap, .flow__step, .doc, .tile, .stat, .panel, .window, .qa'
    );

    revealTargets.forEach((el) => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        revealTargets.forEach((el) => observer.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add('is-in'));
    }

    /* ---------- Set current year in footer (if used) ---------- */
    const yearSlot = document.getElementById('year');
    if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());


    /* ---------- Reduced-motion flag ---------- */
    const REDUCE = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Theme toggle (light / dark) ---------- */
    (function theme() {
        const root = document.documentElement;
        const btn = document.getElementById('themeToggle');
        const apply = (t) => {
            root.setAttribute('data-theme', t);
            if (btn) btn.setAttribute('aria-pressed', String(t === 'dark'));
        };
        if (!root.getAttribute('data-theme')) {
            const saved = localStorage.getItem('aitk-theme');
            const sys = window.matchMedia &&
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            apply(saved || (sys ? 'dark' : 'light'));
        }
        if (btn) {
            btn.addEventListener('click', () => {
                const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                apply(next);
                localStorage.setItem('aitk-theme', next);
            });
        }
    })();

    /* ---------- Live hero background (constellation) ---------- */
    (function heroBg() {
        const canvas = document.getElementById('heroBg');
        if (!canvas || REDUCE) return;
        const ctx = canvas.getContext('2d');
        let w, h, dpr, pts, raf;
        const accent = () =>
            getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d6e23a';
        const inkRGB = () =>
            (document.documentElement.getAttribute('data-theme') === 'dark') ? '255,255,255' : '17,18,16';

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth; h = canvas.clientHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.round(Math.min(90, (w * h) / 16000));
            pts = Array.from({ length: count }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
                r: Math.random() * 1.6 + 0.6
            }));
        }
        function frame() {
            ctx.clearRect(0, 0, w, h);
            const ink = inkRGB();
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                for (let j = i + 1; j < pts.length; j++) {
                    const q = pts[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 130) {
                        ctx.strokeStyle = 'rgba(' + ink + ',' + (0.12 * (1 - dist / 130)).toFixed(3) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                    }
                }
            }
            ctx.fillStyle = accent();
            for (const p of pts) {
                ctx.globalAlpha = 0.7;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(frame);
        }
        resize(); frame();
        let to;
        window.addEventListener('resize', () => { clearTimeout(to); to = setTimeout(resize, 200); });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { cancelAnimationFrame(raf); }
            else { frame(); }
        });
    })();

    /* ---------- Tilt on panel + capability cards ---------- */
    (function tilt() {
        if (REDUCE || window.matchMedia('(hover: none)').matches) return;
        const targets = document.querySelectorAll('.panel, .cap');
        targets.forEach((el) => {
            const MAX = el.classList.contains('panel') ? 7 : 5;
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform =
                    'perspective(900px) rotateX(' + (-py * MAX).toFixed(2) + 'deg) rotateY(' +
                    (px * MAX).toFixed(2) + 'deg) translateY(-3px)';
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    })();

    /* ---------- Magnetic buttons ---------- */
    (function magnet() {
        if (REDUCE || window.matchMedia('(hover: none)').matches) return;
        document.querySelectorAll('.btn').forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const mx = e.clientX - r.left - r.width / 2;
                const my = e.clientY - r.top - r.height / 2;
                btn.style.transform = 'translate(' + (mx * 0.25).toFixed(1) + 'px,' + (my * 0.35).toFixed(1) + 'px)';
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    })();

    /* ---------- Hero mock-panel animation ---------- */
    (function mockPanel() {
        const promptEl = document.getElementById('mockPrompt');
        const statusEl = document.getElementById('mockStatus');
        const barEl = document.getElementById('mockProgress');
        if (!promptEl || !statusEl || !barEl || REDUCE) return;

        const PROMPTS = [
            'a brutalist concrete bench, weathered',
            'low-poly pine tree, stylised, game-ready',
            'sci-fi crate with PBR metal panels',
            'ceramic vase, smooth, studio lighting'
        ];
        let idx = 0;
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

        async function typeText(text) {
            promptEl.classList.add('type-caret');
            promptEl.textContent = '';
            for (let i = 0; i < text.length; i++) {
                promptEl.textContent += text[i];
                await sleep(34);
            }
            promptEl.classList.remove('type-caret');
        }
        async function runProgress() {
            statusEl.textContent = 'Generating…';
            barEl.style.transition = 'none';
            barEl.style.width = '0%';
            await sleep(40);
            barEl.style.transition = 'width 2.6s cubic-bezier(.4,.1,.2,1)';
            barEl.style.width = '100%';
            await sleep(2700);
            statusEl.textContent = 'Ready to import';
        }
        async function loop() {
            while (true) {
                await typeText(PROMPTS[idx]);
                await sleep(400);
                await runProgress();
                await sleep(2600);
                idx = (idx + 1) % PROMPTS.length;
            }
        }
        loop();
    })();


    /* ---------- Interactive demo (Text to 3D) ---------- */
    (function demo() {
        const svg = document.getElementById('demoSvg');
        const input = document.getElementById('demoInput');
        const statusEl = document.getElementById('demoStatus');
        const genBtn = document.getElementById('demoGen');
        const stopBtn = document.getElementById('demoStop');
        if (!svg || !input || !genBtn) return;

        const groups = {};
        svg.querySelectorAll('.demo__obj').forEach((g) => { groups[g.dataset.obj] = g; });
        const chips = Array.from(document.querySelectorAll('.demo__chips .chip'));
        let timers = [];
        const reduceMo = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
        const after = (ms, fn) => timers.push(setTimeout(fn, ms));

        function pickObject(text) {
            const t = (text || '').toLowerCase();
            if (/(vase|pot|jar|ceramic|vessel)/.test(t)) return 'vase';
            if (/(tree|pine|plant|forest)/.test(t)) return 'tree';
            if (/(chair|seat|stool|bench)/.test(t)) return 'chair';
            return 'chair';
        }
        function setActive(name) {
            Object.values(groups).forEach((g) => g.classList.remove('is-active', 'is-drawn', 'is-filled'));
            const g = groups[name];
            if (g) g.classList.add('is-active');
            chips.forEach((c) => c.classList.toggle('is-active', c.dataset.obj === name));
            return g;
        }
        function generate() {
            clearTimers();
            const name = pickObject(input.value);
            const g = setActive(name);
            if (!g) return;
            statusEl.textContent = 'Analysing prompt…';
            // force reflow so the dashoffset reset animates
            void svg.getBoundingClientRect();
            after(reduceMo ? 0 : 650, () => {
                statusEl.textContent = 'Building mesh…';
                g.classList.add('is-drawn');
            });
            after(reduceMo ? 0 : 2200, () => g.classList.add('is-filled'));
            after(reduceMo ? 0 : 2700, () => { statusEl.textContent = 'Done · Ready to import'; });
        }
        function stop() {
            clearTimers();
            statusEl.textContent = 'Stopped';
        }
        genBtn.addEventListener('click', generate);
        if (stopBtn) stopBtn.addEventListener('click', stop);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') generate(); });
        chips.forEach((c) => c.addEventListener('click', () => {
            input.value = c.dataset.prompt || c.textContent;
            generate();
        }));
        // initial state — first object drawn statically
        setActive('chair');
        groups.chair.classList.add('is-drawn', 'is-filled');
    })();

    /* ---------- Before / After slider ---------- */
    (function beforeAfter() {
        const ba = document.getElementById('ba');
        const before = document.getElementById('baBefore');
        if (!ba || !before) return;
        let dragging = false;

        function setPos(clientX) {
            const r = ba.getBoundingClientRect();
            let pct = ((clientX - r.left) / r.width) * 100;
            pct = Math.max(0, Math.min(100, pct));
            ba.style.setProperty('--pos', pct + '%');
            ba.setAttribute('aria-valuenow', String(Math.round(pct)));
        }
        const onMove = (e) => {
            if (!dragging) return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            setPos(x);
        };
        const start = (e) => {
            dragging = true;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            setPos(x);
            e.preventDefault();
        };
        const end = () => { dragging = false; };

        ba.addEventListener('mousedown', start);
        ba.addEventListener('touchstart', start, { passive: false });
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('mouseup', end);
        window.addEventListener('touchend', end);
        ba.addEventListener('keydown', (e) => {
            const cur = parseFloat(ba.getAttribute('aria-valuenow')) || 50;
            if (e.key === 'ArrowLeft') { ba.style.setProperty('--pos', Math.max(0, cur - 4) + '%'); ba.setAttribute('aria-valuenow', String(Math.max(0, cur - 4))); }
            if (e.key === 'ArrowRight') { ba.style.setProperty('--pos', Math.min(100, cur + 4) + '%'); ba.setAttribute('aria-valuenow', String(Math.min(100, cur + 4))); }
        });
        ba.style.setProperty('--pos', '50%');
    })();

})();