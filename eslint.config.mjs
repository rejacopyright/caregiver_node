// @ts-check
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      prettier: prettierPlugin,
    },
    rules: {
      'max-lines': ['error', { max: 1000, skipBlankLines: false, skipComments: false }],
      'no-extra-boolean-cast': 'off',
      'no-explicit-any': 'off',
      'prefer-arrow-callback': ['warn', { allowNamedFunctions: false }],
      'no-duplicate-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-empty': 'off',
      'no-debugger': 'warn',
      eqeqeq: 'error',
      'prettier/prettier': 'error',
      'array-callback-return': 'warn',
      'no-unused-vars': 'off',
      'no-empty-function': 'off',
      'no-unsafe-optional-chaining': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['module-alias', '^express$', '^@prisma', '^dotenv'], // 1. Express, Prisma, Dotenv first
            ['^@?\\w'], // 2. Packages (node_modules)
            ['^@/', '^~/'], // 3. Internal alias like @/, ~/
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'], // 4. Parent imports
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'], // 5. Sibling imports
            ['^'], // 6. Anything else (fallback)
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'any', prev: 'export', next: 'export' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        {
          blankLine: 'always',
          prev: '*',
          next: ['function', 'multiline-const', 'multiline-block-like'],
        },
        {
          blankLine: 'always',
          prev: ['function', 'multiline-const', 'multiline-block-like'],
          next: '*',
        },
      ],

      'newline-before-return': 'error',
    },
  },
  { ignores: ['node_modules/**', 'dist/**', 'build/**'] },
])
