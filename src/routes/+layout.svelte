<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { resolveActiveWorldTheme } from '$lib/constants/shop';
	import { telemetry } from '$lib/sync/outbox';
	import { AchievementToast } from '$lib/components/medals';

	let { children } = $props();

	let sessionStarted = false;
	let lastTickTs = Date.now();

	afterNavigate(() => {
		if (typeof window !== 'undefined') {
			window.scrollTo(0, 0);
		}
	});

	// Gestión dinámica y coherente del Mundo + Tema UI comprado en la tienda
	$effect(() => {
		if (typeof document !== 'undefined') {
			const world = resolveActiveWorldTheme(
				game.shop.equipped.background,
				game.shop.equipped.theme
			);
			document.documentElement.setAttribute('data-theme', world.uiTheme || 'default');
		}
	});

	// Inicia la sesión de telemetría e hidrata progreso en cuanto el alumno está listo y autenticado
	$effect(() => {
		if (session.ready && session.isStudent && session.authUser && !sessionStarted) {
			sessionStarted = true;
			lastTickTs = Date.now();
			telemetry.sessionStart();
			session
				.authFetch('/api/student/me')
				.then(async (res) => {
					if (res.status === 404) {
						session.studentLeave();
						return;
					}
					if (res.ok) {
						const data = await res.json();
						if (data.progress && !game.isGodMode) {
							game.hydrateFromServer(data.progress);
						}
					}
				})
				.catch(() => {
					// Modo offline: continúa con el estado local
				});
		}
	});

	onMount(() => {
		session.init();

		// Heartbeat cada 60s únicamente mientras la pestaña está visible
		const heartbeatInterval = setInterval(() => {
			if (!session.isStudent) return;
			const now = Date.now();
			if (document.visibilityState === 'visible') {
				const delta = Math.min(now - lastTickTs, 65_000);
				game.addPlayTime(delta);
				telemetry.sessionHeartbeat();
			}
			lastTickTs = now;
		}, 60_000);

		const handleVisibilityChange = () => {
			if (!session.isStudent) return;
			if (document.visibilityState === 'visible') {
				lastTickTs = Date.now();
				telemetry.sessionHeartbeat();
			} else {
				// Al ocultar pestaña o salir en móvil, vaciar la cola pendiente sin destruir la sesión
				telemetry.flush();
			}
		};

		const handleBeforeUnload = () => {
			if (session.isStudent) {
				telemetry.flush();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			clearInterval(heartbeatInterval);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<!-- Banner global de logros desbloqueados -->
<AchievementToast />

{#key page.url.pathname}
	{@render children()}
{/key}
