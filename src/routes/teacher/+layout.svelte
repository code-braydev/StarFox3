<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { session } from '$lib/stores/session.svelte';

	let { children } = $props();

	let checking = $derived(!session.ready);
	let isPublic = $derived(
		page.url.pathname.startsWith('/teacher/login') ||
			page.url.pathname.startsWith('/teacher/register')
	);

	$effect(() => {
		if (session.ready && !session.isTeacher && !isPublic) {
			goto('/teacher/login');
		}
	});
</script>

{#if isPublic}
	{@render children()}
{:else if checking}
	<div class="flex min-h-dvh items-center justify-center bg-[#0f0f2a]">
		<div class="text-center">
			<div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
			<p class="text-sm text-gray-400">Verificando acceso...</p>
		</div>
	</div>
{:else if session.isTeacher}
	{@render children()}
{:else if session.isTeacherPendingVerification}
	<div class="flex min-h-dvh items-center justify-center bg-[#0f0f2a] px-4">
		<div class="w-full max-w-md rounded-3xl border border-amber-400/30 bg-[#252540] p-8 text-center">
			<div class="mb-4 text-5xl">📧</div>
			<h1 class="mb-2 text-xl font-bold text-white">Verifica tu email</h1>
			<p class="mb-6 text-sm text-gray-400">
				Hemos enviado un enlace de verificación a <strong class="text-amber-400">{session.teacherSession?.email}</strong>.
				Haz clic en el enlace y luego recarga esta página.
			</p>
			<button
				class="mb-3 w-full cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
				onclick={() => window.location.reload()}
			>
				Ya verifiqué, recargar
			</button>
			<button
				class="w-full cursor-pointer rounded-xl border border-gray-600 bg-transparent px-6 py-3 text-sm text-gray-400 transition-all hover:border-amber-400/50 hover:text-white"
				onclick={() => session.teacherLogout()}
			>
				Cerrar sesión
			</button>
		</div>
	</div>
{:else}
	<div class="flex min-h-dvh items-center justify-center bg-[#0f0f2a] px-4">
		<div class="text-center">
			<p class="mb-4 text-gray-400">Debes iniciar sesión como profesor.</p>
			<button
				class="cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
				onclick={() => goto('/teacher/login')}
			>
				Iniciar sesión
			</button>
		</div>
	</div>
{/if}
