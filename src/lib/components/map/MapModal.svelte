<script lang="ts">
	import { goto } from '$app/navigation';
	import { playClick, playSuccess, playError } from '$lib/audio/audio';
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

	// Costo de energía: si ya está superado es Práctica Libre (0⚡)
	let energyCost = $derived(isCompleted ? 0 : (currentLevel?.energyCost ?? 0));
	let hasEnoughEnergy = $derived(game.energy.current >= energyCost);

	function handlePlay() {
		if (!hasEnoughEnergy) {
			if (game.soundEnabled) playError();
			game.setRanOutOfEnergy();
			return;
		}

		if (energyCost > 0) {
			const success = game.useEnergy(energyCost);
			if (!success) {
				if (game.soundEnabled) playError();
				return;
			}
		}

		if (game.soundEnabled) playSuccess();
		onClose();
		goto(`/map/${table}`);
	}

	function handleClose() {
		if (game.soundEnabled) playClick();
		onClose();
	}

	function goToMinigames() {
		if (game.soundEnabled) playClick();
		onClose();
		goto('/minigames');
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
			class="w-full max-w-[420px] animate-scale-in rounded-3xl border-[3px] border-amber-400 bg-gradient-to-br from-[#252540] to-[#1a1a3e] p-8 text-center shadow-[0_0_35px_rgba(251,191,36,0.3)]"
		>
			<!-- Nave de Foxy -->
			<div class="mb-3 animate-[float-spaceship_2s_ease-in-out_infinite]">
				<img src={spaceshipSvg} alt="Nave de Foxy" class="mx-auto h-14 w-14" />
			</div>

			<!-- Titulo -->
			<h2 class="mb-1 font-arcade text-[1.4rem] text-[#FBBF24] max-md:text-[1.2rem]">
				{currentLevel?.name ?? 'Nivel'}
			</h2>

			<!-- Estado e Indicador de Energía -->
			<div class="mb-3 flex items-center justify-center gap-2">
				{#if isCompleted}
					<span class="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-400">
						✓ Superado · Práctica Libre (0⚡)
					</span>
				{:else if isCurrent}
					<span class="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-400">
						Misión Activa · Costo: {energyCost}⚡
					</span>
				{:else}
					<span class="text-xs text-gray-400">Costo: {energyCost}⚡</span>
				{/if}
			</div>

			<!-- Estrellas -->
			{#if stars > 0}
				<div class="mb-4 flex justify-center gap-2">
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
				<div class="mb-4 flex justify-center gap-2">
					{#each Array(3) as _, i (i)}
						<span class="text-2xl opacity-25">⭐</span>
					{/each}
				</div>
			{/if}

			<!-- Info adicional -->
			<div class="mb-4 rounded-2xl bg-[#1E1E2F] p-4 text-left">
				<p class="text-[0.85rem] text-[#94A3B8]">
					{currentLevel?.description ?? ''}
				</p>
				<div class="mt-2 flex items-center justify-between border-t border-gray-700/50 pt-2 text-xs">
					<span class="text-gray-400">Tu energía actual:</span>
					<span class="font-arcade {hasEnoughEnergy ? 'text-cyan-400' : 'text-rose-400'}">
						⚡ {game.energy.current}/{game.energy.max}
					</span>
				</div>
			</div>

			<!-- Alerta de falta de energía -->
			{#if !hasEnoughEnergy}
				<div class="mb-4 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-xs text-rose-300">
					<p class="font-bold">⚠️ ¡Combustible insuficiente!</p>
					<p class="mt-0.5 text-[0.7rem] text-rose-200">
						Necesitas {energyCost}⚡ pero solo tienes {game.energy.current}⚡. Realiza tareas en los minijuegos para recargar.
					</p>
					<button
						class="mt-2 w-full cursor-pointer rounded-lg bg-amber-400 py-1.5 font-arcade text-[0.65rem] text-slate-950 transition-all hover:brightness-110"
						onclick={goToMinigames}
					>
						⚡ IR A MINIJUEGOS A RECARGAR
					</button>
				</div>
			{/if}

			<!-- Botones -->
			<div class="flex gap-3">
				<button
					class="min-h-[48px] flex-1 cursor-pointer rounded-2xl border-2 border-gray-600 bg-transparent text-[0.85rem] font-bold text-gray-300 transition-all duration-200 hover:border-gray-400 hover:text-white active:scale-95"
					onclick={handleClose}
				>
					Cerrar
				</button>
				<button
					class="min-h-[48px] flex-1 rounded-2xl border-none px-6 py-3 font-arcade text-xs font-bold transition-all duration-200
						{hasEnoughEnergy
						? 'cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 text-[#1E1E2F] hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95'
						: 'cursor-not-allowed bg-gray-700 text-gray-400 opacity-60'}"
					disabled={!hasEnoughEnergy}
					onclick={handlePlay}
				>
					{isCompleted ? 'Practicar' : '¡Despegar!'}
				</button>
			</div>
		</div>
	</div>
{/if}
