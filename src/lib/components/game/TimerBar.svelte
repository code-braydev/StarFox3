<script lang="ts">
	let {
		seconds,
		maxSeconds
	}: {
		seconds: number;
		maxSeconds: number;
	} = $props();

	let percentage = $derived(maxSeconds > 0 ? (seconds / maxSeconds) * 100 : 100);
	let isCritical = $derived(seconds <= 5 && seconds > 0);
	let isUrgent = $derived(seconds <= 3 && seconds > 0);

	let barColor = $derived(isUrgent ? '#EF4444' : isCritical ? '#FBBF24' : '#22C55E');

	let pulseClass = $derived(isUrgent ? 'animate-pulse' : '');
</script>

<div class="flex w-full items-center gap-3">
	<div class="relative h-3 w-full overflow-hidden rounded-full bg-[#1E1E2F] max-md:h-2">
		<div
			class="h-full rounded-full transition-all duration-1000 ease-linear {pulseClass}"
			style:width="{percentage}%"
			style:background-color={barColor}
		></div>
	</div>
	<span
		class="min-w-[2.5rem] text-right font-arcade text-sm max-md:text-xs {isUrgent
			? 'text-red-400'
			: isCritical
				? 'text-amber-400'
				: 'text-gray-300'}"
	>
		{seconds}s
	</span>
</div>
