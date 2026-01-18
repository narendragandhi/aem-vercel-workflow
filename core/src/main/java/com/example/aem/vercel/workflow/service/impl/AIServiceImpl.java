package com.example.aem.vercel.workflow.service.impl;

import com.example.aem.vercel.workflow.service.AIService;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@Component(
    service = AIService.class,
    immediate = true
)
public class AIServiceImpl implements AIService {

    private static final Logger LOG = LoggerFactory.getLogger(AIServiceImpl.class);

    @Override
    public Map<String, Object> generateContent(String prompt, String aiProvider, String model) throws Exception {
        LOG.warn("Using dummy AIService. Content generation for prompt: '{}' with provider: '{}', model: '{}'",
                prompt, aiProvider, model);
        
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        content.put("generatedText", "This is dummy content generated for: " + prompt);
        result.put("content", content);
        
        Map<String, Object> usage = new HashMap<>();
        usage.put("promptTokens", prompt.length() / 4); // Estimate
        usage.put("completionTokens", content.get("generatedText").toString().length() / 4);
        result.put("usage", usage);
        
        return result;
    }
}