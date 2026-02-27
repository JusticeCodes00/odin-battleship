import { defineConfig, globalIgnores } from "eslint/config";
import css from "@eslint/css";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";

export default defineConfig([
  globalIgnores([
    "node_modules/",
    "package-lock.json",
    "coverage",
    "src/__tests__/",
  ]),
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
    rules: {
      camelcase: "error",
      "capitalized-comments": "error",
      eqeqeq: ["error", "smart"],
      "no-alert": "error",
      "no-console": "error",
      "no-var": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-warning-comments": "error",
      "operator-assignment": ["error", "always"],
      "prefer-const": "error",
      "sort-imports": "error",
      yoda: "error",
    },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/commonmark",
    extends: ["markdown/recommended"],
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
    rules: {
      "css/no-empty-blocks": "warn",
    },
  },
  eslintConfigPrettier,
]);
