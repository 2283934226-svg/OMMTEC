(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('.particle-field');
  if (!hero || !canvas) return;

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const palettes = {
    light: ['#111827', '#17a99a', '#426ed5', '#7256c7', '#dc4b8b'],
    dark: ['#f4f7ff', '#39d5c2', '#6f98ff', '#a885f0', '#ff72af']
  };
  let colors = palettes[document.documentElement.dataset.theme] || palettes.light;
  let width = 0;
  let height = 0;
  let density = 0;
  let particles = [];
  let animationFrame = 0;
  let lastTime = 0;
  let visible = true;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function createParticle(randomDepth = true) {
    return {
      angle: Math.random() * Math.PI * 2,
      radius: 18 + Math.random() * Math.min(width, height) * .19,
      depth: randomDepth ? .1 + Math.random() * .9 : .96,
      speed: .0042 + Math.random() * .006,
      size: .7 + Math.random() * 2.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: (Math.random() - .5) * .0016
    };
  }

  function resetParticle(particle) {
    Object.assign(particle, createParticle(false));
  }

  function project(particle, depth = particle.depth) {
    const perspective = 1 / Math.max(depth, .08);
    return {
      x: width * (.5 + pointer.x * .025) + Math.cos(particle.angle) * particle.radius * perspective,
      y: height * (.47 + pointer.y * .02) + Math.sin(particle.angle) * particle.radius * perspective * .62,
      perspective
    };
  }

  function drawParticle(particle) {
    const point = project(particle);
    const previous = project(particle, Math.min(1, particle.depth + particle.speed * 8));
    const alpha = Math.min(.92, .22 + point.perspective * .08);
    const radius = Math.min(7, particle.size * (.45 + point.perspective * .48));

    context.globalAlpha = alpha * .5;
    context.strokeStyle = particle.color;
    context.lineWidth = Math.max(.6, radius * .55);
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(point.x, point.y);
    context.stroke();

    context.globalAlpha = alpha;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function render(time = 0) {
    const step = lastTime ? Math.min(2, (time - lastTime) / 16.67) : 1;
    lastTime = time;
    pointer.x += (pointer.targetX - pointer.x) * .035;
    pointer.y += (pointer.targetY - pointer.y) * .035;
    context.clearRect(0, 0, width, height);

    particles.forEach(particle => {
      if (!reducedMotion) {
        particle.depth -= particle.speed * step;
        particle.angle += particle.drift * step;
      }
      const point = project(particle);
      if (particle.depth < .075 || point.x < -40 || point.x > width + 40 || point.y < -40 || point.y > height + 40) resetParticle(particle);
      drawParticle(particle);
    });
    context.globalAlpha = 1;
    animationFrame = !reducedMotion && visible ? requestAnimationFrame(render) : 0;
  }

  function resize() {
    const bounds = hero.getBoundingClientRect();
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    const limitedDevice = (navigator.deviceMemory && navigator.deviceMemory <= 4) || navigator.hardwareConcurrency <= 4;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, limitedDevice ? 1.25 : 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const desiredDensity = width < 720 ? (limitedDevice ? 42 : 58) : (limitedDevice ? 82 : 132);
    if (density !== desiredDensity) {
      density = desiredDensity;
      particles = Array.from({ length: density }, () => createParticle(true));
    }
    context.clearRect(0, 0, width, height);
    particles.forEach(drawParticle);
  }

  hero.addEventListener('pointermove', event => {
    const bounds = hero.getBoundingClientRect();
    pointer.targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    pointer.targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
  });
  hero.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });
  window.addEventListener('ommtec-theme-change', event => {
    colors = palettes[event.detail.theme] || palettes.light;
    particles.forEach(particle => { particle.color = colors[Math.floor(Math.random() * colors.length)]; });
  });

  new ResizeObserver(resize).observe(hero);
  resize();

  if (reducedMotion) {
    render();
  } else {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !animationFrame) {
        lastTime = 0;
        animationFrame = requestAnimationFrame(render);
      } else if (!visible && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }, { threshold: .01 });
    observer.observe(hero);
  }
})();
