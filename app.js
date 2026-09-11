/**
 * RETRO QUIZ - APLICACIÓN INTERACTIVA & WHEEL SELECTION SCREEN
 * Control de animaciones de entrada, efectos periódicos,
 * sintetizador de audio retro Web Audio API, ruleta interactiva y modales.
 */

// =============================================================================
// LIMPIEZA TOTAL DE CONSOLAS MÓVILES DE DEPURACIÓN (ERUDA / VCONSOLE / DEBUG)
// =============================================================================
(function purgeMobileDebugConsoles() {
  if (typeof window === 'undefined') return;

  try {
    if (window.eruda && typeof window.eruda.destroy === 'function') {
      window.eruda.destroy();
    }
    if (window.vConsole && typeof window.vConsole.destroy === 'function') {
      window.vConsole.destroy();
    }
  } catch (e) {}

  const removeDebugElements = () => {
    const selectors = [
      '#eruda',
      '.eruda-container',
      '.eruda-entry-btn',
      '#__vconsole',
      '.vc-switch',
      '.vconsole-btn',
      '#debugConsole',
      '#console',
      '.external-toolbar',
      '.dev-unlock-all-row'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeDebugElements);
  } else {
    removeDebugElements();
  }
  window.addEventListener('load', removeDebugElements);
})();

// =============================================================================
// CATÁLOGO CENTRAL UNIFICADO DE PACKS TEMÁTICOS ("MIS COLECCIONES")
// =============================================================================
const THEMATIC_PACKS = [
  { id: "cine_2000", file: "data/cine_2000.json", name: "Cine 2000s", category: "CINE", icon: "🎬", priceCoins: 5000, priceUSD: "$0.99" },
  { id: "videojuegos_retro", file: "data/videojuegos_retro.json", name: "Videojuegos Clásicos", category: "VIDEOJUEGOS", icon: "🕹️", priceCoins: 5000, priceUSD: "$0.99" },
  { id: "series_iconicas", file: "data/series_iconicas.json", name: "Series Icónicas", category: "TV", icon: "📺", priceCoins: 5000, priceUSD: "$0.99" },
  { id: "puro_80s", file: "data/puro_80s.json", name: "Puro 80s", category: "ÉPOCA 80s", icon: "📼", priceCoins: 5000, priceUSD: "$0.99" },
  { id: "puro_90s", file: "data/puro_90s.json", name: "Puro 90s", category: "ÉPOCA 90s", icon: "📻", priceCoins: 5000, priceUSD: "$0.99" },
  { id: "artistas_latinos", file: "data/artistas_latinos.json", name: "Artistas Latinos", category: "MÚSICA", icon: "🎤", priceCoins: 5000, priceUSD: "$0.99" }
];
window.THEMATIC_PACKS = THEMATIC_PACKS;

// =============================================================================
// 1. ESTADO DE LA APLICACIÓN (INICIAL VACÍO Y LIMPIO)
// =============================================================================
const state = {
  userId: null,
  username: "",
  bio: "",
  coins: 0,
  xp: 0,
  stats: {
    totalQuestions: 0,
    correctAnswers: 0,
    maxStreak: 0,
    currentStreak: 0
  },
  userScore: 0, // Puntaje/XP acumulado del usuario
  winStreak: 0, // Racha de victorias consecutivas
  currentStreak: 0, // Racha de respuestas correctas
  unlockedPacks: [], // IDs de packs temáticos adquiridos (ej: ["cine_2000"])
  packMastery: {}, // Preguntas acertadas por pack temático (ej: { cine_2000: 12 })
  activeThematicPackId: null, // ID del pack temático en juego directo
  allCategoriesUnlocked: true, // Todas las categorías habilitadas por defecto
  allUnlocked: true, // Estado global de desbloqueo completo
  isVIP: false, // Usuario VIP / Pase adquirido
  challenges: [], // Arreglo de desafíos del usuario (sin mock data)
  playedQuestionIds: new Set(), // Registro de preguntas ya jugadas
  pendingCollectionUnlockAnim: false, // Bandera de recompensa para la ruleta tras compra completa

  wheelNeedsMagicUnlockAnim: false, // Sincronización para disparar humo mágico en la ruleta al volver de la colección
  wheelMagicUnlockSoundPlayed: false, // Control de reproducción única para ruleta_todo.mp3
  sfxEnabled: true,
  musicEnabled: false,
  animationsEnabled: true,
  activeTab: 'inicio',
  claimedChallenge: false,
  answeredQuiz: false,
  
  // Metas de desbloqueo de categorías por RetroCoins (Todas habilitadas desde el inicio)
  categoryCoinsThresholds: {
    cine: 0,          // Desbloqueado desde el inicio
    videojuegos: 0,   // Desbloqueado desde el inicio
    tv: 0,            // Desbloqueado desde el inicio
    musica: 0,        // Desbloqueado desde el inicio
    todo: 0           // Desbloqueado desde el inicio
  },

  // Umbrales de desbloqueo por puntaje acumulado (compatibilidad)
  categoryThresholds: {
    cine: 0,
    videojuegos: 0,
    tv: 0,
    musica: 0,
    todo: 0
  },

  // Estado de la Ruleta (WheelSelectionScreen)
  wheel: {
    shots: 3,
    maxShots: 3,
    isSpinning: false,
    currentRotation: 0,
    reloadInterval: null,
    secondsUntilReload: 23 * 3600 + 59 * 60 + 58
  },

  // Estado de la Ruleta de Duelo (#challengeMatchView)
  duelWheel: {
    isSpinning: false,
    currentRotation: 0
  },
  currentDuel: {
    rivalName: 'Usuario 2',
    rivalAvatar: '🕹️',
    currentRound: 1,
    localTotalScore: 0,
    rivalTotalScore: 0,
    handicapSeconds: 5,
    activeAttack: null
  },

  // Estado de la Sesión de Trivia (#triviaView)
  trivia: {
    category: 'cine',
    currentQuestionIndex: 0,
    totalQuestions: 10,
    lives: 3,
    timerSeconds: 15,
    remainingMs: 15000,
    isPaused: false,
    timerInterval: null,
    sessionCoins: 0,
    correctAnswersCount: 0,
    isAnswering: false,
    isDuel: false,
    duelStartTime: 0,
    questions: []
  },
  isChallengeMode: false,

  // Estado de la Tienda (#storeView)
  store: {
    boosters: {
      time: 1,       // +5 Segundos Extra
      fiftyFifty: 1, // 50 / 50
      double: 0      // Respuesta Doble
    },
    purchasedThemes: ['default'],
    activeTheme: 'default'
  }
};
state.currentView = '#homeView';
window.state = state;
window.state.currentView = '#homeView';

// =============================================================================
// SISTEMA DE PROGRESIÓN Y RANGOS ARCADE (10 RANGOS TEMÁTICOS)
// =============================================================================
function getPlayerRank(xp) {
  const currentXP = (typeof xp === 'number' && !isNaN(xp))
    ? xp
    : ((window.state && typeof window.state.xp === 'number')
        ? window.state.xp
        : ((state && typeof state.xp === 'number') ? state.xp : (state?.userScore || 0)));

  let rankObj;
  if (currentXP < 300) {
    rankObj = { rank: 1, tier: 1, minXP: 0, maxXP: 299, name: "Novato del Videoclub 📼" };
  } else if (currentXP < 700) {
    rankObj = { rank: 2, tier: 2, minXP: 300, maxXP: 699, name: "Zapper de Madrugada 📺" };
  } else if (currentXP < 1200) {
    rankObj = { rank: 3, tier: 3, minXP: 700, maxXP: 1199, name: "Cazador de Fichas 🕹️" };
  } else if (currentXP < 1900) {
    rankObj = { rank: 4, tier: 4, minXP: 1200, maxXP: 1899, name: "Capo del DVD 📀" };
  } else if (currentXP < 2800) {
    rankObj = { rank: 5, tier: 5, minXP: 1900, maxXP: 2799, name: "Cinéfago de Culto 🎬" };
  } else if (currentXP < 3900) {
    rankObj = { rank: 6, tier: 6, minXP: 2800, maxXP: 3899, name: "Amo del Cartucho 🎮" };
  } else if (currentXP < 5200) {
    rankObj = { rank: 7, tier: 7, minXP: 3900, maxXP: 5199, name: "Vocalista de Garaje 🎸" };
  } else if (currentXP < 6800) {
    rankObj = { rank: 8, tier: 8, minXP: 5200, maxXP: 6799, name: "Comandante del Rating 📡" };
  } else if (currentXP < 9000) {
    rankObj = { rank: 9, tier: 9, minXP: 6800, maxXP: 8999, name: "Campeón del Arcade 🏆" };
  } else {
    rankObj = { rank: 10, tier: 10, minXP: 9000, maxXP: Infinity, name: "Leyenda Pop 👑" };
  }

  rankObj.toString = function() { return this.name; };
  return rankObj;
}
window.getPlayerRank = getPlayerRank;


// Cargar estadísticas guardadas del jugador
try {
  const savedStats = localStorage.getItem('retroquiz_stats');
  if (savedStats) {
    const parsed = JSON.parse(savedStats);
    state.stats.totalQuestions = Number(parsed.totalQuestions) || 0;
    state.stats.correctAnswers = Number(parsed.correctAnswers) || 0;
    state.stats.maxStreak = Number(parsed.maxStreak) || 0;
    state.stats.currentStreak = Number(parsed.currentStreak) || 0;
  }
} catch (e) {}

// Categorías y configuración de ángulos en ruleta_musica_todo.webp
const categoriesConfig = {
  cine: { name: 'CINE', icon: '🎬', color: '#7b38e5', centerAngle: 180 },
  musica: { name: 'MÚSICA', icon: '🎸', color: '#00FF66', centerAngle: 252 },
  videojuegos: { name: 'VIDEOJUEGOS', icon: '🎮', color: '#e2dd5f', centerAngle: 324 },
  tv: { name: 'TV', icon: '📺', color: '#5fe2df', centerAngle: 36 },
  todo: { name: 'TODO / MIX', icon: '❓', color: '#FF5A5F', centerAngle: 108 }
};



// Obtener lista de categorías actualmente desbloqueadas (por defecto todas habilitadas desde el principio)
function getUnlockedCategories() {
  return Object.keys(categoriesConfig);
}

// =============================================================================
// 2. SINTETIZADOR DE AUDIO RETRO (WEB AUDIO API)
// =============================================================================
let audioCtx = null;
let musicInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sonido de clic corto arcade (assets/audio/botones.wav)
function playClickSound() {
  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('botones.wav', 0.60);
    return;
  }
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

// Sonido de moneda estilo Mario/Arcade
function playCoinSound() {
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(987.77, now);
  gain1.gain.setValueAtTime(0.15, now);
  gain1.gain.linearRampToValueAtTime(0.01, now + 0.08);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.08);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(1318.51, now + 0.08);
  gain2.gain.setValueAtTime(0.2, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.36);
}

// Fanfarria Retro Power-Up
function playJugarStartSound() {
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [330, 392, 659, 523, 587, 784];
  const step = 0.07;
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + (idx * step));
    
    gain.gain.setValueAtTime(0.22, now + (idx * step));
    gain.gain.exponentialRampToValueAtTime(0.01, now + ((idx + 1) * step));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + (idx * step));
    osc.stop(now + ((idx + 1) * step) + 0.02);
  });
}

// Sonido de destello / reflejo cristalino
function playShimmerSound() {
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(2400, now + 0.18);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

// Sonido apertura de modal (assets/audio/pantallas_emergentes.wav)
function playModalOpenSound() {
  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('pantallas_emergentes.wav', 0.65);
    return;
  }
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

// Sonido de giro de ruleta (assets/audio/ruleta.mp3)
function playSpinningSound() {
  if (typeof SoundManager !== 'undefined') {
    if (SoundManager.sfxRuleta && !SoundManager.sfxRuleta.paused && SoundManager.sfxRuleta.currentTime > 0) {
      return;
    }
    SoundManager.playSFX('ruleta.mp3', 0.70);
  }
}

// Beep de conteo 3, 2, 1
function playCountdownBeep(freq = 600) {
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

// Sonido de victoria al aterrizar ruleta
function playWheelWinSound() {
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [440, 554.37, 659.25, 880].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now + i * 0.08);
    gain.gain.setValueAtTime(0.22, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.01, now + (i + 1) * 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + (i + 1) * 0.08 + 0.02);
  });
}

// Sonido de respuesta correcta
function playSuccessSound() {
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now + i * 0.08);
    gain.gain.setValueAtTime(0.2, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.01, now + (i + 1) * 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + (i + 1) * 0.08 + 0.02);
  });
}

// Sonido de error
function playErrorSound() {
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.linearRampToValueAtTime(100, now + 0.2);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.24);
}

// Sonido dramático de abandono / derrota
function playDramaticQuitSound() {
  if (!state.sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.85);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.linearRampToValueAtTime(0.001, now + 0.9);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.9);
}

// Música chiptune 8-bit sintetizada suave en bucle
function toggleChiptuneMusic(enable) {
  if (!enable) {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  const melody = [
    261.63, 329.63, 392.00, 523.25,
    392.00, 329.63, 293.66, 349.23,
    440.00, 587.33, 440.00, 349.23,
    329.63, 392.00, 523.25, 659.25
  ];
  let noteIndex = 0;

  if (musicInterval) clearInterval(musicInterval);

  musicInterval = setInterval(() => {
    if (!state.musicEnabled) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(melody[noteIndex], now);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);

    noteIndex = (noteIndex + 1) % melody.length;
  }, 220);
}

// =============================================================================
// 3. NAVEGACIÓN Y ENTRADA DE RUTAS (HASH ROUTER)
// =============================================================================
const routesMap = {
  '#home': 'homeView',
  '#inicio': 'homeView',
  '#ruleta': 'wheelView',
  '#coleccion': 'collectionView',
  '#collection': 'collectionView',
  '#trivia': 'triviaView',
  '#gameover': 'gameOverView',
  '#resultados': 'resultsView',
  '#results': 'resultsView',
  '#desafios': 'challengesView',
  '#challenges': 'challengesView',
  '#duelo-ruleta': 'challengeMatchView',
  '#duelo-resultados': 'challengeResultView',
  '#tienda': 'storeView',
  '#store': 'storeView',
  '#perfil': 'profileView',
  '#profile': 'profileView'
};

const screenToHashMap = {
  'homeView': '#home',
  'wheelView': '#ruleta',
  'collectionView': '#coleccion',
  'triviaView': '#trivia',
  'gameOverView': '#gameover',
  'resultsView': '#resultados',
  'challengesView': '#desafios',
  'challengeMatchView': '#duelo-ruleta',
  'challengeResultView': '#duelo-resultados',
  'storeView': '#tienda',
  'profileView': '#perfil'
};

let isNavigating = false;

// Disparar confeti en pantalla completa durante 3 segundos con ráfagas recurrentes
function triggerCelebrationConfetti() {
  if (typeof confetti === 'function') {
    // 1. Explosión central principal
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffe600', '#ff007f', '#00f0ff', '#7b2cbf', '#00ff66'],
      zIndex: 9999
    });

    // 2. Ráfagas recurrentes durante 3 segundos desde los bordes laterales
    const duration = 3000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.65 },
        colors: ['#ffe600', '#ff007f', '#00f0ff', '#7b2cbf', '#00ff66'],
        zIndex: 9999
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.65 },
        colors: ['#ffe600', '#ff007f', '#00f0ff', '#7b2cbf', '#00ff66'],
        zIndex: 9999
      });
    }, 380);
  }
}

// --- SECUENCIA CENTRALIZADA DE AUDIO Y CONFETI EN RESULTADOS (#resultsView & #challengeResultView) ---
function playResultsAudioSequence(customCorrectas = null) {
  // 1. Detén por completo cualquier música previa de la trivia
  if (typeof SoundManager !== 'undefined') {
    SoundManager.stopAllBGM();
    // 2. Reproduce inmediatamente la fanfarria base una sola vez
    SoundManager.playSFX('resultados.mp3', 0.75);
  }

  // 3. Obtén los aciertos y el total de la ronda
  const total = window.state?.isChallengeMode ? 5 : 10;
  const correctas = (typeof customCorrectas === 'number')
    ? customCorrectas
    : ((window.state && typeof window.state.correctAnswersCount === 'number')
        ? window.state.correctAnswersCount
        : (state.trivia && typeof state.trivia.correctAnswersCount === 'number'
            ? state.trivia.correctAnswersCount
            : 0));

  // A. PUNTAJE PERFECTO (10 de 10 en Solitario O 5 de 5 en Desafíos):
  if ((total === 10 && correctas === 10) || (total === 5 && correctas === 5)) {
    if (typeof SoundManager !== 'undefined') {
      SoundManager.playSFX('pantalla_resultados_10.mp3', 0.85);
    }
    if (typeof confetti === 'function') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  } 
  // B. EXCELENTE DESEMPEÑO (8 o 9 de 10 en Solitario O 4 de 5 en Desafíos):
  else if ((total === 10 && (correctas === 8 || correctas === 9)) || (total === 5 && correctas === 4)) {
    if (typeof SoundManager !== 'undefined') {
      SoundManager.playSFX('pantalla_resultados_aplausos.mp3', 0.80);
    }
    // NO dispares confeti.
  } 
  // C. DESEMPEÑO ESTÁNDAR (<= 7 en Solitario O <= 3 en Desafíos):
  else {
    // Solo suena la fanfarria base 'resultados.mp3' una vez. Sin aplausos, sin audio de 10 y sin confeti.
  }
}
window.playResultsAudioSequence = playResultsAudioSequence;

function showView(targetId) {
  const targetSelector = targetId.startsWith('#') ? targetId : '#' + targetId;
  window.state.currentView = targetSelector;
  state.currentView = targetSelector;

  if (targetSelector === '#profileView') {
    openProfileModal();
    if (typeof SoundManager !== 'undefined') {
      SoundManager.playBGM('menu');
    }
    return;
  }

  // Si el modal de perfil estuviera abierto y se navega a otra pantalla, cerrarlo
  const profileModal = document.getElementById('profileView');
  if (profileModal && (profileModal.classList.contains('open') || profileModal.style.display === 'flex')) {
    closeProfileModal();
  }

  const allViews = [
    '#homeView', 
    '#wheelView', 
    '#collectionView', 
    '#triviaView', 
    '#challengesView', 
    '#storeView', 
    '#challengeMatchView',
    '#challengeResultView',
    '#resultsView',
    '#gameOverView'
  ];
  
  // Apaga de forma estricta todas las pantallas
  allViews.forEach(selector => {
    const view = document.querySelector(selector);
    if (view) {
      view.style.display = 'none';
      view.classList.remove('active-view', 'active', 'slide-enter', 'slide-exit');
    }
  });

  // Enciende ÚNICAMENTE la pantalla destino
  const targetView = document.querySelector(targetSelector);
  if (targetView) {
    targetView.style.display = 'flex';
    targetView.classList.add('active-view', 'active');
    targetView.scrollTop = 0; // Resetea el scroll interno
  }

  // Conexión de música por pantallas (transiciones y rutas)
  if (typeof SoundManager !== 'undefined') {
    if (targetSelector === '#homeView' || targetSelector === '#collectionView') {
      SoundManager.playBGM('inicio');
    } else if (targetSelector === '#challengesView') {
      SoundManager.stopAllBGM();
      SoundManager.playBGM('desafios');
    } else if (targetSelector === '#challengeMatchView') {
      SoundManager.stopAllBGM();
      SoundManager.playBGM('ruleta');
    } else if (targetSelector === '#storeView') {
      SoundManager.stopAllBGM();
      SoundManager.playBGM('tienda');
    } else if (targetSelector === '#wheelView') {
      SoundManager.playBGM('ruleta');
    } else if (targetSelector === '#triviaView') {
      SoundManager.stopSpinSound();
      // La música de trivia arrancará en startTriviaTimer() al hacerse visible e iniciar el temporizador de 15s
    } else if (targetSelector === '#gameOverView') {
      SoundManager.stopAllBGM();
      // En #gameOverView se elimina la reproducción simultánea o previa de gameover.mp3
    } else if (targetSelector === '#resultsView' || targetSelector === '#challengeResultView') {
      playResultsAudioSequence();
    }
  }
}

function transitionToScreen(fromScreenId, toScreenId, onComplete) {
  isNavigating = false;

  if (fromScreenId === 'triviaView' && toScreenId !== 'triviaView') {
    clearInterval(state.trivia.timerInterval);
    const triviaView = document.getElementById('triviaView');
    if (triviaView) triviaView.classList.remove('siren-panic');
  }

  renderScreenView(toScreenId);
  if (onComplete) onComplete();
}

function triggerChallengesEntranceAnimation() {
  const challengesView = document.getElementById('challengesView');
  if (!challengesView) return;

  challengesView.style.overflow = 'hidden';
  challengesView.classList.remove('anim-assembling');
  void challengesView.offsetWidth; // Forzar reflow para reiniciar animaciones
  challengesView.classList.add('anim-assembling');

  // Remueve las clases temporales tras finalizar el ensamblado (aprox. 800 ms)
  setTimeout(() => {
    challengesView.classList.remove('anim-assembling');
    challengesView.style.overflow = '';
  }, 850);
}

function triggerChallengeMatchEntranceAnimation() {
  const matchView = document.getElementById('challengeMatchView');
  if (!matchView) return;

  matchView.classList.remove('anim-assembling');
  void matchView.offsetWidth;
  matchView.classList.add('anim-assembling');

  setTimeout(() => {
    matchView.classList.remove('anim-assembling');
  }, 850);
}

function triggerDuelResultsEntranceAnimation() {
  const resultsView = document.getElementById('challengeResultView');
  if (!resultsView) return;

  resultsView.classList.remove('anim-assembling');
  void resultsView.offsetWidth;
  resultsView.classList.add('anim-assembling');

  setTimeout(() => {
    resultsView.classList.remove('anim-assembling');
  }, 850);
}

function triggerStoreEntranceAnimation() {
  const storeView = document.getElementById('storeView');
  if (!storeView) return;

  storeView.classList.remove('anim-assembling');
  void storeView.offsetWidth;
  storeView.classList.add('anim-assembling');

  setTimeout(() => {
    storeView.classList.remove('anim-assembling');
  }, 850);
}

function setupDuelMatchUI(rivalName = 'Usuario 2', rivalAvatar = '🕹️', round = 1) {
  state.currentDuel = {
    ...state.currentDuel,
    rivalName: rivalName,
    rivalAvatar: rivalAvatar,
    currentRound: round,
    localTotalScore: state.currentDuel?.localTotalScore || 0,
    rivalTotalScore: state.currentDuel?.rivalTotalScore || 0,
    handicapSeconds: 5,
    activeAttack: state.currentDuel?.activeAttack || null
  };

  const titleEl = document.getElementById('challengeMatchTitle');
  if (titleEl) {
    if (round === 'desempate' || state.isTieBreaker || window.state?.isTieBreaker) {
      titleEl.innerText = 'RONDA DE DESEMPATE';
    } else {
      titleEl.innerText = `RONDA ${round}`.toUpperCase();
    }
  }

  const nameEl = document.getElementById('duelRivalName');
  if (nameEl) nameEl.innerText = rivalName;

  const avatarEl = document.querySelector('#duelRivalAvatar span');
  if (avatarEl) avatarEl.innerText = rivalAvatar;

  const handicapRivalEl = document.getElementById('duelHandicapRival');
  if (handicapRivalEl) handicapRivalEl.innerText = rivalName;
}

function triggerWheelEntranceAnimations() {
  const wheelStage = document.querySelector('#wheelView .wheel-stage');
  const shotsSection = document.querySelector('#wheelView .shots-system-section');

  if (wheelStage) {
    wheelStage.classList.remove('wheel-pop-in');
    void wheelStage.offsetWidth; // Force reflow
    wheelStage.classList.add('wheel-pop-in');
  }

  if (shotsSection) {
    shotsSection.classList.remove('slide-up-in');
    void shotsSection.offsetWidth; // Force reflow
    shotsSection.classList.add('slide-up-in');
  }

  setTimeout(() => {
    if (wheelStage) wheelStage.classList.remove('wheel-pop-in');
    if (shotsSection) shotsSection.classList.remove('slide-up-in');
  }, 600);
}

function renderScreenView(screenId) {
  const normalizedId = screenId ? screenId.replace(/^#/, '') : 'homeView';
  showView('#' + normalizedId);

  const targetView = document.getElementById(normalizedId) || document.getElementById('homeView');
  if (targetView) {

    if (targetView.id === 'homeView') {
      state.activeTab = 'inicio';
      setActiveTab('inicio');
      triggerAppEntranceAnimation();
    } else if (targetView.id === 'wheelView') {
      state.activeTab = 'ruleta';
      updateWheelCategoriesUI();
      triggerWheelEntranceAnimations();

      const hasPendingCollectionAnim = Boolean(
        (window.state && window.state.pendingCollectionUnlockAnim) ||
        state.pendingCollectionUnlockAnim
      );

      if (hasPendingCollectionAnim) {
        if (window.state) window.state.pendingCollectionUnlockAnim = false;
        state.pendingCollectionUnlockAnim = false;
        setTimeout(() => {
          triggerMagicSmokeUnlockAnimation(true);
          if (typeof SoundManager !== 'undefined') {
            SoundManager.playSFX('ruleta_todo.mp3', 0.85);
          }
          if (typeof mostrarAvisoFlotanteRuleta === 'function') {
            mostrarAvisoFlotanteRuleta("¡Todas tus compras se agregaron a la ruleta! 🚀");
          }
        }, 350);
      } else if (state.wheelNeedsMagicUnlockAnim) {
        state.wheelNeedsMagicUnlockAnim = false;
        setTimeout(() => {
          triggerMagicSmokeUnlockAnimation(true);
        }, 350);
      }
    } else if (targetView.id === 'collectionView') {
      state.activeTab = 'coleccion';
      renderCollectionCardsUI();
    } else if (targetView.id === 'triviaView') {
      state.activeTab = 'trivia';
    } else if (targetView.id === 'gameOverView') {
      state.activeTab = 'gameover';
    } else if (targetView.id === 'resultsView') {
      state.activeTab = 'resultados';
    } else if (targetView.id === 'challengesView') {
      state.activeTab = 'desafios';
      setActiveTab('desafios');
      triggerChallengesEntranceAnimation();
      if (typeof renderChallengesUI === 'function') renderChallengesUI();
      setTimeout(() => {
        if (typeof checkChallengeOnboardingTrigger === 'function') {
          checkChallengeOnboardingTrigger();
        }
      }, 350);
    } else if (targetView.id === 'challengeMatchView') {
      state.activeTab = 'duelo-ruleta';
      updateWheelCategoriesUI();
      triggerChallengeMatchEntranceAnimation();
    } else if (targetView.id === 'challengeResultView') {
      state.activeTab = 'duelo-resultados';
      triggerDuelResultsEntranceAnimation();
    } else if (targetView.id === 'storeView') {
      state.activeTab = 'tienda';
      setActiveTab('tienda');
      updateStoreUI();
      triggerStoreEntranceAnimation();
    } else if (targetView.id === 'profileView') {
      state.activeTab = 'perfil';
      setActiveTab('perfil');
    }
  }
}

// =============================================================================
// PERSISTENCIA Y MODO DIRECTO DE PACKS TEMÁTICOS ("MIS COLECCIONES")
// =============================================================================
function savePackProgressToCloud() {
  const unlockedPacks = window.state?.unlockedPacks || state.unlockedPacks || [];
  const packMastery = window.state?.packMastery || state.packMastery || {};
  try {
    localStorage.setItem('retroquiz_unlocked_packs', JSON.stringify(unlockedPacks));
    localStorage.setItem('retroquiz_pack_mastery', JSON.stringify(packMastery));
  } catch (e) {}

  const uid = window.state?.userId || state.userId;
  if (window.db && window.firestoreOps && uid) {
    try {
      const { doc, updateDoc } = window.firestoreOps;
      const userRef = doc(window.db, "usuarios", uid);
      updateDoc(userRef, {
        unlockedPacks: unlockedPacks,
        packMastery: packMastery,
        updatedAt: new Date().toISOString()
      }).catch(err => console.error("Error al actualizar packs en Firestore:", err));
    } catch (err) {
      console.error("Error al preparar savePackProgressToCloud:", err);
    }
  }
}
window.savePackProgressToCloud = savePackProgressToCloud;

// Compra dual de packs temáticos (RetroCoins o IAP $0.99 USD)
function comprarThematicPack(packId, method = 'coins') {
  const pack = THEMATIC_PACKS.find(p => p.id === packId);
  if (!pack) return;

  if (!state.unlockedPacks) state.unlockedPacks = [];
  if (window.state && !window.state.unlockedPacks) window.state.unlockedPacks = [];

  const currentUnlocked = window.state?.unlockedPacks || state.unlockedPacks;
  if (currentUnlocked.includes(packId)) {
    showRetroToast(`¡Ya tienes el pack "${pack.name}"!`, 'info');
    return;
  }

  if (method === 'coins') {
    const cost = pack.priceCoins || 5000;
    if (state.coins < cost) {
      if (typeof SoundManager !== 'undefined') SoundManager.playSFX('derrota.wav', 0.6);
      showRetroToast(`Necesitas 5,000 RetroCoins para desbloquear este pack. ¡Recarga en la Tienda!`, 'warning');
      return;
    }
    state.coins -= cost;
    if (window.state) window.state.coins = state.coins;
    if (typeof saveCoinsToCloud === 'function') saveCoinsToCloud(state.coins);
  } else {
    console.log(`[IAP] Compra exitosa simulada de ${pack.name} por ${pack.priceUSD}`);
  }

  if (!state.unlockedPacks.includes(packId)) state.unlockedPacks.push(packId);
  if (window.state && !window.state.unlockedPacks.includes(packId)) window.state.unlockedPacks.push(packId);

  savePackProgressToCloud();

  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('compra_tienda.wav', 0.85);
  } else if (typeof playCoinSound === 'function') {
    playCoinSound();
  }
  if (typeof triggerCelebrationConfetti === 'function') {
    triggerCelebrationConfetti();
  }

  showRetroToast(`¡Pack "${pack.name}" desbloqueado con éxito! 🎉`, 'success');

  renderCollectionCardsUI();
  updateStoreUI();
  updateHUD();
}
window.comprarThematicPack = comprarThematicPack;

// Desbloqueo de todas las colecciones ($2.99 USD)
function desbloquearTodasLasColecciones() {
  if (!state.unlockedPacks) state.unlockedPacks = [];
  if (window.state && !window.state.unlockedPacks) window.state.unlockedPacks = [];

  THEMATIC_PACKS.forEach(p => {
    if (!state.unlockedPacks.includes(p.id)) state.unlockedPacks.push(p.id);
    if (window.state && !window.state.unlockedPacks.includes(p.id)) window.state.unlockedPacks.push(p.id);
  });

  state.allCategoriesUnlocked = true;
  state.allUnlocked = true;

  // Activa la bandera temporal para la secuencia de recompensa en la ruleta
  state.pendingCollectionUnlockAnim = true;
  if (window.state) window.state.pendingCollectionUnlockAnim = true;

  savePackProgressToCloud();

  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('compra_tienda.wav', 0.85);
  } else if (typeof playSuccessSound === 'function') {
    playSuccessSound();
  }
  if (typeof triggerCelebrationConfetti === 'function') {
    triggerCelebrationConfetti();
  }

  showRetroToast(`¡Todas las colecciones han sido desbloqueadas! ⭐`, 'success');

  renderCollectionCardsUI();
  updateStoreUI();
}
window.desbloquearTodasLasColecciones = desbloquearTodasLasColecciones;

// Modo Directo: JUGAR PACK ▶
async function jugarThematicPack(packId) {
  const pack = THEMATIC_PACKS.find(p => p.id === packId);
  if (!pack) return;

  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('botones.wav', 0.60);
  } else if (typeof playClickSound === 'function') {
    playClickSound();
  }

  try {
    const response = await fetch(pack.file + '?v=' + Date.now());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    let packQuestions = Array.isArray(data) ? data : (data.preguntas || []);
    if (!packQuestions || packQuestions.length === 0) {
      showRetroToast('No se pudieron cargar preguntas de este pack', 'error');
      return;
    }

    // Shuffle y seleccionar 10 preguntas del pack
    const shuffled = [...packQuestions].sort(() => 0.5 - Math.random());
    const roundQuestions = shuffled.slice(0, 10);

    // Asignar al estado global
    window.state.activeThematicPackId = packId;
    state.activeThematicPackId = packId;
    window.state.isChallengeMode = false;
    window.state.isTieBreaker = false;
    window.state.currentRoundQuestions = roundQuestions;
    window.state.currentQuestionIndex = 0;
    window.state.lives = 3;
    window.state.correctAnswersCount = 0;
    window.state.currentRoundXP = 0;
    window.state.accumulatedAnswerTimeMs = 0;

    state.isChallengeMode = false;
    state.isTieBreaker = false;
    state.currentRoundXP = 0;
    if (state.trivia) {
      state.trivia.isDuel = false;
      state.trivia.questions = roundQuestions;
      state.trivia.totalQuestions = 10;
      state.trivia.timerSeconds = 15;
      state.trivia.remainingMs = 15000;
      state.trivia.duelStartTime = performance.now();
      state.trivia.questionStartTime = performance.now();
      state.trivia.lives = 3;
      state.trivia.sessionCoins = 0;
      state.trivia.sessionXP = 0;
      state.trivia.currentStreak = 0;
      state.trivia.correctAnswersCount = 0;
      state.trivia.currentQuestionIndex = 0;
      state.trivia.isAnswering = false;
      state.trivia.category = pack.category.toLowerCase();
    }
    state.correctAnswersCount = 0;

    // Configurar tema visual de trivia según categoría
    const triviaView = document.getElementById('triviaView');
    let themeColor = '#7B38E5'; // Cine
    let catClass = 'cine';
    const normCat = pack.category.toUpperCase();
    if (normCat.includes('VIDEO') || normCat.includes('JUEGO')) {
      themeColor = '#B5DC35';
      catClass = 'videojuegos';
    } else if (normCat.includes('TV') || normCat.includes('SERIE')) {
      themeColor = '#00E5FF';
      catClass = 'tv';
    } else if (normCat.includes('MUS') || normCat.includes('MÚS')) {
      themeColor = '#00FF66';
      catClass = 'musica';
    } else if (normCat.includes('80') || normCat.includes('90') || normCat.includes('ÉPOCA')) {
      themeColor = '#FF5A5F';
      catClass = 'todo';
    }

    if (triviaView) {
      triviaView.style.setProperty('--trivia-theme-color', themeColor);
      triviaView.dataset.cat = catClass;
      triviaView.classList.remove('siren-panic', 'cat-cine', 'cat-videojuegos', 'cat-musica', 'cat-tv', 'cat-todo', 'cat-mix');
      triviaView.classList.add('cat-' + catClass);
    }

    const abandonModal = document.getElementById('abandonModal');
    if (abandonModal) abandonModal.style.display = 'none';

    updateTriviaHeartsUI();
    updateRoundCoinsUI(0);

    const collectionView = document.getElementById('collectionView');
    if (collectionView) {
      collectionView.classList.remove('active', 'active-view');
      collectionView.style.display = 'none';
    }

    state.activeTab = 'trivia';
    showView('#triviaView');
    if (window.location.hash !== '#trivia') {
      try { history.replaceState(null, '', '#trivia'); } catch(e) { window.location.hash = '#trivia'; }
    }

    renderizarPreguntaActual();

    if (typeof iniciarTemporizador === 'function') {
      iniciarTemporizador();
    }
  } catch (err) {
    console.error('Error al iniciar pack temático:', err);
    showRetroToast('Error al cargar las preguntas del pack', 'error');
  }
}
window.jugarThematicPack = jugarThematicPack;

