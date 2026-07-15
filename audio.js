// Audio synthesis module for Snake 5.0 using the Web Audio API

const SoundManager = (() => {
    let audioCtx = null;
    let isMuted = false;

    // Initialize audio context on user interaction (required by browser policies)
    function init() {
        try {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx = new AudioContextClass();
                }
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().catch(e => console.warn("AudioContext resume failed:", e));
            }
        } catch (e) {
            console.error("AudioContext initialization failed:", e);
            audioCtx = null;
        }
    }

    // Toggle mute
    function toggleMute() {
        isMuted = !isMuted;
        return isMuted;
    }

    function getMuted() {
        return isMuted;
    }

    // Play a retro synth note
    function playTone(freq, type, duration, volume = 0.1, delay = 0) {
        if (isMuted) return;
        init();
        if (!audioCtx) return;

        setTimeout(() => {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                
                gain.gain.setValueAtTime(volume, audioCtx.currentTime);
                // Linear decay
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch (e) {
                console.error("Fehler beim Abspielen des Sounds:", e);
            }
        }, delay * 1000);
    }

    // Play a pitch-glide effect (sweep)
    function playSweep(startFreq, endFreq, type, duration, volume = 0.1) {
        if (isMuted) return;
        init();
        if (!audioCtx) return;

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration);

            gain.gain.setValueAtTime(volume, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.error("Fehler beim Abspielen des Sweeps:", e);
        }
    }

    // Sound definitions

    // 1. Menu selection / card click
    function playClick() {
        playTone(330, 'triangle', 0.08, 0.15);
    }

    // 2. Snake eat food
    function playEat() {
        // Classic retro coin sound (two ascending square waves)
        playTone(523.25, 'square', 0.1, 0.08); // C5
        playTone(659.25, 'square', 0.15, 0.08, 0.08); // E5
    }

    // 3. Collect Power-Up
    function playPowerUp() {
        // Rising frequency slide
        playSweep(220, 880, 'sine', 0.35, 0.12);
    }

    // 4. Hit obstacle / wall / own tail
    function playHit() {
        // Fast descending noisy explosion sound
        if (isMuted) return;
        init();
        if (!audioCtx) return;

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.3);

            // Synthesize short white noise burst using BufferSource
            const bufferSize = audioCtx.sampleRate * 0.3; // 0.3 seconds
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            const noiseGain = audioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            noiseGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);

            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            noise.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
            noise.start();
            noise.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.error("Fehler beim Abspielen des Treffers:", e);
        }
    }

    // 5. Game Over sequence
    function playGameOver() {
        // Sad melody sliding down
        playTone(220, 'sawtooth', 0.25, 0.12, 0);
        playTone(196, 'sawtooth', 0.25, 0.12, 0.25);
        playTone(165, 'sawtooth', 0.25, 0.12, 0.5);
        playTone(110, 'sawtooth', 0.6, 0.15, 0.75);
    }

    // 6. Shield breaks
    function playShieldBreak() {
        playSweep(600, 150, 'sawtooth', 0.25, 0.15);
    }

    // 7. Timer ticking (when powerup is expiring)
    function playTick() {
        playTone(880, 'sine', 0.03, 0.05);
    }

    return {
        init,
        toggleMute,
        getMuted,
        playClick,
        playEat,
        playPowerUp,
        playHit,
        playGameOver,
        playShieldBreak,
        playTick
    };
})();
