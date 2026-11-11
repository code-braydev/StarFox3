import ExcelJS from 'exceljs';

export interface SheetPreview {
	sheetName: string;
	headers: string[]; // first row values (trimmed), one per column
	maxRows: number;
	rows: string[][]; // data rows (from row 2 onwards), one cell string per column
}

export interface ExtractedNames {
	names: string[];
	skippedRows: number;
}

/**
 * Read the uploaded Excel buffer and return sheet names + header row + data rows for each.
 * The teacher will then pick a sheet and the name / last-name columns.
 */
export async function previewWorkbook(buffer: Buffer): Promise<SheetPreview[]> {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer);

	const previews: SheetPreview[] = [];
	wb.eachSheet((sheet) => {
		const headers: string[] = [];
		const rows: string[][] = [];

		const firstRow = sheet.getRow(1);
		const colCount = sheet.columnCount || 0;
		for (let c = 1; c <= colCount; c++) {
			const cell = firstRow.getCell(c);
			headers.push(formatCell(cell));
		}

		// Collect rows with at least one non-empty cell
		sheet.eachRow((row, rowNumber) => {
			if (rowNumber === 1) return;
			const cells: string[] = [];
			let hasValue = false;
			const maxCol = Math.max(colCount, row.cellCount || 0);
			for (let c = 1; c <= maxCol; c++) {
				const val = formatCell(row.getCell(c));
				if (val !== '') hasValue = true;
				cells.push(val);
			}
			if (hasValue) {
				while (headers.length < cells.length) {
					headers.push('');
				}
				rows.push(cells);
			}
		});

		previews.push({ sheetName: sheet.name, headers, maxRows: rows.length, rows });
	});
	return previews;
}

function cleanNamePart(raw: string): string {
	const trimmed = raw.replace(/\s+/g, ' ').trim();
	if (!trimmed) return '';
	// Ignore pure numbers (e.g. row index / document ID)
	if (/^\d+([.,]\d+)?$/.test(trimmed)) return '';
	return trimmed;
}

/**
 * Extract names from a specific sheet + primary column (1-based) and optional secondary column (1-based, e.g. last names).
 * Skips the header row (row 1) and empty / whitespace-only cells.
 * Ignores cells that are purely numeric (e.g. "#" row numbers).
 */
export async function extractNames(
	buffer: Buffer,
	sheetName: string,
	columnIndex: number,
	lastNameColumnIndex = 0
): Promise<ExtractedNames> {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer);

	const sheet = wb.getWorksheet(sheetName);
	if (!sheet) {
		throw new Error(`No se encontró la hoja "${sheetName}"`);
	}

	const names: string[] = [];
	let skippedRows = 0;

	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return; // skip header
		const firstPart = cleanNamePart(formatCell(row.getCell(columnIndex)));
		const secondPart =
			lastNameColumnIndex > 0 && lastNameColumnIndex !== columnIndex
				? cleanNamePart(formatCell(row.getCell(lastNameColumnIndex)))
				: '';

		const combined = [firstPart, secondPart].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
		if (!combined) {
			skippedRows++;
			return;
		}
		names.push(combined);
	});

	return { names, skippedRows };
}

function formatCell(cell: ExcelJS.Cell): string {
	const v = cell.value;
	if (v === null || v === undefined) return '';
	if (typeof v === 'string') return v.trim();
	if (typeof v === 'number') return String(v);
	if (typeof v === 'boolean') return v ? 'true' : 'false';
	// Rich text
	if (typeof v === 'object' && 'richText' in v) {
		return (v as ExcelJS.CellRichTextValue).richText
			.map((r) => r.text)
			.join('')
			.trim();
	}
	// Formula with result
	if (typeof v === 'object' && 'result' in v) {
		const result = (v as ExcelJS.CellFormulaValue).result;
		return result !== null && result !== undefined ? String(result).trim() : '';
	}
	// Hyperlink
	if (typeof v === 'object' && 'text' in v) {
		return ((v as ExcelJS.CellHyperlinkValue).text ?? '').trim();
	}
	// Date
	if (v instanceof Date) return v.toISOString().slice(0, 10);
	return String(v).trim();
}
