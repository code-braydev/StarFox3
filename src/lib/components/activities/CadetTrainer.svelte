<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { playSuccess, playError, playClick, playGem } from '$lib/audio/audio';
	import FoxyMonitor from '$lib/components/game/FoxyMonitor.svelte';

	type ActivityMode = 'calibracion' | 'desencriptado' | 'escudos';

	interface Exercise {
		id: number;
		prompt: string;
		subtext: string;
		target: number;
		options: number[];
		hint: string;
	}

	let currentMode = $state<ActivityMode>('calibracion');
	let selectedTable = $state<number>(0); // 0 = Aleatorio, 1-12 = Tablas específicas
	let exerciseIndex = $state(0);
	let selectedOption = $state<number | null>(null);
	let isAnswered = $state(false);
	let isCorrect = $state(false);
	let scoreGems = $state(0);

	let foxyMessage = $state('¡Bienvenido a la cubierta de entrenamiento! Elige una tabla y repasemos sin peligro.');
	let foxyMood = $state<'idle' | 'celebrate' | 'encourage'>('idle');

	// Generador reactivo de ejercicios pedagógicos
	function generateExercises(mode: ActivityMode, table: number): Exercise[] {
		const list: Exercise[] = [];
		const count = 10;

		for (let i = 0; i < count; i++) {
			const a = table > 0 ? table : Math.floor(Math.random() * 9) + 2;
			const b = Math.floor(Math.random() * 9) + 2;
			const product = a * b;

			if (mode === 'calibracion') {
				// Multiplicación directa
				const opts = Array.from(
					new Set([
						product,
						product + a,
						product - a > 0 ? product - a : product + 2,
						product + (Math.random() > 0.5 ? 1 : -1) * 2
					])
				)
					.filter((n) => n > 0)
					.slice(0, 4);

				while (opts.length < 4) {
					opts.push(product + opts.length * 3);
				}
				opts.sort(() => Math.random() - 0.5);

				list.push({
					id: i + 1,
					prompt: `${a} × ${b} = ?`,
					subtext: `Calibración de motor estelar (Tabla del ${a})`,
					target: product,
					options: opts,
					hint: `Consejo táctico: Recuerda que ${a} × ${b} es sumar ${b} veces el número ${a}.`
				});
			} else if (mode === 'desencriptado') {
				// Ecuación inversa: a * ? = product
				const opts = Array.from(new Set([b, b + 1, b - 1 > 0 ? b - 1 : b + 3, b + 2]))
					.filter((n) => n > 0)
					.slice(0, 4);
				opts.sort(() => Math.random() - 0.5);

				list.push({
					id: i + 1,
					prompt: `${a} × ? = ${product}`,
					subtext: 'Desencriptando frecuencia de baliza',
					target: b,
					options: opts,
					hint: `¿Qué número multiplicado por ${a} da exactamente ${product}?`
				});
			} else {
				// Validación de escudos (Verdadero = 1, Falso = 0)
				const isTrue = Math.random() > 0.5;
				const displayAnswer = isTrue ? product : product + (Math.random() > 0.5 ? a : -a);

				list.push({
					id: i + 1,
					prompt: `${a} × ${b} = ${displayAnswer}`,
					subtext: '¿Frecuencia de escudo correcta? (1 = SÍ, 0 = NO)',
					target: isTrue ? 1 : 0,
					options: [1, 0],
					hint: `${a} × ${b} es realmente ${product}.`
				});
			}
		}
		return list;
	}

	let exercises = $state<Exercise[]>(generateExercises('calibracion', 0));
	let currentExercise = $derived(exercises[exerciseIndex] ?? exercises[0]);
	let progressPercent = $derived(((exerciseIndex + 1) / exercises.length) * 100);

	function changeMode(mode: ActivityMode) {
		if (game.soundEnabled) playClick();
		currentMode = mode;
		resetSession();
	}

	function changeTable(tbl: number) {
		if (game.soundEnabled) playClick();
		selectedTable = tbl;
		resetSession();
	}

	function resetSession() {
		exercises = generateExercises(currentMode, selectedTable);
		exerciseIndex = 0;
		selectedOption = null;
		isAnswered = false;
		foxyMood = 'idle';
		foxyMessage = 'Parámetros actualizados. ¡Iniciando simulación!';
	}

	function handleAnswer(val: number) {
		if (isAnswered) return;
		selectedOption = val;
		isAnswered = true;

		if (val === currentExercise.target) {
			isCorrect = true;
			foxyMood = 'celebrate';
			foxyMessage = '¡Coordenada sincronizada a la perfección! Sistemas al 100%.';
			scoreGems += 2;
			game.addGems(2);
			game.incrementPracticePlays();
			if (game.soundEnabled) playSuccess();
		} else {
			isCorrect = false;
			foxyMood = 'encourage';
			foxyMessage = `Alerta de desvío: ${currentExercise.hint}`;
			game.incrementPracticePlays();
			if (game.soundEnabled) playError();
		}
	}

	function handleNext() {
		if (game.soundEnabled) playClick();
		if (exerciseIndex < exercises.length - 1) {
			exerciseIndex++;
			selectedOption = null;
			isAnswered = false;
			foxyMood = 'idle';
			foxyMessage = 'Siguiente parámetro listo para calibrar.';
		} else {
			foxyMood = 'celebrate';
			foxyMessage = `¡Módulo de entrenamiento completado con éxito! Ganaste +${scoreGems} 💎.`;
			if (game.soundEnabled) playGem();
		}
	}
