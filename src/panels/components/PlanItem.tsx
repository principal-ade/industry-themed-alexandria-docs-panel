import React, { memo, useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { FileText } from 'lucide-react';
import type { PlanItemData } from './types';

interface PlanItemProps {
  plan: PlanItemData;
  onClick: (path: string) => void;
  isSelected?: boolean;
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

const PlanItemComponent: React.FC<PlanItemProps> = ({
  plan,
  onClick,
  isSelected = false,
}) => {
  const { theme } = useTheme();

  const handleClick = useCallback(() => {
    onClick(plan.relativePath);
  }, [onClick, plan.relativePath]);

  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        cursor: 'pointer',
      }}
    >
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: isSelected
            ? `${theme.colors.primary}20`
            : 'transparent',
          borderLeft: isSelected
            ? `2px solid ${theme.colors.primary}`
            : '2px solid transparent',
        }}
      >
        <FileText size={16} color={theme.colors.textSecondary} />
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
                fontWeight: isSelected
                  ? theme.fontWeights.semibold
                  : theme.fontWeights.medium,
                color: isSelected ? theme.colors.primary : theme.colors.text,
              }}
            >
              {plan.name}
            </div>
            {plan.mtime && (
              <div
                style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.textSecondary,
                  opacity: 0.7,
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              >
                {getRelativeTime(plan.mtime)}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
              opacity: 0.8,
            }}
          >
            {plan.relativePath.replace('.claude/plans/', '')}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlanItem = memo(PlanItemComponent);
