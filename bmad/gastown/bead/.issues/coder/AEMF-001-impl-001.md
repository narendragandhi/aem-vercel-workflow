---
id: AEMF-001-impl-001
workflow_id: AEMF-001
type: implementation
agent: coder
status: in_progress
priority: critical
depends_on: [AEMF-001-spec-001]
blocks: [AEMF-001-test-001, AEMF-001-review-001]
---

# Project Infrastructure Implementation

## Reference
- Specification: bmad/gastown/bead/.issues/docs/AEMF-001-spec-001.md

## Implementation Details

### 1. Monorepo Restructure

**Step 1: Create workspace structure**

```bash
mkdir -p apps/web apps/aem packages/shared packages/config packages/ui
```

**Step 2: Update root package.json**

```json
{
  "name": "aemflow",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

**Step 3: Move existing code**

```
src/ -> apps/web/src/
core/ -> apps/aem/
```

### 2. Turbo Configuration

**Create turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

### 3. Conventional Commits Setup

**Step 1: Install dependencies**

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional commitizen cz-conventional-changelog
```

**Step 2: Create commitlint.config.js**

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', 'lower-case']
  }
};
```

**Step 3: Configure package.json for commitizen**

```json
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog",
      "messageFormat": "short"
    }
  }
}
```

**Step 4: Add prepare script**

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

**Step 5: Create husky commit-msg hook**

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

### 4. Semantic Release Setup

**Step 1: Install dependencies**

```bash
npm install --save-dev semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github
```

**Step 2: Create .releaserc.json**

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git"
  ]
}
```

### 5. GitHub Actions Configuration

**Create .github/workflows/pr.yml:**

```yaml
name: Pull Request

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
```

**Create .github/workflows/release.yml:**

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 6. Docker Configuration

**Create docker/docker-compose.yml:**

```yaml
version: '3.8'

services:
  aem-author:
    image: adobe/aem-author:2024.1
    ports:
      - "4502:8080"
    environment:
      - AEM_PORT=8080
      - AEM_ADMIN_USERNAME=admin
      - AEM_ADMIN_PASSWORD=admin
    volumes:
      - aem-data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/libs/granite/security/currentuser.json"]
      interval: 30s
      timeout: 10s
      retries: 3

  mock-server:
    build:
      context: ./mock-server
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    volumes:
      - ./mock-server/config:/app/config

volumes:
  aem-data:
```

**Create docker/mock-server/Dockerfile:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Files to Create/Modify

### New Files
- `apps/web/package.json` (moves from root)
- `apps/aem/pom.xml` (moves from root)
- `packages/shared/package.json`
- `packages/config/package.json`
- `packages/ui/package.json`
- `turbo.json`
- `commitlint.config.js`
- `.releaserc.json`
- `.github/workflows/pr.yml`
- `.github/workflows/release.yml`
- `docker/docker-compose.yml`
- `docker/mock-server/Dockerfile`
- `docker/mock-server/package.json`

### Modified Files
- `package.json` (update with workspaces)
- `.gitignore` (add turbo cache, node_modules)

## Quality Gates

- [ ] Monorepo builds successfully: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Type check passes: `npm run type-check`
- [ ] Tests pass: `npm test`
- [ ] Docker compose starts: `docker compose up -d`

## Next Steps

- Move existing code to new structure
- Update CLAUDE.md with new workspace commands
- Document setup process in README