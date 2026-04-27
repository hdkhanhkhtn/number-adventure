import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Legitimate idioms that these rules flag incorrectly:
      // - set-state-in-effect: hydration flag, reset-on-round, read-from-storage
      // - purity: Math.random() inside useMemo is intentional (generate once, memoize)
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
    },
  },
  {
    // Test files use `any` for mocks and forwardRef wrappers — these rules are too strict here
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/display-name': 'off',
    },
  },
  {
    // Jest setup and config are CommonJS — require() is intentional
    files: ['jest.setup.js', 'jest.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // External tooling — not project source
    ".claude/**",
    "handoff/**",
    "plans/**",
    // Auto-generated coverage reports
    "coverage/**",
    // Prototype JSX source files (not compiled, used for reference only)
    "src/*.jsx",
    "src/*.js",
  ]),
]);

export default eslintConfig;
