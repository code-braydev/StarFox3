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
	class="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-[2rem] border-[3px] transition-all duration-300 max-md:h-20 max-md:w-20
		{disabled && !wasWrong ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
		{wasWrong ? 'animate-[shake_0.3s_ease-in-out]' : ''}
		{wasCorrect
		? 'border-emerald-400 bg-gradient-to-br from-emerald-700 to-emerald-900 shadow-[0_0_30px_rgba(34,197,94,0.5)]'
		: wasWrong
			? 'border-red-400 bg-gradient-to-br from-red-700 to-red-900'
			: 'border-gray-600 bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]'}"
	onclick={handleClick}
	disabled={disabled && !wasWrong}
	aria-label="Asteroide {value}"
>
	<!-- Superficie rocosa -->
	<div
		class="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-[#4a4a4a]/30 to-transparent"
	></div>

	<!-- Cicatriz de impacto -->
	{#if wasWrong}
		<div class="absolute inset-2 rounded-[1.5rem] bg-red-500/20"></div>
	{/if}

	<!-- Número -->
	<span
		class="relative z-10 font-arcade text-xl font-bold transition-all duration-300 max-md:text-lg
			{wasCorrect ? 'text-emerald-300' : wasWrong ? 'text-red-300' : 'text-white'}"
	>
		{value}
	</span>

	<!-- Brillo de impacto -->
	{#if wasCorrect}
		<div class="absolute inset-0 animate-pulse rounded-[2rem] bg-emerald-400/10"></div>
	{/if}

	<!-- Anillo de hover -->
	{#if !disabled}
		<div
			class="absolute -inset-2 rounded-full border-2 border-orange-400/0 transition-all duration-300 group-hover:border-orange-400/30 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
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
			transform: translateX(-4px) rotate(-2deg);
		}
		75% {
			transform: translateX(4px) rotate(2deg);
		}
	}
</style>
