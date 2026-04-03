import type { TagTable } from "./types";
import softwareArchitecture from "./assets/software-architecture.json";

export interface Template {
  name: string;
  data: TagTable;
}

export const TEMPLATES: Record<string, Template> = {
  blank: {
    name: "空のテーブル",
    data: {
      column_width: 0.5,
      columns: [
        {
          cells: [{ text: "", text_color: "#FFFFFF", bg_color: "#14505C" }],
        },
      ],
    },
  },
  softwareArchitecture: {
    name: "ソフトウェアアーキテクチャ",
    data: softwareArchitecture as TagTable,
  },
};
