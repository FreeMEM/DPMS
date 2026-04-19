// Main JavaScript for DPMS Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Mobile navbar toggle. Hamburger flips `is-open` on the menu and
    // `aria-expanded` on itself; any tap on a link inside the menu closes it.
    (function initNavbarToggle() {
        const toggle = document.querySelector('.navbar-toggle');
        const menu = document.getElementById('navbar-menu');
        if (!toggle || !menu) return;

        function setOpen(open) {
            menu.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        toggle.addEventListener('click', () => {
            const open = menu.classList.contains('is-open');
            setOpen(!open);
        });

        menu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => setOpen(false));
        });

        document.addEventListener('click', (e) => {
            if (!menu.classList.contains('is-open')) return;
            if (menu.contains(e.target) || toggle.contains(e.target)) return;
            setOpen(false);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) setOpen(false);
        });
    })();

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
            animateCountersIn(slides[current]);
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

        // Animate counters inside the slide that just became active. Each
        // animation runs once per slide to avoid distracting loops.
        function animateCountersIn(slideEl) {
            if (!slideEl) return;
            const targets = slideEl.querySelectorAll('[data-count-to]');
            targets.forEach(el => {
                if (el.dataset.counted === '1') return;
                const end = parseInt(el.dataset.countTo, 10);
                if (isNaN(end)) return;
                el.dataset.counted = '1';
                const duration = 1100;
                const startTime = performance.now();
                function frame(now) {
                    const t = Math.min(1, (now - startTime) / duration);
                    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
                    el.textContent = Math.round(end * eased);
                    if (t < 1) requestAnimationFrame(frame);
                }
                el.textContent = '0';
                requestAnimationFrame(frame);
            });
        }

        // Kick off counters that are visible in the initial slide.
        animateCountersIn(slides[current]);

        // Production screenshot mosaic as a live background for slides that
        // use .slide-bg-mosaic. Tiles get filled once and then one tile swaps
        // its image every couple of seconds.
        (function initSlideMosaics() {
            const shots = window.__DPMS_SCREENSHOTS || [];
            const media = window.__DPMS_MEDIA_URL || '/media/';
            if (!shots.length) return;
            const containers = slider.querySelectorAll('.slide-bg-mosaic');
            if (!containers.length) return;
            const tilesPerSlide = 24;

            function pick() {
                return shots[Math.floor(Math.random() * shots.length)];
            }

            containers.forEach(container => {
                // Build an inner wrapper so the zoom animation can scale just
                // the tiles without affecting the dark overlay.
                const inner = document.createElement('div');
                inner.className = 'slide-bg-mosaic-inner';
                container.appendChild(inner);

                for (let i = 0; i < tilesPerSlide; i++) {
                    const tile = document.createElement('div');
                    tile.className = 'slide-bg-tile';
                    tile.style.backgroundImage = 'url(' + media + pick() + ')';
                    inner.appendChild(tile);
                }
                const tiles = Array.from(inner.querySelectorAll('.slide-bg-tile'));

                function swap() {
                    // Only animate when the parent slide is visible, so we
                    // don't burn cycles behind the scenes.
                    const slide = container.closest('.hero-slide');
                    if (!slide || !slide.classList.contains('is-active')) return;
                    const tile = tiles[Math.floor(Math.random() * tiles.length)];
                    tile.classList.add('is-swapping');
                    setTimeout(() => {
                        tile.style.backgroundImage = 'url(' + media + pick() + ')';
                        tile.classList.remove('is-swapping');
                    }, 700);
                }

                setInterval(swap, 1800);
            });
        })();

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
