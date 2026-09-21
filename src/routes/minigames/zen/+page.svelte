<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { playSuccess, playClick } from '$lib/audio/audio';

	interface Question {
		a: number;
		b: number;
		answer: number;
		options: number[];
	}

	let questions = $state<Question[]>(generateQuestions());
	let currentIndex = $state(0);
	let correctCount = $state(0);
	let totalAnswered = $state(0);
	let selectedAnswer = $state<number | null>(null);
	let feedbackKey = $state(0);

	let currentQ = $derived(questions[currentIndex]);

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
		for (let i = 0; i < 10; i++) {
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
		totalAnswered++;

		const isCorrect = value === currentQ.answer;

		if (isCorrect) {
			if (game.soundEnabled) playSuccess();
			correctCount++;
			game.addEnergy(1);
		}

		setTimeout(() => {
			currentIndex++;
			selectedAnswer = null;
			if (currentIndex >= questions.length) {
				questions = generateQuestions();
				currentIndex = 0;
			}
			feedbackKey++;
		}, 500);
	}

	function handleBack() {
		if (game.soundEnabled) playClick();
		goto('/minigames');
	}
</script>

<svelte:head>
	<title>Modo Zen - Star Fox 3</title>
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
			<h1 class="font-arcade text-sm tracking-wider text-emerald-400 max-md:text-xs">
				🧘 MODO ZEN
			</h1>
			<p class="mt-0.5 text-[0.65rem] text-gray-400 max-md:text-[0.55rem]">
				Practica libre · {totalAnswered} respondidas · {correctCount} aciertos
			</p>
		</div>

		<div class="w-16"></div>
	</header>

	<div class="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6 py-6">
		{#if currentQ}
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
							? 'border-gray-600 bg-[#252540] text-white hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
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

			<!-- Mensaje zen -->
			<p class="mt-8 text-sm text-gray-500">Practicá a tu ritmo. Sin prisa, sin presión. 🌿</p>
		{/if}
	</div>
</div>
