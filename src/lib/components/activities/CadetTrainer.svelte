<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { telemetry } from '$lib/sync/outbox';
	import { calculateLevelStars } from '$lib/stores/logic/questions';
	import { playSuccess, playError, playClick, playGem } from '$lib/audio/audio';
	import FoxyMonitor from '$lib/components/game/hud/FoxyMonitor.svelte';

	type RewardGoal = 'libre' | 'gemas' | 'energia';
	type ActivityMode = 'calibracion' | 'desencriptado' | 'escudos';

	interface Exercise {
		id: number;
		prompt: string;
		subtext: string;
		target: number;
		options: number[];
		hint: string;
	}

	let rewardGoal = $state<RewardGoal>('energia');
	let currentMode = $state<ActivityMode>('calibracion');
	let selectedTable = $state<number>(0); // 0 = Aleatorio, 1-12 = Tablas específicas
	let exerciseIndex = $state(0);
	let selectedOption = $state<number | null>(null);
	let isAnswered = $state(false);
	let isCorrect = $state(false);

	let sessionGems = $state(0);
	let sessionEnergy = $state(0);
	let correctInSession = $state(0);
	let streak = $state(0);
	let hearts = $state(3);
	let sessionFinished = $state(false);
	let sessionStartedAt = $state(Date.now());

	let foxyMessage = $state(
		'¡Bienvenido al Simulador del Great Fox! Elige el modo de recompensa y la tabla para comenzar.'
	);
	let foxyMood = $state<'idle' | 'celebrate' | 'encourage'>('idle');

	const REWARD_MODES: {
		id: RewardGoal;
		title: string;
		badge: string;
		desc: string;
		colorClass: string;
		activeClass: string;
	}[] = [
		{
			id: 'libre',
			title: '🧘 Práctica Libre',
			badge: 'Sin Recompensas (0⚡ · 0💎)',
			desc: 'Entrena cualquier tabla con pistas tácticas sin presión ni límite de errores.',
			colorClass: 'text-emerald-400',
			activeClass:
				'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.35)]'
		},
		{
			id: 'gemas',
			title: '💎 Caza de Gemas',
			badge: 'Solo Gemas (+💎 · 0⚡)',
			desc: '3 corazones ❤️. Gana +2 💎 por acierto y +3 💎 extra cada 5 seguidas.',
			colorClass: 'text-cyan-400',
			activeClass:
				'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.35)]'
		},
		{
			id: 'energia',
			title: '⚡ Recarga de Reactor',
			badge: 'Solo Energía (+⚡ · 0💎)',
			desc: 'Inyecta +10⚡ por acierto a los motores de la nave (+20⚡ extra al completar).',
			colorClass: 'text-amber-400',
			activeClass:
				'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
		}
	];

	function generateExercises(mode: ActivityMode, table: number): Exercise[] {
		const list: Exercise[] = [];
		const count = 10;

		for (let i = 0; i < count; i++) {
			const a = table > 0 ? table : Math.floor(Math.random() * 9) + 2;
			const b = Math.floor(Math.random() * 9) + 2;
			const product = a * b;

			if (mode === 'calibracion') {
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

	function changeRewardGoal(goal: RewardGoal) {
		if (game.soundEnabled) playClick();
		rewardGoal = goal;
		resetSession();
	}

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
		correctInSession = 0;
		sessionGems = 0;
		sessionEnergy = 0;
		streak = 0;
		hearts = 3;
		sessionFinished = false;
		sessionStartedAt = Date.now();
		selectedOption = null;
		isAnswered = false;
		foxyMood = 'idle';
		foxyMessage =
			rewardGoal === 'libre'
				? 'Modo Libre activado: Practica sin límites ni penalizaciones.'
				: rewardGoal === 'gemas'
					? 'Caza de Gemas activada: ¡Cuida tus 3 corazones ❤️ y acumula gemas!'
					: 'Recarga de Reactor activada: ¡Cada acierto inyecta +10⚡ a la nave!';
	}

	function recordTelemetry(completed: boolean) {
		const modeMap = {
			libre: 'zen',
			gemas: 'precision',
			energia: 'velocidad'
		} as const;
		telemetry.levelAttempt({
			level: selectedTable,
			mode: modeMap[rewardGoal],
			stars: calculateLevelStars(correctInSession, exercises.length),
			correct: correctInSession,
			total: exerciseIndex + 1,
			durationMs: Date.now() - sessionStartedAt,
			completed,
			startedAt: sessionStartedAt
		});
	}

	function handleAnswer(val: number) {
		if (isAnswered || sessionFinished) return;
		selectedOption = val;
		isAnswered = true;

		if (val === currentExercise.target) {
			isCorrect = true;
			correctInSession++;
			streak++;
			foxyMood = 'celebrate';
			game.incrementPracticePlays();
			if (game.soundEnabled) playSuccess();

			if (rewardGoal === 'libre') {
				foxyMessage = '¡Excelente cálculo! En Modo Libre entrenas sin presión (0⚡ / 0💎).';
			} else if (rewardGoal === 'gemas') {
				const bonus = streak % 5 === 0 ? 3 : 0;
				const earned = 2 + bonus;
				sessionGems += earned;
				game.addGems(earned);
				foxyMessage =
					bonus > 0
						? `¡Racha de ${streak}! Ganaste +${earned} 💎 (incluye bono de racha).`
						: `¡Blanco perfecto! +${earned} 💎 añadidas a tu reserva.`;
			} else {
				const energyGain = 10;
				sessionEnergy += energyGain;
				game.addEnergy(energyGain);
				foxyMessage = `¡Reactor sincronizado! +${energyGain}⚡ de energía recargada en la nave.`;
			}
		} else {
			isCorrect = false;
			streak = 0;
			foxyMood = 'encourage';
			game.incrementPracticePlays();
			if (game.soundEnabled) playError();

			if (rewardGoal === 'gemas') {
				hearts--;
				if (hearts <= 0) {
					foxyMessage = `¡Te quedaste sin corazones! Lograste recolectar +${sessionGems} 💎 en esta incursión.`;
					sessionFinished = true;
					recordTelemetry(false);
					return;
				}
				foxyMessage = `¡Cuidado, perdiste 1 ❤️! ${currentExercise.hint}`;
			} else {
				foxyMessage = `Alerta de desvío: ${currentExercise.hint}`;
			}
		}

		if (exerciseIndex === exercises.length - 1) {
			if (rewardGoal === 'energia' && correctInSession >= 7) {
				sessionEnergy += 20;
				game.addEnergy(20);
			}
			recordTelemetry(true);
		}
	}

	function handleNext() {
		if (game.soundEnabled) playClick();
		if (exerciseIndex < exercises.length - 1) {
			exerciseIndex++;
			selectedOption = null;
			isAnswered = false;
			foxyMood = 'idle';
			foxyMessage = 'Siguiente parámetro listo en consola.';
		} else {
			sessionFinished = true;
			foxyMood = 'celebrate';
			if (rewardGoal === 'libre') {
				foxyMessage = `¡Ronda de práctica terminada! Acertaste ${correctInSession}/${exercises.length}.`;
			} else if (rewardGoal === 'gemas') {
				foxyMessage = `¡Misión de Caza completada! Ganaste un total de +${sessionGems} 💎.`;
				if (game.soundEnabled) playGem();
			} else {
				foxyMessage = `¡Motores cargados! Recuperaste +${sessionEnergy}⚡ de energía.`;
				if (game.soundEnabled) playGem();
			}
		}
	}
</script>

<div
	class="relative flex w-full max-w-4xl flex-col items-center gap-5 rounded-3xl border-2 border-amber-400/40 bg-gradient-to-b from-[#252540] to-[#1a1a2e] p-6 shadow-[0_0_40px_rgba(251,191,36,0.15)] max-md:p-4"
>
	<!-- Selector Principal: 3 Modos de Recompensa -->
	<div class="w-full">
		<div class="mb-2 text-center font-arcade text-[0.65rem] tracking-wider text-[#FBBF24]">
			1. ELIGE EL OBJETIVO DE LA SIMULACIÓN
		</div>
		<div class="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
			{#each REWARD_MODES as rm (rm.id)}
				<button
					class="flex cursor-pointer flex-col items-start gap-1 rounded-2xl border-2 p-3.5 text-left transition-all
						{rewardGoal === rm.id
						? rm.activeClass
						: 'border-gray-700 bg-[#1E1E2F] text-gray-300 hover:border-amber-400/50'}"
					onclick={() => changeRewardGoal(rm.id)}
				>
					<div class="flex w-full items-center justify-between">
						<span class="font-arcade text-xs text-white">{rm.title}</span>
						{#if rewardGoal === rm.id}
							<span class="rounded-full bg-white/15 px-2 py-0.5 text-[0.6rem] font-bold">ACTIVO</span>
						{/if}
					</div>
					<span class="text-[0.68rem] font-bold {rm.colorClass}">{rm.badge}</span>
					<p class="text-[0.68rem] leading-snug text-gray-400">{rm.desc}</p>
				</button>
			{/each}
		</div>
	</div>

	<!-- Barra de Estado de la Sesión + Selector de Mecánica -->
	<div
		class="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-700/60 bg-slate-950/50 px-4 py-2.5"
	>
		<!-- Tipo de Ejercicio -->
		<div class="flex flex-wrap items-center gap-2">
			<span class="font-arcade text-[0.6rem] text-gray-400">MECÁNICA:</span>
			<button
				class="cursor-pointer rounded-xl px-3 py-1.5 font-arcade text-[0.6rem] transition-all
					{currentMode === 'calibracion'
					? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
					: 'border border-gray-700 bg-[#21213b] text-gray-300 hover:text-white'}"
				onclick={() => changeMode('calibracion')}
			>
				⚙️ MULTIPLICAR
			</button>
			<button
				class="cursor-pointer rounded-xl px-3 py-1.5 font-arcade text-[0.6rem] transition-all
					{currentMode === 'desencriptado'
					? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
					: 'border border-gray-700 bg-[#21213b] text-gray-300 hover:text-white'}"
				onclick={() => changeMode('desencriptado')}
			>
				🧩 INCÓGNITA
			</button>
			<button
				class="cursor-pointer rounded-xl px-3 py-1.5 font-arcade text-[0.6rem] transition-all
					{currentMode === 'escudos'
					? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
					: 'border border-gray-700 bg-[#21213b] text-gray-300 hover:text-white'}"
				onclick={() => changeMode('escudos')}
			>
				🛡️ V / F
			</button>
		</div>

		<!-- Indicador de Ganancias de la Sesión -->
		<div class="flex items-center gap-3">
			{#if rewardGoal === 'libre'}
				<span class="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 font-arcade text-[0.6rem] text-emerald-300">
					🧘 MODO SIN GANANCIAS
				</span>
			{:else if rewardGoal === 'gemas'}
				<div class="flex items-center gap-1">
					{#each Array(3) as _, i (i)}
						<span class="text-sm {i < hearts ? '' : 'opacity-30 grayscale'}">❤️</span>
					{/each}
				</div>
				<div class="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-1">
					<span class="text-sm">💎</span>
					<span class="font-arcade text-xs text-cyan-300">+{sessionGems}</span>
				</div>
			{:else}
				<div class="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-1">
					<span class="text-sm">⚡</span>
					<span class="font-arcade text-xs text-amber-300">+{sessionEnergy} recargados</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Selector de Tablas (Frecuencias 1 a 12 o Mix) -->
	<div
		class="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-gray-800 bg-slate-950/60 p-3"
	>
		<span class="font-arcade text-[0.6rem] tracking-wider text-gray-400 uppercase">
			SELECCIONAR TABLA DE ENTRENAMIENTO:
		</span>
		<div class="flex flex-wrap justify-center gap-1.5">
			<button
				class="cursor-pointer rounded-lg px-2.5 py-1 font-arcade text-[0.6rem] transition-all
					{selectedTable === 0
					? 'bg-cyan-500 font-bold text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
					: 'border border-gray-700 bg-[#1a1a2e] text-gray-400 hover:text-white'}"
				onclick={() => changeTable(0)}
			>
				MIX
			</button>
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as num (num)}
				<button
					class="cursor-pointer rounded-lg px-2.5 py-1 font-arcade text-[0.6rem] transition-all
						{selectedTable === num
						? 'bg-amber-400 font-bold text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
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
		<div class="md:col-span-4">
			<FoxyMonitor message={foxyMessage} mood={foxyMood} />
		</div>

		<div
			class="relative flex flex-col items-center gap-5 rounded-2xl border border-amber-400/30 bg-[#1E1E2F] p-6 md:col-span-8 max-md:p-4"
		>
			{#if sessionFinished}
				<div class="flex flex-col items-center gap-4 py-6 text-center">
					<div class="text-5xl">
						{rewardGoal === 'gemas' && hearts <= 0 ? '💔' : rewardGoal === 'energia' ? '⚡' : rewardGoal === 'gemas' ? '💎' : '🧘'}
					</div>
					<h3 class="font-arcade text-base text-white">
						{rewardGoal === 'gemas' && hearts <= 0 ? '¡SIN CORAZONES!' : '¡RONDA COMPLETADA!'}
					</h3>
					<p class="text-sm text-gray-300">
						Aciertos: <span class="font-bold text-amber-400">{correctInSession}</span> / {exercises.length}
					</p>
					{#if rewardGoal === 'gemas'}
						<p class="font-arcade text-xs text-cyan-300">Recompensa total: +{sessionGems} 💎</p>
					{:else if rewardGoal === 'energia'}
						<p class="font-arcade text-xs text-amber-300">Energía inyectada: +{sessionEnergy} ⚡</p>
					{:else}
						<p class="font-arcade text-xs text-emerald-300">Práctica libre (0⚡ / 0💎)</p>
					{/if}
					<button
						class="mt-2 cursor-pointer rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 font-arcade text-xs font-bold text-slate-950 transition-all hover:brightness-110 active:scale-95"
						onclick={resetSession}
					>
						NUEVA RONDA ↺
					</button>
				</div>
			{:else}
				<!-- Barra de progreso -->
				<div class="w-full">
					<div class="mb-1 flex justify-between text-[0.65rem] text-gray-400">
						<span>EJERCICIO {exerciseIndex + 1}/{exercises.length}</span>
						<span class="font-arcade text-cyan-400">Aciertos: {correctInSession}</span>
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
					<span class="px-2 text-center text-xs tracking-wider text-cyan-400/80 uppercase">
						{currentExercise.subtext}
					</span>
					<span
						class="my-2 font-arcade text-3xl tracking-widest text-white [text-shadow:0_0_15px_rgba(255,255,255,0.4)] max-md:text-2xl"
					>
						{currentExercise.prompt}
					</span>
					{#if isAnswered}
						<span
							class="px-2 text-center text-xs font-semibold {isCorrect
								? 'text-emerald-400'
								: 'text-rose-400'}"
						>
							{isCorrect
								? '✓ ¡Respuesta Correcta!'
								: `✗ Respuesta correcta: ${currentMode === 'escudos' ? (currentExercise.target === 1 ? 'VERDADERO' : 'FALSO') : currentExercise.target}`}
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
						{#each currentExercise.options as option (option)}
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

				{#if isAnswered}
					<button
						class="mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 font-arcade text-xs font-bold text-slate-950 transition-all hover:brightness-110 active:scale-95"
						onclick={handleNext}
					>
						{exerciseIndex < exercises.length - 1 ? 'SIGUIENTE EJERCICIO →' : 'VER RESULTADO FINAL →'}
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>
