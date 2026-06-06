import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
    globalIgnores(['dist', 'build', 'node_modules', 'coverage', 'eslint.config.js', 'jest.config.mjs']),

    js.configs.recommended,

    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    {
        files: ['**/*.ts'],

        plugins: {
            'simple-import-sort': simpleImportSort,
            import: importPlugin,
        },

        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.node,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },

        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',

            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            'no-console': 'off',
            'prefer-const': 'error',
            eqeqeq: ['error', 'always'],
        },
    },

    eslintConfigPrettier,
]);
