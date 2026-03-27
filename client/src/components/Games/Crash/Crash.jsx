import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../../store/gameStore';
import { formatPrice } from '../../../utils/helpers';
import { playSound } from '../../../utils/audio';

export default function Crash() {
  const { activePlayer, crashState, placeCrashBet, crashCashout, pingNGame } = useGameStore();
  const [betAmount, setBetAmount] = useState('1.00');
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutMult, setCashoutMult] = useState(0);
  const [graphPoints, setGraphPoints] = useState([]);
  const [crashHistory, setCrashHistory] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    pingNGame({ screen: 'in_game', mode: 'crash' });
    // Fetch current crash state on mount
    fetch('/api/games/crash/state').then(r => r.json()).then(data => {
      useGameStore.setState({ crashState: { ...crashState, ...data } });
    }).catch(() => {});
  }, []);

  // Track phase changes
  useEffect(() => {
    if (crashState.phase === 'betting') {
      setHasBet(false);
      setCashedOut(false);
      setCashoutMult(0);
      setGraphPoints([]);
    } else if (crashState.phase === 'running') {
      playSound('crash_launch');
    } else if (crashState.phase === 'crashed') {
      playSound('crash_explode');
      // Add to crash history
      if (crashState.multiplier > 0) {
        setCrashHistory(prev => [
          { mult: crashState.multiplier, time: Date.now() },
          ...prev.slice(0, 9)
        ]);
      }
    }
  }, [crashState.phase]);

  // Update graph
  useEffect(() => {
    if (crashState.phase === 'running' || crashState.phase?.phase === 'running') {
      setGraphPoints(prev => [...prev, crashState.multiplier || 1]);
    }
  }, [crashState.multiplier]);

  // Draw crash graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = h - (i * h / 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      ctx.fillStyle = '#555';
      ctx.font = '12px Share Tech Mono';
      ctx.fillText(`${(1 + i * 2).toFixed(1)}x`, 5, y - 5);
    }

    if (graphPoints.length < 2) return;

    const maxMult = Math.max(...graphPoints, 3);
    const xStep = w / Math.max(graphPoints.length - 1, 1);

    // Line
    ctx.beginPath();
    ctx.strokeStyle = crashState.phase === 'crashed' ? '#eb4b4b' : '#4CAF50';
    ctx.lineWidth = 3;

    graphPoints.forEach((mult, i) => {
      const x = i * xStep;
      const y = h - ((mult - 1) / (maxMult - 1)) * (h - 40);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill below
    const lastX = (graphPoints.length - 1) * xStep;
    const lastY = h - ((graphPoints[graphPoints.length - 1] - 1) / (maxMult - 1)) * (h - 40);
    ctx.lineTo(lastX, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = crashState.phase === 'crashed' ? 'rgba(235,75,75,0.1)' : 'rgba(76,175,80,0.1)';
    ctx.fill();
  }, [graphPoints, crashState.phase]);

  const handleBet = async () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) return;
    const result = await placeCrashBet(amount);
    if (result) setHasBet(true);
  };

  const handleCashout = async () => {
    const result = await crashCashout();
    if (result) {
      setCashedOut(true);
      setCashoutMult(result.multiplier);
    }
  };

  const mult = crashState.multiplier || 1;
  const phase = crashState.phase || 'betting';

  const getMultColor = () => {
    if (phase === 'crashed') return 'text-red-500';
    if (mult >= 5) return 'text-red-400';
    if (mult >= 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  const presets = [0.50, 1, 5, 10, 25, 50];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">CRASH</h1>
        {/* Crash history pills */}
        {crashHistory.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-xs mr-1">History:</span>
            {crashHistory.map((h, i) => (
              <span
                key={h.time}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  h.mult >= 10 ? 'bg-yellow-500/20 text-yellow-400' :
                  h.mult >= 5 ? 'bg-purple-500/20 text-purple-400' :
                  h.mult >= 2 ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}
              >
                {h.mult.toFixed(2)}x
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph */}
        <div className="lg:col-span-3">
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6 relative">
            {/* Multiplier display */}
            <div className="absolute top-6 right-6 z-10">
              <div className={`text-5xl font-mono font-bold ${getMultColor()}`}>
                {phase === 'crashed' ? `${mult.toFixed(2)}x` : phase === 'running' ? `${mult.toFixed(2)}x` : 'WAITING'}
              </div>
              {phase === 'crashed' && (
                <div className="text-red-500 text-lg font-bold text-right">CRASHED!</div>
              )}
              {phase === 'betting' && (
                <div className="text-gray-400 text-sm text-right">Placing bets...</div>
              )}
            </div>

            {/* Canvas graph */}
            <div className="h-64 relative">
              <canvas ref={canvasRef} className="w-full h-full" />
              {phase === 'running' && (
                <motion.div
                  className="absolute"
                  style={{
                    right: '10%',
                    bottom: `${Math.min(((mult - 1) / 8) * 100, 80)}%`,
                  }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
                    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0"/>
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3"/>
                  </svg>
                </motion.div>
              )}
              {phase === 'crashed' && (
                <div className="absolute right-[10%] bottom-[20%]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#eb4b4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Betting panel */}
        <div>
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-4">
            <h3 className="font-bold text-white mb-3">PLACE BET</h3>

            <div className="flex flex-wrap gap-1 mb-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setBetAmount(p.toFixed(2))}
                  className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700"
                >
                  ${p}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-center mb-3"
              step="0.01"
            />

            {phase === 'betting' && !hasBet && (
              <button
                onClick={handleBet}
                className="w-full py-3 bg-gradient-to-r from-csgo-gold to-yellow-600 text-black font-bold rounded-lg"
              >
                BET {formatPrice(parseFloat(betAmount) || 0)}
              </button>
            )}

            {phase === 'betting' && hasBet && (
              <div className="text-center text-gray-400 py-3">Waiting for round...</div>
            )}

            {phase === 'running' && hasBet && !cashedOut && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCashout}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg text-lg"
              >
                CASH OUT @ {mult.toFixed(2)}x
              </motion.button>
            )}

            {cashedOut && (
              <div className="text-center text-green-400 py-3 font-bold">
                Cashed out @ {cashoutMult.toFixed(2)}x!
              </div>
            )}

            {phase === 'running' && !hasBet && (
              <div className="text-center text-gray-500 py-3 text-sm">Round in progress</div>
            )}

            {/* Active bets */}
            <div className="mt-4">
              <h4 className="text-sm font-bold text-gray-400 mb-2">BETS</h4>
              {(crashState.bets || []).length === 0 && (
                <div className="text-gray-600 text-xs">No bets yet</div>
              )}
              {(crashState.bets || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-800/50">
                  <span className={`${b.isBot ? 'text-gray-500 italic' : 'text-white'}`}>
                    {b.botName || b.playerName || `Player ${b.playerId}`}
                  </span>
                  <span className="font-mono text-csgo-gold">{formatPrice(b.amount)}</span>
                  {b.cashedOut ? (
                    <span className="text-green-400 text-xs font-mono">{b.cashoutMult?.toFixed(2)}x</span>
                  ) : phase === 'crashed' ? (
                    <span className="text-red-400 text-xs">Bust</span>
                  ) : (
                    <span className="text-gray-600 text-xs">---</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
