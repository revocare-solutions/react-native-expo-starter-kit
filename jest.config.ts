import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  setupFiles: ['./test/jest-globals.ts'],
  setupFilesAfterEnv: ['./test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': ['<rootDir>/packages/shared/src/$1'],
    '^@app/(.*)$': ['<rootDir>/apps/client/src/$1'],
    '^@assets/(.*)$': ['<rootDir>/apps/client/assets/$1'],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  roots: ['<rootDir>/packages/shared', '<rootDir>/apps/client', '<rootDir>/setup'],
  collectCoverageFrom: [
    'packages/shared/src/**/*.{ts,tsx}',
    '!packages/shared/src/**/*.d.ts',
    '!packages/shared/src/types/**',
    '!packages/shared/src/services/**',
  ],
};

export default config;
