import type { TagTable, ValidationError } from "./types";
import { autoTextColor } from "./color-utils";
import { validate } from "./validation";
import { loadAllSets, saveAllSets, type StoredData } from "./persistence";
import { TEMPLATES } from "./templates";
import { generateName } from "./random-name";

function defaultData(): StoredData {
  const name = generateName();
  return {
    sets: { [name]: structuredClone(TEMPLATES.softwareArchitecture.data) },
    activeSet: name,
  };
}

function initData(): StoredData {
  return loadAllSets() ?? defaultData();
}

const initialData = initData();
const data: StoredData = $state(initialData);
const setOrder: string[] = $state(Object.keys(initialData.sets));

// --- Undo / Redo ---

const MAX_HISTORY = 100;
const undoStack: string[] = [];
const redoStack: string[] = [];
let lastSnapshotTime = 0;
let historyVersion = $state(0);

function orderedData(): StoredData {
  const orderedSets: Record<string, TagTable> = {};
  for (const name of setOrder) {
    orderedSets[name] = data.sets[name];
  }
  return { sets: orderedSets, activeSet: data.activeSet };
}

function snapshot(): void {
  const json = JSON.stringify(orderedData());
  undoStack.push(json);
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
  lastSnapshotTime = Date.now();
  historyVersion++;
}

function snapshotCoalesced(): void {
  if (Date.now() - lastSnapshotTime > 500) {
    snapshot();
  }
}

function restoreFromJson(json: string): void {
  const restored: StoredData = JSON.parse(json);
  data.activeSet = restored.activeSet;
  for (const key of Object.keys(data.sets)) {
    delete data.sets[key];
  }
  for (const [key, value] of Object.entries(restored.sets)) {
    data.sets[key] = value;
  }
  setOrder.length = 0;
  setOrder.push(...Object.keys(restored.sets));
}

export function undo(): void {
  if (undoStack.length === 0) return;
  redoStack.push(JSON.stringify(orderedData()));
  restoreFromJson(undoStack.pop()!);
  historyVersion++;
}

export function redo(): void {
  if (redoStack.length === 0) return;
  undoStack.push(JSON.stringify(orderedData()));
  restoreFromJson(redoStack.pop()!);
  historyVersion++;
}

export function canUndo(): boolean {
  void historyVersion;
  return undoStack.length > 0;
}

export function canRedo(): boolean {
  void historyVersion;
  return redoStack.length > 0;
}

// --- Active set ---

export function getActiveSetName(): string {
  return data.activeSet;
}

export function getSetNames(): string[] {
  return setOrder;
}

export function getTable(): TagTable {
  return data.sets[data.activeSet];
}

export function switchSet(name: string): void {
  if (name in data.sets) {
    snapshot();
    data.activeSet = name;
  }
}

export function createSet(fromTemplate?: string): string {
  snapshot();
  const name = generateName();
  if (fromTemplate && fromTemplate in TEMPLATES) {
    data.sets[name] = structuredClone(TEMPLATES[fromTemplate].data);
  } else {
    data.sets[name] = structuredClone(TEMPLATES.blank.data);
  }
  setOrder.push(name);
  data.activeSet = name;
  return name;
}

export function deleteSet(name: string): void {
  if (setOrder.length <= 1) return;
  snapshot();
  delete data.sets[name];
  setOrder.splice(setOrder.indexOf(name), 1);
  if (data.activeSet === name) {
    data.activeSet = setOrder[0];
  }
}

export function renameSet(oldName: string, newName: string): boolean {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return false;
  if (trimmed in data.sets) return false;
  snapshot();
  data.sets[trimmed] = data.sets[oldName];
  delete data.sets[oldName];
  setOrder[setOrder.indexOf(oldName)] = trimmed;
  if (data.activeSet === oldName) {
    data.activeSet = trimmed;
  }
  return true;
}

export function duplicateSet(name: string): string {
  snapshot();
  const newName = generateName();
  data.sets[newName] = $state.snapshot(data.sets[name]) as TagTable;
  setOrder.push(newName);
  data.activeSet = newName;
  return newName;
}

export function moveSet(from: number, to: number): void {
  if (from === to) return;
  snapshot();
  const [moved] = setOrder.splice(from, 1);
  setOrder.splice(to, 0, moved);
}

// --- Derived ---

export function getTotalTags(): number {
  return getTable().columns.reduce((s, c) => s + c.cells.length, 0);
}

export function getErrors(): ValidationError[] {
  return validate(getTable());
}

export function getHasErrors(): boolean {
  return getErrors().some((e) => e.type === "error");
}