// Renderizado dinámico de tarjetas en "MIS COLECCIONES" (#collectionView)
function renderCollectionCardsUI() {
  const coinEl = document.getElementById('userCoinsCollection');
  if (coinEl) {
    coinEl.innerText = state.coins.toLocaleString();
  }

  const container = document.getElementById('collectionCardsList');
  if (!container) return;

  if (!state.unlockedPacks) state.unlockedPacks = [];
  if (window.state && !window.state.unlockedPacks) window.state.unlockedPacks = [];
  if (!state.packMastery) state.packMastery = {};
  if (window.state && !window.state.packMastery) window.state.packMastery = {};

  const unlockedPacks = window.state?.unlockedPacks || state.unlockedPacks || [];
  const packMastery = window.state?.packMastery || state.packMastery || {};

  container.innerHTML = THEMATIC_PACKS.map((pack, idx) => {
    const isUnlocked = state.allCategoriesUnlocked || state.allUnlocked || unlockedPacks.includes(pack.id);
    const masteryCount = Math.min(50, Math.max(0, parseInt(packMastery[pack.id], 10) || 0));
    const masteryPercent = Math.min(100, Math.round((masteryCount / 50) * 100));

    return `
      <div class="collection-card ${isUnlocked ? 'pack-unlocked' : 'pack-locked'}" data-pack-id="${pack.id}" style="--i: ${idx};">
        <div class="pack-card-header">
          <div class="pack-card-main-info">
            <div class="pack-icon-box">${pack.icon}</div>
            <div class="pack-title-info">
              <span class="pack-cat-pill">${pack.category}</span>
              <h3 class="pack-name">${pack.name}</h3>
            </div>
          </div>
          <div class="pack-card-badge">
            ${isUnlocked ? '<span class="pack-badge-unlocked">✓</span>' : '<span class="pack-badge-locked">🔒</span>'}
          </div>
        </div>

        ${isUnlocked ? `
          <div class="pack-unlocked-body">
            <div class="pack-mastery-wrap">
              <div class="pack-mastery-header">
                <span class="pack-mastery-label">Progreso de Dominio</span>
                <span class="pack-mastery-count">${masteryCount} / 50 Dominadas</span>
              </div>
              <div class="pack-mastery-track">
                <div class="pack-mastery-fill" style="width: ${masteryPercent}%;"></div>
              </div>
            </div>
            <button class="btn-pack-play interactive-press" onclick="jugarThematicPack('${pack.id}')">
              JUGAR PACK ▶
            </button>
          </div>
        ` : `
          <div class="pack-locked-body">
            <div class="pack-dual-buttons">
              <button class="btn-pack-buy-coins interactive-press" onclick="comprarThematicPack('${pack.id}', 'coins')">
                <img src="assets/global/retrocoin.webp" alt="RC" class="pack-coin-img">
                <span>5,000</span>
              </button>
              <button class="btn-pack-buy-usd interactive-press" onclick="comprarThematicPack('${pack.id}', 'usd')">
                <span>💳 $0.99 USD</span>
              </button>
            </div>
          </div>
        `}
      </div>
    `;
  }).join('');

  const btnUnlockAll = document.getElementById('btnUnlockAllCollection');
  if (btnUnlockAll) {
    const allPacksUnlocked = THEMATIC_PACKS.every(p => unlockedPacks.includes(p.id)) || state.allCategoriesUnlocked || state.allUnlocked;
    if (allPacksUnlocked) {
      btnUnlockAll.innerHTML = '<span>⭐ ¡TODAS LAS COLECCIONES DESBLOQUEADAS! ✓</span>';
      btnUnlockAll.classList.add('unlocked-done');
      btnUnlockAll.style.pointerEvents = 'none';
      btnUnlockAll.style.opacity = '0.85';
    } else {
      btnUnlockAll.innerHTML = '<span>⭐ DESBLOQUEAR TODAS LAS COLECCIONES POR $2.99 USD</span>';
      btnUnlockAll.classList.remove('unlocked-done');
      btnUnlockAll.style.pointerEvents = 'auto';
      btnUnlockAll.style.opacity = '1';
    }
  }

  updateWheelCategoriesUI();
}

// Actualización y sincronización de la tienda (#storeView)
function updateStoreUI() {
  const storeUserCoins = document.getElementById('storeUserCoins');
  if (storeUserCoins) {
    storeUserCoins.innerText = state.coins.toLocaleString();
  }

  // Actualizar inventario de potenciadores
  const bTime = document.getElementById('badgeBoosterTime');
  const b5050 = document.getElementById('badgeBooster5050');
  const bDouble = document.getElementById('badgeBoosterDouble');

  if (bTime) bTime.innerText = `x${state.store?.boosters?.time || 0}`;
  if (b5050) b5050.innerText = `x${state.store?.boosters?.fiftyFifty || 0}`;
  if (bDouble) bDouble.innerText = `x${state.store?.boosters?.double || 0}`;

  // Actualizar botones de temas estacionales
  const themeCards = document.querySelectorAll('.store-theme-card');
  themeCards.forEach(card => {
    const themeId = card.dataset.theme;
    const cost = card.dataset.cost;
    const btn = card.querySelector('.btn-theme-action');
    if (!btn) return;

    const isPurchased = state.store?.purchasedThemes?.includes(themeId);
    const isEquipped = state.store?.activeTheme === themeId;

    btn.classList.remove('is-equipped', 'is-purchased');

    if (isEquipped) {
      btn.classList.add('is-equipped');
      btn.innerHTML = '<span>✓ EQUIPADO</span>';
    } else if (isPurchased) {
      btn.classList.add('is-purchased');
      btn.innerHTML = '<span>EQUIPAR</span>';
    } else {
      btn.innerHTML = `
        <span class="btn-theme-label">COMPRAR</span>
        <span class="btn-theme-price">
          <img src="assets/global/retrocoin.webp" alt="RC" class="global-retrocoin-img mini-coin">
          <span>${parseInt(cost, 10).toLocaleString()}</span>
        </span>
      `;
    }
  });

  // Sección 1: Packs de Preguntas sincronizados con THEMATIC_PACKS
  const packsScroll = document.getElementById('storePacksScroll');
  if (packsScroll && Array.isArray(window.THEMATIC_PACKS)) {
    const unlocked = window.state?.unlockedPacks || state.unlockedPacks || [];
    packsScroll.innerHTML = window.THEMATIC_PACKS.map(pack => {
      const isAcquired = state.allCategoriesUnlocked || state.allUnlocked || unlocked.includes(pack.id);
      return `
        <div class="store-pack-card interactive-press" data-pack="${pack.id}">
          <div class="pack-title-box">
            <span class="pack-title">${pack.category}</span>
            <span class="pack-subtitle">${pack.name}</span>
          </div>
          <div class="pack-artwork">
            <span class="pack-art-emoji" style="font-size: 32px;">${pack.icon}</span>
          </div>
          <div class="pack-status-badge ${isAcquired ? 'store-badge-acquired' : ''}">
            <span>${isAcquired ? 'ADQUIRIDO ✓' : 'DISPONIBLE'}</span>
          </div>
          ${isAcquired ? `
            <button class="pack-price-pill" style="background:#2EE2B6; color:#000; border:none; pointer-events:none; font-weight:800;" disabled>
              <span>ADQUIRIDO ✓</span>
            </button>
          ` : `
            <div style="display:flex; gap:4px; width:100%;">
              <button class="pack-price-pill interactive-press" style="flex:1; cursor:pointer;" onclick="event.stopPropagation(); comprarThematicPack('${pack.id}', 'coins')">
                <img src="assets/global/retrocoin.webp" alt="RC" class="global-retrocoin-img mini-coin">
                <span>5,000</span>
              </button>
              <button class="pack-price-pill interactive-press" style="flex:1; cursor:pointer; background:#00E5FF; color:#000;" onclick="event.stopPropagation(); comprarThematicPack('${pack.id}', 'usd')">
                <span>$0.99</span>
              </button>
            </div>
          `}
        </div>
      `;
    }).join('');
  }
}

function buyBooster(type, cost, name) {
  const price = parseInt(cost, 10) || 150;
  if (state.coins >= price) {
    state.coins -= price;
    if (typeof saveCoinsToCloud === 'function') saveCoinsToCloud(state.coins);
    if (!state.store) state.store = { boosters: {}, purchasedThemes: ['default'], activeTheme: 'default' };
    if (!state.store.boosters) state.store.boosters = {};
    state.store.boosters[type] = (state.store.boosters[type] || 0) + 1;

    updateStoreUI();
    renderCollectionCardsUI();
    const userCoins = document.getElementById('userCoins');
    if (userCoins) userCoins.innerText = state.coins.toLocaleString();

    playCoinSound();
    playSuccessSound();
    if (typeof SoundManager !== 'undefined') SoundManager.playSFX('compra_tienda.wav', 0.70);
    showRetroToast(`¡Has adquirido 1x "${name}"! (-${price} RC)`, '⚡');
  } else {
    playErrorSound();
    showRetroToast(`No tienes suficientes RetroCoins (necesitas ${price} RC)`, '⚠️');
  }
}

function buyTheme(themeId, cost, name) {
  const price = parseInt(cost, 10) || 2500;
  if (state.coins >= price) {
    state.coins -= price;
    if (typeof saveCoinsToCloud === 'function') saveCoinsToCloud(state.coins);
    if (!state.store) state.store = { boosters: {}, purchasedThemes: ['default'], activeTheme: 'default' };
    if (!state.store.purchasedThemes) state.store.purchasedThemes = ['default'];

    if (!state.store.purchasedThemes.includes(themeId)) {
      state.store.purchasedThemes.push(themeId);
    }
    equipTheme(themeId);
    triggerCelebrationConfetti();
    playCoinSound();
    playWheelWinSound();
    if (typeof SoundManager !== 'undefined') SoundManager.playSFX('compra_tienda.wav', 0.70);
    showRetroToast(`¡Tema "${name}" desbloqueado y equipado! (-${price} RC)`, '🎨');
  } else {
    playErrorSound();
    showRetroToast(`No tienes suficientes RetroCoins (necesitas ${price} RC)`, '⚠️');
  }
}

function equipTheme(themeId) {
  if (!state.store) state.store = { boosters: {}, purchasedThemes: ['default'], activeTheme: 'default' };
  state.store.activeTheme = themeId;

  // Remover temas previos aplicados al body
  document.body.classList.remove('theme-navidad', 'theme-halloween', 'theme-pascua', 'theme-verano');

  if (themeId && themeId !== 'default') {
    document.body.classList.add(`theme-${themeId}`);
  }

  updateStoreUI();
  playClickSound();
}

function resetTheme() {
  equipTheme('default');
  showRetroToast('Tema original por defecto restaurado', '✨');
}

function handleHashChange() {
  const currentHash = window.location.hash || '#home';
  const targetScreenId = routesMap[currentHash] || 'homeView';
  renderScreenView(targetScreenId);
}

function navigateToScreen(screenId) {
  const targetHash = screenToHashMap[screenId] || '#home';
  playClickSound();

  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    renderScreenView(screenId);
  }
}

function triggerAppEntranceAnimation() {
  const animatedElements = document.querySelectorAll(
    '.anim-enter-top, .anim-enter-logo, .anim-enter-sub, .anim-enter-chars, .anim-enter-decor, .anim-enter-btn-jugar, .anim-enter-sub-btns, .anim-enter-bottom'
  );

  animatedElements.forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });

  setTimeout(() => {
    playShimmerSound();
  }, 350);
}

// =============================================================================
// 4. LÓGICA DE LA RULETA (WHEEL SELECTION SCREEN)
// =============================================================================

// Obtener el asset de la ruleta con todos los segmentos a color habilitados por defecto
function getWheelAssetForUnlocked(unlocked) {
  return 'assets/pantalla_ruleta/ruleta_todo.webp';
}

function getWheelAssetForLevel(count) {
  const unlocked = getUnlockedCategories();
  return getWheelAssetForUnlocked(unlocked);
}

