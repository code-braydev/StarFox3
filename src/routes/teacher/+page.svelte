<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import type { ClassDoc } from '$lib/firebase/types';

	interface ClassWithKpis extends ClassDoc {
		kpis: {
			totalStudents: number;
			onlineNow: number;
			neverPlayed: number;
			activeLast30d: number;
			avgLevels: number;
			avgStars: number;
			accuracy: number;
			totalCorrect: number;
			totalAttempts: number;
			totalTimeMs: number;
		};
	}

	let classes = $state<ClassWithKpis[]>([]);
	let loading = $state(true);
	let refreshing = $state(false);
	let lastRefreshedAt = $state<number | null>(null);
	let loadError = $state('');
	let showCreate = $state(false);

	// Create form
	let newGrade = $state('');
	let pinEnabled = $state(false);
	let creating = $state(false);
	let createError = $state('');

	onMount(() => {
		loadClasses();
	});

	async function loadClasses(isManualRefresh = false) {
		if (isManualRefresh) {
			refreshing = true;
		} else {
			loading = true;
		}
		loadError = '';
		try {
			const res = await session.authFetch('/api/teacher/overview');
			const data = await res.json().catch(() => ({}));
			if (res.ok) {
				classes = data.classes ?? [];
				lastRefreshedAt = data.serverNow ?? Date.now();
			} else {
				loadError = data.error ?? 'No se pudieron cargar las clases';
			}
		} catch {
			loadError = 'Error de conexión al cargar las clases';
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	async function createClass() {
		if (!newGrade.trim()) return;
		creating = true;
		createError = '';
		try {
			const res = await session.authFetch('/api/classes', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					grade: newGrade.trim(),
					pinEnabled
				})
			});
			const data = await res.json();
			if (!res.ok) {
				createError = data.error ?? 'Error al crear la clase';
				return;
			}
			if (data.class) {
				classes = [data.class, ...classes.filter((c) => c.id !== data.class.id)];
			}
			showCreate = false;
			newGrade = '';
			pinEnabled = false;
			await loadClasses(true);
		} catch {
			createError = 'Error de conexión';
		} finally {
			creating = false;
		}
	}

	function usageBadge(kpis: ClassWithKpis['kpis']): { label: string; color: string } {
		if (kpis.totalStudents === 0) {
			return { label: 'Sin alumnos', color: 'bg-gray-500/20 text-gray-400' };
		}
		if ((kpis.onlineNow ?? 0) > 0) {
			return {
				label: `🟢 ${kpis.onlineNow} jugando ahora`,
				color: 'bg-emerald-500/20 text-emerald-400'
			};
		}
		if (kpis.activeLast30d === 0) {
			return { label: 'Sin uso', color: 'bg-red-500/20 text-red-400' };
		}
		return { label: 'Activo', color: 'bg-amber-500/20 text-amber-400' };
	}

	function fmtRefreshTime(ts: number | null): string {
		if (!ts) return '';
		return new Date(ts).toLocaleTimeString('es', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Dashboard — Star Fox 3</title>
</svelte:head>

<div class="min-h-dvh bg-[#0f0f2a]">
	<!-- Header -->
	<header class="flex items-center justify-between border-b border-gray-800 bg-[#1a1a30] px-6 py-4">
		<div>
			<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24]">PANEL DEL PROFESOR</h1>
			<p class="mt-1 text-sm text-gray-400">
				{session.teacherSession?.name ?? ''}
				{#if lastRefreshedAt}
					<span class="ml-2 text-xs text-gray-500">· Actualizado {fmtRefreshTime(lastRefreshedAt)}</span>
				{/if}
			</p>
		</div>
		<div class="flex items-center gap-3">
			<button
				class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-4 py-2 text-sm text-gray-300 transition-all hover:border-amber-400/50 hover:text-white disabled:opacity-50"
				disabled={refreshing || loading}
				onclick={() => loadClasses(true)}
			>
				{refreshing ? '⏳ Actualizando...' : '🔄 Actualizar'}
			</button>
			<button
				class="cursor-pointer rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-[#1E1E2F] transition-all hover:scale-105"
				onclick={() => (showCreate = true)}
			>
				+ Nueva Clase
			</button>
			<button
				class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-4 py-2 text-sm text-gray-400 transition-all hover:border-amber-400/50 hover:text-white"
				onclick={() => {
					session.teacherLogout();
					goto('/teacher/login');
				}}
			>
				Salir
			</button>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 py-8">
		{#if loadError}
			<div class="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
				⚠️ {loadError}
			</div>
		{/if}

		{#if loading}
			<div class="flex justify-center py-20">
				<div class="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
			</div>
		{:else if classes.length === 0}
			<div class="py-20 text-center">
				<div class="mb-4 text-6xl">🚀</div>
				<h2 class="mb-2 text-xl font-bold text-white">¡Bienvenido, {session.teacherSession?.name}!</h2>
				<p class="mb-6 text-gray-400">Crea tu primera clase para empezar a rastrear el progreso de tus alumnos.</p>
				<button
					class="cursor-pointer rounded-xl bg-amber-400 px-8 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
					onclick={() => (showCreate = true)}
				>
					+ Crear mi primera clase
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each classes as cls (cls.id)}
					{@const badge = usageBadge(cls.kpis)}
					<button
						class="group cursor-pointer rounded-2xl border border-gray-700 bg-[#252540] p-6 text-left transition-all hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]"
						onclick={() => goto(`/teacher/classes/${cls.id}`)}
					>
						<div class="mb-3 flex items-start justify-between">
							<div>
								<h3 class="text-lg font-bold text-white">{cls.grade || cls.name}</h3>
								<p class="text-xs text-gray-400">Matemáticas</p>
							</div>
							<span class="rounded-full px-2.5 py-1 text-xs font-bold {badge.color}">{badge.label}</span>
						</div>

						<div class="mb-3 text-xs text-gray-500">
							Código: <span class="font-mono text-amber-400">{cls.joinCode}</span>
							{#if cls.pinEnabled}
								· <span class="text-cyan-400">🔒 PIN por alumno</span>
							{/if}
						</div>

						<div class="grid grid-cols-3 gap-3 text-center">
							<div class="rounded-lg bg-[#1a1a30] p-2">
								<div class="text-lg font-bold text-white">{cls.kpis.totalStudents}</div>
								<div class="text-[0.65rem] text-gray-500">Alumnos</div>
							</div>
							<div class="rounded-lg bg-[#1a1a30] p-2">
								<div class="text-lg font-bold text-emerald-400">{cls.kpis.onlineNow ?? 0}</div>
								<div class="text-[0.65rem] text-gray-500">En línea</div>
							</div>
							<div class="rounded-lg bg-[#1a1a30] p-2">
								<div class="text-lg font-bold text-amber-400">{cls.kpis.avgLevels}/25</div>
								<div class="text-[0.65rem] text-gray-500">Prom. niveles</div>
							</div>
						</div>

						{#if cls.kpis.neverPlayed > 0}
							<p class="mt-3 text-xs text-red-400">
								⚠ {cls.kpis.neverPlayed} alumno{cls.kpis.neverPlayed > 1 ? 's' : ''} sin uso
							</p>
						{/if}

						<div class="mt-3 text-xs text-gray-500 group-hover:text-amber-400">
							Ver detalle →
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</main>
</div>

<!-- Create class modal -->
{#if showCreate}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
		<div class="w-full max-w-md rounded-3xl border border-amber-400/30 bg-[#252540] p-8">
			<h2 class="mb-6 text-center text-xl font-bold text-white">Nuevo Curso</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					createClass();
				}}
				class="space-y-4"
			>
				<div>
					<label for="clsGrade" class="mb-1 block text-sm text-gray-300">Grado / Curso</label>
					<input
						id="clsGrade"
						type="text"
						bind:value={newGrade}
						required
						class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none focus:border-amber-400"
						placeholder="Ej: 3°B / 3ro de primaria"
					/>
				</div>
				<div class="rounded-xl border border-gray-700/70 bg-[#1E1E2F] p-3">
					<label class="flex cursor-pointer items-center gap-2.5">
						<input type="checkbox" bind:checked={pinEnabled} class="h-4 w-4 accent-amber-400" />
						<span class="text-sm font-medium text-gray-200">Usar PIN personal por estudiante</span>
					</label>
					<p class="mt-1.5 text-xs text-gray-400">
						{pinEnabled
							? 'Activado: Cada estudiante creará su propio PIN en su primera entrada a la sala.'
							: 'Desactivado (por defecto): Los estudiantes entran eligiendo su nombre sin PIN.'}
					</p>
				</div>

				{#if createError}
					<p class="text-sm text-red-400">{createError}</p>
				{/if}

				<div class="flex gap-3">
					<button
						type="button"
						class="flex-1 cursor-pointer rounded-xl border border-gray-600 bg-transparent px-4 py-3 text-sm text-gray-400 transition-all hover:text-white"
						onclick={() => (showCreate = false)}
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={creating || !newGrade.trim()}
						class="flex-1 cursor-pointer rounded-xl bg-amber-400 px-4 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105 disabled:opacity-50"
					>
						{creating ? 'Creando...' : 'Crear'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
