<script lang="ts">
	import type { Medal } from '$lib/constants/medals';

	let {
		medal,
		earned = false
	}: {
		medal: Medal;
		earned?: boolean;
	} = $props();

	const categoryColors: Record<string, string> = {
		progress: '#FBBF24',
		skill: '#EF4444',
		collection: '#8B5CF6',
		effort: '#22C55E'
	};

	let color = $derived(categoryColors[medal.category] ?? '#6B7280');
</script>

<div
	class="relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300 max-md:p-3
		{earned
		? 'border-amber-400/50 bg-[#252540] shadow-[0_0_10px_rgba(251,191,36,0.15)]'
		: 'border-gray-700 bg-[#1a1a2e] opacity-60'}"
>
	<!-- Icono -->
	<div
		class="flex h-14 w-14 items-center justify-center rounded-full text-3xl max-md:h-12 max-md:w-12 max-md:text-2xl
			{earned ? '' : 'grayscale'}"
		style="background-color: {color}20; border: 2px solid {earned ? color + '50' : '#374151'};"
	>
		{medal.icon}
	</div>

	<!-- Nombre -->
	<h3
		class="text-center text-sm font-bold max-md:text-xs
			{earned ? 'text-white' : 'text-gray-500'}"
	>
		{medal.name}
	</h3>

	<!-- Condición -->
	<p
		class="text-center text-[0.65rem] max-md:text-[0.55rem]
			{earned ? 'text-gray-400' : 'text-gray-600'}"
	>
		{medal.description}
	</p>

	<!-- Estado -->
	{#if earned}
		<span class="text-[0.6rem] font-bold" style="color: {color};">✅ Obtenida</span>
	{:else}
		<span class="text-[0.6rem] text-gray-600">🔒 Bloqueada</span>
	{/if}
</div>
