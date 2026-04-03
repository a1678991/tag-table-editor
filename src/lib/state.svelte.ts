import type { TagTable, ValidationError } from "./types";
import { autoTextColor } from "./color-utils";
import { validate } from "./validation";
import { loadFromLocalStorage, saveToLocalStorage } from "./persistence";
import { TEMPLATES } from "./templates";

function defaultTable(): TagTable {
  return structuredClone(TEMPLATES.softwareArchitecture.data);
}

function initTable(): TagTable {
  return loadFromLocalStorage() ?? defaultTable();
}

export let table: TagTable = $state(initTable());

export function getTotalTags(): number {
  return table.columns.reduce((s, c) => s + c.cells.length, 0);
}

export function getErrors(): ValidationError[] {
  return validate(table);
}

export function getHasErrors(): boolean {
  return getErrors().some((e) => e.type === "error");
}

export function serializeJson(): string {
  const clean = {
    column_width: table.column_width,
    columns: table.columns.map((col) => {
      const out: Record<string, unknown> = {};
      if (col.width && col.width > 0) out.width = col.width;
      out.cells = col.cells;
      return out;
    }),
  };
  return JSON.stringify(clean, null, 2);
}

let saveTimeout: ReturnType<typeof setTimeout> | undefined;

$effect(() => {
  // Access table deeply to track all changes
  const json = JSON.stringify(table);
  void json;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToLocalStorage(table), 500);
});

// --- Column mutations ---

export function addColumn(): void {
  table.columns.push({
    cells: [{ text: "", text_color: "#FFFFFF", bg_color: "#14505C" }],
  });
}

export function removeColumn(colIndex: number): void {
  table.columns.splice(colIndex, 1);
}

export function moveColumn(from: number, to: number): void {
  if (from === to) return;
  const [col] = table.columns.splice(from, 1);
  table.columns.splice(to, 0, col);
}

export function updateColumnWidth(colIndex: number, width: number | undefined): void {
  table.columns[colIndex].width = width;
}

export function updateGlobalWidth(width: number): void {
  table.column_width = width;
}

// --- Cell mutations ---

export function addCell(colIndex: number): void {
  const cells = table.columns[colIndex].cells;
  const lastCell = cells[cells.length - 1];
  const bgColor = lastCell?.bg_color ?? "#14505C";
  table.columns[colIndex].cells.push({
    text: "",
    text_color: autoTextColor(bgColor),
    bg_color: bgColor,
  });
}

export function removeCell(colIndex: number, cellIndex: number): void {
  table.columns[colIndex].cells.splice(cellIndex, 1);
}

export function moveCell(colIndex: number, from: number, to: number): void {
  if (from === to) return;
  const cells = table.columns[colIndex].cells;
  const [cell] = cells.splice(from, 1);
  cells.splice(to, 0, cell);
}

export function moveCellAcross(
  fromCol: number,
  fromCell: number,
  toCol: number,
  toCell: number,
): void {
  const [cell] = table.columns[fromCol].cells.splice(fromCell, 1);
  table.columns[toCol].cells.splice(toCell, 0, cell);
}

export function updateCellText(colIndex: number, cellIndex: number, text: string): void {
  table.columns[colIndex].cells[cellIndex].text = text;
}

export function updateCellBgColor(
  colIndex: number,
  cellIndex: number,
  color: string,
  autoText: boolean = true,
): void {
  table.columns[colIndex].cells[cellIndex].bg_color = color;
  if (autoText) {
    table.columns[colIndex].cells[cellIndex].text_color = autoTextColor(color);
  }
}

export function updateCellTextColor(colIndex: number, cellIndex: number, color: string): void {
  table.columns[colIndex].cells[cellIndex].text_color = color;
}

// --- Import / Export ---

export function importJson(jsonStr: string): {
  ok: boolean;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.columns || !Array.isArray(parsed.columns)) {
      return { ok: false, error: "columns フィールドが見つかりません" };
    }
    table.column_width = parsed.column_width ?? 0.5;
    table.columns = parsed.columns;
    return { ok: true };
  } catch {
    return { ok: false, error: "JSONの形式が不正です" };
  }
}

export function loadTemplate(name: string): void {
  const tmpl = TEMPLATES[name];
  if (!tmpl) return;
  const data = structuredClone(tmpl.data);
  table.column_width = data.column_width;
  table.columns = data.columns;
}

export function resetTable(): void {
  loadTemplate("blank");
}
