import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { formatPrice, getRarityColor, wearShort } from '../../utils/helpers';

const TABS = [
  { key: 'richest',   label: 'Richest',        endpoint: '/api/stats/leaderboard/richest',    formatStat: (v) => formatPrice(v),     statLabel: 'Net Worth' },
  { key: 'cases',     label: 'Cases Opened',    endpoint: '/api/stats/leaderboard/cases',      formatStat: (v) => Number(v).toLocaleString(), statLabel: 'Cases' },
  { key: 'gamblers',  label: 'Best Gamblers',   endpoint: '/api/stats/leaderboard/gamblers',   formatStat: (v) => (v >= 0 ? '+' : '') + formatPrice(v), statLabel: 'Profit' },
  { key: 'inventory', label: 'Inventory Value', endpoint: '/api/stats/leaderboard/inventory',  formatStat: (v) => formatPrice(v),     statLabel: 'Inv. Value' },
  { key: 'drops',     label: 'Best Drops',      endpoint: '/api/stats/leaderboard/best-drops', formatStat: (v) => formatPrice(v),     statLabel: 'Price' },
];

const RANK_COLORS = {
  1: { bg: 'rgba(255, 215, 0, 0.12)', border: '#FFD700', text: '#FFD700', medal: '#FFD700' },
  2: { bg: 'rgba(192, 192, 192, 0.10)', border: '#C0C0C0', text: '#C0C0C0', medal: '#C0C0C0' },
  3: { bg: 'rgba(205, 127, 50, 0.10)', border: '#CD7F32', text: '#CD7F32', medal: '#CD7F32' },
};

function CrownIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 19H22V21H2V19ZM2 17L4.5 7L8.5 11L12 3L15.5 11L19.5 7L22 17H2Z" fill="#FFD700" />
    </svg>
  );
}

function ChevronIcon({ open, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M6 9L12 15L18 9" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayerAvatar({ name, color, size = 40 }) {
  const initial = name?.[0]?.toUpperCase() || '?';
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        backgroundColor: (color || '#888') + '20',
        border: `2px solid ${color || '#888'}`,
        color: color || '#888',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.45,
        lineHeight: 1,
      }}
    >
      {initial}
    </div>
  );
}

function RankBadge({ rank }) {
  const rc = RANK_COLORS[rank];
  if (rc) {
    return (
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        backgroundColor: rc.bg,
        border: `2px solid ${rc.medal}`,
        color: rc.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 13,
      }}>
        {rank}
      </div>
    );
  }
  return (
    <div style={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: '#666',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: 12,
    }}>
      {rank}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-3">
      <div className="text-xs text-gray-500 uppercase">{label}</div>
      <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}

