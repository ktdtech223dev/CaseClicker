import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../../store/gameStore';
import { formatPrice } from '../../../utils/helpers';
import { playSound } from '../../../utils/audio';

// 15 slots: 1 green, 7 red, 7 black — repeated for the strip
const SLOTS = [
  { n: 0, color: 'green' },
  { n: 1, color: 'red' }, { n: 2, color: 'black' },
  { n: 3, color: 'red' }, { n: 4, color: 'black' },
  { n: 5, color: 'red' }, { n: 6, color: 'black' },
  { n: 7, color: 'red' }, { n: 8, color: 'black' },
  { n: 9, color: 'red' }, { n: 10, color: 'black' },
  { n: 11, color: 'red' }, { n: 12, color: 'black' },
  { n: 13, color: 'red' }, { n: 14, color: 'black' },
];

const SLOT_W = 80;
const CYCLE_W = SLOTS.length * SLOT_W;

const BG = { red: '#c9302c', black: '#23262e', green: '#2e7d32' };
const BG_HOVER = { red: '#d9443f', black: '#2d3140', green: '#388e3c' };
const BG_GLOW = { red: 'rgba(201,48,44,0.25)', black: 'rgba(35,38,46,0.25)', green: 'rgba(46,125,50,0.25)' };

export default function Roulette() {
  const { activePlayer, pingNGame, addNotification, postToWall, fetchPlayers } = useGameStore();
  const [betAmount, setBetAmount] = useState(1);
  const [phase, setPhase] = useState('idle');
  const [lastResult, setLastResult] = useState(null);
  const [lastPayout, setLastPayout] = useState(null);
  const [history, setHistory] = useState([]);
  const stripRef = useRef(null);

  useEffect(() => {
    pingNGame({ screen: 'in_game', mode: 'roulette' });
  }, []);

  // Build a long strip: 40 repetitions for smooth scrolling
  const strip = [];
  for (let r = 0; r < 40; r++) {
    for (const slot of SLOTS) {
      strip.push({ ...slot, key: r * SLOTS.length + slot.n + r * 100 });
    }
  }

  const spin = async (type) => {
    if (phase !== 'idle') return;
    if (betAmount <= 0 || isNaN(betAmount)) {
      addNotification('Enter a valid bet', 'error');
      return;
    }
    if (activePlayer.wallet < betAmount) {
      addNotification('Not enough money!', 'error');
      return;
    }

    setPhase('spinning');
    playSound('roulette_spin');
    setLastResult(null);
    setLastPayout(null);

    try {
      const res = await fetch('/api/games/roulette/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayer.id, amount: betAmount, betType: type }),
      });

      if (!res.ok) {
        const err = await res.json();
        addNotification(err.error || 'Bet failed', 'error');
        setPhase('idle');
        return;
      }

      const data = await res.json();
      useGameStore.setState({ activePlayer: data.player });

      // Calculate where to stop the strip
      const winSlotIdx = data.slotIndex; // index in SLOTS array (0-14)

      // Scroll to land pointer exactly on winning slot center
      // Strip starts with slot 0 centered (marginLeft: 50% - SLOT_W/2)
      // So scrolling by N * SLOT_W centers slot N
      const rotations = 25 + Math.floor(Math.random() * 5);
      const slotOffset = winSlotIdx * SLOT_W;
      const randomJitter = Math.random() * (SLOT_W * 0.3) - SLOT_W * 0.15; // small jitter within slot
      const totalScroll = rotations * CYCLE_W + slotOffset + randomJitter;

      const el = stripRef.current;
      if (el) {
        // Reset position instantly
        el.style.transition = 'none';
        el.style.transform = 'translateX(0px)';
        void el.offsetWidth; // force reflow

        // Animate
        el.style.transition = 'transform 5s cubic-bezier(0.08, 0.80, 0.17, 1)';
        el.style.transform = `translateX(-${totalScroll}px)`;
      }

      // Reveal after animation
      setTimeout(() => {
        const serverResult = data.result;
        setLastResult(serverResult);

        const won = data.won;
        const winAmt = data.payout;
        const pl = data.profitLoss;
        setLastPayout({ won, amount: winAmt, profitLoss: pl, betType: type });

        setHistory(prev => [{ color: serverResult.color, number: serverResult.number }, ...prev].slice(0, 30));

        if (won) {
          addNotification(`Won ${formatPrice(winAmt)} on ${type}!`, 'success');
          if (serverResult.color === 'green') {
            postToWall(`${activePlayer.name} hit GREEN on Roulette and won ${formatPrice(winAmt)}!`);
          }
        } else {
          addNotification(`Lost ${formatPrice(betAmount)}`, 'error');
        }

        fetchPlayers();
        setPhase('result');
        setTimeout(() => setPhase('idle'), 3000);
      }, 5300);

    } catch (e) {
      console.error('Roulette error:', e);
      addNotification('Bet failed', 'error');
      setPhase('idle');
    }
  };

  const presets = [0.50, 1, 5, 10, 25, 50, 100];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header + history */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-white">ROULETTE</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 text-xs mr-2">History:</span>
          {history.slice(0, 15).map((h, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold text-white transition-all"
              style={{
                backgroundColor: BG[h.color],
                opacity: 1 - i * 0.04,
              }}
            >
              {h.number}
            </div>
          ))}
        </div>
      </div>

      {/* Wheel strip */}
      <div className="relative rounded-xl border border-gray-800 overflow-hidden mb-6 bg-[#0a0c10]">
        {/* Pointer top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-csgo-gold drop-shadow-lg" />
        </div>
        {/* Pointer bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[16px] border-b-csgo-gold drop-shadow-lg" />
        </div>

        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0c10] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0c10] to-transparent z-10 pointer-events-none" />

        {/* Center glow line */}
        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-csgo-gold/40 z-10 -translate-x-[1px]" />

        <div className="h-24 overflow-hidden">
          <div
            ref={stripRef}
            className="flex items-center h-full"
            style={{ marginLeft: `calc(50% - ${SLOT_W / 2}px)` }}
          >
            {strip.map((slot, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-[70px] rounded-md flex items-center justify-center text-white font-bold text-lg select-none mx-[2px] transition-shadow"
                style={{
                  width: SLOT_W - 4,
                  backgroundColor: BG[slot.color],
                  boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)`,
                }}
              >
                {slot.n}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {lastPayout && phase === 'result' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-5 p-4 rounded-xl text-center font-bold text-lg border ${
              lastPayout.won
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {lastPayout.won ? (
              <>
                <span className="text-2xl">+{formatPrice(lastPayout.amount)}</span>
                <div className="text-sm font-normal mt-1 opacity-70">
                  Landed on {lastResult.color} {lastResult.number}
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl">-{formatPrice(betAmount)}</span>
                <div className="text-sm font-normal mt-1 opacity-70">
                  Landed on {lastResult.color} {lastResult.number} — you bet {lastPayout.betType}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Betting panel */}
      <div className="bg-[#111318] rounded-xl border border-gray-800 p-6">
        {/* Amount selector */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setBetAmount(p)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${
                betAmount === p
                  ? 'bg-csgo-gold/15 text-csgo-gold border-csgo-gold/30'
                  : 'bg-[#1a1d23] text-gray-400 border-gray-700 hover:border-gray-500'
              }`}
            >
              ${p}
            </button>
          ))}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(parseFloat(e.target.value) || 0)}
              className="bg-[#1a1d23] border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white font-mono w-28 text-sm focus:outline-none focus:border-csgo-gold/50"
              step="0.50"
              min="0.01"
            />
          </div>
          <button
            onClick={() => setBetAmount(Math.floor(activePlayer.wallet * 100) / 100)}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-[#1a1d23] text-gray-400 border border-gray-700 hover:border-gray-500 transition"
          >
            MAX
          </button>
          <button
            onClick={() => setBetAmount(Math.floor(activePlayer.wallet / 2 * 100) / 100)}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-[#1a1d23] text-gray-400 border border-gray-700 hover:border-gray-500 transition"
          >
            1/2
          </button>
        </div>

        {/* Bet buttons */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { type: 'red', label: 'RED', mult: '2x', color: '#c9302c', count: '7 slots' },
            { type: 'green', label: 'GREEN', mult: '14x', color: '#2e7d32', count: '1 slot' },
            { type: 'black', label: 'BLACK', mult: '2x', color: '#23262e', count: '7 slots' },
          ].map(btn => (
            <button
              key={btn.type}
              onClick={() => spin(btn.type)}
              disabled={phase !== 'idle'}
              className="relative py-6 rounded-xl font-bold text-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed group overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${btn.color}, ${btn.color}dd)`,
                border: `2px solid ${btn.color === '#23262e' ? '#3a3e4a' : btn.color}`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at center, ${BG_GLOW[btn.type]}, transparent 70%)` }}
              />
              <div className="relative">
                <div className="text-white">{btn.label}</div>
                <div className="text-sm font-normal text-white/50 mt-1">{btn.mult} payout</div>
                <div className="text-[10px] font-normal text-white/30 mt-0.5">{btn.count}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Spinning indicator */}
        {phase === 'spinning' && (
          <div className="text-center mt-5">
            <div className="inline-flex items-center gap-2 text-csgo-gold text-sm font-medium">
              <div className="w-4 h-4 border-2 border-csgo-gold border-t-transparent rounded-full animate-spin" />
              Spinning...
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {history.length > 0 && (
        <div className="mt-4 flex gap-4 text-xs text-gray-600">
          <span>Red: {history.filter(h => h.color === 'red').length}</span>
          <span>Black: {history.filter(h => h.color === 'black').length}</span>
          <span className="text-green-600">Green: {history.filter(h => h.color === 'green').length}</span>
          <span>Total spins: {history.length}</span>
        </div>
      )}
    </div>
  );
}
