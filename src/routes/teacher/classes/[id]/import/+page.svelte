<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';

	interface SheetData {
		sheetName: string;
		headers: string[];
		maxRows: number;
		rows?: string[][];
	}

	let classId = $derived(page.params.id);
	let className = $state('');

	// Upload state (use $state.raw for File so Svelte 5 never wraps native Blob/File in a Proxy)
	let file = $state.raw<File | null>(null);
	let sheets = $state<SheetData[]>([]);
	let selectedSheet = $state('');
	let selectedColumn = $state(1);
	let selectedLastNameColumn = $state(0); // 0 = el apellido ya viene incluido en la columna principal
	let nameOrder = $state<'first-last' | 'last-first'>('first-last');
	let replace = $state(false);
	let uploading = $state(false);
	let analyzing = $state(false);
	let error = $state('');
	let success = $state<number | null>(null);

	onMount(() => {
		loadClassInfo();
	});

	async function loadClassInfo() {
		try {
			const res = await session.authFetch(`/api/classes/${classId}`);
			if (res.ok) {
				const data = await res.json();
				className = data.class.grade || data.class.name;
			}
		} catch {
			// ignore
		}
	}

	function autoDetectColumns(sheet: SheetData | undefined) {
		if (!sheet) {
			selectedColumn = 1;
			selectedLastNameColumn = 0;
			return;
		}
		const headers = sheet.headers.map((h) => (h ?? '').toLowerCase().trim());

		// Buscar si hay columna explícita de nombre y otra de apellido
		const fullIdx = headers.findIndex(
			(h) =>
				(h.includes('nombre') && h.includes('apellido')) ||
				h.includes('estudiante') ||
				h.includes('alumno')
		);
		const firstIdx = headers.findIndex((h) => h.includes('nombre') && !h.includes('apellido'));
		const lastIdx = headers.findIndex((h) => h.includes('apellido') && !h.includes('nombre'));

		if (firstIdx !== -1 && lastIdx !== -1 && firstIdx !== lastIdx) {
			selectedColumn = firstIdx + 1;
			selectedLastNameColumn = lastIdx + 1;
			return;
		}

		if (fullIdx !== -1) {
			selectedColumn = fullIdx + 1;
			selectedLastNameColumn = 0;
			return;
		}

		if (firstIdx !== -1) {
			selectedColumn = firstIdx + 1;
			selectedLastNameColumn = lastIdx !== -1 && lastIdx !== firstIdx ? lastIdx + 1 : 0;
			return;
		}

		// Si la primera columna es "#" o "N°" o puramente numérica, elegir la columna 2 por defecto
		const firstHeader = headers[0] ?? '';
		if (
			headers.length >= 2 &&
			(firstHeader === '#' ||
				firstHeader === 'no' ||
				firstHeader === 'n°' ||
				firstHeader === 'nro' ||
				firstHeader === 'id' ||
				firstHeader === 'item')
		) {
			selectedColumn = 2;
		} else {
			selectedColumn = 1;
		}
		selectedLastNameColumn = 0;
	}

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const f = input.files?.[0];
		if (!f) return;
		file = f;
		error = '';
		success = null;
		sheets = [];
		selectedSheet = '';

		analyzing = true;
		try {
			const formData = new FormData();
			formData.append('file', f);
			const res = await session.authFetch(`/api/classes/${classId}/roster/preview`, {
				method: 'POST',
				body: formData
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				error = data.error ?? 'Error al leer el archivo';
				return;
			}
			const data = await res.json();
			sheets = data.sheets ?? [];
			if (sheets.length > 0) {
				selectedSheet = sheets[0].sheetName;
				autoDetectColumns(sheets[0]);
			}
		} catch {
			error = 'Error al procesar el archivo';
		} finally {
			analyzing = false;
		}
	}

	function cleanCell(raw: string | undefined): string {
		const trimmed = (raw ?? '').replace(/\s+/g, ' ').trim();
		if (!trimmed) return '';
		if (/^\d+([.,]\d+)?$/.test(trimmed)) return '';
		return trimmed;
	}

	let currentSheet = $derived(sheets.find((s) => s.sheetName === selectedSheet));
	let columnHeaders = $derived(currentSheet?.headers ?? []);

	let extractedNames = $derived.by(() => {
		if (!currentSheet?.rows) return [];
		const list: string[] = [];
		for (const row of currentSheet.rows) {
			const first = cleanCell(row[selectedColumn - 1]);
			const last =
				selectedLastNameColumn > 0 && selectedLastNameColumn !== selectedColumn
					? cleanCell(row[selectedLastNameColumn - 1])
					: '';
			const combined =
				nameOrder === 'last-first' && last
					? [last, first].filter(Boolean).join(' ')
					: [first, last].filter(Boolean).join(' ');
			if (combined) {
				list.push(combined);
			}
		}
		return list;
	});

	let singleWordNames = $derived(
		extractedNames.filter((n) => !n.includes(' '))
	);

	async function handleImport() {
		if (!file || !selectedSheet) return;
		uploading = true;
		error = '';
		try {
			let res: Response;
			if (extractedNames.length > 0) {
				// Enviar directamente la lista extraída en JSON (evita re-subir el binario de Excel)
				res = await session.authFetch(`/api/classes/${classId}/roster`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						names: extractedNames,
						replace
					})
				});
			} else {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('sheetName', selectedSheet);
				formData.append('column', String(selectedColumn));
				formData.append('lastNameColumn', String(selectedLastNameColumn));
				formData.append('replace', String(replace));

				res = await session.authFetch(`/api/classes/${classId}/roster`, {
					method: 'POST',
					body: formData
				});
			}

			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				error = data.error ?? `Error al importar (${res.status})`;
				return;
			}
			success = data.count;
			setTimeout(() => goto(`/teacher/classes/${classId}`), 1500);
		} catch (err) {
			error = err instanceof Error ? `Error al importar: ${err.message}` : 'Error de conexión';
		} finally {
			uploading = false;
		}
	}

	function colLetter(index1Based: number): string {
		let n = index1Based;
		let s = '';
		while (n > 0) {
			const mod = (n - 1) % 26;
			s = String.fromCharCode(65 + mod) + s;
			n = Math.floor((n - 1) / 26);
		}
		return s || 'A';
	}
