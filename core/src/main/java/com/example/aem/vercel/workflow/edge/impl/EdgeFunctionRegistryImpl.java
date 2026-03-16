package com.example.aem.vercel.workflow.edge.impl;

import com.example.aem.vercel.workflow.edge.EdgeFunctionRegistry;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component(service = EdgeFunctionRegistry.class)
public class EdgeFunctionRegistryImpl implements EdgeFunctionRegistry {

    private static final Logger LOG = LoggerFactory.getLogger(EdgeFunctionRegistryImpl.class);

    private final Map<String, EdgeFunction> functions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, String>> functionVersions = new ConcurrentHashMap<>();

    @Override
    public void registerFunction(EdgeFunction function) {
        if (function == null || function.getId() == null) {
            throw new IllegalArgumentException("Function and function ID cannot be null");
        }
        functions.put(function.getId(), function);
        functionVersions.putIfAbsent(function.getId(), new ConcurrentHashMap<>());
        functionVersions.get(function.getId()).put("v1", "DEPLOYED");
        LOG.info("Registered edge function: {}", function.getId());
    }

    @Override
    public void unregisterFunction(String functionId) {
        functions.remove(functionId);
        LOG.info("Unregistered edge function: {}", functionId);
    }

    @Override
    public EdgeFunction getFunction(String functionId) {
        return functions.get(functionId);
    }

    @Override
    public List<EdgeFunction> getAllFunctions() {
        return new ArrayList<>(functions.values());
    }

    @Override
    public void deployFunction(String functionId) {
        deployFunction(functionId, "us-east-1");
    }

    @Override
    public void deployFunction(String functionId, String targetRegion) {
        EdgeFunction function = functions.get(functionId);
        if (function == null) {
            throw new IllegalArgumentException("Function not found: " + functionId);
        }

        Map<String, String> versions = functionVersions.computeIfAbsent(functionId, k -> new ConcurrentHashMap<>());
        String newVersion = "v" + (versions.size() + 1);
        versions.put(newVersion, "DEPLOYING");

        LOG.info("Deploying edge function {} to region {}", functionId, targetRegion);

        try {
            Thread.sleep(500);
            versions.put(newVersion, "DEPLOYED");
            LOG.info("Successfully deployed edge function {} version {} to {}", functionId, newVersion, targetRegion);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            versions.put(newVersion, "FAILED");
            LOG.error("Failed to deploy edge function: {}", e.getMessage());
        }
    }

    @Override
    public void deleteFunction(String functionId) {
        functions.remove(functionId);
        functionVersions.remove(functionId);
        LOG.info("Deleted edge function: {}", functionId);
    }

    @Override
    public Map<String, String> getFunctionVersions(String functionId) {
        return functionVersions.getOrDefault(functionId, Map.of());
    }
}
