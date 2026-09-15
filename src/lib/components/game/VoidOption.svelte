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
	class="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-[3px] transition-all duration-300 max-md:h-20 max-md:w-20
		{disabled && !wasWrong ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
		{wasWrong ? 'animate-[shake_0.3s_ease-in-out]' : ''}
		{wasCorrect
		? 'border-sky-400 bg-gradient-to-br from-sky-600 to-blue-900 shadow-[0_0_30px_rgba(14,165,233,0.5)]'
		: wasWrong
			? 'border-red-400 bg-gradient-to-br from-red-600/50 to-red-900/50'
			: 'border-gray-700 bg-gradient-to-br from-[#0a0a1a] to-[#000005] hover:border-sky-400 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]'}"
	onclick={handleClick}
	disabled={disabled && !wasWrong}
	aria-label="Burbuja de oxígeno {value}"
>
	<!-- Estrellas de fondo del vacío -->
	<div class="absolute inset-0 overflow-hidden rounded-full">
		<div
			class="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,white_1px,transparent_0),radial-gradient(1px_1px_at_80%_70%,white_1px,transparent_0)] bg-[length:100%_100%] opacity-30"
		></div>
	</div>

	<!-- Burbuja de oxígeno -->
	<div class="absolute inset-2 rounded-full border border-sky-500/20 bg-sky-500/5"></div>

	<!-- Número -->
	<span
		class="relative z-10 font-arcade text-xl font-bold transition-all duration-300 max-md:text-lg
			{wasCorrect ? 'text-sky-200' : wasWrong ? 'text-red-300' : 'text-sky-100'}"
	>
		{value}
	</span>

	<!-- Burbuja emergente al acertar -->
	{#if wasCorrect}
		<div class="absolute inset-0 animate-pulse rounded-full bg-sky-400/15"></div>
		<div class="absolute -top-1 right-0 text-sm">🫧</div>
	{/if}

	<!-- Anillo de hover -->
	{#if !disabled}
		<div
			class="absolute -inset-2 rounded-full border-2 border-sky-400/0 transition-all duration-300 group-hover:border-sky-400/30 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]"
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
