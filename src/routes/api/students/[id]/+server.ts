import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireTeacher,
	requireOwnedStudent,
	deleteRefsInBatches,
	readJson,
	authErrorResponse
} from '$lib/server';

/**
 * GET /api/students/[id]
 * Devuelve el perfil completo del alumno (con su summary embebido), historial de intentos y sesiones.
 */
export const GET: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const studentId = event.params.id;
		const db = getAdminDb();

		const student = await requireOwnedStudent(db, studentId, teacher.uid);

		const [attemptsSnap, sessionsSnap] = await Promise.all([
			db.collection('attempts').where('studentId', '==', studentId).get(),
			db.collection('sessions').where('studentId', '==', studentId).get()
		]);

		const attempts = attemptsSnap.docs
			.map((d) => d.data())
			.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
			.slice(0, 50);
		const sessions = sessionsSnap.docs
			.map((d) => d.data())
			.sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))
			.slice(0, 20);

		return json({
			student,
			progress: student.summary,
			attempts,
			sessions,
			serverNow: Date.now()
		});
	} catch (err) {
		return authErrorResponse(err);
	}
};

export const PATCH: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const studentId = event.params.id;
		const db = getAdminDb();

		await requireOwnedStudent(db, studentId, teacher.uid);
		const body = await readJson<{ resetPin?: boolean; displayName?: string }>(event);

		const updates: Record<string, unknown> = {};
		if (body.resetPin) {
			updates.pin = '';
		}
		if (typeof body.displayName === 'string' && body.displayName.trim().length >= 2) {
			updates.displayName = body.displayName.trim();
		}

		if (Object.keys(updates).length > 0) {
			await db.collection('students').doc(studentId).update(updates);
		}
		return json({ ok: true });
	} catch (err) {
		return authErrorResponse(err);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const studentId = event.params.id;
		const db = getAdminDb();

		await requireOwnedStudent(db, studentId, teacher.uid);

		const [attemptsSnap, sessionsSnap] = await Promise.all([
			db.collection('attempts').where('studentId', '==', studentId).get(),
			db.collection('sessions').where('studentId', '==', studentId).get()
		]);

		const refs = [
			...attemptsSnap.docs.map((d) => d.ref),
			...sessionsSnap.docs.map((d) => d.ref),
			db.collection('students').doc(studentId)
		];

		await deleteRefsInBatches(db, refs);
		return json({ ok: true });
	} catch (err) {
		return authErrorResponse(err);
	}
};
