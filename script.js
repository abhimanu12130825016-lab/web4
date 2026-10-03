/* ============================================
   XPEC — STREETWEAR COLLECTION
   3D Scroll Animation Engine
   ============================================ */

// ==========================================
// 1. PRELOADER
// ==========================================
const preloader = {
    el: document.getElementById('preloader'),
    counter: document.querySelector('.preloader-counter'),
    line: document.querySelector('.preloader-line'),
    brand: document.querySelector('.preloader-brand'),
    count: 0,

    init() {
        const interval = setInterval(() => {
            this.count += Math.floor(Math.random() * 8) + 2;
            if (this.count >= 100) {
                this.count = 100;
                clearInterval(interval);
                this.complete();
            }
            this.counter.textContent = this.count;
            this.line.querySelector('::after') ||
                (this.line.style.setProperty('--progress', this.count + '%'));
            // Update line width via style
            const after = this.line;
            after.style.cssText = `
                width: 200px; height: 1px;
                background: rgba(255,255,255,0.1);
                margin: 0 auto 30px;
                position: relative; overflow: hidden;
            `;
        }, 50);

        // Also animate the line fill
        const lineInterval = setInterval(() => {
            const lineEl = document.querySelector('.preloader-line');
            if (lineEl) {
                const inner = lineEl.querySelector('span') || document.createElement('span');
                if (!inner.parentNode) {
                    inner.style.cssText = 'display:block;height:100%;background:#ff2d2d;transition:width 0.1s;';
                    lineEl.appendChild(inner);
                }
                inner.style.width = this.count + '%';
            }
            if (this.count >= 100) clearInterval(lineInterval);
        }, 50);
    },

    complete() {
        this.brand.classList.add('visible');
        setTimeout(() => {
            gsap.to(this.el, {
                yPercent: -100,
                duration: 1.2,
                ease: 'power4.inOut',
                onComplete: () => {
                    this.el.style.display = 'none';
                    animateHeroIn();
                }
            });
        }, 800);
    }
};

// ==========================================
// 2. LENIS SMOOTH SCROLL
// ==========================================
let lenis;
function initLenis() {
    lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

// ==========================================
// 3. THREE.JS PARTICLE BACKGROUND
// ==========================================
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;       // x
        positions[i + 1] = (Math.random() - 0.5) * 20;   // y
        positions[i + 2] = (Math.random() - 0.5) * 20;   // z
        velocities[i] = (Math.random() - 0.5) * 0.002;
        velocities[i + 1] = (Math.random() - 0.5) * 0.002;
        velocities[i + 2] = (Math.random() - 0.5) * 0.002;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xff2d2d,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    let mouseX = 0, mouseY = 0;
    let scrollProgress = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('scroll', () => {
        scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);

        const pos = geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i] += velocities[i];
            pos[i + 1] += velocities[i + 1];
            pos[i + 2] += velocities[i + 2];

            // Boundary wrap
            if (Math.abs(pos[i]) > 10) velocities[i] *= -1;
            if (Math.abs(pos[i + 1]) > 10) velocities[i + 1] *= -1;
            if (Math.abs(pos[i + 2]) > 10) velocities[i + 2] *= -1;
        }
        geometry.attributes.position.needsUpdate = true;

        // Rotate based on mouse
        particles.rotation.x += (mouseY * 0.1 - particles.rotation.x) * 0.02;
        particles.rotation.y += (mouseX * 0.1 - particles.rotation.y) * 0.02;

        // Color shift based on scroll
        const hue = scrollProgress * 0.3;
        material.color.setHSL(hue, 0.8, 0.5);
        material.opacity = 0.2 + Math.sin(scrollProgress * Math.PI * 2) * 0.15;

        camera.position.z = 5 - scrollProgress * 2;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ==========================================
// 4. CUSTOM CURSOR
// ==========================================
function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (!cursor || !follower) return;
    if (window.innerWidth < 768) return;

    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    function animateCursor() {
        followerX += (cursorX - followerX) * 0.1;
        followerY += (cursorY - followerY) * 0.1;

        cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
        follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const hoverTargets = document.querySelectorAll('a, button, .collection-item, .neon-piece, .lookbook-item, .void-item');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => follower.classList.add('hovering'));
        el.addEventListener('mouseleave', () => follower.classList.remove('hovering'));
    });
}

