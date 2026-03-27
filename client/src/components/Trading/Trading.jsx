import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { formatPrice, getSkinImageUrl, getRarityColor, wearShort } from '../../utils/helpers';
import SkinImage from '../shared/SkinImage';

const TABS = ['Browse', 'Pending', 'History'];

export default function Trading() {
  const { players, activePlayer, activePlayerId, addNotification, fetchInventory, fetchPlayers, pingNGame } = useGameStore();
  const [activeTab, setActiveTab] = useState('Browse');
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [theirInventory, setTheirInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [pendingTrades, setPendingTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const otherPlayers = players.filter(p => p.id !== activePlayerId);

  useEffect(() => {
    pingNGame({ screen: 'trading' });
  }, []);

  useEffect(() => {
    if (activeTab === 'Pending') loadPendingTrades();
    if (activeTab === 'History') loadTradeHistory();
  }, [activeTab]);

  const loadPlayerInventory = async (playerId) => {
    setLoadingInventory(true);
    try {
      const res = await fetch(`/api/trades/inventory/${playerId}`);
      const data = await res.json();
      setTheirInventory(data);
    } catch (e) {
      addNotification('Failed to load inventory', 'red');
    }
    setLoadingInventory(false);
  };

  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId);
    loadPlayerInventory(playerId);
  };

  const loadPendingTrades = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch(`/api/trades/pending/${activePlayerId}`);
      const data = await res.json();
      setPendingTrades(data);
    } catch (e) {
      addNotification('Failed to load trades', 'red');
    }
    setLoadingPending(false);
  };

  const loadTradeHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/trades/history/${activePlayerId}`);
      const data = await res.json();
      setTradeHistory(data);
    } catch (e) {
      addNotification('Failed to load history', 'red');
    }
    setLoadingHistory(false);
  };

  const handleAcceptTrade = async (tradeId) => {
    try {
      const res = await fetch(`/api/trades/${tradeId}/accept`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        addNotification(err.error, 'red');
        return;
      }
      addNotification('Trade accepted!', 'green');
      loadPendingTrades();
      fetchInventory();
      fetchPlayers();
    } catch (e) {
      addNotification('Failed to accept trade', 'red');
    }
  };

  const handleDeclineTrade = async (tradeId) => {
    try {
      const res = await fetch(`/api/trades/${tradeId}/decline`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        addNotification(err.error, 'red');
        return;
      }
      addNotification('Trade declined', 'yellow');
      loadPendingTrades();
    } catch (e) {
      addNotification('Failed to decline trade', 'red');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">TRADING</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#1a1d23] rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-yellow-400/20 text-yellow-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
            {tab === 'Pending' && pendingTrades.length > 0 && (
              <span className="ml-1.5 bg-yellow-400/20 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingTrades.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Browse' && (
        <BrowseTab
          otherPlayers={otherPlayers}
          selectedPlayerId={selectedPlayerId}
          theirInventory={theirInventory}
          loadingInventory={loadingInventory}
          onSelectPlayer={handleSelectPlayer}
          onOpenTradeModal={() => setTradeModalOpen(true)}
        />
      )}

      {activeTab === 'Pending' && (
        <PendingTab
          trades={pendingTrades}
          loading={loadingPending}
          activePlayerId={activePlayerId}
          onAccept={handleAcceptTrade}
          onDecline={handleDeclineTrade}
        />
      )}

      {activeTab === 'History' && (
        <HistoryTab
          trades={tradeHistory}
          loading={loadingHistory}
          activePlayerId={activePlayerId}
        />
      )}

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModalOpen && selectedPlayerId && (
          <TradeModal
            activePlayerId={activePlayerId}
            targetPlayerId={selectedPlayerId}
            targetPlayer={players.find(p => p.id === selectedPlayerId)}
            theirInventory={theirInventory}
            onClose={() => setTradeModalOpen(false)}
            onTradeCreated={() => {
              setTradeModalOpen(false);
              setActiveTab('Pending');
              loadPendingTrades();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========== Browse Tab ========== */
function BrowseTab({ otherPlayers, selectedPlayerId, theirInventory, loadingInventory, onSelectPlayer, onOpenTradeModal }) {
  return (
    <div>
      {/* Player selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Select a player to browse their inventory:</label>
        <div className="flex gap-3 flex-wrap">
          {otherPlayers.map(player => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                selectedPlayerId === player.id
                  ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
                  : 'border-gray-700 bg-[#1a1d23] text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
              <span className="text-sm font-medium">{player.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected player's inventory */}
      {selectedPlayerId && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 text-sm">
              {loadingInventory ? 'Loading...' : `${theirInventory.length} items`}
            </div>
            <button
              onClick={onOpenTradeModal}
              disabled={theirInventory.length === 0 && !loadingInventory}
              className="px-4 py-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg text-sm font-bold hover:bg-yellow-400/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Send Trade Offer
            </button>
          </div>

          {loadingInventory ? (
            <div className="text-center text-gray-500 py-16">Loading inventory...</div>
          ) : theirInventory.length === 0 ? (
            <div className="text-center text-gray-600 py-16">This player has no items.</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {theirInventory.map(item => (
                <SkinCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedPlayerId && (
        <div className="text-center text-gray-600 py-20">
          Select a player above to browse their inventory.
        </div>
      )}
    </div>
  );
}

/* ========== Pending Tab ========== */
function PendingTab({ trades, loading, activePlayerId, onAccept, onDecline }) {
  if (loading) return <div className="text-center text-gray-500 py-16">Loading trades...</div>;

  const incoming = trades.filter(t => t.to_player_id === activePlayerId);
  const outgoing = trades.filter(t => t.from_player_id === activePlayerId);

  if (trades.length === 0) {
    return <div className="text-center text-gray-600 py-20">No pending trades.</div>;
  }

  return (
    <div className="space-y-6">
      {incoming.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Incoming Offers</h2>
          <div className="space-y-3">
            {incoming.map(trade => (
              <TradeCard
                key={trade.id}
                trade={trade}
                direction="incoming"
                onAccept={() => onAccept(trade.id)}
                onDecline={() => onDecline(trade.id)}
              />
            ))}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Outgoing Offers</h2>
          <div className="space-y-3">
            {outgoing.map(trade => (
              <TradeCard
                key={trade.id}
                trade={trade}
                direction="outgoing"
                onDecline={() => onDecline(trade.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== History Tab ========== */
function HistoryTab({ trades, loading, activePlayerId }) {
  if (loading) return <div className="text-center text-gray-500 py-16">Loading history...</div>;

  if (trades.length === 0) {
    return <div className="text-center text-gray-600 py-20">No trade history yet.</div>;
  }

  return (
    <div className="space-y-3">
      {trades.map(trade => {
        const isSender = trade.from_player_id === activePlayerId;
        const otherPlayer = isSender ? trade.toPlayer : trade.fromPlayer;
        const statusColor = trade.status === 'accepted' ? 'text-green-400' : trade.status === 'declined' ? 'text-red-400' : 'text-gray-400';
        const date = new Date(trade.resolved_at * 1000).toLocaleDateString();

        return (
          <div key={trade.id} className="bg-[#1a1d23] border border-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: otherPlayer?.color || '#666' }} />
              <div>
                <span className="text-white text-sm">
                  {isSender ? 'Sent to' : 'Received from'}{' '}
                  <span style={{ color: otherPlayer?.color }}>{otherPlayer?.name || 'Unknown'}</span>
                </span>
                <div className="text-xs text-gray-500 mt-0.5">{date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {trade.cash_offer > 0 && (
                <span className="text-xs text-green-400">{formatPrice(trade.cash_offer)}</span>
              )}
              <span className={`text-xs font-bold uppercase ${statusColor}`}>{trade.status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ========== Trade Card ========== */
function TradeCard({ trade, direction, onAccept, onDecline }) {
  const otherPlayer = direction === 'incoming' ? trade.fromPlayer : trade.toPlayer;

  return (
    <div className="bg-[#1a1d23] border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: otherPlayer?.color || '#666' }} />
          <span className="text-white text-sm font-medium">
            {direction === 'incoming' ? 'From' : 'To'}{' '}
            <span style={{ color: otherPlayer?.color }}>{otherPlayer?.name || 'Unknown'}</span>
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(trade.created_at * 1000).toLocaleDateString()}
        </span>
      </div>

      {/* Trade value summary bar */}
      {(() => {
        const offerSkinsValue = (trade.offerSkins || []).reduce((s, sk) => s + (sk.price || 0), 0);
        const requestSkinsValue = (trade.requestSkins || []).reduce((s, sk) => s + (sk.price || 0), 0);
        const offerTot = offerSkinsValue + (trade.cash_offer || 0);
        const requestTot = requestSkinsValue;
        const tot = offerTot + requestTot;
        if (tot <= 0) return null;
        const diff = offerTot - requestTot;
        const pct = (offerTot / tot) * 100;
        const fairText = Math.abs(diff) < 0.5 ? 'Even'
          : diff > 0 ? `Sender +${formatPrice(diff)}` : `Receiver +${formatPrice(-diff)}`;
        const barColor = Math.abs(diff) < 0.5 ? '#22c55e' : diff > 0 ? '#facc15' : '#60a5fa';
        return (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Offer <span className="text-green-400 font-bold">{formatPrice(offerTot)}</span></span>
              <span className="font-bold" style={{ color: barColor }}>{fairText}</span>
              <span>Request <span className="text-green-400 font-bold">{formatPrice(requestTot)}</span></span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 gap-4 mb-3">
        {/* Their offer / Your offer */}
        <div>
          <div className="text-xs text-gray-500 mb-2">
            {direction === 'incoming' ? 'They offer' : 'You offer'}
          </div>
          {trade.offerSkins && trade.offerSkins.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trade.offerSkins.map(skin => (
                <MiniSkinCard key={skin.id} item={skin} />
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-600">No skins</div>
          )}
          {trade.cash_offer > 0 && (
            <div className="text-sm text-green-400 mt-1">+ {formatPrice(trade.cash_offer)}</div>
          )}
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-2">
            {direction === 'incoming' ? 'They request' : 'You request'}
          </div>
          {trade.requestSkins && trade.requestSkins.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trade.requestSkins.map(skin => (
                <MiniSkinCard key={skin.id} item={skin} />
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-600">No skins</div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {direction === 'incoming' && onAccept && (
          <button
            onClick={onAccept}
            className="px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-bold hover:bg-green-500/30 transition"
          >
            Accept
          </button>
        )}
        {onDecline && (
          <button
            onClick={onDecline}
            className="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-500/30 transition"
          >
            {direction === 'outgoing' ? 'Cancel' : 'Decline'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ========== Trade Modal ========== */
function TradeModal({ activePlayerId, targetPlayerId, targetPlayer, theirInventory, onClose, onTradeCreated }) {
  const { addNotification } = useGameStore();
  const [myInventory, setMyInventory] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(new Set());
  const [selectedRequest, setSelectedRequest] = useState(new Set());
  const [cashOffer, setCashOffer] = useState('');
  const [sending, setSending] = useState(false);

  const offerValue = Array.from(selectedOffer).reduce((sum, id) => {
    const item = myInventory.find(i => i.id === id);
    return sum + (item?.price || 0);
  }, 0) + (parseFloat(cashOffer) || 0);

  const requestValue = Array.from(selectedRequest).reduce((sum, id) => {
    const item = theirInventory.find(i => i.id === id);
    return sum + (item?.price || 0);
  }, 0);

  const totalValue = offerValue + requestValue;
  const offerPct = totalValue > 0 ? (offerValue / totalValue) * 100 : 50;
  const diff = offerValue - requestValue;
  const fairnessLabel = totalValue === 0 ? null
    : Math.abs(diff) < 0.5 ? { text: 'Even Trade', color: 'text-green-400' }
    : diff > 0 ? { text: `You overpay by ${formatPrice(diff)}`, color: 'text-yellow-400' }
    : { text: `You save ${formatPrice(-diff)}`, color: 'text-blue-400' };

  useEffect(() => {
    fetch(`/api/trades/inventory/${activePlayerId}`)
      .then(r => r.json())
      .then(setMyInventory)
      .catch(() => {});
  }, [activePlayerId]);

  const toggleOffer = (id) => {
    setSelectedOffer(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRequest = (id) => {
    setSelectedRequest(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    const offerIds = Array.from(selectedOffer);
    const requestIds = Array.from(selectedRequest);
    const cash = parseFloat(cashOffer) || 0;

    if (offerIds.length === 0 && requestIds.length === 0 && cash <= 0) {
      addNotification('Add at least one item or cash to the trade', 'red');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/trades/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPlayerId: activePlayerId,
          toPlayerId: targetPlayerId,
          offerSkinIds: offerIds,
          requestSkinIds: requestIds,
          cashOffer: cash,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        addNotification(err.error, 'red');
        setSending(false);
        return;
      }
      addNotification('Trade offer sent!', 'green');
      onTradeCreated();
    } catch (e) {
      addNotification('Failed to send trade', 'red');
    }
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#12141a] rounded-xl border border-gray-700 w-full max-w-5xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            Trade with <span style={{ color: targetPlayer?.color }}>{targetPlayer?.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">X</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0 min-h-0">
          {/* Left: Your Items */}
          <div className="border-r border-gray-800 flex flex-col min-h-0">
            <div className="p-3 border-b border-gray-800/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">Your Items</div>
                {offerValue > 0 && (
                  <div className="text-sm font-bold text-green-400">{formatPrice(offerValue)}</div>
                )}
              </div>
              <div className="text-xs text-gray-500">{selectedOffer.size} selected</div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 gap-2">
                {myInventory.map(item => (
                  <SelectableSkinCard
                    key={item.id}
                    item={item}
                    selected={selectedOffer.has(item.id)}
                    onClick={() => toggleOffer(item.id)}
                  />
                ))}
              </div>
              {myInventory.length === 0 && (
                <div className="text-gray-600 text-center py-8 text-sm">No items in inventory</div>
              )}
            </div>
          </div>

          {/* Right: Their Items */}
          <div className="flex flex-col min-h-0">
            <div className="p-3 border-b border-gray-800/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">{targetPlayer?.name}'s Items</div>
                {requestValue > 0 && (
                  <div className="text-sm font-bold text-green-400">{formatPrice(requestValue)}</div>
                )}
              </div>
              <div className="text-xs text-gray-500">{selectedRequest.size} selected</div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 gap-2">
                {theirInventory.map(item => (
                  <SelectableSkinCard
                    key={item.id}
                    item={item}
                    selected={selectedRequest.has(item.id)}
                    onClick={() => toggleRequest(item.id)}
                  />
                ))}
              </div>
              {theirInventory.length === 0 && (
                <div className="text-gray-600 text-center py-8 text-sm">No items in inventory</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800">
          {/* Trade Value Bar */}
          {totalValue > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-400">You offer <span className="text-green-400 font-bold">{formatPrice(offerValue)}</span></span>
                {fairnessLabel && (
                  <span className={`font-bold ${fairnessLabel.color}`}>{fairnessLabel.text}</span>
                )}
                <span className="text-gray-400">They offer <span className="text-green-400 font-bold">{formatPrice(requestValue)}</span></span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${offerPct}%`,
                    background: Math.abs(diff) < 0.5
                      ? '#22c55e'
                      : diff > 0
                        ? '#facc15'
                        : '#60a5fa',
                  }}
                />
              </div>
            </div>
          )}

          <div className="p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Cash Offer:</label>
              <input
                type="number"
                value={cashOffer}
                onChange={e => setCashOffer(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-28 bg-[#1a1d23] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
              />
            </div>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-700/30 text-gray-400 border border-gray-700 rounded-lg text-sm hover:bg-gray-700/50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-5 py-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg text-sm font-bold hover:bg-yellow-400/30 disabled:opacity-50 transition"
            >
              {sending ? 'Sending...' : 'Send Trade Offer'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ========== Shared Components ========== */
function SkinCard({ item }) {
  return (
    <div
      className="bg-[#1a1d23] rounded-lg border border-gray-800 hover:border-gray-600 transition p-3"
      style={{ borderBottomColor: getRarityColor(item.rarity), borderBottomWidth: 3 }}
    >
      {item.stattrak === 1 && (
        <div className="text-[9px] text-orange-400 font-mono mb-1">StatTrak</div>
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
        <span className="text-[10px] font-bold text-green-400">
          {item.price > 0 ? formatPrice(item.price) : '—'}
        </span>
      </div>
    </div>
  );
}

function MiniSkinCard({ item }) {
  return (
    <div
      className="bg-[#12141a] rounded border border-gray-700 p-1.5 w-20"
      style={{ borderBottomColor: getRarityColor(item.rarity), borderBottomWidth: 2 }}
    >
      <SkinImage
        src={getSkinImageUrl(item.image_url, item.skin_name)}
        name={item.skin_name}
        rarity={item.rarity}
        size="sm"
      />
      <div className="text-[9px] text-white truncate">{item.skin_name}</div>
      {item.price > 0 && (
        <div className="text-[8px] text-green-400 font-bold mt-0.5">{formatPrice(item.price)}</div>
      )}
    </div>
  );
}

function SelectableSkinCard({ item, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg border cursor-pointer transition p-2 ${
        selected
          ? 'border-yellow-400 bg-yellow-400/10 ring-1 ring-yellow-400/30'
          : 'border-gray-800 bg-[#1a1d23] hover:border-gray-600'
      }`}
      style={{ borderBottomColor: getRarityColor(item.rarity), borderBottomWidth: 3 }}
    >
      {item.stattrak === 1 && (
        <div className="text-[8px] text-orange-400 font-mono">StatTrak</div>
      )}
      <SkinImage
        src={getSkinImageUrl(item.image_url, item.skin_name)}
        name={item.skin_name}
        rarity={item.rarity}
        size="sm"
      />
      <div className="text-[9px] text-white truncate">{item.skin_name}</div>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[8px] text-gray-500">{wearShort(item.wear)}</span>
        {item.price > 0 && (
          <span className="text-[8px] font-bold text-green-400">{formatPrice(item.price)}</span>
        )}
      </div>
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-black text-[8px] font-bold">✓</span>
        </div>
      )}
    </div>
  );
}
