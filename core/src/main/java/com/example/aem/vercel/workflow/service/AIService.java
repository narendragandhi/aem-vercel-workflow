package com.example.aem.vercel.workflow.service;

import java.util.Map;

/**
 * Interface for AI Service integration.
 * Provides methods for generating content using AI models.
 */
public interface AIService {

    /**
     * Generates content based on a prompt using a specified AI provider and model.
     *
     * @param prompt The input prompt for content generation.
     * @param aiProvider The AI provider to use (e.g., "openai", "gemini").
     * @param model The specific AI model to use (e.g., "gpt-4", "gemini-pro").
     * @return A map containing the generated content and usage information.
     * @throws Exception if an error occurs during content generation.
     */
    Map<String, Object> generateContent(String prompt, String aiProvider, String model) throws Exception;
}
