package com.example.aem.vercel.workflow.service.impl;

import com.example.aem.vercel.workflow.service.AuditLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Node;
import javax.jcr.Session;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component(service = AuditLogService.class)
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger LOG = LoggerFactory.getLogger(AuditLogServiceImpl.class);
    private static final String AUDIT_BASE_PATH = "/var/audit/aemflow";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Reference
    private ResourceResolverFactory resourceResolverFactory;

    @Override
    public void logEvent(String actor, String action, String target, String outcome, Map<String, Object> metadata) {
        Map<String, Object> authInfo = new HashMap<>();
        authInfo.put(ResourceResolverFactory.SUBSERVICE, "audit-log-service");

        try (ResourceResolver resolver = resourceResolverFactory.getServiceResourceResolver(authInfo)) {
            Session session = resolver.adaptTo(Session.class);
            if (session == null) {
                LOG.warn("No JCR session available for audit logging");
                return;
            }

            Node base = ensurePath(session, AUDIT_BASE_PATH);
            LocalDate date = LocalDate.now();
            Node dayNode = ensurePath(base,
                String.format("%04d/%02d/%02d", date.getYear(), date.getMonthValue(), date.getDayOfMonth()));

            Node entry = dayNode.addNode(UUID.randomUUID().toString(), "nt:unstructured");
            entry.setProperty("actor", actor);
            entry.setProperty("action", action);
            entry.setProperty("target", target);
            entry.setProperty("outcome", outcome);
            entry.setProperty("timestamp", System.currentTimeMillis());
            entry.setProperty("metadata", objectMapper.writeValueAsString(metadata != null ? metadata : Map.of()));

            session.save();
        } catch (Exception e) {
            LOG.error("Failed to write audit log entry", e);
        }
    }

    private Node ensurePath(Session session, String absPath) throws Exception {
        if (session.nodeExists(absPath)) {
            return session.getNode(absPath);
        }

        String normalized = absPath.startsWith("/") ? absPath.substring(1) : absPath;
        String[] parts = normalized.split("/");
        Node current = session.getRootNode();
        for (String part : parts) {
            if (current.hasNode(part)) {
                current = current.getNode(part);
            } else {
                current = current.addNode(part, "nt:unstructured");
            }
        }
        return current;
    }

    private Node ensurePath(Node base, String relativePath) throws Exception {
        Node current = base;
        String[] parts = relativePath.split("/");
        for (String part : parts) {
            if (part.isEmpty()) {
                continue;
            }
            if (current.hasNode(part)) {
                current = current.getNode(part);
            } else {
                current = current.addNode(part, "nt:unstructured");
            }
        }
        return current;
    }
}
