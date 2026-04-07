import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/index.ts'],
  project: ['src/**/*.ts'],
  ignore: ['src/**/*.test.ts'],
  ignoreBinaries: ['tsc'],
}

export default config
