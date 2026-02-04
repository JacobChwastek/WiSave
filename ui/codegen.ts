import type { CodegenConfig } from '@graphql-codegen/cli';

const eslintDisableHeader = '/* eslint-disable */';

const config: CodegenConfig = {
  schema: '../schema.graphql',
  generates: {
    // Generate base schema types in core
    'src/app/core/api/graphql/generated/schema.types.ts': {
      plugins: [{ add: { content: eslintDisableHeader } }, 'typescript'],
      config: {
        enumsAsTypes: true,
        scalars: {
          DateTime: 'string',
          Decimal: 'number',
        },
      },
    },
    // Generate operation types near the .graphql files
    'src/app/features/': {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: '~@graphql/generated/schema.types',
      },
      documents: 'src/app/features/**/graphql/*.graphql',
      plugins: [{ add: { content: eslintDisableHeader } }, 'typescript-operations', 'typescript-apollo-angular'],
      config: {
        addExplicitOverride: true,
        scalars: {
          DateTime: 'string',
          Decimal: 'number',
        },
      },
    },
  },
};

export default config;
