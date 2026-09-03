<script lang="ts">
	let { completedUpTo }: { completedUpTo: number } = $props();

	const pathSegments = [
		{ from: 2, to: 3, type: 'horizontal' },
		{ from: 3, to: 4, type: 'horizontal' },
		{ from: 4, to: 5, type: 'vertical-down' },
		{ from: 5, to: 6, type: 'horizontal-reverse' },
		{ from: 6, to: 7, type: 'horizontal-reverse' },
		{ from: 7, to: 8, type: 'vertical-down' },
		{ from: 8, to: 9, type: 'horizontal' }
	];

	function isSegmentCompleted(from: number, to: number): boolean {
		return completedUpTo >= from && completedUpTo >= to;
	}

	function isSegmentActive(from: number): boolean {
		return completedUpTo >= from - 1 && completedUpTo < from + 1;
	}
</script>

<div class="pointer-events-none absolute inset-0 z-0">
	<svg class="h-full w-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
		<defs>
			<!-- Gradiente para path completado -->
			<linearGradient id="path-completed" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#FBBF24" stop-opacity="0.8" />
				<stop offset="100%" stop-color="#F59E0B" stop-opacity="0.8" />
			</linearGradient>

			<!-- Gradiente para path activo -->
			<linearGradient id="path-active" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#FBBF24" stop-opacity="0.4" />
				<stop offset="50%" stop-color="#FBBF24" stop-opacity="0.8" />
				<stop offset="100%" stop-color="#FBBF24" stop-opacity="0.4" />
			</linearGradient>

			<!-- Glow filter -->
			<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="3" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Fila 1: 2 → 3 → 4 -->
		<!-- 2 → 3 -->
		<line x1="160" y1="120" x2="400" y2="120"
			stroke={isSegmentCompleted(2, 3) ? 'url(#path-completed)' : isSegmentActive(2) ? 'url(#path-active)' : '#374151'}
			stroke-width="3"
			stroke-dasharray={isSegmentCompleted(2, 3) ? 'none' : '8 4'}
			filter={isSegmentCompleted(2, 3) ? 'url(#glow)' : undefined}
			opacity={isSegmentCompleted(2, 3) ? 1 : isSegmentActive(2) ? 0.6 : 0.3}
		/>

		<!-- 3 → 4 -->
		<line x1="400" y1="120" x2="640" y2="120"
			stroke={isSegmentCompleted(3, 4) ? 'url(#path-completed)' : isSegmentActive(3) ? 'url(#path-active)' : '#374151'}
			stroke-width="3"
			stroke-dasharray={isSegmentCompleted(3, 4) ? 'none' : '8 4'}
			filter={isSegmentCompleted(3, 4) ? 'url(#glow)' : undefined}
			opacity={isSegmentCompleted(3, 4) ? 1 : isSegmentActive(3) ? 0.6 : 0.3}
		/>

		<!-- 4 ↓ 5 (curva descendente) -->
		<path d="M 640 120 Q 640 200 640 220 Q 640 280 640 300"
			stroke={isSegmentCompleted(4, 5) ? 'url(#path-completed)' : isSegmentActive(4) ? 'url(#path-active)' : '#374151'}
			stroke-width="3"
			stroke-dasharray={isSegmentCompleted(4, 5) ? 'none' : '8 4'}
			fill="none"
			filter={isSegmentCompleted(4, 5) ? 'url(#glow)' : undefined}
			opacity={isSegmentCompleted(4, 5) ? 1 : isSegmentActive(4) ? 0.6 : 0.3}
		/>

		<!-- Fila 2: 5 ← 6 ← 7 -->
		<!-- 5 ← 6 -->
		<line x1="640" y1="350" x2="400" y2="350"
			stroke={isSegmentCompleted(5, 6) ? 'url(#path-completed)' : isSegmentActive(5) ? 'url(#path-active)' : '#374151'}
			stroke-width="3"
			stroke-dasharray={isSegmentCompleted(5, 6) ? 'none' : '8 4'}
			filter={isSegmentCompleted(5, 6) ? 'url(#glow)' : undefined}
			opacity={isSegmentCompleted(5, 6) ? 1 : isSegmentActive(5) ? 0.6 : 0.3}
		/>

		<!-- 6 ← 7 -->
		<line x1="400" y1="350" x2="160" y2="350"
			stroke={isSegmentCompleted(6, 7) ? 'url(#path-completed)' : isSegmentActive(6) ? 'url(#path-active)' : '#374151'}
			stroke-width="3"
			stroke-dasharray={isSegmentCompleted(6, 7) ? 'none' : '8 4'}
			filter={isSegmentCompleted(6, 7) ? 'url(#glow)' : undefined}
			opacity={isSegmentCompleted(6, 7) ? 1 : isSegmentActive(6) ? 0.6 : 0.3}
		/>

		<!-- 7 ↓ 8 (curva descendente) -->
		<path d="M 160 350 Q 160 430 160 460 Q 160 500 160 530"
			stroke={isSegmentCompleted(7, 8) ? 'url(#path-completed)' : isSegmentActive(7) ? 'url(#path-active)' : '#374151'}
			stroke-width="3"
			stroke-dasharray={isSegmentCompleted(7, 8) ? 'none' : '8 4'}
			fill="none"
			filter={isSegmentCompleted(7, 8) ? 'url(#glow)' : undefined}
			opacity={isSegmentCompleted(7, 8) ? 1 : isSegmentActive(7) ? 0.6 : 0.3}
		/>

		<!-- Fila 3: 8 → 9 -->
		<line x1="160" y1="560" x2="400" y2="560"
			stroke={isSegmentCompleted(8, 9) ? 'url(#path-completed)' : isSegmentActive(8) ? 'url(#path-active)' : '#374151'}
			stroke-width="3"
			stroke-dasharray={isSegmentCompleted(8, 9) ? 'none' : '8 4'}
			filter={isSegmentCompleted(8, 9) ? 'url(#glow)' : undefined}
			opacity={isSegmentCompleted(8, 9) ? 1 : isSegmentActive(8) ? 0.6 : 0.3}
		/>

		<!-- Partículas animadas en paths activos -->
		{#if isSegmentActive(2)}
			<circle r="3" fill="#FBBF24" opacity="0.8">
				<animateMotion dur="2s" repeatCount="indefinite" path="M 160 120 L 400 120" />
			</circle>
		{/if}
		{#if isSegmentActive(3)}
			<circle r="3" fill="#FBBF24" opacity="0.8">
				<animateMotion dur="2s" repeatCount="indefinite" path="M 400 120 L 640 120" />
			</circle>
		{/if}
		{#if isSegmentActive(5)}
			<circle r="3" fill="#FBBF24" opacity="0.8">
				<animateMotion dur="2s" repeatCount="indefinite" path="M 640 350 L 400 350" />
			</circle>
		{/if}
		{#if isSegmentActive(6)}
			<circle r="3" fill="#FBBF24" opacity="0.8">
				<animateMotion dur="2s" repeatCount="indefinite" path="M 400 350 L 160 350" />
			</circle>
		{/if}
		{#if isSegmentActive(8)}
			<circle r="3" fill="#FBBF24" opacity="0.8">
				<animateMotion dur="2s" repeatCount="indefinite" path="M 160 560 L 400 560" />
			</circle>
		{/if}
	</svg>
</div>
