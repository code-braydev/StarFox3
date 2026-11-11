import type { EnergyData, CharacterData } from '../types/game';

export const RECHARGE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos por punto de recarga

/**
 * Aplica la regeneración pasiva de energía según el tiempo transcurrido
 */
export function rechargeEnergy(energy: EnergyData): boolean {
	const now = Date.now();
	const elapsed = now - energy.lastRecharge;
	const pointsToAdd = Math.floor(elapsed / RECHARGE_INTERVAL_MS);

	if (pointsToAdd > 0 && energy.current < energy.max) {
		energy.current = Math.min(energy.current + pointsToAdd, energy.max);
		energy.lastRecharge = now;
		return true;
	}
	return false;
}

/**
 * Recalcula el tope máximo de energía según los personajes desbloqueados (Astro otorga 300)
 */
export function recalcMaxEnergy(characters: CharacterData, energy: EnergyData): void {
	const hasAstro = characters.unlocked.includes('astro');
	energy.max = hasAstro ? 300 : 250;
	if (energy.current > energy.max) {
		energy.current = energy.max;
	}
}
