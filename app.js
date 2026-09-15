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
  {
    id: "vecinos_springfield",
    name: "Vecinos de Springfield",
    category: "ANIMACIÓN",
    badge: "FAMILIA AMARILLA",
    subtitle: "FAMILIA AMARILLA",
    file: "data/pack_springfield.json",
    coverImage: "assets/pantalla_colecciones/caja_springfield.webp",
    boxImage: "assets/pantalla_colecciones/caja_springfield.webp",
    icon: "🍩 🍺 📺",
    description: "Demuestra cuánto sabes sobre la familia amarilla de la televisión, sus vecinos y sus locuras cotidianas en Springfield.",
    totalQuestions: 50,
    price: 5000,
    priceCoins: 5000
  },
  {
    id: "heroes_multiverso",
    name: "Héroes del Multiverso",
    category: "CINE & SERIES",
    badge: "CÓMICS & CINE",
    subtitle: "CÓMICS & CINE",
    file: "data/pack_multiverso.json",
    coverImage: "assets/pantalla_colecciones/caja_multiverso.webp",
    boxImage: "assets/pantalla_colecciones/caja_multiverso.webp",
    icon: "🛡️ ⚡ 🌌",
    description: "Preguntas sobre vengadores heroicos, villanos cósmicos, batallas épicas y leyendas multiversales.",
    totalQuestions: 50,
    price: 5000,
    priceCoins: 5000
  },
  {
    id: "galaxias_lejanas",
    name: "Galaxias Lejanas",
    category: "CINE & SERIES",
    badge: "SAGA ESPACIAL",
    subtitle: "SAGA ESPACIAL",
    file: "data/pack_galaxias.json",
    coverImage: "assets/pantalla_colecciones/caja_galaxias.webp",
    boxImage: "assets/pantalla_colecciones/caja_galaxias.webp",
    icon: "🚀 ⚔️ 🌌",
    description: "Enfrenta el lore definitivo sobre sables de luz, órdenes espaciales, imperios galácticos y planetas remotos.",
    totalQuestions: 50,
    price: 5000,
    priceCoins: 5000
  },
  {
    id: "guerreros_ki",
    name: "Guerreros del Ki",
    category: "ANIMACIÓN",
    badge: "ANIME SHŌNEN",
    subtitle: "ANIME SHŌNEN",
    file: "data/pack_ki.json",
    coverImage: "assets/pantalla_colecciones/caja_ki.webp",
    boxImage: "assets/pantalla_colecciones/caja_ki.webp",
    icon: "🐉 🥋 ⚡",
    description: "Pon a prueba tu poder sobre torneos de artes marciales, guerreros legendarios, esferas mágicas y transformaciones cósmicas.",
    totalQuestions: 50,
    price: 5000,
    priceCoins: 5000
  },
  {
    id: "reino_champinon",
    name: "Reino Champiñón",
    category: "VIDEOJUEGOS",
    badge: "PLATAFORMAS RETRO",
    subtitle: "PLATAFORMAS RETRO",
    file: "data/pack_reino.json",
    coverImage: "assets/pantalla_colecciones/caja_reino.webp",
    boxImage: "assets/pantalla_colecciones/caja_reino.webp",
    icon: "🍄 👑 🐢",
    description: "Desafía tu memoria en plataformas retro: fontaneros valientes, princesas en apuros, castillos y carreras de karts.",
    totalQuestions: 50,
    price: 5000,
    priceCoins: 5000
  },
  {
    id: "castillo_magia",
    name: "Castillo de Magia",
    category: "CINE & LITERATURA",
    badge: "FANTASÍA & HECHIZOS",
    subtitle: "FANTASÍA & HECHIZOS",
    file: "data/pack_magia.json",
    coverImage: "assets/pantalla_colecciones/caja_magia.webp",
    boxImage: "assets/pantalla_colecciones/caja_magia.webp",
    icon: "🪄 🏰 ⚡",
    description: "Pon a prueba tus hechizos y conocimientos del mundo mágico, colegios de hechicería y criaturas fantásticas.",
    totalQuestions: 50,
    price: 5000,
    priceCoins: 5000
  }
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
  unlockedPacks: [], // IDs de packs temáticos adquiridos (ej: ["vecinos_springfield"])
  packMastery: {}, // Preguntas dominadas por pack temático (ej: { vecinos_springfield: ["spr_001", "spr_002"] })
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
    animacion: 0,     // Desbloqueado desde el inicio
    videojuegos: 0,   // Desbloqueado desde el inicio
    tv: 0,            // Desbloqueado desde el inicio
    musica: 0,        // Compatibilidad
    todo: 0           // Desbloqueado desde el inicio
  },

  // Umbrales de desbloqueo por puntaje acumulado (compatibilidad)
  categoryThresholds: {
    cine: 0,
    animacion: 0,
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
    secondsUntilReload: 3 * 3600
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
    timerSeconds: 20,
    remainingMs: 20000,
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
  challenges: [],
  activeMatchesList: [],

  themes: {
    unlocked: ["default"],
    active: "default"
  },

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
window.state.activeMatchesList = state.activeMatchesList;
window.state.themes = state.themes;

const THEME_SKINS = {
  navidad: { name: "Navidad Retro", cost: 3000, bodyClass: "theme-navidad" },
  halloween: { name: "Noche Halloween", cost: 3000, bodyClass: "theme-halloween" },
  pascua: { name: "Pascua Arcade", cost: 2500, bodyClass: "theme-pascua" },
  verano: { name: "Verano Synth", cost: 2500, bodyClass: "theme-verano" }
};
window.THEME_SKINS = THEME_SKINS;

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

// Categorías y configuración de ángulos en la ruleta
const categoriesConfig = {
  cine: { name: 'CINE', icon: '🎬', color: '#7b38e5', centerAngle: 180 },
  animacion: { name: 'ANIMACIÓN', icon: '✨', color: '#00FF66', centerAngle: 252 },
  videojuegos: { name: 'VIDEOJUEGOS', icon: '🎮', color: '#e2dd5f', centerAngle: 324 },
  tv: { name: 'TV', icon: '📺', color: '#5fe2df', centerAngle: 36 },
  todo: { name: 'TODO / MIX', icon: '❓', color: '#FF5A5F', centerAngle: 108 }
};
categoriesConfig.musica = categoriesConfig.animacion; // Alias de compatibilidad

// Obtener lista de categorías actualmente desbloqueadas (por defecto todas habilitadas desde el principio)
function getUnlockedCategories() {
  return ['cine', 'animacion', 'videojuegos', 'tv', 'todo'];
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
  '#wheel': 'wheelView',
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
  '#profile': 'profileView',
  '#ranking': 'modalRanking'
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
  'profileView': '#perfil',
  'modalRanking': '#ranking'
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

// --- MICRO-SONIDO RÍTMICO Y CONTEO PROGRESIVO DE RETROCOINS (#resultsView) ---
function playCoinTick() {
  if (typeof SoundManager !== 'undefined' && SoundManager.isMuted) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      if (!window._coinAudioCtx) {
        window._coinAudioCtx = new AudioCtx();
      }
      const ctx = window._coinAudioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
      return;
    }
  } catch (e) {}

  if (typeof SoundManager !== 'undefined' && typeof SoundManager.playSFX === 'function') {
    SoundManager.playSFX('retrocoin.wav', 0.18);
  }
}
window.playCoinTick = playCoinTick;

function startResultsCoinsCounter(customSessionCoins, customPrevCoins, customFinalCoins) {
  const coinsSessionEl = document.getElementById('resultsCoinsSessionVal');
  const coinsTotalEl = document.getElementById('resultsCoinsTotalVal');
  const dualCardEl = document.querySelector('#resultsView .results-dual-card');

  const earned = (typeof customSessionCoins === 'number')
    ? customSessionCoins
    : (typeof window._lastResultsSessionCoins === 'number'
        ? window._lastResultsSessionCoins
        : (state.trivia?.sessionCoins || (state.correctAnswersCount ? state.correctAnswersCount * 5 : 50)));

  const startTotal = (typeof customPrevCoins === 'number')
    ? customPrevCoins
    : (typeof window._lastResultsPrevCoins === 'number'
        ? window._lastResultsPrevCoins
        : Math.max(0, (state.coins || 0) - earned));

  const endTotal = (typeof customFinalCoins === 'number')
    ? customFinalCoins
    : (typeof window._lastResultsFinalCoins === 'number'
        ? window._lastResultsFinalCoins
        : (state.coins || startTotal + earned));

  if (coinsSessionEl) coinsSessionEl.innerText = '+0';
  if (coinsTotalEl) coinsTotalEl.innerText = startTotal.toLocaleString();

  if (earned <= 0) {
    if (coinsSessionEl) coinsSessionEl.innerText = '+0';
    if (coinsTotalEl) coinsTotalEl.innerText = endTotal.toLocaleString();
    return;
  }

  const duration = 1200; // ~1.2s total
  const startTime = performance.now();
  let lastDisplayed = -1;
  let lastAudioTick = 0;

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Progreso acelerado (ease-out cuadrático)
    const currentVal = Math.round((1 - Math.pow(1 - progress, 2)) * earned);

    if (currentVal !== lastDisplayed) {
      lastDisplayed = currentVal;
      if (coinsSessionEl) coinsSessionEl.innerText = `+${currentVal}`;

      // Reproducir micro-sonido 'coin_tick' rítmico
      if (now - lastAudioTick >= 40) {
        lastAudioTick = now;
        playCoinTick();
      }
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      if (coinsSessionEl) coinsSessionEl.innerText = `+${earned}`;
      if (coinsTotalEl) coinsTotalEl.innerText = endTotal.toLocaleString();
      const hudUserCoins = document.getElementById('userCoins');
      if (hudUserCoins) hudUserCoins.innerText = endTotal.toLocaleString();

      // Efecto destello/resplandor en la tarjeta de monedas (goldenGleam 450ms)
      if (dualCardEl) {
        dualCardEl.classList.remove('golden-gleam-active');
        void dualCardEl.offsetWidth;
        dualCardEl.classList.add('golden-gleam-active');
        setTimeout(() => {
          dualCardEl.classList.remove('golden-gleam-active');
        }, 450);
      }

      // Confeti leve
      if (typeof confetti === 'function') {
        try {
          confetti({
            particleCount: 28,
            spread: 55,
            origin: { y: 0.65 },
            colors: ['#FFE600', '#FFD700', '#FFA500', '#FFFFFF']
          });
        } catch (e) {}
      }
    }
  }

  requestAnimationFrame(tick);
}
window.startResultsCoinsCounter = startResultsCoinsCounter;

// 5. Animación de Entrada Escalonada (Staggered Assembly)
function triggerResultsEntranceAnimation() {
  const resultsView = document.getElementById('resultsView');
  if (!resultsView) return;

  resultsView.classList.remove('anim-results-stagger');
  void resultsView.offsetWidth;
  resultsView.classList.add('anim-results-stagger');

  setTimeout(() => {
    resultsView.classList.remove('anim-results-stagger');
  }, 1000);

  // Sincronizar esquema de rangos temáticos del jugador
  const playerLevelEl = document.getElementById('resultsPlayerLevel');
  const playerXpEl = document.getElementById('resultsPlayerTotalXp');
  const userXP = (window.state && typeof window.state.xp === 'number')
    ? window.state.xp
    : ((state && typeof state.xp === 'number') ? state.xp : (state?.userScore || 0));
  const currentRank = (typeof getPlayerRank === 'function') ? getPlayerRank(userXP) : { name: 'Novato del Videoclub 📼' };
  if (playerLevelEl) playerLevelEl.innerText = currentRank.name || currentRank.toString();
  if (playerXpEl) playerXpEl.innerText = `${userXP.toLocaleString()} pts`;

  // Paso 3 (280ms): La tarjeta contenedora sube desde abajo y detona el conteo progresivo
  setTimeout(() => {
    startResultsCoinsCounter();
  }, 280);
}
window.triggerResultsEntranceAnimation = triggerResultsEntranceAnimation;

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

    if (targetSelector === '#wheelView') {
      triggerWheelEntranceAnimations();
    } else if (targetSelector === '#challengeMatchView') {
      triggerChallengeMatchEntranceAnimation();
    } else if (targetSelector === '#resultsView') {
      triggerResultsEntranceAnimation();
    } else if (targetSelector === '#challengeResultView') {
      triggerDuelResultsEntranceAnimation();
    } else if (targetSelector === '#challengesView') {
      if (typeof updateActiveChallengesBadge === 'function') updateActiveChallengesBadge();
    }
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

  matchView.classList.remove('run-stagger-assembly', 'anim-assembling');
  void matchView.offsetWidth; // Forzar reflow para reiniciar la animación
  matchView.classList.add('run-stagger-assembly');

  // Pasados 800ms (al concluir la coreografía completa), retira las clases de animación
  // para asegurar que el disco de la ruleta pueda rotar con total libertad al hacer clic en "GIRAR" sin bloqueos de CSS
  setTimeout(() => {
    matchView.classList.remove('run-stagger-assembly', 'anim-assembling');
  }, 800);
}

function triggerDuelResultsEntranceAnimation() {
  const resultsView = document.getElementById('challengeResultView');
  if (!resultsView) return;

  // Cancelar temporizadores o animaciones de conteo previas si existían
  if (window._duelResultsAnimTimers && Array.isArray(window._duelResultsAnimTimers)) {
    window._duelResultsAnimTimers.forEach(t => clearTimeout(t));
  }
  if (window._duelResultsAnimRafs && Array.isArray(window._duelResultsAnimRafs)) {
    window._duelResultsAnimRafs.forEach(id => cancelAnimationFrame(id));
  }
  window._duelResultsAnimTimers = [];
  window._duelResultsAnimRafs = [];

  const addTimer = (fn, delay) => {
    const t = setTimeout(fn, delay);
    window._duelResultsAnimTimers.push(t);
    return t;
  };

  // 1. Reset de estados al ingresar a la vista
  // Oculta el overflow temporalmente en el contenedor principal para evitar barras de desplazamiento
  resultsView.style.overflow = 'hidden';

  // Identificar los elementos clave
  const podiumVs = document.getElementById('duelResultPodiumVersus');
  const podiumWinner = document.getElementById('duelWinnerPodiumContainer');
  const activePodium = (podiumWinner && podiumWinner.style.display !== 'none') ? podiumWinner : podiumVs;

  const roundBadgeWrap = resultsView.querySelector('.duel-round-badge-wrap');
  const outcomeTitle = document.getElementById('duelOutcomeTitle');
  const perfCard = resultsView.querySelector('.duel-performance-card');

  const timeSpentEl = document.getElementById('duelTimeSpent');
  const pointsEarnedEl = document.getElementById('duelPointsEarned');
  const coinsEarnedEl = document.getElementById('duelCoinsEarned');

  const btnPassTurn = document.getElementById('btnPassTurnWithoutAttack');
  const finalActions = document.getElementById('duelFinalActions');
  const activeActionButton = (finalActions && finalActions.style.display !== 'none') ? finalActions : btnPassTurn;

  // Capturar valores objetivos reales
  let targetTimeSec = 24.5;
  if (timeSpentEl && timeSpentEl.innerText) {
    const parsedT = parseFloat(timeSpentEl.innerText.replace(/[^\d.]/g, ''));
    if (!isNaN(parsedT) && parsedT > 0) targetTimeSec = parsedT;
  }

  let targetXP = 240;
  if (pointsEarnedEl && pointsEarnedEl.innerText) {
    const parsedXP = parseInt(pointsEarnedEl.innerText.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsedXP)) targetXP = parsedXP;
  }

  let targetCoins = 20;
  if (coinsEarnedEl && coinsEarnedEl.innerText) {
    const parsedCoins = parseInt(coinsEarnedEl.innerText.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsedCoins)) targetCoins = parsedCoins;
  }

  // Inicializar textos en 0 para conteo progresivo
  if (timeSpentEl) timeSpentEl.innerText = '0.0s';
  const isNegativeXP = pointsEarnedEl && (pointsEarnedEl.classList.contains('duel-xp-loser') || pointsEarnedEl.innerText.includes('-'));
  const xpPrefix = isNegativeXP ? '-' : '+';
  if (pointsEarnedEl) pointsEarnedEl.innerText = `${xpPrefix}0 XP`;
  if (coinsEarnedEl) coinsEarnedEl.innerText = '+0 RC';

  // Limpiar clases de animación previas de elementos
  [activePodium, podiumVs, podiumWinner, roundBadgeWrap, outcomeTitle, perfCard, activeActionButton, btnPassTurn, finalActions].forEach(el => {
    if (el) {
      el.classList.remove('drop-from-ceiling', 'fade-in-micro-scale', 'rise-from-floor', 'rise-from-floor-fast', 'pop-highlight', 'btn-attention-pulse', 'golden-gleam-pill');
    }
  });

  // Limpiar emojis flotantes previos
  resultsView.querySelectorAll('.float-emoji-up').forEach(em => em.remove());

  // Activar ensamblado (opacity: 0 inicial en CSS)
  resultsView.classList.remove('anim-assembling');
  void resultsView.offsetWidth;
  resultsView.classList.add('anim-assembling');

  // A. PASO 1 (0ms): Contenedor central VS cae desde arriba con dropFromCeiling (duración: 420ms)
  if (activePodium) {
    activePodium.classList.add('drop-from-ceiling');
  }

  // B. PASO 2 (180ms): Píldora superior y título aparecen en fade-in con micro-escala
  addTimer(() => {
    if (roundBadgeWrap) roundBadgeWrap.classList.add('fade-in-micro-scale');
    if (outcomeTitle) outcomeTitle.classList.add('fade-in-micro-scale');
  }, 180);

  // C. PASO 3 (350ms): Tarjeta blanca sube desde abajo usando riseFromFloor (duración: 450ms)
  addTimer(() => {
    if (perfCard) perfCard.classList.add('rise-from-floor');
  }, 350);

  // D. PASO 4 (Contabilización de TIEMPO EMPLEADO - 700ms): 0.0s a real en 500ms
  addTimer(() => {
    if (!timeSpentEl) return;
    const duration = 500;
    const startT = performance.now();

    function stepTime(now) {
      const elapsed = now - startT;
      const progress = Math.min(1, elapsed / duration);
      const currentVal = (progress * targetTimeSec).toFixed(1);
      timeSpentEl.innerText = `${currentVal}s`;

      if (progress < 1) {
        const id = requestAnimationFrame(stepTime);
        window._duelResultsAnimRafs.push(id);
      } else {
        timeSpentEl.innerText = `${targetTimeSec.toFixed(1)}s`;

        // Emoji flotante según el tiempo empleado:
        // <= 20s: ⚡ | 20s-35s: ⏱️ | > 35s: 🐢
        let emoji = '⚡';
        if (targetTimeSec <= 20) {
          emoji = '⚡';
        } else if (targetTimeSec <= 35) {
          emoji = '⏱️';
        } else {
          emoji = '🐢';
        }

        const timeBox = timeSpentEl.closest('.perf-stat-box');
        if (timeBox) {
          const emojiSpan = document.createElement('span');
          emojiSpan.className = 'float-emoji-up';
          emojiSpan.innerText = emoji;
          timeBox.appendChild(emojiSpan);
          setTimeout(() => {
            emojiSpan.remove();
          }, 1050);
        }
      }
    }
    const id = requestAnimationFrame(stepTime);
    window._duelResultsAnimRafs.push(id);
  }, 700);

  // E. PASO 5 (Contabilización de PUNTOS GANADOS - 1300ms): 0 a total en 450ms
  addTimer(() => {
    if (!pointsEarnedEl) return;
    const duration = 450;
    const startT = performance.now();

    function stepXP(now) {
      const elapsed = now - startT;
      const progress = Math.min(1, elapsed / duration);
      const currentXP = Math.round((1 - Math.pow(1 - progress, 2)) * targetXP);
      pointsEarnedEl.innerText = `${xpPrefix}${currentXP} XP`;

      if (progress < 1) {
        const id = requestAnimationFrame(stepXP);
        window._duelResultsAnimRafs.push(id);
      } else {
        pointsEarnedEl.innerText = `${xpPrefix}${targetXP} XP`;
        const xpBox = pointsEarnedEl.closest('.perf-stat-box');
        if (xpBox) {
          xpBox.classList.remove('pop-highlight');
          void xpBox.offsetWidth;
          xpBox.classList.add('pop-highlight');
          setTimeout(() => xpBox.classList.remove('pop-highlight'), 500);
        }

        // Sonido sutil de ganancia/pop
        if (typeof SoundManager !== 'undefined' && typeof SoundManager.playSFX === 'function') {
          SoundManager.playSFX('compra_tienda.wav', 0.25);
        }
      }
    }
    const id = requestAnimationFrame(stepXP);
    window._duelResultsAnimRafs.push(id);
  }, 1300);

  // F. PASO 6 (Contabilización de RETROCOINS - 1800ms): 0 a total en 400ms con 'coin_tick'
  addTimer(() => {
    if (!coinsEarnedEl) return;
    const duration = 400;
    const startT = performance.now();
    let lastDisplayed = -1;
    let lastAudioTick = 0;

    function stepCoins(now) {
      const elapsed = now - startT;
      const progress = Math.min(1, elapsed / duration);
      const currentCoins = Math.round((1 - Math.pow(1 - progress, 2)) * targetCoins);

      if (currentCoins !== lastDisplayed) {
        lastDisplayed = currentCoins;
        coinsEarnedEl.innerText = `+${currentCoins} RC`;

        if (now - lastAudioTick >= 45) {
          lastAudioTick = now;
          if (typeof playCoinTick === 'function') {
            playCoinTick();
          }
        }
      }

      if (progress < 1) {
        const id = requestAnimationFrame(stepCoins);
        window._duelResultsAnimRafs.push(id);
      } else {
        coinsEarnedEl.innerText = `+${targetCoins} RC`;
        const coinBox = coinsEarnedEl.closest('.perf-stat-box');
        if (coinBox) {
          coinBox.classList.remove('golden-gleam-pill', 'pop-highlight');
          void coinBox.offsetWidth;
          coinBox.classList.add('golden-gleam-pill');
          setTimeout(() => coinBox.classList.remove('golden-gleam-pill'), 500);
        }
      }
    }
    const id = requestAnimationFrame(stepCoins);
    window._duelResultsAnimRafs.push(id);
  }, 1800);

  // G. PASO 7 (Aparición del BOTÓN - 2300ms): Entra subiendo con riseFromFloor (350ms)
  addTimer(() => {
    if (activeActionButton) {
      activeActionButton.classList.add('rise-from-floor-fast');
    }
  }, 2300);

  // A los 2650ms: Activa de forma permanente la clase .btn-attention-pulse
  addTimer(() => {
    if (btnPassTurn) {
      btnPassTurn.classList.remove('rise-from-floor-fast');
      btnPassTurn.classList.add('btn-attention-pulse');
    }
    if (finalActions) {
      const btnRematch = document.getElementById('btnRematchDuel');
      if (btnRematch) {
        btnRematch.classList.remove('rise-from-floor-fast');
        btnRematch.classList.add('btn-attention-pulse');
      }
    }
  }, 2650);

  // 4. MANTENER INTERACTIVIDAD (2700ms): Remueve clases temporales para clicks inmediatos
  addTimer(() => {
    resultsView.classList.remove('anim-assembling');
    resultsView.style.overflow = '';

    if (activePodium) activePodium.classList.remove('drop-from-ceiling');
    if (roundBadgeWrap) roundBadgeWrap.classList.remove('fade-in-micro-scale');
    if (outcomeTitle) outcomeTitle.classList.remove('fade-in-micro-scale');
    if (perfCard) perfCard.classList.remove('rise-from-floor');
    if (activeActionButton) activeActionButton.classList.remove('rise-from-floor-fast');
  }, 2700);
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

function getCountryFlag(code) {
  if (!code) return '🌎';
  const flags = {
    'BO': '🇧🇴',
    'PE': '🇵🇪',
    'MX': '🇲🇽',
    'AR': '🇦🇷',
    'CL': '🇨🇱',
    'CO': '🇨🇴',
    'ES': '🇪🇸',
    'EC': '🇪🇨',
    'UY': '🇺🇾',
    'PY': '🇵🇾',
    'VE': '🇻🇪',
    'US': '🇺🇸',
    'WORLD': '🌎'
  };
  return flags[String(code).toUpperCase()] || '🌎';
}
window.getCountryFlag = getCountryFlag;

