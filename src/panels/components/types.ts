// Re-export config types from core library
export type {
  AlexandriaConfig,
  ContextRule,
} from '@principal-ai/alexandria-core-library';

export interface AlexandriaDocItemData {
  path: string;
  name: string;
  relativePath: string;
  mtime?: Date;
  associatedFiles?: string[];
  isTracked?: boolean;
  hasUncommittedChanges?: boolean;
}

export interface MarkdownFile {
  path: string;
  title?: string;
  lastModified?: number;
  associatedFiles?: string[];
  isTracked?: boolean;
  hasUncommittedChanges?: boolean;
}

// Slice data for checking if config exists
export interface AlexandriaConfigSlice {
  hasConfig: boolean;
  configPath?: string;
  config?: import('@principal-ai/alexandria-core-library').AlexandriaConfig;
}
