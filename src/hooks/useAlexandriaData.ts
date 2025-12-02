/**
 * Hook for loading Alexandria data using FileTree-based adapters
 *
 * This hook uses MemoryPalace.getDocumentsOverview() with FileTree adapters
 * to get document data with tracking info and associated files.
 *
 * Required from host:
 * - fileTree slice: FileTree from @principal-ai/repository-abstraction
 * - adapters.readFile: (path: string) => string | Promise<string>
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

  // Check for Alexandria config in fileTree
  const hasAlexandriaConfig = useMemo(() => {
    if (!fileTree?.allFiles) return false;
    return fileTree.allFiles.some(
      (file) =>
        file.path.endsWith('.alexandria/alexandria.json') ||
        file.path.endsWith('/.alexandria/alexandria.json')
    );
  }, [fileTree]);

  // Check if we have the required adapters (readFile and matchesPath)
  const readFile = context.adapters?.readFile as ((path: string) => string | Promise<string>) | undefined;
  const matchesPath = context.adapters?.matchesPath as ((pattern: string, path: string) => boolean) | undefined;
  const hasRequiredAdapters = !!readFile && !!matchesPath;

  // Load data using MemoryPalace when fileTree and adapters are available
  useEffect(() => {
    if (!fileTree || !hasRequiredAdapters || !hasAlexandriaConfig || !repositoryPath) {
      setPalaceDocuments(null);
      return;
    }

    const loadWithMemoryPalace = async () => {
      setPalaceLoading(true);
      setPalaceError(null);

      try {
        // Create FileTree-based adapters
        const fsAdapter = new FileTreeFileSystemAdapter({
          fileTree,
          repositoryPath,
          readFile: readFile!,
        });

        const globAdapter = new FileTreeGlobAdapter({
          fileTree,
          repositoryPath,
          matchesPath: matchesPath!,
        });

        // Create MemoryPalace instance
        const palace = new MemoryPalace(repositoryPath, fsAdapter);

        // Get documents with tracking info
        const overviews: DocumentOverview[] = await palace.getDocumentsOverview(globAdapter);

        // Convert DocumentOverview to AlexandriaDocItemData
        const docs: AlexandriaDocItemData[] = overviews.map((doc) => ({
          path: doc.path,
          name: doc.title,
          relativePath: doc.relativePath,
          mtime: undefined, // DocumentOverview doesn't include lastModified yet
          associatedFiles: doc.associatedFiles,
          isTracked: doc.isTracked,
          hasUncommittedChanges: undefined,
        }));

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
  }, [fileTree, hasRequiredAdapters, hasAlexandriaConfig, repositoryPath, readFile, matchesPath]);

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
            !file.path.includes('/.backlog/')
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
