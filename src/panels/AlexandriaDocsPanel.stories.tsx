import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { AlexandriaDocsPanel } from './AlexandriaDocsPanel';
import type { PanelComponentProps, DataSlice } from '../types';

interface MarkdownFile {
  path: string;
  title?: string;
  lastModified?: number;
}

// Mock panel context
const createMockContext = (
  markdownFiles: MarkdownFile[] = [],
  loading = false
): PanelComponentProps['context'] => {
  const markdownSlice: DataSlice<MarkdownFile[]> = {
    scope: 'repository',
    name: 'markdown',
    data: markdownFiles,
    loading,
    error: null,
    refresh: async () => {},
  };

  const slices = new Map<string, DataSlice>();
  slices.set('markdown', markdownSlice);

  return {
    currentScope: {
      type: 'repository',
      repository: {
        name: 'mock-repository',
        path: '/mock/repository',
      },
    },
    slices: slices as ReadonlyMap<string, DataSlice>,
    getSlice: <T,>(name: string): DataSlice<T> | undefined => {
      return slices.get(name) as DataSlice<T> | undefined;
    },
    getWorkspaceSlice: <T,>(name: string): DataSlice<T> | undefined => {
      return name === 'markdown'
        ? (slices.get(name) as DataSlice<T> | undefined)
        : undefined;
    },
    getRepositorySlice: <T,>(name: string): DataSlice<T> | undefined => {
      return name === 'markdown'
        ? (slices.get(name) as DataSlice<T> | undefined)
        : undefined;
    },
    hasSlice: (name: string) => slices.has(name),
    isSliceLoading: (name: string) => {
      const slice = slices.get(name);
      return slice ? slice.loading : false;
    },
    refresh: async () => {},
  };
};

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
        title: 'Architecture Overview',
        lastModified: new Date('2025-11-10').getTime(),
      },
      {
        path: '/mock/repository/docs/api/endpoints.md',
        title: 'API Endpoints',
        lastModified: new Date('2025-11-08').getTime(),
      },
      {
        path: '/mock/repository/docs/getting-started.md',
        title: 'Getting Started Guide',
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
        title: `Document ${i}`,
        lastModified: new Date(2025, 10, 14 - i).getTime(),
      })),
    ),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};
