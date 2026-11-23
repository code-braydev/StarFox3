import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireTeacher,
	requireOwnedClass,
	deleteRefsInBatches,
	extractNames,
	apiError,
	authErrorResponse
} from '$lib/server';
import { randomUUID } from 'crypto';

export const POST: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const classId = event.params.id;
		const db = getAdminDb();

		await requireOwnedClass(db, classId, teacher.uid);

		const contentType = event.request.headers.get('content-type') ?? '';
		let rawNames: string[] = [];
		let replace = false;

		if (contentType.includes('application/json')) {
			const body = await event.request.json().catch(() => ({}));
			replace = Boolean(body.replace);
			if (Array.isArray(body.names)) {
				rawNames = body.names
					.map((n: unknown) => (typeof n === 'string' ? n.replace(/\s+/g, ' ').trim() : ''))
					.filter(Boolean);
			}
		} else {
			const formData = await event.request.formData();
			const file = formData.get('file') as File | null;
			const sheetName = formData.get('sheetName') as string | null;
			const columnRaw = formData.get('column') as string | null;
			const lastNameColumnRaw = formData.get('lastNameColumn') as string | null;
			replace = formData.get('replace') === 'true';

			if (!file || typeof file === 'string' || !sheetName || !columnRaw) {
				return apiError('Faltan datos: archivo, hoja y columna', 400);
			}

			const columnIndex = parseInt(columnRaw, 10);
			const lastNameColumnIndex = lastNameColumnRaw ? parseInt(lastNameColumnRaw, 10) : 0;
			if (isNaN(columnIndex) || columnIndex < 1) {
				return apiError('Columna inválida', 400);
			}

			const buffer = Buffer.from(await file.arrayBuffer());
			const extracted = await extractNames(
				buffer,
				sheetName,
				columnIndex,
				isNaN(lastNameColumnIndex) ? 0 : lastNameColumnIndex
			);
			rawNames = extracted.names;
		}

		if (rawNames.length === 0) {
			return apiError('No se encontraron nombres en la selección indicada', 400);
		}

		// Si hay dos alumnos con exactamente el mismo nombre, los diferenciamos (ej. "Lina Gómez (2)")
		// para no borrar silenciosamente a ningún estudiante del salón.
		const counts = new Map<string, number>();
		const finalNames: string[] = [];
		for (const n of rawNames) {
			const key = n.toLowerCase();
			const count = (counts.get(key) ?? 0) + 1;
			counts.set(key, count);
			finalNames.push(count > 1 ? `${n} (${count})` : n);
		}

		if (replace) {
			const existingSnap = await db
				.collection('students')
				.where('classId', '==', classId)
				.get();
			await deleteRefsInBatches(
				db,
				existingSnap.docs.map((d) => d.ref)
			);
		}

		const now = Date.now();
		const created: Array<{ id: string; displayName: string }> = [];
		const CHUNK_SIZE = 450;

		for (let i = 0; i < finalNames.length; i += CHUNK_SIZE) {
			const chunk = finalNames.slice(i, i + CHUNK_SIZE);
			const batch = db.batch();
			for (const name of chunk) {
				const studentId = randomUUID().replace(/-/g, '').slice(0, 16);
				const ref = db.collection('students').doc(studentId);
				batch.set(ref, {
					id: studentId,
					classId,
					teacherId: teacher.uid,
					displayName: name,
					pin: '',
					authUid: null,
					createdAt: now,
					lastSeenAt: null,
					summary: null,
					summaryUpdatedAt: null
				});
				created.push({ id: studentId, displayName: name });
			}
			await batch.commit();
		}

		return json({ count: created.length, students: created });
	} catch (err) {
		return authErrorResponse(err);
	}
};
