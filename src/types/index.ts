/**
 * Re-export types from @principal-ade/panel-framework-core
 * This ensures type compatibility with the host application
 */
export type {
  PanelComponentProps,
  PanelContextValue,
  PanelActions,
  PanelEventEmitter,
  PanelEvent,
  PanelEventType,
  PanelDefinition,
  PanelMetadata,
  PanelLifecycleHooks,
  DataSlice,
  WorkspaceMetadata,
  RepositoryMetadata,
  ActiveFileSlice,
} from '@principal-ade/panel-framework-core';

/**
 * Extended markdown file interface with Alexandria-specific metadata
 * Supports associated files from CodebaseView
 */
export interface ExtendedMarkdownFile {
  path: string;
  title?: string;
  lastModified?: number;

  // Alexandria-specific fields (optional for backwards compatibility)
  isTracked?: boolean;
  associatedFiles?: string[];
  hasUncommittedChanges?: boolean;
  codebaseViewId?: string;
}
