// jest.config.js
export default {
    testEnvironment: 'node',
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js}', '!src/**/*.d.ts'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'json-summary'],
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'json', 'node'],
    testMatch: ['**/tests/**/*.test.js'],
    setupFilesAfterEnv: [
      '@testing-library/jest-dom', // Import jest-dom for extended assertions
      'jest-extended', // Import jest-extended for additional matchers
    ],
    moduleNameMapper: {
      '^@src/(.*)': '<rootDir>/src/$1',
      '\\.(css|less|scss|svg)$': 'identity-obj-proxy',
    },
    maxWorkers: '50%',
    globalSetup: '<rootDir>/jest/global-setup.js',
    globalTeardown: '<rootDir>/jest/global-teardown.js',
    testTimeout: 30000,
    silent: false,
    snapshotSerializers: ['<rootDir>/jest/snapshot-serializer.js'],
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  };
  