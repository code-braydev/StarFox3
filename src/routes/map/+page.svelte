<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';
	import MapNode from '$lib/components/map/MapNode.svelte';
	import MapModal from '$lib/components/map/MapModal.svelte';
	import CharacterCompanion from '$lib/components/map/CharacterCompanion.svelte';
	import FoxyIntro from '$lib/components/map/FoxyIntro.svelte';

	let showModal = $state(false);
	let selectedLevel = $state(1);
	let showIntro = $state(!game.introSeen);

	const allLevels = [
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
	];

	const phase1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	const phase2 = [10, 11, 12, 13, 14, 15, 16];
	const phase3 = [17, 18, 19, 20, 21, 22, 23, 24];
	const phase4 = [25];

	const phaseColors: Record<number, string> = {
		1: '#22C55E',
		2: '#3B82F6',
		3: '#FBBF24',
		4: '#EF4444'
	};

	const phaseNames: Record<number, string> = {
		1: 'Fase 1 - Inicio',
		2: 'Fase 2 - Avanzado',
		3: 'Fase 3 - Experto',
		4: 'Fase 4 - Jefe Final'
	};

	function getNodeStatus(level: number): 'completed' | 'current' | 'locked' {
		const completed = game.progress.levelsCompleted;
		if (completed.includes(level)) return 'completed';

		for (const l of allLevels) {
			if (!completed.includes(l)) return l === level ? 'current' : 'locked';
		}
		return 'locked';
	}

	function handleNodeClick(level: number) {
		selectedLevel = level;
		showModal = true;
	}

	function navigateTo(route: string) {
		if (game.soundEnabled) playClick();
		goto(route);
	}
</script>

<svelte:head>
	<title>Mapa Estelar - Star Fox 3</title>
</svelte:head>

<div
	class="relative flex min-h-dvh w-full flex-col items-center overflow-hidden bg-cover bg-center bg-no-repeat"
	style="background-image: url('{game.shop.equipped.background ? `/img/background/${game.shop.equipped.background}.webp` : '/img/bg-map.webp'}');"
