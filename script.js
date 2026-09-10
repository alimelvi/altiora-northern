/* Altiora Northern — sitewide interactions */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CONTACT_EMAIL = 'partner@altioranorthern.com';
  const GA_MEASUREMENT_ID = 'G-P9Q7S4G430';

  /* —— Analytics —— */
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-')) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
  }

  /* —— Compass cursor on EVERY page —— */
  function initCompassCursor() {
    if (reduceMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let cursor = document.getElementById('compassCursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'compassCursor';
      cursor.className = 'compass-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.innerHTML =
        '<svg viewBox="0 0 48 48" width="48" height="48">' +
        '<circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.55"/>' +
        '<circle cx="24" cy="24" r="3" fill="currentColor"/>' +
        '<path class="compass-needle" d="M24 8 L27 24 L24 40 L21 24 Z" fill="currentColor"/>' +
        '</svg>';
      document.body.appendChild(cursor);
    }

    document.documentElement.classList.add('has-compass-cursor');
    const needle = cursor.querySelector('.compass-needle');
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let angle = 0;

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.add('is-on');
    }, { passive: true });

    document.addEventListener('pointerover', function (e) {
      const hot = e.target.closest && e.target.closest('a, button, summary, input, select, textarea, .corridor-card, .route-tile');
      cursor.classList.toggle('is-hot', !!hot);
    }, true);

    function tick() {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      var target = Math.atan2(my - cy, mx - cx) * (180 / Math.PI) + 90;
      var diff = target - angle;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      angle += diff * 0.14;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)';
      if (needle) needle.setAttribute('transform', 'rotate(' + angle + ' 24 24)');
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  initCompassCursor();

  /* —— Header —— */
  var header = document.getElementById('siteHeader') || document.querySelector('.site-header') || document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-solid', window.scrollY > 24);
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav') || document.querySelector('.site-nav') || document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  /* —— i18n (home) —— */
  var lang = localStorage.getItem('altiora-lang') || 'en';
  function applyLang() {
    if (!window.ALTIORA_I18N) return;
    var dict = window.ALTIORA_I18N[lang] || window.ALTIORA_I18N.en || {};
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!dict[key]) return;
      if (el.getAttribute('data-i18n-html') === 'true') el.innerHTML = dict[key];
      else el.textContent = dict[key];
    });
    document.querySelectorAll('#langSwitch [data-lang]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
    });
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }
  document.querySelectorAll('#langSwitch [data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lang = btn.getAttribute('data-lang');
      localStorage.setItem('altiora-lang', lang);
      applyLang();
    });
  });
  applyLang();

  /* —— Reveal —— */
  if (!reduceMotion) {
    var els = document.querySelectorAll(
      '.corridor-card, .route-tile, .voice, .about-band > div, .feature-split-copy, .section-intro, .faq-new details, .contact-new > div, .seo-cols > div'
    );
    els.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 0.06 + 's';
      io.observe(el);
    });
  }

  /* —— Corridor drag hint —— */
  var track = document.querySelector('.corridor-track');
  if (track) {
    var isDown = false;
    var startX = 0;
    var scrollLeft = 0;
    track.addEventListener('pointerdown', function (e) {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointerup', function () { isDown = false; });
    track.addEventListener('pointerleave', function () { isDown = false; });
    track.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX);
    });
  }

  /* —— Contact form —— */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('#name') || {}).value || '';
      var email = (form.querySelector('#email') || {}).value || '';
      var message = (form.querySelector('#message') || {}).value || '';
      var type = (form.querySelector('#inquiry-type') || {}).value || '';
      var subject = encodeURIComponent('Pakistan tour enquiry — ' + (name || 'Website'));
      var body = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\nType: ' + type + '\n\n' + message
      );
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    });
  }
})();
