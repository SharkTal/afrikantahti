// Simple sound synthesis using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playSuccessSound = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Arpeggio C-E-G-C
    const now = audioCtx.currentTime;

    // Note 1
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    gainNode.gain.setValueAtTime(0.1, now);

    // Note 2
    oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5

    // Note 3
    oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5

    // Note 4
    oscillator.frequency.setValueAtTime(1046.50, now + 0.3); // C6
    gainNode.gain.linearRampToValueAtTime(0, now + 0.8);

    oscillator.start(now);
    oscillator.stop(now + 0.8);
};

export const playFailureSound = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sawtooth';

    const now = audioCtx.currentTime;
    // Slide down
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.linearRampToValueAtTime(100, now + 0.5);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
};
