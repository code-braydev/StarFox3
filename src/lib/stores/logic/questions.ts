import type { LevelInfo } from '$lib/constants/levels';

export interface LevelQuestion {
	a: number;
	b: number;
	answer: number;
	options: number[];
	questionType: string;
	displayPrompt: string;
	displayResult: string;
	storyPrompt?: string;
	geometryRows?: number;
	geometryCols?: number;
}

export interface PracticeQuestion {
	a: number;
	b: number;
	answer: number;
	options: number[];
}

export function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function calculateLevelStars(correct: number, total: number): number {
	if (total <= 0) return 0;
	const pct = correct / total;
	return pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
}

export function generateDistractors(correct: number, a?: number, b?: number): number[] {
	const distractors: number[] = [];
	const candidates =
		a !== undefined && b !== undefined
			? [
					a * (b - 1),
					a * (b + 1),
					correct + a,
					correct - a,
					correct + 1,
					correct - 1,
					correct + 2,
					correct - 2
				]
			: [correct + 1, correct - 1, correct + 2, correct - 2, correct + 5, correct - 5];

	for (const c of candidates) {
		if (c > 0 && c !== correct && !distractors.includes(c)) distractors.push(c);
		if (distractors.length >= 2) break;
	}
	while (distractors.length < 2) {
		const fake = correct + Math.floor(Math.random() * 5) - 2;
		if (fake > 0 && fake !== correct && !distractors.includes(fake)) distractors.push(fake);
	}
	return distractors.slice(0, 2);
}

export function generateSmallDistractors(correct: number): number[] {
	const distractors: number[] = [];
	const candidates = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 3, correct - 3];
	for (const c of candidates) {
		if (c > 0 && c !== correct && !distractors.includes(c)) distractors.push(c);
		if (distractors.length >= 2) break;
	}
	while (distractors.length < 2) {
		const fake = correct + Math.floor(Math.random() * 5) - 2;
		if (fake > 0 && fake !== correct && !distractors.includes(fake)) distractors.push(fake);
	}
	return distractors.slice(0, 2);
}

export function generatePracticeQuestions(count: number): PracticeQuestion[] {
	const qs: PracticeQuestion[] = [];
	for (let i = 0; i < count; i++) {
		const a = Math.floor(Math.random() * 10) + 2;
		const b = Math.floor(Math.random() * 10) + 2;
		const answer = a * b;
		const distractors = generateDistractors(answer);
		const options = shuffleArray([answer, ...distractors]);
		qs.push({ a, b, answer, options });
	}
	return qs;
}

const MULTIPLY_STORIES: ((a: number, b: number) => string)[] = [
	(a, b) =>
		`Foxy trajo una caja de frutas del planeta Zenit. Si la caja tiene ${a} paquetes y cada paquete trae ${b} frutas, ¿cuántas frutas tiene la tripulación en total?`,
	(a, b) =>
		`En el hangar del Great Fox aterrizaron ${a} naves de carga. Si cada nave transporta ${b} celdas de hipercombustible, ¿cuántas celdas descargaron en total?`,
	(a, b) =>
		`Luna recolectó ${a} cofres de cristales estelares en la nebulosa. Si dentro de cada cofre brillan ${b} cristales, ¿cuántos cristales reunió para el motor?`,
	(a, b) =>
		`El ingeniero Gizmo instaló ${a} paneles solares en la estación orbital. Si cada panel genera ${b} megavatios de potencia, ¿cuánta energía producen en total?`,
	(a, b) =>
		`Rex organizó ${a} escuadrones de drones exploradores. Si cada escuadrón lleva ${b} sondas de radar, ¿cuántas sondas fueron lanzadas al espacio?`,
	(a, b) =>
		`Para proteger a la Tierra, Astro preparó ${a} contenedores médicos con ${b} cápsulas de cura en cada uno. ¿Cuántas cápsulas de cura hay listas en total?`,
	(a, b) =>
		`Brutus cargó ${a} plataformas pesadas en la bodega. Si en cada plataforma caben ${b} barriles de oxígeno, ¿cuántos barriles lleva la nave?`,
	(a, b) =>
		`Kira detectó ${a} flotas aliadas cruzando el sector. Si cada flota está formada por ${b} cazas estelares, ¿cuántos cazas hay en total?`
];

const SHOPPING_STORIES: ((a: number, b: number) => string)[] = [
	(a, b) =>
		`En el Puerto Sirius, cada batería cuántica cuesta $${b} créditos. Si Foxy compra ${a} baterías para el viaje, ¿cuánto debe pagar en total?`,
	(a, b) =>
		`Un kit de reparación de escudos vale $${b} gemas en la tienda orbital. Si la tripulación encarga ${a} kits, ¿cuál es el costo total del pedido?`,
	(a, b) =>
		`Cada caja de raciones espaciales del planeta Veridia cuesta $${b} monedas. Si Pip adquiere ${a} cajas para la misión, ¿cuánto paga en total?`
];

