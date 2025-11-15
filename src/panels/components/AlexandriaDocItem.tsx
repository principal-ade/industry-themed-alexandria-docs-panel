import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { FileText } from 'lucide-react';
import type { AlexandriaDocItemData } from '../AlexandriaDocsPanel';

interface AlexandriaDocItemProps {
  doc: AlexandriaDocItemData;
  onSelect: () => void;
}

export const AlexandriaDocItem: React.FC<AlexandriaDocItemProps> = ({
  doc,
  onSelect,
}) => {
  const { theme } = useTheme();

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '16px 20px',
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${theme.colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: theme.fonts.body,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            flexShrink: 0,
          }}
        >
          <FileText size={20} color={theme.colors.textSecondary} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: theme.fontSizes[2],
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.text,
              marginBottom: '2px',
            }}
          >
            {doc.name}
          </div>
          <div
            style={{
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
              opacity: 0.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {doc.relativePath}
          </div>
        </div>
      </div>
    </div>
  );
};
