<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { playClick, playSuccess } from '$lib/audio/audio';
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

	function toggleGodMode() {
		if (game.soundEnabled) playSuccess();
		if (game.isGodMode) {
			game.resetProgress();
		} else {
			game.activateMasterProfile();
		}
	}

	function getPhaseCompletedCount(levels: number[]): number {
		return levels.filter((l) => game.progress.levelsCompleted.includes(l)).length;
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
				<div class="flex items-center gap-2">
					<span class="font-arcade text-xs text-white max-md:text-[0.65rem]">
						{game.player.name || 'PILOTO'}
					</span>
					{#if session.isStudent && session.studentSession}
						<button
							type="button"
							class="cursor-pointer rounded-md border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[0.6rem] font-semibold text-cyan-300 transition-all hover:border-cyan-400"
							onclick={() => navigateTo('/profile')}
							title="Conectado al curso {session.studentSession.className} ({session.studentSession.classCode})"
						>
							🏫 {session.studentSession.className}
						</button>
					{/if}
				</div>
				<div class="flex items-center gap-2 text-[0.65rem] text-gray-400">
					<span>⚡ {game.energy.current}/{game.energy.max}</span>
					<span>💎 {game.progress.gems}</span>
				</div>
			</div>
		</div>

		<!-- Navegación rápida integrada en el header para dar más espacio al mapa -->
		<nav class="flex flex-wrap items-center justify-center gap-2 max-sm:order-3 max-sm:w-full">
			{#each navLinks as link (link.route)}
				<button
					class="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 bg-[#1e1e38]/90 px-3.5 py-1.5 text-xs font-bold transition-all hover:scale-105 hover:text-white max-md:px-2.5 max-md:text-[0.65rem] {link.variant ===
					'accent'
						? 'border-cyan-500/50 text-cyan-300 hover:border-cyan-400'
						: 'border-gray-600/80 text-gray-300 hover:border-amber-400/50'}"
					onclick={() => navigateTo(link.route)}
				>
					{link.label}
				</button>
			{/each}
		</nav>

		<!-- Estadísticas + Botón Modo Dios en la esquina superior derecha -->
		<div class="flex items-center gap-2.5 max-md:gap-1.5">
			<div
				class="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-[#1e1e38] px-3 py-1.5"
				title="Estrellas totales acumuladas"
			>
				<span class="text-base max-md:text-sm">⭐</span>
				<span class="font-arcade text-xs text-[#FBBF24] max-md:text-[0.65rem]">
					{game.progress.totalStars}
				</span>
			</div>

			<div
				class="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-[#1e1e38] px-3 py-1.5"
				title="Sectores completados"
			>
				<span class="text-base max-md:text-sm">🚀</span>
				<span class="font-arcade text-xs text-cyan-300 max-md:text-[0.65rem]">
					{game.progress.levelsCompleted.length}/25
				</span>
			</div>

			<!-- TEMPORAL: Botón Modo Dios en la esquina superior derecha para pruebas (borrar al final) -->
			<button
				type="button"
				class="cursor-pointer rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all hover:scale-105 max-md:px-2 max-md:text-[0.65rem]
					{game.isGodMode
					? 'border-emerald-400 bg-emerald-500/25 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.45)]'
					: 'border-amber-400/60 bg-amber-500/15 text-amber-300 hover:border-amber-400 hover:bg-amber-500/25'}"
				onclick={toggleGodMode}
				title={game.isGodMode
					? 'Modo Dios activo (Clic para volver a progreso normal)'
					: 'Activar Modo Dios (Desbloquear todos los niveles, personajes, tienda y medallas)'}
			>
				👑 {game.isGodMode ? 'Modo Dios: ON' : 'Modo Dios'}
			</button>
		</div>
	</header>

	<!-- Contenido principal: Mapa de niveles espacioso y visualmente atractivo -->
	<div
		class="relative z-10 flex w-full max-w-6xl flex-1 flex-col items-center gap-7 overflow-y-auto px-6 pt-8 pb-32 max-md:px-4 max-md:pt-5 max-md:pb-28"
	>
		<div class="text-center">
			<h1 class="font-arcade text-base tracking-[0.2em] text-[#FBBF24] drop-shadow-[0_2px_10px_rgba(251,191,36,0.35)] max-md:text-xs">
				✨ MAPA ESTELAR DE MISIONES ✨
			</h1>
			<p class="mt-1.5 text-xs text-gray-300/80">
				Explora los sectores galácticos y calibra los motores de tu nave
			</p>
		</div>

		<!-- Fases del mapa en tarjetas amplias con espacio generoso entre nodos -->
		<div class="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
			{#each phases as phase (phase.id)}
				{@const completedCount = getPhaseCompletedCount(phase.levels)}
				<div
					class="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all hover:border-white/20 max-md:p-4
						{phase.id === 4 ? 'lg:col-span-2' : ''}"
					style="box-shadow: inset 0 1px 0 0 {phase.color}33, 0 8px 30px rgba(0,0,0,0.35);"
				>
					<div class="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
						<div class="flex items-center gap-2.5">
							<div
								class="h-3.5 w-3.5 rounded-full"
								style="background-color: {phase.color}; box-shadow: 0 0 10px {phase.color};"
							></div>
							<h2 class="font-arcade text-xs tracking-wide" style="color: {phase.color}">
								{phase.name}
							</h2>
						</div>
						<span
							class="rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold"
							style="border-color: {phase.color}55; color: {phase.color}; background-color: {phase.color}15;"
						>
							{completedCount}/{phase.levels.length} sectores
						</span>
					</div>

					<div class="flex flex-wrap items-center justify-center gap-4 py-2 max-md:gap-2.5">
						{#each phase.levels as lvl, i (lvl)}
							{#if i > 0}
								<span class="text-sm font-bold text-gray-500/70 select-none">→</span>
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

		<!-- Leyenda centrada debajo de las fases -->
		<div
			class="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-2.5 backdrop-blur-sm max-md:gap-4 max-md:px-4"
		>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full border border-amber-400 bg-amber-400/50"></div>
				<span class="text-xs text-gray-300 max-md:text-[0.65rem]">Completado</span>
			</div>
			<div class="flex items-center gap-2">
				<div
					class="h-3 w-3 animate-pulse rounded-full border border-amber-400/80 bg-amber-400/30"
				></div>
				<span class="text-xs text-gray-300 max-md:text-[0.65rem]">Siguiente misión</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full border border-gray-600 bg-gray-600/50 opacity-50"></div>
				<span class="text-xs text-gray-300 max-md:text-[0.65rem]">Bloqueado</span>
			</div>
		</div>
	</div>

	<!-- Compañero y diálogo compacto fijo abajo a la izquierda -->
	<div class="fixed bottom-4 left-4 z-30 max-sm:bottom-3 max-sm:left-3">
		<CharacterCompanion />
	</div>
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
