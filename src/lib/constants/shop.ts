export type PlanetSkin = 'space' | 'jungle' | 'volcano' | 'ocean' | 'ice' | 'neon';

export interface ShopItem {
	id: string;
	name: string;
	category: 'background' | 'theme' | 'frame' | 'accessory' | 'potion';
	price: number;
	description: string;
	uiTheme?: string;
	planetSkin?: PlanetSkin;
	uiPreview?: { bg: string; card: string; accent: string; label: string };
}

/**
 * Mapeo unificado: cada Mundo/Fondo define también su Tema de Interfaz (UI) y la Skin de los planetas del mapa.
 */
export const WORLD_THEME_MAP: Record<
	string,
	{
		backgroundId: string;
		uiTheme: string;
		planetSkin: PlanetSkin;
		uiPreview: { bg: string; card: string; accent: string; label: string };
	}
> = {
	'bg-space': {
		backgroundId: 'bg-space',
		uiTheme: 'default',
		planetSkin: 'space',
		uiPreview: { bg: '#0f0f2a', card: '#252540', accent: '#fbbf24', label: 'UI Cósmica Dorada' }
	},
	'bg-jungle': {
		backgroundId: 'bg-jungle',
		uiTheme: 'theme-forest',
		planetSkin: 'jungle',
		uiPreview: { bg: '#091910', card: '#143321', accent: '#22c55e', label: 'UI Verde Selva' }
	},
	'bg-volcano': {
		backgroundId: 'bg-volcano',
		uiTheme: 'theme-fire',
		planetSkin: 'volcano',
		uiPreview: { bg: '#1f0a0a', card: '#3b1515', accent: '#f97316', label: 'UI Fuego Magma' }
	},
	'bg-ocean': {
		backgroundId: 'bg-ocean',
		uiTheme: 'theme-ocean',
		planetSkin: 'ocean',
		uiPreview: { bg: '#071629', card: '#102a49', accent: '#38bdf8', label: 'UI Azul Océano' }
	},
	'bg-ice': {
		backgroundId: 'bg-ice',
		uiTheme: 'theme-ice',
		planetSkin: 'ice',
		uiPreview: { bg: '#081c24', card: '#123544', accent: '#67e8f9', label: 'UI Cian Glaciar' }
	},
	'bg-neon': {
		backgroundId: 'bg-neon',
		uiTheme: 'theme-neon',
		planetSkin: 'neon',
		uiPreview: { bg: '#160826', card: '#2b1148', accent: '#f43f5e', label: 'UI Neón Eléctrico' }
	},
	// Compatibilidad con IDs antiguos de temas guardados en localStorage
	'theme-forest': {
		backgroundId: 'bg-jungle',
		uiTheme: 'theme-forest',
		planetSkin: 'jungle',
		uiPreview: { bg: '#091910', card: '#143321', accent: '#22c55e', label: 'UI Verde Selva' }
	},
	'theme-fire': {
		backgroundId: 'bg-volcano',
		uiTheme: 'theme-fire',
		planetSkin: 'volcano',
		uiPreview: { bg: '#1f0a0a', card: '#3b1515', accent: '#f97316', label: 'UI Fuego Magma' }
	},
	'theme-ocean': {
		backgroundId: 'bg-ocean',
		uiTheme: 'theme-ocean',
		planetSkin: 'ocean',
		uiPreview: { bg: '#071629', card: '#102a49', accent: '#38bdf8', label: 'UI Azul Océano' }
	},
	'theme-neon': {
		backgroundId: 'bg-neon',
		uiTheme: 'theme-neon',
		planetSkin: 'neon',
		uiPreview: { bg: '#160826', card: '#2b1148', accent: '#f43f5e', label: 'UI Neón Eléctrico' }
	},
	'theme-safari': {
		backgroundId: 'bg-jungle',
		uiTheme: 'theme-forest',
		planetSkin: 'jungle',
		uiPreview: { bg: '#091910', card: '#143321', accent: '#22c55e', label: 'UI Verde Selva' }
	}
};

export function resolveActiveWorldTheme(
	equippedBg: string | null | undefined,
	equippedTheme?: string | null | undefined
) {
	if (equippedBg && WORLD_THEME_MAP[equippedBg]) {
		return WORLD_THEME_MAP[equippedBg];
	}
	if (equippedTheme && WORLD_THEME_MAP[equippedTheme]) {
		return WORLD_THEME_MAP[equippedTheme];
	}
	return {
		backgroundId: equippedBg || '',
		uiTheme: equippedTheme || 'default',
		planetSkin: 'space' as PlanetSkin,
		uiPreview: { bg: '#0f0f2a', card: '#252540', accent: '#fbbf24', label: 'UI Cósmica Dorada' }
	};
}

