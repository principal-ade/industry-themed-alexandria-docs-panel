/**
 * Hook for loading Alexandria data using FileTree-based adapters
 *
 * This hook uses MemoryPalace.getDocumentsOverview() with FileTree adapters
 * to get document data with tracking info and associated files.
 *
 * Required from host:
 * - fileTree slice: FileTree from @principal-ai/repository-abstraction
 * - adapters.readFile: (path: string) => Promise<string>
 * - adapters.matchesPath: (pattern: string, path: string) => boolean
 */

import { useState, useEffect, useMemo } from 'react';
import type { PanelContextValue } from '@principal-ade/panel-framework-core';
import type { FileTree } from '@principal-ai/repository-abstraction';
import type { AlexandriaDocItemData } from '../panels/components/types';

import {
  MemoryPalace,
  FileTreeFileSystemAdapter,
  FileTreeGlobAdapter,
  CONFIG_FILENAME,
} from '@principal-ai/alexandria-core-library';
import type { DocumentOverview } from '@principal-ai/alexandria-core-library';

export interface UseAlexandriaDataResult {
  documents: AlexandriaDocItemData[];
  isLoading: boolean;
  hasAlexandriaConfig: boolean;
  error: Error | null;
  /** Source of data: 'memoryPalace' if using MemoryPalace, 'fileTree' if derived from fileTree only */
  dataSource: 'memoryPalace' | 'fileTree';
}

/**
 * Hook that loads Alexandria documentation data.
 *
 * Strategy:
 * 1. If fileTree slice + readFile + matchesPath adapters are available and Alexandria config exists:
 *    - Create FileTree-based adapters
 *    - Use MemoryPalace.getDocumentsOverview() to get documents with tracking info
 * 2. Fallback to fileTree only:
 *    - Derive markdown files from fileTree.allFiles (no tracking info)
 */