</script>

<div
	class="relative flex w-full max-w-4xl flex-col items-center gap-6 rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-b from-[#16162e] to-[#0d0d1f] p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)] max-md:p-4"
>
	<!-- Header del Módulo de Entrenamiento -->
	<div class="flex w-full flex-wrap items-center justify-between gap-3 border-b border-gray-700/60 pb-4">
		<div class="flex items-center gap-2">
			<span class="rounded-lg bg-cyan-500/20 px-3 py-1 font-arcade text-xs text-cyan-400">
				SIMULADOR CADETE
			</span>
			<span class="text-xs text-emerald-400 font-bold">● Práctica Libre (0⚡)</span>
		</div>
		<div class="flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1 border border-amber-400/30">
			<span class="text-base">💎</span>
			<span class="font-arcade text-xs text-amber-400">+{scoreGems}</span>
		</div>
	</div>

	<!-- Selector de Modos de Entrenamiento -->
	<div class="flex flex-wrap justify-center gap-2">
		<button
			class="cursor-pointer rounded-xl px-4 py-2 font-arcade text-[0.65rem] transition-all
				{currentMode === 'calibracion'
				? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
				: 'border border-gray-700 bg-[#21213b] text-gray-400 hover:text-white'}"
			onclick={() => changeMode('calibracion')}
		>
			⚙️ CALIBRACIÓN
		</button>
		<button
			class="cursor-pointer rounded-xl px-4 py-2 font-arcade text-[0.65rem] transition-all
				{currentMode === 'desencriptado'
				? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
				: 'border border-gray-700 bg-[#21213b] text-gray-400 hover:text-white'}"
			onclick={() => changeMode('desencriptado')}
		>
			🧩 DESENCRIPTAR
		</button>
		<button
			class="cursor-pointer rounded-xl px-4 py-2 font-arcade text-[0.65rem] transition-all
				{currentMode === 'escudos'
				? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
				: 'border border-gray-700 bg-[#21213b] text-gray-400 hover:text-white'}"
			onclick={() => changeMode('escudos')}
		>
			🛡️ ESCUDOS (V/F)
		</button>
	</div>

	<!-- Selector de Tablas (Frecuencias 1 a 12 o Mix) -->
	<div class="flex w-full flex-col items-center gap-1.5 rounded-2xl bg-slate-950/60 p-3 border border-gray-800">
		<span class="text-[0.65rem] tracking-wider text-gray-400 uppercase font-arcade">
			SELECCIONAR FRECUENCIA / TABLA:
		</span>
		<div class="flex flex-wrap justify-center gap-1.5">
			<button
				class="cursor-pointer rounded-lg px-2.5 py-1 font-arcade text-[0.6rem] transition-all
					{selectedTable === 0
					? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]'
					: 'border border-gray-700 bg-[#1a1a2e] text-gray-400 hover:text-white'}"
				onclick={() => changeTable(0)}
			>
				MIX
			</button>
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as num}
				<button
					class="cursor-pointer rounded-lg px-2.5 py-1 font-arcade text-[0.6rem] transition-all
						{selectedTable === num
						? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(251,191,36,0.6)]'
						: 'border border-gray-700 bg-[#1a1a2e] text-gray-300 hover:border-amber-400/50'}"
					onclick={() => changeTable(num)}
				>
					×{num}
				</button>
			{/each}
		</div>
	</div>

	<!-- Área de interacción: Monitor Foxy + Terminal -->
	<div class="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-12">
		<!-- Monitor de Foxy (Feedback e Instrucciones) -->
		<div class="md:col-span-4">
			<FoxyMonitor message={foxyMessage} mood={foxyMood} />
		</div>

		<!-- Consola Principal de la Actividad -->
		<div
			class="relative flex flex-col items-center gap-5 rounded-2xl border border-amber-400/30 bg-[#121226] p-6 md:col-span-8 max-md:p-4"
		>
			<!-- Barra de progreso -->
			<div class="w-full">
				<div class="mb-1 flex justify-between text-[0.65rem] text-gray-400">
					<span>CALIBRACIÓN {exerciseIndex + 1}/{exercises.length}</span>
					<span class="font-arcade text-cyan-400">{Math.round(progressPercent)}%</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
					<div
						class="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-500"
						style="width: {progressPercent}%"
					></div>
				</div>
			</div>

			<!-- Pantalla de Operación / Pregunta -->
			<div
				class="flex w-full flex-col items-center justify-center rounded-xl border border-cyan-500/20 bg-slate-950/70 py-6"
			>
				<span class="text-xs tracking-wider text-cyan-400/80 uppercase text-center px-2">
					{currentExercise.subtext}
				</span>
				<span
					class="font-arcade my-2 text-3xl tracking-widest text-white [text-shadow:0_0_15px_rgba(255,255,255,0.4)] max-md:text-2xl"
				>
					{currentExercise.prompt}
				</span>
				{#if isAnswered}
					<span
						class="text-xs font-semibold px-2 text-center {isCorrect
							? 'text-emerald-400'
							: 'text-rose-400'}"
					>
						{isCorrect
							? '✓ ¡Coordenada Sincronizada!'
							: `✗ Desvío: La respuesta correcta es ${currentMode === 'escudos' ? (currentExercise.target === 1 ? 'VERDADERO' : 'FALSO') : currentExercise.target}`}
					</span>
				{/if}
			</div>

			<!-- Opciones Interactivas -->
			{#if currentMode === 'escudos'}
				<div class="grid w-full grid-cols-2 gap-4">
					<button
						disabled={isAnswered}
						class="flex h-14 cursor-pointer flex-col items-center justify-center rounded-xl border-2 font-arcade text-sm transition-all
							{selectedOption === 1
							? isCorrect
								? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
								: 'border-rose-500 bg-rose-500/20 text-rose-300'
							: 'border-slate-700 bg-slate-900 text-emerald-400 hover:border-emerald-400 active:scale-95'}"
						onclick={() => handleAnswer(1)}
					>
						✓ VERDADERO
					</button>
					<button
						disabled={isAnswered}
						class="flex h-14 cursor-pointer flex-col items-center justify-center rounded-xl border-2 font-arcade text-sm transition-all
							{selectedOption === 0
							? isCorrect
								? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
								: 'border-rose-500 bg-rose-500/20 text-rose-300'
							: 'border-slate-700 bg-slate-900 text-rose-400 hover:border-rose-400 active:scale-95'}"
						onclick={() => handleAnswer(0)}
					>
						✗ FALSO
					</button>
				</div>
			{:else}
				<div class="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
					{#each currentExercise.options as option}
						<button
							disabled={isAnswered}
							class="flex h-14 cursor-pointer flex-col items-center justify-center rounded-xl border-2 font-arcade text-base transition-all
								{selectedOption === option
								? isCorrect
									? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
									: 'border-rose-500 bg-rose-500/20 text-rose-300'
								: 'border-slate-700 bg-slate-900 text-amber-400 hover:border-amber-400 hover:bg-amber-400/10 active:scale-95'}
								{isAnswered && option === currentExercise.target ? 'border-emerald-400 text-emerald-400' : ''}"
							onclick={() => handleAnswer(option)}
						>
							{option}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Botón de Siguiente o Reinicio -->
			{#if isAnswered}
				<button
					class="mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 font-arcade text-xs font-bold text-slate-950 transition-all hover:brightness-110 active:scale-95"
					onclick={exerciseIndex < exercises.length - 1 ? handleNext : resetSession}
				>
					{exerciseIndex < exercises.length - 1 ? 'SIGUIENTE CALIBRACIÓN →' : 'REINICIAR SIMULACIÓN ↺'}
				</button>
			{/if}
		</div>
	</div>
</div>
