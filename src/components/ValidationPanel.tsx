import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ValidationResult, ValidationIssue } from '../../utils/validator';

interface ValidationPanelProps {
  result: ValidationResult | null;
  onClose?: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ result, onClose }) => {
  if (!result) {
    return (
      <div className="p-4 text-gray-500 text-sm">No validation issues</div>
    );
  }

  const errorIssues = result.issues.filter((i) => i.severity === 'error');
  const warningIssues = result.issues.filter((i) => i.severity === 'warning');
  const infoIssues = result.issues.filter((i) => i.severity === 'info');

  return (
    <div className="validation-panel bg-white border-l border-gray-200 w-80 h-full overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Validation</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-3 border-b border-gray-100">
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            {result.errorCount} errors
          </span>
          <span className="flex items-center gap-1 text-yellow-600">
            <AlertTriangle className="w-4 h-4" />
            {result.warningCount} warnings
          </span>
          <span className="flex items-center gap-1 text-blue-600">
            <Info className="w-4 h-4" />
            {result.infoCount} info
          </span>
        </div>
      </div>

      <div className="p-2">
        {result.valid && result.issues.length === 0 ? (
          <div className="p-4 text-center text-green-600 text-sm">
            No issues found. Workflow is valid!
          </div>
        ) : (
          <div className="space-y-2">
            {errorIssues.length > 0 && (
              <div className="space-y-1">
                {errorIssues.map((issue) => (
                  <ValidationIssueItem key={issue.id} issue={issue} />
                ))}
              </div>
            )}
            {warningIssues.length > 0 && (
              <div className="space-y-1">
                {warningIssues.map((issue) => (
                  <ValidationIssueItem key={issue.id} issue={issue} />
                ))}
              </div>
            )}
            {infoIssues.length > 0 && (
              <div className="space-y-1">
                {infoIssues.map((issue) => (
                  <ValidationIssueItem key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ValidationIssueItem: React.FC<{ issue: ValidationIssue }> = ({ issue }) => {
  const icon = {
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };

  const bgColor = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`p-2 rounded border text-xs ${bgColor[issue.severity]}`}>
      <div className="flex items-start gap-2">
        {icon[issue.severity]}
        <div>
          <div className="font-medium text-gray-800">{issue.message}</div>
          <div className="text-gray-500 mt-1">Rule: {issue.rule}</div>
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
