import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';

const colorMap = {
  gold: 'border-csgo-gold bg-csgo-gold/10 text-csgo-gold',
  red: 'border-red-500 bg-red-500/10 text-red-400',
  green: 'border-green-500 bg-green-500/10 text-green-400',
  purple: 'border-csgo-purple bg-csgo-purple/10 text-purple-400',
  blue: 'border-csgo-blue bg-csgo-blue/10 text-blue-400',
};

export default function Notifications() {
  const { notifications } = useGameStore();

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium backdrop-blur-sm ${colorMap[n.color] || colorMap.gold}`}
          >
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
