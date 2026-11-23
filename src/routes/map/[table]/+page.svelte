<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { telemetry } from '$lib/sync/outbox';
	import { levelInfo, getLevelMechanic } from '$lib/constants/levels';
	import { getCharacterById } from '$lib/constants/characters';
	import { playSuccess, playError, playClick, playGem } from '$lib/audio/audio';
	import {
		EnginePanel,
		FoxyMonitor,
		HeartBar,
		EnergyBar,
		TimerBar,
		AbilityButton
	} from '$lib/components/game/hud';
	import { LevelComplete, LevelFailed } from '$lib/components/game/overlays';
	import InteractiveArena from '$lib/components/game/InteractiveArena.svelte';
	import BossBattleArena from '$lib/components/game/BossBattleArena.svelte';
	import {
		generateLevelQuestions,
		calculateLevelStars,
		pickRandom,
		type LevelQuestion
	} from '$lib/stores/logic/questions';
	import {
		initLevelAbilityState,
		getEffectiveLevelTimer,
		applyQuestionStartPassives,
		type LevelAbilityState
	} from '$lib/stores/logic/passives';
	import { executeActiveAbility } from '$lib/stores/logic/abilities';

	let table = $derived(Number(page.params.table));
	let level = $derived(levelInfo[table] ?? null);
	let levelMechanic = $derived(getLevelMechanic(table));
	let selectedCharId = $derived(game.characters.selected);
	let selectedChar = $derived(getCharacterById(selectedCharId));

	let questions = $state<LevelQuestion[]>([]);
	let currentIndex = $state(0);
	let correctCount = $state(0);
	let selectedAnswer = $state<number | null>(null);
	let revealedWrong = $state<number[]>([]);
	let foxyMood = $state<'idle' | 'celebrate' | 'encourage'>('idle');
	let showComplete = $state(false);
	let showFailed = $state(false);

	let timerSeconds = $state(0);
	let timerMax = $state(30);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let actionTimeout: ReturnType<typeof setTimeout> | null = null;
	let levelStartedAt = $state(Date.now());
	let questionStartedAt = $state(Date.now());
	let abilityState = $state<LevelAbilityState>(initLevelAbilityState());

	let totalQuestions = $derived(level?.questions.length ?? 10);
	let currentQ = $derived(questions[currentIndex]);
	let energyPercent = $derived((currentIndex / totalQuestions) * 100);
	let currentFoxyMessage = $state('');

	function clearAllTimers() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		if (actionTimeout) {
			clearTimeout(actionTimeout);
			actionTimeout = null;
		}
	}

	function startTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		if (!level || level.timer <= 0) return;
		const readingBonus = table >= 7 ? 8 : 0;
		const effectiveTimer = getEffectiveLevelTimer(level.timer + readingBonus, selectedCharId);
		timerMax = effectiveTimer;
		timerSeconds = effectiveTimer;
		timerInterval = setInterval(() => {
			if (abilityState.freezeTimerSeconds > 0) {
				abilityState.freezeTimerSeconds--;
				return;
			}
			timerSeconds--;
			if (timerSeconds <= 0) {
				// Pasiva de Tusk: Piel de Hielo (+5s de gracia 1 vez por nivel)
				if (
					selectedChar?.passive.effect === 'timer_emergency_3s' &&
					!abilityState.tuskEmergencyUsed
				) {
					abilityState.tuskEmergencyUsed = true;
					timerSeconds = 5;
					foxyMood = 'encourage';
					currentFoxyMessage = '🦭 ¡Piel de Hielo de Tusk! +5 segundos extra de emergencia.';
					return;
				}
				clearAllTimers();
				handleTimeout();
			}
		}, 1000);
	}

	function prepareQuestion(idx: number) {
		selectedAnswer = null;
		abilityState.highlightCorrectOption = false;
		questionStartedAt = Date.now();
		const q = questions[idx];
		const startPassives = applyQuestionStartPassives(
			selectedCharId,
			q,
			idx,
			abilityState,
			level?.foxyDialogs.start ?? ''
		);
		revealedWrong = startPassives.revealedWrong;
		currentFoxyMessage = startPassives.foxyMessage;
		foxyMood = 'idle';
		startTimer();
	}

	function applyErrorDamageAndStreak(): { survived: boolean; statusNote: string } {
		const passive = selectedChar?.passive.effect;
		let damageAbsorbed = false;
		let statusNote = '';

		// Escudo activo (Sly / Vortex)
		if (abilityState.evadeNextErrorCharges > 0) {
			abilityState.evadeNextErrorCharges--;
			damageAbsorbed = true;
			statusNote = ' 🛡️ ¡Escudo absorbió el daño!';
		} else if (passive === 'first_error_no_damage' && !abilityState.firstErrorUsed) {
			// Pasiva de Brutus: Piel Dura
			abilityState.firstErrorUsed = true;
			damageAbsorbed = true;
			statusNote = ' 🐻 ¡Piel Dura de Brutus evitó perder corazón!';
		}

		if (!damageAbsorbed) {
			game.loseHeart();
		}

		// Activa de Brutus: Muro Férreo (protege estrellas)
		if (abilityState.protectStarsCharges > 0) {
			abilityState.protectStarsCharges--;
			abilityState.protectedErrorsCount++;
		}

		// Pasiva de Sly: Camuflaje (1er error no rompe racha)
		if (passive === 'protect_streak_first_error' && !abilityState.firstErrorUsed) {
			abilityState.firstErrorUsed = true;
			statusNote += ' 🦎 ¡Camuflaje mantuvo tu racha!';
		} else {
			abilityState.levelStreak = 0;
			game.updateStreak(false);
		}

		// Pasiva de Blaze: Renacer (revive con 1 corazón si llega a 0)
		if (
			game.hearts.current <= 0 &&
			passive === 'auto_revive' &&
			!abilityState.blazeReviveUsed
		) {
			abilityState.blazeReviveUsed = true;
			game.addHeart();
			statusNote = ' 🔥 ¡Renacer de Blaze te revivió con 1 corazón!';
			return { survived: true, statusNote };
		}

		return { survived: game.hearts.current > 0, statusNote };
	}

	function advanceOrFinishLevel() {
		if (currentIndex + 1 >= totalQuestions) {
			const effectiveCorrect = Math.min(
				totalQuestions,
				correctCount + abilityState.protectedErrorsCount
			);
			const stars = calculateLevelStars(effectiveCorrect, totalQuestions);
			recordAttempt(true, stars);
			game.completeLevel(table, stars, correctCount, totalQuestions);
			showComplete = true;
			return;
		}
		currentIndex++;
		prepareQuestion(currentIndex);
	}

	function handleTimeout() {
		if (!currentQ || selectedAnswer !== null) return;
		clearAllTimers();
		selectedAnswer = -1;
		if (game.soundEnabled) playError();
		foxyMood = 'encourage';

		const { survived, statusNote } = applyErrorDamageAndStreak();
		currentFoxyMessage = `¡Se acabó el tiempo!${statusNote}`;

		actionTimeout = setTimeout(() => {
			if (!survived) {
				recordAttempt(false, 0);
				showFailed = true;
				return;
			}
			advanceOrFinishLevel();
		}, 1500);
	}

	function handleAbilityUse() {
		if (!currentQ || selectedAnswer !== null) return;
		const res = executeActiveAbility(selectedCharId, currentQ, revealedWrong, abilityState);

		revealedWrong = res.revealedWrong;
		currentFoxyMessage = res.foxyMessage;
		foxyMood = 'celebrate';

		if (res.instantGems > 0) {
			game.addGems(res.instantGems);
			if (game.soundEnabled) playGem();
		}

		if (res.healHearts > 0) {
			game.addHeart();
		}

		if (res.resetTimerToMax && timerMax > 0) {
			timerMax = timerMax + res.timerBonusSeconds;
			timerSeconds = timerMax;
		} else if (res.timerBonusSeconds > 0 && timerSeconds > 0) {
			timerMax = Math.max(timerMax, timerSeconds + res.timerBonusSeconds);
			timerSeconds = timerSeconds + res.timerBonusSeconds;
		}

		if (res.freezeSeconds > 0) {
			abilityState.freezeTimerSeconds += res.freezeSeconds;
		}

		if (res.replacedQuestion) {
			questions[currentIndex] = res.replacedQuestion;
		}

		if (res.highlightCorrect) {
			abilityState.highlightCorrectOption = true;
			setTimeout(() => {
				abilityState.highlightCorrectOption = false;
			}, 3000);
		}

		if (res.skipAsCorrect) {
			handleAnswer(currentQ.answer);
		}
	}

	function handleAnswer(value: number) {
		if (!currentQ || selectedAnswer !== null) return;

		const isCorrect = value === currentQ.answer;
		const passive = selectedChar?.passive.effect;

		// Pasiva de Rex: Lealtad (el 1er error permite reintentar la misma pregunta sin perder vida)
		if (!isCorrect && passive === 'retry_first_error' && !abilityState.firstErrorUsed) {
			abilityState.firstErrorUsed = true;
			if (game.soundEnabled) playError();
			if (!revealedWrong.includes(value)) {
				revealedWrong = [...revealedWrong, value];
			}
			foxyMood = 'encourage';
			currentFoxyMessage = '🐕 ¡Lealtad de Rex! Primer error perdonado, intenta con las restantes.';
			return;
		}

		clearAllTimers();
		selectedAnswer = value;

		if (isCorrect) {
			if (game.soundEnabled) playSuccess();
			foxyMood = 'celebrate';
			const elapsedMs = Date.now() - questionStartedAt;
			correctCount++;
			abilityState.levelStreak++;
			game.updateStreak(true);
			game.updateFastestCorrect(elapsedMs);

			let bonusNotes: string[] = [];

			// Pasiva de Luna: Reflejo Nocturno (< 5s da +1 gema)
			if (passive === 'gems_for_speed' && elapsedMs <= 5000) {
				game.addGems(1);
				bonusNotes.push('🐱 +1 💎 veloz');
			}

			// Pasiva de Nova: Furia (cada 3 aciertos seguidos da +1 gema)
			if (passive === 'gems_scale_with_streak' && abilityState.levelStreak % 3 === 0) {
				game.addGems(1);
				bonusNotes.push('🐉 +1 💎 por racha');
			}

			// Pasiva de Vortex: Flujo (racha de 5 cura 1 corazón 1 vez/nivel)
			if (
				passive === 'heal_on_streak_5' &&
				abilityState.levelStreak >= 5 &&
				!abilityState.vortexHealUsed
			) {
				abilityState.vortexHealUsed = true;
				game.addHeart();
				bonusNotes.push('🦎 +1 ❤️ por racha de 5');
			}

			// Activa de Gizmo: Fiebre de Oro (+2 gemas en los próximos 3 aciertos)
			if (abilityState.doubleGemsCharges > 0) {
				abilityState.doubleGemsCharges--;
				game.addGems(2);
				bonusNotes.push('🦝 +2 💎 Fiebre de Oro');
			}

			const baseDialog = pickRandom(level?.foxyDialogs.correct ?? ['¡Correcto!']);
			currentFoxyMessage =
				bonusNotes.length > 0 ? `${baseDialog} (${bonusNotes.join(' · ')})` : baseDialog;
		} else {
			if (game.soundEnabled) playError();
			foxyMood = 'encourage';
			const { survived, statusNote } = applyErrorDamageAndStreak();
			const baseWrong = pickRandom(level?.foxyDialogs.wrong ?? ['¡Inténtalo de nuevo!']);
			currentFoxyMessage = `${baseWrong}${statusNote}`;

			actionTimeout = setTimeout(() => {
				if (!survived) {
					recordAttempt(false, 0);
					showFailed = true;
					return;
				}
				advanceOrFinishLevel();
			}, 1500);
			return;
		}

		actionTimeout = setTimeout(() => {
			advanceOrFinishLevel();
		}, 1000);
	}

	function recordAttempt(completed: boolean, stars: number) {
		const attempted = completed ? totalQuestions : Math.max(1, currentIndex + 1);
		telemetry.levelAttempt({
			level: table,
			mode: 'adventure',
			stars,
			correct: correctCount,
			total: totalQuestions,
			durationMs: Date.now() - levelStartedAt,
			completed,
			startedAt: levelStartedAt
		});
		if (!completed) {
			game.recordFailedAttempt(correctCount, attempted);
		}
	}

	function handleBossObstacleHit() {
		if (showComplete || showFailed) return;
		const { survived, statusNote } = applyErrorDamageAndStreak();
		foxyMood = 'encourage';
		currentFoxyMessage = `☄️ ¡Impacto de proyectil solar! ¡Esquiva cambiando de carril!${statusNote}`;
		if (!survived) {
			clearAllTimers();
			recordAttempt(false, 0);
			showFailed = true;
		}
	}

	function initLevel(t: number) {
		clearAllTimers();
		game.resetHearts();
		game.resetActiveUsage();
		abilityState = initLevelAbilityState();
		levelStartedAt = Date.now();
		questions = generateLevelQuestions(levelInfo[t] ?? null, t);
		currentIndex = 0;
		correctCount = 0;
		showComplete = false;
		showFailed = false;
		prepareQuestion(0);
	}

	function handleRetry() {
		initLevel(table);
	}

	function handleBack() {
		clearAllTimers();
		if (game.soundEnabled) playClick();
		goto('/map');
	}

	function starsEarned(): number {
		const effectiveCorrect = Math.min(
			totalQuestions,
			correctCount + abilityState.protectedErrorsCount
		);
		return calculateLevelStars(effectiveCorrect, totalQuestions);
	}

	$effect(() => {
		const t = table;
		if (t >= 1 && t <= 25 && levelInfo[t]) {
			untrack(() => {
				initLevel(t);
			});
		}
		return () => {
			clearAllTimers();
		};
	});