// Actualizar renderizado visual de la ruleta por nivel y botón IAP
function updateWheelCategoriesUI() {
  const unlocked = getUnlockedCategories();

  // Actualizar la imagen .webp del disco rotatorio según el nivel de progresión
  // Si hay una animación de humo pendiente al entrar a la ruleta, diferir cambio para la detonación
  const imgEl = document.getElementById('wheelDiscImg') || document.querySelector('.wheel-disc-img');
  if (imgEl && !state.wheelNeedsMagicUnlockAnim) {
    const targetSrc = getWheelAssetForUnlocked(unlocked);
    const currentSrc = imgEl.getAttribute('src') || imgEl.src;
    if (!currentSrc.endsWith(targetSrc) && !imgEl.src.includes(targetSrc)) {
      imgEl.src = targetSrc;
    }
  }

  const duelImgEl = document.getElementById('duelWheelDiscImg');
  if (duelImgEl) {
    const targetSrc = getWheelAssetForUnlocked(unlocked);
    const currentSrc = duelImgEl.getAttribute('src') || duelImgEl.src;
    if (!currentSrc.endsWith(targetSrc) && !duelImgEl.src.includes(targetSrc)) {
      duelImgEl.src = targetSrc;
    }
  }

  // Actualizar el botón IAP a verde "¡TODO DESBLOQUEADO!" al estar desbloqueado
  const btnIap = document.getElementById('btnUnlockIap');
  if (btnIap) {
    if (state.allCategoriesUnlocked || state.allUnlocked || unlocked.length >= 5) {
      btnIap.innerText = '⭐ ¡TODO DESBLOQUEADO!';
      btnIap.classList.add('unlocked-all');
      btnIap.classList.remove('hidden');
      btnIap.style.pointerEvents = 'none';
      btnIap.style.opacity = '1';
    } else {
      btnIap.innerText = '⭐ DESBLOQUEAR TODO POR $0.99';
      btnIap.classList.remove('unlocked-all', 'hidden');
      btnIap.style.pointerEvents = 'auto';
      btnIap.style.opacity = '1';
    }
  }

  // Actualizar también en el modal de progreso
  Object.keys(categoriesConfig).forEach(cat => {
    const isUnlocked = unlocked.includes(cat);
    const progItem = document.getElementById(`prog${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
    if (progItem) {
      if (isUnlocked) {
        progItem.classList.add('unlocked');
        progItem.querySelector('.btn-unlock-cat')?.remove();
        if (!progItem.querySelector('.cat-status-badge')) {
          const badge = document.createElement('span');
          badge.className = 'cat-status-badge';
          badge.innerText = '¡Desbloqueado!';
          progItem.appendChild(badge);
        }
      }
    }
  });
}

// Animación de Recompensa: Humo Mágico, Partículas y Micro-rebote
function triggerMagicSmokeUnlockAnimation(force = false) {
  const imgEl = document.getElementById('wheelDiscImg') || document.querySelector('.wheel-disc-img');
  if (!force && imgEl && imgEl.src.includes('ruleta_todo.webp')) return;

  const btnIap = document.getElementById('btnUnlockIap');
  if (btnIap) {
    btnIap.style.pointerEvents = 'none';
    btnIap.style.opacity = '0.7';
  }

  // Reproducir sonido oficial de desbloqueo total en sincronía exacta con el primer estallido de humo (una sola vez)
  if (!state.wheelMagicUnlockSoundPlayed || force) {
    state.wheelMagicUnlockSoundPlayed = true;
    if (typeof SoundManager !== 'undefined') {
      SoundManager.playSFX('ruleta_todo.mp3', 0.75);
    }
  }

  playShimmerSound();

  const overlay = document.getElementById('magicSmokeOverlay');
  if (!overlay) return;

  overlay.innerHTML = '';
  overlay.classList.remove('fade-out');

  // Colores de partículas de humo y chispas
  const smokeColors = [
    'rgba(139, 77, 242, 0.8)',   // Morado
    'rgba(194, 125, 248, 0.85)',  // Violeta
    'rgba(84, 219, 230, 0.8)',   // Cian
    'rgba(232, 106, 101, 0.75)'   // Coral
  ];
  const sparkColors = ['#FFD700', '#FFFFFF', '#A5F3FC', '#FDE047'];

  // Crear 24 partículas de humo mágico
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'smoke-particle';
    const size = Math.floor(Math.random() * 40 + 35);
    const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 110 + 20;
    const dx = Math.cos(angle) * dist + 'px';
    const dy = Math.sin(angle) * dist + 'px';
    const scale = (Math.random() * 1.2 + 1.6).toFixed(2);
    const duration = (Math.random() * 0.25 + 0.75).toFixed(2) + 's';

    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.backgroundColor = color;
    p.style.setProperty('--dx', dx);
    p.style.setProperty('--dy', dy);
    p.style.setProperty('--target-scale', scale);
    p.style.setProperty('--duration', duration);

    overlay.appendChild(p);
  }

  // Crear 16 chispas doradas/blancas
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('div');
    s.className = 'spark-particle';
    const size = Math.floor(Math.random() * 6 + 4);
    const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 130 + 30;
    const dx = Math.cos(angle) * dist + 'px';
    const dy = Math.sin(angle) * dist + 'px';
    const duration = (Math.random() * 0.25 + 0.65).toFixed(2) + 's';

    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.backgroundColor = color;
    s.style.setProperty('--dx', dx);
    s.style.setProperty('--dy', dy);
    s.style.setProperty('--duration', duration);

    overlay.appendChild(s);
  }

  // Punto Máximo a los 400 ms: Cambiar imagen + Micro-rebote
  setTimeout(() => {
    state.allCategoriesUnlocked = true;
    state.allUnlocked = true;
    state.isVIP = true;

    // Cambiar asset a la ruleta completa
    const imgEl = document.getElementById('wheelDiscImg') || document.querySelector('.wheel-disc-img');
    if (imgEl) {
      imgEl.src = 'assets/pantalla_ruleta/ruleta_todo.webp';
    }

    // Micro-rebote de escala en la ruleta
    const wheelDisc = document.getElementById('wheelDisc');
    if (wheelDisc) {
      wheelDisc.style.setProperty('--current-rotation', `${state.wheel.currentRotation}deg`);
      wheelDisc.classList.remove('micro-bounce');
      void wheelDisc.offsetWidth; // Reflow forzar
      wheelDisc.classList.add('micro-bounce');
      setTimeout(() => wheelDisc.classList.remove('micro-bounce'), 460);
    }

    playSuccessSound();
  }, 400);

  // A los 800 ms: Desvanecimiento de humo + Mantener botón verde "¡TODO DESBLOQUEADO!"
  setTimeout(() => {
    overlay.classList.add('fade-out');

    if (btnIap) {
      btnIap.innerText = '⭐ ¡TODO DESBLOQUEADO!';
      btnIap.classList.add('unlocked-all');
      btnIap.classList.remove('hidden');
      btnIap.style.pointerEvents = 'none';
      btnIap.style.opacity = '1';
    }

    updateWheelCategoriesUI();

    setTimeout(() => {
      overlay.innerHTML = '';
      overlay.classList.remove('fade-out');
    }, 450);
  }, 800);
}

// Letrero flotante temporal (Toast de confirmación) sobre la ruleta (#wheelView)
function mostrarAvisoFlotanteRuleta(texto = "¡Todas tus compras se agregaron a la ruleta! 🚀") {
  const wheelView = document.getElementById('wheelView');
  if (!wheelView) return;

  const prevToast = wheelView.querySelector('.wheel-purchase-toast');
  if (prevToast) prevToast.remove();

  const toast = document.createElement('div');
  toast.className = 'wheel-purchase-toast';
  toast.innerText = texto;
  wheelView.appendChild(toast);

  // Permanece visible durante 3.5 segundos
  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    // Se desvanece suavemente en 300 ms y se remueve del DOM
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}
window.mostrarAvisoFlotanteRuleta = mostrarAvisoFlotanteRuleta;

// Actualizar contador de tiros y estado del botón GIRAR
function updateShotsUI() {
  const shotsEl = document.getElementById('shotsAvailable');
  const btnGirar = document.getElementById('btnGirarWheel');
  const labelEl = document.getElementById('btnGirarLabel');
  const reloadBox = document.getElementById('reloadTimerBox');

  if (shotsEl) shotsEl.innerText = state.wheel.shots;
  if (labelEl) labelEl.innerText = 'GIRAR'; // Siempre mantiene la palabra GIRAR

  if (state.wheel.shots <= 0) {
    if (btnGirar) {
      btnGirar.disabled = true;
      btnGirar.style.opacity = '0.5';
      btnGirar.style.pointerEvents = 'none';
    }
    if (reloadBox) reloadBox.classList.remove('hidden');
    startReloadTimer();
  } else {
    if (btnGirar && !state.wheel.isSpinning) {
      btnGirar.disabled = false;
      btnGirar.style.opacity = '1';
      btnGirar.style.pointerEvents = 'auto';
    }
    if (reloadBox) reloadBox.classList.add('hidden');
  }

  // Estado de Alerta en +1 TIRO EXTRA cuando queda exactamente 1 tiro (1/3)
  const btnWatchAd = document.getElementById('btnWatchAd');
  if (btnWatchAd) {
    if (state.wheel.shots === 1) {
      btnWatchAd.classList.add('pulse-attention');
    } else {
      btnWatchAd.classList.remove('pulse-attention');
    }
  }
}

// Temporizador de recarga de 24 horas
function startReloadTimer() {
  if (state.wheel.reloadInterval) return;

  const timerEl = document.getElementById('reloadTimerCountdown');

  state.wheel.reloadInterval = setInterval(() => {
    state.wheel.secondsUntilReload--;
    if (state.wheel.secondsUntilReload <= 0) {
      clearInterval(state.wheel.reloadInterval);
      state.wheel.reloadInterval = null;
      state.wheel.shots = state.wheel.maxShots;
      state.wheel.secondsUntilReload = 24 * 3600;
      updateShotsUI();
      return;
    }

    const h = Math.floor(state.wheel.secondsUntilReload / 3600);
    const m = Math.floor((state.wheel.secondsUntilReload % 3600) / 60);
    const s = state.wheel.secondsUntilReload % 60;

    if (timerEl) {
      timerEl.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }, 1000);
}

// Girar la ruleta (Detención en categorías desbloqueadas)
function spinWheel(forcedCatKey = null) {
  window.state.isChallengeMode = false;
  state.isChallengeMode = false;
  if (state.trivia) state.trivia.isDuel = false;
  if (state.wheel.isSpinning || state.wheel.shots <= 0) return;

  // Consumir 1 tiro
  state.wheel.shots--;
  state.wheel.isSpinning = true;
  updateShotsUI();

  // Elegir aleatoriamente únicamente entre las categorías DESBLOQUEADAS
  const unlocked = getUnlockedCategories();
  let chosenCatKey;
  if (forcedCatKey && unlocked.includes(forcedCatKey)) {
    chosenCatKey = forcedCatKey;
  } else {
    chosenCatKey = unlocked[Math.floor(Math.random() * unlocked.length)];
  }
  const catConfig = categoriesConfig[chosenCatKey] || categoriesConfig.cine;

  console.log(`🎡 Giro de Ruleta - Categorías elegibles (${unlocked.length}):`, unlocked, `-> Seleccionada: ${chosenCatKey}`);

  // Cálculo de rotación para ruleta_musica_todo.webp (el indicador superior está a 270°)
  // targetOffset = (270 - catConfig.centerAngle + 360) % 360
  const fullSpins = 5 * 360;
  const currentMod = (state.wheel.currentRotation % 360 + 360) % 360;
  const targetOffset = (270 - catConfig.centerAngle + 360) % 360;
  let angleDelta = (targetOffset - currentMod + 360) % 360;
  if (angleDelta === 0) angleDelta = 360;

  state.wheel.currentRotation += fullSpins + angleDelta;

  const wheelDisc = document.getElementById('wheelDisc');
  if (wheelDisc) {
    wheelDisc.style.transform = `rotate(${state.wheel.currentRotation}deg)`;
  }

  playSpinningSound();

  // Al terminar el giro (3.5s)
  setTimeout(() => {
    state.wheel.isSpinning = false;
    updateShotsUI();
    playWheelWinSound();
    if (typeof SoundManager !== 'undefined') {
      SoundManager.stopSpinSound();
      SoundManager.stopAllBGM();
    }

    // 1. Interceptar el fin del giro: detener música y lanzar cuenta regresiva
    iniciarCuentaRegresivaTrivia(chosenCatKey);
  }, 3500);
}

// Girar la ruleta en modo Duelo (#challengeMatchView)
function spinDuelWheel(forcedCatKey = null) {
  window.state.isChallengeMode = true;
  state.isChallengeMode = true;
  if (state.trivia) state.trivia.isDuel = true;
  if (state.duelWheel.isSpinning) return;
  state.duelWheel.isSpinning = true;

  const btnGirar = document.getElementById('btnGirarDuelWheel');
  if (btnGirar) {
    btnGirar.disabled = true;
    btnGirar.style.opacity = '0.6';
    btnGirar.style.pointerEvents = 'none';
  }

  // Elegir aleatoriamente únicamente entre las categorías DESBLOQUEADAS
  const unlocked = getUnlockedCategories();
  let chosenCatKey;
  if (forcedCatKey && unlocked.includes(forcedCatKey)) {
    chosenCatKey = forcedCatKey;
  } else {
    chosenCatKey = unlocked[Math.floor(Math.random() * unlocked.length)];
  }
  const catConfig = categoriesConfig[chosenCatKey] || categoriesConfig.cine;

  console.log(`⚔️ Giro de Ruleta Duelo - Categorías elegibles (${unlocked.length}):`, unlocked, `-> Seleccionada: ${chosenCatKey}`);

  const fullSpins = 5 * 360;
  const currentMod = (state.duelWheel.currentRotation % 360 + 360) % 360;
  const targetOffset = (270 - catConfig.centerAngle + 360) % 360;
  let angleDelta = (targetOffset - currentMod + 360) % 360;
  if (angleDelta === 0) angleDelta = 360;

  state.duelWheel.currentRotation += fullSpins + angleDelta;

  const duelDisc = document.getElementById('duelWheelDisc');
  if (duelDisc) {
    duelDisc.style.transform = `rotate(${state.duelWheel.currentRotation}deg)`;
  }

  playSpinningSound();

  setTimeout(() => {
    state.duelWheel.isSpinning = false;
    if (btnGirar) {
      btnGirar.disabled = false;
      btnGirar.style.opacity = '1';
      btnGirar.style.pointerEvents = 'auto';
    }
    playWheelWinSound();
    if (typeof SoundManager !== 'undefined') {
      SoundManager.stopSpinSound();
      SoundManager.stopAllBGM();
    }
    // 1. Interceptar el fin del giro: detener música y lanzar cuenta regresiva
    iniciarCuentaRegresivaTrivia(chosenCatKey);
  }, 3500);
}

// Transición con Conteo Arcade (3, 2, 1) y revelado de categoría
function triggerLandingCountdown(catKey, isDuelMode = false) {
  iniciarCuentaRegresivaTrivia(catKey);
}

// Simulación de Anuncio Recompensado (Rewarded Ad)
function watchRewardedAd() {
  if (state.noAds || localStorage.getItem('retroquiz_no_ads') === 'true') {
    state.wheel.shots += 1;
    updateShotsUI();
    playSuccessSound();
    showRetroToast('¡Tiro extra añadido! (Sin anuncios)', '⚡');

    const pill = document.getElementById('shotsPill');
    if (pill) {
      pill.style.transform = 'scale(1.2)';
      setTimeout(() => pill.style.transform = '', 200);
    }
    return;
  }

  openModal('modalAdLoader');
  const fill = document.getElementById('adProgressFill');
  if (fill) {
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.width = '100%';
    }, 50);
  }

  playModalOpenSound();

  setTimeout(() => {
    closeModal('modalAdLoader');
    state.wheel.shots += 1;
    updateShotsUI();
    playSuccessSound();

    const pill = document.getElementById('shotsPill');
    if (pill) {
      pill.style.transform = 'scale(1.2)';
      setTimeout(() => pill.style.transform = '', 200);
    }
  }, 2100);
}

// =============================================================================
// 5. CONTROL DE TRIVIA Y JUEGO DE PREGUNTAS (#triviaView & #gameOverView)
// =============================================================================

// Algoritmo Fisher-Yates Shuffle estricto para mezclar todo el banco de preguntas
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
window.shuffleArray = shuffleArray;

// Mapeo oficial de archivos por categoría
const categoryFiles = {
  cine: 'data/preguntas_cine.json',
  videojuegos: 'data/preguntas_videojuegos.json',
  tv: 'data/preguntas_tv.json',
  musica: 'data/preguntas_musica.json'
};

// 1. MAPEO ROBUSTO Y NORMALIZACIÓN DE CATEGORÍAS
// 1. MAPEO ESTRICTO DE RUTAS POR SECTOR GANADOR
function getJsonPath(catKey) {
  const cat = (catKey || '').toUpperCase().trim();
  if (cat === 'CINE') {
    return 'data/preguntas_cine.json';
  } else if (cat === 'VIDEOJUEGOS' || cat.includes('VIDEO')) {
    return 'data/preguntas_videojuegos.json';
  } else if (cat === 'TV' || cat.includes('SERIE')) {
    return 'data/preguntas_tv.json';
  } else if (cat === 'MÚSICA' || cat === 'MUSICA') {
    return 'data/preguntas_musica.json';
  } else if (cat === 'TODO' || cat === 'MIX') {
    return 'MIX';
  } else {
    return 'data/preguntas_cine.json';
  }
}
window.getJsonPath = getJsonPath;

// Carga asíncrona combinada en paralelo para la categoría TODO / MIX (compatibilidad)
async function loadTodoMixQuestions() {
  const timestamp = Date.now();
  const [cine, juegos, tv, musica] = await Promise.all([
    fetch('data/preguntas_cine.json?t=' + timestamp, { cache: 'no-store' }).then(r => r.json()),
    fetch('data/preguntas_videojuegos.json?t=' + timestamp, { cache: 'no-store' }).then(r => r.json()),
    fetch('data/preguntas_tv.json?t=' + timestamp, { cache: 'no-store' }).then(r => r.json()),
    fetch('data/preguntas_musica.json?t=' + timestamp, { cache: 'no-store' }).then(r => r.json())
  ]);
  return shuffleArray([...cine, ...juegos, ...tv, ...musica]);
}
window.loadTodoMixQuestions = loadTodoMixQuestions;

// Carga asíncrona de preguntas según categoría (compatibilidad)
async function loadQuestionsForCategory(catKey = 'cine') {
  return cargarBancoExclusivo(catKey);
}
window.loadQuestionsForCategory = loadQuestionsForCategory;

async function loadCineQuestions() {
  return loadQuestionsForCategory('cine');
}

// Bancos de emergencia retro segregados 100% por categoría exclusiva
const emergencyCine = [
  {
    id: "cine_emg_01",
    categoria: "CINE",
    pregunta: "¿Quién interpretó a Alan Grant en 'Jurassic Park' (1993)?",
    emojis: "🦖 🚙 🌴",
    opciones: ["Sam Neill", "Jeff Goldblum", "Laura Dern", "Richard Attenborough"],
    respuesta_correcta: "Sam Neill"
  },
  {
    id: "cine_emg_02",
    categoria: "CINE",
    pregunta: "¿Qué modelo de auto modificó el 'Doc' Brown para viajar en el tiempo?",
    emojis: "⚡ 🚗 ⏰",
    opciones: ["DeLorean DMC-12", "Pontiac Firebird", "Ford Mustang", "Chevrolet Corvette"],
    respuesta_correcta: "DeLorean DMC-12"
  },
  {
    id: "cine_emg_03",
    categoria: "CINE",
    pregunta: "¿Quién interpretó a Neo en la película 'The Matrix' (1999)?",
    emojis: "🕶️ 💊 💻",
    opciones: ["Keanu Reeves", "Tom Cruise", "Brad Pitt", "Will Smith"],
    respuesta_correcta: "Keanu Reeves"
  },
  {
    id: "cine_emg_04",
    categoria: "CINE",
    pregunta: "¿Qué villano en Star Wars le dice a Luke 'Yo soy tu padre'?",
    emojis: "🌌 ⚔️ 🦹",
    opciones: ["Darth Vader", "Emperador Palpatine", "Boba Fett", "Kylo Ren"],
    respuesta_correcta: "Darth Vader"
  },
  {
    id: "cine_emg_05",
    categoria: "CINE",
    pregunta: "¿Qué director estuvo a cargo de la película 'E.T., el extraterrestre' (1982)?",
    emojis: "🚲 🌕 👽",
    opciones: ["Steven Spielberg", "George Lucas", "James Cameron", "Stanley Kubrick"],
    respuesta_correcta: "Steven Spielberg"
  },
  {
    id: "cine_emg_06",
    categoria: "CINE",
    pregunta: "¿Qué actor protagonizó 'Terminator' (1984) como el ciborg T-800?",
    emojis: "🤖 🕶️ 🏍️",
    opciones: ["Arnold Schwarzenegger", "Sylvester Stallone", "Jean-Claude Van Damme", "Bruce Willis"],
    respuesta_correcta: "Arnold Schwarzenegger"
  },
  {
    id: "cine_emg_07",
    categoria: "CINE",
    pregunta: "¿En qué película de 1994 Tom Hanks corre por todo EE.UU.?",
    emojis: "🏃 🍫 🦐",
    opciones: ["Forrest Gump", "Náufrago", "Apolo 13", "La Milla Verde"],
    respuesta_correcta: "Forrest Gump"
  },
  {
    id: "cine_emg_08",
    categoria: "CINE",
    pregunta: "¿Cuál es el nombre del arqueólogo y aventurero interpretado por Harrison Ford?",
    emojis: "🤠 🐍 🏺",
    opciones: ["Indiana Jones", "Han Solo", "Rick Deckard", "Jack Ryan"],
    respuesta_correcta: "Indiana Jones"
  },
  {
    id: "cine_emg_09",
    categoria: "CINE",
    pregunta: "¿Quién dirigió la película de terror y ciencia ficción 'Alien' (1979)?",
    emojis: "🚀 🥚 👽",
    opciones: ["Ridley Scott", "James Cameron", "David Fincher", "John Carpenter"],
    respuesta_correcta: "Ridley Scott"
  },
  {
    id: "cine_emg_10",
    categoria: "CINE",
    pregunta: "¿Qué película de Disney de 1994 cuenta la historia del cachorro león Simba?",
    emojis: "🦁 👑 🌅",
    opciones: ["El Rey León", "Aladdín", "Hércules", "Tarzán"],
    respuesta_correcta: "El Rey León"
  }
];

const emergencyVideojuegos = [
  {
    id: "game_emg_01",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Cómo se llamaba originalmente Mario en su debut en el arcade 'Donkey Kong' (1981)?",
    emojis: "🔨 🦍 🕹️",
    opciones: ["Jumpman", "Mr. Video", "Plumber Boy", "Red Man"],
    respuesta_correcta: "Jumpman"
  },
  {
    id: "game_emg_02",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Qué fontanero de Nintendo rescata a la Princesa Peach en el Reino Champiñón?",
    emojis: "🍄 👨🏻 🏰",
    opciones: ["Mario", "Luigi", "Wario", "Bowser"],
    respuesta_correcta: "Mario"
  },
  {
    id: "game_emg_03",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Cómo se llama el erizo azul supersónico de Sega?",
    emojis: "🦔 💍 ⚡",
    opciones: ["Sonic", "Knuckles", "Tails", "Shadow"],
    respuesta_correcta: "Sonic"
  },
  {
    id: "game_emg_04",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Qué consola de 16 bits de Nintendo compitió con la Sega Genesis / Mega Drive?",
    emojis: "🎮 👾 🕹️",
    opciones: ["Super Nintendo (SNES)", "Nintendo 64", "NES", "Game Boy"],
    respuesta_correcta: "Super Nintendo (SNES)"
  },
  {
    id: "game_emg_05",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Quién es el protagonista principal de la saga 'The Legend of Zelda'?",
    emojis: "🗡️ 🛡️ 🧝",
    opciones: ["Link", "Zelda", "Ganon", "Sheik"],
    respuesta_correcta: "Link"
  },
  {
    id: "game_emg_06",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Qué juego de lucha arcade de 1991 popularizó a Ryu, Ken y Chun-Li?",
    emojis: "🥋 🥊 🔥",
    opciones: ["Street Fighter II", "Mortal Kombat", "Tekken", "Fatal Fury"],
    respuesta_correcta: "Street Fighter II"
  },
  {
    id: "game_emg_07",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Qué consola de Sony se lanzó a fines de 1994 usando discos CD-ROM?",
    emojis: "💿 🎮 🕹️",
    opciones: ["PlayStation", "PlayStation 2", "PlayStation 3", "PSP"],
    respuesta_correcta: "PlayStation"
  },
  {
    id: "game_emg_08",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Qué marsupial naranja era la mascota plataformera de PlayStation?",
    emojis: "🦊 🍎 💥",
    opciones: ["Crash Bandicoot", "Spyro", "Rayman", "Jak"],
    respuesta_correcta: "Crash Bandicoot"
  },
  {
    id: "game_emg_09",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Qué juego de puzles soviético de 1984 consiste en encajar tetrominós?",
    emojis: "🧱 🧩 🟦",
    opciones: ["Tetris", "Puyo Puyo", "Pac-Attack", "Columns"],
    respuesta_correcta: "Tetris"
  },
  {
    id: "game_emg_10",
    categoria: "VIDEOJUEGOS",
    pregunta: "¿Qué personaje amarillo con boca come puntos y fantasmas en laberintos?",
    emojis: "🟡 👻 🍒",
    opciones: ["Pac-Man", "Q*bert", "Dig Dug", "Frogger"],
    respuesta_correcta: "Pac-Man"
  }
];

const emergencyTV = [
  {
    id: "tv_emg_01",
    categoria: "TV",
    pregunta: "¿Cómo se llama la cafetería neoyorquina donde se reunía el grupo en 'Friends'?",
    emojis: "☕ 🛋️ 📺",
    opciones: ["Central Perk", "Monk's Diner", "MacLaren's", "The Peach Pit"],
    respuesta_correcta: "Central Perk"
  },
  {
    id: "tv_emg_02",
    categoria: "TV",
    pregunta: "¿Cómo se llama la ciudad ficticia donde viven Los Simpson?",
    emojis: "🍩 📺 👨‍👩‍👧‍👦",
    opciones: ["Springfield", "Quahog", "South Park", "Shelbyville"],
    respuesta_correcta: "Springfield"
  },
  {
    id: "tv_emg_03",
    categoria: "TV",
    pregunta: "¿Qué número de barril utilizaba El Chavo del 8 como su escondite habitual?",
    emojis: "📦 🧢 🍭",
    opciones: ["El barril sin número (vive en el 8)", "El 8", "El 7", "El 14"],
    respuesta_correcta: "El barril sin número (vive en el 8)"
  },
  {
    id: "tv_emg_04",
    categoria: "TV",
    pregunta: "¿Quién era el inteligente perro parlante mascota de la familia en 'Los Supersónicos'?",
    emojis: "🐕 🚀 🤖",
    opciones: ["Astro", "Dino", "Cometa", "Snoopy"],
    respuesta_correcta: "Astro"
  },
  {
    id: "tv_emg_05",
    categoria: "TV",
    pregunta: "¿Cuál era la frase icónica del Agente Mulder en 'The X-Files'?",
    emojis: "🛸 👽 📂",
    opciones: ["The Truth Is Out There", "Trust No One", "I Want to Believe", "Watch the Skies"],
    respuesta_correcta: "I Want to Believe"
  },
  {
    id: "tv_emg_06",
    categoria: "TV",
    pregunta: "¿Cómo se llamaba el auto inteligente con luz roja frontal en 'El Auto Fantástico'?",
    emojis: "🚗 🔴 📟",
    opciones: ["KITT", "KARR", "HERBIE", "VIPER"],
    respuesta_correcta: "KITT"
  },
  {
    id: "tv_emg_07",
    categoria: "TV",
    pregunta: "¿Qué extraterrestre peludo de Melmac adoraba comer gatos?",
    emojis: "👽 🐱 📺",
    opciones: ["ALF", "E.T.", "Mork", "Roger"],
    respuesta_correcta: "ALF"
  },
  {
    id: "tv_emg_08",
    categoria: "TV",
    pregunta: "¿Quién era el líder del grupo en 'El Príncipe del Rap en Bel-Air'?",
    emojis: "🧢 🏀 🏰",
    opciones: ["Will Smith", "Carlton Banks", "Tío Phil", "Jazz"],
    respuesta_correcta: "Will Smith"
  },
  {
    id: "tv_emg_09",
    categoria: "TV",
    pregunta: "¿Cómo se llamaba el jefe gruñón de Pedro Picapiedra en la cantera?",
    emojis: "🦖 ⛏️ 👔",
    opciones: ["Señor Rajuela", "Pablo Mármol", "Bamm-Bamm", "Dino"],
    respuesta_correcta: "Señor Rajuela"
  },
  {
    id: "tv_emg_10",
    categoria: "TV",
    pregunta: "¿Qué serie de los 90 seguía a un grupo de socorristas en las playas de Malibú?",
    emojis: "🏖️ 🏊‍♂️ 🛟",
    opciones: ["Baywatch (Guardianes de la Bahía)", "Miami Vice", "Beverly Hills 90210", "Melrose Place"],
    respuesta_correcta: "Baywatch (Guardianes de la Bahía)"
  }
];

const emergencyMusica = [
  {
    id: "mus_emg_01",
    categoria: "MÚSICA",
    pregunta: "¿Qué artista lanzó el álbum 'Thriller' en 1982, el disco más vendido de la historia?",
    emojis: "🧟 🕺 🎤",
    opciones: ["Michael Jackson", "Prince", "David Bowie", "Freddie Mercury"],
    respuesta_correcta: "Michael Jackson"
  },
  {
    id: "mus_emg_02",
    categoria: "MÚSICA",
    pregunta: "¿Qué legendaria banda de rock británica lideró Freddie Mercury hasta 1991?",
    emojis: "👑 🎸 🎹",
    opciones: ["Queen", "The Beatles", "Pink Floyd", "Led Zeppelin"],
    respuesta_correcta: "Queen"
  },
  {
    id: "mus_emg_03",
    categoria: "MÚSICA",
    pregunta: "¿Quién es considerada mundialmente como la 'Reina del Pop'?",
    emojis: "👑 💃 🎤",
    opciones: ["Madonna", "Cyndi Lauper", "Whitney Houston", "Tina Turner"],
    respuesta_correcta: "Madonna"
  },
  {
    id: "mus_emg_04",
    categoria: "MÚSICA",
    pregunta: "¿Qué banda de Seattle liderada por Kurt Cobain lanzó el histórico álbum 'Nevermind'?",
    emojis: "🎸 🌊 👶",
    opciones: ["Nirvana", "Pearl Jam", "Soundgarden", "Alice in Chains"],
    respuesta_correcta: "Nirvana"
  },
  {
    id: "mus_emg_05",
    categoria: "MÚSICA",
    pregunta: "¿Qué dúo francés de música electrónica revolucionó el house con cascos futuristas?",
    emojis: "🤖 🎧 🪩",
    opciones: ["Daft Punk", "Justice", "Air", "Cassius"],
    respuesta_correcta: "Daft Punk"
  },
  {
    id: "mus_emg_06",
    categoria: "MÚSICA",
    pregunta: "¿Qué banda de rock compuso 'Sweet Child O' Mine' y 'Welcome to the Jungle'?",
    emojis: "🌹 🔫 🎸",
    opciones: ["Guns N' Roses", "Aerosmith", "Bon Jovi", "Mötley Crüe"],
    respuesta_correcta: "Guns N' Roses"
  },
  {
    id: "mus_emg_07",
    categoria: "MÚSICA",
    pregunta: "¿Quién cantaba el clásico de pop 'Girls Just Want to Have Fun' en los años 80?",
    emojis: "🎀 💃 🎵",
    opciones: ["Cyndi Lauper", "Madonna", "Paula Abdul", "Debbie Gibson"],
    respuesta_correcta: "Cyndi Lauper"
  },
  {
    id: "mus_emg_08",
    categoria: "MÚSICA",
    pregunta: "¿Qué grupo pop británico de chicas de los 90 popularizó el 'Girl Power'?",
    emojis: "🇬🇧 👠 🎤",
    opciones: ["Spice Girls", "All Saints", "Atomic Kitten", "Bananarama"],
    respuesta_correcta: "Spice Girls"
  },
  {
    id: "mus_emg_09",
    categoria: "MÚSICA",
    pregunta: "¿Qué cantante y guitarrista de rock interpretaba vestido de colegial con pantalones cortos?",
    emojis: "⚡ 🎸 🎒",
    opciones: ["Angus Young (AC/DC)", "Slash", "Eddie Van Halen", "Brian May"],
    respuesta_correcta: "Angus Young (AC/DC)"
  },
  {
    id: "mus_emg_10",
    categoria: "MÚSICA",
    pregunta: "¿Qué clásico tema disco de 1978 de Gloria Gaynor se convirtió en un himno de resiliencia?",
    emojis: "🪩 🎤 ✨",
    opciones: ["I Will Survive", "Stayin' Alive", "Le Freak", "Disco Inferno"],
    respuesta_correcta: "I Will Survive"
  }
];

function getEmergencyQuestionsForCategory(cat, esModoTodo) {
  if (esModoTodo) {
    return [...emergencyCine, ...emergencyVideojuegos, ...emergencyTV, ...emergencyMusica];
  }
  const c = (cat || '').toUpperCase().trim();
  if (c === 'CINE') return emergencyCine;
  if (c === 'VIDEOJUEGOS' || c.includes('VIDEO') || c.includes('JUEGO')) return emergencyVideojuegos;
  if (c === 'TV' || c.includes('SERIE')) return emergencyTV;
  if (c === 'MÚSICA' || c === 'MUSICA' || c.includes('MUS')) return emergencyMusica;
  return emergencyCine;
}

// Obtener metadatos visuales de la categoría (icono, nombre, color)
function getCategoryMeta(cat) {
  const c = (cat || '').toUpperCase().trim();
  if (c === 'CINE' || c.includes('CINE')) return categoriesConfig.cine || { name: 'CINE', icon: '🎬', color: '#7b38e5' };
  if (c === 'VIDEOJUEGOS' || c.includes('VIDEO') || c.includes('JUEGO')) return categoriesConfig.videojuegos || { name: 'VIDEOJUEGOS', icon: '🎮', color: '#e2dd5f' };
  if (c === 'TV' || c.includes('SERIE')) return categoriesConfig.tv || { name: 'TV', icon: '📺', color: '#5fe2df' };
  if (c === 'MÚSICA' || c === 'MUSICA' || c.includes('MUS') || c.includes('MÚS')) return categoriesConfig.musica || { name: 'MÚSICA', icon: '🎸', color: '#00FF66' };
  return categoriesConfig.todo || { name: 'TODO / MIX', icon: '❓', color: '#FF5A5F' };
}
window.getCategoryMeta = getCategoryMeta;

// =============================================================================
// CARGA Y SELECCIÓN EXCLUYENTE DE PREGUNTAS POR CATEGORÍA
// =============================================================================
async function cargarBancoExclusivo(categoriaGanadora) {
  // 1. MAPEO ESTRICTO DE RUTAS POR SECTOR GANADOR:
  const cat = (categoriaGanadora || '').toUpperCase().trim();
  let rutaArchivo = null;
  let esModoTodo = false;

  if (cat === 'CINE') {
    rutaArchivo = 'data/preguntas_cine.json';
  } else if (cat === 'VIDEOJUEGOS' || cat.includes('VIDEO')) {
    rutaArchivo = 'data/preguntas_videojuegos.json';
  } else if (cat === 'TV' || cat.includes('SERIE')) {
    rutaArchivo = 'data/preguntas_tv.json';
  } else if (cat === 'MÚSICA' || cat === 'MUSICA' || cat.includes('MUS') || cat.includes('MÚS')) {
    rutaArchivo = 'data/preguntas_musica.json';
  } else if (cat === 'TODO' || cat === 'MIX') {
    esModoTodo = true;
  } else {
    // Fallback predeterminado a Cine si la categoría no coincide
    rutaArchivo = 'data/preguntas_cine.json';
  }

  // 2. CARGA ASÍNCRONA EXCLUYENTE:
  let bancoCompleto = [];
  try {
    if (!esModoTodo) {
      const res = await fetch(`${rutaArchivo}?t=${Date.now()}`, { cache: 'no-store' });
      bancoCompleto = await res.json();
      console.log(`Cargando ÚNICAMENTE la categoría ${cat} con ${bancoCompleto.length} preguntas.`);
    } else {
      const [cine, juegos, tv, musica] = await Promise.all([
        fetch(`data/preguntas_cine.json?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`data/preguntas_videojuegos.json?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`data/preguntas_tv.json?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`data/preguntas_musica.json?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json())
      ]);
      bancoCompleto = [...cine, ...juegos, ...tv, ...musica];
      console.log(`Cargando MODO TODO / MIX con ${bancoCompleto.length} preguntas combinadas.`);
    }
  } catch (err) {
    console.warn(`Error en fetch para categoría ${cat}, cargando fallback exclusivo:`, err);
    bancoCompleto = getEmergencyQuestionsForCategory(cat, esModoTodo);
  }

  // Filtrado defensivo: asegurar 100% que ninguna pregunta ajena se cuele
  if (!esModoTodo) {
    bancoCompleto = bancoCompleto.filter(q => {
      if (!q) return false;
      const catQ = (q.categoria || '').toUpperCase().trim();
      if (cat === 'CINE') return catQ.includes('CINE');
      if (cat === 'VIDEOJUEGOS' || cat.includes('VIDEO')) return catQ.includes('VIDEO') || catQ.includes('JUEGO');
      if (cat === 'TV' || cat.includes('SERIE')) return catQ.includes('TV') || catQ.includes('SERIE');
      if (cat === 'MÚSICA' || cat === 'MUSICA') return catQ.includes('MUS') || catQ.includes('MÚS');
      return true;
    });
  }

  // 3. BARAJADO FISHER-YATES SOBRE EL BANCO EXCLUSIVO:
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const bancoMezclado = shuffle(bancoCompleto);

  // Extrae la tanda exacta de la partida:
  const totalRequerido = window.state.isChallengeMode ? 5 : 10;
  const preguntasFinales = bancoMezclado.slice(0, totalRequerido);

  // 4. VERIFICACIÓN Y RENDERIZADO:
  // Valida que todas las preguntas en window.state.currentRoundQuestions pertenezcan a la categoría seleccionada (salvo en modo TODO).
  if (!esModoTodo) {
    const sonTodasValidas = preguntasFinales.every(q => {
      const catQ = (q.categoria || '').toUpperCase().trim();
      if (cat === 'CINE') return catQ.includes('CINE');
      if (cat === 'VIDEOJUEGOS' || cat.includes('VIDEO')) return catQ.includes('VIDEO') || catQ.includes('JUEGO');
      if (cat === 'TV' || cat.includes('SERIE')) return catQ.includes('TV') || catQ.includes('SERIE');
      if (cat === 'MÚSICA' || cat === 'MUSICA') return catQ.includes('MUS') || catQ.includes('MÚS');
      return false;
    });
    if (sonTodasValidas) {
      console.log(`✅ Verificación exitosa: 100% de las ${preguntasFinales.length} preguntas pertenecen a ${cat}.`);
    } else {
      console.error(`❌ Alerta de categoría cruzada: se detectaron preguntas no pertenecientes a ${cat}.`);
    }
  }

  return preguntasFinales;
}
window.cargarBancoExclusivo = cargarBancoExclusivo;

let preloadedRoundQuestionsPromise = null;

function precargarPreguntasTrivia(categoriaSeleccionada) {
  return cargarBancoExclusivo(categoriaSeleccionada);
}

// 2. OVERLAY DEL CONTEO REGRESIVO (3 -> 2 -> 1 -> ¡YA!)
let countdownInterval = null;

function iniciarCuentaRegresivaTrivia(categoriaGanadora) {
  // 1. Iniciar la precarga en segundo plano de las preguntas (Promise.all / fetch)
  preloadedRoundQuestionsPromise = precargarPreguntasTrivia(categoriaGanadora);

  // Detener en seco la música de la ruleta y cualquier BGM
  if (typeof SoundManager !== 'undefined') {
    SoundManager.stopSpinSound();
    SoundManager.stopAllBGM();
  }

  // Muestra el overlay retro centrado sobre la ruleta con números gigantes
  const overlay = document.getElementById('wheelLandingOverlay');
  const badge = document.getElementById('landingCatBadge');
  const iconEl = document.getElementById('landingCatIcon');
  const nameEl = document.getElementById('landingCatName');
  const numEl = document.getElementById('landingCountNumber');

  const catMeta = getCategoryMeta(categoriaGanadora);
  if (iconEl) iconEl.innerText = catMeta.icon || '🎬';
  if (nameEl) nameEl.innerText = catMeta.name || 'TRIVIA';
  if (badge) badge.style.backgroundColor = catMeta.color || '#7C3AED';

  if (overlay) overlay.classList.add('show');

  const setNumberWithPop = (val, beepFreq) => {
    if (!numEl) return;
    numEl.innerText = val;
    numEl.classList.remove('pop');
    void numEl.offsetWidth; // Forzar reflow para reiniciar la animación pop / scale-in
    numEl.classList.add('pop');
    if (beepFreq && typeof playCountdownBeep === 'function') {
      playCountdownBeep(beepFreq);
    }
  };

  // Segundo 1: Muestra "3" (con animación pop / scale-in)
  let count = 3;
  setNumberWithPop('3', 600);

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    count--;
    if (count === 2) {
      // Segundo 2: Muestra "2" (pop / scale-in)
      setNumberWithPop('2', 800);
    } else if (count === 1) {
      // Segundo 3: Muestra "1" (pop / scale-in)
      setNumberWithPop('1', 1000);
    } else if (count === 0) {
      // 500 ms siguientes muestra "¡YA!" (o "¡A JUGAR!")
      setNumberWithPop('¡YA!', 1200);
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;

      // 3. TRANSICIÓN LIMPIA A LA TRIVIA
      finalizarConteoYEntrarATrivia(categoriaGanadora);
    }
  }, 950);
}
window.iniciarCuentaRegresivaTrivia = iniciarCuentaRegresivaTrivia;

// 3. TRANSICIÓN LIMPIA A LA TRIVIA TRAS CONCLUIR EL CONTEO
async function finalizarConteoYEntrarATrivia(categoriaGanadora) {
  // Ocultar el overlay del conteo
  const overlay = document.getElementById('wheelLandingOverlay');
  if (overlay) overlay.classList.remove('show');

  // Apaga la ruleta activa (#wheelView o #challengeMatchView con display: none)
  const wheelView = document.getElementById('wheelView');
  if (wheelView) {
    wheelView.classList.remove('active', 'active-view');
    wheelView.style.display = 'none';
  }
  const challengeMatchView = document.getElementById('challengeMatchView');
  if (challengeMatchView) {
    challengeMatchView.classList.remove('active', 'active-view');
    challengeMatchView.style.display = 'none';
  }

  // Esperar a que la precarga de preguntas haya resuelto
  let questions = [];
  if (preloadedRoundQuestionsPromise) {
    try {
      questions = await preloadedRoundQuestionsPromise;
    } catch (e) {
      console.warn('Error resolviendo preguntas precargadas:', e);
    }
  }

  // Si por alguna razón vino vacío, recargar de manera 100% exclusiva
  if (!questions || questions.length === 0) {
    questions = await cargarBancoExclusivo(categoriaGanadora);
  }

  // Asignar al estado global
  const isChallenge = Boolean(window.state && window.state.isChallengeMode);
  const isTieBreaker = Boolean(window.state && window.state.isTieBreaker);
  if (window.state) {
    window.state.isChallengeMode = isChallenge;
    window.state.isTieBreaker = isTieBreaker;
    window.state.currentRoundQuestions = questions;
    window.state.currentQuestionIndex = 0;
    window.state.lives = 3;
    window.state.correctAnswersCount = 0;
    window.state.currentRoundXP = 0;
    window.state.accumulatedAnswerTimeMs = 0;
  }
  state.currentRoundXP = 0;
  state.isChallengeMode = isChallenge;
  state.isTieBreaker = isTieBreaker;
  if (state.trivia) {
    state.trivia.isDuel = isChallenge;
    state.trivia.questions = questions;
    state.trivia.totalQuestions = isTieBreaker ? 3 : (isChallenge ? 5 : 10);
    state.trivia.timerSeconds = (isChallenge || isTieBreaker) ? 10 : 15;
    state.trivia.remainingMs = (isChallenge || isTieBreaker ? 10 : 15) * 1000;
    state.trivia.duelStartTime = performance.now();
    state.trivia.questionStartTime = performance.now();
    state.trivia.lives = 3;
    state.trivia.sessionCoins = 0;
    state.trivia.sessionXP = 0;
    state.trivia.currentStreak = 0;
    state.trivia.correctAnswersCount = 0;
    state.trivia.currentQuestionIndex = 0;
    state.trivia.isAnswering = false;
  }
  state.correctAnswersCount = 0;

  // Tema y estilos según categoría
  const normCat = (categoriaGanadora || '').toUpperCase();
  let themeColor = '#7B38E5'; // Cine
  let catClass = 'cine';
  if (normCat.includes('VIDEO') || normCat.includes('JUEGO')) {
    themeColor = '#B5DC35';
    catClass = 'videojuegos';
  } else if (normCat.includes('TV') || normCat.includes('SERIE')) {
    themeColor = '#00E5FF';
    catClass = 'tv';
  } else if (normCat.includes('MUS') || normCat.includes('MÚS')) {
    themeColor = '#00FF66';
    catClass = 'musica';
  } else if (normCat.includes('TODO') || normCat.includes('MIX')) {
    themeColor = '#FF5A5F';
    catClass = 'todo';
  }
  if (state.trivia) state.trivia.category = catClass;

  const triviaView = document.getElementById('triviaView');
  if (triviaView) {
    triviaView.style.setProperty('--trivia-theme-color', themeColor);
    triviaView.dataset.cat = catClass;
    triviaView.classList.remove('siren-panic', 'cat-cine', 'cat-videojuegos', 'cat-musica', 'cat-tv', 'cat-todo', 'cat-mix');
    triviaView.classList.add('cat-' + catClass);
  }

  const abandonModal = document.getElementById('abandonModal');
  if (abandonModal) abandonModal.style.display = 'none';

  updateTriviaHeartsUI();
  updateRoundCoinsUI(0);

  // Enciende la pantalla de preguntas: showView('#triviaView')
  state.activeTab = 'trivia';
  showView('#triviaView');
  if (window.location.hash !== '#trivia') {
    try {
      history.replaceState(null, '', '#trivia');
    } catch (e) {
      window.location.hash = '#trivia';
    }
  }

  // Renderiza la primera pregunta ya precargada (renderizarPreguntaActual())
  renderizarPreguntaActual();

  // Arranca el temporizador de 15 segundos
  if (typeof iniciarTemporizador === 'function') {
    iniciarTemporizador();
  } else if (typeof startTriviaTimer === 'function') {
    startTriviaTimer();
  }

  // Inicia en bucle la música de trivia (SoundManager.playBGM('trivia'))
  if (typeof SoundManager !== 'undefined') {
    SoundManager.playBGM('trivia');
  }
}
window.finalizarConteoYEntrarATrivia = finalizarConteoYEntrarATrivia;

// Alias y compatibilidad global
function arrancarPartidaTrivia(categoriaSeleccionada) {
  iniciarCuentaRegresivaTrivia(categoriaSeleccionada);
}

function iniciarTemporizador() {
  if (typeof startTriviaTimer === 'function') {
    startTriviaTimer();
  }
}
window.iniciarTemporizador = iniciarTemporizador;
window.arrancarPartidaTrivia = arrancarPartidaTrivia;
window.iniciarPartida = arrancarPartidaTrivia;
window.startTriviaSession = arrancarPartidaTrivia;

function updateRoundCoinsUI(val = null) {
  const amount = val !== null ? val : (state.trivia.sessionCoins || 0);
  const counterVal = document.getElementById('roundCoinCounterVal');
  if (counterVal) {
    counterVal.innerText = amount;
  }
}

function triggerFlyingCoinsAnimation(sourceBtn, targetCounter, newCoinValue) {
  if (!sourceBtn || !targetCounter) {
    updateRoundCoinsUI(newCoinValue);
    return;
  }

  const startRect = sourceBtn.getBoundingClientRect();
  const targetRect = targetCounter.getBoundingClientRect();

  // Coordenadas iniciales (centro del botón) y destino (pastilla/icono #roundCoinCounter)
  const startX = startRect.left + startRect.width / 2 - 12;
  const startY = startRect.top + startRect.height / 2 - 12;
  const targetX = targetRect.left + 16 - 12;
  const targetY = targetRect.top + targetRect.height / 2 - 12;

  const particleCount = 4; // Entre 3 y 5 partículas
  let completedParticles = 0;

  for (let i = 0; i < particleCount; i++) {
    const coin = document.createElement('img');
    coin.src = 'assets/global/retrocoin.webp';
    coin.alt = 'RetroCoin';
    coin.className = 'flying-retrocoin-particle';
    coin.style.left = '0px';
    coin.style.top = '0px';
    coin.style.transform = `translate(${startX}px, ${startY}px) scale(0)`;
    coin.style.opacity = '0';
    document.body.appendChild(coin);

    // Dispersión en arco y variación orgánica
    const arcSpreadX = (Math.random() - 0.5) * 60;
    const arcHeight = 45 + Math.random() * 30;
    const midX = (startX + targetX) / 2 + arcSpreadX;
    const midY = Math.min(startY, targetY) - arcHeight;

    const duration = 650; // Trayectoria de 600 ms a 750 ms
    const staggerDelay = i * 65; // Retraso escalonado entre partículas

    const keyframes = [
      {
        transform: `translate(${startX}px, ${startY}px) scale(0.6) rotate(0deg)`,
        opacity: 0,
        offset: 0
      },
      {
        transform: `translate(${startX + (Math.random() * 20 - 10)}px, ${startY - 15}px) scale(1.2) rotate(45deg)`,
        opacity: 1,
        offset: 0.15
      },
      {
        transform: `translate(${midX}px, ${midY}px) scale(1.05) rotate(180deg)`,
        opacity: 1,
        offset: 0.55
      },
      {
        transform: `translate(${targetX}px, ${targetY}px) scale(0.85) rotate(360deg)`,
        opacity: 0.95,
        offset: 1
      }
    ];

    const anim = coin.animate(keyframes, {
      duration: duration,
      delay: staggerDelay,
      easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
      fill: 'forwards'
    });

    anim.onfinish = () => {
      coin.remove();
      completedParticles++;

      // Al llegar las partículas a su destino:
      // 1. Efecto rebote/pulso (scale(1.25) -> scale(1.0)) sobre #roundCoinCounter
      targetCounter.classList.remove('coin-counter-bump');
      void targetCounter.offsetWidth; // Forzar reflow para reiniciar animación
      targetCounter.classList.add('coin-counter-bump');

      // 2. Sonido retro de moneda
      playCoinSound();

      // 3. Incrementar el contador numérico de las RetroCoins
      updateRoundCoinsUI(newCoinValue);
    };
  }
}

// Animación de pérdida de RetroCoins estilo caída de frutas en Crash Bandicoot 2
function triggerCrashCoinDrop(counterEl) {
  if (!counterEl) return;
  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('retrocoin.wav');
  }

  const rect = counterEl.getBoundingClientRect();
  const startX = rect.left + rect.width / 2 - 12;
  const startY = rect.top + rect.height / 2 - 12;

  // Generar dinámicamente entre 6 y 10 partículas de monedas
  const coinCount = Math.floor(Math.random() * 5) + 6; // 6 a 10 partículas

  for (let i = 0; i < coinCount; i++) {
    const coin = document.createElement('img');
    coin.src = 'assets/global/retrocoin.webp';
    coin.alt = 'RetroCoin';
    coin.className = 'crash-falling-coin-particle';
    coin.style.left = '0px';
    coin.style.top = '0px';
    coin.style.transform = `translate(${startX}px, ${startY}px)`;
    document.body.appendChild(coin);

    // Física de dispersión y caída libre:
    // 1. Impulso inicial hacia arriba y costados:
    // Velocidad en eje X entre -80px y +120px
    const impulseX = -80 + Math.random() * 200;
    // Eje Y hacia arriba de -60px a -120px
    const impulseY = -60 - Math.random() * 60;

    // 2. Caída gravitatoria acelerada hacia el fondo de la pantalla (translateY(110vh))
    const finalX = startX + impulseX * 1.5 + (Math.random() * 60 - 30);
    const finalY = window.innerHeight + 120; // Sobrepasa holgadamente el borde inferior

    // Rotación continua entre 360deg y 720deg
    const spinDir = impulseX >= 0 ? 1 : -1;
    const spinDegrees = (360 + Math.random() * 360) * spinDir;

    // Duración de 800 ms a 1100 ms
    const duration = 800 + Math.random() * 300;

    // Retraso escalonado (stagger) aleatorio de 30 ms a 60 ms entre cada moneda
    const staggerDelay = i * (30 + Math.random() * 30);

    const keyframes = [
      {
        transform: `translate(${startX}px, ${startY}px) scale(1) rotate(0deg)`,
        offset: 0,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // impulso ascendente decelerado
      },
      {
        transform: `translate(${startX + impulseX}px, ${startY + impulseY}px) scale(1.18) rotate(${spinDegrees * 0.25}deg)`,
        offset: 0.22,
        easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)' // aceleración gravitatoria hacia el fondo
      },
      {
        transform: `translate(${finalX}px, ${finalY}px) scale(0.85) rotate(${spinDegrees}deg)`,
        offset: 1
      }
    ];

    const anim = coin.animate(keyframes, {
      duration: duration,
      delay: staggerDelay,
      fill: 'forwards'
    });

    anim.onfinish = () => {
      coin.remove();
    };
  }
}

function updateTriviaHeartsUI() {
  const container = document.getElementById('triviaHeartsContainer');
  if (!container) return;
  const hearts = container.querySelectorAll('.hud-heart');
  hearts.forEach((heartEl, idx) => {
    if (idx < state.trivia.lives) {
      heartEl.classList.remove('heart-lost');
      heartEl.classList.add('active');
    } else {
      heartEl.classList.add('heart-lost');
      heartEl.classList.remove('active');
    }
  });
}

function renderizarPreguntaActual() {
  const questions = window.state.currentRoundQuestions || state.trivia.questions || [];
  const qIndex = window.state.currentQuestionIndex !== undefined ? window.state.currentQuestionIndex : (state.trivia.currentQuestionIndex || 0);
  state.trivia.currentQuestionIndex = qIndex;
  window.state.currentQuestionIndex = qIndex;

  const q = questions[qIndex];
  if (!q) return;

  state.trivia.isAnswering = false;
  state.trivia.questionStartTime = performance.now();

  // Actualiza el contador "1/10", "2/10", etc.
  const currentEl = document.getElementById('triviaQCurrent');
  const totalEl = document.getElementById('triviaQTotal');
  const totalQ = questions.length || state.trivia.totalQuestions || 10;
  if (currentEl) currentEl.innerText = qIndex + 1;
  if (totalEl) totalEl.innerText = totalQ;

  // Inyecta q.pregunta en el título y q.emojis en #questionEmojis
  const qTextEl = document.getElementById('triviaQuestionText');
  if (qTextEl) qTextEl.innerText = q.pregunta || q.question || '';

  const emojisEl = document.getElementById('questionEmojis');
  if (emojisEl) emojisEl.innerText = q.emojis || '';

  // Baraja aleatoriamente una copia de las 4 opciones antes de pintarlas en los botones A, B, C y D
  const rawOptions = q.opciones || q.options || [];
  const shuffledOptions = shuffleArray(rawOptions);
  q._shuffledOptions = shuffledOptions;

  // Asigna el texto exacto a data-text para evaluar acierto contra q.respuesta_correcta
  const optionsList = document.getElementById('triviaOptionsList');
  if (optionsList) {
    const btns = optionsList.querySelectorAll('.trivia-option-btn');
    btns.forEach((btn, idx) => {
      btn.classList.remove('option-correct', 'option-wrong');
      btn.style.pointerEvents = 'auto';
      const text = shuffledOptions[idx] || '';
      btn.setAttribute('data-text', text);
      const textEl = btn.querySelector('.option-text');
      if (textEl) {
        textEl.innerText = text;
      }
    });
  }

  // Quitar alarma de sirena
  const triviaView = document.getElementById('triviaView');
  if (triviaView) triviaView.classList.remove('siren-panic');

  // Iniciar temporizador estricto de 15 segundos
  startTriviaTimer();
}

function renderCurrentTriviaQuestion() {
  renderizarPreguntaActual();
}

function startTriviaTimer() {
  state.trivia.isPaused = false;
  const maxMs = (state.trivia.timerSeconds || 15) * 1000;
  state.trivia.remainingMs = maxMs;
  if (typeof SoundManager !== 'undefined') {
    SoundManager.playBGM('trivia');
  }
  runTriviaTimer(maxMs);
}

function pauseTriviaTimer() {
  if (state.trivia.timerInterval) {
    clearInterval(state.trivia.timerInterval);
    state.trivia.timerInterval = null;
  }
  state.trivia.isPaused = true;
}

function resumeTriviaTimer() {
  if (!state.trivia.isPaused || state.trivia.isAnswering) return;
  state.trivia.isPaused = false;
  runTriviaTimer(state.trivia.remainingMs);
}

function runTriviaTimer(initialRemainingMs) {
  clearInterval(state.trivia.timerInterval);
  const totalMs = (state.trivia.timerSeconds || 15) * 1000;
  const startTime = performance.now();
  const startRemaining = initialRemainingMs;

  const timerSecsEl = document.getElementById('triviaTimerSecs');
  const fillEl = document.getElementById('triviaTimerFill');
  const triviaView = document.getElementById('triviaView');

  const updateDisplay = (ms) => {
    const remainingSecs = Math.ceil(ms / 1000);
    if (timerSecsEl) timerSecsEl.innerText = remainingSecs;
    if (fillEl) fillEl.style.width = `${(ms / totalMs) * 100}%`;

    // Efecto Sirena: al llegar a <= 5 segundos, parpadear fondo en rojo intenso cada 400 ms
    if (remainingSecs <= 5 && remainingSecs > 0) {
      if (triviaView && !triviaView.classList.contains('siren-panic')) {
        triviaView.classList.add('siren-panic');
        playCountdownBeep(450);
        if (typeof SoundManager !== 'undefined') SoundManager.startAlarm();
      }
    } else if (remainingSecs > 5) {
      if (triviaView && triviaView.classList.contains('siren-panic')) {
        triviaView.classList.remove('siren-panic');
        if (typeof SoundManager !== 'undefined') SoundManager.stopAlarm();
      }
    }
  };

  updateDisplay(startRemaining);

  state.trivia.timerInterval = setInterval(() => {
    if (state.trivia.isAnswering || state.trivia.isPaused) {
      clearInterval(state.trivia.timerInterval);
      return;
    }

    const elapsed = performance.now() - startTime;
    state.trivia.remainingMs = Math.max(0, startRemaining - elapsed);

    updateDisplay(state.trivia.remainingMs);

    // Tiempo agotado a los 0 segundos sin respuesta
    if (state.trivia.remainingMs <= 0) {
      clearInterval(state.trivia.timerInterval);
      handleTriviaTimeout();
    }
  }, 40);
  window.state.timerInterval = state.trivia.timerInterval;
}

// Recompensas dinámicas por respuesta y bonos
function calculateQuestionReward(remainingSecs, currentStreak = 0) {
  let baseCoins = 1;
  const secs = Math.max(1, Math.round(remainingSecs));

  if (secs >= 11) {
    baseCoins = 10;
  } else if (secs >= 6) {
    baseCoins = 5;
  } else if (secs >= 3) {
    baseCoins = 2;
  } else {
    baseCoins = 1;
  }

  // Si hay racha de 3 o más aciertos seguidos: suma +2 RetroCoins adicionales como bono de racha
  const hasStreakBonus = currentStreak >= 3;
  const streakBonus = hasStreakBonus ? 2 : 0;
  const totalCoins = baseCoins + streakBonus;

  return {
    baseCoins,
    streakBonus,
    hasStreakBonus,
    totalCoins
  };
}

window.calculateQuestionReward = calculateQuestionReward;

function showFloatingRewardBadge(sourceBtn, amount, hasStreakBonus = false) {
  if (!sourceBtn) return;

  const badge = document.createElement('div');
  badge.className = 'trivia-floating-reward';
  const streakHtml = hasStreakBonus ? '<span class="reward-streak-tag">🔥 +2</span>' : '';
  badge.innerHTML = `<span class="reward-amount">+${amount}</span> <img src="assets/global/retrocoin.webp" alt="RC" class="floating-coin-img">${streakHtml}`;

  const rect = sourceBtn.getBoundingClientRect();
  badge.style.position = 'fixed';
  badge.style.left = `${rect.right - 28}px`;
  badge.style.top = `${rect.top + rect.height / 2}px`;

  document.body.appendChild(badge);

  setTimeout(() => {
    badge.remove();
  }, 800);
}

function handleTriviaAnswer(selectedIndex) {
  if (state.trivia.isAnswering) return;
  state.trivia.isAnswering = true;

  // Detén el reloj de 15s (clearInterval) y silencia la alarma
  clearInterval(state.trivia.timerInterval);
  if (typeof SoundManager !== 'undefined') SoundManager.stopAlarm();

  const questions = window.state.currentRoundQuestions || state.trivia.questions || [];
  const qIndex = window.state.currentQuestionIndex !== undefined ? window.state.currentQuestionIndex : (state.trivia.currentQuestionIndex || 0);
  const q = questions[qIndex];
  const optionsList = document.getElementById('triviaOptionsList');
  const btns = optionsList ? optionsList.querySelectorAll('.trivia-option-btn') : [];

  // Deshabilitar clics en opciones
  btns.forEach(b => {
    b.style.pointerEvents = 'none';
  });

  if (!q) return;

  const selectedBtn = btns[selectedIndex];
  const selectedText = selectedBtn ? (selectedBtn.getAttribute('data-text') || selectedBtn.querySelector('.option-text')?.innerText || '') : '';
  const correctText = q.respuesta_correcta || '';
  const isCorrect = selectedText === correctText;

  // Registrar tiempo de respuesta (en ms) para desempates y métricas
  const answerDuration = Math.min(10000, performance.now() - (state.trivia.questionStartTime || performance.now()));
  window.state.accumulatedAnswerTimeMs = (window.state.accumulatedAnswerTimeMs || 0) + answerDuration;

  if (isCorrect) {
    // Verde neón si acierta (animación de monedas al HUD)
    if (selectedBtn) selectedBtn.classList.add('option-correct');
    recordTriviaAnswerResult(true);

    state.trivia.currentStreak = (state.trivia.currentStreak || 0) + 1;
    state.trivia.correctAnswersCount = (state.trivia.correctAnswersCount || 0) + 1;
    if (window.state) window.state.correctAnswersCount = state.trivia.correctAnswersCount;
    state.correctAnswersCount = state.trivia.correctAnswersCount;

    // Sumar dominio de pack si se está jugando un pack temático (+1 hasta 50)
    const activeThematicPack = window.state?.activeThematicPackId || state.activeThematicPackId;
    if (activeThematicPack) {
      if (!state.packMastery) state.packMastery = {};
      if (window.state && !window.state.packMastery) window.state.packMastery = {};
      const currentMastery = (window.state?.packMastery?.[activeThematicPack] || state.packMastery?.[activeThematicPack] || 0);
      if (currentMastery < 50) {
        const newMastery = currentMastery + 1;
        state.packMastery[activeThematicPack] = newMastery;
        if (window.state) window.state.packMastery[activeThematicPack] = newMastery;
        if (typeof savePackProgressToCloud === 'function') {
          savePackProgressToCloud();
        }
      }
    }

    // Regla de economía: XP ÚNICAMENTE en Modo Desafíos
    if (window.state && window.state.isChallengeMode) {
      state.trivia.sessionXP = (state.trivia.sessionXP || 0) + 15;
      window.state.currentRoundXP = (window.state.currentRoundXP || 0) + 15;
      state.currentRoundXP = (state.currentRoundXP || 0) + 15;
    } else {
      state.trivia.sessionXP = 0;
      if (window.state) window.state.currentRoundXP = 0;
      state.currentRoundXP = 0;
    }

    const remainingSecs = Math.max(1, Math.ceil((state.trivia.remainingMs || 0) / 1000));
    const reward = calculateQuestionReward(remainingSecs, state.trivia.currentStreak);
    state.trivia.sessionCoins = (state.trivia.sessionCoins || 0) + reward.totalCoins;

    playSuccessSound();
    if (typeof SoundManager !== 'undefined') {
      SoundManager.playSFX('correcta.mp3');
      SoundManager.playSFX('retrocoin.wav');
    }

    if (selectedBtn) {
      showFloatingRewardBadge(selectedBtn, reward.totalCoins, reward.hasStreakBonus);
      const roundCoinCounter = document.getElementById('roundCoinCounter');
      setTimeout(() => {
        triggerFlyingCoinsAnimation(selectedBtn, roundCoinCounter, state.trivia.sessionCoins);
      }, 200);
    }

    // Tras 800 ms, ejecuta el Flip de la tarjeta y avanza
    setTimeout(() => {
      const triviaView = document.getElementById('triviaView');
      if (triviaView) triviaView.classList.remove('siren-panic');

      const card = document.getElementById('triviaCard');
      const advanceNext = () => {
        window.state.currentQuestionIndex++;
        state.trivia.currentQuestionIndex = window.state.currentQuestionIndex;

        const totalPreguntas = window.state.isTieBreaker ? 3 : (window.state.isChallengeMode ? 5 : 10);
        if (window.state.currentQuestionIndex >= totalPreguntas || 
            (window.state.currentRoundQuestions && window.state.currentQuestionIndex >= window.state.currentRoundQuestions.length)) {
          // Detén el temporizador definitivamente
          clearInterval(window.state.timerInterval);
          if (state.trivia && state.trivia.timerInterval) clearInterval(state.trivia.timerInterval);

          // Enrutamiento según el modo:
          if (window.state.isChallengeMode) {
            showView('#challengeResultView');
            if (typeof renderResultadosDesafio === 'function') {
              renderResultadosDesafio();
            }
          } else {
            // Modo Clásico / Ruleta
            showView('#resultsView');
            if (typeof confetti === 'function') {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
            if (typeof showResults === 'function') {
              showResults(state.trivia.correctAnswersCount);
            }
          }
          return;
        } else {
          renderizarPreguntaActual();
        }
      };

      if (card) {
        card.classList.add('flip-half');
        setTimeout(() => {
          advanceNext();
          card.classList.add('flip-prep');
          void card.offsetWidth; // Forzar reflow
          card.classList.remove('flip-prep', 'flip-half');
        }, 200);
      } else {
        advanceNext();
      }
    }, 800);
  } else {
    // Rojo si falla (revela correcta en verde y resta 1 vida)
    if (selectedBtn) selectedBtn.classList.add('option-wrong');
    recordTriviaAnswerResult(false);
    btns.forEach(b => {
      const bText = b.getAttribute('data-text') || b.querySelector('.option-text')?.innerText || '';
      if (bText === correctText) {
        b.classList.add('option-correct');
      }
    });

    state.trivia.currentStreak = 0;
    state.trivia.lives--;
    window.state.lives = state.trivia.lives;
    updateTriviaHeartsUI();
    playErrorSound();
    if (typeof SoundManager !== 'undefined') SoundManager.playSFX('error.wav');

    // CONECTAR AL AGOTARSE LAS VIDAS (lives <= 0)
    if (window.state.lives <= 0) {
      setTimeout(() => {
        if (window.state.isChallengeMode) {
          // En modo desafío NUNCA mostrar game over, ir directo a resultados de la ronda
          clearInterval(window.state.timerInterval);
          if (state.trivia && state.trivia.timerInterval) clearInterval(state.trivia.timerInterval);
          showView('#challengeResultView');
          if (typeof renderResultadosDesafio === 'function') {
            renderResultadosDesafio();
          }
        } else {
          ejecutarSecuenciaGameOver('Te has quedado sin vidas');
        }
      }, 300);
    } else {
      // Si aún quedan vidas (> 0): continúa con el flujo normal de Flip y pasa a la siguiente pregunta.
      setTimeout(() => {
        const triviaView = document.getElementById('triviaView');
        if (triviaView) triviaView.classList.remove('siren-panic');

        const card = document.getElementById('triviaCard');
        const advanceNext = () => {
          window.state.currentQuestionIndex++;
          state.trivia.currentQuestionIndex = window.state.currentQuestionIndex;

          const totalPreguntas = window.state.isTieBreaker ? 3 : (window.state.isChallengeMode ? 5 : 10);
          if (window.state.currentQuestionIndex >= totalPreguntas || 
              (window.state.currentRoundQuestions && window.state.currentQuestionIndex >= window.state.currentRoundQuestions.length)) {
            // Detén el temporizador definitivamente
            clearInterval(window.state.timerInterval);
            if (state.trivia && state.trivia.timerInterval) clearInterval(state.trivia.timerInterval);

            // Enrutamiento según el modo:
            if (window.state.isChallengeMode) {
              showView('#challengeResultView');
              if (typeof renderResultadosDesafio === 'function') {
                renderResultadosDesafio();
              }
            } else {
              // Modo Clásico / Ruleta
              showView('#resultsView');
              if (typeof confetti === 'function') {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              }
              if (typeof showResults === 'function') {
                showResults(state.trivia.correctAnswersCount);
              }
            }
            return;
          } else {
            renderizarPreguntaActual();
          }
        };

        if (card) {
          card.classList.add('flip-half');
          setTimeout(() => {
            advanceNext();
            card.classList.add('flip-prep');
            void card.offsetWidth; // Forzar reflow
            card.classList.remove('flip-prep', 'flip-half');
          }, 200);
        } else {
          advanceNext();
        }
      }, 800);
    }
  }
}

function handleTriviaTimeout() {
  if (state.trivia.isAnswering) return;
  state.trivia.isAnswering = true;
  clearInterval(state.trivia.timerInterval);
  if (typeof SoundManager !== 'undefined') SoundManager.stopAlarm();

  const questions = window.state.currentRoundQuestions || state.trivia.questions || [];
  const qIndex = window.state.currentQuestionIndex !== undefined ? window.state.currentQuestionIndex : (state.trivia.currentQuestionIndex || 0);
  const q = questions[qIndex];
  const optionsList = document.getElementById('triviaOptionsList');
  const btns = optionsList ? optionsList.querySelectorAll('.trivia-option-btn') : [];

  // Deshabilitar clics y revelar la opción correcta
  btns.forEach(b => {
    b.style.pointerEvents = 'none';
  });

  if (q) {
    const correctText = q.respuesta_correcta || '';
    btns.forEach(b => {
      const bText = b.getAttribute('data-text') || b.querySelector('.option-text')?.innerText || '';
      if (bText === correctText) {
        b.classList.add('option-correct');
      }
    });
  }

  // Registrar penalización de tiempo de respuesta (10s) en timeout
  window.state.accumulatedAnswerTimeMs = (window.state.accumulatedAnswerTimeMs || 0) + 10000;

  state.trivia.currentStreak = 0; // Reiniciar racha al agotarse el tiempo
  recordTriviaAnswerResult(false);
  state.trivia.lives--;
  window.state.lives = state.trivia.lives;
  updateTriviaHeartsUI();
  playErrorSound();
  if (typeof SoundManager !== 'undefined') SoundManager.playSFX('error.wav');

  // CONECTAR AL AGOTARSE LAS VIDAS EN TIMEOUT (lives <= 0)
  if (window.state.lives <= 0) {
    setTimeout(() => {
      if (window.state.isChallengeMode) {
        // En modo desafío NUNCA mostrar game over, ir directo a resultados de la ronda
        clearInterval(window.state.timerInterval);
        if (state.trivia && state.trivia.timerInterval) clearInterval(state.trivia.timerInterval);
        showView('#challengeResultView');
        if (typeof renderResultadosDesafio === 'function') {
          renderResultadosDesafio();
        }
      } else {
        ejecutarSecuenciaGameOver('Se agotó el tiempo y te has quedado sin vidas');
      }
    }, 300);
  } else {
    // Si aún quedan vidas (> 0): continúa con el flujo normal de Flip y pasa a la siguiente pregunta.
    setTimeout(() => {
      const triviaView = document.getElementById('triviaView');
      if (triviaView) triviaView.classList.remove('siren-panic');

      const card = document.getElementById('triviaCard');
      const advanceNext = () => {
        window.state.currentQuestionIndex++;
        state.trivia.currentQuestionIndex = window.state.currentQuestionIndex;

        const totalPreguntas = window.state.isTieBreaker ? 3 : (window.state.isChallengeMode ? 5 : 10);
        if (window.state.currentQuestionIndex >= totalPreguntas || 
            (window.state.currentRoundQuestions && window.state.currentQuestionIndex >= window.state.currentRoundQuestions.length)) {
          // Detén el temporizador definitivamente
          clearInterval(window.state.timerInterval);
          if (state.trivia && state.trivia.timerInterval) clearInterval(state.trivia.timerInterval);

          // Enrutamiento según el modo:
          if (window.state.isChallengeMode) {
            showView('#challengeResultView');
            if (typeof renderResultadosDesafio === 'function') {
              renderResultadosDesafio();
            }
          } else {
            // Modo Clásico / Ruleta
            showView('#resultsView');
            if (typeof confetti === 'function') {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
            if (typeof showResults === 'function') {
              showResults(state.trivia.correctAnswersCount);
            }
          }
          return;
        } else {
          renderizarPreguntaActual();
        }
      };

      if (card) {
        card.classList.add('flip-half');
        setTimeout(() => {
          advanceNext();
          card.classList.add('flip-prep');
          void card.offsetWidth;
          card.classList.remove('flip-prep', 'flip-half');
        }, 200);
      } else {
        advanceNext();
      }
    }, 800);
  }
}

// 1. SECUENCIA DRAMÁTICA REUTILIZABLE DE GAME OVER
function ejecutarSecuenciaGameOver(reason = 'Te has quedado sin vidas') {
  // Salvaguarda: si estamos en Modo Desafío, NUNCA mostrar Game Over
  if (window.state?.isChallengeMode || state.trivia?.isDuel) {
    clearInterval(state.trivia.timerInterval);
    state.trivia.isPaused = false;
    state.trivia.isAnswering = false;
    showView('#challengeResultView');
    if (typeof renderResultadosDesafio === 'function') {
      renderResultadosDesafio();
    }
    return;
  }
  // Bloquea inmediatamente las interacciones y detén el temporizador (clearInterval)
  clearInterval(state.trivia.timerInterval);
  state.trivia.isPaused = false;
  state.trivia.isAnswering = true;

  const optionsList = document.getElementById('triviaOptionsList');
  if (optionsList) {
    const btns = optionsList.querySelectorAll('.trivia-option-btn');
    btns.forEach(b => {
      b.style.pointerEvents = 'none';
    });
  }

  // Asegurar que el modal de abandono esté cerrado
  const abandonModal = document.getElementById('abandonModal');
  if (abandonModal) {
    abandonModal.style.display = 'none';
  }

  const btnConfirmExitTrivia = document.getElementById('btnConfirmExitTrivia');
  if (btnConfirmExitTrivia) {
    btnConfirmExitTrivia.disabled = true;
    btnConfirmExitTrivia.style.pointerEvents = 'none';
  }
  const btnCancelExitTrivia = document.getElementById('btnCancelExitTrivia');
  if (btnCancelExitTrivia) {
    btnCancelExitTrivia.disabled = true;
    btnCancelExitTrivia.style.pointerEvents = 'none';
  }

  playDramaticQuitSound();
  if (typeof SoundManager !== 'undefined') {
    SoundManager.stopAlarm();
    SoundManager.stopAllBGM();
    SoundManager.playSFX('gameover.mp3');
  }

  // Inicia la desaturación progresiva y fundido a negro en el contenedor de la trivia (#triviaView)
  // Aplica la animación 'dramaticQuit' existente (filter: grayscale(100%) contrast(120%) y opacity -> 0 a fondo negro en 900 ms)
  const triviaView = document.getElementById('triviaView');
  if (triviaView) {
    triviaView.classList.remove('siren-panic');
    triviaView.classList.remove('dramatic-quit-anim');
    void triviaView.offsetWidth; // Forzar reflow para reiniciar animación
    triviaView.classList.add('dramatic-quit-anim');
  }

  // Si el contador #roundCoinCounter acumulaba monedas en la ronda (> 0):
  const roundCoinCounter = document.getElementById('roundCoinCounter');
  const hadCoins = (state.trivia.sessionCoins || 0) > 0;

  if (roundCoinCounter && hadCoins) {
    // Reduce el texto del contador a 0 con el temblor rojo (shake)
    const counterVal = document.getElementById('roundCoinCounterVal');
    if (counterVal) counterVal.innerText = '0';
    roundCoinCounter.classList.remove('coin-counter-shake-loss');
    void roundCoinCounter.offsetWidth; // Forzar reflow
    roundCoinCounter.classList.add('coin-counter-shake-loss');

    // Dispara desde las coordenadas de #roundCoinCounter la lluvia/dispersión de 6 a 10 partículas de monedas
    triggerCrashCoinDrop(roundCoinCounter);
  }

  // Al completarse los 900 ms de desaturación:
  setTimeout(() => {
    // Restaura los filtros CSS de #triviaView para no afectar futuras partidas
    if (triviaView) {
      triviaView.classList.remove('dramatic-quit-anim', 'siren-panic');
      triviaView.style.display = 'none';
    }

    if (roundCoinCounter) {
      roundCoinCounter.classList.remove('coin-counter-shake-loss');
    }

    if (btnConfirmExitTrivia) {
      btnConfirmExitTrivia.disabled = false;
      btnConfirmExitTrivia.style.pointerEvents = 'auto';
    }
    if (btnCancelExitTrivia) {
      btnCancelExitTrivia.disabled = false;
      btnCancelExitTrivia.style.pointerEvents = 'auto';
    }

    // Reinicia las RetroCoins de la ronda a 0 y vidas a 0
    state.trivia.sessionCoins = 0;
    state.trivia.lives = 0;
    window.state.lives = 0;
    state.winStreak = 0;
    updateTriviaHeartsUI();
    updateRoundCoinsUI(0);

    // Oculta #triviaView y ejecuta showView('#gameOverView') disparando la animación de entrada de 'GAME' y 'OVER'
    showView('#gameOverView');
    triggerGameOver(reason);
  }, 900);
}

let gameOverTimeout = null;
let gameOverIdleTimeout = null;
let gameOverPerdisteTimeout = null;

function triggerGameOver(reason = 'Te has quedado sin vidas') {
  // 1. Cancelar temporizadores residuales de trivia y alarmas
  clearInterval(state.trivia.timerInterval);
  state.trivia.isPaused = false;
  state.trivia.isAnswering = false;

  const triviaView = document.getElementById('triviaView');
  if (triviaView) {
    triviaView.classList.remove('siren-panic', 'dramatic-quit-anim');
  }

  const abandonModal = document.getElementById('abandonModal');
  if (abandonModal) abandonModal.style.display = 'none';

  // 2. Al perder o abandonar, la racha se reinicia a 0 y las monedas de la tanda se pierden
  state.winStreak = 0;
  state.trivia.sessionCoins = 0;
  updateRoundCoinsUI(0);

  // 3. Limpiar temporizadores previos de Game Over si los hubiera
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
    gameOverTimeout = null;
  }
  if (gameOverIdleTimeout) {
    clearTimeout(gameOverIdleTimeout);
    gameOverIdleTimeout = null;
  }
  if (gameOverPerdisteTimeout) {
    clearTimeout(gameOverPerdisteTimeout);
    gameOverPerdisteTimeout = null;
  }

  // 4. SECUENCIA ESTRICTA: Activar PRIMERO #gameOverView, luego apagar las demás vistas
  const gameOverView = document.getElementById('gameOverView');
  if (gameOverView) {
    gameOverView.style.display = 'flex';
    gameOverView.classList.add('active-view', 'active');
  }

  // Silencio dramático de 1 segundo (1000 ms) mientras concluye la animación de 'GAME' y 'OVER', luego perdiste.mp3
  gameOverPerdisteTimeout = setTimeout(() => {
    if (gameOverView && (gameOverView.classList.contains('active') || gameOverView.classList.contains('active-view') || gameOverView.style.display === 'flex')) {
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('perdiste.mp3');
      }
    }
  }, 1000);

  // Inmediatamente después, apagar la vista de trivia
  if (triviaView) {
    triviaView.style.display = 'none';
    triviaView.classList.remove('active-view', 'active');
  }

  // Asegurar que #homeView permanezca en display: none
  const homeView = document.getElementById('homeView');
  if (homeView) {
    homeView.style.display = 'none';
    homeView.classList.remove('active-view', 'active');
  }

  // Asegurar que ninguna otra pantalla esté activa
  document.querySelectorAll('.screen-view').forEach(view => {
    if (view.id !== 'gameOverView') {
      view.classList.remove('active-view', 'active', 'slide-enter', 'slide-exit');
      view.style.display = 'none';
    }
  });

  state.activeTab = 'gameover';
  if (typeof window.state !== 'undefined') {
    window.state.activeTab = 'gameover';
  }

  try {
    if (window.location.hash !== '#gameover') {
      history.replaceState(null, '', '#gameover');
    }
  } catch (e) {}

  // 6. Ejecutar secuencia de animación CSS
  const titlesBox = document.getElementById('gameOverTitlesBox');
  const imgGame = document.getElementById('imgGameOverGame');
  const imgOver = document.getElementById('imgGameOverOver');

  // Fade In del Fondo y Vista (#gameOverView: 0 a 1 en 400 ms)
  if (gameOverView) {
    gameOverView.classList.remove('gameover-fade-in');
    void gameOverView.offsetWidth; // Forzar reflow para reiniciar animación
    gameOverView.classList.add('gameover-fade-in');
  }

  if (titlesBox) {
    titlesBox.classList.remove('gameover-idle-float');
  }

  // Animación de game.webp (.img-game-slide: -120vw a centro en 550 ms)
  if (imgGame) {
    imgGame.classList.remove('img-game-slide');
    void imgGame.offsetWidth;
    imgGame.classList.add('img-game-slide');
  }

  // Animación de over.webp (.img-over-slide: 120vw a centro en 550 ms con 100 ms de delay)
  if (imgOver) {
    imgOver.classList.remove('img-over-slide');
    void imgOver.offsetWidth;
    imgOver.classList.add('img-over-slide');
  }

  // Idle tras el choque (.gameover-idle-float) una vez posicionadas en el centro (~650 ms)
  gameOverIdleTimeout = setTimeout(() => {
    if (titlesBox && gameOverView && (gameOverView.classList.contains('active') || gameOverView.classList.contains('active-view'))) {
      titlesBox.classList.add('gameover-idle-float');
    }
  }, 650);

  // 7. Redirección Automática Estricta tras 4 Segundos (4000 ms) al Menú Principal (#homeView)
  gameOverTimeout = setTimeout(() => {
    if (gameOverPerdisteTimeout) {
      clearTimeout(gameOverPerdisteTimeout);
      gameOverPerdisteTimeout = null;
    }
    // Restablecer vidas a 3 en el HUD y estado
    state.trivia.lives = 3;
    state.trivia.sessionCoins = 0;
    state.trivia.currentQuestionIndex = 0;
    state.trivia.correctAnswersCount = 0;
    updateTriviaHeartsUI();
    updateRoundCoinsUI(0);

    // Oculta #gameOverView (display: none)
    if (gameOverView) {
      gameOverView.style.display = 'none';
      gameOverView.classList.remove('active', 'active-view');
    }

    // Muestra #homeView (display: flex) y restaura window.state.activeTab = 'inicio'
    if (homeView) {
      homeView.style.display = 'flex';
      homeView.classList.add('active', 'active-view');
    }

    state.activeTab = 'inicio';
    if (typeof window.state !== 'undefined') {
      window.state.activeTab = 'inicio';
    }
    setActiveTab('inicio');

    try {
      if (window.location.hash !== '#home') {
        history.replaceState(null, '', '#home');
      }
    } catch (e) {}

    triggerAppEntranceAnimation();
  }, 4000);
}

function showResults(aciertos = 10) {
  // 1. Asegurar aciertos entre 0 y 10
  const correctCount = Math.max(0, Math.min(10, parseInt(aciertos, 10) || 0));
  if (window.state) window.state.correctAnswersCount = correctCount;
  state.correctAnswersCount = correctCount;

  // 2. Detener temporizador de trivia y alarmas
  clearInterval(state.trivia.timerInterval);
  state.trivia.isPaused = false;
  state.trivia.isAnswering = false;

  const triviaView = document.getElementById('triviaView');
  if (triviaView) triviaView.classList.remove('siren-panic');

  const abandonModal = document.getElementById('abandonModal');
  if (abandonModal) abandonModal.style.display = 'none';

  // 3. Métricas de la Sesión: En MODO SOLITARIO se otorga ÚNICAMENTE RetroCoins (XP ganada = 0)
  if (!window.state) window.state = state;

  const currentRoundXP = 0;
  window.state.currentRoundXP = 0;
  state.currentRoundXP = 0;

  // Monedas dinámicas acumuladas en la sesión
  const sessionCoins = (state.trivia.sessionCoins !== undefined && state.trivia.sessionCoins > 0)
    ? state.trivia.sessionCoins
    : (correctCount * 5);

  // Incrementar Racha consecutiva (mínimo 1 al ganar/completar)
  state.winStreak = Math.max(1, (state.winStreak || 0) + 1);

  // En solitario la XP no se incrementa (sólo Modo Desafíos otorga XP)
  const currentTotalXP = (window.state.xp !== undefined && window.state.xp !== null) ? window.state.xp : (state.userScore || 0);
  window.state.xp = currentTotalXP;
  state.userScore = currentTotalXP;
  window.state.coins = state.coins + sessionCoins;
  state.coins = window.state.coins;

  if (typeof saveCoinsToCloud === 'function') saveCoinsToCloud(state.coins);

  // Actualizar progreso en localStorage
  try {
    localStorage.setItem('retroquiz_coins', String(state.coins));
  } catch (err) {
    console.warn('Error saving Coins to localStorage:', err);
  }

  // Sincronizar actualización en Firestore si el usuario está autenticado
  if (window.db && window.firestoreOps && window.state && window.state.userId) {
    try {
      const { doc, updateDoc } = window.firestoreOps;
      const userRef = doc(window.db, "usuarios", window.state.userId);
      updateDoc(userRef, {
        coins: window.state.coins,
        updatedAt: new Date().toISOString()
      }).catch(err => console.error("Error al actualizar datos en Firestore (showResults):", err));
    } catch (err) {
      console.error("Error al preparar updateDoc en showResults:", err);
    }
  }

  // Nivel del jugador: Nivel 12 base + 1 nivel cada 250 XP acumulados
  const playerLevel = 12 + Math.floor(state.userScore / 250);
  try {
    localStorage.setItem('retroquiz_player_level', String(playerLevel));
  } catch (e) {}

  const profileBadge = document.getElementById('profileBadge') || document.querySelector('.profile-badge');
  if (profileBadge) {
    const userXP = (window.state && typeof window.state.xp === 'number') ? window.state.xp : (state.xp !== undefined ? state.xp : (state.userScore || 0));
    profileBadge.innerText = `${getPlayerRank(userXP)} • ${userXP} XP`;
  }

  // Actualizar indicadores del usuario y modal ranking
  const rankingUserPts = document.getElementById('rankingUserPts');
  if (rankingUserPts) rankingUserPts.innerText = `${state.userScore.toLocaleString()} pts`;
  
  if (typeof updateHUD === 'function') updateHUD();

  renderCollectionCardsUI();
  updateWheelCategoriesUI();

  // 4. Encabezado y Textos Dinámicos con Fallback Total
  const resultsTitle = document.getElementById('resultsTitle');
  const resultsSubtitle = document.getElementById('resultsSubtitle');
  if (resultsTitle) {
    if (correctCount >= 10) {
      resultsTitle.innerText = '¡WOW, impresionante!';
    } else if (correctCount === 9) {
      resultsTitle.innerText = '¡MUY BIEN!';
    } else if (correctCount === 8) {
      resultsTitle.innerText = '¡POR POQUITO!';
    } else if (correctCount >= 5) {
      resultsTitle.innerText = '¡BIEN JUGADO!';
    } else {
      resultsTitle.innerText = '¡SIGUE PRACTICANDO!';
    }
  }
  if (resultsSubtitle) {
    resultsSubtitle.innerText = `Respuestas correctas: ${correctCount}/10`;
  }

  // Desglose de Nivel y XP Total del Jugador
  const playerLevelEl = document.getElementById('resultsPlayerLevel');
  const playerXpEl = document.getElementById('resultsPlayerTotalXp');
  if (playerLevelEl) playerLevelEl.innerText = `Nivel ${playerLevel}`;
  if (playerXpEl) playerXpEl.innerText = `XP Total: ${window.state.xp.toLocaleString()} pts`;

  // 5. Tarjeta Inferior Dual (Racha y Retrocoins)
  const streakValEl = document.getElementById('resultsStreakVal');
  const coinsSessionEl = document.getElementById('resultsCoinsSessionVal');
  const coinsTotalEl = document.getElementById('resultsCoinsTotalVal');
  if (streakValEl) streakValEl.innerText = `+${state.winStreak} 🔥`;
  if (coinsSessionEl) {
    if (sessionCoins > 0) {
      let currentCoin = 0;
      const coinSteps = Math.min(sessionCoins, 8);
      const stepVal = Math.ceil(sessionCoins / coinSteps);
      const coinInterval = setInterval(() => {
        currentCoin = Math.min(sessionCoins, currentCoin + stepVal);
        coinsSessionEl.innerText = `+${currentCoin}`;
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('retrocoin.wav', 0.5);
        }
        if (currentCoin >= sessionCoins) {
          clearInterval(coinInterval);
        }
      }, 100);
    } else {
      coinsSessionEl.innerText = `+0`;
    }
  }
  if (coinsTotalEl) coinsTotalEl.innerText = state.coins.toLocaleString();

  // 6. Secuencia de Audio y Confeti Condicional en Resultados
  playResultsAudioSequence(correctCount);

  // 7. Forzar Activación Directa de #resultsView ocultando todas las demás vistas
  isNavigating = false;
  document.querySelectorAll('.screen-view').forEach(view => {
    view.classList.remove('active', 'slide-enter', 'slide-exit');
    view.style.display = 'none';
  });

  const resultsView = document.getElementById('resultsView');
  if (resultsView) {
    resultsView.style.display = 'flex';
    resultsView.classList.add('active');
    state.activeTab = 'resultados';
  }

  // Sincronizar Hash sin disparar bucles de eventos
  if (window.location.hash !== '#resultados') {
    try {
      history.replaceState(null, '', '#resultados');
    } catch (e) {
      window.location.hash = '#resultados';
    }
  }

  // 8. Marco Central de Avatar en Solitario (#resultsUserAvatar)
  document.querySelectorAll('.results-xp-label').forEach(el => el.remove());
  const resultsAvatarImg = document.getElementById('resultsUserAvatar');
  const activeAvatar = window.state?.userAvatar || window.state?.customAvatar || state?.customAvatar || localStorage.getItem('retroquiz_custom_avatar') || 'assets/pantalla_inicio/hombre.webp';
  if (resultsAvatarImg) {
    resultsAvatarImg.src = activeAvatar;
  }
}

function updateDuelCardToWaiting(rivalName = 'Usuario 2') {
  const cards = document.querySelectorAll('#challengesCardsList .challenge-card');
  cards.forEach(card => {
    const name = card.querySelector('.player-rival .player-name')?.innerText?.trim();
    if (!rivalName || !name || name === rivalName || cards.length === 1) {
      const statusInd = card.querySelector('.status-indicator');
      if (statusInd) {
        statusInd.className = 'status-indicator status-waiting-rival';
        statusInd.innerHTML = '<span class="status-check">⏳</span> Esperando jugada...';
      }
      const playBtn = card.querySelector('.challenge-play-btn');
      if (playBtn) {
        playBtn.innerText = 'ENVIADO';
        playBtn.disabled = true;
        playBtn.style.opacity = '0.5';
        playBtn.style.pointerEvents = 'none';
      }
    }
  });
}

// =============================================================================
// REVELACIÓN MÁGICA CON HUMO DEL GANADOR EN DUELOS (#challengeResultView)
// =============================================================================
function triggerWinnerPodiumMagicSmoke(soyGanador, correctCount = 5) {
  const overlay = document.getElementById('winnerMagicSmokeOverlay');
  const frame = document.querySelector('#challengeResultView .winner-podium-frame');
  const crown = document.getElementById('challengeWinnerCrown');
  const nameEl = document.getElementById('challengeWinnerName');

  if (!frame) return;

  // Paso 1: Reproduce de inmediato el sonido del estallido oficial
  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('ruleta_todo.mp3', 0.80);
  }

  // Preparar estado inicial: opacidad 0 y escala reducida
  frame.classList.remove('reveal-pop');
  frame.style.opacity = '0';
  frame.style.transform = 'scale(0.3)';
  if (crown) crown.classList.remove('revealed');
  if (nameEl) nameEl.classList.remove('revealed');

  // Paso 2: Detona animación de partículas/humo mágico sobre .winner-podium-frame
  if (overlay) {
    overlay.innerHTML = '';
    overlay.classList.remove('fade-out');

    // Nube expansiva de partículas circulares translúcidas (lila, cian, amarillo neón y chispas blancas)
    const smokeColors = [
      'rgba(194, 125, 248, 0.85)', // Lila
      'rgba(168, 85, 247, 0.85)',  // Violeta
      'rgba(84, 219, 230, 0.85)',  // Cian
      'rgba(46, 226, 182, 0.85)',  // Menta
      'rgba(255, 230, 0, 0.85)'    // Amarillo neón
    ];
    const sparkColors = ['#FFFFFF', '#FFE600', '#A5F3FC', '#FDE047'];

    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'smoke-particle';
      const size = Math.floor(Math.random() * 26 + 28);
      const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 65 + 15;
      const dx = Math.cos(angle) * dist + 'px';
      const dy = Math.sin(angle) * dist + 'px';
      const scale = (Math.random() * 0.8 + 1.4).toFixed(2);
      const duration = (Math.random() * 0.2 + 0.65).toFixed(2) + 's';

      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.backgroundColor = color;
      p.style.setProperty('--dx', dx);
      p.style.setProperty('--dy', dy);
      p.style.setProperty('--target-scale', scale);
      p.style.setProperty('--duration', duration);

      overlay.appendChild(p);
    }

    for (let i = 0; i < 16; i++) {
      const s = document.createElement('div');
      s.className = 'spark-particle';
      const size = Math.floor(Math.random() * 5 + 4);
      const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 75 + 20;
      const dx = Math.cos(angle) * dist + 'px';
      const dy = Math.sin(angle) * dist + 'px';
      const duration = (Math.random() * 0.2 + 0.55).toFixed(2) + 's';

      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.backgroundColor = color;
      s.style.setProperty('--dx', dx);
      s.style.setProperty('--dy', dy);
      s.style.setProperty('--duration', duration);

      overlay.appendChild(s);
    }
  }

  // Paso 3: Revelación elástica en el pico del humo a los 300 ms
  setTimeout(() => {
    frame.classList.add('reveal-pop');
    if (crown) crown.classList.add('revealed');
    if (nameEl) nameEl.classList.add('revealed');

    if (soyGanador) {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
      }
      playResultsAudioSequence(correctCount);
    }
  }, 300);

  // Paso 4: A los 600 ms, el humo se desvanece por completo
  setTimeout(() => {
    if (overlay) overlay.classList.add('fade-out');
  }, 600);

  // Si perdió: exactamente 1 segundo después (cuando se asimila la derrota), suena 'gameover.mp3'
  if (!soyGanador) {
    setTimeout(() => {
      if (typeof SoundManager !== 'undefined') {
        SoundManager.stopAllBGM();
        SoundManager.playSFX('gameover.mp3', 0.85);
      } else {
        playErrorSound();
      }
    }, 1000);
  }
}
window.triggerWinnerPodiumMagicSmoke = triggerWinnerPodiumMagicSmoke;

function showChallengeDuelResults(round = 1, aciertos = 4, isDirectView = false) {
  // 1. Detener temporizadores y alarmas
  clearInterval(state.trivia.timerInterval);
  state.trivia.isPaused = false;
  state.trivia.isAnswering = false;

  const triviaView = document.getElementById('triviaView');
  if (triviaView) triviaView.classList.remove('siren-panic');

  const abandonModal = document.getElementById('abandonModal');
  if (abandonModal) abandonModal.style.display = 'none';

  // 2. Parámetros de ronda y aciertos
  const isTieBreaker = (round === 'desempate' || window.state?.isTieBreaker || state.isTieBreaker);
  const currentRound = isTieBreaker ? 'desempate' : Math.max(1, Math.min(3, parseInt(round, 10) || 1));
  const maxQuestions = isTieBreaker ? 3 : 5;
  const correctCount = Math.max(0, Math.min(maxQuestions, parseInt(aciertos, 10) !== undefined ? parseInt(aciertos, 10) : 0));

  if (!state.currentDuel) {
    state.currentDuel = {
      rivalName: 'Usuario 2',
      rivalAvatar: '🕹️',
      currentRound: currentRound,
      localTotalScore: 0,
      rivalTotalScore: 0
    };
  }
  state.currentDuel.currentRound = currentRound;

  // Calcular métricas de la ronda actual: Modo Desafíos es el ÚNICO que otorga XP
  const roundXP = isDirectView ? 0 : (correctCount * 60); // 60 XP por respuesta correcta
  const roundCoins = isDirectView ? 0 : ((state.trivia && state.trivia.sessionCoins > 0) ? state.trivia.sessionCoins : (correctCount * 5));

  if (state.trivia) {
    state.trivia.lastRoundXP = roundXP;
    state.trivia.lastRoundCoins = roundCoins;
  }

  // Datos del desafío en Firestore si están disponibles
  const chData = state.currentDuel.chData;
  const currentUid = window.state?.userId;
  const isCreator = chData ? (chData.fromUid === currentUid) : true;
  const rivalUid = chData ? (isCreator ? chData.toUid : chData.fromUid) : state.currentDuel.rivalUid;

  const myPrevRoundsCompleted = (chData && chData.scores && currentUid && chData.scores[currentUid]?.roundsCompleted) || 0;
  const rivalRoundsCompleted = (chData && chData.scores && rivalUid && chData.scores[rivalUid]?.roundsCompleted) || 0;

  // Actualizar monedas globales en memoria (la XP fluctúa de forma competitiva al cerrarse el duelo)
  if (!isDirectView) {
    state.coins += roundCoins;
    if (window.state) {
      window.state.coins = state.coins;
    }
    if (typeof saveCoinsToCloud === 'function') saveCoinsToCloud(state.coins);
  }

  // Puntajes totales acumulados: Puntaje_Jugador = Total_RetroCoins_Ganadas + Total_XP_Ganado
  let localTotalScore = state.currentDuel.localTotalScore || 0;
  let rivalTotalScore = state.currentDuel.rivalTotalScore || 0;

  if (!isDirectView) {
    localTotalScore += (roundCoins + roundXP);
    state.currentDuel.localTotalScore = localTotalScore;
  }

  // Comprobar si ambos jugadores han concluido la Ronda 3 (o el desempate)
  const isFinalResolution = isDirectView || 
    (chData && chData.status === "completed") || 
    (currentRound === 3 && (rivalRoundsCompleted >= 3 || (!isCreator && myPrevRoundsCompleted >= 2))) ||
    (isTieBreaker && chData && chData.scores && chData.scores[rivalUid]?.tieBreakerHits !== undefined);

  renderCollectionCardsUI();

  // 3. Actualizar HUD Superior
  const badgeEl = document.getElementById('duelResultRoundBadge');
  if (badgeEl) {
    if (isTieBreaker) {
      badgeEl.innerText = 'RONDA DE DESEMPATE';
    } else if (isFinalResolution) {
      badgeEl.innerText = 'DUELO FINALIZADO';
    } else {
      badgeEl.innerText = `RONDA ${currentRound} DE 3`;
    }
  }

  const localScoreEl = document.getElementById('duelResultLocalScore');
  if (localScoreEl) localScoreEl.innerText = `${localTotalScore} pts`;

  const rivalNameEl = document.getElementById('duelResultRivalName');
  if (rivalNameEl) rivalNameEl.innerText = state.currentDuel.rivalName || 'Rival';

  const rivalAvatarSpan = document.querySelector('#podiumRivalAvatar span');
  if (rivalAvatarSpan) rivalAvatarSpan.innerText = state.currentDuel.rivalAvatar || '🕹️';

  const rivalScoreEl = document.getElementById('duelResultRivalScore');
  if (rivalScoreEl) rivalScoreEl.innerText = `${rivalTotalScore} pts`;

  const outcomeTitle = document.getElementById('duelOutcomeTitle');
  const localCrown = document.getElementById('localWinnerCrown');
  const rivalCrown = document.getElementById('rivalWinnerCrown');

  // 4. Tarjeta Central de Desempeño
  if (window.state) window.state.correctAnswersCount = correctCount;
  state.correctAnswersCount = correctCount;

  const hitsNumEl = document.getElementById('duelHitsNumber');
  if (hitsNumEl) hitsNumEl.innerText = `${correctCount} / ${maxQuestions}`;

  const timeSpentEl = document.getElementById('duelTimeSpent');
  if (timeSpentEl) {
    if (state.trivia && state.trivia.duelStartTime) {
      const elapsed = ((performance.now() - state.trivia.duelStartTime) / 1000).toFixed(1);
      timeSpentEl.innerText = `${elapsed}s`;
    } else {
      timeSpentEl.innerText = `18.4s`;
    }
  }

  const pointsEarnedEl = document.getElementById('duelPointsEarned');
  if (pointsEarnedEl) {
    pointsEarnedEl.innerText = `+${roundXP} XP`;
    pointsEarnedEl.classList.remove('duel-xp-winner', 'duel-xp-loser');
    pointsEarnedEl.classList.add('text-accent-xp');
    pointsEarnedEl.style.color = '';
  }

  const coinsEarnedEl = document.getElementById('duelCoinsEarned');
  if (coinsEarnedEl) coinsEarnedEl.innerText = `+${roundCoins} RC`;

  // 5. Botones de Acción y Resolución
  const roundActions = document.getElementById('duelRoundActions');
  const finalActions = document.getElementById('duelFinalActions');
  const versusPodium = document.getElementById('duelResultPodiumVersus');
  const winnerPodium = document.getElementById('duelWinnerPodiumContainer');
  const outcomeSubtitle = document.getElementById('duelOutcomeSubtitle');

  if (!isFinalResolution) {
    // Rondas Intermedias (1 y 2, o Ronda 3 previa al turno del rival)
    if (outcomeTitle) outcomeTitle.innerText = `RESULTADOS RONDA ${currentRound}`;
    if (outcomeSubtitle) outcomeSubtitle.style.display = 'none';
    if (versusPodium) versusPodium.style.display = 'flex';
    if (winnerPodium) winnerPodium.style.display = 'none';
    if (localCrown) localCrown.classList.add('hidden');
    if (rivalCrown) rivalCrown.classList.add('hidden');

    if (roundActions) roundActions.style.display = 'flex';
    if (finalActions) finalActions.style.display = 'none';

    playResultsAudioSequence(correctCount);
  } else {
    // Ronda 3 Final - Resolución Definitiva
    if (roundActions) roundActions.style.display = 'none';
    if (finalActions) finalActions.style.display = 'flex';

    const btnRematchDuel = document.getElementById('btnRematchDuel');
    const btnDuelBackToChallenges = document.getElementById('btnDuelBackToChallenges');

    // 1. LÓGICA DE DETECCIÓN DEL GANADOR:
    const miPuntaje = localTotalScore;
    const rivalPuntaje = rivalTotalScore;
    const esEmpate = (miPuntaje === rivalPuntaje);
    const soyGanador = (miPuntaje > rivalPuntaje);
    const soyPerdedor = (miPuntaje < rivalPuntaje);

    const localUsername = window.state?.username || localStorage.getItem('retroquiz_username') || "Tú";
    const localAvatar = window.state?.userAvatar || window.state?.customAvatar || state?.customAvatar || localStorage.getItem('retroquiz_custom_avatar') || 'assets/pantalla_inicio/hombre.webp';

    const rivalUsername = state.currentDuel?.rivalName || (isCreator ? (chData?.toUsername || chData?.targetUserName) : (chData?.fromUsername || chData?.challengerName)) || 'Rival';
    let rivalAvatar = state.currentDuel?.rivalAvatar || (isCreator ? chData?.toAvatar : chData?.fromAvatar) || 'assets/pantalla_inicio/hombre.webp';
    if (!rivalAvatar || (!rivalAvatar.includes('/') && !rivalAvatar.startsWith('data:'))) {
      rivalAvatar = 'assets/pantalla_inicio/hombre.webp';
    }

    const datosGanador = soyGanador
      ? { nombre: localUsername, avatar: localAvatar, puntaje: miPuntaje }
      : { nombre: rivalUsername, avatar: rivalAvatar, puntaje: rivalPuntaje };

    const chId = state.currentDuel?.challengeId || chData?.id || window.state?.currentChallengeId;
    const currentUidVal = currentUid || window.state?.userId || state.userId;
    const xpAwardedKey = 'retroquiz_duel_xp_awarded_' + (chId || 'duel') + '_' + (currentUidVal || 'local');
    const alreadyProcessed = (localStorage.getItem(xpAwardedKey) === 'true') || 
      (chData?.xpFluctuationAwarded && currentUidVal && chData.xpFluctuationAwarded[currentUidVal]);

    const currentXp = (window.state && typeof window.state.xp === 'number') 
      ? window.state.xp 
      : (state.xp !== undefined ? state.xp : (state.userScore || 0));

    if (soyGanador) {
      // Feedback visual del ganador: texto verde menta #2ee2b6 "+120 XP"
      if (pointsEarnedEl) {
        pointsEarnedEl.innerText = '+120 XP';
        pointsEarnedEl.classList.remove('text-accent-xp', 'duel-xp-loser');
        pointsEarnedEl.classList.add('duel-xp-winner');
        pointsEarnedEl.style.color = '#2ee2b6';
      }

      // Fluctuación de XP: Suma +120 XP (sin duplicar en visitas repetidas)
      if (!alreadyProcessed) {
        const newXP = currentXp + 120;
        state.xp = newXP;
        state.userScore = newXP;
        if (window.state) {
          window.state.xp = newXP;
          window.state.userScore = newXP;
        }
        try {
          localStorage.setItem('retroquiz_xp', String(newXP));
          localStorage.setItem(xpAwardedKey, 'true');
        } catch (e) {}

        const profileBadge = document.getElementById('profileBadge') || document.querySelector('.profile-badge');
        if (profileBadge) {
          profileBadge.innerText = `${getPlayerRank(newXP)} • ${newXP} XP`;
        }
        if (typeof updateHUD === 'function') updateHUD();

        // Persistir en Firestore usuarios/{userId}
        if (window.db && window.firestoreOps && currentUidVal) {
          try {
            const { doc, updateDoc } = window.firestoreOps;
            const userRef = doc(window.db, "usuarios", currentUidVal);
            updateDoc(userRef, {
              xp: newXP,
              updatedAt: new Date().toISOString()
            }).catch(err => console.error("Error al actualizar XP del ganador en Firestore:", err));

            if (chId) {
              const chRef = doc(window.db, "desafios", chId);
              updateDoc(chRef, {
                winnerUid: currentUidVal,
                [`xpFluctuationAwarded.${currentUidVal}`]: true
              }).catch(() => {});
            }
          } catch (err) {
            console.error("Error preparando updateDoc de XP:", err);
          }
        }
      }

      // 3. ESTADOS DE LA PANTALLA SEGÚN EL ROL: SI SOY EL GANADOR
      if (outcomeTitle) outcomeTitle.innerText = '🏆 ¡VICTORIA DEFINITIVA!';
      if (outcomeSubtitle) {
        outcomeSubtitle.innerText = '¡Has dominado el duelo frente a tu rival!';
        outcomeSubtitle.style.display = 'block';
      }

      // Marco central del podio con foto del ganador y corona
      if (winnerPodium) winnerPodium.style.display = 'flex';
      if (versusPodium) versusPodium.style.display = 'none';

      const winnerAvatarImg = document.getElementById('challengeWinnerAvatar');
      if (winnerAvatarImg) winnerAvatarImg.src = datosGanador.avatar;
      const winnerNameEl = document.getElementById('challengeWinnerName');
      if (winnerNameEl) winnerNameEl.textContent = datosGanador.nombre;

      // Botón principal: "VOLVER A DESAFÍOS" en amarillo neón (ocultar revancha)
      if (btnRematchDuel) {
        btnRematchDuel.style.display = 'none';
      }
      if (btnDuelBackToChallenges) {
        btnDuelBackToChallenges.style.display = 'flex';
        btnDuelBackToChallenges.innerText = 'VOLVER A DESAFÍOS';
        btnDuelBackToChallenges.className = 'btn-duel-action btn-back-challenges btn-winner-back interactive-press';
      }

      // Secuencia de revelación con humo mágico, 'ruleta_todo.mp3' y fanfarria con confeti
      triggerWinnerPodiumMagicSmoke(true, correctCount);
    } else if (soyPerdedor) {
      const isSafeZone = (currentXp < 700);

      // Feedback visual del perdedor: texto rojo "-60 XP" (o "+0 XP en zona segura" si < 700 XP)
      if (pointsEarnedEl) {
        pointsEarnedEl.classList.remove('text-accent-xp', 'duel-xp-winner');
        pointsEarnedEl.classList.add('duel-xp-loser');
        pointsEarnedEl.style.color = '#FF3366';
        if (isSafeZone) {
          pointsEarnedEl.innerText = '+0 XP en zona segura';
        } else {
          pointsEarnedEl.innerText = '-60 XP';
        }
      }

      // Fluctuación de XP: Si xp < 700: no pierde XP. Si xp >= 700: resta -60 XP (mínimo 0)
      if (!alreadyProcessed) {
        const newXP = isSafeZone ? currentXp : Math.max(0, currentXp - 60);
        state.xp = newXP;
        state.userScore = newXP;
        if (window.state) {
          window.state.xp = newXP;
          window.state.userScore = newXP;
        }
        try {
          localStorage.setItem('retroquiz_xp', String(newXP));
          localStorage.setItem(xpAwardedKey, 'true');
        } catch (e) {}

        const profileBadge = document.getElementById('profileBadge') || document.querySelector('.profile-badge');
        if (profileBadge) {
          profileBadge.innerText = `${getPlayerRank(newXP)} • ${newXP} XP`;
        }
        if (typeof updateHUD === 'function') updateHUD();

        // Persistir en Firestore usuarios/{userId}
        if (window.db && window.firestoreOps && currentUidVal) {
          try {
            const { doc, updateDoc } = window.firestoreOps;
            const userRef = doc(window.db, "usuarios", currentUidVal);
            updateDoc(userRef, {
              xp: newXP,
              updatedAt: new Date().toISOString()
            }).catch(err => console.error("Error al actualizar XP del perdedor en Firestore:", err));

            if (chId) {
              const chRef = doc(window.db, "desafios", chId);
              updateDoc(chRef, {
                loserUid: currentUidVal,
                [`xpFluctuationAwarded.${currentUidVal}`]: true
              }).catch(() => {});
            }
          } catch (err) {
            console.error("Error preparando updateDoc de XP:", err);
          }
        }
      }

      // 3. ESTADOS DE LA PANTALLA SEGÚN EL ROL: SI SOY EL PERDEDOR
      if (outcomeTitle) outcomeTitle.innerText = 'HAS PERDIDO';
      if (outcomeSubtitle) {
        outcomeSubtitle.innerText = `${datosGanador.nombre} se lleva la victoria por esta vez`;
        outcomeSubtitle.style.display = 'block';
      }

      // El círculo central sigue mostrando la foto del RIVAL con su corona
      if (winnerPodium) winnerPodium.style.display = 'flex';
      if (versusPodium) versusPodium.style.display = 'none';

      const winnerAvatarImg = document.getElementById('challengeWinnerAvatar');
      if (winnerAvatarImg) winnerAvatarImg.src = datosGanador.avatar;
      const winnerNameEl = document.getElementById('challengeWinnerName');
      if (winnerNameEl) winnerNameEl.textContent = datosGanador.nombre;

      // Botón principal: "🔄 SOLICITAR REVANCHA" (destacado en naranja/rojo Neo-Memphis) y botón secundario "VOLVER"
      if (btnRematchDuel) {
        btnRematchDuel.style.display = 'flex';
        btnRematchDuel.innerHTML = '<span class="btn-action-icon">🔄</span><span>SOLICITAR REVANCHA</span>';
        btnRematchDuel.className = 'btn-duel-action btn-rematch-duel btn-rematch-highlight interactive-press';
      }
      if (btnDuelBackToChallenges) {
        btnDuelBackToChallenges.style.display = 'flex';
        btnDuelBackToChallenges.innerText = 'VOLVER';
        btnDuelBackToChallenges.className = 'btn-duel-action btn-back-challenges btn-secondary-back interactive-press';
      }

      // Secuencia de revelación con humo mágico para el rival y 'gameover.mp3' a 1s
      triggerWinnerPodiumMagicSmoke(false, correctCount);
    } else {
      // 4. EMPATE (CASO BORDE)
      if (pointsEarnedEl) {
        pointsEarnedEl.innerText = '+0 XP';
        pointsEarnedEl.classList.remove('duel-xp-winner', 'duel-xp-loser');
        pointsEarnedEl.classList.add('text-accent-xp');
        pointsEarnedEl.style.color = '';
      }
      try {
        localStorage.setItem(xpAwardedKey, 'true');
      } catch (e) {}

      if (outcomeTitle) outcomeTitle.innerText = '¡EMPATE ÉPICO!';
      if (outcomeSubtitle) {
        outcomeSubtitle.innerText = '¡Duelo reñido! Ambos demostraron gran nivel.';
        outcomeSubtitle.style.display = 'block';
      }

      // Muestra ambos avatares lado a lado, sin corona única
      if (winnerPodium) winnerPodium.style.display = 'none';
      if (versusPodium) versusPodium.style.display = 'flex';
      if (localCrown) localCrown.classList.add('hidden');
      if (rivalCrown) rivalCrown.classList.add('hidden');
      const podiumVsTag = document.getElementById('podiumVsTag');
      if (podiumVsTag) podiumVsTag.innerText = 'EMPATE';

      if (btnRematchDuel) {
        btnRematchDuel.style.display = 'flex';
        btnRematchDuel.innerHTML = '<span class="btn-action-icon">🔄</span><span>SOLICITAR REVANCHA</span>';
        btnRematchDuel.className = 'btn-duel-action btn-rematch-duel btn-rematch-highlight interactive-press';
      }
      if (btnDuelBackToChallenges) {
        btnDuelBackToChallenges.style.display = 'flex';
        btnDuelBackToChallenges.innerText = 'VOLVER';
        btnDuelBackToChallenges.className = 'btn-duel-action btn-back-challenges btn-secondary-back interactive-press';
      }

      playResultsAudioSequence(correctCount);
    }
  }

  // 6. Navegar a la pantalla de resultados
  navigateToScreen('challengeResultView');
}

function renderResultadosDesafio() {
  const round = (state.currentDuel && state.currentDuel.currentRound) ? state.currentDuel.currentRound : 1;
  const aciertos = (state.trivia && state.trivia.correctAnswersCount !== undefined) 
    ? state.trivia.correctAnswersCount 
    : ((window.state && window.state.trivia && window.state.trivia.correctAnswersCount !== undefined) 
        ? window.state.trivia.correctAnswersCount 
        : (window.state && window.state.correctAnswersCount ? window.state.correctAnswersCount : 0));

  if (typeof showChallengeDuelResults === 'function') {
    showChallengeDuelResults(round, aciertos);
  }
}
window.renderResultadosDesafio = renderResultadosDesafio;

function completeTriviaRound() {
  const isDuel = state.trivia.isDuel;
  const correctCount = state.trivia.correctAnswersCount !== undefined ? state.trivia.correctAnswersCount : (isDuel ? 4 : 10);
  if (isDuel) {
    showChallengeDuelResults(state.currentDuel?.currentRound || 1, correctCount);
  } else {
    showResults(correctCount);
  }
}

// Exponer en window para pruebas y consola (showResults(9), debugShowResults(), spinWheel(), setCoinsAndSync(1000))
window.showResults = showResults;
window.debugShowResults = function(aciertos = 9) {
  showResults(aciertos);
};
window.showChallengeDuelResults = showChallengeDuelResults;
window.debugShowDuelResults = function(round = 1, aciertos = 4) {
  showChallengeDuelResults(round, aciertos);
};
window.openAttackModal = function() {
  openModal('attackModal');
};
window.triggerGameOver = triggerGameOver;
window.ejecutarSecuenciaGameOver = ejecutarSecuenciaGameOver;
window.loadTodoMixQuestions = loadTodoMixQuestions;
window.debugGameOver = function(reason = 'Prueba Game Over') {
  triggerGameOver(reason);
};
window.triggerFlyingCoinsAnimation = triggerFlyingCoinsAnimation;
window.updateRoundCoinsUI = updateRoundCoinsUI;
window.triggerCrashCoinDrop = triggerCrashCoinDrop;
window.debugCrashCoinDrop = function(coins = 30) {
  state.trivia.sessionCoins = coins;
  updateRoundCoinsUI(coins);
  const roundCoinCounter = document.getElementById('roundCoinCounter');
  if (roundCoinCounter) {
    const counterVal = document.getElementById('roundCoinCounterVal');
    if (counterVal) counterVal.innerText = '0';
    roundCoinCounter.classList.remove('coin-counter-shake-loss');
    void roundCoinCounter.offsetWidth;
    roundCoinCounter.classList.add('coin-counter-shake-loss');
    triggerCrashCoinDrop(roundCoinCounter);
  }
};
window.spinWheel = spinWheel;
window.getUnlockedCategories = getUnlockedCategories;
window.updateWheelCategoriesUI = updateWheelCategoriesUI;
window.setCoinsAndSync = function(amount) {
  state.coins = parseInt(amount, 10) || 0;
  updateWheelCategoriesUI();
  renderCollectionCardsUI();
  console.log(`🪙 Saldo fijado en ${state.coins} RC. Categorías desbloqueadas:`, getUnlockedCategories());
};
window.triggerChallengesEntranceAnimation = triggerChallengesEntranceAnimation;
window.debugShowChallenges = function() {
  navigateToScreen('challengesView');
};
window.openAcceptChallengeModal = function() {
  openModal('acceptChallengeModal');
};
window.openSendChallengeModal = function() {
  openModal('sendChallengeModal');
};

function mostrarModalOnboarding() {
  openModal('challengeOnboardingModal');
}
window.mostrarModalOnboarding = mostrarModalOnboarding;

function ocultarModalOnboarding() {
  closeModal('challengeOnboardingModal');
}
window.ocultarModalOnboarding = ocultarModalOnboarding;

function openChallengeOnboardingModal() {
  mostrarModalOnboarding();
}
window.openChallengeOnboardingModal = openChallengeOnboardingModal;

function checkChallengeOnboardingTrigger() {
  const currentView = window.state?.currentView || state.currentView;
  const isChallengesView = (currentView === '#challengesView' || currentView === 'challengesView' || 
    document.getElementById('challengesView')?.classList.contains('active-view') || 
    document.getElementById('challengesView')?.classList.contains('active'));

  if (!isChallengesView) return;

  const activeCount = Array.isArray(state.challenges) ? state.challenges.length : 0;
  const pendingCount = Array.isArray(state.pendingChallenges) ? state.pendingChallenges.length : 0;
  const allCount = Array.isArray(state.allChallengesList) ? state.allChallengesList.filter(c => c && c.status !== 'rejected').length : 0;
  const totalDesafiosActivos = Math.max(activeCount + pendingCount, allCount);

  const hasChallenges = (totalDesafiosActivos > 0);
  let hasSeenIntro = false;
  try {
    hasSeenIntro = localStorage.getItem('retroquiz_seen_challenge_intro') === 'true';
  } catch (e) {}

  // Solo desplegar automáticamente si:
  // 1. El usuario NO tiene ningún desafío activo o enviado (bandeja vacía: total === 0).
  // 2. Y además aún no ha visto la guía explicativa (!hasSeenIntro).
  if (!hasChallenges && !hasSeenIntro) {
    mostrarModalOnboarding();
  } else {
    // Si ya tiene partidas o invitaciones en curso, NO abrir el modal automáticamente
    if (!window._isManualHelpOpen) {
      ocultarModalOnboarding();
    }
  }
}
window.checkChallengeOnboardingTrigger = checkChallengeOnboardingTrigger;

window.showRetroToast = showRetroToast;
window.spinDuelWheel = spinDuelWheel;
window.triggerChallengeMatchEntranceAnimation = triggerChallengeMatchEntranceAnimation;
window.debugShowDuelWheel = function(rival = 'Usuario 2', avatar = '🕹️') {
  setupDuelMatchUI(rival, avatar);
  navigateToScreen('challengeMatchView');
};
window.debugShowStore = function() {
  navigateToScreen('storeView');
};
window.updateStoreUI = updateStoreUI;
window.buyBooster = buyBooster;
window.buyTheme = buyTheme;
window.equipTheme = equipTheme;
window.resetTheme = resetTheme;

// =============================================================================
// 6. CONTROL DE PERFIL: AVATAR PERSONALIZADO Y ELIMINAR PUBLICIDAD
// =============================================================================

function updateUserAvatarAcrossApp(imgSrc) {
  if (!imgSrc) return;
  state.customAvatar = imgSrc;
  state.userAvatar = imgSrc;
  if (window.state) {
    window.state.customAvatar = imgSrc;
    window.state.userAvatar = imgSrc;
  }

  // Actualiza todos los elementos de avatar sincronizados en la app
  document.querySelectorAll('.user-avatar-sync').forEach(el => {
    if (el.tagName === 'IMG') {
      el.src = imgSrc;
      el.classList.remove('avatar-fade-in');
      void el.offsetWidth;
      el.classList.add('avatar-fade-in');
    }
  });
}

function setupProfileAvatar() {
  const avatarFrame = document.getElementById('profileAvatarFrame');
  const btnEdit = document.getElementById('btnEditAvatar');
  const fileInput = document.getElementById('avatarFileInput');

  const triggerUpload = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    playClickSound();
    if (fileInput) {
      fileInput.click();
    }
  };

  if (avatarFrame) {
    avatarFrame.addEventListener('click', triggerUpload);
  }
  if (btnEdit) {
    btnEdit.addEventListener('click', triggerUpload);
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (!fileInput.files || !fileInput.files[0]) return;
      const file = fileInput.files[0];

      if (!file.type.startsWith('image/')) {
        showRetroToast('Selecciona un archivo de imagen válido', '⚠️');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Img = e.target.result;
        updateUserAvatarAcrossApp(base64Img);
        try {
          localStorage.setItem('retroquiz_custom_avatar', base64Img);
        } catch (err) {
          console.warn('Error saving custom avatar to localStorage:', err);
        }
        playSuccessSound();
        showRetroToast('¡Foto de perfil actualizada!', '📸');
      };
      reader.readAsDataURL(file);
    });
  }

  // Carga de avatar guardado en localStorage
  try {
    const savedAvatar = localStorage.getItem('retroquiz_custom_avatar');
    if (savedAvatar) {
      updateUserAvatarAcrossApp(savedAvatar);
    }
  } catch (err) {
    console.warn('Error loading custom avatar from localStorage:', err);
  }
}

function applyNoAdsState(purchased) {
  state.noAds = !!purchased;
  const btn = document.getElementById('btnRemoveAds');
  const wrapReset = document.getElementById('wrapResetAds');
  if (!btn) return;

  const icon = btn.querySelector('.no-ads-icon');
  const title = btn.querySelector('.no-ads-title');
  const sub = btn.querySelector('.no-ads-sub');
  const price = btn.querySelector('.no-ads-price-pill');

  if (purchased) {
    btn.classList.add('is-purchased');
    if (icon) icon.innerText = '😎';
    if (title) title.innerText = 'PUBLICIDAD DESACTIVADA ✓';
    if (sub) sub.innerText = 'Tu RetroQuiz esta sin anuncios';
    if (price) price.innerText = 'ACTIVO';
    btn.style.pointerEvents = 'none';
    if (wrapReset) wrapReset.style.display = 'flex';
  } else {
    btn.classList.remove('is-purchased');
    if (icon) icon.innerText = '📵';
    if (title) title.innerText = 'ELIMINAR PUBLICIDAD';
    if (sub) sub.innerText = 'Disfruta de RetroQuiz sin anuncios por $0.99';
    if (price) price.innerText = '$0.99';
    btn.style.pointerEvents = '';
    if (wrapReset) wrapReset.style.display = 'none';
  }
}

function setupNoAdsFeature() {
  const btn = document.getElementById('btnRemoveAds');
  if (btn) {
    btn.addEventListener('click', () => {
      if (state.noAds) return;
      playCoinSound();

      try {
        localStorage.setItem('retroquiz_no_ads', 'true');
      } catch (err) {
        console.warn('Error saving no_ads to localStorage:', err);
      }

      applyNoAdsState(true);

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffe600', '#ff007f', '#00f0ff', '#7b2cbf', '#00ff66'],
          zIndex: 10005
        });
      }

      showRetroToast('¡Publicidad eliminada con éxito!', '🎉');
    });
  }

  // Botón discreto para reiniciar compra y probar
  const btnReset = document.getElementById('btnResetNoAdsTest');
  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      e.stopPropagation();
      try {
        localStorage.removeItem('retroquiz_no_ads');
      } catch (err) {}
      applyNoAdsState(false);
      showRetroToast('Modo gratuito restaurado para pruebas', '📵');
    });
  }

  // Carga de estado sin anuncios al iniciar
  try {
    const isNoAds = localStorage.getItem('retroquiz_no_ads') === 'true';
    applyNoAdsState(isNoAds);
  } catch (err) {
    console.warn('Error reading no_ads from localStorage:', err);
    applyNoAdsState(false);
  }
}

// =============================================================================
// ESTADÍSTICAS Y GESTIÓN DE PERFIL (#profileView)
// =============================================================================
function updateProfileStatsUI() {
  const currentStats = (window.state && window.state.stats) || (state && state.stats) || { totalQuestions: 0, correctAnswers: 0, maxStreak: 0 };
  const accEl = document.getElementById('profileAccuracy');
  const corEl = document.getElementById('profileCorrectCount');
  const strEl = document.getElementById('profileMaxStreak');

  const total = Number(currentStats.totalQuestions) || 0;
  const correct = Number(currentStats.correctAnswers) || 0;
  const maxStr = Number(currentStats.maxStreak) || 0;

  const accPercent = total > 0 ? Math.round((correct / total) * 100) + '%' : '0%';

  if (accEl) accEl.textContent = accPercent;
  if (corEl) corEl.textContent = String(correct);
  if (strEl) strEl.textContent = String(maxStr);
}
window.updateProfileStatsUI = updateProfileStatsUI;

function updatePlayerNameAcrossApp(newName) {
  if (!newName) return;
  if (state) state.username = newName;
  if (window.state) window.state.username = newName;

  // 1. Tarjeta en Ranking (#userRankName)
  const userRankNameEl = document.getElementById('userRankName');
  if (userRankNameEl) {
    userRankNameEl.textContent = `${newName} (Tú)`;
    userRankNameEl.style.color = '#FFFFFF';
  }

  // 2. Jugador Local en Duelo
  const localDuelNameEl = document.querySelector('.duel-player-local .duel-player-name');
  if (localDuelNameEl) {
    localDuelNameEl.textContent = newName;
  }

  // 3. Tarjetas de Desafíos activos (slots de usuario)
  document.querySelectorAll('.player-slot.player-user .player-name').forEach(el => {
    el.textContent = newName;
  });

  // 4. Saludos o tarjetas HUD si existen
  const homePlayerName = document.getElementById('homePlayerName') || document.querySelector('.home-player-name') || document.querySelector('.user-display-name');
  if (homePlayerName) {
    homePlayerName.textContent = newName;
  }
}
window.updatePlayerNameAcrossApp = updatePlayerNameAcrossApp;

function recordTriviaAnswerResult(isCorrect) {
  if (!state.stats) {
    state.stats = { totalQuestions: 0, correctAnswers: 0, maxStreak: 0, currentStreak: 0 };
  }
  state.stats.totalQuestions = (Number(state.stats.totalQuestions) || 0) + 1;
  if (isCorrect) {
    state.stats.correctAnswers = (Number(state.stats.correctAnswers) || 0) + 1;
    state.stats.currentStreak = (Number(state.stats.currentStreak) || 0) + 1;
    if (state.stats.currentStreak > (Number(state.stats.maxStreak) || 0)) {
      state.stats.maxStreak = state.stats.currentStreak;
    }
  } else {
    state.stats.currentStreak = 0;
  }
  if (window.state) {
    window.state.stats = { ...state.stats };
  }
  try {
    localStorage.setItem('retroquiz_stats', JSON.stringify({
      totalQuestions: state.stats.totalQuestions,
      correctAnswers: state.stats.correctAnswers,
      maxStreak: state.stats.maxStreak
    }));
  } catch (e) {}

  updateProfileStatsUI();

  // Guardar en Firestore si el usuario está conectado
  if (window.db && window.firestoreOps && window.state && window.state.userId) {
    try {
      const { doc, updateDoc } = window.firestoreOps;
      const userRef = doc(window.db, "usuarios", window.state.userId);
      updateDoc(userRef, {
        stats: {
          totalQuestions: state.stats.totalQuestions,
          correctAnswers: state.stats.correctAnswers,
          maxStreak: state.stats.maxStreak
        },
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn("Error actualizando stats en Firestore:", err));
    } catch (e) {}
  }
}
window.recordTriviaAnswerResult = recordTriviaAnswerResult;

function setupProfileUserFields() {
  const nameInput = document.getElementById('profileUsernameInput') || document.getElementById('profileUserNameInput');
  const editBtn = document.getElementById('btnEditUserName');
  const bioInput = document.getElementById('profileBioInput');

  // Sincronizar valores actuales
  const savedUsername = localStorage.getItem('retroquiz_username');
  const hasSavedName = (window.state && window.state.username) || (state && state.username) || savedUsername || '';
  const currentBio = (state && state.bio) || (window.state && window.state.bio) || localStorage.getItem('retroquiz_bio') || '';

  if (nameInput) {
    if (hasSavedName) {
      nameInput.value = hasSavedName;
    } else {
      nameInput.value = '';
    }
    nameInput.placeholder = "Introduce tu nombre de usuario...";
  }
  if (bioInput) {
    bioInput.value = currentBio;
    bioInput.placeholder = "Escribe algo sobre ti...";
  }

  const profileBadge = document.getElementById('profileBadge') || document.querySelector('.profile-badge');
  if (profileBadge) {
    const userXP = (window.state && typeof window.state.xp === 'number') ? window.state.xp : (state.xp !== undefined ? state.xp : (state.userScore || 0));
    profileBadge.innerText = `${getPlayerRank(userXP)} • ${userXP} XP`;
  }

  // Guardar nombre en change y blur
  if (nameInput && !nameInput.dataset.listenerAttached) {
    nameInput.dataset.listenerAttached = 'true';
    const saveName = async () => {
      const val = nameInput.value.trim();
      if (!val) {
        return;
      }
      nameInput.value = val;
      state.username = val;
      if (window.state) window.state.username = val;
      try {
        localStorage.setItem('retroquiz_username', val);
      } catch (err) {
        console.warn('Error saving username:', err);
      }

      // Actualizar inmediatamente en toda la app
      updatePlayerNameAcrossApp(val);

      // Actualizar en Firestore inmediatamente con updateDoc
      if (window.db && window.firestoreOps && window.state && window.state.userId) {
        try {
          const { doc, updateDoc } = window.firestoreOps;
          const userRef = doc(window.db, "usuarios", window.state.userId);
          await updateDoc(userRef, {
            username: val,
            updatedAt: new Date().toISOString()
          });
          console.log("Username actualizado en Firestore:", val);
          showRetroToast('¡Nombre de usuario actualizado!', '👤');
        } catch (err) {
          console.error("Error al actualizar username en Firestore:", err);
        }
      }
    };
    nameInput.addEventListener('change', saveName);
    nameInput.addEventListener('blur', saveName);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        nameInput.blur();
      }
    });
  }

  if (editBtn && nameInput && !editBtn.dataset.listenerAttached) {
    editBtn.dataset.listenerAttached = 'true';
    editBtn.addEventListener('click', () => {
      nameInput.focus();
      nameInput.select();
    });
  }

  // Guardar bio en change y blur
  if (bioInput && !bioInput.dataset.listenerAttached) {
    bioInput.dataset.listenerAttached = 'true';
    const saveBio = async () => {
      const val = bioInput.value.trim();
      state.bio = val;
      if (window.state) window.state.bio = val;
      try {
        localStorage.setItem('retroquiz_bio', val);
      } catch (err) {
        console.warn('Error saving bio:', err);
      }

      // Actualizar en Firestore inmediatamente con updateDoc
      if (window.db && window.firestoreOps && window.state && window.state.userId) {
        try {
          const { doc, updateDoc } = window.firestoreOps;
          const userRef = doc(window.db, "usuarios", window.state.userId);
          await updateDoc(userRef, {
            bio: val,
            updatedAt: new Date().toISOString()
          });
          console.log("Bio actualizada en Firestore:", val);
          showRetroToast('¡Biografía actualizada!', '📝');
        } catch (err) {
          console.error("Error al actualizar bio en Firestore:", err);
        }
      }
    };
    bioInput.addEventListener('change', saveBio);
    bioInput.addEventListener('blur', saveBio);
    bioInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        bioInput.blur();
      }
    });
  }
}

function setupAudioSettingsPersistence() {
  const toggleSound = document.getElementById('toggleSoundProfile');
  const toggleMusic = document.getElementById('toggleMusicProfile');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');

  // Cargar preferencias desde localStorage
  try {
    const savedSound = localStorage.getItem('retroquiz_sound_enabled');
    if (savedSound !== null) {
      state.sfxEnabled = savedSound === 'true';
    }
    const savedMusic = localStorage.getItem('retroquiz_music_enabled');
    if (savedMusic !== null) {
      state.musicEnabled = savedMusic === 'true';
    }
  } catch (err) {
    console.warn('Error reading audio settings from localStorage:', err);
  }

  // Reflejar estado en la UI
  if (toggleSound) toggleSound.checked = state.sfxEnabled;
  if (toggleMusic) toggleMusic.checked = state.musicEnabled;
  if (btnToggleSound) {
    btnToggleSound.classList.toggle('sound-active', state.sfxEnabled);
    if (soundIcon) soundIcon.innerText = state.sfxEnabled ? '🔊' : '🔇';
  }

  // Listener para Efectos de Sonido en Perfil
  toggleSound?.addEventListener('change', (e) => {
    state.sfxEnabled = e.target.checked;
    if (typeof SoundManager !== 'undefined') {
      if (SoundManager.isMuted === state.sfxEnabled) {
        SoundManager.toggleMute();
      }
    }
    try {
      localStorage.setItem('retroquiz_sound_enabled', String(state.sfxEnabled));
    } catch (err) {}
    if (btnToggleSound) {
      btnToggleSound.classList.toggle('sound-active', state.sfxEnabled);
      if (soundIcon) soundIcon.innerText = state.sfxEnabled ? '🔊' : '🔇';
    }
    if (state.sfxEnabled) playClickSound();
  });

  // Listener para Música en Perfil
  toggleMusic?.addEventListener('change', (e) => {
    state.musicEnabled = e.target.checked;
    try {
      localStorage.setItem('retroquiz_music_enabled', String(state.musicEnabled));
    } catch (err) {}
    if (typeof SoundManager !== 'undefined') {
      if (!state.musicEnabled) {
        SoundManager.stopAllBGM();
      } else if (window.state.currentView === '#homeView') {
        SoundManager.playBGM('menu');
      }
    }
  });
}

window.resetNoAds = function() {
  try {
    localStorage.removeItem('retroquiz_no_ads');
  } catch (err) {}
  applyNoAdsState(false);
  showRetroToast('Publicidad restaurada (modo gratuito)', 'ℹ️');
  console.log('✅ Compra de publicidad reiniciada con éxito.');
};
window.debugResetAds = window.resetNoAds;
window.updateUserAvatarAcrossApp = updateUserAvatarAcrossApp;
window.applyNoAdsState = applyNoAdsState;
window.showView = showView;

// =============================================================================
// MODAL DE PERFIL (#profileView / #profileModal)
// =============================================================================
function openProfileModal() {
  const p = document.getElementById('profileView');
  if (!p) return;

  setupProfileUserFields();
  updateProfileStatsUI();

  // Mantén visible #homeView de fondo si no hay otra vista abierta
  const homeView = document.getElementById('homeView');
  if (homeView && homeView.style.display === 'none') {
    const activeOtherView = document.querySelector('.screen-view.active-view:not(#profileView), .screen-view.active:not(#profileView)');
    if (!activeOtherView) {
      homeView.style.display = 'flex';
      homeView.classList.add('active-view', 'active');
    }
  }

  p.classList.remove('closing');
  p.style.display = 'flex';
  void p.offsetWidth; // Forzar reflow para animación suave scale(0.92) -> scale(1) y fade-in
  p.classList.add('open', 'active');
  playModalOpenSound();

  // Actualizar indicador visual en la barra inferior
  const tabPerfil = document.getElementById('tabPerfil');
  if (tabPerfil) {
    document.querySelectorAll('.bottom-nav .nav-tab').forEach(t => t.classList.remove('active'));
    tabPerfil.classList.add('active');
  }
}

function closeProfileModal() {
  const p = document.getElementById('profileView');
  if (!p || p.style.display === 'none' || p.classList.contains('closing')) return;

  p.classList.remove('open', 'active');
  p.classList.add('closing');
  playClickSound();

  // Si estamos en homeView, restaurar visualmente el tab de Inicio como activo sin alterar la vista
  const homeView = document.getElementById('homeView');
  if (homeView && homeView.style.display !== 'none') {
    document.querySelectorAll('.bottom-nav .nav-tab').forEach(t => t.classList.remove('active'));
    const tabInicio = document.getElementById('tabInicio');
    if (tabInicio) tabInicio.classList.add('active');
    if (window.state) window.state.activeTab = 'inicio';
  }

  // Salida suave (fade-out y scale a 0.92 en 200 ms) sin alterar la vista activa de #homeView
  setTimeout(() => {
    p.style.display = 'none';
    p.classList.remove('closing');
  }, 200);
}

window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;

// =============================================================================
// RECONEXIÓN DE EVENTOS DE PANTALLA DE PERFIL (#profileView)
// =============================================================================
function setupProfileNavigationEvents() {
  // 1. RECONECTAR EVENTOS DE APERTURA (JS):
  // En la barra de navegación inferior (.bottom-nav):
  document.querySelectorAll('.bottom-nav .nav-perfil, .bottom-nav [data-tab="perfil"], .btn-nav-profile, [data-tab="perfil"], #tabPerfil, #tabChallengesPerfil, #tabStorePerfil').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      openProfileModal();
    };
  });

  // Si hay un avatar clickeable en el Home (#homeView .avatar-container o similar)
  document.querySelectorAll('#homeView .avatar-container, #homeView .char-hombre-wrap, #homeView .char-mujer-wrap, #homeView .character-wrapper, #homeView .characters-stage').forEach(avatar => {
    avatar.style.cursor = 'pointer';
    avatar.setAttribute('title', 'Ver Perfil');
    avatar.onclick = (e) => {
      e.preventDefault();
      openProfileModal();
    };
  });

  // 2. BOTÓN DE CIERRE (✕) DENTRO DEL PERFIL:
  const btnCloseProfile = document.getElementById('btnCloseProfile') || document.querySelector('#profileView .close-modal-btn');
  if (btnCloseProfile) {
    btnCloseProfile.onclick = (e) => {
      e.preventDefault();
      closeProfileModal();
    };
  }

  // 3. CERRAR AL TOCAR FUERA EN EL OVERLAY:
  const profileOverlay = document.getElementById('profileView');
  if (profileOverlay) {
    profileOverlay.onclick = (e) => {
      if (e.target === profileOverlay) {
        closeProfileModal();
      }
    };
  }

  // 4. CERRAR CON TECLA ESCAPE:
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const p = document.getElementById('profileView');
      if (p && (p.classList.contains('open') || p.style.display === 'flex') && !p.classList.contains('closing')) {
        closeProfileModal();
      }
    }
  });
}

async function renderRankingUI() {
  const currentUsername = (window.state && window.state.username) || localStorage.getItem('retroquiz_username') || "Jugador";
  const userScore = (window.state && typeof window.state.xp === 'number') ? window.state.xp : (state.userScore || 0);

  // 1. Actualizar Tarjeta del Jugador Local ("TÚ")
  const userRankNameEl = document.getElementById('userRankName');
  if (userRankNameEl) {
    userRankNameEl.textContent = `${currentUsername} (Tú)`;
  }
  const rankingUserPts = document.getElementById('rankingUserPts');
  if (rankingUserPts) {
    rankingUserPts.innerText = `${userScore.toLocaleString()} pts`;
  }

  let usersList = [];

  // 2. Consulta a Firestore (colección "usuarios" ordenada por XP descendente)
  if (window.db && window.firestoreOps) {
    try {
      const { collection, getDocs, query, orderBy, limit } = window.firestoreOps;
      if (typeof getDocs === 'function' && typeof query === 'function' && typeof orderBy === 'function') {
        const usersRef = collection(window.db, "usuarios");
        const q = query(usersRef, orderBy("xp", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          const d = docSnap.data();
          usersList.push({
            uid: docSnap.id,
            username: d.username || 'Jugador',
            xp: typeof d.xp === 'number' ? d.xp : 0,
            coins: typeof d.coins === 'number' ? d.coins : 0
          });
        });
      }
    } catch (err) {
      console.warn("Error al consultar ranking de Firestore:", err);
    }
  }

  // Si el usuario local no está en la lista de la nube (offline o recién registrado), agregarlo
  const currentUid = (window.state && window.state.userId);
  const alreadyInList = usersList.some(u => (currentUid && u.uid === currentUid) || u.username === currentUsername);
  if (!alreadyInList) {
    usersList.push({
      uid: currentUid || 'local',
      username: currentUsername,
      xp: userScore,
      coins: state.coins || 50,
      isLocalUser: true
    });
  }

  // Ordenar de mayor a menor XP
  usersList.sort((a, b) => (b.xp - a.xp) || (b.coins - a.coins));

  // Posición real del usuario en la tabla
  const userIndex = usersList.findIndex(u => (currentUid && u.uid === currentUid) || u.username === currentUsername || u.isLocalUser);
  const userPosition = userIndex !== -1 ? (userIndex + 1) : 1;

  const userRankPosEl = document.getElementById('userRankPos');
  if (userRankPosEl) {
    userRankPosEl.textContent = `#${userPosition}`;
  }

  // 3. Renderizar Puestos del Podio (1, 2 y 3)
  const p1 = usersList[0] || { username: `${currentUsername}`, xp: userScore };
  const p2 = usersList[1] || { username: 'Lugar disponible', xp: 0 };
  const p3 = usersList[2] || { username: 'Lugar disponible', xp: 0 };

  const p1Name = document.querySelector('#podium1 .podium-name');
  const p1Score = document.querySelector('#podium1 .podium-score');
  if (p1Name) p1Name.textContent = p1.username;
  if (p1Score) p1Score.textContent = `${(p1.xp || 0).toLocaleString()} pts`;

  const p2Name = document.querySelector('#podium2 .podium-name');
  const p2Score = document.querySelector('#podium2 .podium-score');
  if (p2Name) p2Name.textContent = p2.username;
  if (p2Score) p2Score.textContent = `${(p2.xp || 0).toLocaleString()} pts`;

  const p3Name = document.querySelector('#podium3 .podium-name');
  const p3Score = document.querySelector('#podium3 .podium-score');
  if (p3Name) p3Name.textContent = p3.username;
  if (p3Score) p3Score.textContent = `${(p3.xp || 0).toLocaleString()} pts`;
}
window.renderRankingUI = renderRankingUI;

// =============================================================================
// 7. CONTROL DE MODALES INTERACTIVOS
// =============================================================================
function openModal(modalId) {
  if (modalId === 'profileView' || modalId === 'modalPerfil' || modalId === 'profileModal') {
    openProfileModal();
    return;
  }
  if (modalId === 'modalRanking') {
    if (typeof renderRankingUI === 'function') renderRankingUI();
  }
  if (modalId === 'sendChallengeModal') {
    const input = document.getElementById('inputSearchUserChallenge');
    if (input) input.value = '';
    const container = document.getElementById('searchResultsList') || document.getElementById('searchResultsChallenge');
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }
    const confirmBtn = document.getElementById('confirmSendChallengeBtn');
    if (confirmBtn) confirmBtn.style.display = 'none';
    if (window.state) window.state.selectedRival = null;
    if (state) state.selectedRival = null;
  }
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    playModalOpenSound();
  }
}

