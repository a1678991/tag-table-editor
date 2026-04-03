import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";
import oxlint from "eslint-plugin-oxlint";
import svelteConfig from "./svelte.config.js";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["*.config.js", "*.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  {
    ignores: ["build/", ".svelte-kit/"],
  },
  // Must be last: disables ESLint rules already covered by oxlint
  ...oxlint.configs["flat/recommended"],
);
