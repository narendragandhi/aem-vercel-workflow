package com.example.aem.vercel.workflow.util;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

public final class CorsPolicy {

    private static final String ENV_KEY = "AEMFLOW_ALLOWED_ORIGINS";
    private static final Set<String> DEFAULT_ORIGINS = Set.of(
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://aemflow.vercel.app"
    );
    private static final Set<String> ALLOWED_ORIGINS = buildAllowedOrigins();

    private CorsPolicy() {}

    private static Set<String> buildAllowedOrigins() {
        String configured = System.getenv(ENV_KEY);
        if (configured == null || configured.isBlank()) {
            return DEFAULT_ORIGINS;
        }
        Set<String> origins = Arrays.stream(configured.split(","))
            .map(String::trim)
            .filter(part -> !part.isEmpty())
            .collect(Collectors.toCollection(LinkedHashSet::new));
        if (origins.isEmpty()) {
            return DEFAULT_ORIGINS;
        }
        return Collections.unmodifiableSet(origins);
    }

    public static void apply(SlingHttpServletRequest request, SlingHttpServletResponse response) {
        String origin = request != null ? request.getHeader("Origin") : null;
        apply(origin, response);
    }

    public static void apply(String origin, SlingHttpServletResponse response) {
        if (origin != null && (ALLOWED_ORIGINS.contains(origin) || ALLOWED_ORIGINS.contains("*"))) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        response.setHeader("Vary", "Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
}
