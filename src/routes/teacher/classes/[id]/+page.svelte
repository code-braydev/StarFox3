<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import type { ClassDoc, StudentDoc } from '$lib/firebase/types';

	const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

	let classId = $derived(page.params.id);
	let cls = $state<ClassDoc | null>(null);
	let students = $state<StudentDoc[]>([]);
	let serverNow = $state(Date.now());
	let loading = $state(true);
	let refreshing = $state(false);
	let exporting = $state(false);
	let search = $state('');
	let showInvite = $state(false);

	// Actions
	let deleting = $state(false);
	let showDelete = $state(false);

	onMount(() => {
		loadClass();
	});

	async function loadClass(isManualRefresh = false) {
		if (isManualRefresh) {
			refreshing = true;
		} else {
			loading = true;
		}
		try {
			const res = await session.authFetch(`/api/classes/${classId}`);
			if (res.ok) {
				const data = await res.json();
				cls = data.class;
				students = data.students;
				serverNow = data.serverNow ?? Date.now();
			}
		} catch {
			// ignore
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	async function downloadCsv() {
		if (exporting) return;
		exporting = true;
		try {
			const res = await session.authFetch(`/api/classes/${classId}/export`);
			if (!res.ok) return;
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `clase-${(cls?.name ?? 'reporte').replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch {
			// ignore
		} finally {
			exporting = false;
		}
	}

	async function deleteClass() {
		deleting = true;
		try {
			const res = await session.authFetch(`/api/classes/${classId}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				goto('/teacher');
			}
		} catch {
			// ignore
		} finally {
			deleting = false;
			showDelete = false;
		}
	}

	async function copyInvite() {
		const url = `${window.location.origin}/join/${cls?.joinCode}`;
		await navigator.clipboard.writeText(url);
	}

	async function togglePinRequirement() {
		if (!cls) return;
		const nextVal = !cls.pinEnabled;
		cls = { ...cls, pinEnabled: nextVal };
		try {
			await session.authFetch(`/api/classes/${classId}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ pinEnabled: nextVal })
			});
		} catch {
			// ignore
		}
	}

	let filteredStudents = $derived(
		students.filter((s) => {
			if (!search) return true;
			return s.displayName.toLowerCase().includes(search.toLowerCase());
		})
	);

	function usageStatus(student: StudentDoc): { label: string; color: string } {
		const lastSeen = student.lastSeenAt;
		if (!lastSeen) return { label: '⚫ Sin uso', color: 'text-gray-500' };
		if (serverNow - lastSeen <= ONLINE_THRESHOLD_MS) {
			return { label: '🟢 Jugando ahora', color: 'text-emerald-400' };
		}
		const seenDate = new Date(lastSeen);
		const nowDate = new Date(serverNow);
		const isToday =
			seenDate.getFullYear() === nowDate.getFullYear() &&
			seenDate.getMonth() === nowDate.getMonth() &&
			seenDate.getDate() === nowDate.getDate();

		if (isToday) return { label: '🟡 Activo hoy', color: 'text-amber-400' };
		return { label: '⚪ Inactivo', color: 'text-gray-400' };
	}

	let onlineCount = $derived(
		students.filter((s) => s.lastSeenAt && serverNow - s.lastSeenAt <= ONLINE_THRESHOLD_MS).length
	);

	function fmtPlayTime(ms: number | undefined): string {
		if (!ms || ms <= 0) return '0 min';
		const min = Math.round(ms / 60000);
		if (min < 60) return `${min} min`;
		const h = Math.floor(min / 60);
		const m = min % 60;
		return `${h}h ${m}m`;
	}

	function fmtDate(ts: number | null): string {
		if (!ts) return 'Nunca';
		return new Date(ts).toLocaleDateString('es', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function fmtTimeOnly(ts: number): string {
		return new Date(ts).toLocaleTimeString('es', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{cls?.name ?? 'Clase'} — Star Fox 3</title>
</svelte:head>

<div class="min-h-dvh bg-[#0f0f2a]">
	<!-- Header -->
	<header class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 bg-[#1a1a30] px-6 py-4">
		<div class="flex items-center gap-4">
			<button
				class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-3 py-2 text-sm text-gray-400 transition-all hover:border-amber-400/50 hover:text-white"
				onclick={() => goto('/teacher')}
			>
				← Clases
			</button>
			<div>
				<h1 class="text-lg font-bold text-white">{cls?.grade || cls?.name || '...'}</h1>
				<p class="text-sm text-gray-400">
					Matemáticas
					<span class="ml-2 text-xs text-emerald-400">· 🟢 {onlineCount} jugando ahora</span>
					<span class="ml-2 text-xs text-gray-500">· Actualizado {fmtTimeOnly(serverNow)}</span>
				</p>
			</div>
		</div>
		<div class="flex flex-wrap items-center gap-3">
			{#if cls}
				<button
					class="cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-all
						{cls.pinEnabled
						? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-300'
						: 'border-gray-600 bg-transparent text-gray-400 hover:text-white'}"
					onclick={togglePinRequirement}
					title="Activar o desactivar que cada alumno cree su propio PIN al entrar"
				>
					{cls.pinEnabled ? '🔒 PIN por alumno: SÍ' : '🔓 PIN por alumno: NO'}
				</button>
			{/if}
			<button
				class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-4 py-2 text-sm text-gray-300 transition-all hover:border-amber-400/50 hover:text-white disabled:opacity-50"
				disabled={refreshing || loading}
				onclick={() => loadClass(true)}
			>
				{refreshing ? '⏳ Actualizando...' : '🔄 Actualizar'}
			</button>
			<button
				class="cursor-pointer rounded-xl border border-amber-400/50 bg-transparent px-4 py-2 text-sm text-amber-400 transition-all hover:bg-amber-400/10"
				onclick={() => goto(`/teacher/classes/${classId}/import`)}
			>
				📋 Importar Excel
			</button>
			<button
				class="cursor-pointer rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-[#1E1E2F] transition-all hover:scale-105"
				onclick={() => (showInvite = true)}
			>
				🔗 Invitar alumnos
			</button>
			<button
				class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-4 py-2 text-sm text-gray-400 transition-all hover:border-amber-400/50 hover:text-white disabled:opacity-50"
				disabled={exporting}
				onclick={downloadCsv}
			>
				{exporting ? '⏳...' : '⬇ CSV'}
			</button>
			<button
				class="cursor-pointer rounded-xl border border-red-500/30 bg-transparent px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-500/10"
				onclick={() => (showDelete = true)}
			>
				Eliminar
			</button>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 py-6">
		{#if loading}
			<div class="flex justify-center py-20">
				<div class="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
			</div>
		{:else}
			<!-- Search -->
			<div class="mb-6">
				<input
					type="text"
					bind:value={search}
					class="w-full max-w-md rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-2 text-white outline-none focus:border-amber-400"
					placeholder="🔍 Buscar alumno..."
				/>
			</div>

			{#if students.length === 0}
				<div class="py-20 text-center">
					<div class="mb-4 text-5xl">📭</div>
					<h2 class="mb-2 text-lg font-bold text-white">Sin alumnos</h2>
					<p class="mb-6 text-gray-400">Importa la lista de alumnos desde un Excel para empezar.</p>
					<button
						class="cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
						onclick={() => goto(`/teacher/classes/${classId}/import`)}
					>
						Importar Excel
					</button>
				</div>
			{:else}
				<!-- Table -->
				<div class="overflow-x-auto rounded-2xl border border-gray-700 bg-[#252540]">
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="border-b border-gray-700 text-xs text-gray-400">
								<th class="px-4 py-3">Alumno</th>
								{#if cls?.pinEnabled}
									<th class="px-4 py-3">PIN</th>
								{/if}
								<th class="px-4 py-3">Estado</th>
								<th class="px-4 py-3">Niveles</th>
								<th class="px-4 py-3">Estrellas</th>
								<th class="px-4 py-3">Precisión</th>
								<th class="px-4 py-3">Tiempo jugado</th>
								<th class="px-4 py-3">Último acceso</th>
								<th class="px-4 py-3"></th>
							</tr>
						</thead>
						<tbody>
							{#each filteredStudents as student (student.id)}
								{@const summary = student.summary}
								{@const status = usageStatus(student)}
								<tr class="border-b border-gray-800/50 transition-colors hover:bg-[#1a1a30]">
									<td class="px-4 py-3 font-medium text-white">{student.displayName}</td>
									{#if cls?.pinEnabled}
										<td class="px-4 py-3 font-mono text-xs text-cyan-300">
											{student.pin ? student.pin : '—'}
										</td>
									{/if}
									<td class="px-4 py-3">
										<span class="text-xs font-bold {status.color}">{status.label}</span>
									</td>
									<td class="px-4 py-3 text-gray-300">
										{summary ? `${summary.levelsCompleted?.length ?? 0}/25` : '0/25'}
									</td>
									<td class="px-4 py-3 text-amber-400">
										⭐ {summary?.totalStars ?? 0}
									</td>
									<td class="px-4 py-3">
										{#if summary && summary.totalAttempts > 0}
											{@const acc = Math.round((summary.totalCorrect / summary.totalAttempts) * 100)}
											<span
												class="{acc >= 80
													? 'text-emerald-400'
													: acc >= 50
														? 'text-amber-400'
														: 'text-red-400'}"
											>
												{acc}%
											</span>
										{:else}
											<span class="text-gray-500">—</span>
										{/if}
									</td>
									<td class="px-4 py-3 text-cyan-400">
										⏱ {fmtPlayTime(summary?.totalPlayTimeMs)}
									</td>
									<td class="px-4 py-3 text-xs text-gray-400">{fmtDate(student.lastSeenAt)}</td>
									<td class="px-4 py-3">
										<button
											class="cursor-pointer text-xs text-amber-400 hover:underline"
											onclick={() => goto(`/teacher/students/${student.id}`)}
										>
											Ver →
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/if}
	</main>
</div>

<!-- Invite modal -->
{#if showInvite && cls}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
		<div class="w-full max-w-md rounded-3xl border border-amber-400/30 bg-[#252540] p-8 text-center">
			<h2 class="mb-4 text-xl font-bold text-white">Invitar alumnos</h2>
			<p class="mb-4 text-sm text-gray-400">Comparte este enlace y PIN con tus alumnos:</p>

			<div class="mb-4 rounded-xl bg-[#1E1E2F] p-4">
				<p class="mb-2 text-xs text-gray-500">Enlace de ingreso:</p>
				<p class="break-all font-mono text-sm text-amber-400">
					{window?.location?.origin ?? ''}/join/{cls.joinCode}
				</p>
				<p class="mt-3 text-xs text-gray-400">
					{cls.pinEnabled
						? '🔒 PIN personal activo: Cada estudiante creará su propio PIN en su primera entrada.'
						: '🔓 Sin PIN: Los estudiantes entran directamente seleccionando su nombre.'}
				</p>
			</div>

			<button
				class="mb-3 w-full cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
				onclick={copyInvite}
			>
				Copiar enlace
			</button>
			<button
				class="w-full cursor-pointer rounded-xl border border-gray-600 bg-transparent px-6 py-3 text-sm text-gray-400 transition-all hover:text-white"
				onclick={() => (showInvite = false)}
			>
				Cerrar
			</button>
		</div>
	</div>
{/if}

<!-- Delete modal -->
{#if showDelete}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
		<div class="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#252540] p-8 text-center">
			<div class="mb-4 text-5xl">⚠️</div>
			<h2 class="mb-2 text-xl font-bold text-white">¿Eliminar clase?</h2>
			<p class="mb-6 text-sm text-gray-400">
				Se eliminarán todos los alumnos, progreso y datos de esta acción. No se puede deshacer.
			</p>
			<div class="flex gap-3">
				<button
					class="flex-1 cursor-pointer rounded-xl border border-gray-600 bg-transparent px-4 py-3 text-sm text-gray-400 transition-all hover:text-white"
					onclick={() => (showDelete = false)}
				>
					Cancelar
				</button>
				<button
					class="flex-1 cursor-pointer rounded-xl bg-red-500 px-4 py-3 font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
					disabled={deleting}
					onclick={deleteClass}
				>
					{deleting ? 'Eliminando...' : 'Eliminar'}
				</button>
			</div>
		</div>
	</div>
{/if}
