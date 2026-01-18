package com.example.aem.vercel.workflow.service;

import com.example.aem.vercel.workflow.model.AIActionModel;
import java.util.List;

/**
 * Service for providing pre-configured AI action templates.
 */
public interface AIActionTemplateService {

    /**
     * Initializes the default AI action templates in the system.
     * @throws Exception if an error occurs during initialization.
     */
    void initializeDefaultTemplates() throws Exception;

    /**
     * Retrieves all available AI action templates.
     * @return a list of all AI action templates.
     * @throws Exception if an error occurs while retrieving templates.
     */
    List<AIActionModel> getAvailableTemplates() throws Exception;
}
