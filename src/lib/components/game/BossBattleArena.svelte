<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { ASSET_PATHS } from '$lib/constants/assets';
	import { getCharacterBody } from '$lib/constants/characters';
	import { playClick, playError, playSuccess } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';

	let {
		questionIndex,
		totalQuestions,
		storyPrompt,
		displayPrompt,
		answer,
		options,
		selectedAnswer,
		revealedWrong,
		highlightCorrect,
		onAnswer,
		onObstacleHit
	}: {
		questionIndex: number;
		totalQuestions: number;
		storyPrompt?: string;
		displayPrompt: string;
		answer: number;
		options: number[];
		selectedAnswer: number | null;
		revealedWrong: number[];
		highlightCorrect: boolean;
		onAnswer: (val: number) => void;
		onObstacleHit: () => void;
	} = $props();

	type BossState = 'intro' | 'idle' | 'attack' | 'hit' | 'defeated';

	interface Hazard {
		id: number;
		lane: number; // 0, 1, 2
		y: number; // 0 to 100
	}

	let shipLane = $state<number>(1); // 0 = Izquierda, 1 = Centro, 2 = Derecha
	let bossState = $state<BossState>('intro');
	let firingLaser = $state(false);
	let hazards = $state<Hazard[]>([]);
	let shipHitFlash = $state(false);
	let nextHazardId = 1;

	let bossHpPercent = $derived(
		Math.max(0, Math.round(((totalQuestions - questionIndex) / totalQuestions) * 100))
	);

	// Actualizar estado del jefe cuando el jugador responde
	$effect(() => {
		const sel = selectedAnswer;
		const ans = answer;
		const qIdx = questionIndex;
		const total = totalQuestions;
		untrack(() => {
			if (sel === null) return;
			if (sel === ans) {
				if (qIdx + 1 >= total) {
					bossState = 'defeated';
				} else {
					bossState = 'hit';
					setTimeout(() => {
						if (bossState !== 'defeated') bossState = 'idle';
					}, 900);
				}
			} else {
				bossState = 'attack';
				setTimeout(() => {
					if (bossState !== 'defeated') bossState = 'idle';
				}, 900);
			}
		});
	});

	function moveShip(lane: number) {
		const clamped = Math.max(0, Math.min(2, lane));
		if (clamped !== shipLane && game.soundEnabled) {
			playClick();
		}
		shipLane = clamped;
	}

	function shootLane(laneIdx?: number) {
		if (selectedAnswer !== null) return;
		if (laneIdx !== undefined) {
			shipLane = laneIdx;
		}
		const targetOption = options[shipLane];
		if (targetOption === undefined || revealedWrong.includes(targetOption)) return;

		firingLaser = true;
		setTimeout(() => {
			firingLaser = false;
		}, 450);

		onAnswer(targetOption);
	}

	onMount(() => {
		const introTimeout = setTimeout(() => {
			bossState = 'idle';
		}, 1200);

		// Spawner de bolas de fuego del Jefe Nova cada 2.6s
		const spawnInterval = setInterval(() => {
			if (selectedAnswer !== null || bossState === 'defeated') return;
			bossState = 'attack';
			const randomLane = Math.floor(Math.random() * 3);
			hazards = [...hazards, { id: nextHazardId++, lane: randomLane, y: 12 }];
			setTimeout(() => {
				if (bossState === 'attack') bossState = 'idle';
			}, 500);
		}, 2600);

		// Loop de movimiento de obstáculos e impactos
		const tickInterval = setInterval(() => {
			if (selectedAnswer !== null || bossState === 'defeated') {
				hazards = [];
				return;
			}

			const remaining: Hazard[] = [];
			for (const h of hazards) {
				const nextY = h.y + 5.5;
				// Zona de colisión con la nave (y entre 82 y 94 en el mismo carril)
				if (nextY >= 82 && nextY <= 94 && h.lane === shipLane) {
					shipHitFlash = true;
					if (game.soundEnabled) playError();
					onObstacleHit();
					setTimeout(() => {
						shipHitFlash = false;
					}, 500);
					continue;
				}
				if (nextY < 100) {
					remaining.push({ ...h, y: nextY });
				}
			}
			hazards = remaining;
		}, 120);

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
				e.preventDefault();
				moveShip(shipLane - 1);
			} else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
				e.preventDefault();
				moveShip(shipLane + 1);
			} else if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				shootLane();
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			clearTimeout(introTimeout);
			clearInterval(spawnInterval);
			clearInterval(tickInterval);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<div
	class="relative flex w-full max-w-2xl flex-col items-center gap-3 rounded-3xl border-[3px] border-rose-500/60 bg-gradient-to-b from-[#240a15] via-[#140b29] to-[#090919] p-4 shadow-[0_0_45px_rgba(244,63,94,0.3)]"
