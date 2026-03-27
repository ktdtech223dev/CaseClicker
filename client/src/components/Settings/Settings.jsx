import React, { useState } from 'react';
import useGameStore from '../../store/gameStore';
import { setVolume as setAudioVolume } from '../../utils/audio';

export default function Settings() {
  const { settings, updateSettings, activePlayer, players, resetPlayer, fetchPlayers } = useGameStore();
  const [confirmReset, setConfirmReset] = useState(null);
  const [confirmMasterReset, setConfirmMasterReset] = useState(false);
  const [masterResetDone, setMasterResetDone] = useState(false);

  const handleMasterReset = async () => {
    try {
      const res = await fetch('/api/players/admin/master-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmCode: 'RESET_ALL_PLAYERS' }),
      });
      if (res.ok) {
        await fetchPlayers();
        setMasterResetDone(true);
        setConfirmMasterReset(false);
        useGameStore.getState().addNotification('All player data has been reset!', 'success');
        setTimeout(() => setMasterResetDone(false), 3000);
      }
    } catch (e) {
      console.error('Master reset failed:', e);
    }
  };

  const Slider = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-400 text-sm w-32">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-csgo-gold"
      />
      <span className="text-white font-mono text-sm w-12 text-right">{Math.round(value * 100)}%</span>
    </div>
  );

  const Toggle = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-csgo-gold' : 'bg-gray-700'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">SETTINGS</h1>

      {/* Audio */}
      <Section title="AUDIO">
        <Slider label="Master Volume" value={settings.masterVolume} onChange={v => { updateSettings('masterVolume', v); setAudioVolume('master', v); }} />
        <Slider label="SFX Volume" value={settings.sfxVolume} onChange={v => { updateSettings('sfxVolume', v); setAudioVolume('sfx', v); }} />
        <Slider label="Music Volume" value={settings.musicVolume} onChange={v => { updateSettings('musicVolume', v); setAudioVolume('music', v); }} />
      </Section>

      {/* Display */}
      <Section title="DISPLAY">
        <Toggle label="Animations" value={settings.animations} onChange={v => updateSettings('animations', v)} />
        <Toggle label="Show Float Values" value={settings.showFloats} onChange={v => updateSettings('showFloats', v)} />
        <Toggle label="Show Prices in Inventory" value={settings.showPrices} onChange={v => updateSettings('showPrices', v)} />
        <Toggle label="Dark Mode" value={settings.darkMode} onChange={v => updateSettings('darkMode', v)} />
      </Section>

      {/* Price */}
      <Section title="PRICES">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Currency</span>
          <select
            value={settings.currency}
            onChange={e => updateSettings('currency', e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (\u20ac)</option>
            <option value="GBP">GBP (\u00a3)</option>
          </select>
        </div>
        <button
          onClick={() => {
            fetch('/api/admin/refresh-prices', { method: 'POST' }).then(() => {
              useGameStore.getState().addNotification('Price refresh started! Fetching from Steam Market...', 'success');
            });
          }}
          className="w-full py-2 bg-csgo-gold/20 text-csgo-gold border border-csgo-gold/30 rounded-lg hover:bg-csgo-gold/30 text-sm font-bold transition"
        >
          Refresh Prices from Steam
        </button>
        <button
          onClick={() => {
            fetch('/api/admin/clear-price-cache', { method: 'POST' }).then(() => {
              useGameStore.getState().addNotification('Price cache cleared. Using hardcoded prices.', 'success');
            });
          }}
          className="w-full py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 text-sm"
        >
          Clear Price Cache
        </button>
      </Section>

      {/* Player Reset */}
      <Section title="PLAYER DATA">
        <div className="flex flex-col gap-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center justify-between">
              <span className="text-gray-400">{p.name}</span>
              {confirmReset === p.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { resetPlayer(p.id); setConfirmReset(null); }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(null)}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(p.id)}
                  className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded text-sm hover:bg-red-600/30"
                >
                  Reset
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Admin Panel */}
      <Section title="ADMIN PANEL">
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <h3 className="text-red-400 font-bold mb-2">Master Reset — All Players</h3>
          <p className="text-gray-500 text-sm mb-4">
            Resets ALL 4 players back to $10.00. Clears all inventories, upgrades, achievements,
            game history, transactions, trades, and wall posts. This cannot be undone.
          </p>
          {masterResetDone ? (
            <div className="text-green-400 font-bold text-center py-2">All data has been reset!</div>
          ) : confirmMasterReset ? (
            <div className="flex gap-3">
              <button
                onClick={handleMasterReset}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                YES — RESET EVERYTHING
              </button>
              <button
                onClick={() => setConfirmMasterReset(false)}
                className="flex-1 py-3 bg-gray-700 text-gray-300 font-bold rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmMasterReset(true)}
              className="w-full py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg font-bold hover:bg-red-600/30 transition"
            >
              Master Reset All Players
            </button>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#1a1d23] rounded-xl border border-gray-800 p-6 mb-6">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{title}</h2>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
