import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../utils/helpers';

const DAILY_REWARDS = [1, 5, 15, 50, 150, 500, 2000];

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4CAF50" strokeWidth="1.5">
      <rect x="2" y="4" width="16" height="14" rx="2" />
      <line x1="2" y1="9" x2="18" y2="9" />
      <line x1="6" y1="2" x2="6" y2="6" />
      <line x1="14" y1="2" x2="14" y2="6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#4CAF50" strokeWidth="2">
      <path d="M2.5 6l2.5 2.5 5-5" />
    </svg>
  );
}

function StarIcon({ size = 10, color = '#e4b900' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill={color} opacity="0.6">
      <path d="M5 0l1.2 3.1 3.3.5-2.4 2.3.6 3.3L5 7.5 2.3 9.2l.6-3.3L.5 3.6l3.3-.5L5 0z" />
    </svg>
  );
}

export default function DailyBonusModal({ show, streak, onClaim, onClose }) {
  if (!show) return null;

  const currentDay = streak + 1;
  const currentReward = DAILY_REWARDS[streak] || DAILY_REWARDS[6];

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
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
            className="rounded-xl p-6 max-w-md mx-4"
            style={{
              backgroundColor: '#1a1d23',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              boxShadow: '0 0 40px rgba(76, 175, 80, 0.08)',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-5">
              <CalendarIcon />
              <h3 className="text-xl font-bold text-white">Daily Bonus</h3>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-2 mb-5">
              {DAILY_REWARDS.map((reward, i) => {
                const day = i + 1;
                const isPast = day < currentDay;
                const isCurrent = day === currentDay;
                const isFuture = day > currentDay;

                let bgColor, borderColor, textColor;
                if (isPast) {
                  bgColor = 'rgba(76, 175, 80, 0.08)';
                  borderColor = 'rgba(76, 175, 80, 0.25)';
                  textColor = '#4CAF50';
                } else if (isCurrent) {
                  bgColor = 'rgba(228, 185, 0, 0.08)';
                  borderColor = 'rgba(228, 185, 0, 0.4)';
                  textColor = '#e4b900';
                } else {
                  bgColor = 'rgba(255,255,255,0.02)';
                  borderColor = 'rgba(255,255,255,0.05)';
                  textColor = 'rgba(255,255,255,0.2)';
                }

                return (
                  <motion.div
                    key={day}
                    animate={isCurrent ? {
                      boxShadow: ['0 0 0px rgba(228, 185, 0, 0)', '0 0 12px rgba(228, 185, 0, 0.2)', '0 0 0px rgba(228, 185, 0, 0)'],
                    } : {}}
                    transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                    className="rounded-lg p-2 text-center"
                    style={{
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <div className="text-[9px] font-bold" style={{ color: textColor }}>
                      Day {day}
                    </div>
                    <div className="text-xs font-mono font-bold mt-1" style={{ color: textColor }}>
                      ${reward}
                    </div>
                    {isPast && (
                      <div className="flex justify-center mt-0.5">
                        <CheckIcon />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="flex justify-center mt-0.5">
                        <StarIcon />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Day {currentDay} reward:{' '}
              <span className="font-bold font-mono" style={{ color: '#e4b900' }}>
                {formatPrice(currentReward)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Later
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClaim}
                className="flex-1 py-2.5 rounded-lg font-bold transition-all"
                style={{
                  background: 'linear-gradient(90deg, #4CAF50, #43a047)',
                  color: 'white',
                  boxShadow: '0 0 15px rgba(76, 175, 80, 0.2)',
                }}
              >
                Claim {formatPrice(currentReward)}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
