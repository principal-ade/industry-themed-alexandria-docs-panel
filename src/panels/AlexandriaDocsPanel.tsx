import React, { useMemo, useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Book, FileText, Loader, Search, X } from 'lucide-react';
import type { PanelComponentProps } from '../types';
import { AlexandriaDocItem } from './components/AlexandriaDocItem';

export interface AlexandriaDocItemData {
  path: string;
  name: string;
  relativePath: string;
  mtime?: Date;
  associatedFiles?: string[];
  isTracked?: boolean;
  hasUncommittedChanges?: boolean;
}

interface MarkdownFile {
  path: string;
  title?: string;
  lastModified?: number;
  // Extended Alexandria fields (optional)
  associatedFiles?: string[];
  isTracked?: boolean;
  hasUncommittedChanges?: boolean;
}

export const AlexandriaDocsPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const [filterText, setFilterText] = useState('');

  // Extract markdown files from markdown slice
  const markdownSlice = context.getSlice<MarkdownFile[]>('markdown');

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

  // Filter documents based on search text
  const filteredDocuments = useMemo(() => {
    if (!filterText.trim()) {
      return documents;
    }

    const searchLower = filterText.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchLower) ||
        doc.relativePath.toLowerCase().includes(searchLower)
    );
  }, [documents, filterText]);

  const handleDocumentClick = (path: string) => {
    actions.openFile?.(path);
  };

  const handleFileSelect = (filePath: string) => {
    actions.openFile?.(filePath);
  };

  const handleClearFilter = () => {
    setFilterText('');
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
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundLight,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <Book size={16} color={theme.colors.primary} />
          <span
            style={{
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
              fontWeight: theme.fontWeights.medium,
            }}
          >
            {documents.length}{' '}
            {documents.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            color={theme.colors.textSecondary}
            style={{
              position: 'absolute',
              left: '10px',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Filter documents..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 32px 8px 32px',
              fontSize: theme.fontSizes[1],
              color: theme.colors.text,
              backgroundColor: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              outline: 'none',
              fontFamily: theme.fonts.body,
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border;
            }}
          />
          {filterText && (
            <button
              onClick={handleClearFilter}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.textSecondary,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              color: theme.colors.textSecondary,
            }}
          >
            <Loader
              size={24}
              className="animate-spin"
              style={{ marginBottom: '12px' }}
            />
            <span style={{ fontSize: theme.fontSizes[0] }}>
              Loading documents...
            </span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: theme.colors.textSecondary,
              padding: '40px 20px',
              fontSize: theme.fontSizes[0],
            }}
          >
            <div style={{ marginBottom: '8px', opacity: 0.5 }}>
              <FileText size={32} />
            </div>
            <div style={{ marginBottom: '4px' }}>
              {filterText ? 'No matching documents' : 'No documents found'}
            </div>
            <div style={{ fontSize: theme.fontSizes[0], opacity: 0.8 }}>
              {filterText
                ? 'Try a different search term'
                : 'Markdown documents will appear here'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredDocuments.map((doc) => (
              <AlexandriaDocItem
                key={doc.path}
                doc={doc}
                onSelect={() => handleDocumentClick(doc.path)}
                onFileSelect={handleFileSelect}
                repositoryRoot={repositoryPath}
                events={events}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
