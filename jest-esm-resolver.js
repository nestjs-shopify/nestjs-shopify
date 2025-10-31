import { pathsToModuleNameMapper } from 'ts-jest';
import tsconfig from './tsconfig.base.json' with { type: 'json' };

// Extract the paths from tsconfig
const paths = tsconfig.compilerOptions?.paths || {};

export function getModuleNameMapper(rootDir = '<rootDir>/../..') {
  const mapper = pathsToModuleNameMapper(paths, { prefix: rootDir });

  // Add the .js extension mapper
  mapper['^(\\.{1,2}/.*)\\.js$'] = '$1';

  return mapper;
}
