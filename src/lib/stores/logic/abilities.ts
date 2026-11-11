import { getCharacterById } from '$lib/constants/characters';
import { pickRandom, shuffleArray, generateDistractors, type LevelQuestion } from './questions';
import type { LevelAbilityState } from './passives';

export interface ActiveAbilityResult {
	revealedWrong: number[];
	timerBonusSeconds: number;
	resetTimerToMax: boolean;
	freezeSeconds: number;
	highlightCorrect: boolean;
	skipAsCorrect: boolean;
	healHearts: number;
	instantGems: number;
	replacedQuestion: LevelQuestion | null;
	foxyMessage: string;
}

/**
 * Ejecuta la habilidad activa del personaje seleccionado sobre la pregunta actual.
 */
export function executeActiveAbility(
	characterId: string,
	currentQ: LevelQuestion,
	currentRevealedWrong: number[],
	abilityState: LevelAbilityState
): ActiveAbilityResult {
	const char = getCharacterById(characterId);
	const effect = char?.active.effect ?? 'reveal_one_wrong';

	const result: ActiveAbilityResult = {
		revealedWrong: [...currentRevealedWrong],
		timerBonusSeconds: 0,
		resetTimerToMax: false,
		freezeSeconds: 0,
		highlightCorrect: false,
		skipAsCorrect: false,
		healHearts: 0,
		instantGems: 0,
		replacedQuestion: null,
		foxyMessage: `¡${char?.active.name ?? 'Habilidad'} activada!`
	};

	const availableWrong = currentQ.options.filter(
		(o) => o !== currentQ.answer && !result.revealedWrong.includes(o)
	);

	const discardOneWrong = () => {
		if (availableWrong.length > 0) {
			result.revealedWrong.push(pickRandom(availableWrong));
		}
	};

	switch (effect) {
		case 'reveal_one_wrong': {
			// Foxy: Radar Cósmico (Descarta 1 errónea + 5s)
			discardOneWrong();
			result.timerBonusSeconds = 5;
			result.foxyMessage = '🦊 Radar Cósmico: ¡1 opción falsa descartada y +5s al reloj!';
			break;
		}

		case 'show_hint_and_discard': {
			// Rex: Olfato Guía (Pista táctica + descarta 1 incorrecta)
			discardOneWrong();
			result.foxyMessage = `🐕 Olfato Guía: Recuerda que ${currentQ.a} × ${currentQ.b} es sumar ${currentQ.b} veces ${currentQ.a} (${currentQ.a * (currentQ.b - 1)} + ${currentQ.a}).`;
			break;
		}

		case 'remove_one_distractor': {
			// Luna: Ojo Felino (Descarta 1 distractor + 3 gemas)
			discardOneWrong();
			result.instantGems = 3;
			result.foxyMessage = '🐱 Ojo Felino: ¡Distractor eliminado y +3 💎 ganadas!';
			break;
		}

		case 'highlight_correct_2s': {
			// Astro: Cálculo Preciso (Resalta la respuesta correcta)
			result.highlightCorrect = true;
			result.foxyMessage = `🤖 Cálculo Preciso: ¡La coordenada exacta es ${currentQ.answer}!`;
			break;
		}

		case 'skip_question_correct': {
			// Nova: Aliento Ígneo (Salta la pregunta y la da por correcta)
			result.skipAsCorrect = true;
			result.foxyMessage = '🐉 ¡Aliento Ígneo! Pregunta superada automáticamente.';
			break;
		}

		case 'freeze_timer_10s': {
			// Pip: Turbulencia (Congela el reloj 10s)
			result.freezeSeconds = 10;
			result.foxyMessage = '🐿️ Turbulencia activada: ¡Reloj congelado por 10 segundos!';
			break;
		}

		case 'reset_question_timer': {
			// Tusk: Glaciar (Reinicia el reloj y suma +10s)
			result.resetTimerToMax = true;
			result.timerBonusSeconds = 10;
			result.foxyMessage = '🦭 Glaciar: ¡Reloj restaurado al máximo con +10s extra!';
			break;
		}

		case 'double_gems_3q': {
			// Gizmo: Fiebre de Oro (+2 gemas en los próximos 3 aciertos)
			abilityState.doubleGemsCharges = 3;
			result.foxyMessage = '🦝 Fiebre de Oro: ¡Tus próximos 3 aciertos darán +2 💎 extra cada uno!';
			break;
		}

		case 'evade_next_error': {
			// Sly: Emboscada (Escudo contra el próximo fallo)
			abilityState.evadeNextErrorCharges += 1;
			result.foxyMessage = '🦎 Emboscada lista: ¡Tu próximo error no te quitará corazón!';
			break;
		}

		case 'protect_stars_2q': {
			// Brutus: Muro Férreo (Protege las estrellas de los próximos 2 errores)
			abilityState.protectStarsCharges = 2;
			result.foxyMessage = '🐻 Muro Férreo: ¡Tus próximos 2 errores no reducirán tus estrellas!';
			break;
		}

		case 'heal_one_heart': {
			// Vortex: Curación Acuática (+1 corazón o escudo si está lleno)
			result.healHearts = 1;
			abilityState.evadeNextErrorCharges += 1;
			result.foxyMessage = '🦎 Curación Acuática: ¡+1 ❤️ recuperado y escudo protector activo!';
			break;
		}

		case 'swap_question_easier': {
			// Kira: Instinto (Cambia la pregunta por una sencilla ×2)
			const easyA = currentQ.a;
			const easyB = 2;
			const easyAnswer = easyA * easyB;
			const distractors = generateDistractors(easyAnswer, easyA, easyB);
			result.replacedQuestion = {
				a: easyA,
				b: easyB,
				answer: easyAnswer,
				options: shuffleArray([easyAnswer, ...distractors]),
				questionType: 'multiply',
				displayPrompt: `${easyA} × ${easyB}`,
				displayResult: '?'
			};
			result.revealedWrong = [];
			result.foxyMessage = `⚡ Instinto de Lince: ¡Pregunta cambiada por ${easyA} × ${easyB}!`;
			break;
		}

		case 'reduce_to_2_options': {
			// Fang: Constricción (Descarta 1 en esta pregunta y 1 en la siguiente)
			discardOneWrong();
			abilityState.discardOnNextQuestion = true;
			result.foxyMessage =
				'🐍 Constricción: ¡Opción falsa eliminada ahora y también en la siguiente ronda!';
			break;
		}

		case 'highlight_2_probable': {
			// Echo: Eco Sónico (Descarta 1 incorrecta + congela el reloj 6s)
			discardOneWrong();
			result.freezeSeconds = 6;
			result.foxyMessage = '🦇 Eco Sónico: ¡1 opción descartada y reloj pausado por 6s!';
			break;
		}

		case 'burn_2_wrong': {
			// Blaze: Llamarada (Quema todas las respuestas incorrectas)
			result.revealedWrong = currentQ.options.filter((o) => o !== currentQ.answer);
			result.foxyMessage = '🔥 ¡Llamarada Fénix! Todas las respuestas falsas han sido quemadas.';
			break;
		}
	}

	return result;
}
