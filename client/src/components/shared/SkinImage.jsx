import React, { useState, useEffect } from 'react';
import { getRarityColor, getWeaponName, getFinishName, resolveImageFromServer } from '../../utils/helpers';

// Weapon type icons (emoji fallbacks)
const WEAPON_ICONS = {
  'AK-47': '🔫', 'M4A4': '🔫', 'M4A1-S': '🔫', 'AWP': '🎯',
  'Desert Eagle': '🔫', 'Glock-18': '🔫', 'USP-S': '🔫', 'P250': '🔫',
  'Five-SeveN': '🔫', 'Tec-9': '🔫', 'CZ75-Auto': '🔫', 'P2000': '🔫',
  'R8 Revolver': '🔫', 'Dual Berettas': '🔫',
  'MAC-10': '💥', 'MP9': '💥', 'MP7': '💥', 'MP5-SD': '💥',
  'UMP-45': '💥', 'PP-Bizon': '💥', 'P90': '💥',
  'FAMAS': '🔫', 'Galil AR': '🔫', 'SSG 08': '🎯', 'SG 553': '🔫',
  'AUG': '🔫', 'SCAR-20': '🎯', 'G3SG1': '🎯',
  'Nova': '💣', 'XM1014': '💣', 'MAG-7': '💣', 'Sawed-Off': '💣',
  'M249': '💥', 'Negev': '💥', 'Zeus x27': '⚡',
  '★': '🔪',
};

function getIcon(name) {
  if (!name) return '📦';
  if (name.startsWith('★')) return '🔪';
  const weapon = getWeaponName(name);
  return WEAPON_ICONS[weapon] || '🔫';
}

function Placeholder({ name, rarity, className, size }) {
  const sizeClasses = { sm: 'h-14', md: 'h-20', lg: 'h-32', xl: 'h-48' };
  const color = getRarityColor(rarity);
  const weapon = getWeaponName(name);
  const finish = getFinishName(name);
  const icon = getIcon(name);
  const iconSize = size === 'xl' ? 'text-5xl' : size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  const textSize = size === 'xl' ? 'text-sm' : size === 'lg' ? 'text-xs' : 'text-[9px]';

  return (
    <div
      className={`${sizeClasses[size]} w-full flex flex-col items-center justify-center rounded-lg ${className}`}
      style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)`, border: `1px solid ${color}30` }}
    >
      <span className={iconSize}>{icon}</span>
      <span className={`${textSize} font-bold text-center px-1 truncate max-w-full`} style={{ color }}>
        {weapon}
      </span>
      {finish && (
        <span className={`${textSize} text-gray-500 text-center px-1 truncate max-w-full`}>
          {finish}
        </span>
      )}
    </div>
  );
}

export default function SkinImage({ src, name, rarity, className = '', size = 'md' }) {
  const [imageSrc, setImageSrc] = useState(src || null);
  const [failed, setFailed] = useState(false);
  const [tried, setTried] = useState(false);

  // If no src provided, try to resolve from server
  useEffect(() => {
    if (!src && name && !tried) {
      setTried(true);
      resolveImageFromServer(name).then(url => {
        if (url) setImageSrc(url);
      });
    }
  }, [src, name, tried]);

  // Update if src prop changes (e.g. parent re-fetched data)
  useEffect(() => {
    if (src && src !== imageSrc) {
      setImageSrc(src);
      setFailed(false);
    }
  }, [src]);

  const sizeClasses = { sm: 'h-14', md: 'h-20', lg: 'h-32', xl: 'h-48' };

  if (failed || !imageSrc) {
    return <Placeholder name={name} rarity={rarity} className={className} size={size} />;
  }

  return (
    <img
      src={imageSrc}
      alt={name || 'Skin'}
      className={`${sizeClasses[size]} w-full object-contain ${className}`}
      loading="lazy"
      onError={() => {
        setFailed(true);
        // Try server fallback on image load error
        if (name && !tried) {
          setTried(true);
          resolveImageFromServer(name).then(url => {
            if (url && url !== imageSrc) {
              setImageSrc(url);
              setFailed(false);
            }
          });
        }
      }}
    />
  );
}

export function CaseImage({ src, name, className = '' }) {
  const [imageSrc, setImageSrc] = useState(src || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (src && src !== imageSrc) {
      setImageSrc(src);
      setFailed(false);
    }
  }, [src]);

  if (failed || !imageSrc) {
    return (
      <div className={`flex flex-col items-center justify-center h-full w-full ${className}`}>
        <span className="text-4xl mb-2">📦</span>
        <span className="text-xs text-gray-400 text-center px-2">{name}</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={name || 'Case'}
      className={`max-h-32 object-contain ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
