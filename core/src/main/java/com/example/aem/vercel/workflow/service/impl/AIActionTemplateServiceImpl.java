package com.example.aem.vercel.workflow.service.impl;

import com.example.aem.vercel.workflow.model.AIActionModel;
import com.example.aem.vercel.workflow.service.AIActionService;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.aem.vercel.workflow.service.AIActionTemplateService;
import javax.annotation.PostConstruct;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for providing pre-configured AI action templates.
 * Includes common content generation templates for AEM.
 */
@Component(
    service = AIActionTemplateService.class,
    immediate = true
)
public class AIActionTemplateServiceImpl implements AIActionTemplateService {

    private static final Logger LOG = LoggerFactory.getLogger(AIActionTemplateServiceImpl.class);

    @Reference
    private AIActionService aiActionService;

    @PostConstruct
    protected void init() {
        try {
            initializeDefaultTemplates();
            LOG.info("AI Action Templates initialized");
        } catch (Exception e) {
            LOG.error("Failed to initialize AI Action Templates", e);
        }
    }

    @Override
    public void initializeDefaultTemplates() throws Exception {
        List<AIActionModel> templates = createDefaultTemplates();
        
        for (AIActionModel template : templates) {
            try {
                // Check if template already exists
                aiActionService.getAction(template.getId());
                LOG.debug("AI Action template already exists: {}", template.getId());
            } catch (Exception e) {
                // Template doesn't exist, create it
                aiActionService.createAction(template);
                LOG.info("Created AI Action template: {}", template.getName());
            }
        }
    }

    @Override
    public List<AIActionModel> getAvailableTemplates() throws Exception {
        // Dummy implementation for now
        return Collections.emptyList();
    }

    private List<AIActionModel> createDefaultTemplates() {
        return Arrays.asList(
            // Content Generation Templates
            createHeroBannerTemplate(),
            createProductDescriptionTemplate(),
            createBlogPostTemplate(),
            createEmailTemplate(),
            createSocialMediaTemplate(),
            
            // Content Enhancement Templates
            createSEOOptimizationTemplate(),
            createContentSummarizationTemplate(),
            createContentRewriteTemplate(),
            createTranslationTemplate(),
            
            // Metadata Templates
            createPageTitleTemplate(),
            createMetaDescriptionTemplate(),
            createAltTextTemplate(),
            createKeywordsTemplate(),
            
            // Analysis Templates
            createContentAnalysisTemplate(),
            createBrandComplianceTemplate(),
            createReadabilityAnalysisTemplate(),
            
            // Image Templates
            createImageDescriptionTemplate(),
            createImageAltTextTemplate()
        );
    }

