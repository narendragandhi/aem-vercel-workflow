---
id: MRW-002-test-001
workflow_id: MRW-002
type: test
agent: tester
status: in_progress
priority: high
depends_on: [MRW-002-impl-001]
blocks: [MRW-002-review-001]
---

# Test Task - ResourceResolver Integration

## Reference
- Specification: bmad/gastown/bead/.issues/docs/MRW-002-spec-001.md
- Implementation: bmad/gastown/bead/.issues/coder/MRW-002-impl-001.md

## Test Setup Requirements

### Dependencies Required (pom.xml)
```xml
<dependency>
    <groupId>io.wcm</groupId>
    <artifactId>aem-mock</artifactId>
    <version>5.13.4</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.apache.sling</groupId>
    <artifactId>org.apache.sling.models.api</artifactId>
    <version>1.3.8</version>
</dependency>
```

### Test Base Class
Create `core/src/test/java/com/aem2026/agentic/test/AemMockTest.java`:

```java
public abstract class AemMockTest {
    
    @Rule
    public AemContext context = new AemContextBuilder().build();
    
    protected ResourceResolver getAdminResourceResolver() {
        return context.resourceResolver();
    }
    
    protected <T> T getService(Class<T> service) {
        return context.getService(service);
    }
}
```

## Test Cases

### Test 1: ResourceResolverHelperTest
```java
class ResourceResolverHelperTest extends AemMockTest {
    
    @Test
    void shouldObtainServiceResourceResolver() {
        ResourceResolverHelper helper = getService(ResourceResolverHelper.class);
        assertNotNull(helper);
        
        ResourceResolver resolver = helper.getServiceResourceResolver();
        assertNotNull(resolver);
    }
    
    @Test
    void shouldAdaptResourceToModel() {
        context.build().resource("/content/test", "jcr:title", "Test");
        
        ResourceResolverHelper helper = getService(ResourceResolverHelper.class);
        StructuredContent content = helper.getResourceAs("/content/test", StructuredContent.class);
        
        assertNotNull(content);
        assertEquals("Test", content.getTitle());
    }
}
```

### Test 2: SchemaMarkupServiceImplJcrTest
```java
class SchemaMarkupServiceImplJcrTest extends AemMockTest {
    
    @Test
    void shouldGenerateSchemaFromJcrContent() {
        // Given: JCR content at /content/products/product1
        context.build().resource("/content/products/product1",
            "jcr:primaryType", "nt:unstructured",
            "name", "AEM Book",
            "description", "Adobe Experience Manager Guide",
            "price", "49.99");
        
        // When
        SchemaMarkupService service = getService(SchemaMarkupService.class);
        JsonLdSchema schema = service.generateFromResource("/content/products/product1");
        
        // Then
        assertNotNull(schema);
        assertEquals("Product", schema.getType());
    }
}
```

### Test 3: AgentAnalyticsServicePersistenceTest
```java
class AgentAnalyticsServicePersistenceTest extends AemMockTest {
    
    @Test
    void shouldPersistVisitToJcr() {
        AgentVisit visit = new AgentVisit();
        visit.setAgentId("claude-agent");
        visit.setContentPath("/content/pages/home");
        
        AgentAnalyticsService service = getService(AgentAnalyticsService.class);
        service.trackVisit(visit);
        
        // Verify stored in JCR
        Resource visitResource = getAdminResourceResolver()
            .getResource("/var/agent-analytics/visits");
        assertNotNull(visitResource);
    }
}
```

## Quality Criteria

- [ ] All tests extend AemMockTest
- [ ] Tests use AemContext for mocking
- [ ] MockResourceResolver properly configured
- [ ] 80% code coverage minimum
- [ ] Tests run with: mvn test

## Test Execution

```bash
cd aem-agentic-web
mvn test -Dtest=*ResourceResolverHelperTest
```

## Completion

When done, update status to `completed` and create review task.
