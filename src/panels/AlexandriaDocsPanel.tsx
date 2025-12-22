import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { CONFIG_FILENAME } from '@principal-ai/alexandria-core-library';
import type { PanelComponentProps, ActiveFileSlice } from '../types';
import type { AlexandriaDocItemData, AlexandriaConfig } from './components/types';
import { PanelHeader } from './components/PanelHeader';
import { DocumentList } from './components/DocumentList';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';
import { ConfigView } from './components/ConfigView';
import { useAlexandriaData } from '../hooks';

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
  const [showConfigView, setShowConfigView] = useState(false);
  const [alexandriaConfig, setAlexandriaConfig] = useState<AlexandriaConfig | null>(null);

  // Use the new hook that handles adapters, slices, and fallbacks
  const { documents, isLoading, hasAlexandriaConfig } = useAlexandriaData(context);

  // Repository path for components that need it (e.g., file tree building)
  const repositoryPath = context.currentScope.repository?.path || '';

  // Get the currently active/selected file from the active-file slice
  const activeFileSlice = context.getSlice<ActiveFileSlice>('active-file');
  const selectedFile = activeFileSlice?.data?.path;

  // Config file path from core library (host resolves relative to absolute)
  const configPath = CONFIG_FILENAME;

  // Load Alexandria config when showing config view
  useEffect(() => {
    if (!showConfigView || !hasAlexandriaConfig) {
      return;
    }

    const loadConfig = async () => {
      try {
        const readFile = context.adapters?.readFile;
        if (!readFile) {
          console.warn('[AlexandriaDocsPanel] No readFile adapter available');
          return;
        }

        const content = await readFile(configPath);
        const config = JSON.parse(content) as AlexandriaConfig;
        setAlexandriaConfig(config);
      } catch (err) {
        console.error('[AlexandriaDocsPanel] Failed to load Alexandria config:', err);
        setAlexandriaConfig(null);
      }
    };

    loadConfig();
  }, [showConfigView, hasAlexandriaConfig, context.adapters]);

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

  const handleDocumentClick = useCallback(
    (path: string) => {
      actions.openFile?.(path);
    },
    [actions]
  );

  const handleFileSelect = useCallback(
    (filePath: string) => {
      actions.openFile?.(filePath);
    },
    [actions]
  );

  const handleClearFilter = useCallback(() => {
    setFilterText('');
  }, []);

  const handleToggleSearch = useCallback(() => {
    setShowSearch((prev) => {
      if (prev) {
        setFilterText('');
      }
      return !prev;
    });
  }, []);

  const handleToggleTrackedOnly = useCallback(() => {
    setShowTrackedOnly((prev) => !prev);
  }, []);

  const handleToggleConfigView = useCallback(() => {
    setShowConfigView((prev) => !prev);
  }, []);

  const handleOpenConfig = useCallback(() => {
    actions.openFile?.(configPath);
  }, [actions, configPath]);

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
          showConfigView={showConfigView}
          onToggleConfigView={handleToggleConfigView}
        />
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {showConfigView && alexandriaConfig ? (
          <ConfigView
            config={alexandriaConfig}
            configPath={configPath}
            onOpenConfig={handleOpenConfig}
          />
        ) : isLoading ? (
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
            selectedFile={selectedFile}
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
