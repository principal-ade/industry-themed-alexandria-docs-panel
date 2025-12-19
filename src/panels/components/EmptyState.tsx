import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { FileCode, FileText, Copy, Check } from 'lucide-react';

const AGENT_INSTALL_PROMPT = `Initialize Alexandria in this repository to track documentation:

npx @principal-ai/alexandria-cli init

After initialization, use \`npx @principal-ai/alexandria-cli add-doc\` to track markdown documents with their related source files.`;

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
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_INSTALL_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

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
        <button
          onClick={handleCopyPrompt}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: theme.fontSizes[1],
            backgroundColor: theme.colors.backgroundLight,
            padding: '10px 16px',
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
            fontFamily: theme.fonts.body,
            marginBottom: '12px',
            cursor: 'pointer',
            color: theme.colors.text,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background;
            e.currentTarget.style.borderColor = theme.colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.backgroundLight;
            e.currentTarget.style.borderColor = theme.colors.border;
          }}
        >
          {copied ? (
            <>
              <Check size={16} style={{ color: theme.colors.success || '#22c55e' }} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy prompt for AI agent</span>
            </>
          )}
        </button>
        <div
          style={{
            fontSize: theme.fontSizes[0],
            opacity: 0.7,
            marginBottom: '16px',
            maxWidth: '240px',
          }}
        >
          Paste this prompt to your AI coding assistant to get started
        </div>
        <a
          href="https://www.npmjs.com/package/@principal-ai/alexandria-cli"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: theme.fontSizes[0],
            color: theme.colors.primary,
            textDecoration: 'none',
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
  // If there's a filter, show search-specific messaging
  if (filterText) {
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
          No matching documents
        </div>
        <div style={{ fontSize: theme.fontSizes[1], opacity: 0.8 }}>
          Try a different search term
        </div>
      </div>
    );
  }

  // No documents at all - show setup prompt
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
        Set up Alexandria to track your documentation alongside source files
      </div>
      <button
        onClick={handleCopyPrompt}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: theme.fontSizes[1],
          backgroundColor: theme.colors.backgroundLight,
          padding: '10px 16px',
          borderRadius: '6px',
          border: `1px solid ${theme.colors.border}`,
          fontFamily: theme.fonts.body,
          marginBottom: '12px',
          cursor: 'pointer',
          color: theme.colors.text,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background;
          e.currentTarget.style.borderColor = theme.colors.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.backgroundLight;
          e.currentTarget.style.borderColor = theme.colors.border;
        }}
      >
        {copied ? (
          <>
            <Check size={16} style={{ color: theme.colors.success || '#22c55e' }} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span>Copy prompt for AI agent</span>
          </>
        )}
      </button>
      <div
        style={{
          fontSize: theme.fontSizes[0],
          opacity: 0.7,
          marginBottom: '16px',
          maxWidth: '240px',
        }}
      >
        Paste this prompt to your AI coding assistant to get started
      </div>
      <a
        href="https://www.npmjs.com/package/@principal-ai/alexandria-cli"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: theme.fontSizes[0],
          color: theme.colors.primary,
          textDecoration: 'none',
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
};
