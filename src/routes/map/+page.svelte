<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';
	import MapNode from '$lib/components/map/MapNode.svelte';
	import MapModal from '$lib/components/map/MapModal.svelte';
	import FoxyDialog from '$lib/components/map/FoxyDialog.svelte';
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
	class="relative flex min-h-dvh w-full flex-col items-center overflow-hidden bg-[url('/img/bg-map.webp')] bg-cover bg-center bg-no-repeat"
>
	<div class="absolute inset-0 bg-slate-950/85"></div>

	<!-- Header -->
	<header
		class="relative z-20 flex w-full items-center justify-between px-6 py-4 max-md:px-4 max-md:py-3"
	>
		<div class="flex items-center gap-3">
			<span class="text-lg max-md:text-base">💎</span>
			<span class="font-arcade text-sm text-[#FBBF24] max-md:text-xs">{game.progress.gems}</span>
		</div>
		<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">MAPA ESTELAR</h1>
		<div class="flex items-center gap-3">
			<span class="text-lg max-md:text-base">⭐</span>
			<span class="font-arcade text-sm text-[#FBBF24] max-md:text-xs">
				{game.progress.levelsCompleted.length}/25
			</span>
		</div>
	</header>

	<!-- Contenido principal -->
	<div
		class="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center gap-6 overflow-y-auto px-6 py-6 max-md:px-4 max-md:py-4"
	>
		<!-- Foxy Dialog -->
		<div class="w-full max-w-md">
			<FoxyDialog />
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
		</div>

		<!-- Fase 1 -->
		<div class="w-full">
			<div class="mb-3 flex items-center gap-2">
				<div class="h-3 w-3 rounded-full" style="background-color: {phaseColors[1]}"></div>
				<h2 class="text-xs font-bold" style="color: {phaseColors[1]}">{phaseNames[1]}</h2>
			</div>
			<div class="grid grid-cols-5 gap-3 max-md:grid-cols-3 max-md:gap-2">
				{#each phase1 as lvl (lvl)}
					<div class="flex items-center justify-center">
						<MapNode
							table={lvl}
							status={getNodeStatus(lvl)}
							stars={game.progress.stars[lvl] ?? 0}
							onclick={() => handleNodeClick(lvl)}
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Fase 2 -->
		<div class="w-full">
			<div class="mb-3 flex items-center gap-2">
				<div class="h-3 w-3 rounded-full" style="background-color: {phaseColors[2]}"></div>
				<h2 class="text-xs font-bold" style="color: {phaseColors[2]}">{phaseNames[2]}</h2>
			</div>
			<div class="grid grid-cols-4 gap-3 max-md:grid-cols-3 max-md:gap-2">
				{#each phase2 as lvl (lvl)}
					<div class="flex items-center justify-center">
						<MapNode
							table={lvl}
							status={getNodeStatus(lvl)}
							stars={game.progress.stars[lvl] ?? 0}
							onclick={() => handleNodeClick(lvl)}
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Fase 3 -->
		<div class="w-full">
			<div class="mb-3 flex items-center gap-2">
				<div class="h-3 w-3 rounded-full" style="background-color: {phaseColors[3]}"></div>
				<h2 class="text-xs font-bold" style="color: {phaseColors[3]}">{phaseNames[3]}</h2>
			</div>
			<div class="grid grid-cols-4 gap-3 max-md:grid-cols-2 max-md:gap-2">
				{#each phase3 as lvl (lvl)}
					<div class="flex items-center justify-center">
						<MapNode
							table={lvl}
							status={getNodeStatus(lvl)}
							stars={game.progress.stars[lvl] ?? 0}
							onclick={() => handleNodeClick(lvl)}
						/>
					</div>
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
