import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/** Next 16: eslint-config-next is native flat config — FlatCompat no longer needed. */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      'src/payload-types.ts',
      'src/payload/migrations/*.ts',
      '.next/**',
      'node_modules/**',
      '.migrate-bundle/**',
      '.payload-bundle/**',
      'next-env.d.ts',
      'scripts/**',
    ],
  },
];

export default eslintConfig;