function buildStoryPrompt(
	table: number,
	qType: string,
	a: number,
	b: number,
	idx: number,
	extra?: { shownProduct?: number; n1?: number; n2?: number; n3?: number }
): string | undefined {
	// Niveles 1 al 6 mantienen formato directo para afianzar las bases; desde el Nivel 7 en adelante usan enunciados coherentes
	if (table < 7) return undefined;

	if (qType === 'trueFalse') {
		return `El sensor de carga indica que ${a} cajas con ${b} suministros cada una suman exactamente ${extra?.shownProduct ?? a * b} unidades en total. ¿Es correcta la lectura del computador?`;
	}
	if (qType === 'inverse') {
		const product = a * b;
		return `Para activar el salto hiperespacial necesitamos ${product} teravatios en total. Si cada reactor aporta ${a} teravatios, ¿cuántos reactores debe encender Foxy?`;
	}
	if (qType === 'geometry') {
		return `El blindaje térmico del ala norte está armado con ${a} filas y en cada fila hay ${b} placas de titanio. ¿Cuántas placas protegen el ala en total?`;
	}
	if (qType === 'series') {
		return `Las balizas del sector emiten pulsos siguiendo el patrón: ${extra?.n1}, ${extra?.n2}, ${extra?.n3}... Si aumentan de ${a} en ${a}, ¿cuál es la siguiente coordenada?`;
	}
	if (qType === 'shopping') {
		const fn = SHOPPING_STORIES[idx % SHOPPING_STORIES.length];
		return fn(a, b);
	}

	const fn = MULTIPLY_STORIES[(table + idx) % MULTIPLY_STORIES.length];
	return fn(a, b);
}

export function generateLevelQuestions(level: LevelInfo | null, table = 1): LevelQuestion[] {
	if (!level) return [];
	const qType = level.questionType;

	return level.questions.map((q, idx) => {
		if (qType === 'trueFalse') {
			const isTrue = Math.random() < 0.5;
			let shownProduct = q.a * q.b;
			if (!isTrue) {
				const delta = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
				shownProduct = q.a * q.b + delta;
				if (shownProduct <= 0 || shownProduct === q.a * q.b) {
					shownProduct = q.a * q.b + 2;
				}
			}
			const answer = isTrue ? 1 : 0;
			return {
				a: q.a,
				b: q.b,
				answer,
				options: [1, 0],
				questionType: 'trueFalse',
				displayPrompt: `${q.a} × ${q.b}`,
				displayResult: `${shownProduct}`,
				storyPrompt: buildStoryPrompt(table, 'trueFalse', q.a, q.b, idx, { shownProduct })
			};
		}

		if (qType === 'inverse') {
			const answer = q.b;
			const product = q.a * q.b;
			const distractors = generateSmallDistractors(answer);
			const options = shuffleArray([answer, ...distractors]);
			return {
				a: q.a,
				b: q.b,
				answer,
				options,
				questionType: 'inverse',
				displayPrompt: `${q.a} × ?`,
				displayResult: `${product}`,
				storyPrompt: buildStoryPrompt(table, 'inverse', q.a, q.b, idx)
			};
		}

		if (qType === 'geometry') {
			const answer = q.a * q.b;
			const distractors = generateDistractors(answer, q.a, q.b);
			const options = shuffleArray([answer, ...distractors]);
			return {
				a: q.a,
				b: q.b,
				answer,
				options,
				questionType: 'geometry',
				displayPrompt: `${q.a} × ${q.b}`,
				displayResult: '?',
				geometryRows: q.a,
				geometryCols: q.b,
				storyPrompt: buildStoryPrompt(table, 'geometry', q.a, q.b, idx)
			};
		}

		if (qType === 'series') {
			const answer = q.a * q.b;
			const distractors = generateDistractors(answer, q.a, q.b);
			const options = shuffleArray([answer, ...distractors]);
			const n1 = q.a * Math.max(1, q.b - 3);
			const n2 = q.a * Math.max(2, q.b - 2);
			const n3 = q.a * Math.max(3, q.b - 1);
			return {
				a: q.a,
				b: q.b,
				answer,
				options,
				questionType: 'series',
				displayPrompt: `${n1}, ${n2}, ${n3}, ?`,
				displayResult: '',
				storyPrompt: buildStoryPrompt(table, 'series', q.a, q.b, idx, { n1, n2, n3 })
			};
		}

		if (qType === 'shopping') {
			const answer = q.a * q.b;
			const distractors = generateDistractors(answer, q.a, q.b);
			const options = shuffleArray([answer, ...distractors]);
			return {
				a: q.a,
				b: q.b,
				answer,
				options,
				questionType: 'shopping',
				displayPrompt: `${q.a} × $${q.b}`,
				displayResult: '?',
				storyPrompt: buildStoryPrompt(table, 'shopping', q.a, q.b, idx)
			};
		}

		const answer = q.a * q.b;
		const distractors = generateDistractors(answer, q.a, q.b);
		const options = shuffleArray([answer, ...distractors]);
		return {
			a: q.a,
			b: q.b,
			answer,
			options,
			questionType: qType,
			displayPrompt: `${q.a} × ${q.b}`,
			displayResult: '?',
			storyPrompt: buildStoryPrompt(table, qType, q.a, q.b, idx)
		};
	});
}
