import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminAuth,
	getAdminDb,
	requireUser,
	readJson,
	apiError,
	authErrorResponse,
	sendTeacherVerificationEmail
} from '$lib/server';

export const POST: RequestHandler = async (event) => {
	try {
		const decoded = await requireUser(event);
		const body = await readJson<{ action: string; name?: string }>(event);
		const action = body.action ?? '';
		const name = body.name?.trim();

		if (action === 'register') {
			if (!name || name.length < 3) {
				return apiError('El nombre debe tener al menos 3 caracteres', 400);
			}

			await getAdminAuth().setCustomUserClaims(decoded.uid, { role: 'teacher', name });

			const db = getAdminDb();
			const now = Date.now();
			const email = decoded.email ?? '';
			await db
				.collection('teachers')
				.doc(decoded.uid)
				.set(
					{
						uid: decoded.uid,
						email,
						name,
						createdAt: now,
						lastLoginAt: now
					},
					{ merge: true }
				);

			let emailSentByServer = false;
			if (email) {
				try {
					const emailRes = await sendTeacherVerificationEmail({
						email,
						name,
						origin: event.url.origin
					});
					emailSentByServer = emailRes.sentByServer;
				} catch (err) {
					console.warn('[Teacher Register] No se pudo generar email custom:', err);
				}
			}

			return json({ ok: true, name, emailSentByServer });
		}

		if (action === 'resend_verification') {
			const user = await getAdminAuth().getUser(decoded.uid);
			const email = user.email ?? decoded.email ?? '';
			const teacherName =
				(user.customClaims?.name as string) ?? name ?? email.split('@')[0] ?? 'Comandante';

			let emailSentByServer = false;
			if (email) {
				try {
					const emailRes = await sendTeacherVerificationEmail({
						email,
						name: teacherName,
						origin: event.url.origin
					});
					emailSentByServer = emailRes.sentByServer;
				} catch (err) {
					console.warn('[Teacher Resend] No se pudo generar email custom:', err);
				}
			}
			return json({ ok: true, emailSentByServer });
		}

		if (action === 'login') {
			const user = await getAdminAuth().getUser(decoded.uid);
			const currentClaims = user.customClaims ?? {};
			const resolvedName =
				(currentClaims.name as string) ||
				decoded.name ||
				user.displayName ||
				user.email?.split('@')[0] ||
				'Comandante';

			if (currentClaims.role !== 'teacher' || !currentClaims.name) {
				await getAdminAuth().setCustomUserClaims(decoded.uid, {
					role: 'teacher',
					name: resolvedName
				});
			}

			const db = getAdminDb();
			const ref = db.collection('teachers').doc(decoded.uid);
			const snap = await ref.get();
			const now = Date.now();
			let finalName = resolvedName;

			if (!snap.exists) {
				await ref.set({
					uid: decoded.uid,
					email: decoded.email ?? user.email ?? '',
					name: resolvedName,
					createdAt: now,
					lastLoginAt: now
				});
			} else {
				const docData = snap.data();
				if (docData?.name) finalName = docData.name as string;
				await ref.update({ lastLoginAt: now });
			}

			return json({
				ok: true,
				name: finalName,
				email: decoded.email ?? user.email ?? ''
			});
		}

		return apiError('Acción no válida', 400);
	} catch (err) {
		return authErrorResponse(err);
	}
};
