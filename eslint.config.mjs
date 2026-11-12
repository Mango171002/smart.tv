import next from 'eslint-config-next';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...next,
  ...nextTs,
  {
    // `_`-prefixed names are intentionally unused (e.g. the locale param kept for an English-only site).
    rules: { '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }] },
  },
  { ignores: ['.next/**', '.open-next/**', '.wrangler/**', '.cache/**', 'node_modules/**', 'prototype/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts'] },
];
export default config;
