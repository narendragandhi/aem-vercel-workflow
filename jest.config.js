/**
 * Jest Configuration for AEMFlow
 *
 * This configuration sets up Jest for testing React components and utilities.
 * It includes support for TypeScript, CSS modules, and React Testing Library.
 *
 * @see https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  // Use jsdom for browser-like environment
  testEnvironment: 'jsdom',

  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Module name mapper for handling imports
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',

    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform TypeScript and JSX files
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.spec.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.spec.{ts,tsx}',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/e2e/',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,
};

module.exports = config;
