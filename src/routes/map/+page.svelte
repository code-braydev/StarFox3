<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { goto } from '$app/navigation';
	import MapNode from '$lib/components/map/MapNode.svelte';
	import MapPath from '$lib/components/map/MapPath.svelte';
	import MapModal from '$lib/components/map/MapModal.svelte';
	import FoxyDialog from '$lib/components/map/FoxyDialog.svelte';

	let showModal = $state(false);
	let selectedTable = $state(2);

	// Determinar qué tablas están completadas y cuál es la actual
	let completedUpTo = $derived(() => {
		const completed = game.progress.tablesCompleted;
		for (let t = 2; t <= 9; t++) {
			if (!completed.includes(t)) return t - 1;
		}
		return 9;
	});

	function getNodeStatus(table: number): 'completed' | 'current' | 'locked' {
		const completed = game.progress.tablesCompleted;
		if (completed.includes(table)) return 'completed';

		// El siguiente nivel no completado es el "actual"
		for (let t = 2; t <= 9; t++) {
			if (!completed.includes(t)) return t === table ? 'current' : 'locked';
		}
		return 'locked';
	}

	function handleNodeClick(table: number) {
		selectedTable = table;
		showModal = true;
	}

	// Posiciones de los nodos en la serpentina (desktop)
	const nodePositions: Record<number, { row: string; col: string }> = {
		2: { row: 'row-start-1', col: 'col-start-1' },
		3: { row: 'row-start-1', col: 'col-start-2' },
		4: { row: 'row-start-1', col: 'col-start-3' },
		5: { row: 'row-start-2', col: 'col-start-3' },
		6: { row: 'row-start-2', col: 'col-start-2' },
		7: { row: 'row-start-2', col: 'col-start-1' },
		8: { row: 'row-start-3', col: 'col-start-1' },
		9: { row: 'row-start-3', col: 'col-start-2' }
	};

	const levelNames: Record<number, string> = {
		2: 'Planeta Acuoso',
		3: 'Planeta Verde',
		4: 'Planeta Dorado',
		5: 'Planeta Púrpura',
		6: 'Planeta Carmesí',
		7: 'Planeta de Hielo',
		8: 'Planeta Ígneo',
		9: 'Planeta Cósmico'
	};
</script>

<div class="relative flex min-h-dvh w-full flex-col items-center overflow-hidden bg-[url('/img/bg-map.webp')] bg-cover bg-center bg-no-repeat">
	<!-- Overlay oscuro -->
	<div class="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]"></div>

	<!-- Header: Info del jugador -->
	<header class="relative z-20 flex w-full items-center justify-between px-6 py-4 max-md:px-4 max-md:py-3">
		<div class="flex items-center gap-3">
			<span class="text-lg max-md:text-base">💎</span>
			<span class="font-arcade text-sm text-[#FBBF24] max-md:text-xs">{game.progress.gems}</span>
		</div>
		<h1 class="font-arcade text-sm text-[#FBBF24] tracking-wider max-md:text-xs">MAPA ESTELAR</h1>
		<div class="flex items-center gap-3">
			<span class="text-lg max-md:text-base">⭐</span>
			<span class="font-arcade text-sm text-[#FBBF24] max-md:text-xs">
				{game.progress.tablesCompleted.length}/8
			</span>
		</div>
	</header>

	<!-- Contenido principal -->
	<div class="relative z-10 flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-8 max-md:px-4 max-md:py-4">
		<!-- Foxy Dialog -->
		<div class="mb-8 w-full max-w-md max-md:mb-5">
			<FoxyDialog />
		</div>

		<!-- Mapa serpentina -->
		<div class="relative w-full max-w-[700px]">
			<!-- SVG Paths conectoras -->
			<MapPath completedUpTo={completedUpTo()} />

			<!-- Grid de nodos -->
			<div class="relative z-10 grid grid-cols-3 grid-rows-3 gap-y-16 gap-x-8 px-8 max-md:gap-y-12 max-md:gap-x-4 max-md:px-4">
				<!-- Fila 1: 2 → 3 → 4 -->
				<div class="flex items-center justify-center {nodePositions[2].row} {nodePositions[2].col}">
					<MapNode table={2} status={getNodeStatus(2)} stars={game.progress.stars[2] ?? 0} onclick={() => handleNodeClick(2)} />
				</div>
				<div class="flex items-center justify-center {nodePositions[3].row} {nodePositions[3].col}">
					<MapNode table={3} status={getNodeStatus(3)} stars={game.progress.stars[3] ?? 0} onclick={() => handleNodeClick(3)} />
				</div>
				<div class="flex items-center justify-center {nodePositions[4].row} {nodePositions[4].col}">
					<MapNode table={4} status={getNodeStatus(4)} stars={game.progress.stars[4] ?? 0} onclick={() => handleNodeClick(4)} />
				</div>

				<!-- Fila 2: 7 ← 6 ← 5 -->
				<div class="flex items-center justify-center {nodePositions[5].row} {nodePositions[5].col}">
					<MapNode table={5} status={getNodeStatus(5)} stars={game.progress.stars[5] ?? 0} onclick={() => handleNodeClick(5)} />
				</div>
				<div class="flex items-center justify-center {nodePositions[6].row} {nodePositions[6].col}">
					<MapNode table={6} status={getNodeStatus(6)} stars={game.progress.stars[6] ?? 0} onclick={() => handleNodeClick(6)} />
				</div>
				<div class="flex items-center justify-center {nodePositions[7].row} {nodePositions[7].col}">
					<MapNode table={7} status={getNodeStatus(7)} stars={game.progress.stars[7] ?? 0} onclick={() => handleNodeClick(7)} />
				</div>

				<!-- Fila 3: 8 → 9 -->
				<div class="flex items-center justify-center {nodePositions[8].row} {nodePositions[8].col}">
					<MapNode table={8} status={getNodeStatus(8)} stars={game.progress.stars[8] ?? 0} onclick={() => handleNodeClick(8)} />
				</div>
				<div class="flex items-center justify-center {nodePositions[9].row} {nodePositions[9].col}">
					<MapNode table={9} status={getNodeStatus(9)} stars={game.progress.stars[9] ?? 0} onclick={() => handleNodeClick(9)} />
				</div>
			</div>
		</div>
	</div>

	<!-- Footer: Leyenda -->
	<footer class="relative z-20 flex w-full justify-center gap-6 px-6 py-4 max-md:gap-4 max-md:px-4 max-md:py-3">
		<div class="flex items-center gap-2">
			<div class="h-3 w-3 rounded-full border border-amber-400 bg-amber-400/50"></div>
			<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">Completado</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="h-3 w-3 rounded-full border border-amber-400/80 bg-amber-400/30 animate-pulse"></div>
			<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">Siguiente</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="h-3 w-3 rounded-full border border-gray-600 bg-gray-600/50 opacity-50"></div>
			<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">Bloqueado</span>
		</div>
	</footer>
</div>

<!-- Modal de info -->
<MapModal open={showModal} table={selectedTable} onClose={() => { showModal = false; }} />
