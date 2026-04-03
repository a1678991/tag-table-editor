export interface Cell {
  text: string;
  text_color: string;
  bg_color: string;
}

export interface Column {
  width?: number;
  cells: Cell[];
}

export interface TagTable {
  column_width: number;
  columns: Column[];
}

export interface ValidationError {
  type: "error" | "warning";
  path: string;
  message: string;
}
