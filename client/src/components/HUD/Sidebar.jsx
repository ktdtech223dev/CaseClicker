import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameStore';

// Clean SVG icons for sidebar navigation
const Icons = {
  home: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  cases: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
      <path d="M8 7h4v2H8V7z" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  tradeup: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
  ),
  market: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
  ),
  coinflip: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
    </svg>
  ),
  crash: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
  ),
  roulette: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  jackpot: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v1h14V4a2 2 0 00-2-2H5zM3 7h14v2H3V7zm1 4h12a2 2 0 01-2 2h-1v3a1 1 0 01-1 1H8a1 1 0 01-1-1v-3H6a2 2 0 01-2-2z" clipRule="evenodd" />
    </svg>
  ),
  players: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  wall: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
    </svg>
  ),
  trading: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M8 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM4 9a1 1 0 011-1h10a1 1 0 011 1v1H4V9z" />
      <path fillRule="evenodd" d="M3 6a2 2 0 012-2h1.172a2 2 0 011.414.586l.828.828A2 2 0 009.828 6h.344A2 2 0 0111.586 5.414l.828-.828A2 2 0 0113.828 4H15a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm4 6.5L5 10.5v2l2 2zm6 0l2-2v-2l-2 2z" clipRule="evenodd" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  achievements: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M5 8H3.5a2.5 2.5 0 010-5H5M15 8h1.5a2.5 2.5 0 000-5H15" />
      <path fillRule="evenodd" d="M15 2H5v6a5 5 0 0010 0V2zM8 15.5v1.5c0 .55-.45 1-.98 1.21C5.85 18.75 5 20 5 20h10s-.85-1.25-2.02-1.79A1 1 0 0112 17v-1.5" clipRule="evenodd" />
    </svg>
  ),
  battle: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M3.293 3.293a1 1 0 011.414 0L10 8.586l5.293-5.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
      <path d="M2 4l2-2 3 3-2 2-3-3zM15 17l2-2-3-3-2 2 3 3z" />
    </svg>
  ),
  predictions: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  sports: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  ),
};

const navItems = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/cases', label: 'Cases', icon: 'cases' },
  { path: '/inventory', label: 'Inventory', icon: 'inventory' },
  { path: '/tradeup', label: 'Trade Up', icon: 'tradeup' },
  { path: '/market', label: 'Market', icon: 'market' },
  { type: 'divider', label: 'GAMES' },
  { path: '/games/coinflip', label: 'Coinflip', icon: 'coinflip' },
  { path: '/games/crash', label: 'Crash', icon: 'crash' },
  { path: '/games/roulette', label: 'Roulette', icon: 'roulette' },
  { path: '/games/jackpot', label: 'Jackpot', icon: 'jackpot' },
  { path: '/games/battle', label: 'Battle', icon: 'battle' },
  { path: '/games/predictions', label: 'Predictions', icon: 'predictions' },
  { path: '/games/sports', label: 'Sports', icon: 'sports' },
  { type: 'divider', label: 'SOCIAL' },
  { path: '/wall', label: 'Crew Wall', icon: 'wall' },
  { path: '/trading', label: 'Trading', icon: 'trading' },
  { path: '/players', label: 'Players', icon: 'players' },
  { path: '/achievements', label: 'Achievements', icon: 'achievements' },
  { type: 'divider', label: '' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useGameStore();

  return (
    <motion.aside
      className="fixed left-0 top-[28px] h-[calc(100%-28px)] bg-[#0e1015] border-r border-gray-800/50 z-40 flex flex-col"
      animate={{ width: sidebarOpen ? 220 : 60 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-800/50">
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white rounded transition"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            {sidebarOpen ? (
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            )}
          </svg>
        </button>
        {sidebarOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-yellow-400 font-bold text-sm tracking-[0.2em]"
          >
            CASE SIM
          </motion.span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'divider') {
            return sidebarOpen ? (
              <div key={i} className="px-5 py-2 text-[10px] text-gray-600 uppercase tracking-[0.15em] mt-3 font-semibold">
                {item.label}
              </div>
            ) : (
              <div key={i} className="border-t border-gray-800/30 my-2 mx-3" />
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-all duration-150 ${
                  isActive
                    ? 'bg-yellow-400/10 text-yellow-400'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.03]'
                }`
              }
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {Icons[item.icon]}
              </span>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[13px] font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </motion.aside>
  );
}
