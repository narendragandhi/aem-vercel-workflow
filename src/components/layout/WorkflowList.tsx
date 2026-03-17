import React, { useState } from 'react';
import { Clock, FolderOpen, Plus, Search, Tag, Trash2, User } from 'lucide-react';
import { useWorkspaceStore, WorkflowMetadata } from '@/stores/workspaceStore';

interface WorkflowListProps {
  onSelectWorkflow: (workflow: WorkflowMetadata) => void;
  onNewWorkflow: () => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
  onSelectWorkflow,
  onNewWorkflow,
}) => {
  const { workflows, folders, currentFolderId, searchWorkflows, deleteWorkflow, setCurrentFolder } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolders, setShowFolders] = useState(true);

  const displayWorkflows = searchQuery ? searchWorkflows(searchQuery) : workflows.filter(w => w.folderId === currentFolderId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Workflows</h2>
          <button
            onClick={onNewWorkflow}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="New Workflow"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Folders */}
      {showFolders && folders.length > 0 && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
            Folders
          </div>
          <button
            onClick={() => setCurrentFolder(null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${
              currentFolderId === null ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FolderOpen size={16} />
            All Workflows
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setCurrentFolder(folder.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${
                currentFolderId === folder.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FolderOpen size={16} />
              {folder.name}
            </button>
          ))}
        </div>
      )}

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto p-2">
        {displayWorkflows.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FolderOpen size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No workflows yet</p>
            <button
              onClick={onNewWorkflow}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create your first workflow
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {displayWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onSelectWorkflow(workflow)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {workflow.name}
                    </h3>
                    {workflow.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {workflow.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(workflow.updatedAt)}
                      </span>
                      {workflow.createdBy && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {workflow.createdBy}
                        </span>
                      )}
                      {workflow.version !== undefined && (
                        <span className="flex items-center gap-1">
                          v{workflow.version}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this workflow?')) {
                        deleteWorkflow(workflow.id);
                      }
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {workflow.tags && workflow.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {workflow.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default WorkflowList;
