import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Cloud,
  CloudOff,
  Download,
  ExternalLink,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { AEMConnectionConfig, aemConnectionService, AEMInstance, AEMWorkflow, ConnectionTestResult } from '../services/aemConnection';

interface AEMIntegrationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImportWorkflow: (workflow: any) => void;
  exportFunction?: () => string;
}

export const AEMIntegrationPanel: React.FC<AEMIntegrationPanelProps> = ({
  isOpen,
  onClose,
  onImportWorkflow,
  exportFunction,
}) => {
  const [connections, setConnections] = useState<AEMInstance[]>(aemConnectionService.getConnections());
  const [activeConnection, setActiveConnection] = useState<AEMInstance | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [fetchingWorkflows, setFetchingWorkflows] = useState(false);
  const [workflows, setWorkflows] = useState<AEMWorkflow[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AEMConnectionConfig>({
    host: 'localhost',
    port: 4502,
    username: 'admin',
    password: 'admin',
    useSSL: false,
  });
  const [connectionName, setConnectionName] = useState('');

  const refreshConnections = () => {
    setConnections(aemConnectionService.getConnections());
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const result = await aemConnectionService.testConnection(formData);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Test failed' });
    }
    setTestingConnection(false);
  };

  const handleAddConnection = async () => {
    if (!connectionName.trim()) {return;}
    
    const result = await aemConnectionService.testConnection(formData);
    const status = result.success ? 'connected' : 'error';
    
    const newConnection = aemConnectionService.addConnection(connectionName, {
      ...formData,
    });
    
    aemConnectionService.updateConnection(newConnection.id, { status });
    refreshConnections();
    setShowAddForm(false);
    setConnectionName('');
    setTestResult(null);
  };

  const handleDeleteConnection = (id: string) => {
    aemConnectionService.removeConnection(id);
    if (activeConnection?.id === id) {
      setActiveConnection(null);
      setWorkflows([]);
    }
    refreshConnections();
  };

  const handleSelectConnection = async (connection: AEMInstance) => {
    setActiveConnection(connection);
    setWorkflows([]);
    
    const result = await aemConnectionService.testConnection(connection.config);
    const updated = aemConnectionService.updateConnection(connection.id, {
      status: result.success ? 'connected' : 'error',
      lastSync: result.success ? new Date().toISOString() : undefined,
    });
    
    if (updated) {
      setActiveConnection(updated);
      refreshConnections();
    }
  };

  const handleFetchWorkflows = async () => {
    if (!activeConnection) {return;}
    
    setFetchingWorkflows(true);
    try {
      const wfList = await aemConnectionService.fetchWorkflows(activeConnection.config);
      setWorkflows(wfList);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
    setFetchingWorkflows(false);
  };

  const handleImportWorkflow = async (workflow: AEMWorkflow) => {
    if (!activeConnection) {return;}
    
    try {
      const workflowData = await aemConnectionService.importWorkflow(
        activeConnection.config,
        workflow.modelId
      );
      onImportWorkflow(workflowData);
    } catch (error) {
      console.error('Failed to import workflow:', error);
    }
  };

  const handleExportToAEM = async () => {
    if (!activeConnection || !exportFunction) {return;}
    
    setSyncing(activeConnection.id);
    try {
      const xml = exportFunction();
      await aemConnectionService.deployWorkflow(activeConnection.config, xml, 'New Workflow');
      const updated = aemConnectionService.updateConnection(activeConnection.id, {
        lastSync: new Date().toISOString(),
      });
      if (updated) {
        setActiveConnection(updated);
        refreshConnections();
      }
    } catch (error) {
      console.error('Failed to export workflow:', error);
    }
    setSyncing(null);
  };

  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[800px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">AEM Integration</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 border-r border-gray-200 dark:border-gray-700 pr-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Connections</h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {connections.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No AEM connections configured</p>
              ) : (
                <div className="space-y-2">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      onClick={() => handleSelectConnection(conn)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        activeConnection?.id === conn.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4" />
                          <span className="font-medium text-sm">{conn.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {conn.status === 'connected' ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : conn.status === 'error' ? (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          ) : (
                            <CloudOff className="w-3 h-3 text-gray-400" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConnection(conn.id);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {conn.config.host}:{conn.config.port}
                      </p>
                      {conn.lastSync && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last sync: {new Date(conn.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showAddForm && (
                <div className="mt-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-sm mb-3">New Connection</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Connection Name"
                      value={connectionName}
                      onChange={(e) => setConnectionName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    />
                    <input
                      type="text"
                      placeholder="Host"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Port"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      />
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={formData.useSSL}
                          onChange={(e) => setFormData({ ...formData, useSSL: e.target.checked })}
                        />
                        SSL
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    />
                    
                    {testResult && (
                      <div className={`text-xs p-2 rounded ${
                        testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {testResult.message}
                        {testResult.version && ` (${testResult.instanceType} ${testResult.version})`}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded flex items-center justify-center gap-1"
                      >
                        {testingConnection ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Test
                      </button>
                      <button
                        onClick={handleAddConnection}
                        disabled={!connectionName.trim() || !testResult?.success}
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setTestResult(null);
                          setConnectionName('');
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-2">
              {activeConnection ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">
                      {activeConnection.name} Workflows
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleFetchWorkflows}
                        disabled={fetchingWorkflows}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${fetchingWorkflows ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      <button
                        onClick={handleExportToAEM}
                        disabled={!exportFunction || syncing}
                        className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded flex items-center gap-1 disabled:opacity-50"
                      >
                        <Upload className={`w-3 h-3 ${syncing ? 'animate-pulse' : ''}`} />
                        Deploy
                      </button>
                    </div>
                  </div>

                  {workflows.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Cloud className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Click "Refresh" to load workflows from AEM</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-auto">
                      {workflows.map((workflow) => (
                        <div
                          key={workflow.id}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{workflow.title}</h4>
                              <p className="text-xs text-gray-500">{workflow.description || 'No description'}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                ID: {workflow.modelId} | v{workflow.version}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleImportWorkflow(workflow)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                title="Import to AEMFlow"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <a
                                href={`${aemConnectionService.getBaseUrl(activeConnection.config)}/editor.html${workflow.modelId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                title="Open in AEM"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Select a connection to view workflows</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
