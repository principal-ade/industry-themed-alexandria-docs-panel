import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Book } from 'lucide-react';

export const ConfigEmptyState: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.colors.backgroundSecondary,
        fontFamily: theme.fonts.body,
      }}
    >
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
          <Book size={48} />
        </div>
        <div
          style={{
            marginBottom: '8px',
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
          }}
        >
          No Alexandria configuration
        </div>
        <div
          style={{
            fontSize: theme.fontSizes[1],
            opacity: 0.8,
            marginBottom: '16px',
            maxWidth: '280px',
          }}
        >
          Initialize Alexandria to track your documentation and source files
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
          npx @principal-ai/alexandria-cli init
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
    </div>
  );
};
