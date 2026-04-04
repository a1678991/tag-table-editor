import { z } from "zod";
import { TagTableSchema } from "../src/lib/types";

const jsonSchema = z.toJSONSchema(TagTableSchema) as Record<string, unknown>;

jsonSchema.$id = "https://a1678991.github.io/tag-table-editor/tag-table.schema.json";
jsonSchema.title = "TagTable";
jsonSchema.description =
  "Tag table definition for VRChat YodoTagBuilder. Max 64 cells total across all columns.";

console.log(JSON.stringify(jsonSchema, null, 2));
