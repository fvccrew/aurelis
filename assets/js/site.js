(() => {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const html = document.documentElement;
  html.classList.add('is-loading');

  /* ---------- smooth scroll (Lenis) ---------- */

  let lenis = null;

  function initSmoothScroll() {
    if (typeof Lenis === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;

    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
  }

  /* ---------- preloader ---------- */

  function runPreloader() {
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    const pct = document.getElementById('preloaderPct');
    if (!preloader || !fill || !pct) {
      html.classList.remove('is-loading');
      return;
    }

    let alreadyVisited = false;
    try {
      alreadyVisited = sessionStorage.getItem('aurelis-visited') === '1';
    } catch (e) {
      alreadyVisited = false;
    }

    if (alreadyVisited) {
      preloader.remove();
      html.classList.remove('is-loading');
      ScrollTrigger.refresh();
      return;
    }

    try {
      // set immediately, not on completion: a visitor who navigates away
      // mid-animation must still skip the preloader on their next visit.
      sessionStorage.setItem('aurelis-visited', '1');
    } catch (e) {
      /* private browsing or storage disabled: preloader will simply replay */
    }

    const counter = { value: 0 };

    gsap.to(counter, {
      value: 100,
      duration: 1.4,
      ease: 'power1.inOut',
      onUpdate: () => {
        const v = Math.round(counter.value);
        fill.style.width = v + '%';
        pct.textContent = v + '%';
      },
      onComplete: () => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
          delay: 0.15,
          onComplete: () => {
            preloader.remove();
            html.classList.remove('is-loading');
            ScrollTrigger.refresh();
          }
        });
      }
    });
  }