>
	<!-- Barra de Vida del Jefe Final: NOVA -->
	<div class="w-full">
		<div class="mb-1 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="rounded-md bg-rose-600 px-2 py-0.5 font-arcade text-[0.55rem] text-white">
					JEFE FINAL
				</span>
				<span class="font-arcade text-xs text-rose-300">🐉 MECHA-NOVA IMPERIAL</span>
			</div>
			<span class="font-arcade text-xs text-amber-400">BLINDAJE: {bossHpPercent}%</span>
		</div>
		<div class="h-3.5 w-full overflow-hidden rounded-full border border-rose-500/50 bg-slate-950">
			<div
				class="h-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 transition-all duration-500"
				style="width: {bossHpPercent}%"
			></div>
		</div>
	</div>

	<!-- Enunciado / Código de Escudo del Jefe -->
	<div
		class="w-full rounded-2xl border border-amber-400/30 bg-slate-950/85 px-4 py-2.5 text-center"
	>
		{#if storyPrompt}
			<p class="text-xs leading-relaxed text-gray-100">{storyPrompt}</p>
		{/if}
		<div class="mt-1 font-arcade text-sm text-amber-300">
			⚡ FRECUENCIA DE ESCUDO: {displayPrompt} = ?
		</div>
	</div>

	<!-- Arena Espacial de 3 Carriles (Jefe arriba, Obstáculos cayendo, Nave abajo) -->
	<div
		class="relative h-[300px] w-full overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-[radial-gradient(ellipse_at_top,_rgba(225,29,72,0.22),_rgba(10,10,28,0.95))]"
	>
		<!-- Jefe Animado en la parte superior -->
		<div
			class="relative z-20 flex flex-col items-center pt-2 transition-all duration-300
				{bossState === 'intro' ? 'animate-drop-in scale-110' : ''}
				{bossState === 'idle' ? 'animate-[float_2.5s_ease-in-out_infinite]' : ''}
				{bossState === 'attack' ? 'scale-110 drop-shadow-[0_0_25px_rgba(249,115,22,0.95)]' : ''}
				{bossState === 'hit' ? 'animate-shake brightness-150 saturate-200' : ''}
				{bossState === 'defeated' ? 'scale-0 rotate-180 opacity-0 duration-1000' : ''}"
		>
			<div class="relative flex h-24 w-28 items-center justify-center">
				<!-- Aura de fuego cibernético detrás del jefe -->
				<div
					class="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500/30 via-orange-500/40 to-amber-400/30 blur-md animate-pulse"
				></div>
				<img
					src={getCharacterBody('nova')}
					alt="Jefe Nova"
					class="relative z-10 h-24 w-24 object-contain drop-shadow-[0_0_15px_rgba(244,63,94,0.85)]"
				/>
				{#if bossState === 'hit'}
					<span class="absolute -top-1 right-0 z-30 font-arcade text-xs text-emerald-300 animate-bounce">
						💥 ¡IMPACTO!
					</span>
				{:else if bossState === 'attack'}
					<span class="absolute -bottom-2 z-30 font-arcade text-[0.55rem] text-orange-300">
						🔥 ¡ATAQUE SOLAR!
					</span>
				{/if}
			</div>
		</div>

		<!-- División de 3 Carriles con Núcleos de Respuesta y Proyectiles -->
		<div class="absolute inset-0 grid grid-cols-3">
			{#each [0, 1, 2] as laneIdx (laneIdx)}
				{@const opt = options[laneIdx]}
				{@const isDisabled = selectedAnswer !== null || (opt !== undefined && revealedWrong.includes(opt))}
				<div
					class="relative flex flex-col items-center justify-between border-r border-white/5 last:border-r-0 pb-3 pt-28"
				>
					<!-- Núcleo Numérico del Carril (Clickeable para mover y disparar) -->
					{#if opt !== undefined}
						<button
							disabled={isDisabled}
							class="z-20 flex h-12 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 font-arcade text-sm transition-all
								{highlightCorrect && opt === answer ? 'ring-4 ring-emerald-400 scale-110' : ''}
								{revealedWrong.includes(opt)
								? 'border-gray-700 bg-gray-900/40 text-gray-600 opacity-30 line-through'
								: selectedAnswer === null
									? shipLane === laneIdx
										? 'border-cyan-400 bg-cyan-500/25 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105'
										: 'border-amber-400/60 bg-slate-900/80 text-amber-300 hover:border-cyan-400'
									: opt === answer
										? 'border-emerald-400 bg-emerald-500/30 text-emerald-200'
										: selectedAnswer === opt
											? 'border-rose-500 bg-rose-500/30 text-rose-200'
											: 'border-gray-800 bg-slate-950 opacity-40'}"
							onclick={() => shootLane(laneIdx)}
						>
							<span class="text-[0.5rem] text-cyan-300">NÚCLEO</span>
							<span>{opt}</span>
						</button>
					{/if}

					<!-- Rayo láser en el carril actual cuando dispara -->
					{#if firingLaser && shipLane === laneIdx}
						<div
							class="pointer-events-none absolute top-16 bottom-14 w-2 rounded-full bg-gradient-to-t from-cyan-400 via-amber-300 to-white shadow-[0_0_20px_#22d3ee]"
						></div>
					{/if}

					<!-- Obstáculos / Bolas de fuego cayendo en este carril -->
					{#each hazards.filter((h) => h.lane === laneIdx) as hazard (hazard.id)}
						<div
							class="pointer-events-none absolute z-30 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 via-orange-500 to-rose-600 text-base shadow-[0_0_14px_#f97316]"
							style="top: {hazard.y}%"
						>
							☄️
						</div>
					{/each}

					<!-- Nave de Foxy en el carril activo -->
					<div class="z-20 flex h-14 items-center justify-center">
						{#if shipLane === laneIdx}
							<img
								src={ASSET_PATHS.icons.spaceship}
								alt="Tu Nave"
								class="h-13 w-13 object-contain transition-all duration-150 drop-shadow-[0_0_12px_rgba(56,189,248,0.85)]
									{shipHitFlash ? 'animate-shake brightness-200 sepia' : ''}"
							/>
						{:else}
							<button
								class="cursor-pointer rounded-lg border border-dashed border-white/15 px-2.5 py-1 text-[0.6rem] text-gray-400 hover:border-cyan-400/50 hover:text-cyan-300"
								onclick={() => moveShip(laneIdx)}
							>
								Mover aquí
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Controles Arcade de Cabina (Mover Izquierda / Disparar / Mover Derecha) -->
	<div class="grid w-full grid-cols-3 gap-3">
		<button
			class="cursor-pointer rounded-xl border-2 border-gray-600 bg-[#252540] py-2.5 font-arcade text-xs text-white transition-all hover:border-cyan-400 active:scale-95"
			onclick={() => moveShip(shipLane - 1)}
		>
			◀ ESQUIVAR IZQ
		</button>
		<button
			disabled={selectedAnswer !== null}
			class="cursor-pointer rounded-xl bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 py-2.5 font-arcade text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
			onclick={() => shootLane()}
		>
			🔥 DISPARAR ({options[shipLane] ?? ''})
		</button>
		<button
			class="cursor-pointer rounded-xl border-2 border-gray-600 bg-[#252540] py-2.5 font-arcade text-xs text-white transition-all hover:border-cyan-400 active:scale-95"
			onclick={() => moveShip(shipLane + 1)}
		>
			ESQUIVAR DER ▶
		</button>
	</div>
</div>
