<script lang="ts">
	import { untrack } from 'svelte';
	import { playStar, playLevelComplete } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';
	import { levelInfo } from '$lib/constants/levels';
	import { goto } from '$app/navigation';

	let {
		table,
		stars,
		correct,
		total,
		onRetry
	}: {
		table: number;
		stars: number;
		correct: number;
		total: number;
		onRetry: () => void;
	} = $props();

	let showStars = $state(0);
	let levelName = $derived(levelInfo[table]?.name ?? 'Nivel');

	function handleBackToMap() {
		goto('/map');
	}

	function handleRetry() {
		onRetry();
	}

	$effect(() => {
		const s = stars;
		if (s > 0 && showStars === 0) {
			let count = 0;
			const interval = setInterval(() => {
				count++;
				untrack(() => {
					showStars = count;
				});
				if (game.soundEnabled) playStar();
				if (count >= s) clearInterval(interval);
			}, 400);
			return () => clearInterval(interval);
		}
	});

	$effect(() => {
		if (game.soundEnabled) playLevelComplete();
	});
</script>

<div
	class="fixed inset-0 z-[1500] flex items-center justify-center bg-black/85 p-4"
	role="dialog"
	tabindex="-1"
	aria-modal="true"
	aria-label="Nivel completado"
>
	<div
		class="w-full max-w-[420px] animate-scale-in rounded-3xl border-[3px] border-amber-400 bg-gradient-to-br from-[#252540] to-[#1a1a3e] p-8 text-center max-md:p-6"
	>
		<!-- Foxy celebrando -->
		<div class="mb-4 animate-[float-spaceship_2s_ease-in-out_infinite]">
			<img
				src="/img/avatar-foxy.webp"
				alt="Foxy"
				class="mx-auto h-20 w-20 rounded-full border-3 border-emerald-400 bg-[#1E1E2F] p-1 shadow-[0_0_25px_rgba(34,197,94,0.4)] max-md:h-16 max-md:w-16"
			/>
		</div>

		<!-- Título -->
		<h2 class="mb-1 font-arcade text-[1.1rem] text-[#FBBF24] max-md:text-[0.9rem]">
			¡Misión Cumplida!
		</h2>
		<p class="mb-4 text-[0.85rem] text-gray-300 max-md:text-[0.75rem]">{levelName}</p>

		<!-- Estrellas -->
		<div class="mb-5 flex justify-center gap-3">
			{#each Array(3) as _, i (i)}
				<span
					class="text-4xl transition-all duration-500 max-md:text-3xl
						{i < showStars ? 'scale-110 opacity-100' : 'scale-75 opacity-20 grayscale'}
					"
				>
					⭐
				</span>
			{/each}
		</div>

		<!-- Mensaje según estrellas -->
		<div class="mb-6 rounded-2xl bg-[#1E1E2F] p-4">
			<p class="text-[0.9rem] font-bold text-white max-md:text-[0.8rem]">
				{#if stars === 3}
					¡Perfecto, Piloto! ¡Motor calibrado al máximo!
				{:else if stars === 2}
					¡Gran trabajo! El motor está listo para el viaje.
				{:else if stars === 1}
					¡Lo lograste! El motor funciona, seguiremos mejorando.
				{:else}
					¡El motor arrancó! Vamos a intentarlo de nuevo para afinar la calibración.
				{/if}
			</p>
			<p class="mt-2 text-[0.8rem] text-gray-400 max-md:text-[0.7rem]">
				{correct} de {total} cálculos correctos
			</p>
		</div>

		<!-- Botones -->
		<div class="flex gap-3">
			<button
				class="min-h-[50px] flex-1 cursor-pointer rounded-2xl border-2 border-gray-600 bg-transparent text-[0.9rem] font-bold text-gray-300 transition-all duration-200 hover:border-gray-400 hover:text-white active:scale-95"
				onclick={handleBackToMap}
			>
				Volver al mapa
			</button>
			<button
				class="min-h-[50px] flex-1 cursor-pointer rounded-2xl border-none bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-[0.9rem] font-bold text-[#1E1E2F] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95"
				onclick={handleRetry}
			>
				Reintentar
			</button>
		</div>
	</div>
</div>
