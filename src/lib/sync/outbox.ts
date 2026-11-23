import { getFirebaseAuth, isFirebaseClientConfigured } from '$lib/firebase/client';
import type { AttemptMode, StudentSummary, TelemetryEvent } from '$lib/firebase/types';

const LS_OUTBOX = 'star-fox-3-outbox';
const LS_SESSION_ID = 'star-fox-3-session-id';

function loadOutbox(): TelemetryEvent[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(LS_OUTBOX);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveOutbox(events: TelemetryEvent[]) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(LS_OUTBOX, JSON.stringify(events));
	} catch {
		if (events.length > 10) {
			localStorage.setItem(LS_OUTBOX, JSON.stringify(events.slice(-10)));
		}
	}
}

function getSessionId(): string {
	if (typeof window === 'undefined') return '';
	let id = sessionStorage.getItem(LS_SESSION_ID) || localStorage.getItem(LS_SESSION_ID);
	if (!id) {
		id = crypto.randomUUID();
		sessionStorage.setItem(LS_SESSION_ID, id);
		localStorage.setItem(LS_SESSION_ID, id);
	}
	return id;
}

let flushing = false;

/**
 * Encola un evento en localStorage (funciona offline).
 * Colapsa heartbeats y snapshots redundantes para ahorrar escrituras en Firestore al reconectar.
 */
function enqueue(event: Omit<TelemetryEvent, 'id'>): void {
	const evt = { ...event, id: crypto.randomUUID() } as TelemetryEvent;
	let outbox = loadOutbox();

	if (evt.type === 'session_heartbeat') {
		// Solo conservar el último heartbeat de la sesión actual
		outbox = outbox.filter(
			(e) => !(e.type === 'session_heartbeat' && e.sessionId === evt.sessionId)
		);
	} else if (evt.type === 'progress_snapshot') {
		// Solo conservar el snapshot más reciente (la última fecha gana)
		outbox = outbox.filter((e) => e.type !== 'progress_snapshot');
	}

	outbox.push(evt);
	saveOutbox(outbox);
	flush();
}

/** Envía todos los eventos encolados al servidor cuando hay conexión. */
async function flush(): Promise<void> {
	if (flushing) return;
	if (typeof window === 'undefined') return;
	if (typeof navigator !== 'undefined' && !navigator.onLine) return;
	if (!isFirebaseClientConfigured()) return;

	flushing = true;
	try {
		const outbox = loadOutbox();
		if (outbox.length === 0) return;

		const auth = getFirebaseAuth();
		if (!auth.currentUser) return;
		const idToken = await auth.currentUser.getIdToken();

		const batchSize = 25;
		let offset = 0;
		while (offset < outbox.length) {
			const batch = outbox.slice(offset, offset + batchSize);
			const res = await fetch('/api/telemetry', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${idToken}`
				},
				body: JSON.stringify({ events: batch })
			});

			if (!res.ok) {
				break;
			}

			const remaining = loadOutbox();
			const sentIds = new Set(batch.map((e) => e.id));
			saveOutbox(remaining.filter((e) => !sentIds.has(e.id)));
			offset += batchSize;
		}
	} catch {
		// Queda en localStorage para el próximo intento cuando vuelva la red
	} finally {
		flushing = false;
	}
}

function stringifyStarKeys(stars: Record<number | string, number>): Record<string, number> {
	const out: Record<string, number> = {};
	for (const [k, v] of Object.entries(stars ?? {})) {
		out[String(k)] = Number(v) || 0;
	}
	return out;
}

export const telemetry = {
	/** Inicia o reanuda la sesión activa del navegador. */
	sessionStart(): string {
		const sessionId = getSessionId();
		enqueue({
			type: 'session_start',
			clientTs: Date.now(),
			sessionId,
			userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
		} as Omit<TelemetryEvent, 'id'>);
		return sessionId;
	},

	/** Envía latido de presencia (1 escritura en el servidor). */
	sessionHeartbeat(): void {
		const sessionId = getSessionId();
		enqueue({
			type: 'session_heartbeat',
			clientTs: Date.now(),
			sessionId
		} as Omit<TelemetryEvent, 'id'>);
	},

	/** Registra un intento de nivel o práctica. */
	levelAttempt(data: {
		level: number;
		mode: AttemptMode;
		stars: number;
		correct: number;
		total: number;
		durationMs: number;
		completed: boolean;
		startedAt: number;
	}): void {
		enqueue({
			type: 'level_attempt',
			clientTs: Date.now(),
			...data
		} as Omit<TelemetryEvent, 'id'>);
	},

	/** Envía el resumen actualizado del alumno (solo estadísticas para el profesor). */
	progressSnapshot(input: {
		levelsCompleted: number[];
		stars: Record<number | string, number>;
		totalCorrect: number;
		totalAttempts: number;
		totalStars: number;
		totalPlayTimeMs?: number;
		practiceModePlays?: number;
		stats?: { practiceModePlays?: number; totalPlayTime?: number };
	}): void {
		const summary: StudentSummary = {
			levelsCompleted: [...(input.levelsCompleted ?? [])],
			stars: stringifyStarKeys(input.stars),
			totalStars: input.totalStars ?? 0,
			totalCorrect: input.totalCorrect ?? 0,
			totalAttempts: input.totalAttempts ?? 0,
			totalPlayTimeMs:
				input.totalPlayTimeMs ?? (input.stats?.totalPlayTime ? input.stats.totalPlayTime * 1000 : 0),
			practiceModePlays: input.practiceModePlays ?? input.stats?.practiceModePlays ?? 0
		};

		enqueue({
			type: 'progress_snapshot',
			clientTs: Date.now(),
			progress: summary
		} as Omit<TelemetryEvent, 'id'>);
	},

	flush,
	getSessionId
};

if (typeof window !== 'undefined') {
	window.addEventListener('online', () => {
		flush();
	});
}
