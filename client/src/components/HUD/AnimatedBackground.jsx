import React, { useRef, useEffect } from 'react';

const PARTICLE_COUNT = 30;
const FRAME_INTERVAL = 1000 / 30; // 30fps throttle

function createParticle(canvasWidth, canvasHeight, randomY) {
  return {
    x: Math.random() * canvasWidth,
    y: randomY ? Math.random() * canvasHeight : canvasHeight + Math.random() * 50,
    radius: 2 + Math.random() * 2,
    speed: 0.15 + Math.random() * 0.25,
    swayAmplitude: 15 + Math.random() * 20,
    swaySpeed: 0.003 + Math.random() * 0.004,
    swayOffset: Math.random() * Math.PI * 2,
    opacity: 0.02 + Math.random() * 0.03,
    hue: 38 + Math.random() * 12, // gold/amber range
  };
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const lastFrameRef = useRef(0);
  const tickRef = useRef(0);

  useEffect(() => {
    // Check animations setting from store (read directly, no subscription)
    try {
      const storeState = window.__zustandStore?.getState?.();
      if (storeState && storeState.settings && storeState.settings.animations === false) {
        return;
      }
    } catch (e) {
      // ignore, default to showing animation
    }

    // Also check localStorage for a settings key
    try {
      const stored = localStorage.getItem('casesim_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.animations === false) return;
      }
    } catch (e) {
      // ignore
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles spread across the canvas
    particlesRef.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push(createParticle(width, height, true));
    }

    function animate(timestamp) {
      animFrameRef.current = requestAnimationFrame(animate);

      // Throttle to 30fps
      if (timestamp - lastFrameRef.current < FRAME_INTERVAL) return;
      lastFrameRef.current = timestamp;
      tickRef.current++;

      // Periodically re-check animations setting (every ~5 seconds at 30fps)
      if (tickRef.current % 150 === 0) {
        try {
          const storeState = window.__zustandStore?.getState?.();
          if (storeState?.settings?.animations === false) {
            ctx.clearRect(0, 0, width, height);
            return;
          }
        } catch (e) {
          // ignore
        }
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];

        // Move upward
        p.y -= p.speed;

        // Horizontal sway via sine wave
        const swayX = Math.sin(timestamp * p.swaySpeed + p.swayOffset) * p.swayAmplitude;
        const drawX = p.x + swayX;

        // Fade based on vertical position: fade in at bottom, fade out at top
        const normalizedY = p.y / height;
        let fadeFactor = 1;
        if (normalizedY > 0.85) {
          // Bottom 15%: fade in
          fadeFactor = (1 - normalizedY) / 0.15;
        } else if (normalizedY < 0.15) {
          // Top 15%: fade out
          fadeFactor = normalizedY / 0.15;
        }

        const alpha = p.opacity * Math.max(0, fadeFactor);

        // Reset particle when it goes above canvas
        if (p.y < -10) {
          particlesRef.current[i] = createParticle(width, height, false);
          continue;
        }

        ctx.beginPath();
        ctx.arc(drawX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 55%, ${alpha})`;
        ctx.fill();
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Check animations setting before rendering canvas
  let animationsEnabled = true;
  try {
    const stored = localStorage.getItem('casesim_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.animations === false) animationsEnabled = false;
    }
  } catch (e) {
    // ignore
  }

  if (!animationsEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
