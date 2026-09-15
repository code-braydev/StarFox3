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
	class="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-[3px] transition-all duration-300 max-md:h-20 max-md:w-20
		{disabled && !wasWrong ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
		{wasWrong ? 'animate-[shake_0.3s_ease-in-out]' : ''}
		{wasCorrect
		? 'border-amber-400 bg-gradient-to-br from-amber-500 to-orange-700 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
		: wasWrong
			? 'border-red-400 bg-gradient-to-br from-red-600/50 to-red-900/50'
			: 'border-gray-600 bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'}"
	onclick={handleClick}
	disabled={disabled && !wasWrong}
	aria-label="Pieza de forja {value}"
>
	<!-- Engranaje decorativo -->
	<div class="absolute inset-2 rounded-md border-2 border-dashed border-amber-600/30"></div>

	<!-- Brillo metálico -->
	<div class="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent"></div>

	<!-- Número -->
	<span
		class="relative z-10 font-arcade text-xl font-bold transition-all duration-300 max-md:text-lg
			{wasCorrect ? 'text-amber-200' : wasWrong ? 'text-red-300' : 'text-amber-100'}"
	>
		{value}
	</span>

	<!-- Chispas al acertar -->
	{#if wasCorrect}
		<div class="absolute inset-0 animate-pulse rounded-lg bg-amber-400/15"></div>
		<div class="absolute -top-1 -right-1 text-sm">✨</div>
	{/if}

	<!-- Anillo de hover -->
	{#if !disabled}
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