</script>

<svelte:head>
	<title>Importar Excel — Star Fox 3</title>
</svelte:head>

<div class="min-h-dvh bg-[#0f0f2a]">
	<header class="flex items-center gap-4 border-b border-gray-800 bg-[#1a1a30] px-6 py-4">
		<button
			class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-3 py-2 text-sm text-gray-400 transition-all hover:border-amber-400/50 hover:text-white"
			onclick={() => goto(`/teacher/classes/${classId}`)}
		>
			← Volver
		</button>
		<h1 class="text-lg font-bold text-white">Importar alumnos — {className}</h1>
	</header>

	<main class="mx-auto max-w-2xl px-6 py-8">
		{#if success !== null}
			<div class="rounded-2xl border border-emerald-400/30 bg-[#252540] p-8 text-center">
				<div class="mb-4 text-5xl">✅</div>
				<h2 class="mb-2 text-xl font-bold text-white">¡{success} alumnos importados!</h2>
				<p class="text-sm text-gray-400">Redirigiendo al detalle de la clase...</p>
			</div>
		{:else}
			<!-- Step 1: Upload file -->
			<div class="mb-8 rounded-2xl border border-gray-700 bg-[#252540] p-6">
				<h2 class="mb-4 text-sm font-bold text-gray-300">1. Sube tu Excel de notas</h2>
				<p class="mb-4 text-xs text-gray-500">
					Sube el archivo Excel (.xlsx o .xls) que usas para las notas. El sistema detectará las hojas y columnas para que elijas dónde están los nombres.
				</p>
				<label class="block cursor-pointer">
					<div
						class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 p-8 transition-all hover:border-amber-400/50 {file ? 'border-amber-400/50 bg-amber-400/5' : ''}"
					>
						{#if file}
							<div class="text-3xl">📄</div>
							<p class="mt-2 text-sm font-medium text-amber-400">{file.name}</p>
							<p class="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
						{:else}
							<div class="text-3xl">📁</div>
							<p class="mt-2 text-sm text-gray-400">Haz clic para seleccionar un archivo</p>
							<p class="text-xs text-gray-600">.xlsx, .xls</p>
						{/if}
					</div>
					<input type="file" accept=".xlsx,.xls" class="hidden" onchange={handleFileSelect} />
				</label>
				{#if analyzing}
					<div class="mt-4 flex items-center gap-2 text-sm text-gray-400">
						<div class="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
						Analizando archivo...
					</div>
				{/if}
			</div>

			<!-- Step 2: Select sheet + column -->
			{#if sheets.length > 0}
				<div class="mb-8 rounded-2xl border border-gray-700 bg-[#252540] p-6">
					<h2 class="mb-3 text-sm font-bold text-gray-300">2. Selecciona hoja y columnas (Nombres y Apellidos)</h2>

					<div class="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
						💡 <strong>Importante:</strong> En un mismo salón puede haber dos estudiantes con el mismo nombre (ej. dos <em>"Lina"</em>). Asegúrate de incluir <strong>Nombre y Apellido</strong>: si en tu Excel vienen en columnas separadas, selecciona ambas abajo para unirlos automáticamente.
					</div>

					<!-- Sheet selector -->
					<div class="mb-4">
						<label for="sheet" class="mb-1 block text-sm text-gray-300">Hoja</label>
						<select
							id="sheet"
							bind:value={selectedSheet}
							onchange={() => {
								autoDetectColumns(sheets.find((s) => s.sheetName === selectedSheet));
							}}
							class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none focus:border-amber-400"
						>
							{#each sheets as sheet (sheet.sheetName)}
								<option value={sheet.sheetName}>{sheet.sheetName} ({sheet.maxRows} filas)</option>
							{/each}
						</select>
					</div>

					<!-- Column selectors -->
					{#if currentSheet}
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label for="column" class="mb-1 block text-sm text-gray-300">
									Columna de Nombres (o Nombre completo)
								</label>
								<select
									id="column"
									bind:value={selectedColumn}
									class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none focus:border-amber-400"
								>
									{#each columnHeaders as header, i (i)}
										<option value={i + 1}>
											Columna {colLetter(i + 1)}{header ? ` — ${header}` : ' (sin encabezado)'}
										</option>
									{/each}
								</select>
							</div>

							<div>
								<label for="lastNameColumn" class="mb-1 block text-sm text-gray-300">
									Columna de Apellidos <span class="text-xs text-gray-400">(si están aparte)</span>
								</label>
								<select
									id="lastNameColumn"
									bind:value={selectedLastNameColumn}
									class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none focus:border-amber-400"
								>
									<option value={0}>— Ya incluidos en la columna principal —</option>
									{#each columnHeaders as header, i (i)}
										{#if i + 1 !== selectedColumn}
											<option value={i + 1}>
												Columna {colLetter(i + 1)}{header ? ` — ${header}` : ' (sin encabezado)'}
											</option>
										{/if}
									{/each}
								</select>
							</div>
						</div>

						{#if selectedLastNameColumn > 0 && selectedLastNameColumn !== selectedColumn}
							<div class="mt-4">
								<label for="nameOrder" class="mb-1 block text-xs text-gray-400">Orden al unir las dos columnas:</label>
								<select
									id="nameOrder"
									bind:value={nameOrder}
									class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
								>
									<option value="first-last">Nombre + Apellido (Ej: Lina Gómez)</option>
									<option value="last-first">Apellido + Nombre (Ej: Gómez Lina)</option>
								</select>
							</div>
						{/if}

						<p class="mt-2 text-xs text-gray-500">
							La primera fila (encabezados) y las celdas puramente numéricas (#) se ignoran automáticamente.
						</p>
					{/if}

					<!-- Live Preview -->
					{#if currentSheet && selectedColumn}
						<div class="mt-4 rounded-xl bg-[#1E1E2F] p-4">
							<div class="mb-2 flex items-center justify-between">
								<p class="text-xs text-gray-400">
									Vista previa ({extractedNames.length} estudiante{extractedNames.length === 1 ? '' : 's'} detectado{extractedNames.length === 1 ? '' : 's'}):
								</p>
							</div>

							{#if extractedNames.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each extractedNames.slice(0, 8) as sampleName, idx (idx)}
										<span class="rounded-lg border border-gray-700 bg-[#252540] px-2.5 py-1 text-xs text-white">
											{idx + 1}. {sampleName}
										</span>
									{/each}
									{#if extractedNames.length > 8}
										<span class="rounded-lg px-2 py-1 text-xs text-gray-500">
											+{extractedNames.length - 8} más...
										</span>
									{/if}
								</div>

								{#if singleWordNames.length > 0 && selectedLastNameColumn === 0}
									<p class="mt-3 text-xs text-amber-400">
										⚠️ Se detectaron {singleWordNames.length} nombre(s) sin apellido (ej. "{singleWordNames[0]}"). Si tu Excel tiene los apellidos en otra columna, selecciónala arriba en <strong>"Columna de Apellidos"</strong> para diferenciar alumnos con el mismo nombre.
									</p>
								{/if}
							{:else}
								<p class="text-xs text-red-400">
									No se detectaron nombres válidos en esta columna. Prueba seleccionando otra columna.
								</p>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Step 3: Import options -->
				<div class="mb-8 rounded-2xl border border-gray-700 bg-[#252540] p-6">
					<h2 class="mb-4 text-sm font-bold text-gray-300">3. Opciones</h2>
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" bind:checked={replace} class="h-4 w-4 accent-amber-400" />
						<div>
							<span class="text-sm text-gray-300">Reemplazar lista existente</span>
							<p class="text-xs text-gray-500">Si la clase ya tiene alumnos, se eliminarán y reemplazarán.</p>
						</div>
					</label>
				</div>

				{#if error}
					<p class="mb-4 text-sm text-red-400">{error}</p>
				{/if}

				<button
					class="w-full cursor-pointer rounded-xl bg-amber-400 px-6 py-4 text-lg font-bold text-[#1E1E2F] transition-all hover:scale-[1.02] disabled:opacity-50"
					disabled={uploading || !selectedSheet || !file || extractedNames.length === 0}
					onclick={handleImport}
				>
					{uploading ? 'Importando...' : `Importar ${extractedNames.length} alumno${extractedNames.length === 1 ? '' : 's'}`}
				</button>
			{/if}
		{/if}
	</main>
</div>
