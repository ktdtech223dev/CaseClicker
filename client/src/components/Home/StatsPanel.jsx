import React from 'react';
import { motion } from 'framer-motion';
import { formatPrice, formatLargeNumber } from '../../utils/helpers';

const STAT_CONFIGS = [
  { key: 'totalEarned', label: 'TOTAL EARNED', color: '#e4b900', icon: 'dollar' },
  { key: 'perClick', label: 'PER CLICK', color: '#4CAF50', icon: 'click' },
  { key: 'perSecond', label: 'PER SECOND', color: '#4b69ff', icon: 'auto' },
  { key: 'totalClicks', label: 'TOTAL CLICKS', color: '#b0b8c4', icon: 'target' },
  { key: 'casesDropped', label: 'CASES DROPPED', color: '#8847ff', icon: 'case' },
  { key: 'rank', label: 'RANK', color: '#eb4b4b', icon: 'rank' },
];

function StatIcon({ type, color }) {
  const props = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: color, strokeWidth: 1.5 };

  switch (type) {
    case 'dollar':
      return (
        <svg {...props}>
          <path d="M8 1v14M5 4h4.5a2 2 0 010 4H5.5a2 2 0 000 4H11" />
        </svg>
      );
    case 'click':
      return (
        <svg {...props}>
          <path d="M6 2v5H1l7 7V9h5L6 2z" fill={color} opacity="0.3" />
          <path d="M6 2v5H1l7 7V9h5L6 2z" />
        </svg>
      );
    case 'auto':
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4v4l3 2" />
        </svg>
      );
    case 'target':
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="6" />
          <circle cx="8" cy="8" r="2" fill={color} opacity="0.4" />
          <line x1="8" y1="1" x2="8" y2="4" />
          <line x1="8" y1="12" x2="8" y2="15" />
          <line x1="1" y1="8" x2="4" y2="8" />
          <line x1="12" y1="8" x2="15" y2="8" />
        </svg>
      );
    case 'case':
      return (
        <svg {...props}>
          <rect x="2" y="4" width="12" height="9" rx="1" />
          <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <circle cx="8" cy="8" r="1" fill={color} />
        </svg>
      );
    case 'rank':
      return (
        <svg {...props}>
          <path d="M8 1l2 4.5 5 .7-3.6 3.5.9 5L8 12.5 3.7 14.7l.9-5L1 6.2l5-.7L8 1z" fill={color} opacity="0.2" />
          <path d="M8 1l2 4.5 5 .7-3.6 3.5.9 5L8 12.5 3.7 14.7l.9-5L1 6.2l5-.7L8 1z" />
        </svg>
      );
    default:
      return null;
  }
}

function StatCard({ label, value, color, iconType }) {
  return (
    <div
      className="rounded-lg p-3 transition-colors duration-200"
      style={{
        backgroundColor: '#13151a',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <StatIcon type={iconType} color={color} />
        <span className="text-[10px] tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {label}
        </span>
      </div>
      <motion.div
        key={value}
        initial={{ y: -3, opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="text-lg font-bold font-mono"
        style={{ color }}
      >
        {value}
      </motion.div>
    </div>
  );
}

export default function StatsPanel({ player, rank }) {
  const totalEarned = player?.total_earned || 0;
  const clickValue = (player?.click_value || 0.01) * (player?.prestige_multiplier || 1) * (1 + (player?.global_multiplier || 0));
  const autoIncome = (player?.auto_income || 0) * (player?.prestige_multiplier || 1) * (1 + (player?.global_multiplier || 0));

  const statValues = {
    totalEarned: formatLargeNumber(totalEarned),
    perClick: formatPrice(clickValue),
    perSecond: formatPrice(autoIncome),
    totalClicks: (player?.total_clicks || 0).toLocaleString(),
    casesDropped: (player?.cases_dropped || 0).toString(),
    rank: rank?.name || 'Unranked',
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
      {STAT_CONFIGS.map(cfg => (
        <StatCard
          key={cfg.key}
          label={cfg.label}
          value={statValues[cfg.key]}
          color={cfg.color}
          iconType={cfg.icon}
        />
      ))}
    </div>
  );
}
