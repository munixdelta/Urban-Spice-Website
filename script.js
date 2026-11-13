/* ============================================================
   URBAN SPICE EVENTS & CATERING — MAIN JAVASCRIPT
   Audit-corrected version
   ============================================================ */

'use strict';

/* ── Navbar: scroll behaviour ─────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load to handle page-refresh mid-scroll
})();

/* ── Hamburger / Mobile Menu ──────────────────────────────── */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  if (!hamburger || !navMobile) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    navMobile.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMobile.contains(e.target)) {
      closeMobile();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobile();
  });
})();

/* Global: close mobile menu — called inline from mobile nav links */
function closeMobile() {
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  if (!navMobile) return;
  navMobile.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  navMobile.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ── Active nav link highlight on scroll ─────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((s) => observer.observe(s));
})();

/* ── Active nav link styles (injected once) ─────────────── */
(function injectNavActiveStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-links a.active { color: var(--gold) !important; }
    .nav-links a.active::after { width: 60% !important; }
  `;
  document.head.appendChild(style);
})();

/* ── Scroll reveal ────────────────────────────────────────── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger delay based on --i custom property if set
          const delay = getComputedStyle(entry.target).getPropertyValue('--i');
          if (delay) {
            entry.target.style.transitionDelay = `${parseInt(delay, 10) * 75}ms`;
          }
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
})();

/* ── Gallery Filter ──────────────────────────────────────── */
(function initGalleryFilter() {
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.removeAttribute('aria-pressed');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;

      // Show/hide items with smooth fade
      galleryItems.forEach((item) => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.classList.remove('hidden');
          // Trigger re-reveal if not yet visible
          if (!item.classList.contains('visible')) {
            requestAnimationFrame(() => item.classList.add('visible'));
          }
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();

/* ── Lightbox ─────────────────────────────────────────────── */
(function initLightbox() {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn    = document.getElementById('lightbox-close');
  if (!lightbox) return;

  // Open on gallery item click
  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      lightbox.focus();
      document.body.style.overflow = 'hidden';
    });

    // Keyboard: Enter or Space opens lightbox
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
    lightboxImg.alt = '';
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
})();

/* ── Enquiry Form — Validation & Submission ───────────────── */
(function initEnquiryForm() {
  const form       = document.getElementById('enquiry-form');
  const success    = document.getElementById('form-success');
  const submitBtn  = document.getElementById('enquiry-submit-btn');
  const resetBtn   = document.getElementById('form-reset-btn');
  if (!form) return;

  // Checkbox checked-state class fallback for browsers without :has() support
  // CSS :has(:checked) handles modern browsers; .is-checked handles older ones.
  form.querySelectorAll('.checkbox-label input[type="checkbox"]').forEach(function(cb) {
    function syncCheckedClass() {
      cb.closest('.checkbox-label').classList.toggle('is-checked', cb.checked);
    }
    cb.addEventListener('change', syncCheckedClass);
    syncCheckedClass(); // Sync on load (e.g. after browser autofill)
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Validation rules for required + optional fields
  const rules = {
    'f-name': {
      required: true,
      validate: (v) => v.trim().length >= 2,
      errId: 'f-name-err',
    },
    'f-phone': {
      required: true,
      // Validates Indian mobile numbers (10 digits starting with 6-9, optional +91 or 0 prefix, spaces/dashes allowed)
      validate: (v) => {
        const cleaned = v.replace(/[\s\-]/g, '');
        return /^(?:(?:\+?91)|0)?[6-9]\d{9}$/.test(cleaned);
      },
      errId: 'f-phone-err',
    },
    'f-email': {
      required: false,
      validate: (v) => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      errId: 'f-email-err',
    },
    'f-event-type': {
      required: true,
      validate: (v) => v !== '' && v !== null,
      errId: 'f-event-type-err',
    },
    'f-date': {
      required: true,
      validate: (v) => v !== '' && v >= todayStr,
      errId: 'f-date-err',
    },
    'f-guests': {
      required: true,
      validate: (v) => v !== '' && v !== null,
      errId: 'f-guests-err',
    },
    'f-location': {
      required: true,
      validate: (v) => v.trim().length >= 3,
      errId: 'f-location-err',
    },
  };

  function setFieldError(fieldId, invalid) {
    const field = document.getElementById(fieldId);
    const rule  = rules[fieldId];
    if (!field || !rule) return;
    const errEl = document.getElementById(rule.errId);
    field.classList.toggle('error', invalid);
    if (errEl) errEl.classList.toggle('show', invalid);
    field.setAttribute('aria-invalid', String(invalid));
  }

  function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return true;
    const rule = rules[fieldId];
    if (!rule) return true;
    const value   = field.value;
    const isValid = rule.validate(value);
    setFieldError(fieldId, !isValid);
    return isValid;
  }

  // Live validation (on blur + on input when already errored)
  Object.keys(rules).forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;
    field.addEventListener('blur', () => validateField(id));
    field.addEventListener('change', () => validateField(id));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(id);
    });
  });

  // Set minimum date for event date picker to today
  const dateField = document.getElementById('f-date');
  if (dateField) {
    dateField.min = todayStr;
  }

  const errBanner = document.getElementById('form-error-banner');

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Hide any previous submission error banner
    if (errBanner) errBanner.style.display = 'none';

    let isFormValid = true;
    Object.keys(rules).forEach((id) => {
      if (!validateField(id)) isFormValid = false;
    });

    if (!isFormValid) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const selectedCuisines = formData.getAll('cuisines');

    // 1. Generate pre-filled WhatsApp message
    const waLines = [
      `Hello Urban Spice Events & Catering,`,
      ``,
      `I would like to enquire about catering.`,
      ``,
      `Name: ${data.name.trim()}`,
      `Phone: ${data.phone.trim()}`,
      `Email: ${data.email && data.email.trim() ? data.email.trim() : 'N/A'}`,
      `Event: ${data.eventType}`,
      `Date: ${data.eventDate}`,
      `Venue: ${data.location.trim()}`,
      `Guests: ${data.guests}`,
      `Food Preference: ${data.foodPreference || 'N/A'}`,
      `Cuisines: ${selectedCuisines.length ? selectedCuisines.join(', ') : 'N/A'}`,
      `Requirements: ${data.message && data.message.trim() ? data.message.trim() : 'N/A'}`,
    ];

    const waText = waLines.join('\n');
    const waBtn = document.getElementById('success-whatsapp-btn');
    if (waBtn) {
      waBtn.href = `https://wa.me/917899779050?text=${encodeURIComponent(waText)}`;
    }

    // 2. Prepare EmailJS template parameters matching exact template variables
    const templateParams = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email && data.email.trim() ? data.email.trim() : 'N/A',
      event_type: data.eventType,
      event_date: data.eventDate,
      location: data.location.trim(),
      guests: data.guests,
      food_preference: data.foodPreference || 'N/A',
      cuisines: selectedCuisines.length ? selectedCuisines.join(', ') : 'N/A',
      message: data.message && data.message.trim() ? data.message.trim() : 'N/A',
    };

    // Prevent duplicate submissions: disable button & show loading text
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    // Send via official EmailJS browser SDK (pre-initialized in <head>)
    // Using 3-argument send() since SDK is already initialized with publicKey via emailjs.init()
    const serviceID  = 'service_yts2bwk';
    const templateID = 'template_o1jft7b';

    console.log('[EmailJS] Attempting send — Service:', serviceID, '| Template:', templateID);
    console.log('[EmailJS] Template params:', {
      name: templateParams.name,
      event_type: templateParams.event_type,
      event_date: templateParams.event_date,
      guests: templateParams.guests,
      cuisines: templateParams.cuisines,
    });

    let sendPromise;
    if (window.emailjs && typeof window.emailjs.send === 'function') {
      // 3-argument form — SDK is pre-initialized via emailjs.init({publicKey}) in <head>
      sendPromise = window.emailjs.send(serviceID, templateID, templateParams);
    } else {
      console.error('[EmailJS] SDK not available on window.emailjs — check CDN load.');
      sendPromise = Promise.reject(new Error('EmailJS SDK not available'));
    }

    sendPromise
      .then(function(response) {
        console.log('[EmailJS] SUCCESS — Status:', response.status, '| Text:', response.text);
        // ONLY ON SUCCESSFUL EMAILJS RESPONSE: show success state
        form.style.display = 'none';
        success.classList.add('show');
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
      })
      .catch(function(error) {
        // ON EMAILJS FAILURE: keep form visible, preserve entered data, restore button
        console.error('[EmailJS] FAILED —', error);
        if (errBanner) errBanner.style.display = 'block';
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
      });
  });

  // "Submit another enquiry" resets form and shows it again
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      Object.keys(rules).forEach((id) => setFieldError(id, false));
      if (errBanner) errBanner.style.display = 'none';
      form.style.display = '';
      success.classList.remove('show');
    });
  }
})();

/* ── Smooth scroll for anchor links (fallback) ────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#0') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── Lazy load polyfill (older browsers) ─────────────────── */
(function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; // Native support

  const imgs = document.querySelectorAll('img[loading="lazy"]');
  if (!imgs.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        img.removeAttribute('loading');
        observer.unobserve(img);
      }
    });
  });

  imgs.forEach((img) => observer.observe(img));
})();

/* ── Hero parallax (desktop only, gentle) ────────────────── */
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `scale(1.08) translateY(${scrollY * 0.2}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ── Click-to-call micro-feedback ───────────────────────── */
(function initCallFeedback() {
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener('click', () => {
      link.style.opacity = '0.5';
      setTimeout(() => { link.style.opacity = ''; }, 300);
    });
  });
})();
