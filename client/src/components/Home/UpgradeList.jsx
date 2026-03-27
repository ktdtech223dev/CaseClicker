import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UPGRADES, UPGRADE_TIERS, getUpgradeCost } from '../../data/upgrades';
import { formatPrice, formatLargeNumber } from '../../utils/helpers';

const TIER_COLORS = {
  silver: { accent: '#b0b8c4', bg: 'rgba(176, 184, 196, 0.05)', border: 'rgba(176, 184, 196, 0.15)' },
  gold_nova: { accent: '#e4b900', bg: 'rgba(228, 185, 0, 0.05)', border: 'rgba(228, 185, 0, 0.15)' },
  master_guardian: { accent: '#4b69ff', bg: 'rgba(75, 105, 255, 0.05)', border: 'rgba(75, 105, 255, 0.15)' },
  global_elite: { accent: '#eb4b4b', bg: 'rgba(235, 75, 75, 0.05)', border: 'rgba(235, 75, 75, 0.15)' },
};

function LockIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.2">
      <rect x="3" y="6" width="8" height="6" rx="1" />
      <path d="M5 6V4a2 2 0 014 0v2" />
      <circle cx="7" cy="9.5" r="0.8" fill={color} />
    </svg>
  );
}

function UpgradeTypeIcon({ type, color }) {
  if (type === 'click') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.3">
        <circle cx="8" cy="8" r="5" />
        <circle cx="8" cy="8" r="1.5" fill={color} opacity="0.5" />
        <line x1="8" y1="1" x2="8" y2="4" />
        <line x1="8" y1="12" x2="8" y2="15" />
        <line x1="1" y1="8" x2="4" y2="8" />
        <line x1="12" y1="8" x2="15" y2="8" />
      </svg>
    );
  }
  if (type === 'auto') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.3">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4v4l2.5 1.5" />
        <circle cx="8" cy="8" r="1" fill={color} opacity="0.4" />
      </svg>
    );
  }
  if (type === 'multiplier') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.3">
        <line x1="4" y1="4" x2="12" y2="12" />
        <line x1="12" y1="4" x2="4" y2="12" />
        <circle cx="4" cy="4" r="1.5" fill={color} opacity="0.3" />
        <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.3" />
      </svg>
    );
  }
  return null;
}

function ChevronIcon({ expanded, color }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5"
      style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M3 5l4 4 4-4" />
    </svg>
  );
}

export default function UpgradeList({ player, upgradeLevels, onPurchase }) {
  const [expandedTier, setExpandedTier] = useState('silver');
  const lifetimeEarned = player?.lifetime_earned || 0;
  const wallet = player?.wallet || 0;

  const upgradeEntries = Object.entries(UPGRADES);

  return (
    <div className="space-y-2">
      <h2
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        Upgrades
      </h2>

      {UPGRADE_TIERS.map(tier => {
        const isUnlocked = lifetimeEarned >= tier.unlockAt;
        const isExpanded = expandedTier === tier.id;
        const tierUpgrades = upgradeEntries.filter(([, u]) => u.tier === tier.id);
        const colors = TIER_COLORS[tier.id] || TIER_COLORS.silver;

        return (
          <div
            key={tier.id}
            className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${isUnlocked ? colors.border : 'rgba(255,255,255,0.03)'}` }}
          >
            {/* Tier header */}
            <button
              onClick={() => isUnlocked && setExpandedTier(isExpanded ? null : tier.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
              style={{
                backgroundColor: isUnlocked ? colors.bg : 'rgba(13, 15, 19, 0.8)',
                opacity: isUnlocked ? 1 : 0.5,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
              }}
              disabled={!isUnlocked}
            >
              <div className="flex items-center gap-2.5">
                {!isUnlocked && <LockIcon color="rgba(255,255,255,0.25)" />}
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: isUnlocked ? colors.accent : 'rgba(255,255,255,0.25)' }}
                >
                  {tier.name}
                </span>
                {!isUnlocked && (
                  <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Unlock at {formatLargeNumber(tier.unlockAt)} lifetime
                  </span>
                )}
                {isUnlocked && (
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {tierUpgrades.length} upgrades
                  </span>
                )}
              </div>
              {isUnlocked && <ChevronIcon expanded={isExpanded} color={colors.accent} />}
            </button>

            {/* Upgrade cards grid */}
            <AnimatePresence>
              {isExpanded && isUnlocked && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1">
                    {tierUpgrades.map(([id, upgrade]) => {
                      const level = upgradeLevels[id] || 0;
                      const cost = getUpgradeCost(id, level);
                      const canAfford = wallet >= cost;

                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors"
                          style={{
                            backgroundColor: '#0f1015',
                            borderLeft: `2px solid ${canAfford ? colors.accent : 'rgba(255,255,255,0.05)'}`,
                          }}
                        >
                          {/* Icon */}
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${colors.accent}10` }}
                          >
                            <UpgradeTypeIcon type={upgrade.type} color={colors.accent} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-medium truncate">
                                {upgrade.name}
                              </span>
                              {level > 0 && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold flex-shrink-0"
                                  style={{
                                    backgroundColor: `${colors.accent}15`,
                                    color: colors.accent,
                                  }}
                                >
                                  Lv.{level}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              {upgrade.desc}
                            </div>
                          </div>

                          {/* Buy button */}
                          <motion.button
                            whileHover={canAfford ? { scale: 1.05 } : {}}
                            whileTap={canAfford ? { scale: 0.95 } : {}}
                            onClick={() => canAfford && onPurchase(id)}
                            disabled={!canAfford}
                            className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                            style={{
                              backgroundColor: canAfford ? `${colors.accent}15` : 'rgba(255,255,255,0.03)',
                              color: canAfford ? colors.accent : 'rgba(255,255,255,0.15)',
                              border: `1px solid ${canAfford ? `${colors.accent}30` : 'rgba(255,255,255,0.05)'}`,
                              cursor: canAfford ? 'pointer' : 'not-allowed',
                            }}
                          >
                            {formatPrice(cost)}
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
