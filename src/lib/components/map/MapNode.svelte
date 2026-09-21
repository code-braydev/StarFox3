<script lang="ts">
	import { playClick } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';
	import spaceshipSvg from '$lib/assets/icons/spaceship.svg';
	import { levelInfo } from '$lib/constants/levels';

	let {
		table,
		status,
		stars = 0,
		onclick
	}: {
		table: number;
		status: 'completed' | 'current' | 'locked';
		stars?: number;
		onclick?: () => void;
	} = $props();

	const planetColors: Record<number, { bg: string; border: string; glow: string }> = {
		1: { bg: 'from-gray-400 to-gray-600', border: '#9ca3af', glow: 'rgba(156,163,175,0.5)' },
		2: { bg: 'from-blue-500 to-blue-700', border: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
		3: { bg: 'from-emerald-500 to-emerald-700', border: '#22c55e', glow: 'rgba(34,197,94,0.5)' },
		4: { bg: 'from-amber-500 to-amber-700', border: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
		5: { bg: 'from-purple-500 to-purple-700', border: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
		6: { bg: 'from-rose-500 to-rose-700', border: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
		7: { bg: 'from-cyan-500 to-cyan-700', border: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
		8: { bg: 'from-orange-500 to-orange-700', border: '#f97316', glow: 'rgba(249,115,22,0.5)' },
		9: { bg: 'from-indigo-500 to-indigo-700', border: '#6366f1', glow: 'rgba(99,102,241,0.5)' },
		10: { bg: 'from-sky-500 to-sky-700', border: '#0ea5e9', glow: 'rgba(14,165,233,0.5)' },
		11: { bg: 'from-teal-500 to-teal-700', border: '#14b8a6', glow: 'rgba(20,184,166,0.5)' },
		12: { bg: 'from-violet-500 to-violet-700', border: '#8b5cf6', glow: 'rgba(139,92,246,0.5)' },
		13: { bg: 'from-fuchsia-500 to-fuchsia-700', border: '#d946ef', glow: 'rgba(217,70,239,0.5)' },
		14: { bg: 'from-pink-500 to-pink-700', border: '#ec4899', glow: 'rgba(236,72,153,0.5)' },
		15: { bg: 'from-yellow-500 to-yellow-700', border: '#eab308', glow: 'rgba(234,179,8,0.5)' },
		16: { bg: 'from-red-500 to-red-700', border: '#ef4444', glow: 'rgba(239,68,68,0.5)' },
		17: { bg: 'from-lime-500 to-lime-700', border: '#84cc16', glow: 'rgba(132,204,22,0.5)' },
		18: { bg: 'from-cyan-600 to-cyan-800', border: '#0891b2', glow: 'rgba(8,145,178,0.5)' },
		19: { bg: 'from-amber-600 to-amber-800', border: '#d97706', glow: 'rgba(217,119,6,0.5)' },
		20: { bg: 'from-emerald-600 to-emerald-800', border: '#059669', glow: 'rgba(5,150,105,0.5)' },
		21: { bg: 'from-purple-600 to-purple-800', border: '#9333ea', glow: 'rgba(147,51,234,0.5)' },
		22: { bg: 'from-rose-600 to-rose-800', border: '#e11d48', glow: 'rgba(225,29,72,0.5)' },
		23: { bg: 'from-orange-600 to-orange-800', border: '#ea580c', glow: 'rgba(234,88,12,0.5)' },
		24: { bg: 'from-indigo-600 to-indigo-800', border: '#4f46e5', glow: 'rgba(79,70,229,0.5)' },
		25: { bg: 'from-red-600 to-red-900', border: '#dc2626', glow: 'rgba(220,38,38,0.8)' }
	};

	let colors = $derived(planetColors[table] ?? planetColors[2]);

	function handleClick() {
		if (status === 'locked') return;
		if (game.soundEnabled) playClick();
		onclick?.();
	}

	let isCompleted = $derived(status === 'completed');
	let isCurrent = $derived(status === 'current');
	let isLocked = $derived(status === 'locked');
</script>

<button
	class="group relative flex cursor-pointer flex-col items-center gap-1 disabled:cursor-not-allowed"
	disabled={isLocked}
	onclick={handleClick}
	aria-label="{levelInfo[table].name}{isCompleted
		? ' - completada'
		: isCurrent
			? ' - siguiente'
			: ' - bloqueada'}"
>
	<!-- Nave de Foxy (solo en nodo actual) -->
	{#if isCurrent}
		<div class="absolute -top-10 z-10 animate-[float-spaceship_2s_ease-in-out_infinite]">
			<img src={spaceshipSvg} alt="Nave de Foxy" class="h-10 w-10 drop-shadow-lg" />
		</div>
	{/if}

	<!-- Planeta -->
	<div
		class="relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] bg-gradient-to-br text-sm font-bold text-white transition-all duration-300
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
			<div
				class="absolute inset-1 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 opacity-50"
			></div>
			<span class="relative z-10 font-arcade text-[0.6rem] text-gray-400 max-md:text-[0.5rem]"
				>{table}</span
			>
		{/if}

		<!-- Anillo decorativo (solo completado/actual) -->
		{#if !isLocked}
			<div
				class="absolute -inset-2 rounded-full border border-dashed opacity-30"
				style:border-color={colors.border}
			></div>
		{/if}
	</div>

	<!-- Nombre del planeta -->
	<span
		class="mt-1 max-w-[5rem] truncate text-center text-[0.5rem] leading-tight max-md:max-w-[4rem] max-md:text-[0.4rem]"
		class:text-amber-400={isCompleted || isCurrent}
		class:text-gray-500={isLocked}
	>
		{levelInfo[table].name}
	</span>

	<!-- Estrellas ganadas -->
	{#if isCompleted && stars > 0}
		<div class="mt-0.5 flex gap-0.5">
			{#each Array(3) as _, i (i)}
				<span
					class="text-[0.55rem] max-md:text-[0.45rem]"
					class:opacity-100={i < stars}
					class:opacity-25={i >= stars}
				>
					⭐
				</span>
			{/each}
		</div>
	{:else if isCurrent}
		<span class="mt-0.5 animate-pulse text-[0.6rem] font-bold text-amber-400 max-md:text-[0.5rem]"
			>¡JUGAR!</span
		>
	{:else}
		<span class="mt-0.5 text-[0.6rem] text-gray-500 max-md:text-[0.5rem]">🔒</span>
	{/if}

	<!-- Hover ring -->
	{#if !isLocked}
		<div
			class="absolute inset-0 rounded-full border-2 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-white/30"
		></div>
	{/if}
</button>
