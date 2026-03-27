import { create } from 'zustand';

const API = '/api';

const useGameStore = create((set, get) => ({
  // Player state
  players: [],
  activePlayerId: null,
  activePlayer: null,

  // UI state
  sidebarOpen: true,
  notifications: [],
  settings: {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.3,
    animations: true,
    showFloats: true,
    showPrices: true,
    currency: 'USD',
    darkMode: true,
  },

  // Case opening state
  cases: [],
  isOpeningCase: false,
  caseResult: null,
  caseReel: [],

  // Inventory
  inventory: [],

  // Game states
  crashState: { phase: 'betting', multiplier: 1.0, bets: [] },
  rouletteState: { phase: 'betting', bets: [], result: null },

  // NGame integration
  ngameReady: false,

  // ====== ACTIONS ======

  // Load players
  fetchPlayers: async () => {
    try {
      const res = await fetch(`${API}/players`);
      const players = await res.json();
      set({ players });
      const { activePlayerId } = get();
      if (activePlayerId) {
        const active = players.find(p => p.id === activePlayerId);
        set({ activePlayer: active });
      }
    } catch (e) {
      console.error('Failed to fetch players:', e);
    }
  },

  // Set active player
  setActivePlayer: (playerId) => {
    if (!playerId) {
      set({ activePlayerId: null, activePlayer: null, ngameReady: false });
      return;
    }
    const { players } = get();
    const player = players.find(p => p.id === playerId);
    set({ activePlayerId: playerId, activePlayer: player });

    // Initialize NGame
    try {
      if (window.NGame && player) {
        window.NGame.init({
          game_id: 'case-sim',
          profile_id: player.ngames_id,
        });
        window.NGame.ping({ screen: 'in_menu' });
        set({ ngameReady: true });
      }
    } catch (e) { /* NGame offline - ignore */ }
  },

  // Ping NGame
  pingNGame: (data) => {
    try {
      if (window.NGame && get().ngameReady) {
        window.NGame.ping(data);
      }
    } catch (e) { /* ignore */ }
  },

  // Post to NGame wall + local server wall
  postToWall: (message, skinData = null) => {
    try {
      if (window.NGame && get().ngameReady) {
        window.NGame.postToWall(message);
      }
    } catch (e) { /* ignore */ }
    // Also save to local server wall
    try {
      const player = get().activePlayer;
      if (player) {
        const type = skinData?.rarity === 'Rare Special' ? 'knife'
          : skinData ? 'unbox'
          : message.includes('coinflip') ? 'coinflip'
          : message.includes('Crash') ? 'crash'
          : message.includes('Roulette') ? 'roulette'
          : 'general';
        fetch(`${API}/wall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: player.id, message, type, skinData }),
        }).catch(() => {});
      }
    } catch (e) { /* ignore */ }
  },

  // Submit NGame session
  submitSession: (data) => {
    try {
      if (window.NGame && get().ngameReady) {
        window.NGame.submitSession(data);
      }
    } catch (e) { /* ignore */ }
  },

  // Unlock NGame achievement
  unlockAchievement: (achievementId) => {
    try {
      if (window.NGame && get().ngameReady) {
        window.NGame.unlockAchievement('cs_' + achievementId);
      }
    } catch (e) { /* ignore */ }

    // Also save locally
    const { activePlayerId } = get();
    if (activePlayerId) {
      fetch(`${API}/players/${activePlayerId}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievement_id: achievementId }),
      }).catch(() => {});
    }
  },

  // Click income
  handleClick: async () => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/players/${activePlayerId}/click`, { method: 'POST' });
      const data = await res.json();
      set({ activePlayer: data.player });
      // Update players list
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));
      // Click drops removed — case drops now happen on upgrade
      return data;
    } catch (e) {
      console.error('Click failed:', e);
    }
  },

  // Auto income
  collectAutoIncome: async (seconds) => {
    const { activePlayerId, activePlayer } = get();
    if (!activePlayerId || !activePlayer || activePlayer.auto_income <= 0) return;
    try {
      const res = await fetch(`${API}/players/${activePlayerId}/auto-income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seconds }),
      });
      const data = await res.json();
      set({ activePlayer: data.player });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));
    } catch (e) { /* ignore */ }
  },

  // Purchase upgrade
  purchaseUpgrade: async (upgradeType) => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/players/${activePlayerId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upgrade_type: upgradeType }),
      });
      if (!res.ok) {
        const err = await res.json();
        get().addNotification(err.error, 'red');
        return null;
      }
      const data = await res.json();
      set({ activePlayer: data.player });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));
      // Case drop reward on level up
      if (data.caseDrop) {
        get().addNotification(`Level up reward! Free ${data.caseDrop} — +$4.98 credited`, 'success');
      }
      return data;
    } catch (e) {
      console.error('Upgrade failed:', e);
      return null;
    }
  },

  // Fetch cases
  fetchCases: async () => {
    try {
      const res = await fetch(`${API}/cases`);
      const cases = await res.json();
      set({ cases });
    } catch (e) {
      console.error('Failed to fetch cases:', e);
    }
  },

  // Open case
  openCase: async (caseId) => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    set({ isOpeningCase: true, caseResult: null, caseReel: [] });
    try {
      const res = await fetch(`${API}/cases/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayerId, caseId }),
      });
      if (!res.ok) {
        const err = await res.json();
        get().addNotification(err.error, 'red');
        set({ isOpeningCase: false });
        return null;
      }
      const data = await res.json();
      set({
        caseResult: data.skin,
        caseReel: data.reel,
        activePlayer: data.player,
      });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));

      // Check achievements
      if (data.player.total_cases_opened === 1) get().unlockAchievement('first_case');
      if (data.player.total_cases_opened >= 100) get().unlockAchievement('opened_100_cases');

      // Auto-post rare items to wall
      const rarity = data.skin.rarity;
      const playerName = get().activePlayer?.name || 'Player';
      const skinData = {
        name: data.skin.name,
        rarity: data.skin.rarity,
        wear: data.skin.wear,
        price: data.skin.price,
        image_id: data.skin.image_id,
        case_name: data.skin.case_name,
      };
      if (rarity === 'Rare Special') {
        get().postToWall(`${playerName} got a KNIFE! ${data.skin.market_hash_name} — $${data.skin.price.toFixed(2)}`, skinData);
        get().unlockAchievement('first_knife');
      } else if (['Classified', 'Covert'].includes(rarity)) {
        get().postToWall(`${playerName} unboxed ${data.skin.market_hash_name} from ${data.skin.case_name} — $${data.skin.price.toFixed(2)}`, skinData);
      }

      return data;
    } catch (e) {
      console.error('Failed to open case:', e);
      set({ isOpeningCase: false });
      return null;
    }
  },

  finishCaseOpening: () => {
    set({ isOpeningCase: false });
  },

  // Fetch inventory
  fetchInventory: async () => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/players/${activePlayerId}/inventory`);
      const inventory = await res.json();
      set({ inventory });
    } catch (e) {
      console.error('Failed to fetch inventory:', e);
    }
  },

  // Sell skin
  sellSkin: async (inventoryId) => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/market/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryId, playerId: activePlayerId }),
      });
      const data = await res.json();
      set({ activePlayer: data.player });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
        inventory: state.inventory.filter(i => i.id !== inventoryId),
      }));
      get().addNotification(`Sold for $${data.payout.toFixed(2)} (fee: $${data.fee.toFixed(2)})`, 'green');
      return data;
    } catch (e) {
      console.error('Sell failed:', e);
    }
  },

  // Sell immediately after case open
  sellImmediate: async (inventoryId, price) => {
    const result = await get().sellSkin(inventoryId);
    return result;
  },

  // Bulk sell
  sellBulk: async (inventoryIds) => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/market/sell-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryIds, playerId: activePlayerId }),
      });
      const data = await res.json();
      set({ activePlayer: data.player });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
        inventory: state.inventory.filter(i => !inventoryIds.includes(i.id)),
      }));
      get().addNotification(`Sold ${data.sold.length} items for $${data.totalPayout.toFixed(2)}`, 'green');
      return data;
    } catch (e) {
      console.error('Bulk sell failed:', e);
    }
  },

  // Coinflip
  playCoinflip: async (wager, side) => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/games/coinflip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayerId, wager, side }),
      });
      if (!res.ok) {
        const err = await res.json();
        get().addNotification(err.error, 'red');
        return null;
      }
      const data = await res.json();
      set({ activePlayer: data.player });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));

      const playerName = get().activePlayer?.name || 'Player';
      if (data.won) {
        get().postToWall(`🪙 ${playerName} won a $${wager.toFixed(2)} coinflip`);
      }

      get().submitSession({
        score: Math.round(data.profitLoss * 100),
        outcome: data.won ? 'win' : 'bust',
        game_mode: 'coinflip',
        data: { wager, profit_loss: data.profitLoss, opponent: 'bot' },
      });

      return data;
    } catch (e) {
      console.error('Coinflip failed:', e);
      return null;
    }
  },

  // Crash bet
  placeCrashBet: async (amount) => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/games/crash/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayerId, amount }),
      });
      if (!res.ok) {
        const err = await res.json();
        get().addNotification(err.error, 'red');
        return null;
      }
      const data = await res.json();
      set({ activePlayer: data.player });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));
      return data;
    } catch (e) {
      console.error('Crash bet failed:', e);
      return null;
    }
  },

  // Crash cashout
  crashCashout: async () => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/games/crash/cashout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayerId }),
      });
      if (!res.ok) {
        const err = await res.json();
        get().addNotification(err.error, 'red');
        return null;
      }
      const data = await res.json();
      set({ activePlayer: data.player });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));

      const playerName = get().activePlayer?.name || 'Player';
      if (data.multiplier >= 5) {
        get().postToWall(`🚀 ${playerName} cashed out at ${data.multiplier}x in Crash (+$${data.payout.toFixed(2)})`);
      }
      if (data.multiplier >= 10) {
        get().unlockAchievement('crash_10x');
      }

      get().submitSession({
        score: Math.round(data.multiplier * 100),
        outcome: 'cashout',
        game_mode: 'crash',
        data: { wager: data.payout / data.multiplier, multiplier: data.multiplier, profit_loss: data.profitLoss, cashed_out: true },
      });

      return data;
    } catch (e) {
      console.error('Crash cashout failed:', e);
      return null;
    }
  },

  // Roulette bet
  placeRouletteBet: async (amount, betType) => {
    const { activePlayerId } = get();
    if (!activePlayerId) return;
    try {
      const res = await fetch(`${API}/games/roulette/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayerId, amount, betType }),
      });
      if (!res.ok) {
        const err = await res.json();
        get().addNotification(err.error, 'red');
        return null;
      }
      const data = await res.json();
      set({ activePlayer: data.player });
      set(state => ({
        players: state.players.map(p => p.id === data.player.id ? data.player : p),
      }));
      return data;
    } catch (e) {
      console.error('Roulette bet failed:', e);
      return null;
    }
  },

  // Update crash state from socket
  setCrashState: (state) => set({ crashState: state }),
  setRouletteState: (state) => set({ rouletteState: state }),

  // Settings
  updateSettings: (key, value) => {
    set(state => ({
      settings: { ...state.settings, [key]: value },
    }));
  },

  // Notifications
  addNotification: (message, color = 'gold') => {
    const id = Date.now();
    set(state => ({
      notifications: [...state.notifications, { id, message, color }],
    }));
    setTimeout(() => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    }, 4000);
  },

  // Reset player
  resetPlayer: async (playerId) => {
    try {
      const res = await fetch(`${API}/players/${playerId}/reset`, { method: 'POST' });
      const player = await res.json();
      set(state => ({
        players: state.players.map(p => p.id === player.id ? player : p),
        activePlayer: state.activePlayerId === player.id ? player : state.activePlayer,
        inventory: state.activePlayerId === player.id ? [] : state.inventory,
      }));
    } catch (e) {
      console.error('Reset failed:', e);
    }
  },

  // Toggle sidebar
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
}));

export default useGameStore;
