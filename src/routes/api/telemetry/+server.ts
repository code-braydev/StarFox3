import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireStudent,
	readJson,
	apiError,
	authErrorResponse
} from '$lib/server';
import { mergeSummaries } from '$lib/sync/merge';
import type { StudentDoc, StudentSummary, TelemetryEvent } from '$lib/firebase/types';

/**
 * POST /api/telemetry
 * Recibe un lote de eventos del alumno desde su cola outbox.
 *
 * Optimizado para cuota de Firestore:
 * - Identidad del alumno leída de los custom claims (0 queries por authUid).
 * - Un heartbeat genera 1 sola escritura en `students/{studentId}`.
 * - "La fecha más reciente gana" (`summaryUpdatedAt` y `lastSeenAt` con `Math.max`).
 */
export const POST: RequestHandler = async (event) => {
	try {
		const { studentId, classId, teacherId } = await requireStudent(event);
		const body = await readJson<{ events: TelemetryEvent[] }>(event);
		const events = body.events;

		if (!Array.isArray(events) || events.length === 0) {
			return apiError('No events', 400);
		}

		const db = getAdminDb();
		const serverNow = Date.now();
		const studentRef = db.collection('students').doc(studentId);
		const studentSnap = await studentRef.get();

		if (!studentSnap.exists) {
			return apiError('Alumno no encontrado', 404);
		}

		const studentData = studentSnap.data() as StudentDoc;
		let nextLastSeenAt = Math.max(studentData.lastSeenAt ?? 0, serverNow);
		let nextSummary: StudentSummary | null = studentData.summary ?? null;
		let nextSummaryUpdatedAt = studentData.summaryUpdatedAt ?? 0;
		let summaryChanged = false;

		const batch = db.batch();
		let processed = 0;

		for (const evt of events) {
			if (!evt || typeof evt !== 'object' || !evt.id) continue;

			switch (evt.type) {
				case 'session_start': {
					const sessionId = evt.sessionId || evt.id;
					const ref = db.collection('sessions').doc(sessionId);
					batch.set(
						ref,
						{
							eventId: evt.id,
							sessionId,
							classId,
							teacherId,
							studentId,
							startedAt: evt.clientTs || serverNow,
							lastHeartbeatAt: serverNow,
							userAgent: evt.userAgent ?? ''
						},
						{ merge: true }
					);
					processed++;
					break;
				}

				case 'session_heartbeat': {
					// Presencia se consolida en una única escritura sobre studentRef al final del lote
					nextLastSeenAt = Math.max(nextLastSeenAt, serverNow);
					processed++;
					break;
				}

				case 'level_attempt': {
					const ref = db.collection('attempts').doc(evt.id);
					batch.set(ref, {
						eventId: evt.id,
						classId,
						teacherId,
						studentId,
						level: evt.level,
						mode: evt.mode,
						stars: evt.stars,
						correct: evt.correct,
						total: evt.total,
						durationMs: evt.durationMs,
						completed: evt.completed,
						startedAt: evt.startedAt,
						completedAt: evt.clientTs || serverNow
					});
					nextLastSeenAt = Math.max(nextLastSeenAt, serverNow);
					processed++;
					break;
				}

				case 'progress_snapshot': {
					const incomingTs = evt.clientTs || serverNow;
					// Regla: la fecha más reciente gana + fusión determinista de progreso
					if (incomingTs >= nextSummaryUpdatedAt || !nextSummary) {
						nextSummary = mergeSummaries(nextSummary, evt.progress);
						nextSummaryUpdatedAt = Math.max(nextSummaryUpdatedAt, incomingTs);
						summaryChanged = true;
					} else {
						// Lote offline antiguo: solo conservar si aporta algún nivel o estrella nueva
						nextSummary = mergeSummaries(nextSummary, evt.progress);
						summaryChanged = true;
					}
					nextLastSeenAt = Math.max(nextLastSeenAt, serverNow);
					processed++;
					break;
				}
			}
		}

		const studentUpdate: Record<string, unknown> = {
			lastSeenAt: nextLastSeenAt
		};
		if (summaryChanged && nextSummary) {
			studentUpdate.summary = nextSummary;
			studentUpdate.summaryUpdatedAt = nextSummaryUpdatedAt;
		}

		batch.set(studentRef, studentUpdate, { merge: true });
		await batch.commit();

		return json({ ok: true, processed, lastSeenAt: nextLastSeenAt });
	} catch (err) {
		return authErrorResponse(err);
	}
};
