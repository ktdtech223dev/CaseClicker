import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../../store/gameStore';
import { formatPrice } from '../../../utils/helpers';
import { playSound } from '../../../utils/audio';

export default function Coinflip() {
  const { activePlayer, playCoinflip, pingNGame } = useGameStore();
  const [wager, setWager] = useState('1.00');
  const [side, setSide] = useState('ct');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  React.useEffect(() => {
    pingNGame({ screen: 'in_game', mode: 'coinflip' });
  }, []);

  const handleFlip = async () => {
    const amount = parseFloat(wager);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > activePlayer.wallet) return;

    setFlipping(true);
    setResult(null);
    playSound('coin_flip');

    // Start flip animation
    setTimeout(async () => {
      const data = await playCoinflip(amount, side);
      if (data) {
        setResult(data);
        setHistory(prev => [{ ...data, timestamp: Date.now() }, ...prev].slice(0, 20));
      }
      setFlipping(false);
    }, 2500);
  };

  const presets = [0.50, 1, 5, 10, 25, 50];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">COINFLIP</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game area */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-8">
            {/* Coin */}
            <div className="flex justify-center mb-8">
              <motion.div
                className="w-40 h-40 rounded-full flex items-center justify-center text-6xl font-bold border-4"
                style={{
                  perspective: '1000px',
                  background: flipping ? undefined : (result ? (result.winSide === 'ct' ? 'rgba(75,105,255,0.2)' : 'rgba(228,185,0,0.2)') : 'rgba(255,255,255,0.05)'),
                  borderColor: flipping ? '#666' : (result ? (result.winSide === 'ct' ? '#4b69ff' : '#e4b900') : '#444'),
                }}
                animate={flipping ? {
                  rotateY: [0, 1800],
                  scale: [1, 1.2, 1],
                } : {}}
                transition={flipping ? { duration: 2.5, ease: [0.25, 0.1, 0.25, 1] } : {}}
              >
                {flipping ? '?' : (result ? (result.winSide === 'ct' ? 'CT' : 'T') : '?')}
              </motion.div>
            </div>

            {/* Result */}
            <AnimatePresence>
              {result && !flipping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center mb-6 p-4 rounded-lg ${
                    result.won ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  <div className="text-2xl font-bold">
                    {result.won ? 'YOU WIN!' : 'YOU LOSE!'}
                  </div>
                  <div className="font-mono mt-1">
                    {result.won ? '+' : ''}{formatPrice(result.profitLoss)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Side selection */}
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => setSide('ct')}
                className={`px-8 py-3 rounded-lg font-bold transition-all ${
                  side === 'ct'
                    ? 'bg-csgo-blue/30 text-csgo-blue border-2 border-csgo-blue'
                    : 'bg-gray-800 text-gray-400 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                CT
              </button>
              <button
                onClick={() => setSide('t')}
                className={`px-8 py-3 rounded-lg font-bold transition-all ${
                  side === 't'
                    ? 'bg-csgo-gold/30 text-csgo-gold border-2 border-csgo-gold'
                    : 'bg-gray-800 text-gray-400 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                T
              </button>
            </div>

            {/* Wager */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {presets.map(p => (
                  <button
                    key={p}
                    onClick={() => setWager(p.toFixed(2))}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700"
                  >
                    ${p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-csgo-gold">$</span>
                <input
                  type="number"
                  value={wager}
                  onChange={e => setWager(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono w-32 text-center"
                  step="0.01"
                  min="0.01"
                />
                <button
                  onClick={() => setWager((activePlayer.wallet / 2).toFixed(2))}
                  className="px-3 py-2 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700"
                >
                  1/2
                </button>
                <button
                  onClick={() => setWager(activePlayer.wallet.toFixed(2))}
                  className="px-3 py-2 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700"
                >
                  MAX
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFlip}
                disabled={flipping}
                className={`px-12 py-3 rounded-lg font-bold text-lg mt-2 ${
                  flipping
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-csgo-gold to-yellow-600 text-black'
                }`}
              >
                {flipping ? 'FLIPPING...' : 'FLIP!'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* History sidebar */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">BATTLE HISTORY</h2>
          <div className="flex flex-col gap-2">
            {history.length === 0 && (
              <div className="text-gray-600 text-sm">No flips yet</div>
            )}
            {history.map((h, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${
                  h.won ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <div className="flex justify-between">
                  <span className={h.won ? 'text-green-400' : 'text-red-400'}>
                    {h.won ? 'WIN' : 'LOSS'}
                  </span>
                  <span className="font-mono text-gray-400">{formatPrice(h.wager)}</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Picked {h.playerSide.toUpperCase()} — Result: {h.winSide.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
