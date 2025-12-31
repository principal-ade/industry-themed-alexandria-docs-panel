import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { AlexandriaDocItem } from './AlexandriaDocItem';
import type { AlexandriaDocItemData } from './types';

const meta: Meta<typeof AlexandriaDocItem> = {
  title: 'Components/AlexandriaDocItem',
  component: AlexandriaDocItem,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ maxWidth: '400px', backgroundColor: '#1a1a1a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlexandriaDocItem>;

const mockEvents = {
  emit: () => {},
  on: () => () => {},
  off: () => {},
};

// Basic document without associated files
const basicDoc: AlexandriaDocItemData = {
  path: '/mock/repository/docs/getting-started.md',
  name: 'Getting Started',
  relativePath: 'docs/getting-started.md',
  mtime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
};

// Document with associated files
const trackedDoc: AlexandriaDocItemData = {
  path: '/mock/repository/docs/architecture.md',
  name: 'Architecture Overview',
  relativePath: 'docs/architecture.md',
  mtime: new Date(Date.now() - 15 * 60 * 1000), // 15m ago
  associatedFiles: [
    'src/core/app.ts',
    'src/core/config.ts',
    'src/core/types.ts',
  ],
  isTracked: true,
};

// Document with many associated files
const manyFilesDoc: AlexandriaDocItemData = {
  path: '/mock/repository/docs/api-reference.md',
  name: 'API Reference',
  relativePath: 'docs/api-reference.md',
  mtime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4d ago
  associatedFiles: [
    'src/api/routes.ts',
    'src/api/handlers/users.ts',
    'src/api/handlers/auth.ts',
    'src/api/handlers/posts.ts',
    'src/api/middleware.ts',
    'src/api/validators.ts',
    'src/api/errors.ts',
  ],
  isTracked: true,
};

// Root-level document
const rootDoc: AlexandriaDocItemData = {
  path: '/mock/repository/README.md',
  name: 'README',
  relativePath: 'README.md',
  mtime: new Date(), // just now
};

// Document with single associated file
const singleFileDoc: AlexandriaDocItemData = {
  path: '/mock/repository/docs/setup.md',
  name: 'Setup Guide',
  relativePath: 'docs/setup.md',
  mtime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1w ago
  associatedFiles: ['scripts/setup.sh'],
  isTracked: true,
};

export const Basic: Story = {
  args: {
    doc: basicDoc,
    onSelect: () => console.log('Selected basic doc'),
    events: mockEvents,
  },
};

export const WithAssociatedFiles: Story = {
  args: {
    doc: trackedDoc,
    onSelect: () => console.log('Selected tracked doc'),
    events: mockEvents,
  },
};

export const WithManyFiles: Story = {
  args: {
    doc: manyFilesDoc,
    onSelect: () => console.log('Selected many files doc'),
    events: mockEvents,
  },
};

export const RootLevel: Story = {
  args: {
    doc: rootDoc,
    onSelect: () => console.log('Selected root doc'),
    events: mockEvents,
  },
};

export const SingleAssociatedFile: Story = {
  args: {
    doc: singleFileDoc,
    onSelect: () => console.log('Selected single file doc'),
    events: mockEvents,
  },
};

export const Selected: Story = {
  args: {
    doc: trackedDoc,
    onSelect: () => console.log('Selected'),
    events: mockEvents,
    isSelected: true,
  },
};

// Show multiple items together
export const ItemList: Story = {
  render: () => (
    <div>
      <AlexandriaDocItem
        doc={rootDoc}
        onSelect={() => {}}
        events={mockEvents}
      />
      <AlexandriaDocItem
        doc={trackedDoc}
        onSelect={() => {}}
        events={mockEvents}
      />
      <AlexandriaDocItem
        doc={manyFilesDoc}
        onSelect={() => {}}
        events={mockEvents}
      />
      <AlexandriaDocItem
        doc={basicDoc}
        onSelect={() => {}}
        events={mockEvents}
      />
      <AlexandriaDocItem
        doc={singleFileDoc}
        onSelect={() => {}}
        events={mockEvents}
      />
    </div>
  ),
};
