---
id: AFM-002-spec-001
workflow_id: AFM-002
type: specification
agent: docs
status: pending
priority: high
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:00:00Z
depends_on: []
blocks: [AFM-002-impl-001, AFM-002-test-001, AFM-002-review-001]
---

# AEM Direct Deployment

## Overview

**Component/Feature**: AEM Direct Deployment
**Type**: Integration Feature
**Purpose**: Deploy workflows directly from AEMFlow to AEM instances (on-premise, AMS, or AEMaaCS).

## Context

### Business Requirements

1. Users can configure AEM instance connection (URL, credentials)
2. Users can deploy workflow XML to AEM with one click
3. System validates workflow before deployment
4. Users receive feedback on deployment status
5. Support for multiple AEM environments (dev, staging, prod)

### Technical Constraints

- AEM Version: 6.5+ and AEMaaCS
- Authentication: Token-based or OAuth
- Requires AEM workflow REST API access
- Network: HTTPS required for AEMaaCS

## Functional Specification

### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| AEM Connection | Configure AEM instance details | Required |
| Deploy Workflow | Push workflow XML to AEM | Required |
| Validate Before Deploy | Check workflow validity | Required |
| Environment Profiles | Support multiple AEM environments | Required |
| Deployment History | Track past deployments | Optional |

### User Interactions

1. User opens Settings/Deploy panel
2. User adds AEM environment (dev/staging/prod)
3. User enters AEM URL and authentication details
4. User clicks "Deploy" on current workflow
5. System validates workflow
6. System uploads to AEM
7. Success/failure notification shown

### Connection Configuration

```typescript
interface AEMConnection {
  id: string;
  name: string;
  url: string;
  auth: {
    type: 'token' | 'basic' | 'oauth';
    credentials?: {
      username?: string;
      password?: string;
      token?: string;
    };
  };
  environment: 'dev' | 'staging' | 'prod';
}
```

### Deployment Flow

```
1. Validate Workflow
   ↓
2. Generate XML
   ↓
3. Authenticate with AEM
   ↓
4. Upload to AEM Workflow Model API
   ↓
5. Activate Workflow Model
   ↓
6. Return Success/Failure
```

### Edge Cases

1. **Connection failure** - Show clear error message with troubleshooting
2. **Auth expired** - Prompt to re-authenticate
3. **Invalid workflow** - Block deployment, show validation errors
4. **Network timeout** - Retry with exponential backoff (max 3 attempts)
5. **AEM error** - Parse and display AEM error message

## Non-Functional Requirements

### Performance

- Connection test < 3 seconds
- Deployment < 30 seconds for typical workflow

### Security

- Credentials stored securely (encrypted in localStorage)
- No credentials logged or exposed
- HTTPS enforced for AEMaaCS

### Reliability

- Idempotent deployment (safe to retry)
- Rollback capability (deactivate old version)

## Acceptance Criteria

- [ ] User can configure multiple AEM environments
- [ ] User can test connection before deploying
- [ ] User can deploy workflow with one click
- [ ] Invalid workflows are blocked with clear errors
- [ ] Deployment status is clearly communicated
- [ ] Credentials are securely stored
- [ ] Works with AEM 6.5, AMS, and AEMaaCS
- [ ] All tests pass

## Technical Design

### File Structure

| File Type | Path |
|-----------|------|
| AEM Service | `src/services/aemDeployService.ts` |
| Connection Manager | `src/services/connectionManager.ts` |
| UI Component | `src/components/AEMDeployPanel.tsx` |
| Settings UI | `src/components/Settings/AEMSettings.tsx` |
| Tests | `src/services/__tests__/aemDeployService.test.ts` |

### Dependencies

```json
{
  "axios": "^1.6.0"
}
```

### AEM API Endpoints

```typescript
// Test connection
GET /libs/cq/workflow/admin/etc/version.json

// Upload workflow model
POST /bin/workflow/models

// Activate workflow model
POST /bin/workflow/models/{id}/activate
```

## Progress Log

### 2026-03-13
Initial specification created.

## Notes

- Consider: Deployment approval workflow for production
- Future: Two-way sync with AEM
- Future: Deployment webhooks for CI/CD
