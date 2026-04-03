import type { TagTable } from "./types";

const STORAGE_KEY = "tag-table-editor-v1";
const RECENT_COLORS_KEY = "tag-editor-recent-colors";
const MAX_RECENT = 5;

export function saveToLocalStorage(table: TagTable): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(table));
  } catch {
    /* quota exceeded */
  }
}

export function loadFromLocalStorage(): TagTable | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getRecentColors(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addRecentColor(color: string): void {
  try {
    const recent = getRecentColors().filter((c) => c !== color);
    recent.unshift(color);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}
