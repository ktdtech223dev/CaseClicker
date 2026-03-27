import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../../store/gameStore';
import { formatPrice } from '../../../utils/helpers';

function formatTimeRemaining(seconds) {
  if (seconds <= 0) return 'Resolving...';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

export default function Predictions() {
  const { activePlayer, fetchPlayers, pingNGame } = useGameStore();
  const [markets, setMarkets] = useState([]);
  const [history, setHistory] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [tab, setTab] = useState('active'); // active, history, mybets
  const [expandedId, setExpandedId] = useState(null);
  const [betAmounts, setBetAmounts] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch('/api/predictions');
      const data = await res.json();
      // Compute display values from Polymarket data
      const enriched = data.map(m => {
        const prices = Array.isArray(m.outcome_prices) ? m.outcome_prices : [0.5, 0.5];
        const outcomes = Array.isArray(m.outcomes) ? m.outcomes : ['Yes', 'No'];
        const yesPrice = Math.round((prices[0] || 0) * 100);
        const noPrice = Math.round((prices[1] || 0) * 100);
        const endDate = m.end_date ? new Date(m.end_date) : null;
        const timeRemaining = endDate ? Math.max(0, Math.floor((endDate - Date.now()) / 1000)) : 0;
        return {
          ...m,
          outcomes,
          yes_price: yesPrice,
          no_price: noPrice || (100 - yesPrice),
          total_pool: m.yes_pool + m.no_pool,
          time_remaining: timeRemaining,
          category: m.category || 'general',
        };
      });
      setMarkets(enriched);
    } catch (e) {
      console.error('Failed to fetch markets:', e);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/predictions/history');
      const data = await res.json();
      setHistory(data);
    } catch (e) {}
  }, []);

  const fetchMyBets = useCallback(async () => {
    if (!activePlayer) return;
    try {
      const res = await fetch(`/api/predictions/my-bets/${activePlayer.id}`);
      const data = await res.json();
      setMyBets(data);
    } catch (e) {}
  }, [activePlayer]);

  useEffect(() => {
    pingNGame({ screen: 'in_game', mode: 'predictions' });
    fetchMarkets();
    fetchHistory();
    fetchMyBets();

    const interval = setInterval(() => {
      fetchMarkets();
      if (tab === 'history') fetchHistory();
      if (tab === 'mybets') fetchMyBets();
    }, 5000);

    return () => clearInterval(interval);
  }, [tab]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMarkets(prev => prev.map(m => ({
        ...m,
        time_remaining: Math.max(0, m.time_remaining - 1),
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = async (marketId, side) => {
    const amount = parseFloat(betAmounts[marketId]);
    if (!amount || amount <= 0) {
      setError('Enter a valid bet amount');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (amount > activePlayer.wallet) {
      setError('Insufficient funds');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(prev => ({ ...prev, [marketId + side]: true }));
    try {
      const res = await fetch('/api/predictions/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: activePlayer.id,
          marketId,
          side,
          amount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchPlayers();
        fetchMarkets();
        fetchMyBets();
        setBetAmounts(prev => ({ ...prev, [marketId]: '' }));
        setError('');
      } else {
        setError(data.error || 'Bet failed');
        setTimeout(() => setError(''), 3000);
      }
    } catch (e) {
      setError('Network error');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(prev => ({ ...prev, [marketId + side]: false }));
  };

  const quickBet = (marketId, pct) => {
    const amt = Math.floor(activePlayer.wallet * pct * 100) / 100;
    setBetAmounts(prev => ({ ...prev, [marketId]: amt.toString() }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">PREDICTIONS</h1>
          <p className="text-gray-500 text-sm mt-1">Bet on real-world events — powered by Polymarket</p>
        </div>
        <div className="text-right">
          <div className="text-gray-500 text-xs">Your Balance</div>
          <div className="text-yellow-400 font-bold text-lg">{formatPrice(activePlayer?.wallet)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#1a1a24] rounded-lg p-1">
        {[
          { key: 'active', label: 'Active Markets', count: markets.length },
          { key: 'history', label: 'Resolved', count: history.length },
          { key: 'mybets', label: 'My Bets', count: myBets.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-yellow-400/20 text-yellow-400'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-yellow-400/30' : 'bg-gray-700'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      {tab === 'active' && markets.length > 0 && (
        <div className="flex gap-2 mb-4">
          {['all', 'politics', 'crypto', 'sports', 'trending'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                categoryFilter === cat
                  ? 'bg-csgo-gold/20 text-csgo-gold border border-csgo-gold/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Active Markets */}
      {tab === 'active' && (
        <div className="space-y-3">
          {markets.filter(m => categoryFilter === 'all' || m.category === categoryFilter).length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-lg font-medium">No active markets</div>
              <div className="text-sm mt-1">New markets generate every few minutes</div>
            </div>
          ) : (
            markets.filter(m => categoryFilter === 'all' || m.category === categoryFilter).map(market => (
              <motion.div
                key={market.id}
                layout
                className="bg-[#1a1a24] border border-gray-800/50 rounded-xl overflow-hidden hover:border-gray-700/50 transition-colors"
              >
                {/* Market Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === market.id ? null : market.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-[15px] leading-tight">
                        {market.question}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Pool: <span className="text-gray-300">{formatPrice(market.total_pool)}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Ends: <span className="text-gray-300">{formatTimeRemaining(market.time_remaining)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Odds Display */}
                    <div className="flex gap-2 shrink-0">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Yes</div>
                        <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                          market.yes_price > 50
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-green-500/10 text-green-400/70 border border-green-500/20'
                        }`}>
                          {market.yes_price}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">No</div>
                        <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                          market.no_price > 50
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-red-500/10 text-red-400/70 border border-red-500/20'
                        }`}>
                          {market.no_price}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Odds Bar */}
                  <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-500"
                      style={{ width: `${market.yes_price}%` }}
                    />
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                      style={{ width: `${market.no_price}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Bet Panel */}
                <AnimatePresence>
                  {expandedId === market.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-gray-800/50">
                        {/* Bet Amount */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              value={betAmounts[market.id] || ''}
                              onChange={e => setBetAmounts(prev => ({ ...prev, [market.id]: e.target.value }))}
                              placeholder="0.00"
                              className="w-full bg-[#12121a] border border-gray-700/50 rounded-lg py-2.5 pl-7 pr-3 text-white text-sm focus:outline-none focus:border-yellow-400/50"
                            />
                          </div>
                          <div className="flex gap-1">
                            {[0.1, 0.25, 0.5, 1].map(pct => (
                              <button
                                key={pct}
                                onClick={() => quickBet(market.id, pct)}
                                className="px-2 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-md transition"
                              >
                                {pct === 1 ? 'MAX' : `${pct * 100}%`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Potential payout info */}
                        {betAmounts[market.id] && parseFloat(betAmounts[market.id]) > 0 && (
                          <div className="flex gap-4 mb-3 text-xs text-gray-500">
                            <span>
                              YES payout: <span className="text-green-400">
                                {formatPrice(parseFloat(betAmounts[market.id]) / (market.yes_price / 100))}
                              </span>
                            </span>
                            <span>
                              NO payout: <span className="text-red-400">
                                {formatPrice(parseFloat(betAmounts[market.id]) / (market.no_price / 100))}
                              </span>
                            </span>
                          </div>
                        )}

                        {/* YES / NO Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => placeBet(market.id, 'yes')}
                            disabled={loading[market.id + 'yes']}
                            className="flex-1 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 hover:border-green-500/50 text-green-400 font-bold rounded-lg transition-all disabled:opacity-50"
                          >
                            {loading[market.id + 'yes'] ? '...' : `BET YES (${market.yes_price}%)`}
                          </button>
                          <button
                            onClick={() => placeBet(market.id, 'no')}
                            disabled={loading[market.id + 'no']}
                            className="flex-1 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold rounded-lg transition-all disabled:opacity-50"
                          >
                            {loading[market.id + 'no'] ? '...' : `BET NO (${market.no_price}%)`}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Resolved Markets */}
      {tab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <div className="text-4xl mb-3">📜</div>
              <div>No resolved markets yet</div>
            </div>
          ) : (
            history.map(market => (
              <div
                key={market.id}
                className="bg-[#1a1a24] border border-gray-800/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-gray-300 font-medium text-sm">{market.question}</h3>
                    <div className="text-xs text-gray-600 mt-1">
                      Pool: {formatPrice(market.total_pool)}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    market.result === 'yes'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {market.result?.toUpperCase()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Bets */}
      {tab === 'mybets' && (
        <div className="space-y-2">
          {myBets.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <div className="text-4xl mb-3">🎯</div>
              <div>No bets placed yet</div>
              <div className="text-sm mt-1">Place bets on active markets to see them here</div>
            </div>
          ) : (
            myBets.map(bet => (
              <div
                key={bet.id}
                className="bg-[#1a1a24] border border-gray-800/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-gray-300 font-medium text-sm">{bet.question}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        bet.side === 'yes' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {bet.side?.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Bet: <span className="text-gray-300">{formatPrice(bet.amount)}</span>
                      </span>
                      {bet.payout > 0 && (
                        <span className="text-xs text-green-400">
                          Won: {formatPrice(bet.payout)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {bet.market_status === 'active' ? (
                      <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                        Pending
                      </span>
                    ) : bet.market_result === bet.side ? (
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded font-bold">
                        WON +{formatPrice(bet.payout - bet.amount)}
                      </span>
                    ) : (
                      <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
                        LOST
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
