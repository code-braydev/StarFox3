export interface CharacterPassive {
	name: string;
	description: string;
	effect: string;
}

export interface CharacterActive {
	name: string;
	description: string;
	effect: string;
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
			description: '+10% de gemas ganadas permanentemente.',
			effect: 'gem_bonus_10'
		},
		active: {
			name: 'Radar Cósmico',
			description: 'Revela 1 respuesta errónea al instante.',
			effect: 'reveal_one_wrong',
			cooldownType: 'real',
			cooldownMinutes: 15
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
			description: 'El 1er error del nivel te permite reintentar la misma pregunta.',
			effect: 'retry_first_error'
		},
		active: {
			name: 'Olfato',
			description: 'Tras un error, muestra la respuesta correcta.',
			effect: 'show_correct_after_error',
			cooldownType: 'level',
			cooldownMinutes: 0
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
			description: 'Si respondes en menos de 5s, ganas +1 gema extra.',
			effect: 'gems_for_speed'
		},
		active: {
			name: 'Ojo Felino',
			description: 'Elimina 1 distractor a elección.',
			effect: 'remove_one_distractor',
			cooldownType: 'level',
			cooldownMinutes: 0
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
			description: 'Resalta la respuesta correcta por 2 segundos.',
			effect: 'highlight_correct_2s',
			cooldownType: 'real',
			cooldownMinutes: 20
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
			description: 'Cada acierto consecutivo (racha) aumenta las gemas que da cada pregunta.',
			effect: 'gems_scale_with_streak'
		},
		active: {
			name: 'Aliento',
			description: 'Salta 1 pregunta y la cuenta como correcta.',
			effect: 'skip_question_correct',
			cooldownType: 'real',
			cooldownMinutes: 30
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
			description: 'El temporizador global corre un 15% más lento en todo el nivel.',
			effect: 'timer_slow_15'
		},
		active: {
			name: 'Turbulencia',
			description: 'Congela el tiempo 10 segundos.',
			effect: 'freeze_timer_10s',
			cooldownType: 'level',
			cooldownMinutes: 0
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
				'Cuando el temporizador llega a 0, se pausa y te da 3 segundos de gracia (1 vez/nivel).',
			effect: 'timer_emergency_3s'
		},
		active: {
			name: 'Glaciar',
			description: 'Reinicia el reloj de la pregunta actual.',
			effect: 'reset_question_timer',
			cooldownType: 'level',
			cooldownMinutes: 0
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
			description: '15% de descuento en la tienda + 1 gema extra por acierto.',
			effect: 'shop_discount_plus_gems'
		},
		active: {
			name: 'Fiebre de Oro',
			description: 'Duplica las gemas obtenidas en las próximas 3 preguntas.',
			effect: 'double_gems_3q',
			cooldownType: 'level',
			cooldownMinutes: 0
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
			description: 'El próximo error no resta corazón (evita 1 daño).',
			effect: 'evade_next_error',
			cooldownType: 'level',
			cooldownMinutes: 0
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
			name: 'Muro',
			description: 'Los próximos 2 errores no afectan la calificación de estrellas.',
			effect: 'protect_stars_2q',
			cooldownType: 'level',
			cooldownMinutes: 0
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
			name: 'Curación',
			description: 'Recupera 1 corazón perdido de inmediato.',
			effect: 'heal_one_heart',
			cooldownType: 'level',
			cooldownMinutes: 0
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
			description: 'Si respondes sin errores previos en el nivel, las gemas valen el doble.',
			effect: 'double_gems_perfect'
		},
		active: {
			name: 'Instinto',
			description: 'Cambia la pregunta actual por otra diferente (más fácil).',
			effect: 'swap_question_easier',
			cooldownType: 'level',
			cooldownMinutes: 0
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
				'Las opciones incorrectas aparecen con un borde más tenue (descarte visual sutil).',
			effect: 'faint_wrong_border'
		},
		active: {
			name: 'Constricción',
			description: 'Reduce inmediatamente las opciones disponibles a solo 2.',
			effect: 'reduce_to_2_options',
			cooldownType: 'level',
			cooldownMinutes: 0
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
			description: 'Al iniciar el nivel, se te revela el tipo de pregunta de todas las rondas.',
			effect: 'reveal_question_types'
		},
		active: {
			name: 'Eco',
			description: 'Destaca visualmente las 2 respuestas más probables.',
			effect: 'highlight_2_probable',
			cooldownType: 'real',
			cooldownMinutes: 20
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
			description: 'Quema y elimina 2 respuestas incorrectas de golpe.',
			effect: 'burn_2_wrong',
			cooldownType: 'real',
			cooldownMinutes: 30
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
