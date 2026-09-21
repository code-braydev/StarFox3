<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';

	let {
		correct,
		total,
		onRetry,
		onMap
	}: {
		correct: number;
		total: number;
		onRetry: () => void;
		onMap: () => void;
	} = $props();

	let heartsRemaining = $derived(game.hearts.current);

	function handleRetry() {
		if (game.soundEnabled) playClick();
		onRetry();
	}

	function handleMap() {
		if (game.soundEnabled) playClick();
		onMap();
	}
</script>

<div class="relative flex flex-col items-center gap-6 py-6">
	<!-- Foxy animado -->
	<div class="animate-[float_3s_ease-in-out_infinite]">
		<div
			class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400/30 bg-[#252540] text-4xl"
		>
			🦊
		</div>
	</div>

	<!-- Mensaje -->
	<h2 class="text-center text-2xl font-bold text-white max-md:text-xl">¡Buen intento, piloto!</h2>
	<p class="text-center text-sm text-gray-400">
		Acertaste <span class="font-bold text-amber-400">{correct}</span> de
		<span class="font-bold text-amber-400">{total}</span>
	</p>

	<!-- Mensaje de aliento -->
	<p class="text-center text-xs text-gray-400">
		¡No te rindas! Puedes reintentar la misión para reparar la nave.
	</p>

	<!-- Botones -->
	<div class="flex gap-4">
		<button
			class="min-h-[48px] cursor-pointer rounded-2xl border-none bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3 text-sm font-bold text-[#1E1E2F] shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
			onclick={handleRetry}
		>
			🔄 Reintentar
		</button>
		<button
			class="min-h-[48px] cursor-pointer rounded-2xl border-2 border-gray-600 bg-[#252540] px-8 py-3 text-sm font-bold text-gray-300 transition-all duration-300 hover:border-amber-400/50 hover:text-white"
			onclick={handleMap}
		>
			🗺️ Mapa
		</button>
	</div>
</div>
