package com.example.aem.vercel.workflow.edge;

import java.util.Map;

public interface MetricsSnapshot {
    long getTimestamp();

    long getTotalRequests();

    long getCachedRequests();

    long getTotalErrors();

    double getCacheHitRatio();

    long getAvgResponseTime();

    long getP95ResponseTime();

    long getP99ResponseTime();

    Map<String, Long> getRequestsByPath();

    Map<String, Long> getErrorsByType();
}
