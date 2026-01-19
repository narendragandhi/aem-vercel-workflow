package com.example.aem.vercel.workflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.Map;

/**
 * AI Action definition model for content generation and manipulation tasks.
 * Similar to Contentful's AI Actions framework.
 */
@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
public class AIActionModel {

    @ValueMapValue
    @Default(values = "")
    private String id;

    @ValueMapValue
    @Default(values = "")
    private String name;

    @ValueMapValue
    @Default(values = "")
    private String description;

    @ValueMapValue
    @Default(values = "")
    private String actionType;

    @ValueMapValue
    @Default(values = "")
    private String category;

    @ValueMapValue
    @Default(values = "content")
    private String targetType;

    @ValueMapValue
    @Default(values = "")
    private String aiProvider;

    @ValueMapValue
    @Default(values = "")
    private String model;

    @ValueMapValue
    private Map<String, Object> configuration;

    @ValueMapValue
    private Map<String, Object> promptTemplate;

    @ValueMapValue
    private Map<String, Object> outputSchema;

    @ValueMapValue
    @Default(values = "1")
    private String version;

    @ValueMapValue
    @Default(values = "draft")
    private String status;

    @ValueMapValue
    @Default(values = "false")
    private String enabled;

    @ValueMapValue
    private String[] tags;

    @ValueMapValue
    private String[] contentTypes;

    // Runtime properties
    private boolean isValid;
    private String lastError;

    @PostConstruct
    protected void init() {
        validateConfiguration();
    }

    /**
     * AI Action types similar to Contentful
     */
    public interface ActionTypes {
        String CONTENT_GENERATE = "content.generate";
        String CONTENT_TRANSFORM = "content.transform";
        String CONTENT_TRANSLATE = "content.translate";
        String CONTENT_SUMMARIZE = "content.summarize";
        String CONTENT_OPTIMIZE = "content.optimize";
        String CONTENT_PERSONALIZE = "content.personalize";
        String CONTENT_ANALYZE = "content.analyze";
        String CONTENT_EXTRACT = "content.extract";
        String IMAGE_GENERATE = "image.generate";
        String IMAGE_ANALYZE = "image.analyze";
        String METADATA_GENERATE = "metadata.generate";
        String SEO_OPTIMIZE = "seo.optimize";
    }

    /**
     * AI Categories for organization
     */
    public interface Categories {
        String CONTENT_CREATION = "content-creation";
        String CONTENT_ENHANCEMENT = "content-enhancement";
        String LOCALIZATION = "localization";
        String SEO = "seo";
        String MEDIA = "media";
        String ANALYTICS = "analytics";
        String AUTOMATION = "automation";
        String ACCESSIBILITY = "accessibility";
    }

    /**
     * Common AI Providers
     */
    public interface Providers {
        String OPENAI = "openai";
        String ANTHROPIC = "anthropic";
        String GOOGLE = "google";
        String AZURE = "azure";
        String OLLAMA = "ollama";
        String CUSTOM = "custom";
        String GPT4_VISION = "gpt-4-vision";
    }

    private void validateConfiguration() {
        this.isValid = true;
        this.lastError = null;

        if (id == null || id.trim().isEmpty()) {
            this.isValid = false;
            this.lastError = "Action ID is required";
            return;
        }

        if (name == null || name.trim().isEmpty()) {
            this.isValid = false;
            this.lastError = "Action name is required";
            return;
        }

        if (actionType == null || actionType.trim().isEmpty()) {
            this.isValid = false;
            this.lastError = "Action type is required";
            return;
        }

        // Validate prompt template exists for generation actions
        if (actionType.startsWith("content.") && (promptTemplate == null || promptTemplate.isEmpty())) {
            this.isValid = false;
            this.lastError = "Prompt template is required for content actions";
        }
    }

    public boolean isEnabled() {
        return "true".equalsIgnoreCase(enabled);
    }

    /**
     * Check if this action supports the given content type
     */
    public boolean supportsContentType(String contentType) {
        if (contentTypes == null || contentTypes.length == 0) {
            return true; // Supports all content types by default
        }
        
        for (String supportedType : contentTypes) {
            if (supportedType.equalsIgnoreCase(contentType)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get prompt template for specific input
     */
    public String getPromptForInput(Map<String, Object> input) {
        if (promptTemplate == null || promptTemplate.isEmpty()) {
            return null;
        }

        String template = (String) promptTemplate.getOrDefault("template", "");
        Map<String, Object> variables = (Map<String, Object>) promptTemplate.getOrDefault("variables", Map.of());

        // Simple template substitution
        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = input.getOrDefault(entry.getKey(), entry.getValue()).toString();
            result = result.replace(placeholder, value);
        }

        return result;
    }
}