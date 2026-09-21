<script lang="ts">
	import { untrack } from 'svelte';
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

	function getOptionComponent(t: number, qType?: string) {
		const type = qType ?? levelInfo[t]?.questionType;
		switch (type) {
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
		questionType: string;
		displayPrompt: string;
		displayResult: string;
		geometryRows?: number;
		geometryCols?: number;
	}

	let questions = $state<Question[]>([]);
	let currentIndex = $state(0);
	let correctCount = $state(0);
	let selectedAnswer = $state<number | null>(null);
	let revealedWrong = $state<number[]>([]);
	let foxyMood = $state<'idle' | 'celebrate' | 'encourage'>('idle');
	let showComplete = $state(false);
	let showFailed = $state(false);

	let timerSeconds = $state(0);
	let timerMax = $state(30);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let actionTimeout: ReturnType<typeof setTimeout> | null = null;

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

	function generateSmallDistractors(correct: number): number[] {
		const distractors: number[] = [];
		const candidates = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 3, correct - 3];
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
		const qType = level.questionType;

		return level.questions.map((q) => {
			if (qType === 'trueFalse') {
				const isTrue = Math.random() < 0.5;
				let shownProduct = q.a * q.b;
				if (!isTrue) {
					const delta = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
					shownProduct = q.a * q.b + delta;
					if (shownProduct <= 0 || shownProduct === q.a * q.b) {
						shownProduct = q.a * q.b + 2;
					}
				}
				const answer = isTrue ? 1 : 0;
				return {
					a: q.a,
					b: q.b,
					answer,
					options: [1, 0],
					questionType: 'trueFalse',
					displayPrompt: `${q.a} × ${q.b}`,
					displayResult: `${shownProduct}`
				};
			}

			if (qType === 'inverse') {
				const answer = q.b;
				const product = q.a * q.b;
				const distractors = generateSmallDistractors(answer);
				const options = shuffleArray([answer, ...distractors]);
				return {
					a: q.a,
					b: q.b,
					answer,
					options,
					questionType: 'inverse',
					displayPrompt: `${q.a} × ?`,
					displayResult: `${product}`
				};
			}

			if (qType === 'geometry') {
				const answer = q.a * q.b;
				const distractors = generateDistractors(answer, q.a, q.b);
				const options = shuffleArray([answer, ...distractors]);
				return {
					a: q.a,
					b: q.b,
					answer,
					options,
					questionType: 'geometry',
					displayPrompt: `${q.a} × ${q.b}`,
					displayResult: '?',
					geometryRows: q.a,
					geometryCols: q.b
				};
			}

			if (qType === 'series') {
				const answer = q.a * q.b;
				const distractors = generateDistractors(answer, q.a, q.b);
				const options = shuffleArray([answer, ...distractors]);
				const n1 = q.a * Math.max(1, q.b - 3);
				const n2 = q.a * Math.max(2, q.b - 2);
				const n3 = q.a * Math.max(3, q.b - 1);
				return {
					a: q.a,
					b: q.b,
					answer,
					options,
					questionType: 'series',
					displayPrompt: `${n1}, ${n2}, ${n3}, ?`,
					displayResult: ''
				};
			}

			if (qType === 'shopping') {
				const answer = q.a * q.b;
				const distractors = generateDistractors(answer, q.a, q.b);
				const options = shuffleArray([answer, ...distractors]);
				return {
					a: q.a,
					b: q.b,
					answer,
					options,
					questionType: 'shopping',
					displayPrompt: `${q.a} × $${q.b}`,
					displayResult: '?'
				};
			}

			// Modo estándar de multiplicación o mezclado
			const answer = q.a * q.b;
			const distractors = generateDistractors(answer, q.a, q.b);
			const options = shuffleArray([answer, ...distractors]);
			return {
				a: q.a,
				b: q.b,
				answer,
				options,
				questionType: qType,
				displayPrompt: `${q.a} × ${q.b}`,
				displayResult: '?'
			};
		});
	}

	function pickRandom<T>(arr: T[]): T {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function clearAllTimers() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		if (actionTimeout) {
			clearTimeout(actionTimeout);
			actionTimeout = null;
		}
	}

	function startTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		if (!level || level.timer <= 0) return;
		timerMax = level.timer;
		timerSeconds = level.timer;
		timerInterval = setInterval(() => {
			timerSeconds--;
			if (timerSeconds <= 0) {
				clearAllTimers();
				handleTimeout();
			}
		}, 1000);
	}

	function handleTimeout() {
		if (!currentQ || selectedAnswer !== null) return;
		clearAllTimers();
		selectedAnswer = -1;
		if (game.soundEnabled) playError();
		foxyMood = 'encourage';
		currentFoxyMessage = '¡Se acabó el tiempo!';
		game.loseHeart();
		game.updateStreak(false);

		actionTimeout = setTimeout(() => {
			if (game.hearts.current <= 0) {
				showFailed = true;
				return;
			}
			if (currentIndex + 1 >= totalQuestions) {
				const pct = correctCount / totalQuestions;
				const stars = pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
				game.completeLevel(table, stars, correctCount, totalQuestions);
				showComplete = true;
				return;
			}
			currentIndex++;
			selectedAnswer = null;
			revealedWrong = [];
			foxyMood = 'idle';
			currentFoxyMessage = level?.foxyDialogs.start ?? '';
			startTimer();
		}, 1500);
	}

	function handleAbilityUse() {
		if (!currentQ || selectedAnswer !== null) return;
		const wrongOptions = currentQ.options.filter(
			(o) => o !== currentQ.answer && !revealedWrong.includes(o)
		);
		if (wrongOptions.length > 0) {
			const picked = pickRandom(wrongOptions);
			revealedWrong = [...revealedWrong, picked];
		}
		if (timerSeconds > 0) {
			timerSeconds = Math.min(timerMax, timerSeconds + 5);
		}
	}

	function handleAnswer(value: number) {
		if (!currentQ || selectedAnswer !== null) return;
		clearAllTimers();
		selectedAnswer = value;

		const isCorrect = value === currentQ.answer;

		if (isCorrect) {
			if (game.soundEnabled) playSuccess();
			foxyMood = 'celebrate';
			currentFoxyMessage = pickRandom(level?.foxyDialogs.correct ?? ['¡Correcto!']);
			correctCount++;
			game.updateStreak(true);
			game.updateFastestCorrect(Date.now());
		} else {
			if (game.soundEnabled) playError();
			foxyMood = 'encourage';
			currentFoxyMessage = pickRandom(level?.foxyDialogs.wrong ?? ['¡Inténtalo de nuevo!']);
			game.loseHeart();
			game.updateStreak(false);
		}

		const delay = isCorrect ? 1000 : 1500;
		actionTimeout = setTimeout(() => {
			if (!isCorrect && game.hearts.current <= 0) {
				showFailed = true;
				return;
			}
			if (currentIndex + 1 >= totalQuestions) {
				const pct = correctCount / totalQuestions;
				const stars = pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
				game.completeLevel(table, stars, correctCount, totalQuestions);
				showComplete = true;
				return;
			}
			currentIndex++;
			selectedAnswer = null;
			revealedWrong = [];
			foxyMood = 'idle';
			currentFoxyMessage = level?.foxyDialogs.start ?? '';
			startTimer();
		}, delay);
	}

	function initLevel(t: number) {
		clearAllTimers();
		game.resetHearts();
		game.resetActiveUsage();
		questions = generateQuestions();
		currentIndex = 0;
		correctCount = 0;
		selectedAnswer = null;
		revealedWrong = [];
		foxyMood = 'idle';
		showComplete = false;
		showFailed = false;
		currentFoxyMessage = levelInfo[t]?.foxyDialogs.start ?? '';
		startTimer();
	}

	function handleRetry() {
		initLevel(table);
	}

	function handleBack() {
		clearAllTimers();
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
			untrack(() => {
				initLevel(t);
			});
		}
		return () => {
			clearAllTimers();
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

		<!-- Header centrado con grid -->
		<header
			class="relative z-20 grid w-full grid-cols-[1fr_auto_1fr] items-center px-6 py-4 max-md:px-4 max-md:py-3"
		>
			<div class="flex justify-start">
				<button
					class="cursor-pointer rounded-xl border border-gray-600 bg-[#252540] px-4 py-2 text-xs text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
					onclick={handleBack}
				>
					← Mapa
				</button>
			</div>

			<div class="text-center">
				<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">
					{level.name}
				</h1>
				<p class="mt-0.5 text-[0.65rem] text-cyan-400 max-md:text-[0.55rem]">
					Tabla del {table}
				</p>
			</div>

			<div class="flex items-center justify-end gap-4 max-md:gap-2">
				<HeartBar />
				<EnergyBar />
			</div>
		</header>

		<!-- Contenido principal centrado -->
		<div
			class="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center gap-8 px-6 py-6 max-md:flex-col max-md:gap-4 max-md:px-4 max-md:py-4"
		>
			<!-- Foxy Monitor a la izquierda -->
			<div class="w-48 flex-shrink-0 max-md:w-full">
				<FoxyMonitor message={currentFoxyMessage} mood={foxyMood} />
			</div>

			<!-- Panel central y controles -->
			<div class="flex w-full max-w-lg flex-1 flex-col items-center gap-6">
				{#if !showComplete && !showFailed && currentQ}
					<EnginePanel
						{table}
						questionIndex={currentIndex}
						{totalQuestions}
						{energyPercent}
						a={currentQ.a}
						b={currentQ.b}
						questionType={currentQ.questionType}
						displayPrompt={currentQ.displayPrompt}
						displayResult={currentQ.displayResult}
						geometryRows={currentQ.geometryRows}
						geometryCols={currentQ.geometryCols}
					/>

					{#if level.timer > 0}
						<TimerBar seconds={timerSeconds} maxSeconds={timerMax} />
					{/if}

					<div class="flex flex-wrap items-center justify-center gap-6 max-md:gap-4">
						{#each currentQ.options as option, _i (currentIndex + '-' + option)}
							{@const OptionComp = getOptionComponent(table, currentQ.questionType)}
							<OptionComp
								value={option}
								correct={option === currentQ.answer}
								selected={selectedAnswer === option}
								disabled={selectedAnswer !== null}
								showResult={selectedAnswer !== null}
								revealedWrong={revealedWrong.includes(option)}
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

			<!-- Espaciador simétrico en escritorio para centrar perfectamente el panel del juego -->
			<div class="hidden w-48 flex-shrink-0 lg:block" aria-hidden="true"></div>
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