function PlayerDetailPanel({ playerId, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stats/${playerId}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [playerId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-[#13151a] rounded-b-xl border border-t-0 border-gray-800 p-6">
          <div className="text-gray-500 text-sm">Loading stats...</div>
        </div>
      </motion.div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-[#13151a] rounded-b-xl border border-t-0 border-gray-800 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatBox label="Wallet" value={formatPrice(stats.player.wallet)} color="text-csgo-gold" />
          <StatBox label="Inventory Items" value={stats.inventoryCount} color="text-white" />
          <StatBox label="Inventory Value" value={formatPrice(stats.inventoryValue)} color="text-green-400" />
          <StatBox label="Cases Opened" value={stats.player.total_cases_opened} color="text-blue-400" />
        </div>

        {stats.gameStats.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Game Stats</h3>
            <div className="grid grid-cols-3 gap-2">
              {stats.gameStats.map(gs => (
                <div key={gs.game_type} className="bg-gray-800/40 rounded-lg p-3">
                  <div className="text-sm font-bold text-white capitalize">{gs.game_type}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {gs.games} games | {gs.wins} wins
                  </div>
                  <div className={`font-mono text-sm ${gs.total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {gs.total_profit >= 0 ? '+' : ''}{formatPrice(gs.total_profit)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.bestDrop && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Best Drop</h3>
            <div className="bg-gray-800/40 rounded-lg p-3 inline-block">
              <div className="text-white font-bold">{stats.bestDrop.skin_name}</div>
              <div className="text-gray-400 text-sm">{stats.bestDrop.wear}</div>
              <div className="text-csgo-gold font-mono">{formatPrice(stats.bestDrop.price)}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LeaderboardRow({ entry, tab, isExpanded, onToggle, index }) {
  const rankStyle = RANK_COLORS[entry.rank];
  const isTopThree = entry.rank <= 3;
  const isDrop = tab.key === 'drops';

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={onToggle}
        style={{
          backgroundColor: isTopThree ? rankStyle.bg : '#1a1d23',
          borderLeft: isTopThree ? `3px solid ${rankStyle.border}` : '3px solid transparent',
        }}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[#22252d] ${
          isExpanded ? 'rounded-t-lg' : 'rounded-lg'
        }`}
      >
        {/* Rank */}
        <div className="flex items-center gap-1" style={{ minWidth: 48 }}>
          {entry.rank === 1 && <CrownIcon size={16} />}
          <RankBadge rank={entry.rank} />
        </div>

        {/* Player avatar + name */}
        <PlayerAvatar
          name={isDrop ? entry.player_name : entry.name}
          color={isDrop ? entry.player_color : entry.color}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">
            {isDrop ? entry.player_name : entry.name}
          </div>
          {isDrop && (
            <div className="text-xs truncate" style={{ color: getRarityColor(entry.rarity) }}>
              {entry.stattrak ? 'ST ' : ''}{entry.skin_name}
              <span className="text-gray-500 ml-1">({wearShort(entry.wear)})</span>
            </div>
          )}
          {tab.key === 'richest' && (
            <div className="text-xs text-gray-500">
              Wallet: {formatPrice(entry.wallet)} | Inv: {formatPrice(entry.inventory_value)}
            </div>
          )}
        </div>

        {/* Stat value */}
        <div className={`font-mono font-bold text-sm text-right ${
          tab.key === 'gamblers' ? (entry.stat >= 0 ? 'text-green-400' : 'text-red-400') : 'text-csgo-gold'
        }`}>
          {tab.formatStat(entry.stat)}
        </div>

        <ChevronIcon open={isExpanded} />
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <PlayerDetailPanel
            playerId={isDrop ? entry.player_id : entry.id}
            onClose={onToggle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Players() {
  const { pingNGame } = useGameStore();
  const [activeTab, setActiveTab] = useState('richest');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [cache, setCache] = useState({});

  const tab = TABS.find(t => t.key === activeTab);

  const fetchTab = useCallback(async (tabKey) => {
    const t = TABS.find(t => t.key === tabKey);
    if (!t) return;

    if (cache[tabKey]) {
      setData(cache[tabKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(t.endpoint);
      const json = await res.json();
      setData(json);
      setCache(prev => ({ ...prev, [tabKey]: json }));
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [cache]);

  useEffect(() => {
    pingNGame({ screen: 'leaderboard' });
  }, []);

  useEffect(() => {
    setExpandedId(null);
    fetchTab(activeTab);
  }, [activeTab]);

  const handleToggle = (entryId) => {
    setExpandedId(prev => prev === entryId ? null : entryId);
  };

  const getEntryKey = (entry, index) => {
    if (tab.key === 'drops') return `drop-${entry.id || index}`;
    return `player-${entry.id}`;
  };

  const getEntryToggleId = (entry, index) => {
    if (tab.key === 'drops') return `drop-${index}`;
    return entry.id;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-wide">LEADERBOARD</h1>
        <p className="text-sm text-gray-500 mt-1">Rankings across all players</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-[#13151a] rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 min-w-0 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === t.key
                ? 'bg-[#1e2028] text-white shadow-lg'
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1c22]'
            }`}
            style={activeTab === t.key ? { borderBottom: '2px solid #FFD700' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Column header */}
      <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-600 uppercase tracking-wider font-semibold">
        <div style={{ minWidth: 48 }}>Rank</div>
        <div style={{ width: 36 }}></div>
        <div className="flex-1">Player</div>
        <div className="text-right">{tab.statLabel}</div>
        <div style={{ width: 16 }}></div>
      </div>

      {/* Leaderboard list */}
      <div className="flex flex-col gap-1.5">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-6 h-6 border-2 border-gray-600 border-t-csgo-gold rounded-full animate-spin"></div>
            <div className="text-gray-500 text-sm mt-3">Loading leaderboard...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">
            No data yet. Open some cases to get started!
          </div>
        ) : (
          data.map((entry, index) => (
            <LeaderboardRow
              key={getEntryKey(entry, index)}
              entry={entry}
              tab={tab}
              index={index}
              isExpanded={expandedId === getEntryToggleId(entry, index)}
              onToggle={() => handleToggle(getEntryToggleId(entry, index))}
            />
          ))
        )}
      </div>
    </div>
  );
}
