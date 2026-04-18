// Main JavaScript for DPMS Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

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

        // Pause autoplay only when hovering meaningful areas, not the whole slider
        let hoverCount = 0;
        const scope = slider.parentElement || document;
        const pauseTargets = scope.querySelectorAll(
            '.hero-content, .hero-poster, .hero-nav, .hero-dots button'
        );
        pauseTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                hoverCount++;
                paused = true;
                stop();
            });
            el.addEventListener('mouseleave', () => {
                hoverCount = Math.max(0, hoverCount - 1);
                if (hoverCount === 0) {
                    paused = false;
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
