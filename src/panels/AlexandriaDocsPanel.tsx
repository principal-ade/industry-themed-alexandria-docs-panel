import React, { useMemo } from 'react';
import { useTheme } from '@a24z/industry-theme';
import { Book, FileText, Loader } from 'lucide-react';
import type { PanelComponentProps } from '../types';
import { AlexandriaDocItem } from './components/AlexandriaDocItem';

export interface AlexandriaDocItemData {
  path: string;
  name: string;
  relativePath: string;
  mtime?: Date;
}

export const AlexandriaDocsPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
}) => {
  const { theme } = useTheme();

  // Extract markdown files from context
  const documents = useMemo(() => {
    if (!context.markdownFiles) {
      return [];
    }

    // Convert markdown files to our document format
    const docItems: AlexandriaDocItemData[] = context.markdownFiles.map((file) => {
      const fileName = file.path.split('/').pop() || file.path;
      const name = fileName.replace(/\.(md|MD)$/i, '');

      return {
        path: file.path,
        name: name,
        relativePath: file.path.replace(context.repositoryPath + '/', ''),
        mtime: file.lastModified ? new Date(file.lastModified) : undefined,
      };
    });

    return docItems;
  }, [context.markdownFiles, context.repositoryPath]);

  const handleDocumentClick = (path: string) => {
    actions.openFile?.(path);
  };

  const isLoading = context.loading;

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
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </span>
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
        ) : documents.length === 0 ? (
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
            <div style={{ marginBottom: '4px' }}>No documents found</div>
            <div style={{ fontSize: theme.fontSizes[0], opacity: 0.8 }}>
              Markdown documents will appear here
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {documents.map((doc) => (
              <AlexandriaDocItem
                key={doc.path}
                doc={doc}
                onSelect={() => handleDocumentClick(doc.path)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
