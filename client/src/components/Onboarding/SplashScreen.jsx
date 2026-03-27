import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LS_KEY = 'casesim_splash_seen';

function SpinningCrosshair() {
  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      style={{ position: 'absolute', opacity: 0.08 }}
    >
      {/* Outer circle */}
      <circle cx="100" cy="100" r="90" stroke="#e4b900" strokeWidth="1.5" />
      {/* Inner circle */}
      <circle cx="100" cy="100" r="40" stroke="#e4b900" strokeWidth="1" />
      {/* Crosshair lines */}
      <line x1="100" y1="5" x2="100" y2="55" stroke="#e4b900" strokeWidth="1.5" />
      <line x1="100" y1="145" x2="100" y2="195" stroke="#e4b900" strokeWidth="1.5" />
      <line x1="5" y1="100" x2="55" y2="100" stroke="#e4b900" strokeWidth="1.5" />
      <line x1="145" y1="100" x2="195" y2="100" stroke="#e4b900" strokeWidth="1.5" />
      {/* Center dot */}
      <circle cx="100" cy="100" r="3" fill="#e4b900" />
      {/* Tick marks */}
      <line x1="100" y1="60" x2="100" y2="70" stroke="#e4b900" strokeWidth="1" />
      <line x1="100" y1="130" x2="100" y2="140" stroke="#e4b900" strokeWidth="1" />
      <line x1="60" y1="100" x2="70" y2="100" stroke="#e4b900" strokeWidth="1" />
      <line x1="130" y1="100" x2="140" y2="100" stroke="#e4b900" strokeWidth="1" />
    </motion.svg>
  );
}

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(LS_KEY);
    if (!seen) {
      setVisible(true);
    } else {
      onDone?.();
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(LS_KEY, 'true');
    // Wait for exit animation to finish
    setTimeout(() => {
      onDone?.();
    }, 350);
  }, [onDone]);

  useEffect(() => {
    if (!visible) return;

    const handleInteraction = () => dismiss();
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {/* Crosshair behind title */}
          <SpinningCrosshair />

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              letterSpacing: '0.15em',
              background: 'linear-gradient(180deg, #f5d442 0%, #e4b900 40%, #c49500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            CASE SIM
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              color: '#666',
              fontSize: '0.95rem',
              letterSpacing: '0.25em',
              marginTop: '0.75rem',
              fontWeight: 500,
              position: 'relative',
              zIndex: 1,
            }}
          >
            N Games Crew Edition
          </motion.p>

          {/* Press any key prompt */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.3, 0.7] }}
            transition={{
              delay: 1,
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              bottom: '3rem',
              color: '#888',
              fontSize: '0.8rem',
              letterSpacing: '0.3em',
              fontWeight: 400,
            }}
          >
            PRESS ANY KEY TO START
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
