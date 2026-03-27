import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { formatPrice, getSkinImageUrl, getRarityColor, getRarityBgClass, formatFloat, wearShort } from '../../utils/helpers';
import SkinImage from '../shared/SkinImage';
import { playSound } from '../../utils/audio';

const SORT_OPTIONS = [
  { value: 'date', label: 'Date Obtained' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'price', label: 'Price (High→Low)' },
  { value: 'name', label: 'Name' },
];

const RARITY_ORDER = ['Rare Special', 'Covert', 'Classified', 'Restricted', 'Mil-Spec', 'Industrial Grade', 'Consumer Grade'];

export default function Inventory() {
  const { inventory, fetchInventory, sellSkin, sellBulk, activePlayer, pingNGame } = useGameStore();
  const [sortBy, setSortBy] = useState('date');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterWear, setFilterWear] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    fetchInventory();
    pingNGame({ screen: 'inventory' });
  }, []);

  const sorted = [...inventory].sort((a, b) => {
    switch (sortBy) {
      case 'rarity': return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
      case 'name': return a.skin_name.localeCompare(b.skin_name);
      case 'price': return (b.price || 0) - (a.price || 0);
      default: return b.obtained_at - a.obtained_at;
    }
  });

  const filtered = sorted.filter(item => {
    if (filterRarity !== 'all' && item.rarity !== filterRarity) return false;
    if (filterWear !== 'all' && item.wear !== filterWear) return false;
    return true;
  });

  const toggleSelect = (id) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkSell = async () => {
    if (selectedItems.size === 0) return;
    playSound('sell');
    await sellBulk(Array.from(selectedItems));
    setSelectedItems(new Set());
  };

  const [showSellAllConfirm, setShowSellAllConfirm] = useState(false);

  const toggleLock = async (itemId) => {
    try {
      const res = await fetch(`/api/players/inventory/${itemId}/lock`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        fetchInventory();
        if (detailItem && detailItem.id === itemId) {
          setDetailItem(prev => ({ ...prev, locked: data.locked }));
        }
      }
    } catch (e) { console.error('Lock toggle failed:', e); }
  };

  const unlocked = inventory.filter(i => !i.locked);
  const sellableCount = unlocked.length;
  const sellableTotal = unlocked.reduce((sum, i) => sum + (i.price || 0), 0);

  const handleSellAll = async () => {
    if (sellableCount === 0) return;
    playSound('sell');
    await sellBulk(unlocked.map(i => i.id));
    setSelectedItems(new Set());
    setShowSellAllConfirm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">INVENTORY</h1>
        <div className="text-gray-400">
          {inventory.length} items
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-[#1a1d23] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={filterRarity}
          onChange={e => setFilterRarity(e.target.value)}
          className="bg-[#1a1d23] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Rarities</option>
          {RARITY_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={filterWear}
          onChange={e => setFilterWear(e.target.value)}
          className="bg-[#1a1d23] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Wear</option>
          <option value="Factory New">Factory New</option>
          <option value="Minimal Wear">Minimal Wear</option>
          <option value="Field-Tested">Field-Tested</option>
          <option value="Well-Worn">Well-Worn</option>
          <option value="Battle-Scarred">Battle-Scarred</option>
        </select>

        {selectedItems.size > 0 && (
          <button
            onClick={handleBulkSell}
            className="bg-csgo-gold/20 text-csgo-gold border border-csgo-gold/30 px-4 py-2 rounded-lg text-sm font-bold hover:bg-csgo-gold/30"
          >
            Sell {selectedItems.size} Selected
          </button>
        )}

        {inventory.length > 0 && (
          <button
            onClick={() => setShowSellAllConfirm(true)}
            className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/30 ml-auto"
          >
            Sell All ({inventory.length})
          </button>
        )}
      </div>

      {/* Sell All Confirmation Modal */}
      {showSellAllConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setShowSellAllConfirm(false)}>
          <div className="bg-[#1a1d23] border border-red-500/50 rounded-xl p-6 max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2">Sell Unlocked Inventory?</h3>
            <p className="text-gray-400 mb-1">
              This will sell <span className="text-white font-bold">{sellableCount} unlocked items</span>.
              {inventory.length - sellableCount > 0 && (
                <span className="text-blue-400"> ({inventory.length - sellableCount} locked items will be kept)</span>
              )}
            </p>
            <p className="text-gray-400 mb-4">
              Estimated total: <span className="text-csgo-gold font-bold font-mono">
                {formatPrice(sellableTotal * 0.93)}
              </span>
              <span className="text-gray-500 text-sm"> (after 7% fee)</span>
            </p>
            <p className="text-red-400 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleSellAll}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
              >
                Sell Everything
              </button>
              <button
                onClick={() => setShowSellAllConfirm(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className={`bg-[#1a1d23] rounded-lg border cursor-pointer transition-all relative group ${
              item.locked ? 'border-blue-500/40 ring-1 ring-blue-500/20' :
              selectedItems.has(item.id) ? 'border-csgo-gold ring-1 ring-csgo-gold/30' : 'border-gray-800 hover:border-gray-600'
            }`}
            style={{ borderBottomColor: getRarityColor(item.rarity), borderBottomWidth: 3 }}
          >
            {/* Checkbox */}
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                selectedItems.has(item.id) ? 'bg-csgo-gold border-csgo-gold' : 'border-gray-600 hover:border-gray-400'
              }`}>
                {selectedItems.has(item.id) && <span className="text-black text-xs">✓</span>}
              </div>
            </div>

            {/* Lock icon */}
            <div
              className="absolute top-2 right-2 z-10"
              onClick={(e) => { e.stopPropagation(); toggleLock(item.id); }}
              title={item.locked ? 'Unlock item' : 'Lock item'}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded transition cursor-pointer ${
                item.locked ? 'text-blue-400 hover:text-blue-300' : 'text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100'
              }`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {item.locked ? (
                    <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>
                  ) : (
                    <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></>
                  )}
                </svg>
              </div>
            </div>

            <div onClick={() => setDetailItem(item)} className="p-3">
              {item.stattrak === 1 && (
                <div className="text-[9px] text-orange-400 font-mono mb-1">StatTrak™</div>
              )}
              <SkinImage
                src={getSkinImageUrl(item.image_url, item.skin_name)}
                name={item.skin_name}
                rarity={item.rarity}
                size="md"
              />
              <div className="text-xs text-white truncate">{item.skin_name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-400">{wearShort(item.wear)}</span>
                <span className="text-[10px] font-mono" style={{ color: getRarityColor(item.rarity) }}>
                  {item.rarity?.split(' ')[0]}
                </span>
              </div>
              {item.price > 0 && (
                <div className="text-xs text-csgo-gold font-mono mt-1">{formatPrice(item.price)}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-600 py-20">
          <div className="text-5xl mb-4">🎒</div>
          <div>Your inventory is empty. Open some cases!</div>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {detailItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={() => setDetailItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1d23] rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <SkinImage
                src={getSkinImageUrl(detailItem.image_url, detailItem.skin_name)}
                name={detailItem.skin_name}
                rarity={detailItem.rarity}
                size="xl"
              />
              {detailItem.stattrak === 1 && (
                <div className="text-orange-400 text-sm font-mono mb-1">StatTrak™</div>
              )}
              {detailItem.custom_name && (
                <div className="text-csgo-gold text-sm mb-1">"{detailItem.custom_name}"</div>
              )}
              <h3 className="text-xl font-bold" style={{ color: getRarityColor(detailItem.rarity) }}>
                {detailItem.skin_name}
              </h3>
              <div className="text-gray-400 mt-1">{detailItem.wear}</div>
              <div className="font-mono text-gray-500 text-sm mt-1">
                Float: {formatFloat(detailItem.float_value)}
              </div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
                  style={{ width: `${detailItem.float_value * 100}%` }}
                />
              </div>
              {detailItem.price > 0 && (
                <div className="text-csgo-gold font-mono text-2xl font-bold mt-3">{formatPrice(detailItem.price)}</div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                From: {detailItem.case_name || 'Unknown'}
              </div>

              {/* Rename section */}
              <RenameSection item={detailItem} onRenamed={(updated) => {
                setDetailItem(updated);
                fetchInventory();
              }} />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleLock(detailItem.id)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm transition ${
                    detailItem.locked
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                      : 'bg-gray-700/30 text-gray-400 border border-gray-700 hover:bg-gray-700/50'
                  }`}
                  title={detailItem.locked ? 'Unlock this item' : 'Lock to prevent selling'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                    {detailItem.locked ? (
                      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>
                    ) : (
                      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></>
                    )}
                  </svg>
                  {detailItem.locked ? 'Locked' : 'Lock'}
                </button>
                <button
                  onClick={async () => {
                    if (detailItem.locked) return;
                    playSound('sell');
                    await sellSkin(detailItem.id);
                    setDetailItem(null);
                  }}
                  disabled={detailItem.locked}
                  className={`flex-1 py-2 rounded-lg font-bold transition ${
                    detailItem.locked
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-csgo-gold/20 text-csgo-gold border border-csgo-gold/30 hover:bg-csgo-gold/30'
                  }`}
                >
                  {detailItem.locked ? 'Unlock to sell' : detailItem.price > 0 ? `Sell for ${formatPrice(detailItem.price * 0.93)}` : 'Sell to Market'}
                </button>
                <button
                  onClick={() => setDetailItem(null)}
                  className="px-4 py-2 bg-gray-700/30 text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-700/50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RenameSection({ item, onRenamed }) {
  const { activePlayer, addNotification } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(item.custom_name || '');

  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayer.id, inventoryId: item.id, newName }),
      });
      if (!res.ok) {
        const err = await res.json();
        addNotification(err.error, 'red');
        return;
      }
      const data = await res.json();
      addNotification('Item renamed!', 'green');
      setEditing(false);
      onRenamed(data.item);
      // Update player wallet
      useGameStore.setState({ activePlayer: data.player });
      useGameStore.setState(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));
    } catch (e) {
      addNotification('Rename failed', 'red');
    }
  };

  const handleRemoveName = async () => {
    try {
      const res = await fetch('/api/rename/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayer.id, inventoryId: item.id }),
      });
      const data = await res.json();
      onRenamed(data.item);
      setNewName('');
    } catch (e) {}
  };

  if (!editing) {
    return (
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setEditing(true)}
          className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700"
        >
          {item.custom_name ? 'Edit Name' : 'Add Name Tag ($1.99)'}
        </button>
        {item.custom_name && (
          <button
            onClick={handleRemoveName}
            className="text-xs px-3 py-1 bg-gray-800 text-gray-500 rounded hover:bg-gray-700"
          >
            Remove Name
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Enter name..."
          maxLength={40}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
          autoFocus
        />
        <button
          onClick={handleRename}
          className="px-3 py-1.5 bg-csgo-gold/20 text-csgo-gold rounded text-sm font-bold"
        >
          Apply ($1.99)
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
