import React, { useMemo } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { OrderedFileList } from '@principal-ade/dynamic-file-tree';
import { PathsFileTreeBuilder } from '@principal-ai/repository-abstraction';
import type { FileTree } from '@principal-ai/repository-abstraction';

export interface AssociatedFilesTreeProps {
  /** Array of file paths to display in the tree */
  filePaths: string[];
  /** Callback when a file is clicked */
  onFileSelect?: (filePath: string) => void;
  /** Currently selected file path */
  selectedFile?: string;
  /** Repository root path for calculating relative paths */
  repositoryRoot?: string;
}

/**
 * AssociatedFilesTree component
 * Displays a list of associated files using the dynamic-file-tree library
 */
export const AssociatedFilesTree: React.FC<AssociatedFilesTreeProps> = ({
  filePaths,
  onFileSelect,
  selectedFile,
  repositoryRoot = '',
}) => {
  const { theme } = useTheme();

  // Build a FileTree from the array of file paths
  const fileTree = useMemo<FileTree | null>(() => {
    if (!filePaths || filePaths.length === 0) {
      return null;
    }

    try {
      const builder = new PathsFileTreeBuilder();
      const fileTree = builder.build({
        files: filePaths,
        rootPath: repositoryRoot,
      });
      return fileTree;
    } catch (error) {
      console.error('[AssociatedFilesTree] Error building file tree:', error);
      return null;
    }
  }, [filePaths, repositoryRoot]);

  if (!fileTree) {
    return (
      <div
        style={{
          padding: '8px 12px',
          fontSize: theme.fontSizes[0],
          color: theme.colors.textSecondary,
          fontStyle: 'italic',
        }}
      >
        No associated files
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: '4px',
        overflow: 'hidden',
        maxHeight: '300px',
      }}
    >
      <OrderedFileList
        fileTree={fileTree}
        theme={theme}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
        sortBy="name"
        sortOrder="asc"
        padding="8px"
      />
    </div>
  );
};
