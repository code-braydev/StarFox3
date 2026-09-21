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
	class="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-[3px] transition-all duration-300 max-md:h-20 max-md:w-20
		{isDimmed || (disabled && !showResult) ? 'cursor-not-allowed opacity-40' : 'hover:scale-105 active:scale-95'}
		{isWrongPicked ? 'animate-[shake_0.3s_ease-in-out]' : ''}
		{isCorrectRevealed
		? 'border-emerald-400 bg-gradient-to-br from-emerald-600 to-amber-600 shadow-[0_0_30px_rgba(34,197,94,0.6)] scale-105'
		: isWrongPicked
			? 'border-red-400 bg-gradient-to-br from-red-600/50 to-red-900/50'
			: 'border-gray-600 bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'}"
	onclick={handleClick}
	disabled={disabled || showResult}
	aria-label="Pieza de forja {value}"
>
	<!-- Engranaje decorativo -->
	<div class="absolute inset-2 rounded-md border-2 border-dashed border-amber-600/30"></div>

	<!-- Brillo metálico -->
	<div class="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent"></div>

	<!-- Número -->
	<span
		class="relative z-10 font-arcade text-xl font-bold transition-all duration-300 max-md:text-lg
			{isCorrectRevealed ? 'text-emerald-200 scale-110 font-extrabold' : isWrongPicked ? 'text-red-300' : 'text-amber-100'}"
	>
		{value}
	</span>

	<!-- Chispas al acertar -->
	{#if isCorrectRevealed}
		<div class="absolute inset-0 animate-pulse rounded-lg bg-emerald-400/20"></div>
		<div class="absolute -top-1 -right-1 text-sm">✨</div>
	{/if}

	<!-- Anillo de hover -->
	{#if !disabled && !showResult}
		<div
			class="absolute -inset-2 rounded-lg border-2 border-amber-400/0 transition-all duration-300 group-hover:border-amber-400/30 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
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
			transform: translateX(-4px) rotate(-1deg);
		}
		75% {
			transform: translateX(4px) rotate(1deg);
		}
	}
</style>