function setupDuelMatchUI(rivalName = 'Usuario 2', rivalAvatar = '🕹️', round = 1, rivalCountry = null) {
  const localCountry = window.state?.userCountry || localStorage.getItem('retroquiz_user_country') || 'BO';
  const rivalCountryCode = rivalCountry || state.currentDuel?.rivalCountry || 'WORLD';
  const localFlag = getCountryFlag(localCountry);
  const rivalFlag = getCountryFlag(rivalCountryCode);

  state.currentDuel = {
    ...state.currentDuel,
    rivalName: rivalName,
    rivalAvatar: rivalAvatar,
    rivalCountry: rivalCountryCode,
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

  const localNameEl = document.getElementById('duelLocalName') || document.querySelector('.duel-player-local .duel-player-name');
  if (localNameEl) localNameEl.innerText = `${window.state?.username || state.username || localStorage.getItem('retroquiz_username') || 'Tú'} ${localFlag}`;

  const localBadge = document.getElementById('duelLocalCountryBadge');
  if (localBadge) localBadge.innerText = localFlag;

  const nameEl = document.getElementById('duelRivalName');
  if (nameEl) nameEl.innerText = `${rivalName} ${rivalFlag}`;

  const rivalBadge = document.getElementById('duelRivalCountryBadge');
  if (rivalBadge) rivalBadge.innerText = rivalFlag;

  const avatarEl = document.querySelector('#duelRivalAvatar span');
  if (avatarEl) avatarEl.innerText = rivalAvatar;

  const handicapRivalEl = document.getElementById('duelHandicapRival');
  if (handicapRivalEl) handicapRivalEl.innerText = `${rivalName} ${rivalFlag}`;
}

function triggerWheelEntranceAnimations() {
  const wheelView = document.getElementById('wheelView');
  if (!wheelView) return;

  wheelView.classList.remove('run-stagger-assembly', 'anim-assembling');
  void wheelView.offsetWidth; // Forzar reflow para reiniciar la animación
  wheelView.classList.add('run-stagger-assembly');

  // Pasados 800ms (al concluir la coreografía completa), retira las clases de animación
  // para asegurar que el disco de la ruleta pueda rotar con total libertad al hacer clic en "GIRAR" sin bloqueos de CSS
  setTimeout(() => {
    wheelView.classList.remove('run-stagger-assembly', 'anim-assembling');
  }, 800);
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
      updateShotsUI();
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
      triggerResultsEntranceAnimation();
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

// Compra exclusiva de packs temáticos con moneda virtual interna (RetroCoins)
function comprarThematicPack(packId) {
  if (packId === 'cine_2000' || packId === 'pack_cine_2000') {
    packId = 'vecinos_springfield';
  }
  if (packId === 'videojuegos_retro' || packId === 'videojuegos_clasicos') {
    packId = 'heroes_multiverso';
  }
  if (packId === 'series_iconicas' || packId === 'tv_series') {
    packId = 'galaxias_lejanas';
  }
  if (packId === 'artistas_latinos' || packId === 'musica_latina') {
    packId = 'guerreros_ki';
  }
  if (packId === 'puro_90s' || packId === 'pack_puro_90s') {
    packId = 'reino_champinon';
  }
  if (packId === 'puro_80s' || packId === 'pack_puro_80s') {
    packId = 'castillo_magia';
  }
  const pack = THEMATIC_PACKS.find(p => p.id === packId);
  if (!pack) return;

  const currentCoins = (window.state && window.state.coins !== undefined) ? window.state.coins : (state.coins || 0);
  const cost = pack.price || pack.priceCoins || 5000;

  if (!state.unlockedPacks) state.unlockedPacks = [];
  if (window.state && !window.state.unlockedPacks) window.state.unlockedPacks = [];

  const currentUnlocked = window.state?.unlockedPacks || state.unlockedPacks;
  if (currentUnlocked.includes(packId)) {
    showRetroToast(`¡Ya tienes el pack "${pack.name}"!`, 'info');
    return;
  }

  // 1. Verificar saldo de RetroCoins
  if (currentCoins < cost) {
    if (typeof SoundManager !== 'undefined') SoundManager.playSFX('derrota.wav', 0.6);
    showRetroToast(`Necesitas ${cost.toLocaleString()} RetroCoins para desbloquear este pack. ¡Gánalas jugando!`, 'warning');
    return;
  }

  // 2. Descontar saldo con saveCoinsToCloud
  const newBalance = currentCoins - cost;
  state.coins = newBalance;
  if (window.state) window.state.coins = newBalance;
  if (typeof saveCoinsToCloud === 'function') {
    saveCoinsToCloud(newBalance);
  } else if (typeof window.saveCoinsToCloud === 'function') {
    window.saveCoinsToCloud(newBalance);
  }

  // 3. Agregar el ID a unlockedPacks y guardar en Firestore
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
  return true;
}
window.comprarThematicPack = comprarThematicPack;

// =============================================================================
// MODAL DE DETALLE / INSPECCIÓN DE PACKS TEMÁTICOS (#packDetailModal)
// =============================================================================
function resolveThematicPackId(rawPackId) {
  if (rawPackId === 'cine_2000' || rawPackId === 'pack_cine_2000') return 'vecinos_springfield';
  if (rawPackId === 'videojuegos_retro' || rawPackId === 'videojuegos_clasicos') return 'heroes_multiverso';
  if (rawPackId === 'series_iconicas' || rawPackId === 'tv_series') return 'galaxias_lejanas';
  if (rawPackId === 'artistas_latinos' || rawPackId === 'musica_latina') return 'guerreros_ki';
  if (rawPackId === 'puro_90s' || rawPackId === 'pack_puro_90s') return 'reino_champinon';
  if (rawPackId === 'puro_80s' || rawPackId === 'pack_puro_80s') return 'castillo_magia';
  return rawPackId;
}

function openPackDetailModal(rawPackId) {
  const packId = resolveThematicPackId(rawPackId);
  const pack = (window.THEMATIC_PACKS || THEMATIC_PACKS).find(p => p.id === packId);
  if (!pack) return;

  const modal = document.getElementById('packDetailModal');
  if (!modal) return;

  const unlockedPacks = window.state?.unlockedPacks || state.unlockedPacks || [];
  const isUnlocked = state.allCategoriesUnlocked || state.allUnlocked || unlockedPacks.includes(pack.id) ||
    (pack.id === 'vecinos_springfield' && unlockedPacks.includes('cine_2000')) ||
    (pack.id === 'heroes_multiverso' && (unlockedPacks.includes('videojuegos_retro') || unlockedPacks.includes('videojuegos_clasicos'))) ||
    (pack.id === 'galaxias_lejanas' && (unlockedPacks.includes('series_iconicas') || unlockedPacks.includes('tv_series'))) ||
    (pack.id === 'guerreros_ki' && (unlockedPacks.includes('artistas_latinos') || unlockedPacks.includes('musica_latina'))) ||
    (pack.id === 'reino_champinon' && (unlockedPacks.includes('puro_90s') || unlockedPacks.includes('pack_puro_90s'))) ||
    (pack.id === 'castillo_magia' && (unlockedPacks.includes('puro_80s') || unlockedPacks.includes('pack_puro_80s')));

  // Título
  const titleEl = document.getElementById('packDetailTitle');
  if (titleEl) titleEl.innerText = pack.name;

  // Pill temática / categoría
  const pillEl = document.getElementById('packDetailPill');
  if (pillEl) {
    pillEl.innerText = pack.badge || pack.category || 'PACK TEMÁTICO';
    let catBg = '#FFE600';
    let catTextColor = '#000000';
    if (pack.id === 'castillo_magia' || pack.category === 'CINE & LITERATURA') {
      catBg = '#7928CA';
      catTextColor = '#FFFFFF';
    } else if (pack.id === 'reino_champinon') {
      catBg = '#00E676';
      catTextColor = '#000000';
    } else if (pack.id === 'guerreros_ki') {
      catBg = '#FF6600';
      catTextColor = '#FFFFFF';
    } else if (pack.category === 'ANIMACIÓN' || pack.id === 'vecinos_springfield') {
      catBg = '#00F0FF';
      catTextColor = '#000000';
    } else if (pack.id === 'galaxias_lejanas') {
      catBg = '#00D2FF';
      catTextColor = '#000000';
    } else if (pack.category === 'CINE & SERIES' || pack.id === 'heroes_multiverso') {
      catBg = '#FF2A55';
      catTextColor = '#FFFFFF';
    }
    pillEl.style.background = catBg;
    pillEl.style.color = catTextColor;
  }

  // Imagen de la caja 3D
  const imgEl = document.getElementById('packDetailBoxImg');
  if (imgEl) {
    const isSpringfield = pack.id === 'vecinos_springfield';
    const isMultiverso = pack.id === 'heroes_multiverso';
    const isGalaxias = pack.id === 'galaxias_lejanas';
    const isKi = pack.id === 'guerreros_ki';
    const isReino = pack.id === 'reino_champinon';
    const isMagia = pack.id === 'castillo_magia';
    const boxImg = pack.coverImage || pack.boxImage || (isSpringfield ? 'assets/pantalla_colecciones/caja_springfield.webp' : (isMultiverso ? 'assets/pantalla_colecciones/caja_multiverso.webp' : (isGalaxias ? 'assets/pantalla_colecciones/caja_galaxias.webp' : (isKi ? 'assets/pantalla_colecciones/caja_ki.webp' : (isReino ? 'assets/pantalla_colecciones/caja_reino.webp' : (isMagia ? 'assets/pantalla_colecciones/caja_magia.webp' : ''))))));
    imgEl.src = boxImg;
    imgEl.alt = pack.name;
  }

  // Descripción
  const descEl = document.getElementById('packDetailDesc');
  if (descEl) {
    descEl.innerText = pack.description || '';
  }

  // Contador total
  const counterEl = document.getElementById('packDetailQuestionCount');
  if (counterEl) {
    counterEl.innerText = `Total: ${pack.totalQuestions || 50} Preguntas Exclusivas`;
  }

  // Botón de acción
  const actionContainer = document.getElementById('packDetailActionContainer');
  if (actionContainer) {
    if (isUnlocked) {
      actionContainer.innerHTML = `
        <button class="pack-detail-action-btn btn-play interactive-press" id="btnPackDetailAction" onclick="closePackDetailModal(); iniciarJuegoPack('${pack.id}');">
          JUGAR PACK ▶
        </button>
      `;
    } else {
      actionContainer.innerHTML = `
        <button class="pack-detail-action-btn btn-buy interactive-press" id="btnPackDetailAction" onclick="handleBuyPackFromModal('${pack.id}')">
          COMPRAR POR 🪙 ${(pack.price || pack.priceCoins || 5000).toLocaleString()}
        </button>
      `;
    }
  }

  modal.classList.add('open');
  if (typeof playModalOpenSound === 'function') {
    playModalOpenSound();
  } else if (typeof SoundManager !== 'undefined' && typeof SoundManager.playSFX === 'function') {
    SoundManager.playSFX('modal_pop.wav', 0.5);
  }
}

function closePackDetailModal() {
  const modal = document.getElementById('packDetailModal');
  if (modal) {
    modal.classList.remove('open');
    if (typeof playClickSound === 'function') playClickSound();
  }
}

function handleBuyPackFromModal(rawPackId) {
  const packId = resolveThematicPackId(rawPackId);
  const pack = (window.THEMATIC_PACKS || THEMATIC_PACKS).find(p => p.id === packId);
  const cost = pack ? (pack.price || pack.priceCoins || 5000) : 5000;
  const currentCoins = (window.state && window.state.coins !== undefined) ? window.state.coins : (state.coins || 0);

  if (currentCoins < cost) {
    if (typeof SoundManager !== 'undefined') SoundManager.playSFX('derrota.wav', 0.6);
    showRetroToast(`Necesitas ${cost.toLocaleString()} RetroCoins para desbloquear este pack. ¡Gánalas jugando!`, 'warning');
    return;
  }

  comprarThematicPack(packId);

  const unlockedPacks = window.state?.unlockedPacks || state.unlockedPacks || [];
  if (unlockedPacks.includes(packId)) {
    const actionContainer = document.getElementById('packDetailActionContainer');
    if (actionContainer) {
      actionContainer.innerHTML = `
        <button class="pack-detail-action-btn btn-play interactive-press" id="btnPackDetailAction" onclick="closePackDetailModal(); iniciarJuegoPack('${packId}');">
          JUGAR PACK ▶
        </button>
      `;
    }
  }
}

window.resolveThematicPackId = resolveThematicPackId;
window.openPackDetailModal = openPackDetailModal;
window.closePackDetailModal = closePackDetailModal;
window.handleBuyPackFromModal = handleBuyPackFromModal;

// Modo Directo: JUGAR PACK ▶ (Ultra-blindado: fetch multiruta, soporte local file://, banco integrado 100% resiliente)
async function iniciarJuegoPack(packId) {
  if (packId === 'cine_2000' || packId === 'pack_cine_2000') {
    packId = 'vecinos_springfield';
  }
  if (packId === 'videojuegos_retro' || packId === 'videojuegos_clasicos') {
    packId = 'heroes_multiverso';
  }
  if (packId === 'series_iconicas' || packId === 'tv_series') {
    packId = 'galaxias_lejanas';
  }
  if (packId === 'artistas_latinos' || packId === 'musica_latina') {
    packId = 'guerreros_ki';
  }
  if (packId === 'puro_90s' || packId === 'pack_puro_90s') {
    packId = 'reino_champinon';
  }
  if (packId === 'puro_80s' || packId === 'pack_puro_80s') {
    packId = 'castillo_magia';
  }
  
  if (typeof SoundManager !== 'undefined' && typeof SoundManager.playSFX === 'function') {
    SoundManager.playSFX('botones.wav', 0.60);
  } else if (typeof playClickSound === 'function') {
    playClickSound();
  }

  try {
    const pack = THEMATIC_PACKS.find(p => p.id === packId);
    if (!pack) throw new Error("Pack no encontrado: " + packId);

    let preguntas = null;

    // 1. Intentar carga por fetch probando múltiples variaciones de ruta (con y sin query string)
    const candidateUrls = [
      `${pack.file}?v=${Date.now()}`,
      pack.file,
      `./${pack.file}`
    ];
    if (pack.id === 'vecinos_springfield') {
      candidateUrls.push(
        'data/pack_springfield.json',
        `data/pack_springfield.json?v=${Date.now()}`,
        './data/pack_springfield.json',
        'data/vecinos_springfield.json',
        `data/vecinos_springfield.json?v=${Date.now()}`
      );
    } else if (pack.id === 'heroes_multiverso') {
      candidateUrls.push(
        'data/pack_multiverso.json',
        `data/pack_multiverso.json?v=${Date.now()}`,
        './data/pack_multiverso.json'
      );
    } else if (pack.id === 'galaxias_lejanas') {
      candidateUrls.push(
        'data/pack_galaxias.json',
        `data/pack_galaxias.json?v=${Date.now()}`,
        './data/pack_galaxias.json'
      );
    } else if (pack.id === 'guerreros_ki') {
      candidateUrls.push(
        'data/pack_ki.json',
        `data/pack_ki.json?v=${Date.now()}`,
        './data/pack_ki.json'
      );
    } else if (pack.id === 'reino_champinon') {
      candidateUrls.push(
        'data/pack_reino.json',
        `data/pack_reino.json?v=${Date.now()}`,
        './data/pack_reino.json'
      );
    } else if (pack.id === 'castillo_magia') {
      candidateUrls.push(
        'data/pack_magia.json',
        `data/pack_magia.json?v=${Date.now()}`,
        './data/pack_magia.json'
      );
    }

    for (const testUrl of candidateUrls) {
      try {
        const res = await fetch(testUrl, { cache: 'no-store' });
        if (res && res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (json && json.preguntas);
          if (Array.isArray(list) && list.length > 0) {
            preguntas = list;
            break;
          }
        }
      } catch (fetchErr) {
        // Fallo de red o bloqueo CORS en file:// (continuar intentando)
      }
    }

    // 2. Si fetch no pudo obtener preguntas (ej: protocolo file://, sin servidor local, offline), usar el banco integrado
    if (!preguntas || preguntas.length === 0) {
      if (pack.id === 'vecinos_springfield') {
        const fallbackBank = (typeof window !== 'undefined' && window.SPRINGFIELD_QUESTIONS_FALLBACK)
          ? window.SPRINGFIELD_QUESTIONS_FALLBACK
          : (typeof SPRINGFIELD_QUESTIONS_FALLBACK !== 'undefined' ? SPRINGFIELD_QUESTIONS_FALLBACK : null);

        if (Array.isArray(fallbackBank) && fallbackBank.length > 0) {
          console.info("Cargando preguntas de Springfield desde el banco integrado local (100% disponible)...");
          preguntas = JSON.parse(JSON.stringify(fallbackBank));
        }
      } else if (pack.id === 'heroes_multiverso') {
        const fallbackBank = (typeof window !== 'undefined' && window.MULTIVERSO_QUESTIONS_FALLBACK)
          ? window.MULTIVERSO_QUESTIONS_FALLBACK
          : (typeof MULTIVERSO_QUESTIONS_FALLBACK !== 'undefined' ? MULTIVERSO_QUESTIONS_FALLBACK : null);

        if (Array.isArray(fallbackBank) && fallbackBank.length > 0) {
          console.info("Cargando preguntas de Héroes del Multiverso desde el banco integrado local (100% disponible)...");
          preguntas = JSON.parse(JSON.stringify(fallbackBank));
        }
      } else if (pack.id === 'galaxias_lejanas') {
        const fallbackBank = (typeof window !== 'undefined' && window.GALAXIAS_QUESTIONS_FALLBACK)
          ? window.GALAXIAS_QUESTIONS_FALLBACK
          : (typeof GALAXIAS_QUESTIONS_FALLBACK !== 'undefined' ? GALAXIAS_QUESTIONS_FALLBACK : null);

        if (Array.isArray(fallbackBank) && fallbackBank.length > 0) {
          console.info("Cargando preguntas de Galaxias Lejanas desde el banco integrado local (100% disponible)...");
          preguntas = JSON.parse(JSON.stringify(fallbackBank));
        }
      } else if (pack.id === 'guerreros_ki') {
        const fallbackBank = (typeof window !== 'undefined' && window.KI_QUESTIONS_FALLBACK)
          ? window.KI_QUESTIONS_FALLBACK
          : (typeof KI_QUESTIONS_FALLBACK !== 'undefined' ? KI_QUESTIONS_FALLBACK : null);

        if (Array.isArray(fallbackBank) && fallbackBank.length > 0) {
          console.info("Cargando preguntas de Guerreros del Ki desde el banco integrado local (100% disponible)...");
          preguntas = JSON.parse(JSON.stringify(fallbackBank));
        }
      } else if (pack.id === 'reino_champinon') {
        const fallbackBank = (typeof window !== 'undefined' && window.REINO_QUESTIONS_FALLBACK)
          ? window.REINO_QUESTIONS_FALLBACK
          : (typeof REINO_QUESTIONS_FALLBACK !== 'undefined' ? REINO_QUESTIONS_FALLBACK : null);

        if (Array.isArray(fallbackBank) && fallbackBank.length > 0) {
          console.info("Cargando preguntas de Reino Champiñón desde el banco integrado local (100% disponible)...");
          preguntas = JSON.parse(JSON.stringify(fallbackBank));
        }
      } else if (pack.id === 'castillo_magia') {
        const fallbackBank = (typeof window !== 'undefined' && window.MAGIA_QUESTIONS_FALLBACK)
          ? window.MAGIA_QUESTIONS_FALLBACK
          : (typeof MAGIA_QUESTIONS_FALLBACK !== 'undefined' ? MAGIA_QUESTIONS_FALLBACK : null);

        if (Array.isArray(fallbackBank) && fallbackBank.length > 0) {
          console.info("Cargando preguntas de Castillo de Magia desde el banco integrado local (100% disponible)...");
          preguntas = JSON.parse(JSON.stringify(fallbackBank));
        }
      }

      if (!preguntas || preguntas.length === 0) {
        if (typeof getEmergencyQuestionsForCategory === 'function') {
          const catName = (pack.category && pack.category.includes('ANIM')) ? 'ANIMACIÓN' : (pack.category && pack.category.includes('VIDEO') ? 'VIDEOJUEGOS' : 'CINE');
          preguntas = JSON.parse(JSON.stringify(getEmergencyQuestionsForCategory(catName, false)));
        }
      }
    }

    if (!preguntas || preguntas.length === 0) {
      throw new Error("No se pudieron cargar preguntas del pack desde la red ni desde el banco integrado");
    }

    // Barajar preguntas con Fisher-Yates
    for (let i = preguntas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [preguntas[i], preguntas[j]] = [preguntas[j], preguntas[i]];
    }

    // Configurar estado de la trivia temática (10 preguntas por tanda)
    const roundQuestions = preguntas.slice(0, 10);
    if (!window.state) window.state = (typeof state !== 'undefined' ? state : {});
    window.state.activeThematicPack = pack.id;
    window.state.activeThematicPackId = pack.id;
    state.activeThematicPack = pack.id;
    state.activeThematicPackId = pack.id;
    window.state.currentRoundQuestions = roundQuestions;
    window.state.currentQuestionIndex = 0;
    window.state.lives = 3;
    window.state.correctAnswersCount = 0;
    window.state.currentRoundXP = 0;
    window.state.accumulatedAnswerTimeMs = 0;
    window.state.isChallengeMode = false;
    window.state.isTieBreaker = false;

    state.isChallengeMode = false;
    state.isTieBreaker = false;
    state.currentRoundXP = 0;
    state.correctAnswersCount = 0;

    if (!state.trivia) state.trivia = {};
    state.trivia.isDuel = false;
    state.trivia.questions = roundQuestions;
    state.trivia.totalQuestions = roundQuestions.length;
    const tiempoBase = 20;
    window.state.timeLeft = tiempoBase;
    state.trivia.timerSeconds = tiempoBase;
    state.trivia.remainingMs = tiempoBase * 1000;
    state.trivia.duelStartTime = performance.now();
    state.trivia.questionStartTime = performance.now();
    state.trivia.lives = 3;
    state.trivia.sessionCoins = 0;
    state.trivia.sessionXP = 0;
    state.trivia.currentStreak = 0;
    state.trivia.correctAnswersCount = 0;
    state.trivia.currentQuestionIndex = 0;
    state.trivia.isAnswering = false;
    state.trivia.category = (pack.category || 'CINE & LITERATURA').toLowerCase();

    // Configurar tema visual de trivia según categoría
    const triviaView = document.getElementById('triviaView');
    const triviaCard = document.getElementById('triviaCard');
    let themeColor = '#00FF66'; // Animación por defecto
    let catClass = 'animacion';
    const normCat = (pack.category || '').toUpperCase();
    if (pack.id === 'castillo_magia') {
      themeColor = '#7928CA'; // Púrpura magia / hechicería
      catClass = 'cine';
    } else if (pack.id === 'reino_champinon') {
      themeColor = '#00E676'; // Verde esmeralda Reino Champiñón
      catClass = 'videojuegos';
    } else if (pack.id === 'guerreros_ki') {
      themeColor = '#FF6600'; // Naranja vibrante Ki / Super Saiyajin
      catClass = 'animacion';
    } else if (pack.id === 'galaxias_lejanas') {
      themeColor = '#00D2FF'; // Azul/cian espacial Galaxias Lejanas
      catClass = 'cine';
    } else if (pack.id === 'heroes_multiverso' || normCat.includes('CINE & SERIES') || (normCat.includes('CINE') && normCat.includes('SERIE'))) {
      themeColor = '#FF2A55'; // Carmesí arcade héroes
      catClass = 'cine';
    } else if (normCat.includes('VIDEO') || normCat.includes('JUEGO')) {
      themeColor = '#B5DC35';
      catClass = 'videojuegos';
    } else if (normCat.includes('TV')) {
      themeColor = '#00E5FF';
      catClass = 'tv';
    } else if (normCat.includes('ANIM') || normCat.includes('DIBUJ') || normCat.includes('ANIME')) {
      themeColor = '#00FF66';
      catClass = 'animacion';
    } else if (normCat.includes('MUS') || normCat.includes('MÚS')) {
      themeColor = '#00FF66';
      catClass = 'animacion';
    } else if (normCat.includes('80') || normCat.includes('90') || normCat.includes('ÉPOCA')) {
      themeColor = '#FF5A5F';
      catClass = 'todo';
    }

    if (triviaView) {
      triviaView.style.setProperty('--trivia-theme-color', themeColor);
      triviaView.dataset.cat = catClass;
      triviaView.classList.remove('siren-panic', 'cat-cine', 'cat-videojuegos', 'cat-musica', 'cat-tv', 'cat-todo', 'cat-mix', 'cat-animacion', 'theme-animacion');
      triviaView.classList.add('cat-' + catClass);
      if (catClass === 'animacion') {
        triviaView.classList.add('theme-animacion');
      }
    }

    if (triviaCard) {
      triviaCard.classList.remove('theme-animacion');
      if (catClass === 'animacion') {
        triviaCard.classList.add('theme-animacion');
      }
    }

    const catTag = document.getElementById('triviaCategoryTag');
    if (catTag) {
      catTag.textContent = (pack.id === 'castillo_magia') ? 'CINE & LITERATURA' : ((pack.id === 'heroes_multiverso' || pack.id === 'galaxias_lejanas') ? 'CINE & SERIES' : (pack.id === 'reino_champinon' ? 'VIDEOJUEGOS' : (((catClass === 'animacion') || pack.id === 'guerreros_ki') ? 'ANIMACIÓN' : (pack.category || 'TRIVIA').toUpperCase())));
      if (catClass === 'animacion') {
        catTag.classList.add('theme-animacion');
      } else {
        catTag.classList.remove('theme-animacion');
      }
    }

    const abandonModal = document.getElementById('abandonModal');
    if (abandonModal) abandonModal.style.display = 'none';

    if (typeof updateTriviaHeartsUI === 'function') updateTriviaHeartsUI();
    if (typeof updateRoundCoinsUI === 'function') updateRoundCoinsUI(0);

    // Cerrar cualquier modal abierto (incluyendo #packDetailModal)
    if (typeof closePackDetailModal === 'function') closePackDetailModal();
    document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));

    // Detener música previa para dar paso al conteo
    if (typeof SoundManager !== 'undefined') {
      if (typeof SoundManager.stopSpinSound === 'function') SoundManager.stopSpinSound();
      if (typeof SoundManager.stopAllBGM === 'function') SoundManager.stopAllBGM();
    }

    // OVERLAY DEL CONTEO REGRESIVO (3 -> 2 -> 1 -> ¡YA!)
    const overlay = document.getElementById('wheelLandingOverlay');
    const badge = document.getElementById('landingCatBadge');
    const iconEl = document.getElementById('landingCatIcon');
    const nameEl = document.getElementById('landingCatName');
    const numEl = document.getElementById('landingCountNumber');

    const packIcon = (pack.icon ? pack.icon.split(' ')[0] : '🕹️');
    if (iconEl) iconEl.innerText = packIcon;
    if (nameEl) {
      nameEl.innerText = pack.name.toUpperCase();
      const isBrightColor = (themeColor === '#FFE600' || themeColor === '#00E676' || themeColor === '#00F0FF' || themeColor === '#00D2FF');
      nameEl.style.color = isBrightColor ? '#000000' : '#FFFFFF';
      nameEl.style.textShadow = isBrightColor ? 'none' : '2px 2px 0px #000000';
    }
    if (badge) badge.style.backgroundColor = themeColor;

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

    // Segundo 1: Muestra "3" con sonido beep
    let count = 3;
    setNumberWithPop('3', 600);

    if (window._packCountdownInterval) {
      clearInterval(window._packCountdownInterval);
      window._packCountdownInterval = null;
    }

    window._packCountdownInterval = setInterval(() => {
      count--;
      if (count === 2) {
        // Segundo 2: Muestra "2"
        setNumberWithPop('2', 800);
      } else if (count === 1) {
        // Segundo 3: Muestra "1"
        setNumberWithPop('1', 1000);
      } else if (count === 0) {
        // Muestra "¡YA!"
        setNumberWithPop('¡YA!', 1200);
      } else {
        clearInterval(window._packCountdownInterval);
        window._packCountdownInterval = null;

        // Ocultar overlay del conteo
        if (overlay) overlay.classList.remove('show');

        // Ocultar colecciones y tienda
        const collectionView = document.getElementById('collectionView') || document.getElementById('collectionsView');
        if (collectionView) {
          collectionView.classList.remove('active', 'active-view');
          collectionView.style.display = 'none';
        }
        const storeView = document.getElementById('storeView');
        if (storeView) {
          storeView.classList.remove('active', 'active-view');
          storeView.style.display = 'none';
        }

        // Transición e inicio de la partida de trivia
        state.activeTab = 'trivia';
        if (typeof showView === 'function') {
          showView('#triviaView');
        }
        if (window.location.hash !== '#trivia') {
          try { history.replaceState(null, '', '#trivia'); } catch(e) { window.location.hash = '#trivia'; }
        }

        renderizarPreguntaActual();

        if (typeof iniciarTemporizador === 'function') {
          iniciarTemporizador();
        }
        if (window.SoundManager && typeof window.SoundManager.playBGM === 'function') {
          window.SoundManager.playBGM('trivia');
        }
      }
    }, 950);

  } catch (err) {
    console.error("Fallo detallado cargando pack:", err);
    if (typeof showToast === 'function') {
      showToast("Error al cargar las preguntas del pack");
    } else if (typeof showRetroToast === 'function') {
      showRetroToast("Error al cargar las preguntas del pack", '⚠️');
    }
  }
}
window.iniciarJuegoPack = iniciarJuegoPack;
window.jugarPack = iniciarJuegoPack;
window.jugarThematicPack = iniciarJuegoPack;