/* ---------- magnetic buttons ---------- */

  function initMagnetic() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  /* ---------- nav visibility ---------- */

  function initNav() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;

    const hero = document.getElementById('heroPin');
    if (hero) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'bottom top',
        onEnter: () => nav.classList.add('is-visible'),
        onLeaveBack: () => nav.classList.remove('is-visible')
      });
    } else {
      nav.classList.add('is-visible');
    }

    let isScrolled = false;
    let ticking = false;
    function applyScrolledState() {
      ticking = false;
      const shouldBeScrolled = window.scrollY > 80;
      if (shouldBeScrolled === isScrolled) return;
      isScrolled = shouldBeScrolled;
      nav.classList.toggle('is-scrolled', isScrolled);
    }
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(applyScrolledState);
    }, { passive: true });
  }

  /* ---------- word-mask text splitting ---------- */

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="word"><span class="word-inner">${w}</span></span>`)
      .join(' ');
    return el.querySelectorAll('.word-inner');
  }

  function initLineReveals() {
    document.querySelectorAll('[data-line]').forEach((line) => {
      const inners = splitWords(line);
      gsap.set(inners, { yPercent: 110, opacity: 0 });
      ScrollTrigger.create({
        trigger: line,
        start: 'top 85%',
        onEnter: () => gsap.to(inners, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.025
        })
      });
    });
  }

  function initFadeReveals() {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.set(el, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
      });
    });
  }

  /* ---------- material swatches ---------- */

  function initSwatchReveals() {
    const swatches = gsap.utils.toArray('.swatch');
    if (!swatches.length) return;
    ScrollTrigger.batch(swatches, {
      start: 'top 92%',
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'back.out(1.7)',
        stagger: 0.08
      })
    });
  }

  /* ---------- inspiration tiles ---------- */

  function initInspirationReveals() {
    const tiles = gsap.utils.toArray('.insp-tile');
    if (!tiles.length) return;
    ScrollTrigger.batch(tiles, {
      start: 'top 90%',
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08
      })
    });
  }

  /* ---------- watch detail page: views, specs, positioning ---------- */

  function initDetailReveals() {
    const batches = [
      { selector: '.view-card', from: { opacity: 0, y: 30, scale: 0.96 }, to: { opacity: 1, y: 0, scale: 1 } },
      { selector: '.sibling-card', from: { opacity: 0, y: 30, scale: 0.96 }, to: { opacity: 1, y: 0, scale: 1 } },
      { selector: '.spec-row', from: { opacity: 0, x: -16 }, to: { opacity: 1, x: 0 } },
      { selector: '.positioning-item', from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 } }
    ];

    batches.forEach(({ selector, from, to }) => {
      const items = gsap.utils.toArray(selector);
      if (!items.length) return;
      gsap.set(items, from);
      ScrollTrigger.batch(items, {
        start: 'top 92%',
        onEnter: (batch) => gsap.to(batch, { ...to, duration: 0.8, ease: 'power3.out', stagger: 0.1 })
      });
    });
  }

  /* ---------- watch detail page: close-up lightbox ---------- */

  function initLightbox() {
    const triggers = document.querySelectorAll('.detail-closeups .view-card img');
    if (!triggers.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Fermer">&times;</button>
      <img class="lightbox-img" alt="">
      <p class="lightbox-caption"></p>
    `;
    document.body.appendChild(lightbox);

    const img = lightbox.querySelector('.lightbox-img');
    const caption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    function open(src, alt) {
      img.src = src;
      img.alt = alt;
      caption.textContent = alt;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      gsap.set(lightbox, { opacity: 0 });
      gsap.set(img, { opacity: 0, scale: 0.92 });
      gsap.to(lightbox, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(img, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out', delay: 0.05 });
    }

    function close() {
      gsap.to(img, { opacity: 0, scale: 0.92, duration: 0.25, ease: 'power2.in' });
      gsap.to(lightbox, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          lightbox.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    }

    triggers.forEach((el) => {
      el.addEventListener('click', () => open(el.currentSrc || el.src, el.alt));
    });

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
    });
  }

  /* ---------- craft: unfurling 3D parallax gallery ---------- */

  function initUnfurlGallery() {
    const wrap = document.getElementById('unfurlWrap');
    const banner = document.getElementById('unfurlBanner');
    const grid = document.getElementById('unfurlGrid');
    const cols = [1, 2, 3, 4].map((n) => document.getElementById('unfurlCol' + n));
    if (!wrap || !banner || !grid || cols.some((c) => !c)) return;

    const items = [
      { src: 'assets/img/craft/chrono-couronne.webp', caption: 'Couronne signée AURELIS' },
      { src: 'assets/img/craft/chrono-poussoirs.webp', caption: 'Poussoirs chronographe' },
      { src: 'assets/img/craft/chrono-compteurs.webp', caption: 'Compteurs, finition circulaire' },
      { src: 'assets/img/craft/chrono-cuir.webp', caption: 'Cuir perforé, cousu main' },
      { src: 'assets/img/craft/chrono-boucle.webp', caption: 'Boucle déployante acier' },
      { src: 'assets/img/craft/noir-tourbillon.webp', caption: 'Tourbillon apparent' },
      { src: 'assets/img/craft/noir-index.webp', caption: 'Cadran noir texturé' },
      { src: 'assets/img/craft/origin-aiguilles.webp', caption: 'Aiguilles dauphines polies' },
      { src: 'assets/img/craft/origin-tourbillon.webp', caption: 'Ouverture sur le mouvement' },
      { src: 'assets/img/craft/skeleton-mouvement.webp', caption: 'Mouvement ajouré, fini main' },
      { src: 'assets/img/craft/skeleton-couronne.webp', caption: 'Couronne signée, finition or' }
    ];

    const buckets = [[], [], [], []];
    items.forEach((item, i) => buckets[i % 4].push(item));

    buckets.forEach((bucket, i) => {
      cols[i].innerHTML = bucket.concat(bucket).map(({ src, caption }) =>
        `<figure class="unfurl-item"><img data-src="${src}" alt="${caption}" decoding="async"></figure>`
      ).join('');
    });

    // stagger the network requests instead of firing them all at once, and
    // retry once on failure: mobile connections occasionally hit a transient
    // error when this many images load in a single burst.
    const galleryImgs = grid.querySelectorAll('img[data-src]');
    function loadWithRetry(img, attempt) {
      const src = img.dataset.src;
      img.onerror = () => {
        if (attempt < 2) {
          setTimeout(() => loadWithRetry(img, attempt + 1), 600);
        }
      };
      img.src = src;
    }
    let gi = 0;
    function loadNextGalleryImg() {
      if (gi >= galleryImgs.length) return;
      loadWithRetry(galleryImgs[gi], 0);
      gi += 1;
      (window.requestIdleCallback || window.requestAnimationFrame)(loadNextGalleryImg);
    }
    loadNextGalleryImg();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: 'top top',
        end: '+=350%',
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true
      }
    });

    tl.fromTo(banner,
      { width: '90vw', height: '80vh', borderRadius: 48, borderWidth: 4 },
      { width: '100vw', height: '100vh', borderRadius: 0, borderWidth: 0, duration: 0.15, ease: 'none' },
      0
    );

    tl.fromTo(grid,
      { rotateY: -45, rotateX: 25, rotateZ: 15, z: -800 },
      { rotateY: -8, rotateX: 4, rotateZ: 2, z: 0, duration: 0.85, ease: 'none' },
      0.15
    );

    const colMotion = [
      { from: 0, to: -40 },
      { from: -40, to: 10 },
      { from: 0, to: -40 },
      { from: -30, to: 20 }
    ];
    cols.forEach((col, i) => {
      tl.fromTo(col,
        { yPercent: colMotion[i].from },
        { yPercent: colMotion[i].to, duration: 0.85, ease: 'none' },
        0.15
      );
    });
  }

  /* ---------- key stats count-up ---------- */

  function initStats() {
    document.querySelectorAll('[data-count-to]').forEach((el) => {
      const target = Number(el.dataset.countTo);
      const counter = { value: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(counter.value); }
        })
      });
    });
  }

  /* ---------- collection: scroll-linked mask reveal ---------- */

  function initRevealCollection() {
    document.querySelectorAll('.reveal-item').forEach((item, i) => {
      const media = item.querySelector('.reveal-media');
      if (!media) return;
      const isRounded = item.classList.contains('mask--rounded');

      gsap.fromTo(media,
        { '--mr': isRounded ? '10%' : '16%', '--mi': '30%' },
        {
          '--mr': isRounded ? '0%' : '75%',
          '--mi': '0%',
          ease: 'none',
          scrollTrigger: {
            id: 'reveal-mask-' + i,
            trigger: item,
            start: 'top 85%',
            end: 'top 15%',
            scrub: 0.4
          }
        }
      );
    });
  }

  /* ---------- closing letter reveal ---------- */

  function initClosing() {
    const word = document.getElementById('closingWord');
    if (!word) return;
    const letters = word.textContent.split('').map((c) =>
      `<span class="letter">${c === ' ' ? '&nbsp;' : c}</span>`
    ).join('');
    word.innerHTML = letters;
    const spans = word.querySelectorAll('.letter');
    gsap.set(spans, { yPercent: 100, opacity: 0 });
    ScrollTrigger.create({
      trigger: word,
      start: 'top 85%',
      onEnter: () => gsap.to(spans, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.035
      })
    });
  }

  // coalesces rapid-fire refresh requests (initial load, fonts ready,
  // window load) into a single recalculation instead of forcing a full
  // layout pass for each one.
  let refreshTimer = null;
  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  }

  function init() {
    // uncapped, regardless of pointer type: with lagSmoothing left at its
    // default, a slow frame (any dropped frames, not just on mobile) makes
    // GSAP's ticker clamp its next delta, causing scroll-driven animation
    // to visibly stutter instead of just catching up.
    gsap.ticker.lagSmoothing(0);

    initSmoothScroll();

    // the unfurl gallery is the only pinned section left: it inserts a
    // pin-spacer that pushes down everything after it (materials, closing),
    // so it must be created before any trigger that measures their position.
    initUnfurlGallery();

    initRevealCollection();
    initMagnetic();
    initNav();
    initLineReveals();
    initFadeReveals();
    initSwatchReveals();
    initInspirationReveals();
    initDetailReveals();
    initLightbox();
    initStats();
    initClosing();
    runPreloader();
    scheduleRefresh();

    // custom fonts swapping in after the initial layout reflows the page
    // (text reflows to different metrics), which leaves every scroll
    // trigger's recorded start/end position stale — most noticeable on a
    // slower connection where the font takes longer to arrive. Recompute
    // once the swap is actually done.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleRefresh);
    }

    // images loading after layout (even non-lazy ones, on a slow
    // connection) can shift content the same way; catch stragglers too.
    window.addEventListener('load', scheduleRefresh);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
