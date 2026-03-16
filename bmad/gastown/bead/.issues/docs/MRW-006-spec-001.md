---
id: MRW-006-spec-001
workflow_id: MRW-006
type: specification
agent: docs
status: in_progress
priority: medium
depends_on: [MRW-005-review-001]
blocks: [MRW-006-impl-001, MRW-006-test-001]
---

# Validation Layer

## Overview

Add input validation and error handling to all services and servlets.

## Context

Current code lacks:
- Input validation (null checks, format validation)
- Proper error responses
- Constraint annotations

## Functional Specification

### 1. Validation Annotations

Create custom validation annotations:

```java
@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidPathValidator.class)
public @interface ValidPath {
    String message() default "Invalid JCR path";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidAgentIdValidator.class)
public @interface ValidAgentId {
    String message() default "Invalid agent ID";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

### 2. Validator Service

```java
@Component(service = AgentAnalyticsValidator.class)
public class AgentAnalyticsValidator {
    
    public ValidationResult validate(AgentVisit visit) {
        ValidationResult result = new ValidationResult();
        
        if (visit.getAgentId() == null || visit.getAgentId().isBlank()) {
            result.addError("agentId", "Agent ID is required");
        }
        
        if (visit.getAgentId() != null && !visit.getAgentId().matches("^[a-zA-Z0-9-_]+$")) {
            result.addError("agentId", "Agent ID must be alphanumeric");
        }
        
        if (visit.getTimestamp() != null && visit.getTimestamp() < 0) {
            result.addError("timestamp", "Timestamp must be positive");
        }
        
        return result;
    }
}
```

### 3. Exception Hierarchy

```java
public class AgenticWebException extends Exception {
    private final int errorCode;
    
    public AgenticWebException(String message, int errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public int getErrorCode() { return errorCode; }
}

public class ValidationException extends AgenticWebException {
    private final Map<String, String> fieldErrors;
    
    public ValidationException(Map<String, String> errors) {
        super("Validation failed", 400);
        this.fieldErrors = errors;
    }
}

public class ResourceNotFoundException extends AgenticWebException {
    public ResourceNotFoundException(String path) {
        super("Resource not found: " + path, 404);
    }
}
```

### 4. Servlet Error Handling

```java
@SlingServlet(paths = {"/bin/aem-agentic/track"}, methods = {"POST"})
public class AnalyticsTrackServlet extends SlingAllMethodsServlet {
    
    @Reference
    private AgentAnalyticsValidator validator;
    
    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) {
        try {
            AgentVisit visit = parseRequest(request);
            
            ValidationResult validation = validator.validate(visit);
            if (!validation.isValid()) {
                response.setStatus(400);
                response.setContentType("application/json");
                response.getWriter().write(validation.toJson());
                return;
            }
            
            // Process valid request
        } catch (ValidationException e) {
            handleError(response, e);
        } catch (Exception e) {
            handleError(response, new AgenticWebException(e.getMessage(), 500));
        }
    }
}
```

## Non-Functional Requirements

- Fast validation (minimal regex)
- Clear error messages for debugging
- Logging of validation failures

## Acceptance Criteria

1. All inputs validated before processing
2. Proper HTTP error codes returned
3. Error responses in JSON format
4. Unit tests for validators

## Technical Design

### Package Structure
```
core/src/main/java/com/aem2026/agentic/validation/
├── annotations/
│   ├── ValidPath.java
│   └── ValidAgentId.java
├── validators/
│   ├── AgentVisitValidator.java
│   └── ContentValidator.java
└── ValidationResult.java

core/src/main/java/com/aem2026/agentic/exception/
├── AgenticWebException.java
├── ValidationException.java
├── ResourceNotFoundException.java
└── RateLimitExceededException.java
```

### Standard Error Response
```json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "fields": {
      "agentId": "Agent ID is required",
      "timestamp": "Timestamp must be positive"
    }
  }
}
```