function closeModal(modalId) {
  if (modalId === 'profileView' || modalId === 'modalPerfil' || modalId === 'profileModal') {
    closeProfileModal();
    return;
  }
  if (modalId === 'sendChallengeModal') {
    const input = document.getElementById('inputSearchUserChallenge');
    if (input) input.value = '';
    const container = document.getElementById('searchResultsList') || document.getElementById('searchResultsChallenge');
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }
    const confirmBtn = document.getElementById('confirmSendChallengeBtn');
    if (confirmBtn) confirmBtn.style.display = 'none';
    if (window.state) window.state.selectedRival = null;
    if (state) state.selectedRival = null;
  }
  if (modalId === 'challengeOnboardingModal') {
    window._isManualHelpOpen = false;
  }
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    playClickSound();
    
    if (modalId === 'modalTienda' || modalId === 'modalPerfil') {
      const currentActiveView = document.querySelector('.screen-view.active');
      if (currentActiveView) {
        if (currentActiveView.id === 'challengesView') {
          setActiveTab('desafios');
        } else if (currentActiveView.id === 'storeView') {
          setActiveTab('tienda');
        } else {
          setActiveTab('inicio');
        }
      } else {
        setActiveTab('inicio');
      }
    }
  }
}

function showRetroToast(message, icon = '✨') {
  let toast = document.getElementById('retroToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'retroToast';
    toast.className = 'retro-toast';
    const container = document.getElementById('gameScreen') || document.body;
    container.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-text">${message}</span>`;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2300);
}

function updateCoinsDisplay(amountToAdd) {
  const coinEl = document.getElementById('userCoins');
  const storeUserCoins = document.getElementById('storeUserCoins');
  const rankingUserPts = document.getElementById('rankingUserPts');
  
  state.coins += amountToAdd;
  state.userScore += amountToAdd; // Sumar puntaje para desbloquear categorías
  
  if (coinEl) coinEl.innerText = state.coins.toLocaleString();
  if (storeUserCoins) storeUserCoins.innerText = state.coins.toLocaleString();
  if (rankingUserPts) rankingUserPts.innerText = `${state.coins.toLocaleString()} pts`;

  updateWheelCategoriesUI();
  renderCollectionCardsUI();
  updateStoreUI();

  const pill = document.getElementById('btnCoinPill');
  if (pill) {
    pill.style.transform = 'scale(1.15)';
    setTimeout(() => {
      pill.style.transform = '';
    }, 200);
  }

  playCoinSound();
}

function setActiveTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
}

