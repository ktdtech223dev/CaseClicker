import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../utils/helpers';

function WalletIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="14" width="36" height="26" rx="3" stroke="#e4b900" strokeWidth="2" fill="rgba(228, 185, 0, 0.08)" />
      <path d="M6 14V12a4 4 0 014-4h24a4 4 0 014 4v2" stroke="#e4b900" strokeWidth="2" />
      <rect x="30" y="23" width="12" height="8" rx="2" fill="rgba(228, 185, 0, 0.15)" stroke="#e4b900" strokeWidth="1.5" />
      <circle cx="35" cy="27" r="2" fill="#e4b900" />
      {/* Dollar sign lines */}
      <path d="M20 20v8M17.5 22h3.5a1.5 1.5 0 010 3h-2a1.5 1.5 0 000 3H22" stroke="#e4b900" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export default function OfflineEarningsModal({ show, earned, elapsed, onClose }) {
  if (!show || !earned || earned <= 0) return null;

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="rounded-xl p-8 max-w-sm mx-4 text-center"
            style={{
              backgroundColor: '#1a1d23',
              border: '1px solid rgba(228, 185, 0, 0.2)',
              boxShadow: '0 0 60px rgba(228, 185, 0, 0.08)',
            }}
          >
            <div className="flex justify-center mb-4">
              <WalletIcon />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Welcome Back
            </h3>

            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              You were away for {timeStr}
            </p>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-3xl font-bold font-mono mb-4"
              style={{
                color: '#e4b900',
                textShadow: '0 0 20px rgba(228, 185, 0, 0.3)',
              }}
            >
              +{formatPrice(earned)}
            </motion.div>

            <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Earned at 50% offline efficiency
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-3 rounded-lg font-bold text-sm transition-all"
              style={{
                background: 'linear-gradient(90deg, #e4b900, #d4a800)',
                color: '#0f0f0f',
                boxShadow: '0 0 20px rgba(228, 185, 0, 0.15)',
              }}
            >
              Collect
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
