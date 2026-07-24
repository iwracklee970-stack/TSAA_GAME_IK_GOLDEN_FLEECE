// ==========================================
// Web Audio API Sound Synthesizer & Music Engine
// ==========================================

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;

  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Music state
  private currentLevelId: number | null = null;
  private isBossMusicActive: boolean = false;
  private isTriumphMusicActive: boolean = false;
  private musicTimer: number | null = null;
  private musicStep: number = 0;

  // Level 2 Ambient Rain State
  private rainNoiseNode: AudioBufferSourceNode | null = null;
  private rainGainNode: GainNode | null = null;
  private rainFilterNode: BiquadFilterNode | null = null;

  // Level 3 Ambient Gentle Wind State
  private windNoiseNode: AudioBufferSourceNode | null = null;
  private windGainNode: GainNode | null = null;
  private windFilterNode: BiquadFilterNode | null = null;

  constructor() {
    // Lazy init on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();

        this.updateGainLevels();

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureContext(): void {
    const wasSuspended = !this.ctx || this.ctx.state === 'suspended' || this.musicTimer === null;
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Guarantee that music is running if it was previously blocked by browser autoplay rules
    if (wasSuspended && !this.isBossMusicActive && !this.isTriumphMusicActive) {
      const lid = this.currentLevelId !== null ? this.currentLevelId : 0;
      this.currentLevelId = null;
      this.startLevelMusic(lid);
    }
  }

  private updateGainLevels(): void {
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const mVol = this.isMuted ? 0 : this.masterVolume;
    this.masterGain.gain.setValueAtTime(mVol, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
    this.musicGain.gain.setValueAtTime(this.musicVolume, now);
  }

  // ------------------------------------------
  // Audio Settings Controls
  // ------------------------------------------

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.updateGainLevels();
    if (this.isMuted) {
      this.stopRainSound();
      this.stopWindSound();
    } else {
      if (this.currentLevelId === 1) this.startRainSound();
      if (this.currentLevelId === 2) this.startWindSound();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMasterVolume(val: number): void {
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.updateGainLevels();
  }

  public setSFXVolume(val: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateGainLevels();
  }

  public setMusicVolume(val: number): void {
    this.musicVolume = Math.max(0, Math.min(1, val));
    this.updateGainLevels();
  }

  public getVolumes() {
    return {
      master: this.masterVolume,
      sfx: this.sfxVolume,
      music: this.musicVolume,
      muted: this.isMuted,
    };
  }

  // ------------------------------------------
  // Player & Gameplay Sound Effects
  // ------------------------------------------

  // Movement: Footstep
  public playFootstep(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const freq = 90 + Math.random() * 20;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Jump: Rising pitch sweep
  public playJump(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Dash: Filtered noise whoosh
  public playDash(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.07);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);
    filter.Q.setValueAtTime(2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.15);
  }

  // Landing: Low sub thud
  public playLand(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Boulder Roll (when boulder is released in Level 2)
  public playBoulderRoll(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.9);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.linearRampToValueAtTime(500, now + 0.4);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  // Boulder Impact SFX (when boulder crushes the wooden platform in Level 2)
  public playBoulderImpact(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // 1. Heavy sub-bass thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.6);

    // 2. Wood splintering / stone crunch noise burst
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.4);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  // Shoot / Spear Throw
  public playShoot(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Out of ammo click
  public playEmptyClick(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Collectible Pickup
  public playPickup(type: string = 'coin'): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = type === 'health' || type === 'fleece' || type === 'golden_fleece'
      ? [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      : [587.33, 880.00, 1174.66]; // D5, A5, D6

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const startTime = now + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    });
  }

  // Hit / Damage
  public playHit(isPlayer: boolean = false): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    if (isPlayer) {
      // Player hurt grunt/thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // Enemy hit punch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  // Enemy defeated
  public playEnemyDefeat(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Boss Roar / Attack
  public playBossRoar(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.8);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  // Boss Hit
  public playBossHit(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Boss Defeat Fanfare / Explosion
  public playBossDefeat(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Sub rumble boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.5);
  }

  // Door unlock / level complete
  public playDoorOpen(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // ------------------------------------------
  // Level 2 Ambient Rain Sound Generator (Level ID 1 ONLY)
  // ------------------------------------------

  public startRainSound(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.rainNoiseNode) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362;
      data[i] *= 0.08;
    }

    this.rainNoiseNode = this.ctx.createBufferSource();
    this.rainNoiseNode.buffer = buffer;
    this.rainNoiseNode.loop = true;

    this.rainFilterNode = this.ctx.createBiquadFilter();
    this.rainFilterNode.type = 'lowpass';
    this.rainFilterNode.frequency.setValueAtTime(1100, now);

    this.rainGainNode = this.ctx.createGain();
    this.rainGainNode.gain.setValueAtTime(0.001, now);
    this.rainGainNode.gain.exponentialRampToValueAtTime(0.16, now + 1.2);

    this.rainNoiseNode.connect(this.rainFilterNode);
    this.rainFilterNode.connect(this.rainGainNode);
    this.rainGainNode.connect(this.sfxGain);

    this.rainNoiseNode.start(now);
  }

  public stopRainSound(): void {
    if (this.rainGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.rainGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      const noiseToStop = this.rainNoiseNode;
      this.rainNoiseNode = null;
      this.rainGainNode = null;
      this.rainFilterNode = null;
      setTimeout(() => {
        if (noiseToStop) {
          try {
            noiseToStop.stop();
            noiseToStop.disconnect();
          } catch {
            // ignore
          }
        }
      }, 450);
    }
  }

  private playRainDrop(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const dropFreq = 1200 + Math.random() * 1800;
    osc.frequency.setValueAtTime(dropFreq, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // ------------------------------------------
  // Level 3 Ambient Gentle Wind Sound Generator (Level ID 2 ONLY)
  // ------------------------------------------

  public startWindSound(): void {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.windNoiseNode) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      data[i] = (b0 + b1 + b2 + b3) * 0.06;
    }

    this.windNoiseNode = this.ctx.createBufferSource();
    this.windNoiseNode.buffer = buffer;
    this.windNoiseNode.loop = true;

    this.windFilterNode = this.ctx.createBiquadFilter();
    this.windFilterNode.type = 'lowpass';
    this.windFilterNode.frequency.setValueAtTime(250, now);
    this.windFilterNode.Q.setValueAtTime(3, now);

    this.windGainNode = this.ctx.createGain();
    this.windGainNode.gain.setValueAtTime(0.001, now);
    this.windGainNode.gain.exponentialRampToValueAtTime(0.18, now + 2.0);

    this.windNoiseNode.connect(this.windFilterNode);
    this.windFilterNode.connect(this.windGainNode);
    this.windGainNode.connect(this.sfxGain);

    this.windNoiseNode.start(now);
  }

  public stopWindSound(): void {
    if (this.windGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.windGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      const noiseToStop = this.windNoiseNode;
      this.windNoiseNode = null;
      this.windGainNode = null;
      this.windFilterNode = null;
      setTimeout(() => {
        if (noiseToStop) {
          try {
            noiseToStop.stop();
            noiseToStop.disconnect();
          } catch {
            // ignore
          }
        }
      }, 550);
    }
  }

  // ------------------------------------------
  // Environment Ambient Sound & Music Engine
  // ------------------------------------------

  public startLevelMusic(levelId: number): void {
    if (this.currentLevelId === levelId && !this.isBossMusicActive && !this.isTriumphMusicActive && this.musicTimer !== null) {
      return; // Already playing current level music
    }
    this.stopMusic();
    this.currentLevelId = levelId;
    this.isBossMusicActive = false;
    this.isTriumphMusicActive = false;
    this.initCtx();

    // Rain sound for Level 2 (levelId === 1) & Gentle wind sound for Level 3 (levelId === 2)
    if (levelId === 1) {
      this.startRainSound();
      this.stopWindSound();
    } else if (levelId === 2) {
      this.startWindSound();
      this.startWindSound();
      this.stopRainSound();
    } else {
      this.stopRainSound();
      this.stopWindSound();
    }

    // Schedule music steps
    this.musicStep = 0;
    this.musicTimer = window.setInterval(() => {
      this.tickMusicStep();
    }, 320);
  }

  public startBossMusic(): void {
    if (this.isBossMusicActive && this.musicTimer !== null) return;
    this.stopMusic();
    this.stopRainSound();
    this.stopWindSound();
    this.isBossMusicActive = true;
    this.isTriumphMusicActive = false;
    this.initCtx();

    this.musicStep = 0;
    // Faster, intense BPM for boss fight (160 BPM, tick every 180ms)
    this.musicTimer = window.setInterval(() => {
      this.tickBossMusicStep();
    }, 180);
  }

  public startTriumphMusic(): void {
    if (this.isTriumphMusicActive && this.musicTimer !== null) return;
    this.stopMusic();
    this.stopRainSound();
    this.stopWindSound();
    this.isBossMusicActive = false;
    this.isTriumphMusicActive = true;
    this.initCtx();

    this.musicStep = 0;
    // Upbeat 8-bit tempo (130 BPM, tick every 230ms)
    this.musicTimer = window.setInterval(() => {
      this.tickTriumphMusicStep();
    }, 230);
  }

  public stopMusic(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.stopRainSound();
    this.stopWindSound();
    this.currentLevelId = null;
    this.isBossMusicActive = false;
    this.isTriumphMusicActive = false;
  }

  private tickMusicStep(): void {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const step = this.musicStep;
    this.musicStep = (this.musicStep + 1) % 32;

    const level = this.currentLevelId !== null ? this.currentLevelId : 0;

    if (level === 0) {
      // ----------------------------------------------------
      // LEVEL 1 ONLY (Level ID 0 — Tbilisi University Archives / Library)
      // Solemn academic library theme: warm organ chords, soft minor piano arpeggio
      // ----------------------------------------------------
      const libraryScale = [220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 659.25]; // A3, C4, E4, G4, A4, C5, E5
      
      // Academic melody chime
      if (step % 2 === 0) {
        const noteIdx = (step / 2) % libraryScale.length;
        this.playSynthNote(libraryScale[noteIdx], 0.35, 'triangle', 0.22, 0.5);
      }
      
      // Warm organ bass line on measure beats
      if (step % 4 === 0) {
        const bassScale = [110.00, 130.81, 146.83, 164.81]; // A2, C3, D3, E3
        const bassFreq = bassScale[(step / 4) % bassScale.length];
        this.playSynthNote(bassFreq, 0.6, 'sine', 0.28, 0.9);
      }

      // Quiet ticking clock / parchment rustle sound every 4 steps
      if (step % 4 === 2) {
        this.playSynthNote(783.99, 0.04, 'sine', 0.05, 0.05);
      }
    } else if (level === 1 || level === 2) {
      // ----------------------------------------------------
      // ETHEREAL MYSTICAL AMBIENT MUSIC (LEVELS 2, 3 / Level IDs 1, 2)
      // Lush, celestial floating pads, crystalline shimmer tones, and mystical swells
      // ----------------------------------------------------

      // Level 2 (ID 1) Rain Drop Pitter-Patter SFX during music ticks
      if (level === 1 && Math.random() > 0.45) {
        this.playRainDrop();
      }

      // Level 3 (ID 2) Gentle Wind Modulated Cutoff Sweep
      if (level === 2 && this.windFilterNode && this.ctx) {
        const now = this.ctx.currentTime;
        const windFreq = 220 + Math.sin(now * 0.8) * 120 + Math.cos(now * 0.3) * 60;
        this.windFilterNode.frequency.setValueAtTime(windFreq, now);
      }

      const etherealPadScale = [
        185.00, // F#3
        220.00, // A3
        246.94, // B3
        277.18, // C#4
        369.99, // F#4
        440.00, // A4
        554.37, // C#5
        659.25, // E5
        739.99, // F#5
      ];

      // Ethereal Pad Swells on major beats
      if (step % 8 === 0) {
        const chordRootIdx = Math.floor(step / 8) % 4;
        const roots = [185.00, 220.00, 246.94, 277.18]; // F#3, A3, B3, C#4
        const rootFreq = roots[chordRootIdx];

        this.playSynthNote(rootFreq * 0.5, 1.2, 'sine', 0.16, 1.5);
        this.playSynthNote(rootFreq * 1.5, 0.9, 'sine', 0.12, 1.2, 800);
      }

      // Shimmering crystalline chime notes
      if (step % 3 === 0 || step % 7 === 0) {
        const shimmerIdx = (step * 5 + level * 2) % etherealPadScale.length;
        const freq = etherealPadScale[shimmerIdx];
        this.playSynthNote(freq, 0.45, 'sine', 0.09, 0.8);
      }

      // Atmospheric high wind/mystical shimmer call
      if (step === 12 || step === 28) {
        const highPitch = etherealPadScale[etherealPadScale.length - 1]; // F#5
        this.playSynthNote(highPitch, 0.6, 'sine', 0.07, 1.2, 1600);
      }
    } else {
      // ----------------------------------------------------
      // EERIE ETHEREAL DUNGEON MUSIC (LEVELS 4, 5 / Level IDs 3, 4)
      // Slow, dark cavern sub-bass, hollow diminished bells, and random dungeon drip clicks
      // ----------------------------------------------------

      // Random echoing water drip SFX
      if (Math.random() > 0.88) {
        this.playRainDrop();
      }

      // Cavern Bass pedal point (D2: 73.42Hz, or G#2: 103.83Hz for dark tension)
      if (step % 8 === 0) {
        const bassFreq = (step === 0 || step === 16) ? 73.42 : 103.83;
        this.playSynthNote(bassFreq, 1.4, 'sine', 0.22, 1.8);
        this.playSynthNote(bassFreq * 1.5, 1.0, 'sine', 0.1, 1.2, 400); // deep minor fifth
      }

      // Hollow echoing crystalline minor bells (tense intervals: D, Eb, G, Ab)
      const dungeonScale = [293.66, 311.13, 392.00, 415.30, 587.33, 622.25]; // D4, Eb4, G4, Ab4, D5, Eb5
      if (step % 6 === 0 || step % 7 === 2) {
        const bellIdx = (step * 3) % dungeonScale.length;
        const freq = dungeonScale[bellIdx];
        this.playSynthNote(freq, 0.35, 'sine', 0.08, 1.5, 1000); // very long decay for cavern echo
      }

      // High tension horror chime
      if (step === 14 || step === 30) {
        this.playSynthNote(830.61, 0.8, 'sine', 0.05, 1.8, 1500); // G#5 tension swell
      }
    }
  }

  private tickBossMusicStep(): void {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const step = this.musicStep;
    this.musicStep = (this.musicStep + 1) % 16;

    // Heavy driving staccato bassline
    const bassScale = [82.41, 82.41, 98.00, 82.41, 110.00, 82.41, 73.42, 82.41];
    const bassFreq = bassScale[step % bassScale.length];
    this.playSynthNote(bassFreq, 0.14, 'sawtooth', 0.28, 0.15, 600);

    // High tension staccato synth melody
    if (step % 2 === 1) {
      const melodyScale = [329.63, 392.00, 493.88, 587.33, 659.25];
      const melFreq = melodyScale[(step * 3) % melodyScale.length];
      this.playSynthNote(melFreq, 0.1, 'square', 0.15, 0.12, 1200);
    }

    // Boss rhythmic crash / snare sweep on beats 4 & 12
    if (step === 4 || step === 12) {
      this.playSynthNote(220, 0.1, 'triangle', 0.2, 0.1);
    }
  }

  private tickTriumphMusicStep(): void {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const step = this.musicStep;
    this.musicStep = (this.musicStep + 1) % 16;

    // Uplifting major chord progression (C -> G -> Am -> F)
    const chordIdx = Math.floor(step / 4);
    const scaleC = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const scaleG = [392.00, 493.88, 587.33, 783.99];  // G4, B4, D5, G5
    const scaleAm = [440.00, 523.25, 659.25, 880.00]; // A4, C5, E5, A5
    const scaleF = [349.23, 440.00, 523.25, 698.46];  // F4, A4, C5, F5

    let activeScale = scaleC;
    if (chordIdx === 1) activeScale = scaleG;
    else if (chordIdx === 2) activeScale = scaleAm;
    else if (chordIdx === 3) activeScale = scaleF;

    // Upbeat retro rhythm arpeggiator (NES square wave chiptune)
    const note = activeScale[step % 4];
    this.playSynthNote(note, 0.12, 'square', 0.18, 0.1);

    // Supporting retro bass line
    if (step % 2 === 0) {
      const bassRoots = [261.63, 196.00, 220.00, 174.61]; // C4, G3, A3, F3
      const bassNote = bassRoots[chordIdx];
      this.playSynthNote(bassNote, 0.16, 'triangle', 0.22, 0.1);
    }
  }

  private playSynthNote(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    vol: number = 0.15,
    decay: number = 0.3,
    cutoffFreq?: number
  ): void {
    if (!this.ctx || !this.musicGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + decay);

    if (cutoffFreq) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoffFreq, now);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + decay);
  }
}

export const soundEngine = new AudioEngine();
