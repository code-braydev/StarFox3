import { characters } from '$lib/constants/characters';
import { getShopItemById } from '$lib/constants/shop';
import { telemetry } from '$lib/sync/outbox';
import { mergeProgress } from '$lib/sync/merge';
import type { ProgressDoc } from '$lib/firebase/types';
import type { GameState } from './types/game';
import { defaultGameState } from './types/game';
import {
	rechargeEnergy,
	recalcMaxEnergy,
	RECHARGE_INTERVAL_MS,
	checkAllAchievements,
	loadGameState,
	saveGameState,
	calculateLevelGems,
	getEffectiveShopPrice
} from './logic';

export * from './types/game';

function createGameStore() {
	const state = $state<GameState>(loadGameState());
	const pendingMedals = $state<string[]>([]);

	if (typeof window !== 'undefined') {
		rechargeEnergy(state.energy);
		recalcMaxEnergy(state.characters, state.energy);
		checkAllAchievements(state);

		$effect.root(() => {
			$effect(() => {
				saveGameState(state);
			});
		});

		setInterval(() => {
			rechargeEnergy(state.energy);
		}, RECHARGE_INTERVAL_MS);
	}

	return {
		// --- Estado reactivo directo ---
		get player() { return state.player; },
		get progress() { return state.progress; },
		get energy() { return state.energy; },
		get hearts() { return state.hearts; },
		get characters() { return state.characters; },
		get shop() { return state.shop; },
		get medals() { return state.medals; },
		get stats() { return state.stats; },
		get settings() { return state.settings; },
		get soundEnabled() { return state.settings.soundEnabled; },
		get introSeen() { return state.introSeen; },

		// --- Derivados ---
		get isRegistered() { return state.player.name.length > 0; },
		get hasGoal() { return state.player.goal.length > 0; },
		get pendingMedals() { return pendingMedals; },
		get currentPendingMedal() { return pendingMedals.length > 0 ? pendingMedals[0] : null; },

		// --- Acciones de Jugador y Configuración ---
		setPlayer(name: string, avatar: string) {
			state.player.name = name;
			state.player.avatar = avatar;
		},
		setGoal(goal: string) {
			state.player.goal = goal;
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

		// --- Progreso y Niveles ---
		completeLevel(level: number, starsEarned: number, correct: number, total: number) {
			if (!state.progress.levelsCompleted.includes(level)) {
				state.progress.levelsCompleted.push(level);
			}

			const prevStars = state.progress.stars[level] ?? 0;
			if (starsEarned > prevStars) {
				state.progress.stars[level] = starsEarned;
			}

			state.progress.totalStars = Object.values(state.progress.stars).reduce(
				(s, v) => s + (Number(v) || 0),
				0
			);

			const gemsEarned = calculateLevelGems(state.characters.selected, correct, total, starsEarned);
			state.progress.gems += gemsEarned;
			state.progress.totalCorrect += correct;
			state.progress.totalAttempts += total;
			state.progress.updatedAt = Date.now();

			checkAllAchievements(state, pendingMedals);

			if (typeof window !== 'undefined') {
				telemetry.progressSnapshot(this.toProgressSnapshot());
			}
		},

		addGems(amount: number) {
			state.progress.gems += amount;
		},
		spendGems(amount: number): boolean {
			if (state.progress.gems < amount) return false;
			state.progress.gems -= amount;
			return true;
		},

		// --- Energía y Vidas ---
		useEnergy(cost: number): boolean {
			if (state.progress.gems >= 999999) {
				state.energy.current = state.energy.max;
				return true;
			}
			rechargeEnergy(state.energy);
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

		// --- Personajes y Habilidades ---
		selectCharacter(id: string) {
			if (state.characters.unlocked.includes(id)) {
				state.characters.selected = id;
				recalcMaxEnergy(state.characters, state.energy);
			}
		},
		unlockCharacter(id: string) {
			if (!state.characters.unlocked.includes(id)) {
				state.characters.unlocked.push(id);
				recalcMaxEnergy(state.characters, state.energy);
				checkAllAchievements(state, pendingMedals);
			}
		},
		isCharacterUnlocked(id: string): boolean {
			return state.characters.unlocked.includes(id);
		},
		canUnlockCharacter(id: string): boolean {
			const char = characters.find((c) => c.id === id);
			if (!char || state.characters.unlocked.includes(id)) return false;
			switch (char.unlockType) {
				case 'free': return true;
				case 'stars': return state.progress.totalStars >= char.unlockValue;
				case 'gems': return state.progress.gems >= char.unlockValue;
				case 'level': return state.progress.levelsCompleted.includes(char.unlockValue);
				default: return false;
			}
		},
		unlockCharacterWithCheck(id: string): boolean {
			const char = characters.find((c) => c.id === id);
			if (!char || state.characters.unlocked.includes(id)) return false;
			if (char.unlockType === 'gems') {
				if (state.progress.gems < char.unlockValue) return false;
				state.progress.gems -= char.unlockValue;
			}
			state.characters.unlocked.push(id);
			recalcMaxEnergy(state.characters, state.energy);
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

		// --- Tienda y Cosméticos ---
		buyItem(itemId: string, price: number): boolean {
			const effectivePrice = getEffectiveShopPrice(price, state.characters.selected);
			const itemDef = getShopItemById(itemId);

			if (itemDef?.category === 'potion') {
				const maxPotions = 5;
				const cooldownMs = 3 * 60 * 1000;
				const purchases = state.shop.potionPurchases ?? 0;
				const lastAt = state.shop.lastPotionPurchasedAt ?? 0;
				if (purchases >= maxPotions) return false;
				if (lastAt > 0 && Date.now() - lastAt < cooldownMs) return false;
				if (state.progress.gems < effectivePrice) return false;

				state.progress.gems -= effectivePrice;
				state.shop.potionPurchases = purchases + 1;
				state.shop.lastPotionPurchasedAt = Date.now();
				if (!state.shop.purchased.includes(itemId)) {
					state.shop.purchased.push(itemId);
				}
				this.addEnergy(50);
				checkAllAchievements(state, pendingMedals);
				return true;
			}

			if (state.shop.purchased.includes(itemId) || state.progress.gems < effectivePrice) {
				return false;
			}
			state.progress.gems -= effectivePrice;
			state.shop.purchased.push(itemId);

			if (itemDef) {
				state.shop.equipped[itemDef.category] = itemId;
			}

			checkAllAchievements(state, pendingMedals);
			return true;
		},
		equipItem(category: 'background' | 'theme' | 'frame' | 'accessory', itemId: string | null) {
			state.shop.equipped[category] = itemId;
		},

		// --- Medallas y Logros ---
		checkAchievements() {
			checkAllAchievements(state, pendingMedals);
		},
		dismissPendingMedal() {
			if (pendingMedals.length > 0) {
				pendingMedals.shift();
			}
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

		// --- Estadísticas y Telemetría ---
		incrementPracticePlays() {
			state.stats.practiceModePlays++;
			state.progress.updatedAt = Date.now();
			checkAllAchievements(state, pendingMedals);
			if (typeof window !== 'undefined') {
				telemetry.progressSnapshot(this.toProgressSnapshot());
			}
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
		addPlayTime(ms: number) {
			state.progress.totalPlayTimeMs += ms;
			state.stats.totalPlayTime += Math.floor(ms / 1000);
		},

		// --- Sincronización e Hidratación con Servidor ---
		toProgressSnapshot() {
			return {
				levelsCompleted: [...state.progress.levelsCompleted],
				stars: { ...state.progress.stars },
				gems: state.progress.gems,
				totalCorrect: state.progress.totalCorrect,
				totalAttempts: state.progress.totalAttempts,
				totalStars: state.progress.totalStars,
				stats: { ...state.stats },
				totalPlayTimeMs: state.progress.totalPlayTimeMs
			};
		},
		syncProgressSnapshot() {
			if (typeof window !== 'undefined') {
				telemetry.progressSnapshot(this.toProgressSnapshot());
			}
		},
		hydrateFromServer(serverProgress: ProgressDoc | null) {
			if (!serverProgress) return;
			const merged = mergeProgress(
				{
					levelsCompleted: state.progress.levelsCompleted,
					stars: state.progress.stars,
					gems: state.progress.gems,
					totalCorrect: state.progress.totalCorrect,
					totalAttempts: state.progress.totalAttempts,
					totalStars: state.progress.totalStars,
					stats: state.stats,
					totalPlayTimeMs: state.progress.totalPlayTimeMs,
					updatedAt: state.progress.updatedAt
				},
				serverProgress
			);
			state.progress.levelsCompleted = merged.levelsCompleted;
			state.progress.stars = merged.stars;
			state.progress.gems = merged.gems;
			state.progress.totalCorrect = merged.totalCorrect;
			state.progress.totalAttempts = merged.totalAttempts;
			state.progress.totalStars = merged.totalStars;
			state.progress.totalPlayTimeMs = merged.totalPlayTimeMs ?? 0;
			state.progress.updatedAt = merged.updatedAt ?? Date.now();
			state.stats.practiceModePlays = merged.stats.practiceModePlays;
			state.stats.ranOutOfEnergy = merged.stats.ranOutOfEnergy;
			state.stats.fastestCorrect = merged.stats.fastestCorrect;
			state.stats.bestStreak = merged.stats.bestStreak;
			state.stats.totalPlayTime = merged.stats.totalPlayTime;
		},

		// --- Resets & Modo Maestro (Pruebas) ---
		activateMasterProfile(customName = 'MASTER FOX') {
			const allLevels = Array.from({ length: 25 }, (_, i) => i + 1);
			const allStars: Record<number, number> = {};
			for (const lvl of allLevels) {
				allStars[lvl] = 3;
			}

			state.player.name = customName;
			state.player.avatar = state.player.avatar || 'foxy';
			state.player.goal = 'all_medals';
			state.introSeen = true;

			state.progress.levelsCompleted = allLevels;
			state.progress.stars = allStars;
			state.progress.totalStars = 75;
			state.progress.gems = 999999;
			state.progress.updatedAt = Date.now();

			state.characters.unlocked = characters.map((c) => c.id);
			recalcMaxEnergy(state.characters, state.energy);
			state.energy.current = state.energy.max;
			state.hearts.current = state.hearts.max;

			checkAllAchievements(state);
		},
		resetProgress() {
			state.progress = { ...defaultGameState.progress };
			state.energy = { ...defaultGameState.energy };
			state.hearts = { ...defaultGameState.hearts };
			state.characters = { ...defaultGameState.characters };
			state.shop = { ...defaultGameState.shop };
			state.medals = { ...defaultGameState.medals };
			state.stats = { ...defaultGameState.stats };
		},
		resetAll() {
			state.player = { ...defaultGameState.player };
			state.progress = { ...defaultGameState.progress };
			state.hearts = { ...defaultGameState.hearts };
			state.energy = { ...defaultGameState.energy };
			state.characters = { ...defaultGameState.characters };
			state.shop = { ...defaultGameState.shop };
			state.medals = { ...defaultGameState.medals };
			state.stats = { ...defaultGameState.stats };
			state.settings = { ...defaultGameState.settings };
			state.introSeen = defaultGameState.introSeen;
		}
	};
}

export const game = createGameStore();
