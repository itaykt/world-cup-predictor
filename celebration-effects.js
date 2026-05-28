/**
 * Confetti + fireworks for championship / podium screens.
 */
(function (root, factory) {
  const CelebrationEffects = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = CelebrationEffects;
  } else {
    root.CelebrationEffects = CelebrationEffects;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  let confettiActive = false;
  let confettiParticles = [];
  let fireworksActive = false;
  let fireworkBursts = [];
  let fireworkLaunchTimer = null;

  const confettiColors = ["#f59e0b", "#d97706", "#fcd34d", "#10b981", "#059669", "#fe3c72", "#ff7854", "#ffffff"];
  const fireworkColors = ["#f59e0b", "#fcd34d", "#fe3c72", "#ff7854", "#10b981", "#60a5fa", "#ffffff"];

  function getCanvas() {
    return document.getElementById("confetti-canvas");
  }

  function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function startConfetti() {
    if (confettiActive) return;
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    confettiActive = true;
    resizeCanvas(canvas);

    confettiParticles = [];
    for (let i = 0; i < 140; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20,
        size: Math.random() * 8 + 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        speedY: Math.random() * 4 + 3,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2
      });
    }

    function animateConfetti() {
      if (!confettiActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      confettiParticles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        if (p.y < canvas.height) activeCount++;
      });

      fireworkBursts.forEach((burst) => {
        burst.particles.forEach((p) => {
          if (p.life <= 0) return;
          ctx.globalAlpha = Math.min(1, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.06;
          p.life -= 0.018;
        });
        burst.particles = burst.particles.filter((p) => p.life > 0);
      });
      fireworkBursts = fireworkBursts.filter((b) => b.particles.length > 0);

      ctx.globalAlpha = 1;

      if (activeCount > 0 || fireworkBursts.length > 0 || fireworksActive) {
        requestAnimationFrame(animateConfetti);
      } else {
        confettiActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(animateConfetti);
  }

  function spawnFireworkBurst(canvas) {
    const x = canvas.width * (0.15 + Math.random() * 0.7);
    const y = canvas.height * (0.2 + Math.random() * 0.35);
    const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
    const particles = [];
    const count = 28 + Math.floor(Math.random() * 16);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 2 + Math.random() * 3.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color,
        life: 1
      });
    }
    fireworkBursts.push({ particles });
  }

  function startFireworks(durationMs) {
    const canvas = getCanvas();
    if (!canvas) return;
    fireworksActive = true;
    resizeCanvas(canvas);

    const launch = () => spawnFireworkBurst(canvas);
    launch();
    fireworkLaunchTimer = setInterval(launch, 550);

    setTimeout(() => {
      fireworksActive = false;
      if (fireworkLaunchTimer) {
        clearInterval(fireworkLaunchTimer);
        fireworkLaunchTimer = null;
      }
    }, durationMs || 5000);
  }

  function stopCelebration() {
    confettiActive = false;
    fireworksActive = false;
    if (fireworkLaunchTimer) {
      clearInterval(fireworkLaunchTimer);
      fireworkLaunchTimer = null;
    }
    fireworkBursts = [];
    confettiParticles = [];
    const canvas = getCanvas();
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function triggerPodiumCelebration() {
    startConfetti();
    startFireworks(5500);
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      const canvas = getCanvas();
      if (canvas) resizeCanvas(canvas);
    });
  }

  return {
    triggerPodiumCelebration,
    stopCelebration
  };
});
