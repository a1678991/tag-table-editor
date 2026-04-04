import type { TagTable, ValidationError } from "./types";
import { isValidColor } from "./color-utils";

export function validate(table: TagTable): ValidationError[] {
  const errors: ValidationError[] = [];

  const total = table.columns.reduce((s, c) => s + c.cells.length, 0);
  if (total > 64) {
    errors.push({
      type: "error",
      path: "",
      message: `タグ数が上限を超えています (${total}/64)`,
    });
  } else if (total > 56) {
    errors.push({
      type: "warning",
      path: "",
      message: `タグ数が上限に近づいています (${total}/64)`,
    });
  }

  for (let ci = 0; ci < table.columns.length; ci++) {
    const col = table.columns[ci];
    for (let ri = 0; ri < col.cells.length; ri++) {
      const cell = col.cells[ri];
      const cellPath = `columns[${ci}].cells[${ri}]`;

      if (!cell.text.trim()) {
        errors.push({
          type: "warning",
          path: cellPath,
          message: "テキストが空です",
        });
      }
      if (!isValidColor(cell.bg_color)) {
        errors.push({
          type: "error",
          path: `${cellPath}.bg_color`,
          message: "背景色の形式が不正です",
        });
      }
      if (!isValidColor(cell.text_color)) {
        errors.push({
          type: "error",
          path: `${cellPath}.text_color`,
          message: "文字色の形式が不正です",
        });
      }
    }
  }

  return errors;
}
