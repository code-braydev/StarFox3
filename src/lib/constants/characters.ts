import { ASSET_PATHS } from './assets';

export type PassiveEffectId =
	| 'gem_bonus_10'
	| 'retry_first_error'
	| 'gems_for_speed'
	| 'energy_max_300'
	| 'gems_scale_with_streak'
	| 'timer_slow_15'
	| 'timer_emergency_3s'
	| 'shop_discount_plus_gems'
	| 'protect_streak_first_error'
	| 'first_error_no_damage'
	| 'heal_on_streak_5'
	| 'double_gems_perfect'
	| 'faint_wrong_border'
	| 'reveal_question_types'
	| 'auto_revive';

export type ActiveEffectId =
	| 'reveal_one_wrong'
	| 'show_hint_and_discard'
	| 'remove_one_distractor'
	| 'highlight_correct_2s'
	| 'skip_question_correct'
	| 'freeze_timer_10s'
	| 'reset_question_timer'
	| 'double_gems_3q'
	| 'evade_next_error'
	| 'protect_stars_2q'
	| 'heal_one_heart'
	| 'swap_question_easier'
	| 'reduce_to_2_options'
	| 'highlight_2_probable'
	| 'burn_2_wrong';

export interface CharacterPassive {
	name: string;
	description: string;
	effect: PassiveEffectId;
}

export interface CharacterActive {
	name: string;
	description: string;
	effect: ActiveEffectId;
	cooldownType: 'level' | 'real';
	cooldownMinutes?: number;
}

export interface Character {
	id: string;
	name: string;
	animal: string;
	element: string;
	role: string;
	unlockType: 'free' | 'stars' | 'gems' | 'level';
	unlockValue: number;
	passive: CharacterPassive;
	active: CharacterActive;
}

