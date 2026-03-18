package com.example.aem.vercel.workflow.edge;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

public interface EdgeMetricsService {
    CompletableFuture<MetricsSnapshot> collectMetrics();

    MetricsSnapshot getLatestMetrics();

    Map<String, Object> getMetricsHistory(int hours);

    void recordRequest(String path, long responseTime, boolean cached);

    void recordError(String path, String errorType);

    Map<String, Double> getCacheHitRatios();

    Map<String, Long> getResponseTimes();

    Map<String, Long> getErrorRates();
}
