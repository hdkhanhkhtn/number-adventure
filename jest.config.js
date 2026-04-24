/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  // Exclude build artifacts and Next.js output to avoid Haste module collisions
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  modulePathIgnorePatterns: ['/.next/'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.tsx',
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
        // Skip full type-checking during test runs for speed
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/game-engine/**/*.ts',
    'app/api/sessions/route.ts',
    'app/api/sessions/[id]/attempts/route.ts',
    'app/api/streaks/[childId]/route.ts',
    '!lib/game-engine/types.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    // Threshold applies only to the files listed in collectCoverageFrom above
    global: {
      lines: 80,
      functions: 80,
    },
  },
};

module.exports = config;
