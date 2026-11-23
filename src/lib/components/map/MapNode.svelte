<script lang="ts">
	import { playClick } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';
	import { ASSET_PATHS } from '$lib/constants/assets';
	import { levelInfo } from '$lib/constants/levels';
	import { resolveActiveWorldTheme, type PlanetSkin } from '$lib/constants/shop';

	let {
		table,
		status,
		stars = 0,
		hasShip = false,
		onclick
	}: {
		table: number;
		status: 'completed' | 'current' | 'locked';
		stars?: number;
		hasShip?: boolean;
		onclick?: () => void;
	} = $props();

	interface PlanetPalette {
		c1: string; // luz / atmósfera superior
		c2: string; // color base del planeta
		c3: string; // sombra profunda
		feature: string; // continentes / lianas / lava / coral / grietas
		accent: string; // esporas / luces / anillos
		glow: string; // resplandor exterior
	}

	const SKIN_PALETTES: Record<PlanetSkin, PlanetPalette[]> = {
		jungle: [
			{ c1: '#86efac', c2: '#16a34a', c3: '#052e16', feature: '#15803d', accent: '#bef264', glow: 'rgba(34,197,94,0.65)' },
			{ c1: '#a3e635', c2: '#15803d', c3: '#064e3b', feature: '#047857', accent: '#fde047', glow: 'rgba(132,204,22,0.65)' },
			{ c1: '#5eead4', c2: '#059669', c3: '#022c22', feature: '#065f46', accent: '#4ade80', glow: 'rgba(16,185,129,0.65)' },
			{ c1: '#bef264', c2: '#65a30d', c3: '#1a2e05', feature: '#166534', accent: '#86efac', glow: 'rgba(163,230,53,0.65)' },
			{ c1: '#4ade80', c2: '#14532d', c3: '#052e16', feature: '#22c55e', accent: '#fef08a', glow: 'rgba(74,222,128,0.65)' }
		],
		ocean: [
			{ c1: '#7dd3fc', c2: '#0284c7', c3: '#082f49', feature: '#06b6d4', accent: '#a5f3fc', glow: 'rgba(56,189,248,0.65)' },
			{ c1: '#5eead4', c2: '#0d9488', c3: '#042f2e', feature: '#0891b2', accent: '#99f6e4', glow: 'rgba(45,212,191,0.65)' },
			{ c1: '#93c5fd', c2: '#2563eb', c3: '#172554', feature: '#0ea5e9', accent: '#f472b6', glow: 'rgba(59,130,246,0.65)' },
			{ c1: '#67e8f9', c2: '#0891b2', c3: '#083344', feature: '#22d3ee', accent: '#fde047', glow: 'rgba(34,211,238,0.65)' },
			{ c1: '#a5b4fc', c2: '#0369a1', c3: '#0c4a6e', feature: '#38bdf8', accent: '#5eead4', glow: 'rgba(14,165,233,0.65)' }
		],
		volcano: [
			{ c1: '#fdba74', c2: '#ea580c', c3: '#431407', feature: '#7f1d1d', accent: '#fde047', glow: 'rgba(249,115,22,0.7)' },
			{ c1: '#fca5a5', c2: '#dc2626', c3: '#450a0a', feature: '#991b1b', accent: '#fb923c', glow: 'rgba(239,68,68,0.7)' },
			{ c1: '#fde047', c2: '#d97706', c3: '#451a03', feature: '#b91c1c', accent: '#fef08a', glow: 'rgba(245,158,11,0.7)' },
			{ c1: '#fb923c', c2: '#9a3412', c3: '#270902', feature: '#f97316', accent: '#facc15', glow: 'rgba(234,88,12,0.7)' },
			{ c1: '#f87171', c2: '#b91c1c', c3: '#1f0808', feature: '#ea580c', accent: '#fdba74', glow: 'rgba(220,38,38,0.7)' }
		],
		ice: [
			{ c1: '#e0f2fe', c2: '#38bdf8', c3: '#0c4a6e', feature: '#bae6fd', accent: '#67e8f9', glow: 'rgba(103,232,249,0.7)' },
			{ c1: '#cffafe', c2: '#06b6d4', c3: '#164e63', feature: '#a5f3fc', accent: '#e0e7ff', glow: 'rgba(34,211,238,0.7)' },
			{ c1: '#e0e7ff', c2: '#6366f1', c3: '#1e1b4b', feature: '#93c5fd', accent: '#5eead4', glow: 'rgba(129,140,248,0.65)' },
			{ c1: '#ccfbf1', c2: '#14b8a6', c3: '#134e4a', feature: '#99f6e4', accent: '#7dd3fc', glow: 'rgba(45,212,191,0.65)' },
			{ c1: '#f0f9ff', c2: '#0284c7', c3: '#082f49', feature: '#e0f2fe', accent: '#a5f3fc', glow: 'rgba(56,189,248,0.7)' }
		],
		neon: [
			{ c1: '#f472b6', c2: '#db2777', c3: '#3b0764', feature: '#22d3ee', accent: '#f43f5e', glow: 'rgba(244,63,94,0.75)' },
			{ c1: '#e879f9', c2: '#9333ea', c3: '#2e1065', feature: '#f43f5e', accent: '#38bdf8', glow: 'rgba(217,70,239,0.75)' },
			{ c1: '#22d3ee', c2: '#4f46e5', c3: '#1e1b4b', feature: '#ec4899', accent: '#a855f7', glow: 'rgba(34,211,238,0.75)' },
			{ c1: '#fb7185', c2: '#e11d48', c3: '#4c0519', feature: '#a855f7', accent: '#2dd4bf', glow: 'rgba(251,113,133,0.75)' },
			{ c1: '#c084fc', c2: '#7c3aed', c3: '#170936', feature: '#38bdf8', accent: '#f472b6', glow: 'rgba(168,85,247,0.75)' }
		],
		space: [
			{ c1: '#93c5fd', c2: '#2563eb', c3: '#1e1b4b', feature: '#34d399', accent: '#60a5fa', glow: 'rgba(59,130,246,0.6)' },
			{ c1: '#fcd34d', c2: '#d97706', c3: '#451a03', feature: '#b45309', accent: '#fde68a', glow: 'rgba(245,158,11,0.6)' },
			{ c1: '#d8b4fe', c2: '#7c3aed', c3: '#2e1065', feature: '#c084fc', accent: '#f472b6', glow: 'rgba(168,85,247,0.6)' },
			{ c1: '#6ee7b7', c2: '#059669', c3: '#064e3b', feature: '#10b981', accent: '#a7f3d0', glow: 'rgba(16,185,129,0.6)' },
			{ c1: '#fda4af', c2: '#e11d48', c3: '#4c0519', feature: '#fb7185', accent: '#fde047', glow: 'rgba(244,63,94,0.6)' }
		]
	};

	let activeSkin = $derived<PlanetSkin>(
		resolveActiveWorldTheme(game.shop.equipped.background, game.shop.equipped.theme).planetSkin
	);

	let palette = $derived.by<PlanetPalette>(() => {
		const list = SKIN_PALETTES[activeSkin] ?? SKIN_PALETTES.space;
		return list[(table - 1) % list.length];
	});

	// 5 morfologías distintas de planetas inventados + Jefe Final (25)
	let variant = $derived(table === 25 ? 'boss' : (table - 1) % 5);
	let hasRing = $derived(table === 25 || table % 3 === 0 || activeSkin === 'neon');

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
	class="group relative flex cursor-pointer flex-col items-center gap-0.5 select-none disabled:cursor-not-allowed"
	disabled={isLocked}
	onclick={handleClick}
	aria-label="{levelInfo[table]?.name ?? `Nivel ${table}`}{isCompleted
		? ' - completada'
		: isCurrent
			? ' - siguiente'
			: ' - bloqueada'}"