function loadStoredPlayerProgress() {
  try {
    const savedXP = localStorage.getItem('retroquiz_xp');
    if (savedXP !== null) {
      const parsedXP = parseInt(savedXP, 10);
      if (!isNaN(parsedXP)) {
        state.userScore = parsedXP;
      }
    }
    const savedCoins = localStorage.getItem('retroquiz_coins');
    if (savedCoins !== null) {
      const parsedCoins = parseInt(savedCoins, 10);
      if (!isNaN(parsedCoins)) {
        state.coins = parsedCoins;
      }
    }

    const savedPacks = localStorage.getItem('retroquiz_unlocked_packs');
    if (savedPacks) {
      try {
        const parsedPacks = JSON.parse(savedPacks);
        if (Array.isArray(parsedPacks)) {
          state.unlockedPacks = parsedPacks;
          if (window.state) window.state.unlockedPacks = parsedPacks;
        }
      } catch (e) {}
    }

    const savedMastery = localStorage.getItem('retroquiz_pack_mastery');
    if (savedMastery) {
      try {
        const parsedMastery = JSON.parse(savedMastery);
        if (parsedMastery && typeof parsedMastery === 'object') {
          state.packMastery = parsedMastery;
          if (window.state) window.state.packMastery = parsedMastery;
        }
      } catch (e) {}
    }

    const profileBadge = document.getElementById('profileBadge') || document.querySelector('.profile-badge');
    if (profileBadge) {
      const userXP = (window.state && typeof window.state.xp === 'number') ? window.state.xp : (state.xp !== undefined ? state.xp : (state.userScore || 0));
      profileBadge.innerText = `${getPlayerRank(userXP)} • ${userXP} XP`;
    }

    const userCoinsEl = document.getElementById('userCoins');
    if (userCoinsEl) userCoinsEl.innerText = state.coins.toLocaleString();
    const userCoinsCol = document.getElementById('userCoinsCollection');
    if (userCoinsCol) userCoinsCol.innerText = state.coins.toLocaleString();
    const rankingUserPts = document.getElementById('rankingUserPts');
    if (rankingUserPts) rankingUserPts.innerText = `${state.userScore.toLocaleString()} pts`;
  } catch (err) {
    console.warn('Error loading player progress from localStorage:', err);
  }
}

