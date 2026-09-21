export interface FoxyDialogs {
	start: string;
	correct: string[];
	wrong: string[];
	complete: string;
}

export type QuestionType =
	'multiply' | 'mixed' | 'inverse' | 'trueFalse' | 'geometry' | 'series' | 'shopping';

export interface LevelInfo {
	name: string;
	description: string;
	background: string;
	phase: 1 | 2 | 3 | 4;
	energyCost: number;
	timer: number;
	questionType: QuestionType;
	questionCount: number;
	questions: { a: number; b: number }[];
	foxyDialogs: FoxyDialogs;
}

export const levelInfo: Record<number, LevelInfo> = {
	1: {
		name: 'Tutorial - Tabla del 1',
		description: 'Aprende a pilotear la nave resolviendo las multiplicaciones más básicas.',
		background: '/img/bg-hangar.webp',
		phase: 1,
		energyCost: 0,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 1, b: 2 },
			{ a: 1, b: 3 },
			{ a: 1, b: 4 },
			{ a: 1, b: 5 },
			{ a: 1, b: 6 },
			{ a: 1, b: 7 },
			{ a: 1, b: 8 },
			{ a: 1, b: 9 },
			{ a: 1, b: 5 },
			{ a: 1, b: 7 }
		],
		foxyDialogs: {
			start: '¡Bienvenido, Piloto! Vamos a practicar las tablas de multiplicar. ¡Tú puedes!',
			correct: [
				'¡Excelente! Ese cálculo fue perfecto.',
				'¡Genial! Estás listo para la siguiente misión.',
				'¡Impecable! La nave responde a tu mente.',
				'¡Correcto! Sigue así, Piloto.'
			],
			wrong: [
				'¡No te preocupes! Vamos a intentarlo de nuevo.',
				'¡Casi! Un poquito más de práctica y lo logras.',
				'¡Ánimo! Cada error te hace más fuerte.',
				'Tranquilo, Piloto. ¡Esto es solo el comienzo!'
			],
			complete: '¡Tutorial completado! ¡Estás listo para la aventura!'
		}
	},
	2: {
		name: 'Estación Orbital Alfa',
		description: 'Carga las celdas de combustible para despegar.',
		background: '/img/background/a52782ccb3a30108eb1700950086dcf9.webp',
		phase: 1,
		energyCost: 10,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 2, b: 3 },
			{ a: 2, b: 5 },
			{ a: 2, b: 7 },
			{ a: 2, b: 4 },
			{ a: 2, b: 9 },
			{ a: 2, b: 6 },
			{ a: 2, b: 8 },
			{ a: 2, b: 3 },
			{ a: 2, b: 5 },
			{ a: 2, b: 7 }
		],
		foxyDialogs: {
			start: '¡La Estación Orbital Alfa nos espera! Carga las celdas de combustible.',
			correct: [
				'¡Celda cargada! La nave se acerca a la potencia máxima.',
				'¡Perfecto! Cada celda nos acerca a la Tierra.',
				'¡Genial! El combustible aumenta con tu precisión.',
				'¡Impecable! Las luces de la nave parpadean aprobando.'
			],
			wrong: [
				'¡Celda descartada! Pero tenemos tiempo para recargar.',
				'¡Casi! Un cálculo más preciso y la celda carga.',
				'¡No te rindas! La nave confía en ti.',
				'Tranquilo, Piloto. ¡Las reservas aguantan!'
			],
			complete: '¡Estación Orbital superada! Combustible suficiente para el siguiente salto.'
		}
	},
	3: {
		name: 'El Bosque de Cristal',
		description: 'Navega entre los prismas luminosos que guían tu camino.',
		background: '/img/background/0dfc78ea7d3f2c1e08b50da43e6b528f.webp',
		phase: 1,
		energyCost: 10,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 3, b: 4 },
			{ a: 3, b: 6 },
			{ a: 3, b: 8 },
			{ a: 3, b: 5 },
			{ a: 3, b: 9 },
			{ a: 3, b: 7 },
			{ a: 3, b: 2 },
			{ a: 3, b: 4 },
			{ a: 3, b: 6 },
			{ a: 3, b: 8 }
		],
		foxyDialogs: {
			start: '¡El Bosque de Cristal! Los prismas brillan con cada cálculo correcto.',
			correct: [
				'¡El cristal resplandece! Tu cálculo ilumina el camino.',
				'¡Genial! Los prismas se alinean con tu mente.',
				'¡Perfecto! La luz del bosque te guía.',
				'¡Impecable! Cada acierto abre un nuevo sendero.'
			],
			wrong: [
				'¡El cristal se oscurece! Pero la luz vuelve pronto.',
				'¡Casi! Un cálculo más y el bosque brilla.',
				'¡No te rindas! Los prismas respetan a los que persisten.',
				'Tranquilo, Piloto. ¡La luz siempre vuelve!'
			],
			complete: '¡Bosque de Cristal superado! Tu nave brilla con luz propia.'
		}
	},
	4: {
		name: 'El Anillo de Asteroides',
		description: 'Calibra el escudo de la nave entre los asteroides.',
		background: '/img/background/98d0f009f41e6e13f29457f2e3322343.webp',
		phase: 1,
		energyCost: 10,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 4, b: 5 },
			{ a: 4, b: 7 },
			{ a: 4, b: 3 },
			{ a: 4, b: 9 },
			{ a: 4, b: 6 },
			{ a: 4, b: 8 },
			{ a: 4, b: 2 },
			{ a: 4, b: 5 },
			{ a: 4, b: 7 },
			{ a: 4, b: 3 }
		],
		foxyDialogs: {
			start: '¡El Anillo de Asteroides! Calibra el escudo para pasar sin rasguños.',
			correct: [
				'¡Escudo calibrado! Los asteroides rebotan en tu campo.',
				'¡Perfecto! Tu precisión mantiene la nave a salvo.',
				'¡Genial! El escudo brilla con cada cálculo.',
				'¡Impecable! Ni un rasguño en la nave.'
			],
			wrong: [
				'¡Golpe menor! El escudo resiste pero se debilita.',
				'¡Casi! Un cálculo más y el escudo es perfecto.',
				'¡No te rindas! Los asteroides no son tan rápidos.',
				'Tranquilo, Piloto. ¡El escudo aguanta!'
			],
			complete: '¡Anillo de Asteroides superado! Tu escudo está listo para cualquier cosa.'
		}
	},
	5: {
		name: 'Nebulosa Velox',
		description: 'Descodifica la trayectoria para escapar de la gravedad.',
		background: '/img/background/72e51093f3d7d9840d1600440346128d.webp',
		phase: 1,
		energyCost: 10,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 5, b: 6 },
			{ a: 5, b: 8 },
			{ a: 5, b: 3 },
			{ a: 5, b: 9 },
			{ a: 5, b: 4 },
			{ a: 5, b: 7 },
			{ a: 5, b: 2 },
			{ a: 5, b: 6 },
			{ a: 5, b: 8 },
			{ a: 5, b: 3 }
		],
		foxyDialogs: {
			start: '¡Nebulosa Velox! Los colores giran a tu alrededor. ¡Descodifica la salida!',
			correct: [
				'¡Trayectoria calculada! La nebulosa se abre paso.',
				'¡Genial! Los colores se alinean con tu cálculo.',
				'¡Perfecto! La gravedad no puede contigo.',
				'¡Impecable! La luz de la nebulosa te guía.'
			],
			wrong: [
				'¡Trayectoria fallida! Pero la nebulosa es paciente.',
				'¡Casi! Un cálculo más y la salida es clara.',
				'¡No te rindas! Los colores te esperan.',
				'Tranquilo, Piloto. ¡La gravedad es lenta!'
			],
			complete: '¡Nebulosa Velox superada! Has escapado de la gravedad.'
		}
	},
	6: {
		name: 'La Forja Estelar',
		description: 'Repara el motor con piezas de repuesto cósmicas.',
		background: '/img/background/6534a0e7a2b34c5da06c9c82c87002c3.webp',
		phase: 1,
		energyCost: 10,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 6, b: 7 },
			{ a: 6, b: 9 },
			{ a: 6, b: 4 },
			{ a: 6, b: 8 },
			{ a: 6, b: 3 },
			{ a: 6, b: 5 },
			{ a: 6, b: 2 },
			{ a: 6, b: 7 },
			{ a: 6, b: 9 },
			{ a: 6, b: 4 }
		],
		foxyDialogs: {
			start: '¡La Forja Estelar! El motor necesita reparación urgente.',
			correct: [
				'¡Pieza colocada! El motor vibra con fuerza.',
				'¡Genial! La forja responde a tu precisión.',
				'¡Perfecto! Cada pieza encaja como una estrella.',
				'¡Impecable! El motor está casi listo.'
			],
			wrong: [
				'¡Pieza descartada! Pero la forja tiene más repuestos.',
				'¡Casi! Un cálculo más y la pieza encaja.',
				'¡No te rindas! La forja respeta a los persistentes.',
				'Tranquilo, Piloto. ¡El motor aguanta!'
			],
			complete: '¡Forja Estelar superada! El motor ruge con fuerza renovada.'
		}
	},
	7: {
		name: 'Puerto Espacial Sirius',
		description: 'Negocia tu paso por el puerto interplanetario.',
		background: '/img/background/fc5d322f06c104b03e4dc12c7412b59d.webp',
		phase: 1,
		energyCost: 10,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 7, b: 8 },
			{ a: 7, b: 3 },
			{ a: 7, b: 5 },
			{ a: 7, b: 9 },
			{ a: 7, b: 4 },
			{ a: 7, b: 6 },
			{ a: 7, b: 2 },
			{ a: 7, b: 8 },
			{ a: 7, b: 3 },
			{ a: 7, b: 5 }
		],
		foxyDialogs: {
			start: '¡Puerto Espacial Sirius! Los comerciantes esperan tus cálculos.',
			correct: [
				'¡Negocio cerrado! El puerto te da paso.',
				'¡Genial! Los comerciantes asienten.',
				'¡Perfecto! Tu precisión vale su peso en oro.',
				'¡Impecable! El puerto abre sus puertas.'
			],
			wrong: [
				'¡Oferta rechazada! Pero hay más comerciantes.',
				'¡Casi! Un cálculo más y el negocio cierra.',
				'¡No te rindas! Sirius respeta la persistencia.',
				'Tranquilo, Piloto. ¡El puerto es paciente!'
			],
			complete: '¡Puerto Sirius superado! Tu paso está garantizado.'
		}
	},
	8: {
		name: 'El Vacío Profundo',
		description: 'Calcula las reservas de oxígeno para el viaje largo.',
		background: '/img/background/8c3e0b3d29fb4c10aa6010992521176e.webp',
		phase: 1,
		energyCost: 10,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 8, b: 9 },
			{ a: 8, b: 5 },
			{ a: 8, b: 3 },
			{ a: 8, b: 7 },
			{ a: 8, b: 4 },
			{ a: 8, b: 6 },
			{ a: 8, b: 2 },
			{ a: 8, b: 9 },
			{ a: 8, b: 5 },
			{ a: 8, b: 3 }
		],
		foxyDialogs: {
			start: '¡El Vacío Profundo! Calcula las reservas de oxígeno.',
			correct: [
				'¡Reserva calculada! El oxígeno está asegurado.',
				'¡Genial! Tus pulmones virtuales respiran tranquilos.',
				'¡Perfecto! La nave tiene aire suficiente.',
				'¡Impecable! El vacío no es problema.'
			],
			wrong: [
				'¡Reserva fallida! Pero el vacío es largo, ¡tenemos tiempo!',
				'¡Casi! Un cálculo más preciso y las reservas aumentan.',
				'¡No entres en pánico! El vacío es largo, ¡tú eres más!',
				'Tranquilo, Piloto. ¡Las reservas aguantan!'
			],
			complete: '¡El Vacío Profundo superado! Tus reservas de oxígeno son inagotables.'
		}
	},
	9: {
		name: 'La Tierra - Destino Final',
		description: '¡Hemos llegado! Activa la dispersión de la cura para salvar a la humanidad.',
		background: '/img/background/a52782ccb3a30108eb1700950086dcf9.webp',
		phase: 1,
		energyCost: 10,
		timer: 30,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 9, b: 2 },
			{ a: 9, b: 3 },
			{ a: 9, b: 4 },
			{ a: 9, b: 5 },
			{ a: 9, b: 6 },
			{ a: 9, b: 7 },
			{ a: 9, b: 8 },
			{ a: 9, b: 9 },
			{ a: 9, b: 4 },
			{ a: 9, b: 7 }
		],
		foxyDialogs: {
			start:
				'¡La Tierra está frente a nosotros! Resuelve los últimos cálculos para activar la dispersión de la cura.',
			correct: [
				'¡Cálculo preciso! La cura se está preparando para dispersar.',
				'¡Extraordinario, Piloto! La Tierra se acerca a salvo.',
				'¡Genial! Cada cálculo nos acerca a salvar vidas.',
				'¡Impecable! La dispersión está casi lista.'
			],
			wrong: [
				'¡Casi! La cura resiste, ¡pero tú eres más fuerte! ¡Reintenta!',
				'¡Casi lo logramos! Un cálculo más y la cura se activa.',
				'¡No te rindas! La Tierra necesita de ti.',
				'Tranquilo, Piloto. ¡Esta es la misión más importante!'
			],
			complete: '¡La Tierra está a salvo! ¡Misión cumplida, Piloto! ¡Eres un héroe!'
		}
	},
	10: {
		name: 'Tablas Mixtas',
		description: 'Se mezclan todas las tablas que has aprendido.',
		background: '/img/background/72e51093f3d7d9840d1600440346128d.webp',
		phase: 2,
		energyCost: 20,
		timer: 15,
		questionType: 'mixed',
		questionCount: 10,
		questions: [
			{ a: 3, b: 7 },
			{ a: 6, b: 4 },
			{ a: 8, b: 2 },
			{ a: 5, b: 9 },
			{ a: 7, b: 3 },
			{ a: 4, b: 6 },
			{ a: 9, b: 5 },
			{ a: 2, b: 8 },
			{ a: 6, b: 7 },
			{ a: 5, b: 4 }
		],
		foxyDialogs: {
			start: '¡Tablas Mixtas! Se mezclan todas las tablas que has dominado.',
			correct: [
				'¡Genial! Las tablas mezcladas no te detienen.',
				'¡Perfecto! Tu mente domina todas las tablas.',
				'¡Impecable! La mezcla es tu especialidad.',
				'¡Extraordinario! Ninguna tabla te sorprende.'
			],
			wrong: [
				'¡Casi! La mezcla es complicada pero tú puedes.',
				'¡No te preocupes! La práctica hace al maestro.',
				'¡Ánimo! Cada error te hace más fuerte.',
				'Tranquilo, Piloto. ¡Las tablas son amigas!'
			],
			complete: '¡Tablas Mixtas superadas! Tu mente es un centro de cálculo.'
		}
	},
	11: {
		name: 'Números Pares',
		description: 'Solo las tablas pares: 2, 4, 6 y 8.',
		background: '/img/background/98d0f009f41e6e13f29457f2e3322343.webp',
		phase: 2,
		energyCost: 20,
		timer: 15,
		questionType: 'mixed',
		questionCount: 10,
		questions: [
			{ a: 2, b: 6 },
			{ a: 4, b: 8 },
			{ a: 6, b: 3 },
			{ a: 8, b: 5 },
			{ a: 2, b: 9 },
			{ a: 4, b: 7 },
			{ a: 6, b: 4 },
			{ a: 8, b: 2 },
			{ a: 2, b: 5 },
			{ a: 4, b: 6 }
		],
		foxyDialogs: {
			start: '¡Números Pares! Las tablas 2, 4, 6 y 8 son tus aliadas.',
			correct: [
				'¡Par perfecto! Tu cálculo es impecable.',
				'¡Genial! Los pares brillan con tu luz.',
				'¡Perfecto! La simetría de los pares es hermosa.',
				'¡Impecable! Los números pares te aclaman.'
			],
			wrong: [
				'¡Casi! Los pares son exigentes pero justos.',
				'¡No te preocupes! Los pares dan segundas oportunidades.',
				'¡Ánimo! La paridad es solo una guía.',
				'Tranquilo, Piloto. ¡Los pares son tus amigos!'
			],
			complete: '¡Números Pares superados! La simetría es tu fuerte.'
		}
	},
	12: {
		name: 'Números Impares',
		description: 'Solo las tablas impares: 3, 5, 7 y 9.',
		background: '/img/background/fc5d322f06c104b03e4dc12c7412b59d.webp',
		phase: 2,
		energyCost: 20,
		timer: 15,
		questionType: 'mixed',
		questionCount: 10,
		questions: [
			{ a: 3, b: 5 },
			{ a: 5, b: 7 },
			{ a: 7, b: 9 },
			{ a: 9, b: 3 },
			{ a: 3, b: 8 },
			{ a: 5, b: 4 },
			{ a: 7, b: 6 },
			{ a: 9, b: 2 },
			{ a: 3, b: 9 },
			{ a: 5, b: 6 }
		],
		foxyDialogs: {
			start: '¡Números Impares! Las tablas 3, 5, 7 y 9 desafían tu mente.',
			correct: [
				'¡Impar perfecto! Tu cálculo es brillante.',
				'¡Genial! Los impares brillan con tu luz.',
				'¡Perfecto! La irregularidad es tu fortaleza.',
				'¡Impecable! Los números impares te respetan.'
			],
			wrong: [
				'¡Casi! Los impares son traviesos pero tú eres más.',
				'¡No te preocupes! Los impares son aventureros.',
				'¡Ánimo! La imparidad es solo una aventura.',
				'Tranquilo, Piloto. ¡Los impares son tus aliados!'
			],
			complete: '¡Números Impares superados! La irregularidad es tu poder.'
		}
	},
	13: {
		name: 'Tabla del 11',
		description: 'La tabla del 11 es especial: siempre se repite el dígito.',
		background: '/img/background/6534a0e7a2b34c5da06c9c82c87002c3.webp',
		phase: 2,
		energyCost: 20,
		timer: 15,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 11, b: 2 },
			{ a: 11, b: 3 },
			{ a: 11, b: 4 },
			{ a: 11, b: 5 },
			{ a: 11, b: 6 },
			{ a: 11, b: 7 },
			{ a: 11, b: 8 },
			{ a: 11, b: 9 },
			{ a: 11, b: 3 },
			{ a: 11, b: 7 }
		],
		foxyDialogs: {
			start: '¡Tabla del 11! Un dígito repetido que es fácil de recordar.',
			correct: [
				'¡Once, veintidós, treinta y tres! Tu mente es un reloj.',
				'¡Genial! La tabla del 11 es tu tabla favorita.',
				'¡Perfecto! Los dígitos se repiten como una canción.',
				'¡Impecable! El 11 es tu número de la suerte.'
			],
			wrong: [
				'¡Casi! El 11 es travieso pero tú puedes.',
				'¡No te preocupes! El 11 siempre da segundas oportunidades.',
				'¡Ánimo! La repetición es la madre del aprendizaje.',
				'Tranquilo, Piloto. ¡El 11 es tu amigo!'
			],
			complete: '¡Tabla del 11 superada! Los dígitos repetidos son tu especialidad.'
		}
	},
	14: {
		name: 'Tabla del 12',
		description: 'La tabla del 12 combina el 3 y el 4.',
		background: '/img/background/8c3e0b3d29fb4c10aa6010992521176e.webp',
		phase: 2,
		energyCost: 20,
		timer: 15,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 12, b: 2 },
			{ a: 12, b: 3 },
			{ a: 12, b: 4 },
			{ a: 12, b: 5 },
			{ a: 12, b: 6 },
			{ a: 12, b: 7 },
			{ a: 12, b: 8 },
			{ a: 12, b: 9 },
			{ a: 12, b: 4 },
			{ a: 12, b: 7 }
		],
		foxyDialogs: {
			start: '¡Tabla del 12! Combina la lógica del 3 y el 4.',
			correct: [
				'¡Doce, veinticuatro, treinta y seis! Tu mente es perfecta.',
				'¡Genial! La tabla del 12 es la reina de las tablas.',
				'¡Perfecto! El 12 combina todo lo que has aprendido.',
				'¡Impecable! El doce es tu número maestro.'
			],
			wrong: [
				'¡Casi! El 12 es exigente pero tú eres más.',
				'¡No te preocupes! El 12 siempre da oportunidades.',
				'¡Ánimo! La complejidad es tu aventura.',
				'Tranquilo, Piloto. ¡El 12 es tu amigo!'
			],
			complete: '¡Tabla del 12 superada! Las tablas complejas son tu fuerte.'
		}
	},
	15: {
		name: 'Relámpago',
		description: '¡Velocidad extrema! Responde antes de que se agote el tiempo.',
		background: '/img/background/0dfc78ea7d3f2c1e08b50da43e6b528f.webp',
		phase: 2,
		energyCost: 20,
		timer: 8,
		questionType: 'multiply',
		questionCount: 10,
		questions: [
			{ a: 5, b: 7 },
			{ a: 3, b: 8 },
			{ a: 6, b: 4 },
			{ a: 7, b: 9 },
			{ a: 2, b: 6 },
			{ a: 8, b: 3 },
			{ a: 4, b: 5 },
			{ a: 9, b: 2 },
			{ a: 6, b: 8 },
			{ a: 3, b: 7 }
		],
		foxyDialogs: {
			start: '¡Relámpago! El tiempo vuela. ¡Responde rápido!',
			correct: [
				'¡闪电! Tu mente es un rayo de luz.',
				'¡Genial! La velocidad es tu arma.',
				'¡Perfecto! Resolviste eso en un instante.',
				'¡Impecable! Eres más rápido que el sonido.'
			],
			wrong: [
				'¡Casi! La velocidad es difícil pero tú puedes.',
				'¡No te preocupes! El tiempo es solo un número.',
				'¡Ánimo! Los rayos siempre regresan.',
				'Tranquilo, Piloto. ¡La velocidad viene con la práctica!'
			],
			complete: '¡Relámpago superado! Eres más rápido que la luz.'
		}
	},
	16: {
		name: 'Terror del 6 y 9',
		description: 'Las tablas del 6 y el 9 suenan parecido. ¡Cuidado con las trampas!',
		background: '/img/background/a52782ccb3a30108eb1700950086dcf9.webp',
		phase: 2,
		energyCost: 20,
		timer: 15,
		questionType: 'mixed',
		questionCount: 10,
		questions: [
			{ a: 6, b: 7 },
			{ a: 9, b: 4 },
			{ a: 6, b: 3 },
			{ a: 9, b: 8 },
			{ a: 6, b: 9 },
			{ a: 9, b: 6 },
			{ a: 6, b: 5 },
			{ a: 9, b: 2 },
			{ a: 6, b: 8 },
			{ a: 9, b: 3 }
		],
		foxyDialogs: {
			start: '¡El Terror del 6 y el 9! No dejes que te confundan.',
			correct: [
				'¡Distinguid perfecto! El 6 y el 9 te respetan.',
				'¡Genial! La confusión no contigo.',
				'¡Perfecto! Tu precisión es legendaria.',
				'¡Impecable! Has vencido al terror.'
			],
			wrong: [
				'¡Casi! El 6 y el 9 son tramposos.',
				'¡No te preocupes! Muchos caen en esa trampa.',
				'¡Ánimo! La práctica los vence.',
				'Tranquilo, Piloto. ¡El terror es solo una ilusión!'
			],
			complete: '¡Terror del 6 y 9 superado! Nada te confunde ya.'
		}
	},
	17: {
		name: 'Modo Tienda',
		description: 'Resuelve problemas de compra: "Si algo cuesta X y compras Y, ¿cuánto pagas?"',
		background: '/img/background/6534a0e7a2b34c5da06c9c82c87002c3.webp',
		phase: 3,
		energyCost: 35,
		timer: 12,
		questionType: 'shopping',
		questionCount: 10,
		questions: [
			{ a: 5, b: 3 },
			{ a: 8, b: 2 },
			{ a: 7, b: 4 },
			{ a: 6, b: 5 },
			{ a: 9, b: 3 },
			{ a: 4, b: 7 },
			{ a: 3, b: 8 },
			{ a: 5, b: 6 },
			{ a: 7, b: 2 },
			{ a: 8, b: 4 }
		],
		foxyDialogs: {
			start: '¡Modo Tienda! Resuelve problemas de compra del mundo real.',
			correct: [
				'¡Compra perfecta! Eres un genio de las matemáticas.',
				'¡Genial! La tienda está en buenas manos.',
				'¡Perfecto! Cálculos de compra impecables.',
				'¡Impecable! Eres el mejor comprador del espacio.'
			],
			wrong: [
				'¡Casi! Las compras son difíciles pero tú puedes.',
				'¡No te preocupes! La práctica hace al comprador.',
				'¡Ánimo! Cada error te hace mejor comprador.',
				'Tranquilo, Piloto. ¡Las compras son aventuras!'
			],
			complete: '¡Modo Tienda superado! Eres un maestro de las compras.'
		}
	},
	18: {
		name: 'Ecuaciones Inversas',
		description: 'Resuelve: "6 × ? = 24". Encuentra el número que falta.',
		background: '/img/background/98d0f009f41e6e13f29457f2e3322343.webp',
		phase: 3,
		energyCost: 35,
		timer: 12,
		questionType: 'inverse',
		questionCount: 10,
		questions: [
			{ a: 6, b: 4 },
			{ a: 3, b: 8 },
			{ a: 7, b: 5 },
			{ a: 4, b: 9 },
			{ a: 8, b: 3 },
			{ a: 5, b: 6 },
			{ a: 9, b: 2 },
			{ a: 2, b: 7 },
			{ a: 6, b: 8 },
			{ a: 3, b: 5 }
		],
		foxyDialogs: {
			start: '¡Ecuaciones Inversas! El signo de interrogación te espera.',
			correct: [
				'¡Descifrado! La ecuación inverse se rinde ante ti.',
				'¡Genial! Tu mente es un detective matemático.',
				'¡Perfecto! El misterio está resuelto.',
				'¡Impecable! Las ecuaciones inversas son tu fuerte.'
			],
			wrong: [
				'¡Casi! La inversa es complicada pero tú puedes.',
				'¡No te preocupes! La práctica las vence.',
				'¡Ánimo! Cada intento te acerca a la respuesta.',
				'Tranquilo, Piloto. ¡Las inversas son acertijos!'
			],
			complete: '¡Ecuaciones Inversas superadas! Eres un maestro del misterio.'
		}
	},
	19: {
		name: 'Geometría',
		description: 'Cuenta bloques por filas y columnas para encontrar el área.',
		background: '/img/background/72e51093f3d7d9840d1600440346128d.webp',
		phase: 3,
		energyCost: 35,
		timer: 12,
		questionType: 'geometry',
		questionCount: 10,
		questions: [
			{ a: 3, b: 5 },
			{ a: 4, b: 6 },
			{ a: 2, b: 8 },
			{ a: 5, b: 3 },
			{ a: 6, b: 4 },
			{ a: 7, b: 2 },
			{ a: 3, b: 7 },
			{ a: 4, b: 5 },
			{ a: 8, b: 3 },
			{ a: 2, b: 9 }
		],
		foxyDialogs: {
			start: '¡Geometría! Cuenta los bloques para encontrar el área.',
			correct: [
				'¡Área calculada! Los bloques se alinean perfectamente.',
				'¡Genial! Tu visión espacial es extraordinaria.',
				'¡Perfecto! La geometría no tiene secretos.',
				'¡Impecable! Eres un arquitecto estelar.'
			],
			wrong: [
				'¡Casi! Los bloques son traviesos pero tú puedes.',
				'¡No te preocupes! La geometría requiere práctica.',
				'¡Ánimo! Cada intento mejora tu visión.',
				'Tranquilo, Piloto. ¡Los bloques son amigables!'
			],
			complete: '¡Geometría superada! Tu mente construye mundos.'
		}
	},
	20: {
		name: 'Verdadero o Falso',
		description: '¿Es correcta la afirmación? Responde rápido.',
		background: '/img/background/fc5d322f06c104b03e4dc12c7412b59d.webp',
		phase: 3,
		energyCost: 35,
		timer: 12,
		questionType: 'trueFalse',
		questionCount: 10,
		questions: [
			{ a: 6, b: 7 },
			{ a: 8, b: 3 },
			{ a: 5, b: 9 },
			{ a: 4, b: 6 },
			{ a: 7, b: 8 },
			{ a: 3, b: 5 },
			{ a: 9, b: 4 },
			{ a: 2, b: 7 },
			{ a: 6, b: 8 },
			{ a: 5, b: 3 }
		],
		foxyDialogs: {
			start: '¡Verdadero o Falso! ¿Es correcta la afirmación?',
			correct: [
				'¡Correcto! Tu instinto matemático es perfecto.',
				'¡Genial! distinguir verdadero de falso es fácil para ti.',
				'¡Perfecto! La verdad siempre brilla.',
				'¡Impecable! Eres un juez de las matemáticas.'
			],
			wrong: [
				'¡Casi! El V/F es engañoso pero tú puedes.',
				'¡No te preocupes! Muchos se equivocan.',
				'¡Ánimo! La práctica agudiza el instinto.',
				'Tranquilo, Piloto. ¡El error es solo una opinión!'
			],
			complete: '¡Verdadero o Falso superado! Tu instinto es infalible.'
		}
	},
	21: {
		name: 'Series Numéricas',
		description: 'Completa la serie: 2, 4, 6, 8, ¿cuál sigue?',
		background: '/img/background/8c3e0b3d29fb4c10aa6010992521176e.webp',
		phase: 3,
		energyCost: 35,
		timer: 12,
		questionType: 'series',
		questionCount: 10,
		questions: [
			{ a: 2, b: 4 },
			{ a: 3, b: 6 },
			{ a: 5, b: 10 },
			{ a: 4, b: 8 },
			{ a: 7, b: 14 },
			{ a: 6, b: 12 },
			{ a: 3, b: 9 },
			{ a: 5, b: 15 },
			{ a: 8, b: 16 },
			{ a: 4, b: 12 }
		],
		foxyDialogs: {
			start: '¡Series Numéricas! Descubre el patrón y completa la serie.',
			correct: [
				'¡Patrón descifrado! Tu mente es un algoritmo perfecto.',
				'¡Genial! Las series no tienen secretos para ti.',
				'¡Perfecto! Tu lógica es impecable.',
				'¡Impecable! Eres el maestro de los patrones.'
			],
			wrong: [
				'¡Casi! Los patrones son sutiles pero tú puedes.',
				'¡No te preocupes! Las series requieren intuición.',
				'¡Ánimo! Cada intento mejora tu lógica.',
				'Tranquilo, Piloto. ¡Los patrones son aventuras!'
			],
			complete: '¡Series Numéricas superadas! Tu lógica es legendaria.'
		}
	},
	22: {
		name: 'Mezcla Total',
		description: 'Todas las mecánicas juntas. ¡Demuestra lo que sabes!',
		background: '/img/background/a52782ccb3a30108eb1700950086dcf9.webp',
		phase: 3,
		energyCost: 35,
		timer: 12,
		questionType: 'mixed',
		questionCount: 10,
		questions: [
			{ a: 7, b: 8 },
			{ a: 11, b: 3 },
			{ a: 5, b: 9 },
			{ a: 12, b: 4 },
			{ a: 6, b: 7 },
			{ a: 9, b: 5 },
			{ a: 8, b: 3 },
			{ a: 4, b: 6 },
			{ a: 7, b: 2 },
			{ a: 3, b: 9 }
		],
		foxyDialogs: {
			start: '¡Mezcla Total! Todas las mecánicas en un solo nivel.',
			correct: [
				'¡Dominio total! Eres un maestro de las matemáticas.',
				'¡Genial! La mezcla no te detiene.',
				'¡Perfecto! Tu mente domina todo.',
				'¡Impecable! Eres imparable.'
			],
			wrong: [
				'¡Casi! La mezcla es complicada pero tú puedes.',
				'¡No te preocupes! La variedad es la vida.',
				'¡Ánimo! Cada error te hace más fuerte.',
				'Tranquilo, Piloto. ¡La mezcla es una aventura!'
			],
			complete: '¡Mezcla Total superada! Eres el maestro absoluto.'
		}
	},
	23: {
		name: 'Desafío Extremo',
		description: '¡Velocidad y precisión al máximo! El tiempo vuela.',
		background: '/img/background/98d0f009f41e6e13f29457f2e3322343.webp',
		phase: 3,
		energyCost: 35,
		timer: 8,
		questionType: 'mixed',
		questionCount: 10,
		questions: [
			{ a: 8, b: 7 },
			{ a: 12, b: 5 },
			{ a: 6, b: 9 },
			{ a: 11, b: 4 },
			{ a: 9, b: 8 },
			{ a: 7, b: 3 },
			{ a: 5, b: 6 },
			{ a: 12, b: 7 },
			{ a: 8, b: 4 },
			{ a: 6, b: 11 }
		],
		foxyDialogs: {
			start: '¡Desafío Extremo! Velocidad y precisión. ¡No hay margen de error!',
			correct: [
				'¡Extremo! Tu velocidad es legendaria.',
				'¡Genial! El desafío se rinde ante ti.',
				'¡Perfecto! Eres más rápido que la luz.',
				'¡Impecable! El extremo es tu zona de confort.'
			],
			wrong: [
				'¡Casi! El desafío es extremo pero tú lo eres más.',
				'¡No te preocupes! El extremo es para valientes.',
				'¡Ánimo! La práctica te hace extremo.',
				'Tranquilo, Piloto. ¡El desafío es una aventura!'
			],
			complete: '¡Desafío Extremo superado! Eres el piloto más extremo.'
		}
	},
	24: {
		name: 'Pre-Jefe',
		description: 'El último desafío antes del jefe final. ¡Prepárate!',
		background: '/img/background/fc5d322f06c104b03e4dc12c7412b59d.webp',
		phase: 3,
		energyCost: 35,
		timer: 12,
		questionType: 'mixed',
		questionCount: 10,
		questions: [
			{ a: 9, b: 8 },
			{ a: 12, b: 6 },
			{ a: 7, b: 11 },
			{ a: 5, b: 9 },
			{ a: 8, b: 7 },
			{ a: 11, b: 5 },
			{ a: 6, b: 12 },
			{ a: 4, b: 9 },
			{ a: 7, b: 8 },
			{ a: 9, b: 6 }
		],
		foxyDialogs: {
			start: '¡Pre-Jefe! El último desafío antes de Nova. ¡Dalo todo!',
			correct: [
				'¡Preparación perfecta! Estás listo para Nova.',
				'¡Genial! El jefe no tendrá oportunidad.',
				'¡Perfecto! Tu poder crece cada segundo.',
				'¡Impecable! Nova tiembla ante ti.'
			],
			wrong: [
				'¡Casi! El pre-jefe es duro pero tú eres más.',
				'¡No te preocupes! La preparación es clave.',
				'¡Ánimo! El jefe espera, pero tú estás listo.',
				'Tranquilo, Piloto. ¡El pre-jefe es solo un calentamiento!'
			],
			complete: '¡Pre-Jefe superado! Estás listo para el enfrentamiento final.'
		}
	},
	25: {
		name: 'Jefe Final - Nova',
		description: 'Enfrenta a Nova en una maratón de 20 preguntas. ¡Es la batalla final!',
		background: '/img/background/6534a0e7a2b34c5da06c9c82c87002c3.webp',
		phase: 4,
		energyCost: 60,
		timer: 7,
		questionType: 'mixed',
		questionCount: 20,
		questions: [
			{ a: 9, b: 8 },
			{ a: 12, b: 7 },
			{ a: 6, b: 11 },
			{ a: 8, b: 5 },
			{ a: 7, b: 9 },
			{ a: 11, b: 4 },
			{ a: 5, b: 12 },
			{ a: 9, b: 6 },
			{ a: 4, b: 8 },
			{ a: 7, b: 11 },
			{ a: 12, b: 3 },
			{ a: 6, b: 7 },
			{ a: 8, b: 9 },
			{ a: 11, b: 6 },
			{ a: 3, b: 12 },
			{ a: 9, b: 4 },
			{ a: 7, b: 8 },
			{ a: 5, b: 11 },
			{ a: 12, b: 5 },
			{ a: 6, b: 9 }
		],
		foxyDialogs: {
			start: '¡Nova te espera! La dragón de fuego. ¡Demuestra todo lo que has aprendido!',
			correct: [
				'¡Golpe certero! Nova retrocede.',
				'¡Genial! La dragón no puede contigo.',
				'¡Perfecto! Tu poder es superior.',
				'¡Impecable! Nova tiembla ante tu fuerza.',
				'¡Extraordinario! Eres el piloto definitivo.',
				'¡Impecable! La victoria está cerca.'
			],
			wrong: [
				'¡Golpe recibido! Pero te levantas más fuerte.',
				'¡Casi! Nova es poderosa, pero tú lo eres más.',
				'¡No te rindas! La victoria es tuya.',
				'Tranquilo, Piloto. ¡La dragón tiene debilidades!',
				'¡Ánimo! Cada golpe te hace más fuerte.',
				'¡Resiste! La victoria está al alcance.'
			],
			complete: '¡NOVA DERROTADA! ¡Has salvado la galaxia, Piloto! ¡Eres un héroe legendario!'
		}
	}
};
