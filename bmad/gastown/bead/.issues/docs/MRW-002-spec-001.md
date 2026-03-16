---
id: MRW-002-spec-001
workflow_id: MRW-002
type: specification
agent: docs
status: in_progress
priority: high
depends_on: [MRW-001-review-001]
blocks: [MRW-002-impl-001, MRW-002-test-001]
---

# AEM ResourceResolver Integration

## Overview

Add proper AEM ResourceResolver integration to all services for accessing JCR content instead of in-memory Maps.

## Context

Current implementation uses plain Java Maps to pass content data around. This violates AEM best practices - services should use ResourceResolver to access content from the JCR repository.

## Functional Specification

### 1. ResourceResolverFactory Injection
- All services must inject `ResourceResolverFactory` via `@Reference`
- Create utility method to obtain service ResourceResolver
- Proper cleanup using try-with-resources pattern

### 2. Resource-to-Model Adaptation
- Services must adapt `Resource` to model classes using `resource.adaptTo()`
- Use Sling Models (@Model, @Inject annotations)
- Support both JCR node and resource properties

### 3. Content Access Patterns
- Read content from `/content/aem-agentic-web/`
- Support both authored and generated content
- Handle missing resources gracefully

### 4. Service ResourceResolver Pattern
```java
@Reference
private ResourceResolverFactory resolverFactory;

private ResourceResolver getServiceResolver() {
    Map<String, Object> authInfo = new HashMap<>();
    authInfo.put(ResourceResolverFactory.SUBSERVICE, "aem-agentic-web");
    return resolverFactory.getServiceResourceResolver(authInfo);
}
```

## Non-Functional Requirements

- Must use service user (not admin session)
- Proper exception handling for all JCR operations
- Logging at appropriate levels (DEBUG for dev, WARN for errors)

## Acceptance Criteria

1. ResourceResolverFactory injected in all services
2. Resources adapted to model classes correctly
3. No deprecated Session login methods used
4. Proper exception handling for missing content
5. Unit tests use AEM Mocks for ResourceResolver

## Technical Design

### Package Structure
```
core/src/main/java/com/aem2026/agentic/
├── resource/
│   ├── ResourceResolverHelper.java
│   └── ServiceResourceResolver.java
├── model/
│   └── (existing models updated to Sling Models)
└── service/
    └── (update impl classes)
```

### Dependencies Required
- Apache Sling Models (`org.apache.sling:org.apache.sling.models.api`)
- AEM Mocks for testing (`io.wcm.testing.aem-mock`)