function updateHUD() {
  const userCoinsEl = document.getElementById('userCoins');
  if (userCoinsEl) userCoinsEl.innerText = state.coins.toLocaleString();
  const userCoinsCol = document.getElementById('userCoinsCollection');
  if (userCoinsCol) userCoinsCol.innerText = state.coins.toLocaleString();
  const storeUserCoins = document.getElementById('storeUserCoins');
  if (storeUserCoins) storeUserCoins.innerText = state.coins.toLocaleString();
  const rankingUserPts = document.getElementById('rankingUserPts');
  if (rankingUserPts) rankingUserPts.innerText = `${state.userScore.toLocaleString()} pts`;
  const profileBadge = document.getElementById('profileBadge') || document.querySelector('.profile-badge');
  if (profileBadge) {
    const userXP = (window.state && typeof window.state.xp === 'number') ? window.state.xp : (state.xp !== undefined ? state.xp : (state.userScore || 0));
    profileBadge.innerText = `${getPlayerRank(userXP)} • ${userXP} XP`;
  }
}

function saveCoinsToCloud(nuevasMonedas) {
  if (typeof nuevasMonedas === 'number') {
    state.coins = nuevasMonedas;
  }
  try {
    localStorage.setItem('retroquiz_coins', String(state.coins));
  } catch (err) {}

  updateHUD();

  if (window.db && window.firestoreOps && window.state && window.state.userId) {
    try {
      const { doc, updateDoc } = window.firestoreOps;
      const userRef = doc(window.db, "usuarios", window.state.userId);
      updateDoc(userRef, {
        coins: state.coins,
        updatedAt: new Date().toISOString()
      }).catch(err => console.error("Error al actualizar coins en Firestore:", err));
    } catch (err) {
      console.error("Error al preparar saveCoinsToCloud:", err);
    }
  }
}
window.saveCoinsToCloud = saveCoinsToCloud;

