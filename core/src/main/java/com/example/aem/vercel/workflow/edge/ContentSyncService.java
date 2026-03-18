package com.example.aem.vercel.workflow.edge;

import java.util.List;

public interface ContentSyncService {
    void syncContent(String path);

    void syncContent(String[] paths);

    void syncContent(String path, String region);

    SyncStatus getSyncStatus(String path);

    List<SyncHistory> getSyncHistory(String path, int limit);

    void enableMultiRegionSync(boolean enabled);

    List<String> getSyncRegions();

    void setSyncRegions(List<String> regions);
}
