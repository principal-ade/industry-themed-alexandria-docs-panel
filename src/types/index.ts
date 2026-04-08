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
  // Common slice context helpers
  FileTreeContext,
  ActiveFileContext,
} from '@principal-ade/panel-framework-core';

// Import for local use in interface definitions
import type {
  PanelActions,
  FileTreeContext,
  ActiveFileContext,
  DataSlice,
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

/**
 * Actions interface for Alexandria Docs Panel
 * Defines the actions this panel requires from the host
 */
export interface AlexandriaDocsActions extends PanelActions {
  /** Open a file in the editor */
  openFile?: (filePath: string) => void;
}

/**
 * Context interface for Alexandria Docs Panel
 * Combines common contexts needed for documentation management
 */
export interface AlexandriaDocsContext
  extends FileTreeContext, ActiveFileContext {
  /** File tree from the git repository */
  // fileTree is inherited from FileTreeContext
  /** Active file for highlighting the currently selected file */
  // activeFile is inherited from ActiveFileContext
  /** File tree from the root repository (for plans in .claude/plans/) */
  rootFileTree?: DataSlice<
    import('@principal-ai/repository-abstraction').FileTree
  >;
}
