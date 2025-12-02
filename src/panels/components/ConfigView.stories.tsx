import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { ConfigView } from './ConfigView';
import { ConfigEmptyState } from './ConfigEmptyState';
import type { AlexandriaConfig } from './types';

const meta: Meta<typeof ConfigView> = {
  title: 'Components/ConfigView',
  component: ConfigView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', backgroundColor: '#1a1a1a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConfigView>;

// Basic config with just required fields
const minimalConfig: AlexandriaConfig = {
  version: '1.0.0',
};

// Full featured config
const fullConfig: AlexandriaConfig = {
  $schema: 'https://raw.githubusercontent.com/a24z-ai/alexandria-cli/main/schema/alexandriarc.json',
  version: '1.0.0',
  project: {
    name: 'my-awesome-project',
    description: 'A comprehensive project with full Alexandria configuration',
    version: '2.1.0',
    type: 'application',
    language: ['TypeScript', 'JavaScript'],
    framework: ['React', 'Node.js'],
  },
  context: {
    useGitignore: true,
    maxDepth: 10,
    followSymlinks: false,
    patterns: {
      include: ['src/**/*.ts', 'src/**/*.tsx', 'docs/**/*.md'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts'],
    },
    rules: [
      {
        id: 'document-organization',
        name: 'Document Organization',
        severity: 'error',
        enabled: true,
        message: 'Documentation should be in designated folders',
        options: {
          documentFolders: ['docs', 'documentation', '.alexandria'],
          rootExceptions: ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'],
          checkNested: true,
        },
      },
      {
        id: 'filename-convention',
        name: 'Filename Convention',
        severity: 'warning',
        enabled: true,
        pattern: '^[a-z][a-z0-9-]*\\.md$',
        message: 'Filenames must be lowercase with hyphens',
        options: {
          style: 'kebab-case',
          allowNumbers: true,
        },
        fix: {
          type: 'replace',
          suggestion: 'Rename file to match pattern',
        },
      },
      {
        id: 'stale-references',
        name: 'Stale References',
        severity: 'info',
        enabled: true,
        description: 'Checks for broken links to files that have been moved or deleted.',
      },
      {
        id: 'require-references',
        name: 'Require References',
        severity: 'warning',
        enabled: false,
        description: 'Every documentation file must reference at least one source file.',
        options: {
          minReferences: 1,
        },
      },
    ],
  },
  reporting: {
    output: 'console',
    format: 'text',
    verbose: false,
  },
};

// Library project config
const libraryConfig: AlexandriaConfig = {
  version: '1.0.0',
  project: {
    name: 'alexandria-core-library',
    description: 'Core library for Alexandria CLI',
    type: 'library',
    language: 'TypeScript',
  },
  context: {
    useGitignore: true,
    rules: [
      {
        id: 'document-organization',
        name: 'Document Organization',
        severity: 'error',
        enabled: true,
      },
      {
        id: 'require-references',
        name: 'Require References',
        severity: 'error',
        enabled: true,
      },
    ],
  },
};

// Service config with reporting
const serviceConfig: AlexandriaConfig = {
  version: '1.0.0',
  project: {
    name: 'api-gateway',
    type: 'service',
    language: ['Go', 'Protocol Buffers'],
    framework: 'gRPC',
  },
  context: {
    maxDepth: 5,
    patterns: {
      include: ['**/*.go', '**/*.proto'],
      exclude: ['vendor/**'],
    },
  },
  reporting: {
    output: 'file',
    format: 'json',
    path: './reports/alexandria.json',
    verbose: true,
  },
};

// Story 1: Minimal config
export const MinimalConfig: Story = {
  args: {
    config: minimalConfig,
    configPath: '/project/.alexandriarc.json',
  },
};

// Story 2: Full config
export const FullConfig: Story = {
  args: {
    config: fullConfig,
    configPath: '/Users/dev/my-awesome-project/.alexandriarc.json',
    onOpenConfig: () => {},
  },
};

// Story 3: Library config
export const LibraryConfig: Story = {
  args: {
    config: libraryConfig,
    configPath: '/packages/core/.alexandriarc.json',
    onOpenConfig: () => {},
  },
};

// Story 4: Service config
export const ServiceConfig: Story = {
  args: {
    config: serviceConfig,
    configPath: '/services/api-gateway/.alexandriarc.json',
    onOpenConfig: () => {},
  },
};

// Story 5: Without open config action
export const WithoutOpenAction: Story = {
  args: {
    config: fullConfig,
    configPath: '/project/.alexandriarc.json',
  },
};

// Story 6: Empty State (no config)
export const EmptyState: StoryObj<typeof ConfigEmptyState> = {
  render: () => <ConfigEmptyState />,
};
