(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const palette = ['#F2A900', '#123A6D', '#5C9E3A', '#FFFFFF', '#8BB8DF', '#FFD86B'];

  let canvas = null;
  let ctx = null;
  let particles = [];
  let raf = null;
  let lastLaunch = 0;

  function ensureCanvas() {
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.className = 'celebration-confetti';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d', { alpha: true });
    resize();
    window.addEventListener('resize', resize, { passive: true });
  }

  function resize() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function piece(originX, originY, scale = 1) {
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 0.95;
    const speed = (8 + Math.random() * 11) * scale;

    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.24 + Math.random() * 0.12,
      drag: 0.992,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.08 + Math.random() * 0.16,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.28,
      width: (5 + Math.random() * 8) * scale,
      height: (8 + Math.random() * 12) * scale,
      color: palette[Math.floor(Math.random() * palette.length)],
      shape: Math.random() > 0.22 ? 'rect' : 'circle',
      life: 0,
      ttl: 150 + Math.random() * 80,
      opacity: 1
    };
  }

  function burst(x, y, count, scale = 1) {
    for (let i = 0; i < count; i++) {
      particles.push(piece(x, y, scale));
    }
  }

  function launch() {
    const now = Date.now();
    if (now - lastLaunch < 1800) return;
    lastLaunch = now;

    ensureCanvas();

    const screenMode = document.body.classList.contains('screen-page');
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (screenMode) {
      burst(w * 0.12, h * 0.74, 95, 1.15);
      burst(w * 0.88, h * 0.74, 95, 1.15);
      setTimeout(() => burst(w * 0.50, h * 0.18, 80, 1.0), 220);
      setTimeout(() => {
        burst(w * 0.28, h * 0.26, 55, 0.9);
        burst(w * 0.72, h * 0.26, 55, 0.9);
      }, 520);
    } else {
      burst(w * 0.16, h * 0.68, 60, 0.82);
      burst(w * 0.84, h * 0.68, 60, 0.82);
      setTimeout(() => burst(w * 0.50, h * 0.20, 55, 0.78), 200);
    }

    if (!raf) animate();
  }

  function animate() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles = particles.filter(p => {
      p.life += 1;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.wobble += p.wobbleSpeed;
      p.rotation += p.rotationSpeed;

      const progress = p.life / p.ttl;
      if (progress > 0.74) {
        p.opacity = Math.max(0, 1 - (progress - 0.74) / 0.26);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x + Math.sin(p.wobble) * 4, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'circle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.width * 0.48, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const flip = Math.cos(p.wobble * 1.65);
        ctx.scale(Math.max(0.18, Math.abs(flip)), 1);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      }

      ctx.restore();

      return p.life < p.ttl && p.y < window.innerHeight + 80;
    });

    if (particles.length) {
      raf = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  window.addEventListener('connections:revealed', launch);
})();