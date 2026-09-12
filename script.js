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
      '.route-tile, .voice, .about-band > div, .feature-split-copy, .section-intro, .faq-new details, .contact-new > div, .seo-cols > div, .home-lens .section-intro, .spot-card'
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

  /* —— Corridor drag (without breaking link clicks) —— */
  var track = document.querySelector('.corridor-track');
  if (track) {
    var isDown = false;
    var didDrag = false;
    var startX = 0;
    var scrollLeft = 0;
    var activePointer = null;

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDown = true;
      didDrag = false;
      activePointer = e.pointerId;
      startX = e.clientX;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('pointermove', function (e) {
      if (!isDown || e.pointerId !== activePointer) return;
      var dx = e.clientX - startX;
      if (!didDrag && Math.abs(dx) < 8) return;
      if (!didDrag) {
        didDrag = true;
        try { track.setPointerCapture(e.pointerId); } catch (err) {}
      }
      track.scrollLeft = scrollLeft - dx;
    });

    function endDrag(e) {
      if (activePointer != null && e.pointerId !== activePointer) return;
      isDown = false;
      activePointer = null;
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    track.addEventListener('click', function (e) {
      if (!didDrag) return;
      e.preventDefault();
      e.stopPropagation();
      didDrag = false;
    }, true);
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

  /* —— Interactive photo explorer + lightbox —— */
  function initLightbox() {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.id = 'siteLightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<div class="lightbox-inner">' +
      '<button type="button" class="lightbox-close" aria-label="Close">×</button>' +
      '<button type="button" class="lightbox-prev" aria-label="Previous">‹</button>' +
      '<button type="button" class="lightbox-next" aria-label="Next">›</button>' +
      '<img alt="" />' +
      '<p class="lightbox-caption"></p>' +
      '</div>';
    document.body.appendChild(box);

    var img = box.querySelector('img');
    var caption = box.querySelector('.lightbox-caption');
    var items = [];
    var index = 0;

    function show(i) {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      img.src = items[index].src;
      img.alt = items[index].alt || '';
      caption.textContent = items[index].caption || items[index].alt || '';
    }
    function open(list, start) {
      items = list;
      show(start || 0);
      box.classList.add('is-open');
      document.body.classList.add('lightbox-open');
    }
    function close() {
      box.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      img.removeAttribute('src');
    }

    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', function () { show(index - 1); });
    box.querySelector('.lightbox-next').addEventListener('click', function () { show(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    function collectFrom(root) {
      return Array.prototype.map.call(root.querySelectorAll('[data-full], img'), function (el) {
        if (el.matches('img') && el.closest('[data-full]')) return null;
        var src = el.getAttribute('data-full') || el.currentSrc || el.src;
        if (!src) return null;
        var cap = el.getAttribute('data-caption') ||
          (el.closest('figure') && el.closest('figure').querySelector('figcaption')
            ? el.closest('figure').querySelector('figcaption').textContent
            : '') || el.getAttribute('alt') || '';
        return { src: src, alt: el.getAttribute('alt') || '', caption: cap.trim() };
      }).filter(Boolean);
    }

    document.querySelectorAll('.page-gallery figure, .photo-stage, .spot-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var list = [];
        if (el.classList.contains('photo-stage')) {
          var explorer = el.closest('.photo-explorer');
          if (explorer) {
            list = Array.prototype.map.call(explorer.querySelectorAll('.photo-thumb'), function (t) {
              return {
                src: t.getAttribute('data-full') || t.querySelector('img').src,
                alt: t.getAttribute('data-title') || '',
                caption: t.getAttribute('data-caption') || t.getAttribute('data-title') || ''
              };
            });
          }
          var startSrc = el.getAttribute('data-full') || (el.querySelector('img') && el.querySelector('img').src);
          var start = Math.max(0, list.findIndex(function (x) { return x.src === startSrc; }));
          open(list.length ? list : [{ src: startSrc, alt: '', caption: el.getAttribute('data-caption') || '' }], start);
          return;
        }
        if (el.classList.contains('spot-card')) {
          if (el.tagName === 'A') return; /* let journey-pairing links navigate */
          list = Array.prototype.map.call((el.closest('.spot-grid') || document).querySelectorAll('.spot-card:not(a)'), function (c) {
            return {
              src: c.getAttribute('data-full'),
              alt: c.getAttribute('data-title') || '',
              caption: c.getAttribute('data-caption') || c.getAttribute('data-title') || ''
            };
          });
          var startSrc2 = el.getAttribute('data-full');
          var start2 = Math.max(0, list.findIndex(function (x) { return x.src === startSrc2; }));
          open(list, start2);
          return;
        }
        var scope = el.closest('.page-gallery') || document;
        list = collectFrom(scope);
        var targetImg = el.querySelector('img') || el;
        var startSrc3 = targetImg.currentSrc || targetImg.src;
        var start3 = Math.max(0, list.findIndex(function (x) { return x.src === startSrc3; }));
        open(list, start3);
      });
    });

    document.querySelectorAll('.photo-explorer').forEach(function (explorer) {
      var stage = explorer.querySelector('.photo-stage');
      var stageImg = stage && stage.querySelector('img');
      var stageTag = stage && stage.querySelector('.tag');
      var stageTitle = stage && stage.querySelector('h3');
      var stageText = stage && stage.querySelector('p');
      var thumbs = explorer.querySelectorAll('.photo-thumb');

      function activate(thumb) {
        if (!stageImg || !thumb) return;
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        var next = thumb.getAttribute('data-full') || thumb.querySelector('img').src;
        stageImg.style.opacity = '0.35';
        setTimeout(function () {
          stageImg.src = next;
          stageImg.alt = thumb.getAttribute('data-title') || '';
          stage.setAttribute('data-full', next);
          stage.setAttribute('data-caption', thumb.getAttribute('data-caption') || '');
          if (stageTag) stageTag.textContent = thumb.getAttribute('data-tag') || 'Photograph';
          if (stageTitle) stageTitle.textContent = thumb.getAttribute('data-title') || '';
          if (stageText) stageText.textContent = thumb.getAttribute('data-caption') || '';
          stageImg.style.opacity = '1';
        }, 180);
      }

      thumbs.forEach(function (thumb, i) {
        if (i === 0) thumb.classList.add('is-active');
        thumb.addEventListener('mouseenter', function () {
          if (window.matchMedia('(pointer: fine)').matches) activate(thumb);
        });
        thumb.addEventListener('focus', function () { activate(thumb); });
        thumb.addEventListener('click', function (e) {
          e.stopPropagation();
          activate(thumb);
        });
      });

      var filtersRoot = explorer.previousElementSibling;
      var filters = (filtersRoot && filtersRoot.classList.contains('photo-filters'))
        ? filtersRoot.querySelectorAll('button')
        : explorer.querySelectorAll('.photo-filters button');
      filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filters.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          var filter = btn.getAttribute('data-filter');
          var firstVisible = null;
          thumbs.forEach(function (thumb) {
            var tags = (thumb.getAttribute('data-filter') || 'all').split(/\s+/);
            var show = filter === 'all' || tags.indexOf(filter) !== -1;
            thumb.style.display = show ? '' : 'none';
            if (show && !firstVisible) firstVisible = thumb;
          });
          if (firstVisible) activate(firstVisible);
        });
      });
    });
  }
  initLightbox();
})();
