/* =============================================================
   NOVA LLC — script.js
   Handles: sticky nav state, mobile menu, smooth scrolling,
   scroll-reveal animations, and contact form validation.
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     STICKY NAV — add a solid background once the user scrolls
     past the hero so links stay readable on light content.
  --------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------------------------------------------------
     MOBILE MENU TOGGLE
  --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu whenever a nav link is tapped
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------------------------------------------------
     SMOOTH SCROLL
     Native CSS `scroll-behavior: smooth` handles most of this,
     but we intercept clicks so we can also account for the
     fixed nav bar height when landing on a section.
  --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - (navHeight - 20);

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  /* ---------------------------------------------------------
     SCROLL-REVEAL ANIMATIONS
     Service cards fade/lift into view once they enter the
     viewport, using IntersectionObserver (no scroll-jank).
  --------------------------------------------------------- */
  const revealTargets = document.querySelectorAll('.service-card, .why__item, .package-card');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      revealObserver.observe(el);
    });
  } else {
    // Fallback: just show everything if IO isn't supported
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     HERO VIDEO FALLBACK
     If ./Bg.mp4 hasn't been added to the project yet (or fails
     to load), hide the <video> so the designed gradient
     fallback behind it shows instead of a broken player.
  --------------------------------------------------------- */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => {
      heroVideo.style.display = 'none';
    }, true);
    // If no source loads at all after a moment, hide it too.
    if (heroVideo.readyState === 0) {
      setTimeout(() => {
        if (heroVideo.readyState === 0) heroVideo.style.display = 'none';
      }, 1500);
    }
  }

  /* ---------------------------------------------------------
     CONTACT FORM — validation + submission handling
     No backend is wired up yet. This is written so it's easy
     to connect to a real service later:

     OPTION A — Formspree:
       <form action="https://formspree.io/f/YOUR_ID" method="POST">
       Then remove/adjust the preventDefault() below.

     OPTION B — EmailJS:
       Call emailjs.sendForm('SERVICE_ID','TEMPLATE_ID', form)
       inside the try block below, after validation passes.

     OPTION C — Netlify Forms:
       Add `data-netlify="true"` and a hidden `form-name` input
       to the <form> in index.html, and let it submit normally
       (remove preventDefault()).
  --------------------------------------------------------- */
  const form = document.getElementById('quoteForm');
  const successMessage = document.getElementById('formSuccess');

  const validators = {
    name: (value) => value.trim().length > 1,
    subject: (value) => value.trim().length > 1,
    phone: (value) => /^[\d\s()+.-]{7,}$/.test(value.trim()),
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  };

  const setFieldError = (field, hasError) => {
    const wrapper = field.closest('.form__field');
    wrapper.classList.toggle('has-error', hasError);
  };

  // Validate a field on blur for immediate, friendly feedback
  Object.keys(validators).forEach(fieldName => {
    const field = form.elements[fieldName];
    if (!field) return;
    field.addEventListener('blur', () => {
      if (field.value.trim() === '' && !field.required) return;
      setFieldError(field, !validators[fieldName](field.value));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Remove this line once a real backend endpoint is connected

    let isValid = true;
    Object.keys(validators).forEach(fieldName => {
      const field = form.elements[fieldName];
      if (!field) return;
      const valid = validators[fieldName](field.value);
      setFieldError(field, !valid);
      if (!valid) isValid = false;
    });

    if (!isValid) {
      const firstError = form.querySelector('.has-error input');
      if (firstError) firstError.focus();
      successMessage.classList.remove('is-visible');
      return;
    }

    // ---- Placeholder for real submission logic ----
    // e.g. await fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: new FormData(form), headers:{Accept:'application/json'} });

    successMessage.classList.add('is-visible');
    form.reset();

    // Move focus to the success message for screen-reader users
    successMessage.setAttribute('tabindex', '-1');
    successMessage.focus();
  });

});
