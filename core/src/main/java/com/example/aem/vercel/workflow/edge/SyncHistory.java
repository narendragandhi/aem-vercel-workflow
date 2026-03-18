package com.example.aem.vercel.workflow.edge;

public interface SyncHistory {
    String getPath();

    String getStatus();

    long getTimestamp();

    String getRegion();

    String getTrigger();
}
