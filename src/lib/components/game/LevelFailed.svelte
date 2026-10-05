<script lang="ts">
	import { goto } from '$app/navigation';
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

	function handleRetry() {
		if (game.soundEnabled) playClick();
		onRetry();
	}

	function handleMap() {
		if (game.soundEnabled) playClick();
		onMap();
	}

	function handleTraining() {
		if (game.soundEnabled) playClick();
		goto('/training');
	}
</script>

<div class="relative flex flex-col items-center gap-5 py-4">
	<!-- Avatar del personaje con animación suave -->
	<div class="animate-[float_3s_ease-in-out_infinite]">
		<div
			class="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-400/40 bg-[#252540] p-1 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
		>
			<!-- RECURSO: static/img/avatar-foxy.webp -->
			<img
				src="/img/avatar-foxy.webp"
				alt="Foxy"
				class="h-full w-full object-contain rounded-xl"
			/>
		</div>
	</div>

	<!-- Mensaje -->
	<h2 class="text-center font-arcade text-lg text-white max-md:text-base">¡Buen intento, piloto!</h2>
	<p class="text-center text-sm text-gray-300">
		Acertaste <span class="font-bold text-amber-400">{correct}</span> de
		<span class="font-bold text-amber-400">{total}</span> calibraciones.
	</p>

	<!-- Mensaje de aliento pedagógico -->
	<p class="text-center text-xs text-gray-400 max-w-xs leading-relaxed">
		¡La nave resistió el impacto! Puedes repasar en el simulador sin costo de energía ni corazones.
	</p>

	<!-- Botones de Acción -->
	<div class="flex flex-col w-full gap-2.5 max-w-xs">
		<button
			class="min-h-[44px] cursor-pointer rounded-xl border-none bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 font-arcade text-xs font-bold text-[#1E1E2F] shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300 hover:scale-102 active:scale-95"
			onclick={handleRetry}
		>
			🔄 Reintentar Misión
		</button>
		
		<button
			class="min-h-[44px] cursor-pointer rounded-xl border-2 border-cyan-500/60 bg-cyan-500/10 px-6 py-2.5 font-arcade text-xs font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/20 active:scale-95"
			onclick={handleTraining}
		>
			🎯 Repasar en Simulador (0⚡)
		</button>

		<button
			class="min-h-[40px] cursor-pointer rounded-xl border border-gray-600 bg-[#252540] px-6 py-2 text-xs font-bold text-gray-300 transition-all duration-300 hover:border-gray-400 hover:text-white"
			onclick={handleMap}
		>
			← Volver al Mapa
		</button>
	</div>
</div>
