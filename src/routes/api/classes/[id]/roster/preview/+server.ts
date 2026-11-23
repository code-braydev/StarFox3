import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireTeacher,
	requireOwnedClass,
	previewWorkbook,
	apiError,
	authErrorResponse
} from '$lib/server';

/**
 * POST /api/classes/[id]/roster/preview
 * Recibe un archivo Excel y devuelve los nombres de las hojas y sus cabeceras.
 */
export const POST: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const classId = event.params.id;
		const db = getAdminDb();

		await requireOwnedClass(db, classId, teacher.uid);

		const formData = await event.request.formData();
		const file = formData.get('file') as File | null;
		if (!file) {
			return apiError('Falta el archivo', 400);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const sheets = await previewWorkbook(buffer);

		return json({ sheets });
	} catch (err) {
		return authErrorResponse(err);
	}
};
