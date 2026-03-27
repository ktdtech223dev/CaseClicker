import { io } from 'socket.io-client';

// In production (Railway), the server is on the same origin
// In dev, the server runs on port 3001
const SERVER_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('[Socket] Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.warn('[Socket] Connection error:', err.message);
});

export function initSocket() {
  if (!socket.connected) {
    socket.connect();
  }

  // Import store lazily to avoid circular dependency
  import('../store/gameStore').then(({ default: useGameStore }) => {
    const { setCrashState } = useGameStore.getState();

    // ===== CRASH EVENTS =====
    socket.off('crash_state');
    socket.off('crash_tick');
    socket.off('crash_bet');
    socket.off('crash_cashout');

    socket.on('crash_state', (data) => {
      const current = useGameStore.getState().crashState;
      setCrashState({
        ...current,
        phase: data.phase,
        countdown: data.countdown || 0,
        crashPoint: data.crashPoint || current.crashPoint,
        bets: data.bets || current.bets,
        multiplier: data.phase === 'betting' ? 1.0 : current.multiplier,
      });
    });

    socket.on('crash_tick', (data) => {
      const current = useGameStore.getState().crashState;
      setCrashState({
        ...current,
        multiplier: data.multiplier,
      });
    });

    socket.on('crash_bet', (data) => {
      const current = useGameStore.getState().crashState;
      setCrashState({
        ...current,
        bets: [...(current.bets || []), data],
      });
    });

    socket.on('crash_cashout', (data) => {
      const current = useGameStore.getState().crashState;
      const bets = (current.bets || []).map(b => {
        if (b.playerId === data.playerId) {
          return { ...b, cashedOut: true, cashoutMult: data.multiplier };
        }
        return b;
      });
      setCrashState({ ...current, bets });
    });

    // ===== ROULETTE EVENTS =====
    socket.off('roulette_state');
    socket.off('roulette_result');

    socket.on('roulette_state', (data) => {
      // Components handle roulette state locally, but we can broadcast
      console.log('[Socket] Roulette:', data.phase);
    });

    socket.on('roulette_result', (data) => {
      console.log('[Socket] Roulette result:', data.result);
    });

    // ===== JACKPOT EVENTS =====
    socket.off('jackpot_update');
    socket.off('jackpot_spin');
    socket.off('jackpot_result');

    socket.on('jackpot_update', (data) => {
      console.log('[Socket] Jackpot update:', data.phase, 'pot:', data.potValue);
    });

    socket.on('jackpot_spin', (data) => {
      console.log('[Socket] Jackpot spinning, pot:', data.potValue);
    });

    socket.on('jackpot_result', (data) => {
      console.log('[Socket] Jackpot winner:', data.winner?.playerName);
    });
  });

  return socket;
}

export default socket;
