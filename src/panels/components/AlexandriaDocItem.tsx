import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { FileText, ChevronRight, ChevronDown } from 'lucide-react';
import type { AlexandriaDocItemData } from '../AlexandriaDocsPanel';
import type { PanelEventEmitter } from '../../types';
import { AssociatedFilesTree } from './AssociatedFilesTree';

interface AlexandriaDocItemProps {
  doc: AlexandriaDocItemData;
  onSelect: () => void;
  onFileSelect?: (filePath: string) => void;
  repositoryRoot?: string;
  events?: PanelEventEmitter;
}

export const AlexandriaDocItem: React.FC<AlexandriaDocItemProps> = ({
  doc,
  onSelect,
  onFileSelect,
  repositoryRoot,
  events,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasAssociatedFiles =
    doc.associatedFiles && doc.associatedFiles.length > 0;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleDocClick = (e: React.MouseEvent) => {
    // Only open the doc if we're not clicking on the expand button
    if (!(e.target as HTMLElement).closest('[data-expand-button]')) {
      onSelect();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // Update hover styling
    e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary;

    // Emit hover event with document data
    if (events) {
      events.emit({
        type: 'doc:hover',
        source: 'alexandria-docs-panel',
        timestamp: Date.now(),
        payload: doc,
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    // Reset hover styling
    e.currentTarget.style.backgroundColor = 'transparent';

    // Emit hover event with null payload to clear highlights
    if (events) {
      events.emit({
        type: 'doc:hover',
        source: 'alexandria-docs-panel',
        timestamp: Date.now(),
        payload: null,
      });
    }
  };

  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Main document row */}
      <div
        onClick={handleDocClick}
        style={{
          padding: '16px 20px',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Expand/collapse button (only if has associated files) */}
          {hasAssociatedFiles && (
            <div
              data-expand-button
              onClick={handleToggleExpand}
              style={{
                flexShrink: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                transition: 'color 0.2s ease',
                color: theme.colors.textSecondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </div>
          )}

          {/* File icon */}
          <div
            style={{
              flexShrink: 0,
            }}
          >
            <FileText size={20} color={theme.colors.textSecondary} />
          </div>

          {/* Document info */}
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
              {hasAssociatedFiles && doc.associatedFiles && (
                <span style={{ marginLeft: '8px' }}>
                  • {doc.associatedFiles.length} associated{' '}
                  {doc.associatedFiles.length === 1 ? 'file' : 'files'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Associated files tree (expanded) */}
      {isExpanded && hasAssociatedFiles && doc.associatedFiles && (
        <div
          style={{
            paddingLeft: '48px',
            paddingRight: '20px',
            paddingBottom: '12px',
          }}
        >
          <AssociatedFilesTree
            filePaths={doc.associatedFiles}
            onFileSelect={onFileSelect}
            repositoryRoot={repositoryRoot}
          />
        </div>
      )}
    </div>
  );
};
