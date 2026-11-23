/**
 * Centralización de rutas a recursos estáticos (/static)
 * Permite cambiar extensiones (p.ej. de .png a .webp) en un solo lugar.
 */

export type ImageExtension = 'webp' | 'png';

/** Extensión actual de los sprites de personajes (cabeza y cuerpo) */
export const CHARACTER_IMAGE_EXT: ImageExtension = 'png';

export const ASSET_PATHS = {
	avatarFallback: '/img/avatar-foxy.webp',
	mapBackground: '/img/background/bg-map.webp',
	characters: {
		head: (id: string, ext: ImageExtension = CHARACTER_IMAGE_EXT) =>
			`/img/characters/heads/${id || 'foxy'}.${ext}`,
		body: (id: string, ext: ImageExtension = CHARACTER_IMAGE_EXT) =>
			`/img/characters/bodies/${id || 'foxy'}.${ext}`
	},
	background: (name: string) => `/img/background/${name}.webp`,
	frames: (id: string) => `/img/frames/${id}.png`,
	accessories: (id: string) => `/img/accessories/${id}.png`,
	icons: {
		spaceship: '/img/rocket.webp'
	}
} as const;

import { resolveActiveWorldTheme } from './shop';

/**
 * Resuelve la URL del fondo equipado en la tienda o el fondo del mapa por defecto.
 */
export function getEquippedBackground(
	equippedBg: string | null | undefined,
	equippedTheme?: string | null | undefined
): string {
	const world = resolveActiveWorldTheme(equippedBg, equippedTheme);
	return world.backgroundId ? ASSET_PATHS.background(world.backgroundId) : ASSET_PATHS.mapBackground;
}

/**
 * Manejador estándar de error para eventos `onerror` en elementos <img>
 */
export function handleAvatarError(
	event: Event,
	fallback: string = ASSET_PATHS.avatarFallback
): void {
	const img = event.currentTarget as HTMLImageElement | null;
	if (img && !img.src.endsWith(fallback)) {
		img.src = fallback;
	}
}
