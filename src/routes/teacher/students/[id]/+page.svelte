<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { session } from '$lib/stores/session.svelte';
	import type { StudentDoc, StudentSummary, AttemptDoc, SessionDoc } from '$lib/firebase/types';

	let studentId = $derived(page.params.id);
	let student = $state<StudentDoc | null>(null);
	let progress = $state<StudentSummary | null>(null);
	let attempts = $state<AttemptDoc[]>([]);
	let sessions = $state<SessionDoc[]>([]);
	let loading = $state(true);
	let refreshing = $state(false);

	onMount(() => {
		loadStudent();
	});

	async function loadStudent(isManualRefresh = false) {
		if (isManualRefresh) {
			refreshing = true;
		} else {
			loading = true;
		}
		try {
			const res = await session.authFetch(`/api/students/${studentId}`);
			if (res.ok) {
				const data = await res.json();
				student = data.student;
				progress = data.progress;
				attempts = data.attempts;
				sessions = data.sessions;
			}
		} catch {
			// ignore
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	function fmtAttemptLabel(att: AttemptDoc): string {
		switch (att.mode) {
			case 'velocidad':
				return '⚡ Velocidad Mental';
			case 'precision':
				return '🎯 Precisión Infinita';
			case 'zen':
				return '🧘 Modo Zen';
			case 'training':
				return att.level > 0 ? `🎯 Simulador (Tabla del ${att.level})` : '🎯 Simulador Cadete';
			default:
				return `Nivel ${att.level}`;
		}
	}

	function fmtDuration(ms: number): string {
		const safeMs = Math.max(0, ms || 0);
		const min = Math.floor(safeMs / 60000);
		const sec = Math.floor((safeMs % 60000) / 1000);
		return `${min}:${String(sec).padStart(2, '0')}`;
	}

	function fmtTotalTime(ms: number | undefined): string {
		if (!ms || ms <= 0) return '0 min';
		const min = Math.round(ms / 60000);
		if (min < 60) return `${min} min`;
		const h = Math.floor(min / 60);
		const m = min % 60;
		return `${h}h ${m}m`;
	}

	function fmtDate(ts: number): string {
		return new Date(ts).toLocaleDateString('es', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	let accuracy = $derived(
		progress && progress.totalAttempts > 0
			? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
			: 0
	);

	let recentAttempts = $derived(
		[...attempts].sort((a, b) => b.completedAt - a.completedAt).slice(0, 20)
	);
</script>

<svelte:head>
	<title>{student?.displayName ?? 'Alumno'} — Star Fox 3</title>
</svelte:head>

<div class="min-h-dvh bg-[#0f0f2a]">
	<header class="flex items-center justify-between border-b border-gray-800 bg-[#1a1a30] px-6 py-4">
		<div class="flex items-center gap-4">
			<button
				class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-3 py-2 text-sm text-gray-400 transition-all hover:border-amber-400/50 hover:text-white"
				onclick={() => history.back()}
			>
				← Volver
			</button>
			<h1 class="text-lg font-bold text-white">{student?.displayName ?? '...'}</h1>
		</div>
		<button
			class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-4 py-2 text-sm text-gray-300 transition-all hover:border-amber-400/50 hover:text-white disabled:opacity-50"
			disabled={refreshing || loading}
			onclick={() => loadStudent(true)}
		>
			{refreshing ? '⏳ Actualizando...' : '🔄 Actualizar'}
		</button>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-8">
		{#if loading}
			<div class="flex justify-center py-20">
				<div class="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
			</div>
		{:else if !student}
			<p class="py-20 text-center text-gray-400">Alumno no encontrado.</p>
		{:else}
			<!-- KPI cards -->
			<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
				<div class="rounded-2xl bg-[#252540] p-5 text-center">
					<div class="text-3xl font-bold text-white">
						{progress?.levelsCompleted?.length ?? 0}<span class="text-lg text-gray-500">/25</span>
					</div>
					<div class="mt-1 text-xs text-gray-400">Niveles completados</div>
				</div>
				<div class="rounded-2xl bg-[#252540] p-5 text-center">
					<div class="text-3xl font-bold text-amber-400">⭐ {progress?.totalStars ?? 0}</div>
					<div class="mt-1 text-xs text-gray-400">Estrellas totales</div>
				</div>
				<div class="rounded-2xl bg-[#252540] p-5 text-center">
					<div
						class="text-3xl font-bold {accuracy >= 80
							? 'text-emerald-400'
							: accuracy >= 50
								? 'text-amber-400'
								: 'text-red-400'}"
					>
						{accuracy}%
					</div>
					<div class="mt-1 text-xs text-gray-400">Precisión</div>
				</div>
				<div class="rounded-2xl bg-[#252540] p-5 text-center">
					<div class="text-3xl font-bold text-cyan-400">
						⏱ {fmtTotalTime(progress?.totalPlayTimeMs)}
					</div>
					<div class="mt-1 text-xs text-gray-400">Tiempo jugado</div>
				</div>
			</div>

			<!-- Level-by-level stars -->
			{#if progress?.stars && Object.keys(progress.stars).length > 0}
				<div class="mb-8 rounded-2xl border border-gray-700 bg-[#252540] p-6">
					<h2 class="mb-4 text-sm font-bold text-gray-300">Estrellas por nivel</h2>
					<div class="flex flex-wrap gap-2">
						{#each Array.from({ length: 25 }, (_, i) => i + 1) as lvl (lvl)}
							{@const stars = progress.stars[String(lvl)] ?? 0}
							<div
								class="flex h-10 w-10 flex-col items-center justify-center rounded-lg text-xs font-bold
									{stars === 3
									? 'bg-amber-400/20 text-amber-400'
									: stars === 2
										? 'bg-gray-400/20 text-gray-300'
										: stars === 1
											? 'bg-orange-400/20 text-orange-400'
											: 'bg-[#1a1a30] text-gray-600'}"
								title="Nivel {lvl}: {stars} estrellas"
							>
								<span>{lvl}</span>
								<span>{stars > 0 ? '★'.repeat(stars) : '—'}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Recent attempts -->
			<div class="rounded-2xl border border-gray-700 bg-[#252540] p-6">
				<h2 class="mb-4 text-sm font-bold text-gray-300">Actividad reciente</h2>
				{#if recentAttempts.length === 0}
					<p class="text-sm text-gray-500">Sin actividad registrada.</p>
				{:else}
					<div class="space-y-2">
						{#each recentAttempts as att (att.eventId)}
							<div class="flex items-center justify-between rounded-lg bg-[#1a1a30] px-4 py-3 text-sm">
								<div>
									<span class="font-medium text-white">
										{fmtAttemptLabel(att)}
										{#if att.mode !== 'adventure'}
											<span class="ml-1 text-xs text-cyan-400">(práctica)</span>
										{/if}
									</span>
									<span class="ml-3 text-xs text-gray-400">{fmtDate(att.completedAt)}</span>
								</div>
								<div class="flex items-center gap-4 text-xs">
									<span class="text-amber-400">{'★'.repeat(att.stars) || '—'}</span>
									<span class="text-gray-300">{att.correct}/{att.total}</span>
									<span class="text-gray-500">{fmtDuration(att.durationMs)}</span>
									{#if !att.completed}
										<span class="text-red-400">Fallido</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Sessions -->
			{#if sessions.length > 0}
				<div class="mt-6 rounded-2xl border border-gray-700 bg-[#252540] p-6">
					<h2 class="mb-4 text-sm font-bold text-gray-300">Sesiones ({sessions.length})</h2>
					<div class="space-y-2">
						{#each sessions.slice(0, 10) as sess (sess.eventId)}
							{@const duration = Math.max(0, (sess.lastHeartbeatAt ?? sess.startedAt) - sess.startedAt)}
							<div class="flex items-center justify-between rounded-lg bg-[#1a1a30] px-4 py-2 text-sm">
								<span class="text-gray-300">{fmtDate(sess.startedAt)}</span>
								<span class="text-gray-400">{fmtDuration(duration)}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</main>
</div>
