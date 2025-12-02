import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Book, BookMarked, FileCode, Search, X } from 'lucide-react';

interface PanelHeaderProps {
  documentCount: number;
  isLoading: boolean;
  hasAlexandriaConfig: boolean;
  showTrackedOnly: boolean;
  onToggleTrackedOnly: () => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  filterText: string;
  onFilterTextChange: (text: string) => void;
  onClearFilter: () => void;
  showConfigView?: boolean;
  onToggleConfigView?: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  documentCount,
  isLoading,
  hasAlexandriaConfig,
  showTrackedOnly,
  onToggleTrackedOnly,
  showSearch,
  onToggleSearch,
  filterText,
  onFilterTextChange,
  onClearFilter,
  showConfigView,
  onToggleConfigView,
}) => {
  const { theme } = useTheme();

  return (
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
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <button
            onClick={onToggleConfigView}
            disabled={!hasAlexandriaConfig}
            style={{
              background: showConfigView
                ? theme.colors.backgroundSecondary
                : 'none',
              border: `1px solid ${showConfigView ? theme.colors.border : 'transparent'}`,
              borderRadius: '4px',
              cursor: hasAlexandriaConfig ? 'pointer' : 'default',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showConfigView
                ? theme.colors.primary
                : theme.colors.primary,
              opacity: hasAlexandriaConfig ? 1 : 0.6,
              transition: 'all 0.2s ease',
            }}
            title={
              hasAlexandriaConfig
                ? showConfigView
                  ? 'Hide Alexandria configuration'
                  : 'Show Alexandria configuration'
                : 'No Alexandria configuration found'
            }
          >
            {hasAlexandriaConfig ? (
              <BookMarked size={16} />
            ) : (
              <Book size={16} />
            )}
          </button>
          {isLoading ? (
            <div
              style={{
                height: '14px',
                width: '80px',
                backgroundColor: theme.colors.border,
                borderRadius: '4px',
                animation: 'shimmer 1.5s infinite',
                background: `linear-gradient(90deg, ${theme.colors.border} 25%, ${theme.colors.backgroundLight} 50%, ${theme.colors.border} 75%)`,
                backgroundSize: '200% 100%',
              }}
            />
          ) : (
            <span
              style={{
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
                fontWeight: theme.fontWeights.medium,
              }}
            >
              {showConfigView
                ? 'Alexandria Config'
                : `${documentCount} ${documentCount === 1 ? 'document' : 'documents'}`}
            </span>
          )}
        </div>

        {/* Action buttons */}
        {!isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Tracked-only filter button */}
            <button
              onClick={onToggleTrackedOnly}
              style={{
                background: showTrackedOnly
                  ? theme.colors.backgroundSecondary
                  : 'none',
                border: `1px solid ${showTrackedOnly ? theme.colors.border : 'transparent'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: showTrackedOnly
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!showTrackedOnly) {
                  e.currentTarget.style.color = theme.colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!showTrackedOnly) {
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
              title={
                showTrackedOnly
                  ? 'Show all documents'
                  : 'Show tracked documents only'
              }
            >
              <FileCode size={16} />
            </button>

            {/* Search toggle button */}
            <button
              onClick={onToggleSearch}
              style={{
                background: showSearch
                  ? theme.colors.backgroundSecondary
                  : 'none',
                border: `1px solid ${showSearch ? theme.colors.border : 'transparent'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: showSearch
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!showSearch) {
                  e.currentTarget.style.color = theme.colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!showSearch) {
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
              title={showSearch ? 'Close search' : 'Search documents'}
            >
              <Search size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      {showSearch && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            marginTop: '12px',
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
            onChange={(e) => onFilterTextChange(e.target.value)}
            autoFocus
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
              onClick={onClearFilter}
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
      )}
    </div>
  );
};
