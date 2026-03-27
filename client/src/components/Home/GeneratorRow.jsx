import React from 'react';
import { motion } from 'framer-motion';
import { UPGRADES } from '../../data/upgrades';

function AutoIncomeIcon({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.2">
      <circle cx="6" cy="6" r="4.5" />
      <path d="M6 3v3l2 1.2" />
    </svg>
  );
}

function WeaponBadge({ name, label, level, income }) {
  const incomeStr = income >= 1000 ? `${(income / 1000).toFixed(1)}K` : income.toFixed(2);

  return (
    <motion.div
      className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
      style={{
        backgroundColor: 'rgba(75, 105, 255, 0.06)',
        border: '1px solid rgba(75, 105, 255, 0.12)',
      }}
      title={`${name} Lv.${level} -- $${incomeStr}/sec`}
    >
      {/* Pulsing indicator dot */}
      <motion.div
        className="rounded-full"
        style={{
          width: 5,
          height: 5,
          backgroundColor: '#4b69ff',
          boxShadow: '0 0 4px #4b69ff',
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <span className="text-[10px] font-bold" style={{ color: '#4b69ff' }}>
        {label}
      </span>

      <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
        x{level}
      </span>

      <span className="text-[9px] font-mono" style={{ color: 'rgba(75, 105, 255, 0.6)' }}>
        ${incomeStr}/s
      </span>
    </motion.div>
  );
}

const WEAPON_LABELS = {
  p250_rounds: 'P250',
  mp9_spray: 'MP9',
  famas_burst: 'FAMAS',
  galil_spray: 'Galil',
  m4a4_spray: 'M4A4',
  sg553_scope: 'SG553',
  aug_zoom: 'AUG',
  scar20_auto: 'SCAR',
  negev_spray: 'Negev',
  dragon_lore: 'DLore',
  howl_power: 'Howl',
  arms_empire: 'Arms',
};

export default function GeneratorRow({ upgradeLevels }) {
  const autoGenerators = Object.entries(UPGRADES)
    .filter(([, u]) => u.type === 'auto')
    .filter(([id]) => (upgradeLevels[id] || 0) > 0)
    .map(([id, u]) => ({
      id,
      name: u.name,
      label: WEAPON_LABELS[id] || id,
      level: upgradeLevels[id] || 0,
      income: u.value * (upgradeLevels[id] || 0),
    }));

  if (autoGenerators.length === 0) return null;

  const totalIncome = autoGenerators.reduce((sum, g) => sum + g.income, 0);
  const totalStr = totalIncome >= 1000 ? `${(totalIncome / 1000).toFixed(1)}K` : totalIncome.toFixed(2);

  return (
    <div className="mt-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <AutoIncomeIcon color="#4b69ff" />
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Auto Generators
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold" style={{ color: '#4b69ff' }}>
          ${totalStr}/sec
        </span>
      </div>

      {/* Generator badges */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {autoGenerators.map(gen => (
          <WeaponBadge
            key={gen.id}
            name={gen.name}
            label={gen.label}
            level={gen.level}
            income={gen.income}
          />
        ))}
      </div>
    </div>
  );
}
