import { json, type RequestEvent } from '@sveltejs/kit';

export class AuthError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.status = status;
		this.name = 'AuthError';
	}
}

/** Parsea de forma segura el body JSON de una petición sin lanzar excepción si está vacío. */
export async function readJson<T = Record<string, unknown>>(
	event: RequestEvent
): Promise<Partial<T>> {
	try {
		const data = await event.request.json();
		return (data && typeof data === 'object' ? data : {}) as Partial<T>;
	} catch {
		return {};
	}
}

/** Devuelve una respuesta de error JSON tipada usando json() de SvelteKit. */
export function apiError(message: string, status = 400): Response {
	return json({ error: message }, { status });
}

/** Convierte errores lanzados en los endpoints en respuestas JSON consistentes. */
export function authErrorResponse(err: unknown): Response {
	if (err instanceof AuthError) {
		return json({ error: err.message }, { status: err.status });
	}

	const message = err instanceof Error ? err.message : 'Error interno del servidor';
	console.error('[API Server Error]:', err);
	return json({ error: message }, { status: 500 });
}
