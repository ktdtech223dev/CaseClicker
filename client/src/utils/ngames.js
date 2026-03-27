// NGame SDK wrapper - fire-and-forget, never breaks the game

let initialized = false;

export function initNGame(profileId) {
  try {
    if (typeof window !== 'undefined' && window.NGame) {
      window.NGame.init({
        game_id: 'case-sim',
        profile_id: profileId,
      });
      initialized = true;
      console.log('NGame initialized for', profileId);
    }
  } catch (e) {
    console.warn('NGame init failed (offline?):', e.message);
  }
}

export function ngamePing(data) {
  try {
    if (initialized && window.NGame) {
      window.NGame.ping(data);
    }
  } catch (e) { /* ignore */ }
}

export function ngamePostToWall(message) {
  try {
    if (initialized && window.NGame) {
      window.NGame.postToWall(message);
    }
  } catch (e) { /* ignore */ }
}

export function ngameSubmitSession(data) {
  try {
    if (initialized && window.NGame) {
      window.NGame.submitSession(data);
    }
  } catch (e) { /* ignore */ }
}

export function ngameUnlockAchievement(id) {
  try {
    if (initialized && window.NGame) {
      window.NGame.unlockAchievement('cs_' + id);
    }
  } catch (e) { /* ignore */ }
}

export function ngameOffline(profileId) {
  try {
    navigator.sendBeacon(
      'https://ngames-server-production.up.railway.app/presence/offline',
      JSON.stringify({ profile_id: profileId })
    );
  } catch (e) { /* ignore */ }
}
