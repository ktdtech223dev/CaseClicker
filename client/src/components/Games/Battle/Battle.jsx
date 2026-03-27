import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../../store/gameStore';
import { formatPrice, getRarityColor, getSkinImageUrl } from '../../../utils/helpers';

const SkinImage = ({ imageId, skinName, className }) => {
  const url = getSkinImageUrl(imageId, skinName);
  if (!url) {
    return <div className={`${className} bg-gray-800 rounded flex items-center justify-center text-gray-600 text-xs`}>?</div>;
  }
  return <img src={url} alt={skinName} className={className} />;
};

// Confetti particle
const Particle = ({ delay, side }) => {
  const colors = ['#e4b900', '#4b69ff', '#d32ce6', '#eb4b4b', '#22c55e', '#f97316'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = side === 'left' ? Math.random() * 50 : 50 + Math.random() * 50;
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{ backgroundColor: color, left: `${x}%`, top: '-5%' }}
      initial={{ opacity: 1, y: 0, rotate: 0 }}
      animate={{ opacity: 0, y: 600, rotate: 720 + Math.random() * 360, x: (Math.random() - 0.5) * 200 }}
      transition={{ duration: 2 + Math.random(), delay, ease: 'easeOut' }}
    />
  );
};

export default function Battle() {
  const { activePlayer, activePlayerId, cases, fetchCases, pingNGame, submitSession, addNotification, postToWall } = useGameStore();
  const [selectedCase, setSelectedCase] = useState(null);
  const [wager, setWager] = useState('0');
  const [rounds, setRounds] = useState(5);
  const [battleId, setBattleId] = useState(null);
  const [battle, setBattle] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [currentReveal, setCurrentReveal] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [history, setHistory] = useState([]);
  const [phase, setPhase] = useState('setup'); // setup, waiting, active, complete
  const autoOpenRef = useRef(null);

  useEffect(() => {
    pingNGame({ screen: 'in_game', mode: 'battle' });
    if (cases.length === 0) fetchCases();
    // Load battle history
    if (activePlayerId) {
      fetch(`/api/battle/history/${activePlayerId}`)
        .then(r => r.json())
        .then(setHistory)
        .catch(() => {});
    }
  }, [activePlayerId]);

  const totalCaseCost = selectedCase ? (selectedCase.price + 2.49) * rounds : 0;
  const totalCost = totalCaseCost + (parseFloat(wager) || 0);

  const handleCreate = async () => {
    if (!selectedCase) return addNotification('Select a case first', 'red');
    if (totalCost > activePlayer.wallet) return addNotification('Insufficient funds', 'red');

    try {
      const res = await fetch('/api/battle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: activePlayerId,
          caseId: selectedCase.id,
          wager: parseFloat(wager) || 0,
          rounds,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return addNotification(err.error, 'red');
      }
      const data = await res.json();
      setBattleId(data.battleId);
      setBattle(data.battle);
      setPhase('waiting');

      // Update player state
      const store = useGameStore.getState();
      store.fetchPlayers();
    } catch (e) {
      addNotification('Failed to create battle', 'red');
    }
  };

  const handleFindOpponent = async () => {
    if (!battleId) return;
    try {
      const res = await fetch('/api/battle/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId, playerId: 'bot' }),
      });
      if (!res.ok) {
        const err = await res.json();
        return addNotification(err.error, 'red');
      }
      const data = await res.json();
      setBattle(data.battle);
      setPhase('active');

      // Auto-open rounds with delay
      startAutoOpen(data.battle);
    } catch (e) {
      addNotification('Failed to find opponent', 'red');
    }
  };

  const startAutoOpen = (currentBattle) => {
    let roundIndex = 0;
    const maxRounds = currentBattle.rounds;

    const openNext = async () => {
      if (roundIndex >= maxRounds) return;
      setRevealing(true);
      try {
        const res = await fetch(`/api/battle/open/${currentBattle.id || battleId}`, { method: 'POST' });
        if (!res.ok) return;
        const data = await res.json();
        setCurrentReveal({
          round: data.round,
          p1Skin: data.player1Skin,
          p2Skin: data.player2Skin,
        });
        setBattle(data.battle);

        // Update player in store
        if (data.player) {
          const store = useGameStore.getState();
          store.fetchPlayers();
        }

        roundIndex++;

        if (data.battle.status === 'complete') {
          setPhase('complete');
          setRevealing(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);

          // Submit NGame session
          const won = data.battle.winner === activePlayerId;
          const totalValue = data.battle.player1.totalValue + data.battle.player2.totalValue;
          submitSession({
            score: Math.round(totalValue * 100),
            outcome: won ? 'win' : 'bust',
            game_mode: 'battle',
            data: { rounds: data.battle.rounds, total_value: totalValue, winner: data.battle.winner },
          });

          // Refresh history
          fetch(`/api/battle/history/${activePlayerId}`)
            .then(r => r.json())
            .then(setHistory)
            .catch(() => {});
          return;
        }

        // Next round after delay
        setTimeout(() => {
          setRevealing(false);
          setTimeout(openNext, 500);
        }, 1500);
      } catch (e) {
        setRevealing(false);
      }
    };

    setTimeout(openNext, 1000);
  };

  const handleNewBattle = () => {
    setBattleId(null);
    setBattle(null);
    setCurrentReveal(null);
    setShowConfetti(false);
    setPhase('setup');
  };

  const presetWagers = [0, 1, 5, 10, 25, 50, 100];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">CASE BATTLE</h1>

      {/* Setup Phase */}
      {phase === 'setup' && (
        <div className="space-y-6">
          {/* Case selector */}
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Select Case</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-64 overflow-y-auto">
              {cases.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-2 rounded-lg border transition-all text-center ${
                    selectedCase?.id === c.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-700 bg-[#12141a] hover:border-gray-500'
                  }`}
                >
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-full h-12 object-contain mb-1" />
                  ) : (
                    <div className="w-full h-12 bg-gray-800 rounded mb-1" />
                  )}
                  <div className="text-[10px] text-gray-400 truncate">{c.name}</div>
                  <div className="text-[10px] text-yellow-400">{formatPrice(c.price + 2.49)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Battle config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rounds */}
            <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Rounds</h3>
              <div className="flex gap-2">
                {[1, 3, 5, 7, 10].map(r => (
                  <button
                    key={r}
                    onClick={() => setRounds(r)}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                      rounds === r
                        ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                        : 'bg-[#12141a] text-gray-400 border border-gray-700 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Wager */}
            <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Side Wager</h3>
              <input
                type="number"
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                className="w-full bg-[#12141a] border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-lg mb-3 focus:outline-none focus:border-yellow-400/50"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <div className="flex flex-wrap gap-2">
                {presetWagers.map(w => (
                  <button
                    key={w}
                    onClick={() => setWager(w.toString())}
                    className="px-3 py-1 rounded text-xs bg-[#12141a] border border-gray-700 text-gray-400 hover:text-white transition"
                  >
                    ${w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cost summary & start */}
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">
                  Case cost: {formatPrice(totalCaseCost)} + Wager: {formatPrice(parseFloat(wager) || 0)}
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  Total: <span className="text-yellow-400">{formatPrice(totalCost)}</span>
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={!selectedCase || totalCost > (activePlayer?.wallet || 0)}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold text-lg hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                CREATE BATTLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting Phase */}
      {phase === 'waiting' && (
        <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-8 text-center">
          <div className="text-gray-400 mb-2">Battle created — {battle?.caseName}</div>
          <div className="text-2xl font-bold text-white mb-6">{battle?.rounds} Rounds</div>
          <button
            onClick={handleFindOpponent}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg hover:from-red-500 hover:to-red-400 transition-all animate-pulse"
          >
            FIND OPPONENT
          </button>
        </div>
      )}

      {/* Active / Complete Phase — Split screen */}
      {(phase === 'active' || phase === 'complete') && battle && (
        <div className="relative">
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
              {Array.from({ length: 40 }).map((_, i) => (
                <Particle key={i} delay={Math.random() * 0.5} side={Math.random() > 0.5 ? 'left' : 'right'} />
              ))}
            </div>
          )}

          {/* Round indicator */}
          <div className="text-center mb-4">
            <span className="text-sm text-gray-400">Round </span>
            <span className="text-lg font-bold text-yellow-400">
              {battle.currentRound}/{battle.rounds}
            </span>
          </div>

          {/* Split screen */}
          <div className="grid grid-cols-2 gap-1">
            {/* Player 1 (You) */}
            <div className={`bg-[#1a1d23] rounded-l-xl border border-gray-800 p-4 ${
              phase === 'complete' && battle.winner === battle.player1.id ? 'border-yellow-400/50' : ''
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: battle.player1.color }} />
                  <span className="font-bold text-white text-sm">{battle.player1.name}</span>
                </div>
                <span className="text-yellow-400 font-mono font-bold">{formatPrice(battle.player1.totalValue)}</span>
              </div>

              {/* Skin slots */}
              <div className="space-y-2">
                {Array.from({ length: battle.rounds }).map((_, i) => {
                  const skin = battle.player1.skins[i];
                  const isRevealing = revealing && battle.currentRound === i + 1;
                  return (
                    <motion.div
                      key={i}
                      className={`rounded-lg border p-2 flex items-center gap-3 ${
                        skin
                          ? 'border-gray-700 bg-[#12141a]'
                          : isRevealing
                            ? 'border-yellow-400/30 bg-yellow-400/5'
                            : 'border-gray-800/50 bg-[#0e1015]'
                      }`}
                      style={skin ? { borderLeftColor: getRarityColor(skin.rarity), borderLeftWidth: 3 } : {}}
                      animate={isRevealing ? { opacity: [0.5, 1, 0.5] } : {}}
                      transition={isRevealing ? { repeat: Infinity, duration: 0.6 } : {}}
                    >
                      {skin ? (
                        <>
                          <SkinImage imageId={skin.image_id} skinName={skin.name} className="w-12 h-9 object-contain" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white truncate">{skin.name}</div>
                            <div className="text-[10px]" style={{ color: getRarityColor(skin.rarity) }}>{skin.wear}</div>
                          </div>
                          <div className="text-xs font-mono text-green-400">{formatPrice(skin.price)}</div>
                        </>
                      ) : (
                        <div className="text-gray-600 text-xs py-2 text-center w-full">
                          {isRevealing ? 'Opening...' : `Round ${i + 1}`}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className={`bg-[#1a1d23] rounded-r-xl border border-gray-800 p-4 ${
              phase === 'complete' && battle.winner === battle.player2.id ? 'border-yellow-400/50' : ''
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-yellow-400 font-mono font-bold">{formatPrice(battle.player2.totalValue)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{battle.player2.name}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: battle.player2.color }} />
                </div>
              </div>

              {/* Skin slots */}
              <div className="space-y-2">
                {Array.from({ length: battle.rounds }).map((_, i) => {
                  const skin = battle.player2.skins[i];
                  const isRevealing = revealing && battle.currentRound === i + 1;
                  return (
                    <motion.div
                      key={i}
                      className={`rounded-lg border p-2 flex items-center gap-3 ${
                        skin
                          ? 'border-gray-700 bg-[#12141a]'
                          : isRevealing
                            ? 'border-red-400/30 bg-red-400/5'
                            : 'border-gray-800/50 bg-[#0e1015]'
                      }`}
                      style={skin ? { borderRightColor: getRarityColor(skin.rarity), borderRightWidth: 3 } : {}}
                      animate={isRevealing ? { opacity: [0.5, 1, 0.5] } : {}}
                      transition={isRevealing ? { repeat: Infinity, duration: 0.6 } : {}}
                    >
                      {skin ? (
                        <>
                          <SkinImage imageId={skin.image_id} skinName={skin.name} className="w-12 h-9 object-contain" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white truncate">{skin.name}</div>
                            <div className="text-[10px]" style={{ color: getRarityColor(skin.rarity) }}>{skin.wear}</div>
                          </div>
                          <div className="text-xs font-mono text-green-400">{formatPrice(skin.price)}</div>
                        </>
                      ) : (
                        <div className="text-gray-600 text-xs py-2 text-center w-full">
                          {isRevealing ? 'Opening...' : `Round ${i + 1}`}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Winner announcement */}
          <AnimatePresence>
            {phase === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 text-center"
              >
                <div className={`inline-block px-8 py-4 rounded-xl border ${
                  battle.winner === activePlayerId
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className={`text-3xl font-bold ${
                    battle.winner === activePlayerId ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {battle.winner === activePlayerId ? 'VICTORY!' : 'DEFEAT'}
                  </div>
                  <div className="text-gray-400 mt-2">
                    {battle.player1.name}: {formatPrice(battle.player1.totalValue)} vs {battle.player2.name}: {formatPrice(battle.player2.totalValue)}
                  </div>
                  <div className="text-yellow-400 font-bold mt-1">
                    Total skins won: {formatPrice(battle.player1.totalValue + battle.player2.totalValue)}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleNewBattle}
                    className="px-6 py-2 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/20 font-bold transition-all"
                  >
                    NEW BATTLE
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Battle History */}
      {history.length > 0 && phase === 'setup' && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4">BATTLE HISTORY</h2>
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left px-4 py-3">Result</th>
                  <th className="text-right px-4 py-3">Wager</th>
                  <th className="text-right px-4 py-3">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-gray-800/50 text-sm">
                    <td className="px-4 py-3">
                      <span className={h.result === 'win' ? 'text-green-400' : 'text-red-400'}>
                        {h.result === 'win' ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 font-mono">{formatPrice(h.wager)}</td>
                    <td className={`px-4 py-3 text-right font-mono ${h.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {h.profit_loss >= 0 ? '+' : ''}{formatPrice(h.profit_loss)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
