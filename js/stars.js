/* Stars for secondary pages */
(function () {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; init(); }
  function init() {
    stars = [];
    for (let i = 0; i < Math.floor(W * H / 4000); i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + 0.2,
        phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.015 + 0.005 });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.phase += s.speed;
      const a = 0.2 + 0.5 * Math.sin(s.phase);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,224,208,${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize();
  draw();
  window.addEventListener('resize', resize);

  // Nav scroll
  const nav = document.getElementById('nav');
  if (nav) window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
})();
