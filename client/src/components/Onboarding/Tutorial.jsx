import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LS_KEY = 'casesim_tutorial_done';

const STEPS = [
  {
    selector: '[data-tutorial="click-button"]',
    fallbackPosition: { top: '50%', left: '50%' },
    title: 'Click here to earn money!',
    description: 'Tap the button to add funds to your wallet.',
    arrowDirection: 'bottom',
  },
  {
    selector: '[data-tutorial="upgrade-list"]',
    fallbackPosition: { top: '60%', left: '50%' },
    title: 'Buy upgrades to earn more per click',
    description: 'Spend your earnings on upgrades that multiply your income.',
    arrowDirection: 'bottom',
  },
  {
    selector: 'a[href="/cases"]',
    fallbackPosition: { top: '30%', left: '30px' },
    title: 'Open cases to win rare skins!',
    description: 'Browse and open cases for a chance at valuable items.',
    arrowDirection: 'right',
  },
  {
    selector: 'a[href="/inventory"]',
    fallbackPosition: { top: '38%', left: '30px' },
    title: 'Check your inventory here',
    description: 'View all the skins and items you have collected.',
    arrowDirection: 'right',
  },
  {
    selector: '[data-tutorial="games-section"]',
    fallbackSelector: 'a[href="/games/coinflip"]',
    fallbackPosition: { top: '55%', left: '30px' },
    title: 'Try your luck gambling!',
    description: 'Play coinflip, crash, roulette, and jackpot.',
    arrowDirection: 'right',
  },
  {
    selector: 'a[href="/players"]',
    fallbackPosition: { top: '75%', left: '30px' },
    title: 'Track your progress on the leaderboard',
    description: 'See how you rank against other players.',
    arrowDirection: 'right',
  },
];

function getElementRect(step) {
  let el = document.querySelector(step.selector);
  if (!el && step.fallbackSelector) {
    el = document.querySelector(step.fallbackSelector);
  }
  if (el) {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      found: true,
    };
  }
  return { top: 0, left: 0, width: 0, height: 0, found: false };
}

function getTooltipPosition(rect, arrowDirection) {
  const padding = 16;
  const tooltipWidth = 300;
  const tooltipHeight = 120;

  if (!rect.found) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  switch (arrowDirection) {
    case 'right':
      return {
        top: rect.top + rect.height / 2 - tooltipHeight / 2,
        left: rect.left + rect.width + padding + 12,
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2 - tooltipHeight / 2,
        left: rect.left - tooltipWidth - padding - 12,
      };
    case 'bottom':
      return {
        top: rect.top + rect.height + padding + 12,
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
      };
    case 'top':
      return {
        top: rect.top - tooltipHeight - padding - 12,
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
      };
    default:
      return {
        top: rect.top + rect.height + padding,
        left: rect.left,
      };
  }
}

function ArrowSvg({ direction }) {
  const size = 12;
  const style = { position: 'absolute' };

  switch (direction) {
    case 'right':
      // Arrow points left (tooltip is to the right of target)
      style.left = -size;
      style.top = '50%';
      style.transform = 'translateY(-50%)';
      return (
        <svg style={style} width={size} height={size * 2} viewBox="0 0 12 24">
          <polygon points="12,0 0,12 12,24" fill="#1a1a2e" />
        </svg>
      );
    case 'left':
      style.right = -size;
      style.top = '50%';
      style.transform = 'translateY(-50%)';
      return (
        <svg style={style} width={size} height={size * 2} viewBox="0 0 12 24">
          <polygon points="0,0 12,12 0,24" fill="#1a1a2e" />
        </svg>
      );
    case 'bottom':
      style.top = -size;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
      return (
        <svg style={style} width={size * 2} height={size} viewBox="0 0 24 12">
          <polygon points="0,12 12,0 24,12" fill="#1a1a2e" />
        </svg>
      );
    case 'top':
      style.bottom = -size;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
      return (
        <svg style={style} width={size * 2} height={size} viewBox="0 0 24 12">
          <polygon points="0,0 12,12 24,0" fill="#1a1a2e" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Tutorial({ onDone }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState({ top: 0, left: 0, width: 0, height: 0, found: false });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(LS_KEY);
    if (!done) {
      // Small delay so the main UI renders first
      const timer = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(timer);
    } else {
      onDone?.();
    }
  }, []);

  // Update target rect when step changes
  useEffect(() => {
    if (!active) return;
    const step = STEPS[currentStep];
    if (!step) return;

    // Slight delay to let DOM settle
    const timer = setTimeout(() => {
      setTargetRect(getElementRect(step));
    }, 100);

    return () => clearTimeout(timer);
  }, [currentStep, active]);

  // Recalculate on resize
  useEffect(() => {
    if (!active) return;
    const handleResize = () => {
      setTargetRect(getElementRect(STEPS[currentStep]));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep, active]);

  const finish = useCallback(() => {
    localStorage.setItem(LS_KEY, 'true');
    setActive(false);
    onDone?.();
  }, [onDone]);

  const nextStep = useCallback(() => {
    if (currentStep >= STEPS.length - 1) {
      finish();
    } else {
      setCurrentStep(s => s + 1);
    }
  }, [currentStep, finish]);

  if (!active) return null;

  const step = STEPS[currentStep];
  const tooltipPos = getTooltipPosition(targetRect, step.arrowDirection);
  const highlightPadding = 6;

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          pointerEvents: 'auto',
        }}
      >
        {/* Dark overlay with cutout for highlighted element */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <mask id="tutorial-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect.found && (
                <rect
                  x={targetRect.left - highlightPadding}
                  y={targetRect.top - highlightPadding}
                  width={targetRect.width + highlightPadding * 2}
                  height={targetRect.height + highlightPadding * 2}
                  rx="6"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#tutorial-mask)"
          />
        </svg>

        {/* Highlight border */}
        {targetRect.found && (
          <motion.div
            layoutId="tutorial-highlight"
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: targetRect.top - highlightPadding,
              left: targetRect.left - highlightPadding,
              width: targetRect.width + highlightPadding * 2,
              height: targetRect.height + highlightPadding * 2,
              border: '2px solid rgba(228, 185, 0, 0.6)',
              borderRadius: 6,
              pointerEvents: 'none',
              boxShadow: '0 0 20px rgba(228, 185, 0, 0.15)',
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            top: typeof tooltipPos.top === 'string' ? tooltipPos.top : tooltipPos.top,
            left: typeof tooltipPos.left === 'string' ? tooltipPos.left : tooltipPos.left,
            transform: tooltipPos.transform || undefined,
            width: 300,
            backgroundColor: '#1a1a2e',
            border: '1px solid rgba(228, 185, 0, 0.3)',
            borderRadius: 10,
            padding: '18px 20px',
            zIndex: 9999,
          }}
        >
          <ArrowSvg direction={step.arrowDirection} />

          {/* Step indicator */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginBottom: 12,
          }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: i <= currentStep ? '#e4b900' : '#333',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </div>

          <h3 style={{
            margin: '0 0 6px 0',
            color: '#e4b900',
            fontSize: '0.95rem',
            fontWeight: 700,
          }}>
            {step.title}
          </h3>

          <p style={{
            margin: '0 0 16px 0',
            color: '#999',
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}>
            {step.description}
          </p>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              onClick={finish}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '0.75rem',
                cursor: 'pointer',
                padding: '4px 0',
                letterSpacing: '0.05em',
              }}
            >
              Skip Tutorial
            </button>

            <button
              onClick={nextStep}
              style={{
                backgroundColor: '#e4b900',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: 6,
                padding: '7px 18px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              {currentStep >= STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
