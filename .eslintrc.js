const path = require("path");
const tsProject = path.resolve("./tsconfig.json");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:@cspell/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: [".eslintrc.js", "dist", "/node_modules"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
    ecmaVersion: "latest",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "@typescript-eslint"],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    "@typescript-eslint/no-useless-constructor": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unnecessary-type-parameters": "off",
    "prettier/prettier": [
      "error",
      {
        bracketSpacing: true,
        printWidth: 80,
        trailingComma: "es5",
        bracketSameLine: false,
        arrowParens: "always",
        endOfLine: "auto",
        singleQuote: false,
      },
    ],
    "arrow-body-style": ["error", "as-needed"],
    "import/no-unresolved": "off",
    "import/no-duplicates": "error",
    "no-useless-call": "error",
    "no-nested-ternary": "off",
    "no-useless-return": "error",
    "no-console": ["error"],
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-unsafe-assignment": "off", // research on this
    "@typescript-eslint/no-unsafe-call": "off", // research on this
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "all", // Check all arguments
        argsIgnorePattern: "^_", // Ignore variables starting with '_'
        vars: "all", // Check all variables
        varsIgnorePattern: "^_", // Ignore variables starting with '_'
        ignoreRestSiblings: true, // Ignore unused siblings in rest destructuring
      },
    ],
    "import/order": [
      "error",
      {
        groups: [
          "builtin", // Built-in Node.js modules
          "external", // External modules from node_modules
          "internal", // Internal packages
          ["sibling", "parent"], // Parent and sibling modules
          "index", // Index files
          "unknown", // Unknown group
        ],
        pathGroups: [
          {
            pattern: "components/**", // Components
            group: "internal",
            position: "after",
          },
          {
            pattern: "utils/**", // Utils (functions)
            group: "internal",
            position: "after",
          },
          {
            pattern: "const/**", // Constants
            group: "internal",
            position: "after",
          },
          {
            pattern: "redux/**", // Redux files
            group: "internal",
            position: "after",
          },
          {
            pattern: "selectors/**", // Selectors
            group: "internal",
            position: "after",
          },
          {
            pattern: "images/**", // Images
            group: "internal",
            position: "after",
          },
          {
            pattern: "style/**", // Styles
            group: "internal",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin", "external"],
        alphabetize: {
          order: "asc", // Alphabetize within each group
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: tsProject,
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
