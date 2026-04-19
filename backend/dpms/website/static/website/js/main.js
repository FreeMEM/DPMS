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
            { key: '',               selector: '#inicio' },
            { key: 'que-es',         selector: '#que-es' },
            { key: 'compos',         selector: '#compos' },
            { key: 'por-que',        selector: '#por-que' },
            { key: 'info-evento',    selector: '#info-evento' },
            { key: 'historia',       selector: '#historia' },
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

    // Animated counters — fire once per element the first time it enters
    // the viewport so stats feel alive as the user scrolls.
    (function initCounters() {
        const targets = Array.from(document.querySelectorAll('[data-count-to]'));
        if (!targets.length) return;

        function animate(el) {
            if (el.dataset.counted === '1') return;
            const end = parseInt(el.dataset.countTo, 10);
            if (isNaN(end)) return;
            el.dataset.counted = '1';
            const duration = 1100;
            const startTime = performance.now();
            function frame(now) {
                const t = Math.min(1, (now - startTime) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(end * eased);
                if (t < 1) requestAnimationFrame(frame);
            }
            el.textContent = '0';
            requestAnimationFrame(frame);
        }

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animate(entry.target);
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            targets.forEach(el => io.observe(el));
        } else {
            targets.forEach(animate);
        }
    })();

    // Production screenshot mosaic as a decorative backdrop for sections
    // that include .slide-bg-mosaic. Tiles swap one image every couple of
    // seconds to keep the background alive.
    (function initSectionMosaics() {
        const containers = document.querySelectorAll('.slide-bg-mosaic');
        if (!containers.length) return;
        const shots = window.__DPMS_SCREENSHOTS || [];
        const media = window.__DPMS_MEDIA_URL || '/media/';
        if (!shots.length) return;
        const tilesPerSection = 24;

        function pick() {
            return shots[Math.floor(Math.random() * shots.length)];
        }

        containers.forEach(container => {
            const inner = document.createElement('div');
            inner.className = 'slide-bg-mosaic-inner';
            container.appendChild(inner);

            for (let i = 0; i < tilesPerSection; i++) {
                const tile = document.createElement('div');
                tile.className = 'slide-bg-tile';
                tile.style.backgroundImage = 'url(' + media + pick() + ')';
                inner.appendChild(tile);
            }
            const tiles = Array.from(inner.querySelectorAll('.slide-bg-tile'));

            function swap() {
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