// Renderizado dinámico de tarjetas en "MIS COLECCIONES" (#collectionView / #collectionsView)
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
    const isUnlocked = state.allCategoriesUnlocked || state.allUnlocked || unlockedPacks.includes(pack.id) ||
      (pack.id === 'vecinos_springfield' && unlockedPacks.includes('cine_2000')) ||
      (pack.id === 'heroes_multiverso' && (unlockedPacks.includes('videojuegos_retro') || unlockedPacks.includes('videojuegos_clasicos'))) ||
      (pack.id === 'galaxias_lejanas' && (unlockedPacks.includes('series_iconicas') || unlockedPacks.includes('tv_series'))) ||
      (pack.id === 'guerreros_ki' && (unlockedPacks.includes('artistas_latinos') || unlockedPacks.includes('musica_latina'))) ||
      (pack.id === 'reino_champinon' && (unlockedPacks.includes('puro_90s') || unlockedPacks.includes('pack_puro_90s'))) ||
      (pack.id === 'castillo_magia' && (unlockedPacks.includes('puro_80s') || unlockedPacks.includes('pack_puro_80s')));
    
    // Lectura de dominio acumulado (soporta array de preguntas dominadas o conteo numérico)
    let rawMastery = packMastery[pack.id];
    if (rawMastery === undefined || rawMastery === null) {
      if (pack.id === 'vecinos_springfield') rawMastery = packMastery['cine_2000'];
      else if (pack.id === 'heroes_multiverso') rawMastery = packMastery['videojuegos_retro'] || packMastery['videojuegos_clasicos'];
      else if (pack.id === 'galaxias_lejanas') rawMastery = packMastery['series_iconicas'] || packMastery['tv_series'];
      else if (pack.id === 'guerreros_ki') rawMastery = packMastery['artistas_latinos'] || packMastery['musica_latina'];
      else if (pack.id === 'reino_champinon') rawMastery = packMastery['puro_90s'] || packMastery['pack_puro_90s'];
      else if (pack.id === 'castillo_magia') rawMastery = packMastery['puro_80s'] || packMastery['pack_puro_80s'];
    }
    const totalQuestions = pack.totalQuestions || 50;
    const masteryCount = Array.isArray(rawMastery)
      ? Math.min(totalQuestions, rawMastery.length)
      : Math.min(totalQuestions, Math.max(0, parseInt(rawMastery, 10) || 0));
    const masteryPercent = Math.min(100, Math.round((masteryCount / totalQuestions) * 100));

    const isSpringfield = pack.id === 'vecinos_springfield';
    const isMultiverso = pack.id === 'heroes_multiverso';
    const isGalaxias = pack.id === 'galaxias_lejanas';
    const isKi = pack.id === 'guerreros_ki';
    const isReino = pack.id === 'reino_champinon';
    const isMagia = pack.id === 'castillo_magia';
    const boxImg = pack.coverImage || pack.boxImage || (isSpringfield ? 'assets/pantalla_colecciones/caja_springfield.webp' : (isMultiverso ? 'assets/pantalla_colecciones/caja_multiverso.webp' : (isGalaxias ? 'assets/pantalla_colecciones/caja_galaxias.webp' : (isKi ? 'assets/pantalla_colecciones/caja_ki.webp' : (isReino ? 'assets/pantalla_colecciones/caja_reino.webp' : (isMagia ? 'assets/pantalla_colecciones/caja_magia.webp' : null))))));
    
    let catBg = '#FFE600';
    let catTextColor = '#000000';
    if (isMagia || pack.category === 'CINE & LITERATURA') {
      catBg = '#7928CA';
      catTextColor = '#FFFFFF';
    } else if (isReino) {
      catBg = '#00E676';
      catTextColor = '#000000';
    } else if (isKi) {
      catBg = '#FF6600';
      catTextColor = '#FFFFFF';
    } else if (pack.category === 'ANIMACIÓN' || isSpringfield) {
      catBg = '#00F0FF';
      catTextColor = '#000000';
    } else if (isGalaxias) {
      catBg = '#00D2FF';
      catTextColor = '#000000';
    } else if (pack.category === 'CINE & SERIES' || isMultiverso) {
      catBg = '#FF2A55';
      catTextColor = '#FFFFFF';
    }

    const fillClass = isSpringfield ? 'fill-springfield' : (isMultiverso ? 'fill-multiverso' : (isGalaxias ? 'fill-galaxias' : (isKi ? 'fill-ki' : (isReino ? 'fill-reino' : (isMagia ? 'fill-magia' : '')))));

    return `
      <div class="collection-card interactive-press ${isUnlocked ? 'pack-unlocked' : 'pack-locked'} ${isSpringfield ? 'pack-springfield' : ''} ${isMultiverso ? 'pack-multiverso' : ''} ${isGalaxias ? 'pack-galaxias' : ''} ${isKi ? 'pack-ki' : ''} ${isReino ? 'pack-reino' : ''} ${isMagia ? 'pack-magia' : ''}" data-pack-id="${pack.id}" style="--i: ${idx};" onclick="openPackDetailModal('${pack.id}')">
        <!-- Columna Izquierda: Caja 3D del Pack -->
        <div class="collection-card-left">
          ${boxImg ? `
            <img src="${boxImg}" alt="${pack.name}" class="collection-pack-box-img">
          ` : `
            <div class="collection-pack-box-placeholder">
              <span class="pack-placeholder-icon">${pack.icon}</span>
            </div>
          `}
        </div>

        <!-- Columna Derecha: Información y Controles -->
        <div class="collection-card-right">
          <!-- Fila Superior: Categoría + Estado -->
          <div class="collection-card-top-row">
            <span class="collection-cat-pill" style="background: ${catBg}; color: ${catTextColor};">${pack.category || 'CINE & LITERATURA'}</span>
            <div class="collection-status-badge">
              ${isUnlocked ? '<span class="collection-badge-check">✓</span>' : '<span class="collection-badge-lock">🔒</span>'}
            </div>
          </div>

          <!-- Fila de Dominio: Texto + Barra horizontal compacta -->
          <div class="collection-mastery-block">
            <span class="collection-mastery-text">Progreso: ${masteryCount} / ${totalQuestions} Dominadas</span>
            <div class="collection-mastery-track">
              <div class="collection-mastery-fill ${fillClass}" style="width: ${masteryPercent}%;"></div>
            </div>
          </div>

          <!-- Botón de Acción Inferior a ancho completo -->
          ${isUnlocked ? `
            <button class="btn-collection-action interactive-press" onclick="event.stopPropagation(); iniciarJuegoPack('${pack.id}')">
              JUGAR PACK ▶
            </button>
          ` : `
            <button class="btn-collection-action interactive-press" onclick="event.stopPropagation(); openPackDetailModal('${pack.id}')">
              <img src="assets/global/retrocoin.webp" alt="RC" class="global-retrocoin-img mini-coin">
              <span>🪙 ${(pack.price || pack.priceCoins || 5000).toLocaleString()} RetroCoins</span>
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

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

  // Actualizar botones de temas estacionales y botón POR DEFECTO
  const resetBtn = document.getElementById('btnStoreResetTheme');
  const activeTheme = window.state?.themes?.active || state?.themes?.active || 'default';
  const unlockedThemes = window.state?.themes?.unlocked || state?.themes?.unlocked || ['default'];

  if (resetBtn) {
    if (activeTheme === 'default') {
      resetBtn.classList.add('is-active');
      resetBtn.style.opacity = '0.7';
      resetBtn.style.pointerEvents = 'none';
    } else {
      resetBtn.classList.remove('is-active');
      resetBtn.style.opacity = '1';
      resetBtn.style.pointerEvents = 'auto';
    }
  }

  const themeCards = document.querySelectorAll('.store-theme-card');
  themeCards.forEach(card => {
    const themeId = card.dataset.theme;
    const skin = THEME_SKINS[themeId];
    const cost = skin ? skin.cost : (parseInt(card.dataset.cost, 10) || 2500);
    const btn = card.querySelector('.btn-theme-action');
    if (!btn) return;

    const isUnlocked = unlockedThemes.includes(themeId);
    const isEquipped = (activeTheme === themeId);

    btn.classList.remove('is-equipped', 'is-purchased');

    if (isEquipped) {
      btn.classList.add('is-equipped');
      btn.style.pointerEvents = 'none';
      btn.innerHTML = '<span>EQUIPADO ✓</span>';
    } else if (isUnlocked) {
      btn.classList.add('is-purchased');
      btn.style.pointerEvents = 'auto';
      btn.innerHTML = '<span>EQUIPAR</span>';
    } else {
      btn.style.pointerEvents = 'auto';
      btn.innerHTML = `
        <span class="btn-theme-label">COMPRAR</span>
        <span class="btn-theme-price">
          <img src="assets/global/retrocoin.webp" alt="RC" class="global-retrocoin-img mini-coin">
          <span>${cost.toLocaleString()}</span>
        </span>
      `;
    }
  });

  // Sección 1: Packs de Preguntas sincronizados con THEMATIC_PACKS
  const packsScroll = document.getElementById('storePacksScroll');
  if (packsScroll && Array.isArray(window.THEMATIC_PACKS)) {
    const unlocked = window.state?.unlockedPacks || state.unlockedPacks || [];
    packsScroll.innerHTML = window.THEMATIC_PACKS.map(pack => {
      const isSpringfield = pack.id === 'vecinos_springfield';
      const isMultiverso = pack.id === 'heroes_multiverso';
      const isGalaxias = pack.id === 'galaxias_lejanas';
      const isKi = pack.id === 'guerreros_ki';
      const isReino = pack.id === 'reino_champinon';
      const isMagia = pack.id === 'castillo_magia';
      const isAcquired = state.allCategoriesUnlocked || state.allUnlocked || unlocked.includes(pack.id) ||
        (pack.id === 'vecinos_springfield' && unlocked.includes('cine_2000')) ||
        (pack.id === 'heroes_multiverso' && (unlocked.includes('videojuegos_retro') || unlocked.includes('videojuegos_clasicos'))) ||
        (pack.id === 'galaxias_lejanas' && (unlocked.includes('series_iconicas') || unlocked.includes('tv_series'))) ||
        (pack.id === 'guerreros_ki' && (unlocked.includes('artistas_latinos') || unlocked.includes('musica_latina'))) ||
        (pack.id === 'reino_champinon' && (unlocked.includes('puro_90s') || unlocked.includes('pack_puro_90s'))) ||
        (pack.id === 'castillo_magia' && (unlocked.includes('puro_80s') || unlocked.includes('pack_puro_80s')));
      
      const boxImg = pack.coverImage || pack.boxImage || (isSpringfield ? 'assets/pantalla_colecciones/caja_springfield.webp' : (isMultiverso ? 'assets/pantalla_colecciones/caja_multiverso.webp' : (isGalaxias ? 'assets/pantalla_colecciones/caja_galaxias.webp' : (isKi ? 'assets/pantalla_colecciones/caja_ki.webp' : (isReino ? 'assets/pantalla_colecciones/caja_reino.webp' : (isMagia ? 'assets/pantalla_colecciones/caja_magia.webp' : null))))));
      
      let catBg = '#FFE600';
      let catTextColor = '#000000';
      if (isMagia || pack.category === 'CINE & LITERATURA') {
        catBg = '#7928CA';
        catTextColor = '#FFFFFF';
      } else if (isReino) {
        catBg = '#00E676';
        catTextColor = '#000000';
      } else if (isKi) {
        catBg = '#FF6600';
        catTextColor = '#FFFFFF';
      } else if (pack.category === 'ANIMACIÓN' || isSpringfield) {
        catBg = '#00F0FF';
        catTextColor = '#000000';
      } else if (isGalaxias) {
        catBg = '#00D2FF';
        catTextColor = '#000000';
      } else if (pack.category === 'CINE & SERIES' || isMultiverso) {
        catBg = '#FF2A55';
        catTextColor = '#FFFFFF';
      }

      return `
        <div class="store-pack-card interactive-press ${isSpringfield ? 'pack-springfield pack-yellow' : ''} ${isMultiverso ? 'pack-multiverso pack-red' : ''} ${isGalaxias ? 'pack-galaxias pack-blue' : ''} ${isKi ? 'pack-ki pack-orange' : ''} ${isReino ? 'pack-reino pack-green' : ''} ${isMagia ? 'pack-magia pack-purple' : ''}" data-pack="${pack.id}" onclick="openPackDetailModal('${pack.id}')">
          <div class="pack-cat-pill-wrap">
            <span class="store-pack-cat-pill" style="background: ${catBg}; color: ${catTextColor};">${pack.category || 'CINE & LITERATURA'}</span>
          </div>

          <div class="pack-artwork-container">
            ${boxImg ? `
              <img src="${boxImg}" alt="${pack.name}" class="pack-box-3d-img">
            ` : `
              <span class="pack-art-emoji" style="font-size: 38px;">${pack.icon}</span>
            `}
          </div>

          ${isAcquired ? `
            <button class="btn-pack-solapado btn-acquired" onclick="event.stopPropagation(); openPackDetailModal('${pack.id}')">
              <span>ADQUIRIDO ✓</span>
            </button>
          ` : `
            <button class="btn-pack-solapado btn-buy interactive-press" onclick="event.stopPropagation(); openPackDetailModal('${pack.id}')">
              <img src="assets/global/retrocoin.webp" alt="RC" class="global-retrocoin-img mini-coin">
              <span>🪙 ${(pack.price || pack.priceCoins || 5000).toLocaleString()}</span>
            </button>
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

function applyTheme(themeKey) {
  const allThemeClasses = ['theme-navidad', 'theme-halloween', 'theme-pascua', 'theme-verano'];
  document.body.classList.remove(...allThemeClasses);

  if (themeKey && themeKey !== 'default' && THEME_SKINS[themeKey]) {
    document.body.classList.add(THEME_SKINS[themeKey].bodyClass);
  }
}
window.applyTheme = applyTheme;

function buyTheme(themeId, cost, name) {
  const skin = THEME_SKINS[themeId];
  const price = skin ? skin.cost : (parseInt(cost, 10) || 2500);
  const themeName = skin ? skin.name : (name || 'Tema');

  const currentCoins = (window.state && typeof window.state.coins === 'number')
    ? window.state.coins
    : (state.coins || 0);

  if (currentCoins >= price) {
    const newCoins = currentCoins - price;
    state.coins = newCoins;
    if (window.state) window.state.coins = newCoins;

    if (typeof saveCoinsToCloud === 'function') {
      saveCoinsToCloud(newCoins);
    } else {
      try { localStorage.setItem('retroquiz_coins', String(newCoins)); } catch (e) {}
      if (typeof updateHUD === 'function') updateHUD();
    }

    if (!window.state.themes) {
      window.state.themes = { unlocked: ["default"], active: "default" };
    }
    if (!window.state.themes.unlocked.includes(themeId)) {
      window.state.themes.unlocked.push(themeId);
    }
    if (state.themes) {
      state.themes.unlocked = window.state.themes.unlocked;
    }
    if (!state.store) state.store = {};
    state.store.purchasedThemes = window.state.themes.unlocked;

    try {
      localStorage.setItem('retroquiz_unlocked_themes', JSON.stringify(window.state.themes.unlocked));
    } catch (e) {}

    if (window.db && window.firestoreOps && window.state?.userId) {
      try {
        const { doc, updateDoc } = window.firestoreOps;
        updateDoc(doc(window.db, "usuarios", window.state.userId), {
          themes: window.state.themes,
          coins: newCoins,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      } catch (e) {}
    }

    if (typeof SoundManager !== 'undefined' && typeof SoundManager.playSFX === 'function') {
      SoundManager.playSFX('compra_tienda.wav');
    }

    updateStoreUI();
    showRetroToast(`¡${themeName} desbloqueado! (-${price.toLocaleString()} RC)`, '🪙');
  } else {
    playErrorSound();
    showRetroToast('RetroCoins insuficientes', '⚠️');
  }
}
window.buyTheme = buyTheme;

function equipTheme(themeId) {
  const targetTheme = (themeId && (themeId === 'default' || THEME_SKINS[themeId])) ? themeId : 'default';

  if (!window.state.themes) {
    window.state.themes = { unlocked: ["default"], active: "default" };
  }
  if (!state.themes) {
    state.themes = window.state.themes;
  }

  if (!window.state.themes.unlocked.includes(targetTheme)) {
    window.state.themes.unlocked.push(targetTheme);
  }

  applyTheme(targetTheme);

  window.state.themes.active = targetTheme;
  state.themes.active = targetTheme;
  if (!state.store) state.store = {};
  state.store.activeTheme = targetTheme;
  state.store.purchasedThemes = window.state.themes.unlocked;

  try {
    localStorage.setItem('retroquiz_active_theme', targetTheme);
    localStorage.setItem('retroquiz_unlocked_themes', JSON.stringify(window.state.themes.unlocked));
  } catch (e) {}

  if (window.db && window.firestoreOps && window.state?.userId) {
    try {
      const { doc, updateDoc } = window.firestoreOps;
      updateDoc(doc(window.db, "usuarios", window.state.userId), {
        themes: window.state.themes,
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}
  }

  updateStoreUI();
  playClickSound();
}
window.equipTheme = equipTheme;

function resetTheme() {
  const allThemeClasses = ['theme-navidad', 'theme-halloween', 'theme-pascua', 'theme-verano'];
  document.body.classList.remove(...allThemeClasses);

  if (!window.state.themes) {
    window.state.themes = { unlocked: ["default"], active: "default" };
  }
  window.state.themes.active = 'default';
  if (state.themes) state.themes.active = 'default';
  if (!state.store) state.store = {};
  state.store.activeTheme = 'default';

  try {
    localStorage.setItem('retroquiz_active_theme', 'default');
  } catch (e) {}

  if (window.db && window.firestoreOps && window.state?.userId) {
    try {
      const { doc, updateDoc } = window.firestoreOps;
      updateDoc(doc(window.db, "usuarios", window.state.userId), {
        'themes.active': 'default',
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}
  }

  updateStoreUI();
  showRetroToast('Tema por defecto restaurado 🎨', '🎨');
}
window.resetTheme = resetTheme;

function initStoredTheme() {
  try {
    const savedActive = localStorage.getItem('retroquiz_active_theme') || 'default';
    let savedUnlocked = ['default'];
    try {
      const raw = localStorage.getItem('retroquiz_unlocked_themes');
      if (raw) savedUnlocked = JSON.parse(raw);
    } catch (e) {}
    if (!Array.isArray(savedUnlocked)) savedUnlocked = ['default'];
    if (!savedUnlocked.includes('default')) savedUnlocked.unshift('default');

    if (!window.state) window.state = {};
    window.state.themes = {
      unlocked: savedUnlocked,
      active: savedActive
    };
    if (typeof state !== 'undefined') {
      state.themes = window.state.themes;
      if (!state.store) state.store = {};
      state.store.purchasedThemes = savedUnlocked;
      state.store.activeTheme = savedActive;
    }

    if (savedActive !== 'default') {
      applyTheme(savedActive);
    }
  } catch (err) {
    console.warn('initStoredTheme error:', err);
  }
}
window.initStoredTheme = initStoredTheme;
window.initApp = function() {
  initStoredTheme();
};
initStoredTheme();

function handleHashChange() {
  const currentHash = window.location.hash || '#home';
  const targetScreenId = routesMap[currentHash] || 'homeView';
  if (targetScreenId === 'modalRanking') {
    openModal('modalRanking');
  } else {
    renderScreenView(targetScreenId);
  }
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
      btnIap.innerText = '⭐ DESBLOQUEAR TODO';
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

// Constante de tiempo para recarga pasiva (3 horas)
const COOLDOWN_TIROS = 3 * 60 * 60 * 1000; // 3 horas en ms

// Lógica de cálculo en segundo plano / al abrir la app para recarga de tiros
function checkWheelPassiveReload() {
  let savedShots = localStorage.getItem('retroquiz_wheel_shots');
  let currentShots = savedShots !== null ? parseInt(savedShots, 10) : state.wheel.shots;
  if (isNaN(currentShots)) currentShots = 3;

  const rawTimestamp = localStorage.getItem('retroquiz_last_shot_timestamp');
  const lastShotTimestamp = rawTimestamp ? parseInt(rawTimestamp, 10) : null;

  // El contador de recarga opera e inicia ÚNICAMENTE cuando el jugador se queda sin tiros (currentShots <= 0)
  if (currentShots <= 0) {
    currentShots = 0;
    if (lastShotTimestamp) {
      const elapsed = Date.now() - lastShotTimestamp;
      if (elapsed >= COOLDOWN_TIROS) {
        // Ha transcurrido el bloque de 3 horas: restaura los 3 tiros completos
        currentShots = 3;
        localStorage.setItem('retroquiz_wheel_shots', '3');
        localStorage.removeItem('retroquiz_last_shot_timestamp');
        state.wheel.secondsUntilReload = 3 * 3600;
      } else {
        const remainingMs = COOLDOWN_TIROS - elapsed;
        state.wheel.secondsUntilReload = Math.ceil(remainingMs / 1000);
      }
    } else {
      // Se quedó sin tiros y aún no tenía timestamp registrado: iniciar temporizador ahora
      localStorage.setItem('retroquiz_last_shot_timestamp', Date.now().toString());
      state.wheel.secondsUntilReload = 3 * 3600;
    }
  } else {
    // Si aún le quedan tiros (> 0), no hay recarga en curso
    localStorage.removeItem('retroquiz_last_shot_timestamp');
    state.wheel.secondsUntilReload = 3 * 3600;
  }

  state.wheel.shots = currentShots;
  return currentShots;
}
window.checkWheelPassiveReload = checkWheelPassiveReload;

// Actualizar contador de tiros y estado del botón GIRAR
function updateShotsUI() {
  const shotsEl = document.getElementById('shotsAvailable');
  const btnGirar = document.getElementById('btnGirarWheel');
  const labelEl = document.getElementById('btnGirarLabel');
  const reloadBox = document.getElementById('reloadTimerBox');

  // Evaluar recarga pasiva de 3 horas
  checkWheelPassiveReload();

  if (shotsEl) shotsEl.innerText = state.wheel.shots;
  if (labelEl) labelEl.innerText = 'GIRAR'; // Siempre mantiene la palabra GIRAR

  // El contador de recarga en la ruleta debe iniciar cuando el jugador se queda sin tiros
  if (state.wheel.shots <= 0) {
    state.wheel.shots = 0;
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
    // Si aún tiene tiros (> 0), ocultar el contador de recarga y detener el intervalo
    if (reloadBox) reloadBox.classList.add('hidden');
    if (state.wheel.reloadInterval) {
      clearInterval(state.wheel.reloadInterval);
      state.wheel.reloadInterval = null;
    }
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

// Temporizador de recarga de 3 horas (activo únicamente cuando tiros === 0)
function startReloadTimer() {
  if (state.wheel.reloadInterval) return;

  const timerEl = document.getElementById('reloadTimerCountdown');

  const updateCountdownDisplay = () => {
    // Si el jugador recuperó tiros, cancelar el contador
    if (state.wheel.shots > 0) {
      if (state.wheel.reloadInterval) {
        clearInterval(state.wheel.reloadInterval);
        state.wheel.reloadInterval = null;
      }
      const reloadBox = document.getElementById('reloadTimerBox');
      if (reloadBox) reloadBox.classList.add('hidden');
      return;
    }

    const rawTimestamp = localStorage.getItem('retroquiz_last_shot_timestamp');
    const lastShotTimestamp = rawTimestamp ? parseInt(rawTimestamp, 10) : null;
    let remainingMs = 0;

    if (lastShotTimestamp) {
      const elapsed = Date.now() - lastShotTimestamp;
      if (elapsed >= COOLDOWN_TIROS) {
        state.wheel.shots = 3;
        localStorage.setItem('retroquiz_wheel_shots', '3');
        localStorage.removeItem('retroquiz_last_shot_timestamp');
        state.wheel.secondsUntilReload = 3 * 3600;
        if (state.wheel.reloadInterval) {
          clearInterval(state.wheel.reloadInterval);
          state.wheel.reloadInterval = null;
        }
        updateShotsUI();
        return;
      }
      remainingMs = COOLDOWN_TIROS - elapsed;
    } else {
      remainingMs = (state.wheel.secondsUntilReload || (3 * 3600)) * 1000;
    }

    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    state.wheel.secondsUntilReload = totalSeconds;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (timerEl) {
      timerEl.innerText = `Recarga en: ${formatted}`;
    }
  };

  updateCountdownDisplay();

  state.wheel.reloadInterval = setInterval(() => {
    if (state.wheel.shots > 0) {
      clearInterval(state.wheel.reloadInterval);
      state.wheel.reloadInterval = null;
      const reloadBox = document.getElementById('reloadTimerBox');
      if (reloadBox) reloadBox.classList.add('hidden');
      return;
    }
    updateCountdownDisplay();
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
  // El contador de recarga inicia cuando el jugador se queda sin tiros (shots === 0)
  if (state.wheel.shots <= 0) {
    state.wheel.shots = 0;
    localStorage.setItem('retroquiz_last_shot_timestamp', Date.now().toString());
  }
  localStorage.setItem('retroquiz_wheel_shots', state.wheel.shots.toString());
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

  // 5. PRECARGA ASÍNCRONA INMEDIATA DE PREGUNTAS (Cero lag durante el giro)
  window.state.pendingQuestionsPromise = cargarBancoExclusivo(chosenCatKey);
  preloadedRoundQuestionsPromise = window.state.pendingQuestionsPromise;

  console.log(`🎡 Giro de Ruleta - Categorías elegibles (${unlocked.length}):`, unlocked, `-> Seleccionada: ${chosenCatKey}`);

  // Cálculo de rotación para ruleta_musica_todo.webp (el indicador superior está a 270°)
  // targetOffset = (270 - catConfig.centerAngle + 360) % 360
  const fullSpins = 5 * 360;
  const currentMod = (state.wheel.currentRotation % 360 + 360) % 360;
  const targetOffset = (270 - catConfig.centerAngle + 360) % 360;
  let angleDelta = (targetOffset - currentMod + 360) % 360;
  if (angleDelta === 0) angleDelta = 360;

  state.wheel.currentRotation += fullSpins + angleDelta;

  // Limpieza de transforms y clases de animación conflictivas antes de rotar
  const wheelView = document.getElementById('wheelView');
  if (wheelView) {
    wheelView.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
  }
  const wheelStage = document.querySelector('#wheelView .wheel-stage') || document.querySelector('#wheelView .wheel-container');
  if (wheelStage) {
    wheelStage.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
    wheelStage.style.transform = 'none';
  }
  const wheelWrapper = document.querySelector('#wheelView .wheel-disc-wrapper') || document.querySelector('#wheelView .wheel-container');
  if (wheelWrapper) {
    wheelWrapper.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
    wheelWrapper.style.transform = 'none';
  }

  const wheelDisc = document.getElementById('wheelDisc');
  if (wheelDisc) {
    wheelDisc.classList.remove('micro-bounce', 'wheel-pop-in', 'wheelZoomPop', 'anim-wheel-zoom');
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

  // 5. PRECARGA ASÍNCRONA INMEDIATA DE PREGUNTAS (Cero lag durante el giro de duelo)
  window.state.pendingQuestionsPromise = cargarBancoExclusivo(chosenCatKey);
  preloadedRoundQuestionsPromise = window.state.pendingQuestionsPromise;

  console.log(`⚔️ Giro de Ruleta Duelo - Categorías elegibles (${unlocked.length}):`, unlocked, `-> Seleccionada: ${chosenCatKey}`);

  const fullSpins = 5 * 360;
  const currentMod = (state.duelWheel.currentRotation % 360 + 360) % 360;
  const targetOffset = (270 - catConfig.centerAngle + 360) % 360;
  let angleDelta = (targetOffset - currentMod + 360) % 360;
  if (angleDelta === 0) angleDelta = 360;

  state.duelWheel.currentRotation += fullSpins + angleDelta;

  // Limpieza de transforms y clases de animación conflictivas antes de rotar en Duelo
  const matchView = document.getElementById('challengeMatchView');
  if (matchView) {
    matchView.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
  }
  const duelStage = document.querySelector('#challengeMatchView .duel-wheel-stage') || document.querySelector('#challengeMatchView .wheel-stage');
  if (duelStage) {
    duelStage.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
    duelStage.style.transform = 'none';
  }
  const duelWrapper = document.querySelector('#challengeMatchView .wheel-disc-wrapper') || document.querySelector('#challengeMatchView .wheel-container');
  if (duelWrapper) {
    duelWrapper.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
    duelWrapper.style.transform = 'none';
  }

  const duelDisc = document.getElementById('duelWheelDisc');
  if (duelDisc) {
    duelDisc.classList.remove('micro-bounce', 'wheel-pop-in', 'wheelZoomPop', 'anim-wheel-zoom');
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
  const addOneShot = () => {
    state.wheel.shots += 1;
    if (state.wheel.shots >= 3) {
      state.wheel.shots = 3;
    }
    localStorage.removeItem('retroquiz_last_shot_timestamp');
    state.wheel.secondsUntilReload = 3 * 3600;
    if (state.wheel.reloadInterval) {
      clearInterval(state.wheel.reloadInterval);
      state.wheel.reloadInterval = null;
    }
    localStorage.setItem('retroquiz_wheel_shots', state.wheel.shots.toString());
    updateShotsUI();
    playSuccessSound();

    const pill = document.getElementById('shotsPill');
    if (pill) {
      pill.style.transform = 'scale(1.2)';
      setTimeout(() => pill.style.transform = '', 200);
    }
  };

  if (state.noAds || localStorage.getItem('retroquiz_no_ads') === 'true') {
    addOneShot();
    showRetroToast('¡Tiro extra añadido! (Sin anuncios)', '⚡');
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
    addOneShot();
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
  animacion: 'data/preguntas_animacion.json',
  musica: 'data/preguntas_animacion.json'
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
  } else if (cat === 'ANIMACIÓN' || cat === 'ANIMACION' || cat.includes('ANIM') || cat === 'MÚSICA' || cat === 'MUSICA') {
    return 'data/preguntas_animacion.json';
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
  const [cine, juegos, tv, animacion] = await Promise.all([
    fetch('data/preguntas_cine.json?t=' + timestamp, { cache: 'no-store' }).then(r => r.json()),
    fetch('data/preguntas_videojuegos.json?t=' + timestamp, { cache: 'no-store' }).then(r => r.json()),
    fetch('data/preguntas_tv.json?t=' + timestamp, { cache: 'no-store' }).then(r => r.json()),
    fetch('data/preguntas_animacion.json?t=' + timestamp, { cache: 'no-store' }).then(r => r.json())
  ]);
  return shuffleArray([...cine, ...juegos, ...tv, ...animacion]);
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

const emergencyAnimacion = [
  {
    id: "ani_emg_01",
    categoria: "ANIMACIÓN",
    pregunta: "¿Qué técnica de artes marciales y energía aprendió Gokū del Maestro Roshi en 'Dragon Ball'?",
    emojis: "🐉 🥋 💥",
    opciones: ["Kamehameha", "Masenko", "Kienzan", "Makankosappo"],
    respuesta_correcta: "Kamehameha"
  },
  {
    id: "ani_emg_02",
    categoria: "ANIMACIÓN",
    pregunta: "¿Cuál era la frase célebre de Buzz Lightyear al prepararse para despegar en 'Toy Story'?",
    emojis: "🚀 🤠 🪐",
    opciones: ["Al infinito y más allá", "Hacia las estrellas", "Por la galaxia y el más allá", "Misión estelar activada"],
    respuesta_correcta: "Al infinito y más allá"
  },
  {
    id: "ani_emg_03",
    categoria: "ANIMACIÓN",
    pregunta: "¿Cómo se llamaba la unidad biomecánica gigante piloteada por Shinji Ikari en Evangelion?",
    emojis: "🤖 🟣 🩸",
    opciones: ["EVA-01", "EVA-00", "EVA-02", "Gunbuster"],
    respuesta_correcta: "EVA-01"
  },
  {
    id: "ani_emg_04",
    categoria: "ANIMACIÓN",
    pregunta: "¿Cuál es el nombre del ratón eléctrico más famoso y fiel compañero de Ash Ketchum?",
    emojis: "⚡ 🐭 🎒",
    opciones: ["Pikachu", "Raichu", "Pichu", "Pachirisu"],
    respuesta_correcta: "Pikachu"
  },
  {
    id: "ani_emg_05",
    categoria: "ANIMACIÓN",
    pregunta: "¿En qué ciudad ficticia viven Homero, Marge, Bart, Lisa y Maggie en 'Los Simpson'?",
    emojis: "🍩 🍺 👨‍👩‍👧‍👦",
    opciones: ["Springfield", "Shelbyville", "Quahog", "South Park"],
    respuesta_correcta: "Springfield"
  }
];

// Banco embebido garantizado de Springfield (50 preguntas completas)
const SPRINGFIELD_QUESTIONS_FALLBACK = (typeof window !== 'undefined' && window.SPRINGFIELD_QUESTIONS_FALLBACK && window.SPRINGFIELD_QUESTIONS_FALLBACK.length >= 50)
  ? window.SPRINGFIELD_QUESTIONS_FALLBACK
  : [
  {
    "id": "spr_001",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es la comida y obsesión favorita de Homero Simpson?",
    "emojis": "🍩 🍺 🤤",
    "opciones": ["Rosquillas glaseadas (Donuts)", "Pastel de manzana", "Costillas de cerdo", "Pizza de pepperoni"],
    "respuesta_correcta": "Rosquillas glaseadas (Donuts)"
  },
  {
    "id": "spr_002",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama la taberna clandestina y oscura atendida por Moe Szyslak?",
    "emojis": "🍺 🥃 🚪",
    "opciones": ["Taberna de Moe", "El Bar de Barney", "Springfield Pub", "El Flamingo Dorado"],
    "respuesta_correcta": "Taberna de Moe"
  },
  {
    "id": "spr_003",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué instrumento musical de viento toca Lisa Simpson con enorme pasión?",
    "emojis": "🎷 🎵 👧",
    "opciones": ["Saxofón barítono", "Clarinete", "Trompeta jazz", "Flauta dulce"],
    "respuesta_correcta": "Saxofón barítono"
  },
  {
    "id": "spr_004",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es la marca de cerveza más popular y consumida en todo Springfield?",
    "emojis": "🍺 🏭 🧢",
    "opciones": ["Duff", "Fudd", "Buzz Beer", "Pabst"],
    "respuesta_correcta": "Duff"
  },
  {
    "id": "spr_005",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el multimillonario y decrépito dueño de la Planta Nuclear de Springfield?",
    "emojis": "👴 💰 🏭",
    "opciones": ["Montgomery Burns", "Waylon Smithers", "Artie Ziff", "Hank Scorpio"],
    "respuesta_correcta": "Montgomery Burns"
  },
  {
    "id": "spr_006",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué frase célebre dice el vecino Ned Flanders casi en cada conversación?",
    "emojis": "👓 👨 🏘️",
    "opciones": ["¡Hola, holita, vecinito!", "¿Qué hay de nuevo, viejo?", "¡Ay, caramba!", "¡Excelente!"],
    "respuesta_correcta": "¡Hola, holita, vecinito!"
  },
  {
    "id": "spr_007",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es la exclamación de queja o dolor característica de Homero Simpson?",
    "emojis": "🤦‍♂️ 💥 💢",
    "opciones": ["¡D'oh! (¡Ouch!)", "¡Ay, caramba!", "¡Rayos y centellas!", "¡Por qué a mí!"],
    "respuesta_correcta": "¡D'oh! (¡Ouch!)"
  },
  {
    "id": "spr_008",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el payaso de televisión ídolo de Bart y conductor del show infantil?",
    "emojis": "🤡 📺 🎈",
    "opciones": ["Krusty el Payaso", "Sideshow Bob", "Gabbo", "Bozo"],
    "respuesta_correcta": "Krusty el Payaso"
  },
  {
    "id": "spr_009",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué medio de transporte público defectuoso le vendió Lyle Lanley a Springfield?",
    "emojis": "🚝 🎶 🏙️",
    "opciones": ["El Monorriel", "El Tranvía Solar", "El Metro Express", "El Tren Bala"],
    "respuesta_correcta": "El Monorriel"
  },
  {
    "id": "spr_010",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el leal asistente personal del señor Burns?",
    "emojis": "👓 💼 👴",
    "opciones": ["Waylon Smithers", "Karl", "Hans Moleman", "Frank Grimes"],
    "respuesta_correcta": "Waylon Smithers"
  },
  {
    "id": "spr_011",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es la tienda de conveniencia atendida por Apu Nahasapeemapetilon?",
    "emojis": "🏪 🌭 🥤",
    "opciones": ["El Kwik-E-Mart (Minisúper)", "7-Eleven", "Springfield Market", "El Bodegón"],
    "respuesta_correcta": "El Kwik-E-Mart (Minisúper)"
  },
  {
    "id": "spr_012",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué actor y criminal de cabello rizado intenta repetidamente acabar con Bart Simpson?",
    "emojis": "🎭 🔪 🌴",
    "opciones": ["Sideshow Bob (Bob Patiño)", "Sideshow Mel", "Snake Jailbird", "Fat Tony"],
    "respuesta_correcta": "Sideshow Bob (Bob Patiño)"
  },
  {
    "id": "spr_013",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el perro galgo marrón adoptado por la familia Simpson en Navidad?",
    "emojis": "🐶 🎄 🦴",
    "opciones": ["Ayudante de Santa (Huesos)", "Prócer", "Laddie", "Bolas de Nieve"],
    "respuesta_correcta": "Ayudante de Santa (Huesos)"
  },
  {
    "id": "spr_014",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué director escolar autoritario vive aún bajo el estricto control de su madre Agnes?",
    "emojis": "🏫 👩‍👦 👔",
    "opciones": ["Seymour Skinner", "Superintendente Chalmers", "Otto Mann", "Dewey Largo"],
    "respuesta_correcta": "Seymour Skinner"
  },
  {
    "id": "spr_015",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es el verdadero nombre original del director Seymour Skinner revelado en la temporada 9?",
    "emojis": "🪖 📄 🤫",
    "opciones": ["Armin Tamzarian", "Roy Snyder", "Hank Kingsley", "Artie Ziff"],
    "respuesta_correcta": "Armin Tamzarian"
  },
  {
    "id": "spr_016",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué villano superinteligente y carismático dirigió la empresa Globex Corporation?",
    "emojis": "💼 💣 👞",
    "opciones": ["Hank Scorpio", "Herbert Powell", "Rex Banner", "Frank Grimes"],
    "respuesta_correcta": "Hank Scorpio"
  },
  {
    "id": "spr_017",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el chofer amante del rock pesado que conduce el autobús escolar?",
    "emojis": "🚌 🎸 🎧",
    "opciones": ["Otto Mann", "Bleeding Gums Murphy", "Disco Stu", "Gil Gunderson"],
    "respuesta_correcta": "Otto Mann"
  },
  {
    "id": "spr_018",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué ingrediente secreto incendió Homero para crear el cóctel 'Llamarada Homero'?",
    "emojis": "🔥 🍸 🧪",
    "opciones": ["Jarabe para la tos de Krusty", "Tabasco picante", "Licor de menta", "Gasolina pura"],
    "respuesta_correcta": "Jarabe para la tos de Krusty"
  },
  {
    "id": "spr_019",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama la ciudad vecina y rival histórica de Springfield?",
    "emojis": "🌳 🍋 ⚔️",
    "opciones": ["Shelbyville", "Capital City", "Ogdenville", "North Haverbrook"],
    "respuesta_correcta": "Shelbyville"
  },
  {
    "id": "spr_020",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué árbol sagrado fue robado por los niños de Shelbyville desatando una expedición de rescate?",
    "emojis": "🍋 🌳 👦",
    "opciones": ["El limonero", "El manzano", "El naranjo", "El roble milenario"],
    "respuesta_correcta": "El limonero"
  },
  {
    "id": "spr_021",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Quién le disparó al señor Burns en el misterio en dos partes más famoso de la serie?",
    "emojis": "🔫 👶 🍼",
    "opciones": ["Maggie Simpson", "Waylon Smithers", "Homero Simpson", "Tito Puente"],
    "respuesta_correcta": "Maggie Simpson"
  },
  {
    "id": "spr_022",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué peluche de la infancia busca con desesperación el señor Burns durante años?",
    "emojis": "🧸 ❄️ 👴",
    "opciones": ["Bobo", "Teddy", "Peppy", "Barnaby"],
    "respuesta_correcta": "Bobo"
  },
  {
    "id": "spr_023",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el abogado incompetente y charlatán con traje azul?",
    "emojis": "👨‍⚖️ 💼 📜",
    "opciones": ["Lionel Hutz", "Gil Gunderson", "El Abogado del Pelo Azul", "Profesor Frink"],
    "respuesta_correcta": "Lionel Hutz"
  },
  {
    "id": "spr_024",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el médico negligente que siempre saluda diciendo '¡Hola a todos!'?",
    "emojis": "🩺 👨‍⚕️ 😁",
    "opciones": ["Dr. Nick Riviera", "Dr. Julius Hibbert", "Dr. Marvin Monroe", "Dr. Foster"],
    "respuesta_correcta": "Dr. Nick Riviera"
  },
  {
    "id": "spr_025",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué alias usaba Bart cuando llamaba a la taberna de Moe para hacer bromas telefónicas?",
    "emojis": "📞  prank 🍺",
    "opciones": ["Aquiles Baeza / Bartolo", "Señor Thompson", "Cosme Fulanito", "Homero Thompson"],
    "respuesta_correcta": "Aquiles Baeza / Bartolo"
  },
  {
    "id": "spr_026",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llamaba el doble idéntico y distinguido de Homero que fue expulsado del bar de Moe?",
    "emojis": "🥸 🍸 🎩",
    "opciones": ["Cosme Fulanito (Guy Incognito)", "Homero Thompson", "Max Power", "Karl"],
    "respuesta_correcta": "Cosme Fulanito (Guy Incognito)"
  },
  {
    "id": "spr_027",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es el nombre del ratón y el gato ultraviolentos de los dibujos animados dentro del show?",
    "emojis": "🐭 🐱 🪓",
    "opciones": ["Tomy y Daly (Itchy & Scratchy)", "Pica y Rasca", "Worker and Parasite", "Gabby & Scrappy"],
    "respuesta_correcta": "Tomy y Daly (Itchy & Scratchy)"
  },
  {
    "id": "spr_028",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué nombre adoptó Homero Simpson inspirado en un secador de cabello?",
    "emojis": "⚡ 🕶️ 👔",
    "opciones": ["Max Power", "Hércules Rockefeller", "Chester Turbo", "Lance Murdock"],
    "respuesta_correcta": "Max Power"
  },
  {
    "id": "spr_029",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué personaje es el dueño de la tienda 'La Mazmorra del Androide'?",
    "emojis": "📚 🍔 👓",
    "opciones": ["El Chico de las Historietas (Jeff Albertson)", "Profesor Frink", "Hans Moleman", "Disco Stu"],
    "respuesta_correcta": "El Chico de las Historietas (Jeff Albertson)"
  },
  {
    "id": "spr_030",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es la frase típica de decepción del Chico de las Historietas?",
    "emojis": "🗯️ 😒 👎",
    "opciones": ["El peor episodio de la historia", "Esto no tiene lógica", "Totalmente sobrevalorado", "Un fracaso absoluto"],
    "respuesta_correcta": "El peor episodio de la historia"
  },
  {
    "id": "spr_031",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué sociedad secreta ancestral gobernaba el pueblo y tenía como líder al Número Uno?",
    "emojis": "👁️ 📜 🍻",
    "opciones": ["Los Magios (Stonecutters)", "Los Masones", "La Hermandad del Anillo", "Los Iluminados"],
    "respuesta_correcta": "Los Magios (Stonecutters)"
  },
  {
    "id": "spr_032",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el mejor amigo inseparable de Bart Simpson, con anteojos y cabello azul?",
    "emojis": "👓 👦 🔵",
    "opciones": ["Milhouse Van Houten", "Martin Prince", "Nelson Muntz", "Sherri"],
    "respuesta_correcta": "Milhouse Van Houten"
  },
  {
    "id": "spr_033",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué risa burlona de dos tonos emite Nelson Muntz al reírse de las desgracias ajenas?",
    "emojis": "👉 😆 💢",
    "opciones": ["¡Ha-ha!", "¡Je-je!", "¡Uh-uh!", "¡Ja-ja-ja!"],
    "respuesta_correcta": "¡Ha-ha!"
  },
  {
    "id": "spr_034",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama la profesora de Bart que fumaba constantemente y tuvo un romance con Skinner?",
    "emojis": "🚬 👩‍🏫  chalk",
    "opciones": ["Edna Krabappel", "Elizabeth Hoover", "Brunella Pommelhorst", "Lurleen Lumpkin"],
    "respuesta_correcta": "Edna Krabappel"
  },
  {
    "id": "spr_035",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué animal salvaje fue criado secretamente por Homero bajo el nombre de 'Tenacitas'?",
    "emojis": "🦞 🧈 🍽️",
    "opciones": ["Una langosta", "Un mono", "Un mapache", "Un oso negro"],
    "respuesta_correcta": "Una langosta"
  },
  {
    "id": "spr_036",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el hermano multimillonario perdido de Homero dedicado a la industria automotriz?",
    "emojis": "🚗 💰 👨‍💼",
    "opciones": ["Herbert Powell", "Hank Scorpio", "Artie Ziff", "Cyrus Simpson"],
    "respuesta_correcta": "Herbert Powell"
  },
  {
    "id": "spr_037",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué híbrido vegetal adictivo de tabaco y tomate cultivó la familia Simpson en su granja?",
    "emojis": "🍅 🚬 🐑",
    "opciones": ["Tomaco", "Tobamate", "Nicotomate", "Agrotom"],
    "respuesta_correcta": "Tomaco"
  },
  {
    "id": "spr_038",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es el nombre del perro que reemplazó temporalmente a Huesos con habilidades extraordinarias?",
    "emojis": "🐕 🎩 ✨",
    "opciones": ["Laddie", "Prócer", "Fidelski", "Scraps"],
    "respuesta_correcta": "Laddie"
  },
  {
    "id": "spr_039",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el líder de la mafia italiana de Springfield custodiado por piernas cruzadas?",
    "emojis": "🍝 🔫 🕶️",
    "opciones": ["Fat Tony (El Gordo Tony)", "Don Vittorio", "Legs", "Louie"],
    "respuesta_correcta": "Fat Tony (El Gordo Tony)"
  },
  {
    "id": "spr_040",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es el empleo oficial de Homero Simpson en la Planta de Energía Nuclear?",
    "emojis": "☢️ 🍩 🎛️",
    "opciones": [
      "Inspector de seguridad en el sector 7G",
      "Jefe de reactores nucleares",
      "Técnico de mantenimiento térmico",
      "Operador auxiliar de turbinas"
    ],
    "respuesta_correcta": "Inspector de seguridad en el sector 7G"
  },
  {
    "id": "spr_041",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué objeto cilíndrico de metal inerte ganó el premio al empleado del mes superando a Homero?",
    "emojis": "🔩 🏆 🏭",
    "opciones": ["La barra inanimada de carbón", "Un tornillo de titanio", "El fusible maestro", "La tuerca de cobre"],
    "respuesta_correcta": "La barra inanimada de carbón"
  },
  {
    "id": "spr_042",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el mentor y saxofonista de jazz que inspiró la carrera musical de Lisa?",
    "emojis": "🎷 🕶️ 🏥",
    "opciones": ["Encías Sangrantes Murphy", "Dexter Coltrane", "Sonny Jazz", "Marcus Miller"],
    "respuesta_correcta": "Encías Sangrantes Murphy"
  },
  {
    "id": "spr_043",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué frase célebre le dedicaba el actor Troy McClure al público al inicio de sus videos?",
    "emojis": "🎬 📺 🐟",
    "opciones": [
      "Tal vez me recuerden de películas como...",
      "Hola amigos del cine y la televisión",
      "Bienvenidos a una nueva lección",
      "Soy la estrella que todos conocen"
    ],
    "respuesta_correcta": "Tal vez me recuerden de películas como..."
  },
  {
    "id": "spr_044",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el parque de diversiones con temática de Tomy y Daly repleto de robots asesinos?",
    "emojis": "🎢 🤖 🎟️",
    "opciones": ["La Tierra de Tomy y Daly", "Krustyland", "Duff Gardens", "Daly World"],
    "respuesta_correcta": "La Tierra de Tomy y Daly"
  },
  {
    "id": "spr_045",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué vehículo todoterreno gigante y peligroso compró Homero tras un comercial publicitario?",
    "emojis": "🚙 🛞 🔥",
    "opciones": ["Canyonero", "The Beast 4x4", "Guzzler XL", "Thunder Road"],
    "respuesta_correcta": "Canyonero"
  },
  {
    "id": "spr_046",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cuál es la comida que Marge Simpson prepara con orgullo diciendo '¡A comer chuletas!'?",
    "emojis": "🥩 👩‍🍳 🍽️",
    "opciones": ["Chuletas de cerdo", "Pollo frito", "Lasaña casera", "Guiso de carne"],
    "respuesta_correcta": "Chuletas de cerdo"
  },
  {
    "id": "spr_047",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama la zarigüeya madre que vivía dentro del Monorriel de Springfield?",
    "emojis": "🦝 🚝 🍼",
    "opciones": ["Cuca (Mordisquitos en España)", "Pelusa", "Rosita", "Molly"],
    "respuesta_correcta": "Cuca (Mordisquitos en España)"
  },
  {
    "id": "spr_048",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué número de calle tiene la icónica casa de dos pisos de la familia Simpson?",
    "emojis": "🏡 📬 🌲",
    "opciones": ["742 Evergreen Terrace", "740 Elm Street", "1042 Evergreen Terrace", "742 Oak Street"],
    "respuesta_correcta": "742 Evergreen Terrace"
  },
  {
    "id": "spr_049",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Qué exótico pez venenoso comió Homero creyendo que le quedaban solo 24 horas de vida?",
    "emojis": "🐡 🍣 ⏱️",
    "opciones": ["Fugu (Pez globo)", "Pez piedra", "Pez león", "Barracuda negra"],
    "respuesta_correcta": "Fugu (Pez globo)"
  },
  {
    "id": "spr_050",
    "categoria": "ANIMACIÓN",
    "pack": "vecinos_springfield",
    "pregunta": "¿Cómo se llama el vendedor deprimido que nunca logra cerrar un trato y ruega por una venta?",
    "emojis": "💼 😰 📉",
    "opciones": ["Gil Gunderson", "Lionel Hutz", "Kirk Van Houten", "Hans Moleman"],
    "respuesta_correcta": "Gil Gunderson"
  }
];
window.SPRINGFIELD_QUESTIONS_FALLBACK = SPRINGFIELD_QUESTIONS_FALLBACK;

// Banco embebido garantizado de Héroes del Multiverso (50 preguntas completas)
const MULTIVERSO_QUESTIONS_FALLBACK = (typeof window !== 'undefined' && window.MULTIVERSO_QUESTIONS_FALLBACK && window.MULTIVERSO_QUESTIONS_FALLBACK.length >= 50)
  ? window.MULTIVERSO_QUESTIONS_FALLBACK
  : [
  {
    "id": "hdm_001",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿De qué metal ficticio indestructible de Wakanda está fabricado el escudo del Capitán América?",
    "emojis": "🛡️ 🌟 🦾",
    "opciones": ["Vibranium", "Adamantium", "Uru", "Carbonadio"],
    "respuesta_correcta": "Vibranium"
  },
  {
    "id": "hdm_002",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué gema del infinito albergaba en su interior el Ojo de Agamotto custodiado por Doctor Strange?",
    "emojis": "👁️ ⌛ 🧙‍♂️",
    "opciones": ["Gema del Tiempo", "Gema del Espacio", "Gema de la Mente", "Gema de la Realidad"],
    "respuesta_correcta": "Gema del Tiempo"
  },
  {
    "id": "hdm_003",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama el reino enano forjador donde Thor construyó su hacha Stormbreaker?",
    "emojis": "🔨 ⚡ 🪐",
    "opciones": ["Nidavellir", "Svartalfheim", "Jotunheim", "Muspelheim"],
    "respuesta_correcta": "Nidavellir"
  },
  {
    "id": "hdm_004",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué artefacto cúbico resguardaba originalmente la Gema del Espacio?",
    "emojis": "🟦 🧊 🌌",
    "opciones": ["El Teseracto", "El Orbe", "El Éter", "El Ojo de Agamotto"],
    "respuesta_correcta": "El Teseracto"
  },
  {
    "id": "hdm_005",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿En qué planeta desolado custodiaba Cráneo Rojo la Gema del Alma?",
    "emojis": "🪐 💀 🧡",
    "opciones": ["Vormir", "Morag", "Titán", "Knowhere"],
    "respuesta_correcta": "Vormir"
  },
  {
    "id": "hdm_006",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué inteligencia artificial reemplazó a J.A.R.V.I.S. en el traje de Tony Stark tras la creación de Visión?",
    "emojis": "🤖 🎙️ 🦾",
    "opciones": ["F.R.I.D.A.Y.", "E.D.I.T.H.", "KAREN", "JOCASTA"],
    "respuesta_correcta": "F.R.I.D.A.Y."
  },
  {
    "id": "hdm_007",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama el demonio de fuego gigante que destruyó Asgard para cumplir la profecía del Ragnarok?",
    "emojis": "🔥 👑 🗡️",
    "opciones": ["Surtur", "Malekith", "Laufey", "Gorr"],
    "respuesta_correcta": "Surtur"
  },
  {
    "id": "hdm_008",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué organización científica clandestina se infiltró en S.H.I.E.L.D. desde su propia fundación?",
    "emojis": "🐙 🛡️ 🕵️",
    "opciones": ["HYDRA", "A.I.M.", "Los Diez Anillos", "La Mano"],
    "respuesta_correcta": "HYDRA"
  },
  {
    "id": "hdm_009",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cuál es la frase de tres palabras que pronunció Steve Rogers para liderar el contraataque final ante Thanos?",
    "emojis": "🛡️ ⚡ 🗣️",
    "opciones": ["Vengadores, unidos", "Pelearemos juntos", "Hasta el final", "Vengadores, al ataque"],
    "respuesta_correcta": "Vengadores, unidos"
  },
  {
    "id": "hdm_010",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué flor otorga los poderes sobrehumanos y la conexión astral a las Panteras Negras?",
    "emojis": "🌸 🟣 🐾",
    "opciones": ["Hierba de corazón", "Flor de loto astral", "Orquídea de Bast", "Raíz de Wakanda"],
    "respuesta_correcta": "Hierba de corazón"
  },
  {
    "id": "hdm_011",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama el puente de energía arcoíris que conecta Asgard con los Nueve Reinos?",
    "emojis": "🌈 ⚔️ 🌌",
    "opciones": ["El Bifrost", "El Yggdrasil", "El Puente Astral", "El Portal Cósmico"],
    "respuesta_correcta": "El Bifrost"
  },
  {
    "id": "hdm_012",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué partícula subatómica descubierta por Hank Pym permite reducir o agrandar la materia?",
    "emojis": "🐜 🧪 🔴",
    "opciones": ["Partículas Pym", "Partículas cuánticas", "Radiación Gamma", "Células Uru"],
    "respuesta_correcta": "Partículas Pym"
  },
  {
    "id": "hdm_013",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cuál es la verdadera especie biológica de Loki revelada en su juventud?",
    "emojis": "❄️ 👹 👑",
    "opciones": ["Gigante de Hielo", "Elfo Oscuro", "Asgardiano puro", "Titán menor"],
    "respuesta_correcta": "Gigante de Hielo"
  },
  {
    "id": "hdm_014",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué objeto contenía la Gema del Poder antes de que los Guardianes de la Galaxia la interceptaran?",
    "emojis": "🟣 🔮 🦝",
    "opciones": ["El Orbe", "El Cetro", "El Éter", "El Teseracto"],
    "respuesta_correcta": "El Orbe"
  },
  {
    "id": "hdm_015",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿En qué planeta basurero cósmico gobernaba El Gran Maestro celebrando batallas de gladiadores?",
    "emojis": "🪐 🪓 🥊",
    "opciones": ["Sakaar", "Xandar", "Kree-Lar", "Hala"],
    "respuesta_correcta": "Sakaar"
  },
  {
    "id": "hdm_016",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama el reactor miniaturizado que mantenía con vida a Tony Stark y alimentaba su primer traje?",
    "emojis": "⚙️ 💡 🦾",
    "opciones": ["Reactor Arc", "Generador Cuántico", "Núcleo de Fusión Pym", "Batería de Iones"],
    "respuesta_correcta": "Reactor Arc"
  },
  {
    "id": "hdm_017",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué dios egipcio de la Luna eligió a Marc Spector como su avatar y puño de venganza?",
    "emojis": "🌙 🦅 🧻",
    "opciones": ["Khonshu", "Ammit", "Anubis", "Osiris"],
    "respuesta_correcta": "Khonshu"
  },
  {
    "id": "hdm_018",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cuál era la designación numérica oficial del universo principal de los Vengadores según Christine Palmer en la Tierra-838?",
    "emojis": "🌌 🔢 🚪",
    "opciones": ["Tierra-616", "Tierra-199999", "Tierra-838", "Tierra-1610"],
    "respuesta_correcta": "Tierra-616"
  },
  {
    "id": "hdm_019",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué gema del infinito estaba incrustada en la frente del androide Visión otorgándole conciencia?",
    "emojis": "🤖 🟡 🧠",
    "opciones": ["Gema de la Mente", "Gema del Alma", "Gema del Espacio", "Gema de la Realidad"],
    "respuesta_correcta": "Gema de la Mente"
  },
  {
    "id": "hdm_020",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama la hermana mayor de Thor y Diosa Asgardiana de la Muerte?",
    "emojis": "🗡️ 👑 💀",
    "opciones": ["Hela", "Frigga", "Sif", "Brunnhilde"],
    "respuesta_correcta": "Hela"
  },
  {
    "id": "hdm_021",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué tratado internacional de la ONU buscaba regular y registrar a los Vengadores desatando la Guerra Civil?",
    "emojis": "📜 🏛️ ⚖️",
    "opciones": ["Los Acuerdos de Sokovia", "El Tratado de Ginebra", "El Acta de Wakanda", "El Protocolo Ultron"],
    "respuesta_correcta": "Los Acuerdos de Sokovia"
  },
  {
    "id": "hdm_022",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué raza alienígena metamorfa cambia de forma imitando el ADN y aspecto de cualquier ser vivo?",
    "emojis": "👽 🦎 👥",
    "opciones": ["Skrulls", "Kree", "Chitauri", "Sovereign"],
    "respuesta_correcta": "Skrulls"
  },
  {
    "id": "hdm_023",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué entidad ancestral creó el Darkhold, el infame libro maldito de magia oscura?",
    "emojis": "📖 🪄 😈",
    "opciones": ["Chthon", "Dormammu", "Mephisto", "Agatha Harkness"],
    "respuesta_correcta": "Chthon"
  },
  {
    "id": "hdm_024",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama el grupo de élite de guerreras encargadas de la guardia personal del rey en Wakanda?",
    "emojis": "🛡️ 🗡️ 👑",
    "opciones": ["Dora Milaje", "Jabari", "Hermanas de Bast", "Valkirias"],
    "respuesta_correcta": "Dora Milaje"
  },
  {
    "id": "hdm_025",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué dimensión de tiempo y espacio infinitesimal permitió a los Vengadores ejecutar su viaje en el tiempo?",
    "emojis": "⏳ 🌀 ⚛️",
    "opciones": ["Reino Cuántico", "Dimensión Espejo", "Dimensión Oscura", "Vacío del Fin de los Tiempos"],
    "respuesta_correcta": "Reino Cuántico"
  },
  {
    "id": "hdm_026",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cuál es el nombre de la colosal estación espacial minera construida dentro de la cabeza cercenada de un Celestial?",
    "emojis": "💀 🌌 ⛏️",
    "opciones": ["Knowhere", "El Santuario", "Xandar", "Kyln"],
    "respuesta_correcta": "Knowhere"
  },
  {
    "id": "hdm_027",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué mineral mitológico asgardiano se empleó para forjar el martillo Mjolnir?",
    "emojis": "🔨 ⚡ 🛡️",
    "opciones": ["Uru", "Vibranium", "Titanio dorado", "Beskar"],
    "respuesta_correcta": "Uru"
  },
  {
    "id": "hdm_028",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama el pueblo ficticio de Nueva Jersey donde Wanda Maximoff creó su anomalía de comedia clásica?",
    "emojis": "📺 🪄 🏘️",
    "opciones": ["Westview", "Rosewood", "Eastview", "Greendale"],
    "respuesta_correcta": "Westview"
  },
  {
    "id": "hdm_029",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué criatura con aspecto de gato doméstico adoptó Carol Danvers descubriéndose que era un temible Flerken?",
    "emojis": "🐱 🐙 🚀",
    "opciones": ["Goose", "Chewie", "Lucky", "Salem"],
    "respuesta_correcta": "Goose"
  },
  {
    "id": "hdm_030",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Quién fue el mentor y maestro místico de Stephen Strange en Kamar-Taj?",
    "emojis": "🧙‍♀️ 📜 🍵",
    "opciones": ["Ancient One (Ancestral)", "Wong", "Kaecilius", "Mordo"],
    "respuesta_correcta": "Ancient One (Ancestral)"
  },
  {
    "id": "hdm_031",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué general militar de Wakanda y líder tribal vivía en las montañas nevadas adorando al dios gorila Hanuman?",
    "emojis": "🦍 ❄️ 🛡️",
    "opciones": ["M'Baku", "W'Kabi", "Killmonger", "Zuri"],
    "respuesta_correcta": "M'Baku"
  },
  {
    "id": "hdm_032",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué emperatriz de la soberanía genética alienígena dorada ordenó la creación artificial de Adam Warlock?",
    "emojis": "✨ 👑 🟡",
    "opciones": ["Ayesha", "Proxima Midnight", "Hela", "Ravonna"],
    "respuesta_correcta": "Ayesha"
  },
  {
    "id": "hdm_033",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué entidad cósmica devoradora gobernaba la Dimensión Oscura antes de quedar atrapada en un bucle temporal?",
    "emojis": "🌀 😈 ⌛",
    "opciones": ["Dormammu", "Galactus", "Ego", "Gorr"],
    "respuesta_correcta": "Dormammu"
  },
  {
    "id": "hdm_034",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llamaba el programa soviético de espías que entrenó a Natasha Romanoff y Yelena Belova?",
    "emojis": "🕷️ 🩰 🩸",
    "opciones": ["La Habitación Roja", "Proyecto Centinela", "Iniciativa Fantasma", "Sala Escarlata"],
    "respuesta_correcta": "La Habitación Roja"
  },
  {
    "id": "hdm_035",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué organización burocrática atemporal controla y poda las ramas de la Sagrada Línea Temporal?",
    "emojis": "⏳ 🏢 📜",
    "opciones": ["TVA (Autoridad de Variación Temporal)", "S.W.O.R.D.", "Los Iluminati", "Cabal Cósmico"],
    "respuesta_correcta": "TVA (Autoridad de Variación Temporal)"
  },
  {
    "id": "hdm_036",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cuál es el nombre del planeta natal viviente de Peter Quill que resultó ser su propio padre biológico?",
    "emojis": "🪐 🧬 🌌",
    "opciones": ["Ego el Planeta Viviente", "Hala", "Contraxia", "Krylor"],
    "respuesta_correcta": "Ego el Planeta Viviente"
  },
  {
    "id": "hdm_037",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué tipo de energía radiactiva transformó las células de Bruce Banner en el gigante verde Hulk?",
    "emojis": "🧪 🟢 💥",
    "opciones": ["Radiación Gamma", "Rayos Cósmicos", "Fusión Nuclear Beta", "Partículas Pym"],
    "respuesta_correcta": "Radiación Gamma"
  },
  {
    "id": "hdm_038",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llamaba el vehículo militar volador con doble hélice y camuflaje óptico usado por S.H.I.E.L.D.?",
    "emojis": "🚁 ✈️ 🛡️",
    "opciones": ["Quinjet", "Helicarrier", "Milano", "Benatar"],
    "respuesta_correcta": "Quinjet"
  },
  {
    "id": "hdm_039",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué villano robótico inteligente intentó elevar la ciudad entera de Sokovia para provocar la extinción humana?",
    "emojis": "🤖 🏙️ 💥",
    "opciones": ["Ultron", "Vision", "Kang", "Zola"],
    "respuesta_correcta": "Ultron"
  },
  {
    "id": "hdm_040",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué arma mística empuñaba Gorr para masacrar a las divinidades del cosmos?",
    "emojis": "🗡️ 🖤 ⚡",
    "opciones": ["Necroespada Todonegra", "Stormbreaker", "Espada del Dragón", "Lanza de Odín"],
    "respuesta_correcta": "Necroespada Todonegra"
  },
  {
    "id": "hdm_041",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cuál es el reino submarino mesoamericano gobernado por Namor, el rey con alas en los tobillos?",
    "emojis": "🌊 🪸 🔱",
    "opciones": ["Talokan", "Atlántida", "Lemuria", "Xibalbá"],
    "respuesta_correcta": "Talokan"
  },
  {
    "id": "hdm_042",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué forma líquida viscosa y roja adoptaba la Gema de la Realidad en el cuerpo de Jane Foster?",
    "emojis": "🩸 🔴 🌌",
    "opciones": ["El Éter", "El Teseracto", "El Orbe", "El Vórtice"],
    "respuesta_correcta": "El Éter"
  },
  {
    "id": "hdm_043",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama el guardián de ojos dorados que vigila las puertas de Asgard y ve todo en el cosmos?",
    "emojis": "🗡️ 👁️ 🌈",
    "opciones": ["Heimdall", "Volstagg", "Fandral", "Hogun"],
    "respuesta_correcta": "Heimdall"
  },
  {
    "id": "hdm_044",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué poder único posee la joven América Chavez para recorrer el multiverso?",
    "emojis": "⭐ 🚪 🌌",
    "opciones": [
      "Abrir portales interdimensionales con forma de estrella",
      "Controlar la línea temporal con el Darkhold",
      "Duplicar su cuerpo en distintas realidades",
      "Absorber la energía cósmica de las variantes"
    ],
    "respuesta_correcta": "Abrir portales interdimensionales con forma de estrella"
  },
  {
    "id": "hdm_045",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué bestia colosal de humo y ceniza devoraba variantes en El Vacío antes de la llegada de Loki?",
    "emojis": "🐉 🌪️ ⚡",
    "opciones": ["Alioth", "Jormungandr", "Fin Fang Foom", "Chitauri Leviathan"],
    "respuesta_correcta": "Alioth"
  },
  {
    "id": "hdm_046",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué palabra de activación psicológica final completaba el control mental de Bucky Barnes como Soldado del Invierno?",
    "emojis": "📖 🦾 ❄️",
    "opciones": ["Vagón de carga", "Amanecer", "Diecisiete", "Nueve"],
    "respuesta_correcta": "Vagón de carga"
  },
  {
    "id": "hdm_047",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cuál es el nombre del Celestial gigante cuyo embrión petrificado emergió del océano de la Tierra?",
    "emojis": "🗿 🌊 🌌",
    "opciones": ["Tiamut", "Arishem", "Eson", "Jemiah"],
    "respuesta_correcta": "Tiamut"
  },
  {
    "id": "hdm_048",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué diez artefactos circulares milenarios otorgaron inmortalidad y poder místico a Wenwu durante siglos?",
    "emojis": "💍 🥋 ⚡",
    "opciones": ["Los Diez Anillos", "Las Pulseras Kree", "Los Aros de Cyttorak", "Las Coronas de Ta Lo"],
    "respuesta_correcta": "Los Diez Anillos"
  },
  {
    "id": "hdm_049",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Qué héroe sacrificó su propia alma en Vormir para que Clint Barton obtuviera la Gema del Alma?",
    "emojis": "🕷️ 🧗‍♀️ 🧡",
    "opciones": ["Natasha Romanoff (Black Widow)", "Gamora", "Nebula", "Wanda Maximoff"],
    "respuesta_correcta": "Natasha Romanoff (Black Widow)"
  },
  {
    "id": "hdm_050",
    "categoria": "CINE & SERIES",
    "pack": "heroes_del_multiverso",
    "pregunta": "¿Cómo se llama el dios del engaño que en el final de su serie tejió las ramas del multiverso con sus propias manos formando un árbol cósmico?",
    "emojis": "👑 🟢 🌳",
    "opciones": ["Loki", "Sylvie", "Thor", "Kang"],
    "respuesta_correcta": "Loki"
  }
];
window.MULTIVERSO_QUESTIONS_FALLBACK = MULTIVERSO_QUESTIONS_FALLBACK;

const GALAXIAS_QUESTIONS_FALLBACK = (typeof window !== 'undefined' && window.GALAXIAS_QUESTIONS_FALLBACK && window.GALAXIAS_QUESTIONS_FALLBACK.length >= 50)
  ? window.GALAXIAS_QUESTIONS_FALLBACK
  : [
  {
    "id": "glx_001",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué cristal sintonizado con la Fuerza es el corazón energético de un sable de luz?",
    "emojis": "💎 ⚔️ ✨",
    "opciones": ["Cristal Kyber", "Cristal Coaxium", "Piedra Beskar", "Cristal Nova"],
    "respuesta_correcta": "Cristal Kyber"
  },
  {
    "id": "glx_002",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál es el planeta desértico con dos soles gemelos donde crecieron Anakin y Luke Skywalker?",
    "emojis": "🏜️ ☀️ 🪐",
    "opciones": ["Tatooine", "Jakku", "Geonosis", "Korriban"],
    "respuesta_correcta": "Tatooine"
  },
  {
    "id": "glx_003",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué orden secreta ejecutaron los soldados clon para exterminar a los caballeros Jedi?",
    "emojis": "🪖 📜 💀",
    "opciones": ["Orden 66", "Orden 99", "Protocolo Imperial", "Orden 37"],
    "respuesta_correcta": "Orden 66"
  },
  {
    "id": "glx_004",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿De qué metal casi indestructible está forjada la armadura tradicional de los mandalorianos?",
    "emojis": "🛡️ 🪖 🦾",
    "opciones": ["Beskar", "Duracero", "Cortosis", "Titanio"],
    "respuesta_correcta": "Beskar"
  },
  {
    "id": "glx_005",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cómo se llama el cazarrecompensas que sirvió como plantilla genética para el Gran Ejército Clon?",
    "emojis": "🔫 🧬 🎯",
    "opciones": ["Jango Fett", "Boba Fett", "Cad Bane", "Din Djarin"],
    "respuesta_correcta": "Jango Fett"
  },
  {
    "id": "glx_006",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál era la designación numérica del droide astromecánico que acompañó a Luke Skywalker?",
    "emojis": "🤖 🔵 🚀",
    "opciones": ["R2-D2", "C-3PO", "BB-8", "Chopper"],
    "respuesta_correcta": "R2-D2"
  },
  {
    "id": "glx_007",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué maestro Sith y gobernante de Naboo manipuló la República bajo el alter ego de Canciller Palpatine?",
    "emojis": "⚡ 👑 😈",
    "opciones": ["Darth Sidious", "Darth Plagueis", "Darth Maul", "Darth Tyranus"],
    "respuesta_correcta": "Darth Sidious"
  },
  {
    "id": "glx_008",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿En qué planeta volcánico de lava pura tuvo lugar el duelo definitivo entre Obi-Wan y Anakin?",
    "emojis": "🌋 🔥 ⚔️",
    "opciones": ["Mustafar", "Sullust", "Exegol", "Moraband"],
    "respuesta_correcta": "Mustafar"
  },
  {
    "id": "glx_009",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué temible arma imperial esférica era capaz de pulverizar un planeta entero de un solo disparo?",
    "emojis": "🌕 💥 🌌",
    "opciones": ["La Estrella de la Muerte", "La Base Starkiller", "El Eclipse Imperial", "El Destructor Estelar"],
    "respuesta_correcta": "La Estrella de la Muerte"
  },
  {
    "id": "glx_010",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cómo se llama el contrabandista wookiee copiloto del Halcón Milenario?",
    "emojis": "🐻 🚀 🏹",
    "opciones": ["Chewbacca", "Tarfful", "Black Krrsantan", "Zaalbar"],
    "respuesta_correcta": "Chewbacca"
  },
  {
    "id": "glx_011",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué cúpula flotante en la atmósfera de Bespin era administrada por Lando Calrissian?",
    "emojis": "☁️ 🏙️ 🪐",
    "opciones": ["Ciudad de las Nubes", "Coruscant Superior", "Estación Nube", "Kamino Flotante"],
    "respuesta_correcta": "Ciudad de las Nubes"
  },
  {
    "id": "glx_012",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿En qué sustancia criogénica metálica fue congelado Han Solo para ser transportado ante Jabba?",
    "emojis": "🧊 ⛓️ 🪙",
    "opciones": ["Carbonita", "Beskar fundido", "Cromita", "Plastiacero"],
    "respuesta_correcta": "Carbonita"
  },
  {
    "id": "glx_013",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué pequeñas criaturas peludas y primitivas del bosque de Endor ayudaron a destruir el generador de escudo?",
    "emojis": "🐻 🌲 🏹",
    "opciones": ["Ewoks", "Jawas", "Ugnaughts", "Wookiees"],
    "respuesta_correcta": "Ewoks"
  },
  {
    "id": "glx_014",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál era la especie del cazador de recompensas Greedo en la cantina de Mos Eisley?",
    "emojis": "👽 🔫 🍺",
    "opciones": ["Rodiano", "Trandoshano", "Duros", "Bith"],
    "respuesta_correcta": "Rodiano"
  },
  {
    "id": "glx_015",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué aprendiz togruta tuvo Anakin Skywalker durante las Guerras Clon?",
    "emojis": "⚔️ ⚪ 👧",
    "opciones": ["Ahsoka Tano", "Barriss Offee", "Aayla Secura", "Shaak Ti"],
    "respuesta_correcta": "Ahsoka Tano"
  },
  {
    "id": "glx_016",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿En qué carrera de vainas de Tatooine ganó Anakin su libertad como esclavo?",
    "emojis": "🏎️ ⚡ 🏁",
    "opciones": ["El Clásico de Boonta Eve", "El Circuito de Mos Espa", "El Gran Premio de Kessel", "El Reto de Beggar's Canyon"],
    "respuesta_correcta": "El Clásico de Boonta Eve"
  },
  {
    "id": "glx_017",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué gobernante criminal de la especie Hutt residía en un opulento palacio en Tatooine?",
    "emojis": "🐌 💰 🐸",
    "opciones": ["Jabba el Hutt", "Rotta el Hutt", "Ziro el Hutt", "Gardulla"],
    "respuesta_correcta": "Jabba el Hutt"
  },
  {
    "id": "glx_018",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál es el nombre del planeta pantanoso donde el Maestro Yoda vivió su exilio?",
    "emojis": "🐸 🌿 🛖",
    "opciones": ["Dagobah", "Naboo", "Kashyyyk", "Dathomir"],
    "respuesta_correcta": "Dagobah"
  },
  {
    "id": "glx_019",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué título ostentaba el Conde Dooku en la Orden Sith bajo el mando de Sidious?",
    "emojis": "🗡️ 🔴 👴",
    "opciones": ["Darth Tyranus", "Darth Maul", "Darth Bane", "Darth Malak"],
    "respuesta_correcta": "Darth Tyranus"
  },
  {
    "id": "glx_020",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué comandante ciborg de cuatro brazos lideraba el ejército de droides separatista?",
    "emojis": "🤖 ⚔️ 🫁",
    "opciones": ["General Grievous", "Wat Tambor", "Almirante Trench", "Nute Gunray"],
    "respuesta_correcta": "General Grievous"
  },
  {
    "id": "glx_021",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué nave estelar completó la famosa Carrera de Kessel en menos de doce pársecs?",
    "emojis": "🚀 🌌 ⏱️",
    "opciones": ["El Halcón Milenario", "El Fantasma (Ghost)", "El Caza TIE Avanzado", "El Esclavo I"],
    "respuesta_correcta": "El Halcón Milenario"
  },
  {
    "id": "glx_022",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál era el nombre del sabueso zabrak que blandía un sable de luz de doble hoja roja en Naboo?",
    "emojis": "👹 ⚔️ 🔴",
    "opciones": ["Darth Maul", "Savage Opress", "Pre Vizsla", "Darth Malgus"],
    "respuesta_correcta": "Darth Maul"
  },
  {
    "id": "glx_023",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué planeta helado albergó la base Eco de la Alianza Rebelde atacada por caminantes AT-AT?",
    "emojis": "❄️ 🏔️ 🦣",
    "opciones": ["Hoth", "Ilum", "Kijimi", "Canto Bight"],
    "respuesta_correcta": "Hoth"
  },
  {
    "id": "glx_024",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cómo se llamaba la madre biológica de Luke Skywalker y Leia Organa?",
    "emojis": "👑 👸 🌺",
    "opciones": ["Padmé Amidala", "Shmi Skywalker", "Satine Kryze", "Breha Organa"],
    "respuesta_correcta": "Padmé Amidala"
  },
  {
    "id": "glx_025",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué pozo monstruoso en el Mar de Dunas digiere a sus víctimas a lo largo de mil años?",
    "emojis": "🕳️ 🦷 🏜️",
    "opciones": ["El Gran Foso de Carkoon (Sarlacc)", "La Cueva del Rancor", "El Abismo de Kessel", "El Nido del Krayt"],
    "respuesta_correcta": "El Gran Foso de Carkoon (Sarlacc)"
  },
  {
    "id": "glx_026",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué sable ancestral de hoja negra simboliza el liderazgo supremo sobre los clanes de Mandalore?",
    "emojis": "🗡️ 🖤 👑",
    "opciones": ["El Darksaber (Sable Oscuro)", "El Sable Sombrío", "La Espada de Mandalore", "El Filo Nocturno"],
    "respuesta_correcta": "El Darksaber (Sable Oscuro)"
  },
  {
    "id": "glx_027",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál es el planeta acuático donde los científicos nativos clonaron el ejército de la República?",
    "emojis": "🌊 🌧️ 🧬",
    "opciones": ["Kamino", "Mon Cala", "Manaan", "Ahch-To"],
    "respuesta_correcta": "Kamino"
  },
  {
    "id": "glx_028",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué entidad militar fanática surgió de los restos del Imperio en las Regiones Desconocidas?",
    "emojis": "🦅 🔴 ⚔️",
    "opciones": ["La Primera Orden", "El Remanente Carmesí", "El Consejo Separatista", "La Nueva Alianza"],
    "respuesta_correcta": "La Primera Orden"
  },
  {
    "id": "glx_029",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cómo se llama el estratega chiss de piel azul y ojos rojos que lideró las fuerzas del Imperio?",
    "emojis": "🔵 👁️ 🎖️",
    "opciones": ["Gran Almirante Thrawn", "Gobernador Tarkin", "Almirante Piett", "Moff Gideon"],
    "respuesta_correcta": "Gran Almirante Thrawn"
  },
  {
    "id": "glx_030",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué microscópicas formas de vida intracelulares determinan la afinidad biológica con la Fuerza?",
    "emojis": "🔬 ✨ 🧬",
    "opciones": ["Midiclorianos", "Cristales internos", "Células Kyber", "Esporas astrales"],
    "respuesta_correcta": "Midiclorianos"
  },
  {
    "id": "glx_031",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué planeta pacífico de la realeza fue completamente vaporizado por la primera Estrella de la Muerte?",
    "emojis": "🪐 💥 👸",
    "opciones": ["Alderaan", "Chandrila", "Hosnian Prime", "Naboo"],
    "respuesta_correcta": "Alderaan"
  },
  {
    "id": "glx_032",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál es el código sagrado de respuesta habitual entre los mandalorianos ortodoxos?",
    "emojis": "🪖 🛡️ 🗣️",
    "opciones": ["Este es el camino (This is the Way)", "Gloria a Mandalore", "La Fuerza nos guía", "Por el Beskar"],
    "respuesta_correcta": "Este es el camino (This is the Way)"
  },
  {
    "id": "glx_033",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿En qué planeta cubierto por una ciudad colosal se encontraba el Senado Galáctico y el Templo Jedi?",
    "emojis": "🏙️ 🏛️ 🪐",
    "opciones": ["Coruscant", "Corellia", "Kuat", "Taris"],
    "respuesta_correcta": "Coruscant"
  },
  {
    "id": "glx_034",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué color característico tenía el sable de luz empuñado por el Maestro Mace Windu?",
    "emojis": "🟣 ⚔️ ⚡",
    "opciones": ["Púrpura / Morado", "Amarillo dorado", "Cian", "Verde esmeralda"],
    "respuesta_correcta": "Púrpura / Morado"
  },
  {
    "id": "glx_035",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál es el verdadero nombre de 'El Niño', el infante sensible a la Fuerza rescatado por Din Djarin?",
    "emojis": "👶 🟢 🥣",
    "opciones": ["Grogu", "Gregar", "Yaddle", "Gork"],
    "respuesta_correcta": "Grogu"
  },
  {
    "id": "glx_036",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué inquisidores o cazadores imperiales fueron entrenados para cazar a los Jedi supervivientes de la Purga?",
    "emojis": "🚁 ⚔️ 🔴",
    "opciones": ["Los Inquisidores Imperiales", "La Guardia Carmesí", "Los Soldados de la Purga", "Los Caballeros de Ren"],
    "respuesta_correcta": "Los Inquisidores Imperiales"
  },
  {
    "id": "glx_037",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿En qué planeta remoto cubierto de agua e islas rocosas se fundó el primer Templo de la Orden Jedi?",
    "emojis": "🌊 🪨 📜",
    "opciones": ["Ahch-To", "Tython", "Jedha", "Ossus"],
    "respuesta_correcta": "Ahch-To"
  },
  {
    "id": "glx_038",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál era el nombre del capitán clon al mando de la venerada Legión 501 junto a Anakin?",
    "emojis": "🪖 🔵 🔫",
    "opciones": ["Rex (CT-7567)", "Cody", "Fives", "Wolffe"],
    "respuesta_correcta": "Rex (CT-7567)"
  },
  {
    "id": "glx_039",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué especie reptiliana carroñera viaja por el desierto de Tatooine en gigantescos Sandcrawlers?",
    "emojis": "🟫 👁️ ⚙️",
    "opciones": ["Jawas", "Moradores de las Arenas", "Hutts", "Weequays"],
    "respuesta_correcta": "Jawas"
  },
  {
    "id": "glx_040",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué científico diseñó deliberadamente la falla térmica en la Estrella de la Muerte para los rebeldes?",
    "emojis": "📐 💥 📡",
    "opciones": ["Galen Erso", "Orson Krennic", "Bevel Lemelisk", "Bodhi Rook"],
    "respuesta_correcta": "Galen Erso"
  },
  {
    "id": "glx_041",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál es la regla Sith establecida por Darth Bane que limita su orden a solo dos miembros simultáneos?",
    "emojis": "👥 ⚖️ 🔴",
    "opciones": ["La Regla de Dos", "El Pacto Sombrío", "La Doctrina del Maestro", "El Código Rojo"],
    "respuesta_correcta": "La Regla de Dos"
  },
  {
    "id": "glx_042",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿En qué planeta tropical de archivos imperiales se libró la batalla para transmitir los planos de la Estrella?",
    "emojis": "🌴 🌊 📡",
    "opciones": ["Scarif", "Eadu", "Jedha", "Lothal"],
    "respuesta_correcta": "Scarif"
  },
  {
    "id": "glx_043",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué coto minero y luna helada fue el centro de extracción masiva de cristales kyber para el Imperio?",
    "emojis": "❄️ ⛏️ 💎",
    "opciones": ["Ilum", "Kessel", "Mygeeto", "Dantooine"],
    "respuesta_correcta": "Ilum"
  },
  {
    "id": "glx_044",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cómo se llamaba el clan de hechiceras que dominaban la magia oscura y la Fuerza en Dathomir?",
    "emojis": "🧙‍♀️ 🟢 🗡️",
    "opciones": ["Las Hermanas de la Noche", "Las Hijas del Lado Oscuro", "El Aquelarre Sith", "Las Brujas de Kessel"],
    "respuesta_correcta": "Las Hermanas de la Noche"
  },
  {
    "id": "glx_045",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué caza estelar rebelde cuenta con cuatro alas móviles que se despliegan en posición de 'X'?",
    "emojis": "🚀 ⚔️ 🌌",
    "opciones": ["Ala-X (X-Wing)", "Ala-Y (Y-Wing)", "Ala-A (A-Wing)", "Ala-B (B-Wing)"],
    "respuesta_correcta": "Ala-X (X-Wing)"
  },
  {
    "id": "glx_046",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cómo se llamaba la fortaleza personal construida por Darth Vader sobre una cueva Sith en Mustafar?",
    "emojis": "🏰 🌋 🖤",
    "opciones": ["Castillo Bast", "Palacio Imperial", "Fortaleza Inquisitorial", "Ciudadela Sombría"],
    "respuesta_correcta": "Castillo Bast"
  },
  {
    "id": "glx_047",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Cuál es la designación numérica del droide de protocolo dorado con dominio de más de seis millones de formas de comunicación?",
    "emojis": "🤖 🟡 🗣️",
    "opciones": ["C-3PO", "TC-14", "0-0-0", "K-2SO"],
    "respuesta_correcta": "C-3PO"
  },
  {
    "id": "glx_048",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué mineral escaso de color rojo se extrae en las minas de Crait revelándose bajo una costra blanca de sal?",
    "emojis": "🧂 🔴 🦊",
    "opciones": ["Rhodio / Cristales rojos", "Beskar", "Coaxium", "Tibanna"],
    "respuesta_correcta": "Rhodio / Cristales rojos"
  },
  {
    "id": "glx_049",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿Qué bestia carnívora con colmillos habitaba en el foso bajo la sala del trono de Jabba el Hutt?",
    "emojis": "👹 🍖 ⛓️",
    "opciones": ["Rancor", "Wampa", "Acklay", "Nexu"],
    "respuesta_correcta": "Rancor"
  },
  {
    "id": "glx_050",
    "categoria": "CINE & SERIES",
    "pack": "galaxias_lejanas",
    "pregunta": "¿En qué planeta secreto del Lado Oscuro se ocultó la Flota Sith de Destructores Estelares en la Batalla de Exegol?",
    "emojis": "⚡ 💀 🌌",
    "opciones": ["Exegol", "Korriban", "Malachor", "Byss"],
    "respuesta_correcta": "Exegol"
  }
];
window.GALAXIAS_QUESTIONS_FALLBACK = GALAXIAS_QUESTIONS_FALLBACK;

const KI_QUESTIONS_FALLBACK = (typeof window !== 'undefined' && window.KI_QUESTIONS_FALLBACK && window.KI_QUESTIONS_FALLBACK.length >= 50)
  ? window.KI_QUESTIONS_FALLBACK
  : [
  {
    "id": "ki_001",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué técnica destructiva de energía aprendió Gokū del Maestro Roshi tras verla una sola vez?",
    "emojis": "🐉 🥋 💥",
    "opciones": ["Kamehameha", "Kafuken", "Kienzan", "Masenko"],
    "respuesta_correcta": "Kamehameha"
  },
  {
    "id": "ki_002",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuántas estrellas tiene la esfera del dragón que el abuelo Gohan le heredó a Gokū?",
    "emojis": "🟠 ⭐ 👴",
    "opciones": ["Cuatro estrellas", "Una estrella", "Siete estrellas", "Tres estrellas"],
    "respuesta_correcta": "Cuatro estrellas"
  },
  {
    "id": "ki_003",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué deidad ancestral habita al final del Camino de la Serpiente y enseñó el Kaio-ken?",
    "emojis": "🐍 🪐 🥋",
    "opciones": ["Kaio-sama del Norte", "Kamisama", "Gran Patriarca", "Kibito"],
    "respuesta_correcta": "Kaio-sama del Norte"
  },
  {
    "id": "ki_004",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuál es el verdadero nombre de nacimiento saiyajin de Son Gokū?",
    "emojis": "👶 🚀 🐵",
    "opciones": ["Kakarotto", "Bardock", "Raditz", "Turles"],
    "respuesta_correcta": "Kakarotto"
  },
  {
    "id": "ki_005",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué alimento milagroso cultivado por el maestro Karin cura heridas letales y repone la energía al instante?",
    "emojis": "🐱 🫘 ⚡",
    "opciones": ["Semilla del Ermitaño (Senzu)", "Fruto sagrado", "Brote de Namek", "Hierba celestial"],
    "respuesta_correcta": "Semilla del Ermitaño (Senzu)"
  },
  {
    "id": "ki_006",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llama el dragón sagrado invocado al reunir las 7 esferas de la Tierra?",
    "emojis": "🐉 🟠 ⚡",
    "opciones": ["Shenlong", "Porunga", "Super Shenlong", "Zalama"],
    "respuesta_correcta": "Shenlong"
  },
  {
    "id": "ki_007",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué técnica mortal en forma de disco cortante de Ki fue inventada por Krilin?",
    "emojis": "💿 💥 👨‍🦲",
    "opciones": ["Kienzan", "Taiyoken", "Rokkaken", "Sokidan"],
    "respuesta_correcta": "Kienzan"
  },
  {
    "id": "ki_008",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuál es el planeta natal original de Piccolo y Kamisama destruido por un cataclismo climático?",
    "emojis": "🪐 🟢 💧",
    "opciones": ["Namekusei (Namek)", "Planeta Vegeta", "Sadala", "Yardrat"],
    "respuesta_correcta": "Namekusei (Namek)"
  },
  {
    "id": "ki_009",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué muerte desató por primera vez la transformación de Gokū en Super Saiyajin legendario?",
    "emojis": "⚡ 👱‍♂️ 🩸",
    "opciones": ["La muerte de Krilin a manos de Freezer", "El sacrificio de Piccolo", "La caída de Vegeta", "La muerte de Yamcha"],
    "respuesta_correcta": "La muerte de Krilin a manos de Freezer"
  },
  {
    "id": "ki_010",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Quién derrotó a Cell Perfecto alcanzando por primera vez la fase de Super Saiyajin 2?",
    "emojis": "⚡ 🧒 💥",
    "opciones": ["Gohan", "Gokū", "Vegeta", "Trunks del Futuro"],
    "respuesta_correcta": "Gohan"
  },
  {
    "id": "ki_011",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué artefactos mágicos de los Supremos Kaio-shin permiten una fusión permanente o de una hora?",
    "emojis": "👂 🟣 💫",
    "opciones": ["Aretes Pothala", "Anillos del Tiempo", "Brazaletes Metamoranos", "Cristales Ki"],
    "respuesta_correcta": "Aretes Pothala"
  },
  {
    "id": "ki_012",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuál es el nombre del guerrero fusionado resultante de la Danza de la Fusión entre Gokū y Vegeta?",
    "emojis": "🕺 💥 ⚡",
    "opciones": ["Gogeta", "Vegetto", "Gotenks", "Gokhan"],
    "respuesta_correcta": "Gogeta"
  },
  {
    "id": "ki_013",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llama el Dios de la Destrucción felino del Universo 7 amante de la comida gourmet?",
    "emojis": "🐱 🟣 🍜",
    "opciones": ["Bills (Beerus)", "Champa", "Quitela", "Belmod"],
    "respuesta_correcta": "Bills (Beerus)"
  },
  {
    "id": "ki_014",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué técnica suprema donde el cuerpo esquiva y contraataca por puro instinto dominó Gokū en el Torneo de la Fuerza?",
    "emojis": "⚪ 🧘 🌌",
    "opciones": ["Ultra Instinto (Doctrina Egoísta)", "Ultra Ego", "Kaioken x20", "Puño del Dragón"],
    "respuesta_correcta": "Ultra Instinto (Doctrina Egoísta)"
  },
  {
    "id": "ki_015",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué habitáculo en el templo de Kamisama permite entrenar el equivalente a un año en solo un día terrestre?",
    "emojis": "⏳ 🚪 🏔️",
    "opciones": ["Habitación del Tiempo", "Cámara de Gravedad", "Palacio de Enma", "Cueva Espiritual"],
    "respuesta_correcta": "Habitación del Tiempo"
  },
  {
    "id": "ki_016",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llama el capitán de las Fuerzas Especiales Ginyu capaz de cambiar de cuerpo con su rival?",
    "emojis": "🐸 🟣 🔁",
    "opciones": ["Capitán Ginyu", "Jeice", "Burter", "Recoome"],
    "respuesta_correcta": "Capitán Ginyu"
  },
  {
    "id": "ki_017",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué androide pacífico amante de la naturaleza fue aplastado por Cell despertando la furia de Gohan?",
    "emojis": "🤖 🐦 💥",
    "opciones": ["Androide 16", "Androide 17", "Androide 18", "Androide 8"],
    "respuesta_correcta": "Androide 16"
  },
  {
    "id": "ki_018",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué técnica de cegamiento temporal utiliza la energía lumínica del sol reflejada en el rostro?",
    "emojis": "☀️ 🕶️ 🥋",
    "opciones": ["Taiyoken", "Kafuken", "Sokidan", "Masenko"],
    "respuesta_correcta": "Taiyoken"
  },
  {
    "id": "ki_019",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿En qué planeta aprendió Gokū la técnica de la Teletransportación tras sobrevivir a Namek?",
    "emojis": "🌌 🌀 🥋",
    "opciones": ["Yardrat", "Metamor", "Cereal", "Vampa"],
    "respuesta_correcta": "Yardrat"
  },
  {
    "id": "ki_020",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuál es el dragón gigante de Namekusei que concede hasta tres deseos en idioma namekiano?",
    "emojis": "🐉 🟢 💧",
    "opciones": ["Porunga", "Shenlong", "Zalama", "Toronbo"],
    "respuesta_correcta": "Porunga"
  },
  {
    "id": "ki_021",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué hechicero malvado revivió al demonio Majin Buu usando la energía de las batallas?",
    "emojis": "🧙‍♂️ 🟣 📜",
    "opciones": ["Babidi", "Bibidi", "Moro", "Hoi"],
    "respuesta_correcta": "Babidi"
  },
  {
    "id": "ki_022",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuál es el ataque insignia de Piccolo que concentra un taladro de energía letal en dos dedos?",
    "emojis": "🟣 🌀 🎯",
    "opciones": ["Makankosappo", "Masenko", "Hellzone Grenade", "Kikohu"],
    "respuesta_correcta": "Makankosappo"
  },
  {
    "id": "ki_023",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llama el ángel guardián y maestro de artes marciales de Bills?",
    "emojis": "👼 🦯 🌀",
    "opciones": ["Whis", "Vados", "Daishinkan", "Merus"],
    "respuesta_correcta": "Whis"
  },
  {
    "id": "ki_024",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué mortal silencioso y justiciero del Universo 11 llevó a Gokū hasta sus límites en el Torneo de la Fuerza?",
    "emojis": "👽 🔴 💥",
    "opciones": ["Jiren", "Toppo", "Dyspo", "Hit"],
    "respuesta_correcta": "Jiren"
  },
  {
    "id": "ki_025",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué técnica devastadora de Tenshinhan consume su propia fuerza vital al disparar un triángulo de choque?",
    "emojis": "🔺 💥 👁️",
    "opciones": ["Kikoho", "Dodonpa", "Taiyoken", "Haikyuken"],
    "respuesta_correcta": "Kikoho"
  },
  {
    "id": "ki_026",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llama la nube voladora mágica que solo permite montar a personas de corazón puro?",
    "emojis": "☁️ 🟡 💨",
    "opciones": ["Kinto'un (Nube Voladora)", "Nube Nimbus", "Kame Cloud", "Nube Astral"],
    "respuesta_correcta": "Kinto'un (Nube Voladora)"
  },
  {
    "id": "ki_027",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué asesino legendario del Universo 6 domina la técnica del Salto Temporal (Tokitobashi)?",
    "emojis": "⏱️ 🟣 🧥",
    "opciones": ["Hit", "Frost", "Cabba", "Magetta"],
    "respuesta_correcta": "Hit"
  },
  {
    "id": "ki_028",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué padre saiyajin de Gokū lideró una rebelión solitaria contra Freezer al descubrir su traición?",
    "emojis": "🪖 🔴 🚀",
    "opciones": ["Bardock", "Rey Vegeta", "Paragus", "Nappa"],
    "respuesta_correcta": "Bardock"
  },
  {
    "id": "ki_029",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué gobernante supremo de todo el multiverso tiene el poder de borrar universos enteros con un simple gesto?",
    "emojis": "👑 👶 🌌",
    "opciones": ["Zeno-sama", "Daishinkan", "Zalama", "Kamin"],
    "respuesta_correcta": "Zeno-sama"
  },
  {
    "id": "ki_030",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué técnica de sellado ancestral en vasijas de arroz se utilizó contra Piccolo Daimaku?",
    "emojis": "🏺 📜 🌀",
    "opciones": ["Mafuba", "Kafuken", "Sokidan", "Kaioken"],
    "respuesta_correcta": "Mafuba"
  },
  {
    "id": "ki_031",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llamaba el abuelo adoptivo humano que crió y entrenó a Gokū en la montaña Paoz?",
    "emojis": "👴 🏔️ 🥋",
    "opciones": ["Son Gohan", "Maestro Roshi", "Mutaito", "Tsuru Sen'nin"],
    "respuesta_correcta": "Son Gohan"
  },
  {
    "id": "ki_032",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuál es la transformación en mono gigante que sufren los Saiyajines con cola ante la luna llena?",
    "emojis": "🌕 🐵 💥",
    "opciones": ["Ozaru", "Yeti", "Gorr", "Kong"],
    "respuesta_correcta": "Ozaru"
  },
  {
    "id": "ki_033",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué aprendiz Supremo Kaio-shin del Universo 10 robó el cuerpo de Gokū usando las Super Esferas?",
    "emojis": "💍 🟢 🖤",
    "opciones": ["Zamasu (Gokū Black)", "Gowasu", "Fu", "Demigra"],
    "respuesta_correcta": "Zamasu (Gokū Black)"
  },
  {
    "id": "ki_034",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué miembro de las Fuerzas Especiales Ginyu podía congelar el tiempo conteniendo su propia respiración?",
    "emojis": "🫁 ⏱️ 👽",
    "opciones": ["Guldo", "Burter", "Jeice", "Recoome"],
    "respuesta_correcta": "Guldo"
  },
  {
    "id": "ki_035",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Quién es el hermano biológico mayor de Gokū que llegó a la Tierra secuestrando al pequeño Gohan?",
    "emojis": "🦱 🪖 🚀",
    "opciones": ["Raditz", "Turles", "Nappa", "Broly"],
    "respuesta_correcta": "Raditz"
  },
  {
    "id": "ki_036",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuál es el ataque final de Vegeta donde abre los brazos acumulando Ki dorado devastador?",
    "emojis": "⚡ 👐 💥",
    "opciones": ["Final Flash (Resplandor Final)", "Galick Ho", "Big Bang Attack", "Ataque Big Bang"],
    "respuesta_correcta": "Final Flash (Resplandor Final)"
  },
  {
    "id": "ki_037",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué dios de la creación del Universo 7 estuvo encerrado millones de años dentro de la Espada Z?",
    "emojis": "🗡️ 👴 🧙‍♂️",
    "opciones": ["El Anciano Kaio-shin de hace 15 generaciones", "Shin", "Kibito", "Gran Kaio-sama"],
    "respuesta_correcta": "El Anciano Kaio-shin de hace 15 generaciones"
  },
  {
    "id": "ki_038",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llama el científico del Ejército de la Patrulla Roja que creó a Cell y a los androides?",
    "emojis": "👨‍🔬 🤖 ⚙️",
    "opciones": ["Dr. Gero (Androide 20)", "Dr. Myu", "Dr. Kochin", "Dr. Wheelo"],
    "respuesta_correcta": "Dr. Gero (Androide 20)"
  },
  {
    "id": "ki_039",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué esferas cósmicas gigantes del tamaño de planetas fueron forjadas por el dios Zalama?",
    "emojis": "🪐 🟠 ⭐",
    "opciones": ["Super Esferas del Dragón", "Esferas Oscuras", "Esferas de Namek", "Orbes Celestiales"],
    "respuesta_correcta": "Super Esferas del Dragón"
  },
  {
    "id": "ki_040",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué técnica recolecta la energía viva de la naturaleza y los planetas para formar una esfera colosal?",
    "emojis": "🙌 🌍 ⚪",
    "opciones": ["Genki-dama", "Bomba Espiritual", "Kamehameha Solar", "Esfera Destructora"],
    "respuesta_correcta": "Genki-dama"
  },
  {
    "id": "ki_041",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llama el saiyajin legendario de poder descontrolado exiliado en el inhóspito planeta Vampa?",
    "emojis": "🟢 😡 ⚡",
    "opciones": ["Broly", "Paragus", "Cumber", "Shallot"],
    "respuesta_correcta": "Broly"
  },
  {
    "id": "ki_042",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué alter ego enmascarado adopta Mr. Satán o Gohan para proteger Ciudad Satán durante la preparatoria?",
    "emojis": "🦸‍♂️ 🕶️ 🏫",
    "opciones": ["Gran Saiyaman", "Capitán Justicia", "Golden Warrior", "Hero Boy"],
    "respuesta_correcta": "Gran Saiyaman"
  },
  {
    "id": "ki_043",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué torneo multiversal reunió a 80 guerreros sobre una pista de Kachi Katchin en el Mundo de la Nada?",
    "emojis": "🏟️ 🌌 🏆",
    "opciones": ["Torneo de la Fuerza", "Torneo de Champa", "Torneo del Más Allá", "Torneo de Cell"],
    "respuesta_correcta": "Torneo de la Fuerza"
  },
  {
    "id": "ki_044",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué rey demoníaco de piel roja fue controlado por Babidi antes de ser devorado por Majin Buu?",
    "emojis": "😈 🗡️ 👑",
    "opciones": ["Dabura", "Janemba", "Yakon", "Pui Pui"],
    "respuesta_correcta": "Dabura"
  },
  {
    "id": "ki_045",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cuál es la forma dorada que alcanzó Freezer tras entrenar disciplinadamente por primera vez en su vida?",
    "emojis": "🟡 👽 ⚡",
    "opciones": ["Golden Freezer", "Freezer Forma Final", "Mecha Freezer", "Freezer Platino"],
    "respuesta_correcta": "Golden Freezer"
  },
  {
    "id": "ki_046",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué saiyajin femenina del Universo 6 desató una transformación berserker verde similar a Broly?",
    "emojis": "🟢 👧 ⚡",
    "opciones": ["Kale", "Caulifla", "Kefla", "Cocotte"],
    "respuesta_correcta": "Kale"
  },
  {
    "id": "ki_047",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué poder concedió el Anciano Kaio-shin a Gohan tras bailar a su alrededor liberando su potencial oculto?",
    "emojis": "🧘 ⚡ 💥",
    "opciones": ["Estado Místico (Gohan Definitivo)", "Super Saiyajin 3", "Modo Bestia", "Ki Divino"],
    "respuesta_correcta": "Estado Místico (Gohan Definitivo)"
  },
  {
    "id": "ki_048",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Cómo se llama el maestro de artes marciales rival de Roshi que entrenó a Tenshinhan y Chaoz?",
    "emojis": "🥋 🪖 🦅",
    "opciones": ["Tsuru Sen'nin (Maestro Cuervo)", "Maestro Mutaito", "Tao Pai Pai", "Bora"],
    "respuesta_correcta": "Tsuru Sen'nin (Maestro Cuervo)"
  },
  {
    "id": "ki_049",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Qué asesino cibernético a sueldo se transportaba montado sobre un pilar o tronco arrojado por él mismo?",
    "emojis": "🪵 🗡️ 🥋",
    "opciones": ["Tao Pai Pai", "General Blue", "Coronel Silver", "Ninja Murasaki"],
    "respuesta_correcta": "Tao Pai Pai"
  },
  {
    "id": "ki_050",
    "categoria": "ANIMACIÓN",
    "pack": "guerreros_ki",
    "pregunta": "¿Quién pidió el deseo final a las Super Esferas para restaurar todos los universos borrados en el Torneo de la Fuerza?",
    "emojis": "🤖 🏆 🌌",
    "opciones": ["Androide 17", "Gokū", "Freezer", "Jiren"],
    "respuesta_correcta": "Androide 17"
  }
];
window.KI_QUESTIONS_FALLBACK = KI_QUESTIONS_FALLBACK;

const REINO_QUESTIONS_FALLBACK = (typeof window !== 'undefined' && window.REINO_QUESTIONS_FALLBACK && window.REINO_QUESTIONS_FALLBACK.length >= 50)
  ? window.REINO_QUESTIONS_FALLBACK
  : [
  {
    "id": "rch_001",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué poder otorga el Super Champiñón rojo al fontanero en sus aventuras?",
    "emojis": "🍄 🧱 ⬆️",
    "opciones": ["Duplica su tamaño y fuerza", "Invencibilidad temporal", "Lanzar bolas de fuego", "Volar por los aires"],
    "respuesta_correcta": "Duplica su tamaño y fuerza"
  },
  {
    "id": "rch_002",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama el dinosaurio verde de montura que debutó en Dinosaur Land?",
    "emojis": "🦖 🥚 🍎",
    "opciones": ["Yoshi", "Birdo", "Rex", "Plesio"],
    "respuesta_correcta": "Yoshi"
  },
  {
    "id": "rch_003",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué objeto temido persigue implacablemente al corredor en primera posición en las carreras de karts?",
    "emojis": "🏎️ 🐢 💥",
    "opciones": ["Caparazón azul con pinchos", "Caparazón rojo teledirigido", "Rayo reductor", "Bomba Bob-omb"],
    "respuesta_correcta": "Caparazón azul con pinchos"
  },
  {
    "id": "rch_004",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cuál es el reino donde gobierna la Princesa Peach con sus leales siervos Toad?",
    "emojis": "🍄 🏰 👑",
    "opciones": ["Reino Champiñón", "Reino Sarasaraland", "Isla Delfino", "Reino Judía"],
    "respuesta_correcta": "Reino Champiñón"
  },
  {
    "id": "rch_005",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué flor clásica transforma el atuendo a blanco y permite arrojar esferas ardientes?",
    "emojis": "🔥 🌼 ⚪",
    "opciones": ["Flor de Fuego", "Flor de Hielo", "Flor Boomerang", "Flor Nube"],
    "respuesta_correcta": "Flor de Fuego"
  },
  {
    "id": "rch_006",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama el rey de los Koopas que suele raptar a la princesa en su fortaleza?",
    "emojis": "🐢 🔥 👑",
    "opciones": ["Bowser", "Kamek", "Wart", "Tatl"],
    "respuesta_correcta": "Bowser"
  },
  {
    "id": "rch_007",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué artefacto aspirador utiliza el hermano de verde para capturar fantasmas en mansiones?",
    "emojis": "👻 🧹 🔦",
    "opciones": ["Poltergust (Succionaentes)", "GhostBuster 3000", "Aspiradora FLUDD", "Vaccum Buster"],
    "respuesta_correcta": "Poltergust (Succionaentes)"
  },
  {
    "id": "rch_008",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué objeto estelar dorado otorga inmunidad absoluta a los peligros por tiempo limitado?",
    "emojis": "⭐ ✨ 🌈",
    "opciones": ["Super Estrella", "Estrella Carmesí", "Moneda Sol", "Gran Estrella"],
    "respuesta_correcta": "Super Estrella"
  },
  {
    "id": "rch_009",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llaman los enemigos marrones con forma de seta que caminan en línea recta?",
    "emojis": "🍄 👞 👣",
    "opciones": ["Goombas", "Koopas", "Buzzy Beetles", "Shy Guys"],
    "respuesta_correcta": "Goombas"
  },
  {
    "id": "rch_0010",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué dispositivo parlante de bombeo de agua acompañó al héroe a limpiar la Isla Delfino?",
    "emojis": "💧 🏝️ 🎒",
    "opciones": ["F.L.U.D.D.", "AquaPump", "HydroCannon", "SprayPack"],
    "respuesta_correcta": "F.L.U.D.D."
  },
  {
    "id": "rch_011",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cuántas estrellas de poder se requerían en total para completar el rescate en el castillo 3D en 1996?",
    "emojis": "⭐ 🏰 🔢",
    "opciones": ["120 estrellas", "100 estrellas", "150 estrellas", "99 estrellas"],
    "respuesta_correcta": "120 estrellas"
  },
  {
    "id": "rch_012",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué criatura fantasma tímida se tapa el rostro cuando la miras directamente de frente?",
    "emojis": "👻 🙈 🏰",
    "opciones": ["Boo", "Dry Bones", "Phanto", "Peepa"],
    "respuesta_correcta": "Boo"
  },
  {
    "id": "rch_013",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama el rival codicioso vestido de amarillo y morado obsesionado con el ajo y las monedas?",
    "emojis": "🧄 🟡 💰",
    "opciones": ["Wario", "Waluigi", "Tatanga", "Foreman Spike"],
    "respuesta_correcta": "Wario"
  },
  {
    "id": "rch_014",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué hoja especial concede orejas y cola de mapache para planear por el aire?",
    "emojis": "🍃 🦝 ✈️",
    "opciones": ["Super Hoja (Tanooki)", "Hoja Dorada", "Pluma Capa", "Brote Volador"],
    "respuesta_correcta": "Super Hoja (Tanooki)"
  },
  {
    "id": "rch_015",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama la princesa gobernante del reino Sarasaland rescatada de las garras de Tatanga?",
    "emojis": "🌼 👑 🧡",
    "opciones": ["Princesa Daisy", "Princesa Rosalina", "Pauline", "Reina Shokora"],
    "respuesta_correcta": "Princesa Daisy"
  },
  {
    "id": "rch_016",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué planta carnívora con dientes afilados brota de las tuberías verdes para morder?",
    "emojis": "🪴 🦷 🟢",
    "opciones": ["Planta Piraña", "Nipper Plant", "Petey Piranha", "Flor Masticadora"],
    "respuesta_correcta": "Planta Piraña"
  },
  {
    "id": "rch_017",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué hechicero de túnica azul con varita mágica lidera a los Magikoopas sirviendo a Bowser?",
    "emojis": "🧙‍♂️ 👓 🪄",
    "opciones": ["Kamek", "Kammy", "Cackletta", "Fawful"],
    "respuesta_correcta": "Kamek"
  },
  {
    "id": "rch_018",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué objeto verde otorga de forma inmediata una vida extra?",
    "emojis": "🍄 🟢 💖",
    "opciones": ["Champiñón 1-Up", "Hongo Vida", "Brote Esmeralda", "Mega Champiñón"],
    "respuesta_correcta": "Champiñón 1-Up"
  },
  {
    "id": "rch_019",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama la guardiana del Observatorio del Cometa y madre adoptiva de los destellos Luma?",
    "emojis": "🌌 👑 ⭐",
    "opciones": ["Rosalina (Estela)", "Daisy", "Peach", "Pauline"],
    "respuesta_correcta": "Rosalina (Estela)"
  },
  {
    "id": "rch_020",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué vehículo volador individual con cara sonriente utiliza Bowser para patrullar los cielos?",
    "emojis": "🚁 🤡 🛸",
    "opciones": ["Koopa Clown Car", "Helicóptero Bowser", "AeroKoopa", "Airship Mini"],
    "respuesta_correcta": "Koopa Clown Car"
  },
  {
    "id": "rch_021",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué criatura sobre una nube arroja pequeños huevos que se transforman en Spikies con pinchos?",
    "emojis": "☁️ 👓 🐢",
    "opciones": ["Lakitu", "Kamek", "Hammer Bro", "Chargin' Chuck"],
    "respuesta_correcta": "Lakitu"
  },
  {
    "id": "rch_022",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cuál es el nombre de la enorme bola de metal negra con dientes atada a una cadena?",
    "emojis": "⛓️ 🦷 💣",
    "opciones": ["Chain Chomp", "Bob-omb", "Thwomp", "Whomp"],
    "respuesta_correcta": "Chain Chomp"
  },
  {
    "id": "rch_023",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué objeto de carreras arroja tinta negra tapando la pantalla de los oponentes?",
    "emojis": "🦑 🖤 🏎️",
    "opciones": ["Blooper", "Calamar Tinta", "Mancha Negra", "Octorok"],
    "respuesta_correcta": "Blooper"
  },
  {
    "id": "rch_024",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llaman las tortugas esqueléticas no muertas que se desarman al pisarlas y vuelven a ensamblarse?",
    "emojis": "🦴 🐢 💀",
    "opciones": ["Dry Bones (Huesitos)", "Koopa Skell", "Bony Beetle", "Skeleton Turtle"],
    "respuesta_correcta": "Dry Bones (Huesitos)"
  },
  {
    "id": "rch_025",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué instrumento ancestral o gorra mágica permite controlar a dinosaurios y enemigos en Odyssey?",
    "emojis": "🧢 👁️ 🪄",
    "opciones": ["Cappy", "Tiara", "Crownie", "Cap-Bot"],
    "respuesta_correcta": "Cappy"
  },
  {
    "id": "rch_026",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cuál es la pista final más célebre y desafiante de las copas de carreras, repleta de curvas al vacío?",
    "emojis": "🌈 🏎️ 🌌",
    "opciones": ["Senda Arcoíris (Rainbow Road)", "Pista Galáctica", "Autopista Estelar", "Circuito Cósmico"],
    "respuesta_correcta": "Senda Arcoíris (Rainbow Road)"
  },
  {
    "id": "rch_027",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama el bloque de piedra con rostro enfadado que cae pesadamente para aplastar a quien pase?",
    "emojis": "🗿 😠 💥",
    "opciones": ["Thwomp (Roca Picuda)", "Whomp", "Crusher Block", "Stone Koopa"],
    "respuesta_correcta": "Thwomp (Roca Picuda)"
  },
  {
    "id": "rch_028",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué mono lanzaba barriles por vigas de construcción en el clásico arcade de 1981?",
    "emojis": "🦍 🛢️ 🔨",
    "opciones": ["Donkey Kong", "Diddy Kong", "Cranky Kong", "Funky Kong"],
    "respuesta_correcta": "Donkey Kong"
  },
  {
    "id": "rch_029",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué proyectil con mecha camina dando cuerda sobre sus patas antes de estallar?",
    "emojis": "💣 💥 👣",
    "opciones": ["Bob-omb", "Bullet Bill", "Banzai Bill", "Bomb Koopa"],
    "respuesta_correcta": "Bob-omb"
  },
  {
    "id": "rch_030",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué enemigas tortugas atacan a distancia arrojando martillos en arcos parabólicos?",
    "emojis": "🔨 🐢 🪖",
    "opciones": ["Hammer Bros", "Boomerang Bros", "Fire Bros", "Sledge Bros"],
    "respuesta_correcta": "Hammer Bros"
  },
  {
    "id": "rch_031",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama la dama en apuros capturada en el rascacielos del juego original de Donkey Kong?",
    "emojis": "👗 👠 🏙️",
    "opciones": ["Pauline", "Peach", "Daisy", "Rosalina"],
    "respuesta_correcta": "Pauline"
  },
  {
    "id": "rch_032",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué enorme misil de ojos fieros es disparado desde torretas y cañones negros?",
    "emojis": "🚀 👁️ 💣",
    "opciones": ["Bullet Bill (Bala Bill)", "Torpedo Ted", "Banzai Blast", "Cannon Ball"],
    "respuesta_correcta": "Bullet Bill (Bala Bill)"
  },
  {
    "id": "rch_033",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué flor de hielo otorga la capacidad de disparar bolas gélidas para congelar rivales en cubos?",
    "emojis": "❄️ 🌼 🧊",
    "opciones": ["Flor de Hielo", "Flor Escarcha", "Campana Polar", "Flor Nevada"],
    "respuesta_correcta": "Flor de Hielo"
  },
  {
    "id": "rch_034",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama el hijo pequeño y travieso de Bowser que usa un pañuelo con colmillos pintados?",
    "emojis": "🐢 🎨 👶",
    "opciones": ["Bowser Jr.", "Ludwig", "Iggy", "Morton"],
    "respuesta_correcta": "Bowser Jr."
  },
  {
    "id": "rch_035",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué campana mágica introducida en 3D World transforma a los personajes con trajes felinos para trepar?",
    "emojis": "🔔 🐱 🐾",
    "opciones": ["Super Campana (Cascabel)", "Campana de Oro", "Traje Felino", "Miau Bell"],
    "respuesta_correcta": "Super Campana (Cascabel)"
  },
  {
    "id": "rch_036",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué topo con lentes de sol excava y arroja llaves inglesas desde el subsuelo?",
    "emojis": "🕶️ 🕳️ 🔧",
    "opciones": ["Monty Mole", "Rocky Wrench", "Mega Mole", "Diglett Koopa"],
    "respuesta_correcta": "Monty Mole"
  },
  {
    "id": "rch_037",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué pez inflable y picudo salta del agua intentando derribar plataformas en niveles marinos?",
    "emojis": "🐡 🌊 🎈",
    "opciones": ["Cheep Cheep", "Porcupuffer", "Rip Van Fish", "Blooper King"],
    "respuesta_correcta": "Cheep Cheep"
  },
  {
    "id": "rch_038",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cuál es la metrópoli cosmopolita repleta de taxis amarillos gobernada por la alcaldesa Pauline?",
    "emojis": "🏙️ 🚕 🎩",
    "opciones": ["New Donk City", "Metro Kingdom", "Toad City", "Coin City"],
    "respuesta_correcta": "New Donk City"
  },
  {
    "id": "rch_039",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué bicho con antifaz y túnica roja porta lanzas o zancos en niveles de plataformas?",
    "emojis": "🎭 🔴 🦯",
    "opciones": ["Shy Guy", "Snifit", "Fly Guy", "Bandit"],
    "respuesta_correcta": "Shy Guy"
  },
  {
    "id": "rch_040",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama el rey de los fantasmas con una corona de rubí y lengua morada?",
    "emojis": "👑 👻 🟣",
    "opciones": ["Rey Boo", "Big Boo", "Boolossus", "Ghost Lord"],
    "respuesta_correcta": "Rey Boo"
  },
  {
    "id": "rch_041",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué traje especial completo permite meterse en el caparazón y lanzar llamaradas de fuego?",
    "emojis": "🪖 🐢 🔥",
    "opciones": ["Traje Martillo / Tanooki", "Traje Rana", "Traje Ardilla", "Traje Boomerang"],
    "respuesta_correcta": "Traje Martillo / Tanooki"
  },
  {
    "id": "rch_042",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué oruga amarilla simpática se vuelve roja y enfurecida cuando saltas sobre su espalda?",
    "emojis": "🐛 🌼 😡",
    "opciones": ["Wiggler", "Caterpillar", "Flutter", "Spike Bug"],
    "respuesta_correcta": "Wiggler"
  },
  {
    "id": "rch_043",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué criatura parecida a un dinosaurio rosa lanza huevos por su hocico tubular?",
    "emojis": "🎀 🥚 🦖",
    "opciones": ["Birdo", "Wendy", "Pom Pom", "Kamek"],
    "respuesta_correcta": "Birdo"
  },
  {
    "id": "rch_044",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llamaba la fortaleza aérea con cañones y hélices flotantes comandada por los Koopalings?",
    "emojis": "🚢 ⚙️ 💨",
    "opciones": ["Barco Volador (Airship)", "AeroFortaleza", "Nave Bowser", "Cloud Destroyer"],
    "respuesta_correcta": "Barco Volador (Airship)"
  },
  {
    "id": "rch_045",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué poder convierte al personaje en una estatua de piedra indestructible que resiste cualquier golpe?",
    "emojis": "🗿 🦝 🛑",
    "opciones": ["Estatua Tanooki", "Bloque Metal", "Poder Gravitatorio", "Roca Smash"],
    "respuesta_correcta": "Estatua Tanooki"
  },
  {
    "id": "rch_046",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué flor otorga a las naves o personajes la habilidad de lanzar bumeranes en trayectoria curva?",
    "emojis": "🪃 🌼 🌀",
    "opciones": ["Flor Boomerang", "Flor Curva", "Brote Giratorio", "Flor Viento"],
    "respuesta_correcta": "Flor Boomerang"
  },
  {
    "id": "rch_047",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cómo se llama el champiñón gigante que hace crecer al personaje hasta destruir el escenario entero a su paso?",
    "emojis": "🍄 💥 🏢",
    "opciones": ["Mega Champiñón", "Giga Champiñón", "Titan Shroom", "Super Coloso"],
    "respuesta_correcta": "Mega Champiñón"
  },
  {
    "id": "rch_048",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué pluma mágica equipaba al héroe con una capa amarilla para elevarse alto en las colinas?",
    "emojis": "🪶 💛 🦸‍♂️",
    "opciones": ["Pluma Capa (Cape Feather)", "Pluma Alada", "Ala P", "Hoja Capa"],
    "respuesta_correcta": "Pluma Capa (Cape Feather)"
  },
  {
    "id": "rch_049",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Qué gorra metálica en Super Mario 64 permitía caminar por el fondo marino sin respirar ni ser arrastrado?",
    "emojis": "🪙 🌊 🪖",
    "opciones": ["Metal Cap (Gorra de Metal)", "Wing Cap", "Vanish Cap", "Iron Helm"],
    "respuesta_correcta": "Metal Cap (Gorra de Metal)"
  },
  {
    "id": "rch_050",
    "categoria": "VIDEOJUEGOS",
    "pack": "reino_champinon",
    "pregunta": "¿Cuál es la célebre frase que solía pronunciar Toad al final de los primeros castillos?",
    "emojis": "🍄 🏰 💬",
    "opciones": [
      "Gracias, pero nuestra princesa está en otro castillo",
      "La princesa ha sido llevada a otra fortaleza",
      "Llegas tarde, Bowser se la llevó",
      "El camino sigue en el próximo reino"
    ],
    "respuesta_correcta": "Gracias, pero nuestra princesa está en otro castillo"
  }
];
window.REINO_QUESTIONS_FALLBACK = REINO_QUESTIONS_FALLBACK;

const MAGIA_QUESTIONS_FALLBACK = (typeof window !== 'undefined' && window.MAGIA_QUESTIONS_FALLBACK && window.MAGIA_QUESTIONS_FALLBACK.length >= 50)
  ? window.MAGIA_QUESTIONS_FALLBACK
  : [
  {
    "id": "mag_001",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué encantamiento de iluminación hace brotar un haz de luz blanca en la punta de la varita?",
    "emojis": "🪄 💡 ✨",
    "opciones": ["Lumos", "Nox", "Alohomora", "Incendio"],
    "respuesta_correcta": "Lumos"
  },
  {
    "id": "mag_002",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cuál es la estación de tren y el andén secreto en Londres desde donde parte el expreso hacia el castillo?",
    "emojis": "🚂 🧱 🎟️",
    "opciones": ["Andén 9 ¾ en King's Cross", "Andén 7 ½ en Paddington", "Andén 9 ½ en Victoria", "Andén 8 ¾ en St. Pancras"],
    "respuesta_correcta": "Andén 9 ¾ en King's Cross"
  },
  {
    "id": "mag_003",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué artefacto parlante centenario asigna a cada estudiante a su respectiva casa en el Gran Comedor?",
    "emojis": "🧙‍♂️ 🎩 🗣️",
    "opciones": ["El Sombrero Seleccionador", "El Espejo de Oesed", "El Cáliz de Fuego", "El Libro de las Admisiones"],
    "respuesta_correcta": "El Sombrero Seleccionador"
  },
  {
    "id": "mag_004",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué pelota dorada con alas veloces otorga 150 puntos y finaliza el partido al ser atrapada?",
    "emojis": "🧹 🟡 🪽",
    "opciones": ["Snitch Dorada", "Quaffle", "Bludger", "Orbe Fugaz"],
    "respuesta_correcta": "Snitch Dorada"
  },
  {
    "id": "mag_005",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cuál de los tres objetos que componen las Reliquias de la Muerte permite vencer a cualquier rival en duelo?",
    "emojis": "🪄 💀 🔺",
    "opciones": ["La Varita de Saúco", "La Piedra de la Resurrección", "La Capa de Invisibilidad", "El Espejo de la Muerte"],
    "respuesta_correcta": "La Varita de Saúco"
  },
  {
    "id": "mag_006",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué criatura espectral que custodia la prisión de Azkaban absorbe la felicidad y el alma humana?",
    "emojis": "💀 🌫️ ⛓️",
    "opciones": ["Dementor", "Boggart", "Thestral", "Inferius"],
    "respuesta_correcta": "Dementor"
  },
  {
    "id": "mag_007",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué encantamiento defensivo plateado convoca un espíritu guardián animal contra las sombras?",
    "emojis": "🦌 ✨ 🛡️",
    "opciones": ["Expecto Patronum", "Riddikulus", "Protego Totalum", "Expelliarmus"],
    "respuesta_correcta": "Expecto Patronum"
  },
  {
    "id": "mag_008",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué animal legendario representativo de Godric simboliza el valor y la caballerosidad en su escudo?",
    "emojis": "🦁 🔴 💛",
    "opciones": ["León", "Serpiente", "Águila", "Tejón"],
    "respuesta_correcta": "León"
  },
  {
    "id": "mag_009",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cómo se llama el sauce violento plantado en los terrenos del castillo que golpea con sus ramas?",
    "emojis": "🌳 🥊 🏰",
    "opciones": ["Sauce Boxeador", "Roble Furioso", "Fresno Chocador", "Pino Golpeador"],
    "respuesta_correcta": "Sauce Boxeador"
  },
  {
    "id": "mag_010",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué poción otorga suerte perfecta y éxito infalible a quien la bebe durante unas horas?",
    "emojis": "🧪 🍀 🟡",
    "opciones": ["Felix Felicis", "Poción Multijugos", "Amortentia", "Veritaserum"],
    "respuesta_correcta": "Felix Felicis"
  },
  {
    "id": "mag_011",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿En cuántos fragmentos o Horrocruxes dividió Lord Voldemort su alma para evitar la muerte?",
    "emojis": "🐍 💍 💀",
    "opciones": ["Siete partes (creando 6 horrocruxes intencionales)", "Tres partes", "Doce partes", "Cinco partes"],
    "respuesta_correcta": "Siete partes (creando 6 horrocruxes intencionales)"
  },
  {
    "id": "mag_012",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué planta mágica emite un llanto fatal que mata al instante a cualquiera que la escuche sin tapones?",
    "emojis": "🌱 👶 💀",
    "opciones": ["Mandrágora", "Lazo del Diablo", "Acónito", "Branquialgas"],
    "respuesta_correcta": "Mandrágora"
  },
  {
    "id": "mag_013",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué criatura alada con cuerpo de caballo y garras de águila debe ser tratada con una reverencia formal?",
    "emojis": "🦅 🐴 🪽",
    "opciones": ["Hipogrifo", "Grifo", "Thestral", "Pegaso"],
    "respuesta_correcta": "Hipogrifo"
  },
  {
    "id": "mag_014",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué calle comercial adoquinada en Londres alberga todas las tiendas de varitas, libros y calderos?",
    "emojis": "🏬 🪄 📜",
    "opciones": ["Callejón Diagon", "Callejón Knockturn", "Privet Drive", "Grimmauld Place"],
    "respuesta_correcta": "Callejón Diagon"
  },
  {
    "id": "mag_015",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cuál es la fórmula para desarmar a un oponente quitándole la varita de las manos?",
    "emojis": "🪄 💥 ✋",
    "opciones": ["Expelliarmus", "Stupefy", "Petrificus Totalus", "Crucio"],
    "respuesta_correcta": "Expelliarmus"
  },
  {
    "id": "mag_016",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué famoso banco subterráneo custodiado por duendes y dragones resguarda el oro mágico?",
    "emojis": "🏦 🪙 🐲",
    "opciones": ["Gringotts", "Borgin & Burkes", "Azkaban Bank", "Ollivanders Vault"],
    "respuesta_correcta": "Gringotts"
  },
  {
    "id": "mag_017",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cómo se llama el elfo doméstico leal que protegía al protagonista vistiendo una funda de almohada vieja?",
    "emojis": "🧦 👂 🪄",
    "opciones": ["Dobby", "Kreacher", "Winky", "Hokey"],
    "respuesta_correcta": "Dobby"
  },
  {
    "id": "mag_018",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué gigantesca bestia reptiliana fue oculta en la Cámara Secreta por Salazar Slytherin?",
    "emojis": "🐍 👁️ 🪨",
    "opciones": ["Basilisco", "Colacuerno Húngaro", "Acromántula", "Quimera"],
    "respuesta_correcta": "Basilisco"
  },
  {
    "id": "mag_019",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué potente poción de la verdad obliga a quien la bebe a revelar sus secretos más íntimos?",
    "emojis": "🧪 🗣️ 💧",
    "opciones": ["Veritaserum", "Amortentia", "Filtro de Paz", "Esencia de Díctamo"],
    "respuesta_correcta": "Veritaserum"
  },
  {
    "id": "mag_020",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué animal o criatura mágica solo puede ser visto por personas que han presenciado la muerte de cerca?",
    "emojis": "🐴 🪽 💀",
    "opciones": ["Thestral", "Bowtruckle", "Niffler (Escarbato)", "Kneazle"],
    "respuesta_correcta": "Thestral"
  },
  {
    "id": "mag_021",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué mapa mágico muestra cada rincón del castillo y la posición exacta de cada persona en tiempo real?",
    "emojis": "📜 👣 🏰",
    "opciones": ["El Mapa del Merodeador", "El Pergamino de Merlín", "El Plano de Flamel", "La Carta Secreta"],
    "respuesta_correcta": "El Mapa del Merodeador"
  },
  {
    "id": "mag_022",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué objeto mineral legendario creado por Nicolas Flamel produce el elixir de la vida eterna?",
    "emojis": "🔴 💎 ⏳",
    "opciones": ["La Piedra Filosofal", "La Gema de Fénix", "El Cristal Áureo", "La Esfera de Alquimia"],
    "respuesta_correcta": "La Piedra Filosofal"
  },
  {
    "id": "mag_023",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué tienda legendaria de varitas del Callejón Diagon ha operado desde el 382 a.C.?",
    "emojis": "🪄 📦 👴",
    "opciones": ["Ollivanders", "Madam Malkin", "Flourish & Blotts", "Honeydukes"],
    "respuesta_correcta": "Ollivanders"
  },
  {
    "id": "mag_024",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué encantamiento imperdonable produce la muerte instantánea mediante un rayo de luz verde brillante?",
    "emojis": "⚡ 🟢 💀",
    "opciones": ["Avada Kedavra", "Crucio", "Imperio", "Sectumsempra"],
    "respuesta_correcta": "Avada Kedavra"
  },
  {
    "id": "mag_025",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué dulce o golosina mágica viene en paquetes con cromos de magos famosos y salta como anfibio?",
    "emojis": "🍫 🐸 🃏",
    "opciones": ["Ranas de Chocolate", "Grageas Bertie Bott", "Calderos de Chocolate", "Ratones de Azúcar"],
    "respuesta_correcta": "Ranas de Chocolate"
  },
  {
    "id": "mag_026",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cuál es la bebida tibia espumosa más consumida por los estudiantes en Las Tres Escobas de Hogsmeade?",
    "emojis": "🍺 🧈 ❄️",
    "opciones": ["Cerveza de Mantequilla", "Jugo de Calabaza", "Hidromiel de Alhelí", "Té de Ortigas"],
    "respuesta_correcta": "Cerveza de Mantequilla"
  },
  {
    "id": "mag_027",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué sala misteriosa del séptimo piso aparece solo ante quien la necesita de verdad y equipada para su fin?",
    "emojis": "🚪 🤫 ✨",
    "opciones": ["La Sala de los Menesteres", "La Cámara de los Secretos", "La Torre de Astronomía", "El Despacho Oculto"],
    "respuesta_correcta": "La Sala de los Menesteres"
  },
  {
    "id": "mag_028",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué animal fantástico y fiero adopta el escudo de la casa Hufflepuff?",
    "emojis": "🦡 🟡 ⚫",
    "opciones": ["Tejón", "Nutria", "Castor", "Armiño"],
    "respuesta_correcta": "Tejón"
  },
  {
    "id": "mag_029",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué vehículo volador azul turquesa estrellaron Ron y Harry en el Sauce Boxeador en su segundo año?",
    "emojis": "🚙 🌲 👓",
    "opciones": ["Ford Anglia", "Mini Cooper", "Austin Healey", "Vauxhall Viva"],
    "respuesta_correcta": "Ford Anglia"
  },
  {
    "id": "mag_030",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cuál es el nombre del fénix leal del director Dumbledore cuyas lágrimas sanan heridas mortales?",
    "emojis": "🔥 🦅 💧",
    "opciones": ["Fawkes", "Errol", "Pigwidgeon", "Norberto"],
    "respuesta_correcta": "Fawkes"
  },
  {
    "id": "mag_031",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cómo se llama la poción que permite transformarse físicamente en otra persona al añadir una muestra de su ADN?",
    "emojis": "🧪 👤 🔁",
    "opciones": ["Poción Multijugos", "Amortentia", "Filtro de los Muertos", "Elixir de Cambio"],
    "respuesta_correcta": "Poción Multijugos"
  },
  {
    "id": "mag_032",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué criatura peluda parecida a un ornitorrinco se siente atraída obsesivamente por cosas brillantes y oro?",
    "emojis": "🦔 🪙 💍",
    "opciones": ["Escarbato (Niffler)", "Bowtruckle", "Demiguise", "Kneazle"],
    "respuesta_correcta": "Escarbato (Niffler)"
  },
  {
    "id": "mag_033",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué artefacto temporal colgante utilizó Hermione en tercer año para asistir a varias clases a la vez?",
    "emojis": "⏳ 🕰️ 👧",
    "opciones": ["Giratiempo", "Reloj Astral", "Cronómetro de Arena", "Péndulo de Merlín"],
    "respuesta_correcta": "Giratiempo"
  },
  {
    "id": "mag_034",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cuál era la contraseña que abría el Mapa del Merodeador antes de usarlo?",
    "emojis": "📜 🪄 👣",
    "opciones": [
      "Juro solemnemente que mis intenciones no son buenas",
      "Travesura realizada",
      "Ábrete sésamo mágico",
      "Por los secretos de Hogwarts"
    ],
    "respuesta_correcta": "Juro solemnemente que mis intenciones no son buenas"
  },
  {
    "id": "mag_035",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué raza de seres mágicos trabaja procesando el oro y las cuentas bancarias en el banco Gringotts?",
    "emojis": "🪙 👺 🗝️",
    "opciones": ["Duendes (Goblins)", "Elfos domésticos", "Gnomos", "Centauros"],
    "respuesta_correcta": "Duendes (Goblins)"
  },
  {
    "id": "mag_036",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué dragón de escamas negras y ojos amarillos enfrentó Harry en la primera prueba del Torneo de los Tres Magos?",
    "emojis": "🐲 🔥 🥚",
    "opciones": ["Colacuerno Húngaro", "Galés Verde Común", "Hocicorto Sueco", "Ironbelly Ucraniano"],
    "respuesta_correcta": "Colacuerno Húngaro"
  },
  {
    "id": "mag_037",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cómo se llama el pueblo 100% mágico vecino al castillo donde los alumnos van a comprar golosinas y bromas?",
    "emojis": "🏘️ ❄️ 🍬",
    "opciones": ["Hogsmeade", "Valle de Godric", "Ottery St. Catchpole", "Little Hangleton"],
    "respuesta_correcta": "Hogsmeade"
  },
  {
    "id": "mag_038",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué encantamiento se utiliza para repeler y transformar a un Boggart mediante la risa?",
    "emojis": "🤡 😂 🪄",
    "opciones": ["Riddikulus", "Tarantallegra", "Rictusempra", "Engorgio"],
    "respuesta_correcta": "Riddikulus"
  },
  {
    "id": "mag_039",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué animal animago adoptaba Sirius Black para caminar desapercibido?",
    "emojis": "🐕‍🦺 🐾 🌑",
    "opciones": ["Un gran perro negro (Canuto)", "Un ciervo astado", "Una rata gris", "Un lobo feroz"],
    "respuesta_correcta": "Un gran perro negro (Canuto)"
  },
  {
    "id": "mag_040",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué espejo mágico muestra no el rostro del observador, sino el más profundo y desesperado deseo de su corazón?",
    "emojis": "🪞 ✨ ❤️",
    "opciones": ["El Espejo de Oesed", "El Cristal de Narcissa", "El Espejo Negro", "El Azogue de Flamel"],
    "respuesta_correcta": "El Espejo de Oesed"
  },
  {
    "id": "mag_041",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué filtro de amor es considerado el más poderoso del mundo mágico y huele diferente para cada persona?",
    "emojis": "🧪 💖 🌸",
    "opciones": ["Amortentia", "Felix Felicis", "Poción de la Pasión", "Elixir Cupido"],
    "respuesta_correcta": "Amortentia"
  },
  {
    "id": "mag_042",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué serpiente gigante acompañaba a Lord Voldemort y actuaba como uno de sus Horrocruxes?",
    "emojis": "🐍 💀 🖤",
    "opciones": ["Nagini", "Aragog", "Grawp", "Fang"],
    "respuesta_correcta": "Nagini"
  },
  {
    "id": "mag_043",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué planta acuática le permitió a Harry respirar bajo el lago con branquias y membranas en el Torneo?",
    "emojis": "🌿 🌊 🏊",
    "opciones": ["Branquialgas", "Algas de Sirena", "Lirio de Agua Dulce", "Musgo Branquial"],
    "respuesta_correcta": "Branquialgas"
  },
  {
    "id": "mag_044",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cuál era el nombre del perro cancerbero de tres cabezas de Hagrid que custodiaba la trampilla del castillo?",
    "emojis": "🐶 🐶 🐶",
    "opciones": ["Fluffy", "Fang", "Grawp", "Cerbero"],
    "respuesta_correcta": "Fluffy"
  },
  {
    "id": "mag_045",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué diario encantado manipuló a Ginny Weasley para reabrir la Cámara de los Secretos?",
    "emojis": "📓 ✒️ 🐍",
    "opciones": ["El Diario de Tom Riddle", "El Cuaderno de Salazar", "El Diario de Gaunt", "Las Memorias de Malfoy"],
    "respuesta_correcta": "El Diario de Tom Riddle"
  },
  {
    "id": "mag_046",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué lechuza nival blanca acompañó fielmente a Harry desde su primera visita al Callejón Diagon?",
    "emojis": "🦉 ⚪ ✉️",
    "opciones": ["Hedwig", "Errol", "Pigwidgeon", "Hermes"],
    "respuesta_correcta": "Hedwig"
  },
  {
    "id": "mag_047",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué encantamiento de corte oscuro fue inventado por el 'Príncipe Mestizo' en su libro de pociones?",
    "emojis": "🩸 🗡️ 🪄",
    "opciones": ["Sectumsempra", "Muffliato", "Levicorpus", "Langlock"],
    "respuesta_correcta": "Sectumsempra"
  },
  {
    "id": "mag_048",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué autobús morado de tres pisos recoge a cualquier bruja o mago varado en apuros en el mundo no mágico?",
    "emojis": "🚌 🟣 💨",
    "opciones": ["El Autobús Noctámbulo", "El Expreso Nocturno", "El Bus Fantasma", "El Ómnibus Mágico"],
    "respuesta_correcta": "El Autobús Noctámbulo"
  },
  {
    "id": "mag_049",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Qué pequeña criatura con aspecto de ramita verde custodia los árboles aptos para fabricar varitas?",
    "emojis": "🌿 🪵 🍃",
    "opciones": ["Bowtruckle", "Duendecillo de Cornualles", "Gnomo de Jardín", "Augurey"],
    "respuesta_correcta": "Bowtruckle"
  },
  {
    "id": "mag_050",
    "categoria": "CINE & LITERATURA",
    "pack": "castillo_magia",
    "pregunta": "¿Cuál es la única palabra que responde Severus Snape al revelar que su Patronus sigue siendo la cierva de Lily?",
    "emojis": "🦌 🖤 💬",
    "opciones": ["Siempre (Always)", "Eternamente", "Por ella", "Jamás"],
    "respuesta_correcta": "Siempre (Always)"
  }
];
window.MAGIA_QUESTIONS_FALLBACK = MAGIA_QUESTIONS_FALLBACK;

function getEmergencyQuestionsForCategory(cat, esModoTodo) {
  if (esModoTodo) {
    return [...emergencyCine, ...emergencyVideojuegos, ...emergencyTV, ...emergencyAnimacion];
  }
  const c = (cat || '').toUpperCase().trim();
  if (c === 'CINE') return emergencyCine;
  if (c === 'VIDEOJUEGOS' || c.includes('VIDEO') || c.includes('JUEGO')) return emergencyVideojuegos;
  if (c === 'TV' || c.includes('SERIE')) return emergencyTV;
  if (c === 'ANIMACIÓN' || c === 'ANIMACION' || c.includes('ANIM') || c === 'MÚSICA' || c === 'MUSICA' || c.includes('MUS')) return emergencyAnimacion;
  return emergencyCine;
}

// Obtener metadatos visuales de la categoría (icono, nombre, color)
function getCategoryMeta(cat) {
  const c = (cat || '').toUpperCase().trim();
  if (c === 'CINE' || c.includes('CINE')) return categoriesConfig.cine || { name: 'CINE', icon: '🎬', color: '#7b38e5' };
  if (c === 'VIDEOJUEGOS' || c.includes('VIDEO') || c.includes('JUEGO')) return categoriesConfig.videojuegos || { name: 'VIDEOJUEGOS', icon: '🎮', color: '#e2dd5f' };
  if (c === 'TV' || c.includes('SERIE')) return categoriesConfig.tv || { name: 'TV', icon: '📺', color: '#5fe2df' };
  if (c === 'ANIMACIÓN' || c === 'ANIMACION' || c.includes('ANIM') || c === 'MÚSICA' || c === 'MUSICA' || c.includes('MUS') || c.includes('MÚS')) {
    return categoriesConfig.animacion || { name: 'ANIMACIÓN', icon: '✨', color: '#00FF66' };
  }
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
  } else if (cat === 'ANIMACIÓN' || cat === 'ANIMACION' || cat.includes('ANIM') || cat === 'MÚSICA' || cat === 'MUSICA' || cat.includes('MUS') || cat.includes('MÚS')) {
    rutaArchivo = 'data/preguntas_animacion.json';
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
      const [cine, juegos, tv, animacion] = await Promise.all([
        fetch(`data/preguntas_cine.json?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`data/preguntas_videojuegos.json?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`data/preguntas_tv.json?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`data/preguntas_animacion.json?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json())
      ]);
      bancoCompleto = [...cine, ...juegos, ...tv, ...animacion];
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
      if (cat === 'ANIMACIÓN' || cat === 'ANIMACION' || cat.includes('ANIM') || cat === 'MÚSICA' || cat === 'MUSICA') return catQ.includes('ANIM') || catQ.includes('MUS');
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
      if (cat === 'ANIMACIÓN' || cat === 'ANIMACION' || cat.includes('ANIM') || cat === 'MÚSICA' || cat === 'MUSICA') return catQ.includes('ANIM') || catQ.includes('MUS');
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
  // 1. Iniciar o verificar la precarga en segundo plano de las preguntas (Promise.all / fetch)
  if (!window.state?.pendingQuestionsPromise && !preloadedRoundQuestionsPromise) {
    window.state.pendingQuestionsPromise = cargarBancoExclusivo(categoriaGanadora);
    preloadedRoundQuestionsPromise = window.state.pendingQuestionsPromise;
  }

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
  const promise = (window.state && window.state.pendingQuestionsPromise) || preloadedRoundQuestionsPromise;
  if (promise) {
    try {
      questions = await promise;
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
  const totalRonda = isTieBreaker ? 3 : (isChallenge ? 5 : 10);
  questions = (questions || []).slice(0, totalRonda);

  const tiempoBase = 20;
  if (window.state) {
    window.state.isChallengeMode = isChallenge;
    window.state.isTieBreaker = isTieBreaker;
    window.state.currentRoundQuestions = questions;
    window.state.currentQuestionIndex = 0;
    window.state.lives = 3;
    window.state.correctAnswersCount = 0;
    window.state.currentRoundXP = 0;
    window.state.accumulatedAnswerTimeMs = 0;
    window.state.timeLeft = tiempoBase;
    window.state.currentStreak = 0;
  }
  state.currentRoundXP = 0;
  state.isChallengeMode = isChallenge;
  state.isTieBreaker = isTieBreaker;
  if (state.trivia) {
    state.trivia.isDuel = isChallenge;
    state.trivia.questions = questions;
    state.trivia.totalQuestions = totalRonda;
    state.trivia.timerSeconds = tiempoBase;
    state.trivia.remainingMs = tiempoBase * 1000;
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
  } else if (normCat.includes('ANIM') || normCat.includes('DIBUJ') || normCat.includes('CARTOON') || normCat.includes('ANIME') || normCat.includes('MUS') || normCat.includes('MÚS')) {
    themeColor = '#00FF66';
    catClass = 'animacion';
  } else if (normCat.includes('TODO') || normCat.includes('MIX')) {
    themeColor = '#FF5A5F';
    catClass = 'todo';
  }
  if (state.trivia) state.trivia.category = catClass;

  const triviaView = document.getElementById('triviaView');
  const triviaCard = document.getElementById('triviaCard');
  if (triviaView) {
    triviaView.style.setProperty('--trivia-theme-color', themeColor);
    triviaView.dataset.cat = catClass;
    triviaView.classList.remove('siren-panic', 'cat-cine', 'cat-videojuegos', 'cat-musica', 'cat-tv', 'cat-todo', 'cat-mix', 'cat-animacion', 'theme-animacion');
    triviaView.classList.add('cat-' + catClass);
    if (catClass === 'animacion') {
      triviaView.classList.add('theme-animacion');
    }
  }

  if (triviaCard) {
    triviaCard.classList.remove('theme-animacion');
    if (catClass === 'animacion') {
      triviaCard.classList.add('theme-animacion');
    }
  }

  const catTag = document.getElementById('triviaCategoryTag');
  if (catTag) {
    catTag.textContent = (catClass === 'animacion') ? 'ANIMACIÓN' : (getCategoryMeta(categoriaGanadora)?.name || 'TRIVIA');
    if (catClass === 'animacion') {
      catTag.classList.add('theme-animacion');
    } else {
      catTag.classList.remove('theme-animacion');
    }
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

// Microinteracción y badge flotante de regeneración de vida
function showLifeRegeneratedFeedback() {
  const container = document.getElementById('triviaHeartsContainer');
  if (!container) return;
  const badge = document.createElement('div');
  badge.className = 'floating-life-badge';
  badge.innerHTML = '+1 VIDA REGENERADA ❤️';

  const rect = container.getBoundingClientRect();
  badge.style.position = 'fixed';
  badge.style.left = `${Math.max(10, rect.left + (rect.width / 2) - 85)}px`;
  badge.style.top = `${Math.max(10, rect.top - 36)}px`;
  badge.style.zIndex = '9999';

  document.body.appendChild(badge);
  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('powerup.wav', 0.85);
  }
  setTimeout(() => {
    if (badge.parentNode) badge.parentNode.removeChild(badge);
  }, 1600);
}
window.showLifeRegeneratedFeedback = showLifeRegeneratedFeedback;

function updateTriviaHeartsUI(regeneratedIndex = -1) {
  const container = document.getElementById('triviaHeartsContainer');
  if (!container) return;
  const currentLives = (window.state && window.state.lives !== undefined) ? window.state.lives : (state.trivia.lives || 0);
  const hearts = container.querySelectorAll('.hud-heart');
  hearts.forEach((heartEl, idx) => {
    heartEl.classList.remove('heart-regenerated');
    if (idx < currentLives) {
      heartEl.classList.remove('heart-lost');
      heartEl.classList.add('active');
      if (idx === regeneratedIndex) {
        void heartEl.offsetWidth; // Forzar reflow para animación de pulso
        heartEl.classList.add('heart-regenerated');
      }
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

  // Inyecta etiqueta superior de categoría
  const catTag = document.getElementById('triviaCategoryTag');
  if (catTag) {
    const rawCat = (q.categoria || (state.trivia && state.trivia.category) || 'TRIVIA').toUpperCase().trim();
    const isAnim = rawCat.includes('ANIM') || (state.trivia && state.trivia.category === 'animacion') || rawCat.includes('MUS');
    if (isAnim) {
      catTag.textContent = 'ANIMACIÓN';
      catTag.classList.add('theme-animacion');
    } else {
      catTag.textContent = rawCat;
      catTag.classList.remove('theme-animacion');
    }
  }

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
      btn.classList.remove('option-correct', 'option-wrong', 'btn-pop-success');
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

  // Iniciar temporizador estricto unificado de 20 segundos
  startTriviaTimer();
}

function renderCurrentTriviaQuestion() {
  renderizarPreguntaActual();
}

function startTriviaTimer() {
  state.trivia.isPaused = false;
  const tiempoBase = 20;
  window.state.timeLeft = tiempoBase;
  state.trivia.timerSeconds = tiempoBase;
  const maxMs = tiempoBase * 1000;
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
  const tiempoBase = 20;
  state.trivia.timerSeconds = tiempoBase;
  const totalMs = tiempoBase * 1000;
  const startTime = performance.now();
  const startRemaining = initialRemainingMs;

  const timerSecsEl = document.getElementById('triviaTimerSecs');
  const fillEl = document.getElementById('triviaTimerFill');
  const triviaView = document.getElementById('triviaView');

  const updateDisplay = (ms) => {
    const remainingSecs = Math.ceil(ms / 1000);
    window.state.timeLeft = remainingSecs;
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

// 1. Explosión de 6 partículas CSS/SVG (estrellitas o chispas doradas) desde el centro del botón (400 ms)
function spawnSuccessParticles(sourceBtn) {
  if (!sourceBtn) return;
  const rect = sourceBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const numParticles = 6;
  const distance = 46;
  const starSvg = `<svg viewBox="0 0 24 24" width="100%" height="100%"><polygon fill="#FFD700" stroke="#000" stroke-width="1.5" points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`;

  for (let i = 0; i < numParticles; i++) {
    const angle = (i * (360 / numParticles)) * (Math.PI / 180);
    const tx = Math.round(Math.cos(angle) * distance) + 'px';
    const ty = Math.round(Math.sin(angle) * distance) + 'px';
    const rot = (i * 60) + 'deg';

    const particle = document.createElement('div');
    particle.className = 'correct-spark-particle';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.setProperty('--tx', tx);
    particle.style.setProperty('--ty', ty);
    particle.style.setProperty('--rot', rot);
    particle.innerHTML = starSvg;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 400);
  }
}

// 2. Shake Screen y Respuesta Háptica en Error (300 ms)
function triggerWrongAnswerFeedback() {
  const questionCard = document.querySelector('.card-question') || document.getElementById('triviaCard') || document.querySelector('.trivia-card');
  if (questionCard) {
    questionCard.classList.remove('shake-effect');
    void questionCard.offsetWidth; // Forzar reflow
    questionCard.classList.add('shake-effect');
    setTimeout(() => {
      questionCard.classList.remove('shake-effect');
    }, 300);
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([50, 40, 50]);
    } catch (e) {}
  }
}

// 3. Contador de RetroCoins con Rodillo Dinámico (Rolling Counter en 800 ms)
function animateRollingCounter(element, startVal, endVal, durationMs = 800, prefix = '', suffix = '') {
  if (!element) return;
  const start = Math.max(0, parseInt(startVal, 10) || 0);
  const end = Math.max(0, parseInt(endVal, 10) || 0);
  if (start === end) {
    element.innerText = `${prefix}${end.toLocaleString()}${suffix}`;
    return;
  }

  const diff = end - start;
  const startTime = performance.now();
  let lastSoundTime = 0;

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const currentVal = Math.round(start + diff * progress);

    element.innerText = `${prefix}${currentVal.toLocaleString()}${suffix}`;

    // Reproducir a bajo volumen retrocoin.wav en cada salto
    if (currentTime - lastSoundTime >= 80 && progress < 1) {
      lastSoundTime = currentTime;
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('retrocoin.wav', 0.25);
      }
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.innerText = `${prefix}${end.toLocaleString()}${suffix}`;
      if (typeof SoundManager !== 'undefined') {
        SoundManager.playSFX('retrocoin.wav', 0.3);
      }
    }
  }

  requestAnimationFrame(step);
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
    // Verde neón si acierta (#00E676), clase .btn-pop-success con animación y partículas radiales
    if (selectedBtn) {
      selectedBtn.classList.add('option-correct', 'btn-pop-success');
      spawnSuccessParticles(selectedBtn);
    }
    recordTriviaAnswerResult(true);

    window.state.currentStreak = (window.state.currentStreak || 0) + 1;
    state.trivia.currentStreak = window.state.currentStreak;

    // Bonificación por racha: cada 4 aciertos seguidos regenera +1 vida si < 3
    if (window.state.currentStreak === 4) {
      const currentLives = (window.state.lives !== undefined) ? window.state.lives : (state.trivia.lives || 0);
      if (currentLives < 3) {
        const newLives = currentLives + 1;
        window.state.lives = newLives;
        state.trivia.lives = newLives;
        updateTriviaHeartsUI(newLives - 1);
        showLifeRegeneratedFeedback();
      }
      window.state.currentStreak = 0;
      state.trivia.currentStreak = 0;
    }

    state.trivia.correctAnswersCount = (state.trivia.correctAnswersCount || 0) + 1;
    if (window.state) window.state.correctAnswersCount = state.trivia.correctAnswersCount;
    state.correctAnswersCount = state.trivia.correctAnswersCount;

    // Sumar dominio de pack si se está jugando un pack temático (array de preguntas dominadas hasta 50)
    const activeThematicPack = window.state?.activeThematicPackId || state.activeThematicPackId;
    if (activeThematicPack) {
      if (!state.packMastery) state.packMastery = {};
      if (window.state && !window.state.packMastery) window.state.packMastery = {};

      let currentMastery = window.state?.packMastery?.[activeThematicPack] || state.packMastery?.[activeThematicPack];
      let masteryArr = [];
      if (Array.isArray(currentMastery)) {
        masteryArr = [...currentMastery];
      } else if (typeof currentMastery === 'number' && currentMastery > 0) {
        masteryArr = Array.from({ length: Math.min(50, currentMastery) }, (_, i) => `prev_${i + 1}`);
      }

      // ID único de la pregunta (ej: "spr_001") o texto de la pregunta
      const qId = q?.id || (q?.pregunta ? String(q.pregunta).trim() : null);
      if (qId && !masteryArr.includes(qId) && masteryArr.length < 50) {
        masteryArr.push(qId);
      }

      state.packMastery[activeThematicPack] = masteryArr;
      if (window.state) window.state.packMastery[activeThematicPack] = masteryArr;
      if (typeof savePackProgressToCloud === 'function') {
        savePackProgressToCloud();
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

    window.state.currentStreak = 0;
    state.trivia.currentStreak = 0;
    state.trivia.lives--;
    window.state.lives = state.trivia.lives;
    updateTriviaHeartsUI();
    playErrorSound();
    if (typeof SoundManager !== 'undefined') SoundManager.playSFX('error.wav');

    // 2. SHAKE SCREEN Y RESPUESTA HÁPTICA EN ERROR (300 ms)
    triggerWrongAnswerFeedback();

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

  window.state.currentStreak = 0;
  state.trivia.currentStreak = 0; // Reiniciar racha al agotarse el tiempo
  recordTriviaAnswerResult(false);
  state.trivia.lives--;
  window.state.lives = state.trivia.lives;
  updateTriviaHeartsUI();
  playErrorSound();
  if (typeof SoundManager !== 'undefined') SoundManager.playSFX('error.wav');

  // 2. SHAKE SCREEN Y RESPUESTA HÁPTICA EN ERROR (300 ms)
  triggerWrongAnswerFeedback();

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
  const prevCoins = state.coins;
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

  // Desglose de Nivel y XP Total del Jugador (Esquema de rangos temáticos)
  const playerLevelEl = document.getElementById('resultsPlayerLevel');
  const playerXpEl = document.getElementById('resultsPlayerTotalXp');
  const userXP = (window.state && typeof window.state.xp === 'number')
    ? window.state.xp
    : ((state && typeof state.xp === 'number') ? state.xp : (state?.userScore || 0));
  const currentRank = (typeof getPlayerRank === 'function') ? getPlayerRank(userXP) : { name: 'Novato del Videoclub 📼' };
  if (playerLevelEl) playerLevelEl.innerText = currentRank.name || currentRank.toString();
  if (playerXpEl) playerXpEl.innerText = `${userXP.toLocaleString()} pts`;

  // 5. Tarjeta Inferior Dual (Racha y Retrocoins)
  const streakValEl = document.getElementById('resultsStreakVal');
  const coinsSessionEl = document.getElementById('resultsCoinsSessionVal');
  const coinsTotalEl = document.getElementById('resultsCoinsTotalVal');
  if (streakValEl) streakValEl.innerText = `+${state.winStreak} 🔥`;

  // Inicializar estado del contador progresivo (arranca en +0)
  window._lastResultsSessionCoins = sessionCoins;
  window._lastResultsPrevCoins = prevCoins;
  window._lastResultsFinalCoins = state.coins;

  if (coinsSessionEl) coinsSessionEl.innerText = '+0';
  if (coinsTotalEl) coinsTotalEl.innerText = prevCoins.toLocaleString();

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

  // 9. Disparar Cascada Escalonada y Conteo Progresivo con Sonido
  triggerResultsEntranceAnimation();
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
  const prevCoins = state.coins;
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
    (chData && (chData.status === "completed" || chData.status === "finished")) || 
    (chData && chData.round3_p1 !== undefined && chData.round3_p2 !== undefined) ||
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

  const localCountryCode = window.state?.country || window.state?.userCountry || state?.country || localStorage.getItem('retroquiz_user_country') || 'BO';
  const rivalCountryCode = state.currentDuel?.rivalCountry || (isCreator ? (chData?.toCountry || chData?.targetUserCountry) : (chData?.fromCountry || chData?.challengerCountry)) || 'WORLD';
  const localFlag = typeof getCountryFlag === 'function' ? getCountryFlag(localCountryCode) : '🇧🇴';
  const rivalFlag = typeof getCountryFlag === 'function' ? getCountryFlag(rivalCountryCode) : '🌎';

  const localScoreEl = document.getElementById('duelResultLocalScore');
  if (localScoreEl) localScoreEl.innerText = `${localTotalScore} pts`;

  const duelResultLocalName = document.getElementById('duelResultLocalName');
  if (duelResultLocalName) {
    duelResultLocalName.innerText = `${window.state?.username || localStorage.getItem('retroquiz_username') || "Tú"} ${localFlag}`;
  }
  const podiumLocalBadge = document.getElementById('podiumLocalCountryBadge');
  if (podiumLocalBadge) podiumLocalBadge.innerText = localFlag;

  const rivalNameEl = document.getElementById('duelResultRivalName');
  if (rivalNameEl) rivalNameEl.innerText = `${state.currentDuel?.rivalName || 'Rival'} ${rivalFlag}`;

  const podiumRivalBadge = document.getElementById('podiumRivalCountryBadge');
  if (podiumRivalBadge) podiumRivalBadge.innerText = rivalFlag;

  const rivalAvatarSpan = document.querySelector('#podiumRivalAvatar span');
  if (rivalAvatarSpan) rivalAvatarSpan.innerText = state.currentDuel?.rivalAvatar || '🕹️';

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
  if (coinsEarnedEl) {
    coinsEarnedEl.innerText = `+${roundCoins} RC`;
    const hudUserCoins = document.getElementById('userCoins');
    if (hudUserCoins && !isDirectView && roundCoins > 0) {
      animateRollingCounter(hudUserCoins, prevCoins, state.coins, 800);
    }
  }

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
    const currentUidVal = currentUid || window.state?.userId || state.userId;
    let esEmpate = (miPuntaje === rivalPuntaje);
    let soyGanador = (miPuntaje > rivalPuntaje);
    let soyPerdedor = (miPuntaje < rivalPuntaje);

    if (chData?.winnerId || chData?.winnerUid) {
      const wId = chData.winnerId || chData.winnerUid;
      if (wId === "empate") {
        esEmpate = true;
        soyGanador = false;
        soyPerdedor = false;
      } else if (wId === currentUidVal) {
        soyGanador = true;
        soyPerdedor = false;
        esEmpate = false;
      } else {
        soyGanador = false;
        soyPerdedor = true;
        esEmpate = false;
      }
    }

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

      // Fluctuación de XP y Desafíos Ganados (sin duplicar en visitas repetidas)
      if (!alreadyProcessed) {
        const newXP = currentXp + 120;
        state.xp = newXP;
        state.userScore = newXP;
        if (window.state) {
          window.state.xp = newXP;
          window.state.userScore = newXP;
        }

        const currentWins = Number((window.state && window.state.challengesWon !== undefined) ? window.state.challengesWon : ((state && state.challengesWon !== undefined) ? state.challengesWon : (localStorage.getItem('retroquiz_challenges_won') || 0)));
        const newWins = currentWins + 1;
        state.challengesWon = newWins;
        if (window.state) window.state.challengesWon = newWins;

        try {
          localStorage.setItem('retroquiz_xp', String(newXP));
          localStorage.setItem('retroquiz_challenges_won', String(newWins));
          localStorage.setItem(xpAwardedKey, 'true');
        } catch (e) {}

        const profileBadge = document.getElementById('profileBadge') || document.querySelector('.profile-badge');
        if (profileBadge) {
          profileBadge.innerText = `${getPlayerRank(newXP)} • ${newXP} XP`;
        }
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof updateProfileStatsUI === 'function') updateProfileStatsUI();

        // Persistir en Firestore usuarios/{userId} con increment(1)
        if (window.db && window.firestoreOps && currentUidVal) {
          try {
            const { doc, updateDoc, increment } = window.firestoreOps;
            const userRef = doc(window.db, "usuarios", currentUidVal);
            const incWon = (typeof increment === 'function') ? increment(1) : newWins;
            updateDoc(userRef, {
              xp: newXP,
              challengesWon: incWon,
              updatedAt: new Date().toISOString()
            }).catch(err => console.error("Error al actualizar XP y challengesWon del ganador en Firestore:", err));

            if (chId) {
              const chRef = doc(window.db, "desafios", chId);
              updateDoc(chRef, {
                winnerUid: currentUidVal,
                [`xpFluctuationAwarded.${currentUidVal}`]: true
              }).catch(() => {});
            }
          } catch (err) {
            console.error("Error preparando updateDoc de XP y challengesWon:", err);
          }
        }
      }

      // 3. ESTADOS DE LA PANTALLA SEGÚN EL ROL: SI SOY EL GANADOR
      const isTimeoutFinish = (chData?.finishReason === "timeout" || state.currentDuel?.chData?.finishReason === "timeout");
      if (outcomeTitle) {
        outcomeTitle.innerText = isTimeoutFinish ? '🏆 ¡VICTORIA POR ABANDONO!' : '🏆 ¡VICTORIA DEFINITIVA!';
      }
      if (outcomeSubtitle) {
        outcomeSubtitle.innerText = isTimeoutFinish ? 'Tu contrincante no respondió a tiempo su turno.' : '¡Has dominado el duelo frente a tu rival!';
        outcomeSubtitle.style.display = 'block';
      }

      // Marco central del podio con foto del ganador y corona
      if (winnerPodium) winnerPodium.style.display = 'flex';
      if (versusPodium) versusPodium.style.display = 'none';

      const winnerAvatarImg = document.getElementById('challengeWinnerAvatar');
      if (winnerAvatarImg) winnerAvatarImg.src = datosGanador.avatar;
      const winnerNameEl = document.getElementById('challengeWinnerName');
      const winnerCountryCode = soyGanador ? localCountryCode : rivalCountryCode;
      const winnerFlag = typeof getCountryFlag === 'function' ? getCountryFlag(winnerCountryCode) : '🌎';
      if (winnerNameEl) winnerNameEl.textContent = `${datosGanador.nombre} ${winnerFlag}`;
      const winnerCountryBadge = document.getElementById('challengeWinnerCountryBadge');
      if (winnerCountryBadge) winnerCountryBadge.innerText = winnerFlag;

      // Botón principal: "VOLVER A DESAFÍOS" en amarillo neón (ocultar revancha)
      if (btnRematchDuel) {
        btnRematchDuel.style.display = 'none';
      }
      if (btnDuelBackToChallenges) {
        btnDuelBackToChallenges.style.display = 'flex';
        btnDuelBackToChallenges.innerText = 'VOLVER A DESAFÍOS';
        btnDuelBackToChallenges.className = 'btn-duel-action btn-back-challenges btn-return-challenges btn-winner-back interactive-press';
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
      if (outcomeTitle) {
        outcomeTitle.innerText = isTimeoutFinish ? '⌛ TIEMPO AGOTADO' : 'HAS PERDIDO';
      }
      if (outcomeSubtitle) {
        outcomeSubtitle.innerText = isTimeoutFinish ? 'No respondiste a tiempo tu turno.' : `${datosGanador.nombre} se lleva la victoria por esta vez`;
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
        btnDuelBackToChallenges.className = 'btn-duel-action btn-back-challenges btn-return-challenges btn-secondary-back interactive-press';
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
        btnDuelBackToChallenges.className = 'btn-duel-action btn-back-challenges btn-return-challenges btn-secondary-back interactive-press';
      }

      playResultsAudioSequence(correctCount);
    }
  }

  // 6. Navegar a la pantalla de resultados
  navigateToScreen('challengeResultView');
}

let _isSavingChallengeRound = false;
async function guardarPuntosRondaDesafio(correctCount = 0) {
  if (_isSavingChallengeRound) return;
  _isSavingChallengeRound = true;

  const chId = window.state?.currentChallengeId || state.currentChallengeId;
  const currentUid = window.state?.userId;

  const roundXP = correctCount * 60;
  const roundCoins = (state.trivia && state.trivia.sessionCoins > 0) ? state.trivia.sessionCoins : (correctCount * 5);
  const roundTotalPoints = roundXP + roundCoins;

  if (state.trivia) {
    state.trivia.lastRoundXP = roundXP;
    state.trivia.lastRoundCoins = roundCoins;
  }

  // Sumar monedas al estado local y persistir
  state.coins += roundCoins;
  if (window.state) window.state.coins = state.coins;
  if (typeof saveCoinsToCloud === 'function') saveCoinsToCloud(state.coins);

  // Si no hay datos en Firestore o no hay chId, fallback local
  if (!chId || !window.db || !window.firestoreOps || !currentUid) {
    window.state.isChallengeRoundActive = false;
    showChallengeDuelResults(state.currentDuel?.currentRound || 1, correctCount, false);
    showView('#challengeResultView');
    _isSavingChallengeRound = false;
    return;
  }

  try {
    const { doc, getDoc, updateDoc } = window.firestoreOps;
    const chRef = doc(window.db, "desafios", chId);
    const snap = await getDoc(chRef);

    if (!snap.exists()) {
      window.state.isChallengeRoundActive = false;
      showChallengeDuelResults(state.currentDuel?.currentRound || 1, correctCount, false);
      showView('#challengeResultView');
      _isSavingChallengeRound = false;
      return;
    }

    const desafio = snap.data();
    const challengerId = desafio.challengerId || desafio.fromUid;
    const targetUserId = desafio.targetUserId || desafio.toUid;
    const esCreador = (challengerId === currentUid);
    const rivalUid = esCreador ? targetUserId : challengerId;
    const rondaActual = desafio.currentRound || desafio.round || 1;

    const rivalName = esCreador ? (desafio.toUsername || desafio.targetUserName || 'Rival') : (desafio.fromUsername || desafio.challengerName || 'Retador');
    const rivalAvatar = esCreador ? (desafio.toAvatar || '🕹️') : (desafio.fromAvatar || '👾');

    const roundData = {
      coins: roundCoins,
      xp: roundXP,
      hits: correctCount,
      points: roundTotalPoints,
      completedAt: new Date().toISOString()
    };

    const prevScores = desafio.scores || {};
    let p1Total = (typeof prevScores.p1Total === 'number')
      ? prevScores.p1Total
      : ((prevScores[challengerId]?.totalScore) || prevScores.fromScore || 0);

    let p2Total = (typeof prevScores.p2Total === 'number')
      ? prevScores.p2Total
      : ((prevScores[targetUserId]?.totalScore) || prevScores.toScore || 0);

    if (esCreador) {
      p1Total += roundTotalPoints;
    } else {
      p2Total += roundTotalPoints;
    }

    // Condición de FIN ABSOLUTO DE PARTIDA:
    // Si estamos en Ronda 3 y el jugador actual es el SEGUNDO en responder esa ronda:
    const ambosCompletaronRonda3 = (rondaActual === 3) && (esCreador ? (desafio.round3_p2 !== undefined) : (desafio.round3_p1 !== undefined));

    if (ambosCompletaronRonda3) {
      // SI LA PARTIDA TERMINÓ:
      // - NO asignes currentTurn a ningún jugador (null)
      // - Calcula el puntaje total acumulado de las 3 rondas para Jugador 1 y Jugador 2
      // - Determina winnerId (o "empate")
      let winnerId;
      if (p1Total > p2Total) {
        winnerId = challengerId;
      } else if (p2Total > p1Total) {
        winnerId = targetUserId;
      } else {
        winnerId = "empate";
      }

      const updateData = {
        status: "completed",
        currentTurn: null,
        winnerId: winnerId,
        winnerUid: winnerId,
        scores: {
          ...prevScores,
          p1Total: p1Total,
          p2Total: p2Total,
          fromScore: p1Total,
          toScore: p2Total,
          [challengerId]: {
            ...(prevScores[challengerId] || {}),
            totalScore: p1Total,
            roundsCompleted: 3
          },
          [targetUserId]: {
            ...(prevScores[targetUserId] || {}),
            totalScore: p2Total,
            roundsCompleted: 3
          }
        },
        round: 3,
        currentRound: 3,
        [esCreador ? 'round3_p1' : 'round3_p2']: roundData,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      window._justCompletedChallengeId = chId;
      await updateDoc(chRef, updateData);

      // Limpieza de banderas locales (Requirement 3)
      window.state.isChallengeRoundActive = false;
      window.state.isChallengeMode = false;
      state.isChallengeMode = false;

      state.currentDuel = {
        challengeId: chId,
        rivalUid: rivalUid,
        rivalName: rivalName,
        rivalAvatar: rivalAvatar,
        currentRound: 3,
        localTotalScore: esCreador ? p1Total : p2Total,
        rivalTotalScore: esCreador ? p2Total : p1Total,
        isCompletedDuel: true,
        chData: {
          ...desafio,
          ...updateData
        }
      };

      // Navega inmediatamente a showView('#challengeResultView') cargando la pantalla con la animación de humo, corona y audios
      showChallengeDuelResults(3, correctCount, true);
      showView('#challengeResultView');
    } else {
      // SI LA PARTIDA CONTINÚA (Rondas 1 o 2, o Ronda 3 Jugador 1):
      // - Transfiere el turno al rival: currentTurn = rivalUid
      // - Incrementa currentRound solo cuando ambos hayan completado la ronda activa
      const currentRoundKey = `round${rondaActual}_${esCreador ? 'p1' : 'p2'}`;

      const rivalCompletedThisRound = esCreador
        ? (desafio[`round${rondaActual}_p2`] !== undefined)
        : (desafio[`round${rondaActual}_p1`] !== undefined);

      let nextRound = rondaActual;
      if (rivalCompletedThisRound && rondaActual < 3) {
        nextRound = rondaActual + 1;
      }

      const updateData = {
        status: (desafio.status === "pending" && esCreador && rondaActual === 1) ? "pending" : "active",
        currentRound: nextRound,
        round: nextRound,
        currentTurn: rivalUid,
        [currentRoundKey]: roundData,
        creatorRoundCompleted: esCreador ? true : (desafio.creatorRoundCompleted || false),
        scores: {
          ...prevScores,
          p1Total: p1Total,
          p2Total: p2Total,
          fromScore: p1Total,
          toScore: p2Total,
          [challengerId]: {
            ...(prevScores[challengerId] || {}),
            totalScore: p1Total,
            roundsCompleted: esCreador ? rondaActual : (desafio.scores?.[challengerId]?.roundsCompleted || 0)
          },
          [targetUserId]: {
            ...(prevScores[targetUserId] || {}),
            totalScore: p2Total,
            roundsCompleted: !esCreador ? rondaActual : (desafio.scores?.[targetUserId]?.roundsCompleted || 0)
          }
        },
        updatedAt: new Date().toISOString()
      };

      await updateDoc(chRef, updateData);

      // Limpieza de banderas locales de la ronda
      window.state.isChallengeRoundActive = false;

      state.currentDuel = {
        challengeId: chId,
        rivalUid: rivalUid,
        rivalName: rivalName,
        rivalAvatar: rivalAvatar,
        currentRound: rondaActual,
        localTotalScore: esCreador ? p1Total : p2Total,
        rivalTotalScore: esCreador ? p2Total : p1Total,
        isCompletedDuel: false,
        chData: {
          ...desafio,
          ...updateData
        }
      };

      showChallengeDuelResults(rondaActual, correctCount, false);
      showView('#challengeResultView');
    }
  } catch (err) {
    console.error("Error guardando puntos de ronda de desafío en Firestore:", err);
    window.state.isChallengeRoundActive = false;
    showChallengeDuelResults(state.currentDuel?.currentRound || 1, correctCount, false);
    showView('#challengeResultView');
  } finally {
    _isSavingChallengeRound = false;
  }
}
window.guardarPuntosRondaDesafio = guardarPuntosRondaDesafio;

function renderResultadosDesafio() {
  const aciertos = (state.trivia && state.trivia.correctAnswersCount !== undefined) 
    ? state.trivia.correctAnswersCount 
    : ((window.state && window.state.trivia && window.state.trivia.correctAnswersCount !== undefined) 
        ? window.state.trivia.correctAnswersCount 
        : (window.state && window.state.correctAnswersCount ? window.state.correctAnswersCount : 0));

  guardarPuntosRondaDesafio(aciertos);
}
window.renderResultadosDesafio = renderResultadosDesafio;

function completeTriviaRound() {
  const isDuel = state.trivia.isDuel || window.state.isChallengeMode;
  const correctCount = state.trivia.correctAnswersCount !== undefined ? state.trivia.correctAnswersCount : (isDuel ? 4 : 10);
  if (isDuel) {
    guardarPuntosRondaDesafio(correctCount);
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
  if (typeof getActiveChallengesCount === 'function' && getActiveChallengesCount() >= MAX_ACTIVE_CHALLENGES) {
    showRetroToast("⚠️ Límite alcanzado: Tienes 3 partidas en curso. Termina una para iniciar otro reto.", "⚠️");
    if (typeof triggerActiveMatchesShake === 'function') triggerActiveMatchesShake();
    return;
  }
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
  if (window.state) window.state.noAds = !!purchased;
}

function setupNoAdsFeature() {
  // No-op tras la eliminación del botón en #profileView
}

// =============================================================================
// ESTADÍSTICAS Y GESTIÓN DE PERFIL (#profileView)
// =============================================================================
function updateProfileStatsUI() {
  const currentStats = (window.state && window.state.stats) || (state && state.stats) || { totalQuestions: 0, correctAnswers: 0, maxStreak: 0 };
  const accEl = document.getElementById('profileAccuracy');
  const corEl = document.getElementById('profileChallengesWon') || document.getElementById('profileCorrectCount');
  const strEl = document.getElementById('profileMaxStreak');

  const total = Number(currentStats.totalQuestions) || 0;
  const correct = Number(currentStats.correctAnswers) || 0;
  const maxStr = Number(currentStats.maxStreak) || 0;

  const wins = Number((window.state && window.state.challengesWon !== undefined) ? window.state.challengesWon : ((state && state.challengesWon !== undefined) ? state.challengesWon : (localStorage.getItem('retroquiz_challenges_won') || 0)));

  const accPercent = total > 0 ? Math.round((correct / total) * 100) + '%' : '0%';

  if (accEl) accEl.textContent = accPercent;
  if (corEl) corEl.textContent = String(wins);
  if (strEl) strEl.textContent = String(maxStr);
}
window.updateProfileStatsUI = updateProfileStatsUI;

function updatePlayerNameAcrossApp(newName) {
  if (!newName) return;
  if (state) state.username = newName;
  if (window.state) window.state.username = newName;

  const currentCountry = window.state?.country || window.state?.userCountry || state?.country || localStorage.getItem('retroquiz_user_country') || 'BO';
  const flag = typeof getCountryFlag === 'function' ? getCountryFlag(currentCountry) : '🇧🇴';

  // 1. Tarjeta en Ranking (#userRankName)
  const userRankNameEl = document.getElementById('userRankName');
  if (userRankNameEl) {
    userRankNameEl.textContent = `${newName} ${flag} (Tú)`;
    userRankNameEl.style.color = '#FFFFFF';
  }

  // 2. Jugador Local en Duelo
  const localDuelNameEl = document.getElementById('duelLocalName') || document.querySelector('.duel-player-local .duel-player-name');
  if (localDuelNameEl) {
    localDuelNameEl.textContent = `${newName} ${flag}`;
  }
  const localBadge = document.getElementById('duelLocalCountryBadge');
  if (localBadge) {
    localBadge.textContent = flag;
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
  const btnConfirmName = document.getElementById('btnConfirmUsername');
  const countrySelect = document.getElementById('profileCountrySelect');
  const editBtn = document.getElementById('btnEditUserName');
  const bioInput = document.getElementById('profileBioInput');

  // Sincronizar valores actuales
  const savedUsername = localStorage.getItem('retroquiz_username');
  const hasSavedName = (window.state && window.state.username) || (state && state.username) || savedUsername || '';
  const currentCountry = (window.state && (window.state.country || window.state.userCountry)) || (state && (state.country || state.userCountry)) || localStorage.getItem('retroquiz_user_country') || 'BO';
  const currentBio = (state && state.bio) || (window.state && window.state.bio) || localStorage.getItem('retroquiz_bio') || '';

  if (nameInput) {
    nameInput.value = hasSavedName;
    nameInput.placeholder = "Tu nombre de usuario...";
  }
  if (countrySelect) {
    countrySelect.value = currentCountry;
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

  // Guardar nombre de usuario con validación y feedback
  const saveName = async () => {
    if (!nameInput) return;
    const val = nameInput.value.trim();
    if (!val) {
      showRetroToast('Ingresa un nombre válido', '⚠️');
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

    // Actualizar inmediatamente en toda la app y ranking
    updatePlayerNameAcrossApp(val);
    if (typeof renderRankingUI === 'function') renderRankingUI();

    // Feedback visual en el botón
    if (btnConfirmName) {
      btnConfirmName.classList.add('btn-confirmed-feedback');
      const origText = btnConfirmName.innerText;
      btnConfirmName.innerText = '✓ ¡Listo!';
      setTimeout(() => {
        btnConfirmName.classList.remove('btn-confirmed-feedback');
        btnConfirmName.innerText = origText;
      }, 1200);
    }

    // Actualizar en Firestore inmediatamente con updateDoc
    const userId = window.state?.userId || state?.userId;
    if (window.db && window.firestoreOps && userId) {
      try {
        const { doc, updateDoc } = window.firestoreOps;
        const userRef = doc(window.db, "usuarios", userId);
        await updateDoc(userRef, {
          username: val,
          updatedAt: new Date().toISOString()
        });
        console.log("Username actualizado en Firestore:", val);
      } catch (err) {
        console.error("Error al actualizar username en Firestore:", err);
      }
    }
    showRetroToast('¡Nombre guardado! 🎉', '🎉');
  };

  if (btnConfirmName && !btnConfirmName.dataset.listenerAttached) {
    btnConfirmName.dataset.listenerAttached = 'true';
    btnConfirmName.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof playClickSound === 'function') playClickSound();
      saveName();
    });
  }

  if (nameInput && !nameInput.dataset.listenerAttached) {
    nameInput.dataset.listenerAttached = 'true';
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveName();
      }
    });
  }

  // Manejar selector de país
  if (countrySelect && !countrySelect.dataset.listenerAttached) {
    countrySelect.dataset.listenerAttached = 'true';
    countrySelect.addEventListener('change', async () => {
      const selectedCode = countrySelect.value || 'BO';
      state.country = selectedCode;
      state.userCountry = selectedCode;
      if (window.state) {
        window.state.country = selectedCode;
        window.state.userCountry = selectedCode;
      }
      try {
        localStorage.setItem('retroquiz_user_country', selectedCode);
      } catch (e) {}

      updatePlayerNameAcrossApp(state.username || window.state?.username || localStorage.getItem('retroquiz_username') || 'Tú');
      if (typeof renderRankingUI === 'function') renderRankingUI();

      const userId = window.state?.userId || state?.userId;
      if (window.db && window.firestoreOps && userId) {
        try {
          const { doc, updateDoc } = window.firestoreOps;
          const userRef = doc(window.db, "usuarios", userId);
          await updateDoc(userRef, {
            country: selectedCode,
            updatedAt: new Date().toISOString()
          });
          console.log("País actualizado en Firestore:", selectedCode);
        } catch (err) {
          console.error("Error al actualizar país en Firestore:", err);
        }
      }
      showRetroToast('País actualizado 🌎', '🌎');
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

  try { setupProfileUserFields(); } catch (e) { console.warn('setupProfileUserFields error:', e); }
  try { updateProfileStatsUI(); } catch (e) { console.warn('updateProfileStatsUI error:', e); }

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
  try { playModalOpenSound(); } catch (e) {}

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
  const currentCountry = window.state?.country || window.state?.userCountry || state?.country || localStorage.getItem('retroquiz_user_country') || 'BO';
  const userFlag = typeof getCountryFlag === 'function' ? getCountryFlag(currentCountry) : '🇧🇴';

  // 1. Actualizar Tarjeta del Jugador Local ("TÚ")
  const userRankNameEl = document.getElementById('userRankName');
  if (userRankNameEl) {
    userRankNameEl.textContent = `${currentUsername} ${userFlag} (Tú)`;
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
            country: d.country || 'WORLD',
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
      country: currentCountry,
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
  const p1 = usersList[0] || { username: `${currentUsername}`, country: currentCountry, xp: userScore };
  const p2 = usersList[1] || { username: 'Lugar disponible', country: '', xp: 0 };
  const p3 = usersList[2] || { username: 'Lugar disponible', country: '', xp: 0 };

  const formatPodiumName = (player) => {
    if (!player || player.username === 'Lugar disponible') return player?.username || 'Lugar disponible';
    const flag = typeof getCountryFlag === 'function' ? getCountryFlag(player.country || 'WORLD') : '🌎';
    return `${player.username} ${flag}`;
  };

  const p1Name = document.querySelector('#podium1 .podium-name');
  const p1Score = document.querySelector('#podium1 .podium-score');
  if (p1Name) p1Name.textContent = formatPodiumName(p1);
  if (p1Score) p1Score.textContent = `${(p1.xp || 0).toLocaleString()} pts`;

  const p2Name = document.querySelector('#podium2 .podium-name');
  const p2Score = document.querySelector('#podium2 .podium-score');
  if (p2Name) p2Name.textContent = formatPodiumName(p2);
  if (p2Score) p2Score.textContent = `${(p2.xp || 0).toLocaleString()} pts`;

  const p3Name = document.querySelector('#podium3 .podium-name');
  const p3Score = document.querySelector('#podium3 .podium-score');
  if (p3Name) p3Name.textContent = formatPodiumName(p3);
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
    if (typeof getActiveChallengesCount === 'function' && getActiveChallengesCount() >= MAX_ACTIVE_CHALLENGES) {
      showRetroToast("⚠️ Límite alcanzado: Tienes 3 partidas en curso. Termina una para iniciar otro reto.", "⚠️");
      if (typeof triggerActiveMatchesShake === 'function') triggerActiveMatchesShake();
      return;
    }
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
    
    if (modalId === 'modalRanking' && window.location.hash === '#ranking') {
      window.location.hash = '#home';
    }

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

// =============================================================================
// LÍMITE DE PARTIDAS ACTIVAS SIMULTÁNEAS (MÁXIMO 3)
// =============================================================================
const MAX_ACTIVE_CHALLENGES = 3;
window.MAX_ACTIVE_CHALLENGES = MAX_ACTIVE_CHALLENGES;

function getActiveChallengesCount() {
  // Cuenta desafíos donde el status sea 'active' o 'pending'
  // e involucren al usuario local (challengerId === uid || targetUserId === uid)
  const list = window.state?.activeMatchesList || state.activeMatchesList || window.state?.challenges || state.challenges;
  if (!list || !Array.isArray(list)) return 0;
  const uid = window.state?.userId || state.userId;
  return list.filter(d => {
    if (!d) return false;
    const isStatusMatch = (d.status === 'active' || d.status === 'pending');
    if (!isStatusMatch) return false;
    if (!uid) return true;
    const chId = d.challengerId || d.fromUid;
    const tId = d.targetUserId || d.toUid;
    return (chId === uid || tId === uid);
  }).length;
}
window.getActiveChallengesCount = getActiveChallengesCount;

function updateActiveChallengesBadge() {
  const badge = document.getElementById('activeChallengesCounter');
  if (!badge) return;
  const count = getActiveChallengesCount();
  if (count >= MAX_ACTIVE_CHALLENGES) {
    badge.innerText = `${count} / ${MAX_ACTIVE_CHALLENGES} (MÁXIMO)`;
    badge.classList.add('limit-reached');
  } else {
    badge.innerText = `${count} / ${MAX_ACTIVE_CHALLENGES} ACTIVAS`;
    badge.classList.remove('limit-reached');
  }
}
window.updateActiveChallengesBadge = updateActiveChallengesBadge;

function triggerActiveMatchesShake() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([40, 60, 40]); } catch (e) {}
  }
  const list = document.getElementById('challengesCardsList');
  if (list) {
    list.classList.remove('shake-active-matches');
    void list.offsetWidth;
    list.classList.add('shake-active-matches');
    setTimeout(() => list.classList.remove('shake-active-matches'), 450);
  }
}
window.triggerActiveMatchesShake = triggerActiveMatchesShake;

function renderChallengesUI() {
  updateActiveChallengesBadge();
  const container = document.getElementById('challengesCardsList');
  if (!container) return;

  const INVITATION_TTL = 48 * 60 * 60 * 1000;      // 48 horas para aceptar solicitud
  const MAX_INVITATION_TIME = INVITATION_TTL;
  const MAX_TURN_TIME = 36 * 60 * 60 * 1000;       // 36 horas para responder turno
  const WARNING_TIME = 10 * 60 * 60 * 1000;        // Últimas 10 horas (Zona de alerta)

  const rawChallenges = state.challenges || [];
  const ahora = Date.now();

  const currentUid = window.state?.userId;
  const currentUsername = window.state?.username || localStorage.getItem('retroquiz_username') || 'Tú';
  const currentAvatar = window.state?.customAvatar || state.customAvatar || 'assets/pantalla_inicio/hombre.webp';

  const validChallenges = [];
  rawChallenges.forEach(ch => {
    if (!ch) return;
    if (ch.status === "rejected" || ch.status === "expired" || ch.status === "archived") return;

    const tiempoCreacion = new Date(ch.createdAt || ch.updatedAt || ahora).getTime();
    const ultimaActividad = new Date(ch.updatedAt || ch.createdAt || ahora).getTime();
    const tiempoTranscurrido = ahora - ultimaActividad;

    // A. SI ES SOLICITUD PENDIENTE (status === "pending"):
    if (ch.status === "pending") {
      if ((ahora - tiempoCreacion) > INVITATION_TTL) {
        if (window.db && window.firestoreOps && ch.id) {
          try {
            const { doc, updateDoc } = window.firestoreOps;
            updateDoc(doc(window.db, "desafios", ch.id), {
              status: "expired",
              expiredAt: new Date().toISOString()
            }).catch(() => {});
          } catch (e) {}
        }
        ch.status = "expired";
        return; // Oculta la tarjeta de las partidas activas
      }
    }

    // B. SI ES PARTIDA ACTIVA (status === "active"):
    if (ch.status === "active") {
      if (tiempoTranscurrido > MAX_TURN_TIME) {
        const challengerUid = ch.challengerId || ch.fromUid;
        const targetUid = ch.targetUserId || ch.toUid;
        const winnerUid = (ch.currentTurn === challengerUid ? targetUid : challengerUid);
        const loserUid = (ch.currentTurn === challengerUid ? challengerUid : targetUid);

        ch.status = "completed";
        ch.winnerId = winnerUid;
        ch.winnerUid = winnerUid;
        ch.loserUid = loserUid;
        ch.finishReason = "timeout";
        ch.currentTurn = null;
        ch.completedAt = new Date().toISOString();

        if (window.db && window.firestoreOps && ch.id) {
          try {
            const { doc, updateDoc } = window.firestoreOps;
            updateDoc(doc(window.db, "desafios", ch.id), {
              status: "completed",
              winnerId: winnerUid,
              winnerUid: winnerUid,
              loserUid: loserUid,
              finishReason: "timeout",
              currentTurn: null,
              completedAt: new Date().toISOString()
            }).catch(() => {});
          } catch (e) {}
        }
      }
    }

    validChallenges.push(ch);
  });

  // ORDENAMIENTO DE TURNOS Y PRIORIDAD:
  // 1. Primero (Arriba): Partidas activas donde es el turno del usuario local (currentTurn === window.state.userId).
  // 2. Segundo: Partidas activas donde se espera al rival (currentTurn !== window.state.userId).
  // 3. Tercero: Partidas finalizadas (status === "completed") pendientes de ver resultado.
  validChallenges.sort((a, b) => {
    const getPrio = (ch) => {
      const isCompleted = (ch.status === "completed" || ch.status === "finished");
      if (!isCompleted && ch.status === "active" && ch.currentTurn === currentUid) return 1;
      if (!isCompleted && ch.status === "active" && ch.currentTurn !== currentUid) return 2;
      if (isCompleted) return 3;
      return 4;
    };
    const prioA = getPrio(a);
    const prioB = getPrio(b);
    if (prioA !== prioB) return prioA - prioB;
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  if (validChallenges.length === 0) {
    container.innerHTML = `
      <div class="empty-challenges-container" id="emptyChallengesContainer">
        <div class="empty-challenges-icon">⚔️</div>
        <p class="empty-challenges-title">No tienes desafíos pendientes</p>
        <p class="empty-challenges-sub">¡Elige un amigo y lánzale un reto!</p>
      </div>
    `;
  } else {
    container.innerHTML = validChallenges.map((ch, idx) => {
      const isCreator = (ch.fromUid === currentUid || ch.challengerId === currentUid);
      const rivalName = isCreator ? (ch.toUsername || ch.targetUserName || 'Rival') : (ch.fromUsername || ch.challengerName || 'Retador');
      const rivalAvatar = isCreator ? (ch.toAvatar || '🕹️') : (ch.fromAvatar || '👾');
      const isMyTurn = (ch.currentTurn === currentUid);
      const isCompleted = (ch.status === "completed" || ch.status === "finished");
      const currentRoundNum = ch.currentRound || ch.round || 1;
      const roundLabel = (ch.round === 'desempate' || ch.currentRound === 'desempate') ? 'Desempate' : `Ronda ${currentRoundNum}`;

      const ultimaActividad = new Date(ch.updatedAt || ch.createdAt || ahora).getTime();
      const tiempoTranscurrido = ahora - ultimaActividad;
      const isAlertZone = (tiempoTranscurrido > (MAX_TURN_TIME - WARNING_TIME));

      let statusHtml = '';
      let buttonHtml = '';
      let cardUrgentClass = '';

      if (isCompleted) {
        if (ch.finishReason === "timeout") {
          const soyGanadorTimeout = (ch.winnerId === currentUid || ch.winnerUid === currentUid);
          if (soyGanadorTimeout) {
            statusHtml = `<div class="status-indicator status-forfeit"><span class="status-check">🏆</span> ¡Victoria por abandono!</div>`;
            buttonHtml = `<button class="challenge-play-btn challenge-btn-completed interactive-press" data-challenge-id="${ch.id}">RECLAMAR VICTORIA 🏆</button>`;
          } else {
            statusHtml = `<div class="status-indicator status-timeout"><span class="status-clock">⌛</span> Tiempo agotado</div>`;
            buttonHtml = `<button class="challenge-play-btn challenge-btn-completed interactive-press" data-challenge-id="${ch.id}">VER RESULTADO 🏆</button>`;
          }
        } else {
          statusHtml = `<div class="status-indicator status-completed"><span class="status-check">🏆</span> 🏆 PARTIDA FINALIZADA</div>`;
          buttonHtml = `<button class="challenge-play-btn challenge-btn-completed interactive-press" data-challenge-id="${ch.id}">VER RESULTADO 🏆</button>`;
        }
      } else if (isMyTurn) {
        if (isAlertZone) {
          cardUrgentClass = ' card-urgent';
          statusHtml = `<div class="status-indicator status-urgent"><span class="status-check">⚠️</span> ¡Por expirar!</div>`;
        } else {
          statusHtml = `<div class="status-indicator status-your-turn"><span class="status-check">⚔️</span> ¡Tu turno!</div>`;
        }
        buttonHtml = `<button class="challenge-play-btn challenge-btn-turn interactive-press" data-challenge-id="${ch.id}">¡TU TURNO! ⚔️ (${roundLabel})</button>`;
      } else {
        if (isAlertZone) {
          statusHtml = `<div class="status-indicator status-waiting-urgent"><span class="status-clock">⏳</span> Rival en tiempo límite...</div>`;
        } else {
          statusHtml = `<div class="status-indicator status-waiting"><span class="status-clock">⏳</span> Esperando (${roundLabel})</div>`;
        }
        buttonHtml = `<button class="challenge-play-btn challenge-btn-waiting" disabled><span class="btn-waiting-icon">🔥</span> ESPERANDO RIVAL...</button>`;
      }

      return `
        <div class="swipe-wrapper" data-challenge-id="${ch.id || idx}">
          <!-- Capa de fondo de borrado (SWIPE-DELETE-BG) -->
          <div class="swipe-delete-bg">
            <span class="swipe-delete-text">🗑️ ELIMINAR</span>
          </div>

          <!-- Tarjeta frontal interactiva (.challenge-card) -->
          <div class="challenge-card anim-ch-card-${(idx % 3) + 1}${cardUrgentClass} interactive-press" data-challenge-id="${ch.id || idx}">
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
        </div>
      `;
    }).join('');

    // Controladores de gestos de deslizamiento a la izquierda para eliminar (SWIPE-TO-DISMISS)
    container.querySelectorAll('.swipe-wrapper').forEach(wrapper => {
      const card = wrapper.querySelector('.challenge-card');
      if (!card) return;
      const challengeId = wrapper.getAttribute('data-challenge-id');

      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let currentY = 0;
      let isSwiping = false;
      let isHorizontalGesture = null;

      card.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentX = startX;
        currentY = startY;
        isSwiping = false;
        isHorizontalGesture = null;
        card.style.transition = 'none';
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        if (isHorizontalGesture === null && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
          isHorizontalGesture = Math.abs(deltaX) > Math.abs(deltaY);
        }

        if (isHorizontalGesture) {
          if (deltaX < 0) {
            // Deslizamiento a la izquierda
            isSwiping = true;
            card.style.transform = `translateX(${deltaX}px)`;
          } else {
            // Bloquea desplazamientos a la derecha
            card.style.transform = 'translateX(0px)';
          }
        }
      }, { passive: true });

      card.addEventListener('touchend', () => {
        const deltaX = currentX - startX;
        const cardWidth = card.offsetWidth || 300;
        const threshold = Math.min(90, cardWidth * 0.35);

        // Si el arrastre superó los 90px (o 35% del ancho)
        if (isSwiping && (deltaX < -threshold || deltaX < -90)) {
          // 1. Anima salida: transform: translateX(-120%); opacity: 0; en 0.2s
          card.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
          card.style.transform = 'translateX(-120%)';
          card.style.opacity = '0';

          if (typeof SoundManager !== 'undefined') {
            SoundManager.playSFX('botones.wav', 0.40);
          }

          // 2. Colapsa wrapper (max-height: 0; margin-bottom: 0;) y retíralo del DOM
          setTimeout(() => {
            wrapper.style.transition = 'max-height 0.3s ease, margin-bottom 0.3s ease, opacity 0.25s ease';
            wrapper.style.maxHeight = '0px';
            wrapper.style.marginBottom = '0px';
            wrapper.style.opacity = '0';

            setTimeout(() => {
              wrapper.remove();

              // 3. Borra o archiva el documento en Firestore
              if (window.db && window.firestoreOps && challengeId) {
                try {
                  const { doc, updateDoc, deleteDoc } = window.firestoreOps;
                  const chRef = doc(window.db, "desafios", challengeId);
                  if (typeof updateDoc === 'function') {
                    updateDoc(chRef, {
                      status: "archived",
                      archivedAt: new Date().toISOString()
                    }).catch(() => {
                      if (typeof deleteDoc === 'function') deleteDoc(chRef).catch(() => {});
                    });
                  } else if (typeof deleteDoc === 'function') {
                    deleteDoc(chRef).catch(() => {});
                  }
                } catch (err) {
                  console.warn("Error eliminando desafío:", err);
                }
              }

              if (state.challenges) {
                state.challenges = state.challenges.filter(c => c.id !== challengeId);
              }
              if (window.state?.challenges) {
                window.state.challenges = window.state.challenges.filter(c => c.id !== challengeId);
              }
              if (state.allChallengesList) {
                state.allChallengesList = state.allChallengesList.filter(c => c.id !== challengeId);
              }
              if (state.activeMatchesList) {
                state.activeMatchesList = state.activeMatchesList.filter(c => c.id !== challengeId);
              }
              if (window.state?.activeMatchesList) {
                window.state.activeMatchesList = window.state.activeMatchesList.filter(c => c.id !== challengeId);
              }
              if (typeof updateActiveChallengesBadge === 'function') updateActiveChallengesBadge();

              // 4. Si la lista queda vacía, muestra la tarjeta de "No tienes desafíos pendientes"
              const remainingWrappers = container.querySelectorAll('.swipe-wrapper');
              if (remainingWrappers.length === 0) {
                container.innerHTML = `
                  <div class="empty-challenges-container" id="emptyChallengesContainer">
                    <div class="empty-challenges-icon">⚔️</div>
                    <p class="empty-challenges-title">No tienes desafíos pendientes</p>
                    <p class="empty-challenges-sub">¡Elige un amigo y lánzale un reto!</p>
                  </div>
                `;
              }
            }, 300);
          }, 200);
        } else {
          // Si no superó el umbral: regresa suavemente con transform: translateX(0px); en 0.2s
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = 'translateX(0px)';
        }

        if (isSwiping) {
          card.setAttribute('data-swiped', 'true');
          setTimeout(() => {
            card.removeAttribute('data-swiped');
          }, 150);
        }
      });
    });

    // Conectar eventos a los botones ¡TU TURNO! ⚔️
    container.querySelectorAll('.challenge-btn-turn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.challenge-card');
        if (card && card.getAttribute('data-swiped') === 'true') return;

        e.stopPropagation();
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else {
          playClickSound();
        }

        const chId = btn.getAttribute('data-challenge-id');
        const ch = (state.challenges || []).find(c => c.id === chId) || (state.allChallengesList || []).find(c => c.id === chId);
        if (!ch) return;

        const isCreator = (ch.fromUid === window.state?.userId || ch.challengerId === window.state?.userId);
        const rivalName = isCreator ? (ch.toUsername || ch.targetUserName || 'Rival') : (ch.fromUsername || ch.challengerName || 'Retador');
        const rivalAvatar = isCreator ? (ch.toAvatar || '🕹️') : (ch.fromAvatar || '👾');
        const rivalUid = isCreator ? (ch.toUid || ch.targetUserId) : (ch.fromUid || ch.challengerId);

        const isTieBreaker = (ch.round === 'desempate' || ch.currentRound === 'desempate');
        window.state.isChallengeMode = true;
        state.isChallengeMode = true;
        window.state.isChallengeRoundActive = true;
        state.isChallengeRoundActive = true;
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

        const activeRoundNum = ch.currentRound || ch.round || 1;
        const rivalCountry = isCreator ? (ch.toCountry || ch.targetUserCountry || 'WORLD') : (ch.fromCountry || ch.challengerCountry || 'WORLD');
        setupDuelMatchUI(rivalName, rivalAvatar, activeRoundNum, rivalCountry);
        state.currentDuel.challengeId = chId;
        state.currentDuel.rivalUid = rivalUid;
        state.currentDuel.rivalCountry = rivalCountry;
        state.currentDuel.rivalTotalScore = (ch.scores && ch.scores[rivalUid]?.totalScore) || (isCreator ? (ch.scores?.toScore || ch.scores?.p2Total || 0) : (ch.scores?.fromScore || ch.scores?.p1Total || 0));
        state.currentDuel.localTotalScore = (ch.scores && ch.scores[window.state?.userId]?.totalScore) || (isCreator ? (ch.scores?.fromScore || ch.scores?.p1Total || 0) : (ch.scores?.toScore || ch.scores?.p2Total || 0));
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
        const card = btn.closest('.challenge-card');
        if (card && card.getAttribute('data-swiped') === 'true') return;

        e.stopPropagation();
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else {
          playClickSound();
        }

        const chId = btn.getAttribute('data-challenge-id');
        const ch = (state.challenges || []).find(c => c.id === chId) || (state.allChallengesList || []).find(c => c.id === chId);
        if (!ch) return;
        window.state.currentChallengeId = ch.id;
        state.currentChallengeId = ch.id;
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
window.renderMatchCards = renderChallengesUI;

function openCompletedChallengeResult(ch) {
  const currentUid = window.state?.userId;
  const isCreator = (ch.fromUid === currentUid);
  const rivalName = isCreator ? (ch.toUsername || 'Rival') : (ch.fromUsername || 'Retador');
  const rivalAvatar = isCreator ? (ch.toAvatar || '🕹️') : (ch.fromAvatar || '👾');
  const rivalUid = isCreator ? ch.toUid : ch.fromUid;
  const rivalCountry = isCreator ? (ch.toCountry || ch.targetUserCountry || 'WORLD') : (ch.fromCountry || ch.challengerCountry || 'WORLD');

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
    rivalCountry: rivalCountry,
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

  setupDuelMatchUI(rivalName, rivalAvatar, 3, rivalCountry);
  state.currentDuel.chData = ch;
  state.currentDuel.challengeId = ch.id;
  state.currentDuel.rivalUid = rivalUid;
  state.currentDuel.rivalCountry = rivalCountry;
  state.currentDuel.localTotalScore = localScore;
  state.currentDuel.rivalTotalScore = rivalScore;
  state.currentDuel.isCompletedDuel = true;
  showChallengeDuelResults(3, myScores.hits !== undefined ? myScores.hits : 4, true);
  if (typeof showView === 'function') {
    showView('#challengeResultView');
  }
}
window.openCompletedChallengeResult = openCompletedChallengeResult;

// Aviso flotante interactivo (Toast Neo-Memphis en la parte superior) para partidas concluidas por el rival
function showChallengeCompletedToast(ch, rivalName) {
  let toast = document.getElementById('challengeCompletedToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'challengeCompletedToast';
    toast.className = 'challenge-completed-toast interactive-press';
    const container = document.getElementById('gameScreen') || document.body;
    container.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-duel-icon">⚔️</span> <span class="toast-duel-text">¡Partida terminada contra <strong>${rivalName}</strong>! Descubre al ganador</span>`;

  let autoNavigateTimer = null;
  const navigateToResult = () => {
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
      autoNavigateTimer = null;
    }
    toast.classList.remove('show');
    window.state.currentChallengeId = ch.id;
    state.currentChallengeId = ch.id;
    openCompletedChallengeResult(ch);
  };

  toast.onclick = (e) => {
    e.stopPropagation();
    navigateToResult();
  };

  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  if (typeof SoundManager !== 'undefined') {
    SoundManager.playSFX('botones.wav', 0.60);
  }

  if (toast._timer) clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    const isChallengesActive = (window.state?.currentView === '#challengesView') || 
      (document.getElementById('challengesView')?.classList.contains('active')) ||
      (document.getElementById('challengesView')?.style.display === 'flex');

    if (isChallengesActive) {
      navigateToResult();
    } else {
      toast.classList.remove('show');
    }
  }, 2000);
}
window.showChallengeCompletedToast = showChallengeCompletedToast;


async function syncUserProfileWithCloud(uid) {
  if (!window.db || !window.firestoreOps) return;
  const { doc, getDoc, setDoc } = window.firestoreOps;
  const userRef = doc(window.db, "usuarios", uid);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const defaultUsername = localStorage.getItem('retroquiz_username') || ("Jugador_" + uid.slice(0, 4));
      const defaultCountry = localStorage.getItem('retroquiz_user_country') || 'BO';
      const defaultChallengesWon = Number(localStorage.getItem('retroquiz_challenges_won')) || 0;
      const defaultBio = localStorage.getItem('retroquiz_bio') || "¡Listo para competir!";
      const initialData = {
        username: defaultUsername,
        country: defaultCountry,
        challengesWon: defaultChallengesWon,
        bio: defaultBio,
        coins: 0,
        xp: 0,
        stats: {
          totalQuestions: Number(state.stats?.totalQuestions) || 0,
          correctAnswers: Number(state.stats?.correctAnswers) || 0,
          maxStreak: Number(state.stats?.maxStreak) || 0
        },
        themes: window.state?.themes || { unlocked: ["default"], active: "default" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, initialData);
      state.coins = 0;
      state.xp = 0;
      state.userScore = 0;
      state.username = defaultUsername;
      state.country = defaultCountry;
      state.userCountry = defaultCountry;
      state.challengesWon = defaultChallengesWon;
      state.bio = defaultBio;
      state.challenges = [];
      if (window.state) {
        window.state.coins = 0;
        window.state.xp = 0;
        window.state.userScore = 0;
        window.state.username = defaultUsername;
        window.state.country = defaultCountry;
        window.state.userCountry = defaultCountry;
        window.state.challengesWon = defaultChallengesWon;
        window.state.bio = defaultBio;
        window.state.challenges = [];
      }
      localStorage.setItem('retroquiz_username', defaultUsername);
      localStorage.setItem('retroquiz_user_country', defaultCountry);
      localStorage.setItem('retroquiz_challenges_won', String(defaultChallengesWon));
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
      if (data.country) {
        state.country = data.country;
        state.userCountry = data.country;
        if (window.state) {
          window.state.country = data.country;
          window.state.userCountry = data.country;
        }
        localStorage.setItem('retroquiz_user_country', data.country);
      }
      if (typeof data.challengesWon === "number") {
        state.challengesWon = data.challengesWon;
        if (window.state) window.state.challengesWon = data.challengesWon;
        localStorage.setItem('retroquiz_challenges_won', String(data.challengesWon));
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
      if (data.themes && typeof data.themes === 'object') {
        const cloudUnlocked = Array.isArray(data.themes.unlocked) ? data.themes.unlocked : ['default'];
        const cloudActive = typeof data.themes.active === 'string' ? data.themes.active : 'default';
        const currentUnlocked = (window.state && window.state.themes && Array.isArray(window.state.themes.unlocked)) ? window.state.themes.unlocked : ['default'];
        const mergedUnlocked = Array.from(new Set([...currentUnlocked, ...cloudUnlocked]));
        window.state.themes = {
          unlocked: mergedUnlocked,
          active: cloudActive
        };
        state.themes = window.state.themes;
        if (state.store) {
          state.store.purchasedThemes = mergedUnlocked;
          state.store.activeTheme = cloudActive;
        }
        try {
          localStorage.setItem('retroquiz_unlocked_themes', JSON.stringify(mergedUnlocked));
          localStorage.setItem('retroquiz_active_theme', cloudActive);
        } catch (e) {}
        if (typeof applyTheme === 'function') {
          applyTheme(cloudActive);
        }
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

function initHomeButtons() {
  try {
    // 1. Botón JUGAR: selecciona (#homeView .btn-play, #homeView .btn-jugar, #btnPlay, #btnJugar)
    const playBtns = document.querySelectorAll('#homeView .btn-play, #homeView .btn-jugar, #btnPlay, #btnJugar');
    playBtns.forEach(btn => {
      btn.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (window.state) window.state.isChallengeMode = false;
        if (typeof state !== 'undefined') state.isChallengeMode = false;
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else if (typeof playClickSound === 'function') {
          playClickSound();
        }
        navigateToScreen('wheelView');
      };
    });

    // 2. Botón DESAFÍOS: selecciona (#homeView .btn-challenges, #homeView .btn-desafios, #btnChallenges, #btnDesafios)
    const challengeBtns = document.querySelectorAll('#homeView .btn-challenges, #homeView .btn-desafios, #btnChallenges, #btnDesafios');
    challengeBtns.forEach(btn => {
      btn.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else if (typeof playClickSound === 'function') {
          playClickSound();
        }
        navigateToScreen('challengesView');
      };
    });

    // 3. Botón RANKING: selecciona (#homeView .btn-ranking, #btnRanking)
    const rankingBtns = document.querySelectorAll('#homeView .btn-ranking, #btnRanking');
    rankingBtns.forEach(btn => {
      btn.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else if (typeof playClickSound === 'function') {
          playClickSound();
        }
        navigateToScreen('modalRanking');
      };
    });

    // 4. Pastilla de Monedas (#btnCoinPill)
    const coinPills = document.querySelectorAll('#btnCoinPill, #homeView .coin-pill');
    coinPills.forEach(pill => {
      pill.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else if (typeof playCoinSound === 'function') {
          playCoinSound();
        }
        navigateToScreen('storeView');
      };
    });

    // 5. Botón de Ayuda (?) (#btnHelp)
    const helpBtns = document.querySelectorAll('#btnHelp, #homeView .help-btn');
    helpBtns.forEach(btn => {
      btn.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (typeof SoundManager !== 'undefined') {
          SoundManager.playSFX('botones.wav', 0.60);
        } else if (typeof playClickSound === 'function') {
          playClickSound();
        }
        const htp = document.getElementById('howToPlayModal');
        if (htp) {
          htp.classList.remove('btn-exit-reverse');
          htp.style.display = 'flex';
          htp.classList.add('open');
        }
      };
    });

    // 6. Personajes / Avatar en Home -> Abre Perfil
    const avatarTriggers = document.querySelectorAll('#homeView .avatar-container, #homeView .characters-stage, #homeView .char-hombre-wrap, #homeView .char-mujer-wrap');
    avatarTriggers.forEach(el => {
      el.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        navigateToScreen('profileView');
      };
    });

    // 7. Navegación inferior (Bottom Nav: #tabInicio, #tabTienda, #tabPerfil)
    const tabInicioList = document.querySelectorAll('#tabInicio, #homeView [data-tab="inicio"]');
    tabInicioList.forEach(tab => {
      tab.onclick = (e) => {
        if (e) e.preventDefault();
        navigateToScreen('homeView');
        document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
      };
    });

    const tabTiendaList = document.querySelectorAll('#tabTienda, #homeView [data-tab="tienda"]');
    tabTiendaList.forEach(tab => {
      tab.onclick = (e) => {
        if (e) e.preventDefault();
        navigateToScreen('storeView');
      };
    });

    const tabPerfilList = document.querySelectorAll('#tabPerfil, #homeView [data-tab="perfil"], #homeView .btn-nav-profile');
    tabPerfilList.forEach(tab => {
      tab.onclick = (e) => {
        if (e) e.preventDefault();
        navigateToScreen('profileView');
      };
    });
  } catch (err) {
    console.error('Error en initHomeButtons:', err);
  }
}
window.initHomeButtons = initHomeButtons;

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initHomeButtons();
}

document.addEventListener('DOMContentLoaded', () => {
  // Vinculación robusta inmediata de botones de Inicio
  initHomeButtons();

  // Cargar progreso del jugador (XP y monedas) desde localStorage
  try { loadStoredPlayerProgress(); } catch (e) { console.warn('loadStoredPlayerProgress:', e); }

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

  try { updateWheelCategoriesUI(); } catch (e) { console.warn(e); }
  try { renderCollectionCardsUI(); } catch (e) { console.warn(e); }
  try { updateShotsUI(); } catch (e) { console.warn(e); }
  try { setupProfileAvatar(); } catch (e) { console.warn(e); }
  try { setupNoAdsFeature(); } catch (e) { console.warn(e); }
  try { setupProfileUserFields(); } catch (e) { console.warn(e); }
  try { updateProfileStatsUI(); } catch (e) { console.warn(e); }
  try { setupAudioSettingsPersistence(); } catch (e) { console.warn(e); }
  try { setupProfileNavigationEvents(); } catch (e) { console.warn(e); }
  try { updatePendingChallengesBadge(); } catch (e) { console.warn(e); }

  // --- NAVEGACIÓN PRINCIPAL ---

  // Botón Flecha Retorno (<) en Ruleta -> Regresa al Home
  const btnBackToHome = document.getElementById('btnBackToHome') || document.querySelector('#wheelView .btn-back');
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

      // Limpieza preventiva de colisiones de animación
      const wheelView = document.getElementById('wheelView');
      if (wheelView) wheelView.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
      const wheelStage = document.querySelector('#wheelView .wheel-stage') || document.querySelector('#wheelView .wheel-container');
      if (wheelStage) wheelStage.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
      const wheelDisc = document.getElementById('wheelDisc');
      if (wheelDisc) wheelDisc.classList.remove('wheelZoomPop', 'anim-wheel-zoom', 'micro-bounce', 'wheel-pop-in');

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
      if (typeof getActiveChallengesCount === 'function' && getActiveChallengesCount() >= MAX_ACTIVE_CHALLENGES) {
        showRetroToast("⚠️ Límite alcanzado: Tienes 3 partidas en curso. Termina una para iniciar otro reto.", "⚠️");
        if (typeof triggerActiveMatchesShake === 'function') triggerActiveMatchesShake();
        return;
      }
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
      const knownChallengeStatusMap = new Map();

      const updateAllChallengesRealtime = () => {
        const allMap = new Map([...fromChallengesMap, ...toChallengesMap]);
        const allList = Array.from(allMap.values());

        const INVITATION_TTL = 48 * 60 * 60 * 1000;      // 48 horas para aceptar solicitud
        const MAX_INVITATION_TIME = INVITATION_TTL;
        const MAX_TURN_TIME = 36 * 60 * 60 * 1000;       // 36 horas para responder turno
        const WARNING_TIME = 10 * 60 * 60 * 1000;        // Últimas 10 horas (Zona de alerta)
        const ahora = Date.now();

        allList.forEach(ch => {
          if (!ch) return;
          const tiempoCreacion = new Date(ch.createdAt || ch.updatedAt || ahora).getTime();
          const ultimaActividad = new Date(ch.updatedAt || ch.createdAt || ahora).getTime();
          const tiempoTranscurrido = ahora - ultimaActividad;

          if (ch.status === "pending" && (ahora - tiempoCreacion) > INVITATION_TTL) {
            ch.status = "expired";
            if (window.db && window.firestoreOps && ch.id) {
              try {
                const { doc, updateDoc } = window.firestoreOps;
                updateDoc(doc(window.db, "desafios", ch.id), {
                  status: "expired",
                  expiredAt: new Date().toISOString()
                }).catch(() => {});
              } catch (e) {}
            }
          } else if (ch.status === "active" && tiempoTranscurrido > MAX_TURN_TIME) {
            const challengerUid = ch.challengerId || ch.fromUid;
            const targetUid = ch.targetUserId || ch.toUid;
            const winnerUid = (ch.currentTurn === challengerUid ? targetUid : challengerUid);
            const loserUid = (ch.currentTurn === challengerUid ? challengerUid : targetUid);

            ch.status = "completed";
            ch.winnerId = winnerUid;
            ch.winnerUid = winnerUid;
            ch.loserUid = loserUid;
            ch.finishReason = "timeout";
            ch.currentTurn = null;
            ch.completedAt = new Date().toISOString();

            if (window.db && window.firestoreOps && ch.id) {
              try {
                const { doc, updateDoc } = window.firestoreOps;
                updateDoc(doc(window.db, "desafios", ch.id), {
                  status: "completed",
                  winnerId: winnerUid,
                  winnerUid: winnerUid,
                  loserUid: loserUid,
                  finishReason: "timeout",
                  currentTurn: null,
                  completedAt: new Date().toISOString()
                }).catch(() => {});
              } catch (e) {}
            }
          }
        });

        // 1. Desafíos entrantes pendientes de aceptar
        // Solo cuentan si toUid === userId, status === "pending" (no vencidos), y el retador ya jugó su ronda inicial (currentTurn === userId)
        const pendingChallenges = allList.filter(ch => 
          ch.toUid === userId && 
          ch.status === "pending" && 
          ch.status !== "archived" &&
          ch.status !== "expired" &&
          ch.currentTurn === userId &&
          (ahora - new Date(ch.createdAt || ahora).getTime()) <= INVITATION_TTL
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
                if (typeof getActiveChallengesCount === 'function' && getActiveChallengesCount() >= MAX_ACTIVE_CHALLENGES) {
                  showRetroToast("¡Tienes el máximo de 3 partidas activas! Termina o resuelve un desafío antes de aceptar uno nuevo.", "⚠️");
                  if (typeof triggerActiveMatchesShake === 'function') triggerActiveMatchesShake();
                  return;
                }
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
                  const rivalCountry = ch.fromCountry || ch.challengerCountry || 'WORLD';
                  setupDuelMatchUI(rivalName, rivalAvatar, ch.round || 1, rivalCountry);
                  state.currentDuel.challengeId = chId;
                  state.currentDuel.rivalUid = ch.fromUid;
                  state.currentDuel.rivalCountry = rivalCountry;
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

        // 2. Detección en vivo de partidas finalizadas por el rival
        allList.forEach(ch => {
          const prevStatus = knownChallengeStatusMap.get(ch.id);
          const currentStatus = ch.status;

          if (prevStatus && prevStatus !== 'completed' && currentStatus === 'completed') {
            if (window._justCompletedChallengeId !== ch.id) {
              const isCreator = (ch.fromUid === userId);
              const rivalName = isCreator ? (ch.toUsername || 'Rival') : (ch.fromUsername || 'Retador');
              const isChallengesActive = (window.state?.currentView === '#challengesView') || 
                (document.getElementById('challengesView')?.classList.contains('active')) ||
                (document.getElementById('challengesView')?.style.display === 'flex');

              if (isChallengesActive) {
                if (typeof showChallengeCompletedToast === 'function') {
                  showChallengeCompletedToast(ch, rivalName);
                }
              }
            } else {
              window._justCompletedChallengeId = null;
            }
          }
          knownChallengeStatusMap.set(ch.id, currentStatus);
        });

        // 3. Partidas activas y finalizadas ("Partidas activas (¡continúa!)")
        // Partidas donde status === "active" | "completed" | ("pending" para creador tras jugar R1)
        const activeMatches = allList.filter(ch => 
          (ch.status === "active" || ch.status === "completed" || (ch.status === "pending" && ch.creatorRoundCompleted && ch.fromUid === userId)) &&
          ch.status !== "rejected" &&
          ch.status !== "expired" &&
          ch.status !== "archived"
        );

        state.challenges = activeMatches;
        state.pendingChallenges = pendingChallenges;
        state.allChallengesList = allList;
        state.activeMatchesList = allList;
        if (window.state) {
          window.state.challenges = activeMatches;
          window.state.pendingChallenges = pendingChallenges;
          window.state.allChallengesList = allList;
          window.state.activeMatchesList = allList;
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
            country: u.country || 'WORLD',
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
        const flag = typeof getCountryFlag === 'function' ? getCountryFlag(user.country || 'WORLD') : '🌎';

        return `
          <div class="user-search-row interactive-press" data-user-index="${idx}" data-rival-id="${user.id}">
            <div class="search-row-avatar">
              ${avatarHtml}
            </div>
            <div class="search-row-info">
              <span class="search-row-username">${user.username} ${flag}</span>
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
            const flag = typeof getCountryFlag === 'function' ? getCountryFlag(selectedUser.country || 'WORLD') : '🌎';
            if (confirmBtn) {
              confirmBtn.innerHTML = `<span>Desafiar a ${selectedUser.username} ${flag} 🚀</span>`;
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
    if (typeof getActiveChallengesCount === 'function' && getActiveChallengesCount() >= MAX_ACTIVE_CHALLENGES) {
      showRetroToast("⚠️ Límite alcanzado: Tienes 3 partidas en curso. Termina una para iniciar otro reto.", "⚠️");
      if (typeof triggerActiveMatchesShake === 'function') triggerActiveMatchesShake();
      return;
    }
    if (!window.db || !window.firestoreOps || !window.state?.userId) {
      showRetroToast('Inicia sesión para enviar desafíos', '⚠️');
      return;
    }

    const { collection, addDoc } = window.firestoreOps;
    const currentUsername = window.state.username || localStorage.getItem('retroquiz_username') || "Jugador";
    const currentAvatar = window.state.customAvatar || state.customAvatar || 'assets/pantalla_inicio/hombre.webp';
    const currentCountry = window.state?.country || window.state?.userCountry || state?.country || localStorage.getItem('retroquiz_user_country') || 'BO';
    const rivalCountry = rival.country || 'WORLD';

    try {
      const desafiosRef = collection(window.db, "desafios");
      const docRef = await addDoc(desafiosRef, {
        fromUid: window.state.userId,
        fromUsername: currentUsername,
        fromAvatar: currentAvatar,
        fromCountry: currentCountry,
        toUid: rival.id,
        toUsername: rival.username,
        toAvatar: rival.avatar || '🕹️',
        toCountry: rivalCountry,
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

      setupDuelMatchUI(rival.username, rival.avatar || '🕹️', 1, rivalCountry);
      state.currentDuel.challengeId = docRef.id;
      state.currentDuel.rivalUid = rival.id;
      state.currentDuel.rivalCountry = rivalCountry;

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

  // Botón "🎲 RIVAL ALEATORIO" en #sendChallengeModal (Requirement 3)
  const btnRandomRival = document.getElementById('btnRandomRival');
  if (btnRandomRival && !btnRandomRival.dataset.listenerAttached) {
    btnRandomRival.dataset.listenerAttached = 'true';
    btnRandomRival.addEventListener('click', async () => {
      if (typeof getActiveChallengesCount === 'function' && getActiveChallengesCount() >= MAX_ACTIVE_CHALLENGES) {
        showRetroToast("⚠️ Límite alcanzado: Tienes 3 partidas en curso. Termina una para iniciar otro reto.", "⚠️");
        if (typeof triggerActiveMatchesShake === 'function') triggerActiveMatchesShake();
        return;
      }
      if (typeof playClickSound === 'function') playClickSound();
      if (!window.db || !window.firestoreOps) {
        showRetroToast('Error de conexión a la base de datos', '⚠️');
        return;
      }

      const originalHtml = btnRandomRival.innerHTML;
      btnRandomRival.disabled = true;
      btnRandomRival.innerHTML = '<span>🎲</span> Buscando oponente...';

      try {
        const { collection, getDocs, query, limit } = window.firestoreOps;
        const usersRef = collection(window.db, "usuarios");
        const q = query(usersRef, limit(25));
        const snapshot = await getDocs(q);

        const currentUid = window.state?.userId || state?.userId || '';
        const rivalesDisponibles = [];

        snapshot.forEach(docSnap => {
          const uid = docSnap.id;
          if (uid === currentUid) return;
          const u = docSnap.data();
          const username = (u.username || '').trim() || 'Jugador Retro';
          rivalesDisponibles.push({
            id: uid,
            username: username,
            country: u.country || 'WORLD',
            xp: u.xp || 0,
            bio: u.bio || 'Jugador Retro',
            avatar: u.avatar || '🕹️'
          });
        });

        if (rivalesDisponibles.length === 0) {
          showRetroToast('No hay oponentes disponibles por ahora', '⚠️');
          return;
        }

        const randomRival = rivalesDisponibles[Math.floor(Math.random() * rivalesDisponibles.length)];
        if (window.state) window.state.selectedRival = randomRival;
        if (state) state.selectedRival = randomRival;

        const container = document.getElementById('searchResultsList') || document.getElementById('searchResultsChallenge');
        const confirmBtn = document.getElementById('confirmSendChallengeBtn');

        if (container) {
          container.style.display = 'flex';
          const isImg = typeof randomRival.avatar === 'string' && (randomRival.avatar.startsWith('http') || randomRival.avatar.startsWith('assets/'));
          const avatarHtml = isImg
            ? `<img src="${randomRival.avatar}" alt="${randomRival.username}">`
            : `<span>${randomRival.avatar || '🕹️'}</span>`;
          const subtitle = randomRival.bio && randomRival.bio.trim() ? randomRival.bio.trim() : 'Jugador Retro';
          const flag = typeof getCountryFlag === 'function' ? getCountryFlag(randomRival.country || 'WORLD') : '🌎';

          container.innerHTML = `
            <div class="user-search-row interactive-press selected" data-user-index="0" data-rival-id="${randomRival.id}">
              <div class="search-row-avatar">
                ${avatarHtml}
              </div>
              <div class="search-row-info">
                <span class="search-row-username">${randomRival.username} ${flag}</span>
                <span class="search-row-subtitle">${subtitle}</span>
              </div>
              <div class="search-row-check">✓</div>
            </div>
          `;
        }

        if (confirmBtn) {
          const flag = typeof getCountryFlag === 'function' ? getCountryFlag(randomRival.country || 'WORLD') : '🌎';
          confirmBtn.innerHTML = `<span>Desafiar a ${randomRival.username} ${flag} 🚀</span>`;
          confirmBtn.style.display = 'flex';
          confirmBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (err) {
        console.error("Error buscando rival aleatorio:", err);
        showRetroToast('Error al buscar oponente', '⚠️');
      } finally {
        btnRandomRival.disabled = false;
        btnRandomRival.innerHTML = originalHtml;
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
      if (window.state.isChallengeMode && window.state.isChallengeRoundActive === false) {
        showRetroToast('Ronda ya completada. Espera el turno del rival.', '⏳');
        navigateToScreen('challengesView');
        return;
      }
      window.state.isChallengeMode = true;
      state.isChallengeMode = true;
      window.state.isChallengeRoundActive = true;

      // Limpieza preventiva de colisiones de animación en Duelo
      const matchView = document.getElementById('challengeMatchView');
      if (matchView) matchView.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
      const duelStage = document.querySelector('#challengeMatchView .duel-wheel-stage') || document.querySelector('#challengeMatchView .wheel-stage');
      if (duelStage) duelStage.classList.remove('run-stagger-assembly', 'anim-assembling', 'wheelZoomPop', 'anim-wheel-zoom');
      const duelDisc = document.getElementById('duelWheelDisc');
      if (duelDisc) duelDisc.classList.remove('wheelZoomPop', 'anim-wheel-zoom', 'micro-bounce', 'wheel-pop-in');

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

          if (nextStatus === "completed") {
            window._justCompletedChallengeId = chId;
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
    window.state.isChallengeRoundActive = false;
    state.isChallengeRoundActive = false;
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
      window.state.isChallengeRoundActive = false;
      state.isChallengeRoundActive = false;
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
      const card = btn.closest('.store-theme-card');
      const skin = THEME_SKINS[themeId];
      const name = skin ? skin.name : (card?.querySelector('.theme-title')?.innerText || 'Tema');
      const cost = skin ? skin.cost : (parseInt(btn.dataset.cost, 10) || 2500);

      const activeTheme = window.state?.themes?.active || state?.themes?.active || 'default';
      const unlockedThemes = window.state?.themes?.unlocked || state?.themes?.unlocked || ['default'];

      const isEquipped = (activeTheme === themeId);
      const isUnlocked = unlockedThemes.includes(themeId);

      if (isEquipped) {
        return;
      } else if (isUnlocked) {
        equipTheme(themeId);
        if (typeof SoundManager !== 'undefined' && typeof SoundManager.playSFX === 'function') {
          SoundManager.playSFX('compra_tienda.wav', 0.70);
        }
        showRetroToast(`¡Tema "${name}" equipado! 🎨`, '🎨');
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
  const btnResultsHome = document.getElementById('btnResultsHome');
  if (btnResultsHome) {
    btnResultsHome.addEventListener('click', () => {
      playClickSound();
      navigateToScreen('homeView');
    });
  }

  const btnResultsChallenge = document.getElementById('btnResultsChallenge');
  if (btnResultsChallenge) {
    btnResultsChallenge.addEventListener('click', () => {
      playClickSound();
      if (typeof getActiveChallengesCount === 'function' && getActiveChallengesCount() >= MAX_ACTIVE_CHALLENGES) {
        showRetroToast("⚠️ Límite alcanzado: Tienes 3 partidas en curso. Termina una para iniciar otro reto.", "⚠️");
        return;
      }
      openModal('sendChallengeModal');
    });
  }

  const btnResultsContinue = document.getElementById('btnResultsContinue') || document.getElementById('btnResultsPlayAgain');
  if (btnResultsContinue) {
    btnResultsContinue.addEventListener('click', () => {
      playClickSound();
      navigateToScreen('wheelView');
    });
  }

  // Compatibilidad con botones previos
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
  if (btnResultsPlayAgain && btnResultsPlayAgain !== btnResultsContinue) {
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

// =============================================================================
// CONSOLA DE REVISIÓN DIRECTA DE PANTALLAS Y MODALES (DEV REVIEW CONSOLE)
// =============================================================================

function openScreenConsole() {
  const overlay = document.getElementById('screenReviewConsoleOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    const indicator = document.getElementById('screenConsoleActiveIndicator');
    if (indicator) {
      const activeEl = document.querySelector('.screen-view.active');
      const activeId = activeEl ? activeEl.id : 'homeView';
      const hash = screenToHashMap[activeId] || window.location.hash || '#home';
      indicator.innerText = `${activeId} (${hash})`;
    }
    if (typeof playModalOpenSound === 'function') playModalOpenSound();
  }
}

function closeScreenConsole() {
  const overlay = document.getElementById('screenReviewConsoleOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    if (typeof playClickSound === 'function') playClickSound();
  }
}

function toggleScreenConsole() {
  const overlay = document.getElementById('screenReviewConsoleOverlay');
  if (overlay) {
    if (overlay.style.display === 'none' || !overlay.style.display) {
      openScreenConsole();
    } else {
      closeScreenConsole();
    }
  }
}

function debugNavigateScreen(screenId) {
  closeScreenConsole();
  document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));

  // Preparar datos de muestra si la pantalla requiere estado activo
  if (screenId === 'triviaView') {
    if (!state.trivia || !state.trivia.questions || state.trivia.questions.length === 0) {
      state.trivia = {
        category: 'cine',
        questions: [
          {
            pregunta: "¿En qué año se estrenó la película 'Volver al Futuro'?",
            opciones: ["1985", "1989", "1982", "1991"],
            correcta: 0,
            curiosidad: "Dirigida por Robert Zemeckis y producida por Steven Spielberg."
          },
          {
            pregunta: "¿Quién interpretó a Terminator en el clásico de 1984?",
            opciones: ["Sylvester Stallone", "Arnold Schwarzenegger", "Bruce Willis", "Jean-Claude Van Damme"],
            correcta: 1,
            curiosidad: "La célebre frase 'I'll be back' fue casi improvisada."
          }
        ],
        currentQuestionIndex: 0,
        totalQuestions: 2,
        lives: 3,
        sessionCoins: 150,
        timerSeconds: 20
      };
      state.lives = 3;
    }
    navigateToScreen('triviaView');
    setTimeout(() => {
      try { renderizarPreguntaActual(); } catch(e) {}
    }, 50);
  } else if (screenId === 'resultsView') {
    if (!state.trivia) state.trivia = {};
    const mockCoins = 50;
    state.trivia.sessionCoins = mockCoins;
    state.trivia.sessionXP = 0;
    state.trivia.correctAnswersCount = 10;
    state.trivia.totalQuestions = 10;
    state.correctAnswersCount = 10;
    window._lastResultsSessionCoins = mockCoins;
    window._lastResultsPrevCoins = Math.max(0, (state.coins || 1000) - mockCoins);
    window._lastResultsFinalCoins = state.coins || 1000;
    navigateToScreen('resultsView');
  } else if (screenId === 'challengeMatchView') {
    if (typeof setupDuelMatchUI === 'function') {
      setupDuelMatchUI('Rival Arcade 👾', '👾');
    }
    navigateToScreen('challengeMatchView');
  } else if (screenId === 'challengeResultView') {
    const timeSpentEl = document.getElementById('duelTimeSpent');
    if (timeSpentEl && (!timeSpentEl.innerText || timeSpentEl.innerText === '0.0s')) {
      timeSpentEl.innerText = '24.5s';
    }
    const pointsEarnedEl = document.getElementById('duelPointsEarned');
    if (pointsEarnedEl && (!pointsEarnedEl.innerText || pointsEarnedEl.innerText === '+0 XP')) {
      pointsEarnedEl.innerText = '+240 XP';
    }
    const coinsEarnedEl = document.getElementById('duelCoinsEarned');
    if (coinsEarnedEl && (!coinsEarnedEl.innerText || coinsEarnedEl.innerText === '+0 RC')) {
      coinsEarnedEl.innerText = '+20 RC';
    }
    const hitsNumEl = document.getElementById('duelHitsNumber');
    if (hitsNumEl && !hitsNumEl.innerText) {
      hitsNumEl.innerText = '4 / 5';
    }
    navigateToScreen('challengeResultView');
    setTimeout(() => {
      try { triggerDuelResultsEntranceAnimation(); } catch(e) {}
    }, 50);
  } else {
    navigateToScreen(screenId);
  }

  const indicator = document.getElementById('screenConsoleActiveIndicator');
  if (indicator) {
    indicator.innerText = `${screenId} (${screenToHashMap[screenId] || ''})`;
  }
  showRetroToast(`Navegando a ${screenId}`, '📺');
}

function debugOpenModal(modalId) {
  closeScreenConsole();
  document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));

  if (modalId === 'profileView') {
    if (typeof openProfileModal === 'function') openProfileModal();
    else openModal('profileView');
  } else if (modalId === 'challengeOnboardingModal') {
    if (typeof mostrarModalOnboarding === 'function') mostrarModalOnboarding();
    else openModal('challengeOnboardingModal');
  } else {
    openModal(modalId);
  }
  showRetroToast(`Abriendo ${modalId}`, '🪟');
}

function debugOpenPack(packId) {
  closeScreenConsole();
  if (typeof openPackDetailModal === 'function') {
    openPackDetailModal(packId);
    showRetroToast(`Inspeccionando ${packId}`, '📦');
  }
}

function debugTestCountdown() {
  closeScreenConsole();
  if (typeof iniciarCuentaRegresivaTrivia === 'function') {
    iniciarCuentaRegresivaTrivia('cine');
    showRetroToast('Probando conteo 3-2-1-¡YA!', '⏱️');
  }
}

function debugAddCoins(amount = 5000) {
  state.coins = (state.coins || 0) + amount;
  if (window.state) window.state.coins = state.coins;
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof updateStoreUI === 'function') updateStoreUI();
  if (typeof renderCollectionCardsUI === 'function') renderCollectionCardsUI();
  if (typeof saveCoinsToCloud === 'function') saveCoinsToCloud(state.coins);
  showRetroToast(`+${amount.toLocaleString()} RetroCoins agregadas`, '🪙');
}

function debugToggleAllPacks() {
  state.allCategoriesUnlocked = !state.allCategoriesUnlocked;
  if (window.state) window.state.allCategoriesUnlocked = state.allCategoriesUnlocked;
  if (typeof renderCollectionCardsUI === 'function') renderCollectionCardsUI();
  if (typeof updateStoreUI === 'function') updateStoreUI();
  showRetroToast(state.allCategoriesUnlocked ? '¡Todos los packs desbloqueados!' : 'Packs restaurados a su estado original', '🔓');
}

function debugResetShots() {
  state.shots = 3;
  if (window.state) window.state.shots = 3;
  if (typeof updateShotsUI === 'function') updateShotsUI();
  showRetroToast('3 tiros diarios de ruleta restaurados', '🔄');
}

function debugCloseAllModals() {
  closeScreenConsole();
  document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
  showRetroToast('Modales cerrados', '❌');
}

// Event Listeners y Shortcuts de teclado para la Consola
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('btnToggleScreenConsole');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleScreenConsole();
    });
  }

  const closeBtn = document.getElementById('btnCloseScreenConsole');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeScreenConsole();
    });
  }

  const overlay = document.getElementById('screenReviewConsoleOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeScreenConsole();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    // Teclas de acceso directo: tecla F2 o virgulilla (`)
    if (e.key === 'F2' || e.code === 'Backquote') {
      e.preventDefault();
      toggleScreenConsole();
    }
    if (e.key === 'Escape') {
      const consoleOverlay = document.getElementById('screenReviewConsoleOverlay');
      if (consoleOverlay && consoleOverlay.style.display !== 'none') {
        closeScreenConsole();
      }
    }
  });
});

window.openScreenConsole = openScreenConsole;
window.closeScreenConsole = closeScreenConsole;
window.toggleScreenConsole = toggleScreenConsole;
window.debugNavigateScreen = debugNavigateScreen;
window.debugOpenModal = debugOpenModal;
window.debugOpenPack = debugOpenPack;
window.debugTestCountdown = debugTestCountdown;
window.debugAddCoins = debugAddCoins;
window.debugToggleAllPacks = debugToggleAllPacks;
window.debugResetShots = debugResetShots;
window.debugCloseAllModals = debugCloseAllModals;

