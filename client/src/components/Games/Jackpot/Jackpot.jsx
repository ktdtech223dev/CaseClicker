import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../../store/gameStore';
import { formatPrice, getRarityColor } from '../../../utils/helpers';
import SkinImage from '../../shared/SkinImage';
import socket from '../../../utils/socket';

// ---- Constants ----
const WHEEL_SIZE = 320;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const SPIN_DURATION = 4000; // ms
const PLAYER_COLORS = [
  '#e4b900', '#4b69ff', '#eb4b4b', '#4CAF50', '#d32ce6',
  '#ff9800', '#00bcd4', '#8bc34a', '#e91e63', '#9c27b0',
  '#ff5722', '#607d8b', '#3f51b5', '#009688', '#cddc39',
];

function getPlayerColor(index) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

// ---- Jackpot Component ----
export default function Jackpot() {
  const { activePlayer, pingNGame, addNotification, fetchInventory, inventory, postToWall } = useGameStore();
  const [state, setState] = useState({
    phase: 'waiting',
    potValue: 0,
    pot: [],
    players: {},
    countdown: 0,
    winner: null,
    history: [],
    serverSeedHash: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const resultTimeoutRef = useRef(null);

  // NGame ping
  useEffect(() => {
    pingNGame({ screen: 'in_game', mode: 'jackpot' });
  }, []);

  // Fetch initial state & inventory
  useEffect(() => {
    fetch('/api/games/jackpot/state')
      .then(r => r.json())
      .then(data => setState(prev => ({ ...prev, ...data })))
      .catch(() => {});
    fetchInventory();
  }, []);

  // Socket listeners
  useEffect(() => {
    const handleUpdate = (data) => {
      setState(prev => ({ ...prev, ...data }));
      setShowResult(false);
    };

    const handleSpin = (data) => {
      setSpinning(true);
      setShowResult(false);
      // 4-6 full rotations plus the target angle from server
      const winnerAngle = data?.winnerAngle || Math.random() * 360;
      const extraSpins = 1440 + Math.random() * 720;
      setSpinAngle(prev => prev + extraSpins + (360 - winnerAngle));
    };

    const handleResult = (data) => {
      // Delay result display until spin animation finishes
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          phase: 'result',
          winner: data.winner,
          potValue: data.potValue ?? prev.potValue,
          history: data.history || prev.history,
        }));
        setSpinning(false);
        setShowResult(true);

        // Refresh inventory after round
        fetchInventory();

        // Notify
        if (data.winner) {
          const isMe = String(data.winner.playerId) === String(activePlayer?.id);
          if (isMe) {
            addNotification(`You won the Jackpot! ${formatPrice(data.winner.totalWon)} (${data.winner.skinCount} skins)`, 'green');
            if (activePlayer?.name) {
              postToWall(`${activePlayer.name} won a $${(data.potValue || 0).toFixed(2)} Jackpot!`);
            }
          } else {
            addNotification(`${data.winner.playerName || 'Someone'} won the Jackpot!`, 'gold');
          }
        }
      }, SPIN_DURATION + 200);
    };

    socket.on('jackpot_update', handleUpdate);
    socket.on('jackpot_spin', handleSpin);
    socket.on('jackpot_result', handleResult);

    return () => {
      socket.off('jackpot_update', handleUpdate);
      socket.off('jackpot_spin', handleSpin);
      socket.off('jackpot_result', handleResult);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, [activePlayer?.id]);

  // Reset spin on new round
  useEffect(() => {
    if (state.phase === 'waiting') {
      setSpinAngle(0);
      setShowResult(false);
      setSpinning(false);
    }
  }, [state.phase]);

  // ---- Derived data ----
  const playerList = useMemo(() => {
    return Object.entries(state.players).map(([id, p], idx) => ({
      id,
      ...p,
      color: p.color || getPlayerColor(idx),
      chance: state.potValue > 0 ? ((p.totalValue / state.potValue) * 100) : 0,
    }));
  }, [state.players, state.potValue]);

  const myDeposit = useMemo(() => {
    if (!activePlayer) return 0;
    const p = state.players[activePlayer.id];
    return p ? p.totalValue : 0;
  }, [state.players, activePlayer?.id]);

  const myChance = useMemo(() => {
    if (!activePlayer || state.potValue <= 0) return 0;
    return (myDeposit / state.potValue) * 100;
  }, [myDeposit, state.potValue]);

  // Skins available to deposit (not already in pot)
  const availableSkins = useMemo(() => {
    const potIds = new Set(state.pot.map(s => s.inventoryId));
    return inventory.filter(s => !potIds.has(s.id));
  }, [inventory, state.pot]);

  const selectedTotal = useMemo(() => {
    let total = 0;
    for (const id of selectedIds) {
      const skin = availableSkins.find(s => s.id === id);
      if (skin) total += (skin.price || 0);
    }
    return total;
  }, [selectedIds, availableSkins]);

  // Wheel segments for SVG
  const wheelSegments = useMemo(() => {
    if (playerList.length === 0) return [];
    let startAngle = 0;
    return playerList.map(p => {
      const sweep = (p.chance / 100) * 360;
      const seg = { ...p, startAngle, sweep };
      startAngle += sweep;
      return seg;
    });
  }, [playerList]);

  // ---- Handlers ----
  const handleDeposit = useCallback(async () => {
    if (selectedIds.size === 0 || !activePlayer) return;
    setDepositing(true);
    try {
      const res = await fetch('/api/games/jackpot/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: activePlayer.id,
          inventoryIds: Array.from(selectedIds),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addNotification(data.error || 'Deposit failed', 'red');
      } else {
        addNotification(`Deposited ${data.deposited || selectedIds.size} skins (${formatPrice(data.totalValue || selectedTotal)})`, 'green');
        setSelectedIds(new Set());
        setShowModal(false);
        fetchInventory();
      }
    } catch {
      addNotification('Deposit failed', 'red');
    }
    setDepositing(false);
  }, [selectedIds, activePlayer?.id, selectedTotal]);

  const toggleSkin = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const canDeposit = state.phase === 'waiting' || state.phase === 'active' || state.phase === 'betting';
  const phaseConfig = {
    waiting: { label: 'Waiting for deposits...', dot: 'bg-gray-500', badge: 'bg-gray-800 text-gray-400' },
    active: { label: `Betting open - ${state.countdown}s`, dot: 'bg-yellow-400 animate-pulse', badge: 'bg-yellow-400/10 text-yellow-400' },
    betting: { label: `Betting open - ${state.countdown}s`, dot: 'bg-yellow-400 animate-pulse', badge: 'bg-yellow-400/10 text-yellow-400' },
    spinning: { label: 'Picking winner...', dot: 'bg-blue-400 animate-pulse', badge: 'bg-blue-500/10 text-blue-400' },
    result: { label: 'Round complete', dot: 'bg-green-400', badge: 'bg-green-500/10 text-green-400' },
  };
  const phase = phaseConfig[state.phase] || phaseConfig.waiting;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-yellow-400">
              <path d="M5 3h14l-1.5 3H6.5L5 3zm1.5 4h11l-1 11a2 2 0 01-2 2H9.5a2 2 0 01-2-2l-1-11zm3 2v7a.5.5 0 001 0V9h-1zm3 0v7a.5.5 0 001 0V9h-1z" />
            </svg>
            JACKPOT
          </h1>
          <p className="text-gray-500 text-sm mt-1">Deposit skins, biggest share wins the pot</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${phase.badge}`}>
            <span className={`w-2 h-2 rounded-full ${phase.dot}`} />
            {phase.label}
          </div>
          {state.serverSeedHash && (
            <span className="text-[10px] text-gray-600 font-mono truncate max-w-[120px]" title={state.serverSeedHash}>
              Hash: {state.serverSeedHash.slice(0, 12)}...
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Wheel + Pot Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pot Value + Timer + Wheel */}
          <div className="bg-[#13151a] rounded-xl border border-gray-800/50 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Pot</div>
                <div className="text-3xl font-bold text-yellow-400">{formatPrice(state.potValue)}</div>
                <div className="text-xs text-gray-600 mt-1">{state.pot.length} skin{state.pot.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Chance</div>
                <div className="text-2xl font-bold text-white">{myChance.toFixed(1)}%</div>
                {myDeposit > 0 && (
                  <div className="text-xs text-gray-500 mt-1">{formatPrice(myDeposit)} deposited</div>
                )}
              </div>
              {(state.phase === 'active' || state.phase === 'betting') && state.countdown > 0 && (
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Timer</div>
                  <motion.div
                    key={state.countdown}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-3xl font-bold tabular-nums ${state.countdown <= 5 ? 'text-red-400' : 'text-white'}`}
                  >
                    {state.countdown}s
                  </motion.div>
                  <div className="w-20 h-1 bg-gray-800 rounded-full mt-2 overflow-hidden mx-auto">
                    <motion.div
                      className="h-full bg-yellow-400 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: state.countdown, ease: 'linear' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wheel */}
            <div className="flex justify-center py-4 relative">
              {/* Arrow pointer at top */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
              </div>

              <div className="relative">
                <svg
                  width={WHEEL_SIZE}
                  height={WHEEL_SIZE}
                  viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                  className="drop-shadow-2xl"
                  style={{
                    transform: `rotate(${spinAngle}deg)`,
                    transition: spinning
                      ? `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0.85, 0.25, 1)`
                      : 'none',
                  }}
                >
                  {/* Outer ring */}
                  <circle cx={WHEEL_RADIUS} cy={WHEEL_RADIUS} r={WHEEL_RADIUS - 1} fill="none" stroke="#333" strokeWidth="3" />
                  {/* Background */}
                  <circle cx={WHEEL_RADIUS} cy={WHEEL_RADIUS} r={WHEEL_RADIUS - 3} fill="#1a1c24" />

                  {/* Player segments */}
                  {wheelSegments.length > 0 ? (
                    wheelSegments.map((seg, i) => {
                      if (seg.sweep <= 0) return null;
                      const startRad = (seg.startAngle - 90) * (Math.PI / 180);
                      const endRad = (seg.startAngle + seg.sweep - 90) * (Math.PI / 180);
                      const r = WHEEL_RADIUS - 4;
                      const largeArc = seg.sweep > 180 ? 1 : 0;
                      const x1 = WHEEL_RADIUS + r * Math.cos(startRad);
                      const y1 = WHEEL_RADIUS + r * Math.sin(startRad);
                      const x2 = WHEEL_RADIUS + r * Math.cos(endRad);
                      const y2 = WHEEL_RADIUS + r * Math.sin(endRad);

                      const path = seg.sweep >= 359.9
                        ? `M ${WHEEL_RADIUS} ${WHEEL_RADIUS - r} A ${r} ${r} 0 1 1 ${WHEEL_RADIUS - 0.01} ${WHEEL_RADIUS - r} Z`
                        : `M ${WHEEL_RADIUS} ${WHEEL_RADIUS} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                      // Label position at midpoint of arc
                      const midAngle = (seg.startAngle + seg.sweep / 2 - 90) * (Math.PI / 180);
                      const labelR = r * 0.62;
                      const lx = WHEEL_RADIUS + labelR * Math.cos(midAngle);
                      const ly = WHEEL_RADIUS + labelR * Math.sin(midAngle);

                      return (
                        <g key={i}>
                          <path d={path} fill={seg.color} stroke="#0e1015" strokeWidth="1.5" opacity={0.85} />
                          {seg.sweep > 20 && (
                            <text
                              x={lx}
                              y={ly}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="10"
                              fontWeight="bold"
                              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                            >
                              {(seg.name || '').slice(0, 8)}
                            </text>
                          )}
                          {seg.sweep > 30 && (
                            <text
                              x={lx}
                              y={ly + 12}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="rgba(255,255,255,0.6)"
                              fontSize="8"
                            >
                              {seg.chance.toFixed(1)}%
                            </text>
                          )}
                        </g>
                      );
                    })
                  ) : (
                    <text x={WHEEL_RADIUS} y={WHEEL_RADIUS} textAnchor="middle" dominantBaseline="middle" fill="#555" fontSize="14">
                      No deposits yet
                    </text>
                  )}

                  {/* Center circle */}
                  <circle cx={WHEEL_RADIUS} cy={WHEEL_RADIUS} r="32" fill="#13151a" stroke="#444" strokeWidth="2" />
                  <text x={WHEEL_RADIUS} y={WHEEL_RADIUS - 6} textAnchor="middle" dominantBaseline="middle" fill="#f0c040" fontSize="11" fontWeight="bold">
                    POT
                  </text>
                  <text x={WHEEL_RADIUS} y={WHEEL_RADIUS + 8} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9">
                    {state.pot.length} skins
                  </text>
                </svg>

                {/* Tick marks around the edge (decorative) */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(36)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-[1px] h-2 bg-gray-600"
                      style={{
                        left: '50%',
                        top: '0',
                        transformOrigin: `0 ${WHEEL_RADIUS}px`,
                        transform: `rotate(${i * 10}deg)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Winner Banner */}
            <AnimatePresence>
              {showResult && state.winner && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-4 p-5 rounded-xl text-center border relative overflow-hidden"
                  style={{
                    backgroundColor: `${state.winner.playerColor || '#e4b900'}08`,
                    borderColor: `${state.winner.playerColor || '#e4b900'}40`,
                  }}
                >
                  {/* Background glow */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ background: `radial-gradient(circle at center, ${state.winner.playerColor || '#e4b900'}, transparent 70%)` }}
                  />
                  <div className="relative">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Winner</div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div
                        className="w-5 h-5 rounded-full border-2"
                        style={{ backgroundColor: state.winner.playerColor, borderColor: state.winner.playerColor }}
                      />
                      <span className="text-xl font-bold text-white">{state.winner.playerName || 'Player'}</span>
                    </div>
                    <div className="text-yellow-400 text-2xl font-bold mb-1">
                      {formatPrice(state.winner.totalWon || state.potValue)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {state.winner.skinCount || 0} skins won with {state.winner.chance || '0'}% chance
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Deposit Button */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => { setShowModal(true); fetchInventory(); }}
                disabled={!canDeposit}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 bg-yellow-400/10 border-2 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/20 hover:border-yellow-400/70 hover:shadow-lg hover:shadow-yellow-400/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Deposit Skins
              </button>
            </div>
          </div>

          {/* Player List */}
          <div className="bg-[#13151a] rounded-xl border border-gray-800/50 p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Players ({playerList.length})
            </h2>
            {playerList.length === 0 ? (
              <div className="text-center text-gray-600 py-8 text-sm">No deposits yet. Be the first!</div>
            ) : (
              <div className="space-y-2">
                {playerList.map((p) => {
                  const isMe = String(p.id) === String(activePlayer?.id);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isMe ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-[#1a1c24] border-gray-800/30'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border" style={{ backgroundColor: p.color, borderColor: p.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white text-sm truncate">
                            {p.name || `Player ${p.id}`}
                            {isMe && <span className="text-yellow-400 text-xs ml-1.5">(You)</span>}
                          </span>
                          <span className="text-yellow-400 font-bold text-sm">{formatPrice(p.totalValue)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{p.skinCount || 0} skin{(p.skinCount || 0) !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-medium" style={{ color: p.color }}>{p.chance.toFixed(1)}%</span>
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.chance}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pot Skins */}
          {state.pot.length > 0 && (
            <div className="bg-[#13151a] rounded-xl border border-gray-800/50 p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Skins in Pot ({state.pot.length})
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {state.pot.map((skin, i) => {
                  const playerData = state.players[skin.playerId];
                  const borderColor = playerData ? playerData.color : '#555';
                  return (
                    <motion.div
                      key={skin.inventoryId || i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.03, 0.5) }}
                      className="rounded-lg overflow-hidden bg-[#1a1c24] border-2 p-1.5"
                      style={{ borderColor: `${borderColor}60` }}
                    >
                      <SkinImage
                        src={skin.imageUrl || skin.image_url}
                        name={skin.skinName || skin.marketHashName || skin.market_hash_name}
                        rarity={skin.rarity}
                        size="sm"
                      />
                      <div className="mt-1 text-center">
                        <div className="text-[9px] text-gray-400 truncate">{skin.marketHashName || skin.market_hash_name}</div>
                        <div className="text-[10px] text-yellow-400 font-bold">{formatPrice(skin.price)}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* History */}
          <div className="bg-[#13151a] rounded-xl border border-gray-800/50 p-5 sticky top-20">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recent Rounds
            </h2>
            {(!state.history || state.history.length === 0) ? (
              <div className="text-center text-gray-600 py-8 text-sm">No history yet</div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {state.history.slice(0, 10).map((round, i) => (
                  <motion.div
                    key={round.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-lg bg-[#1a1c24] border border-gray-800/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: round.winner?.playerColor || '#e4b900' }}
                        />
                        <span className="font-medium text-sm truncate" style={{ color: round.winner?.playerColor || '#fff' }}>
                          {round.winner?.playerName || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-yellow-400 text-xs font-bold flex-shrink-0">{formatPrice(round.potValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>{round.playerCount || 0} players &middot; {round.skinCount || 0} skins</span>
                      <span>{round.winner?.chance || '0'}% chance</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* How to Play */}
          <div className="bg-[#13151a] rounded-xl border border-gray-800/50 p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">How to Play</h2>
            <div className="space-y-2.5 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold mt-0.5">1.</span>
                <span>Deposit skins from your inventory into the pot</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold mt-0.5">2.</span>
                <span>Your win chance equals your share of the pot value</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold mt-0.5">3.</span>
                <span>More value deposited = higher chance to win</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold mt-0.5">4.</span>
                <span>After the timer, a winner is randomly drawn</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold mt-0.5">5.</span>
                <span>Winner receives all skins (minus 5% fee)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Skin Picker Modal ---- */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13151a] border border-gray-700/50 rounded-2xl w-[90vw] max-w-3xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-800/50">
                <div>
                  <h2 className="text-lg font-bold text-white">Select Skins to Deposit</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedIds.size} selected &mdash; {formatPrice(selectedTotal)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {availableSkins.length === 0 ? (
                  <div className="text-center text-gray-600 py-12">
                    <div className="text-4xl mb-3">&#128230;</div>
                    <p className="text-sm">No skins available to deposit.</p>
                    <p className="text-xs mt-1 text-gray-700">Open some cases first!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {availableSkins.map((skin) => {
                      const isSelected = selectedIds.has(skin.id);
                      const rarityColor = getRarityColor(skin.rarity);
                      return (
                        <motion.button
                          key={skin.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSkin(skin.id)}
                          className={`relative rounded-xl overflow-hidden p-2 transition-all duration-150 border-2 text-left ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-400/5 shadow-lg shadow-yellow-400/5'
                              : 'border-gray-800/50 bg-[#1a1c24] hover:border-gray-600'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center z-10">
                              <svg viewBox="0 0 20 20" fill="#000" className="w-3 h-3">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}

                          <SkinImage
                            src={skin.image_url}
                            name={skin.skin_name || skin.market_hash_name}
                            rarity={skin.rarity}
                            size="sm"
                          />

                          <div className="mt-1.5">
                            <div className="text-[10px] font-medium truncate" style={{ color: rarityColor }}>
                              {skin.skin_name || skin.market_hash_name}
                            </div>
                            <div className="text-[10px] text-yellow-400 font-bold mt-0.5">
                              {formatPrice(skin.price)}
                            </div>
                          </div>

                          <div className="h-0.5 rounded-full mt-1.5" style={{ backgroundColor: rarityColor, opacity: 0.5 }} />
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-gray-800/50 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {selectedIds.size > 0 && (
                    <span>Total: <span className="text-yellow-400 font-bold">{formatPrice(selectedTotal)}</span></span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    disabled={selectedIds.size === 0}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 bg-gray-800 hover:bg-gray-700 transition disabled:opacity-30"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleDeposit}
                    disabled={selectedIds.size === 0 || depositing}
                    className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {depositing ? 'Depositing...' : `Deposit ${selectedIds.size} Skin${selectedIds.size !== 1 ? 's' : ''} (${formatPrice(selectedTotal)})`}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
