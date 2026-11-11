import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireTeacher,
	requireOwnedClass,
	deleteRefsInBatches,
	readJson,
	authErrorResponse
} from '$lib/server';
import type { StudentDoc } from '$lib/firebase/types';

/**
 * GET /api/classes/[id]
 * Devuelve la clase y su lista completa de alumnos (con presencia `lastSeenAt` y `summary` incluidos).
 * Reemplaza la doble llamada anterior a `/api/classes/[id]` + `/api/classes/[id]/detail`.
 */
export const GET: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const classId = event.params.id;
		const db = getAdminDb();

		const classData = await requireOwnedClass(db, classId, teacher.uid);

		const studentsSnap = await db
			.collection('students')
			.where('classId', '==', classId)
			.get();

		const students = studentsSnap.docs
			.map((d) => ({
				...(d.data() as StudentDoc),
				id: d.id
			}))
			.sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? '', 'es'));

		return json({
			class: classData,
			students,
			serverNow: Date.now()
		});
	} catch (err) {
		return authErrorResponse(err);
	}
};

export const PATCH: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const classId = event.params.id;
		const db = getAdminDb();

		await requireOwnedClass(db, classId, teacher.uid);

		const body = await readJson<{
			name?: string;
			grade?: string;
			pinEnabled?: boolean;
			pin?: string;
			archived?: boolean;
		}>(event);

		const updates: Record<string, unknown> = {};

		if (typeof body.name === 'string' && body.name.trim().length >= 2) {
			updates.name = body.name.trim();
		}
		if (typeof body.grade === 'string' && body.grade.trim().length >= 1) {
			updates.grade = body.grade.trim();
		}
		if (typeof body.pinEnabled === 'boolean') {
			updates.pinEnabled = body.pinEnabled;
		}
		if (typeof body.pin === 'string') {
			const pin = body.pin.trim();
			if (pin === '' || /^\d{4,8}$/.test(pin)) {
				updates.pin = pin;
			}
		}
		if (typeof body.archived === 'boolean') {
			updates.archived = body.archived;
		}

		if (Object.keys(updates).length > 0) {
			await db.collection('classes').doc(classId).update(updates);
		}
		return json({ ok: true });
	} catch (err) {
		return authErrorResponse(err);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const classId = event.params.id;
		const db = getAdminDb();

		await requireOwnedClass(db, classId, teacher.uid);

		const [studentsSnap, attemptsSnap, sessionsSnap] = await Promise.all([
			db.collection('students').where('classId', '==', classId).get(),
			db.collection('attempts').where('classId', '==', classId).get(),
			db.collection('sessions').where('classId', '==', classId).get()
		]);

		const refs = [
			...studentsSnap.docs.map((d) => d.ref),
			...attemptsSnap.docs.map((d) => d.ref),
			...sessionsSnap.docs.map((d) => d.ref),
			db.collection('classes').doc(classId)
		];

		await deleteRefsInBatches(db, refs);
		return json({ ok: true });
	} catch (err) {
		return authErrorResponse(err);
	}
};
