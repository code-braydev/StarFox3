<script lang="ts">
	let {
		current,
		total = 10
	}: {
		current: number;
		total?: number;
	} = $props();

	let percentage = $derived(Math.round((current / total) * 100));
	let isFull = $derived(current >= total);
</script>

<div class="w-full max-w-md">
	<!-- Label -->
	<div class="mb-2 flex items-center justify-between">
		<span class="font-arcade text-xs text-cyan-400 max-md:text-[0.6rem]">ESCUDOS</span>
		<span class="font-arcade text-xs text-cyan-300 max-md:text-[0.6rem]">
			{current}/{total}
		</span>
	</div>

	<!-- Barra -->
	<div
		class="relative h-5 overflow-hidden rounded-full border border-cyan-500/30 bg-[#1E1E2F] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
	>
		<!-- Fill -->
		<div
			class="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out
				{isFull
				? 'bg-gradient-to-r from-cyan-400 via-green-400 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
				: 'bg-gradient-to-r from-cyan-600 to-cyan-400'}"
			style="width: {percentage}%;"
		>
			<!-- Shine effect -->
			<div
				class="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent"
			></div>
		</div>

		<!-- Segment markers -->
		{#each Array(total) as _, i (i)}
			<div
				class="absolute top-0 h-full w-px bg-cyan-500/20"
				style="left: {((i + 1) / total) * 100}%;"
			></div>
		{/each}
	</div>

	<!-- Texto de estado -->
	<div class="mt-1 text-center">
		<span
			class="text-[0.65rem] font-bold transition-colors duration-300
				{isFull ? 'text-green-400' : percentage >= 60 ? 'text-cyan-400' : 'text-cyan-600'}"
		>
			{isFull ? '¡ESCUDOS AL 100%!' : percentage > 0 ? `Cargando... ${percentage}%` : 'Sin carga'}
		</span>
	</div>
</div>
