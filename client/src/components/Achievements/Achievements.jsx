import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../../utils/achievements';
import { formatPrice } from '../../utils/helpers';

// SVG icons by category keyword — no emojis
const AchievementIcons = {
  cases: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a4 4 0 00-8 0v2" />
      <line x1="12" y1="11" x2="12" y2="15" />
    </svg>
  ),
  knife: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M14.5 2L22 9.5 13.5 18 6 10.5z" />
      <path d="M6 10.5L2 22l11.5-4" />
      <line x1="9" y1="7" x2="17" y2="15" />
    </svg>
  ),
  glove: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M18 11V6a2 2 0 00-4 0v1M14 7V4a2 2 0 00-4 0v3M10 7V5a2 2 0 00-4 0v6" />
      <path d="M18 11a2 2 0 014 0v1a8 8 0 01-8 8H9a8 8 0 01-3-15.4" />
    </svg>
  ),
  covert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  stattrak: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  souvenir: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22h10c0-2-0.85-3.25-2.03-3.79A1.09 1.09 0 0114 17v-2.34" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  ),
  click: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M9 9V2.99a1 1 0 012 0V9" />
      <path d="M11 9V1.99a1 1 0 012 0V9" />
      <path d="M13 9V3.99a1 1 0 012 0V9" />
      <path d="M15 9V5.99a1 1 0 012 0V11l-2.5 5.5H8L5 12l2-2h2" />
    </svg>
  ),
  speed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  earnings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  coinflip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M8 12h8" />
    </svg>
  ),
  crash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  roulette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  ),
  streak: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  ),
  jackpot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M6 3h12v4l-4 3 4 3v4H6v-4l4-3-4-3V3z" />
      <line x1="6" y1="3" x2="18" y2="3" />
      <line x1="6" y1="21" x2="18" y2="21" />
    </svg>
  ),
  trading: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  tradeup: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <polyline points="18 15 12 9 6 15" />
      <line x1="12" y1="9" x2="12" y2="21" />
      <line x1="4" y1="4" x2="20" y2="4" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  prestige: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M12 15l-3.5 2 1-4L6 10l4-.5L12 6l2 3.5 4 .5-3.5 3 1 4z" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  rank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M2 20h20" />
      <path d="M5 20V10l7-8 7 8v10" />
      <path d="M9 20v-4h6v4" />
    </svg>
  ),
  social: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  daily: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  offline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  spend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  nametag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  sell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  unknown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

// Lock icon overlay
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="currentColor" />
    <path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Category color map
const CATEGORY_COLORS = {
  cases: '#4b69ff',
  clicking: '#e4b900',
  earnings: '#22c55e',
  gambling: '#d32ce6',
  trading: '#f97316',
  inventory: '#3b82f6',
  prestige: '#eab308',
  social: '#06b6d4',
  misc: '#8b5cf6',
};

export default function Achievements() {
  const { activePlayerId, pingNGame } = useGameStore();
  const [unlocked, setUnlocked] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pingNGame({ screen: 'achievements' });
  }, []);

  useEffect(() => {
    if (!activePlayerId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/players/${activePlayerId}/achievements`).then(r => r.json()),
      fetch(`/api/stats/${activePlayerId}`).then(r => r.json()),
    ]).then(([achData, statsData]) => {
      setUnlocked(achData);
      setPlayerStats(statsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activePlayerId]);

  const unlockedMap = useMemo(() => {
    const map = {};
    for (const a of unlocked) {
      map[a.achievement_id] = a;
    }
    return map;
  }, [unlocked]);

  // Compute progress for stat-based achievements
  const getProgress = (achId) => {
    const ach = ACHIEVEMENTS[achId];
    if (!ach || !ach.stat || !playerStats?.player) return null;
    const current = playerStats.player[ach.stat] || 0;
    return { current, target: ach.threshold, pct: Math.min(100, (current / ach.threshold) * 100) };
  };

  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const totalUnlocked = unlocked.length;

  const filteredCategories = activeCategory === 'all'
    ? ACHIEVEMENT_CATEGORIES
    : ACHIEVEMENT_CATEGORIES.filter(c => c.id === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-csgo-gold text-xl animate-pulse">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">ACHIEVEMENTS</h1>
          <p className="text-gray-400 mt-1">
            {totalUnlocked} / {totalAchievements} unlocked
          </p>
        </div>
        <div className="bg-[#1a1d23] border border-gray-800 rounded-xl px-6 py-3">
          <div className="text-sm text-gray-400">Completion</div>
          <div className="text-2xl font-bold text-yellow-400">
            {totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="bg-[#1a1d23] border border-gray-800 rounded-xl p-4 mb-6">
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
              : 'bg-[#1a1d23] text-gray-400 border border-gray-800 hover:text-white'
          }`}
        >
          All ({totalAchievements})
        </button>
        {ACHIEVEMENT_CATEGORIES.map(cat => {
          const catUnlocked = cat.keys.filter(k => unlockedMap[k]).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                  : 'bg-[#1a1d23] text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {cat.label} ({catUnlocked}/{cat.keys.length})
            </button>
          );
        })}
      </div>

      {/* Achievement grid by category */}
      <div className="space-y-8">
        {filteredCategories.map(cat => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat.id] || '#666' }}
              />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">{cat.label}</h2>
              <span className="text-sm text-gray-500">
                {cat.keys.filter(k => unlockedMap[k]).length}/{cat.keys.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {cat.keys.map(achId => {
                const ach = ACHIEVEMENTS[achId];
                if (!ach) return null;
                const isUnlocked = !!unlockedMap[achId];
                const unlockData = unlockedMap[achId];
                const progress = getProgress(achId);
                const catColor = CATEGORY_COLORS[cat.id] || '#666';

                return (
                  <motion.div
                    key={achId}
                    className={`relative rounded-xl border p-4 transition-all ${
                      isUnlocked
                        ? 'bg-[#1a1d23] border-gray-700'
                        : 'bg-[#12141a] border-gray-800/50'
                    }`}
                    style={isUnlocked ? {
                      boxShadow: `0 0 20px ${catColor}15, 0 0 40px ${catColor}08`,
                      borderColor: `${catColor}40`,
                    } : {}}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-3">
                      <div
                        className={`w-10 h-10 ${isUnlocked ? '' : 'opacity-30 grayscale'}`}
                        style={isUnlocked ? { color: catColor } : { color: '#555' }}
                      >
                        {AchievementIcons[ach.icon] || AchievementIcons.unknown}
                      </div>
                    </div>

                    {/* Lock overlay */}
                    {!isUnlocked && (
                      <div className="absolute top-2 right-2 opacity-40">
                        <LockIcon />
                      </div>
                    )}

                    {/* Name & description */}
                    <div className={`text-center ${isUnlocked ? '' : 'opacity-50'}`}>
                      <div className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        {ach.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 leading-tight">
                        {ach.desc}
                      </div>
                    </div>

                    {/* Progress bar for count-based achievements */}
                    {progress && !isUnlocked && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${progress.pct}%`,
                              backgroundColor: catColor,
                              opacity: 0.7,
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-600 text-center mt-1">
                          {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Unlock date */}
                    {isUnlocked && unlockData?.unlocked_at && (
                      <div className="text-[10px] text-center mt-2" style={{ color: catColor }}>
                        {new Date(unlockData.unlocked_at).toLocaleDateString()}
                      </div>
                    )}
                    {isUnlocked && !unlockData?.unlocked_at && (
                      <div className="text-[10px] text-center mt-2" style={{ color: catColor }}>
                        Unlocked
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
