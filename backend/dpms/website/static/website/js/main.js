// Main JavaScript for DPMS Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for any link whose href contains a hash (both "#id" and
    // "/#id" are covered — the latter is emitted by navbar items that also
    // serve as the "Home" route).
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href') || '';
            const hashIdx = href.indexOf('#');
            if (hashIdx < 0) return;
            const id = href.slice(hashIdx + 1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Scroll spy: light up the navbar link matching the section in view.
    (function initScrollSpy() {
        const navLinks = Array.from(
            document.querySelectorAll('.navbar-menu a[href]')
        ).filter(a => {
            const h = a.getAttribute('href') || '';
            return h === '/' || h.includes('#');
        });
        if (!navLinks.length) return;

        const sections = [
            { key: '',             selector: '.hero-section' },
            { key: 'que-es',       selector: '#que-es' },
            { key: 'info-evento',  selector: '#info-evento' },
            { key: 'patrocinadores', selector: '#patrocinadores' },
        ]
        .map(s => ({ key: s.key, el: document.querySelector(s.selector) }))
        .filter(s => s.el);

        function linkKey(link) {
            const href = link.getAttribute('href') || '';
            const idx = href.indexOf('#');
            if (idx < 0) return href === '/' ? '' : null;
            return href.slice(idx + 1);
        }

        function update() {
            const offset = 140; // approx navbar height + padding
            const pos = window.scrollY + offset;
            let current = sections[0].key;
            for (const s of sections) {
                if (s.el.offsetTop <= pos) current = s.key;
            }
            navLinks.forEach(link => {
                const key = linkKey(link);
                link.classList.toggle('is-active', key === current);
            });
        }

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => { update(); ticking = false; });
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    })();

    // Hero Slider
    (function initHeroSlider() {
        const slider = document.getElementById('hero-slider');
        if (!slider) return;
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        if (slides.length <= 1) return;

        const prevBtn = document.getElementById('hero-prev');
        const nextBtn = document.getElementById('hero-next');
        const dotsContainer = document.getElementById('hero-dots');
        const AUTOPLAY_MS = 7000;
        // Expose duration to CSS so the progress bar in the active dot
        // stays in sync with the JS timer.
        slider.style.setProperty('--slider-duration', AUTOPLAY_MS + 'ms');
        let current = 0;
        let timer = null;
        let paused = false;

        // Build dots
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', 'Ir al slide ' + (i + 1));
            if (i === 0) dot.classList.add('is-active');
            dot.addEventListener('click', () => go(i, true));
            dotsContainer.appendChild(dot);
        });
        const dots = Array.from(dotsContainer.querySelectorAll('button'));

        function go(index, manual) {
            current = (index + slides.length) % slides.length;
            slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
            dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
            if (manual) restart();
        }

        function next() { go(current + 1); }
        function prev() { go(current - 1, true); }

        function start() {
            stop();
            if (paused) return;
            timer = setInterval(next, AUTOPLAY_MS);
        }
        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
        }
        function restart() { start(); }

        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', () => go(current + 1, true));

        // Pause autoplay only when hovering interactive controls. The hero
        // text area is big enough that blanket-pausing made the rotation feel
        // broken.
        let hoverCount = 0;
        const scope = slider.parentElement || document;
        const pauseTargets = scope.querySelectorAll(
            '.hero-nav, .hero-dots button, .cta-buttons a, .cta-buttons button, ' +
            '.perk, .poster-thumb, .hero-poster img'
        );
        function setPaused(state) {
            paused = state;
            dotsContainer.classList.toggle('is-paused', state);
        }
        pauseTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                hoverCount++;
                setPaused(true);
                stop();
            });
            el.addEventListener('mouseleave', () => {
                hoverCount = Math.max(0, hoverCount - 1);
                if (hoverCount === 0) {
                    setPaused(false);
                    start();
                }
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') go(current + 1, true);
        });

        // Touch swipe
        let touchStartX = 0;
        slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        slider.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(dx) > 50) {
                if (dx < 0) go(current + 1, true); else prev();
            }
        });

        start();
    })();

    // Detectar scroll y añadir clase a navbar
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        }

        lastScroll = currentScroll;
    });
});
