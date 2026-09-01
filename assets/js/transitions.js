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
