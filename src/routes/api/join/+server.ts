import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminAuth,
	getAdminDb,
	requireUser,
	findActiveClassByCode,
	readJson,
	apiError,
	authErrorResponse
} from '$lib/server';
import type { StudentDoc } from '$lib/firebase/types';

/**
 * POST /api/join
 *
 * action 'roster' → devuelve la lista de nombres de la clase e indica si cada alumno ya creó su PIN
 * action 'bind'   → si la clase tiene pinEnabled:
 *                   - primera entrada del alumno (sin PIN previo): guarda el PIN creado por el alumno
 *                   - entradas siguientes: verifica que el PIN coincida con el del alumno
 *                   y vincula el UID anónimo al alumno elegido con sus custom claims.
 */
export const POST: RequestHandler = async (event) => {
	try {
		const decoded = await requireUser(event);
		const body = await readJson<{
			action: string;
			code: string;
			pin?: string;
			studentId?: string;
		}>(event);

		const action = body.action ?? '';
		const pin = (body.pin ?? '').trim();

		const db = getAdminDb();
		const cls = await findActiveClassByCode(db, body.code ?? '');

		if (action === 'roster') {
			const studentsSnap = await db
				.collection('students')
				.where('classId', '==', cls.id)
				.get();

			const roster = studentsSnap.docs
				.map((d) => {
					const data = d.data() as StudentDoc;
					return {
						studentId: d.id,
						displayName: data.displayName,
						hasPin: Boolean(data.pin && data.pin.length > 0)
					};
				})
				.sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? '', 'es'));

			return json({
				roster,
				className: cls.grade || cls.name,
				pinRequired: cls.pinEnabled === true
			});
		}

		if (action === 'bind') {
			const studentId = (body.studentId ?? '').trim();
			if (!studentId) {
				return apiError('Falta seleccionar el alumno', 400);
			}

			const studentRef = db.collection('students').doc(studentId);
			const studentSnap = await studentRef.get();
			if (!studentSnap.exists) {
				return apiError('Alumno no encontrado', 404);
			}
			const studentData = studentSnap.data() as StudentDoc;
			if (studentData.classId !== cls.id) {
				return apiError('Alumno no pertenece a esta clase', 403);
			}

			const existingPin = (studentData.pin ?? '').trim();

			if (cls.pinEnabled) {
				if (!pin || pin.length < 4 || pin.length > 8 || !/^\d+$/.test(pin)) {
					return apiError('El PIN debe tener entre 4 y 8 dígitos numéricos', 400);
				}
				if (existingPin && existingPin !== pin) {
					return apiError('PIN incorrecto para este estudiante', 403);
				}
			}

			// Guardar claims completos para evitar lecturas en cada heartbeat de telemetría
			await getAdminAuth().setCustomUserClaims(decoded.uid, {
				role: 'student',
				studentId,
				classId: cls.id,
				teacherId: cls.teacherId
			});

			const now = Date.now();
			const updates: Record<string, unknown> = {
				authUid: decoded.uid,
				lastSeenAt: Math.max(studentData.lastSeenAt ?? 0, now)
			};

			// Si la sala usa PIN y es la primera entrada del alumno, registrar su nuevo PIN
			if (cls.pinEnabled && !existingPin) {
				updates.pin = pin;
			}

			await studentRef.update(updates);

			return json({
				classId: cls.id,
				studentId,
				className: cls.grade || cls.name,
				displayName: studentData.displayName,
				summary: studentData.summary
					? { ...studentData.summary, updatedAt: studentData.summaryUpdatedAt ?? 0 }
					: null
			});
		}

		return apiError('Acción no válida', 400);
	} catch (err) {
		return authErrorResponse(err);
	}
};
