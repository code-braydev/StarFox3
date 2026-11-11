<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';
	import { getCharacterHead } from '$lib/constants/characters';
	import { getEquippedBackground, handleAvatarError } from '$lib/constants/assets';
	import { MapNode, MapModal, CharacterCompanion, FoxyIntro } from '$lib/components/map';

	let showModal = $state(false);
	let selectedLevel = $state(1);
	let showIntro = $state(!game.introSeen);

	const allLevels = [
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
	];

	const phases = [
		{ id: 1, name: 'Fase 1 - Inicio', color: '#22C55E', levels: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
		{ id: 2, name: 'Fase 2 - Avanzado', color: '#3B82F6', levels: [10, 11, 12, 13, 14, 15, 16] },
		{
			id: 3,
			name: 'Fase 3 - Experto',
			color: '#FBBF24',
			levels: [17, 18, 19, 20, 21, 22, 23, 24]
		},
		{ id: 4, name: 'Fase 4 - Jefe Final', color: '#EF4444', levels: [25] }
	];

	const navLinks = [
		{ label: '👤 Perfil', route: '/profile', variant: 'default' },
		{ label: '🛒 Tienda', route: '/shop', variant: 'default' },
		{ label: '🏆 Medallas', route: '/medals', variant: 'default' },
		{ label: '🎯 Simulador', route: '/training', variant: 'accent' }
	] as const;

	const frameClasses: Record<string, string> = {
		'frame-fire': 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]',
		'frame-wood': 'border-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.7)]',
		'frame-gold': 'border-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)]',
		'frame-crystal': 'border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]',
		'frame-robot': 'border-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.8)]'
	};

	let nextLevel = $derived(
		allLevels.find((l) => !game.progress.levelsCompleted.includes(l)) ?? null
	);

	function getNodeStatus(level: number): 'completed' | 'current' | 'locked' {
		if (game.progress.levelsCompleted.includes(level)) return 'completed';
		return level === nextLevel ? 'current' : 'locked';
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
	style="background-image: url('{getEquippedBackground(game.shop.equipped.background)}');"
>
	<div class="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/35 to-slate-950/60"></div>

	<!-- Header con Avatar del Jugador, Marco, Nombre y Estadísticas -->
	<header
		class="theme-header relative z-20 flex w-full flex-wrap items-center justify-between gap-3 border-b-2 border-amber-400/40 bg-[#252540]/75 px-6 py-3 backdrop-blur-md max-md:px-4 max-md:py-2.5"
	>
		<!-- Avatar del Jugador + Nombre -->
		<div class="flex items-center gap-3">
			<div class="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 p-0.5">
				<img
					src={getCharacterHead(game.player.avatar || 'foxy')}
					alt={game.player.name || 'Piloto'}
					class="h-full w-full rounded-lg object-cover"
					onerror={(e) => handleAvatarError(e)}
				/>
				{#if game.shop.equipped.frame && frameClasses[game.shop.equipped.frame]}
					<div
						class="pointer-events-none absolute inset-0 rounded-xl border-2 {frameClasses[
							game.shop.equipped.frame
						]}"
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
			<div
				class="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-[#252540] px-3 py-1.5"
				title="Estrellas totales acumuladas"
			>
				<span class="text-base max-md:text-sm">⭐</span>
				<span class="font-arcade text-xs text-[#FBBF24] max-md:text-[0.65rem]">
					{game.progress.totalStars}
				</span>
			</div>

			<div
				class="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-[#252540] px-3 py-1.5"
				title="Sectores completados"
			>
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
			{#each navLinks as link (link.route)}
				<button
					class="flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-[#252540] px-4 py-2 text-xs font-bold transition-all hover:text-white max-md:px-3 max-md:text-[0.65rem] {link.variant ===
					'accent'
						? 'border-cyan-500/50 text-cyan-300 hover:border-cyan-400'
						: 'border-gray-600 text-gray-300 hover:border-amber-400/50'}"
					onclick={() => navigateTo(link.route)}
				>
					{link.label}
				</button>
			{/each}
		</div>

		<!-- Fases del mapa -->
		{#each phases as phase (phase.id)}
			<div class="w-full">
				<div class="mb-3 flex items-center justify-center gap-2">
					<div class="h-3 w-3 rounded-full" style="background-color: {phase.color}"></div>
					<h2 class="text-xs font-bold" style="color: {phase.color}">{phase.name}</h2>
				</div>
				<div class="flex flex-wrap items-center justify-center gap-2 max-md:gap-1.5">
					{#each phase.levels as lvl, i (lvl)}
						{#if i > 0}
							<span class="text-xs text-gray-600">→</span>
						{/if}
						<MapNode
							table={lvl}
							status={getNodeStatus(lvl)}
							stars={game.progress.stars[lvl] ?? 0}
							hasShip={nextLevel === null && lvl === 25}
							onclick={() => handleNodeClick(lvl)}
						/>
					{/each}
				</div>
			</div>
		{/each}
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

<MapModal
	open={showModal}
	table={selectedLevel}
	onClose={() => {
		showModal = false;
	}}
/>

<FoxyIntro
	open={showIntro}
	onClose={() => {
		showIntro = false;
	}}
/>
