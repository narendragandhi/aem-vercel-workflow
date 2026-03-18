package com.example.aem.vercel.workflow.edge;

public interface SyncStatus {
    String getPath();

    String getStatus();

    long getLastSyncTime();

    String getRegion();

    String getErrorMessage();
}
