import type { Config } from 'jest';
import * as path from 'path';

const ignorePath = (...p: string[]) => {
  return p.map((val) => path.resolve(__dirname, '..', val));
};

export default async (): Promise<Config> => {
  const rootDir = path.resolve(__dirname, '../src');

  const filesToIgnore = ignorePath('./dist', './node_modules');

  return {
    modulePathIgnorePatterns: filesToIgnore,
    collectCoverage: true,
    collectCoverageFrom: ['**/**.(t|j)s'],
    transform: {
      '^.+\\.ts?$': [
        'ts-jest',
        {
          tsconfig: {
            allowJs: true,
            experimentalDecorators: true,
          },
        },
      ],
    },
    rootDir: rootDir,
  };
};
