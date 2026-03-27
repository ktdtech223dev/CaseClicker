import React, { useEffect, useState, useRef } from 'react';

const RARITY_COLORS = {
  'Consumer Grade': '#b0c3d9',
  'Industrial Grade': '#5e98d9',
  'Mil-Spec': '#4b69ff',
  'Restricted': '#8847ff',
  'Classified': '#d32ce6',
  'Covert': '#eb4b4b',
  'Extraordinary': '#e4ae39',
  'Contraband': '#e4ae39',
  'Rare Special': '#e4ae39',
};

function getRarityColor(rarity) {
  if (!rarity) return '#4b69ff';
  for (const [key, color] of Object.entries(RARITY_COLORS)) {
    if (rarity.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#4b69ff';
}

export default function Ticker() {
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);

  const fetchTicker = async () => {
    try {
      const res = await fetch('/api/ticker');
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setItems(data);
      }
    } catch (e) {
      // silent fail
    }
  };

  useEffect(() => {
    fetchTicker();
    const interval = setInterval(fetchTicker, 60000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  // Double the items for seamless loop
  const doubled = [...items, ...items];
  const duration = items.length * 3;

  return (
    <div style={styles.wrapper}>
      <div
        ref={containerRef}
        style={{
          ...styles.track,
          animationDuration: `${duration}s`,
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} style={styles.item}>
            <span style={{ color: getRarityColor(item.rarity), fontWeight: 600 }}>
              {item.name}
            </span>
            <span style={styles.price}>${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span style={{
              color: item.change >= 0 ? '#4caf50' : '#ef4444',
              fontWeight: 600,
            }}>
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
            </span>
            <span style={styles.separator}>|</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    height: 28,
    backgroundColor: '#0a0a0a',
    borderBottom: '1px solid #1a1a1a',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 100,
    flexShrink: 0,
  },
  track: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 28,
    whiteSpace: 'nowrap',
    fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
    fontSize: 12,
    animation: 'ticker-scroll linear infinite',
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
  },
  price: {
    color: '#ccc',
    fontWeight: 400,
  },
  separator: {
    color: '#333',
    margin: '0 8px',
  },
};
