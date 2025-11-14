import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '@a24z/industry-theme';
import { AlexandriaDocsPanel } from './AlexandriaDocsPanel';
import type { PanelComponentProps, MarkdownFile } from '../types';

// Mock panel context
const createMockContext = (
  markdownFiles: MarkdownFile[] = [],
  loading = false
): PanelComponentProps['context'] => ({
  repositoryPath: '/mock/repository',
  repository: null,
  markdownFiles,
  gitStatus: {
    staged: [],
    unstaged: [],
    untracked: [],
    deleted: [],
  },
  gitStatusLoading: false,
  fileTree: null,
  packages: null,
  quality: null,
  loading,
  hasSlice: (slice: string) => slice === 'markdown',
  isSliceLoading: (slice: string) => slice === 'markdown' && loading,
  refresh: async () => {},
});

// Mock panel actions
const createMockActions = (): PanelComponentProps['actions'] => ({
  openFile: (filePath: string) => {
    console.warn('[Storybook] Opening file:', filePath);
  },
  openGitDiff: () => {},
  navigateToPanel: () => {},
  notifyPanels: () => {},
});

// Mock panel events
const createMockEvents = (): PanelComponentProps['events'] => ({
  emit: (event) => {
    console.warn('[Storybook] Event emitted:', event);
  },
  on: () => () => {},
  off: () => {},
});

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

// Story 1: Empty state
export const EmptyState: Story = {
  args: {
    context: createMockContext([]),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 2: Loading state
export const LoadingState: Story = {
  args: {
    context: createMockContext([], true),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 3: With documents
export const WithDocuments: Story = {
  args: {
    context: createMockContext([
      {
        path: '/mock/repository/README.md',
        lastModified: new Date('2025-11-14').getTime(),
      },
      {
        path: '/mock/repository/CONTRIBUTING.md',
        lastModified: new Date('2025-11-13').getTime(),
      },
      {
        path: '/mock/repository/docs/architecture.md',
        lastModified: new Date('2025-11-10').getTime(),
      },
      {
        path: '/mock/repository/docs/api/endpoints.md',
        lastModified: new Date('2025-11-08').getTime(),
      },
      {
        path: '/mock/repository/docs/getting-started.md',
        lastModified: new Date('2025-11-05').getTime(),
      },
    ]),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

// Story 4: Many documents
export const ManyDocuments: Story = {
  args: {
    context: createMockContext(
      Array.from({ length: 50 }, (_, i) => ({
        path: `/mock/repository/docs/section-${Math.floor(i / 10)}/doc-${i}.md`,
        lastModified: new Date(2025, 10, 14 - i).getTime(),
      })),
    ),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};
