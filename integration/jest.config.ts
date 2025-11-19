/* eslint-disable */
export default {
  displayName: 'integration',
  preset: '../jest.preset.js',
  setupFiles: ['<rootDir>/jest-setup.js'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!jose)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
};
