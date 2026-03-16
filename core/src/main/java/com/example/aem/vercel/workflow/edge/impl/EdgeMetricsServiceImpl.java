package com.example.aem.vercel.workflow.edge.impl;

import com.example.aem.vercel.workflow.edge.EdgeMetricsService;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;

@Component(service = EdgeMetricsService.class)
public class EdgeMetricsServiceImpl implements EdgeMetricsService {

    private static final Logger LOG = LoggerFactory.getLogger(EdgeMetricsServiceImpl.class);

    private final List<MetricsSnapshot> metricsHistory = new ArrayList<>();
    private final Map<String, List<Long>> responseTimesByPath = new ConcurrentHashMap<>();
    private final Map<String, Long> errorCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> cachedRequestCounts = new ConcurrentHashMap<>();

    private long totalRequests = 0;
    private long totalCachedRequests = 0;
    private long totalErrors = 0;

    @Override
    public CompletableFuture<MetricsSnapshot> collectMetrics() {
        return CompletableFuture.supplyAsync(() -> {
            MetricsSnapshot snapshot = buildSnapshot();
            metricsHistory.add(snapshot);
            
            if (metricsHistory.size() > 168) {
                metricsHistory.remove(0);
            }
            
            LOG.debug("Collected edge metrics: {} total requests", totalRequests);
            return snapshot;
        });
    }

    @Override
    public MetricsSnapshot getLatestMetrics() {
        return metricsHistory.isEmpty() ? buildSnapshot() : metricsHistory.get(metricsHistory.size() - 1);
    }

    @Override
    public Map<String, Object> getMetricsHistory(int hours) {
        Map<String, Object> history = new HashMap<>();
        List<MetricsSnapshot> relevant = metricsHistory.subList(
            Math.max(0, metricsHistory.size() - hours),
            metricsHistory.size()
        );
        
        List<Long> timestamps = new ArrayList<>();
        List<Double> ratios = new ArrayList<>();
        List<Long> avgTimes = new ArrayList<>();
        
        for (MetricsSnapshot s : relevant) {
            timestamps.add(s.getTimestamp());
            ratios.add(s.getCacheHitRatio());
            avgTimes.add(s.getAvgResponseTime());
        }
        
        history.put("timestamps", timestamps);
        history.put("cacheHitRatios", ratios);
        history.put("avgResponseTimes", avgTimes);
        
        return history;
    }

    @Override
    public void recordRequest(String path, long responseTime, boolean cached) {
        totalRequests++;
        if (cached) {
            totalCachedRequests++;
            cachedRequestCounts.merge(path, 1L, Long::sum);
        }
        
        requestCounts.merge(path, 1L, Long::sum);
        
        responseTimesByPath
            .computeIfAbsent(path, k -> new ArrayList<>())
            .add(responseTime);
    }

    @Override
    public void recordError(String path, String errorType) {
        totalErrors++;
        errorCounts.merge(errorType, 1L, Long::sum);
    }

    @Override
    public Map<String, Double> getCacheHitRatios() {
        Map<String, Double> ratios = new HashMap<>();
        for (String path : requestCounts.keySet()) {
            long total = requestCounts.get(path);
            long cached = cachedRequestCounts.getOrDefault(path, 0L);
            ratios.put(path, total > 0 ? (double) cached / total : 0.0);
        }
        return ratios;
    }

    @Override
    public Map<String, Long> getResponseTimes() {
        Map<String, Long> avgTimes = new HashMap<>();
        for (Map.Entry<String, List<Long>> entry : responseTimesByPath.entrySet()) {
            List<Long> times = entry.getValue();
            long sum = times.stream().mapToLong(Long::longValue).sum();
            avgTimes.put(entry.getKey(), times.isEmpty() ? 0 : sum / times.size());
        }
        return avgTimes;
    }

    @Override
    public Map<String, Long> getErrorRates() {
        return new HashMap<>(errorCounts);
    }

    private MetricsSnapshot buildSnapshot() {
        double cacheHitRatio = totalRequests > 0 ? (double) totalCachedRequests / totalRequests : 0.0;
        long avgResponseTime = calculateOverallAvgResponseTime();

        return new MetricsSnapshot() {
            @Override
            public long getTimestamp() { return System.currentTimeMillis(); }

            @Override
            public long getTotalRequests() { return totalRequests; }

            @Override
            public long getCachedRequests() { return totalCachedRequests; }

            @Override
            public long getTotalErrors() { return totalErrors; }

            @Override
            public double getCacheHitRatio() { return cacheHitRatio; }

            @Override
            public long getAvgResponseTime() { return avgResponseTime; }

            @Override
            public long getP95ResponseTime() { return calculatePercentile(95); }

            @Override
            public long getP99ResponseTime() { return calculatePercentile(99); }

            @Override
            public Map<String, Long> getRequestsByPath() { return new HashMap<>(requestCounts); }

            @Override
            public Map<String, Long> getErrorsByType() { return new HashMap<>(errorCounts); }
        };
    }

    private long calculateOverallAvgResponseTime() {
        List<Long> allTimes = responseTimesByPath.values().stream()
            .flatMap(List::stream)
            .toList();
        
        if (allTimes.isEmpty()) {
            return 0;
        }
        
        return allTimes.stream().mapToLong(Long::longValue).sum() / allTimes.size();
    }

    private long calculatePercentile(int percentile) {
        List<Long> allTimes = responseTimesByPath.values().stream()
            .flatMap(List::stream)
            .sorted()
            .toList();
        
        if (allTimes.isEmpty()) {
            return 0;
        }
        
        int index = (int) Math.ceil(percentile / 100.0 * allTimes.size()) - 1;
        return allTimes.get(Math.max(0, index));
    }
}
