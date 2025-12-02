import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import {
  ChevronRight,
  Copy,
  Check,
  FolderTree,
  Shield,
} from 'lucide-react';
import type { AlexandriaConfig, ContextRule } from './types';

interface ConfigViewProps {
  config: AlexandriaConfig;
  configPath?: string;
  onOpenConfig?: () => void;
}

type TabId = 'context' | 'rules';

interface TabProps {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon, isActive, onClick }) => {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        background: isActive ? theme.colors.backgroundSecondary : 'transparent',
        border: 'none',
        borderBottom: isActive
          ? `2px solid ${theme.colors.primary}`
          : '2px solid transparent',
        cursor: 'pointer',
        color: isActive ? theme.colors.primary : theme.colors.textSecondary,
        fontFamily: theme.fonts.body,
        fontSize: theme.fontSizes[1],
        fontWeight: theme.fontWeights.medium,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = theme.colors.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = theme.colors.textSecondary;
        }
      }}
    >
      {icon}
      {label}
    </button>
  );
};

interface FieldRowProps {
  label: string;
  value: React.ReactNode;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '8px 0',
        gap: '12px',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <span
        style={{
          fontSize: theme.fontSizes[1],
          color: theme.colors.textSecondary,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: theme.fontSizes[1],
          color: theme.colors.text,
          textAlign: 'right',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  );
};

interface PatternColumnProps {
  label: string;
  items: string[];
}

const PatternColumn: React.FC<PatternColumnProps> = ({ label, items }) => {
  const { theme } = useTheme();

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: theme.fontSizes[0],
          color: theme.colors.textSecondary,
          marginBottom: '8px',
          fontWeight: theme.fontWeights.medium,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item, index) => (
          <span
            key={index}
            style={{
              fontSize: theme.fontSizes[0],
              backgroundColor: theme.colors.backgroundTertiary,
              color: theme.colors.text,
              padding: '4px 8px',
              borderRadius: '4px',
              border: `1px solid ${theme.colors.border}`,
              wordBreak: 'break-all',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

interface RuleItemProps {
  rule: ContextRule & { isCustomized?: boolean };
}

// Default rule configurations
const defaultRules: ContextRule[] = [
  {
    id: 'document-organization',
    name: 'Document Organization',
    description:
      'Ensures documentation files are organized in designated folders rather than scattered throughout the codebase.',
    severity: 'warning',
    enabled: true,
    options: {
      documentFolders: ['docs', 'documentation', '.alexandria'],
      rootExceptions: ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE.md'],
      checkNested: true,
    },
  },
  {
    id: 'filename-convention',
    name: 'Filename Convention',
    description:
      'Enforces consistent naming patterns for documentation files (e.g., kebab-case, snake_case).',
    severity: 'warning',
    enabled: true,
    options: {
      style: 'kebab-case',
      allowNumbers: true,
    },
  },
  {
    id: 'stale-references',
    name: 'Stale References',
    description:
      'Detects references to files or code that no longer exist or have been moved.',
    severity: 'warning',
    enabled: true,
  },
  {
    id: 'require-references',
    name: 'Require References',
    description:
      'Requires documentation files to include references to the source code they describe.',
    severity: 'info',
    enabled: false,
    options: {
      minReferences: 1,
    },
  },
];

// Helper to merge config rules with defaults
function getMergedRules(configRules?: ContextRule[]): Array<ContextRule & { isCustomized: boolean }> {
  return defaultRules.map((defaultRule) => {
    const configRule = configRules?.find((r) => r.id === defaultRule.id);
    if (configRule) {
      return {
        ...defaultRule,
        ...configRule,
        description: configRule.description || defaultRule.description,
        options: configRule.options || defaultRule.options,
        isCustomized: true,
      };
    }
    return { ...defaultRule, isCustomized: false };
  });
}

const RuleItem: React.FC<RuleItemProps> = ({ rule }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const severityColors: Record<string, string> = {
    error: theme.colors.error || '#ef4444',
    warning: theme.colors.warning || '#f59e0b',
    info: theme.colors.info || '#3b82f6',
  };

  const isEnabled = rule.enabled !== false;
  const hasOptions = rule.options && Object.keys(rule.options).length > 0;
  const isCustomized = rule.isCustomized ?? true;
  const description = rule.description;

  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        opacity: isEnabled ? 1 : 0.5,
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: theme.fonts.body,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronRight
            size={14}
            style={{
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: theme.colors.textSecondary,
            }}
          />
          <span
            style={{
              fontSize: theme.fontSizes[1],
              color: theme.colors.text,
              textAlign: 'left',
            }}
          >
            {rule.name || rule.id}
          </span>
        </div>
        <span
          style={{
            fontSize: theme.fontSizes[0],
            color: severityColors[rule.severity],
            textTransform: 'capitalize',
          }}
        >
          {rule.severity}
        </span>
      </button>

      {isExpanded && (
        <div
          style={{
            padding: '0 0 12px 30px',
          }}
        >
          {/* Description */}
          {description && (
            <p
              style={{
                fontSize: theme.fontSizes[0],
                color: theme.colors.textSecondary,
                margin: '0 0 12px 0',
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}

          {/* Configuration details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: theme.fontSizes[0],
            }}
          >
            {/* Default indicator */}
            {!isCustomized && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.colors.textSecondary }}>Configuration</span>
                <span style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }}>
                  Default
                </span>
              </div>
            )}

            {/* Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: theme.colors.textSecondary }}>Status</span>
              <span style={{ color: isEnabled ? theme.colors.success || '#22c55e' : theme.colors.textSecondary }}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Pattern */}
            {rule.pattern && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: theme.colors.textSecondary, flexShrink: 0 }}>Pattern</span>
                <code
                  style={{
                    color: theme.colors.text,
                    fontFamily: theme.fonts.monospace,
                    backgroundColor: theme.colors.backgroundTertiary,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    wordBreak: 'break-all',
                  }}
                >
                  {rule.pattern}
                </code>
              </div>
            )}

            {/* Message */}
            {rule.message && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: theme.colors.textSecondary, flexShrink: 0 }}>Message</span>
                <span style={{ color: theme.colors.text, textAlign: 'right' }}>{rule.message}</span>
              </div>
            )}

            {/* Fix suggestion */}
            {rule.fix && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: theme.colors.textSecondary, flexShrink: 0 }}>Auto-fix</span>
                <span style={{ color: theme.colors.text, textAlign: 'right' }}>
                  {rule.fix.type}{rule.fix.suggestion ? `: ${rule.fix.suggestion}` : ''}
                </span>
              </div>
            )}

            {/* Options */}
            {hasOptions && (
              <>
                <div
                  style={{
                    borderTop: `1px solid ${theme.colors.border}`,
                    margin: '6px 0',
                    paddingTop: '6px',
                  }}
                >
                  <span style={{ color: theme.colors.textSecondary, fontWeight: theme.fontWeights.medium }}>
                    Options
                  </span>
                </div>
                {Object.entries(rule.options!).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <span style={{ color: theme.colors.textSecondary }}>{key}</span>
                    <span style={{ color: theme.colors.text, textAlign: 'right', wordBreak: 'break-word' }}>
                      {Array.isArray(value)
                        ? value.join(', ')
                        : typeof value === 'boolean'
                          ? value
                            ? 'Yes'
                            : 'No'
                          : String(value)}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function generateConfigGuidance(config: AlexandriaConfig, configPath?: string): string {
  const lines: string[] = [
    '# Alexandria Configuration Context',
    '',
    'I am working with an Alexandria documentation configuration file.',
    configPath ? `The config is located at: ${configPath}` : '',
    '',
    '## Current Configuration',
    '',
    '```json',
    JSON.stringify(config, null, 2),
    '```',
    '',
    '## About Alexandria',
    '',
    'Alexandria is a documentation management tool that helps organize and validate documentation in codebases.',
    '',
    '### Key Configuration Sections:',
    '',
    '**context** - Controls how Alexandria scans the codebase:',
    '- `useGitignore`: Whether to respect .gitignore patterns',
    '- `maxDepth`: Maximum directory depth to scan',
    '- `followSymlinks`: Whether to follow symbolic links',
    '- `patterns.include`: Glob patterns for files to include',
    '- `patterns.exclude`: Glob patterns for files to exclude',
    '- `rules`: Validation rules for documentation',
    '',
    '**Available Rules:**',
    '- `document-organization`: Ensures docs are in designated folders (docs/, documentation/, .alexandria/)',
    '- `filename-convention`: Enforces naming patterns (kebab-case, snake_case, etc.)',
    '- `stale-references`: Detects broken links to moved/deleted files',
    '- `require-references`: Requires docs to reference source code they describe',
    '',
    '**Rule Severity Levels:** error, warning, info',
    '',
    '## How You Can Help',
    '',
    'Please help me configure Alexandria for my project. You can:',
    '1. Suggest appropriate include/exclude patterns for my codebase',
    '2. Recommend which rules to enable and their severity levels',
    '3. Configure rule options based on my project structure',
    '4. Explain what each setting does and its trade-offs',
  ];

  return lines.filter(line => line !== '').join('\n');
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  config,
  configPath,
  onOpenConfig,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('context');
  const [copied, setCopied] = useState(false);

  // Always show rules tab - merge config rules with defaults
  const mergedRules = getMergedRules(config.context?.rules);

  const handleCopyGuidance = async () => {
    const guidance = generateConfigGuidance(config, configPath);
    try {
      await navigator.clipboard.writeText(guidance);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy guidance:', err);
    }
  };

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
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundLight,
        }}
      >
        <Tab
          id="context"
          label="Context"
          icon={<FolderTree size={14} />}
          isActive={activeTab === 'context'}
          onClick={() => setActiveTab('context')}
        />
        <Tab
          id="rules"
          label="Rules"
          icon={<Shield size={14} />}
          isActive={activeTab === 'rules'}
          onClick={() => setActiveTab('rules')}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        {activeTab === 'context' && config.context && (
          <div>
            {config.context.useGitignore !== undefined && (
              <FieldRow
                label="Use .gitignore"
                value={config.context.useGitignore ? 'Yes' : 'No'}
              />
            )}
            {config.context.maxDepth !== undefined && (
              <FieldRow label="Max Depth" value={config.context.maxDepth} />
            )}
            {config.context.followSymlinks !== undefined && (
              <FieldRow
                label="Follow Symlinks"
                value={config.context.followSymlinks ? 'Yes' : 'No'}
              />
            )}
            {/* Patterns as side-by-side columns */}
            {(config.context.patterns?.include?.length ||
              config.context.patterns?.exclude?.length) && (
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '12px',
                }}
              >
                {config.context.patterns?.include &&
                  config.context.patterns.include.length > 0 && (
                    <PatternColumn
                      label="Include"
                      items={config.context.patterns.include}
                    />
                  )}
                {config.context.patterns?.exclude &&
                  config.context.patterns.exclude.length > 0 && (
                    <PatternColumn
                      label="Exclude"
                      items={config.context.patterns.exclude}
                    />
                  )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rules' && (
          <div>
            {mergedRules.map((rule) => (
              <RuleItem key={rule.id} rule={rule} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Config Path */}
        {configPath ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: theme.fontSizes[0],
                color: theme.colors.textSecondary,
                marginBottom: '2px',
              }}
            >
              Config file
            </div>
            <code
              style={{
                fontSize: theme.fontSizes[0],
                color: theme.colors.text,
                fontFamily: theme.fonts.monospace,
                wordBreak: 'break-all',
              }}
            >
              {configPath}
            </code>
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {/* Copy Guidance Button */}
        <button
          onClick={handleCopyGuidance}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: copied ? theme.colors.success || '#22c55e' : 'transparent',
            border: `1px solid ${copied ? theme.colors.success || '#22c55e' : theme.colors.border}`,
            borderRadius: '4px',
            cursor: 'pointer',
            color: copied ? '#fff' : theme.colors.textSecondary,
            fontSize: theme.fontSizes[0],
            fontFamily: theme.fonts.body,
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.borderColor = theme.colors.primary;
              e.currentTarget.style.color = theme.colors.primary;
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.borderColor = theme.colors.border;
              e.currentTarget.style.color = theme.colors.textSecondary;
            }
          }}
          title="Copy configuration context for AI assistance"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy for AI'}
        </button>
      </div>
    </div>
  );
};
