/* Altiora Northern — Interactivity + i18n */

(function () {
  'use strict';

  const CONTACT_EMAIL = 'partner@altioranorthern.com';
  const WHATSAPP = 'https://wa.me/923180148480';

  let lang = localStorage.getItem('altiora-lang') || 'en';
  let activeDestKey = null;

  const destModal = document.getElementById('destModal');
  const destModalRegion = document.getElementById('destModalRegion');
  const destModalTitle = document.getElementById('destModalTitle');
  const destModalBody = document.getElementById('destModalBody');
  const destModalHighlights = document.getElementById('destModalHighlights');
  const destModalSeason = document.getElementById('destModalSeason');
  const destInquireBtn = document.getElementById('destInquireBtn');

  const getDict = () => (window.ALTIORA_I18N && window.ALTIORA_I18N[lang]) || (window.ALTIORA_I18N && window.ALTIORA_I18N.en) || {};
  const getDestPack = () => (window.ALTIORA_DEST && window.ALTIORA_DEST[lang]) || (window.ALTIORA_DEST && window.ALTIORA_DEST.en) || {};

  const fillDestModal = (key) => {
    const data = getDestPack()[key];
    if (!data || !destModal) return;
    activeDestKey = key;
    destModalRegion.textContent = data.region;
    destModalTitle.textContent = data.title;
    destModalBody.textContent = data.body;
    destModalSeason.textContent = data.season;
    destModalHighlights.innerHTML = (data.highlights || []).map((item) => `<li>${item}</li>`).join('');
  };

  const openDestModal = (key) => {
    fillDestModal(key);
    if (!destModal) return;
    destModal.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const closeDestModal = () => {
    if (!destModal) return;
    destModal.hidden = true;
    document.body.style.overflow = '';
  };

  const applyLang = (next) => {
    lang = next === 'zh' ? 'zh' : 'en';
    localStorage.setItem('altiora-lang', lang);

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.body.classList.toggle('lang-zh', lang === 'zh');

    const dict = getDict();

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = dict[key];
      if (val == null) return;

      const attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, val);
        if (attr !== 'aria-label' && el.childNodes.length === 0 && !el.querySelector('svg')) {
          el.textContent = val;
        }
        return;
      }

      if (el.hasAttribute('data-i18n-html') || el.getAttribute('data-i18n-html') === 'true') {
        el.innerHTML = val;
        return;
      }

      if (el.tagName === 'META') {
        el.setAttribute('content', val);
        return;
      }

      if (el.tagName === 'TITLE') {
        el.textContent = val;
        document.title = val;
        return;
      }

      el.textContent = val;
    });

    if (dict['meta.title']) document.title = dict['meta.title'];

    document.querySelectorAll('#langSwitch [data-lang]').forEach((btn) => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (activeDestKey && destModal && !destModal.hidden) {
      fillDestModal(activeDestKey);
    }
  };

  // Language switch
  document.querySelectorAll('#langSwitch [data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang')));
  });
  const langSolo = document.getElementById('langSwitch');
  if (langSolo && langSolo.tagName === 'BUTTON') {
    langSolo.addEventListener('click', () => applyLang(lang === 'en' ? 'zh' : 'en'));
  }
  applyLang(lang);

  // Header scroll
  const header = document.getElementById('header');
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });

  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle?.classList.remove('open');
      navLinks?.classList.remove('open');
    });
  });

  const scrollToId = (id) => {
    const target = document.querySelector(id);
    if (!target) return;
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      scrollToId(href);
    });
  });

  // Scroll reveal
  const revealElements = document.querySelectorAll(
    '.service-card, .dest-card, .why-card, .testimonial, .faq-item, .about-text, .about-images, .section-header, .contact-info, .contact-form'
  );
  revealElements.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealElements.forEach((el) => observer.observe(el));

  document.querySelectorAll('.service-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });
  document.querySelectorAll('.why-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });

  // Destination modal
  document.querySelectorAll('.dest-card[data-dest]').forEach((card) => {
    card.addEventListener('click', () => openDestModal(card.dataset.dest));
  });

  destModal?.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeDestModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && destModal && !destModal.hidden) closeDestModal();
  });

  destInquireBtn?.addEventListener('click', () => {
    const data = getDestPack()[activeDestKey];
    closeDestModal();
    const service = document.getElementById('service');
    const message = document.getElementById('message');
    if (service && activeDestKey) service.value = activeDestKey;
    if (message && data) {
      message.value = lang === 'zh'
        ? `我对以${data.title}为主的行程感兴趣。请提供方案、建议行程与参考报价。`
        : `I am interested in a trip or program focused on ${data.title}. Please share options, suggested itineraries, and indicative pricing.`;
      message.focus();
    }
    scrollToId('#contact');
  });

  // Contact form → mailto partner@
  const contactForm = document.getElementById('contactForm');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    const dict = getDict();

    const subject = encodeURIComponent(
      `Altiora Northern Inquiry — ${data.inquiry_type || 'General'} (${data.name || 'Guest'})`
    );
    const body = encodeURIComponent(
      [
        `Name: ${data.name || ''}`,
        `Email: ${data.email || ''}`,
        `Company: ${data.company || 'N/A'}`,
        `Country: ${data.country || 'N/A'}`,
        `Contacting as: ${data.inquiry_type || 'N/A'}`,
        `Service interest: ${data.service || 'N/A'}`,
        `Preferred language: ${lang === 'zh' ? 'Chinese' : 'English'}`,
        '',
        'Message:',
        data.message || ''
      ].join('\n')
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    const successTitle = dict['contact.success.t'] || 'Thank You for Your Inquiry';
    const successBody = dict['contact.success.p'] ||
      `Your email app should open addressed to ${CONTACT_EMAIL}. You can also reach us on WhatsApp at +92 318 014 8480.`;

    contactForm.innerHTML = `<div class="form-success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <h3>${successTitle}</h3>
      <p>${successBody.replace(CONTACT_EMAIL, `<strong>${CONTACT_EMAIL}</strong>`).replace('+92 318 014 8480', `<a href="${WHATSAPP}" target="_blank" rel="noopener noreferrer">+92 318 014 8480</a>`)}</p>
    </div>`;
  });

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 120;
    let current = '';
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) current = section.getAttribute('id');
    });
    navItems.forEach((item) => {
      const href = item.getAttribute('href').replace('#', '');
      item.style.color = href === current ? 'var(--color-accent)' : '';
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  // Hero parallax
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      heroBg.style.transform = `scale(1.05) translateY(${window.scrollY * 0.35}px)`;
    }, { passive: true });
  }

  // Count-up stats
  const countUp = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value >= 1000 ? value.toLocaleString() + suffix : value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.stat-num[data-count]').forEach((el) => statsObserver.observe(el));
})();
