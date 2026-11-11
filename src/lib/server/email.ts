import { env } from '$env/dynamic/private';
import { getAdminAuth } from './firebase-admin';

const DEFAULT_FROM = 'StarFox Corp <noreply@startfoxy.braydev.xyz>';

export function buildStarFoxVerificationHtml(teacherName: string, verifyUrl: string): string {
	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>StarFox Corp — Verificación de Credencial</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f2a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f2a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background-color:#252540;border:2px solid #fbbf24;border-radius:20px;padding:32px;text-align:center;">
          <tr>
            <td>
              <div style="font-size:12px;letter-spacing:2px;color:#38bdf8;font-weight:bold;text-transform:uppercase;margin-bottom:6px;">
                TRANSMISIÓN OFICIAL · COMANDO ESTELAR
              </div>
              <h1 style="margin:0 0 16px 0;font-size:24px;color:#fbbf24;letter-spacing:1px;">
                STARFOX CORP
              </h1>
              <p style="font-size:16px;color:#f1f5f9;margin:0 0 12px 0;">
                ¡Saludos, Comandante <strong>${teacherName}</strong>!
              </p>
              <p style="font-size:14px;line-height:1.6;color:#cbd5e1;margin:0 0 24px 0;">
                Hemos recibido tu solicitud de acceso al <strong>Panel de Control Docente de StarFox Corp</strong>.
                Para activar tu cuenta y comenzar a dirigir las misiones matemáticas de tu escuadrón de cadetes, confirma tu correo electrónico haciendo clic en el siguiente botón:
              </p>
              <div style="margin:28px 0;">
                <a href="${verifyUrl}"
                   style="display:inline-block;background-color:#fbbf24;color:#1e1e2f;font-weight:bold;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px;">
                  🚀 VERIFICAR CREDENCIAL DOCENTE
                </a>
              </div>
              <p style="font-size:12px;line-height:1.5;color:#94a3b8;margin:20px 0 0 0;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                <a href="${verifyUrl}" style="color:#38bdf8;word-break:break-all;">${verifyUrl}</a>
              </p>
              <hr style="border:none;border-top:1px solid #334155;margin:24px 0;" />
              <p style="font-size:11px;color:#64748b;margin:0;">
                StarFox Corp · Academia Espacial de Entrenamiento Matemático<br />
                Enviado desde noreply@startfoxy.braydev.xyz · Si no solicitaste esta cuenta, puedes ignorar este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTeacherVerificationEmail(params: {
	email: string;
	name: string;
	origin: string;
}): Promise<{ sentByServer: boolean; verificationLink?: string }> {
	const { email, name, origin } = params;

	const verificationLink = await getAdminAuth().generateEmailVerificationLink(email, {
		url: `${origin}/teacher/login`
	});

	const resendApiKey = (env.RESEND_API_KEY ?? '').trim();
	const fromAddress = (env.EMAIL_FROM ?? DEFAULT_FROM).trim() || DEFAULT_FROM;

	if (resendApiKey) {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${resendApiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: fromAddress,
				to: [email],
				subject: '🚀 [StarFox Corp] Verifica tu credencial de Comandante Docente',
				html: buildStarFoxVerificationHtml(name || 'Comandante', verificationLink)
			})
		});

		if (res.ok) {
			return { sentByServer: true, verificationLink };
		}
		console.warn('[StarFox Corp Email] Error enviando con Resend, usando fallback:', await res.text());
	} else {
		console.info(
			`[StarFox Corp] Enlace de verificación generado para ${email} (${name}):\n👉 ${verificationLink}`
		);
	}

	return { sentByServer: false, verificationLink };
}
