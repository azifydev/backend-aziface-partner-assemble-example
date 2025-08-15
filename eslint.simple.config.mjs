// @ts-check
import tseslint from 'typescript-eslint';

export default tseslint.config({
  ignores: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/__tests__/**/*.ts',
    '**/test/**/*.ts',
    '**/e2e/**/*.ts',
  ],
});
