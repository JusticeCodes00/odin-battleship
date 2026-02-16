import { defineConfig, globalIgnores } from "eslint/config";
import css from "@eslint/css";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";

export default defineConfig([
  globalIgnores(["node_modules/", "package-lock.json", "coverage"]),
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
    rules: {
      camelcase: "warn",
      "capitalized-comments": "warn",
      eqeqeq: ["warn", "smart"],
      "no-alert": "warn",
      "no-console": "warn",
      "no-var": "warn",
      "no-useless-rename": "warn",
      "no-useless-return": "warn",
      "no-warning-comments": "warn",
      "operator-assignment": ["warn", "always"],
      "prefer-const": "warn",
      "sort-imports": "warn",
      yoda: "warn",
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