</script>

<svelte:head>
	<title>{level?.name ?? 'Nivel'} - Star Fox 3</title>
</svelte:head>

{#if !level}
	<div class="flex min-h-dvh items-center justify-center bg-[#0f0f2a]">
		<div class="text-center">
			<p class="mb-4 text-xl text-white">Nivel no encontrado</p>
			<button
				class="cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
				onclick={() => goto('/map')}
			>
				Volver al mapa
			</button>
		</div>
	</div>
{:else}
	<div
		class="relative flex min-h-dvh w-full flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
		style="background-image: url('{level.background}');"
	>
		<div class="absolute inset-0 bg-slate-950/85"></div>

		<!-- Header centrado con grid -->
		<header
			class="relative z-20 grid w-full grid-cols-[1fr_auto_1fr] items-center px-6 py-4 max-md:px-4 max-md:py-3"
		>
			<div class="flex justify-start">
				<button
					class="cursor-pointer rounded-xl border border-gray-600 bg-[#252540] px-4 py-2 text-xs text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
					onclick={handleBack}
				>
					← Mapa
				</button>
			</div>

			<div class="text-center">
				<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">
					{level.name}
				</h1>
				<p class="mt-0.5 text-[0.65rem] text-cyan-400 max-md:text-[0.55rem]">
					Tabla del {table}
					{#if selectedChar}
						· {selectedChar.name} ({selectedChar.passive.name})
					{/if}
				</p>
			</div>

			<div class="flex items-center justify-end gap-4 max-md:gap-2">
				<HeartBar />
				<EnergyBar />
			</div>
		</header>

		<!-- Contenido principal centrado -->
		<div
			class="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center gap-8 px-6 py-6 max-md:flex-col max-md:gap-4 max-md:px-4 max-md:py-4"
		>
			<!-- Foxy Monitor a la izquierda -->
			<div class="w-48 flex-shrink-0 max-md:w-full">
				<FoxyMonitor message={currentFoxyMessage} mood={foxyMood} />
			</div>

			<!-- Panel central y controles -->
			<div class="flex w-full max-w-xl flex-1 flex-col items-center gap-5">
				{#if !showComplete && !showFailed && currentQ}
					{#if table === 25}
						<BossBattleArena
							questionIndex={currentIndex}
							{totalQuestions}
							storyPrompt={currentQ.storyPrompt}
							displayPrompt={currentQ.displayPrompt}
							answer={currentQ.answer}
							options={currentQ.options}
							{selectedAnswer}
							{revealedWrong}
							highlightCorrect={abilityState.highlightCorrectOption}
							onAnswer={handleAnswer}
							onObstacleHit={handleBossObstacleHit}
						/>
					{:else}
						<EnginePanel
							{table}
							questionIndex={currentIndex}
							{totalQuestions}
							{energyPercent}
							a={currentQ.a}
							b={currentQ.b}
							questionType={currentQ.questionType}
							displayPrompt={currentQ.displayPrompt}
							displayResult={currentQ.displayResult}
							storyPrompt={currentQ.storyPrompt}
							geometryRows={currentQ.geometryRows}
							geometryCols={currentQ.geometryCols}
						/>
					{/if}

					{#if level.timer > 0}
						<div class="w-full">
							<TimerBar seconds={timerSeconds} maxSeconds={timerMax} />
							{#if abilityState.freezeTimerSeconds > 0}
								<p class="mt-1 text-center text-xs font-bold text-cyan-300 animate-pulse">
									❄️ Reloj congelado ({abilityState.freezeTimerSeconds}s)
								</p>
							{/if}
						</div>
					{/if}

					{#if table !== 25}
						<InteractiveArena
							{table}
							mechanic={levelMechanic.id}
							questionIndex={currentIndex}
							questionType={currentQ.questionType}
							a={currentQ.a}
							b={currentQ.b}
							answer={currentQ.answer}
							options={currentQ.options}
							{selectedAnswer}
							{revealedWrong}
							highlightCorrect={abilityState.highlightCorrectOption}
							onAnswer={handleAnswer}
						/>
					{/if}

					<!-- Indicadores de cargas activas (Escudo, Fiebre de Oro, Muro) -->
					{#if abilityState.evadeNextErrorCharges > 0 || abilityState.doubleGemsCharges > 0 || abilityState.protectStarsCharges > 0}
						<div class="flex flex-wrap justify-center gap-2">
							{#if abilityState.evadeNextErrorCharges > 0}
								<span class="rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
									🛡️ Escudo activo ({abilityState.evadeNextErrorCharges})
								</span>
							{/if}
							{#if abilityState.doubleGemsCharges > 0}
								<span class="rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
									💎 Fiebre de Oro ({abilityState.doubleGemsCharges} restantes)
								</span>
							{/if}
							{#if abilityState.protectStarsCharges > 0}
								<span class="rounded-full border border-cyan-400/50 bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
									🐻 Muro Férreo ({abilityState.protectStarsCharges} errores protegidos)
								</span>
							{/if}
						</div>
					{/if}

					<div class="flex flex-wrap items-center justify-center gap-4">
						<AbilityButton onUse={handleAbilityUse} />
						{#if energyPercent > 0}
							<div class="flex items-center gap-2">
								<span class="text-[0.75rem] text-gray-400">Energía del motor:</span>
								<div class="flex gap-1">
									{#each Array(10) as _, i (i)}
										<div
											class="h-3 w-3 rounded-sm transition-all duration-500
												{i < Math.ceil(energyPercent / 10)
												? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)]'
												: 'bg-gray-700'}
											"
										></div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Espaciador simétrico en escritorio para centrar perfectamente el panel del juego -->
			<div class="hidden w-48 flex-shrink-0 lg:block" aria-hidden="true"></div>
		</div>
	</div>

	{#if showComplete}
		<LevelComplete
			{table}
			stars={starsEarned()}
			correct={correctCount}
			total={totalQuestions}
			onRetry={handleRetry}
		/>
	{/if}

	{#if showFailed}
		<div
			class="fixed inset-0 z-[1000] flex animate-fade-in items-center justify-center bg-black/80 p-4"
		>
			<div
				class="w-full max-w-[420px] animate-scale-in rounded-3xl border-[3px] border-red-400/50 bg-gradient-to-br from-[#252540] to-[#1a1a3e] p-8"
			>
				<LevelFailed
					correct={correctCount}
					total={totalQuestions}
					onRetry={handleRetry}
					onMap={handleBack}
				/>
			</div>
		</div>
	{/if}
{/if}
