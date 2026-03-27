import React from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { formatPrice } from '../../utils/helpers';

export default function TopBar() {
  const { activePlayer, setActivePlayer } = useGameStore();

  const handleLogout = () => {
    localStorage.removeItem('caseclicker_player');
    setActivePlayer(null);
    window.location.reload();
  };

  if (!activePlayer) return null;

  return (
    <div className="h-14 bg-[#0e1015] border-b border-gray-800/50 flex items-center justify-between px-5 sticky top-0 z-30 flex-shrink-0">
      {/* Player info */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: (activePlayer.color || '#888') + '15',
            color: activePlayer.color,
            border: `1.5px solid ${activePlayer.color}50`,
          }}
        >
          {activePlayer.name?.[0]}
        </div>
        <span className="text-white font-medium text-sm">{activePlayer.name}</span>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-400 text-xs transition ml-1"
        >
          Switch
        </button>
      </div>

      {/* Wallet */}
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-xs font-medium">BAL</span>
        <motion.span
          key={activePlayer.wallet}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-yellow-400 font-mono font-bold text-base"
        >
          {formatPrice(activePlayer.wallet)}
        </motion.span>
      </div>
    </div>
  );
}
