import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export const LoadingSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              height: '16px',
              width: `${60 + (i % 3) * 15}%`,
              backgroundColor: theme.colors.border,
              borderRadius: '4px',
              animation: 'shimmer 1.5s infinite',
              background: `linear-gradient(90deg, ${theme.colors.border} 25%, ${theme.colors.backgroundLight} 50%, ${theme.colors.border} 75%)`,
              backgroundSize: '200% 100%',
            }}
          />
          <div
            style={{
              height: '12px',
              width: `${40 + (i % 2) * 20}%`,
              backgroundColor: theme.colors.border,
              borderRadius: '4px',
              animation: 'shimmer 1.5s infinite',
              animationDelay: '0.1s',
              background: `linear-gradient(90deg, ${theme.colors.border} 25%, ${theme.colors.backgroundLight} 50%, ${theme.colors.border} 75%)`,
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      ))}
    </div>
  );
};
