<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import { game } from '$lib/stores/game.svelte';
	import { telemetry } from '$lib/sync/outbox';
	import { getFirebaseAuth } from '$lib/firebase/client';
	import { signInAnonymously } from 'firebase/auth';

	let code = $derived(page.params.code?.toUpperCase() ?? '');

	let step = $state<'loading' | 'roster' | 'joining' | 'joined' | 'error'>('loading');
	let className = $state('');
	let grade = $state('');
	let pinRequired = $state(false);
	let pin = $state('');
	let roster = $state<Array<{ studentId: string; displayName: string; hasPin?: boolean }>>([]);
	let selectedStudent = $state<string | null>(null);
	let search = $state('');
	let error = $state('');
	let loading = $state(false);

	let selectedStudentEntry = $derived(
		roster.find((r) => r.studentId === selectedStudent) ?? null
	);

	onMount(async () => {
		session.init();
		await fetchClassAndRoster();
	});

	async function fetchClassAndRoster() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/join/${code}`);
			const data = await res.json();
			if (!res.ok) {
				error = data.error ?? 'Clase no encontrada';
				step = 'error';
				return;
			}
			className = data.className;
			grade = data.grade;
			pinRequired = data.pinRequired === true;

			const auth = getFirebaseAuth();
			if (!auth.currentUser) {
				await signInAnonymously(auth);
			}
			const idToken = await auth.currentUser!.getIdToken();
			const rosterRes = await fetch('/api/join', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${idToken}`
				},
				body: JSON.stringify({ action: 'roster', code })
			});
			const rosterData = await rosterRes.json();
			if (!rosterRes.ok) {
				error = rosterData.error ?? 'Error al cargar la lista del curso';
				step = 'error';
				return;
			}
			roster = rosterData.roster ?? [];
			step = 'roster';
		} catch {
			error = 'Error de conexión';
			step = 'error';
		} finally {
			loading = false;
		}
	}

	async function joinClass() {
		if (!selectedStudent) return;
		if (pinRequired && (pin.trim().length < 4 || !/^\d+$/.test(pin.trim()))) {
			error = 'El PIN debe tener entre 4 y 8 números';
			return;
		}
		loading = true;
		error = '';
		try {
			const result = await session.studentJoin(code, pin.trim(), selectedStudent);
			if (!result.ok) {
				error = result.error ?? 'Error al unirse';
				return;
			}
			if (result.summary) {
				game.hydrateFromServer(result.summary);
			}
			game.setPlayer(result.displayName ?? '', game.player.avatar || 'foxy');
			telemetry.sessionStart();
			game.syncProgressSnapshot();
			step = 'joined';
			setTimeout(() => goto('/map'), 1200);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error';
		} finally {
			loading = false;
		}
	}

	let filteredRoster = $derived(
		roster.filter((s) => {
			if (!search) return true;
			return s.displayName.toLowerCase().includes(search.toLowerCase());
		})
	);
</script>

<svelte:head>
	<title>Unirse al curso — Star Fox 3</title>
</svelte:head>

