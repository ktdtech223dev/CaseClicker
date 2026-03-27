import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { formatPrice, getSkinImageUrl, getRarityColor, formatFloat, wearShort } from '../../utils/helpers';

const RARITY_UPGRADE = {
  'Consumer Grade': 'Industrial Grade',
  'Industrial Grade': 'Mil-Spec',
  'Mil-Spec': 'Restricted',
  'Restricted': 'Classified',
  'Classified': 'Covert',
  'Covert': 'Rare Special',
};

export default function TradeUp() {
  const { activePlayer, fetchInventory, addNotification, pingNGame } = useGameStore();
  const [eligible, setEligible] = useState({});
  const [selectedRarity, setSelectedRarity] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    pingNGame({ screen: 'tradeup' });
    loadEligible();
  }, []);

  const loadEligible = async () => {
    try {
      const res = await fetch(`/api/tradeup/eligible/${activePlayer.id}`);
      const data = await res.json();
      setEligible(data);
    } catch (e) {
      console.error('Failed to load trade-up items:', e);
    }
  };

  const toggleItem = (item) => {
    if (!selectedRarity) {
      setSelectedRarity(item.rarity);
      setSelectedItems([item]);
      return;
    }
    if (item.rarity !== selectedRarity) return;

    setSelectedItems(prev => {
      if (prev.find(i => i.id === item.id)) {
        const next = prev.filter(i => i.id !== item.id);
        if (next.length === 0) setSelectedRarity(null);
        return next;
      }
      if (prev.length >= 10) return prev;
      return [...prev, item];
    });
  };

  const handleTradeUp = async () => {
    if (selectedItems.length !== 10) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/tradeup/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: activePlayer.id,
          inventoryIds: selectedItems.map(i => i.id),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        addNotification(err.error, 'red');
        setProcessing(false);
        return;
      }

      const data = await res.json();
      setResult(data.output);
      setSelectedItems([]);
      setSelectedRarity(null);
      loadEligible();
      fetchInventory();
    } catch (e) {
      addNotification('Trade-up failed', 'red');
    }
    setProcessing(false);
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setSelectedRarity(null);
  };

  const handleAutoFill = () => {
    // Use the first selected item's rarity, or the first available rarity
    const rarity = selectedRarity || Object.keys(eligible)[0];
    if (!rarity || !eligible[rarity]) return;

    const pool = eligible[rarity];
    const alreadySelectedIds = new Set(selectedItems.map(i => i.id));
    const available = pool.filter(i => !alreadySelectedIds.has(i.id));
    const slotsNeeded = 10 - selectedItems.length;
    const toAdd = available.slice(0, slotsNeeded);

    if (toAdd.length === 0) return;

    setSelectedRarity(rarity);
    setSelectedItems(prev => [...prev, ...toAdd]);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">TRADE UP CONTRACT</h1>

      <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6 mb-6">
        <p className="text-gray-400 mb-2">
          Select <span className="text-white font-bold">10 items of the same rarity</span> to trade up for 1 item of the next rarity tier.
        </p>
        <p className="text-gray-600 text-sm">
          StatTrak™ items will only produce StatTrak™ output if ALL 10 inputs are StatTrak™.
        </p>
      </div>

      {/* Selected items */}
      <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">
            SELECTED: {selectedItems.length}/10
            {selectedRarity && (
              <span className="ml-2 text-sm" style={{ color: getRarityColor(selectedRarity) }}>
                ({selectedRarity} → {RARITY_UPGRADE[selectedRarity]})
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoFill}
              disabled={selectedItems.length >= 10}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                selectedItems.length >= 10
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500'
              }`}
            >
              Auto Fill
            </button>
            {selectedItems.length > 0 && (
              <button onClick={clearSelection} className="text-gray-500 hover:text-white text-sm">
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: 10 }).map((_, i) => {
            const item = selectedItems[i];
            return (
              <div
                key={i}
                className={`h-24 rounded-lg border-2 border-dashed flex items-center justify-center ${
                  item ? 'border-gray-600 bg-gray-800/50' : 'border-gray-800'
                }`}
              >
                {item ? (
                  <div className="text-center p-1" onClick={() => toggleItem(item)}>
                    <img src={getSkinImageUrl(item.image_url)} alt="" className="h-12 mx-auto object-contain" />
                    <div className="text-[9px] text-gray-400 truncate">{item.skin_name}</div>
                  </div>
                ) : (
                  <span className="text-gray-700 text-xs">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleTradeUp}
          disabled={selectedItems.length !== 10 || processing}
          className={`w-full py-3 rounded-lg font-bold text-lg ${
            selectedItems.length === 10 && !processing
              ? 'bg-gradient-to-r from-csgo-gold to-yellow-600 text-black'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {processing ? 'PROCESSING...' : `TRADE UP (${selectedItems.length}/10)`}
        </button>
      </div>

      {/* Available items by rarity */}
      {Object.entries(eligible).map(([rarity, items]) => (
        <div key={rarity} className="mb-6">
          <h3 className="font-bold mb-2" style={{ color: getRarityColor(rarity) }}>
            {rarity} ({items.length} items) → {RARITY_UPGRADE[rarity]}
          </h3>
          <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {items.map(item => {
              const isSelected = selectedItems.find(i => i.id === item.id);
              const isDisabled = selectedRarity && selectedRarity !== rarity;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => !isDisabled && toggleItem(item)}
                  className={`bg-[#1a1d23] rounded-lg p-2 border cursor-pointer transition-all ${
                    isSelected ? 'border-csgo-gold ring-1 ring-csgo-gold/30' :
                    isDisabled ? 'border-gray-800 opacity-30 cursor-not-allowed' :
                    'border-gray-800 hover:border-gray-600'
                  }`}
                  style={{ borderBottomColor: getRarityColor(rarity), borderBottomWidth: 2 }}
                >
                  <img src={getSkinImageUrl(item.image_url)} alt="" className="h-14 w-full object-contain" />
                  <div className="text-[9px] text-gray-400 truncate mt-1">{item.skin_name}</div>
                  <div className="text-[8px] text-gray-600">{wearShort(item.wear)}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Result modal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1a1d23] rounded-xl p-8 max-w-md w-full border-2"
              style={{ borderColor: getRarityColor(result.rarity) }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">TRADE UP RESULT</div>
                <img src={getSkinImageUrl(result.image_id)} alt="" className="h-40 mx-auto object-contain mb-4" />
                {result.stattrak && <div className="text-orange-400 text-sm font-mono">StatTrak™</div>}
                <h3 className="text-xl font-bold" style={{ color: getRarityColor(result.rarity) }}>
                  {result.name}
                </h3>
                <div className="text-gray-400">{result.wear}</div>
                <div className="font-mono text-gray-500 text-sm">Float: {formatFloat(result.float_value)}</div>
                <div className="text-csgo-gold font-mono text-2xl font-bold mt-2">{formatPrice(result.price)}</div>
                <button
                  onClick={() => setResult(null)}
                  className="mt-4 px-8 py-2 bg-csgo-gold/20 text-csgo-gold border border-csgo-gold/30 rounded-lg"
                >
                  Nice!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
