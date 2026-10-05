import { characters } from '$lib/constants/characters';

interface PlayerData {
	name: string;
	avatar: string;
	goal: string;
}

interface ProgressData {
	levelsCompleted: number[];
	stars: Record<number, number>;
	gems: number;
	totalCorrect: number;
	totalAttempts: number;
	totalStars: number;
}

interface HeartsData {
	current: number;
	max: number;
}

interface EnergyData {
	current: number;
	max: number;
	lastRecharge: number;
}

interface CharacterData {
	selected: string;
	unlocked: string[];
	cooldowns: Record<string, number>;
	activeUsedThisLevel: boolean;
}

interface ShopData {
	purchased: string[];
	equipped: {
		background: string | null;
		theme: string | null;
		frame: string | null;
		accessory: string | null;
	};
}

interface MedalData {
	earned: string[];
}

interface StatsData {
	practiceModePlays: number;
	ranOutOfEnergy: boolean;
	fastestCorrect: number;
	currentStreak: number;
	bestStreak: number;
	totalPlayTime: number;
}

interface SettingsData {
	soundEnabled: boolean;
	timerEnabled: boolean;
}

interface GameState {
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

const STORAGE_KEY = 'star-fox-3-game';
const RECHARGE_INTERVAL_MS = 5 * 60 * 1000;

const defaultState: GameState = {
	player: { name: '', avatar: 'foxy', goal: '' },
	progress: {
		levelsCompleted: [],
		stars: {},
		gems: 0,
		totalCorrect: 0,
		totalAttempts: 0,
		totalStars: 0
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

function migrateOldState(state: Record<string, unknown>): GameState {
	const migrated = { ...defaultState };

	if (state.player) {
		const oldPlayer = state.player as Record<string, unknown>;
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

	if (state.progress) {
		const oldProgress = state.progress as Record<string, unknown>;
		const stars = (oldProgress.stars as Record<number, number>) ?? {};
		const totalStars = Object.values(stars).reduce((sum, s) => sum + s, 0);
		migrated.progress = {
			levelsCompleted: (oldProgress.tablesCompleted as number[]) ?? [],
			stars,
			gems: (oldProgress.gems as number) ?? 0,
			totalCorrect: (oldProgress.totalCorrect as number) ?? 0,
			totalAttempts: (oldProgress.totalAttempts as number) ?? 0,
			totalStars
		};
	}

	if (typeof state.soundEnabled === 'boolean') {
		migrated.settings.soundEnabled = state.soundEnabled;
	}
	if (typeof state.introSeen === 'boolean') {
		migrated.introSeen = state.introSeen;
	}

	return migrated;
}

function loadFromStorage(): GameState {
	if (typeof window === 'undefined') return { ...defaultState };
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			const state = parsed.progress?.tablesCompleted
				? migrateOldState(parsed)
				: { ...defaultState, ...parsed };
			if (state.progress) {
				const stars = (state.progress.stars as Record<number, number>) ?? {};
				state.progress.totalStars = Object.values(stars).reduce((sum, s) => sum + (Number(s) || 0), 0);
			}
			return state;
		}
	} catch {
		// ignore
	}
	return { ...defaultState };
}

function saveToStorage(state: GameState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore
	}
}

function rechargeEnergy(state: GameState) {
	const now = Date.now();
	const elapsed = now - state.energy.lastRecharge;
	const pointsToAdd = Math.floor(elapsed / RECHARGE_INTERVAL_MS);
	if (pointsToAdd > 0 && state.energy.current < state.energy.max) {
		state.energy.current = Math.min(state.energy.current + pointsToAdd, state.energy.max);
		state.energy.lastRecharge = now;
	}
}

function recalcMaxEnergy(state: GameState) {
	const hasAstro = state.characters.unlocked.includes('astro');
	state.energy.max = hasAstro ? 300 : 250;
}

function checkAllAchievements(currentState: GameState, queue: string[]) {
	const checks: [string, boolean][] = [
		['progress-wood', currentState.progress.levelsCompleted.includes(1)],
		['progress-bronze', currentState.progress.levelsCompleted.includes(9)],
		['progress-silver', currentState.progress.levelsCompleted.includes(24)],
		['progress-gold', currentState.progress.levelsCompleted.includes(25)],
		['skill-lightning', currentState.stats.fastestCorrect > 0 && currentState.stats.fastestCorrect <= 2000],
		['skill-perfection', Object.values(currentState.progress.stars).some((s) => s === 3)],
		['skill-fire', currentState.stats.bestStreak >= 15],
		['collect-5', currentState.characters.unlocked.length >= 5],
		['collect-15', currentState.characters.unlocked.length >= 15],
		['collect-first-skin', currentState.shop.purchased.length >= 1],
		['effort-practice', currentState.stats.practiceModePlays >= 10],
		['effort-no-energy', currentState.stats.ranOutOfEnergy === true]
	];

	for (const [id, condition] of checks) {
		if (condition && !currentState.medals.earned.includes(id)) {
			currentState.medals.earned.push(id);
			if (!queue.includes(id)) {
				queue.push(id);
			}
		}
	}
}

function syncExistingAchievements(currentState: GameState) {
	const checks: [string, boolean][] = [
		['progress-wood', currentState.progress.levelsCompleted.includes(1)],
		['progress-bronze', currentState.progress.levelsCompleted.includes(9)],
		['progress-silver', currentState.progress.levelsCompleted.includes(24)],
		['progress-gold', currentState.progress.levelsCompleted.includes(25)],
		['skill-lightning', currentState.stats.fastestCorrect > 0 && currentState.stats.fastestCorrect <= 2000],
		['skill-perfection', Object.values(currentState.progress.stars).some((s) => s === 3)],
		['skill-fire', currentState.stats.bestStreak >= 15],
		['collect-5', currentState.characters.unlocked.length >= 5],
		['collect-15', currentState.characters.unlocked.length >= 15],
		['collect-first-skin', currentState.shop.purchased.length >= 1],
		['effort-practice', currentState.stats.practiceModePlays >= 10],
		['effort-no-energy', currentState.stats.ranOutOfEnergy === true]
	];

	for (const [id, condition] of checks) {
		if (condition && !currentState.medals.earned.includes(id)) {
			currentState.medals.earned.push(id);
		}
	}
}

function createGameStore() {
	const state = $state<GameState>(loadFromStorage());
	const pendingMedals = $state<string[]>([]);

	if (typeof window !== 'undefined') {
		rechargeEnergy(state);
		recalcMaxEnergy(state);
		syncExistingAchievements(state);

		$effect.root(() => {
			$effect(() => {
				saveToStorage(state);
			});
		});

		setInterval(() => {
			rechargeEnergy(state);
		}, RECHARGE_INTERVAL_MS);
	}

	return {
		get player() {
			return state.player;
		},
		get progress() {
			return state.progress;
		},
		get energy() {
			rechargeEnergy(state);
			return state.energy;
		},
		get hearts() {
			return state.hearts;
		},
		get characters() {
			return state.characters;
		},
		get shop() {
			return state.shop;
		},
		get medals() {
			return state.medals;
		},
		get pendingMedals() {
			return pendingMedals;
		},
		get currentPendingMedal() {
			return pendingMedals.length > 0 ? pendingMedals[0] : null;
		},
		dismissPendingMedal() {
			if (pendingMedals.length > 0) {
				pendingMedals.shift();
			}
		},
		checkAchievements() {
			checkAllAchievements(state, pendingMedals);
		},
		get stats() {
			return state.stats;
		},
		get settings() {
			return state.settings;
		},
		get soundEnabled() {
			return state.settings.soundEnabled;
		},
		get introSeen() {
			return state.introSeen;
		},
		get isRegistered() {
			return state.player.name.length > 0;
		},
		get hasGoal() {
			return state.player.goal.length > 0;
		},

		setPlayer(name: string, avatar: string) {
			state.player.name = name;
			state.player.avatar = avatar;
		},

		setGoal(goal: string) {
			state.player.goal = goal;
		},

		completeLevel(level: number, starsEarned: number, correct: number, total: number) {
			if (!state.progress.levelsCompleted.includes(level)) {
				state.progress.levelsCompleted.push(level);
			}

			const prevStars = state.progress.stars[level] ?? 0;
			if (starsEarned > prevStars) {
				state.progress.stars[level] = starsEarned;
			}

			state.progress.totalStars = Object.values(state.progress.stars).reduce((s, v) => s + (Number(v) || 0), 0);

			let gemsEarned = correct;
			const char = characters.find((c) => c.id === state.characters.selected);
			if (char?.id === 'foxy') gemsEarned = Math.round(gemsEarned * 1.1);
			if (char?.id === 'nova' && starsEarned === 3) gemsEarned = Math.round(gemsEarned * 1.2);
			if (char?.id === 'gizmo') gemsEarned += correct;
			if (char?.id === 'kira' && correct === total) gemsEarned *= 2;

			state.progress.gems += gemsEarned;
			state.progress.totalCorrect += correct;
			state.progress.totalAttempts += total;
			checkAllAchievements(state, pendingMedals);
		},

		addGems(amount: number) {
			state.progress.gems += amount;
		},

		spendGems(amount: number): boolean {
			if (state.progress.gems < amount) return false;
			state.progress.gems -= amount;
			return true;
		},

		useEnergy(cost: number): boolean {
			rechargeEnergy(state);
			if (state.energy.current < cost) {
				this.setRanOutOfEnergy();
				return false;
			}
			state.energy.current -= cost;
			if (state.energy.current === 0) {
				this.setRanOutOfEnergy();
			}
			return true;
		},

		addEnergy(amount: number) {
			state.energy.current = Math.min(state.energy.current + amount, state.energy.max);
		},

		loseHeart(): boolean {
			if (state.hearts.current <= 0) return false;
			state.hearts.current--;
			return true;
		},

		resetHearts() {
			state.hearts.current = state.hearts.max;
		},

		addHeart() {
			state.hearts.current = Math.min(state.hearts.current + 1, state.hearts.max);
		},

		selectCharacter(id: string) {
			if (state.characters.unlocked.includes(id)) {
				state.characters.selected = id;
				recalcMaxEnergy(state);
			}
		},

		unlockCharacter(id: string) {
			if (!state.characters.unlocked.includes(id)) {
				state.characters.unlocked.push(id);
				recalcMaxEnergy(state);
				checkAllAchievements(state, pendingMedals);
			}
		},

		isCharacterUnlocked(id: string): boolean {
			return state.characters.unlocked.includes(id);
		},

		canUnlockCharacter(id: string): boolean {
			const char = characters.find((c) => c.id === id);
			if (!char) return false;
			if (state.characters.unlocked.includes(id)) return false;
			switch (char.unlockType) {
				case 'free':
					return true;
				case 'stars':
					return state.progress.totalStars >= char.unlockValue;
				case 'gems':
					return state.progress.gems >= char.unlockValue;
				case 'level':
					return state.progress.levelsCompleted.includes(char.unlockValue);
				default:
					return false;
			}
		},

		unlockCharacterWithCheck(id: string): boolean {
			const char = characters.find((c) => c.id === id);
			if (!char) return false;
			if (state.characters.unlocked.includes(id)) return false;
			if (char.unlockType === 'gems') {
				if (state.progress.gems < char.unlockValue) return false;
				state.progress.gems -= char.unlockValue;
			}
			state.characters.unlocked.push(id);
			recalcMaxEnergy(state);
			return true;
		},

		canUseActive(characterId: string): boolean {
			if (state.characters.activeUsedThisLevel) return false;
			const char = characters.find((c) => c.id === characterId);
			if (!char) return false;
			if (char.active.cooldownType === 'level') return true;
			const lastUsed = state.characters.cooldowns[characterId] ?? 0;
			const cooldownMs = (char.active.cooldownMinutes ?? 0) * 60 * 1000;
			return Date.now() - lastUsed >= cooldownMs;
		},

		useActive(characterId: string) {
			state.characters.activeUsedThisLevel = true;
			const char = characters.find((c) => c.id === characterId);
			if (char?.active.cooldownType === 'real') {
				state.characters.cooldowns[characterId] = Date.now();
			}
		},

		resetActiveUsage() {
			state.characters.activeUsedThisLevel = false;
		},

		buyItem(itemId: string, price: number): boolean {
			if (state.shop.purchased.includes(itemId)) return false;
			if (state.progress.gems < price) return false;
			state.progress.gems -= price;
			state.shop.purchased.push(itemId);
			checkAllAchievements(state, pendingMedals);
			return true;
		},

		equipItem(category: 'background' | 'theme' | 'frame' | 'accessory', itemId: string | null) {
			state.shop.equipped[category] = itemId;
		},

		earnMedal(medalId: string): boolean {
			if (state.medals.earned.includes(medalId)) return false;
			state.medals.earned.push(medalId);
			if (!pendingMedals.includes(medalId)) {
				pendingMedals.push(medalId);
			}
			return true;
		},

		hasMedal(medalId: string): boolean {
			return state.medals.earned.includes(medalId);
		},

		toggleSound() {
			state.settings.soundEnabled = !state.settings.soundEnabled;
		},

		toggleTimer() {
			state.settings.timerEnabled = !state.settings.timerEnabled;
		},

		markIntroSeen() {
			state.introSeen = true;
		},

		incrementPracticePlays() {
			state.stats.practiceModePlays++;
			checkAllAchievements(state, pendingMedals);
		},

		setRanOutOfEnergy() {
			if (!state.stats.ranOutOfEnergy) {
				state.stats.ranOutOfEnergy = true;
				checkAllAchievements(state, pendingMedals);
			}
		},

		updateStreak(correct: boolean) {
			if (correct) {
				state.stats.currentStreak++;
				if (state.stats.currentStreak > state.stats.bestStreak) {
					state.stats.bestStreak = state.stats.currentStreak;
				}
			} else {
				state.stats.currentStreak = 0;
			}
			checkAllAchievements(state, pendingMedals);
		},

		updateFastestCorrect(timeMs: number) {
			if (timeMs < state.stats.fastestCorrect) {
				state.stats.fastestCorrect = timeMs;
				checkAllAchievements(state, pendingMedals);
			}
		},

		resetProgress() {
			state.progress = { ...defaultState.progress };
			state.energy = { ...defaultState.energy };
			state.hearts = { ...defaultState.hearts };
			state.characters = { ...defaultState.characters };
			state.shop = { ...defaultState.shop };
			state.medals = { ...defaultState.medals };
			state.stats = { ...defaultState.stats };
		},

		resetAll() {
			state.player = { ...defaultState.player };
			state.progress = { ...defaultState.progress };
			state.hearts = { ...defaultState.hearts };
			state.energy = { ...defaultState.energy };
			state.characters = { ...defaultState.characters };
			state.shop = { ...defaultState.shop };
			state.medals = { ...defaultState.medals };
			state.stats = { ...defaultState.stats };
			state.settings = { ...defaultState.settings };
			state.introSeen = defaultState.introSeen;
		}
	};
}

export const game = createGameStore();
