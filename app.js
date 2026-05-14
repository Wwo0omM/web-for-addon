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

})();
