import React, { useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore';
import { formatPrice } from '../../utils/helpers';

export default function Market() {
  const { activePlayer, pingNGame } = useGameStore();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    pingNGame({ screen: 'market' });
    if (activePlayer) {
      fetch(`/api/market/history/${activePlayer.id}`)
        .then(r => r.json())
        .then(setHistory)
        .catch(() => {});
    }
  }, [activePlayer?.id]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">MARKET</h1>

      <div className="bg-[#1a1d23] rounded-lg border border-gray-800 p-6 mb-8">
        <div className="text-gray-400 mb-2">
          Sell skins from your inventory for instant cash. A <span className="text-csgo-gold">7% market fee</span> applies to all sales.
        </div>
        <div className="text-sm text-gray-600">
          Go to your Inventory to select items to sell.
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">SELL HISTORY</h2>

      {history.length === 0 ? (
        <div className="text-gray-600 text-center py-10">No sales yet</div>
      ) : (
        <div className="bg-[#1a1d23] rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-left">
                <th className="p-3">Item</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map(tx => (
                <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-white/5">
                  <td className="p-3 text-white">{tx.description}</td>
                  <td className="p-3 text-csgo-green font-mono">+{formatPrice(tx.amount)}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(tx.timestamp * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
