/* eslint-disable */
import { getModuleNameMapper } from '../jest-esm-resolver.js';

export default {
  displayName: 'integration',
  preset: '../jest.preset.js',
  // Integration has different rootDir, so we need to override with correct path
  moduleNameMapper: getModuleNameMapper('<rootDir>/..'),
  moduleFileExtensions: ['ts', 'js', 'html'],
};
