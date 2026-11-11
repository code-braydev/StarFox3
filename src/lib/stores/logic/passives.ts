import { getCharacterById } from '$lib/constants/characters';
import { pickRandom, type LevelQuestion } from './questions';

/**
 * Estado táctico de habilidades pasivas y activas durante un nivel.
 */
export interface LevelAbilityState {
	firstErrorUsed: boolean;
	tuskEmergencyUsed: boolean;
	vortexHealUsed: boolean;
	blazeReviveUsed: boolean;
	levelStreak: number;
	evadeNextErrorCharges: number;
	protectStarsCharges: number;
	protectedErrorsCount: number;
	doubleGemsCharges: number;
	discardOnNextQuestion: boolean;
	freezeTimerSeconds: number;
	highlightCorrectOption: boolean;
}

export function createLevelAbilityState(): LevelAbilityState {
	return {
		firstErrorUsed: false,
		tuskEmergencyUsed: false,
		vortexHealUsed: false,
		blazeReviveUsed: false,
		levelStreak: 0,
		evadeNextErrorCharges: 0,
		protectStarsCharges: 0,
		protectedErrorsCount: 0,
		doubleGemsCharges: 0,
		discardOnNextError: false
	} as unknown as LevelAbilityState;
}

export function initLevelAbilityState(): LevelAbilityState {
	return {
		firstErrorUsed: false,
		tuskEmergencyUsed: false,
		vortexHealUsed: false,
		blazeReviveUsed: false,
		levelStreak: 0,
		evadeNextErrorCharges: 0,
		protectStarsCharges: 0,
		protectedErrorsCount: 0,
		doubleGemsCharges: 0,
		discardOnNextQuestion: false,
		freezeTimerSeconds: 0,
		highlightCorrectOption: false
	};
}

/**
 * Calcula las gemas obtenidas al completar un nivel considerando
 * las habilidades pasivas del personaje seleccionado.
 */
export function calculateLevelGems(
	characterId: string,
	correctCount: number,
	totalQuestions: number,
	starsEarned: number
): number {
	let gems = correctCount;

	switch (characterId) {
		case 'foxy':
			gems = Math.round(gems * 1.1);
			break;
		case 'nova':
			if (starsEarned === 3) {
				gems = Math.round(gems * 1.2);
			}
			break;
		case 'gizmo':
			gems += correctCount;
			break;
		case 'kira':
			if (correctCount === totalQuestions && totalQuestions > 0) {
				gems *= 2;
			}
			break;
	}

	return gems;
}

/**
 * Aplica el descuento de tienda de Gizmo (-15%).
 */
export function getEffectiveShopPrice(basePrice: number, characterId: string): number {
	const char = getCharacterById(characterId);
	if (char?.passive.effect === 'shop_discount_plus_gems') {
		return Math.max(1, Math.round(basePrice * 0.85));
	}
	return basePrice;
}

/**
 * Aplica el bono de tiempo de Pip (+20% de tiempo por pregunta).
 */
export function getEffectiveLevelTimer(baseTimer: number, characterId: string): number {
	if (baseTimer <= 0) return 0;
	const char = getCharacterById(characterId);
	if (char?.passive.effect === 'timer_slow_15') {
		return Math.ceil(baseTimer * 1.2);
	}
	return baseTimer;
}

/**
 * Genera el mensaje inicial o de pista pasiva para la pregunta actual (Echo / Fang).
 */
export function applyQuestionStartPassives(
	characterId: string,
	question: LevelQuestion | undefined,
	questionIndex: number,
	abilityState: LevelAbilityState,
	defaultDialog: string
): { revealedWrong: number[]; foxyMessage: string } {
	if (!question) {
		return { revealedWrong: [], foxyMessage: defaultDialog };
	}

	const char = getCharacterById(characterId);
	const revealedWrong: number[] = [];
	let foxyMessage = defaultDialog;

	// Fang (pasiva en pregunta 0) o Constricción activa (en la siguiente pregunta)
	if (
		(char?.passive.effect === 'faint_wrong_border' && questionIndex === 0) ||
		abilityState.discardOnNextQuestion
	) {
		abilityState.discardOnNextQuestion = false;
		const wrongOptions = question.options.filter((o) => o !== question.answer);
		if (wrongOptions.length > 0) {
			revealedWrong.push(pickRandom(wrongOptions));
		}
	}

	// Echo: Ecolocalización revela pista del resultado
	if (char?.passive.effect === 'reveal_question_types') {
		const parity = question.answer % 2 === 0 ? 'PAR' : 'IMPAR';
		foxyMessage = `📡 Ecolocalización: la respuesta de ${question.a} × ${question.b} es un número ${parity}.`;
	}

	return { revealedWrong, foxyMessage };
}
