import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
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

// Demonstrate drag-and-drop functionality
export const DraggableDocuments: Story = {
  render: () => {
    const [draggedDoc, setDraggedDoc] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    return (
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Source: Alexandria panel with draggable docs */}
        <div style={{ flex: 1, border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' }}>
          <h3 style={{ padding: '10px', margin: 0, background: '#2a2a2a', fontSize: '14px', color: '#ccc' }}>
            Alexandria Panel (Drag Source)
          </h3>
          <div style={{ backgroundColor: '#1a1a1a' }}>
            <AlexandriaDocItem
              doc={trackedDoc}
              onSelect={() => {}}
              isSelected={false}
              events={mockEvents}
            />
            <AlexandriaDocItem
              doc={basicDoc}
              onSelect={() => {}}
              isSelected={false}
              events={mockEvents}
            />
            <AlexandriaDocItem
              doc={manyFilesDoc}
              onSelect={() => {}}
              isSelected={false}
              events={mockEvents}
            />
          </div>
        </div>

        {/* Target: Drop zone to test drag data */}
        <div
          style={{
            flex: 1,
            border: isDragOver ? '2px dashed #3b82f6' : '2px dashed #444',
            borderRadius: '8px',
            padding: '20px',
            minHeight: '300px',
            backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
            transition: 'all 0.2s ease',
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => {
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const data = e.dataTransfer.getData('application/x-panel-data');
            if (data) {
              try {
                const panelData = JSON.parse(data);
                setDraggedDoc(panelData.primaryData);
              } catch (err) {
                console.error('Failed to parse panel data:', err);
              }
            }
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#ccc' }}>
            Drop Zone (Terminal Simulation)
          </h3>
          {draggedDoc ? (
            <div style={{
              padding: '12px',
              background: '#2a2a2a',
              borderRadius: '4px',
              border: '1px solid #3b82f6'
            }}>
              <div style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '8px', fontWeight: 'bold' }}>
                ✓ Dropped successfully!
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                <strong>Path inserted:</strong>
              </div>
              <pre style={{
                margin: 0,
                padding: '8px',
                background: '#1a1a1a',
                borderRadius: '2px',
                fontSize: '11px',
                color: '#ccc',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {draggedDoc}
              </pre>
              <button
                onClick={() => setDraggedDoc(null)}
                style={{
                  marginTop: '12px',
                  padding: '6px 12px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          ) : (
            <div style={{ color: '#666', fontSize: '13px', textAlign: 'center', marginTop: '80px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>↓</div>
              <p>Drag a document from the left panel here to test</p>
              <p style={{ fontSize: '11px', color: '#555', marginTop: '8px' }}>
                The absolute file path will be displayed when dropped
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