    private AIActionModel createHeroBannerTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("hero-banner-generator");
        template.setName("Hero Banner Generator");
        template.setDescription("Generate compelling hero banners with headlines, subheadlines, and CTAs");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_GENERATE);
        template.setCategory(AIActionModel.Categories.CONTENT_CREATION);
        template.setTargetType("page");
        template.setAiProvider(AIActionModel.Providers.OPENAI);
        template.setModel("gpt-3.5-turbo");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"hero", "banner", "landing", "marketing"});
        template.setContentTypes(new String[]{"page", "experience-fragment"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Generate a hero banner for {{company}} targeting {{audience}} with the following specifications:\\n\\n" +
            "Theme: {{theme}}\\n" +
            "Product/Service: {{product}}\\n" +
            "Key Message: {{message}}\\n" +
            "Call to Action: {{cta}}\\n" +
            "Tone: {{tone}}\\n\\n" +
            "Please provide:\\n" +
            "1. Headline (max 6 words, bold and impactful)\\n" +
            "2. Subheadline (1-2 sentences, benefit-focused)\\n" +
            "3. Call to Action button text\\n" +
            "4. Visual description for background image\\n\\n" +
            "Format the response as JSON with keys: headline, subheadline, cta, visualDescription.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("company", "ACME Corporation");
        variables.put("audience", "Enterprise customers");
        variables.put("theme", "Digital transformation");
        variables.put("product", "Cloud platform");
        variables.put("message", "Accelerate your business growth");
        variables.put("cta", "Learn More");
        variables.put("tone", "Professional and inspiring");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);

        Map<String, Object> outputSchema = new HashMap<>();
        outputSchema.put("type", "object");
        outputSchema.put("properties", Map.of(
            "headline", Map.of("type", "string", "maxLength", 50),
            "subheadline", Map.of("type", "string", "maxLength", 200),
            "cta", Map.of("type", "string", "maxLength", 30),
            "visualDescription", Map.of("type", "string")
        ));
        template.setOutputSchema(outputSchema);

        return template;
    }

    private AIActionModel createProductDescriptionTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("product-description-generator");
        template.setName("Product Description Generator");
        template.setDescription("Generate SEO-optimized product descriptions");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_GENERATE);
        template.setCategory(AIActionModel.Categories.CONTENT_CREATION);
        template.setTargetType("product");
        template.setAiProvider(AIActionModel.Providers.OPENAI);
        template.setModel("gpt-4");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"product", "ecommerce", "seo", "description"});
        template.setContentTypes(new String[]{"product", "commerce-page"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Generate a compelling product description for {{productName}}:\\n\\n" +
            "Product Details: {{productDetails}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Key Features: {{keyFeatures}}\\n" +
            "Unique Selling Points: {{uniqueSellingPoints}}\\n" +
            "Price Range: {{priceRange}}\\n\\n" +
            "Please provide:\\n" +
            "1. Short description (under 150 characters for meta description)\\n" +
            "2. Long description (2-3 paragraphs with benefits and features)\\n" +
            "3. Bullet points for key features (5-7 points)\\n" +
            "4. SEO keywords (5-8 relevant terms)\\n" +
            "5. Suggested related products\\n\\n" +
            "Format as JSON with: shortDescription, longDescription, features, keywords, relatedProducts.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("productName", "Premium Wireless Headphones");
        variables.put("productDetails", "Noise-cancelling, 30-hour battery, premium sound quality");
        variables.put("targetAudience", "Audiophiles and professionals");
        variables.put("keyFeatures", "Active noise cancellation, Bluetooth 5.0, Comfortable padding");
        variables.put("uniqueSellingPoints", "Studio-quality sound, All-day comfort");
        variables.put("priceRange", "$200-300");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createBlogPostTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("blog-post-generator");
        template.setName("Blog Post Generator");
        template.setDescription("Generate complete blog posts with structure and SEO optimization");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_GENERATE);
        template.setCategory(AIActionModel.Categories.CONTENT_CREATION);
        template.setTargetType("blog");
        template.setAiProvider(AIActionModel.Providers.ANTHROPIC);
        template.setModel("claude-3-sonnet");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"blog", "content", "seo", "article"});
        template.setContentTypes(new String[]{"blog", "article"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Write a comprehensive blog post about {{topic}} for {{targetAudience}}:\\n\\n" +
            "Outline: {{outline}}\\n" +
            "Key Points: {{keyPoints}}\\n" +
            "Call to Action: {{callToAction}}\\n" +
            "SEO Focus Keywords: {{keywords}}\\n" +
            "Tone: {{tone}}\\n\\n" +
            "Please provide:\\n" +
            "1. SEO-optimized title (under 60 characters)\\n" +
            "2. Meta description (under 160 characters)\\n" +
            "3. Blog post content (800-1200 words)\\n" +
            "4. H2 and H3 headings for structure\\n" +
            "5. Conclusion with call to action\\n" +
            "6. Suggested internal links\\n\\n" +
            "Use conversational, engaging tone with clear structure. Include examples and actionable insights.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("topic", "Digital Transformation Trends");
        variables.put("targetAudience", "Business leaders");
        variables.put("outline", "Introduction, Key trends, Implementation strategies, Future outlook");
        variables.put("keyPoints", "AI integration, Cloud migration, Customer experience");
        variables.put("callToAction", "Download our transformation guide");
        variables.put("keywords", "digital transformation, AI, cloud technology");
        variables.put("tone", "Authoritative yet accessible");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createSEOOptimizationTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("seo-optimizer");
        template.setName("SEO Content Optimizer");
        template.setDescription("Optimize content for search engines and user engagement");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_OPTIMIZE);
        template.setCategory(AIActionModel.Categories.SEO);
        template.setTargetType("content");
        template.setAiProvider(AIActionModel.Providers.OPENAI);
        template.setModel("gpt-4");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"seo", "optimization", "content", "search"});
        template.setContentTypes(new String[]{"page", "blog", "article", "product"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Optimize the following content for SEO and user engagement:\\n\\n" +
            "Content: {{content}}\\n" +
            "Target Keywords: {{targetKeywords}}\\n" +
            "Secondary Keywords: {{secondaryKeywords}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Content Goal: {{contentGoal}}\\n\\n" +
            "Please provide:\\n" +
            "1. Optimized title (under 60 characters)\\n" +
            "2. Meta description (under 160 characters)\\n" +
            "3. Improved content with keyword integration\\n" +
            "4. SEO score (0-100)\\n" +
            "5. Recommendations for improvement\\n" +
            "6. Internal linking suggestions\\n\\n" +
            "Focus on readability, keyword density, user intent, and search engine best practices.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("content", "Original content goes here");
        variables.put("targetKeywords", "primary keyword");
        variables.put("secondaryKeywords", "secondary keywords");
        variables.put("targetAudience", "target audience");
        variables.put("contentGoal", "inform/persuade/convert");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createContentSummarizationTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("content-summarizer");
        template.setName("Content Summarizer");
        template.setDescription("Generate concise summaries of long-form content");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_SUMMARIZE);
        template.setCategory(AIActionModel.Categories.CONTENT_ENHANCEMENT);
        template.setTargetType("content");
        template.setAiProvider(AIActionModel.Providers.ANTHROPIC);
        template.setModel("claude-3-haiku");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"summary", "concise", "extraction", "briefing"});
        template.setContentTypes(new String[]{"page", "blog", "article", "report"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Create a comprehensive summary of the following content:\\n\\n" +
            "Content: {{content}}\\n" +
            "Summary Length: {{summaryLength}}\\n" +
            "Focus Area: {{focusArea}}\\n" +
            "Audience: {{audience}}\\n" +
            "Format: {{format}}\\n\\n" +
            "Requirements:\\n" +
            "- Capture key points and main arguments\\n" +
            "- Maintain factual accuracy\\n" +
            "- Use clear, concise language\\n" +
            "- Include relevant data and statistics\\n" +
            "- End with key takeaways\\n\\n" +
            "Please provide a structured summary that's easy to scan and understand.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("content", "Long-form content to summarize");
        variables.put("summaryLength", "Brief/Medium/Detailed");
        variables.put("focusArea", "Main points/Key findings/Recommendations");
        variables.put("audience", "Executive/Technical/General");
        variables.put("format", "Bullets/Paragraph/Executive summary");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createTranslationTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("content-translator");
        template.setName("Content Translator");
        template.setDescription("Translate content to multiple languages while preserving meaning and tone");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_TRANSLATE);
        template.setCategory(AIActionModel.Categories.LOCALIZATION);
        template.setTargetType("content");
        template.setAiProvider(AIActionModel.Providers.GOOGLE);
        template.setModel("gemini-pro");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"translation", "localization", "multilingual", "global"});
        template.setContentTypes(new String[]{"page", "blog", "article", "product", "component"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Translate the following content from {{sourceLanguage}} to {{targetLanguage}}:\\n\\n" +
            "Content: {{content}}\\n" +
            "Content Type: {{contentType}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Brand Tone: {{brandTone}}\\n" +
            "Cultural Considerations: {{culturalConsiderations}}\\n\\n" +
            "Translation Requirements:\\n" +
            "- Maintain original meaning and intent\\n" +
            "- Adapt cultural references appropriately\\n" +
            "- Preserve brand voice and tone\\n" +
            "- Ensure natural, fluent language\\n" +
            "- Consider local terminology and expressions\\n\\n" +
            "Please provide:\\n" +
            "1. Translated content\\n" +
            "2. Cultural adaptation notes\\n" +
            "3. Quality assessment score\\n" +
            "4. Suggestions for localization improvements\\n\\n" +
            "Focus on accuracy, cultural sensitivity, and natural language flow.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("sourceLanguage", "English");
        variables.put("targetLanguage", "Spanish");
        variables.put("content", "Content to translate");
        variables.put("contentType", "Marketing/Product/Technical");
        variables.put("targetAudience", "Local audience description");
        variables.put("brandTone", "Professional/Friendly/Casual");
        variables.put("culturalConsiderations", "Any specific cultural notes");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createPageTitleTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("page-title-generator");
        template.setName("Page Title Generator");
        template.setDescription("Generate SEO-optimized page titles");
        template.setActionType(AIActionModel.ActionTypes.METADATA_GENERATE);
        template.setCategory(AIActionModel.Categories.SEO);
        template.setTargetType("page");
        template.setAiProvider(AIActionModel.Providers.OPENAI);
        template.setModel("gpt-3.5-turbo");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"seo", "title", "metadata", "page"});
        template.setContentTypes(new String[]{"page", "blog", "article"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Generate SEO-optimized page titles for {{pageContent}}:\\n\\n" +
            "Target Keywords: {{targetKeywords}}\\n" +
            "Secondary Keywords: {{secondaryKeywords}}\\n" +
            "Brand Name: {{brandName}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Page Purpose: {{pagePurpose}}\\n\\n" +
            "Requirements:\\n" +
            "- Under 60 characters\\n" +
            "- Include primary keyword\\n" +
            "- Be compelling and clickable\\n" +
            "- Match user search intent\\n" +
            "- Include brand when appropriate\\n\\n" +
            "Please provide 5 title options with:\\n" +
            "1. Primary recommendation\\n" +
            "2. 4 alternative options\\n" +
            "3. SEO score for each\\n" +
            "4. Click-through rate prediction\\n\\n" +
            "Format as JSON with titles array and scores.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("pageContent", "Brief description of page content");
        variables.put("targetKeywords", "Primary keyword");
        variables.put("secondaryKeywords", "Secondary keywords");
        variables.put("brandName", "Company brand");
        variables.put("targetAudience", "Target audience");
        variables.put("pagePurpose", "Inform/sell/convert");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createEmailTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("email-template-generator");
        template.setName("Email Template Generator");
        template.setDescription("Generate engaging email templates for marketing campaigns");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_GENERATE);
        template.setCategory(AIActionModel.Categories.CONTENT_CREATION);
        template.setTargetType("email");
        template.setAiProvider(AIActionModel.Providers.OPENAI);
        template.setModel("gpt-4");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"email", "marketing", "campaign", "template"});
        template.setContentTypes(new String[]{"email", "newsletter"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Create an engaging email template for {{campaignPurpose}}:\\n\\n" +
            "Offer Details: {{offerDetails}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Key Benefits: {{keyBenefits}}\\n" +
            "Call to Action: {{callToAction}}\\n" +
            "Brand Voice: {{brandVoice}}\\n\\n" +
            "Please provide:\\n" +
            "1. Subject line (under 50 characters)\\n" +
            "2. Preheader text (under 100 characters)\\n" +
            "3. Email body (3-4 sections)\\n" +
            "4. Call to action button text\\n" +
            "5. Alternative subject lines (3 options)\\n\\n" +
            "Focus on:\\n" +
            "- Compelling subject lines with emojis if appropriate\\n" +
            "- Personalization opportunities\\n" +
            "- Mobile-friendly formatting\\n" +
            "- Clear value proposition\\n" +
            "- Strong call to action\\n\\n" +
            "Format as JSON with all sections clearly labeled.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("campaignPurpose", "Product launch/Sale/Newsletter");
        variables.put("offerDetails", "Specific offer details");
        variables.put("targetAudience", "Target audience segment");
        variables.put("keyBenefits", "Main benefits to highlight");
        variables.put("callToAction", "Desired action");
        variables.put("brandVoice", "Professional/Friendly/Urgent");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createSocialMediaTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("social-media-generator");
        template.setName("Social Media Post Generator");
        template.setDescription("Generate social media posts for different platforms");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_GENERATE);
        template.setCategory(AIActionModel.Categories.CONTENT_CREATION);
        template.setTargetType("social");
        template.setAiProvider(AIActionModel.Providers.ANTHROPIC);
        template.setModel("claude-3-sonnet");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"social", "media", "post", "platform"});
        template.setContentTypes(new String[]{"social", "campaign"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Create social media posts for {{platforms}} about {{topic}}:\\n\\n" +
            "Key Message: {{keyMessage}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Campaign Hashtag: {{campaignHashtag}}\\n" +
            "Call to Action: {{callToAction}}\\n" +
            "Visual Elements: {{visualElements}}\\n\\n" +
            "For each platform, provide:\\n" +
            "1. Post text (with character limits in mind)\\n" +
            "2. Relevant hashtags\\n" +
            "3. Engagement prompts\\n" +
            "4. Best posting time suggestion\\n" +
            "5. Visual content recommendations\\n\\n" +
            "Platforms: LinkedIn, Twitter, Instagram, Facebook\\n\\n" +
            "Adapt tone and format for each platform's audience and best practices.\\n" +
            "Format as JSON with platform-specific sections.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("platforms", "LinkedIn, Twitter, Instagram, Facebook");
        variables.put("topic", "Topic for social media posts");
        variables.put("keyMessage", "Main message to convey");
        variables.put("targetAudience", "Target audience demographics");
        variables.put("campaignHashtag", "#CampaignHashtag");
        variables.put("callToAction", "Desired user action");
        variables.put("visualElements", "Visual assets available");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createMetaDescriptionTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("meta-description-generator");
        template.setName("Meta Description Generator");
        template.setDescription("Generate compelling meta descriptions for SEO");
        template.setActionType(AIActionModel.ActionTypes.METADATA_GENERATE);
        template.setCategory(AIActionModel.Categories.SEO);
        template.setTargetType("page");
        template.setAiProvider(AIActionModel.Providers.OPENAI);
        template.setModel("gpt-3.5-turbo");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"seo", "meta", "description", "search"});
        template.setContentTypes(new String[]{"page", "blog", "article", "product"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Generate compelling meta descriptions for {{pageContent}}:\\n\\n" +
            "Primary Keyword: {{primaryKeyword}}\\n" +
            "Secondary Keywords: {{secondaryKeywords}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Value Proposition: {{valueProposition}}\\n" +
            "Call to Action: {{callToAction}}\\n\\n" +
            "Requirements:\\n" +
            "- Under 160 characters\\n" +
            "- Include primary keyword naturally\\n" +
            "- Create curiosity and urgency\\n" +
            "- Include call to action\\n" +
            "- Match search intent\\n\\n" +
            "Please provide 5 meta description options with:\\n" +
            "1. Primary recommendation\\n" +
            "2. 4 alternative versions\\n" +
            "3. SEO score for each\\n" +
            "4. Click-through rate prediction\\n\\n" +
            "Focus on user benefits, urgency, and search visibility.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("pageContent", "Brief page content summary");
        variables.put("primaryKeyword", "Main target keyword");
        variables.put("secondaryKeywords", "Secondary keywords");
        variables.put("targetAudience", "Target search audience");
        variables.put("valueProposition", "Key value proposition");
        variables.put("callToAction", "Desired click action");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createAltTextTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("alt-text-generator");
        template.setName("Alt Text Generator");
        template.setDescription("Generate descriptive alt text for images");
        template.setActionType(AIActionModel.ActionTypes.METADATA_GENERATE);
        template.setCategory(AIActionModel.Categories.ACCESSIBILITY);
        template.setTargetType("image");
        template.setAiProvider(AIActionModel.Providers.GPT4_VISION);
        template.setModel("gpt-4-vision-preview");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"alt", "text", "accessibility", "image", "seo"});
        template.setContentTypes(new String[]{"image", "asset"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Generate descriptive alt text for the provided image:\\n\\n" +
            "Image Context: {{imageContext}}\\n" +
            "Content Purpose: {{contentPurpose}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "SEO Keywords: {{seoKeywords}}\\n\\n" +
            "Please provide:\\n" +
            "1. Concise alt text (under 125 characters)\\n" +
            "2. Detailed description (for extended context)\\n" +
            "3. Key elements identified\\n" +
            "4. Accessibility assessment score\\n\\n" +
            "Alt text guidelines:\\n" +
            "- Describe what's important for understanding\\n" +
            "- Include relevant context and information\\n" +
            "- Be factual and objective\\n" +
            "- Avoid \"image of\" or \"picture of\"\\n" +
            "- Include text visible in the image\\n\\n" +
            "Focus on accessibility, SEO value, and user understanding.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("imageContext", "Context where image appears");
        variables.put("contentPurpose", "Purpose of the image");
        variables.put("targetAudience", "Content audience");
        variables.put("seoKeywords", "Relevant SEO terms");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createKeywordsTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("keyword-generator");
        template.setName("Keyword Generator");
        template.setDescription("Generate relevant keywords for content optimization");
        template.setActionType(AIActionModel.ActionTypes.METADATA_GENERATE);
        template.setCategory(AIActionModel.Categories.SEO);
        template.setTargetType("content");
        template.setAiProvider(AIActionModel.Providers.OPENAI);
        template.setModel("gpt-4");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"keywords", "seo", "optimization", "search"});
        template.setContentTypes(new String[]{"page", "blog", "article", "product"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Generate comprehensive keywords for {{content}}:\\n\\n" +
            "Content Type: {{contentType}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Business Goals: {{businessGoals}}\\n" +
            "Geographic Focus: {{geographicFocus}}\\n" +
            "Industry: {{industry}}\\n\\n" +
            "Please provide:\\n" +
            "1. Primary keywords (5-8 high-intent terms)\\n" +
            "2. Secondary keywords (10-15 related terms)\\n" +
            "3. Long-tail keywords (8-12 specific phrases)\\n" +
            "4. Question keywords (5-7 informational queries)\\n" +
            "5. Local keywords (if applicable)\\n" +
            "6. Competitor keywords to target\\n\\n" +
            "For each keyword category, include:\\n" +
            "- Search volume estimate\\n" +
            "- Difficulty rating\\n" +
            "- User intent (informational/navigational/transactional)\\n" +
            "- Content gap opportunities\\n\\n" +
            "Format as structured JSON with keyword categories and metrics.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("content", "Content summary for keyword generation");
        variables.put("contentType", "Blog/Product/Page/Service");
        variables.put("targetAudience", "Target audience description");
        variables.put("businessGoals", "Primary business objectives");
        variables.put("geographicFocus", "Geographic target area");
        variables.put("industry", "Industry or niche");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createContentAnalysisTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("content-analyzer");
        template.setName("Content Analyzer");
        template.setDescription("Analyze content for quality, readability, and performance");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_ANALYZE);
        template.setCategory(AIActionModel.Categories.ANALYTICS);
        template.setTargetType("content");
        template.setAiProvider(AIActionModel.Providers.ANTHROPIC);
        template.setModel("claude-3-opus");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"analysis", "quality", "readability", "performance"});
        template.setContentTypes(new String[]{"page", "blog", "article", "product"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Analyze the following content for quality and performance:\\n\\n" +
            "Content: {{content}}\\n" +
            "Content Type: {{contentType}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Content Goals: {{contentGoals}}\\n" +
            "Success Metrics: {{successMetrics}}\\n\\n" +
            "Please analyze and provide:\\n" +
            "1. Overall quality score (0-100)\\n" +
            "2. Readability assessment\\n" +
            "3. SEO optimization score\\n" +
            "4. Engagement potential\\n" +
            "5. Conversion effectiveness\\n" +
            "6. Brand alignment assessment\\n" +
            "7. Specific improvement recommendations\\n" +
            "8. Content strengths to leverage\\n\\n" +
            "Include detailed analysis of:\\n" +
            "- Structure and flow\\n" +
            "- Language and tone\\n" +
            "- Keyword optimization\\n" +
            "- Call-to-action effectiveness\\n" +
            "- User experience considerations\\n\\n" +
            "Format as comprehensive analysis with actionable insights.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("content", "Content to analyze");
        variables.put("contentType", "Type of content");
        variables.put("targetAudience", "Target audience");
        variables.put("contentGoals", "Primary content objectives");
        variables.put("successMetrics", "How success is measured");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createBrandComplianceTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("brand-compliance-checker");
        template.setName("Brand Compliance Checker");
        template.setDescription("Check content against brand guidelines and standards");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_ANALYZE);
        template.setCategory(AIActionModel.Categories.ANALYTICS);
        template.setTargetType("content");
        template.setAiProvider(AIActionModel.Providers.ANTHROPIC);
        template.setModel("claude-3-sonnet");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"brand", "compliance", "guidelines", "standards"});
        template.setContentTypes(new String[]{"page", "blog", "article", "email", "social"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Check content compliance with brand guidelines:\\n\\n" +
            "Content: {{content}}\\n" +
            "Brand Guidelines: {{brandGuidelines}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Content Type: {{contentType}}\\n" +
            "Brand Voice: {{brandVoice}}\\n\\n" +
            "Please assess:\\n" +
            "1. Brand voice alignment (0-100)\\n" +
            "2. Tone consistency check\\n" +
            "3. Messaging compliance\\n" +
            "4. Visual brand elements usage\\n" +
            "5. Legal compliance (disclaimers, trademarks)\\n" +
            "6. Competitive differentiation\\n" +
            "7. Cultural sensitivity\\n" +
            "8. Required corrections\\n\\n" +
            "Brand standards to check:\\n" +
            "- Writing style and tone\\n" +
            "- Terminology usage\\n" +
            "- Color and design references\\n" +
            "- Legal requirements\\n" +
            "- Customer service standards\\n" +
            "- Competitive positioning\\n\\n" +
            "Provide specific corrections needed and compliance score.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("content", "Content to check");
        variables.put("brandGuidelines", "Key brand guidelines");
        variables.put("targetAudience", "Target audience");
        variables.put("contentType", "Content type");
        variables.put("brandVoice", "Brand voice description");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createReadabilityAnalysisTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("readability-analyzer");
        template.setName("Readability Analyzer");
        template.setDescription("Analyze content readability and provide improvement suggestions");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_ANALYZE);
        template.setCategory(AIActionModel.Categories.ANALYTICS);
        template.setTargetType("content");
        template.setAiProvider(AIActionModel.Providers.OPENAI);
        template.setModel("gpt-4");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"readability", "analysis", "accessibility", "usability"});
        template.setContentTypes(new String[]{"page", "blog", "article", "document"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Analyze content readability and accessibility:\\n\\n" +
            "Content: {{content}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "Content Purpose: {{contentPurpose}}\\n" +
            "Reading Level Target: {{readingLevel}}\\n\\n" +
            "Please provide:\\n" +
            "1. Overall readability score (0-100)\\n" +
            "2. Reading grade level assessment\\n" +
            "3. Sentence structure analysis\\n" +
            "4. Vocabulary complexity assessment\\n" +
            "5. Paragraph structure review\\n" +
            "6. Formatting recommendations\\n" +
            "7. Accessibility improvements\\n" +
            "8. Mobile readability assessment\\n\\n" +
            "Specific analysis areas:\\n" +
            "- Sentence length and variation\\n" +
            "- Word choice and complexity\\n" +
            "- Paragraph length and structure\\n" +
            "- Use of headings and lists\\n" +
            "- Active vs. passive voice\\n" +
            "- Jargon and technical terms\\n" +
            "- Reading time estimation\\n\\n" +
            "Provide concrete improvements with before/after examples.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("content", "Content to analyze");
        variables.put("targetAudience", "Target audience reading level");
        variables.put("contentPurpose", "Purpose of the content");
        variables.put("readingLevel", "Target reading level (8th grade, etc.)");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createContentRewriteTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("content-rewriter");
        template.setName("Content Rewriter");
        template.setDescription("Rewrite content for different audiences and purposes");
        template.setActionType(AIActionModel.ActionTypes.CONTENT_TRANSFORM);
        template.setCategory(AIActionModel.Categories.CONTENT_ENHANCEMENT);
        template.setTargetType("content");
        template.setAiProvider(AIActionModel.Providers.ANTHROPIC);
        template.setModel("claude-3-opus");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"rewrite", "transform", "adapt", "repurpose"});
        template.setContentTypes(new String[]{"page", "blog", "article", "email", "social"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Rewrite the following content for {{newPurpose}}:\\n\\n" +
            "Original Content: {{content}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "New Format: {{newFormat}}\\n" +
            "Tone Adjustment: {{toneAdjustment}}\\n" +
            "Key Message: {{keyMessage}}\\n" +
            "Length Target: {{lengthTarget}}\\n\\n" +
            "Rewrite requirements:\\n" +
            "- Maintain core message and intent\\n" +
            "- Adapt language and style for new audience\\n" +
            "- Optimize for new format and platform\\n" +
            "- Incorporate SEO keywords if applicable\\n" +
            "- Include appropriate calls to action\\n\\n" +
            "Please provide:\\n" +
            "1. Rewritten content\\n" +
            "2. Changes made and rationale\\n" +
            "3. Improvement suggestions\\n" +
            "4. SEO enhancements (if applicable)\\n" +
            "5. Engagement predictions\\n\\n" +
            "Focus on clarity, engagement, and achieving the new content objectives.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("content", "Original content to rewrite");
        variables.put("newPurpose", "New purpose or goal");
        variables.put("targetAudience", "New target audience");
        variables.put("newFormat", "New format (blog, social, email, etc.)");
        variables.put("toneAdjustment", "Required tone changes");
        variables.put("keyMessage", "Key message to emphasize");
        variables.put("lengthTarget", "Target length (shorter, longer, specific)");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createImageDescriptionTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("image-description-generator");
        template.setName("Image Description Generator");
        template.setDescription("Generate detailed descriptions for images and visual content");
        template.setActionType(AIActionModel.ActionTypes.IMAGE_ANALYZE);
        template.setCategory(AIActionModel.Categories.MEDIA);
        template.setTargetType("image");
        template.setAiProvider(AIActionModel.Providers.GPT4_VISION);
        template.setModel("gpt-4-vision-preview");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"image", "description", "analysis", "visual"});
        template.setContentTypes(new String[]{"image", "asset", "gallery"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Generate comprehensive descriptions for the provided image:\\n\\n" +
            "Image Context: {{imageContext}}\\n" +
            "Content Purpose: {{contentPurpose}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "SEO Keywords: {{seoKeywords}}\\n" +
            "Detail Level: {{detailLevel}}\\n\\n" +
            "Please provide:\\n" +
            "1. Brief description (1-2 sentences)\\n" +
            "2. Detailed description (3-5 sentences)\\n" +
            "3. Visual elements inventory\\n" +
            "4. Color palette description\\n" +
            "5. Mood and atmosphere\\n" +
            "6. Technical details (lighting, composition)\\n" +
            "7. Context and setting\\n" +
            "8. Accessibility considerations\\n\\n" +
            "Description guidelines:\\n" +
            "- Be factual and objective\\n" +
            "- Include relevant details for understanding\\n" +
            "- Describe composition and visual hierarchy\\n" +
            "- Note any text or symbols visible\\n" +
            "- Consider emotional impact\\n" +
            "- Provide context for understanding\\n\\n" +
            "Format as structured descriptions for different use cases.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("imageContext", "Where image will be used");
        variables.put("contentPurpose", "Purpose of the image");
        variables.put("targetAudience", "Content audience");
        variables.put("seoKeywords", "Relevant SEO terms");
        variables.put("detailLevel", "Brief/Medium/Detailed");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }

    private AIActionModel createImageAltTextTemplate() {
        AIActionModel template = new AIActionModel();
        template.setId("image-alt-text-analyzer");
        template.setName("Image Alt Text Analyzer");
        template.setDescription("Analyze images and generate optimal alt text for accessibility and SEO");
        template.setActionType(AIActionModel.ActionTypes.IMAGE_ANALYZE);
        template.setCategory(AIActionModel.Categories.ACCESSIBILITY);
        template.setTargetType("image");
        template.setAiProvider(AIActionModel.Providers.GPT4_VISION);
        template.setModel("gpt-4-vision-preview");
        template.setVersion("1.0");
        template.setStatus("published");
        template.setEnabled("true");
        template.setTags(new String[]{"alt", "text", "accessibility", "image", "seo"});
        template.setContentTypes(new String[]{"image", "asset"});

        Map<String, Object> promptTemplate = new HashMap<>();
        promptTemplate.put("template", "Analyze the provided image and generate optimal alt text:\\n\\n" +
            "Image Context: {{imageContext}}\\n" +
            "Page Purpose: {{pagePurpose}}\\n" +
            "Target Audience: {{targetAudience}}\\n" +
            "SEO Keywords: {{seoKeywords}}\\n" +
            "Alt Text Length: {{altTextLength}}\\n\\n" +
            "Please provide:\\n" +
            "1. Primary alt text (under 125 characters)\\n" +
            "2. Extended alt text (for complex images)\\n" +
            "3. SEO-optimized alt text\\n" +
            "4. Accessibility score (0-100)\\n" +
            "5. SEO optimization score\\n" +
            "6. Key elements to include\\n" +
            "7. Elements to exclude\\n" +
            "8. Cultural considerations\\n\\n" +
            "Alt text best practices:\\n" +
            "- Describe the content and function\\n" +
            "- Be concise yet informative\\n" +
            "- Include relevant keywords naturally\\n" +
            "- Consider user intent\\n" +
            "- Ensure accessibility compliance\\n" +
            "- Match brand voice\\n\\n" +
            "Analyze the image thoroughly and provide optimized alt text options.");

        Map<String, Object> variables = new HashMap<>();
        variables.put("imageContext", "Context where image appears");
        variables.put("pagePurpose", "Purpose of the page");
        variables.put("targetAudience", "Content audience");
        variables.put("seoKeywords", "Relevant SEO terms");
        variables.put("altTextLength", "Brief/Medium/Long");
        promptTemplate.put("variables", variables);

        template.setPromptTemplate(promptTemplate);
        return template;
    }
}