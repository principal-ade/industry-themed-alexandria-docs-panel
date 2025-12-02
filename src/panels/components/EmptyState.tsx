import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { FileCode, FileText } from 'lucide-react';

interface EmptyStateProps {
  showTrackedOnly: boolean;
  trackedDocumentsCount: number;
  filterText: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  showTrackedOnly,
  trackedDocumentsCount,
  filterText,
}) => {
  const { theme } = useTheme();

  // Show tracked documents empty state
  if (showTrackedOnly && trackedDocumentsCount === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          color: theme.colors.textSecondary,
          padding: '40px 20px',
        }}
      >
        <div style={{ marginBottom: '12px', opacity: 0.5 }}>
          <FileCode size={48} />
        </div>
        <div
          style={{
            marginBottom: '8px',
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
          }}
        >
          No tracked documents
        </div>
        <div
          style={{
            fontSize: theme.fontSizes[1],
            opacity: 0.8,
            marginBottom: '16px',
            maxWidth: '280px',
          }}
        >
          Track your markdown documents with source files using the Alexandria CLI
        </div>
        <code
          style={{
            fontSize: theme.fontSizes[1],
            backgroundColor: theme.colors.backgroundLight,
            padding: '8px 12px',
            borderRadius: '4px',
            border: `1px solid ${theme.colors.border}`,
            fontFamily: theme.fonts.monospace,
            marginBottom: '12px',
          }}
        >
          npx @principal-ai/alexandria-cli add-doc
        </code>
        <a
          href="https://www.npmjs.com/package/@principal-ai/alexandria-cli"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: theme.fontSizes[0],
            color: theme.colors.primary,
            textDecoration: 'none',
            marginTop: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Learn more about Alexandria CLI
        </a>
      </div>
    );
  }

  // Show generic empty state (no docs or no search results)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: theme.colors.textSecondary,
        padding: '40px 20px',
      }}
    >
      <div style={{ marginBottom: '12px', opacity: 0.5 }}>
        <FileText size={48} />
      </div>
      <div
        style={{
          marginBottom: '8px',
          fontSize: theme.fontSizes[2],
          fontWeight: theme.fontWeights.medium,
        }}
      >
        {filterText ? 'No matching documents' : 'No documents found'}
      </div>
      <div style={{ fontSize: theme.fontSizes[1], opacity: 0.8 }}>
        {filterText
          ? 'Try a different search term'
          : 'Markdown documents will appear here'}
      </div>
    </div>
  );
};
