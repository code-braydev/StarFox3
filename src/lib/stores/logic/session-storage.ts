import type { StoredSession } from '../types/session';

export const LS_SESSION = 'star-fox-3-session';

export function loadStoredSession(): StoredSession {
	if (typeof window === 'undefined') return {};
	try {
		const raw = localStorage.getItem(LS_SESSION);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

export function saveStoredSession(data: StoredSession): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(LS_SESSION, JSON.stringify(data));
	} catch {
		// Ignorar errores de quota en localStorage
	}
}

export function clearStoredSession(): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(LS_SESSION);
	} catch {
		// ignore
	}
}
