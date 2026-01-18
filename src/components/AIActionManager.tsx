import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Settings, Copy, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { AIAction, AIActionExecution, AIActionStats } from '@/types/ai-actions';
import { aiActionService } from '@/services/aiActionService';

interface AIActionManagerProps {
  onActionSelect?: (action: AIAction) => void;
  onExecutionStart?: (execution: AIActionExecution) => void;
}

export const AIActionManager: React.FC<AIActionManagerProps> = ({
  onActionSelect,
  onExecutionStart
}) => {
  const [actions, setActions] = useState<AIAction[]>([]);
  const [executions, setExecutions] = useState<AIActionExecution[]>([]);
  const [stats, setStats] = useState<AIActionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const [executionInput, setExecutionInput] = useState('');
  const [activeTab, setActiveTab] = useState('actions');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [actionsData, executionsData, statsData] = await Promise.all([
        aiActionService.listActions(),
        aiActionService.listExecutions({ limit: 10 }),
        aiActionService.getSystemStats()
      ]);
      
      setActions(actionsData);
      setExecutions(executionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load AI actions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (action: AIAction) => {
    if (!executionInput.trim()) return;

    try {
      const execution = await aiActionService.executeAction(action.id, {
        input: executionInput,
        timestamp: new Date().toISOString()
      });
      
      setExecutions([execution, ...executions]);
      onExecutionStart?.(execution);
      setExecutionInput('');
      
      // Refresh executions list
      setTimeout(loadData, 2000);
    } catch (error) {
      console.error('Failed to execute AI action:', error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this AI action?')) return;

    try {
      await aiActionService.deleteAction(actionId);
      setActions(actions.filter(a => a.id !== actionId));
      if (selectedAction?.id === actionId) {
        setSelectedAction(null);
      }
    } catch (error) {
      console.error('Failed to delete AI action:', error);
    }
  };

  const handleCloneAction = async (action: AIAction) => {
    const newName = prompt('Enter a name for the cloned action:', `${action.name} (Copy)`);
    if (!newName) return;

    try {
      const clonedAction = await aiActionService.cloneAction(action.id, newName);
      setActions([clonedAction, ...actions]);
    } catch (error) {
      console.error('Failed to clone AI action:', error);
    }
  };

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(actions.map(action => action.category)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'content.generate': return '✍️';
      case 'content.transform': return '🔄';
      case 'content.translate': return '🌐';
      case 'content.summarize': return '📝';
      case 'content.optimize': return '⚡';
      case 'image.generate': return '🎨';
      case 'image.analyze': return '🔍';
      default: return '🤖';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.totalActions || 0}</div>
            <div className="text-sm text-gray-600">Total Actions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats?.enabledActions || 0}</div>
            <div className="text-sm text-gray-600">Enabled Actions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats?.totalExecutions || 0}</div>
            <div className="text-sm text-gray-600">Total Executions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats?.runningExecutions || 0}</div>
            <div className="text-sm text-gray-600">Running</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actions">AI Actions</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="create">Create Action</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setActiveTab('create')} className="sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Action
            </Button>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActions.map(action => (
              <Card key={action.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getActionTypeIcon(action.actionType)}</span>
                      <div>
                        <CardTitle className="text-lg">{action.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {action.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {action.enabled && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{action.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Provider: {action.aiProvider}</span>
                    <span>Model: {action.model}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedAction(action)}
                      className="flex-1"
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Execute
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCloneAction(action)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onActionSelect?.(action)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteAction(action.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <div className="space-y-4">
            {executions.map(execution => (
              <Card key={execution.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{execution.actionName}</h4>
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        Initiated by {execution.initiatedBy} • {execution.getFormattedDuration()}
                      </p>
                      
                      {execution.errorMessage && (
                        <p className="text-sm text-red-600">{execution.errorMessage}</p>
                      )}
                      
                      {execution.output && (
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(execution.output, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(execution.startedAt).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New AI Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                AI Actions allow you to define reusable content generation and manipulation tasks 
                powered by different AI providers. Configure the action type, provider, and prompts 
                to create automated content workflows.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Action Name" />
                <Input placeholder="Action Type" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="AI Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google AI</SelectItem>
                    <SelectItem value="ollama">Ollama</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                placeholder="Action Description"
                rows={3}
              />
              
              <Textarea
                placeholder="Prompt Template (use {{variable}} for dynamic values)"
                rows={6}
              />
              
              <div className="flex space-x-2">
                <Button>Save Action</Button>
                <Button variant="outline">Test Action</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Execution Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Execute: {selectedAction.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAction(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{selectedAction.description}</p>
              
              <Textarea
                placeholder="Enter input for the AI action..."
                value={executionInput}
                onChange={(e) => setExecutionInput(e.target.value)}
                rows={4}
              />
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleExecuteAction(selectedAction)}
                  disabled={!executionInput.trim()}
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Execute Action
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAction(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};