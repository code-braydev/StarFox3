<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';
	import CadetTrainer from '$lib/components/activities/CadetTrainer.svelte';

	function handleBack() {
		if (game.soundEnabled) playClick();
		goto('/map');
	}
</script>

<svelte:head>
	<title>Simulador Cadete - Star Fox 3</title>
</svelte:head>

<div
	class="relative flex min-h-dvh w-full flex-col items-center overflow-hidden bg-cover bg-center bg-no-repeat"
	style="background-image: url('{game.shop.equipped.background ? `/img/background/${game.shop.equipped.background}.webp` : '/img/bg-map.webp'}');"
>
	<div class="absolute inset-0 bg-slate-950/85"></div>

	<!-- Header de la Nave -->
	<header
		class="relative z-20 flex w-full items-center justify-between border-b border-gray-800/80 bg-slate-950/60 px-6 py-4 backdrop-blur-sm max-md:px-4 max-md:py-3"
	>
		<button
			class="cursor-pointer rounded-xl border border-gray-600 bg-[#252540] px-4 py-2 text-xs text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
			onclick={handleBack}
		>
			← Volver al Mapa
		</button>

		<div class="text-center">
			<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">
				Cubierta de Entrenamiento
			</h1>
		</div>

		<div class="flex items-center gap-3">
			<span class="text-xs text-cyan-400 font-arcade">⚡ {game.energy.current}/{game.energy.max}</span>
			<span class="text-xs text-amber-400 font-arcade">💎 {game.progress.gems}</span>
		</div>
	</header>

	<!-- Contenido del Simulador -->
	<div
		class="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center justify-center p-6 max-md:p-4"
	>
		<CadetTrainer />
	</div>
</div>