<div class="flex min-h-dvh flex-col items-center justify-center bg-[#0f0f2a] px-4 py-6">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="mb-6 text-center">
			<h1 class="font-arcade text-lg tracking-wider text-[#FBBF24]">STAR FOX 3</h1>
			<p class="mt-2 text-sm text-gray-400">Únete a tu curso</p>
		</div>

		{#if step === 'loading'}
			<div class="flex justify-center py-12">
				<div
					class="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"
				></div>
			</div>
		{:else if step === 'error'}
			<div class="rounded-3xl border border-red-500/30 bg-[#252540] p-8 text-center">
				<div class="mb-4 text-5xl">😕</div>
				<h2 class="mb-2 text-xl font-bold text-white">Error</h2>
				<p class="mb-6 text-sm text-gray-400">{error}</p>
				<button
					class="cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
					onclick={() => goto('/')}
				>
					Volver al inicio
				</button>
			</div>
		{:else if step === 'roster'}
			<div class="rounded-3xl border border-amber-400/30 bg-[#252540] p-6">
				<div class="mb-4 text-center">
					<h2 class="text-lg font-bold text-white">{grade || className}</h2>
					<p class="text-xs text-gray-400">Matemáticas · Código {code}</p>
				</div>

				<p class="mb-3 text-center text-sm text-gray-300">¿Cómo te llamas? Elige tu nombre:</p>

				<input
					type="text"
					bind:value={search}
					class="mb-4 w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-2 text-white outline-none focus:border-amber-400"
					placeholder="🔍 Buscar mi nombre..."
				/>

				<div class="max-h-64 space-y-1.5 overflow-y-auto pr-1">
					{#each filteredRoster as student (student.studentId)}
						<button
							class="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all
								{selectedStudent === student.studentId
								? 'border-amber-400 bg-amber-400/10'
								: 'border-transparent bg-[#1E1E2F] hover:border-gray-600'}"
							onclick={() => {
								selectedStudent = student.studentId;
								pin = '';
								error = '';
							}}
						>
							<span class="text-sm font-medium text-white">{student.displayName}</span>
							{#if pinRequired}
								<span class="text-[0.65rem] text-gray-400">
									{student.hasPin ? '🔒 Con PIN' : '✨ Nuevo'}
								</span>
							{/if}
						</button>
					{/each}
					{#if filteredRoster.length === 0}
						<p class="py-4 text-center text-sm text-gray-500">No se encontró tu nombre.</p>
					{/if}
				</div>

				<!-- Si el profesor habilitó el uso de PIN en este curso -->
				{#if pinRequired && selectedStudentEntry}
					<div class="mt-4 rounded-2xl border border-amber-400/30 bg-[#1E1E2F] p-4 text-center">
						{#if selectedStudentEntry.hasPin}
							<p class="mb-2 text-xs font-bold text-amber-300">
								🔒 Ingresa tu PIN secreto ({selectedStudentEntry.displayName})
							</p>
							<p class="mb-3 text-[0.7rem] text-gray-400">
								Escribe el PIN que creaste la primera vez que entraste.
							</p>
						{:else}
							<p class="mb-2 text-xs font-bold text-emerald-300">
								✨ ¡Primera entrada! Crea tu propio PIN secreto
							</p>
							<p class="mb-3 text-[0.7rem] text-gray-400">
								Elige un PIN de 4 a 8 números y recuérdalo para tus próximas sesiones.
							</p>
						{/if}

						<input
							type="password"
							inputmode="numeric"
							bind:value={pin}
							maxlength="8"
							class="mx-auto block w-44 rounded-xl border border-gray-600 bg-[#141424] px-4 py-2.5 text-center font-mono text-xl tracking-widest text-amber-400 outline-none focus:border-amber-400"
							placeholder="••••"
							onkeydown={(e) => {
								if (e.key === 'Enter') joinClass();
							}}
						/>
					</div>
				{/if}

				{#if error}
					<p class="mt-3 text-center text-sm text-red-400">{error}</p>
				{/if}

				<button
					class="mt-4 w-full cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105 disabled:opacity-50"
					disabled={!selectedStudent || loading || (pinRequired && pin.trim().length < 4)}
					onclick={joinClass}
				>
					{loading
						? 'Entrando...'
						: pinRequired && selectedStudentEntry && !selectedStudentEntry.hasPin
							? 'Guardar mi PIN y Entrar 🚀'
							: '¡Listo! 🚀'}
				</button>
			</div>
		{:else if step === 'joining'}
			<div class="flex flex-col items-center py-12">
				<div
					class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"
				></div>
				<p class="text-sm text-gray-400">Preparando tu nave...</p>
			</div>
		{:else if step === 'joined'}
			<div class="rounded-3xl border border-emerald-400/30 bg-[#252540] p-8 text-center">
				<div class="mb-4 text-5xl">🚀</div>
				<h2 class="mb-2 text-xl font-bold text-white">
					¡Bienvenido, {session.studentSession?.displayName}!
				</h2>
				<p class="text-sm text-gray-400">Redirigiendo al mapa...</p>
			</div>
		{/if}
	</div>
</div>
