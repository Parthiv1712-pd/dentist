/**
 * Jijima Dental Clinic — Main JavaScript
 */

(function () {
  'use strict';

  // ── Header scroll effect ──
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── Mobile navigation ──
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function setNavOpen(open) {
    navMenu.classList.toggle('open', open);
    navToggle.classList.toggle('active', open);
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-controls', 'navMenu');

  navToggle.addEventListener('click', () => {
    setNavOpen(!navMenu.classList.contains('open'));
  });

  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.classList.contains('open')) return;
    if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
    setNavOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      setNavOpen(false);
    }
  });

  function updateMobileLayout() {
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('has-mobile-bar', isMobile);
    if (!isMobile && navMenu.classList.contains('open')) {
      setNavOpen(false);
    }
  }

  updateMobileLayout();
  window.addEventListener('resize', updateMobileLayout, { passive: true });

  // ── Hide floating WhatsApp on mobile while hero is visible ──
  const heroSection = document.getElementById('home');
  if (heroSection) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      if (window.innerWidth <= 768) {
        document.body.classList.toggle('hero-in-view', entry.isIntersecting);
      } else {
        document.body.classList.remove('hero-in-view');
      }
    }, { threshold: 0.15 });

    heroObserver.observe(heroSection);
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) document.body.classList.remove('hero-in-view');
    }, { passive: true });
  }

  // ── Before / After tab switching ──
  const baTabs = document.querySelectorAll('.ba-tab');
  const baSliders = document.querySelectorAll('.ba-slider');

  baTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const caseId = tab.dataset.case;
      baTabs.forEach(t => t.classList.remove('active'));
      baSliders.forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`case-${caseId}`).classList.add('active');
      const container = document.querySelector(`#case-${caseId} .ba-slider__container`);
      if (container && container._refreshBaSlider) {
        requestAnimationFrame(() => container._refreshBaSlider());
      }
    });
  });

  // ── Before / After shutter slider ──
  function initBaSlider(container) {
    const afterWrap = container.querySelector('.ba-slider__after-wrap');
    const afterImg = container.querySelector('.ba-slider__after');
    const handle = container.querySelector('.ba-slider__handle');
    let pos = 50;
    let dragging = false;

    function setPosition(percent) {
      pos = Math.max(0, Math.min(100, percent));
      afterWrap.style.width = pos + '%';
      handle.style.left = pos + '%';
      afterImg.style.width = container.offsetWidth + 'px';
      handle.setAttribute('aria-valuenow', Math.round(pos));
    }

    function getPercent(clientX) {
      const rect = container.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onMove(clientX) {
      if (!dragging) return;
      setPosition(getPercent(clientX));
    }

    container.addEventListener('mousedown', (e) => {
      dragging = true;
      setPosition(getPercent(e.clientX));
    });

    container.addEventListener('touchstart', (e) => {
      dragging = true;
      setPosition(getPercent(e.touches[0].clientX));
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      onMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('touchend', () => { dragging = false; });
    window.addEventListener('touchcancel', () => { dragging = false; });

    handle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') setPosition(pos - 5);
      if (e.key === 'ArrowRight') setPosition(pos + 5);
    });

    window.addEventListener('resize', () => setPosition(pos));
    container._refreshBaSlider = () => setPosition(pos);
    setPosition(50);
  }

  document.querySelectorAll('.ba-slider__container').forEach(initBaSlider);

  // ── Appointment form ──
  const appointmentForm = document.getElementById('appointmentForm');

  appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const treatment = document.getElementById('treatment');
    const time = document.getElementById('time');

    const treatmentLabel = treatment.options[treatment.selectedIndex].text;
    const timeLabel = time.options[time.selectedIndex].text;

    const message = encodeURIComponent(
      `Hello! I'd like to book an appointment.\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Treatment: ${treatmentLabel}\n` +
      `Preferred Time: ${timeLabel}`
    );

    window.open(`https://wa.me/919104853880?text=${message}`, '_blank');
    appointmentForm.reset();
  });

  // ── Smooth reveal on scroll ──
  const revealElements = document.querySelectorAll(
    '.treatment-card, .achievement-card, .review-card, .gallery-item, .tech-card, .affiliation-logo, .ba-slider-wrap'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${i % 4 * 0.08}s, transform 0.6s ease ${i % 4 * 0.08}s`;
    revealObserver.observe(el);
  });

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

})();
