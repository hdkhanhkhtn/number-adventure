/** @type {import('jest').Config} */
const sharedConfig = {
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  modulePathIgnorePatterns: ['/.next/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

const config = {
  projects: [
    {
      displayName: 'api',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/api/**/*.test.ts'],
      ...sharedConfig,
    },
    {
      displayName: 'components',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/components/**/*.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      ...sharedConfig,
    },
    {
      displayName: 'game-engine',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/game-engine/**/*.test.ts'],
      ...sharedConfig,
    },
    {
      displayName: 'pwa',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/pwa/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      ...sharedConfig,
    },
  ],
  collectCoverageFrom: [
    'lib/game-engine/**/*.ts',
    'app/api/sessions/route.ts',
    'app/api/sessions/[id]/attempts/route.ts',
    'app/api/streaks/[childId]/route.ts',
    '!lib/game-engine/types.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};

module.exports = config;
