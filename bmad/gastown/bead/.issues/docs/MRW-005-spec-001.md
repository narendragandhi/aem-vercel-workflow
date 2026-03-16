---
id: MRW-005-spec-001
workflow_id: MRW-005
type: specification
agent: docs
status: in_progress
priority: high
depends_on: [MRW-004-review-001]
blocks: [MRW-005-impl-001, MRW-005-test-001]
---

# Sling Servlets REST API

## Overview

Create REST endpoints for external agents to interact with the Machine-Readable Web services.

## Context

AI agents need HTTP endpoints to:
- Query structured data
- Submit agent visits
- Generate agent-specific sitemaps

## Functional Specification

### 1. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /bin/aem-agentic/schema/{contentPath} | Get JSON-LD schema |
| POST | /bin/aem-agentic/track | Submit agent visit |
| GET | /bin/aem-agentic/analytics/agents/{agentId} | Get agent stats |
| GET | /bin/aem-agentic/sitemap/agents.xml | Agent sitemap |
| GET | /bin/aem-agentic/content/{path}/entities | Get extracted entities |

### 2. Schema Servlet

```java
@SlingServlet(
    paths = {"/bin/aem-agentic/schema"},
    methods = {"GET"},
    extensions = {"json"}
)
public class SchemaServlet extends SlingAllMethodsServlet {
    
    @Reference
    private SchemaMarkupService schemaService;
    
    @Reference
    private ResourceResolverFactory resolverFactory;
    
    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) 
        throws ServletException, IOException {
        
        String contentPath = request.getParameter("path");
        String schemaType = request.getParameter("type"); // product, article, etc.
        
        // Validate input
        if (contentPath == null) {
            response.sendError(400, "path parameter required");
            return;
        }
        
        // Get content from JCR
        try (ResourceResolver resolver = getServiceResolver()) {
            Resource resource = resolver.getResource(contentPath);
            JsonLdSchema schema = schemaService.generateFromResource(resource, schemaType);
            
            response.setContentType("application/json");
            response.getWriter().write(schema.toJson());
        }
    }
}
```

### 3. Analytics Tracking Servlet

```java
@SlingServlet(
    paths = {"/bin/aem-agentic/track"},
    methods = {"POST"}
)
public class AnalyticsTrackServlet extends SlingAllMethodsServlet {
    
    @Reference
    private AgentAnalyticsService analyticsService;
    
    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response)
        throws ServletException, IOException {
        
        // Parse JSON body
        AgentVisit visit = new Gson().fromJson(request.getReader(), AgentVisit.class);
        
        // Validate
        if (visit.getAgentId() == null) {
            response.sendError(400, "agentId required");
            return;
        }
        
        analyticsService.trackVisit(visit);
        
        response.setStatus(201);
        response.getWriter().write("{\"status\":\"tracked\"}");
    }
}
```

### 4. Agent Sitemap Servlet

```java
@Component(service = Servlet.class)
@SlingServlet(
    paths = {"/bin/aem-agentic/sitemap/agents"},
    extensions = {"xml"}
)
public class AgentSitemapServlet extends SlingSafeMethodsServlet {
    
    @Reference
    private AgentSitemapGenerator sitemapGenerator;
    
    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response)
        throws ServletException, IOException {
        
        String sitemap = sitemapGenerator.generateAgentSitemap();
        
        response.setContentType("application/xml");
        response.getWriter().write(sitemap);
    }
}
```

## Non-Functional Requirements

- Rate limiting per IP/agent
- CORS headers for cross-origin agents
- JSON error responses
- Authentication hook for AEM token/saml

## Acceptance Criteria

1. All endpoints return proper HTTP status codes
2. JSON responses are valid
3. Rate limiting works
4. CORS configured for agent access

## Technical Design

### Package Structure
```
core/src/main/java/com/aem2026/agentic/servlet/
├── SchemaServlet.java
├── AnalyticsTrackServlet.java
├── AgentStatsServlet.java
├── AgentSitemapServlet.java
└── EntityServlet.java

core/src/main/resources/
└── SLING-INF/
    └── initial/
        └── content/
            └── app/
                └── bin/
                    └── aem-agentic (sling:Folder)
```

### Response Format
```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": 1234567890,
    "version": "1.0"
  }
}

{
  "status": "error",
  "error": {
    "code": 404,
    "message": "Content not found"
  }
}
```
