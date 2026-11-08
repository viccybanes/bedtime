(() => {
  const canvas = document.querySelector('#sky-canvas');
  const scene = document.querySelector('.hero-scene');
  const bed = document.querySelector('#floating-bed');
  const toggle = document.querySelector('#motion-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let context = null;
  try { context = canvas?.getContext('2d'); } catch { /* The CSS scene still works. */ }
  let paused = reducedMotion.matches;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let stars = [];
  let elapsed = 0;
  let lastFrame = 0;
  let frameId = 0;
  let frameTimer = 0;
  let nudgeTimer = 0;
  let pointerX = 0;
  let pointerY = 0;
  let sceneX = 0;
  let sceneY = 0;

  function moveScene(x, y) {
    if (!scene || (x === sceneX && y === sceneY)) return;
    sceneX = x;
    sceneY = y;
    scene.style.setProperty('--scene-x', x + 'px');
    scene.style.setProperty('--scene-y', y + 'px');
  }

  function drawSky() {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      const x = star.x * width + Math.sin(elapsed * 0.18 + star.phase) * 5;
      const y = ((star.y + elapsed * star.speed) % 1) * height;
      const size = star.size;
      context.fillStyle = 'rgba(83, 124, 161, ' + star.opacity + ')';
      context.beginPath();
      if (star.sparkle) {
        context.moveTo(x, y - size * 2.5);
        context.lineTo(x + size * 0.6, y - size * 0.6);
        context.lineTo(x + size * 2.5, y);
        context.lineTo(x + size * 0.6, y + size * 0.6);
        context.lineTo(x, y + size * 2.5);
        context.lineTo(x - size * 0.6, y + size * 0.6);
        context.lineTo(x - size * 2.5, y);
        context.lineTo(x - size * 0.6, y - size * 0.6);
        context.closePath();
      } else {
        context.arc(x, y, size * 0.65, 0, Math.PI * 2);
      }
      context.fill();
    }
  }

  function stopFrames() {
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(frameTimer);
    frameId = 0;
    frameTimer = 0;
    lastFrame = 0;
  }

  function animate(timestamp) {
    frameId = 0;
    if (paused || document.hidden) return;
    if (lastFrame) elapsed += (timestamp - lastFrame) / 1000;
    lastFrame = timestamp;
    drawSky();
    moveScene(pointerX, pointerY);
    // Schedule at most 30 frames a second, including on high-refresh screens.
    frameTimer = window.setTimeout(() => {
      frameTimer = 0;
      frameId = window.requestAnimationFrame(animate);
    }, 34);
  }

  function startFrames() {
    if (!paused && !document.hidden && !frameId && !frameTimer && (context || scene)) {
      frameId = window.requestAnimationFrame(animate);
    }
  }

  function setPaused(value) {
    paused = value || reducedMotion.matches;
    document.documentElement.classList.toggle('motion-paused', paused);
    if (toggle) {
      toggle.disabled = reducedMotion.matches;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = reducedMotion.matches ? 'Reduced motion on' : paused ? 'Resume motion' : 'Pause motion';
    }
    if (paused) {
      stopFrames();
      pointerX = pointerY = 0;
      moveScene(0, 0);
      bed?.classList.remove('is-nudging');
      drawSky();
    } else startFrames();
  }

  function resizeSky() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (!context) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = width < 700 ? 25 : 45;
    if (stars.length !== count) {
      stars = Array.from({ length: count }, (_, index) => ({
        x: Math.random(), y: Math.random(), phase: Math.random() * Math.PI * 2,
        size: 0.7 + Math.random() * 0.7, opacity: 0.12 + Math.random() * 0.16,
        speed: 0.001 + Math.random() * 0.001, sparkle: index % 4 === 0
      }));
    }
    drawSky();
  }

  toggle?.addEventListener('click', () => setPaused(!paused));
  bed?.addEventListener('click', () => {
    window.clearTimeout(nudgeTimer);
    if (paused) return;
    bed.classList.add('is-nudging');
    nudgeTimer = window.setTimeout(() => {
      bed.classList.remove('is-nudging');
    }, 850);
  });
  window.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches || event.pointerType === 'touch') return;
    pointerX = Math.max(-8, Math.min(8, (event.clientX / width - 0.5) * 16));
    pointerY = Math.max(-8, Math.min(8, (event.clientY / height - 0.5) * 16));
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });
  finePointer.addEventListener('change', () => { pointerX = pointerY = 0; });
  reducedMotion.addEventListener('change', event => setPaused(event.matches || paused));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopFrames();
    else startFrames();
  });
  window.addEventListener('resize', resizeSky, { passive: true });
  resizeSky();
  setPaused(paused);
})();
