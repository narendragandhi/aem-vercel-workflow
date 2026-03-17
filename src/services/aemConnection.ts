export interface AEMConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  useSSL: boolean;
}

export interface AEMInstance {
  id: string;
  name: string;
  config: AEMConnectionConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

export interface AEMWorkflow {
  id: string;
  title: string;
  modelId: string;
  description: string;
  version: string;
  lastModified: string;
}

export interface AEMWorkflowPackage {
  id: string;
  path: string;
  name: string;
  workflows: string[];
}

export type AuthType = 'basic' | 'token' | 'oauth';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  version?: string;
  instanceType?: string;
}

const STORAGE_KEY = 'aemflow_aem_connections';

class AEMConnectionService {
  private getStoredConnections(): AEMInstance[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveConnections(connections: AEMInstance[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  }

  getConnections(): AEMInstance[] {
    return this.getStoredConnections();
  }

  addConnection(name: string, config: AEMConnectionConfig): AEMInstance {
    const connections = this.getStoredConnections();
    const newInstance: AEMInstance = {
      id: `aem-${Date.now()}`,
      name,
      config,
      status: 'disconnected',
    };
    connections.push(newInstance);
    this.saveConnections(connections);
    return newInstance;
  }

  removeConnection(id: string): void {
    const connections = this.getStoredConnections();
    const filtered = connections.filter(c => c.id !== id);
    this.saveConnections(filtered);
  }

  updateConnection(id: string, updates: Partial<AEMInstance>): AEMInstance | null {
    const connections = this.getStoredConnections();
    const index = connections.findIndex(c => c.id === id);
    if (index === -1) {return null;}
    connections[index] = { ...connections[index], ...updates };
    this.saveConnections(connections);
    return connections[index];
  }

  getBaseUrl(config: AEMConnectionConfig): string {
    const protocol = config.useSSL ? 'https' : 'http';
    return `${protocol}://${config.host}:${config.port}`;
  }

  async testConnection(config: AEMConnectionConfig): Promise<ConnectionTestResult> {
    const baseUrl = this.getBaseUrl(config);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const auth = btoa(`${config.username}:${config.password}`);
      
      const response = await fetch(`${baseUrl}/libs/cq/workflow/admin/rest/version.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Successfully connected to AEM instance',
          version: data.version || 'Unknown',
          instanceType: data.instanceType || 'AEM',
        };
      } if (response.status === 401) {
        return {
          success: false,
          message: 'Authentication failed. Check your credentials.',
        };
      } 
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`,
        };
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'Connection timeout. Check if the AEM instance is running.',
          };
        }
        return {
          success: false,
          message: `Connection error: ${error.message}`,
        };
      }
      return {
        success: false,
        message: 'Unknown error occurred',
      };
    }
  }

  async fetchWorkflows(config: AEMConnectionConfig): Promise<AEMWorkflow[]> {
    const baseUrl = this.getBaseUrl(config);
    const auth = btoa(`${config.username}:${config.password}`);

    const response = await fetch(`${baseUrl}/bin/workflow/models.json`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.models?.map((model: any) => ({
      id: model.id,
      title: model.title || model.name,
      modelId: model.id,
      description: model.description || '',
      version: model.version || '1.0',
      lastModified: model.lastModified || new Date().toISOString(),
    })) || [];
  }

  async importWorkflow(config: AEMConnectionConfig, modelId: string): Promise<any> {
    const baseUrl = this.getBaseUrl(config);
    const auth = btoa(`${config.username}:${config.password}`);

    const response = await fetch(`${baseUrl}/bin/workflow/models${modelId}.json`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to import workflow: ${response.statusText}`);
    }

    return response.json();
  }

  async exportWorkflow(config: AEMConnectionConfig, workflowXml: string, modelId: string): Promise<boolean> {
    const baseUrl = this.getBaseUrl(config);
    const auth = btoa(`${config.username}:${config.password}`);

    const formData = new FormData();
    formData.append('model', workflowXml);

    const response = await fetch(`${baseUrl}/bin/workflow/models${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    return response.ok;
  }

  async deployWorkflow(config: AEMConnectionConfig, workflowXml: string, title: string): Promise<{ modelId: string }> {
    const baseUrl = this.getBaseUrl(config);
    const auth = btoa(`${config.username}:${config.password}`);

    const response = await fetch(`${baseUrl}/bin/workflow/models`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/xml',
      },
      body: workflowXml,
    });

    if (!response.ok) {
      throw new Error(`Failed to deploy workflow: ${response.statusText}`);
    }

    const data = await response.json();
    return { modelId: data.id || title.toLowerCase().replace(/\s+/g, '-') };
  }
}

export const aemConnectionService = new AEMConnectionService();
