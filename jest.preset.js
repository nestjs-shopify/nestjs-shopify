import nxPreset from '@nx/jest/preset.js';
import { getModuleNameMapper } from './jest-esm-resolver.js';

export default {
  ...nxPreset,
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  // NX resolver doesn't work properly with ESM mode, so we need explicit moduleNameMapper
  moduleNameMapper: getModuleNameMapper(),
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
