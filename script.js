/* ========================================
   VATTE.STORE — JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    /* ---------- Elements ---------- */
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.header__link');
    const searchToggle = document.getElementById('searchToggle');
    const searchWrap = document.getElementById('searchWrapper');
    const searchInput = document.getElementById('searchInput');

    /* Testimonials */
    const track = document.getElementById('testimonialTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsWrapper = document.getElementById('dots');

    /* ---------- Mobile Nav ---------- */
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    function toggleNav() {
        burger.classList.toggle('active');
        nav.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    }

    burger.addEventListener('click', toggleNav);
    overlay.addEventListener('click', toggleNav);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('open')) toggleNav();
        });
    });

    /* ---------- Header scroll effect ---------- */
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        header.classList.toggle('header--scrolled', y > 50);
        lastScroll = y;
    }, { passive: true });

    /* ---------- Active nav link on scroll ---------- */
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.header__link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    /* ---------- Search toggle & filter ---------- */
    const allProductCards = document.querySelectorAll('.product-card');
    const searchResultsMsg = document.getElementById('searchResultsMsg');
    const catalogSection = document.getElementById('catalogo');
    const isProductsPage = !!catalogSection;

    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        searchWrap.classList.toggle('open');
        if (searchWrap.classList.contains('open')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            if (isProductsPage) filterProducts('');
        }
    });

    // Close search on outside click
    document.addEventListener('click', (e) => {
        if (!searchWrap.contains(e.target)) {
            searchWrap.classList.remove('open');
        }
    });

    // Live search — only filter on products page
    searchInput.addEventListener('input', (e) => {
        if (isProductsPage) {
            filterProducts(e.target.value.trim());
        }
    });

    // Search on Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) return;

            if (isProductsPage) {
                // Filter in place & scroll to grid
                filterProducts(query);
                catalogSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Redirect to products page with search query
                window.location.href = `productos.html?search=${encodeURIComponent(query)}`;
            }
        }
    });

    function filterProducts(query) {
        if (!allProductCards.length) return;

        if (!query) {
            allProductCards.forEach(card => {
                card.classList.remove('product-card--hidden');
                card.classList.add('visible');
            });
            if (searchResultsMsg) searchResultsMsg.style.display = 'none';
            return;
        }

        const terms = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        let matchCount = 0;

        allProductCards.forEach(card => {
            const title = (card.querySelector('.product-card__title')?.textContent || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const desc = (card.querySelector('.product-card__desc')?.textContent || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const searchData = (card.dataset.search || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const combined = `${title} ${desc} ${searchData}`;

            const matches = terms.split(/\s+/).every(term => combined.includes(term));

            if (matches) {
                card.classList.remove('product-card--hidden');
                card.classList.add('visible');
                matchCount++;
            } else {
                card.classList.add('product-card--hidden');
            }
        });

        if (searchResultsMsg) {
            if (matchCount === 0) {
                searchResultsMsg.textContent = `No se encontraron productos para "${query}". Probá con otra búsqueda.`;
                searchResultsMsg.style.display = 'block';
            } else {
                searchResultsMsg.textContent = `Se encontraron ${matchCount} producto${matchCount !== 1 ? 's' : ''} para "${query}"`;
                searchResultsMsg.style.display = 'block';
            }
        }
    }

    // On products page: check for ?search= param in URL and auto-filter
    if (isProductsPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            searchInput.value = searchQuery;
            searchWrap.classList.add('open');
            filterProducts(searchQuery);
        }
    }
    /* ---------- Testimonial Carousel ---------- */
    if (track) {
        const cards = track.querySelectorAll('.testimonial-card');
        let current = 0;
        const total = cards.length;

        // Generate dots
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.classList.add('testimonials__dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goTo(i));
            dotsWrapper.appendChild(dot);
        }

        const dots = dotsWrapper.querySelectorAll('.testimonials__dot');

        function goTo(index) {
            current = index;
            track.style.transform = `translateX(-${current * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        prevBtn.addEventListener('click', () => goTo((current - 1 + total) % total));
        nextBtn.addEventListener('click', () => goTo((current + 1) % total));

        // Auto-play every 5 seconds
        let autoPlay = setInterval(() => goTo((current + 1) % total), 5000);

        // Pause on hover
        const carousel = document.getElementById('testimonialCarousel');
        carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
        carousel.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => goTo((current + 1) % total), 5000);
        });

        // Swipe support for mobile
        let startX = 0;
        let endX = 0;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goTo((current + 1) % total);
                else goTo((current - 1 + total) % total);
            }
        }, { passive: true });
    }

    /* ---------- Scroll Reveal ---------- */
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));

    /* ---------- Smooth scroll for CTA links ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});