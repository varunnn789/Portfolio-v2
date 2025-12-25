/**
 * ============================================
 * AUDIO - Fast-Paced Cyberpunk Soundtrack
 * ============================================
 * 
 * Using oscillators + fast sequencer for real-time
 * generated cyberpunk music, not just ping sounds.
 */

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.masterGain = null;
        this.musicGain = null;
        this.isPlaying = false;
        this.sequencerInterval = null;
    }

    init() {
        if (this.initialized) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.35;
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.2;
        this.musicGain.connect(this.masterGain);

        this.initialized = true;
        this.startSoundtrack();
        console.log('🔊 Cyberpunk soundtrack started');
    }

    /**
     * Fast-paced generative cyberpunk soundtrack
     */
    startSoundtrack() {
        if (!this.initialized || this.isPlaying) return;
        this.isPlaying = true;

        // === BASS LINE - Continuous sub bass ===
        const bass = this.ctx.createOscillator();
        bass.type = 'sawtooth';
        bass.frequency.value = 55;

        const bassFilter = this.ctx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 100;

        const bassGain = this.ctx.createGain();
        bassGain.gain.value = 0.25;

        bass.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicGain);
        bass.start();

        // === PAD - Evolving atmospheric layer ===
        const pad1 = this.ctx.createOscillator();
        const pad2 = this.ctx.createOscillator();
        pad1.type = 'sine';
        pad2.type = 'triangle';
        pad1.frequency.value = 110;
        pad2.frequency.value = 165;

        const padFilter = this.ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 600;
        padFilter.Q.value = 2;

        // LFO for filter modulation
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 300;
        lfo.connect(lfoGain);
        lfoGain.connect(padFilter.frequency);
        lfo.start();

        const padGain = this.ctx.createGain();
        padGain.gain.value = 0.1;

        pad1.connect(padFilter);
        pad2.connect(padFilter);
        padFilter.connect(padGain);
        padGain.connect(this.musicGain);
        pad1.start();
        pad2.start();

        // === FAST SEQUENCER - 16th notes ===
        const bpm = 130;
        const stepTime = (60 / bpm) / 4; // 16th notes
        let step = 0;

        // Melodic pattern (repeating 16 steps)
        const pattern = [
            { note: 220, vol: 0.15 },
            { note: 0, vol: 0 },
            { note: 330, vol: 0.1 },
            { note: 0, vol: 0 },
            { note: 220, vol: 0.12 },
            { note: 440, vol: 0.08 },
            { note: 0, vol: 0 },
            { note: 330, vol: 0.1 },
            { note: 220, vol: 0.15 },
            { note: 0, vol: 0 },
            { note: 275, vol: 0.1 },
            { note: 0, vol: 0 },
            { note: 220, vol: 0.12 },
            { note: 0, vol: 0 },
            { note: 550, vol: 0.06 },
            { note: 330, vol: 0.1 }
        ];

        // Kick pattern
        const kickPattern = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0];

        // Hi-hat pattern
        const hihatPattern = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1];

        this.sequencerInterval = setInterval(() => {
            const now = this.ctx.currentTime;

            // Play melodic note
            const { note, vol } = pattern[step];
            if (note > 0 && vol > 0) {
                this.playNote(note, vol, stepTime * 0.8);
            }

            // Play kick
            if (kickPattern[step]) {
                this.playKick();
            }

            // Play hi-hat
            if (hihatPattern[step]) {
                this.playHihat();
            }

            step = (step + 1) % 16;
        }, stepTime * 1000);
    }

    playNote(freq, vol, duration) {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playKick() {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.1);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playHihat() {
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start();
    }

    playClick() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playHover() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 1000;

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playTransition() {
        if (!this.initialized) return;

        // Big swoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + 0.2);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.4);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(5000, this.ctx.currentTime + 0.2);
        filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.4);
        filter.Q.value = 3;

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }

    stop() {
        if (this.sequencerInterval) {
            clearInterval(this.sequencerInterval);
            this.sequencerInterval = null;
        }
        this.isPlaying = false;
    }
}
