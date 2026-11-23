export interface PlayerData {
	name: string;
	avatar: string;
	goal: string;
}

export interface ProgressData {
	levelsCompleted: number[];
	stars: Record<number, number>;
	gems: number;
	totalCorrect: number;
	totalAttempts: number;
	totalStars: number;
	totalPlayTimeMs: number;
	updatedAt: number;
}

export interface HeartsData {
	current: number;
	max: number;
}

export interface EnergyData {
	current: number;
	max: number;
	lastRecharge: number;
}

export interface CharacterData {
	selected: string;
	unlocked: string[];
	cooldowns: Record<string, number>;
	activeUsedThisLevel: boolean;
}

export interface ShopData {
	purchased: string[];
	potionPurchases: number;
	lastPotionPurchasedAt: number;
	equipped: {
		background: string | null;
		theme: string | null;
		frame: string | null;
		accessory: string | null;
	};
}

export interface MedalData {
	earned: string[];
}

export interface StatsData {
	practiceModePlays: number;
	ranOutOfEnergy: boolean;
	fastestCorrect: number;
	currentStreak: number;
	bestStreak: number;
	totalPlayTime: number;
}

export interface SettingsData {
	soundEnabled: boolean;
	timerEnabled: boolean;
}

export interface GameState {
	player: PlayerData;
	progress: ProgressData;
	hearts: HeartsData;
	energy: EnergyData;
	characters: CharacterData;
	shop: ShopData;
	medals: MedalData;
	stats: StatsData;
	settings: SettingsData;
	introSeen: boolean;
}

export const defaultGameState: GameState = {
	player: { name: '', avatar: 'foxy', goal: '' },
	progress: {
		levelsCompleted: [],
		stars: {},
		gems: 0,
		totalCorrect: 0,
		totalAttempts: 0,
		totalStars: 0,
		totalPlayTimeMs: 0,
		updatedAt: 0
	},
	energy: {
		current: 250,
		max: 250,
		lastRecharge: Date.now()
	},
	hearts: {
		current: 3,
		max: 3
	},
	characters: {
		selected: 'foxy',
		unlocked: ['foxy'],
		cooldowns: {},
		activeUsedThisLevel: false
	},
	shop: {
		purchased: [],
		potionPurchases: 0,
		lastPotionPurchasedAt: 0,
		equipped: {
			background: null,
			theme: null,
			frame: null,
			accessory: null
		}
	},
	medals: {
		earned: []
	},
	stats: {
		practiceModePlays: 0,
		ranOutOfEnergy: false,
		fastestCorrect: Infinity,
		currentStreak: 0,
		bestStreak: 0,
		totalPlayTime: 0
	},
	settings: {
		soundEnabled: true,
		timerEnabled: true
	},
	introSeen: false
};
