---
id: MRW-002-impl-001
workflow_id: MRW-002
type: implementation
agent: coder
status: in_progress
priority: high
depends_on: [MRW-002-spec-001]
blocks: [MRW-002-test-001]
---

# Implementation Task - ResourceResolver Integration

## Reference
- Specification: bmad/gastown/bead/.issues/docs/MRW-002-spec-001.md

## Implementation Steps

### Step 1: Add ResourceResolverHelper utility class

Create `core/src/main/java/com/aem2026/agentic/resource/ResourceResolverHelper.java`:

```java
@Component(service = ResourceResolverHelper.class)
public class ResourceResolverHelper {
    
    @Reference
    private ResourceResolverFactory resolverFactory;
    
    private static final String SERVICE_NAME = "aem-agentic-web";
    
    public ResourceResolver getServiceResourceResolver() throws LoginException {
        Map<String, Object> authInfo = new HashMap<>();
        authInfo.put(ResourceResolverFactory.SUBSERVICE, SERVICE_NAME);
        return resolverFactory.getServiceResourceResolver(authInfo);
    }
    
    public <T> T getResourceAs(String path, Class<T> modelClass) {
        try (ResourceResolver resolver = getServiceResourceResolver()) {
            Resource resource = resolver.getResource(path);
            if (resource == null) {
                return null;
            }
            return resource.adaptTo(modelClass);
        } catch (LoginException e) {
            LOG.error("Failed to obtain service resolver", e);
            return null;
        }
    }
}
```

### Step 2: Update StructuredContent to Sling Model

Update `model/StructuredContent.java`:

```java
@Model(adaptables = Resource.class)
public class StructuredContent {
    
    @Inject
    @Named("jcr:title")
    private String title;
    
    @Inject
    @Named("jcr:description")
    private String description;
    
    @Inject
    private String path;
    
    @Inject
    private String resourceType;
    
    // getters
}
```

### Step 3: Update SchemaMarkupServiceImpl

- Add @Reference for ResourceResolverHelper
- Add method to load content from JCR: `loadContentFromJcr(String path)`
- Update generateProductSchema to accept Resource

### Step 4: Update AgentAnalyticsServiceImpl

- Add @Reference for ResourceResolverHelper  
- Change storage from in-memory to JCR nodes
- Store visits under `/var/agent-analytics/visits/`

### Step 5: Update ContentEnrichmentServiceImpl

- Add @Reference for ResourceResolverHelper
- Add method to process content from Resource

## Quality Criteria

- [ ] Code compiles without errors
- [ ] Follows AEM service user pattern
- [ ] Proper resource cleanup (try-with-resources)
- [ ] Logging at appropriate levels
- [ ] No hardcoded paths - use constants

## Completion

When done, update status to `completed` and create test task.
