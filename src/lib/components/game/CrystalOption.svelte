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

	// Reproducir sonido de éxito/error al seleccionar
	$effect(() => {
		if (wasCorrect && game.soundEnabled) playSuccess();
		if (wasWrong && game.soundEnabled) playError();
	});
</script>

<button
	class="crystal-option group relative flex h-28 w-28 cursor-pointer items-center justify-center transition-all duration-300 max-md:h-24 max-md:w-24
		{disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
		{wasWrong ? 'animate-[shake_0.3s_ease-in-out]' : ''}"
	onclick={handleClick}
	disabled={disabled && !wasWrong}
	aria-label="Opción {value}"
>
	<!-- Cristal principal -->
	<div
		class="absolute inset-0 transition-all duration-300"
		style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"
	>
		<!-- Fondo del cristal -->
		<div
			class="absolute inset-0 transition-all duration-300"
			class:bg-gradient-to-br={true}
			class:from-cyan-500={true}
			class:to-blue-700={true}
			class:brightness-110={selected && !disabled}
			class:brightness-150={wasCorrect}
			class:brightness-50={wasWrong}
			class:brightness-75={disabled && !selected}
		></div>

		<!-- Brillo interno -->
		<div
			class="absolute inset-0 transition-opacity duration-300"
			style="background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%);"
			class:opacity-100={!disabled}
			class:opacity-30={disabled}
		></div>

		<!-- Borde del cristal -->
		<div
			class="absolute inset-0 transition-all duration-300"
			style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); border: 2px solid rgba(255,255,255,0.3);"
		></div>
	</div>

	<!-- Número del cristal -->
	<span
		class="relative z-10 text-2xl font-bold text-white drop-shadow-lg transition-all duration-300 max-md:text-xl
			{wasCorrect ? 'scale-110 text-green-300' : ''}
			{wasWrong ? 'text-red-300' : ''}
			{!selected && disabled ? 'text-white/50' : ''}"
	>
		{value}
	</span>

	<!-- Efecto de brillo al ser correcto -->
	{#if wasCorrect}
		<div
			class="absolute inset-0 animate-pulse"
			style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); box-shadow: 0 0 40px rgba(34,197,94,0.8), inset 0 0 20px rgba(34,197,94,0.4);"
		></div>
	{/if}

	<!-- Anillo de hover -->
	{#if !disabled}
		<div
			class="absolute -inset-2 rounded-full border-2 border-cyan-400/0 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
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
