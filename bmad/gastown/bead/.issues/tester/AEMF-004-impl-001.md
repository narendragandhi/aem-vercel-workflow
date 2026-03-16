---
id: AEMF-004-impl-001
workflow_id: AEMF-004
type: implementation
agent: tester
status: pending
priority: critical
depends_on: [AEMF-004-spec-001, AEMF-001-impl-001]
blocks: [AEMF-004-test-001, AEMF-004-review-001]
---

# CI Pipeline Implementation

## Reference
- Specification: bmad/gastown/bead/.issues/docs/AEMF-004-spec-001.md
- Blocked by: AEMF-001 (Project Infrastructure Setup must complete first)

## Implementation Details

### Step 1: Create GitHub Actions Directory

```bash
mkdir -p .github/workflows
```

### Step 2: Create CI Workflow

**File: `.github/workflows/ci.yml`**

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript type check
        run: npm run type-check

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage
        env:
          CI: true

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.xml
          flags: unittests

  e2e:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload Playwright reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Step 3: Create Release Workflow

**File: `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  publish:
    name: Publish to npm
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Step 4: Create Dependency Review

**File: `.github/workflows/dependency-review.yml`**

```yaml
name: 'Dependency Review'

on: [pull_request]

jobs:
  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v4

      - name: 'Dependency Review'
        uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: moderate
```

### Step 5: Create Test Configuration

**Update `jest.config.js` for CI:**
```javascript
module.exports = {
  // ... existing config
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'cobertura'],
  coverageDirectory: 'coverage',
};
```

**Create `playwright.config.ts` for CI:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
  ],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### Step 6: Add Badge to README

```markdown
[![CI](https://github.com/your-org/aemflow/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/aemflow/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/your-org/aemflow/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/aemflow)
```

## Files to Create

- `.github/workflows/ci.yml` - Main CI pipeline
- `.github/workflows/release.yml` - Release workflow
- `.github/workflows/dependency-review.yml` - Security scanning

## Files to Modify

- `jest.config.js` - Add coverage reporters
- `playwright.config.ts` - Configure CI settings
- `README.md` - Add CI badges

## Quality Gates

- [ ] All workflows pass on main branch
- [ ] Lint errors block merge
- [ ] Type errors block merge
- [ ] Test failures block merge
- [ ] Coverage meets threshold (60%)
- [ ] E2E tests pass
- [ ] No dependency vulnerabilities

## Next Steps

- Add deployment to staging environment
- Add Slack/Teams notifications
- Add branch protection rules
- Configure required status checks
