import React, { useState, useCallback, memo } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { FileText, FileCode, ChevronRight } from 'lucide-react';
import type { AlexandriaDocItemData } from './types';
import type { PanelEventEmitter } from '../../types';
import { AssociatedFilesTree } from './AssociatedFilesTree';
import './styles.css';

interface AlexandriaDocItemProps {
  doc: AlexandriaDocItemData;
  onSelect: () => void;
  onFileSelect?: (filePath: string) => void;
  repositoryRoot?: string;
  events?: PanelEventEmitter;
}

const AlexandriaDocItemComponent: React.FC<AlexandriaDocItemProps> = ({
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

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  const handleDocClick = useCallback(
    (e: React.MouseEvent) => {
      // Only open the doc if we're not clicking on the expand button
      if (!(e.target as HTMLElement).closest('[data-expand-button]')) {
        onSelect();
      }
    },
    [onSelect]
  );

  const handleMouseEnter = useCallback(() => {
    // Emit hover event with document data (styling handled by CSS)
    if (events) {
      events.emit({
        type: 'doc:hover',
        source: 'alexandria-docs-panel',
        timestamp: Date.now(),
        payload: doc,
      });
    }
  }, [events, doc]);

  const handleMouseLeave = useCallback(() => {
    // Emit hover event with null payload to clear highlights (styling handled by CSS)
    if (events) {
      events.emit({
        type: 'doc:hover',
        source: 'alexandria-docs-panel',
        timestamp: Date.now(),
        payload: null,
      });
    }
  }, [events]);

  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        fontFamily: theme.fonts.body,
        // Set CSS custom property for hover background color
        ['--theme-bg-tertiary' as string]: theme.colors.backgroundTertiary,
      }}
    >
      {/* Main document row - uses CSS class for hover instead of JS */}
      <div
        className="alexandria-doc-item"
        onClick={handleDocClick}
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
          {/* File icon - FileCode for linked docs (clickable), FileText for unlinked */}
          <div
            data-expand-button
            onClick={hasAssociatedFiles ? handleToggleExpand : undefined}
            style={{
              flexShrink: 0,
              position: 'relative',
              cursor: hasAssociatedFiles ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hasAssociatedFiles ? (
              <>
                <FileCode size={20} color={theme.colors.primary} />
                {/* Small chevron decorator */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -4,
                    backgroundColor: theme.colors.backgroundLight,
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                >
                  <ChevronRight size={10} color={theme.colors.primary} />
                </div>
              </>
            ) : (
              <FileText size={20} color={theme.colors.textSecondary} />
            )}
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
        <AssociatedFilesTree
          filePaths={doc.associatedFiles}
          onFileSelect={onFileSelect}
          repositoryRoot={repositoryRoot}
        />
      )}
    </div>
  );
};

// Wrap with React.memo for performance - prevents re-renders when props haven't changed
export const AlexandriaDocItem = memo(AlexandriaDocItemComponent);