export const shopItems: ShopItem[] = [
	{
		id: 'bg-jungle',
		name: 'Selva Alienígena',
		category: 'background',
		price: 25,
		description: 'Fondo selvático + Interfaz UI Verde Esmeralda + Planetas de jungla bioluminiscente.',
		uiTheme: 'theme-forest',
		planetSkin: 'jungle',
		uiPreview: WORLD_THEME_MAP['bg-jungle'].uiPreview
	},
	{
		id: 'bg-ocean',
		name: 'Océano de Cristal',
		category: 'background',
		price: 25,
		description: 'Fondo submarino + Interfaz UI Azul Turquesa + Planetas acuáticos y arrecifes.',
		uiTheme: 'theme-ocean',
		planetSkin: 'ocean',
		uiPreview: WORLD_THEME_MAP['bg-ocean'].uiPreview
	},
	{
		id: 'bg-volcano',
		name: 'Volcán Cósmico',
		category: 'background',
		price: 30,
		description: 'Fondo de magma + Interfaz UI Rojo Fuego + Planetas volcánicos de lava.',
		uiTheme: 'theme-fire',
		planetSkin: 'volcano',
		uiPreview: WORLD_THEME_MAP['bg-volcano'].uiPreview
	},
	{
		id: 'bg-ice',
		name: 'Planeta de Hielo',
		category: 'background',
		price: 30,
		description: 'Fondo polar + Interfaz UI Cian Glaciar + Planetas congelados con auroras.',
		uiTheme: 'theme-ice',
		planetSkin: 'ice',
		uiPreview: WORLD_THEME_MAP['bg-ice'].uiPreview
	},
	{
		id: 'bg-neon',
		name: 'Ciudad Neón',
		category: 'background',
		price: 35,
		description: 'Fondo futurista + Interfaz UI Neón Eléctrico + Planetas cyberpunk.',
		uiTheme: 'theme-neon',
		planetSkin: 'neon',
		uiPreview: WORLD_THEME_MAP['bg-neon'].uiPreview
	},
	{
		id: 'bg-space',
		name: 'Espacio Profundo',
		category: 'background',
		price: 20,
		description: 'Nebulosas lejanas + Interfaz UI Cósmica Dorada + Planetas galácticos clásicos.',
		uiTheme: 'default',
		planetSkin: 'space',
		uiPreview: WORLD_THEME_MAP['bg-space'].uiPreview
	},
	{
		id: 'frame-fire',
		name: 'Marco de Fuego',
		category: 'frame',
		price: 15,
		description: 'Borde con llamas para tu avatar.'
	},
	{
		id: 'frame-wood',
		name: 'Marco de Madera',
		category: 'frame',
		price: 15,
		description: 'Borde rústico de madera para tu avatar.'
	},
	{
		id: 'frame-gold',
		name: 'Marco Dorado',
		category: 'frame',
		price: 20,
		description: 'Borde brillante y elegante para tu avatar.'
	},
	{
		id: 'frame-crystal',
		name: 'Marco de Cristal',
		category: 'frame',
		price: 20,
		description: 'Borde transparente y luminoso para tu avatar.'
	},
	{
		id: 'frame-robot',
		name: 'Marco Robótico',
		category: 'frame',
		price: 25,
		description: 'Borde metálico con tornillos para tu avatar.'
	},
	{
		id: 'acc-sunglasses',
		name: 'Gafas de Sol',
		category: 'accessory',
		price: 10,
		description: 'Gafas solares geniales para tu personaje.'
	},
	{
		id: 'acc-hat',
		name: 'Sombrero de Maga',
		category: 'accessory',
		price: 15,
		description: 'Sombrero mágico con estrellas.'
	},
	{
		id: 'acc-crown',
		name: 'Corona Real',
		category: 'accessory',
		price: 20,
		description: 'Corona dorada digna de un rey.'
	},
	{
		id: 'acc-wings',
		name: 'Alas de Fénix',
		category: 'accessory',
		price: 25,
		description: 'Alas brillantes de fuego.'
	},
	{
		id: 'acc-shield',
		name: 'Escudo Cósmico',
		category: 'accessory',
		price: 30,
		description: 'Escudo con energía de las estrellas.'
	},
	{
		id: 'potion-energy',
		name: 'Poción de Energía',
		category: 'potion',
		price: 15,
		description: 'Recarga +50⚡ inmediatamente. Máximo 5 compras (cooldown de 3 min).'
	}
];

export function getShopItemsByCategory(category: ShopItem['category']): ShopItem[] {
	return shopItems.filter((item) => item.category === category);
}

export function getShopItemById(id: string): ShopItem | undefined {
	return shopItems.find((item) => item.id === id);
}

export const shopCategories = [
	{ id: 'background', label: 'Mundos y UI', icon: '🌌' },
	{ id: 'frame', label: 'Marcos', icon: '🖼️' },
	{ id: 'accessory', label: 'Accesorios', icon: '✨' },
	{ id: 'potion', label: 'Pociones', icon: '🧪' }
] as const;
