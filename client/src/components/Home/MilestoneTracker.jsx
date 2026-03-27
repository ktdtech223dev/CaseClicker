import React from 'react';
import { motion } from 'framer-motion';
import { formatLargeNumber } from '../../utils/helpers';

function MilestoneBar({ label, current, target, color, accentColor }) {
  const pct = Math.min((current / target) * 100, 100);
  const pctDisplay = pct.toFixed(1);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {/* Arrow icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={accentColor} strokeWidth="1.5">
            <path d="M2 6h8M7 3l3 3-3 3" />
          </svg>
          <span className="text-xs font-medium" style={{ color: accentColor }}>
            {label}
          </span>
        </div>
        <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {formatLargeNumber(current)} / {formatLargeNumber(target)}
        </span>
      </div>

      <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${accentColor})`,
            boxShadow: `0 0 8px ${accentColor}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            animation: 'shimmer 2s infinite',
          }}
        />
      </div>

      <div className="text-right mt-1">
        <span className="text-[10px] font-mono font-bold" style={{ color: accentColor }}>
          {pctDisplay}%
        </span>
      </div>
    </div>
  );
}

export default function MilestoneTracker({ player, nextRank, nextTier }) {
  const lifetimeEarned = player?.lifetime_earned || 0;

  if (!nextRank && !nextTier) return null;

  return (
    <div
      className="flex gap-6 mb-4 rounded-lg p-3"
      style={{
        backgroundColor: '#13151a',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {nextRank && (
        <MilestoneBar
          label={`Next Rank: ${nextRank.name}`}
          current={lifetimeEarned}
          target={nextRank.requirement}
          color="#eb4b4b"
          accentColor="#eb4b4b"
        />
      )}
      {nextTier && (
        <MilestoneBar
          label={`Unlock: ${nextTier.name} Tier`}
          current={lifetimeEarned}
          target={nextTier.unlockAt}
          color="#4b1d8e"
          accentColor="#8847ff"
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
