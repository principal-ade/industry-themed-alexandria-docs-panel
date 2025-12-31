import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { CONFIG_FILENAME } from '@principal-ai/alexandria-core-library';
import { AlexandriaDocsPanel } from './AlexandriaDocsPanel';
import type { PanelComponentProps, DataSlice } from '../types';
import type { FileTree, FileInfo, DirectoryInfo } from '@principal-ai/repository-abstraction';
import picomatch from 'picomatch';

// ============================================================================
// Mock Data Types
// ============================================================================

interface MockFile {
  path: string;
  relativePath: string;
  name: string;
  extension: string;
  content?: string; // For readFile mock
  lastModified?: Date;
}

interface MockContextOptions {
  files?: MockFile[];
  loading?: boolean;
  hasAlexandriaConfig?: boolean;
  /** Mock file contents for readFile adapter */
  fileContents?: Record<string, string>;
}

// ============================================================================
// Mock FileTree Builder
// ============================================================================

function createMockFileTree(files: MockFile[], repositoryPath: string): FileTree {
  // Use relative paths in the FileTree (matching real electron app behavior)
  const allFiles: FileInfo[] = files
    .filter((f) => !f.path.endsWith('/'))
    .map((f) => ({
      path: f.relativePath, // Use relativePath as path (matching electron app)
      name: f.name,
      extension: f.extension,
      size: f.content?.length ?? 100,
      lastModified: f.lastModified ?? new Date(),
      isDirectory: false,
      relativePath: f.relativePath,
    }));

  const root: DirectoryInfo = {
    path: repositoryPath,
    name: repositoryPath.split('/').pop() || 'repository',
    children: [],
    fileCount: allFiles.length,
    totalSize: allFiles.reduce((sum, f) => sum + f.size, 0),
    depth: 0,
    relativePath: '',
  };

  return {
    sha: 'mock-sha',
    root,
    allFiles,
    allDirectories: [root],
    stats: {
      totalFiles: allFiles.length,
      totalDirectories: 1,
      totalSize: root.totalSize,
      maxDepth: 2,
    },
    metadata: {
      id: 'mock-filetree',
      timestamp: new Date(),
      sourceType: 'mock',
      sourceInfo: {},
    },
  };
}

// ============================================================================
// Mock Context Factory
// ============================================================================

const REPOSITORY_PATH = '/mock/repository';

function createMockContext(options: MockContextOptions = {}): PanelComponentProps['context'] {
  const { files = [], loading = false, fileContents = {} } = options;

  // Build FileTree from files
  const fileTree = createMockFileTree(files, REPOSITORY_PATH);

  const fileTreeSlice: DataSlice<FileTree> = {
    scope: 'repository',
    name: 'fileTree',
    data: fileTree,
    loading,
    error: null,
    refresh: async () => {},
  };

  const slices = new Map<string, DataSlice>();
  slices.set('fileTree', fileTreeSlice);

  // Build file contents map (for readFile adapter) - use relative paths as keys
  const allFileContents: Record<string, string> = { ...fileContents };
  for (const file of files) {
    if (file.content && !allFileContents[file.relativePath]) {
      allFileContents[file.relativePath] = file.content;
    }
  }

  return {
    currentScope: {
      type: 'repository',
      repository: {
        name: 'mock-repository',
        path: REPOSITORY_PATH,
      },
    },
    slices: slices as ReadonlyMap<string, DataSlice>,
    getSlice: <T,>(name: string): DataSlice<T> | undefined => {
      return slices.get(name) as DataSlice<T> | undefined;
    },
    getWorkspaceSlice: <T,>(name: string): DataSlice<T> | undefined => {
      return slices.get(name) as DataSlice<T> | undefined;
    },
    getRepositorySlice: <T,>(name: string): DataSlice<T> | undefined => {
      return slices.get(name) as DataSlice<T> | undefined;
    },
    hasSlice: (name: string) => slices.has(name),
    isSliceLoading: (name: string) => {
      const slice = slices.get(name);
      return slice ? slice.loading : false;
    },
    refresh: async () => {},
    // Adapters for FileTree-based MemoryPalace
    adapters: {
      readFile: async (path: string): Promise<string> => {
        const content = allFileContents[path];
        if (content === undefined) {
          throw new Error(`File not found: ${path}`);
        }
        return content;
      },
      matchesPath: (pattern: string, path: string): boolean => {
        return picomatch(pattern)(path);
      },
    },
  };
}