function renderChallengesUI() {
  const container = document.getElementById('challengesCardsList');
  if (!container) return;

  const challenges = state.challenges || [];
  if (challenges.length === 0) {
    container.innerHTML = `
      <div class="empty-challenges-container" id="emptyChallengesContainer">
        <div class="empty-challenges-icon">⚔️</div>
        <p class="empty-challenges-title">No tienes desafíos pendientes</p>
        <p class="empty-challenges-sub">¡Elige un amigo y lánzale un reto!</p>
      </div>
    `;
  } else {
    const currentUid = window.state?.userId;
    const currentUsername = window.state?.username || localStorage.getItem('retroquiz_username') || 'Tú';
    const currentAvatar = window.state?.customAvatar || state.customAvatar || 'assets/pantalla_inicio/hombre.webp';

    container.innerHTML = challenges.map((ch, idx) => {
      const isCreator = (ch.fromUid === currentUid);
      const rivalName = isCreator ? (ch.toUsername || 'Rival') : (ch.fromUsername || 'Retador');
      const rivalAvatar = isCreator ? (ch.toAvatar || '🕹️') : (ch.fromAvatar || '👾');
      const isMyTurn = (ch.currentTurn === currentUid);
      const isCompleted = (ch.status === "completed" || ch.status === "finished");
      const roundLabel = (ch.round === 'desempate') ? 'Desempate' : `Ronda ${ch.round || 1}`;

      let statusHtml = '';
      let buttonHtml = '';

      if (isCompleted) {
        statusHtml = `<div class="status-indicator status-completed"><span class="status-check">🏆</span> Finalizado</div>`;
        buttonHtml = `<button class="challenge-play-btn challenge-btn-completed interactive-press" data-challenge-id="${ch.id}">VER RESULTADOS</button>`;
      } else if (isMyTurn) {
        statusHtml = `<div class="status-indicator status-your-turn"><span class="status-check">🔥</span> ¡Tu turno de atacar!</div>`;
        buttonHtml = `<button class="challenge-play-btn challenge-btn-turn interactive-press" data-challenge-id="${ch.id}">¡JUGAR! ⚔️</button>`;
      } else {
        statusHtml = `<div class="status-indicator status-waiting"><span class="status-clock">⏳</span> Esperando (${roundLabel})</div>`;
        buttonHtml = `<button class="challenge-play-btn challenge-btn-waiting" disabled><span class="btn-waiting-icon">🔥</span> ESPERANDO RIVAL...</button>`;
      }

      return `
        <div class="challenge-card anim-ch-card-${(idx % 3) + 1} interactive-press" data-challenge-id="${ch.id || idx}">
          <!-- FILA 1 (SUPERIOR - ENFRENTAMIENTO VS) -->
          <div class="card-vs-row">
            <div class="player-slot player-user">
              <div class="player-avatar-circle bg-purple">
                <img src="${currentAvatar}" alt="Usuario" class="challenge-user-avatar-img user-avatar-sync">
              </div>
              <span class="player-name">${currentUsername}</span>
            </div>

            <div class="vs-badge-container">
              <span class="vs-badge">VS</span>
            </div>

            <div class="player-slot player-rival">
              <span class="player-name">${rivalName}</span>
              <div class="player-avatar-circle bg-yellow">
                <span>${rivalAvatar}</span>
              </div>
            </div>
          </div>

          <!-- FILA 2 (INFERIOR - ESTADO Y ACCIÓN) -->
          <div class="card-action-row">
            <div class="card-status-info">
              ${statusHtml}
            </div>
            <div class="card-action-btn-wrap">
              ${buttonHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Conectar eventos a los botones ¡TU TURNO! ⚔️
    container.querySelectorAll('.challenge-btn-turn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else {
          playClickSound();
        }

        const chId = btn.getAttribute('data-challenge-id');
        const ch = (state.challenges || []).find(c => c.id === chId);
        if (!ch) return;

        const isCreator = (ch.fromUid === window.state?.userId);
        const rivalName = isCreator ? (ch.toUsername || 'Rival') : (ch.fromUsername || 'Retador');
        const rivalAvatar = isCreator ? (ch.toAvatar || '🕹️') : (ch.fromAvatar || '👾');
        const rivalUid = isCreator ? ch.toUid : ch.fromUid;

        const isTieBreaker = (ch.round === 'desempate');
        window.state.isChallengeMode = true;
        state.isChallengeMode = true;
        window.state.isTieBreaker = isTieBreaker;
        state.isTieBreaker = isTieBreaker;
        window.state.currentChallengeId = chId;
        state.currentChallengeId = chId;

        // Inyectar en el HUD "VS"
        const localName = window.state?.username || localStorage.getItem('retroquiz_username') || 'Tú';
        const localNameEl = document.querySelector('.duel-player-local .duel-player-name');
        if (localNameEl) localNameEl.innerText = localName;

        const localAvatarImg = document.getElementById('duelUserAvatarImg');
        if (localAvatarImg && (state.customAvatar || window.state?.customAvatar)) {
          localAvatarImg.src = state.customAvatar || window.state?.customAvatar;
        }

        setupDuelMatchUI(rivalName, rivalAvatar, ch.round || 1);
        state.currentDuel.challengeId = chId;
        state.currentDuel.rivalUid = rivalUid;
        state.currentDuel.rivalTotalScore = (ch.scores && ch.scores[rivalUid]?.totalScore) || (isCreator ? (ch.scores?.toScore || 0) : (ch.scores?.fromScore || 0));
        state.currentDuel.localTotalScore = (ch.scores && ch.scores[window.state?.userId]?.totalScore) || 0;
        state.currentDuel.chData = ch;

        // Hándicap si el rival dejó un ataque
        const handicapPlate = document.getElementById('duelHandicapPlate');
        const handicapTextEl = document.getElementById('duelHandicapText');
        if (ch.activeAttack && ch.activeAttack.attackerUid !== window.state?.userId) {
          if (handicapTextEl) {
            handicapTextEl.innerHTML = `<strong>${rivalName}</strong> ha activado: <strong>${ch.activeAttack.name || '-5 segundos por respuesta'}</strong>`;
          }
          if (handicapPlate) handicapPlate.style.display = 'flex';
        } else {
          if (handicapPlate) handicapPlate.style.display = 'none';
        }

        navigateToScreen('challengeMatchView');
      });
    });

    // Conectar eventos a los botones VER RESULTADO 🏆
    container.querySelectorAll('.challenge-btn-completed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else {
          playClickSound();
        }

        const chId = btn.getAttribute('data-challenge-id');
        const ch = (state.challenges || []).find(c => c.id === chId);
        if (!ch) return;
        openCompletedChallengeResult(ch);
      });
    });
  }

  if (typeof updatePendingChallengesBadge === 'function') {
    updatePendingChallengesBadge();
  }

  // Evaluación del modal explicativo de onboarding (#challengeOnboardingModal)
  if (typeof checkChallengeOnboardingTrigger === 'function') {
    checkChallengeOnboardingTrigger();
  }
}
window.renderChallengesUI = renderChallengesUI;

function openCompletedChallengeResult(ch) {
  const currentUid = window.state?.userId;
  const isCreator = (ch.fromUid === currentUid);
  const rivalName = isCreator ? (ch.toUsername || 'Rival') : (ch.fromUsername || 'Retador');
  const rivalAvatar = isCreator ? (ch.toAvatar || '🕹️') : (ch.fromAvatar || '👾');
  const rivalUid = isCreator ? ch.toUid : ch.fromUid;

  const currentUsername = window.state?.username || localStorage.getItem('retroquiz_username') || 'Tú';
  const currentAvatar = window.state?.customAvatar || state.customAvatar || 'assets/pantalla_inicio/hombre.webp';

  const myScores = (ch.scores && ch.scores[currentUid]) || {
    coins: 0,
    xp: isCreator ? (ch.scores?.fromScore || 0) : (ch.scores?.toScore || 0),
    totalScore: isCreator ? (ch.scores?.fromScore || 0) : (ch.scores?.toScore || 0)
  };
  const rivalScores = (ch.scores && ch.scores[rivalUid]) || {
    coins: 0,
    xp: isCreator ? (ch.scores?.toScore || 0) : (ch.scores?.fromScore || 0),
    totalScore: isCreator ? (ch.scores?.toScore || 0) : (ch.scores?.fromScore || 0)
  };

  const localScore = myScores.totalScore || ((myScores.coins || 0) + (myScores.xp || 0));
  const rivalScore = rivalScores.totalScore || ((rivalScores.coins || 0) + (rivalScores.xp || 0));

  state.currentDuel = {
    challengeId: ch.id,
    rivalUid: rivalUid,
    rivalName: rivalName,
    rivalAvatar: rivalAvatar,
    currentRound: 3,
    localTotalScore: localScore,
    rivalTotalScore: rivalScore,
    isCompletedDuel: true,
    chData: ch
  };

  window.state.currentChallengeId = ch.id;
  state.currentChallengeId = ch.id;

  const localNameEl = document.querySelector('.duel-player-local .duel-player-name');
  if (localNameEl) localNameEl.innerText = currentUsername;
  const localAvatarImg = document.getElementById('duelUserAvatarImg');
  if (localAvatarImg && currentAvatar) localAvatarImg.src = currentAvatar;

  setupDuelMatchUI(rivalName, rivalAvatar, 3);
  state.currentDuel.chData = ch;
  state.currentDuel.challengeId = ch.id;
  state.currentDuel.rivalUid = rivalUid;
  state.currentDuel.localTotalScore = localScore;
  state.currentDuel.rivalTotalScore = rivalScore;
  state.currentDuel.isCompletedDuel = true;
  showChallengeDuelResults(3, myScores.hits !== undefined ? myScores.hits : 4, true);
}
window.openCompletedChallengeResult = openCompletedChallengeResult;


async function syncUserProfileWithCloud(uid) {
  if (!window.db || !window.firestoreOps) return;
  const { doc, getDoc, setDoc } = window.firestoreOps;
  const userRef = doc(window.db, "usuarios", uid);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const defaultUsername = localStorage.getItem('retroquiz_username') || ("Jugador_" + uid.slice(0, 4));
      const defaultBio = localStorage.getItem('retroquiz_bio') || "¡Listo para competir!";
      const initialData = {
        username: defaultUsername,
        bio: defaultBio,
        coins: 0,
        xp: 0,
        stats: {
          totalQuestions: Number(state.stats?.totalQuestions) || 0,
          correctAnswers: Number(state.stats?.correctAnswers) || 0,
          maxStreak: Number(state.stats?.maxStreak) || 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, initialData);
      state.coins = 0;
      state.xp = 0;
      state.userScore = 0;
      state.username = defaultUsername;
      state.bio = defaultBio;
      state.challenges = [];
      if (window.state) {
        window.state.coins = 0;
        window.state.xp = 0;
        window.state.userScore = 0;
        window.state.username = defaultUsername;
        window.state.bio = defaultBio;
        window.state.challenges = [];
      }
      localStorage.setItem('retroquiz_username', defaultUsername);
      localStorage.setItem('retroquiz_bio', defaultBio);
      console.log("Perfil de usuario inicial limpio creado en Firestore para:", uid);
    } else {
      const data = snap.data();
      if (typeof data.coins === "number") {
        state.coins = data.coins;
        if (window.state) window.state.coins = data.coins;
      }
      if (typeof data.xp === "number") {
        state.userScore = data.xp;
        state.xp = data.xp;
        if (window.state) {
          window.state.userScore = data.xp;
          window.state.xp = data.xp;
        }
      }
      if (data.username) {
        state.username = data.username;
        if (window.state) window.state.username = data.username;
        localStorage.setItem('retroquiz_username', data.username);
      }
      if (data.bio) {
        state.bio = data.bio;
        if (window.state) window.state.bio = data.bio;
        localStorage.setItem('retroquiz_bio', data.bio);
      }
      if (data.stats && typeof data.stats === 'object') {
        if (!state.stats) state.stats = { totalQuestions: 0, correctAnswers: 0, maxStreak: 0, currentStreak: 0 };
        state.stats.totalQuestions = Number(data.stats.totalQuestions) || 0;
        state.stats.correctAnswers = Number(data.stats.correctAnswers) || 0;
        state.stats.maxStreak = Number(data.stats.maxStreak) || 0;
        if (window.state) {
          window.state.stats = { ...state.stats };
        }
        try {
          localStorage.setItem('retroquiz_stats', JSON.stringify(state.stats));
        } catch (e) {}
      }
      if (Array.isArray(data.challenges)) {
        state.challenges = data.challenges;
      } else {
        state.challenges = [];
      }
      if (Array.isArray(data.unlockedPacks)) {
        state.unlockedPacks = data.unlockedPacks;
        if (window.state) window.state.unlockedPacks = data.unlockedPacks;
        try { localStorage.setItem('retroquiz_unlocked_packs', JSON.stringify(data.unlockedPacks)); } catch (e) {}
      }
      if (data.packMastery && typeof data.packMastery === 'object') {
        state.packMastery = data.packMastery;
        if (window.state) window.state.packMastery = data.packMastery;
        try { localStorage.setItem('retroquiz_pack_mastery', JSON.stringify(data.packMastery)); } catch (e) {}
      }
      console.log("Perfil de usuario obtenido de Firestore:", data);
    }
    updateHUD();
    renderChallengesUI();
    renderCollectionCardsUI();
    updateStoreUI();
    setupProfileUserFields();
    updateProfileStatsUI();
    if (typeof initRealtimeChallengesListener === 'function') {
      initRealtimeChallengesListener(uid);
    }
  } catch (err) {
    console.error("Error al sincronizar perfil con Firestore:", err);
  }
}
window.syncUserProfileWithCloud = syncUserProfileWithCloud;

// =============================================================================
// 6. INICIALIZACIÓN Y EVENT LISTENERS
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Cargar progreso del jugador (XP y monedas) desde localStorage
  loadStoredPlayerProgress();

  // Sincronización del Router Hash
  window.addEventListener('hashchange', () => {
    handleHashChange();
  });

  // Inicializar hash si está vacío
  if (!window.location.hash || !routesMap[window.location.hash]) {
    window.location.hash = '#home';
  } else {
    handleHashChange();
  }

  updateWheelCategoriesUI();
  renderCollectionCardsUI();
  updateShotsUI();
  setupProfileAvatar();
  setupNoAdsFeature();
  setupProfileUserFields();
  updateProfileStatsUI();
  setupAudioSettingsPersistence();
  setupProfileNavigationEvents();
  updatePendingChallengesBadge();

  // --- NAVEGACIÓN PRINCIPAL ---

  // Botón JUGAR en la Home -> Abre la pantalla de Ruleta (WheelSelectionScreen)
  const btnJugar = document.getElementById('btnJugar') || document.querySelector('#homeView .btn-jugar, #homeView button');
  if (btnJugar) {
    btnJugar.onclick = () => {
      window.state.isChallengeMode = false;
      state.isChallengeMode = false;
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('botones.wav', 0.60);
      } else {
        playClickSound();
      }
      navigateToScreen('wheelView');
    };
  }

  // Botón Flecha Retorno (<) en Ruleta -> Regresa al Home
  const btnBackToHome = document.getElementById('btnBackToHome') || document.querySelector('#wheelView button, #wheelView .btn-back');
  if (btnBackToHome) {
    btnBackToHome.onclick = () => {
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('botones.wav', 0.60);
      } else {
        playClickSound();
      }
      navigateToScreen('homeView');
    };
  }

  // Botón Información ('i') en Ruleta -> Abre Modal de Reglas
  const btnWheelInfo = document.getElementById('btnWheelInfo');
  if (btnWheelInfo) {
    btnWheelInfo.addEventListener('click', () => {
      openModal('modalRulesInfo');
    });
  }

  // Botón GIRAR Ruleta (Modo Clásico)
  const btnGirarWheel = document.getElementById('btnGirarWheel');
  if (btnGirarWheel) {
    btnGirarWheel.addEventListener('click', () => {
      if (state.wheel.isSpinning || state.wheel.shots <= 0) return;
      window.state.isChallengeMode = false;
      state.isChallengeMode = false;
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('ruleta.mp3', 0.70);
      }
      spinWheel();
    });
  }

  // Botón Anuncio Recompensado (+1 TIRO EXTRA)
  const btnWatchAd = document.getElementById('btnWatchAd');
  if (btnWatchAd) {
    btnWatchAd.addEventListener('click', () => {
      watchRewardedAd();
    });
  }

  // Botón Mi Coleccion en Ruleta -> Abre Pantalla #collectionView
  const btnVerProgreso = document.getElementById('btnVerProgreso');
  if (btnVerProgreso) {
    btnVerProgreso.addEventListener('click', () => {
      playClickSound();
      navigateToScreen('collectionView');
    });
  }

  // Botón Volver (<) en Pantalla #collectionView -> Regresa a #wheelView
  const btnBackFromCollection = document.getElementById('btnBackFromCollection');
  if (btnBackFromCollection) {
    btnBackFromCollection.addEventListener('click', () => {
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('botones.wav', 0.60);
      } else {
        playClickSound();
      }
      navigateToScreen('wheelView');
    });
  }

  // Botón Desbloqueo Completo en #collectionView ($us2.99)
  const btnUnlockAllCollection = document.getElementById('btnUnlockAllCollection');
  if (btnUnlockAllCollection) {
    btnUnlockAllCollection.addEventListener('click', () => {
      desbloquearTodasLasColecciones();
    });
  }

  // Botón Dev: Desbloquear todas las categorías para pruebas
  const btnUnlockAllDev = document.getElementById('btnUnlockAllDev');
  if (btnUnlockAllDev) {
    btnUnlockAllDev.addEventListener('click', () => {
      state.allCategoriesUnlocked = true;
      updateWheelCategoriesUI();
      playSuccessSound();
      btnUnlockAllDev.innerText = '✓ ¡Todas Desbloqueadas!';
    });
  }

  // Botones para desbloquear categorías individuales en el modal de progreso
  document.querySelectorAll('.btn-unlock-cat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = e.currentTarget.dataset.unlock;
      const targetThreshold = state.categoryThresholds[cat] || 0;
      if (state.userScore < targetThreshold) {
        state.userScore = targetThreshold;
        updateWheelCategoriesUI();
        playSuccessSound();
      }
    });
  });

  // --- BOTONES HOME SECUNDARIOS & MODALES ---
  const btnDesafios = document.getElementById('btnDesafios');
  if (btnDesafios) {
    btnDesafios.addEventListener('click', () => {
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('botones.wav', 0.60);
      } else {
        playClickSound();
      }
      navigateToScreen('challengesView');
    });
  }

  // --- NAVEGACIÓN Y CONTROLES DE PANTALLA DE DESAFÍOS (#challengesView) ---
  const btnChallengesBack = document.getElementById('btnChallengesBack');
  if (btnChallengesBack) {
    btnChallengesBack.addEventListener('click', () => {
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('botones.wav', 0.60);
      } else {
        playClickSound();
      }
      navigateToScreen('homeView');
    });
  }

  // Selector de Pestañas (Tabs) y Modales en #challengesView
  const tabAceptarDesafio = document.getElementById('tabAceptarDesafio');
  if (tabAceptarDesafio) {
    tabAceptarDesafio.addEventListener('click', () => {
      document.querySelectorAll('.challenge-tab-pill').forEach(t => t.classList.remove('active'));
      tabAceptarDesafio.classList.add('active');
      openModal('acceptChallengeModal');
    });
  }

  const tabEnviarDesafio = document.getElementById('tabEnviarDesafio');
  if (tabEnviarDesafio) {
    tabEnviarDesafio.addEventListener('click', () => {
      document.querySelectorAll('.challenge-tab-pill').forEach(t => t.classList.remove('active'));
      tabEnviarDesafio.classList.add('active');
      openModal('sendChallengeModal');
    });
  }

  // --- BARRA DE NAVEGACIÓN INFERIOR EN PANTALLA DE DESAFÍOS (#challengesView) ---
  document.getElementById('tabChallengesInicio')?.addEventListener('click', () => {
    playClickSound();
    navigateToScreen('homeView');
  });

  document.getElementById('tabChallengesDesafios')?.addEventListener('click', () => {
    playClickSound();
    const scrollContainer = document.querySelector('#challengesView .challenges-scroll-container') || document.querySelector('#challengesView .challenges-content-wrapper');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('tabChallengesTienda')?.addEventListener('click', () => {
    playCoinSound();
    navigateToScreen('storeView');
  });

  document.getElementById('tabChallengesPerfil')?.addEventListener('click', (e) => {
    e.preventDefault();
    openProfileModal();
  });

  // --- LÓGICA DE SINCRONIZACIÓN Y TIEMPO REAL DE DESAFÍOS ---
  let unsubscribeChallengesTo = null;
  let unsubscribeChallengesFrom = null;

  function initRealtimeChallengesListener(userId) {
    if (!userId || !window.db || !window.firestoreOps) return;
    if (unsubscribeChallengesTo) {
      try { unsubscribeChallengesTo(); } catch (e) {}
      unsubscribeChallengesTo = null;
    }
    if (unsubscribeChallengesFrom) {
      try { unsubscribeChallengesFrom(); } catch (e) {}
      unsubscribeChallengesFrom = null;
    }

    const { collection, query, where, onSnapshot, doc, updateDoc } = window.firestoreOps;
    if (!onSnapshot || !query || !where) return;

    try {
      const desafiosRef = collection(window.db, "desafios");
      const qTo = query(desafiosRef, where("toUid", "==", userId));
      const qFrom = query(desafiosRef, where("fromUid", "==", userId));

      const toChallengesMap = new Map();
      const fromChallengesMap = new Map();

      const updateAllChallengesRealtime = () => {
        const allMap = new Map([...fromChallengesMap, ...toChallengesMap]);
        const allList = Array.from(allMap.values());

        // 1. Desafíos entrantes pendientes de aceptar
        // Solo cuentan si toUid === userId, status === "pending", y el retador ya jugó su ronda inicial (currentTurn === userId)
        const pendingChallenges = allList.filter(ch => 
          ch.toUid === userId && 
          ch.status === "pending" && 
          ch.currentTurn === userId
        );

        const count = pendingChallenges.length;

        // Badge flotante en el botón central "DESAFÍOS" del Home
        const homeBadge = document.getElementById('homeDesafiosBadge');
        if (homeBadge) {
          if (count > 0) {
            homeBadge.textContent = `+${count}`;
            homeBadge.style.display = 'flex';
          } else {
            homeBadge.style.display = 'none';
          }
        }

        // Badge en la pestaña "Aceptar Desafío" dentro de #challengesView
        const tabBadge = document.querySelector('#tabAceptarDesafio .tab-notification-badge');
        if (tabBadge) {
          if (count > 0) {
            tabBadge.textContent = `+${count}`;
            tabBadge.style.display = '';
          } else {
            tabBadge.style.display = 'none';
          }
        }

        // Renderizado de solicitudes en #acceptChallengeModal
        const acceptList = document.getElementById('acceptChallengeList');
        const emptyMsg = document.getElementById('emptyPendingChallenges');

        if (acceptList) {
          if (count === 0) {
            acceptList.innerHTML = '';
            if (emptyMsg) emptyMsg.style.display = 'block';
          } else {
            if (emptyMsg) emptyMsg.style.display = 'none';
            acceptList.innerHTML = pendingChallenges.map(ch => `
              <div class="challenge-request-row" data-challenge-id="${ch.id}" data-user="${ch.fromUsername || 'Retador'}">
                <div class="challenger-info">
                  <div class="challenger-avatar bg-purple">
                    <span>${ch.fromAvatar || '👾'}</span>
                  </div>
                  <div class="challenger-details">
                    <span class="challenger-name">${ch.fromUsername || 'Retador'}</span>
                    <span class="challenger-tag">¡Te ha lanzado un reto!</span>
                  </div>
                </div>
                <div class="request-actions">
                  <button class="btn-req-action btn-req-accept interactive-press" data-challenge-id="${ch.id}" data-from="${ch.fromUsername || 'el retador'}" title="Aceptar desafío">
                    <span>✓</span>
                  </button>
                  <button class="btn-req-action btn-req-reject interactive-press" data-challenge-id="${ch.id}" data-from="${ch.fromUsername || 'el retador'}" title="Rechazar desafío">
                    <span>✕</span>
                  </button>
                </div>
              </div>
            `).join('');

            // Listeners para Aceptar retos (Requirement 2)
            acceptList.querySelectorAll('.btn-req-accept').forEach(btn => {
              btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const chId = btn.getAttribute('data-challenge-id');
                const ch = pendingChallenges.find(c => c.id === chId) || allMap.get(chId);
                if (!ch) return;

                try {
                  const challengeRef = doc(window.db, "desafios", chId);
                  // 1. Actualiza el estado en Firestore a: status: "active", currentTurn: window.state.userId
                  await updateDoc(challengeRef, {
                    status: "active",
                    currentTurn: window.state.userId,
                    acceptedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });

                  playSuccessSound();
                  showRetroToast(`¡Desafío aceptado contra ${ch.fromUsername || 'el retador'}!`, '⚔️');

                  // 2. Cierra inmediatamente el modal #acceptChallengeModal
                  closeModal('acceptChallengeModal');

                  // 3. Marca banderas globales
                  window.state.isChallengeMode = true;
                  state.isChallengeMode = true;
                  window.state.currentChallengeId = chId;
                  state.currentChallengeId = chId;

                  // 4. Inyecta los avatares y nombres reales de ambos contendientes en el HUD "VS"
                  const localName = window.state.username || localStorage.getItem('retroquiz_username') || 'Tú';
                  const localNameEl = document.querySelector('.duel-player-local .duel-player-name');
                  if (localNameEl) localNameEl.innerText = localName;

                  const localAvatarImg = document.getElementById('duelUserAvatarImg');
                  if (localAvatarImg && (state.customAvatar || window.state.customAvatar)) {
                    localAvatarImg.src = state.customAvatar || window.state.customAvatar;
                  }

                  const rivalName = ch.fromUsername || 'Retador';
                  const rivalAvatar = ch.fromAvatar || '👾';
                  setupDuelMatchUI(rivalName, rivalAvatar, ch.round || 1);
                  state.currentDuel.challengeId = chId;
                  state.currentDuel.rivalUid = ch.fromUid;
                  state.currentDuel.rivalTotalScore = (ch.scores && ch.scores[ch.fromUid]?.totalScore) || (ch.scores?.fromScore || 0);
                  state.currentDuel.localTotalScore = (ch.scores && ch.scores[window.state?.userId]?.totalScore) || 0;
                  state.currentDuel.chData = ch;

                  // Configuración de Hándicap si el retador activó un ataque
                  const handicapPlate = document.getElementById('duelHandicapPlate');
                  const handicapTextEl = document.getElementById('duelHandicapText');
                  if (ch.activeAttack) {
                    if (handicapTextEl) {
                      handicapTextEl.innerHTML = `<strong>${rivalName}</strong> ha activado: <strong>${ch.activeAttack.name || '-5 segundos por respuesta'}</strong>`;
                    }
                    if (handicapPlate) handicapPlate.style.display = 'flex';
                  } else {
                    if (handicapPlate) handicapPlate.style.display = 'none';
                  }

                  // 5. Oculta #challengesView y muestra directamente la pantalla de ruleta versus (#challengeMatchView)
                  navigateToScreen('challengeMatchView');
                } catch (err) {
                  console.error("Error aceptando desafío:", err);
                  showRetroToast('Error al aceptar desafío', '⚠️');
                }
              });
            });

            // Listeners para Rechazar retos
            acceptList.querySelectorAll('.btn-req-reject').forEach(btn => {
              btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const chId = btn.getAttribute('data-challenge-id');
                try {
                  const challengeRef = doc(window.db, "desafios", chId);
                  await updateDoc(challengeRef, {
                    status: "rejected",
                    rejectedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                  playClickSound();
                  showRetroToast('Desafío rechazado.', '👋');
                } catch (err) {
                  console.error("Error rechazando desafío:", err);
                }
              });
            });
          }
        }

        // 2. Partidas activas y finalizadas ("Partidas activas (¡continúa!)")
        // Partidas donde status === "active" | "completed" | ("pending" para creador tras jugar R1)
        const activeMatches = allList.filter(ch => 
          (ch.status === "active" || ch.status === "completed" || (ch.status === "pending" && ch.creatorRoundCompleted && ch.fromUid === userId)) &&
          ch.status !== "rejected"
        );

        state.challenges = activeMatches;
        state.pendingChallenges = pendingChallenges;
        state.allChallengesList = allList;
        if (window.state) {
          window.state.challenges = activeMatches;
          window.state.pendingChallenges = pendingChallenges;
          window.state.allChallengesList = allList;
        }
        renderChallengesUI();
      };

      unsubscribeChallengesTo = onSnapshot(qTo, (snapshot) => {
        toChallengesMap.clear();
        snapshot.forEach((docSnap) => {
          toChallengesMap.set(docSnap.id, {
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        updateAllChallengesRealtime();
      }, (err) => {
        console.warn("Error en onSnapshot qTo desafíos:", err);
      });

      unsubscribeChallengesFrom = onSnapshot(qFrom, (snapshot) => {
        fromChallengesMap.clear();
        snapshot.forEach((docSnap) => {
          fromChallengesMap.set(docSnap.id, {
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        updateAllChallengesRealtime();
      }, (err) => {
        console.warn("Error en onSnapshot qFrom desafíos:", err);
      });

    } catch (err) {
      console.error("Error iniciando escucha de desafíos en tiempo real:", err);
    }
  }
  window.initRealtimeChallengesListener = initRealtimeChallengesListener;

  // Si ya existe sesión activa, inicializar escucha
  if (window.state && window.state.userId) {
    initRealtimeChallengesListener(window.state.userId);
  }

  function updatePendingChallengesBadge() {
    const remainingRows = document.querySelectorAll('#acceptChallengeList .challenge-request-row');
    const count = remainingRows.length;

    const homeBadge = document.getElementById('homeDesafiosBadge');
    if (homeBadge) {
      homeBadge.textContent = `+${count}`;
      homeBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    const tabBadge = document.querySelector('#tabAceptarDesafio .tab-notification-badge');
    if (tabBadge) {
      tabBadge.textContent = `+${count}`;
      tabBadge.style.display = count > 0 ? '' : 'none';
    }

    const emptyMsg = document.getElementById('emptyPendingChallenges');
    if (emptyMsg) {
      emptyMsg.style.display = count === 0 ? 'block' : 'none';
    }
  }
  window.updatePendingChallengesBadge = updatePendingChallengesBadge;

  // --- BÚSQUEDA DE JUGADORES EN FIRESTORE (#sendChallengeModal) ---
  async function searchUsersForChallenge(term) {
    const container = document.getElementById('searchResultsList') || document.getElementById('searchResultsChallenge');
    const confirmBtn = document.getElementById('confirmSendChallengeBtn');
    if (!container) return;

    // Resetear selección previa
    if (window.state) window.state.selectedRival = null;
    if (state) state.selectedRival = null;
    if (confirmBtn) confirmBtn.style.display = 'none';

    container.style.display = 'block';

    if (!window.db || !window.firestoreOps) {
      container.innerHTML = '<div class="search-results-empty-msg">Conectando a base de datos...</div>';
      return;
    }

    const { collection, getDocs } = window.firestoreOps;
    container.innerHTML = '<div class="search-results-empty-msg">Buscando jugadores...</div>';

    try {
      const usersRef = collection(window.db, "usuarios");
      const snapshot = await getDocs(usersRef);
      const currentUid = window.state?.userId;

      const matches = [];
      snapshot.forEach(docSnap => {
        const u = docSnap.data();
        const uid = docSnap.id;
        if (uid === currentUid) return; // Excluir al propio jugador actual
        const username = (u.username || '').trim();
        if (username.toLowerCase().includes(term.toLowerCase())) {
          matches.push({
            id: uid,
            username: username,
            xp: u.xp || 0,
            bio: u.bio || 'Jugador Retro',
            avatar: u.avatar || '🕹️'
          });
        }
      });

      if (matches.length === 0) {
        container.innerHTML = '<div class="search-results-empty-msg">No se encontró a nadie con ese nombre</div>';
        return;
      }

      container.innerHTML = matches.map((user, idx) => {
        const isImg = typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('assets/'));
        const avatarHtml = isImg
          ? `<img src="${user.avatar}" alt="${user.username}">`
          : `<span>${user.avatar || '🕹️'}</span>`;
        const subtitle = user.bio && user.bio.trim() ? user.bio.trim() : 'Jugador Retro';

        return `
          <div class="user-search-row interactive-press" data-user-index="${idx}" data-rival-id="${user.id}">
            <div class="search-row-avatar">
              ${avatarHtml}
            </div>
            <div class="search-row-info">
              <span class="search-row-username">${user.username}</span>
              <span class="search-row-subtitle">${subtitle}</span>
            </div>
            <div class="search-row-check">✓</div>
          </div>
        `;
      }).join('');

      // Interacción de selección por fila (.user-search-row)
      const rows = container.querySelectorAll('.user-search-row');
      rows.forEach(row => {
        row.addEventListener('click', () => {
          if (typeof playClickSound === 'function') playClickSound();
          rows.forEach(r => r.classList.remove('selected'));
          row.classList.add('selected');

          const idx = parseInt(row.getAttribute('data-user-index'), 10);
          const selectedUser = matches[idx];
          if (selectedUser) {
            if (window.state) window.state.selectedRival = selectedUser;
            if (state) state.selectedRival = selectedUser;
            if (confirmBtn) {
              confirmBtn.style.display = 'flex';
              confirmBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        });
      });
    } catch (err) {
      console.error("Error buscando usuarios para reto:", err);
      container.innerHTML = '<div class="search-results-empty-msg">Error al buscar jugadores</div>';
    }
  }

  // --- CREACIÓN DEL RETO EN LA COLECCIÓN "desafios" (Requirement 1 & 5) ---
  async function sendChallengeToUser(rival) {
    if (!window.db || !window.firestoreOps || !window.state?.userId) {
      showRetroToast('Inicia sesión para enviar desafíos', '⚠️');
      return;
    }

    const { collection, addDoc } = window.firestoreOps;
    const currentUsername = window.state.username || localStorage.getItem('retroquiz_username') || "Jugador";
    const currentAvatar = window.state.customAvatar || state.customAvatar || 'assets/pantalla_inicio/hombre.webp';

    try {
      const desafiosRef = collection(window.db, "desafios");
      const docRef = await addDoc(desafiosRef, {
        fromUid: window.state.userId,
        fromUsername: currentUsername,
        fromAvatar: currentAvatar,
        toUid: rival.id,
        toUsername: rival.username,
        toAvatar: rival.avatar || '🕹️',
        status: "pending",
        currentTurn: window.state.userId, // El retador arranca jugando su Ronda 1
        round: 1,
        creatorRoundCompleted: false,
        scores: {
          fromScore: 0,
          fromHits: 0,
          toScore: 0,
          toHits: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      playSuccessSound();
      showRetroToast(`¡Desafío iniciado contra ${rival.username}! Gira la ruleta ⚔️`, '⚔️');
      closeModal('sendChallengeModal');

      const searchInput = document.getElementById('inputSearchUserChallenge');
      if (searchInput) searchInput.value = '';
      const container = document.getElementById('searchResultsList') || document.getElementById('searchResultsChallenge');
      if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
      }
      const confirmBtn = document.getElementById('confirmSendChallengeBtn');
      if (confirmBtn) confirmBtn.style.display = 'none';
      if (window.state) window.state.selectedRival = null;
      if (state) state.selectedRival = null;

      // Redirige al retador de inmediato a #challengeMatchView
      window.state.isChallengeMode = true;
      state.isChallengeMode = true;
      window.state.currentChallengeId = docRef.id;
      state.currentChallengeId = docRef.id;

      // Inyectar contendientes en el HUD "VS"
      const localNameEl = document.querySelector('.duel-player-local .duel-player-name');
      if (localNameEl) localNameEl.innerText = currentUsername;
      const localAvatarImg = document.getElementById('duelUserAvatarImg');
      if (localAvatarImg && currentAvatar) localAvatarImg.src = currentAvatar;

      setupDuelMatchUI(rival.username, rival.avatar || '🕹️', 1);
      state.currentDuel.challengeId = docRef.id;
      state.currentDuel.rivalUid = rival.id;

      // Ocultar hándicap inicial para la ronda 1 del retador
      const handicapPlate = document.getElementById('duelHandicapPlate');
      if (handicapPlate) handicapPlate.style.display = 'none';

      navigateToScreen('challengeMatchView');
    } catch (err) {
      console.error("Error enviando desafío:", err);
      showRetroToast('Error al enviar el desafío', '⚠️');
    }
  }
  window.sendChallengeToUser = sendChallengeToUser;

  // Botón de Confirmación de Reto (#confirmSendChallengeBtn)
  const confirmSendChallengeBtn = document.getElementById('confirmSendChallengeBtn');
  if (confirmSendChallengeBtn && !confirmSendChallengeBtn.dataset.listenerAttached) {
    confirmSendChallengeBtn.dataset.listenerAttached = 'true';
    confirmSendChallengeBtn.addEventListener('click', () => {
      const selectedRival = window.state?.selectedRival || state?.selectedRival;
      if (selectedRival) {
        sendChallengeToUser(selectedRival);
      } else {
        showRetroToast('Selecciona a un jugador de la lista', '⚠️');
      }
    });
  }

  // Eventos de búsqueda interactiva en #sendChallengeModal
  const inputSearchUserChallenge = document.getElementById('inputSearchUserChallenge');
  if (inputSearchUserChallenge) {
    let searchDebounceTimer = null;
    const handleSearch = () => {
      clearTimeout(searchDebounceTimer);
      const term = inputSearchUserChallenge.value.trim();
      const container = document.getElementById('searchResultsList') || document.getElementById('searchResultsChallenge');
      const confirmBtn = document.getElementById('confirmSendChallengeBtn');
      if (term.length < 2) {
        if (container) {
          container.innerHTML = '';
          container.style.display = 'none';
        }
        if (confirmBtn) confirmBtn.style.display = 'none';
        if (window.state) window.state.selectedRival = null;
        if (state) state.selectedRival = null;
        return;
      }
      searchDebounceTimer = setTimeout(() => {
        searchUsersForChallenge(term);
      }, 250);
    };

    inputSearchUserChallenge.addEventListener('input', handleSearch);
    inputSearchUserChallenge.addEventListener('keyup', handleSearch);
  }

  const btnAccessContacts = document.getElementById('btnAccessContacts');
  if (btnAccessContacts) {
    btnAccessContacts.addEventListener('click', () => {
      playClickSound();
      showRetroToast('Sincronizando amigos...', '📱');
      setTimeout(() => {
        showRetroToast('¡3 contactos de RetroQuiz encontrados!', '👥');
      }, 1200);
    });
  }

  const btnShareViralLink = document.getElementById('btnShareViralLink') || document.getElementById('shareChallengeLinkBtn');
  if (btnShareViralLink) {
    btnShareViralLink.addEventListener('click', () => {
      playClickSound();
      const shareData = {
        title: '¡Te desafío en RetroQuiz!',
        text: '¿Crees saber más de cultura pop y retro que yo? ¡Demuéstralo y acéptame este reto! 🕹️🔥',
        url: window.location.origin + window.location.pathname
      };

      if (navigator.share) {
        navigator.share(shareData).catch((err) => {
          if (err.name !== 'AbortError') console.error('Error al compartir:', err);
        });
      } else {
        // Fallback si el navegador no soporta share: copia el enlace y muestra Toast
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareData.url).then(() => {
            if (typeof showToast === 'function') {
              showToast('¡Enlace copiado al portapapeles!');
            } else if (typeof showRetroToast === 'function') {
              showRetroToast('¡Enlace copiado al portapapeles!', '📋');
            } else {
              alert('¡Enlace copiado al portapapeles!');
            }
          }).catch(() => {
            if (typeof showRetroToast === 'function') {
              showRetroToast('¡Enlace copiado al portapapeles!', '📋');
            }
          });
        } else {
          if (typeof showRetroToast === 'function') {
            showRetroToast('¡Enlace copiado al portapapeles!', '📋');
          } else if (typeof showToast === 'function') {
            showToast('¡Enlace copiado al portapapeles!');
          } else {
            alert('¡Enlace copiado al portapapeles!');
          }
        }
      }
    });
  }

  // Botón 'JUGAR' en tarjetas de desafíos -> Navega a la Ruleta de Duelo (#challengeMatchView)
  document.querySelectorAll('.challenge-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.classList.contains('challenge-btn-completed') || btn.classList.contains('challenge-btn-waiting') || btn.disabled) return;
      e.stopPropagation();
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('botones.wav', 0.60);
      } else {
        playClickSound();
      }
      window.state.isChallengeMode = true;
      state.isChallengeMode = true;
      const card = btn.closest('.challenge-card');
      const rivalName = card?.querySelector('.player-rival .player-name')?.innerText?.trim() || 'Usuario 2';
      const rivalAvatar = card?.querySelector('.player-rival .player-avatar-circle span')?.innerText?.trim() || '🕹️';
      setupDuelMatchUI(rivalName, rivalAvatar);
      navigateToScreen('challengeMatchView');
    });
  });

  // Botón Circular de Ayuda '?' en Encabezado de Desafíos (#btnChallengesHelp)
  const btnChallengesHelp = document.getElementById('btnChallengesHelp');
  if (btnChallengesHelp && !btnChallengesHelp.dataset.listenerAttached) {
    btnChallengesHelp.dataset.listenerAttached = 'true';
    btnChallengesHelp.addEventListener('click', () => {
      window._isManualHelpOpen = true;
      playClickSound();
      mostrarModalOnboarding();
    });
  }

  // Botón Inferior en Modal de Onboarding (#btnStartChallengeOnboarding)
  const btnStartChallengeOnboarding = document.getElementById('btnStartChallengeOnboarding');
  if (btnStartChallengeOnboarding && !btnStartChallengeOnboarding.dataset.listenerAttached) {
    btnStartChallengeOnboarding.dataset.listenerAttached = 'true';
    btnStartChallengeOnboarding.addEventListener('click', () => {
      playClickSound();
      try {
        localStorage.setItem('retroquiz_seen_challenge_intro', 'true');
      } catch (e) {}
      window._isManualHelpOpen = false;
      ocultarModalOnboarding();
    });
  }

  // Botón Volver (<) en Pantalla de Ruleta de Duelo (#challengeMatchView)
  const btnChallengeMatchBack = document.getElementById('btnChallengeMatchBack');
  if (btnChallengeMatchBack) {
    btnChallengeMatchBack.addEventListener('click', () => {
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('botones.wav', 0.60);
      } else {
        playClickSound();
      }
      navigateToScreen('challengesView');
    });
  }

  // Botón Central 'GIRAR' en Ruleta de Duelo (#challengeMatchView)
  const btnGirarDuelWheel = document.getElementById('btnGirarDuelWheel');
  if (btnGirarDuelWheel) {
    btnGirarDuelWheel.addEventListener('click', () => {
      if (state.duelWheel.isSpinning) return;
      window.state.isChallengeMode = true;
      state.isChallengeMode = true;
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('ruleta.mp3', 0.70);
      }
      spinDuelWheel();
    });
  }

  // --- INTERACTIVIDAD PANTALLA RESULTADOS DE DUELO (#challengeResultView) ---
  // Finalizar turno de desafío y transferir el turno al rival en Firestore
  async function finalizeChallengeTurn(attackData = null) {
    const chId = window.state?.currentChallengeId || state.currentChallengeId;
    const currentUid = window.state?.userId;

    const correctCount = (window.state && window.state.correctAnswersCount !== undefined)
      ? window.state.correctAnswersCount
      : (state.trivia?.correctAnswersCount || 0);
    const roundXP = (state.trivia?.lastRoundXP !== undefined) ? state.trivia.lastRoundXP : (correctCount * 60);
    const roundCoins = (state.trivia?.lastRoundCoins !== undefined) ? state.trivia.lastRoundCoins : ((state.trivia && state.trivia.sessionCoins > 0) ? state.trivia.sessionCoins : (correctCount * 5));

    if (chId && window.db && window.firestoreOps && currentUid) {
      try {
        const { doc, getDoc, updateDoc } = window.firestoreOps;
        const chRef = doc(window.db, "desafios", chId);
        const snap = await getDoc(chRef);

        if (snap.exists()) {
          const ch = snap.data();
          const isCreator = (ch.fromUid === currentUid);
          const rivalUid = isCreator ? ch.toUid : ch.fromUid;

          // Extraer o inicializar las métricas por jugador
          const scores = ch.scores || {};
          const myScore = { ...(scores[currentUid] || {}) };
          const rivalScore = { ...(scores[rivalUid] || {}) };

          myScore.coins = (myScore.coins || 0) + roundCoins;
          myScore.xp = (myScore.xp || 0) + roundXP;
          myScore.totalScore = (myScore.coins || 0) + (myScore.xp || 0);

          const isTieBreaker = (ch.round === 'desempate' || window.state?.isTieBreaker || state.isTieBreaker);

          if (isTieBreaker) {
            myScore.tieBreakerHits = correctCount;
            myScore.tieBreakerTime = Math.round(window.state?.accumulatedAnswerTimeMs || 0);
          } else {
            myScore.roundsCompleted = (myScore.roundsCompleted || 0) + 1;
          }

          let nextTurnUid;
          let nextRound = ch.round || 1;
          let nextStatus = "active";
          let winnerUid = null;

          if (isTieBreaker) {
            if (rivalScore.tieBreakerHits !== undefined) {
              // Ambos jugaron la muerte súbita de desempate
              nextStatus = "completed";
              nextTurnUid = null;
              if (myScore.tieBreakerHits > rivalScore.tieBreakerHits) {
                winnerUid = currentUid;
              } else if (rivalScore.tieBreakerHits > myScore.tieBreakerHits) {
                winnerUid = rivalUid;
              } else {
                winnerUid = ((myScore.tieBreakerTime || 99999) <= (rivalScore.tieBreakerTime || 99999)) ? currentUid : rivalUid;
              }
            } else {
              nextTurnUid = rivalUid;
              nextRound = 'desempate';
              nextStatus = "active";
            }
          } else {
            const roundsFrom = isCreator ? myScore.roundsCompleted : (rivalScore.roundsCompleted || 0);
            const roundsTo = isCreator ? (rivalScore.roundsCompleted || 0) : myScore.roundsCompleted;

            // Secuencia de 6 turnos en 3 rondas: A1 -> B1 -> A2 -> B2 -> A3 -> B3
            if (roundsFrom === 1 && roundsTo === 0) {
              nextTurnUid = ch.toUid;
              nextRound = 1;
              nextStatus = (ch.status === "pending") ? "pending" : "active";
            } else if (roundsFrom === 1 && roundsTo === 1) {
              nextTurnUid = ch.fromUid;
              nextRound = 2;
            } else if (roundsFrom === 2 && roundsTo === 1) {
              nextTurnUid = ch.toUid;
              nextRound = 2;
            } else if (roundsFrom === 2 && roundsTo === 2) {
              nextTurnUid = ch.fromUid;
              nextRound = 3;
            } else if (roundsFrom === 3 && roundsTo === 2) {
              nextTurnUid = ch.toUid;
              nextRound = 3;
            } else if (roundsFrom >= 3 && roundsTo >= 3) {
              // Ambos concluyeron la Ronda 3: Puntaje = Total_RetroCoins + Total_XP
              const scoreFrom = (isCreator ? myScore.totalScore : rivalScore.totalScore) || 0;
              const scoreTo = (isCreator ? rivalScore.totalScore : myScore.totalScore) || 0;

              if (scoreFrom === scoreTo) {
                // Empate exacto: activar Muerte Súbita ("RONDA DE DESEMPATE")
                nextRound = 'desempate';
                nextTurnUid = ch.fromUid;
                nextStatus = "active";
              } else {
                nextRound = 3;
                nextTurnUid = null;
                nextStatus = "completed";
                winnerUid = (scoreFrom > scoreTo) ? ch.fromUid : ch.toUid;
              }
            } else {
              nextTurnUid = rivalUid;
              nextRound = Math.min(3, Math.max(roundsFrom, roundsTo));
            }
          }

          const updateData = {
            round: nextRound,
            currentTurn: nextTurnUid,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            [`scores.${currentUid}`]: myScore,
            [`scores.${rivalUid}`]: rivalScore,
            "scores.fromScore": (isCreator ? myScore.totalScore : rivalScore.totalScore) || 0,
            "scores.toScore": (isCreator ? rivalScore.totalScore : myScore.totalScore) || 0,
            "scores.fromHits": (ch.scores?.fromHits || 0) + (isCreator ? correctCount : 0),
            "scores.toHits": (ch.scores?.toHits || 0) + (!isCreator ? correctCount : 0)
          };

          if (isCreator && (myScore.roundsCompleted || 0) >= 1) {
            updateData.creatorRoundCompleted = true;
          }
          if (winnerUid) {
            updateData.winnerUid = winnerUid;
            updateData.loserUid = (winnerUid === ch.fromUid) ? ch.toUid : ch.fromUid;
          }

          await updateDoc(chRef, updateData);
          console.log("Turno sincronizado en Firestore. Siguiente turno:", nextTurnUid, "Ronda:", nextRound, "Estado:", nextStatus);
        }
      } catch (err) {
        console.error("Error finalizando turno de desafío en Firestore:", err);
      }
    }

    // Acreditar monedas y XP al perfil del usuario en Firestore (modo desafío es el único que da XP)
    if (window.db && window.firestoreOps && window.state && window.state.userId) {
      try {
        const { doc, updateDoc } = window.firestoreOps;
        const userRef = doc(window.db, "usuarios", window.state.userId);
        updateDoc(userRef, {
          coins: state.coins,
          xp: (window.state && typeof window.state.xp === 'number') ? window.state.xp : (state.xp !== undefined ? state.xp : (state.userScore || 0)),
          updatedAt: new Date().toISOString()
        }).catch(err => console.error("Error al actualizar perfil tras turno:", err));
      } catch (err) {}
    }

    window.state.isChallengeMode = false;
    state.isChallengeMode = false;
    window.state.isTieBreaker = false;
    state.isTieBreaker = false;
    window.state.currentChallengeId = null;
    state.currentChallengeId = null;

    navigateToScreen('challengesView');
  }
  window.finalizeChallengeTurn = finalizeChallengeTurn;

  // Botón Principal Rondas 1 y 2: 'PASAR TURNO AL RIVAL'
  const btnPassTurnWithoutAttack = document.getElementById('btnPassTurnWithoutAttack');
  if (btnPassTurnWithoutAttack) {
    btnPassTurnWithoutAttack.addEventListener('click', () => {
      playClickSound();
      showRetroToast('Turno finalizado y transferido al rival 🚀', 'info');
      finalizeChallengeTurn(null);
    });
  }

  // Botón 1 Ronda 3 Final: 'SOLICITAR REVANCHA'
  const btnRematchDuel = document.getElementById('btnRematchDuel');
  if (btnRematchDuel) {
    btnRematchDuel.addEventListener('click', async () => {
      playClickSound();
      const currentUid = window.state?.userId || state.userId;
      const currentUsername = window.state?.username || localStorage.getItem('retroquiz_username') || "Jugador";
      const currentAvatar = window.state?.customAvatar || state.customAvatar || 'assets/pantalla_inicio/hombre.webp';

      const chData = state.currentDuel?.chData;
      const isCreatorPrev = chData ? (chData.fromUid === currentUid || chData.challengerId === currentUid) : false;
      const rivalUid = state.currentDuel?.rivalUid || (isCreatorPrev ? (chData?.toUid || chData?.targetUserId) : (chData?.fromUid || chData?.challengerId));
      const rivalName = state.currentDuel?.rivalName || (isCreatorPrev ? (chData?.toUsername || chData?.targetUserName) : (chData?.fromUsername || chData?.challengerName)) || 'Rival';
      const rivalAvatar = state.currentDuel?.rivalAvatar || (isCreatorPrev ? chData?.toAvatar : chData?.fromAvatar) || '🕹️';

      if (rivalUid && window.db && window.firestoreOps && currentUid) {
        try {
          const { collection, addDoc } = window.firestoreOps;
          const desafiosRef = collection(window.db, "desafios");
          const newChallengeDoc = {
            challengerId: currentUid,
            challengerName: currentUsername,
            targetUserId: rivalUid,
            targetUserName: rivalName,
            fromUid: currentUid,
            fromUsername: currentUsername,
            fromAvatar: currentAvatar,
            toUid: rivalUid,
            toUsername: rivalName,
            toAvatar: rivalAvatar,
            status: "active",
            round: 1,
            currentTurn: currentUid,
            creatorRoundCompleted: false,
            scores: {
              [currentUid]: { coins: 0, xp: 0, totalScore: 0, roundsCompleted: 0 },
              [rivalUid]: { coins: 0, xp: 0, totalScore: 0, roundsCompleted: 0 }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const docRef = await addDoc(desafiosRef, newChallengeDoc);

          window.state.currentChallengeId = docRef.id;
          state.currentChallengeId = docRef.id;
          window.state.isChallengeMode = true;
          state.isChallengeMode = true;
          window.state.isTieBreaker = false;
          state.isTieBreaker = false;

          setupDuelMatchUI(rivalName, rivalAvatar, 1);
          state.currentDuel.challengeId = docRef.id;
          state.currentDuel.rivalUid = rivalUid;
          state.currentDuel.localTotalScore = 0;
          state.currentDuel.rivalTotalScore = 0;
          state.currentDuel.chData = {
            id: docRef.id,
            ...newChallengeDoc
          };

          showRetroToast('¡Revancha iniciada! Gira la ruleta ⚔️', 'success');
          navigateToScreen('challengeMatchView');
          return;
        } catch (err) {
          console.error("Error al crear revancha en Firestore:", err);
          showRetroToast('Error al crear revancha', '⚠️');
        }
      }

      if (state.currentDuel) {
        state.currentDuel.currentRound = 1;
        state.currentDuel.localTotalScore = 0;
        state.currentDuel.rivalTotalScore = 0;
      }
      setupDuelMatchUI(rivalName, rivalAvatar, 1);
      showRetroToast('¡Revancha solicitada! Nueva ronda iniciada', 'success');
      navigateToScreen('challengeMatchView');
    });
  }

  // Botón 2 Ronda 3 Final: 'VOLVER A DESAFÍOS'
  const btnDuelBackToChallenges = document.getElementById('btnDuelBackToChallenges');
  if (btnDuelBackToChallenges) {
    btnDuelBackToChallenges.addEventListener('click', () => {
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('botones.wav', 0.60);
      } else {
        playClickSound();
      }
      window.state.isChallengeMode = false;
      state.isChallengeMode = false;
      window.state.isTieBreaker = false;
      state.isTieBreaker = false;
      window.state.currentChallengeId = null;
      state.currentChallengeId = null;
      navigateToScreen('challengesView');
    });
  }

  // --- INTERACTIVIDAD MODAL 3: SELECCIONAR ATAQUE (#attackModal) ---
  document.querySelectorAll('#attacksList .attack-card-item').forEach(item => {
    item.addEventListener('click', () => {
      const cost = parseInt(item.dataset.cost, 10) || 40;
      const attackName = item.dataset.name || 'Ataque';
      const attackId = item.dataset.attackId || 'time_penalty';

      if (state.coins >= cost) {
        state.coins -= cost;
        if (typeof saveCoinsToCloud === 'function') saveCoinsToCloud(state.coins);
        renderCollectionCardsUI();
        playCoinSound();
        playSuccessSound();
        showRetroToast(`¡Ataque "${attackName}" enviado con éxito! (-${cost} RC)`, 'success');
        closeModal('attackModal');
        setTimeout(() => {
          finalizeChallengeTurn({ id: attackId, name: attackName, cost: cost });
        }, 350);
      } else {
        playErrorSound();
        showRetroToast(`No tienes suficientes RetroCoins (necesitas ${cost} RC)`, 'warning');
      }
    });
  });

  const btnRanking = document.getElementById('btnRanking');
  if (btnRanking) {
    btnRanking.addEventListener('click', () => {
      if (typeof SoundManager !== 'undefined') SoundManager.playBGM('menu');
      openModal('modalRanking');
    });
  }

  // Botón de Ayuda (?) — abre modal ¿Cómo se juega?
  const btnHelp = document.getElementById('btnHelp');
  const howToPlayModal = document.getElementById('howToPlayModal');

  function openHowToPlay() {
    if (howToPlayModal) {
      howToPlayModal.classList.remove('btn-exit-reverse');
      const box = howToPlayModal.querySelector('.how-to-play-box');
      if (box) box.classList.remove('btn-exit-reverse');
      howToPlayModal.style.display = 'flex';
      playModalOpenSound();
    }
  }

  function closeHowToPlay() {
    if (howToPlayModal && howToPlayModal.style.display !== 'none') {
      const box = howToPlayModal.querySelector('.how-to-play-box');
      const closeBtn = document.getElementById('btnCloseHowToPlay');
      if (closeBtn) closeBtn.classList.add('btn-exit-reverse');
      if (box) box.classList.add('btn-exit-reverse');
      howToPlayModal.classList.add('btn-exit-reverse');

      setTimeout(() => {
        howToPlayModal.style.display = 'none';
        howToPlayModal.classList.remove('btn-exit-reverse');
        if (box) box.classList.remove('btn-exit-reverse');
        if (closeBtn) closeBtn.classList.remove('btn-exit-reverse');
      }, 250);
    }
  }

  function hideHelpButton(callback) {
    if (btnHelp) {
      btnHelp.classList.add('btn-exit-reverse');
      setTimeout(() => {
        btnHelp.style.display = 'none';
        btnHelp.classList.remove('btn-exit-reverse');
        if (typeof callback === 'function') callback();
      }, 250);
    } else if (typeof callback === 'function') {
      callback();
    }
  }
  window.hideHelpButton = hideHelpButton;

  if (btnHelp) {
    btnHelp.addEventListener('click', openHowToPlay);
  }

  const btnCloseHowToPlay = document.getElementById('btnCloseHowToPlay');
  if (btnCloseHowToPlay) {
    btnCloseHowToPlay.addEventListener('click', closeHowToPlay);
  }

  const btnHtpUnderstood = document.getElementById('btnHtpUnderstood');
  if (btnHtpUnderstood) {
    btnHtpUnderstood.addEventListener('click', closeHowToPlay);
  }

  // Cerrar al hacer clic en el overlay (fuera del box)
  if (howToPlayModal) {
    howToPlayModal.addEventListener('click', (e) => {
      if (e.target === howToPlayModal) closeHowToPlay();
    });
  }

  const btnCoinPill = document.getElementById('btnCoinPill');
  if (btnCoinPill) {
    btnCoinPill.addEventListener('click', () => {
      playCoinSound();
      navigateToScreen('storeView');
    });
  }

  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  document.getElementById('tabInicio')?.addEventListener('click', () => {
    playClickSound();
    setActiveTab('inicio');
    navigateToScreen('homeView');
    document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
  });

  document.getElementById('tabHomeDesafios')?.addEventListener('click', () => {
    playClickSound();
    navigateToScreen('challengesView');
  });

  document.getElementById('tabTienda')?.addEventListener('click', () => {
    playCoinSound();
    navigateToScreen('storeView');
  });

  // --- INTERACTIVIDAD PANTALLA DE TIENDA (#storeView) ---
  // Botón Atrás (<)
  document.getElementById('btnStoreBack')?.addEventListener('click', () => {
    if (typeof SoundManager !== 'undefined') {
      SoundManager.playSFX('botones.wav', 0.60);
    } else {
      playClickSound();
    }
    navigateToScreen('homeView');
  });

  // Botones de la barra de navegación de tienda
  document.getElementById('tabStoreInicio')?.addEventListener('click', () => {
    playClickSound();
    navigateToScreen('homeView');
  });

  document.getElementById('tabStoreDesafios')?.addEventListener('click', () => {
    playClickSound();
    navigateToScreen('challengesView');
  });

  document.getElementById('tabStoreTienda')?.addEventListener('click', () => {
    playClickSound();
    const scrollContainer = document.querySelector('#storeView .store-scroll-content');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('tabStorePerfil')?.addEventListener('click', (e) => {
    e.preventDefault();
    openProfileModal();
  });

  // Botón Ver Todo en Sección Packs de la Tienda -> Lleva a #collectionView
  document.getElementById('btnStorePacksSeeAll')?.addEventListener('click', () => {
    if (typeof SoundManager !== 'undefined') {
      SoundManager.playSFX('botones.wav', 0.60);
    } else {
      playClickSound();
    }
    navigateToScreen('collectionView');
  });

  // Compra de Potenciadores
  document.querySelectorAll('#storeView .btn-buy-booster').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.booster;
      const cost = parseInt(btn.dataset.cost, 10) || 150;
      const row = btn.closest('.booster-row-item');
      const name = row?.querySelector('.booster-name')?.innerText || 'Potenciador';
      buyBooster(type, cost, name);
    });
  });

  // Compra y Equipamiento de Temas Estacionales
  document.querySelectorAll('#storeView .btn-theme-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.theme;
      const cost = parseInt(btn.dataset.cost, 10) || 2500;
      const card = btn.closest('.store-theme-card');
      const name = card?.querySelector('.theme-title')?.innerText || 'Tema';

      const isEquipped = state.store?.activeTheme === themeId;
      const isPurchased = state.store?.purchasedThemes?.includes(themeId);

      if (isEquipped) {
        showRetroToast(`El tema "${name}" ya está equipado`, 'info');
      } else if (isPurchased) {
        equipTheme(themeId);
        if (typeof SoundManager !== 'undefined') SoundManager.playSFX('compra_tienda.wav', 0.70);
        showRetroToast(`¡Tema "${name}" equipado!`, '🎨');
      } else {
        buyTheme(themeId, cost, name);
      }
    });
  });

  // Restaurar Tema Original por defecto
  document.getElementById('btnStoreResetTheme')?.addEventListener('click', () => {
    playClickSound();
    resetTheme();
  });

  document.getElementById('tabPerfil')?.addEventListener('click', (e) => {
    e.preventDefault();
    openProfileModal();
  });

  // Mini Quiz dentro del Modal JUGAR
  const quizButtons = document.querySelectorAll('.quiz-opt-btn');
  const quizFeedback = document.getElementById('quizFeedback');

  quizButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.answeredQuiz) return;
      const isCorrect = btn.dataset.correct === 'true';

      quizButtons.forEach(b => {
        if (b.dataset.correct === 'true') {
          b.classList.add('correct');
        }
      });

      if (isCorrect) {
        state.answeredQuiz = true;
        btn.classList.add('correct');
        if (quizFeedback) {
          quizFeedback.innerText = '🎉 ¡CORRECTO! Ganaste +50 Monedas y Puntaje XP';
          quizFeedback.style.color = '#4ADE80';
        }
        playSuccessSound();
        setTimeout(() => {
          updateCoinsDisplay(50);
        }, 300);
      } else {
        btn.classList.add('wrong');
        if (quizFeedback) {
          quizFeedback.innerText = '❌ ¡Ups! SNES debutó en 1990 en Japón.';
          quizFeedback.style.color = '#F87171';
        }
        playErrorSound();
      }
    });
  });

  // Reclamar Desafío
  const btnClaim = document.getElementById('btnClaimChallenge');
  if (btnClaim) {
    btnClaim.addEventListener('click', () => {
      if (state.claimedChallenge) return;
      state.claimedChallenge = true;

      btnClaim.innerText = '✓ ¡Reclamado!';
      btnClaim.classList.remove('active-claim');
      btnClaim.classList.add('disabled');
      btnClaim.disabled = true;

      const item = document.getElementById('challengeClaimable');
      if (item) item.classList.remove('challenge-ready');

      playSuccessSound();
      setTimeout(() => {
        updateCoinsDisplay(250);
      }, 200);
    });
  }

  // Tienda Compras
  document.querySelectorAll('.buy-coins-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const add = parseInt(e.currentTarget.dataset.add, 10) || 500;
      updateCoinsDisplay(add);
      if (typeof SoundManager !== 'undefined') SoundManager.playSFX('compra_tienda.wav', 0.70);
      const originalText = e.currentTarget.innerText;
      e.currentTarget.innerText = '✓ ¡Listo!';
      setTimeout(() => {
        e.currentTarget.innerText = originalText;
      }, 1000);
    });
  });

  document.querySelectorAll('.buy-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (state.coins >= 100) {
        updateCoinsDisplay(-100);
        playSuccessSound();
        if (typeof SoundManager !== 'undefined') SoundManager.playSFX('compra_tienda.wav', 0.70);
        e.currentTarget.innerText = '✓ Canjeado';
        setTimeout(() => {
          e.currentTarget.innerText = '100 🟡';
        }, 1000);
      } else {
        playErrorSound();
        alert('¡No tienes suficientes monedas retro!');
      }
    });
  });

  // --- LISTENERS DE TRIVIA (#triviaView & #gameOverView) ---
  document.querySelectorAll('.trivia-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      handleTriviaAnswer(idx);
    });
  });

  const btnAbandonarTrivia = document.getElementById('btnAbandonarTrivia');
  const abandonModal = document.getElementById('abandonModal');
  const btnConfirmExitTrivia = document.getElementById('btnConfirmExitTrivia');
  const btnCancelExitTrivia = document.getElementById('btnCancelExitTrivia');

  if (btnAbandonarTrivia) {
    btnAbandonarTrivia.addEventListener('click', () => {
      playModalOpenSound();
      // 1. Pausar el temporizador de 15s inmediatamente
      pauseTriviaTimer();
      // 2. Desplegar modal emergente de confirmación
      if (abandonModal) {
        abandonModal.style.display = 'flex';
      }
    });
  }

  // 3. CONECTAR CON EL BOTÓN ABANDONAR ('SÍ, SALIR')
  if (btnConfirmExitTrivia) {
    btnConfirmExitTrivia.addEventListener('click', () => {
      if (abandonModal) {
        abandonModal.style.display = 'none';
      }
      ejecutarSecuenciaGameOver('Has abandonado la partida');
    });
  }

  // Cancelar Abandono: 'CONTINUAR'
  if (btnCancelExitTrivia) {
    btnCancelExitTrivia.addEventListener('click', () => {
      playClickSound();
      if (abandonModal) abandonModal.style.display = 'none';
      // Reanudar el temporizador exactamente donde se pausó
      resumeTriviaTimer();
    });
  }

  const btnGameOverToWheel = document.getElementById('btnGameOverToWheel');
  if (btnGameOverToWheel) {
    btnGameOverToWheel.addEventListener('click', () => {
      playClickSound();
      navigateToScreen('wheelView');
    });
  }

  const btnGameOverToHome = document.getElementById('btnGameOverToHome');
  if (btnGameOverToHome) {
    btnGameOverToHome.addEventListener('click', () => {
      playClickSound();
      navigateToScreen('homeView');
    });
  }

  // --- LISTENERS DE PANTALLA DE RESULTADOS (#resultsView) ---
  const btnResultsRanking = document.getElementById('btnResultsRanking');
  if (btnResultsRanking) {
    btnResultsRanking.addEventListener('click', () => {
      playClickSound();
      const rankingUserPts = document.getElementById('rankingUserPts');
      if (rankingUserPts) rankingUserPts.innerText = `${state.userScore.toLocaleString()} pts`;
      openModal('modalRanking');
    });
  }

  const btnResultsPlayAgain = document.getElementById('btnResultsPlayAgain');
  if (btnResultsPlayAgain) {
    btnResultsPlayAgain.addEventListener('click', () => {
      playClickSound();
      navigateToScreen('wheelView');
    });
  }



  window.debugShowProfile = function() {
    openProfileModal();
  };
  window.debugResetAds = function() {
    localStorage.removeItem('retroquiz_no_ads');
    applyNoAdsState(false);
    showRetroToast('Publicidad restaurada (modo gratuito)', 'ℹ️');
  };
  window.debugSetAvatar = function(dataUrl) {
    if (dataUrl) {
      updateUserAvatarAcrossApp(dataUrl);
      localStorage.setItem('retroquiz_custom_avatar', dataUrl);
    }
  };

  document.getElementById('btnReplayIntro')?.addEventListener('click', () => {
    navigateToScreen('homeView');
    triggerAppEntranceAnimation();
  });

  document.getElementById('btnRestartIntroModal')?.addEventListener('click', () => {
    closeModal('modalSettings');
    navigateToScreen('homeView');
    setTimeout(triggerAppEntranceAnimation, 300);
  });

  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');
  btnToggleSound?.addEventListener('click', () => {
    if (typeof SoundManager !== 'undefined') {
      const muted = SoundManager.toggleMute();
      state.sfxEnabled = !muted;
    } else {
      state.sfxEnabled = !state.sfxEnabled;
    }
    btnToggleSound.classList.toggle('sound-active', state.sfxEnabled);
    if (soundIcon) soundIcon.innerText = state.sfxEnabled ? '🔊' : '🔇';
    const soundToggleInput = document.getElementById('settingSoundToggle');
    if (soundToggleInput) soundToggleInput.checked = state.sfxEnabled;
    const toggleSoundProfile = document.getElementById('toggleSoundProfile');
    if (toggleSoundProfile) toggleSoundProfile.checked = state.sfxEnabled;
    try {
      localStorage.setItem('retroquiz_sound_enabled', String(state.sfxEnabled));
    } catch (err) {}
    if (state.sfxEnabled) playClickSound();
  });

  const btnToggleFrame = document.getElementById('btnToggleFrame');
  const deviceFrame = document.getElementById('deviceFrame');
  btnToggleFrame?.addEventListener('click', () => {
    deviceFrame?.classList.toggle('no-frame');
    playClickSound();
  });

  document.getElementById('settingSoundToggle')?.addEventListener('change', (e) => {
    state.sfxEnabled = e.target.checked;
    if (typeof SoundManager !== 'undefined') {
      if (SoundManager.isMuted === state.sfxEnabled) {
        SoundManager.toggleMute();
      }
    }
    btnToggleSound?.classList.toggle('sound-active', state.sfxEnabled);
    if (soundIcon) soundIcon.innerText = state.sfxEnabled ? '🔊' : '🔇';
  });

  document.getElementById('settingMusicToggle')?.addEventListener('change', (e) => {
    state.musicEnabled = e.target.checked;
    if (typeof SoundManager !== 'undefined') {
      if (!state.musicEnabled) {
        SoundManager.stopAllBGM();
      } else if (window.state.currentView === '#homeView') {
        SoundManager.playBGM('menu');
      }
    }
  });

  // Unlock Audio en el primer toque
  const unlockAudio = () => {
    getAudioContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // PROTOCOLO AUTOPLAY (un solo toque global)
  window.addEventListener('pointerdown', () => {
    if (typeof SoundManager !== 'undefined' && !SoundManager.isMuted && SoundManager.bgmMenu.paused && window.state.currentView === '#homeView') {
      SoundManager.playBGM('menu');
    }
  }, { once: true });
});
