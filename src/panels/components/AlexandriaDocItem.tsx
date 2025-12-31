import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@principal-ade/industry-theme';
import { ChevronRight, PanelRight, Copy, FileSymlink } from 'lucide-react';
import type { AlexandriaDocItemData } from './types';
import type { PanelEventEmitter } from '../../types';
import { AssociatedFilesTree } from './AssociatedFilesTree';
import './styles.css';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}

interface AlexandriaDocItemProps {
  doc: AlexandriaDocItemData;
  onSelect: () => void;
  onFileSelect?: (filePath: string) => void;
  repositoryRoot?: string;
  events?: PanelEventEmitter;
  /** Whether this document is currently selected/active */
  isSelected?: boolean;
}

const AlexandriaDocItemComponent: React.FC<AlexandriaDocItemProps> = ({
  doc,
  onSelect,
  onFileSelect,
  repositoryRoot,
  events,
  isSelected = false,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const hasAssociatedFiles =
    doc.associatedFiles && doc.associatedFiles.length > 0;

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu.visible]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleOpenInRightPanel = useCallback(() => {
    if (events) {
      events.emit({
        type: 'doc:openInRightPanel',
        source: 'alexandria-docs-panel',
        timestamp: Date.now(),
        payload: doc,
      });
    }
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [events, doc]);

  const handleCopyFullPath = useCallback(() => {
    navigator.clipboard.writeText(doc.path);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [doc.path]);

  const handleCopyRelativePath = useCallback(() => {
    navigator.clipboard.writeText(doc.relativePath);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [doc.relativePath]);

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
        // Set CSS custom properties for background colors
        ['--theme-bg' as string]: theme.colors.background,
        ['--theme-bg-secondary' as string]: theme.colors.backgroundSecondary,
      }}
    >
      {/* Main document row - uses CSS class for hover instead of JS */}
      <div
        className={`alexandria-doc-item${isSelected ? ' alexandria-doc-item--selected' : ''}`}
        onClick={handleDocClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={isSelected ? {
          backgroundColor: `${theme.colors.primary}20`,
          borderLeft: `2px solid ${theme.colors.primary}`,
        } : undefined}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          {/* Expand button for associated files */}
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
                transition: 'transform 0.2s ease',
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              <ChevronRight size={16} color={theme.colors.textSecondary} />
            </div>
          )}

          {/* Document info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2px',
              }}
            >
              <div
                style={{
                  fontSize: theme.fontSizes[2],
                  fontWeight: isSelected ? theme.fontWeights.semibold : theme.fontWeights.medium,
                  color: isSelected ? theme.colors.primary : theme.colors.text,
                }}
              >
                {doc.name}
              </div>
              {doc.mtime && (
                <div
                  style={{
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textSecondary,
                    opacity: 0.7,
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}
                >
                  {getRelativeTime(doc.mtime)}
                </div>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
                opacity: 0.8,
              }}
            >
              <span style={{ wordBreak: 'break-all' }}>
                {doc.relativePath.substring(0, doc.relativePath.lastIndexOf('/')) || '/'}
              </span>
              {hasAssociatedFiles && doc.associatedFiles && (
                <span style={{ flexShrink: 0, marginLeft: '8px' }}>
                  {doc.associatedFiles.length} {doc.associatedFiles.length === 1 ? 'file' : 'files'}
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

      {/* Context menu - rendered as portal to avoid parent opacity issues */}
      {contextMenu.visible &&
        createPortal(
          <div
            ref={contextMenuRef}
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              minWidth: '180px',
              padding: '4px 0',
              fontFamily: theme.fonts.body,
              // CSS variable for hover state
              ['--theme-bg-secondary' as string]: theme.colors.backgroundSecondary,
            }}
          >
            <button
              onClick={handleOpenInRightPanel}
              className="context-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: theme.fontSizes[1],
                color: theme.colors.text,
                textAlign: 'left',
              }}
            >
              <PanelRight size={14} />
              Open in Right Panel
            </button>
            <div
              style={{
                height: '1px',
                backgroundColor: theme.colors.border,
                margin: '4px 0',
              }}
            />
            <button
              onClick={handleCopyFullPath}
              className="context-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: theme.fontSizes[1],
                color: theme.colors.text,
                textAlign: 'left',
              }}
            >
              <Copy size={14} />
              Copy Full Path
            </button>
            <button
              onClick={handleCopyRelativePath}
              className="context-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: theme.fontSizes[1],
                color: theme.colors.text,
                textAlign: 'left',
              }}
            >
              <FileSymlink size={14} />
              Copy Relative Path
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};

// Wrap with React.memo for performance - prevents re-renders when props haven't changed
export const AlexandriaDocItem = memo(AlexandriaDocItemComponent);
