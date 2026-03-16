---
id: AEMF-001-spec-001
workflow_id: AEMF-001
type: specification
agent: docs
status: in_progress
priority: critical
depends_on: []
blocks: [AEMF-001-impl-001]
---

# Project Infrastructure Setup

## Overview

Set up the foundational project infrastructure for AEMFlow to enable scalable development, proper build orchestration, automated releases, and local AEM development environment.

## Context

AEMFlow is a React/TypeScript visual workflow builder that integrates with Adobe Experience Manager. The project needs a robust infrastructure that:
- Separates frontend (React/Vite) from backend (Java/AEM) concerns
- Enables parallel development and efficient builds
- Provides automated versioning and releases
- Supports CI/CD with GitHub Actions
- Offers Docker-based local AEM development

## Functional Specification

### 1. Monorepo Structure

**Goals:**
- Separate frontend and backend code while sharing common configuration
- Enable independent build/test/deploy of each layer
- Maintain single source of truth for tooling

**Structure:**
```
aemflow/
├── apps/
│   ├── web/              # React frontend (Vite + TypeScript)
│   └── aem/              # AEM backend (Java/Maven)
├── packages/
│   ├── shared/           # Shared types and utilities
│   ├── config/           # ESLint, TypeScript, etc.
│   └── ui/               # Shared UI components
├── turbo.json            # Build orchestration config
├── package.json          # Root package with workspaces
├── docker/               # Docker configurations
└── .github/              # GitHub Actions workflows
```

**Key Requirements:**
- Use npm workspaces for package management
- Shared TypeScript configuration across packages
- Consistent linting rules via shared ESLint config

### 2. Build Orchestration (Turbo)

**Goals:**
- Cache build outputs for faster builds
- Run tasks in parallel where possible
- Visualize pipeline execution

**Configuration (turbo.json):**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "type-check": {}
  }
}
```

**Key Requirements:**
- Task dependencies properly configured
- Output caching enabled
- Remote caching disabled (local dev)

### 3. Conventional Commits + Semantic Release

**Goals:**
- Enforce consistent commit messages
- Automated version bumping based on commits
- Automated changelog generation

**Commit Message Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Test updates
- `chore`: Maintenance

**Semantic Release Config:**
- `major`: Breaking changes
- `minor`: New features (backward compatible)
- `patch`: Bug fixes

**Tools:**
- commitizen for interactive commits
- commitlint for validation
- semantic-release for automation

### 4. CI/CD with GitHub Actions

**Workflows:**

**a) PR Workflow (pull_request.yml)**
- Run lint
- Run type-check
- Run tests
- Build application
- Comment on PR with results

**b) Main Workflow (push.yml)**
- On push to main: Release
- Run full test suite
- Build all packages
- Publish to npm (if public)

**c) Schedule Workflow (schedule.yml)**
- Weekly dependency updates
- Security audits

**Key Requirements:**
- Matrix strategy for Node versions
- Artifact retention (30 days)
- Status checks required for merge

### 5. Docker for Local AEM Development

**Goals:**
- Local AEM authoring instance
- Mock AEM responses for development
- Reproducible environment

**Docker Compose Services:**

**a) AEM Author**
- AEM 2023.x or 2024.x
- Port: 4502
- Username: admin
- Password: admin

**b) Mock Server**
- Express server for API mocking
- Port: 3001
- Configurable response delays

**Dockerfile Structure:**
```
docker/
├── aem/
│   ├── Dockerfile
│   └── docker-entrypoint.sh
└── docker-compose.yml
```

**Key Requirements:**
- Volume mount for code changes
- Healthcheck for AEM readiness
- Cleanup script for containers

## Non-Functional Requirements

- **Build Performance**: Initial build < 5 min, cached build < 1 min
- **Reliability**: CI pipeline > 95% pass rate on first run
- **Maintainability**: Clear documentation for all tooling
- **Security**: No secrets in code, use GitHub secrets

## Acceptance Criteria

1. [ ] Monorepo structure established with workspace config
2. [ ] Turbo configured with build, test, lint tasks
3. [ ] Conventional commits enforced via commitlint
4. [ ] Semantic release configured with preset
5. [ ] GitHub Actions PR workflow functional
6. [ ] GitHub Actions release workflow functional
7. [ ] Docker Compose with AEM authoring running
8. [ ] Documentation updated with setup instructions

## Technical Design

### Package.json Workspace Structure
```json
{
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  }
}
```

### Dependencies to Add
```json
{
  "devDependencies": {
    "turbo": "^2.0.0",
    "commitizen": "^4.3.0",
    "@commitlint/cli": "^18.0.0",
    "semantic-release": "^23.0.0"
  }
}
```

## Progress Log

### 2026-03-15
Initial specification created for Project Infrastructure Setup.