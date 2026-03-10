/**
 * Advanced Workflow Templates for AEMFlow
 *
 * A comprehensive collection of production-ready workflow templates
 * covering common AEM enterprise scenarios.
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'assets' | 'forms' | 'integration' | 'governance' | 'marketing' | 'commerce';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedSteps: number;
  tags: string[];
  nodes: any[];
  edges: any[];
}

export const ADVANCED_TEMPLATES: WorkflowTemplate[] = [
  // ============================================
  // CONTENT MANAGEMENT WORKFLOWS
  // ============================================
  {
    id: 'content-approval-multi-level',
    name: 'Multi-Level Content Approval',
    description: 'Enterprise content approval with author, editor, legal, and executive sign-off stages',
    category: 'content',
    complexity: 'complex',
    estimatedSteps: 8,
    tags: ['approval', 'content', 'enterprise', 'governance'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 400, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'author-review', type: 'aemStep', position: { x: 400, y: 150 }, data: { label: 'Author Review', description: 'Initial content review by author', participant: 'content-authors', stepType: 'participant' } },
      { id: 'editor-review', type: 'aemStep', position: { x: 400, y: 260 }, data: { label: 'Editor Review', description: 'Editorial review for quality and style', participant: 'content-editors', stepType: 'participant', timeout: 1440 } },
      { id: 'editor-decision', type: 'branch', position: { x: 400, y: 370 }, data: { label: 'Editor Approved?', branchType: 'xor' } },
      { id: 'legal-review', type: 'aemStep', position: { x: 550, y: 480 }, data: { label: 'Legal Review', description: 'Legal compliance check', participant: 'legal-team', stepType: 'participant', timeout: 2880 } },
      { id: 'legal-decision', type: 'branch', position: { x: 550, y: 590 }, data: { label: 'Legal Approved?', branchType: 'xor' } },
      { id: 'exec-approval', type: 'aemStep', position: { x: 700, y: 700 }, data: { label: 'Executive Approval', description: 'Final executive sign-off', participant: 'executives', stepType: 'participant' } },
      { id: 'publish', type: 'pageActivation', position: { x: 700, y: 810 }, data: { label: 'Publish Content', description: 'Activate content to publish instance' } },
      { id: 'notify-success', type: 'emailNotification', position: { x: 700, y: 920 }, data: { label: 'Notify Stakeholders', description: 'Send publication notification' } },
      { id: 'revision-needed', type: 'emailNotification', position: { x: 250, y: 480 }, data: { label: 'Request Revisions', description: 'Notify author of required changes' } },
      { id: 'end', type: 'startEnd', position: { x: 400, y: 1030 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'author-review', animated: true },
      { id: 'e2', source: 'author-review', target: 'editor-review', animated: true },
      { id: 'e3', source: 'editor-review', target: 'editor-decision', animated: true },
      { id: 'e4', source: 'editor-decision', target: 'legal-review', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e5', source: 'editor-decision', target: 'revision-needed', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e6', source: 'legal-review', target: 'legal-decision', animated: true },
      { id: 'e7', source: 'legal-decision', target: 'exec-approval', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e8', source: 'legal-decision', target: 'revision-needed', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e9', source: 'exec-approval', target: 'publish', animated: true },
      { id: 'e10', source: 'publish', target: 'notify-success', animated: true },
      { id: 'e11', source: 'notify-success', target: 'end', animated: true },
      { id: 'e12', source: 'revision-needed', target: 'author-review', animated: true },
    ],
  },

  {
    id: 'scheduled-publishing',
    name: 'Scheduled Content Publishing',
    description: 'Schedule content for future publication with embargo and timezone support',
    category: 'content',
    complexity: 'medium',
    estimatedSteps: 6,
    tags: ['scheduling', 'publishing', 'embargo', 'automation'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'content-ready', type: 'aemStep', position: { x: 300, y: 150 }, data: { label: 'Mark Content Ready', description: 'Author marks content as ready for scheduling', participant: 'content-authors' } },
      { id: 'schedule-review', type: 'aemStep', position: { x: 300, y: 260 }, data: { label: 'Review & Schedule', description: 'Set publication date and time', participant: 'content-managers' } },
      { id: 'wait-for-schedule', type: 'processStep', position: { x: 300, y: 370 }, data: { label: 'Wait for Schedule', description: 'System waits until scheduled time', processType: 'wait', processHandler: 'com.day.cq.workflow.impl.process.ScheduledProcess' } },
      { id: 'publish', type: 'pageActivation', position: { x: 300, y: 480 }, data: { label: 'Publish Content', description: 'Activate at scheduled time' } },
      { id: 'notify-published', type: 'emailNotification', position: { x: 300, y: 590 }, data: { label: 'Publication Notice', description: 'Notify stakeholders of publication' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 700 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'content-ready', animated: true },
      { id: 'e2', source: 'content-ready', target: 'schedule-review', animated: true },
      { id: 'e3', source: 'schedule-review', target: 'wait-for-schedule', animated: true },
      { id: 'e4', source: 'wait-for-schedule', target: 'publish', animated: true },
      { id: 'e5', source: 'publish', target: 'notify-published', animated: true },
      { id: 'e6', source: 'notify-published', target: 'end', animated: true },
    ],
  },

  {
    id: 'content-expiration',
    name: 'Content Expiration & Archive',
    description: 'Automatically handle content expiration, archival, and cleanup',
    category: 'content',
    complexity: 'medium',
    estimatedSteps: 7,
    tags: ['expiration', 'archive', 'cleanup', 'governance'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'check-expiration', type: 'processStep', position: { x: 300, y: 150 }, data: { label: 'Check Expiration', description: 'Verify content has expired', processType: 'automated' } },
      { id: 'expired-decision', type: 'branch', position: { x: 300, y: 260 }, data: { label: 'Content Expired?', branchType: 'xor' } },
      { id: 'notify-owner', type: 'emailNotification', position: { x: 450, y: 370 }, data: { label: 'Notify Content Owner', description: 'Alert owner of expiration' } },
      { id: 'extend-decision', type: 'aemStep', position: { x: 450, y: 480 }, data: { label: 'Review Expiration', description: 'Owner decides to extend or archive', participant: 'content-owners' } },
      { id: 'extend-branch', type: 'branch', position: { x: 450, y: 590 }, data: { label: 'Extend?', branchType: 'xor' } },
      { id: 'archive-content', type: 'processStep', position: { x: 300, y: 700 }, data: { label: 'Archive Content', description: 'Move to archive location', processType: 'automated' } },
      { id: 'deactivate', type: 'pageActivation', position: { x: 300, y: 810 }, data: { label: 'Deactivate Page', description: 'Unpublish expired content' } },
      { id: 'update-expiration', type: 'processStep', position: { x: 600, y: 700 }, data: { label: 'Update Expiration', description: 'Set new expiration date', processType: 'automated' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 920 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'check-expiration', animated: true },
      { id: 'e2', source: 'check-expiration', target: 'expired-decision', animated: true },
      { id: 'e3', source: 'expired-decision', target: 'notify-owner', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e4', source: 'expired-decision', target: 'end', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e5', source: 'notify-owner', target: 'extend-decision', animated: true },
      { id: 'e6', source: 'extend-decision', target: 'extend-branch', animated: true },
      { id: 'e7', source: 'extend-branch', target: 'update-expiration', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e8', source: 'extend-branch', target: 'archive-content', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e9', source: 'archive-content', target: 'deactivate', animated: true },
      { id: 'e10', source: 'deactivate', target: 'end', animated: true },
      { id: 'e11', source: 'update-expiration', target: 'end', animated: true },
    ],
  },

  // ============================================
  // DIGITAL ASSET MANAGEMENT WORKFLOWS
  // ============================================
  {
    id: 'dam-brand-portal-sync',
    name: 'Brand Portal Sync',
    description: 'Sync approved assets to Adobe Brand Portal with metadata validation',
    category: 'assets',
    complexity: 'complex',
    estimatedSteps: 9,
    tags: ['brand-portal', 'dam', 'sync', 'metadata'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'asset-upload', type: 'damUpdate', position: { x: 300, y: 150 }, data: { label: 'Asset Upload', description: 'Process uploaded asset' } },
      { id: 'virus-scan', type: 'processStep', position: { x: 300, y: 260 }, data: { label: 'Virus Scan', description: 'Security scan for uploaded asset', processType: 'automated', processHandler: 'com.custom.workflow.VirusScanProcess' } },
      { id: 'scan-result', type: 'branch', position: { x: 300, y: 370 }, data: { label: 'Scan Clean?', branchType: 'xor' } },
      { id: 'generate-renditions', type: 'damTranscode', position: { x: 450, y: 480 }, data: { label: 'Generate Renditions', description: 'Create web and thumbnail versions' } },
      { id: 'metadata-extraction', type: 'damMetadata', position: { x: 450, y: 590 }, data: { label: 'Extract Metadata', description: 'Extract and write XMP metadata', xmpWrite: true } },
      { id: 'brand-review', type: 'aemStep', position: { x: 450, y: 700 }, data: { label: 'Brand Review', description: 'Brand team reviews asset', participant: 'brand-managers' } },
      { id: 'brand-approved', type: 'branch', position: { x: 450, y: 810 }, data: { label: 'Brand Approved?', branchType: 'xor' } },
      { id: 'sync-brand-portal', type: 'processStep', position: { x: 600, y: 920 }, data: { label: 'Sync to Brand Portal', description: 'Publish to Brand Portal', processType: 'automated', processHandler: 'com.adobe.cq.dam.mac.impl.BrandPortalPublishProcess' } },
      { id: 'quarantine', type: 'processStep', position: { x: 150, y: 480 }, data: { label: 'Quarantine Asset', description: 'Move to quarantine folder', processType: 'automated' } },
      { id: 'reject-notify', type: 'emailNotification', position: { x: 300, y: 920 }, data: { label: 'Rejection Notice', description: 'Notify uploader of rejection' } },
      { id: 'end', type: 'startEnd', position: { x: 450, y: 1030 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'asset-upload', animated: true },
      { id: 'e2', source: 'asset-upload', target: 'virus-scan', animated: true },
      { id: 'e3', source: 'virus-scan', target: 'scan-result', animated: true },
      { id: 'e4', source: 'scan-result', target: 'generate-renditions', sourceHandle: 'true', animated: true, label: 'Clean' },
      { id: 'e5', source: 'scan-result', target: 'quarantine', sourceHandle: 'false', animated: true, label: 'Infected' },
      { id: 'e6', source: 'generate-renditions', target: 'metadata-extraction', animated: true },
      { id: 'e7', source: 'metadata-extraction', target: 'brand-review', animated: true },
      { id: 'e8', source: 'brand-review', target: 'brand-approved', animated: true },
      { id: 'e9', source: 'brand-approved', target: 'sync-brand-portal', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e10', source: 'brand-approved', target: 'reject-notify', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e11', source: 'sync-brand-portal', target: 'end', animated: true },
      { id: 'e12', source: 'reject-notify', target: 'end', animated: true },
      { id: 'e13', source: 'quarantine', target: 'end', animated: true },
    ],
  },

  {
    id: 'dam-video-processing',
    name: 'Video Asset Processing',
    description: 'Complete video processing pipeline with transcoding, thumbnails, and delivery',
    category: 'assets',
    complexity: 'complex',
    estimatedSteps: 10,
    tags: ['video', 'transcoding', 'dam', 'media'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'video-upload', type: 'damUpdate', position: { x: 300, y: 150 }, data: { label: 'Video Upload', description: 'Ingest video file' } },
      { id: 'extract-metadata', type: 'damMetadata', position: { x: 300, y: 260 }, data: { label: 'Extract Video Metadata', description: 'Duration, codec, resolution', xmpWrite: true } },
      { id: 'generate-thumbnail', type: 'processStep', position: { x: 150, y: 370 }, data: { label: 'Generate Thumbnails', description: 'Create video poster frames', processType: 'automated' } },
      { id: 'transcode-web', type: 'damTranscode', position: { x: 300, y: 370 }, data: { label: 'Web Transcode', description: 'MP4 H.264 for web delivery' } },
      { id: 'transcode-mobile', type: 'damTranscode', position: { x: 450, y: 370 }, data: { label: 'Mobile Transcode', description: 'Optimized for mobile devices' } },
      { id: 'caption-check', type: 'branch', position: { x: 300, y: 480 }, data: { label: 'Captions Required?', branchType: 'xor' } },
      { id: 'add-captions', type: 'aemStep', position: { x: 450, y: 590 }, data: { label: 'Add Captions', description: 'Upload or generate captions', participant: 'video-editors' } },
      { id: 'quality-review', type: 'aemStep', position: { x: 300, y: 700 }, data: { label: 'Quality Review', description: 'Review video quality', participant: 'qa-team' } },
      { id: 'publish-cdn', type: 'processStep', position: { x: 300, y: 810 }, data: { label: 'Publish to CDN', description: 'Deploy to content delivery network', processType: 'automated' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 920 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'video-upload', animated: true },
      { id: 'e2', source: 'video-upload', target: 'extract-metadata', animated: true },
      { id: 'e3', source: 'extract-metadata', target: 'generate-thumbnail', animated: true },
      { id: 'e4', source: 'extract-metadata', target: 'transcode-web', animated: true },
      { id: 'e5', source: 'extract-metadata', target: 'transcode-mobile', animated: true },
      { id: 'e6', source: 'generate-thumbnail', target: 'caption-check', animated: true },
      { id: 'e7', source: 'transcode-web', target: 'caption-check', animated: true },
      { id: 'e8', source: 'transcode-mobile', target: 'caption-check', animated: true },
      { id: 'e9', source: 'caption-check', target: 'add-captions', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e10', source: 'caption-check', target: 'quality-review', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e11', source: 'add-captions', target: 'quality-review', animated: true },
      { id: 'e12', source: 'quality-review', target: 'publish-cdn', animated: true },
      { id: 'e13', source: 'publish-cdn', target: 'end', animated: true },
    ],
  },

  {
    id: 'dam-bulk-import',
    name: 'Bulk Asset Import',
    description: 'Process bulk asset imports with validation, categorization, and tagging',
    category: 'assets',
    complexity: 'complex',
    estimatedSteps: 8,
    tags: ['bulk', 'import', 'dam', 'migration'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'validate-batch', type: 'processStep', position: { x: 300, y: 150 }, data: { label: 'Validate Batch', description: 'Check file formats and sizes', processType: 'automated' } },
      { id: 'validation-result', type: 'branch', position: { x: 300, y: 260 }, data: { label: 'Valid Batch?', branchType: 'xor' } },
      { id: 'categorize-assets', type: 'processStep', position: { x: 450, y: 370 }, data: { label: 'Auto-Categorize', description: 'AI-powered asset categorization', processType: 'automated' } },
      { id: 'apply-tags', type: 'processStep', position: { x: 450, y: 480 }, data: { label: 'Smart Tagging', description: 'Apply AI-generated tags', processType: 'automated', processHandler: 'com.adobe.cq.dam.processor.TaggingProcess' } },
      { id: 'generate-renditions', type: 'damTranscode', position: { x: 450, y: 590 }, data: { label: 'Batch Renditions', description: 'Generate all renditions' } },
      { id: 'review-sample', type: 'aemStep', position: { x: 450, y: 700 }, data: { label: 'Review Sample', description: 'QA reviews sample assets', participant: 'dam-admins' } },
      { id: 'notify-complete', type: 'emailNotification', position: { x: 450, y: 810 }, data: { label: 'Import Complete', description: 'Notify requestor of completion' } },
      { id: 'report-errors', type: 'emailNotification', position: { x: 150, y: 370 }, data: { label: 'Report Errors', description: 'Send validation error report' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 920 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'validate-batch', animated: true },
      { id: 'e2', source: 'validate-batch', target: 'validation-result', animated: true },
      { id: 'e3', source: 'validation-result', target: 'categorize-assets', sourceHandle: 'true', animated: true, label: 'Valid' },
      { id: 'e4', source: 'validation-result', target: 'report-errors', sourceHandle: 'false', animated: true, label: 'Invalid' },
      { id: 'e5', source: 'categorize-assets', target: 'apply-tags', animated: true },
      { id: 'e6', source: 'apply-tags', target: 'generate-renditions', animated: true },
      { id: 'e7', source: 'generate-renditions', target: 'review-sample', animated: true },
      { id: 'e8', source: 'review-sample', target: 'notify-complete', animated: true },
      { id: 'e9', source: 'notify-complete', target: 'end', animated: true },
      { id: 'e10', source: 'report-errors', target: 'end', animated: true },
    ],
  },

  // ============================================
  // FORMS WORKFLOWS
  // ============================================
  {
    id: 'forms-loan-application',
    name: 'Loan Application Processing',
    description: 'Complete loan application workflow with credit check, underwriting, and document generation',
    category: 'forms',
    complexity: 'complex',
    estimatedSteps: 12,
    tags: ['loan', 'forms', 'financial', 'underwriting'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'form-submit', type: 'formsProcess', position: { x: 300, y: 150 }, data: { label: 'Application Submitted', description: 'Loan application received', submitAction: 'submit' } },
      { id: 'validate-data', type: 'processStep', position: { x: 300, y: 260 }, data: { label: 'Validate Data', description: 'Check required fields and formats', processType: 'automated' } },
      { id: 'credit-check', type: 'processStep', position: { x: 300, y: 370 }, data: { label: 'Credit Check', description: 'External credit bureau check', processType: 'external', processHandler: 'com.custom.workflow.CreditCheckProcess' } },
      { id: 'credit-result', type: 'branch', position: { x: 300, y: 480 }, data: { label: 'Credit Score OK?', branchType: 'xor' } },
      { id: 'underwriter-review', type: 'aemStep', position: { x: 450, y: 590 }, data: { label: 'Underwriter Review', description: 'Manual underwriting review', participant: 'underwriters', timeout: 2880 } },
      { id: 'underwriter-decision', type: 'branch', position: { x: 450, y: 700 }, data: { label: 'Approved?', branchType: 'xor' } },
      { id: 'generate-docs', type: 'formsProcess', position: { x: 600, y: 810 }, data: { label: 'Generate Documents', description: 'Create loan documents', submitAction: 'generate' } },
      { id: 'send-approval', type: 'emailNotification', position: { x: 600, y: 920 }, data: { label: 'Send Approval', description: 'Notify applicant of approval' } },
      { id: 'send-rejection', type: 'emailNotification', position: { x: 150, y: 590 }, data: { label: 'Send Rejection', description: 'Notify applicant of rejection' } },
      { id: 'conditional-approval', type: 'emailNotification', position: { x: 300, y: 810 }, data: { label: 'Conditional Approval', description: 'Request additional documents' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 1030 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'form-submit', animated: true },
      { id: 'e2', source: 'form-submit', target: 'validate-data', animated: true },
      { id: 'e3', source: 'validate-data', target: 'credit-check', animated: true },
      { id: 'e4', source: 'credit-check', target: 'credit-result', animated: true },
      { id: 'e5', source: 'credit-result', target: 'underwriter-review', sourceHandle: 'true', animated: true, label: 'Good' },
      { id: 'e6', source: 'credit-result', target: 'send-rejection', sourceHandle: 'false', animated: true, label: 'Poor' },
      { id: 'e7', source: 'underwriter-review', target: 'underwriter-decision', animated: true },
      { id: 'e8', source: 'underwriter-decision', target: 'generate-docs', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e9', source: 'underwriter-decision', target: 'conditional-approval', sourceHandle: 'false', animated: true, label: 'Conditional' },
      { id: 'e10', source: 'generate-docs', target: 'send-approval', animated: true },
      { id: 'e11', source: 'send-approval', target: 'end', animated: true },
      { id: 'e12', source: 'send-rejection', target: 'end', animated: true },
      { id: 'e13', source: 'conditional-approval', target: 'end', animated: true },
    ],
  },

  {
    id: 'forms-employee-onboarding',
    name: 'Employee Onboarding',
    description: 'HR onboarding workflow with document collection, IT provisioning, and training',
    category: 'forms',
    complexity: 'complex',
    estimatedSteps: 10,
    tags: ['hr', 'onboarding', 'forms', 'employee'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'collect-info', type: 'formsProcess', position: { x: 300, y: 150 }, data: { label: 'Collect Employee Info', description: 'New hire information form', submitAction: 'submit' } },
      { id: 'hr-review', type: 'aemStep', position: { x: 300, y: 260 }, data: { label: 'HR Review', description: 'Verify employee information', participant: 'hr-team' } },
      { id: 'create-accounts', type: 'processStep', position: { x: 150, y: 370 }, data: { label: 'Create IT Accounts', description: 'Provision email, system access', processType: 'automated' } },
      { id: 'order-equipment', type: 'processStep', position: { x: 300, y: 370 }, data: { label: 'Order Equipment', description: 'Laptop, phone, badge', processType: 'automated' } },
      { id: 'assign-training', type: 'processStep', position: { x: 450, y: 370 }, data: { label: 'Assign Training', description: 'Mandatory compliance training', processType: 'automated' } },
      { id: 'manager-welcome', type: 'aemStep', position: { x: 300, y: 480 }, data: { label: 'Manager Welcome', description: 'Manager schedules welcome meeting', participant: 'managers' } },
      { id: 'send-welcome-kit', type: 'emailNotification', position: { x: 300, y: 590 }, data: { label: 'Send Welcome Kit', description: 'Welcome email with first-day info' } },
      { id: 'complete-checklist', type: 'aemStep', position: { x: 300, y: 700 }, data: { label: 'Complete Checklist', description: 'HR confirms all tasks done', participant: 'hr-team' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 810 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'collect-info', animated: true },
      { id: 'e2', source: 'collect-info', target: 'hr-review', animated: true },
      { id: 'e3', source: 'hr-review', target: 'create-accounts', animated: true },
      { id: 'e4', source: 'hr-review', target: 'order-equipment', animated: true },
      { id: 'e5', source: 'hr-review', target: 'assign-training', animated: true },
      { id: 'e6', source: 'create-accounts', target: 'manager-welcome', animated: true },
      { id: 'e7', source: 'order-equipment', target: 'manager-welcome', animated: true },
      { id: 'e8', source: 'assign-training', target: 'manager-welcome', animated: true },
      { id: 'e9', source: 'manager-welcome', target: 'send-welcome-kit', animated: true },
      { id: 'e10', source: 'send-welcome-kit', target: 'complete-checklist', animated: true },
      { id: 'e11', source: 'complete-checklist', target: 'end', animated: true },
    ],
  },

  // ============================================
  // INTEGRATION WORKFLOWS
  // ============================================
  {
    id: 'integration-salesforce-sync',
    name: 'Salesforce Lead Sync',
    description: 'Sync form submissions to Salesforce with lead scoring and assignment',
    category: 'integration',
    complexity: 'medium',
    estimatedSteps: 7,
    tags: ['salesforce', 'crm', 'integration', 'leads'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'form-submit', type: 'formsProcess', position: { x: 300, y: 150 }, data: { label: 'Lead Form Submit', description: 'Contact or lead form submitted', submitAction: 'submit' } },
      { id: 'enrich-data', type: 'processStep', position: { x: 300, y: 260 }, data: { label: 'Enrich Lead Data', description: 'Add company info, social data', processType: 'automated' } },
      { id: 'score-lead', type: 'processStep', position: { x: 300, y: 370 }, data: { label: 'Score Lead', description: 'Calculate lead score', processType: 'automated' } },
      { id: 'high-value', type: 'branch', position: { x: 300, y: 480 }, data: { label: 'High Value Lead?', branchType: 'xor' } },
      { id: 'sync-salesforce', type: 'processStep', position: { x: 300, y: 590 }, data: { label: 'Sync to Salesforce', description: 'Create/update Salesforce lead', processType: 'external', processHandler: 'com.custom.workflow.SalesforceSync' } },
      { id: 'notify-sales', type: 'emailNotification', position: { x: 450, y: 700 }, data: { label: 'Alert Sales Team', description: 'Immediate notification for hot lead' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 810 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'form-submit', animated: true },
      { id: 'e2', source: 'form-submit', target: 'enrich-data', animated: true },
      { id: 'e3', source: 'enrich-data', target: 'score-lead', animated: true },
      { id: 'e4', source: 'score-lead', target: 'high-value', animated: true },
      { id: 'e5', source: 'high-value', target: 'sync-salesforce', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e6', source: 'high-value', target: 'sync-salesforce', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e7', source: 'sync-salesforce', target: 'notify-sales', animated: true },
      { id: 'e8', source: 'notify-sales', target: 'end', animated: true },
    ],
  },

  {
    id: 'integration-adobe-analytics',
    name: 'Analytics Event Tracking',
    description: 'Track content events and sync with Adobe Analytics for reporting',
    category: 'integration',
    complexity: 'medium',
    estimatedSteps: 6,
    tags: ['analytics', 'tracking', 'adobe', 'reporting'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'capture-event', type: 'processStep', position: { x: 300, y: 150 }, data: { label: 'Capture Event', description: 'Capture content lifecycle event', processType: 'automated' } },
      { id: 'enrich-context', type: 'processStep', position: { x: 300, y: 260 }, data: { label: 'Enrich Context', description: 'Add user/content context', processType: 'automated' } },
      { id: 'send-analytics', type: 'processStep', position: { x: 300, y: 370 }, data: { label: 'Send to Analytics', description: 'Push event to Adobe Analytics', processType: 'external' } },
      { id: 'update-dashboard', type: 'processStep', position: { x: 300, y: 480 }, data: { label: 'Update Dashboard', description: 'Refresh real-time dashboard', processType: 'automated' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 590 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'capture-event', animated: true },
      { id: 'e2', source: 'capture-event', target: 'enrich-context', animated: true },
      { id: 'e3', source: 'enrich-context', target: 'send-analytics', animated: true },
      { id: 'e4', source: 'send-analytics', target: 'update-dashboard', animated: true },
      { id: 'e5', source: 'update-dashboard', target: 'end', animated: true },
    ],
  },

  // ============================================
  // MARKETING WORKFLOWS
  // ============================================
  {
    id: 'marketing-campaign-launch',
    name: 'Campaign Launch',
    description: 'Coordinate multi-channel marketing campaign launch with approvals',
    category: 'marketing',
    complexity: 'complex',
    estimatedSteps: 11,
    tags: ['campaign', 'marketing', 'launch', 'multi-channel'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 400, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'create-brief', type: 'aemStep', position: { x: 400, y: 150 }, data: { label: 'Create Brief', description: 'Campaign brief creation', participant: 'marketing-team' } },
      { id: 'stakeholder-review', type: 'aemStep', position: { x: 400, y: 260 }, data: { label: 'Stakeholder Review', description: 'Review campaign brief', participant: 'stakeholders' } },
      { id: 'brief-approved', type: 'branch', position: { x: 400, y: 370 }, data: { label: 'Brief Approved?', branchType: 'xor' } },
      { id: 'create-assets', type: 'aemStep', position: { x: 250, y: 480 }, data: { label: 'Create Assets', description: 'Design team creates assets', participant: 'creative-team' } },
      { id: 'create-content', type: 'aemStep', position: { x: 400, y: 480 }, data: { label: 'Create Content', description: 'Content team writes copy', participant: 'content-team' } },
      { id: 'setup-channels', type: 'aemStep', position: { x: 550, y: 480 }, data: { label: 'Setup Channels', description: 'Configure email, social, ads', participant: 'channel-managers' } },
      { id: 'final-review', type: 'aemStep', position: { x: 400, y: 590 }, data: { label: 'Final Review', description: 'Marketing director approval', participant: 'marketing-director' } },
      { id: 'schedule-launch', type: 'processStep', position: { x: 400, y: 700 }, data: { label: 'Schedule Launch', description: 'Set launch date/time', processType: 'automated' } },
      { id: 'launch-campaign', type: 'pageActivation', position: { x: 400, y: 810 }, data: { label: 'Launch Campaign', description: 'Activate all campaign content' } },
      { id: 'notify-team', type: 'emailNotification', position: { x: 400, y: 920 }, data: { label: 'Notify Team', description: 'Campaign launch notification' } },
      { id: 'end', type: 'startEnd', position: { x: 400, y: 1030 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'create-brief', animated: true },
      { id: 'e2', source: 'create-brief', target: 'stakeholder-review', animated: true },
      { id: 'e3', source: 'stakeholder-review', target: 'brief-approved', animated: true },
      { id: 'e4', source: 'brief-approved', target: 'create-assets', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e5', source: 'brief-approved', target: 'create-brief', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e6', source: 'brief-approved', target: 'create-content', sourceHandle: 'true', animated: true },
      { id: 'e7', source: 'brief-approved', target: 'setup-channels', sourceHandle: 'true', animated: true },
      { id: 'e8', source: 'create-assets', target: 'final-review', animated: true },
      { id: 'e9', source: 'create-content', target: 'final-review', animated: true },
      { id: 'e10', source: 'setup-channels', target: 'final-review', animated: true },
      { id: 'e11', source: 'final-review', target: 'schedule-launch', animated: true },
      { id: 'e12', source: 'schedule-launch', target: 'launch-campaign', animated: true },
      { id: 'e13', source: 'launch-campaign', target: 'notify-team', animated: true },
      { id: 'e14', source: 'notify-team', target: 'end', animated: true },
    ],
  },

  {
    id: 'marketing-personalization',
    name: 'Content Personalization',
    description: 'Dynamic content personalization based on audience segments',
    category: 'marketing',
    complexity: 'medium',
    estimatedSteps: 7,
    tags: ['personalization', 'targeting', 'segments', 'dynamic'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'create-variants', type: 'aemStep', position: { x: 300, y: 150 }, data: { label: 'Create Variants', description: 'Create content variations', participant: 'content-team' } },
      { id: 'define-segments', type: 'aemStep', position: { x: 300, y: 260 }, data: { label: 'Define Segments', description: 'Configure audience segments', participant: 'marketing-team' } },
      { id: 'map-content', type: 'processStep', position: { x: 300, y: 370 }, data: { label: 'Map Content', description: 'Map variants to segments', processType: 'automated' } },
      { id: 'preview-test', type: 'aemStep', position: { x: 300, y: 480 }, data: { label: 'Preview & Test', description: 'Test all segment views', participant: 'qa-team' } },
      { id: 'activate-rules', type: 'processStep', position: { x: 300, y: 590 }, data: { label: 'Activate Rules', description: 'Enable personalization rules', processType: 'automated' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 700 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'create-variants', animated: true },
      { id: 'e2', source: 'create-variants', target: 'define-segments', animated: true },
      { id: 'e3', source: 'define-segments', target: 'map-content', animated: true },
      { id: 'e4', source: 'map-content', target: 'preview-test', animated: true },
      { id: 'e5', source: 'preview-test', target: 'activate-rules', animated: true },
      { id: 'e6', source: 'activate-rules', target: 'end', animated: true },
    ],
  },

  // ============================================
  // GOVERNANCE WORKFLOWS
  // ============================================
  {
    id: 'governance-gdpr-request',
    name: 'GDPR Data Request',
    description: 'Handle GDPR data subject requests (access, deletion, portability)',
    category: 'governance',
    complexity: 'complex',
    estimatedSteps: 9,
    tags: ['gdpr', 'privacy', 'compliance', 'data-request'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'receive-request', type: 'formsProcess', position: { x: 300, y: 150 }, data: { label: 'Receive Request', description: 'GDPR request form submitted', submitAction: 'submit' } },
      { id: 'verify-identity', type: 'aemStep', position: { x: 300, y: 260 }, data: { label: 'Verify Identity', description: 'Confirm requestor identity', participant: 'privacy-team' } },
      { id: 'identity-verified', type: 'branch', position: { x: 300, y: 370 }, data: { label: 'Identity Verified?', branchType: 'xor' } },
      { id: 'collect-data', type: 'processStep', position: { x: 450, y: 480 }, data: { label: 'Collect Data', description: 'Gather all personal data', processType: 'automated' } },
      { id: 'review-data', type: 'aemStep', position: { x: 450, y: 590 }, data: { label: 'Review Data', description: 'Legal reviews data package', participant: 'legal-team' } },
      { id: 'execute-request', type: 'processStep', position: { x: 450, y: 700 }, data: { label: 'Execute Request', description: 'Delete/export as requested', processType: 'automated' } },
      { id: 'send-confirmation', type: 'emailNotification', position: { x: 450, y: 810 }, data: { label: 'Send Confirmation', description: 'Confirm request completion' } },
      { id: 'request-verification', type: 'emailNotification', position: { x: 150, y: 480 }, data: { label: 'Request More Info', description: 'Ask for identity verification' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 920 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'receive-request', animated: true },
      { id: 'e2', source: 'receive-request', target: 'verify-identity', animated: true },
      { id: 'e3', source: 'verify-identity', target: 'identity-verified', animated: true },
      { id: 'e4', source: 'identity-verified', target: 'collect-data', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e5', source: 'identity-verified', target: 'request-verification', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e6', source: 'collect-data', target: 'review-data', animated: true },
      { id: 'e7', source: 'review-data', target: 'execute-request', animated: true },
      { id: 'e8', source: 'execute-request', target: 'send-confirmation', animated: true },
      { id: 'e9', source: 'send-confirmation', target: 'end', animated: true },
      { id: 'e10', source: 'request-verification', target: 'verify-identity', animated: true },
    ],
  },

  {
    id: 'governance-content-audit',
    name: 'Content Audit',
    description: 'Periodic content audit for accessibility, SEO, and brand compliance',
    category: 'governance',
    complexity: 'medium',
    estimatedSteps: 8,
    tags: ['audit', 'accessibility', 'seo', 'compliance'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'scan-content', type: 'processStep', position: { x: 300, y: 150 }, data: { label: 'Scan Content', description: 'Automated content scanning', processType: 'automated' } },
      { id: 'check-accessibility', type: 'processStep', position: { x: 150, y: 260 }, data: { label: 'Accessibility Check', description: 'WCAG compliance scan', processType: 'automated' } },
      { id: 'check-seo', type: 'processStep', position: { x: 300, y: 260 }, data: { label: 'SEO Analysis', description: 'SEO best practices check', processType: 'automated' } },
      { id: 'check-brand', type: 'processStep', position: { x: 450, y: 260 }, data: { label: 'Brand Check', description: 'Brand guidelines compliance', processType: 'automated' } },
      { id: 'generate-report', type: 'processStep', position: { x: 300, y: 370 }, data: { label: 'Generate Report', description: 'Compile audit findings', processType: 'automated' } },
      { id: 'review-findings', type: 'aemStep', position: { x: 300, y: 480 }, data: { label: 'Review Findings', description: 'Team reviews audit results', participant: 'content-managers' } },
      { id: 'create-tasks', type: 'processStep', position: { x: 300, y: 590 }, data: { label: 'Create Remediation Tasks', description: 'Generate fix tasks', processType: 'automated' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 700 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'scan-content', animated: true },
      { id: 'e2', source: 'scan-content', target: 'check-accessibility', animated: true },
      { id: 'e3', source: 'scan-content', target: 'check-seo', animated: true },
      { id: 'e4', source: 'scan-content', target: 'check-brand', animated: true },
      { id: 'e5', source: 'check-accessibility', target: 'generate-report', animated: true },
      { id: 'e6', source: 'check-seo', target: 'generate-report', animated: true },
      { id: 'e7', source: 'check-brand', target: 'generate-report', animated: true },
      { id: 'e8', source: 'generate-report', target: 'review-findings', animated: true },
      { id: 'e9', source: 'review-findings', target: 'create-tasks', animated: true },
      { id: 'e10', source: 'create-tasks', target: 'end', animated: true },
    ],
  },

  // ============================================
  // COMMERCE WORKFLOWS
  // ============================================
  {
    id: 'commerce-product-launch',
    name: 'Product Launch',
    description: 'Coordinate product information, assets, and content for product launch',
    category: 'commerce',
    complexity: 'complex',
    estimatedSteps: 10,
    tags: ['product', 'commerce', 'launch', 'catalog'],
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'product-setup', type: 'aemStep', position: { x: 300, y: 150 }, data: { label: 'Product Setup', description: 'Create product in PIM', participant: 'product-team' } },
      { id: 'upload-assets', type: 'damUpdate', position: { x: 150, y: 260 }, data: { label: 'Upload Assets', description: 'Product images and videos' } },
      { id: 'write-description', type: 'aemStep', position: { x: 300, y: 260 }, data: { label: 'Write Description', description: 'Product copy and specs', participant: 'content-team' } },
      { id: 'set-pricing', type: 'aemStep', position: { x: 450, y: 260 }, data: { label: 'Set Pricing', description: 'Configure pricing and promotions', participant: 'pricing-team' } },
      { id: 'review-product', type: 'aemStep', position: { x: 300, y: 370 }, data: { label: 'Review Product', description: 'Full product review', participant: 'product-managers' } },
      { id: 'approved', type: 'branch', position: { x: 300, y: 480 }, data: { label: 'Approved?', branchType: 'xor' } },
      { id: 'sync-catalog', type: 'processStep', position: { x: 450, y: 590 }, data: { label: 'Sync Catalog', description: 'Update commerce catalog', processType: 'external' } },
      { id: 'publish-pdp', type: 'pageActivation', position: { x: 450, y: 700 }, data: { label: 'Publish PDP', description: 'Activate product page' } },
      { id: 'notify-team', type: 'emailNotification', position: { x: 450, y: 810 }, data: { label: 'Launch Notification', description: 'Notify stakeholders' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 920 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'product-setup', animated: true },
      { id: 'e2', source: 'product-setup', target: 'upload-assets', animated: true },
      { id: 'e3', source: 'product-setup', target: 'write-description', animated: true },
      { id: 'e4', source: 'product-setup', target: 'set-pricing', animated: true },
      { id: 'e5', source: 'upload-assets', target: 'review-product', animated: true },
      { id: 'e6', source: 'write-description', target: 'review-product', animated: true },
      { id: 'e7', source: 'set-pricing', target: 'review-product', animated: true },
      { id: 'e8', source: 'review-product', target: 'approved', animated: true },
      { id: 'e9', source: 'approved', target: 'sync-catalog', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e10', source: 'approved', target: 'product-setup', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e11', source: 'sync-catalog', target: 'publish-pdp', animated: true },
      { id: 'e12', source: 'publish-pdp', target: 'notify-team', animated: true },
      { id: 'e13', source: 'notify-team', target: 'end', animated: true },
    ],
  },
];

// Get templates by category
export const getTemplatesByCategory = (category: WorkflowTemplate['category']): WorkflowTemplate[] => {
  return ADVANCED_TEMPLATES.filter(t => t.category === category);
};

// Get templates by complexity
export const getTemplatesByComplexity = (complexity: WorkflowTemplate['complexity']): WorkflowTemplate[] => {
  return ADVANCED_TEMPLATES.filter(t => t.complexity === complexity);
};

// Search templates by tags or name
export const searchTemplates = (query: string): WorkflowTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return ADVANCED_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.includes(lowerQuery))
  );
};

// Get all unique categories
export const getCategories = (): WorkflowTemplate['category'][] => {
  return [...new Set(ADVANCED_TEMPLATES.map(t => t.category))];
};

// Get all unique tags
export const getAllTags = (): string[] => {
  const allTags = ADVANCED_TEMPLATES.flatMap(t => t.tags);
  return [...new Set(allTags)].sort();
};
