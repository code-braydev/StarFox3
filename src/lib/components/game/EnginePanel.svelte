<script lang="ts">
	import { levelInfo } from '$lib/constants/levels';

	let {
		table,
		questionIndex,
		totalQuestions,
		energyPercent,
		a,
		b
	}: {
		table: number;
		questionIndex: number;
		totalQuestions: number;
		energyPercent: number;
		a: number;
		b: number;
	} = $props();

	let levelName = $derived(levelInfo[table]?.name ?? 'Nivel');
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
		class="mb-4 flex items-center justify-center gap-3 rounded-2xl border border-amber-400/20 bg-[#12122a] py-5 max-md:mb-3 max-md:py-4"
	>
		<span class="text-[0.7rem] text-gray-400 max-md:text-[0.6rem]">CALIBRAR:</span>
		<span class="font-arcade text-3xl text-white max-md:text-2xl">
			{a} × {b}
		</span>
		<span class="font-arcade text-3xl text-amber-400 max-md:text-2xl">=</span>
		<span class="font-arcade text-3xl text-amber-400/60 max-md:text-2xl">?</span>
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
