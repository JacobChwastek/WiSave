import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import eslint from '@eslint/js';
import rxjsPlugin from '@rxlint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundariesPlugin from 'eslint-plugin-boundaries';
import noSecretsPlugin from 'eslint-plugin-no-secrets';
import securityPlugin from 'eslint-plugin-security';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, eslintConfigPrettier],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
      },
    },
    plugins: {
      '@angular-eslint': angularPlugin,
      '@rxlint': rxjsPlugin,
      boundaries: boundariesPlugin,
      'unused-imports': unusedImportsPlugin,
      security: securityPlugin,
      'no-secrets': noSecretsPlugin,
    },
    settings: {
      'import/resolver': {
        './eslint-import-resolver-local-ts.cjs': {
          project: ['./tsconfig.json', './tsconfig.app.json', './tsconfig.spec.json'],
        },
        node: {
          extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.d.ts', '.json'],
        },
      },
      'boundaries/dependency-nodes': ['import', 'dynamic-import', 'export'],
      'boundaries/elements': [
        // App layers
        { type: 'core', pattern: 'src/app/core/**', mode: 'full' },
        { type: 'shared', pattern: 'src/app/shared/**', mode: 'full' },
        { type: 'layout', pattern: 'src/app/layout/**', mode: 'full' },

        // Feature internal layers (order matters - more specific first)
        { type: 'feature-component', pattern: 'src/app/features/*/components/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-container', pattern: 'src/app/features/*/containers/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-view', pattern: 'src/app/features/*/views/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-store', pattern: 'src/app/features/*/+store/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-type', pattern: 'src/app/features/*/types/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-service', pattern: 'src/app/features/*/services/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-helper', pattern: 'src/app/features/*/helpers/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-constant', pattern: 'src/app/features/*/constants/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-graphql', pattern: 'src/app/features/*/graphql/**', mode: 'full', capture: ['feature'] },
        { type: 'feature-route', pattern: 'src/app/features/*/*.routes.ts', mode: 'full', capture: ['feature'] },
        { type: 'feature', pattern: 'src/app/features/*/**', mode: 'full', capture: ['feature'] },

        // Features root routing
        { type: 'features-routing', pattern: 'src/app/features/*.ts', mode: 'full' },

        // App root
        { type: 'app', pattern: 'src/app/*', mode: 'full' },
        { type: 'main', pattern: 'src/main.ts', mode: 'full' },
        { type: 'src-root', pattern: 'src/*.ts', mode: 'full' },
      ],
      'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts'],
    },
    rules: {
      // Boundaries rules
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Core can only import from core
            { from: 'core', allow: ['core'] },

            // Shared can import from core and shared
            { from: 'shared', allow: ['core', 'shared'] },

            // Layout can import from core, shared, and layout
            { from: 'layout', allow: ['core', 'shared', 'layout'] },

            // Feature routes can import same-feature internals and app shared/core
            {
              from: 'feature-route',
              allow: [
                'core',
                'shared',
                ['feature-view', { feature: '${from.feature}' }],
                ['feature-store', { feature: '${from.feature}' }],
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-service', { feature: '${from.feature}' }],
                ['feature-helper', { feature: '${from.feature}' }],
                ['feature-component', { feature: '${from.feature}' }],
                ['feature-container', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
              ],
            },

            // Feature types can import core and same-feature types/constants
            {
              from: 'feature-type',
              allow: [
                'core',
                'shared',
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
              ],
            },

            // Feature services can import same-feature internals and core
            {
              from: 'feature-service',
              allow: [
                'core',
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-service', { feature: '${from.feature}' }],
                ['feature-helper', { feature: '${from.feature}' }],
                ['feature-graphql', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
              ],
            },

            // Feature helpers can import same-feature types/helpers/constants and core
            {
              from: 'feature-helper',
              allow: [
                'core',
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-helper', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
              ],
            },

            // Feature store can import same-feature types/services/helpers/store/constants and core
            {
              from: 'feature-store',
              allow: [
                'core',
                'shared',
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-service', { feature: '${from.feature}' }],
                ['feature-helper', { feature: '${from.feature}' }],
                ['feature-store', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
              ],
            },

            // Feature components (presentational) - NO store access
            {
              from: 'feature-component',
              allow: [
                'core',
                'shared',
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-component', { feature: '${from.feature}' }],
                ['feature-helper', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
              ],
            },

            // Feature containers can import same-feature UI/store/services/types and core/shared
            {
              from: 'feature-container',
              allow: [
                'core',
                'shared',
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-component', { feature: '${from.feature}' }],
                ['feature-container', { feature: '${from.feature}' }],
                ['feature-store', { feature: '${from.feature}' }],
                ['feature-service', { feature: '${from.feature}' }],
                ['feature-helper', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
              ],
            },

            // Feature views can import same-feature internals + shared/core
            {
              from: 'feature-view',
              allow: [
                'core',
                'shared',
                ['feature-view', { feature: '${from.feature}' }],
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-component', { feature: '${from.feature}' }],
                ['feature-container', { feature: '${from.feature}' }],
                ['feature-store', { feature: '${from.feature}' }],
                ['feature-service', { feature: '${from.feature}' }],
                ['feature-helper', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
              ],
            },

            // Feature constants can import core/shared and same-feature constants/types
            {
              from: 'feature-constant',
              allow: [
                'core',
                'shared',
                ['feature-constant', { feature: '${from.feature}' }],
                ['feature-type', { feature: '${from.feature}' }],
              ],
            },

            // Feature GraphQL files can import core and same-feature GraphQL files
            {
              from: 'feature-graphql',
              allow: [
                'core',
                ['feature-graphql', { feature: '${from.feature}' }],
              ],
            },

            // Generic feature (catch-all)
            {
              from: 'feature',
              allow: [
                'core',
                'shared',
                ['feature-type', { feature: '${from.feature}' }],
                ['feature-component', { feature: '${from.feature}' }],
                ['feature-container', { feature: '${from.feature}' }],
                ['feature-store', { feature: '${from.feature}' }],
                ['feature-service', { feature: '${from.feature}' }],
                ['feature-helper', { feature: '${from.feature}' }],
                ['feature-constant', { feature: '${from.feature}' }],
                ['feature-graphql', { feature: '${from.feature}' }],
              ],
            },

            // Features root routing
            { from: 'features-routing', allow: ['feature-route'] },

            // App root files
            { from: 'app', allow: ['core', 'shared', 'layout', 'feature', 'feature-route', 'features-routing', 'app', 'src-root'] },
            { from: 'main', allow: ['app'] },
            { from: 'src-root', allow: ['core', 'shared'] },
          ],
        },
      ],

      // Prevent unknown imports between local files
      'boundaries/no-unknown': 'error',

      // Prevent unknown files outside defined elements
      'boundaries/no-unknown-files': ['error'],

      // RxJS rules
      '@rxlint/no-async-subscribe': 'error',
      '@rxlint/no-ignored-observable': 'warn',
      '@rxlint/no-nested-subscribe': 'error',
      '@rxlint/no-unbound-methods': 'warn',
      '@rxlint/throw-error': 'error',

      // Angular-specific rules
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'warn',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-standalone': 'error',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off', // Using unused-imports plugin instead
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],

      // Enforce # private fields over private keyword
      'no-restricted-syntax': [
        'error',
        {
          selector: "PropertyDefinition[accessibility='private']",
          message: 'Use # private fields instead of the private keyword.',
        },
        {
          selector: "MethodDefinition[accessibility='private']",
          message: 'Use # private methods instead of the private keyword.',
        },
        {
          selector: "TSParameterProperty[accessibility='private']",
          message: 'Use # private fields instead of private constructor parameters.',
        },
        {
          selector:
            "ClassDeclaration:has(Decorator[expression.callee.name='Component']) MethodDefinition[kind='constructor'] > FunctionExpression[params.length>0]",
          message: 'Use inject() instead of constructor injection.',
        },
        {
          selector:
            "ClassDeclaration:has(Decorator[expression.callee.name='Directive']) MethodDefinition[kind='constructor'] > FunctionExpression[params.length>0]",
          message: 'Use inject() instead of constructor injection.',
        },
        {
          selector:
            "ClassDeclaration:has(Decorator[expression.callee.name='Pipe']) MethodDefinition[kind='constructor'] > FunctionExpression[params.length>0]",
          message: 'Use inject() instead of constructor injection.',
        },
        {
          selector:
            "ClassDeclaration:has(Decorator[expression.callee.name='Injectable']) MethodDefinition[kind='constructor'] > FunctionExpression[params.length>0]",
          message: 'Use inject() instead of constructor injection.',
        },
        {
          selector:
            "Property[key.name='changeDetection'][value.type='MemberExpression'][value.object.name='ChangeDetectionStrategy'][value.property.name='OnPush']",
          message: 'Do not use OnPush change detection; app is zoneless.',
        },
      ],

      // Disallow importing ChangeDetectionStrategy (OnPush is not used)
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/core',
              importNames: ['Input', 'Output', 'EventEmitter'],
              message: 'Use signal inputs/outputs (input(), output()) instead of @Input/@Output/EventEmitter.',
            },
            {
              name: '@angular/core',
              importNames: ['ChangeDetectionStrategy'],
              message: 'Do not import ChangeDetectionStrategy; OnPush is not used in this app.',
            },
            {
              name: '@angular/core',
              importNames: ['ChangeDetectorRef', 'NgZone'],
              message: 'Do not import ChangeDetectorRef or NgZone; app is zoneless.',
            },
          ],
        },
      ],

      // Warn on BehaviorSubject usage (prefer Signal Store or signals)
      '@typescript-eslint/no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: 'rxjs',
              importNames: ['BehaviorSubject'],
              message: 'Avoid BehaviorSubject for state; prefer Signal Store or signals.',
            },
          ],
        },
      ],

      // Enforce class member ordering for Angular components
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: [
              // Static
              'static-field',
              'static-method',

              // Decorated fields (@ViewChild, @HostListener, etc.)
              'decorated-field',

              // Injected dependencies (#store = inject(...))
              '#private-instance-field',

              // Signal inputs/outputs, public fields, computed signals
              'public-instance-field',

              // Constructor
              'constructor',

              // Lifecycle hooks + public methods
              'public-instance-method',

              // Private methods
              '#private-instance-method',
            ],
          },
        },
      ],

      // Unused imports (auto-fixable)
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Security rules
      'security/detect-object-injection': 'off', // Too many false positives in frontend code
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',

      // No secrets (detect hardcoded secrets)
      'no-secrets/no-secrets': ['error', { tolerance: 4.5 }],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-secrets/no-secrets': 'off',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-eval-with-expression': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    languageOptions: {
      parser: angularTemplateParser,
    },
    rules: {
      // Template rules from recommended config
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',

      // Accessibility rules
      '@angular-eslint/template/alt-text': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
      '@angular-eslint/template/no-autofocus': 'warn',
      '@angular-eslint/template/no-distracting-elements': 'error',
      '@angular-eslint/template/role-has-required-aria': 'warn',
      '@angular-eslint/template/table-scope': 'warn',
      '@angular-eslint/template/valid-aria': 'warn',
    },
  },
  {
    ignores: ['dist/', '.angular/', 'node_modules/', '.yarn/', '.pnp.*', 'coverage/'],
  },
);
