import type { GameState } from '../types/game';
import { defaultGameState } from '../types/game';

export const STORAGE_KEY = 'star-fox-3-game';

/**
 * Migra estructuras de versiones anteriores de guardado a la actual
 */
export function migrateOldState(raw: Record<string, unknown>): GameState {
	const migrated: GameState = {
		...defaultGameState,
		player: { ...defaultGameState.player },
		progress: { ...defaultGameState.progress },
		hearts: { ...defaultGameState.hearts },
		energy: { ...defaultGameState.energy },
		characters: { ...defaultGameState.characters },
		shop: {
			...defaultGameState.shop,
			equipped: { ...defaultGameState.shop.equipped }
		},
		medals: { ...defaultGameState.medals },
		stats: { ...defaultGameState.stats },
		settings: { ...defaultGameState.settings }
	};

	if (raw.player) {
		const oldPlayer = raw.player as Record<string, unknown>;
		migrated.player = {
			name: (oldPlayer.name as string) || '',
			avatar:
				(oldPlayer.gender as string) === 'boy'
					? 'foxy'
					: (oldPlayer.gender as string) === 'girl'
						? 'luna'
						: 'foxy',
			goal: (oldPlayer.goal as string) || ''
		};
	}

	if (raw.progress) {
		const oldProgress = raw.progress as Record<string, unknown>;
		const stars = (oldProgress.stars as Record<number, number>) ?? {};
		const totalStars = Object.values(stars).reduce((sum, s) => sum + (Number(s) || 0), 0);
		migrated.progress = {
			levelsCompleted: (oldProgress.tablesCompleted as number[]) ?? [],
			stars,
			gems: (oldProgress.gems as number) ?? 0,
			totalCorrect: (oldProgress.totalCorrect as number) ?? 0,
			totalAttempts: (oldProgress.totalAttempts as number) ?? 0,
			totalStars,
			totalPlayTimeMs: 0,
			updatedAt: 0
		};
	}

	if (typeof raw.soundEnabled === 'boolean') {
		migrated.settings.soundEnabled = raw.soundEnabled;
	}
	if (typeof raw.introSeen === 'boolean') {
		migrated.introSeen = raw.introSeen;
	}

	return migrated;
}

/**
 * Carga el estado del juego desde localStorage con migraciones automáticas
 */
export function loadGameState(): GameState {
	if (typeof window === 'undefined') return { ...defaultGameState };
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			const state: GameState = parsed.progress?.tablesCompleted
				? migrateOldState(parsed)
				: { ...defaultGameState, ...parsed };

			if (state.progress) {
				const stars = (state.progress.stars as Record<number, number>) ?? {};
				state.progress.totalStars = Object.values(stars).reduce(
					(sum, s) => sum + (Number(s) || 0),
					0
				);
				if (state.progress.totalPlayTimeMs === undefined) state.progress.totalPlayTimeMs = 0;
				if (state.progress.updatedAt === undefined) state.progress.updatedAt = 0;
			}
			if (state.shop) {
				if (state.shop.potionPurchases === undefined) state.shop.potionPurchases = 0;
				if (state.shop.lastPotionPurchasedAt === undefined) state.shop.lastPotionPurchasedAt = 0;
			}
			return state;
		}
	} catch {
		// Fallback silencioso a default
	}
	return { ...defaultGameState };
}

/**
 * Persiste el estado actual del juego en localStorage
 */
export function saveGameState(state: GameState): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Ignorar si el almacenamiento local está bloqueado o lleno
	}
}
