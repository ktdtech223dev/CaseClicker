/**
 * Sound Manager — Web Audio API tone generator
 * No external audio files needed. All sounds are synthesized oscillator tones.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// --- Volume management ---
const VOLUME_KEYS = {
  master: 'audio_masterVolume',
  sfx: 'audio_sfxVolume',
  music: 'audio_musicVolume',
};

function getVolume(type) {
  const key = VOLUME_KEYS[type];
  if (!key) return 1;
  const stored = localStorage.getItem(key);
  if (stored !== null) return parseFloat(stored);
  // Defaults
  if (type === 'master') return 0.7;
  if (type === 'sfx') return 0.8;
  if (type === 'music') return 0.3;
  return 1;
}

function setVolume(type, value) {
  const key = VOLUME_KEYS[type];
  if (!key) return;
  localStorage.setItem(key, String(Math.max(0, Math.min(1, value))));
}

function effectiveVolume() {
  return getVolume('master') * getVolume('sfx');
}

// --- Tone helpers ---

function playTone(freq, duration, { type = 'sine', gain = 0.3, fadeOut = true, detune = 0 } = {}) {
  try {
    const ctx = getCtx();
    const vol = effectiveVolume() * gain;
    if (vol <= 0) return;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    if (fadeOut) {
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail — never block gameplay
  }
}

function playNoise(duration, { gain = 0.15, fadeOut = true } = {}) {
  try {
    const ctx = getCtx();
    const vol = effectiveVolume() * gain;
    if (vol <= 0) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    if (fadeOut) {
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }
    source.connect(g);
    g.connect(ctx.destination);
    source.start(ctx.currentTime);
  } catch (e) {
    // Silently fail
  }
}

function playChord(freqs, duration, opts = {}) {
  freqs.forEach((f, i) => {
    setTimeout(() => playTone(f, duration, opts), i * 40);
  });
}

// --- Sound definitions ---

const sounds = {
  click() {
    // Short UI blip
    playTone(800, 0.08, { type: 'square', gain: 0.15 });
  },

  case_spin() {
    // Rising whoosh
    try {
      const ctx = getCtx();
      const vol = effectiveVolume() * 0.2;
      if (vol <= 0) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  },

  case_tick() {
    // Quick tick sound
    playTone(1200, 0.03, { type: 'square', gain: 0.1 });
  },

  // Rarity reveals — ascending chimes
  reveal_blue() {
    playTone(523, 0.3, { type: 'sine', gain: 0.25 }); // C5
  },

  reveal_purple() {
    playChord([587, 740], 0.35, { type: 'sine', gain: 0.25 }); // D5 + F#5
  },

  reveal_pink() {
    playChord([659, 830, 988], 0.4, { type: 'sine', gain: 0.3 }); // E5 + Ab5 + B5
  },

  reveal_red() {
    playChord([784, 988, 1175], 0.5, { type: 'sine', gain: 0.35 }); // G5 + B5 + D6
    setTimeout(() => playTone(1318, 0.3, { type: 'sine', gain: 0.25 }), 150); // E6
  },

  reveal_gold() {
    // Fanfare arpeggio for knife/gloves
    const notes = [784, 988, 1175, 1318, 1568]; // G5 B5 D6 E6 G6
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.6, { type: 'sine', gain: 0.3 }), i * 80);
    });
    setTimeout(() => playChord([1318, 1568], 0.8, { type: 'triangle', gain: 0.2 }), 450);
  },

  coin_flip() {
    // Metallic flip — alternating high tones
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        playTone(i % 2 === 0 ? 2000 : 2400, 0.06, { type: 'triangle', gain: 0.15 });
      }, i * 80);
    }
  },

  crash_launch() {
    // Rising tone
    try {
      const ctx = getCtx();
      const vol = effectiveVolume() * 0.2;
      if (vol <= 0) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.5);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime + 1.2);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {}
  },

  crash_explode() {
    // Burst of noise + low boom
    playNoise(0.3, { gain: 0.25 });
    playTone(80, 0.4, { type: 'sine', gain: 0.35 });
    playTone(60, 0.5, { type: 'sine', gain: 0.2 });
  },

  roulette_spin() {
    // Ticking sequence
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        playTone(900 + Math.random() * 200, 0.04, { type: 'square', gain: 0.12 });
      }, i * 60);
    }
  },

  sell() {
    // Cha-ching: two quick ascending tones
    playTone(1047, 0.1, { type: 'square', gain: 0.2 }); // C6
    setTimeout(() => playTone(1319, 0.15, { type: 'square', gain: 0.2 }), 80); // E6
    setTimeout(() => playTone(1568, 0.25, { type: 'sine', gain: 0.25 }), 160); // G6
  },

  upgrade_buy() {
    // Power-up rising sweep
    playTone(400, 0.15, { type: 'square', gain: 0.2 });
    setTimeout(() => playTone(600, 0.15, { type: 'square', gain: 0.2 }), 80);
    setTimeout(() => playTone(800, 0.2, { type: 'sine', gain: 0.25 }), 160);
  },

  level_up() {
    // Short fanfare
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.3, { type: 'sine', gain: 0.3 }), i * 100);
    });
    setTimeout(() => playChord([784, 1047], 0.5, { type: 'triangle', gain: 0.2 }), 450);
  },

  achievement() {
    // Unlock ding
    playTone(880, 0.15, { type: 'sine', gain: 0.3 }); // A5
    setTimeout(() => playTone(1109, 0.12, { type: 'sine', gain: 0.25 }), 100); // C#6
    setTimeout(() => playTone(1319, 0.3, { type: 'sine', gain: 0.3 }), 200); // E6
  },
};

// --- Public API ---

function playSound(name) {
  const fn = sounds[name];
  if (fn) {
    try { fn(); } catch (e) { /* never block */ }
  }
}

/**
 * Map a skin rarity string to the appropriate reveal sound name
 */
function getRevealSound(rarity) {
  if (!rarity) return 'reveal_blue';
  const r = rarity.toLowerCase();
  if (r.includes('consumer') || r.includes('industrial') || r.includes('mil-spec')) return 'reveal_blue';
  if (r.includes('restricted')) return 'reveal_purple';
  if (r.includes('classified')) return 'reveal_pink';
  if (r.includes('covert')) return 'reveal_red';
  if (r.includes('rare special') || r.includes('extraordinary') || r.includes('contraband')) return 'reveal_gold';
  // Default by color names
  if (r.includes('blue')) return 'reveal_blue';
  if (r.includes('purple')) return 'reveal_purple';
  if (r.includes('pink')) return 'reveal_pink';
  if (r.includes('red')) return 'reveal_red';
  if (r.includes('gold') || r.includes('yellow')) return 'reveal_gold';
  return 'reveal_blue';
}

export { playSound, setVolume, getVolume, getRevealSound };
