<script lang="ts">
	import { untrack } from 'svelte';
	import { ASSET_PATHS } from '$lib/constants/assets';
	import type { LevelMechanic } from '$lib/constants/levels';
	import { resolveOptionComponent } from '$lib/components/game/options';
	import { playClick } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';

	let {
		table,
		mechanic,
		questionIndex,
		questionType = 'multiply',
		a,
		b,
		answer,
		options,
		selectedAnswer,
		revealedWrong,
		highlightCorrect,
		onAnswer
	}: {
		table: number;
		mechanic: LevelMechanic;
		questionIndex: number;
		questionType?: string;
		a: number;
		b: number;
		answer: number;
		options: number[];
		selectedAnswer: number | null;
		revealedWrong: number[];
		highlightCorrect: boolean;
		onAnswer: (val: number) => void;
	} = $props();

	// Estado para Teclado Holográfico (teclado)
	let typedValue = $state('');

	// Estado para Cañón Antiaéreo (canon)
	let laserTargetIdx = $state<number | null>(null);

	// Estado para Puente de Cables (cables)
	let cableArmed = $state(false);
	let connectedOption = $state<number | null>(null);

	// Estado para Báscula de Carga (carga)
	let stagedCargo = $state<number | null>(null);

	// Estado para Matriz / Calibrador (matriz)
	let matrixPreview = $state<number | null>(null);

	// Reiniciar estados interactivos al cambiar de pregunta
	$effect(() => {
		void questionIndex;
		void table;
		untrack(() => {
			typedValue = '';
			laserTargetIdx = null;
			cableArmed = false;
			connectedOption = null;
			stagedCargo = null;
			matrixPreview = null;
		});
	});

	function pressKey(digit: string) {
		if (selectedAnswer !== null) return;
		if (game.soundEnabled) playClick();
		if (typedValue.length < 3) {
			typedValue += digit;
		}
	}

	function clearKey() {
		if (selectedAnswer !== null) return;
		if (game.soundEnabled) playClick();
		typedValue = typedValue.slice(0, -1);
	}

	function submitKeypad() {
		if (selectedAnswer !== null || typedValue.length === 0) return;
		const num = Number(typedValue);
		onAnswer(num);
	}

	function fireLaser(option: number, idx: number) {
		if (selectedAnswer !== null || revealedWrong.includes(option)) return;
		laserTargetIdx = idx;
		onAnswer(option);
	}

	function armCable() {
		if (selectedAnswer !== null) return;
		if (game.soundEnabled) playClick();
		cableArmed = true;
	}

	function connectCable(option: number) {
		if (selectedAnswer !== null || revealedWrong.includes(option)) return;
		if (!cableArmed) {
			cableArmed = true;
		}
		connectedOption = option;
		onAnswer(option);
	}

	function selectCargo(option: number) {
		if (selectedAnswer !== null || revealedWrong.includes(option)) return;
		if (game.soundEnabled) playClick();
		stagedCargo = option;
	}

	function dispatchCargo() {
		if (selectedAnswer !== null || stagedCargo === null) return;
		onAnswer(stagedCargo);
	}

	function selectMatrixNode(option: number) {
		if (selectedAnswer !== null || revealedWrong.includes(option)) return;
		if (game.soundEnabled) playClick();
		matrixPreview = option;
	}

	function confirmMatrix() {
		if (selectedAnswer !== null || matrixPreview === null) return;
		onAnswer(matrixPreview);
	}
</script>

