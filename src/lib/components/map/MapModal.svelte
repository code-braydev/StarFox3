<script lang="ts">
	import { playClick, playSuccess } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';
	import { goto } from '$app/navigation';
	import spaceshipSvg from '$lib/assets/icons/spaceship.svg';

	let { open, table, onClose }: {
		open: boolean;
		table: number;
		onClose: () => void;
	} = $props();

	let stars = $derived(game.progress.stars[table] ?? 0);
	let isCompleted = $derived(game.progress.tablesCompleted.includes(table));
	let isCurrent = $derived.by(() => {
		const completed = game.progress.tablesCompleted;
		for (let t = 2; t <= 9; t++) {
			if (!completed.includes(t)) return t === table;
		}
		return false;
	});

	function handlePlay() {
		if (game.soundEnabled) playSuccess();
		goto(`/map/${table}`);
	}

	function handleClose() {
		if (game.soundEnabled) playClick();
		onClose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80"
		role="dialog"
		aria-modal="true"
		aria-label="Info tabla del {table}"
		onclick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
	>
		<div class="w-full max-w-[400px] animate-scale-in rounded-3xl border-[3px] border-amber-400 bg-gradient-to-br from-[#252540] to-[#1a1a3e] p-8 text-center">
			<!-- Nave de Foxy -->
			<div class="mb-3 animate-[float-spaceship_2s_ease-in-out_infinite]">
				<img src={spaceshipSvg} alt="Nave de Foxy" class="mx-auto h-14 w-14" />
			</div>

			<!-- Titulo -->
			<h2 class="mb-2 text-[1.6rem] font-arcade text-[#FBBF24] max-md:text-[1.3rem]">
				Tabla del {table}
			</h2>

			<!-- Estado -->
			{#if isCompleted}
				<p class="mb-4 text-[0.9rem] text-emerald-400 font-bold">¡Completada!</p>
			{:else if isCurrent}
				<p class="mb-4 text-[0.9rem] text-amber-400 font-bold animate-pulse">Siguiente nivel</p>
			{/if}

			<!-- Estrellas -->
			{#if stars > 0}
				<div class="mb-5 flex justify-center gap-2">
					{#each Array(3) as _, i}
						<span class="text-2xl transition-all duration-300" class:scale-110={i < stars} class:opacity-100={i < stars} class:opacity-25={i >= stars}>
							⭐
						</span>
					{/each}
				</div>
			{:else}
				<div class="mb-5 flex justify-center gap-2">
					{#each Array(3) as _}
						<span class="text-2xl opacity-25">⭐</span>
					{/each}
				</div>
			{/if}

			<!-- Info adicional -->
			<div class="mb-6 rounded-2xl bg-[#1E1E2F] p-4">
				<p class="text-[0.85rem] text-[#94A3B8]">
					Resuelve todas las multiplicaciones de la tabla del <strong class="text-white">{table}</strong> para ganar hasta 3 estrellas.
				</p>
			</div>

			<!-- Botones -->
			<div class="flex gap-3">
				<button
					class="flex-1 min-h-[50px] cursor-pointer rounded-2xl border-2 border-gray-600 bg-transparent text-[0.9rem] font-bold text-gray-300 transition-all duration-200 hover:border-gray-400 hover:text-white active:scale-95"
					onclick={handleClose}
				>
					Cerrar
				</button>
				<button
					class="flex-1 min-h-[50px] cursor-pointer rounded-2xl border-none bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-[0.9rem] font-bold text-[#1E1E2F] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95"
					onclick={handlePlay}
				>
					¡Jugar! 🚀
				</button>
			</div>
		</div>
	</div>
{/if}
