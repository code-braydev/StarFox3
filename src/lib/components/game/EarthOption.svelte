<script lang="ts">
	import { playClick, playSuccess, playError } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';

	let {
		value,
		correct = false,
		selected = false,
		disabled = false,
		showResult = false,
		revealedWrong = false,
		onclick
	}: {
		value: number;
		correct?: boolean;
		selected?: boolean;
		disabled?: boolean;
		showResult?: boolean;
		revealedWrong?: boolean;
		onclick?: () => void;
	} = $props();

	let isCorrectRevealed = $derived(showResult && correct);
	let isWrongPicked = $derived(revealedWrong || (showResult && selected && !correct));
	let isDimmed = $derived(showResult && !correct && !selected && !revealedWrong);

	function handleClick() {
		if (disabled || showResult) return;
		if (game.soundEnabled) playClick();
		onclick?.();
	}
</script>

<button
	class="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border-[3px] transition-all duration-300 max-md:h-20 max-md:w-20
		{isDimmed || (disabled && !showResult) ? 'cursor-not-allowed opacity-40' : 'hover:scale-105 active:scale-95'}
		{isWrongPicked ? 'animate-[shake_0.3s_ease-in-out]' : ''}
		{isCorrectRevealed
		? 'border-emerald-400 bg-gradient-to-br from-emerald-500 to-blue-600 shadow-[0_0_30px_rgba(16,185,129,0.6)] scale-105'
		: isWrongPicked
			? 'border-red-400 bg-gradient-to-br from-red-600/50 to-red-900/50'
			: 'border-blue-600/40 bg-gradient-to-br from-blue-800/40 to-green-900/40 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'}"
	onclick={handleClick}
	disabled={disabled || showResult}
	aria-label="Continente terrestre {value}"
>
	<!-- Superficie terrestre -->
	<div class="absolute inset-1 overflow-hidden rounded-xl">
		<div
			class="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-green-500/10 to-blue-500/20"
		></div>
	</div>

	<!-- Número -->
	<span
		class="relative z-10 font-arcade text-xl font-bold transition-all duration-300 max-md:text-lg
			{isCorrectRevealed ? 'text-emerald-200 scale-110 font-extrabold' : isWrongPicked ? 'text-red-300' : 'text-white'}"
	>
		{value}
	</span>

	<!-- Curación al acertar -->
	{#if isCorrectRevealed}
		<div class="absolute inset-0 animate-pulse rounded-2xl bg-emerald-400/20"></div>
		<div class="absolute -top-1 -right-1 text-sm">💚</div>
	{/if}

	<!-- Anillo de hover -->
	{#if !disabled && !showResult}
		<div
			class="absolute -inset-2 rounded-xl border-2 border-emerald-400/0 transition-all duration-300 group-hover:border-emerald-400/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
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
</style>
