/**
 * ============================================
 * AUDIO - Cyberpunk Sounds + Music
 * ============================================
 */

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.masterGain = null;
        this.musicGain = null;
        this.musicOscillators = [];
    }

    /**
     * Initialize audio context
     */
    init() {
        if (this.initialized) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Master volume
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);

        // Music volume (separate control)
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.15;
        this.musicGain.connect(this.masterGain);

        this.initialized = true;
        this.startMusic();
        console.log('🔊 Audio initialized with cyberpunk music');
    }

    /**
     * Start cyberpunk ambient music
     */
    startMusic() {
        if (!this.initialized) return;

        // Bass drone (low frequency)
        const bass = this.ctx.createOscillator();
        bass.type = 'sawtooth';
        bass.frequency.value = 55; // Low A

        const bassFilter = this.ctx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 120;

        const bassGain = this.ctx.createGain();
        bassGain.gain.value = 0.3;

        bass.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicGain);
        bass.start();
        this.musicOscillators.push(bass);

        // Pad synth (higher, evolving)
        const pad = this.ctx.createOscillator();
        pad.type = 'sine';
        pad.frequency.value = 220;

        const padFilter = this.ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 800;

        // LFO for filter sweep
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 400;
        lfo.connect(lfoGain);
        lfoGain.connect(padFilter.frequency);
        lfo.start();

        const padGain = this.ctx.createGain();
        padGain.gain.value = 0.15;

        pad.connect(padFilter);
        padFilter.connect(padGain);
        padGain.connect(this.musicGain);
        pad.start();
        this.musicOscillators.push(pad, lfo);

        // Arp-like high freq beeps (subtle)
        this.startArpeggio();
    }

    /**
     * Subtle arpeggio pattern
     */
    startArpeggio() {
        const notes = [440, 523, 659, 523]; // A, C, E, C
        let noteIndex = 0;

        const playNote = () => {
            if (!this.initialized) return;

            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = notes[noteIndex];

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);

            noteIndex = (noteIndex + 1) % notes.length;

            // Play every 2 seconds
            setTimeout(playNote, 2000);
        };

        // Start after a delay
        setTimeout(playNote, 1000);
    }

    /**
     * Play click sound
     */
    playClick() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    /**
     * Play hover sound
     */
    playHover() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    /**
     * Play transition whoosh
     */
    playTransition() {
        if (!this.initialized) return;

        // Frequency sweep up then down
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2500, this.ctx.currentTime + 0.25);
        osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.5);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(4000, this.ctx.currentTime + 0.25);
        filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.5);
        filter.Q.value = 2;

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    /**
     * Set master volume (0-1)
     */
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }

    /**
     * Set music volume (0-1)
     */
    setMusicVolume(value) {
        if (this.musicGain) {
            this.musicGain.gain.value = value;
        }
    }
}
