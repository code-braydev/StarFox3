<script lang="ts">
	import { levelInfo } from '$lib/constants/levels';

	let {
		table,
		questionIndex,
		totalQuestions,
		energyPercent,
		a,
		b,
		questionType = 'multiply',
		displayPrompt = `${a} × ${b}`,
		displayResult = '?',
		geometryRows,
		geometryCols
	}: {
		table: number;
		questionIndex: number;
		totalQuestions: number;
		energyPercent: number;
		a: number;
		b: number;
		questionType?: string;
		displayPrompt?: string;
		displayResult?: string;
		geometryRows?: number;
		geometryCols?: number;
	} = $props();

	let levelName = $derived(levelInfo[table]?.name ?? 'Nivel');
	let promptLabel = $derived(
		questionType === 'trueFalse'
			? '¿ES CORRECTO?'
			: questionType === 'geometry'
				? 'CALCULAR ÁREA:'
				: questionType === 'series'
					? 'COMPLETAR SERIE:'
					: questionType === 'shopping'
						? 'CALCULAR TOTAL:'
						: questionType === 'inverse'
							? 'HALLAR INCÓGNITA:'
							: 'CALIBRAR:'
	);
</script>

<div
	class="relative w-full overflow-hidden rounded-3xl border-[3px] border-amber-400/60 bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2a] p-6 shadow-[0_0_30px_rgba(251,191,36,0.15)] max-md:p-4"
>
	<!-- Líneas decorativas superiores -->
	<div class="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-4 pt-2">
		<div class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]"></div>
		<div class="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"></div>
		<div class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]"></div>
	</div>

	<!-- Título del panel -->
	<div class="mb-4 text-center max-md:mb-3">
		<h2 class="font-arcade text-[0.7rem] tracking-wider text-amber-400 max-md:text-[0.55rem]">
			PANEL DEL MOTOR
		</h2>
		<p class="mt-1 text-[0.75rem] text-gray-400 max-md:text-[0.65rem]">{levelName}</p>
	</div>

	<!-- Barra de energía -->
	<div class="mb-5 max-md:mb-4">
		<div class="mb-1.5 flex items-center justify-between">
			<span class="text-[0.7rem] font-bold text-gray-300 max-md:text-[0.6rem]">ENERGÍA</span>
			<span class="font-arcade text-[0.6rem] text-amber-400 max-md:text-[0.5rem]">
				{Math.round(energyPercent)}%
			</span>
		</div>
		<div
			class="relative h-5 overflow-hidden rounded-full border border-gray-600 bg-[#0a0a1a] max-md:h-4"
		>
			<!-- Fill de energía -->
			<div
				class="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
					{energyPercent >= 70
					? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
					: energyPercent >= 40
						? 'bg-gradient-to-r from-amber-500 to-amber-400'
						: 'bg-gradient-to-r from-red-500 to-red-400'}
				{energyPercent > 0 && energyPercent < 100 ? 'animate-[energy-pulse_1.5s_ease-in-out_infinite]' : ''}
				"
				style="width: {energyPercent}%"
			></div>
			<!-- Líneas de escala -->
			<div class="absolute inset-0 flex">
				{#each Array(10) as _, i (i)}
					<div class="h-full flex-1 border-r border-gray-700/40 last:border-r-0"></div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Operación actual -->
	<div
		class="mb-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-[#12122a] py-5 px-4 text-center max-md:mb-3 max-md:py-4"
	>
		<span class="text-[0.7rem] font-bold tracking-wider text-amber-400/80 max-md:text-[0.6rem]">
			{promptLabel}
		</span>

		{#if questionType === 'geometry' && geometryRows && geometryCols}
			<!-- Grid de bloques visual -->
			<div class="my-2 flex flex-col gap-1 items-center justify-center">
				{#each Array(geometryRows) as _, r (r)}
					<div class="flex gap-1">
						{#each Array(geometryCols) as _, c (c)}
							<div
								class="h-4 w-4 rounded-sm bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_4px_rgba(251,191,36,0.6)]"
							></div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}

		<div class="flex items-center justify-center gap-3">
			<span class="font-arcade text-2xl text-white max-md:text-xl">
				{displayPrompt}
			</span>
			{#if displayResult}
				<span class="font-arcade text-2xl text-amber-400 max-md:text-xl">=</span>
				<span class="font-arcade text-2xl text-amber-300 max-md:text-xl">{displayResult}</span>
			{/if}
		</div>
	</div>

	<!-- Progreso -->
	<div class="flex items-center justify-center gap-2">
		<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">Pregunta</span>
		<span class="font-arcade text-[0.65rem] text-amber-400 max-md:text-[0.55rem]">
			{questionIndex + 1}
		</span>
		<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">de</span>
		<span class="font-arcade text-[0.65rem] text-amber-400 max-md:text-[0.55rem]">
			{totalQuestions}
		</span>
	</div>

	<!-- Luces LED decorativas inferiores -->
	<div class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-2 pb-3">
		{#each Array(5) as _, i (i)}
			<div
				class="h-1.5 w-1.5 rounded-full transition-all duration-500
					{i < Math.ceil(energyPercent / 20)
					? 'bg-emerald-400 shadow-[0_0_4px_rgba(34,197,94,0.8)]'
					: 'bg-gray-700'}
				"
			></div>
		{/each}
	</div>
</div>
