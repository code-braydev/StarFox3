import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireTeacher,
	generateJoinCode,
	readJson,
	apiError,
	authErrorResponse
} from '$lib/server';

export const POST: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const body = await readJson<{
			name?: string;
			grade: string;
			pinEnabled?: boolean;
		}>(event);

		const grade = body.grade?.trim();
		const name = body.name?.trim() || grade;
		// Por defecto deshabilitado; si se activa, cada estudiante crea su propio PIN en su primera entrada
		const pinEnabled = body.pinEnabled === true;

		if (!grade || grade.length < 1) {
			return apiError('El grado o curso es obligatorio', 400);
		}

		const db = getAdminDb();

		// Garantizar código de invitación único
		let joinCode = generateJoinCode();
		for (let i = 0; i < 5; i++) {
			const existing = await db
				.collection('classes')
				.where('joinCode', '==', joinCode)
				.limit(1)
				.get();
			if (existing.empty) break;
			joinCode = generateJoinCode();
		}

		const classRef = db.collection('classes').doc();
		const classData = {
			id: classRef.id,
			name: name ?? grade,
			grade,
			teacherId: teacher.uid,
			joinCode,
			pinEnabled,
			pin: '',
			createdAt: Date.now(),
			archived: false
		};

		await classRef.set(classData);

		return json({
			id: classRef.id,
			joinCode,
			name: classData.name,
			grade,
			class: {
				...classData,
				kpis: {
					totalStudents: 0,
					onlineNow: 0,
					neverPlayed: 0,
					activeLast30d: 0,
					avgLevels: 0,
					avgStars: 0,
					accuracy: 0,
					totalCorrect: 0,
					totalAttempts: 0,
					totalTimeMs: 0
				}
			}
		});
	} catch (err) {
		return authErrorResponse(err);
	}
};
