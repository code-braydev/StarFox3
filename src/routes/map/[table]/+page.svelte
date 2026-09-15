<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { levelInfo } from '$lib/constants/levels';
	import { playSuccess, playError, playClick } from '$lib/audio/audio';
	import EnginePanel from '$lib/components/game/EnginePanel.svelte';
	import LeverOption from '$lib/components/game/LeverOption.svelte';
	import CrystalOption from '$lib/components/game/CrystalOption.svelte';
	import AsteroidOption from '$lib/components/game/AsteroidOption.svelte';
	import NebulaOption from '$lib/components/game/NebulaOption.svelte';
	import ForgeOption from '$lib/components/game/ForgeOption.svelte';
	import PortOption from '$lib/components/game/PortOption.svelte';
	import VoidOption from '$lib/components/game/VoidOption.svelte';
	import EarthOption from '$lib/components/game/EarthOption.svelte';
	import FoxyMonitor from '$lib/components/game/FoxyMonitor.svelte';
	import LevelComplete from '$lib/components/game/LevelComplete.svelte';
	import HeartBar from '$lib/components/game/HeartBar.svelte';
	import EnergyBar from '$lib/components/game/EnergyBar.svelte';
	import TimerBar from '$lib/components/game/TimerBar.svelte';
	import AbilityButton from '$lib/components/game/AbilityButton.svelte';
	import LevelFailed from '$lib/components/game/LevelFailed.svelte';
	import TrueFalseOption from '$lib/components/game/TrueFalseOption.svelte';
	import InverseOption from '$lib/components/game/InverseOption.svelte';
	import GeometryOption from '$lib/components/game/GeometryOption.svelte';
	import SeriesOption from '$lib/components/game/SeriesOption.svelte';
	import ShoppingOption from '$lib/components/game/ShoppingOption.svelte';

	let table = $derived(Number(page.params.table));
	let level = $derived(levelInfo[table] ?? null);

	function getOptionComponent(t: number) {
		const levelData = levelInfo[t];
		if (!levelData) return LeverOption;

		switch (levelData.questionType) {
			case 'trueFalse':
				return TrueFalseOption;
			case 'inverse':
				return InverseOption;
			case 'geometry':
				return GeometryOption;
			case 'series':
				return SeriesOption;
			case 'shopping':
				return ShoppingOption;
			default:
				break;
		}

		switch (t) {
			case 3:
				return CrystalOption;
			case 4:
				return AsteroidOption;
			case 5:
				return NebulaOption;
			case 6:
				return ForgeOption;
			case 7:
				return PortOption;
			case 8:
				return VoidOption;
			case 9:
				return EarthOption;
			default:
				return LeverOption;
		}
	}

	interface Question {
		a: number;
		b: number;
		answer: number;
		options: number[];
	}

	let questions = $state<Question[]>([]);
	let currentIndex = $state(0);
	let correctCount = $state(0);
	let selectedAnswer = $state<number | null>(null);
	let _feedbackVariant = $state<'idle' | 'correct' | 'wrong'>('idle');
	let foxyMood = $state<'idle' | 'celebrate' | 'encourage'>('idle');
	let showComplete = $state(false);
	let showFailed = $state(false);
	let feedbackKey = $state(0);
	let _gameState = $state<'playing' | 'completed' | 'failed'>('playing');

	let timerSeconds = $state(0);
	let timerMax = $state(30);
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);

	let totalQuestions = $derived(level?.questions.length ?? 10);
	let currentQ = $derived(questions[currentIndex]);
	let energyPercent = $derived((currentIndex / totalQuestions) * 100);
	let currentFoxyMessage = $state('');

	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function generateDistractors(correct: number, a: number, b: number): number[] {
		const distractors: number[] = [];
		const candidates = [
			a * (b - 1),
			a * (b + 1),
			correct + a,
			correct - a,
			correct + 1,
			correct - 1,
			correct + 2,
			correct - 2
		];
		for (const c of candidates) {
			if (c > 0 && c !== correct && !distractors.includes(c)) distractors.push(c);
			if (distractors.length >= 2) break;
		}
		while (distractors.length < 2) {
			const fake = correct + Math.floor(Math.random() * 5) - 2;
			if (fake > 0 && fake !== correct && !distractors.includes(fake)) distractors.push(fake);
		}
		return distractors.slice(0, 2);
	}

	function generateQuestions(): Question[] {
		if (!level) return [];
		return level.questions.map((q) => {
			const answer = q.a * q.b;
			const distractors = generateDistractors(answer, q.a, q.b);
			const options = shuffleArray([answer, ...distractors]);
			return { a: q.a, b: q.b, answer, options };
		});
	}

	function pickRandom<T>(arr: T[]): T {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function startTimer() {
		clearTimer();
		if (!level || level.timer <= 0) return;
		timerMax = level.timer;
		timerSeconds = level.timer;
		timerInterval = setInterval(() => {
			timerSeconds--;
			if (timerSeconds <= 0) {
				clearTimer();
				handleTimeout();
			}
		}, 1000);
	}

	function clearTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function handleTimeout() {
		if (!currentQ || selectedAnswer !== null) return;
		selectedAnswer = -1;
		feedbackKey++;
		_feedbackVariant = 'wrong';
		foxyMood = 'encourage';
		currentFoxyMessage = '¡Se acabó el tiempo!';
		game.loseHeart();
		game.updateStreak(false);

		setTimeout(() => {
			currentIndex++;
			selectedAnswer = null;
			_feedbackVariant = 'idle';
			foxyMood = 'idle';

			if (currentIndex >= totalQuestions) {
				const pct = correctCount / totalQuestions;
				const stars = pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
				game.completeLevel(table, stars, correctCount, totalQuestions);
				_gameState = 'completed';
				showComplete = true;
			} else if (game.hearts.current <= 0) {
				_gameState = 'failed';
				showFailed = true;
			} else {
				startTimer();
			}
		}, 1500);
	}

	function handleAbilityUse() {
		if (!currentQ) return;
		startTimer();
	}

	function handleAnswer(value: number) {
		if (!currentQ || selectedAnswer !== null) return;
		selectedAnswer = value;
		feedbackKey++;
		clearTimer();

		const isCorrect = value === currentQ.answer;

		if (isCorrect) {
			if (game.soundEnabled) playSuccess();
			_feedbackVariant = 'correct';
			foxyMood = 'celebrate';
			currentFoxyMessage = pickRandom(level?.foxyDialogs.correct ?? ['¡Correcto!']);
			correctCount++;
			game.updateStreak(true);
			game.updateFastestCorrect(Date.now());
		} else {
			if (game.soundEnabled) playError();
			_feedbackVariant = 'wrong';
			foxyMood = 'encourage';
			currentFoxyMessage = pickRandom(level?.foxyDialogs.wrong ?? ['¡Inténtalo de nuevo!']);
			game.loseHeart();
			game.updateStreak(false);
		}

		const delay = isCorrect ? 1000 : 1500;
		setTimeout(() => {
			currentIndex++;
			selectedAnswer = null;
			_feedbackVariant = 'idle';
			foxyMood = 'idle';
			currentFoxyMessage = level?.foxyDialogs.start ?? '';

			if (currentIndex >= totalQuestions) {
				const pct = correctCount / totalQuestions;
				const stars = pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
				game.completeLevel(table, stars, correctCount, totalQuestions);
				_gameState = 'completed';
				showComplete = true;
			} else if (game.hearts.current <= 0) {
				_gameState = 'failed';
				showFailed = true;
			} else {
				startTimer();
			}
		}, delay);
	}

	function handleRetry() {
		game.resetHearts();
		game.resetActiveUsage();
		questions = generateQuestions();
		currentIndex = 0;
		correctCount = 0;
		selectedAnswer = null;
		_feedbackVariant = 'idle';
		foxyMood = 'idle';
		showComplete = false;
		showFailed = false;
		_gameState = 'playing';
		currentFoxyMessage = level?.foxyDialogs.start ?? '';
		startTimer();
	}

	function handleBack() {
		if (game.soundEnabled) playClick();
		goto('/map');
	}

	function starsEarned(): number {
		const pct = correctCount / totalQuestions;
		return pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
	}

	$effect(() => {
		const t = table;
		if (t >= 1 && t <= 25 && levelInfo[t]) {
			questions = generateQuestions();
			currentFoxyMessage = levelInfo[t].foxyDialogs.start;
			startTimer();
		}
		return () => {
			clearTimer();
			questions = [];
			currentIndex = 0;
			correctCount = 0;
			selectedAnswer = null;
			_feedbackVariant = 'idle';
			foxyMood = 'idle';
			showComplete = false;
			showFailed = false;
			_gameState = 'playing';
		};
	});
</script>

<svelte:head>
	<title>{level?.name ?? 'Nivel'} - Star Fox 3</title>
</svelte:head>

{#if !level}
	<div class="flex min-h-dvh items-center justify-center bg-[#0f0f2a]">
		<div class="text-center">
			<p class="mb-4 text-xl text-white">Nivel no encontrado</p>
			<button
				class="cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
				onclick={() => goto('/map')}
			>
				Volver al mapa
			</button>
		</div>
	</div>
{:else}
	<div
		class="relative flex min-h-dvh w-full flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
		style="background-image: url('{level.background}');"
	>
		<div class="absolute inset-0 bg-slate-950/85"></div>

		<header
			class="relative z-20 flex w-full items-center justify-between px-6 py-4 max-md:px-4 max-md:py-3"
		>
			<button
				class="cursor-pointer rounded-xl border border-gray-600 bg-[#252540] px-4 py-2 text-xs text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
				onclick={handleBack}
			>
				← Mapa
			</button>

			<div class="text-center">
				<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">
					{level.name}
				</h1>
				<p class="mt-0.5 text-[0.65rem] text-cyan-400 max-md:text-[0.55rem]">
					Tabla del {table}
				</p>
			</div>

			<div class="flex items-center gap-4 max-md:gap-2">
				<HeartBar />
				<EnergyBar />
			</div>
		</header>

		<div
			class="relative z-10 flex w-full max-w-5xl flex-1 items-center justify-center gap-8 px-6 py-6 max-md:flex-col max-md:gap-4 max-md:px-4 max-md:py-4"
		>
			<div class="w-48 flex-shrink-0 max-md:w-full">
				<FoxyMonitor message={currentFoxyMessage} mood={foxyMood} />
			</div>

			<div class="flex w-full max-w-lg flex-col items-center gap-6">
				{#if !showComplete && !showFailed && currentQ}
					<EnginePanel
						{table}
						questionIndex={currentIndex}
						{totalQuestions}
						{energyPercent}
						a={currentQ.a}
						b={currentQ.b}
					/>

					{#if level.timer > 0}
						<TimerBar seconds={timerSeconds} maxSeconds={timerMax} />
					{/if}

					<div class="flex items-center justify-center gap-6 max-md:gap-4">
						{#each currentQ.options as option, _i (option + '-' + feedbackKey)}
							{@const OptionComp = getOptionComponent(table)}
							<OptionComp
								value={option}
								correct={option === currentQ.answer}
								selected={selectedAnswer === option}
								disabled={selectedAnswer !== null}
								onclick={() => handleAnswer(option)}
							/>
						{/each}
					</div>

					<div class="flex items-center gap-4">
						<AbilityButton onUse={handleAbilityUse} />
						{#if energyPercent > 0}
							<div class="flex items-center gap-2">
								<span class="text-[0.75rem] text-gray-400">Energía del motor:</span>
								<div class="flex gap-1">
									{#each Array(10) as _, i (i)}
										<div
											class="h-3 w-3 rounded-sm transition-all duration-500
												{i < Math.ceil(energyPercent / 10)
												? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)]'
												: 'bg-gray-700'}
											"
										></div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>

	{#if showComplete}
		<LevelComplete
			{table}
			stars={starsEarned()}
			correct={correctCount}
			total={totalQuestions}
			onRetry={handleRetry}
		/>
	{/if}

	{#if showFailed}
		<div
			class="fixed inset-0 z-[1000] flex animate-fade-in items-center justify-center bg-black/80 p-4"
		>
			<div
				class="w-full max-w-[420px] animate-scale-in rounded-3xl border-[3px] border-red-400/50 bg-gradient-to-br from-[#252540] to-[#1a1a3e] p-8"
			>
				<LevelFailed
					correct={correctCount}
					total={totalQuestions}
					onRetry={handleRetry}
					onMap={handleBack}
				/>
			</div>
		</div>
	{/if}
{/if}
