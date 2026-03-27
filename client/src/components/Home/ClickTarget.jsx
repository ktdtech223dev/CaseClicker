import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ClickTarget({ onClick, clickValue }) {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = (e) => {
    setClickCount(c => c + 1);
    if (onClick) onClick(e);
  };

  return (
    <div className="flex flex-col items-center select-none">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.90 }}
        onClick={handleClick}
        className="relative w-52 h-52 rounded-full flex items-center justify-center cursor-pointer focus:outline-none group"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(228, 185, 0, 0.4)',
            boxShadow: '0 0 20px rgba(228, 185, 0, 0.1), inset 0 0 20px rgba(228, 185, 0, 0.05)',
          }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(228, 185, 0, 0.1), inset 0 0 20px rgba(228, 185, 0, 0.05)',
              '0 0 35px rgba(228, 185, 0, 0.25), inset 0 0 30px rgba(228, 185, 0, 0.1)',
              '0 0 20px rgba(228, 185, 0, 0.1), inset 0 0 20px rgba(228, 185, 0, 0.05)',
            ],
            borderColor: [
              'rgba(228, 185, 0, 0.4)',
              'rgba(228, 185, 0, 0.7)',
              'rgba(228, 185, 0, 0.4)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Second ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: '6px',
            border: '1px solid rgba(228, 185, 0, 0.15)',
          }}
        />

        {/* Inner background disc */}
        <div
          className="absolute rounded-full transition-colors duration-200"
          style={{
            inset: '12px',
            background: 'radial-gradient(circle at 40% 35%, #1e2128, #0f1015)',
          }}
        />

        {/* CS:GO Crosshair / Bomb hybrid SVG */}
        <svg
          viewBox="0 0 120 120"
          className="absolute transition-colors duration-200"
          style={{ width: '140px', height: '140px' }}
        >
          {/* Outer targeting ring */}
          <circle
            cx="60" cy="60" r="48"
            fill="none"
            stroke="rgba(228, 185, 0, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Mid ring */}
          <circle
            cx="60" cy="60" r="36"
            fill="none"
            stroke="rgba(228, 185, 0, 0.35)"
            strokeWidth="1.5"
          />

          {/* Inner targeting circle */}
          <circle
            cx="60" cy="60" r="14"
            fill="none"
            stroke="#e4b900"
            strokeWidth="2"
            className="group-hover:stroke-[#ffd700]"
          />

          {/* Center dot */}
          <circle cx="60" cy="60" r="3" fill="#e4b900" className="group-hover:fill-[#ffd700]" />

          {/* Crosshair lines - top */}
          <line x1="60" y1="10" x2="60" y2="42" stroke="#e4b900" strokeWidth="2" opacity="0.8" className="group-hover:opacity-100" />
          {/* Crosshair lines - bottom */}
          <line x1="60" y1="78" x2="60" y2="110" stroke="#e4b900" strokeWidth="2" opacity="0.8" className="group-hover:opacity-100" />
          {/* Crosshair lines - left */}
          <line x1="10" y1="60" x2="42" y2="60" stroke="#e4b900" strokeWidth="2" opacity="0.8" className="group-hover:opacity-100" />
          {/* Crosshair lines - right */}
          <line x1="78" y1="60" x2="110" y2="60" stroke="#e4b900" strokeWidth="2" opacity="0.8" className="group-hover:opacity-100" />

          {/* Tick marks on crosshair */}
          <line x1="56" y1="28" x2="64" y2="28" stroke="#e4b900" strokeWidth="1" opacity="0.4" />
          <line x1="56" y1="92" x2="64" y2="92" stroke="#e4b900" strokeWidth="1" opacity="0.4" />
          <line x1="28" y1="56" x2="28" y2="64" stroke="#e4b900" strokeWidth="1" opacity="0.4" />
          <line x1="92" y1="56" x2="92" y2="64" stroke="#e4b900" strokeWidth="1" opacity="0.4" />

          {/* Corner brackets - top left */}
          <polyline points="22,35 22,22 35,22" fill="none" stroke="rgba(228, 185, 0, 0.3)" strokeWidth="1.5" />
          {/* Corner brackets - top right */}
          <polyline points="85,22 98,22 98,35" fill="none" stroke="rgba(228, 185, 0, 0.3)" strokeWidth="1.5" />
          {/* Corner brackets - bottom left */}
          <polyline points="22,85 22,98 35,98" fill="none" stroke="rgba(228, 185, 0, 0.3)" strokeWidth="1.5" />
          {/* Corner brackets - bottom right */}
          <polyline points="85,98 98,98 98,85" fill="none" stroke="rgba(228, 185, 0, 0.3)" strokeWidth="1.5" />

          {/* Small bomb icon in center-bottom area */}
          <g transform="translate(60, 60)" opacity="0.25">
            <circle cx="0" cy="4" r="7" fill="none" stroke="#e4b900" strokeWidth="1" />
            <line x1="0" y1="-3" x2="2" y2="-8" stroke="#e4b900" strokeWidth="1" />
            <circle cx="2.5" cy="-9.5" r="1.5" fill="#e4b900" opacity="0.6" />
          </g>
        </svg>

        {/* Flash effect on click */}
        <motion.div
          key={clickCount}
          initial={{ opacity: 0.5, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(228, 185, 0, 0.3), transparent 70%)' }}
        />
      </motion.button>

      {/* Click value display */}
      <div className="mt-3 text-center">
        <div
          className="text-sm font-bold tracking-widest"
          style={{ color: '#e4b900' }}
        >
          CLICK
        </div>
        <div
          className="text-xs font-mono mt-0.5"
          style={{ color: 'rgba(228, 185, 0, 0.55)' }}
        >
          +${clickValue?.toFixed(2) || '0.01'}
        </div>
      </div>
    </div>
  );
}
