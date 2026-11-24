import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const reactPlugins = {
  react,
  "react-hooks": reactHooks,
  "react-refresh": reactRefresh,
};

const reactRules = {
  ...reactHooks.configs.recommended.rules,
  "react/jsx-uses-react": "error",
  "react/jsx-uses-vars": "error",
  "react-refresh/only-export-components": [
    "warn",
    { allowConstantExport: true },
  ],
};

export default [
  { ignores: ["dist"] },
  // JavaScript files (kept while the codebase moves to TypeScript)
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: reactPlugins,
    rules: {
      ...js.configs.recommended.rules,
      ...reactRules,
    },
  },
  // TypeScript files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx}"],
  })),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: reactPlugins,
    rules: reactRules,
  },
];