// ==========================================
// 5. HERO ANIMATIONS
// ==========================================
function animateHeroIn() {
    const letters = document.querySelectorAll('.hero-letter');
    const subtitle = document.querySelector('.hero-subtitle');
    const meta = document.querySelector('.hero-meta');

    letters.forEach((letter, i) => {
        setTimeout(() => letter.classList.add('visible'), 100 + i * 120);
    });

    setTimeout(() => subtitle?.classList.add('visible'), 600);
    setTimeout(() => meta?.classList.add('visible'), 900);
}

// Hero parallax on scroll
function initHeroParallax() {
    const heroBg = document.querySelector('.hero-bg-img');
    const heroContent = document.querySelector('.hero-content');

    if (heroBg) {
        gsap.to(heroBg, {
            y: '30%',
            scale: 1.3,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
            }
        });
    }

    if (heroContent) {
        gsap.to(heroContent, {
            y: '50%',
            opacity: 0,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '60% top',
                scrub: 1,
            }
        });
    }
}

// ==========================================
// 6. MANIFESTO ANIMATIONS
// ==========================================
function initManifesto() {
    const words = document.querySelectorAll('.manifesto-word');
    const desc = document.querySelector('.manifesto-desc-text');
    const line = document.querySelector('.manifesto-horizontal-line');

    ScrollTrigger.create({
        trigger: '#manifesto',
        start: 'top 70%',
        onEnter: () => {
            words.forEach((word, i) => {
                setTimeout(() => word.classList.add('visible'), i * 80);
            });
        }
    });

    ScrollTrigger.create({
        trigger: '.manifesto-description',
        start: 'top 80%',
        onEnter: () => desc?.classList.add('visible'),
    });

    ScrollTrigger.create({
        trigger: '.manifesto-horizontal-line',
        start: 'top 85%',
        onEnter: () => line?.classList.add('visible'),
    });

    // Parallax background text
    gsap.to('.manifesto-bg-text', {
        x: '-20%',
        scrollTrigger: {
            trigger: '#manifesto',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
        }
    });
}

// ==========================================
// 7. COLLECTION ANIMATIONS
// ==========================================
function initCollections() {
    document.querySelectorAll('.collection-section').forEach(section => {
        const title = section.querySelector('.collection-title');
        const tagline = section.querySelector('.collection-tagline');
        const number = section.querySelector('.collection-number');

        ScrollTrigger.create({
            trigger: section,
            start: 'top 65%',
            onEnter: () => {
                title?.classList.add('visible');
                setTimeout(() => tagline?.classList.add('visible'), 200);
            }
        });

        // Parallax number
        if (number) {
            gsap.to(number, {
                y: '-20%',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 2,
                }
            });
        }

        // Staggered item reveal
        const items = section.querySelectorAll('.collection-item, .neon-piece, .void-item, .lookbook-item');
        items.forEach((item, i) => {
            gsap.from(item, {
                y: 80,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                },
                delay: i * 0.1,
            });
        });
    });

    // Parallax items
    document.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax);
        gsap.to(el, {
            y: () => speed * 150,
            scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            }
        });
    });
}

// ==========================================
// 8. HORIZONTAL SCROLL
// ==========================================
function initHorizontalScroll() {
    const wrapper = document.querySelector('.horizontal-wrapper');
    if (!wrapper) return;

    const panels = wrapper.querySelectorAll('.horizontal-panel');

    gsap.to(wrapper, {
        x: () => -(wrapper.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
            trigger: '#horizontal-scroll',
            start: 'top top',
            end: () => '+=' + (wrapper.scrollWidth - window.innerWidth),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
        }
    });

    // Animate panels as they come into view
    panels.forEach((panel, i) => {
        if (panel.classList.contains('panel-image')) {
            gsap.from(panel.querySelector('img'), {
                scale: 1.3,
                scrollTrigger: {
                    trigger: panel,
                    containerAnimation: gsap.getById ? undefined : undefined,
                    start: 'left right',
                    end: 'left center',
                    scrub: 1,
                    horizontal: true,
                }
            });
        }
    });
}

