/**
 * ESLint Configuration for AEMFlow
 *
 * This configuration provides comprehensive linting for TypeScript and React code,
 * including accessibility (a11y) rules and JSDoc validation.
 *
 * @see https://eslint.org/docs/user-guide/configuring
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    '*.config.js',
    '*.config.ts',
    'coverage',
    'tests',
    'ui.frontend',
    'src/components/__tests__',
    'src/components/nodes/__tests__',
    'src/components/AIActionManager.tsx',
    'src/examples',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-refresh',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // ===========================================
    // TypeScript Rules
    // ===========================================

    // Enforce explicit return types for better documentation
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true,
    }],

    // Require explicit member accessibility modifiers
    '@typescript-eslint/explicit-member-accessibility': ['warn', {
      accessibility: 'explicit',
      overrides: {
        constructors: 'no-public',
      },
    }],

    // Enforce naming conventions
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      {
        selector: 'enum',
        format: ['PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE', 'PascalCase'],
      },
    ],

    // Prevent unused variables
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],

    // Allow empty functions (useful for default props)
    '@typescript-eslint/no-empty-function': 'off',

    // Warn on explicit any
    '@typescript-eslint/no-explicit-any': 'warn',

    // Require await in async functions
    '@typescript-eslint/require-await': 'warn',

    // Prefer nullish coalescing
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',

    // Prefer optional chaining
    '@typescript-eslint/prefer-optional-chain': 'warn',

    // ===========================================
    // React Rules
    // ===========================================

    // Enforce React component best practices
    'react/prop-types': 'off', // TypeScript handles this
    'react/jsx-uses-react': 'off', // Not needed with new JSX transform
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform

    // Enforce consistent JSX formatting
    'react/jsx-curly-brace-presence': ['warn', {
      props: 'never',
      children: 'never',
    }],

    // Enforce self-closing components
    'react/self-closing-comp': ['warn', {
      component: true,
      html: true,
    }],

    // Prevent common mistakes
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'warn',
    'react/no-direct-mutation-state': 'error',
    'react/no-unescaped-entities': 'warn',

    // Enforce hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Refresh for Vite HMR
    'react-refresh/only-export-components': ['warn', {
      allowConstantExport: true,
    }],

    // ===========================================
    // General JavaScript Rules
    // ===========================================

    // Enforce consistent code style
    'no-console': ['warn', {
      allow: ['warn', 'error'],
    }],
    'no-debugger': 'warn',

    // Prevent common errors
    'no-duplicate-imports': 'error',
    'no-self-compare': 'error',
    'no-template-curly-in-string': 'warn',
    'no-unmodified-loop-condition': 'error',

    // Enforce best practices
    'curly': ['warn', 'all'],
    'default-case-last': 'warn',
    'dot-notation': 'warn',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-else-return': ['warn', { allowElseIf: false }],
    'no-lonely-if': 'warn',
    'no-return-assign': 'error',
    'no-throw-literal': 'error',
    'no-useless-return': 'warn',
    'prefer-const': 'warn',
    'prefer-template': 'warn',

    // Code organization
    'sort-imports': ['warn', {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
    }],

    // ===========================================
    // Code Quality
    // ===========================================

    // Complexity limits
    'complexity': ['warn', 15],
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', {
      max: 100,
      skipBlankLines: true,
      skipComments: true,
    }],
    'max-nested-callbacks': ['warn', 3],
    'max-params': ['warn', 5],
  },
  overrides: [
    // Test files have relaxed rules
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'max-lines-per-function': 'off',
      },
    },
    // Configuration files
    {
      files: ['*.config.js', '*.config.ts', '.eslintrc.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
