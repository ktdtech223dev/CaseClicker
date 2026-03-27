import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatLargeNumber } from '../../utils/helpers';

function RankStar({ filled, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.3 3.4 12l.7-4L1.2 5.2l4-.6L7 1z"
        fill={filled ? '#e4b900' : 'rgba(255,255,255,0.08)'}
        stroke={filled ? '#e4b900' : 'rgba(255,255,255,0.15)'}
        strokeWidth="0.8"
      />
    </svg>
  );
}

function RankIcon({ level }) {
  const starCount = Math.min(level, 5);
  const isMaster = level >= 7;
  const isElite = level >= 15;
  const isGlobal = level >= 18;

  const iconColor = isGlobal ? '#e4b900' : isElite ? '#eb4b4b' : isMaster ? '#4b69ff' : '#b0b8c4';

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Shield / badge */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        {/* Shield shape */}
        <path
          d="M18 3L5 9v9c0 8 5.5 14 13 17 7.5-3 13-9 13-17V9L18 3z"
          fill={`${iconColor}15`}
          stroke={iconColor}
          strokeWidth="1.5"
        />
        {/* Inner detail */}
        <path
          d="M18 8l-8 4v5.5c0 5.5 3.5 9.5 8 11.5 4.5-2 8-6 8-11.5V12l-8-4z"
          fill={`${iconColor}08`}
          stroke={iconColor}
          strokeWidth="0.5"
          opacity="0.5"
        />
        {/* Center symbol */}
        {isGlobal ? (
          <g>
            <circle cx="18" cy="17" r="5" fill="none" stroke={iconColor} strokeWidth="1.2" />
            <path d="M14 17h8M18 13v8M15.2 14.2l5.6 5.6M20.8 14.2l-5.6 5.6" stroke={iconColor} strokeWidth="0.6" opacity="0.5" />
          </g>
        ) : isElite ? (
          <g>
            <path d="M18 11l2 4 4.5.7-3.3 3.2.8 4.5L18 21l-4 2.4.8-4.5-3.3-3.2 4.5-.7 2-4z" fill={iconColor} opacity="0.4" />
            <path d="M18 11l2 4 4.5.7-3.3 3.2.8 4.5L18 21l-4 2.4.8-4.5-3.3-3.2 4.5-.7 2-4z" stroke={iconColor} strokeWidth="0.8" />
          </g>
        ) : (
          <g>
            <line x1="18" y1="11" x2="18" y2="23" stroke={iconColor} strokeWidth="1" opacity="0.4" />
            <line x1="12" y1="17" x2="24" y2="17" stroke={iconColor} strokeWidth="1" opacity="0.4" />
            <circle cx="18" cy="17" r="2.5" fill={iconColor} opacity="0.3" />
          </g>
        )}
      </svg>

      {/* Stars row */}
      {starCount > 0 && (
        <div className="flex gap-0.5">
          {Array.from({ length: Math.min(starCount, 5) }).map((_, i) => (
            <RankStar key={i} filled size={10} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrestigePanel({ player, currentRank, nextRank, onPrestige }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const lifetimeEarned = player?.lifetime_earned || 0;
  const canPrestige = nextRank && lifetimeEarned >= nextRank.requirement;
  const prestigeLevel = player?.prestige_level || 0;
  const progressPct = nextRank ? Math.min((lifetimeEarned / nextRank.requirement) * 100, 100) : 100;

  return (
    <div
      className="rounded-lg p-4 mt-4"
      style={{
        backgroundColor: '#13151a',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <RankIcon level={prestigeLevel} />
          <div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Current Rank
            </div>
            <div className="text-lg font-bold" style={{ color: '#eb4b4b' }}>
              {currentRank?.name || 'Unranked'}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {currentRank?.multiplier ? `${currentRank.multiplier}x income multiplier` : 'No multiplier'}
            </div>
          </div>
        </div>

        {nextRank && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Next Rank
            </div>
            <div className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {nextRank.name}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {nextRank.multiplier}x multiplier
            </div>
          </div>
        )}
      </div>

      {nextRank && (
        <>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] mb-1.5">
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Lifetime Earned</span>
              <span className="font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {formatLargeNumber(lifetimeEarned)} / {formatLargeNumber(nextRank.requirement)}
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #eb4b4b, #e4b900)',
                  boxShadow: '0 0 10px rgba(235, 75, 75, 0.3)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-[10px] font-mono font-bold" style={{ color: '#eb4b4b' }}>
                {progressPct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Rank up button */}
          <motion.button
            whileHover={canPrestige ? { scale: 1.01 } : {}}
            whileTap={canPrestige ? { scale: 0.98 } : {}}
            onClick={() => canPrestige && setShowConfirm(true)}
            disabled={!canPrestige}
            className="w-full mt-3 py-2.5 rounded-lg font-bold text-sm transition-all"
            style={canPrestige ? {
              background: 'linear-gradient(90deg, #eb4b4b, #e4b900)',
              color: '#0f0f0f',
              boxShadow: '0 0 20px rgba(228, 185, 0, 0.2)',
            } : {
              backgroundColor: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.2)',
              cursor: 'not-allowed',
            }}
          >
            {canPrestige
              ? `RANK UP to ${nextRank.name}`
              : `Need ${formatLargeNumber(nextRank.requirement)} lifetime earned`}
          </motion.button>
        </>
      )}

      {!nextRank && (
        <div className="mt-4 text-center py-2">
          <span className="text-sm font-bold" style={{ color: '#e4b900' }}>
            MAX RANK ACHIEVED
          </span>
        </div>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="rounded-xl p-6 max-w-md mx-4"
              style={{
                backgroundColor: '#1a1d23',
                border: '1px solid rgba(235, 75, 75, 0.3)',
                boxShadow: '0 0 40px rgba(235, 75, 75, 0.1)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <RankIcon level={prestigeLevel + 1} />
                <h3 className="text-xl font-bold" style={{ color: '#eb4b4b' }}>
                  Rank Up to {nextRank.name}?
                </h3>
              </div>

              <div className="space-y-3 text-sm mb-5">
                <div>
                  <div className="font-medium mb-1" style={{ color: '#4CAF50' }}>You will gain:</div>
                  <div className="ml-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {nextRank.multiplier}x permanent income multiplier
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-1" style={{ color: '#eb4b4b' }}>This will reset:</div>
                  <div className="ml-3 space-y-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <div>Wallet (back to $10)</div>
                    <div>All upgrades (back to level 0)</div>
                    <div>Click value and auto-income</div>
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-1" style={{ color: '#4b69ff' }}>Kept safe:</div>
                  <div className="ml-3 space-y-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <div>Inventory (all your skins)</div>
                    <div>Achievements</div>
                    <div>Lifetime stats</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onPrestige(); setShowConfirm(false); }}
                  className="flex-1 py-2.5 rounded-lg font-bold transition-all"
                  style={{
                    background: 'linear-gradient(90deg, #eb4b4b, #e4b900)',
                    color: '#0f0f0f',
                  }}
                >
                  RANK UP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
