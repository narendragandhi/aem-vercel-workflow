export interface AIAction {
  id: string;
  name: string;
  description: string;
  actionType: string;
  category: string;
  targetType: string;
  aiProvider: string;
  model: string;
  configuration?: Record<string, any>;
  promptTemplate?: PromptTemplate;
  outputSchema?: Record<string, any>;
  version: string;
  status: string;
  enabled: boolean;
  tags: string[];
  contentTypes: string[];
  isValid: boolean;
  lastError?: string;
}

export interface PromptTemplate {
  template: string;
  variables: Record<string, any>;
}

export interface AIActionExecution {
  id: string;
  actionId: string;
  actionName: string;
  actionType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  startedAt: Date;
  completedAt?: Date;
  duration: string;
  initiatedBy: string;
  resourcePath?: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  metadata?: Record<string, any>;
  configuration?: Record<string, any>;
  aiProvider: string;
  model: string;
  usage?: TokenUsage;
  errorMessage?: string;
  tags: string[];
  isCompleted: boolean;
  hasError: boolean;
  actualDuration: number;

  getFormattedDuration(): string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIActionStats {
  totalActions: number;
  enabledActions: number;
  totalExecutions: number;
  runningExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  totalCost: number;
  dailyUsage: Record<string, number>;
  popularActions: Array<{
    actionId: string;
    actionName: string;
    executionCount: number;
  }>;
}

export interface AIActionRequest {
  actionId: string;
  input: Record<string, any>;
  resourcePath?: string;
  initiatedBy?: string;
  metadata?: Record<string, any>;
}

export interface AIActionResponse {
  execution: AIActionExecution;
  success: boolean;
  message: string;
}

export interface AIActionListResponse {
  actions: AIAction[];
  total: number;
  limit?: number;
  offset?: number;
  success: boolean;
}

export interface AIActionExecutionListResponse {
  executions: AIActionExecution[];
  total: number;
  limit?: number;
  offset?: number;
  success: boolean;
}

export interface AIActionSearchRequest {
  query: string;
  category?: string;
  actionType?: string;
  enabled?: boolean;
  limit?: number;
  offset?: number;
}

export interface AIActionCreateRequest {
  name: string;
  description: string;
  actionType: string;
  category: string;
  targetType: string;
  aiProvider: string;
  model: string;
  configuration?: Record<string, any>;
  promptTemplate?: PromptTemplate;
  outputSchema?: Record<string, any>;
  tags?: string[];
  contentTypes?: string[];
}

export interface AIActionUpdateRequest {
  name?: string;
  description?: string;
  actionType?: string;
  category?: string;
  targetType?: string;
  aiProvider?: string;
  model?: string;
  configuration?: Record<string, any>;
  promptTemplate?: PromptTemplate;
  outputSchema?: Record<string, any>;
  version?: string;
  status?: string;
  enabled?: boolean;
  tags?: string[];
  contentTypes?: string[];
}

export interface AIActionTestRequest {
  input: Record<string, any>;
}

export interface AIActionCloneRequest {
  name: string;
}

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  available: boolean;
  models: AIModel[];
  configuration: Record<string, any>;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'image' | 'multimodal';
  maxTokens: number;
  costPerToken: number;
  features: string[];
}

export interface AIActionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  actionType: string;
  aiProvider: string;
  model: string;
  promptTemplate: PromptTemplate;
  variables: AIActionVariable[];
  tags: string[];
}

export interface AIActionVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
}

export interface AIActionContext {
  resourcePath: string;
  resourceType: string;
  pageProperties: Record<string, any>;
  componentData: Record<string, any>;
  userProfile: Record<string, any>;
  brandGuidelines: Record<string, any>;
  customContext: Record<string, any>;
}

export interface AIActionConfig {
  enabled: boolean;
  defaultProvider: string;
  defaultModel: string;
  maxExecutionTime: number;
  maxConcurrentExecutions: number;
  actionsStoragePath: string;
  executionsStoragePath: string;
  cacheEnabled: boolean;
  cacheSize: number;
  cacheTtl: number;
  requestTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableUsageTracking: boolean;
  enableCostTracking: boolean;
  dailyBudgetLimit: number;
  monthlyBudgetLimit: number;
  enableContentModeration: boolean;
  allowedUserGroups: string[];
  blockedUserGroups: string[];
  enableAuditLogging: boolean;
  auditLogPath: string;
  retentionPeriod: number;
  enableBrandGuidelines: boolean;
  brandGuidelinesPath: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  defaultTopP: number;
  defaultFrequencyPenalty: number;
  defaultPresencePenalty: number;
  enablePreviewMode: boolean;
  enableBatchProcessing: boolean;
  maxBatchSize: number;
  enableWebhookNotifications: boolean;
  webhookUrl: string;
  webhookEvents: string[];
  enableCustomPrompts: boolean;
  enableActionTemplates: boolean;
  actionTemplatesPath: string;
  enableApiRateLimiting: boolean;
  apiRateLimit: number;
  enableContextInjection: boolean;
  contextSources: string[];
  enableResultCaching: boolean;
  resultCacheSimilarityThreshold: number;
}