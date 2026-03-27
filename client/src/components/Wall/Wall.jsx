import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { formatPrice, getSkinImageUrl, getRarityColor } from '../../utils/helpers';
import SkinImage from '../shared/SkinImage';

const TABS = [
  { id: 'all', label: 'All Activity' },
  { id: 'unbox', label: 'Unboxings' },
  { id: 'knife', label: 'Knives' },
  { id: 'coinflip', label: 'Coinflip' },
  { id: 'crash', label: 'Crash' },
  { id: 'roulette', label: 'Roulette' },
];

const TYPE_ICONS = {
  unbox: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
      <path d="M8 7h4v2H8V7z" />
    </svg>
  ),
  knife: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M3.5 16.5L16.5 3.5l.707.707L4.207 17.207z" />
      <path d="M14 3l3 3-1.5 1.5L12.5 4.5z" />
    </svg>
  ),
  coinflip: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
    </svg>
  ),
  crash: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
  ),
  roulette: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  general: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2z" clipRule="evenodd" />
    </svg>
  ),
};

function timeAgo(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

function getRarityLabel(rarity) {
  const labels = {
    'Consumer Grade': 'Consumer',
    'Industrial Grade': 'Industrial',
    'Mil-Spec': 'Mil-Spec',
    'Restricted': 'Restricted',
    'Classified': 'Classified',
    'Covert': 'Covert',
    'Rare Special': 'Rare Special',
  };
  return labels[rarity] || rarity;
}

export default function Wall() {
  const { activePlayer, pingNGame } = useGameStore();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (type) => {
    setLoading(true);
    try {
      const url = type === 'all' ? '/api/wall?limit=100' : `/api/wall/type/${type}?limit=100`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error('Failed to fetch wall posts:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts(activeTab);
    pingNGame({ screen: 'wall' });
  }, [activeTab]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchPosts(activeTab), 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">CREW WALL</h1>
        <button
          onClick={() => fetchPosts(activeTab)}
          className="text-gray-500 hover:text-white transition text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111318] rounded-xl p-1 border border-gray-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-[#1a1d23] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading && posts.length === 0 ? (
        <div className="text-center text-gray-600 py-12">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-600 text-lg mb-2">No posts yet</div>
          <div className="text-gray-700 text-sm">Open some cases and share your drops!</div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="bg-[#1a1d23] rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition"
              >
                <div className="p-4">
                  {/* Header: player info + time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Player avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: (post.player_color || '#888') + '15',
                          color: post.player_color || '#888',
                          border: `2px solid ${post.player_color || '#888'}40`,
                        }}
                      >
                        {post.player_name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm" style={{ color: post.player_color }}>
                          {post.player_name || 'Unknown'}
                        </div>
                        <div className="text-[10px] text-gray-600">{timeAgo(post.created_at)}</div>
                      </div>
                    </div>
                    {/* Type badge */}
                    <div className="flex items-center gap-1.5 text-gray-600">
                      {TYPE_ICONS[post.type] || TYPE_ICONS.general}
                      <span className="text-[10px] uppercase tracking-wider">{post.type}</span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="text-gray-300 text-sm mb-3">{post.message}</div>

                  {/* Skin card (if skin data exists) */}
                  {post.skin_name && (
                    <div
                      className="bg-[#111318] rounded-lg p-3 flex items-center gap-4 border"
                      style={{ borderColor: getRarityColor(post.skin_rarity) + '30' }}
                    >
                      <div className="flex-shrink-0">
                        <SkinImage
                          src={getSkinImageUrl(post.skin_image_id, post.skin_name)}
                          name={post.skin_name}
                          rarity={post.skin_rarity}
                          size="sm"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-bold truncate">{post.skin_name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {post.skin_wear && (
                            <span className="text-gray-500 text-xs">{post.skin_wear}</span>
                          )}
                          {post.skin_rarity && (
                            <span className="text-xs" style={{ color: getRarityColor(post.skin_rarity) }}>
                              {getRarityLabel(post.skin_rarity)}
                            </span>
                          )}
                        </div>
                        {post.case_name && (
                          <div className="text-gray-600 text-[10px] mt-0.5">from {post.case_name}</div>
                        )}
                      </div>
                      {post.skin_price > 0 && (
                        <div className="text-csgo-gold font-mono font-bold text-sm">
                          {formatPrice(post.skin_price)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