// ============================================================================
// Mock Actions & Events
// ============================================================================

const createMockActions = (): PanelComponentProps['actions'] => ({
  openFile: (filePath: string) => {
    console.log('[Storybook] Opening file:', filePath);
  },
  openGitDiff: () => {},
  navigateToPanel: () => {},
  notifyPanels: () => {},
});

const createMockEvents = (): PanelComponentProps['events'] => ({
  emit: (event) => {
    console.log('[Storybook] Event emitted:', event);
  },
  on: () => () => {},
  off: () => {},
});

// ============================================================================
// Alexandria Config & Views
// ============================================================================

const ALEXANDRIA_CONFIG = JSON.stringify({
  version: 1,
  limits: {
    noteMaxLength: 10000,
    maxTagsPerNote: 20,
    maxAnchorsPerNote: 50,
    tagDescriptionMaxLength: 500,
  },
  storage: { compressionEnabled: false },
  context: {
    useGitignore: true,
    maxDepth: 10,
    followSymlinks: false,
    patterns: {
      include: ['**/*.md', '**/*.mdx', 'docs/**/*'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
    rules: [
      {
        id: 'document-organization',
        name: 'Document Organization',
        severity: 'warning',
        enabled: true,
        options: {
          documentFolders: ['docs', '.alexandria'],
          rootExceptions: ['README.md', 'CHANGELOG.md'],
        },
      },
      {
        id: 'filename-convention',
        name: 'Filename Convention',
        severity: 'warning',
        enabled: true,
        options: {
          style: 'kebab-case',
        },
      },
    ],
  },
});

function createCodebaseView(
  id: string,
  name: string,
  overviewPath: string,
  files: string[]
): string {
  return JSON.stringify({
    id,
    version: '1.0',
    name,
    description: `Documentation for ${name}`,
    overviewPath,
    category: 'guide',
    displayOrder: 1,
    referenceGroups: {
      main: {
        coordinates: [0, 0],
        files,
      },
    },
  });
}

// ============================================================================
// Story Configuration
// ============================================================================

const meta: Meta<typeof AlexandriaDocsPanel> = {
  title: 'Panels/Alexandria Docs Panel',
  component: AlexandriaDocsPanel,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '600px', backgroundColor: '#1a1a1a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlexandriaDocsPanel>;

// ============================================================================
// Stories
// ============================================================================

// Story 1: Empty state (no files)
export const EmptyState: Story = {
  args: {
    context: createMockContext({ files: [] }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 2: Loading state
export const LoadingState: Story = {
  args: {
    context: createMockContext({ files: [], loading: true }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 3: With documents (no Alexandria config - fileTree fallback)
export const WithDocuments: Story = {
  args: {
    context: createMockContext({
      files: [
        {
          path: `${REPOSITORY_PATH}/README.md`,
          relativePath: 'README.md',
          name: 'README.md',
          extension: '.md',
          lastModified: new Date('2025-11-14'),
        },
        {
          path: `${REPOSITORY_PATH}/CONTRIBUTING.md`,
          relativePath: 'CONTRIBUTING.md',
          name: 'CONTRIBUTING.md',
          extension: '.md',
          lastModified: new Date('2025-11-13'),
        },
        {
          path: `${REPOSITORY_PATH}/docs/architecture.md`,
          relativePath: 'docs/architecture.md',
          name: 'architecture.md',
          extension: '.md',
          lastModified: new Date('2025-11-10'),
        },
        {
          path: `${REPOSITORY_PATH}/docs/api/endpoints.md`,
          relativePath: 'docs/api/endpoints.md',
          name: 'endpoints.md',
          extension: '.md',
          lastModified: new Date('2025-11-08'),
        },
        {
          path: `${REPOSITORY_PATH}/docs/getting-started.md`,
          relativePath: 'docs/getting-started.md',
          name: 'getting-started.md',
          extension: '.md',
          lastModified: new Date('2025-11-05'),
        },
      ],
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 4: With Alexandria config and tracked documents
export const WithTrackedDocuments: Story = {
  args: {
    context: createMockContext({
      files: [
        // Alexandria config
        {
          path: `${REPOSITORY_PATH}/${CONFIG_FILENAME}`,
          relativePath: CONFIG_FILENAME,
          name: CONFIG_FILENAME,
          extension: '.json',
          content: ALEXANDRIA_CONFIG,
        },
        // Tracked document with view
        {
          path: `${REPOSITORY_PATH}/.alexandria/views/architecture-view.json`,
          relativePath: '.alexandria/views/architecture-view.json',
          name: 'architecture-view.json',
          extension: '.json',
          content: createCodebaseView(
            'architecture-view',
            'Architecture Overview',
            'docs/architecture.md',
            ['src/core/app.ts', 'src/core/config.ts', 'src/core/types.ts']
          ),
        },
        {
          path: `${REPOSITORY_PATH}/.alexandria/views/api-view.json`,
          relativePath: '.alexandria/views/api-view.json',
          name: 'api-view.json',
          extension: '.json',
          content: createCodebaseView('api-view', 'API Documentation', 'docs/api.md', [
            'src/api/routes.ts',
            'src/api/handlers/users.ts',
            'src/api/handlers/auth.ts',
          ]),
        },
        // Markdown documents
        {
          path: `${REPOSITORY_PATH}/docs/architecture.md`,
          relativePath: 'docs/architecture.md',
          name: 'architecture.md',
          extension: '.md',
          content: '# Architecture\n\nThis document describes the system architecture.',
          lastModified: new Date('2025-11-10'),
        },
        {
          path: `${REPOSITORY_PATH}/docs/api.md`,
          relativePath: 'docs/api.md',
          name: 'api.md',
          extension: '.md',
          content: '# API Documentation\n\nAPI endpoints and usage.',
          lastModified: new Date('2025-11-08'),
        },
        {
          path: `${REPOSITORY_PATH}/README.md`,
          relativePath: 'README.md',
          name: 'README.md',
          extension: '.md',
          content: '# My Project\n\nProject description.',
          lastModified: new Date('2025-11-14'),
        },
      ],
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 5: Many documents
export const ManyDocuments: Story = {
  args: {
    context: createMockContext({
      files: Array.from({ length: 50 }, (_, i) => ({
        path: `${REPOSITORY_PATH}/docs/section-${Math.floor(i / 10)}/doc-${i}.md`,
        relativePath: `docs/section-${Math.floor(i / 10)}/doc-${i}.md`,
        name: `doc-${i}.md`,
        extension: '.md',
        lastModified: new Date(2025, 10, 14 - (i % 30)),
      })),
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 6: Mixed tracked and untracked documents
export const MixedTrackedDocuments: Story = {
  args: {
    context: createMockContext({
      files: [
        // Alexandria config
        {
          path: `${REPOSITORY_PATH}/${CONFIG_FILENAME}`,
          relativePath: CONFIG_FILENAME,
          name: CONFIG_FILENAME,
          extension: '.json',
          content: ALEXANDRIA_CONFIG,
        },
        // One tracked view
        {
          path: `${REPOSITORY_PATH}/.alexandria/views/architecture-view.json`,
          relativePath: '.alexandria/views/architecture-view.json',
          name: 'architecture-view.json',
          extension: '.json',
          content: createCodebaseView(
            'architecture-view',
            'Architecture Overview',
            'docs/architecture.md',
            ['src/core/app.ts', 'src/core/config.ts', 'src/core/types.ts']
          ),
        },
        // Tracked document
        {
          path: `${REPOSITORY_PATH}/docs/architecture.md`,
          relativePath: 'docs/architecture.md',
          name: 'architecture.md',
          extension: '.md',
          content: '# Architecture Overview',
          lastModified: new Date('2025-11-10'),
        },
        // Untracked documents
        {
          path: `${REPOSITORY_PATH}/README.md`,
          relativePath: 'README.md',
          name: 'README.md',
          extension: '.md',
          lastModified: new Date('2025-11-14'),
        },
        {
          path: `${REPOSITORY_PATH}/CONTRIBUTING.md`,
          relativePath: 'CONTRIBUTING.md',
          name: 'CONTRIBUTING.md',
          extension: '.md',
          lastModified: new Date('2025-11-13'),
        },
        {
          path: `${REPOSITORY_PATH}/docs/guide.md`,
          relativePath: 'docs/guide.md',
          name: 'guide.md',
          extension: '.md',
          lastModified: new Date('2025-11-10'),
        },
      ],
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 7: Varied relative times with tracked documents - showcases relative time and associated files
export const VariedRelativeTimes: Story = {
  args: {
    context: createMockContext({
      files: [
        // Alexandria config (required for tracked docs)
        {
          path: `${REPOSITORY_PATH}/${CONFIG_FILENAME}`,
          relativePath: CONFIG_FILENAME,
          name: CONFIG_FILENAME,
          extension: '.json',
          content: ALEXANDRIA_CONFIG,
        },
        // View for just-updated doc (3 associated files)
        {
          path: `${REPOSITORY_PATH}/.alexandria/views/just-updated-view.json`,
          relativePath: '.alexandria/views/just-updated-view.json',
          name: 'just-updated-view.json',
          extension: '.json',
          content: createCodebaseView(
            'just-updated-view',
            'Just Updated',
            'docs/just-updated.md',
            ['src/components/Header.tsx', 'src/components/Footer.tsx', 'src/utils/helpers.ts']
          ),
        },
        // View for hours-ago doc (5 associated files)
        {
          path: `${REPOSITORY_PATH}/.alexandria/views/hours-ago-view.json`,
          relativePath: '.alexandria/views/hours-ago-view.json',
          name: 'hours-ago-view.json',
          extension: '.json',
          content: createCodebaseView(
            'hours-ago-view',
            'Hours Ago',
            'docs/hours-ago.md',
            ['src/api/routes.ts', 'src/api/handlers.ts', 'src/api/middleware.ts', 'src/api/auth.ts', 'src/api/validators.ts']
          ),
        },
        // Documents
        {
          path: `${REPOSITORY_PATH}/docs/just-updated.md`,
          relativePath: 'docs/just-updated.md',
          name: 'just-updated.md',
          extension: '.md',
          content: '# Just Updated\n\nThis doc was just updated.',
          lastModified: new Date(), // just now
        },
        {
          path: `${REPOSITORY_PATH}/docs/minutes-ago.md`,
          relativePath: 'docs/minutes-ago.md',
          name: 'minutes-ago.md',
          extension: '.md',
          content: '# Minutes Ago\n\nUpdated 15 minutes ago.',
          lastModified: new Date(Date.now() - 15 * 60 * 1000), // 15m ago
        },
        {
          path: `${REPOSITORY_PATH}/docs/hours-ago.md`,
          relativePath: 'docs/hours-ago.md',
          name: 'hours-ago.md',
          extension: '.md',
          content: '# Hours Ago\n\nUpdated 3 hours ago.',
          lastModified: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
        },
        {
          path: `${REPOSITORY_PATH}/docs/guides/days-ago.md`,
          relativePath: 'docs/guides/days-ago.md',
          name: 'days-ago.md',
          extension: '.md',
          content: '# Days Ago\n\nUpdated 4 days ago.',
          lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4d ago
        },
        {
          path: `${REPOSITORY_PATH}/docs/api/weeks-ago.md`,
          relativePath: 'docs/api/weeks-ago.md',
          name: 'weeks-ago.md',
          extension: '.md',
          content: '# Weeks Ago\n\nUpdated 2 weeks ago.',
          lastModified: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000), // 2w ago
        },
        {
          path: `${REPOSITORY_PATH}/README.md`,
          relativePath: 'README.md',
          name: 'README.md',
          extension: '.md',
          content: '# README\n\nProject readme.',
          lastModified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // ~1.5mo ago
        },
      ],
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};
