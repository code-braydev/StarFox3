interface PlayerData {
	name: string;
	gender: 'boy' | 'girl' | 'neutral';
	goal: string;
}

interface ProgressData {
	tablesCompleted: number[];
	stars: Record<number, number>;
	gems: number;
	totalCorrect: number;
	totalAttempts: number;
}

interface GameState {
	player: PlayerData;
	progress: ProgressData;
	soundEnabled: boolean;
}

const STORAGE_KEY = 'star-fox-3-game';

const defaultState: GameState = {
	player: { name: '', gender: 'neutral', goal: '' },
	progress: {
		tablesCompleted: [],
		stars: {},
		gems: 0,
		totalCorrect: 0,
		totalAttempts: 0
	},
	soundEnabled: true
};

// Funciones para cargar y guardar el estado del juego en localStorage
// Cargar el estado del juego desde localStorage
function loadFromStorage(): GameState {
	if (typeof window === 'undefined') return { ...defaultState };
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return { ...defaultState, ...JSON.parse(stored) };
		}
	} catch {
		// ignore
	}
	return { ...defaultState };
}

// Guardar el estado del juego en localStorage
function saveToStorage(state: GameState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore
	}
}

// Crear la tienda del juego
function createGameStore() {
	let state = $state<GameState>(loadFromStorage());

	// 2. Usamos $effect para guardar en localStorage automáticamente cuando cambie cualquier propiedad del estado
	if (typeof window !== 'undefined') {
		$effect.root(() => {
			$effect(() => {
				saveToStorage(state);
			});
		});
	}

	return {
		// Getters directos para leer de forma reactiva
		get player() {
			return state.player;
		},
		get progress() {
			return state.progress;
		},
		get soundEnabled() {
			return state.soundEnabled;
		},

		get isRegistered() {
			return state.player.name.length > 0;
		},
		get hasGoal() {
			return state.player.goal.length > 0;
		},

		// Setters para modificar el estado
		setPlayer(name: string, gender: 'boy' | 'girl' | 'neutral') {
			state.player.name = name;
			state.player.gender = gender;
		},

		setGoal(goal: string) {
			state.player.goal = goal;
		},

		// Completar un nivel y actualizar el progreso
		completeLevel(table: number, starsEarned: number, correct: number, total: number) {
			if (!state.progress.tablesCompleted.includes(table)) {
				state.progress.tablesCompleted.push(table);
			}

			const prevStars = state.progress.stars[table] ?? 0;
			if (starsEarned > prevStars) {
				state.progress.stars[table] = starsEarned;
			}

			state.progress.gems += correct;
			state.progress.totalCorrect += correct;
			state.progress.totalAttempts += total;
		},

		addGems(amount: number) {
			state.progress.gems += amount;
		},

		toggleSound() {
			state.soundEnabled = !state.soundEnabled;
		},

		resetProgress() {
			state.progress = { ...defaultState.progress };
		},

		resetAll() {
			state = defaultState;
		}
	};
}

export const game = createGameStore();
