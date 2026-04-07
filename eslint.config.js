import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
  {
    plugins: { prettier: prettierPlugin },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'warn',

      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE', 'PascalCase'] },
        { selector: 'property', format: null },
        { selector: 'import', format: null },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
      ],

      // Cyclomatic complexity
      complexity: ['warn', { max: 15 }],

      // Large file detection
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],

      // Tech debt tracking — flag TODO/FIXME so they are visible
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme', 'hack'], location: 'start' }],

      // Dead code helpers
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unreachable': 'error',

      // Existing code uses `as const` objects instead of enums
      '@typescript-eslint/no-extraneous-class': 'off',

      // Allow destructuring with unused vars for property omission pattern
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  // Relaxed rules for test files
  {
    files: ['src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.wrangler/**',
      'scripts/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
)
