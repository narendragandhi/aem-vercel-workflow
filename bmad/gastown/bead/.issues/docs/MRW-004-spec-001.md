---
id: MRW-004-spec-001
workflow_id: MRW-004
type: specification
agent: docs
status: in_progress
priority: high
depends_on: [MRW-003-review-001]
blocks: [MRW-004-impl-001, MRW-004-test-001]
---

# OSGi Configuration Layer

## Overview

Add OSGi Configuration PIDs to all services for runtime customization via AEM System Console or configMgr.

## Context

Current services have hardcoded values. Need configuration for:
- Analytics retention period
- Rate limiting thresholds  
- Cache sizes
- Schema defaults

## Functional Specification

### 1. Configuration Interfaces

Create `AgentAnalyticsConfig.java`:

```java
@Designate(ocd = AgentAnalyticsConfigImpl.class)
interface AgentAnalyticsConfig {
    
    @AttributeDefinition(
        name = "Retention Days",
        description = "Days to keep agent visit records",
        type = AttributeType.INTEGER
    )
    int retentionDays() default 90;
    
    @AttributeDefinition(
        name = "Rate Limit",
        description = "Max requests per minute per agent",
        type = AttributeType.INTEGER  
    )
    int rateLimit() default 100;
    
    @AttributeDefinition(
        name = "Enable Analytics",
        description = "Enable/disable analytics tracking",
        type = AttributeType.BOOLEAN
    )
    boolean enabled() default true;
}
```

### 2. Service Implementation with Configuration

```java
@Component(
    service = AgentAnalyticsService.class,
    configurationPid = "com.aem2026.agentic.config.AgentAnalytics"
)
public class AgentAnalyticsServiceImpl implements AgentAnalyticsService {
    
    @Activate
    public void activate(AgentAnalyticsConfig config) {
        this.retentionDays = config.retentionDays();
        this.rateLimit = config.rateLimit();
        this.enabled = config.enabled();
    }
}
```

### 3. Configuration PID Mapping

| Service | PID | Key Config Values |
|---------|-----|-------------------|
| SchemaMarkupService | com.aem2026.agentic.config.SchemaMarkup | cacheSize, defaultCurrency |
| AgentAnalyticsService | com.aem2026.agentic.config.AgentAnalytics | retentionDays, rateLimit, enabled |
| ContentEnrichmentService | com.aem2026.agentic.config.ContentEnrichment | maxKeywords, entityExtractEnabled |
| AgentSitemapGenerator | com.aem2026.agentic.config.Sitemap | baseUrl, cacheMinutes |

## Non-Functional Requirements

- Factory configurations for multi-tenant support
- Metatype XML for AEM UI support
- Configuration validation on activate

## Acceptance Criteria

1. All services read from OSGi config
2. Changes reflect without bundle restart (via ConfigAdmin)
3. Metatype shows in AEM System Console
4. Default values work when config missing

## Technical Design

### Package Structure
```
core/src/main/java/com/aem2026/agentic/config/
├── AgentAnalyticsConfig.java
├── AgentAnalyticsConfigImpl.java
├── SchemaMarkupConfig.java
├── SchemaMarkupConfigImpl.java
└── ContentEnrichmentConfig.java

core/src/main/resources/
└── OSGi-INF/
    └── metatype/
        └── AgentAnalytics.xml
```

### Annotations Required
- `@Designate(ocd = ConfigImpl.class)` - Links interface to impl
- `@ObjectClassDefinition` - Config PID definition
- `@AttributeDefinition` - Individual config fields
