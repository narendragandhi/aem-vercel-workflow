package com.example.aem.vercel.workflow.service;

import org.apache.sling.api.resource.ResourceResolver;

public interface AuthorizationService {
    boolean canRead(ResourceResolver resourceResolver);

    boolean canWrite(ResourceResolver resourceResolver);

    default boolean canExecute(ResourceResolver resourceResolver) {
        return canWrite(resourceResolver);
    }
}
