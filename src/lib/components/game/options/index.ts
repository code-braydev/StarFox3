import type { Component } from 'svelte';
import type { BaseOptionProps } from './types';

export * from './types';
export * from './thematic';
export * from './mechanics';

import {
	LeverOption,
	CrystalOption,
	AsteroidOption,
	NebulaOption,
	ForgeOption,
	PortOption,
	VoidOption,
	EarthOption
} from './thematic';

import {
	TrueFalseOption,
	InverseOption,
	GeometryOption,
	SeriesOption,
	ShoppingOption
} from './mechanics';

/**
 * Registry de opciones temáticas por número de sector/tabla estelar
 */
export const THEMATIC_OPTIONS: Record<number, Component<BaseOptionProps>> = {
	3: CrystalOption as unknown as Component<BaseOptionProps>,
	4: AsteroidOption as unknown as Component<BaseOptionProps>,
	5: NebulaOption as unknown as Component<BaseOptionProps>,
	6: ForgeOption as unknown as Component<BaseOptionProps>,
	7: PortOption as unknown as Component<BaseOptionProps>,
	8: VoidOption as unknown as Component<BaseOptionProps>,
	9: EarthOption as unknown as Component<BaseOptionProps>
};

/**
 * Registry de opciones por tipo de mecánica pedagógica
 */
export const MECHANIC_OPTIONS: Record<string, Component<BaseOptionProps>> = {
	trueFalse: TrueFalseOption as unknown as Component<BaseOptionProps>,
	inverse: InverseOption as unknown as Component<BaseOptionProps>,
	geometry: GeometryOption as unknown as Component<BaseOptionProps>,
	series: SeriesOption as unknown as Component<BaseOptionProps>,
	shopping: ShoppingOption as unknown as Component<BaseOptionProps>
};

/**
 * Resuelve dinámicamente el componente de opción según el tipo de pregunta o número de tabla
 */
export function resolveOptionComponent(
	table: number,
	questionType?: string
): Component<BaseOptionProps> {
	if (questionType && MECHANIC_OPTIONS[questionType]) {
		return MECHANIC_OPTIONS[questionType];
	}
	return THEMATIC_OPTIONS[table] ?? (LeverOption as unknown as Component<BaseOptionProps>);
}
