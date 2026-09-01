(() => {
  'use strict';

  const TOTAL_FRAMES = 60;
  const framePath = (i) => `frames/frame_${String(i).padStart(3, '0')}.webp`;

  const pin = document.getElementById('heroPin');
  const watchImg = document.getElementById('watchFrame');
  const featureItems = Array.from(document.querySelectorAll('.feature'));
  const scrollHint = document.getElementById('scrollHint');
  const sideIndexCurrent = document.getElementById('sideIndexCurrent');

  /* ---------- progressive background preload ---------- */
  /* frame 1 is already the initial <img> src and paints immediately;
     the rest warm the browser cache in the background so later scroll
     frames swap instantly with no network stall. Loaded a handful at a
     time (rather than strictly one-by-one) so the full sequence is
     cached well before the user finishes scrolling through it — a
     single-file queue was too slow to keep up with a quick scroll,
     which is what made the decomposition feel choppy. */
  function preloadFrames() {
    const CONCURRENCY = 6;
    let next = 2;

    function loadOne() {
      if (next > TOTAL_FRAMES) return;
      const i = next;
      next += 1;
      const src = framePath(i);
      const img = new Image();
      let retried = false;
      img.onload = loadOne;
      img.onerror = () => {
        if (!retried) {
          retried = true;
          setTimeout(() => { img.src = src; }, 600);
        } else {
          loadOne();
        }
      };
      img.src = src;
    }

    for (let w = 0; w < CONCURRENCY; w += 1) loadOne();
  }

  /* ---------- frame sequence ---------- */
  let currentFrame = 1;
  function setFrame(index) {
    const clamped = Math.min(TOTAL_FRAMES, Math.max(1, index));
    if (clamped === currentFrame) return;
    currentFrame = clamped;
    watchImg.src = framePath(clamped);
  }

  /* ---------- feature list reveal ---------- */
  function updateFeatures(progress) {
    // cumulative reveal: each item appears once its threshold is passed
    // and stays visible, the current one is fully bright.
    const activeIndex = Math.min(5, Math.max(1, Math.floor(progress * 5) + 1));

    featureItems.forEach((li) => {
      const idx = Number(li.dataset.index);
      const threshold = (idx - 1) / 5;
      const isVisible = progress >= threshold - 0.001;
      li.classList.toggle('is-visible', isVisible);
      li.classList.toggle('is-active', idx === activeIndex);
    });

    sideIndexCurrent.textContent = String(activeIndex).padStart(2, '0');
  }

  /* ---------- scroll -> progress mapping ---------- */
  let ticking = false;

  function computeProgress() {
    const rect = pin.getBoundingClientRect();
    const scrollable = pin.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    const scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / scrollable));
  }

  function onFrame() {
    ticking = false;
    const progress = computeProgress();

    const frameIndex = 1 + Math.round(progress * (TOTAL_FRAMES - 1));
    setFrame(frameIndex);
    updateFeatures(progress);

    scrollHint.style.opacity = progress > 0.03 ? '0' : '1';
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);

  // initial paint (frame 1, feature 01) without waiting for a scroll event
  onFrame();
  preloadFrames();
})();
