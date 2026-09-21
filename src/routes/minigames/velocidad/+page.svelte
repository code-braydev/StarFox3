<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { playSuccess, playError, playClick } from '$lib/audio/audio';

	interface Question {
		a: number;
		b: number;
		answer: number;
		options: number[];
	}

	const TOTAL_QUESTIONS = 30;

	let questions = $state<Question[]>(generateQuestions());
	let currentIndex = $state(0);
	let correctCount = $state(0);
	let selectedAnswer = $state<number | null>(null);
	let showResult = $state(false);
	let feedbackKey = $state(0);

	let currentQ = $derived(questions[currentIndex]);
	let progress = $derived((currentIndex / TOTAL_QUESTIONS) * 100);

	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function generateDistractors(correct: number): number[] {
		const distractors: number[] = [];
		const candidates = [
			correct + 1,
			correct - 1,
			correct + 2,
			correct - 2,
			correct + 5,
			correct - 5
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
		const qs: Question[] = [];
		for (let i = 0; i < TOTAL_QUESTIONS; i++) {
			const a = Math.floor(Math.random() * 10) + 2;
			const b = Math.floor(Math.random() * 10) + 2;
			const answer = a * b;
			const distractors = generateDistractors(answer);
			const options = shuffleArray([answer, ...distractors]);
			qs.push({ a, b, answer, options });
		}
		return qs;
	}

	function handleAnswer(value: number) {
		if (!currentQ || selectedAnswer !== null) return;
		selectedAnswer = value;
		feedbackKey++;

		const isCorrect = value === currentQ.answer;

		if (isCorrect) {
			if (game.soundEnabled) playSuccess();
			correctCount++;
			game.addEnergy(3);
		} else {
			if (game.soundEnabled) playError();
		}

		setTimeout(() => {
			currentIndex++;
			selectedAnswer = null;
			if (currentIndex >= TOTAL_QUESTIONS) {
				game.updateStreak(true);
				showResult = true;
			}
		}, 500);
	}

	function handleBack() {
		if (game.soundEnabled) playClick();
		goto('/minigames');
	}

	function handleRestart() {
		if (game.soundEnabled) playClick();
		questions = generateQuestions();
		currentIndex = 0;
		correctCount = 0;
		selectedAnswer = null;
		showResult = false;
		feedbackKey = 0;
	}
</script>

<svelte:head>
	<title>Velocidad Mental - Star Fox 3</title>
</svelte:head>

<div class="relative flex min-h-dvh w-full flex-col overflow-hidden bg-[#0f0f2a]">
	<header
		class="relative z-20 flex w-full items-center justify-between px-6 py-4 max-md:px-4 max-md:py-3"
	>
		<button
			class="cursor-pointer rounded-xl border border-gray-600 bg-[#252540] px-4 py-2 text-xs text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
			onclick={handleBack}
		>
			← Salir
		</button>

		<div class="text-center">
			<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">
				⚡ VELOCIDAD MENTAL
			</h1>
			<p class="mt-0.5 text-[0.65rem] text-gray-400 max-md:text-[0.55rem]">
				{currentIndex}/{TOTAL_QUESTIONS} · Aciertos: {correctCount}
			</p>
		</div>

		<div class="w-16"></div>
	</header>

	<div class="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6 py-6">
		{#if showResult}
			<div class="flex flex-col items-center gap-6 text-center">
				<div class="text-5xl">⚡</div>
				<h2 class="text-2xl font-bold text-white">¡Completado!</h2>
				<p class="text-lg text-gray-400">
					Aciertos: <span class="font-bold text-amber-400">{correctCount}</span> / {TOTAL_QUESTIONS}
				</p>
				<p class="text-sm text-gray-500">
					{correctCount >= 25
						? '¡Increíble! Eres un rayo.'
						: correctCount >= 18
							? '¡Buen ritmo! Seguí así.'
							: 'Practicá más para mejorar tu velocidad.'}
				</p>
				<div class="flex gap-4">
					<button
						class="min-h-[48px] cursor-pointer rounded-2xl border-none bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3 text-sm font-bold text-[#1E1E2F] transition-all hover:scale-105 active:scale-95"
						onclick={handleRestart}
					>
						🔄 Otra vez
					</button>
					<button
						class="min-h-[48px] cursor-pointer rounded-2xl border-2 border-gray-600 bg-[#252540] px-8 py-3 text-sm font-bold text-gray-300 transition-all hover:border-amber-400/50 hover:text-white"
						onclick={handleBack}
					>
						← Salir
					</button>
				</div>
			</div>
		{:else if currentQ}
			<!-- Barra de progreso -->
			<div class="mb-8 w-full max-w-lg">
				<div class="h-2 w-full overflow-hidden rounded-full bg-[#1E1E2F]">
					<div
						class="h-full rounded-full bg-amber-400 transition-all duration-300"
						style:width="{progress}%"
					></div>
				</div>
			</div>

			<!-- Pregunta -->
			<div class="mb-8 text-center">
				<span class="font-arcade text-4xl text-white max-md:text-3xl">
					{currentQ.a} × {currentQ.b} = ?
				</span>
			</div>

			<!-- Opciones -->
			<div class="flex gap-6 max-md:gap-4">
				{#each currentQ.options as option, _i (option + '-' + feedbackKey)}
					<button
						class="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border-[3px] font-arcade text-2xl font-bold transition-all duration-300 max-md:h-20 max-md:w-20 max-md:text-xl
							{selectedAnswer === null
							? 'border-gray-600 bg-[#252540] text-white hover:border-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]'
							: option === currentQ.answer
								? 'border-emerald-400 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-[0_0_25px_rgba(34,197,94,0.5)]'
								: selectedAnswer === option
									? 'border-red-400 bg-gradient-to-br from-red-600/50 to-red-800/50 text-red-200'
									: 'border-gray-700 bg-[#1a1a2e] opacity-40'}"
						disabled={selectedAnswer !== null}
						onclick={() => handleAnswer(option)}
					>
						{option}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
