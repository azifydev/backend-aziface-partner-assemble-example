// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Plugin customizado para definir regras inexistentes
const byPassLintingRules = {
  rules: {
    'no-identical-functions': {
      create() {
        return {};
      },
    },
    'cognitive-complexity': {
      create() {
        return {};
      },
    },
    'no-duplicate-string': {
      create() {
        return {};
      },
    },
    'detect-object-injection': {
      create() {
        return {};
      },
    },
    'custom-error-definition': {
      create() {
        return {};
      },
    },
  },
};

export default tseslint.config(
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  {
    ignores: [
      'eslint.config.mjs',
      './generated',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/__tests__/**/*.ts',
      '**/test/**/*.ts',
      '**/e2e/**/*.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    plugins: {
      security: byPassLintingRules,
      unicorn: byPassLintingRules,
      sonarjs: byPassLintingRules,
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'security/detect-object-injection': 'off',
      'unicorn/custom-error-definition': 'off',
      'no-prototype-builtins': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },
  eslintPluginPrettierRecommended,
);
