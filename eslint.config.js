// eslint.config.js
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node // For Node.js environment (Express)
      },
      parserOptions: {
        project: './tsconfig.json', // Point to your tsconfig.json for TypeScript parsing
        ecmaVersion: 'latest', // Use the latest ECMAScript version
        sourceType: 'module' // Enable ES modules
      }
    },
    files: ['**/*.js', '**/*.ts'], // Apply rules to both JS and TS files
    ignores: ['node_modules/', 'dist/'] // Ignore common build and dependency directories
  },
  pluginJs.configs.recommended, // Recommended JavaScript rules
  ...tseslint.configs.recommended, // Recommended TypeScript rules
  {
    files: ['**/*.js', '**/*.ts']
  },
  prettierRecommended
];