export function serializeJson(): string {
  const t = getTable();
  const clean = {
    column_width: t.column_width,
    columns: t.columns.map((col) => {
      const out: Record<string, unknown> = {};
      if (col.width && col.width > 0) out.width = col.width;
      out.cells = col.cells;
      return out;
    }),
  };
  return JSON.stringify(clean, null, 2);
}

// --- Auto-save ---

let saveTimeout: ReturnType<typeof setTimeout> | undefined;

$effect.root(() => {
  $effect(() => {
    void JSON.stringify(data);
    void setOrder.length;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveAllSets(orderedData()), 500);
  });
});

// --- Column mutations ---

export function addColumn(): void {
  snapshot();
  const columns = getTable().columns;
  const leftCol = columns[columns.length - 1];
  const refCell = leftCol?.cells[0];
  const bgColor = refCell?.bg_color ?? "#14505C";
  getTable().columns.push({
    cells: [
      { text: "", text_color: refCell?.text_color ?? autoTextColor(bgColor), bg_color: bgColor },
    ],
  });
}

export function removeColumn(colIndex: number): void {
  snapshot();
  getTable().columns.splice(colIndex, 1);
}

export function moveColumn(from: number, to: number): void {
  if (from === to) return;
  snapshot();
  const [col] = getTable().columns.splice(from, 1);
  getTable().columns.splice(to, 0, col);
}

export function updateColumnWidth(colIndex: number, width: number | undefined): void {
  snapshotCoalesced();
  getTable().columns[colIndex].width = width;
}

// --- Cell mutations ---

export function addCell(colIndex: number): void {
  snapshot();
  const cells = getTable().columns[colIndex].cells;
  const lastCell = cells[cells.length - 1];
  const bgColor = lastCell?.bg_color ?? "#14505C";
  getTable().columns[colIndex].cells.push({
    text: "",
    text_color: lastCell?.text_color ?? autoTextColor(bgColor),
    bg_color: bgColor,
  });
}

export function removeCell(colIndex: number, cellIndex: number): void {
  snapshot();
  getTable().columns[colIndex].cells.splice(cellIndex, 1);
}

export function moveCell(colIndex: number, from: number, to: number): void {
  if (from === to) return;
  snapshot();
  const cells = getTable().columns[colIndex].cells;
  const [cell] = cells.splice(from, 1);
  cells.splice(to, 0, cell);
}

export function moveCellAcross(
  fromCol: number,
  fromCell: number,
  toCol: number,
  toCell: number,
): void {
  snapshot();
  const [cell] = getTable().columns[fromCol].cells.splice(fromCell, 1);
  getTable().columns[toCol].cells.splice(toCell, 0, cell);
}

export function updateCellText(colIndex: number, cellIndex: number, text: string): void {
  snapshotCoalesced();
  getTable().columns[colIndex].cells[cellIndex].text = text;
}

export function updateCellBgColor(
  colIndex: number,
  cellIndex: number,
  color: string,
  autoText: boolean = true,
): void {
  snapshotCoalesced();
  getTable().columns[colIndex].cells[cellIndex].bg_color = color;
  if (autoText) {
    getTable().columns[colIndex].cells[cellIndex].text_color = autoTextColor(color);
  }
}

export function updateCellTextColor(colIndex: number, cellIndex: number, color: string): void {
  snapshotCoalesced();
  getTable().columns[colIndex].cells[cellIndex].text_color = color;
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
    snapshot();
    getTable().column_width = parsed.column_width ?? 0.5;
    getTable().columns = parsed.columns;
    return { ok: true };
  } catch {
    return { ok: false, error: "JSONの形式が不正です" };
  }
}

export function loadTemplate(name: string): void {
  const tmpl = TEMPLATES[name];
  if (!tmpl) return;
  snapshot();
  const cloned = structuredClone(tmpl.data);
  getTable().column_width = cloned.column_width;
  getTable().columns = cloned.columns;
}

export function resetTable(): void {
  loadTemplate("blank");
}

// --- Cell focus request (for keyboard navigation) ---

interface FocusRequest {
  colIndex: number;
  cellIndex: number;
  token: number;
}

let focusRequest: FocusRequest | null = $state(null);
let focusToken = 0;

export function requestCellFocus(colIndex: number, cellIndex: number): void {
  focusToken++;
  focusRequest = { colIndex, cellIndex, token: focusToken };
}

export function getFocusRequest(): FocusRequest | null {
  return focusRequest;
}

export function clearFocusRequest(): void {
  focusRequest = null;
}
