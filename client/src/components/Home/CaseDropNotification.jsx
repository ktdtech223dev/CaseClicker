import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RARITY_STYLES = {
  common: { accent: '#4b69ff', glow: 'rgba(75, 105, 255, 0.15)', label: 'Common' },
  rare: { accent: '#8847ff', glow: 'rgba(136, 71, 255, 0.15)', label: 'Rare' },
  legendary: { accent: '#e4b900', glow: 'rgba(228, 185, 0, 0.15)', label: 'Legendary' },
};

function CaseIcon({ color }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      {/* Case body */}
      <rect x="3" y="10" width="26" height="18" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}10`} />
      {/* Handle */}
      <path d="M10 10V8a2 2 0 012-2h8a2 2 0 012 2v2" stroke={color} strokeWidth="1.5" />
      {/* Latch line */}
      <line x1="3" y1="17" x2="29" y2="17" stroke={color} strokeWidth="1" opacity="0.4" />
      {/* Lock */}
      <rect x="14" y="14" width="4" height="5" rx="1" fill={color} opacity="0.3" />
      <circle cx="16" cy="16.5" r="0.8" fill={color} />
    </svg>
  );
}

export default function CaseDropNotification({ caseDrop, onDismiss }) {
  if (!caseDrop) return null;

  const rarity = caseDrop.rarity || 'common';
  const style = RARITY_STYLES[rarity] || RARITY_STYLES.common;

  return (
    <AnimatePresence>
      {caseDrop && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 250 }}
          className="fixed top-20 right-4 z-40 rounded-xl p-4 cursor-pointer max-w-xs"
          style={{
            backgroundColor: '#1a1d23',
            border: `1px solid ${style.accent}40`,
            boxShadow: `0 0 30px ${style.glow}, 0 4px 20px rgba(0,0,0,0.4)`,
          }}
          onClick={onDismiss}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${style.accent}10` }}
            >
              <CaseIcon color={style.accent} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: style.accent }}>
                {style.label} Drop!
              </div>
              <div className="text-sm text-white font-medium">
                {caseDrop.name}
              </div>
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Added to your case inventory
              </div>
            </div>
          </div>

          {/* Dismiss hint */}
          <div className="text-[9px] text-right mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Click to dismiss
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
