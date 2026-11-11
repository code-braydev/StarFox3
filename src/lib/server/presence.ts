import type { PresenceStatus } from '$lib/firebase/types';

/** Un alumno se considera "jugando ahora" si envió señal hace menos de 2 minutos. */
export const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function getPresenceStatus(
	lastSeenAt: number | null | undefined,
	now = Date.now()
): PresenceStatus {
	if (!lastSeenAt || lastSeenAt <= 0) {
		return 'never';
	}
	if (now - lastSeenAt <= ONLINE_THRESHOLD_MS) {
		return 'online';
	}
	const seenDate = new Date(lastSeenAt);
	const nowDate = new Date(now);
	const isSameDay =
		seenDate.getFullYear() === nowDate.getFullYear() &&
		seenDate.getMonth() === nowDate.getMonth() &&
		seenDate.getDate() === nowDate.getDate();

	if (isSameDay) {
		return 'today';
	}
	return 'idle';
}
