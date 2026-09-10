/**
 * SoundManager - Controlador de Audio Centralizado Oficial para RetroQuiz
 */
const SoundManager = {
  bgmMenu: new Audio('assets/audio/inicio.mp3'),
  bgmRuleta: new Audio('assets/audio/pantalla_ruleta_solitario.mp3'),
  bgmTrivia: new Audio('assets/audio/pantalla_trivia_solitario.mp3'),
  bgmTienda: new Audio('assets/audio/pantalla_tienda.mp3'),
  bgmDesafios: new Audio('assets/audio/pantalla_desafios.mp3'),
  alarmAudio: new Audio('assets/audio/alarma.mp3'),
  sfxRuleta: new Audio('assets/audio/ruleta.mp3'),
  sfxRuletaTodo: new Audio('assets/audio/ruleta_todo.mp3'),
  sfxModales: new Audio('assets/audio/pantallas_emergentes.wav'),
  sfxBotones: new Audio('assets/audio/botones.wav'),
  sfxResultados: new Audio('assets/audio/resultados.mp3'),
  sfxResultadosAplausos: new Audio('assets/audio/pantalla_resultados_aplausos.mp3'),
  sfxResultados10: new Audio('assets/audio/pantalla_resultados_10.mp3'),
  _lastBtnSound: 0,
  _lastResultadosSound: 0,
  isMuted: localStorage.getItem('retroquiz_sound_muted') === 'true',

  init() {
    // Loops obligatorios para música de fondo
    this.bgmMenu.loop = true;
    this.bgmRuleta.loop = true;
    this.bgmTrivia.loop = true;
    this.bgmTienda.loop = true;
    this.bgmDesafios.loop = true;
    this.alarmAudio.loop = true;

    // SFX de resultados (fanfarria única, loop = false)
    this.sfxResultados.loop = false;
    this.sfxResultadosAplausos.loop = false;
    this.sfxResultados10.loop = false;

    // Calibración de volumen
    this.bgmMenu.volume = 0.35;
    this.bgmRuleta.volume = 0.35;
    this.bgmTrivia.volume = 0.30;
    this.bgmTienda.volume = 0.35;
    this.bgmDesafios.volume = 0.35;
    this.alarmAudio.volume = 0.45;
    this.sfxRuleta.volume = 0.70;
    this.sfxRuletaTodo.volume = 0.75;
    this.sfxModales.volume = 0.65;
    this.sfxBotones.volume = 0.60;
    this.sfxResultados.volume = 0.75;
    this.sfxResultadosAplausos.volume = 0.80;
    this.sfxResultados10.volume = 0.85;
  },

  stopAllBGM() {
    [this.bgmMenu, this.bgmRuleta, this.bgmTrivia, this.bgmTienda, this.bgmDesafios].forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.stopAlarm();
    this.stopSpinSound();
    if (this.sfxResultados) {
      this.sfxResultados.pause();
      this.sfxResultados.currentTime = 0;
    }
    if (this.sfxResultadosAplausos) {
      this.sfxResultadosAplausos.pause();
      this.sfxResultadosAplausos.currentTime = 0;
    }
    if (this.sfxResultados10) {
      this.sfxResultados10.pause();
      this.sfxResultados10.currentTime = 0;
    }
  },

  stopSpinSound() {
    if (this.sfxRuleta) {
      this.sfxRuleta.pause();
      this.sfxRuleta.currentTime = 0;
    }
  },

  playBGM(trackName) {
    if (this.isMuted) return;
    const trackMap = {
      menu: this.bgmMenu,
      inicio: this.bgmMenu,
      ruleta: this.bgmRuleta,
      trivia: this.bgmTrivia,
      tienda: this.bgmTienda,
      desafios: this.bgmDesafios,
      desafio: this.bgmDesafios
    };
    const targetAudio = trackMap[trackName];
    if (targetAudio) {
      if (!targetAudio.paused) return;
      this.stopAllBGM();
      targetAudio.play().catch(() => {});
    }
  },

  playSFX(fileName, volume = 0.7) {
    if (this.isMuted) return;
    let actualFile = fileName;
    if (actualFile === 'error.mp3') {
      actualFile = 'error.wav';
    }
    if (actualFile === 'compra.mp3' || actualFile === 'compra.wav') {
      actualFile = 'compra_tienda.wav';
    }
    if (actualFile === 'ruleta.mp3' || actualFile === 'ruleta') {
      if (this.sfxRuleta) {
        this.sfxRuleta.volume = volume;
        this.sfxRuleta.pause();
        this.sfxRuleta.currentTime = 0;
        this.sfxRuleta.play().catch(() => {});
        return this.sfxRuleta;
      }
    }
    if (actualFile === 'ruleta_todo.mp3' || actualFile === 'ruleta_todo') {
      if (this.sfxRuletaTodo) {
        this.sfxRuletaTodo.volume = (volume !== 0.7) ? volume : 0.75;
        this.sfxRuletaTodo.pause();
        this.sfxRuletaTodo.currentTime = 0;
        this.sfxRuletaTodo.play().catch(() => {});
        return this.sfxRuletaTodo;
      }
    }
    if (actualFile === 'pantallas_emergentes.mp3' || actualFile === 'pantallas_emergentes.wav' || actualFile === 'pantallas_emergentes' || actualFile === 'menu_open_or_close.wav') {
      if (this.sfxModales) {
        this.sfxModales.volume = (volume !== 0.7) ? volume : 0.65;
        this.sfxModales.pause();
        this.sfxModales.currentTime = 0;
        this.sfxModales.play().catch(() => {});
        return this.sfxModales;
      }
    }
    if (actualFile === 'botones.wav' || actualFile === 'botones' || actualFile === 'click.wav' || actualFile === 'click.mp3') {
      if (this.sfxBotones) {
        const now = performance.now();
        if (this._lastBtnSound && now - this._lastBtnSound < 40) {
          return this.sfxBotones;
        }
        this._lastBtnSound = now;
        this.sfxBotones.volume = (volume !== 0.7) ? volume : 0.60;
        this.sfxBotones.pause();
        this.sfxBotones.currentTime = 0;
        this.sfxBotones.play().catch(() => {});
        return this.sfxBotones;
      }
    }
    if (actualFile === 'resultados.mp3' || actualFile === 'resultados') {
      if (this.sfxResultados) {
        const now = performance.now();
        if (this._lastResultadosSound && now - this._lastResultadosSound < 80) {
          return this.sfxResultados;
        }
        this._lastResultadosSound = now;
        this.sfxResultados.volume = (volume !== 0.7) ? volume : 0.75;
        this.sfxResultados.loop = false;
        this.sfxResultados.pause();
        this.sfxResultados.currentTime = 0;
        this.sfxResultados.play().catch(() => {});
        return this.sfxResultados;
      }
    }
    if (actualFile === 'pantalla_resultados_aplausos.mp3' || actualFile === 'pantalla_resultados_aplausos') {
      if (this.sfxResultadosAplausos) {
        this.sfxResultadosAplausos.volume = (volume !== 0.7) ? volume : 0.80;
        this.sfxResultadosAplausos.loop = false;
        this.sfxResultadosAplausos.pause();
        this.sfxResultadosAplausos.currentTime = 0;
        this.sfxResultadosAplausos.play().catch(() => {});
        return this.sfxResultadosAplausos;
      }
    }
    if (actualFile === 'pantalla_resultados_10.mp3' || actualFile === 'pantalla_resultados_10') {
      if (this.sfxResultados10) {
        this.sfxResultados10.volume = (volume !== 0.7) ? volume : 0.85;
        this.sfxResultados10.loop = false;
        this.sfxResultados10.pause();
        this.sfxResultados10.currentTime = 0;
        this.sfxResultados10.play().catch(() => {});
        return this.sfxResultados10;
      }
    }
    const sfx = new Audio(`assets/audio/${actualFile}`);
    sfx.loop = false;
    sfx.volume = volume;
    sfx.play().catch(() => {});
  },

  startAlarm() {
    if (this.isMuted) return;
    this.alarmAudio.play().catch(() => {});
  },

  stopAlarm() {
    this.alarmAudio.pause();
    this.alarmAudio.currentTime = 0;
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('retroquiz_sound_muted', this.isMuted);
    if (this.isMuted) {
      this.stopAllBGM();
    }
    return this.isMuted;
  }
};

SoundManager.init();
window.SoundManager = SoundManager;
