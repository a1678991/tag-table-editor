import { z } from "zod";

export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;

export const CellSchema = z.object({
  text: z.string(),
  text_color: z.string().regex(HEX_COLOR_PATTERN),
  bg_color: z.string().regex(HEX_COLOR_PATTERN),
});

export const ColumnSchema = z.object({
  width: z.number().min(0.1).max(2.0).optional(),
  cells: z.array(CellSchema),
});

export const TagTableSchema = z.object({
  column_width: z.number().min(0.1).max(2.0),
  columns: z.array(ColumnSchema),
});

export type Cell = z.infer<typeof CellSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type TagTable = z.infer<typeof TagTableSchema>;

export interface ValidationError {
  type: "error" | "warning";
  path: string;
  message: string;
}
