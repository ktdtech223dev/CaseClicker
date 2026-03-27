import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let particleId = 0;

const PARTICLE_COLORS = ['#e4b900', '#ffd700', '#4b69ff', '#e4b900', '#ffd700'];

export default function ClickParticles() {
  const [particles, setParticles] = useState([]);

  const burst = useCallback((x, y) => {
    const count = 9;
    const batch = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const dist = 35 + Math.random() * 50;
      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      batch.push({
        id: ++particleId,
        x,
        y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 2 + Math.random() * 4,
        color,
        isLine: Math.random() > 0.6,
        rotation: Math.random() * 360,
      });
    }

    setParticles(prev => [...prev.slice(-25), ...batch]);

    setTimeout(() => {
      const batchIds = new Set(batch.map(b => b.id));
      setParticles(prev => prev.filter(p => !batchIds.has(p.id)));
    }, 650);
  }, []);

  return {
    burst,
    element: (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 10 }}>
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, x: p.x, y: p.y, scale: 1, rotate: 0 }}
              animate={{
                opacity: 0,
                x: p.x + p.dx,
                y: p.y + p.dy,
                scale: 0,
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute"
              style={{
                width: p.isLine ? p.size * 3 : p.size,
                height: p.size,
                borderRadius: p.isLine ? '2px' : '50%',
                backgroundColor: p.color,
                boxShadow: `0 0 6px ${p.color}, 0 0 12px ${p.color}40`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    ),
  };
}
