import type { StudentSummary } from '$lib/firebase/types';
import type { StatsData } from '$lib/stores/types/game';

/** The shape of progress as stored in localStorage (before sync). */
export interface LocalProgress {
	levelsCompleted: number[];
	stars: Record<number, number>;
	gems: number;
	totalCorrect: number;
	totalAttempts: number;
	totalStars: number;
	stats: StatsData;
	totalPlayTimeMs: number;
	updatedAt: number;
}

/**
 * Fusiona dos resúmenes de progreso en el servidor o cliente.
 * Toma siempre el progreso máximo alcanzado y garantiza que no se pierdan estrellas ni niveles.
 */
export function mergeSummaries(
	base: StudentSummary | null | undefined,
	incoming: StudentSummary
): StudentSummary {
	if (!base) return incoming;

	const levelSet = new Set([...(base.levelsCompleted ?? []), ...(incoming.levelsCompleted ?? [])]);
	const levelsCompleted = Array.from(levelSet).sort((a, b) => a - b);

	const stars: Record<string, number> = {};
	const allKeys = new Set([
		...Object.keys(base.stars ?? {}),
		...Object.keys(incoming.stars ?? {})
	]);
	for (const k of allKeys) {
		stars[String(k)] = Math.max(Number(base.stars?.[k] ?? 0), Number(incoming.stars?.[k] ?? 0));
	}
	const totalStars = Object.values(stars).reduce((s, v) => s + v, 0);

	return {
		levelsCompleted,
		stars,
		totalStars,
		totalCorrect: Math.max(base.totalCorrect ?? 0, incoming.totalCorrect ?? 0),
		totalAttempts: Math.max(base.totalAttempts ?? 0, incoming.totalAttempts ?? 0),
		totalPlayTimeMs: Math.max(base.totalPlayTimeMs ?? 0, incoming.totalPlayTimeMs ?? 0),
		practiceModePlays: Math.max(base.practiceModePlays ?? 0, incoming.practiceModePlays ?? 0)
	};
}

/**
 * Fusiona el estado local (localStorage) con el resumen del servidor.
 * Las gemas y estadísticas locales de gamificación se conservan en el cliente.
 */
export function mergeProgress(
	local: LocalProgress,
	server: (StudentSummary & { updatedAt?: number }) | null
): LocalProgress {
	if (!server) return local;

	const levelSet = new Set([...local.levelsCompleted, ...(server.levelsCompleted ?? [])]);
	const levelsCompleted = Array.from(levelSet).sort((a, b) => a - b);

	const stars: Record<number, number> = {};
	const allLevels = new Set([
		...Object.keys(local.stars).map(Number),
		...Object.keys(server.stars ?? {}).map(Number)
	]);
	for (const lv of allLevels) {
		stars[lv] = Math.max(local.stars[lv] ?? 0, Number(server.stars?.[String(lv)] ?? 0));
	}
	const totalStars = Object.values(stars).reduce((s, v) => s + v, 0);

	const totalCorrect = Math.max(local.totalCorrect, server.totalCorrect ?? 0);
	const totalAttempts = Math.max(local.totalAttempts, server.totalAttempts ?? 0);
	const totalPlayTimeMs = Math.max(local.totalPlayTimeMs ?? 0, server.totalPlayTimeMs ?? 0);
	const practiceModePlays = Math.max(
		local.stats.practiceModePlays,
		server.practiceModePlays ?? 0
	);

	return {
		levelsCompleted,
		stars,
		gems: local.gems,
		totalCorrect,
		totalAttempts,
		totalStars,
		stats: {
			...local.stats,
			practiceModePlays,
			totalPlayTime: Math.floor(totalPlayTimeMs / 1000)
		},
		totalPlayTimeMs,
		updatedAt: Math.max(local.updatedAt ?? 0, server.updatedAt ?? 0)
	};
}
