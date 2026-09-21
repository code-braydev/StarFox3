<script lang="ts">
	import { goto } from '$app/navigation';
	import { playClick, playSuccess } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';
	import spaceshipSvg from '$lib/assets/icons/spaceship.svg';
	import { levelInfo } from '$lib/constants/levels';

	let {
		open,
		table,
		onClose
	}: {
		open: boolean;
		table: number;
		onClose: () => void;
	} = $props();

	let currentLevel = $derived(levelInfo[table]);
	let stars = $derived(game.progress.stars[table] ?? 0);
	let isCompleted = $derived(game.progress.levelsCompleted.includes(table));
	let isCurrent = $derived.by(() => {
		const completed = game.progress.levelsCompleted;
		const allLevels = [
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
		];
		for (const l of allLevels) {
			if (!completed.includes(l)) return l === table;
		}
		return false;
	});

	function handlePlay() {
		if (game.soundEnabled) playSuccess();
		onClose();
		goto(`/map/${table}`);
	}

	function handleClose() {
		if (game.soundEnabled) playClick();
		onClose();
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label={currentLevel?.name ?? 'Nivel'}
		onclick={(e) => {
			if (e.target === e.currentTarget) handleClose();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') handleClose();
		}}
	>
		<div
			class="w-full max-w-[400px] animate-scale-in rounded-3xl border-[3px] border-amber-400 bg-gradient-to-br from-[#252540] to-[#1a1a3e] p-8 text-center"
		>
			<!-- Nave de Foxy -->
			<div class="mb-3 animate-[float-spaceship_2s_ease-in-out_infinite]">
				<img src={spaceshipSvg} alt="Nave de Foxy" class="mx-auto h-14 w-14" />
			</div>

			<!-- Titulo -->
			<h2 class="mb-2 font-arcade text-[1.6rem] text-[#FBBF24] max-md:text-[1.3rem]">
				{currentLevel?.name ?? 'Nivel'}
			</h2>

			<!-- Estado -->
			{#if isCompleted}
				<p class="mb-4 text-[0.9rem] font-bold text-emerald-400">¡Completada!</p>
			{:else if isCurrent}
				<p class="mb-4 animate-pulse text-[0.9rem] font-bold text-amber-400">Siguiente nivel</p>
			{/if}

			<!-- Estrellas -->
			{#if stars > 0}
				<div class="mb-5 flex justify-center gap-2">
					{#each Array(3) as _, i (i)}
						<span
							class="text-2xl transition-all duration-300"
							class:scale-110={i < stars}
							class:opacity-100={i < stars}
							class:opacity-25={i >= stars}
						>
							⭐
						</span>
					{/each}
				</div>
			{:else}
				<div class="mb-5 flex justify-center gap-2">
					{#each Array(3) as _, i (i)}
						<span class="text-2xl opacity-25">⭐</span>
					{/each}
				</div>
			{/if}

			<!-- Info adicional -->
			<div class="mb-6 rounded-2xl bg-[#1E1E2F] p-4">
				<p class="text-[0.85rem] text-[#94A3B8]">
					{currentLevel?.description ?? ''}
				</p>
			</div>

			<!-- Botones -->
			<div class="flex gap-3">
				<button
					class="min-h-[50px] flex-1 cursor-pointer rounded-2xl border-2 border-gray-600 bg-transparent text-[0.9rem] font-bold text-gray-300 transition-all duration-200 hover:border-gray-400 hover:text-white active:scale-95"
					onclick={handleClose}
				>
					Cerrar
				</button>
				<button
					class="min-h-[50px] flex-1 cursor-pointer rounded-2xl border-none bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-[0.9rem] font-bold text-[#1E1E2F] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95"
					onclick={handlePlay}
				>
					¡Despegar!
				</button>
			</div>
		</div>
	</div>
{/if}
