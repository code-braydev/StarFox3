let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
	return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
	try {
		const ctx = getContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(frequency, ctx.currentTime);
		gain.gain.setValueAtTime(volume, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + duration);
	} catch {
		// AudioContext not available
	}
}

function playSequence(notes: { freq: number; dur: number; delay: number }[], volume = 0.25) {
	try {
		const ctx = getContext();
		notes.forEach(({ freq, dur, delay }) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
			gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(ctx.currentTime + delay);
			osc.stop(ctx.currentTime + delay + dur);
		});
	} catch {
		// ignore
	}
}

export function playSuccess() {
	playSequence([
		{ freq: 523, dur: 0.15, delay: 0 },
		{ freq: 659, dur: 0.15, delay: 0.12 },
		{ freq: 784, dur: 0.2, delay: 0.24 }
	]);
}

export function playError() {
	playTone(330, 0.2, 'sine', 0.15);
	setTimeout(() => playTone(262, 0.25, 'sine', 0.1), 100);
}

export function playClick() {
	playTone(880, 0.05, 'sine', 0.15);
}

export function playStar() {
	playSequence([
		{ freq: 1047, dur: 0.1, delay: 0 },
		{ freq: 1319, dur: 0.1, delay: 0.08 },
		{ freq: 1568, dur: 0.15, delay: 0.16 },
		{ freq: 2093, dur: 0.2, delay: 0.24 }
	], 0.2);
}

export function playGem() {
	playTone(1568, 0.15, 'sine', 0.2);
	setTimeout(() => playTone(2093, 0.2, 'sine', 0.15), 80);
}

export function playLevelComplete() {
	playSequence([
		{ freq: 523, dur: 0.12, delay: 0 },
		{ freq: 659, dur: 0.12, delay: 0.1 },
		{ freq: 784, dur: 0.12, delay: 0.2 },
		{ freq: 1047, dur: 0.3, delay: 0.3 }
	], 0.25);
}

export function playBlackHole() {
	try {
		const ctx = getContext();
		const now = ctx.currentTime;

		// Sweep principal: frecuencia descendente (absorción)
		const osc1 = ctx.createOscillator();
		const gain1 = ctx.createGain();
		osc1.type = 'sawtooth';
		osc1.frequency.setValueAtTime(1200, now);
		osc1.frequency.exponentialRampToValueAtTime(60, now + 1.5);
		gain1.gain.setValueAtTime(0, now);
		gain1.gain.linearRampToValueAtTime(0.25, now + 0.15);
		gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
		osc1.connect(gain1);
		gain1.connect(ctx.destination);
		osc1.start(now);
		osc1.stop(now + 1.5);

		// Sweep grave: profundidad
		const osc2 = ctx.createOscillator();
		const gain2 = ctx.createGain();
		osc2.type = 'sine';
		osc2.frequency.setValueAtTime(400, now);
		osc2.frequency.exponentialRampToValueAtTime(30, now + 1.5);
		gain2.gain.setValueAtTime(0, now);
		gain2.gain.linearRampToValueAtTime(0.15, now + 0.2);
		gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
		osc2.connect(gain2);
		gain2.connect(ctx.destination);
		osc2.start(now);
		osc2.stop(now + 1.5);

		// Ruido de distorsión sutil
		const osc3 = ctx.createOscillator();
		const gain3 = ctx.createGain();
		osc3.type = 'square';
		osc3.frequency.setValueAtTime(80, now);
		osc3.frequency.exponentialRampToValueAtTime(20, now + 1.2);
		gain3.gain.setValueAtTime(0, now);
		gain3.gain.linearRampToValueAtTime(0.08, now + 0.1);
		gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
		osc3.connect(gain3);
		gain3.connect(ctx.destination);
		osc3.start(now);
		osc3.stop(now + 1.2);
	} catch {
		// AudioContext not available
	}
}
