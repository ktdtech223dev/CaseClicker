import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { formatPrice, getSkinImageUrl, getRarityColor, formatFloat, wearShort } from '../../utils/helpers';
import SkinImage, { CaseImage } from '../shared/SkinImage';
import { playSound, getRevealSound } from '../../utils/audio';

const ITEM_WIDTH = 140;
const VISIBLE_ITEMS = 7;
const REEL_CONTAINER_WIDTH = ITEM_WIDTH * VISIBLE_ITEMS;

export default function CaseOpen() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { openCase, finishCaseOpening, caseResult, caseReel, activePlayer, sellImmediate, pingNGame, postToWall, addNotification, fetchPlayers } = useGameStore();
  const [caseData, setCaseData] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [reelOffset, setReelOffset] = useState(0);
  const [fastSpin, setFastSpin] = useState(false);
  const [multiOpen, setMultiOpen] = useState(1);
  const [multiResults, setMultiResults] = useState([]);
  const [showMultiResults, setShowMultiResults] = useState(false);
  const [selectedKeep, setSelectedKeep] = useState(new Set());
  const [hoveredSkin, setHoveredSkin] = useState(null);
  const [skinPrices, setSkinPrices] = useState(null);
  const [showStatTrak, setShowStatTrak] = useState(false);
  const [multiProgress, setMultiProgress] = useState(0);
  const reelRef = useRef(null);

  useEffect(() => {
    fetch(`/api/cases/${caseId}`).then(r => r.json()).then(setCaseData);
    pingNGame({ screen: 'case_opening', case: caseId });
  }, [caseId]);

  const spinDuration = fastSpin ? 1.5 : 5;
  const revealDelay = fastSpin ? 1800 : 5500;

  // Fetch skin prices on hover
  const handleSkinHover = async (skin) => {
    setHoveredSkin(skin);
    setSkinPrices(null);
    setShowStatTrak(false);
    try {
      const res = await fetch(`/api/prices/skin?name=${encodeURIComponent(skin.name)}`);
      if (res.ok) {
        const data = await res.json();
        setSkinPrices(data);
      }
    } catch (e) { /* ignore */ }
  };

  const handleSingleOpen = async () => {
    if (phase !== 'idle') return;
    const totalCost = (caseData?.price || 2.49) + 2.49;
    if (activePlayer.wallet < totalCost) {
      addNotification('Not enough money!', 'error');
      return;
    }
    setPhase('spinning');
    playSound('case_spin');
    const result = await openCase(caseId);
    if (!result) { setPhase('idle'); return; }
    const winPos = result.winPosition;
    const containerCenter = REEL_CONTAINER_WIDTH / 2;
    const itemCenter = winPos * ITEM_WIDTH + ITEM_WIDTH / 2;
    const targetOffset = -(itemCenter - containerCenter) + (Math.random() * 20 - 10);
    setReelOffset(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { setReelOffset(targetOffset); });
    });
    setTimeout(() => {
      setPhase('reveal');
      const rarity = result?.skin?.rarity || useGameStore.getState().caseResult?.rarity;
      if (rarity) playSound(getRevealSound(rarity));
    }, revealDelay);
  };

  const handleMultiOpen = async () => {
    if (phase !== 'idle') return;
    const totalCost = ((caseData?.price || 2.49) + 2.49) * multiOpen;
    if (activePlayer.wallet < totalCost) {
      addNotification(`Need ${formatPrice(totalCost)} to open ${multiOpen} cases!`, 'error');
      return;
    }
    setPhase('spinning');
    setMultiProgress(0);
    try {
      const res = await fetch(`/api/cases/open-multi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayer.id, caseId, count: multiOpen }),
      });
      if (!res.ok) {
        const err = await res.json();
        addNotification(err.error || 'Failed', 'error');
        setPhase('idle');
        return;
      }
      const data = await res.json();
      const results = data.skins;
      setMultiProgress(multiOpen);
      for (const skin of results) {
        if (['Classified', 'Covert', 'Rare Special'].includes(skin.rarity)) {
          const playerName = activePlayer?.name || 'Player';
          const skinData = { name: skin.name, rarity: skin.rarity, wear: skin.wear, price: skin.price, image_id: skin.image_id, case_name: skin.case_name };
          postToWall(`${playerName} unboxed ${skin.market_hash_name} from ${skin.case_name} — $${skin.price.toFixed(2)}`, skinData);
        }
      }
      setMultiResults(results);
      setSelectedKeep(new Set(results.map((_, i) => i)));
      setPhase('idle');
      if (results.length > 0) setShowMultiResults(true);
    } catch (e) {
      addNotification('Failed to open cases', 'error');
      setPhase('idle');
    }
    await fetchPlayers();
  };

  const handleOpen = () => {
    if (multiOpen > 1) handleMultiOpen();
    else handleSingleOpen();
  };

  const handleSell = async () => {
    if (caseResult) {
      playSound('sell');
      await sellImmediate(caseResult.id, caseResult.price);
      setPhase('idle');
      finishCaseOpening();
    }
  };

  const handleKeep = () => {
    setPhase('idle');
    finishCaseOpening();
    addNotification('Added to inventory!', 'success');
  };

  const toggleKeepSkin = (idx) => {
    setSelectedKeep(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleConfirmMulti = async () => {
    // Sell unselected skins
    const sellIds = multiResults
      .filter((_, i) => !selectedKeep.has(i))
      .map(s => s.id)
      .filter(Boolean);
    if (sellIds.length > 0) {
      await useGameStore.getState().sellBulk(sellIds);
    }
    const keptCount = selectedKeep.size;
    const soldCount = sellIds.length;
    if (keptCount > 0 && soldCount > 0) {
      addNotification(`Kept ${keptCount}, sold ${soldCount} skins`, 'success');
    } else if (keptCount > 0) {
      addNotification(`${keptCount} skins added to inventory!`, 'success');
    }
    setShowMultiResults(false);
    setMultiResults([]);
    setSelectedKeep(new Set());
    await fetchPlayers();
  };

  const handleSellAll = async () => {
    const ids = multiResults.map(s => s.id).filter(Boolean);
    if (ids.length > 0) await useGameStore.getState().sellBulk(ids);
    setShowMultiResults(false);
    setMultiResults([]);
    setSelectedKeep(new Set());
  };

  const handleKeepAll = () => {
    setShowMultiResults(false);
    setMultiResults([]);
    setSelectedKeep(new Set());
    addNotification(`${multiResults.length} skins added to inventory!`, 'success');
  };

  if (!caseData) return <div className="text-gray-500 p-8">Loading case...</div>;

  const totalCost = (caseData.price + 2.49) * multiOpen;
  const keepCount = selectedKeep.size;
  const sellCount = multiResults.length - keepCount;
  const sellValue = multiResults.filter((_, i) => !selectedKeep.has(i)).reduce((s, sk) => s + (sk.price * 0.93), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => navigate('/cases')} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Cases
      </button>

      <div className="flex items-center gap-6 mb-6">
        <div className="h-24 w-32"><CaseImage src={caseData.image} name={caseData.name} /></div>
        <div>
          <h1 className="text-3xl font-bold text-white">{caseData.name}</h1>
          <p className="text-gray-400">Cost: <span className="text-csgo-gold font-mono">{formatPrice(caseData.price + 2.49)}</span><span className="text-gray-600 ml-2">(Case + Key)</span></p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 bg-[#1a1d23] rounded-xl border border-gray-800 p-4">
        <button onClick={() => setFastSpin(!fastSpin)} className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${fastSpin ? 'bg-csgo-gold/20 text-csgo-gold border-csgo-gold/40' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}`}>
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Fast Spin
        </button>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Open:</span>
          {[1, 5, 10, 25].map(n => (
            <button key={n} onClick={() => setMultiOpen(n)} className={`px-3 py-2 rounded-lg text-sm font-bold transition border ${multiOpen === n ? 'bg-csgo-purple/20 text-csgo-purple border-csgo-purple/40' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}`}>{n}x</button>
          ))}
        </div>
        <div className="ml-auto text-right">
          <div className="text-gray-500 text-xs">Total Cost</div>
          <div className="text-csgo-gold font-mono font-bold">{formatPrice(totalCost)}</div>
        </div>
      </div>

      {/* Reel (single opens only) */}
      {multiOpen === 1 && (
        <div className="relative bg-[#111318] rounded-xl border border-gray-800 overflow-hidden mb-6">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10"><div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-csgo-gold" /></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10"><div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-csgo-gold" /></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-csgo-gold/30 z-10 transform -translate-x-[1px]" />
          <div className="h-44 overflow-hidden relative" style={{ width: `${REEL_CONTAINER_WIDTH}px`, margin: '0 auto' }}>
            {phase !== 'idle' && caseReel.length > 0 ? (
              <div ref={reelRef} className="flex items-center h-full absolute left-0" style={{ transform: `translateX(${reelOffset}px)`, transition: phase === 'spinning' ? `transform ${spinDuration}s cubic-bezier(0.15, 0.85, 0.35, 1)` : 'none' }}>
                {caseReel.map((item, i) => (
                  <div key={i} className={`flex-shrink-0 flex flex-col items-center justify-center p-2 border-r border-gray-800/50 ${item.isWinner ? 'bg-white/5' : ''}`} style={{ width: ITEM_WIDTH, borderBottom: `3px solid ${getRarityColor(item.rarity)}` }}>
                    <SkinImage src={getSkinImageUrl(item.image_id, item.name)} name={item.name} rarity={item.rarity} size="md" />
                    <div className="text-[10px] text-gray-400 truncate max-w-full text-center mt-1">{item.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">Click Open to spin</div>
            )}
          </div>
        </div>
      )}

      {/* Open button */}
      {phase === 'idle' && !showMultiResults && (
        <div className="flex justify-center mb-8">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleOpen} disabled={activePlayer.wallet < totalCost}
            className={`px-12 py-4 font-bold text-xl rounded-lg transition-all ${activePlayer.wallet >= totalCost ? 'bg-gradient-to-r from-csgo-gold to-yellow-600 text-black hover:shadow-lg hover:shadow-csgo-gold/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
            {multiOpen > 1 ? `OPEN ${multiOpen} CASES — ${formatPrice(totalCost)}` : `OPEN CASE — ${formatPrice(totalCost)}`}
          </motion.button>
        </div>
      )}

      {/* Multi-open progress with live results */}
      {phase === 'spinning' && multiOpen > 1 && (
        <div className="mb-8">
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-3 border-csgo-gold border-t-transparent rounded-full animate-spin" />
                <div className="text-white font-bold">Opening cases... {multiProgress}/{multiOpen}</div>
              </div>
              <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-csgo-gold transition-all rounded-full" style={{ width: `${(multiProgress / multiOpen) * 100}%` }} />
              </div>
            </div>
            {/* Live results grid */}
            {multiResults.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {multiResults.map((skin, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#111318] rounded-lg p-2 border border-gray-800" style={{ borderBottomColor: getRarityColor(skin.rarity), borderBottomWidth: 3 }}>
                    <SkinImage src={getSkinImageUrl(skin.image_id, skin.name)} name={skin.name} rarity={skin.rarity} size="sm" />
                    <div className="text-[9px] text-white truncate mt-1">{skin.name}</div>
                    <div className="text-[10px] text-csgo-gold font-mono">{formatPrice(skin.price)}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-open results with selective keep */}
      <AnimatePresence>
        {showMultiResults && multiResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-8">
            <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Opened {multiResults.length} Cases</h2>
                <div className="text-csgo-gold font-mono font-bold text-xl">Total: {formatPrice(multiResults.reduce((sum, s) => sum + s.price, 0))}</div>
              </div>
              <p className="text-gray-500 text-sm mb-4">Click skins to toggle keep/sell. Green border = keeping, no border = selling.</p>

              <div className="grid grid-cols-5 gap-3 mb-4">
                {multiResults.map((skin, i) => {
                  const keeping = selectedKeep.has(i);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                      onClick={() => toggleKeepSkin(i)}
                      className={`relative bg-[#111318] rounded-lg p-3 cursor-pointer transition-all ${keeping ? 'border-2 border-green-500 shadow-lg shadow-green-500/10' : 'border border-gray-800 opacity-60 hover:opacity-80'}`}
                      style={{ borderBottomColor: keeping ? getRarityColor(skin.rarity) : '#333', borderBottomWidth: 3 }}>
                      {/* Keep/sell badge */}
                      <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${keeping ? 'bg-green-500 text-white' : 'bg-red-500/80 text-white'}`}>
                        {keeping ? '✓' : '$'}
                      </div>
                      <SkinImage src={getSkinImageUrl(skin.image_id, skin.name)} name={skin.name} rarity={skin.rarity} size="sm" />
                      <div className="text-[10px] text-white truncate mt-1">{skin.name}</div>
                      {skin.stattrak && <div className="text-[9px] text-orange-400 font-mono">StatTrak</div>}
                      <div className="text-[10px] text-gray-500">{skin.wear}</div>
                      <div className="text-xs text-csgo-gold font-mono">{formatPrice(skin.price)}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Summary + actions */}
              <div className="bg-[#111318] rounded-lg p-3 mb-4 flex items-center justify-between text-sm">
                <div className="flex gap-6">
                  <span className="text-green-400">Keeping: {keepCount}</span>
                  <span className="text-red-400">Selling: {sellCount}</span>
                  {sellCount > 0 && <span className="text-csgo-gold font-mono">Sell value: {formatPrice(sellValue)}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedKeep(new Set(multiResults.map((_, i) => i)))} className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded hover:bg-green-500/20 transition">Select All</button>
                  <button onClick={() => setSelectedKeep(new Set())} className="px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition">Deselect All</button>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleKeepAll} className="flex-1 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg font-bold hover:bg-green-500/20 transition">Keep All</button>
                <button onClick={handleConfirmMulti} className="flex-1 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-bold hover:bg-blue-500/20 transition">
                  {sellCount > 0 ? `Keep ${keepCount} / Sell ${sellCount} (${formatPrice(sellValue)})` : `Keep All ${keepCount}`}
                </button>
                <button onClick={handleSellAll} className="flex-1 py-3 bg-csgo-gold/10 text-csgo-gold border border-csgo-gold/20 rounded-lg font-bold hover:bg-csgo-gold/20 transition">
                  Sell All ({formatPrice(multiResults.reduce((s, sk) => s + sk.price * 0.93, 0))})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single result reveal */}
      <AnimatePresence>
        {phase === 'reveal' && caseResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && handleKeep()}>
            <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }}
              className="bg-[#1a1d23] rounded-2xl p-8 max-w-lg w-full mx-4 border-2 relative overflow-hidden" style={{ borderColor: getRarityColor(caseResult.rarity) }}>
              <div className="absolute inset-0 rounded-2xl opacity-10" style={{ background: `radial-gradient(circle, ${getRarityColor(caseResult.rarity)}, transparent 70%)` }} />
              <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ delay: 0.2, type: 'spring' }} className="flex justify-center mb-6 relative">
                <SkinImage src={getSkinImageUrl(caseResult.image_id, caseResult.name)} name={caseResult.name} rarity={caseResult.rarity} size="xl" />
              </motion.div>
              <div className="text-center relative">
                {caseResult.stattrak && <div className="text-orange-400 text-sm font-mono mb-1">StatTrak™</div>}
                <h2 className="text-2xl font-bold" style={{ color: getRarityColor(caseResult.rarity) }}>{caseResult.name}</h2>
                <div className="text-gray-400 mt-1">{caseResult.wear} ({wearShort(caseResult.wear)})</div>
                <div className="font-mono text-gray-500 text-sm mt-1">Float: {formatFloat(caseResult.float_value)}</div>
                <div className="mt-3 mx-auto max-w-xs">
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${caseResult.float_value * 100}%`, background: 'linear-gradient(to right, #4ade80, #facc15, #ef4444)' }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-600 mt-0.5"><span>FN</span><span>MW</span><span>FT</span><span>WW</span><span>BS</span></div>
                </div>
                <div className="text-csgo-gold font-mono text-3xl font-bold mt-4">{formatPrice(caseResult.price)}</div>
                <div className="text-sm mt-1" style={{ color: getRarityColor(caseResult.rarity) }}>{caseResult.rarity}</div>
              </div>
              <div className="flex flex-col gap-3 mt-6 relative">
                <div className="flex gap-4">
                  <button onClick={handleKeep} className="flex-1 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg font-bold hover:bg-green-500/20 transition">Add to Inventory</button>
                  <button onClick={handleSell} className="flex-1 py-3 bg-csgo-gold/10 text-csgo-gold border border-csgo-gold/20 rounded-lg font-bold hover:bg-csgo-gold/20 transition">Sell for {formatPrice(caseResult.price * 0.93)}</button>
                </div>
                <button onClick={() => {
                  const playerName = activePlayer?.name || 'Player';
                  const st = caseResult.stattrak ? 'StatTrak\u2122 ' : '';
                  postToWall(`${playerName} unboxed ${st}${caseResult.name} (${caseResult.wear}) from ${caseData.name} — $${caseResult.price.toFixed(2)}`);
                  addNotification('Posted to Crew Wall!', 'success');
                }} className="w-full py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-bold hover:bg-blue-500/20 transition text-sm">
                  Share to Crew Wall
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case contents with price preview on hover */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-4">CASE CONTENTS</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...(caseData.skins || []), ...(caseData.rare_special || [])].map((skin, i) => (
            <div key={i} className="relative group"
              onMouseEnter={() => handleSkinHover(skin)}
              onMouseLeave={() => { setHoveredSkin(null); setSkinPrices(null); }}>
              <div className="bg-[#1a1d23] rounded-lg p-3 border border-gray-800 hover:border-gray-600 transition cursor-pointer"
                style={{ borderBottomColor: getRarityColor(skin.rarity), borderBottomWidth: 3 }}>
                <SkinImage src={getSkinImageUrl(skin.image_id, skin.name)} name={skin.name} rarity={skin.rarity} size="md" />
                <div className="text-xs text-white truncate mt-1">{skin.name}</div>
                <div className="text-[10px]" style={{ color: getRarityColor(skin.rarity) }}>{skin.rarity}</div>
              </div>

              {/* Price tooltip */}
              {hoveredSkin === skin && skinPrices && (
                <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0e1015] border border-gray-700 rounded-xl p-3 shadow-2xl pointer-events-auto"
                  onMouseEnter={() => {}} onMouseLeave={() => { setHoveredSkin(null); setSkinPrices(null); }}>
                  <div className="text-xs text-white font-bold mb-2 truncate">{skin.name}</div>
                  {/* StatTrak toggle */}
                  <button onClick={(e) => { e.stopPropagation(); setShowStatTrak(!showStatTrak); }}
                    className={`text-[10px] px-2 py-0.5 rounded mb-2 transition ${showStatTrak ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                    {showStatTrak ? 'StatTrak™ ON' : 'StatTrak™ OFF'}
                  </button>
                  <div className="space-y-1">
                    {['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'].map(w => {
                      const p = showStatTrak ? skinPrices.stattrak_prices?.[w] : skinPrices.prices?.[w];
                      return (
                        <div key={w} className="flex justify-between text-[11px]">
                          <span className="text-gray-400">{wearShort(w)}</span>
                          <span className="text-csgo-gold font-mono">{p ? formatPrice(p) : '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-[#0e1015] border-r border-b border-gray-700 rotate-45" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
