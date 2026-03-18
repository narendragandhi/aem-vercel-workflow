package com.example.aem.vercel.workflow.service;

import java.util.Map;

public interface AuditLogService {
    void logEvent(String actor, String action, String target, String outcome, Map<String, Object> metadata);
}