export function useAlexandriaData(context: PanelContextValue): UseAlexandriaDataResult {
  const [palaceDocuments, setPalaceDocuments] = useState<AlexandriaDocItemData[] | null>(null);
  const [palaceLoading, setPalaceLoading] = useState(false);
  const [palaceError, setPalaceError] = useState<Error | null>(null);

  // Get fileTree slice
  const fileTreeSlice = context.getSlice<FileTree>('fileTree');
  const fileTree = fileTreeSlice?.data;

  // Get repository path
  const repositoryPath =
    context.currentScope.repository?.path ||
    context.currentScope.workspace?.path ||
    '';

  // Get adapters from context (browser environment - readFile is always async)
  const readFile = context.adapters?.readFile as ((path: string) => Promise<string>) | undefined;
  const matchesPath = context.adapters?.matchesPath as ((pattern: string, path: string) => boolean) | undefined;

  // Create FileSystemAdapter when we have required deps (used for config detection and data loading)
  const fsAdapter = useMemo(() => {
    if (!fileTree || !readFile || !repositoryPath) return null;
    return new FileTreeFileSystemAdapter({
      fileTree,
      repositoryPath,
      readFile,
    });
  }, [fileTree, repositoryPath, readFile]);

  // Use FileSystemAdapter.exists() to check for Alexandria config
  // Panel uses relative paths - the adapter handles path normalization
  const hasAlexandriaConfig = useMemo(() => {
    if (!fsAdapter) return false;
    return fsAdapter.exists(CONFIG_FILENAME);
  }, [fsAdapter]);

  // Create GlobAdapter when we have required deps
  const globAdapter = useMemo(() => {
    if (!fileTree || !matchesPath || !repositoryPath) return null;
    return new FileTreeGlobAdapter({
      fileTree,
      repositoryPath,
      matchesPath,
    });
  }, [fileTree, repositoryPath, matchesPath]);

  // Load data using MemoryPalace when adapters are available and config exists
  useEffect(() => {
    if (!fsAdapter || !globAdapter || !hasAlexandriaConfig || !repositoryPath) {
      setPalaceDocuments(null);
      return;
    }

    const loadWithMemoryPalace = async () => {
      setPalaceLoading(true);
      setPalaceError(null);

      try {
        const palace = new MemoryPalace(repositoryPath, fsAdapter);
        const overviews: DocumentOverview[] = await palace.getDocumentsOverview(globAdapter);

        // Build a map of relativePath -> lastModified from fileTree for quick lookup
        const mtimeMap = new Map<string, Date | undefined>();
        if (fileTree?.allFiles) {
          for (const file of fileTree.allFiles) {
            mtimeMap.set(file.relativePath, file.lastModified);
          }
        }

        // Convert DocumentOverview to AlexandriaDocItemData
        const docs: AlexandriaDocItemData[] = overviews.map((doc) => ({
          path: doc.path,
          name: doc.title,
          relativePath: doc.relativePath,
          mtime: mtimeMap.get(doc.relativePath),
          associatedFiles: doc.associatedFiles,
          isTracked: doc.isTracked,
          hasUncommittedChanges: undefined,
        }));

        // Sort by mtime descending (most recently modified first)
        docs.sort((a, b) => {
          if (!a.mtime && !b.mtime) return 0;
          if (!a.mtime) return 1;
          if (!b.mtime) return -1;
          return b.mtime.getTime() - a.mtime.getTime();
        });

        setPalaceDocuments(docs);
      } catch (err) {
        console.error('[useAlexandriaData] Error loading with MemoryPalace:', err);
        setPalaceError(err instanceof Error ? err : new Error(String(err)));
        setPalaceDocuments(null);
      } finally {
        setPalaceLoading(false);
      }
    };

    loadWithMemoryPalace();
  }, [fsAdapter, globAdapter, hasAlexandriaConfig, repositoryPath]);

  // Determine which data source to use and compute documents
  const result = useMemo((): UseAlexandriaDataResult => {
    // Strategy 1: Use MemoryPalace data if available
    if (palaceDocuments !== null) {
      return {
        documents: palaceDocuments,
        isLoading: palaceLoading,
        hasAlexandriaConfig,
        error: palaceError,
        dataSource: 'memoryPalace',
      };
    }

    // Strategy 2: Derive from fileTree only (fallback - no tracking info)
    if (fileTree?.allFiles && !fileTreeSlice?.loading) {
      const docs: AlexandriaDocItemData[] = fileTree.allFiles
        .filter(
          (file) =>
            file.extension === '.md' &&
            !file.path.includes('/.palace-work/') &&
            !file.path.includes('/backlog/') &&
            file.name !== 'SKILLS.md'
        )
        .map((file) => {
          const name = file.name.replace(/\.(md|MD)$/i, '');

          return {
            path: file.path,
            name,
            relativePath: file.relativePath,
            mtime: file.lastModified,
            associatedFiles: undefined,
            isTracked: undefined,
            hasUncommittedChanges: undefined,
          };
        });

      // Sort by mtime descending (most recently modified first)
      docs.sort((a, b) => {
        if (!a.mtime && !b.mtime) return 0;
        if (!a.mtime) return 1;
        if (!b.mtime) return -1;
        return b.mtime.getTime() - a.mtime.getTime();
      });

      return {
        documents: docs,
        isLoading: fileTreeSlice?.loading ?? false,
        hasAlexandriaConfig,
        error: fileTreeSlice?.error ?? null,
        dataSource: 'fileTree',
      };
    }

    // Loading state
    const isLoading = palaceLoading || fileTreeSlice?.loading || false;

    return {
      documents: [],
      isLoading,
      hasAlexandriaConfig,
      error: null,
      dataSource: 'fileTree',
    };
  }, [
    palaceDocuments,
    palaceLoading,
    palaceError,
    fileTree,
    fileTreeSlice,
    hasAlexandriaConfig,
  ]);

  return result;
}
