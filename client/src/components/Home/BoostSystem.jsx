import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ClickPowerIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="#4CAF50" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" stroke="#4CAF50" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1" fill="#4CAF50" />
      <line x1="10" y1="1" x2="10" y2="5" stroke="#4CAF50" strokeWidth="1.2" />
      <line x1="10" y1="15" x2="10" y2="19" stroke="#4CAF50" strokeWidth="1.2" />
      <line x1="1" y1="10" x2="5" y2="10" stroke="#4CAF50" strokeWidth="1.2" />
      <line x1="15" y1="10" x2="19" y2="10" stroke="#4CAF50" strokeWidth="1.2" />
    </svg>
  );
}

function AutoIncomeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#4b69ff" strokeWidth="1.5" />
      <path d="M10 4v6l4 2.5" stroke="#4b69ff" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 6l1.5-2M5.5 6L4 4" stroke="#4b69ff" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function CaseDropIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="6" width="14" height="11" rx="1.5" stroke="#8847ff" strokeWidth="1.5" fill="rgba(136, 71, 255, 0.08)" />
      <path d="M7 6V5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0113 5v1" stroke="#8847ff" strokeWidth="1.5" />
      <line x1="3" y1="10.5" x2="17" y2="10.5" stroke="#8847ff" strokeWidth="1" opacity="0.4" />
      <circle cx="10" cy="10.5" r="1.2" fill="#8847ff" opacity="0.5" />
    </svg>
  );
}

function GoldenClickIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2l2.5 5 5.5.8-4 3.9 1 5.5L10 14.5 4.9 17.2l1-5.5-4-3.9 5.5-.8L10 2z" fill="rgba(228, 185, 0, 0.15)" stroke="#e4b900" strokeWidth="1.3" />
      <circle cx="10" cy="10" r="2.5" fill="#e4b900" opacity="0.3" />
    </svg>
  );
}

const BOOST_TYPES = [
  { id: '2x_click', name: '2x Click Power', duration: 30, IconComponent: ClickPowerIcon, color: '#4CAF50', desc: '30 seconds' },
  { id: '2x_auto', name: '2x Auto Income', duration: 60, IconComponent: AutoIncomeIcon, color: '#4b69ff', desc: '60 seconds' },
  { id: '5x_drops', name: '5x Case Drops', duration: 120, IconComponent: CaseDropIcon, color: '#8847ff', desc: '120 seconds' },
  { id: 'golden_click', name: 'Golden Click', duration: 1, IconComponent: GoldenClickIcon, color: '#e4b900', desc: 'Next click 100x' },
];

export default function BoostSystem({ onActivateBoost }) {
  const [floatingBoost, setFloatingBoost] = useState(null);
  const [activeBoosts, setActiveBoosts] = useState([]);

  // Spawn a floating boost every 3-5 minutes
  useEffect(() => {
    const scheduleNext = () => {
      const delay = (180 + Math.random() * 120) * 1000;
      return setTimeout(() => {
        const boostType = BOOST_TYPES[Math.floor(Math.random() * BOOST_TYPES.length)];
        setFloatingBoost({
          ...boostType,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 40,
        });
        setTimeout(() => setFloatingBoost(null), 10000);
        timer = scheduleNext();
      }, delay);
    };
    let timer = scheduleNext();
    return () => clearTimeout(timer);
  }, []);

  const handleClaim = useCallback(() => {
    if (!floatingBoost) return;
    const boost = { ...floatingBoost, expiresAt: Date.now() + floatingBoost.duration * 1000 };
    setActiveBoosts(prev => [...prev, boost]);
    setFloatingBoost(null);
    if (onActivateBoost) onActivateBoost(boost);
  }, [floatingBoost, onActivateBoost]);

  // Clean up expired boosts
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBoosts(prev => prev.filter(b => b.expiresAt > Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Floating boost pickup */}
      <AnimatePresence>
        {floatingBoost && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' } }}
            onClick={handleClaim}
            className="fixed z-30 cursor-pointer focus:outline-none"
            style={{ left: `${floatingBoost.x}%`, top: `${floatingBoost.y}%` }}
          >
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all"
              style={{
                backgroundColor: '#1a1d23',
                border: `2px solid ${floatingBoost.color}50`,
                boxShadow: `0 0 20px ${floatingBoost.color}15, 0 4px 15px rgba(0,0,0,0.4)`,
              }}
            >
              <floatingBoost.IconComponent size={24} />
              <div>
                <div className="text-xs font-bold" style={{ color: floatingBoost.color }}>
                  {floatingBoost.name}
                </div>
                <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Click to activate!
                </div>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Active boosts HUD */}
      {activeBoosts.length > 0 && (
        <div className="fixed top-16 right-4 z-30 space-y-1.5">
          <AnimatePresence>
            {activeBoosts.map((boost, i) => {
              const remaining = Math.max(0, Math.ceil((boost.expiresAt - Date.now()) / 1000));
              const BoostIcon = BOOST_TYPES.find(b => b.id === boost.id)?.IconComponent;

              return (
                <motion.div
                  key={`${boost.id}-${i}`}
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 60, opacity: 0 }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: 'rgba(26, 29, 35, 0.92)',
                    border: `1px solid ${boost.color}25`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {BoostIcon && <BoostIcon size={16} />}
                  <span className="text-xs font-bold" style={{ color: boost.color }}>
                    {boost.name}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {remaining}s
                  </span>
                  {/* Timer bar */}
                  <div className="w-12 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: boost.color }}
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: boost.duration, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