>
	<!-- RECURSO: Fondo equipado en static/img/background/{game.shop.equipped.background}.webp -->
	<div class="absolute inset-0 bg-slate-950/85"></div>

	<!-- Header con Avatar del Jugador, Marco, Nombre y Estadísticas -->
	<header
		class="relative z-20 flex w-full flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 bg-slate-950/60 px-6 py-3 backdrop-blur-sm max-md:px-4 max-md:py-2.5"
	>
		<!-- Avatar del Jugador + Nombre -->
		<div class="flex items-center gap-3">
			<div class="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 p-0.5">
				<!-- RECURSO: Cabeza del jugador static/img/characters/{game.player.avatar || 'foxy'}.webp -->
				<img
					src="/img/avatar-foxy.webp"
					alt={game.player.name || 'Piloto'}
					class="h-full w-full rounded-lg object-contain"
				/>
				<!-- RECURSO: Marco equipado en static/img/frames/{game.shop.equipped.frame}.png -->
				{#if game.shop.equipped.frame}
					<div
						class="pointer-events-none absolute inset-0 rounded-xl border-2
							{game.shop.equipped.frame === 'frame-fire' ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : ''}
							{game.shop.equipped.frame === 'frame-wood' ? 'border-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.7)]' : ''}
							{game.shop.equipped.frame === 'frame-gold' ? 'border-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)]' : ''}
							{game.shop.equipped.frame === 'frame-crystal' ? 'border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]' : ''}
							{game.shop.equipped.frame === 'frame-robot' ? 'border-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.8)]' : ''}
						"
					></div>
				{:else}
					<div class="pointer-events-none absolute inset-0 rounded-xl border border-amber-400/40"></div>
				{/if}
			</div>

			<div class="flex flex-col">
				<span class="font-arcade text-xs text-white max-md:text-[0.65rem]">
					{game.player.name || 'PILOTO'}
				</span>
				<div class="flex items-center gap-2 text-[0.65rem] text-gray-400">
					<span>⚡ {game.energy.current}/{game.energy.max}</span>
					<span>💎 {game.progress.gems}</span>
				</div>
			</div>
		</div>

		<!-- Título Central -->
		<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:hidden">
			MAPA ESTELAR
		</h1>

		<!-- Estadísticas: Estrellas Totales y Niveles -->
		<div class="flex items-center gap-4 max-md:gap-2">
			<!-- Estrellas totales ganadas (Suma real de todas las estrellas) -->
			<div class="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-[#252540] px-3 py-1.5" title="Estrellas totales acumuladas">
				<span class="text-base max-md:text-sm">⭐</span>
				<span class="font-arcade text-xs text-[#FBBF24] max-md:text-[0.65rem]">
					{game.progress.totalStars}
				</span>
			</div>

			<!-- Niveles superados -->
			<div class="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-[#252540] px-3 py-1.5" title="Sectores completados">
				<span class="text-base max-md:text-sm">🚀</span>
				<span class="font-arcade text-xs text-cyan-300 max-md:text-[0.65rem]">
					{game.progress.levelsCompleted.length}/25
				</span>
			</div>
		</div>
	</header>

	<!-- Contenido principal -->
	<div
		class="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center gap-6 overflow-y-auto px-6 py-6 max-md:px-4 max-md:py-4"
	>
		<!-- Personaje al lado del Mapa con sus accesorios y bocadillo de diálogo -->
		<div class="w-full max-w-2xl">
			<CharacterCompanion />
		</div>

		<!-- Navegación rápida -->
		<div class="flex flex-wrap justify-center gap-3">
			<button
				class="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-600 bg-[#252540] px-4 py-2 text-xs font-bold text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
				onclick={() => navigateTo('/profile')}
			>
				👤 Perfil
			</button>
			<button
				class="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-600 bg-[#252540] px-4 py-2 text-xs font-bold text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
				onclick={() => navigateTo('/shop')}
			>
				🛒 Tienda
			</button>
			<button
				class="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-600 bg-[#252540] px-4 py-2 text-xs font-bold text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
				onclick={() => navigateTo('/medals')}
			>
				🏆 Medallas
			</button>
			<button
				class="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-600 bg-[#252540] px-4 py-2 text-xs font-bold text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
				onclick={() => navigateTo('/minigames')}
			>
				⚡ Minijuegos
			</button>
			<button
				class="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-cyan-500/50 bg-[#252540] px-4 py-2 text-xs font-bold text-cyan-300 transition-all hover:border-cyan-400 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
				onclick={() => navigateTo('/training')}
			>
				🎯 Simulador
			</button>
		</div>

		<!-- Fase 1 -->
		<div class="w-full">
			<div class="mb-3 flex items-center justify-center gap-2">
				<div class="h-3 w-3 rounded-full" style="background-color: {phaseColors[1]}"></div>
				<h2 class="text-xs font-bold" style="color: {phaseColors[1]}">{phaseNames[1]}</h2>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-2 max-md:gap-1.5">
				{#each phase1 as lvl, i (lvl)}
					{#if i > 0}
						<span class="text-xs text-gray-600">→</span>
					{/if}
					<MapNode
						table={lvl}
						status={getNodeStatus(lvl)}
						stars={game.progress.stars[lvl] ?? 0}
						onclick={() => handleNodeClick(lvl)}
					/>
				{/each}
			</div>
		</div>

		<!-- Fase 2 -->
		<div class="w-full">
			<div class="mb-3 flex items-center justify-center gap-2">
				<div class="h-3 w-3 rounded-full" style="background-color: {phaseColors[2]}"></div>
				<h2 class="text-xs font-bold" style="color: {phaseColors[2]}">{phaseNames[2]}</h2>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-2 max-md:gap-1.5">
				{#each phase2 as lvl, i (lvl)}
					{#if i > 0}
						<span class="text-xs text-gray-600">→</span>
					{/if}
					<MapNode
						table={lvl}
						status={getNodeStatus(lvl)}
						stars={game.progress.stars[lvl] ?? 0}
						onclick={() => handleNodeClick(lvl)}
					/>
				{/each}
			</div>
		</div>

		<!-- Fase 3 -->
		<div class="w-full">
			<div class="mb-3 flex items-center justify-center gap-2">
				<div class="h-3 w-3 rounded-full" style="background-color: {phaseColors[3]}"></div>
				<h2 class="text-xs font-bold" style="color: {phaseColors[3]}">{phaseNames[3]}</h2>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-2 max-md:gap-1.5">
				{#each phase3 as lvl, i (lvl)}
					{#if i > 0}
						<span class="text-xs text-gray-600">→</span>
					{/if}
					<MapNode
						table={lvl}
						status={getNodeStatus(lvl)}
						stars={game.progress.stars[lvl] ?? 0}
						onclick={() => handleNodeClick(lvl)}
					/>
				{/each}
			</div>
		</div>

		<!-- Fase 4 -->
		<div class="w-full">
			<div class="mb-3 flex items-center gap-2">
				<div class="h-3 w-3 rounded-full" style="background-color: {phaseColors[4]}"></div>
				<h2 class="text-xs font-bold" style="color: {phaseColors[4]}">{phaseNames[4]}</h2>
			</div>
			<div class="flex justify-center">
				{#each phase4 as lvl (lvl)}
					<MapNode
						table={lvl}
						status={getNodeStatus(lvl)}
						stars={game.progress.stars[lvl] ?? 0}
						onclick={() => handleNodeClick(lvl)}
					/>
				{/each}
			</div>
		</div>
	</div>

	<!-- Footer: Leyenda -->
	<footer
		class="relative z-20 flex w-full justify-center gap-6 px-6 py-4 max-md:gap-4 max-md:px-4 max-md:py-3"
	>
		<div class="flex items-center gap-2">
			<div class="h-3 w-3 rounded-full border border-amber-400 bg-amber-400/50"></div>
			<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">Completado</span>
		</div>
		<div class="flex items-center gap-2">
			<div
				class="h-3 w-3 animate-pulse rounded-full border border-amber-400/80 bg-amber-400/30"
			></div>
			<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">Siguiente</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="h-3 w-3 rounded-full border border-gray-600 bg-gray-600/50 opacity-50"></div>
			<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">Bloqueado</span>
		</div>
	</footer>
</div>

<!-- Modal de info -->
<MapModal
	open={showModal}
	table={selectedLevel}
	onClose={() => {
		showModal = false;
	}}
/>

<!-- Intro de Foxy -->
<FoxyIntro
	open={showIntro}
	onClose={() => {
		showIntro = false;
	}}
/>
