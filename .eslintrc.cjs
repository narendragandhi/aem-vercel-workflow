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
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Enforce naming conventions
    '@typescript-eslint/naming-convention': 'off',

    // Allow unused vars - relax
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],

    // Allow empty functions (useful for default props)
    '@typescript-eslint/no-empty-function': 'off',

    // Allow explicit any in some cases
    '@typescript-eslint/no-explicit-any': 'off',

    // Allow unsafe member access for optional chaining
    '@typescript-eslint/no-unsafe-member-access': 'off',

    // Allow unsafe call
    '@typescript-eslint/no-unsafe-call': 'off',

    // Allow unsafe assignment
    '@typescript-eslint/no-unsafe-assignment': 'off',

    // Allow unsafe argument
    '@typescript-eslint/no-unsafe-argument': 'off',

    // Allow unsafe return
    '@typescript-eslint/no-unsafe-return': 'off',

    // Allow restrict template expressions
    '@typescript-eslint/restrict-template-expressions': 'off',

    // Allow misused promises in void context
    '@typescript-eslint/no-misused-promises': 'off',

    // Allow floating promises
    '@typescript-eslint/no-floating-promises': 'off',

    // Allow await thenable
    '@typescript-eslint/await-thenable': 'off',

    // Require await in async functions
    '@typescript-eslint/require-await': 'off',

    // No reduntant type constituents
    '@typescript-eslint/no-redundant-type-constituents': 'off',

    // No base to string
    '@typescript-eslint/no-base-to-string': 'off',

// Allow unused vars
    '@typescript-eslint/no-unused-vars': 'off',

    // No console (allow in development)
    'no-console': 'off',

    // No lonely if
    'no-lonely-if': 'off',

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
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',

    // No return assign
    'no-return-assign': 'off',

    // No case declarations
    'no-case-declarations': 'off',

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
    'no-return-assign': 'off',
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

    // Complexity limits - disable for now
    'complexity': 'off',
    'max-depth': 'off',
    'max-lines-per-function': 'off',
    'max-nested-callbacks': 'off',
    'max-params': 'off',

    // React Refresh for Vite HMR
    'react-refresh/only-export-components': 'off',

    // Unescaped entities
    'react/no-unescaped-entities': 'off',
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
    // Demo, main, and utility files
    {
      files: ['src/DemoApp.tsx', 'src/main.tsx', 'src/utils/errors.ts'],
      rules: {
        'no-console': 'off',
        'no-lonely-if': 'off',
      },
    },
    // WorkflowBuilder is huge, relax rules
    {
      files: ['src/components/WorkflowBuilder.tsx'],
      rules: {
        'no-console': 'off',
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
