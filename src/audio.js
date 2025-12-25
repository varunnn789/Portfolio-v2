/**
 * ============================================
 * AUDIO - MP3 Playback with Full Mute Control
 * ============================================
 * 
 * - Music volume 30% lower (0.28 instead of 0.4)
 * - Mute toggles ALL sounds (effects too)
 * - Auto-change song on completion
 */

export class AudioManager {
    constructor() {
        this.audioElement = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.currentSongIndex = 0;

        this.songs = [
            '/cool-and-spacy-beat-beat-making-with-breaktweaker-21682.mp3',
            '/dreamy-day-technology-dreams-187509.mp3'
        ];

        this.songNames = [
            'Cool & Spacy Beat',
            'Dreamy Technology'
        ];

        this.onSongChange = null;
    }

    init() {
        if (this.audioElement) return;

        this.audioElement = new Audio(this.songs[this.currentSongIndex]);
        this.audioElement.loop = false; // Don't loop - auto change instead
        this.audioElement.volume = 0.28; // 30% lower than 0.4

        // Auto-change song when current ends
        this.audioElement.addEventListener('ended', () => {
            console.log('🎵 Song ended, switching to next');
            this.nextSong();
        });

        this.audioElement.play().then(() => {
            this.isPlaying = true;
            console.log('🎵 Playing:', this.songNames[this.currentSongIndex]);
        }).catch(e => {
            console.log('Audio autoplay blocked, will play on interaction');
        });
    }

    /**
     * Toggle mute/unmute - affects BOTH music AND sound effects
     */
    toggle() {
        if (!this.audioElement) {
            this.init();
            return true;
        }

        this.isMuted = !this.isMuted;
        this.audioElement.muted = this.isMuted;

        if (!this.isPlaying && !this.isMuted) {
            this.audioElement.play();
            this.isPlaying = true;
        }

        console.log(this.isMuted ? '🔇 All sound muted' : '🔊 Sound on');
        return !this.isMuted;
    }

    nextSong() {
        if (!this.audioElement) {
            this.init();
            return this.songNames[0];
        }

        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.audioElement.src = this.songs[this.currentSongIndex];

        if (!this.isMuted) {
            this.audioElement.play().then(() => {
                this.isPlaying = true;
            }).catch(e => {
                console.log('Could not play next song');
            });
        }

        console.log('🎵 Switched to:', this.songNames[this.currentSongIndex]);

        if (this.onSongChange) {
            this.onSongChange(this.songNames[this.currentSongIndex]);
        }

        return this.songNames[this.currentSongIndex];
    }

    getCurrentSong() {
        return this.songNames[this.currentSongIndex];
    }

    setVolume(value) {
        if (this.audioElement) {
            this.audioElement.volume = Math.max(0, Math.min(1, value));
        }
    }

    /**
     * Play click sound - respects mute
     */
    playClick() {
        if (this.isMuted) return;

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            // Ignore errors
        }
    }

    /**
     * Play hover sound - respects mute
     */
    playHover() {
        if (this.isMuted) return;

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = 800;

            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) {
            // Ignore errors
        }
    }

    /**
     * Play transition whoosh - respects mute
     */
    playTransition() {
        if (this.isMuted) return;

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.2);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);

            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            filter.Q.value = 2;

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            // Ignore errors
        }
    }
}
