import { randomBytes } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1

/** Generate a short, human-friendly class join code (8 chars). */
export function generateJoinCode(): string {
	const bytes = randomBytes(8);
	let code = '';
	for (let i = 0; i < 8; i++) {
		code += ALPHABET[bytes[i] % ALPHABET.length];
	}
	return code;
}

/** Normalise a user-typed code: strip spaces, uppercase. */
export function normaliseJoinCode(input: string): string {
	return input.trim().toUpperCase().replace(/\s+/g, '');
}
