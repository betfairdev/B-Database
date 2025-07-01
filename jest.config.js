export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapping: {
    '^@metadata-platform/core$': '<rootDir>/packages/core/src',
    '^@metadata-platform/sync-server$': '<rootDir>/packages/sync-server/src',
    '^@metadata-platform/auth-service$': '<rootDir>/packages/auth-service/src',
    '^@metadata-platform/local-app$': '<rootDir>/packages/local-app/src',
  },
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.test.ts',
    '!packages/*/src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};