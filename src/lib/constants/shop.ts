export interface ShopItem {
	id: string;
	name: string;
	category: 'background' | 'theme' | 'frame' | 'accessory' | 'potion';
	price: number;
	description: string;
}

export const shopItems: ShopItem[] = [
	{
		id: 'bg-space',
		name: 'Espacio Profundo',
		category: 'background',
		price: 20,
		description: 'Fondo con estrellas nebulosas y galaxias lejanas.'
	},
	{
		id: 'bg-jungle',
		name: 'Selva Alienígena',
		category: 'background',
		price: 25,
		description: 'Fondo con plantas bioluminiscentes y criaturas exóticas.'
	},
	{
		id: 'bg-volcano',
		name: 'Volcán Cósmico',
		category: 'background',
		price: 30,
		description: 'Fondo con lava estelar y erupciones de color.'
	},
	{
		id: 'bg-ocean',
		name: 'Océano de Cristal',
		category: 'background',
		price: 25,
		description: 'Fondo con corales cósmicos y burbujas de luz.'
	},
	{
		id: 'bg-ice',
		name: 'Planeta de Hielo',
		category: 'background',
		price: 30,
		description: 'Fondo con montañas de hielo y auroras boreales.'
	},
	{
		id: 'bg-neon',
		name: 'Ciudad Neón',
		category: 'background',
		price: 35,
		description: 'Fondo con luces de neón y rascacielos futuristas.'
	},
	{
		id: 'theme-safari',
		name: 'Estilo Safari',
		category: 'theme',
		price: 30,
		description: 'Colores tierra y marrón para la interfaz.'
	},
	{
		id: 'theme-ocean',
		name: 'Estilo Océano',
		category: 'theme',
		price: 35,
		description: 'Azules y turquesa para la interfaz.'
	},
	{
		id: 'theme-neon',
		name: 'Estilo Neón',
		category: 'theme',
		price: 40,
		description: 'Colores vibrantes y eléctricos.'
	},
	{
		id: 'theme-fire',
		name: 'Estilo Fuego',
		category: 'theme',
		price: 40,
		description: 'Rojos y naranjas para la interfaz.'
	},
	{
		id: 'theme-forest',
		name: 'Estilo Bosque',
		category: 'theme',
		price: 35,
		description: 'Verdes y marrón natural para la interfaz.'
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
		description: 'Recarga 50 puntos de energía inmediatamente.'
	}
];

export function getShopItemsByCategory(category: ShopItem['category']): ShopItem[] {
	return shopItems.filter((item) => item.category === category);
}

export function getShopItemById(id: string): ShopItem | undefined {
	return shopItems.find((item) => item.id === id);
}

export const shopCategories = [
	{ id: 'background', label: 'Fondos', icon: '🌌' },
	{ id: 'theme', label: 'Temas UI', icon: '🎨' },
	{ id: 'frame', label: 'Marcos', icon: '🖼️' },
	{ id: 'accessory', label: 'Accesorios', icon: '✨' },
	{ id: 'potion', label: 'Pociones', icon: '🧪' }
] as const;
