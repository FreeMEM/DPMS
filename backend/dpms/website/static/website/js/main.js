// Main JavaScript for DPMS Landing Page

document.addEventListener('DOMContentLoaded', function() {
    console.log('DPMS Landing Page loaded');

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
