export interface Medal {
	id: string;
	name: string;
	category: 'progress' | 'skill' | 'collection' | 'effort';
	description: string;
	icon: string;
	condition: string;
}

export const medals: Medal[] = [
	{
		id: 'progress-wood',
		name: 'Medalla de Madera',
		category: 'progress',
		description: 'Completar el Nivel 1 (Tutorial).',
		icon: '🪵',
		condition: 'complete_level_1'
	},
	{
		id: 'progress-bronze',
		name: 'Medalla de Bronce',
		category: 'progress',
		description: 'Completar el Nivel 9.',
		icon: '🥉',
		condition: 'complete_level_9'
	},
	{
		id: 'progress-silver',
		name: 'Medalla de Plata',
		category: 'progress',
		description: 'Completar la Fase 3 (Nivel 24).',
		icon: '🥈',
		condition: 'complete_level_24'
	},
	{
		id: 'progress-gold',
		name: 'Medalla de Oro',
		category: 'progress',
		description: 'Completar el juego (Nivel 25).',
		icon: '🥇',
		condition: 'complete_level_25'
	},
	{
		id: 'skill-lightning',
		name: 'Medalla Relámpago',
		category: 'skill',
		description: 'Responder correctamente en menos de 2 segundos.',
		icon: '⚡',
		condition: 'answer_under_2s'
	},
	{
		id: 'skill-perfection',
		name: 'Medalla de Perfección',
		category: 'skill',
		description: 'Completar un nivel sin errores (3 corazones).',
		icon: '💎',
		condition: 'perfect_level'
	},
	{
		id: 'skill-fire',
		name: 'Medalla de Fuego',
		category: 'skill',
		description: 'Lograr 15 aciertos seguidos.',
		icon: '🔥',
		condition: 'streak_15'
	},
	{
		id: 'collect-5',
		name: 'Medalla Coleccionista',
		category: 'collection',
		description: 'Tener 5 personajes desbloqueados.',
		icon: '🎯',
		condition: 'own_5_characters'
	},
	{
		id: 'collect-15',
		name: 'Medalla Platino',
		category: 'collection',
		description: 'Tener los 15 personajes desbloqueados.',
		icon: '👑',
		condition: 'own_15_characters'
	},
	{
		id: 'collect-first-skin',
		name: 'Primera Compra',
		category: 'collection',
		description: 'Comprar tu primer cosmético.',
		icon: '🛍️',
		condition: 'buy_first_cosmetic'
	},
	{
		id: 'effort-practice',
		name: 'Medalla de Práctica',
		category: 'effort',
		description: 'Jugar 10 veces en Modo Práctica.',
		icon: '📚',
		condition: 'play_10_practice'
	},
	{
		id: 'effort-no-energy',
		name: 'Sin Combustible',
		category: 'effort',
		description: 'Quedarse sin energía por primera vez.',
		icon: '⛽',
		condition: 'run_out_of_energy'
	}
];

export function getMedalById(id: string): Medal | undefined {
	return medals.find((m) => m.id === id);
}

export function getMedalsByCategory(category: Medal['category']): Medal[] {
	return medals.filter((m) => m.category === category);
}

export const medalCategories = [
	{ id: 'progress', label: 'Progreso', icon: '🏆' },
	{ id: 'skill', label: 'Habilidad', icon: '⚡' },
	{ id: 'collection', label: 'Coleccionismo', icon: '🎯' },
	{ id: 'effort', label: 'Esfuerzo', icon: '💪' }
] as const;
