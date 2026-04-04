import { z } from "zod";
import { TagTableSchema } from "./types";

const STORAGE_KEY = "tag-table-editor-v2";
const RECENT_COLORS_KEY = "tag-editor-recent-colors";
const MAX_RECENT = 5;

const StoredDataSchema = z.object({
  sets: z.record(z.string(), TagTableSchema),
  activeSet: z.string(),
});

export type StoredData = z.infer<typeof StoredDataSchema>;

export function saveAllSets(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded */
  }
}

export function loadAllSets(): StoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateV1();
    const result = StoredDataSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Migrate from v1 single-table format */
function migrateV1(): StoredData | null {
  try {
    const raw = localStorage.getItem("tag-table-editor-v1");
    if (!raw) return null;
    const result = TagTableSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    const data: StoredData = {
      sets: { "migrated-table": result.data },
      activeSet: "migrated-table",
    };
    saveAllSets(data);
    localStorage.removeItem("tag-table-editor-v1");
    return data;
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