export const characters: Character[] = [
	{
		id: 'foxy',
		name: 'Foxy',
		animal: 'Zorro',
		element: 'Estrella',
		role: 'Estratega',
		unlockType: 'free',
		unlockValue: 0,
		passive: {
			name: 'Astucia',
			description: '+10% de gemas ganadas al completar cada nivel.',
			effect: 'gem_bonus_10'
		},
		active: {
			name: 'Radar Cósmico',
			description: 'Descarta 1 respuesta incorrecta y añade +5s al reloj.',
			effect: 'reveal_one_wrong',
			cooldownType: 'level'
		}
	},
	{
		id: 'rex',
		name: 'Rex',
		animal: 'Perro',
		element: 'Tierra',
		role: 'Guardián',
		unlockType: 'stars',
		unlockValue: 12,
		passive: {
			name: 'Lealtad',
			description: 'El 1er error del nivel no resta vida y te deja reintentar la pregunta.',
			effect: 'retry_first_error'
		},
		active: {
			name: 'Olfato Guía',
			description: 'Muestra una pista táctica en el monitor y descarta 1 opción incorrecta.',
			effect: 'show_hint_and_discard',
			cooldownType: 'level'
		}
	},
	{
		id: 'luna',
		name: 'Luna',
		animal: 'Gato',
		element: 'Luna',
		role: 'Cazadora',
		unlockType: 'stars',
		unlockValue: 18,
		passive: {
			name: 'Reflejo Nocturno',
			description: 'Si respondes en menos de 5 segundos, ganas +1 💎 extra al instante.',
			effect: 'gems_for_speed'
		},
		active: {
			name: 'Ojo Felino',
			description: 'Elimina 1 opción incorrecta y otorga +3 💎 de inmediato.',
			effect: 'remove_one_distractor',
			cooldownType: 'level'
		}
	},
	{
		id: 'astro',
		name: 'Astro',
		animal: 'Robot',
		element: 'Metal',
		role: 'Lógico',
		unlockType: 'level',
		unlockValue: 10,
		passive: {
			name: 'Batería Optimizada',
			description: '+20% de energía máxima (250 → 300).',
			effect: 'energy_max_300'
		},
		active: {
			name: 'Cálculo Preciso',
			description: 'Resalta la respuesta correcta en el tablero durante 3 segundos.',
			effect: 'highlight_correct_2s',
			cooldownType: 'level'
		}
	},
	{
		id: 'nova',
		name: 'Nova',
		animal: 'Dragón',
		element: 'Fuego',
		role: 'Destructor',
		unlockType: 'gems',
		unlockValue: 50,
		passive: {
			name: 'Furia',
			description: 'Cada 3 aciertos seguidos te da +1 💎 extra (+20% con 3 estrellas).',
			effect: 'gems_scale_with_streak'
		},
		active: {
			name: 'Aliento Ígneo',
			description: 'Destruye la pregunta actual y la cuenta automáticamente como correcta.',
			effect: 'skip_question_correct',
			cooldownType: 'level'
		}
	},
	{
		id: 'pip',
		name: 'Pip',
		animal: 'Ardilla Voladora',
		element: 'Aire',
		role: 'Veloz',
		unlockType: 'stars',
		unlockValue: 25,
		passive: {
			name: 'Vuelo Rápido',
			description: 'Dispones de un 20% más de tiempo en todas las preguntas del nivel.',
			effect: 'timer_slow_15'
		},
		active: {
			name: 'Turbulencia',
			description: 'Congela el temporizador durante 10 segundos.',
			effect: 'freeze_timer_10s',
			cooldownType: 'level'
		}
	},
	{
		id: 'tusk',
		name: 'Tusk',
		animal: 'Morsa',
		element: 'Hielo',
		role: 'Resistente',
		unlockType: 'stars',
		unlockValue: 35,
		passive: {
			name: 'Piel de Hielo',
			description:
				'Cuando el reloj llega a 0, te otorga +5 segundos extra de gracia (1 vez/nivel).',
			effect: 'timer_emergency_3s'
		},
		active: {
			name: 'Glaciar',
			description: 'Reinicia el reloj de la pregunta actual y añade +10 segundos extra.',
			effect: 'reset_question_timer',
			cooldownType: 'level'
		}
	},
	{
		id: 'gizmo',
		name: 'Gizmo',
		animal: 'Mapache',
		element: 'Bosque',
		role: 'Comerciante',
		unlockType: 'gems',
		unlockValue: 50,
		passive: {
			name: 'Negociante',
			description: '15% de descuento en la tienda + 1 💎 extra por acierto.',
			effect: 'shop_discount_plus_gems'
		},
		active: {
			name: 'Fiebre de Oro',
			description: 'Las próximas 3 respuestas correctas otorgan +2 💎 extra al instante.',
			effect: 'double_gems_3q',
			cooldownType: 'level'
		}
	},
	{
		id: 'sly',
		name: 'Sly',
		animal: 'Camaleón',
		element: 'Sombra',
		role: 'Pícaro',
		unlockType: 'stars',
		unlockValue: 42,
		passive: {
			name: 'Camuflaje',
			description: 'El primer error del nivel no rompe tu racha de aciertos.',
			effect: 'protect_streak_first_error'
		},
		active: {
			name: 'Emboscada',
			description: 'Activa un escudo: tu próximo error no restará corazón.',
			effect: 'evade_next_error',
			cooldownType: 'level'
		}
	},
	{
		id: 'brutus',
		name: 'Brutus',
		animal: 'Oso Pardo',
		element: 'Tierra',
		role: 'Fuerza',
		unlockType: 'stars',
		unlockValue: 58,
		passive: {
			name: 'Piel Dura',
			description: 'El 1er error del nivel no resta corazón.',
			effect: 'first_error_no_damage'
		},
		active: {
			name: 'Muro Férreo',
			description: 'Los próximos 2 errores no afectan la calificación de estrellas.',
			effect: 'protect_stars_2q',
			cooldownType: 'level'
		}
	},
	{
		id: 'vortex',
		name: 'Vortex',
		animal: 'Axolote',
		element: 'Agua',
		role: 'Regeneración',
		unlockType: 'gems',
		unlockValue: 95,
		passive: {
			name: 'Flujo',
			description:
				'Al alcanzar una racha de 5 aciertos seguidos, recuperas 1 corazón (1 vez/nivel).',
			effect: 'heal_on_streak_5'
		},
		active: {
			name: 'Curación Acuática',
			description: 'Recupera 1 corazón de inmediato (o activa escudo si tienes vida máxima).',
			effect: 'heal_one_heart',
			cooldownType: 'level'
		}
	},
	{
		id: 'kira',
		name: 'Kira',
		animal: 'Lince',
		element: 'Rayo',
		role: 'Puntería',
		unlockType: 'gems',
		unlockValue: 65,
		passive: {
			name: 'Precisión de Lince',
			description: 'Si completas el nivel sin errores, las gemas ganadas valen el doble.',
			effect: 'double_gems_perfect'
		},
		active: {
			name: 'Instinto',
			description: 'Cambia la pregunta actual por una multiplicación sencilla (×1 o ×2).',
			effect: 'swap_question_easier',
			cooldownType: 'level'
		}
	},
	{
		id: 'fang',
		name: 'Fang',
		animal: 'Cobra',
		element: 'Veneno',
		role: 'Control',
		unlockType: 'gems',
		unlockValue: 120,
		passive: {
			name: 'Sangre Fría',
			description:
				'Al iniciar el nivel, la primera pregunta ya tiene 1 opción incorrecta descartada.',
			effect: 'faint_wrong_border'
		},
		active: {
			name: 'Constricción',
			description: 'Descarta 1 opción incorrecta en esta pregunta y también en la siguiente.',
			effect: 'reduce_to_2_options',
			cooldownType: 'level'
		}
	},
	{
		id: 'echo',
		name: 'Echo',
		animal: 'Murciélago Cyborg',
		element: 'Sonido',
		role: 'Inteligencia',
		unlockType: 'level',
		unlockValue: 16,
		passive: {
			name: 'Ecolocalización',
			description: 'El monitor revela una pista matemática sobre el resultado en cada ronda.',
			effect: 'reveal_question_types'
		},
		active: {
			name: 'Eco Sónico',
			description: 'Descarta 1 opción incorrecta y congela el reloj durante 6 segundos.',
			effect: 'highlight_2_probable',
			cooldownType: 'level'
		}
	},
	{
		id: 'blaze',
		name: 'Blaze',
		animal: 'Fénix',
		element: 'Fuego',
		role: 'Renacimiento',
		unlockType: 'gems',
		unlockValue: 180,
		passive: {
			name: 'Renacer',
			description:
				'Si pierdes el nivel (0 corazones), revives automáticamente con 1 corazón (1 vez/nivel).',
			effect: 'auto_revive'
		},
		active: {
			name: 'Llamarada',
			description: 'Quema y elimina todas las respuestas incorrectas de la pregunta actual.',
			effect: 'burn_2_wrong',
			cooldownType: 'level'
		}
	}
];

export function getCharacterById(id: string): Character | undefined {
	return characters.find((c) => c.id === id);
}

export function getCharactersByUnlockMethod(method: Character['unlockType']): Character[] {
	return characters.filter((c) => c.unlockType === method);
}

export function getTotalStarsNeeded(): number {
	return characters
		.filter((c) => c.unlockType === 'stars')
		.reduce((sum, c) => sum + c.unlockValue, 0);
}

export function getTotalGemsNeeded(): number {
	return characters
		.filter((c) => c.unlockType === 'gems')
		.reduce((sum, c) => sum + c.unlockValue, 0);
}

export function getCharacterHead(id: string): string {
	return ASSET_PATHS.characters.head(id);
}

export function getCharacterBody(id: string): string {
	return ASSET_PATHS.characters.body(id);
}
