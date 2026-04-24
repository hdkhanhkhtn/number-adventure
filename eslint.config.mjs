import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // These patterns (hydration flag, reset-on-round, read-from-storage) are
      // legitimate React idioms that this rule flags incorrectly.
      'react-hooks/set-state-in-effect': 'off',
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
    // Prototype JSX source files (not compiled, used for reference only)
    "src/*.jsx",
    "src/*.js",
  ]),
]);

export default eslintConfig;
