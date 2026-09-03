<script lang="ts">
	import { playClick } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';
	import spaceshipSvg from '$lib/assets/icons/spaceship.svg';

	let { table, status, stars = 0, onclick }: {
		table: number;
		status: 'completed' | 'current' | 'locked';
		stars?: number;
		onclick?: () => void;
	} = $props();

	const planetColors: Record<number, { bg: string; border: string; glow: string }> = {
		2: { bg: 'from-blue-500 to-blue-700', border: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
		3: { bg: 'from-emerald-500 to-emerald-700', border: '#22c55e', glow: 'rgba(34,197,94,0.5)' },
		4: { bg: 'from-amber-500 to-amber-700', border: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
		5: { bg: 'from-purple-500 to-purple-700', border: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
		6: { bg: 'from-rose-500 to-rose-700', border: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
		7: { bg: 'from-cyan-500 to-cyan-700', border: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
		8: { bg: 'from-orange-500 to-orange-700', border: '#f97316', glow: 'rgba(249,115,22,0.5)' },
		9: { bg: 'from-indigo-500 to-indigo-700', border: '#6366f1', glow: 'rgba(99,102,241,0.5)' }
	};

	let colors = $derived(planetColors[table] ?? planetColors[2]);

	function handleClick() {
		if (status === 'locked') return;
		if (game.soundEnabled) playClick();
		onclick?.();
	}

	const isCompleted = status === 'completed';
	const isCurrent = status === 'current';
	const isLocked = status === 'locked';
</script>

<button
	class="group relative flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
	disabled={isLocked}
	onclick={handleClick}
	aria-label="Tabla del {table}{isCompleted ? ' - completada' : isCurrent ? ' - siguiente' : ' - bloqueada'}"
>
	<!-- Nave de Foxy (solo en nodo actual) -->
	{#if isCurrent}
		<div class="absolute -top-10 z-10 animate-[float-spaceship_2s_ease-in-out_infinite]">
			<img src={spaceshipSvg} alt="Nave de Foxy" class="h-10 w-10 drop-shadow-lg" />
		</div>
	{/if}

	<!-- Planeta -->
	<div
		class="relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] bg-gradient-to-br text-white text-sm font-bold transition-all duration-300
			max-md:h-12 max-md:w-12 max-md:text-xs"
		class:border-amber-400={isCompleted || isCurrent}
		class:border-gray-600={isLocked}
		class:opacity-40={isLocked}
		class:animate-[pulse-node_2s_ease-in-out_infinite]={isCurrent}
		style:box-shadow={isCompleted || isCurrent ? `0 0 20px ${colors.glow}` : undefined}
	>
		{#if isCompleted}
			<!-- Interior del planeta completado -->
			<div class="absolute inset-1 rounded-full bg-gradient-to-br {colors.bg} opacity-80"></div>
			<span class="relative z-10 font-arcade text-[0.6rem] max-md:text-[0.5rem]">{table}</span>
		{:else if isCurrent}
			<!-- Interior del planeta actual -->
			<div class="absolute inset-1 rounded-full bg-gradient-to-br {colors.bg} opacity-90"></div>
			<span class="relative z-10 font-arcade text-[0.6rem] max-md:text-[0.5rem]">{table}</span>
		{:else}
			<!-- Interior del planeta bloqueado -->
			<div class="absolute inset-1 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 opacity-50"></div>
			<span class="relative z-10 font-arcade text-[0.6rem] max-md:text-[0.5rem] text-gray-400">{table}</span>
		{/if}

		<!-- Anillo decorativo (solo completado/actual) -->
		{#if !isLocked}
			<div
				class="absolute -inset-2 rounded-full border border-dashed opacity-30"
				style:border-color={colors.border}
			></div>
		{/if}
	</div>

	<!-- Estrellas ganadas -->
	{#if isCompleted && stars > 0}
		<div class="flex gap-0.5 mt-1">
			{#each Array(3) as _, i}
				<span class="text-[0.55rem] max-md:text-[0.45rem]" class:opacity-100={i < stars} class:opacity-25={i >= stars}>
					⭐
				</span>
			{/each}
		</div>
	{:else if isCurrent}
		<span class="text-[0.6rem] text-amber-400 font-bold mt-1 animate-pulse max-md:text-[0.5rem]">¡JUGAR!</span>
	{:else}
		<span class="text-[0.6rem] text-gray-500 mt-1 max-md:text-[0.5rem]">🔒</span>
	{/if}

	<!-- Hover ring -->
	{#if !isLocked}
		<div class="absolute inset-0 rounded-full border-2 border-transparent transition-all duration-300 group-hover:border-white/30 group-hover:scale-110"></div>
	{/if}
</button>
