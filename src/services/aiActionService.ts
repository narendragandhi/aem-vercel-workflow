import { 
  AIAction, 
  AIActionExecution, 
  AIActionStats, 
  AIActionRequest,
  AIActionResponse,
  AIActionListResponse,
  AIActionExecutionListResponse,
  AIActionSearchRequest,
  AIActionCreateRequest,
  AIActionUpdateRequest,
  AIActionTestRequest,
  AIActionCloneRequest,
  AIActionConfig
} from '@/types/ai-actions';

class AIActionService {
  private baseUrl = '/api/ai-actions';
  private executionsUrl = '/api/ai-executions';

  /**
   * Get all AI actions
   */
  async listActions(params?: {
    category?: string;
    contentType?: string;
    enabled?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AIAction[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.contentType) queryParams.append('contentType', params.contentType);
      if (params?.enabled !== undefined) queryParams.append('enabled', params.enabled.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch AI actions');

      const data: AIActionListResponse = await response.json();
      return data.actions;
    } catch (error) {
      console.error('Error fetching AI actions:', error);
      throw error;
    }
  }

  /**
   * Get AI action by ID
   */
  async getAction(actionId: string): Promise<AIAction> {
    try {
      const response = await fetch(`${this.baseUrl}/${actionId}`);
      if (!response.ok) throw new Error('Failed to fetch AI action');

      const data = await response.json();
      return data.action;
    } catch (error) {
      console.error('Error fetching AI action:', error);
      throw error;
    }
  }

  /**
   * Create new AI action
   */
  async createAction(actionData: AIActionCreateRequest): Promise<AIAction> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      });
      
      if (!response.ok) throw new Error('Failed to create AI action');

      const data = await response.json();
      return data.action;
    } catch (error) {
      console.error('Error creating AI action:', error);
      throw error;
    }
  }

  /**
   * Update AI action
   */
  async updateAction(actionId: string, actionData: AIActionUpdateRequest): Promise<AIAction> {
    try {
      const response = await fetch(`${this.baseUrl}/${actionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      });
      
      if (!response.ok) throw new Error('Failed to update AI action');

      const data = await response.json();
      return data.action;
    } catch (error) {
      console.error('Error updating AI action:', error);
      throw error;
    }
  }

  /**
   * Delete AI action
   */
  async deleteAction(actionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${actionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete AI action');
    } catch (error) {
      console.error('Error deleting AI action:', error);
      throw error;
    }
  }

  /**
   * Search AI actions
   */
  async searchActions(searchParams: AIActionSearchRequest): Promise<AIAction[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', searchParams.query);
      if (searchParams.category) queryParams.append('category', searchParams.category);
      if (searchParams.actionType) queryParams.append('actionType', searchParams.actionType);
      if (searchParams.enabled !== undefined) queryParams.append('enabled', searchParams.enabled.toString());
      if (searchParams.limit) queryParams.append('limit', searchParams.limit.toString());
      if (searchParams.offset) queryParams.append('offset', searchParams.offset.toString());

      const response = await fetch(`${this.baseUrl}/search?${queryParams}`);
      if (!response.ok) throw new Error('Failed to search AI actions');

      const data: AIActionListResponse = await response.json();
      return data.actions;
    } catch (error) {
      console.error('Error searching AI actions:', error);
      throw error;
    }
  }

  /**
   * Execute AI action
   */
  async executeAction(actionId: string, input: Record<string, any>, resourcePath?: string): Promise<AIActionExecution> {
    try {
      const requestBody: AIActionRequest = {
        actionId,
        input,
        ...(resourcePath && { resourcePath }),
      };

      const response = await fetch(`${this.baseUrl}/${actionId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) throw new Error('Failed to execute AI action');

      const data: AIActionResponse = await response.json();
      return data.execution;
    } catch (error) {
      console.error('Error executing AI action:', error);
      throw error;
    }
  }

  /**
   * Test AI action
   */
  async testAction(actionId: string, testData: AIActionTestRequest): Promise<AIActionExecution> {
    try {
      const response = await fetch(`${this.baseUrl}/${actionId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      if (!response.ok) throw new Error('Failed to test AI action');

      const data: AIActionResponse = await response.json();
      return data.execution;
    } catch (error) {
      console.error('Error testing AI action:', error);
      throw error;
    }
  }

  /**
   * Clone AI action
   */
  async cloneAction(actionId: string, cloneData: AIActionCloneRequest): Promise<AIAction> {
    try {
      const response = await fetch(`${this.baseUrl}/${actionId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloneData),
      });
      
      if (!response.ok) throw new Error('Failed to clone AI action');

      const data = await response.json();
      return data.action;
    } catch (error) {
      console.error('Error cloning AI action:', error);
      throw error;
    }
  }

  /**
   * Get AI action executions
   */
  async listExecutions(params?: {
    actionId?: string;
    resourcePath?: string;
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AIActionExecution[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.actionId) queryParams.append('actionId', params.actionId);
      if (params?.resourcePath) queryParams.append('resourcePath', params.resourcePath);
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`${this.executionsUrl}?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch executions');

      const data: AIActionExecutionListResponse = await response.json();
      return data.executions;
    } catch (error) {
      console.error('Error fetching executions:', error);
      throw error;
    }
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: string): Promise<AIActionExecution> {
    try {
      const response = await fetch(`${this.executionsUrl}/${executionId}`);
      if (!response.ok) throw new Error('Failed to fetch execution');

      const data = await response.json();
      return data.execution;
    } catch (error) {
      console.error('Error fetching execution:', error);
      throw error;
    }
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.executionsUrl}/${executionId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to cancel execution');

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error canceling execution:', error);
      throw error;
    }
  }

  /**
   * Delete execution
   */
  async deleteExecution(executionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.executionsUrl}/${executionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete execution');
    } catch (error) {
      console.error('Error deleting execution:', error);
      throw error;
    }
  }

  /**
   * Get AI action statistics
   */
  async getActionStatistics(actionId: string): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${this.executionsUrl}/stats?actionId=${actionId}`);
      if (!response.ok) throw new Error('Failed to fetch action statistics');

      const data = await response.json();
      return data.statistics;
    } catch (error) {
      console.error('Error fetching action statistics:', error);
      throw error;
    }
  }

  /**
   * Get system-wide AI statistics
   */
  async getSystemStats(): Promise<AIActionStats> {
    try {
      const response = await fetch(`${this.executionsUrl}/stats?system=true`);
      if (!response.ok) throw new Error('Failed to fetch system statistics');

      const data = await response.json();
      return data.statistics;
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      throw error;
    }
  }

  /**
   * Get AI action configuration
   */
  async getConfiguration(): Promise<AIActionConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/config`);
      if (!response.ok) throw new Error('Failed to fetch configuration');

      return await response.json();
    } catch (error) {
      console.error('Error fetching configuration:', error);
      throw error;
    }
  }

  /**
   * Update AI action configuration
   */
  async updateConfiguration(config: Partial<AIActionConfig>): Promise<AIActionConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) throw new Error('Failed to update configuration');

      return await response.json();
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  }

  /**
   * Import AI actions from configuration
   */
  async importActions(configuration: Record<string, any>): Promise<AIAction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuration),
      });
      
      if (!response.ok) throw new Error('Failed to import actions');

      const data = await response.json();
      return data.actions;
    } catch (error) {
      console.error('Error importing actions:', error);
      throw error;
    }
  }

  /**
   * Export AI actions to configuration
   */
  async exportActions(actionIds: string[]): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionIds }),
      });
      
      if (!response.ok) throw new Error('Failed to export actions');

      return await response.json();
    } catch (error) {
      console.error('Error exporting actions:', error);
      throw error;
    }
  }

  /**
   * Get available AI providers
   */
  async getProviders(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/providers`);
      if (!response.ok) throw new Error('Failed to fetch providers');

      return await response.json();
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }

  /**
   * Test AI provider connection
   */
  async testProvider(providerId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/providers/${providerId}/test`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to test provider');

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error testing provider:', error);
      throw error;
    }
  }
}

export const aiActionService = new AIActionService();