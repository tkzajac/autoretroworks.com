/* ══════════════════════════════════════════════════════
   Kapustka Werk – Main JavaScript
   ══════════════════════════════════════════════════════ */

// ─── Language Toggle ─────────────────────────────────
const currentLang = { value: 'pl' };

function setLanguage(lang) {
  currentLang.value = lang;

  // Update all data-pl / data-en elements
  document.querySelectorAll('[data-pl]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) el.innerHTML = text;
  });

  // Update placeholders
  document.querySelectorAll('[data-placeholder-pl]').forEach(el => {
    const ph = el.getAttribute(`data-placeholder-${lang}`);
    if (ph) el.placeholder = ph;
  });

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update html lang attr
  document.documentElement.lang = lang;

  // Save preference
  localStorage.setItem('arw-lang', lang);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// Restore saved language
const savedLang = localStorage.getItem('arw-lang');
if (savedLang && savedLang !== 'pl') setLanguage(savedLang);


// ─── Sticky Header ───────────────────────────────────
const header = document.getElementById('header');
function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 60);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


// ─── Mobile Menu ─────────────────────────────────────
const burger    = document.getElementById('burger');
const navLinks  = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close menu on link click
navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close menu on outside click
document.addEventListener('click', e => {
  if (!navLinks.contains(e.target) && !burger.contains(e.target)) {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  }
});


// ─── Scroll Reveal ───────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Stagger delay based on position within parent
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 80}ms`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ─── Portfolio Filter + Show More ────────────────────
const filterBtns     = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');
const showMoreBtn    = document.getElementById('showMore');
const portfolioFade  = document.getElementById('portfolioFade');
const MAX_VISIBLE    = 6;
let   isExpanded     = false;

function applyPortfolio(filter) {
  isExpanded = false;

  // 1. Apply filter visibility
  const matching = [];
  portfolioItems.forEach(item => {
    const match = filter === 'all' || item.dataset.category === filter;
    item.classList.toggle('hidden', !match);
    item.classList.remove('over-limit');
    if (match) matching.push(item);
  });

  // 2. If more than MAX_VISIBLE, hide the rest and show fade/button
  if (matching.length > MAX_VISIBLE) {
    matching.slice(MAX_VISIBLE).forEach(item => item.classList.add('over-limit'));
    portfolioFade.classList.remove('gone');
    showMoreBtn.classList.remove('gone');
  } else {
    portfolioFade.classList.add('gone');
    showMoreBtn.classList.add('gone');
  }
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyPortfolio(btn.dataset.filter);
  });
});

showMoreBtn.addEventListener('click', () => {
  isExpanded = true;
  portfolioItems.forEach(item => item.classList.remove('over-limit'));
  portfolioFade.classList.add('gone');
  showMoreBtn.classList.add('gone');
});

// Init with 6 visible
applyPortfolio('all');


// ─── Contact Form ─────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    // Simple feedback
    btn.textContent = currentLang.value === 'pl' ? 'Wysłano! ✓' : currentLang.value === 'de' ? 'Gesendet! ✓' : 'Sent! ✓';
    btn.style.background = '#4CAF50';
    btn.style.color = '#fff';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}


// ─── Active Nav Link on Scroll ────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));


// ─── For Sale – empty state ───────────────────────────
const forsaleGrid  = document.getElementById('forsaleGrid');
const forsaleEmpty = document.getElementById('forsaleEmpty');
if (forsaleGrid && forsaleEmpty) {
  const hasListings = forsaleGrid.querySelector('.forsale-card');
  forsaleEmpty.classList.toggle('visible', !hasListings);
}


// ─── Load listing descriptions from info.txt ─────────
document.querySelectorAll('.forsale-card[data-listing]').forEach(card => {
  const folder  = card.dataset.listing;
  const noteEl  = card.querySelector('.forsale-card__note');
  if (!noteEl) return;

  fetch(`${folder}/info.txt`)
    .then(r => r.text())
    .then(text => {
      const parsed = {};
      text.split('\n').forEach(line => {
        const colon = line.indexOf(':');
        if (colon === -1) return;
        const key = line.slice(0, colon).trim();
        const val = line.slice(colon + 1).trim();
        if (val) parsed[key] = val;
      });

      const pl = parsed['Opis-PL'] || '';
      const en = parsed['Opis-EN'] || pl;
      const de = parsed['Opis-DE'] || en;

      if (pl) {
        noteEl.setAttribute('data-pl', pl);
        noteEl.setAttribute('data-en', en);
        noteEl.setAttribute('data-de', de);
        noteEl.textContent = currentLang.value === 'en' ? en : currentLang.value === 'de' ? de : pl;
      }
    })
    .catch(() => { /* no info.txt or no description — leave empty */ });
});


// ─── Listing photo sliders ───────────────────────────
document.querySelectorAll('.forsale-slider').forEach(slider => {
  const track  = slider.querySelector('.forsale-slider__track');
  const imgs   = track.querySelectorAll('img');
  const dotsEl = slider.querySelector('.forsale-slider__dots');
  const count  = imgs.length;
  let current  = 0;

  slider.dataset.count = count;

  // Build dots
  imgs.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + count) % count;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('span').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  slider.querySelector('.forsale-slider__btn--prev')
    .addEventListener('click', () => goTo(current - 1));
  slider.querySelector('.forsale-slider__btn--next')
    .addEventListener('click', () => goTo(current + 1));
});


// ─── Lightbox ─────────────────────────────────────────
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxCtr  = document.getElementById('lightboxCounter');
let lbImages = [], lbIndex = 0;

function openLightbox(imgs, idx) {
  lbImages = imgs;
  lbIndex  = idx;
  showLightboxSlide();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
function showLightboxSlide() {
  lightboxImg.src = lbImages[lbIndex];
  lightboxCtr.textContent = lbImages.length > 1 ? `${lbIndex + 1} / ${lbImages.length}` : '';
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
  showLightboxSlide();
});
document.getElementById('lightboxNext').addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % lbImages.length;
  showLightboxSlide();
});
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLightboxSlide(); }
  if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; showLightboxSlide(); }
});

// Wire up all sliders
document.querySelectorAll('.forsale-slider').forEach(slider => {
  const imgs = Array.from(slider.querySelectorAll('.forsale-slider__track img')).map(i => i.src);
  slider.querySelectorAll('.forsale-slider__track img').forEach((img, idx) => {
    img.addEventListener('click', () => openLightbox(imgs, idx));
  });
});
