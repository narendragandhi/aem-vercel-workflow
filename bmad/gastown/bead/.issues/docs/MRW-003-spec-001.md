---
id: MRW-003-spec-001
workflow_id: MRW-003
type: specification
agent: docs
status: in_progress
priority: high
depends_on: [MRW-002-review-001]
blocks: [MRW-003-impl-001, MRW-003-test-001]
---

# JCR Persistence Layer

## Overview

Replace in-memory storage with proper JCR/Oak repository persistence for agent analytics data.

## Context

Current AgentAnalyticsServiceImpl stores visits in `Collections.synchronizedList(new ArrayList<>())`. This is lost on AEM restart. Must persist to JCR.

## Functional Specification

### 1. JCR Node Structure

```
/var/agent-analytics/
├── config/
│   └── analytics-config (agent analytics configuration)
├── visits/
│   └── {year}/
│       └── {month}/
│           └── {day}/
│               └── {uuid}.json (agent visit record)
└── aggregated/
    ├── agents/
    │   └── {agentId}.json (agent visit stats)
    └── content/
        └── {contentId}.json (content visit stats)
```

### 2. AgentVisit Node Type (XML)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root jcr:primaryType="nt:unstructured"
    jcr:title="Agent Visit"
    agentId="String"
    agentType="String"
    contentPath="String"
    contentId="String"
    timestamp="Long"
    userAgent="String"
    ipHash="String"
    actions="String[]"
    duration="Long"
    metadata="String"/>
```

### 3. Persistence Service

Create `AgentAnalyticsRepository.java`:

```java
public interface AgentAnalyticsRepository {
    void saveVisit(AgentVisit visit);
    List<AgentVisit> findVisitsByAgent(String agentId, int limit);
    List<AgentVisit> findVisitsByContent(String contentId, int limit);
    Map<String, Long> getAgentVisitCounts(int days);
    void deleteVisitsOlderThan(int days);
}
```

### 4. Oak Index Definition

Create `oak-index/agent-analytics-index.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<oak:index xmlns:oak="http://jackrabbit.apache.org/oak/index">
    <idxRules jcr:primaryType="oak:indexRules">
        <entry jcr:name="agentId">
            <property jcr:name="propertyIndex"/>
        </entry>
        <entry jcr:name="timestamp">
            <property jcr:name="propertyIndex"/>
        </entry>
    </idxRules>
</oak:index>
```

## Non-Functional Requirements

- Async write for performance (Sling Job or BackgroundThread)
- Batch operations for bulk inserts
- Connection pooling via Oak defaults
- Pagination for large result sets

## Acceptance Criteria

1. Visits persist across AEM restarts
2. Queries return correct results with Oak indexes
3. Bulk operations don't block main thread
4. Tests use in-memory Oak repository

## Technical Design

### Package Structure
```
core/src/main/java/com/aem2026/agentic/repository/
├── AgentAnalyticsRepository.java (interface)
├── AgentAnalyticsRepositoryImpl.java
└── OakIndexDefinitionService.java
```

### Dependencies Required
- Jackrabbit Oak (`org.apache.jackrabbit:oak-core`)
- Jackrabbit Oak Segment Tar (`org.apache.jackrabbit:oak-segment-tar`)
