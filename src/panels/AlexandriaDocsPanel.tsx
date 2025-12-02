import React, { useMemo, useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps } from '../types';
import type {
  AlexandriaDocItemData,
  MarkdownFile,
  AlexandriaConfigSlice,
} from './components/types';
import { PanelHeader } from './components/PanelHeader';
import { DocumentList } from './components/DocumentList';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';

// Re-export types for external use
export type { AlexandriaDocItemData } from './components/types';

export const AlexandriaDocsPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const [filterText, setFilterText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showTrackedOnly, setShowTrackedOnly] = useState(false);

  // Extract markdown files from markdown slice
  const markdownSlice = context.getSlice<MarkdownFile[]>('markdown');

  // Check for Alexandria config
  const alexandriaSlice = context.getSlice<AlexandriaConfigSlice>('alexandria');
  const hasAlexandriaConfig = alexandriaSlice?.data?.hasConfig ?? false;

  const documents = useMemo(() => {
    // If no slice or still loading, return empty array
    if (!markdownSlice || markdownSlice.loading || !markdownSlice.data) {
      return [];
    }

    // Get the repository path from current scope
    const repositoryPath =
      context.currentScope.repository?.path ||
      context.currentScope.workspace?.path ||
      '';

    // Convert markdown files to our document format
    // Filter out files in .palace-work or .backlog directories
    const docItems: AlexandriaDocItemData[] = markdownSlice.data
      .filter((file) => {
        return (
          !file.path.includes('/.palace-work/') &&
          !file.path.includes('/.backlog/')
        );
      })
      .map((file) => {
        const fileName = file.path.split('/').pop() || file.path;
        const name = file.title || fileName.replace(/\.(md|MD)$/i, '');

        return {
          path: file.path,
          name: name,
          relativePath: repositoryPath
            ? file.path.replace(repositoryPath + '/', '')
            : file.path,
          mtime: file.lastModified ? new Date(file.lastModified) : undefined,
          associatedFiles: file.associatedFiles,
          isTracked: file.isTracked,
          hasUncommittedChanges: file.hasUncommittedChanges,
        };
      });

    return docItems;
  }, [markdownSlice, context.currentScope]);

  // Get repository path for file tree
  const repositoryPath =
    context.currentScope.repository?.path ||
    context.currentScope.workspace?.path ||
    '';

  // Count tracked documents (those with file references)
  const trackedDocumentsCount = useMemo(() => {
    return documents.filter(
      (doc) => doc.associatedFiles && doc.associatedFiles.length > 0
    ).length;
  }, [documents]);

  // Filter documents based on search text and tracked-only filter
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Apply tracked-only filter
    if (showTrackedOnly) {
      filtered = filtered.filter(
        (doc) => doc.associatedFiles && doc.associatedFiles.length > 0
      );
    }

    // Apply search text filter
    if (filterText.trim()) {
      const searchLower = filterText.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchLower) ||
          doc.relativePath.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [documents, filterText, showTrackedOnly]);

  const handleDocumentClick = (path: string) => {
    actions.openFile?.(path);
  };

  const handleFileSelect = (filePath: string) => {
    actions.openFile?.(filePath);
  };

  const handleClearFilter = () => {
    setFilterText('');
  };

  const handleToggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setFilterText('');
    }
  };

  const handleToggleTrackedOnly = () => {
    setShowTrackedOnly(!showTrackedOnly);
  };

  // Check if markdown slice is loading
  const isLoading = context.isSliceLoading('markdown');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: '0px',
        overflow: 'hidden',
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Header - show when there are documents or loading */}
      {(documents.length > 0 || isLoading) && (
        <PanelHeader
          documentCount={documents.length}
          isLoading={isLoading}
          hasAlexandriaConfig={hasAlexandriaConfig}
          showTrackedOnly={showTrackedOnly}
          onToggleTrackedOnly={handleToggleTrackedOnly}
          showSearch={showSearch}
          onToggleSearch={handleToggleSearch}
          filterText={filterText}
          onFilterTextChange={setFilterText}
          onClearFilter={handleClearFilter}
        />
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            showTrackedOnly={showTrackedOnly}
            trackedDocumentsCount={trackedDocumentsCount}
            filterText={filterText}
          />
        ) : (
          <DocumentList
            documents={filteredDocuments}
            onDocumentClick={handleDocumentClick}
            onFileSelect={handleFileSelect}
            repositoryPath={repositoryPath}
            events={events}
          />
        )}
      </div>

      {/* Shimmer animation keyframes */}
      {isLoading && (
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}
        </style>
      )}
    </div>
  );
};
