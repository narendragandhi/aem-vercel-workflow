package com.example.aem.vercel.workflow.edge.impl;

import com.example.aem.vercel.workflow.edge.ContentSyncService;
import com.example.aem.vercel.workflow.edge.SyncHistory;
import com.example.aem.vercel.workflow.edge.SyncStatus;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component(service = ContentSyncService.class)
public class ContentSyncServiceImpl implements ContentSyncService {

    private static final Logger LOG = LoggerFactory.getLogger(ContentSyncServiceImpl.class);

    private final Map<String, SyncStatus> syncStatuses = new ConcurrentHashMap<>();
    private final List<SyncHistory> syncHistory = new CopyOnWriteArrayList<>();
    private final List<String> syncRegions = new CopyOnWriteArrayList<>(List.of("us-east-1", "eu-west-1", "ap-southeast-1"));
    private boolean multiRegionSyncEnabled = false;

    @Override
    public void syncContent(String path) {
        syncContent(path, null);
    }

    @Override
    public void syncContent(String[] paths) {
        for (String path : paths) {
            syncContent(path);
        }
    }

    @Override
    public void syncContent(String path, String region) {
        long startTime = System.currentTimeMillis();
        String targetRegion = region != null ? region : syncRegions.get(0);

        LOG.info("Starting content sync for path: {} to region: {}", path, targetRegion);

        SyncStatus status = new SyncStatusImpl(path, "SYNCING", targetRegion, System.currentTimeMillis(), null);
        syncStatuses.put(path, status);

        try {
            Thread.sleep(300);

            status = new SyncStatusImpl(path, "COMPLETED", targetRegion, System.currentTimeMillis(), null);
            syncStatuses.put(path, status);

            syncHistory.add(new SyncHistoryImpl(path, "COMPLETED", System.currentTimeMillis(), targetRegion, "MANUAL"));

            LOG.info("Content sync completed for path: {}", path);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            status = new SyncStatusImpl(path, "FAILED", targetRegion, System.currentTimeMillis(), e.getMessage());
            syncStatuses.put(path, status);
            LOG.error("Content sync failed for path: {} - {}", path, e.getMessage());
        }
    }

    @Override
    public SyncStatus getSyncStatus(String path) {
        return syncStatuses.get(path);
    }

    @Override
    public List<SyncHistory> getSyncHistory(String path, int limit) {
        List<SyncHistory> result = new ArrayList<>();
        for (SyncHistory history : syncHistory) {
            if (history.getPath().equals(path)) {
                result.add(history);
                if (result.size() >= limit) {
                    break;
                }
            }
        }
        return result;
    }

    @Override
    public void enableMultiRegionSync(boolean enabled) {
        this.multiRegionSyncEnabled = enabled;
        LOG.info("Multi-region sync enabled: {}", enabled);
    }

    @Override
    public List<String> getSyncRegions() {
        return new ArrayList<>(syncRegions);
    }

    @Override
    public void setSyncRegions(List<String> regions) {
        syncRegions.clear();
        syncRegions.addAll(regions);
        LOG.info("Sync regions updated: {}", regions);
    }

    private static class SyncStatusImpl implements SyncStatus {
        private final String path;
        private final String status;
        private final String region;
        private final long lastSyncTime;
        private final String errorMessage;

        SyncStatusImpl(String path, String status, String region, long lastSyncTime, String errorMessage) {
            this.path = path;
            this.status = status;
            this.region = region;
            this.lastSyncTime = lastSyncTime;
            this.errorMessage = errorMessage;
        }

        @Override
        public String getPath() { return path; }

        @Override
        public String getStatus() { return status; }

        @Override
        public long getLastSyncTime() { return lastSyncTime; }

        @Override
        public String getRegion() { return region; }

        @Override
        public String getErrorMessage() { return errorMessage; }
    }

    private static class SyncHistoryImpl implements SyncHistory {
        private final String path;
        private final String status;
        private final long timestamp;
        private final String region;
        private final String trigger;

        SyncHistoryImpl(String path, String status, long timestamp, String region, String trigger) {
            this.path = path;
            this.status = status;
            this.timestamp = timestamp;
            this.region = region;
            this.trigger = trigger;
        }

        @Override
        public String getPath() { return path; }

        @Override
        public String getStatus() { return status; }

        @Override
        public long getTimestamp() { return timestamp; }

        @Override
        public String getRegion() { return region; }

        @Override
        public String getTrigger() { return trigger; }
    }
}
