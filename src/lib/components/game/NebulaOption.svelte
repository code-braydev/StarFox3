<script lang="ts">
	import { playClick, playSuccess, playError } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';

	let {
		value,
		correct,
		selected,
		disabled,
		onclick
	}: {
		value: number;
		correct: boolean;
		selected: boolean;
		disabled: boolean;
		onclick: () => void;
	} = $props();

	let wasCorrect = $derived(selected && correct);
	let wasWrong = $derived(selected && !correct);

	function handleClick() {
		if (disabled) return;
		if (game.soundEnabled) playClick();
		onclick();
	}

	$effect(() => {
		if (wasCorrect && game.soundEnabled) playSuccess();
		if (wasWrong && game.soundEnabled) playError();
	});
</script>

<button
	class="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border-[3px] transition-all duration-300 max-md:h-20 max-md:w-20
		{disabled && !wasWrong ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
		{wasWrong ? 'animate-[shake_0.3s_ease-in-out]' : ''}
		{wasCorrect
		? 'border-violet-400 bg-gradient-to-br from-violet-600 to-purple-900 shadow-[0_0_30px_rgba(139,92,246,0.5)]'
		: wasWrong
			? 'border-red-400 bg-gradient-to-br from-red-600/50 to-red-900/50'
			: 'border-purple-500/40 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 hover:border-violet-400 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'}"
	onclick={handleClick}
	disabled={disabled && !wasWrong}
	aria-label="Nebulosa {value}"
>
	<!-- Efecto de gas nebuloso -->
	<div class="absolute inset-0 overflow-hidden rounded-2xl">
		<div
			class="absolute inset-0 animate-[nebula-drift_3s_ease-in-out_infinite] bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-indigo-500/20"
		></div>
	</div>

	<!-- Número -->
	<span
		class="relative z-10 font-arcade text-xl font-bold transition-all duration-300 max-md:text-lg
			{wasCorrect ? 'text-violet-200' : wasWrong ? 'text-red-300' : 'text-white'}"
	>
		{value}
	</span>

	<!-- Dispersión al acertar -->
	{#if wasCorrect}
		<div class="absolute inset-0 animate-pulse rounded-2xl bg-violet-400/15"></div>
	{/if}

	<!-- Anillo de hover -->
	{#if !disabled}
		<div
			class="absolute -inset-2 rounded-xl border-2 border-violet-400/0 transition-all duration-300 group-hover:border-violet-400/30 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
		></div>
	{/if}
</button>

<style>
	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}
	@keyframes nebula-drift {
		0%,
		100% {
			opacity: 0.6;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.05);
		}
	}
</style>