// ==========================================
// 9. REVEAL SECTION
// ==========================================
function initReveal() {
    const revealTexts = document.querySelectorAll('.reveal-text');
    const revealImgs = document.querySelectorAll('.reveal-img');

    ScrollTrigger.create({
        trigger: '#reveal',
        start: 'top 60%',
        onEnter: () => {
            revealTexts.forEach((text, i) => {
                setTimeout(() => text.classList.add('visible'), i * 200);
            });
        }
    });

    // Parallax images
    revealImgs.forEach(img => {
        gsap.to(img, {
            scale: 1,
            scrollTrigger: {
                trigger: img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            }
        });
    });
}

// ==========================================
// 10. NEON SHOWCASE ANIMATIONS
// ==========================================
function initNeonShowcase() {
    const showcase = document.querySelector('.collection-showcase');
    if (!showcase) return;

    gsap.from('.showcase-main', {
        x: -100,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: showcase,
            start: 'top 70%',
        }
    });

    gsap.from('.showcase-info', {
        x: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2,
        scrollTrigger: {
            trigger: showcase,
            start: 'top 70%',
        }
    });
}

// ==========================================
// 11. LOOKBOOK MASONRY ANIMATION
// ==========================================
function initLookbook() {
    const items = document.querySelectorAll('.lookbook-item');

    items.forEach((item, i) => {
        gsap.from(item, {
            y: 100,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: item,
                start: 'top 90%',
            },
            delay: i * 0.08,
        });
    });
}

// ==========================================
// 12. SCROLL PROGRESS BAR
// ==========================================
function initScrollProgress() {
    const scrollBar = document.getElementById('scroll-bar');
    if (!scrollBar) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        scrollBar.style.height = (scrolled * 100) + '%';
    });
}

// ==========================================
// 13. NAVIGATION
// ==========================================
function initNav() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const navbar = document.getElementById('navbar');

    menuBtn?.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu?.classList.toggle('active');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn?.classList.remove('active');
            mobileMenu?.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target && lenis) {
                lenis.scrollTo(target, { offset: 0, duration: 2 });
            }
        });
    });

    // Hide/show nav on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.opacity = '0';
            navbar.style.pointerEvents = 'none';
        } else {
            navbar.style.opacity = '1';
            navbar.style.pointerEvents = 'all';
        }
        lastScroll = currentScroll;
    });
}

// ==========================================
// 14. FOOTER ANIMATION
// ==========================================
function initFooter() {
    gsap.from('.footer-title', {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#footer',
            start: 'top 80%',
        }
    });

    gsap.from('.footer-col', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.footer-grid',
            start: 'top 85%',
        }
    });

    // Parallax footer text
    gsap.to('.footer-big-text', {
        x: '10%',
        scrollTrigger: {
            trigger: '#footer',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
        }
    });
}

// ==========================================
// 15. IMAGE TILT ON HOVER (3D EFFECT)
// ==========================================
function initImageTilt() {
    const tiltElements = document.querySelectorAll('.item-image-wrapper, .showcase-image-container, .neon-piece, .void-item-inner');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
            el.style.transition = 'transform 0.6s ease';
        });

        el.addEventListener('mouseenter', () => {
            el.style.transition = 'none';
        });
    });
}

// ==========================================
// 16. MAGNETIC BUTTONS
// ==========================================
function initMagneticElements() {
    const magneticEls = document.querySelectorAll('.nav-link, .mobile-link');

    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.4s var(--ease-out-expo)';
        });

        el.addEventListener('mouseenter', () => {
            el.style.transition = 'none';
        });
    });
}

// ==========================================
// INITIALIZE EVERYTHING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Start preloader
    preloader.init();

    // Init systems
    initLenis();
    initThreeJS();
    initCursor();
    initHeroParallax();
    initManifesto();
    initCollections();
    initHorizontalScroll();
    initReveal();
    initNeonShowcase();
    initLookbook();
    initScrollProgress();
    initNav();
    initFooter();
    initImageTilt();
    initMagneticElements();
});