>
	<!-- Nave de Foxy (en nodo actual o último alcanzado) -->
	{#if isCurrent || hasShip}
		<div class="pointer-events-none absolute -top-11 z-30 animate-[float-spaceship_2s_ease-in-out_infinite]">
			<img
				src={ASSET_PATHS.icons.spaceship}
				alt="Nave de Foxy"
				class="h-11 w-11 object-contain drop-shadow-[0_4px_12px_rgba(251,191,36,0.85)]"
			/>
		</div>
	{/if}

	<!-- Contenedor del Planeta Ilustrado -->
	<div
		class="relative flex items-center justify-center rounded-full transition-all duration-300
			{table === 25 ? 'h-20 w-20 max-md:h-16 max-md:w-16' : 'h-16 w-16 max-md:h-13 max-md:w-13'}
			{isCurrent ? 'scale-110 animate-[pulse-node_2s_ease-in-out_infinite]' : ''}
			{!isLocked ? 'group-hover:scale-115' : 'opacity-75'}"
		style:filter={!isLocked ? `drop-shadow(0 0 14px ${palette.glow})` : 'drop-shadow(0 4px 10px rgba(0,0,0,0.85))'}
	>
		{#if isLocked}
			<!-- PLANETA OSCURO / MISTERIOSO (BLOQUEADO) -->
			<svg viewBox="0 0 100 100" class="h-full w-full overflow-visible">
				<defs>
					<radialGradient id="dark-planet-{table}" cx="35%" cy="30%" r="70%">
						<stop offset="0%" stop-color="#272a3f" />
						<stop offset="55%" stop-color="#121424" />
						<stop offset="100%" stop-color="#06070d" />
					</radialGradient>
				</defs>
				<!-- Anillo oscuro apagado en múltiplos de 3 -->
				{#if table % 3 === 0}
					<ellipse
						cx="50"
						cy="52"
						rx="46"
						ry="13"
						fill="none"
						stroke="#1e2238"
						stroke-width="3.5"
						stroke-dasharray="6 4"
						transform="rotate(-18 50 50)"
					/>
				{/if}
				<!-- Esfera oscura -->
				<circle cx="50" cy="50" r="36" fill="url(#dark-planet-{table})" stroke="#2e334d" stroke-width="2" />
				<!-- Cráteres oscuros en penumbra -->
				<circle cx="37" cy="40" r="6" fill="#090a12" opacity="0.7" />
				<circle cx="62" cy="56" r="8" fill="#090a12" opacity="0.65" />
				<circle cx="48" cy="65" r="4.5" fill="#090a12" opacity="0.6" />
				<circle cx="60" cy="34" r="3.5" fill="#090a12" opacity="0.5" />
				<!-- Sombra de eclipse -->
				<path
					d="M 50 14 A 36 36 0 0 1 50 86 A 28 36 0 0 0 50 14 Z"
					fill="#020308"
					opacity="0.7"
				/>
			</svg>
			<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
				<span class="font-arcade text-[0.58rem] text-gray-400/90 max-md:text-[0.5rem]">{table}</span>
			</div>
		{:else}
			<!-- PLANETA DESBLOQUEADO / ACTUAL (ADAPTADO A LA SKIN DE LA TIENDA) -->
			<svg viewBox="0 0 100 100" class="h-full w-full overflow-visible">
				<defs>
					<radialGradient id="planet-grad-{table}" cx="32%" cy="28%" r="72%">
						<stop offset="0%" stop-color={palette.c1} />
						<stop offset="50%" stop-color={palette.c2} />
						<stop offset="100%" stop-color={palette.c3} />
					</radialGradient>
					<clipPath id="planet-clip-{table}">
						<circle cx="50" cy="50" r="36" />
					</clipPath>
				</defs>

				<!-- Halo atmosférico exterior -->
				<circle
					cx="50"
					cy="50"
					r="40"
					fill="none"
					stroke={palette.accent}
					stroke-width={isCurrent ? '2.5' : '1.2'}
					stroke-dasharray={isCurrent ? '5 3' : undefined}
					opacity={isCurrent ? '0.85' : '0.4'}
				/>

				<!-- Cuerpo base del planeta -->
				<circle
					cx="50"
					cy="50"
					r="36"
					fill="url(#planet-grad-{table})"
					stroke={isCurrent ? '#ffffff' : palette.accent}
					stroke-width={isCurrent ? '3' : '2'}
				/>

				<!-- Detalles de superficie recortados a la esfera -->
				<g clip-path="url(#planet-clip-{table})">
					{#if activeSkin === 'jungle'}
						<!-- SKIN SELVA: Continentes frondosos, lianas y esporas bioluminiscentes -->
						<path
							d="M 12 36 Q 32 24 52 38 T 90 34 L 90 54 Q 64 46 42 58 T 12 52 Z"
							fill={palette.feature}
							opacity="0.75"
						/>
						<path
							d="M 18 68 Q 42 56 68 70 T 92 66 L 90 90 L 14 90 Z"
							fill={palette.c3}
							opacity="0.6"
						/>
						<!-- Lianas orgánicas -->
						<path
							d="M 25 18 Q 38 45 28 76 M 58 14 Q 46 48 66 84 M 74 20 Q 62 50 78 75"
							fill="none"
							stroke={palette.c1}
							stroke-width="2.2"
							opacity="0.55"
						/>
						<!-- Esporas luminosas de selva -->
						<circle cx="34" cy="36" r="3.2" fill={palette.accent} opacity="0.9" />
						<circle cx="64" cy="44" r="2.5" fill={palette.accent} opacity="0.85" />
						<circle cx="46" cy="64" r="3.5" fill={palette.accent} opacity="0.9" />
						<circle cx="54" cy="28" r="2" fill="#ffffff" opacity="0.8" />
					{:else if activeSkin === 'ocean'}
						<!-- SKIN OCÉANO: Corrientes marinas, arrecifes y burbujas -->
						<path
							d="M 10 42 Q 30 34 50 42 T 90 42 L 90 56 Q 70 64 50 56 T 10 56 Z"
							fill={palette.feature}
							opacity="0.65"
						/>
						<path
							d="M 10 66 Q 35 58 55 66 T 90 64 L 90 86 L 10 86 Z"
							fill={palette.c3}
							opacity="0.55"
						/>
						<!-- Burbujas de cristal -->
						<circle cx="36" cy="34" r="4" fill="none" stroke={palette.accent} stroke-width="1.5" opacity="0.85" />
						<circle cx="62" cy="48" r="3" fill="none" stroke={palette.accent} stroke-width="1.5" opacity="0.8" />
						<circle cx="48" cy="66" r="2.5" fill={palette.accent} opacity="0.75" />
					{:else if activeSkin === 'volcano'}
						<!-- SKIN VOLCÁN: Ríos de magma incandescente y cráteres de obsidiana -->
						<path
							d="M 16 32 L 38 46 L 52 38 L 72 56 L 88 48"
							fill="none"
							stroke={palette.accent}
							stroke-width="3"
							stroke-linecap="round"
							opacity="0.9"
						/>
						<path
							d="M 24 68 L 46 56 L 64 72 L 82 62"
							fill="none"
							stroke={palette.c1}
							stroke-width="2.5"
							stroke-linecap="round"
							opacity="0.85"
						/>
						<circle cx="38" cy="46" r="5.5" fill={palette.c3} stroke={palette.accent} stroke-width="1.8" />
						<circle cx="64" cy="68" r="4.5" fill={palette.c3} stroke={palette.c1} stroke-width="1.5" />
					{:else if activeSkin === 'ice'}
						<!-- SKIN HIELO: Casquetes polares y fracturas de cristal glaciar -->
						<path d="M 14 26 Q 50 38 86 24 L 86 10 L 14 10 Z" fill="#ffffff" opacity="0.75" />
						<path d="M 16 76 Q 50 66 84 78 L 84 90 L 16 90 Z" fill={palette.c1} opacity="0.65" />
						<path
							d="M 32 34 L 46 52 L 38 66 M 64 30 L 54 48 L 68 62"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							opacity="0.8"
						/>
					{:else if activeSkin === 'neon'}
						<!-- SKIN NEÓN: Rejilla láser synthwave y circuitos -->
						<line x1="14" y1="36" x2="86" y2="36" stroke={palette.feature} stroke-width="1.8" opacity="0.75" />
						<line x1="14" y1="50" x2="86" y2="50" stroke={palette.accent} stroke-width="2.2" opacity="0.85" />
						<line x1="14" y1="64" x2="86" y2="64" stroke={palette.feature} stroke-width="1.8" opacity="0.75" />
						<ellipse cx="50" cy="50" rx="18" ry="36" fill="none" stroke={palette.c1} stroke-width="1.4" opacity="0.55" />
					{:else}
						<!-- SKIN ESPACIO: Variantes de planetas galácticos inventados -->
						{#if variant === 0 || variant === 3}
							<path
								d="M 12 38 Q 36 28 56 40 T 90 36 L 90 54 Q 62 46 40 58 T 12 54 Z"
								fill={palette.feature}
								opacity="0.7"
							/>
							<circle cx="62" cy="66" r="6" fill={palette.c3} opacity="0.55" />
						{:else if variant === 1}
							<circle cx="36" cy="38" r="6.5" fill={palette.c3} opacity="0.55" />
							<circle cx="64" cy="54" r="8" fill={palette.c3} opacity="0.5" />
							<circle cx="44" cy="66" r="5" fill={palette.feature} opacity="0.6" />
						{:else}
							<rect x="12" y="32" width="76" height="8" fill={palette.feature} opacity="0.6" />
							<rect x="12" y="48" width="76" height="10" fill={palette.c3} opacity="0.5" />
							<circle cx="62" cy="53" r="5" fill={palette.accent} opacity="0.8" />
						{/if}
					{/if}

					<!-- Brillo especular esférico y sombra creciente -->
					<ellipse cx="36" cy="30" rx="14" ry="8" fill="#ffffff" opacity="0.22" transform="rotate(-25 36 30)" />
					<path
						d="M 50 14 A 36 36 0 0 1 50 86 A 27 36 0 0 0 50 14 Z"
						fill="#000000"
						opacity="0.32"
					/>
				</g>

				<!-- Anillo planetario frontal (en planetas anillados o Jefe Final) -->
				{#if hasRing}
					<ellipse
						cx="50"
						cy="52"
						rx="47"
						ry="13"
						fill="none"
						stroke={palette.accent}
						stroke-width={table === 25 ? '4' : '2.8'}
						opacity="0.85"
						transform="rotate(-18 50 50)"
					/>
				{/if}
			</svg>

			<!-- Número del nivel sobre el planeta -->
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
				<span
					class="rounded-full bg-black/55 px-1.5 py-0.5 font-arcade text-[0.62rem] text-white shadow-[0_2px_6px_rgba(0,0,0,0.9)] backdrop-blur-[1px] max-md:text-[0.52rem]"
				>
					{table}
				</span>
			</div>
		{/if}
	</div>

	<!-- Etiqueta compacta: Nombre y Estrellas / Estado -->
	<div
		class="flex flex-col items-center rounded-xl border px-2 py-0.5 backdrop-blur-md transition-all
			{isLocked
			? 'border-gray-800/80 bg-slate-950/75 text-gray-500'
			: isCurrent
				? 'border-amber-400 bg-slate-950/90 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
				: 'border-white/15 bg-slate-950/80 text-gray-200'}"
	>
		<span class="max-w-[5.8rem] truncate text-center text-[0.55rem] font-semibold leading-tight max-md:max-w-[4.5rem] max-md:text-[0.48rem]">
			{levelInfo[table]?.name ?? `Sector ${table}`}
		</span>

		{#if isCompleted && stars > 0}
			<div class="flex gap-0.5 leading-none">
				{#each Array(3) as _, i (i)}
					<span
						class="text-[0.52rem] max-md:text-[0.45rem]"
						class:opacity-100={i < stars}
						class:opacity-25={i >= stars}
					>
						⭐
					</span>
				{/each}
			</div>
		{:else if isCurrent}
			<span class="animate-pulse font-arcade text-[0.45rem] text-amber-400">¡JUGAR!</span>
		{:else}
			<span class="text-[0.5rem] text-gray-500">🔒</span>
		{/if}
	</div>
</button>
