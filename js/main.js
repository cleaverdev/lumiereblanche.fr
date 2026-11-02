/* ============================================================
   LUMIÈRE BLANCHE — main.js
   ============================================================ */



  (function () {
  'use strict';

  // ── Cookie Banner ──
  const cookieBanner  = document.getElementById('cookieBanner');
  const cookieAccept  = document.getElementById('cookieAccept');
  const cookieDecline = document.getElementById('cookieDecline');

  if (cookieBanner && cookieAccept && cookieDecline) {
    const cookieChoice = localStorage.getItem('lb_cookie_choice');

    if (!cookieChoice) {
      setTimeout(() => {
        cookieBanner.classList.remove('hidden');
      }, 1000);
    }

    cookieAccept.addEventListener('click', () => {
      localStorage.setItem('lb_cookie_choice', 'accepted');
      cookieBanner.classList.add('hidden');
    });

    cookieDecline.addEventListener('click', () => {
      localStorage.setItem('lb_cookie_choice', 'declined');
      cookieBanner.classList.add('hidden');
    });
  }

  // ... reste de ton code

  /* ── Loader ── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
    }, 1800);
  });

  /* ── Cursor ── */
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Smooth trail
  function animateTrail() {
    trailX += (mouseX - trailX) * 0.08;
    trailY += (mouseY - trailY) * 0.08;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Hover effect
  const hoverTargets = document.querySelectorAll('a, button, .tarot-card, .service-card, .testimonial-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  /* ── Star Canvas ── */
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let shootingStars = [];
  let W, H;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    const count = Math.floor((W * H) / 3000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.2,
        opacity: Math.random() * 0.8 + 0.1,
        speed: Math.random() * 0.3 + 0.05,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.1 ? 'gold' : Math.random() < 0.05 ? 'violet' : 'white'
      });
    }
  }

  function spawnShootingStar() {
    if (Math.random() > 0.995) {
      shootingStars.push({
        x: Math.random() * W * 0.7,
        y: Math.random() * H * 0.4,
        len: Math.random() * 150 + 80,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        opacity: 1,
        trail: []
      });
    }
  }

  let frame = 0;
  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const twinkle = 0.4 + 0.6 * Math.sin(s.twinklePhase);
      const alpha = s.opacity * twinkle;
      
      let color;
      if (s.hue === 'gold') color = `rgba(212, 175, 55, ${alpha})`;
      else if (s.hue === 'violet') color = `rgba(167, 139, 250, ${alpha})`;
      else color = `rgba(232, 224, 208, ${alpha})`;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Slow drift
      s.y -= s.speed * 0.05;
      if (s.y < -2) s.y = H + 2;
    });

    // Shooting stars
    spawnShootingStar();
    shootingStars = shootingStars.filter(ss => ss.opacity > 0);
    shootingStars.forEach(ss => {
      ss.trail.push({ x: ss.x, y: ss.y, opacity: ss.opacity });
      if (ss.trail.length > 20) ss.trail.shift();

      ss.trail.forEach((pt, i) => {
        const ratio = i / ss.trail.length;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        const nextPt = ss.trail[i + 1];
        if (nextPt) {
          ctx.lineTo(nextPt.x, nextPt.y);
          ctx.strokeStyle = `rgba(212, 175, 55, ${ratio * ss.opacity * 0.6})`;
          ctx.lineWidth = ratio * 2;
          ctx.stroke();
        }
      });

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= 0.02;
    });

    requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  createStars();
  drawStars();
  window.addEventListener('resize', () => { resizeCanvas(); createStars(); });

  /* ── Navigation ── */
  const nav = document.getElementById('nav');
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    // Active link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });

  navBurger.addEventListener('click', () => {
    navBurger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navBurger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Scroll Reveal ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ── Counter Animation ── */
  function animateCount(el, target, duration = 2000) {
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'));
        animateCount(entry.target, target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  // Tirage IA géré par js/tirage-ai.js

  /* ── Testimonials Slider ── */
  /* Optionnel : le bloc témoignages peut être remplacé par un widget externe */
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('testimonialsDots');
  if (track && dotsContainer) {
  const cards = track.querySelectorAll('.testimonial-card');
  let currentSlide = 0;
  let cardWidth = 0;
  let visibleCount = 1;
  let autoSlideTimer;

  function getCardWidth() {
    if (!cards.length) return 340;
    return cards[0].offsetWidth + 24; // gap
  }

  function getVisibleCount() {
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 700) return 2;
    return 1;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const max = cards.length - visibleCount + 1;
    for (let i = 0; i < Math.max(max, 1); i++) {
      const d = document.createElement('button');
      d.className = 'tnav-btn t-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(d);
    }
  }

  function goTo(i) {
    const max = cards.length - visibleCount;
    currentSlide = Math.max(0, Math.min(i, max));
    cardWidth = getCardWidth();
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    dotsContainer.querySelectorAll('.t-dot').forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
  }

  function next() { goTo(currentSlide + 1); }
  function prev() { goTo(currentSlide - 1 < 0 ? cards.length - visibleCount : currentSlide - 1); }

  const tnavNext = document.getElementById('tnavNext');
  const tnavPrev = document.getElementById('tnavPrev');
  if (tnavNext) tnavNext.addEventListener('click', () => { next(); resetAutoSlide(); });
  if (tnavPrev) tnavPrev.addEventListener('click', () => { prev(); resetAutoSlide(); });

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      const max = cards.length - visibleCount;
      goTo(currentSlide >= max ? 0 : currentSlide + 1);
    }, 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  function initSlider() {
    visibleCount = getVisibleCount();
    buildDots();
    goTo(0);
  }

  initSlider();
  startAutoSlide();
  window.addEventListener('resize', initSlider);
  }

  /* ── Contact Form ── */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<span>Message envoyé ✦</span>';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      btn.style.opacity = '';
      e.target.reset();
    }, 3000);
  });

  /* ── Parallax on scroll ── */
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;

    const sacredGeo = document.querySelector('.hero-3d-container');
    if (sacredGeo) sacredGeo.style.transform = `translateY(${scrollY * 0.15}px)`;
  });

  /* ── Mouse parallax on hero ── */
  document.addEventListener('mousemove', (e) => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (e.clientY > rect.bottom) return;

    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;

    const orb1 = document.querySelector('.hero-orb--1');
    const orb2 = document.querySelector('.hero-orb--2');
    const sacredGeo = document.querySelector('.sacred-geo');

    if (orb1) orb1.style.transform = `translate(${cx * -20}px, ${cy * -15}px) scale(1)`;
    if (orb2) orb2.style.transform = `translate(${cx * 15}px, ${cy * 20}px) scale(1)`;
    if (sacredGeo) {
      sacredGeo.style.transform = `rotateY(${cx * 15}deg) rotateX(${-cy * 10 + 10}deg)`;
    }
  });

  /* ── Service cards tilt effect ── */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${-cy * 6}deg) rotateY(${cx * 6}deg)`;
      card.style.transformStyle = 'preserve-3d';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Floating particles on click ── */
  document.addEventListener('click', (e) => {
    for (let i = 0; i < 6; i++) {
      createSparkle(e.clientX, e.clientY, i);
    }
  });

  function createSparkle(x, y, i) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--gold);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(sparkle);
    const angle = (i / 6) * Math.PI * 2;
    const distance = 40 + Math.random() * 40;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    sparkle.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
    ], { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(0,0,0.3,1)' }).onfinish = () => sparkle.remove();
  }

  console.log('✦ Lumière Blanche — Que la lumière vous guide ✦');

})();
