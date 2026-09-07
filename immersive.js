(() => {
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const links = [...document.querySelectorAll('.scene-links a')];
  const current = document.querySelector('[data-scene-current]');
  const root = document.documentElement;
  if (!scenes.length) return;

  let activeIndex = -1;
  let ticking = false;

  function update() {
    ticking = false;
    const maximum = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / maximum));
    root.style.setProperty('--page-progress', progress.toFixed(4));

    const marker = window.innerHeight * .46;
    let nextIndex = 0;
    let bestDistance = Infinity;
    scenes.forEach((scene, index) => {
      const bounds = scene.getBoundingClientRect();
      const sceneCenter = Math.max(bounds.top, Math.min(marker, bounds.bottom));
      const distance = Math.abs(sceneCenter - marker);
      if (distance < bestDistance) {
        bestDistance = distance;
        nextIndex = index;
      }
    });

    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;
    scenes.forEach((scene, index) => scene.classList.toggle('scene-active', index === activeIndex));
    links.forEach((link, index) => {
      const selected = index === activeIndex;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
})();
