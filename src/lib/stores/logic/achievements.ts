import type { GameState } from '../types/game';

export interface AchievementCheck {
	id: string;
	condition: (state: GameState) => boolean;
}

export const ACHIEVEMENT_CHECKS: AchievementCheck[] = [
	{ id: 'progress-wood', condition: (s) => s.progress.levelsCompleted.includes(1) },
	{ id: 'progress-bronze', condition: (s) => s.progress.levelsCompleted.includes(9) },
	{ id: 'progress-silver', condition: (s) => s.progress.levelsCompleted.includes(24) },
	{ id: 'progress-gold', condition: (s) => s.progress.levelsCompleted.includes(25) },
	{
		id: 'skill-lightning',
		condition: (s) => s.stats.fastestCorrect > 0 && s.stats.fastestCorrect <= 2000
	},
	{
		id: 'skill-perfection',
		condition: (s) => Object.values(s.progress.stars).some((stars) => stars === 3)
	},
	{ id: 'skill-fire', condition: (s) => s.stats.bestStreak >= 15 },
	{ id: 'collect-5', condition: (s) => s.characters.unlocked.length >= 5 },
	{ id: 'collect-15', condition: (s) => s.characters.unlocked.length >= 15 },
	{ id: 'collect-first-skin', condition: (s) => s.shop.purchased.length >= 1 },
	{ id: 'effort-practice', condition: (s) => s.stats.practiceModePlays >= 10 },
	{ id: 'effort-no-energy', condition: (s) => s.stats.ranOutOfEnergy === true }
];

/**
 * Evalúa todos los logros no ganados y los añade a medals.earned y a la cola de pendientes
 */
export function checkAllAchievements(state: GameState, pendingQueue?: string[]): void {
	for (const { id, condition } of ACHIEVEMENT_CHECKS) {
		if (condition(state) && !state.medals.earned.includes(id)) {
			state.medals.earned.push(id);
			if (pendingQueue && !pendingQueue.includes(id)) {
				pendingQueue.push(id);
			}
		}
	}
}