{#if mechanic === 'teclado' && questionType !== 'trueFalse'}
	<!-- MECÁNICA 2: TECLADO HOLOGRÁFICO DE REACTOR -->
	<div
		class="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border-2 border-cyan-400/40 bg-[#14142b]/90 p-4 shadow-[0_0_25px_rgba(34,211,238,0.15)]"
	>
		<div class="flex w-full items-center justify-between text-[0.65rem] text-cyan-300">
			<span class="font-arcade">🔢 CONSOLA DE SÍNTESIS</span>
			<span>Digita el resultado exacto</span>
		</div>

		<!-- Pantalla del Teclado -->
		<div
			class="flex h-14 w-full items-center justify-between rounded-xl border-2 px-4 font-arcade text-2xl
				{selectedAnswer === null
				? 'border-cyan-500/50 bg-slate-950 text-amber-300'
				: selectedAnswer === answer
					? 'border-emerald-400 bg-emerald-950/60 text-emerald-300'
					: 'border-rose-500 bg-rose-950/60 text-rose-300'}"
		>
			<span>{typedValue || '_'}</span>
			{#if highlightCorrect}
				<span class="text-xs text-emerald-400 animate-pulse">Código: {answer}</span>
			{:else if revealedWrong.length > 0}
				<span class="text-[0.6rem] text-amber-300">
					Pista: empieza con {String(answer)[0]}
				</span>
			{/if}
		</div>

		<!-- Botones Numéricos -->
		<div class="grid w-full grid-cols-5 gap-2">
			{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as digit (digit)}
				<button
					disabled={selectedAnswer !== null}
					class="h-11 cursor-pointer rounded-xl border border-gray-600 bg-[#252540] font-arcade text-sm text-white transition-all hover:border-amber-400 hover:bg-amber-400/20 active:scale-95 disabled:opacity-50"
					onclick={() => pressKey(digit)}
				>
					{digit}
				</button>
			{/each}
		</div>

		<div class="flex w-full gap-2">
			<button
				disabled={selectedAnswer !== null || typedValue.length === 0}
				class="flex-1 cursor-pointer rounded-xl border border-rose-500/40 bg-rose-500/10 py-2.5 font-arcade text-[0.65rem] text-rose-300 transition-all hover:bg-rose-500/20 disabled:opacity-40"
				onclick={clearKey}
			>
				⌫ BORRAR
			</button>
			<button
				disabled={selectedAnswer !== null || typedValue.length === 0}
				class="flex-[2] cursor-pointer rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 font-arcade text-xs font-bold text-slate-950 transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
				onclick={submitKeypad}
			>
				⚡ INYECTAR AL MOTOR
			</button>
		</div>
	</div>
{:else if mechanic === 'canon'}
	<!-- MECÁNICA 3: CAÑÓN LÁSER ANTIAÉREO CON NAVE APUNTANDO -->
	<div
		class="relative flex w-full max-w-lg flex-col items-center gap-5 rounded-2xl border-2 border-amber-400/30 bg-slate-950/75 p-5 overflow-hidden"
	>
		<div class="text-center font-arcade text-[0.6rem] tracking-wider text-amber-300">
			🔫 APUNTA Y DISPARA AL ASTEROIDE CORRECTO
		</div>

		<!-- Asteroides en órbita -->
		<div class="flex w-full justify-around gap-3 py-2">
			{#each options as option, idx (questionIndex + '-' + option)}
				{@const isDisabled = selectedAnswer !== null || revealedWrong.includes(option)}
				{@const isTarget = selectedAnswer === option}
				{@const isHitCorrect = selectedAnswer !== null && option === answer}
				<button
					disabled={isDisabled}
					class="group relative flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-full border-[3px] font-arcade text-lg transition-all duration-300 animate-[float_3s_ease-in-out_infinite]
						{highlightCorrect && option === answer
						? 'ring-4 ring-emerald-400 scale-110'
						: ''}
						{revealedWrong.includes(option)
						? 'border-gray-700 bg-gray-900/40 text-gray-600 opacity-35 line-through'
						: selectedAnswer === null
							? 'border-amber-500/70 bg-gradient-to-br from-stone-700 via-stone-800 to-slate-950 text-white hover:scale-110 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]'
							: isHitCorrect
								? 'border-emerald-400 bg-emerald-600/40 text-emerald-200 scale-110 shadow-[0_0_30px_rgba(52,211,153,0.8)]'
								: isTarget
									? 'border-rose-500 bg-rose-700/40 text-rose-200 animate-shake'
									: 'border-gray-700 bg-slate-900 opacity-40'}"
					style="animation-delay: {idx * 0.35}s"
					onclick={() => fireLaser(option, idx)}
				>
					<span class="text-[0.55rem] text-cyan-300 opacity-80">☄️</span>
					<span>{option}</span>
				</button>
			{/each}
		</div>

		<!-- Rayo Láser visual al disparar -->
		{#if laserTargetIdx !== null}
			<div
				class="pointer-events-none h-8 w-1.5 rounded-full bg-gradient-to-t from-cyan-400 via-amber-300 to-emerald-400 shadow-[0_0_20px_#22d3ee] animate-ping"
			></div>
		{/if}

		<!-- Nave del jugador en la torreta inferior -->
		<div class="flex flex-col items-center">
			<img
				src={ASSET_PATHS.icons.spaceship}
				alt="Nave Artillera"
				class="h-14 w-14 object-contain transition-transform duration-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]
					{laserTargetIdx === 0 ? '-rotate-25' : laserTargetIdx === 2 ? 'rotate-25' : ''}"
			/>
			<span class="mt-1 font-arcade text-[0.55rem] text-cyan-400">CAÑÓN DE PLASMA LISTO</span>
		</div>
	</div>
{:else if mechanic === 'cables'}
	<!-- MECÁNICA 4: PUENTE DE CABLES DE ENERGÍA (2 PASOS) -->
	<div
		class="flex w-full max-w-lg flex-col gap-3 rounded-2xl border-2 border-amber-400/40 bg-[#15152c]/90 p-4"
	>
		<div class="flex items-center justify-between text-[0.6rem] text-amber-300 font-arcade">
			<span>🔌 PUENTE DE CIRCUITOS</span>
			<span>{cableArmed ? '2. Conecta el terminal de salida' : '1. Energiza el nodo o toca el terminal'}</span>
		</div>

		<div class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
			<!-- Nodo Izquierdo (Generador) -->
			<button
				disabled={selectedAnswer !== null}
				class="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-4 cursor-pointer transition-all
					{cableArmed || selectedAnswer !== null
					? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
					: 'border-amber-400/60 bg-[#252540] text-white animate-pulse hover:border-cyan-400'}"
				onclick={armCable}
			>
				<span class="text-xl">⚡</span>
				<span class="font-arcade text-xs">{a} × {b}</span>
				<span class="text-[0.6rem] text-cyan-300">
					{cableArmed ? '● ENERGIZADO' : 'TOCAR PARA CARGAR'}
				</span>
			</button>

			<!-- Cable central -->
			<div class="flex flex-col items-center justify-center px-1">
				<div
					class="h-1.5 w-10 rounded-full transition-all duration-300
						{connectedOption !== null
						? connectedOption === answer
							? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
							: 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
						: cableArmed
							? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]'
							: 'bg-gray-700'}"
				></div>
			</div>

			<!-- Terminales Derechos -->
			<div class="flex flex-col gap-2">
				{#each options as option (questionIndex + '-' + option)}
					{@const isDisabled = selectedAnswer !== null || revealedWrong.includes(option)}
					<button
						disabled={isDisabled}
						class="flex items-center justify-between rounded-xl border-2 px-3.5 py-2.5 cursor-pointer font-arcade text-sm transition-all
							{highlightCorrect && option === answer ? 'ring-2 ring-emerald-400' : ''}
							{revealedWrong.includes(option)
							? 'border-gray-700 bg-gray-900/40 text-gray-600 opacity-35 line-through'
							: selectedAnswer === null
								? 'border-gray-600 bg-[#252540] text-white hover:border-cyan-400 hover:bg-cyan-500/15'
								: option === answer
									? 'border-emerald-400 bg-emerald-500/25 text-emerald-300'
									: selectedAnswer === option
										? 'border-rose-500 bg-rose-500/25 text-rose-300'
										: 'border-gray-700 bg-slate-900 opacity-40'}"
						onclick={() => connectCable(option)}
					>
						<span class="text-xs text-amber-400">🔌</span>
						<span>{option}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{:else if mechanic === 'carga'}
	<!-- MECÁNICA 5: COMPUERTA Y BÁSCULA DE CONTENEDORES DE CARGA -->
	<div
		class="flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border-2 border-amber-400/40 bg-[#16162d]/90 p-4"
	>
		<div class="flex w-full items-center justify-between font-arcade text-[0.6rem] text-amber-300">
			<span>📦 PLATAFORMA DE CARGA</span>
			<span>Selecciona contenedor y despacha</span>
		</div>

		<!-- Contenedores para subir a la plataforma -->
		<div class="grid w-full grid-cols-3 gap-3">
			{#each options as option (questionIndex + '-' + option)}
				{@const isDisabled = selectedAnswer !== null || revealedWrong.includes(option)}
				{@const isStaged = stagedCargo === option}
				<button
					disabled={isDisabled}
					class="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 cursor-pointer transition-all
						{highlightCorrect && option === answer ? 'ring-2 ring-emerald-400' : ''}
						{revealedWrong.includes(option)
						? 'border-gray-700 bg-gray-900/40 text-gray-600 opacity-35 line-through'
						: isStaged
							? 'border-amber-400 bg-amber-500/25 text-amber-200 -translate-y-1 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
							: 'border-gray-600 bg-[#252540] text-white hover:border-amber-400/60'}"
					onclick={() => selectCargo(option)}
				>
					<span class="text-xl">📦</span>
					<span class="font-arcade text-sm">{option}</span>
					<span class="text-[0.55rem] text-gray-400">UNIDADES</span>
				</button>
			{/each}
		</div>

		<!-- Botón de compuerta de despacho -->
		<button
			disabled={selectedAnswer !== null || stagedCargo === null}
			class="w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 py-3 font-arcade text-xs font-bold text-slate-950 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
			onclick={dispatchCargo}
		>
			{stagedCargo !== null
				? `🚀 DESPACHAR CONTENEDOR (${stagedCargo})`
				: '⬆️ ELIGE UN CONTENEDOR ARRIBA'}
		</button>
	</div>
{:else if mechanic === 'matriz'}
	<!-- MECÁNICA 6: ESCÁNER DE MATRIZ Y CALIBRADOR DE POTENCIA -->
	<div
		class="flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border-2 border-cyan-400/40 bg-[#141830]/90 p-4"
	>
		<div class="flex w-full items-center justify-between font-arcade text-[0.6rem] text-cyan-300">
			<span>📐 CALIBRADOR DE MATRIZ</span>
			<span>Ajusta el dial y confirma</span>
		</div>

		<!-- Barra visual de bloques según el valor preseleccionado -->
		<div class="flex w-full items-center justify-between rounded-xl border border-cyan-500/30 bg-slate-950/80 px-4 py-2.5">
			<span class="text-xs text-gray-300">Frecuencia seleccionada:</span>
			<span class="font-arcade text-lg text-amber-400">
				{matrixPreview !== null ? matrixPreview : '---'}
			</span>
		</div>

		<div class="grid w-full grid-cols-3 gap-3">
			{#each options as option (questionIndex + '-' + option)}
				{@const isDisabled = selectedAnswer !== null || revealedWrong.includes(option)}
				<button
					disabled={isDisabled}
					class="cursor-pointer rounded-xl border-2 py-3 font-arcade text-sm transition-all
						{highlightCorrect && option === answer ? 'ring-2 ring-emerald-400' : ''}
						{revealedWrong.includes(option)
						? 'border-gray-700 bg-gray-900/40 text-gray-600 opacity-35 line-through'
						: matrixPreview === option
							? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
							: 'border-gray-600 bg-[#252540] text-white hover:border-cyan-400/60'}"
					onclick={() => selectMatrixNode(option)}
				>
					🎛️ {option}
				</button>
			{/each}
		</div>

		<button
			disabled={selectedAnswer !== null || matrixPreview === null}
			class="w-full cursor-pointer rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 font-arcade text-xs font-bold text-slate-950 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
			onclick={confirmMatrix}
		>
			{matrixPreview !== null
				? `⚡ FIJAR MATRIZ EN ${matrixPreview}`
				: 'SELECCIONA UN NODO PARA CALIBRAR'}
		</button>
	</div>
{:else if mechanic === 'radar'}
	<!-- MECÁNICA 7: RADAR DE INTERCEPCIÓN ORBITAL -->
	<div
		class="relative flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border-2 border-emerald-400/40 bg-[#0b1f17]/90 p-4 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
	>
		<div class="flex w-full items-center justify-between font-arcade text-[0.6rem] text-emerald-300">
			<span>📡 SONAR DE INTERCEPCIÓN</span>
			<span class="animate-pulse">● ESCANEANDO SECTOR</span>
		</div>

		<div class="flex w-full flex-wrap items-center justify-center gap-4 py-2">
			{#each options as option (questionIndex + '-' + option)}
				{@const isDisabled = selectedAnswer !== null || revealedWrong.includes(option)}
				{@const label =
					questionType === 'trueFalse' ? (option === 1 ? '✓ VERDADERO' : '✗ FALSO') : String(option)}
				<button
					disabled={isDisabled}
					class="group relative flex min-w-[110px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 px-4 py-3 font-arcade text-sm transition-all
						{highlightCorrect && option === answer ? 'ring-4 ring-emerald-400 scale-105' : ''}
						{revealedWrong.includes(option)
						? 'border-gray-700 bg-gray-900/40 text-gray-600 opacity-35 line-through'
						: selectedAnswer === null
							? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-200 hover:scale-105 hover:border-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.5)]'
							: option === answer
								? 'border-emerald-400 bg-emerald-600/40 text-white shadow-[0_0_25px_rgba(52,211,153,0.8)]'
								: selectedAnswer === option
									? 'border-rose-500 bg-rose-700/40 text-rose-200'
									: 'border-gray-800 bg-slate-950 opacity-40'}"
					onclick={() => onAnswer(option)}
				>
					<span class="text-[0.55rem] text-emerald-400/80">🎯 SEÑAL</span>
					<span>{label}</span>
				</button>
			{/each}
		</div>
	</div>
{:else}
	<!-- MECÁNICA 1: PALANCAS Y COMPONENTES TEMÁTICOS CLÁSICOS -->
	<div class="flex flex-wrap items-center justify-center gap-6 max-md:gap-4">
		{#each options as option (questionIndex + '-' + option)}
			{@const OptionComp = resolveOptionComponent(table, questionType)}
			{@const isHighlighted = highlightCorrect && option === answer}
			<div
				class="rounded-2xl transition-all {isHighlighted
					? 'ring-4 ring-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.8)] scale-105'
					: ''}"
			>
				<OptionComp
					value={option}
					correct={option === answer}
					selected={selectedAnswer === option}
					disabled={selectedAnswer !== null || revealedWrong.includes(option)}
					showResult={selectedAnswer !== null}
					revealedWrong={revealedWrong.includes(option)}
					onclick={() => onAnswer(option)}
				/>
			</div>
		{/each}
	</div>
{/if}
