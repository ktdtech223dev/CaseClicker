import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let idCounter = 0;

export default function FloatingNumbers({ containerRef }) {
  const [floaters, setFloaters] = useState([]);

  const spawn = useCallback((amount, x, y) => {
    const id = ++idCounter;
    const offsetX = (Math.random() - 0.5) * 80;
    const scale = amount >= 10 ? 1.3 : amount >= 1 ? 1.1 : 1;
    const color = amount >= 10 ? '#ffd700' : amount >= 1 ? '#e4b900' : '#e4b900';

    setFloaters(prev => [...prev.slice(-10), { id, amount, x: x + offsetX, y, scale, color }]);

    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    }, 1000);
  }, []);

  return {
    spawn,
    element: (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 20 }}>
        <AnimatePresence>
          {floaters.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 1, y: f.y, scale: f.scale }}
              animate={{ opacity: 0, y: f.y - 90, scale: f.scale * 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute font-mono font-bold"
              style={{
                left: f.x,
                top: f.y,
                color: f.color,
                fontSize: f.amount >= 10 ? '18px' : '14px',
                textShadow: `0 0 8px ${f.color}80, 0 2px 4px rgba(0,0,0,0.5)`,
              }}
            >
              +${f.amount >= 1000 ? `${(f.amount / 1000).toFixed(1)}K` : f.amount.toFixed(2)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    ),
  };
}
