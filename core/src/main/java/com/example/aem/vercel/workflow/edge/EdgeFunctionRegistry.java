package com.example.aem.vercel.workflow.edge;

import java.util.List;
import java.util.Map;

public interface EdgeFunctionRegistry {
    void registerFunction(EdgeFunction function);

    void unregisterFunction(String functionId);

    EdgeFunction getFunction(String functionId);

    List<EdgeFunction> getAllFunctions();

    void deployFunction(String functionId);

    void deployFunction(String functionId, String targetRegion);

    void deleteFunction(String functionId);

    Map<String, String> getFunctionVersions(String functionId);
}
