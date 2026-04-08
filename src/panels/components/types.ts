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

export interface PlanItemData {
  path: string;
  name: string;
  relativePath: string;
  mtime?: Date;
}
