(() => {
  'use strict';

  function init() {
    const fade = document.getElementById('pageFade');
    if (!fade || typeof gsap === 'undefined') return;

    gsap.to(fade, {
      yPercent: -100,
      duration: 0.5,
      ease: 'power3.inOut',
      delay: 0.05
    });

    // navigating away calls window.location.href right as the fade finishes
    // covering the screen, so that's the frame a mobile browser's
    // back/forward cache snapshots this page in. Restoring that snapshot
    // (e.g. a swipe-back gesture) would otherwise show the page frozen
    // under a solid black cover forever, since bfcache restores don't
    // re-run this script. Force it back to the revealed state instantly.
    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      gsap.killTweensOf(fade);
      gsap.set(fade, { yPercent: -100 });
      document.documentElement.classList.remove('is-loading');
      document.body.style.overflow = '';
      const lightbox = document.querySelector('.lightbox');
      if (lightbox) lightbox.classList.remove('is-open');
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      const isExternal = /^https?:\/\//.test(href);
      const isHash = href.startsWith('#');
      const isNewTab = link.target === '_blank';
      if (!href || isHash || isExternal || isNewTab) return;

      e.preventDefault();
      gsap.fromTo(fade,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          onComplete: () => { window.location.href = href; }
        }
      );
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
