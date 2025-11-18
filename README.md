# Alexandria Docs Panel

A panel extension for viewing and managing repository documentation in Principal ADE applications.

## Features

### Milestone 1 (MVP) - Complete ✅

- ✅ Display list of markdown documents from repository
- ✅ Click to open documents
- ✅ Auto-refresh when data changes
- ✅ Empty state handling
- ✅ Loading state
- ✅ Industry theme styling
- ✅ Search and filtering

### Milestone 2 (In Progress) 🚧

- ✅ **Associated Files Tree View** - Expandable tree showing files linked to each document
- 🔲 Sort by name/date
- 🔲 Track/untracked status indicators
- 🔲 Git status indicators
- 🔲 Map/visualization integration
- 🔲 Coverage view

## Installation

```bash
npm install @principal-ade/alexandria-docs-panel
# or
bun install @principal-ade/alexandria-docs-panel
```

## Usage

### In Your Panel-Framework Host Application

The panel will automatically be discovered by host applications that support the `@principal-ade/panel-framework-core` architecture.

```typescript
import { panels } from '@principal-ade/alexandria-docs-panel';

// Panels are auto-loaded via the panel-extension keyword
// No manual registration needed if your host scans packages
```

**📖 See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed setup instructions and troubleshooting.**

### Panel Requirements

This panel requires the host application to provide:

- **Data Slice**: `markdown` - Array of `MarkdownFile` objects
- **Action**: `openFile(filePath: string)` - To open documents when clicked

### Data Slice Format

```typescript
interface MarkdownFile {
  path: string; // Full file system path
  title?: string; // Optional document title
  lastModified: number; // Unix timestamp

  // Optional: Alexandria-specific metadata (Milestone 2)
  associatedFiles?: string[]; // Array of file paths linked to this document
  isTracked?: boolean; // Whether document is tracked by Alexandria
  hasUncommittedChanges?: boolean; // Git status indicator
}
```

**Note**: The `associatedFiles` feature allows documents to display an expandable tree view of related source files. This is useful for CodebaseView integration where documentation is linked to specific code files.

## Development

### Setup

```bash
bun install
```

### Development Commands

```bash
# Build the panel
bun run build

# Type check
bun run typecheck

# Lint
bun run lint

# Format
bun run format

# Storybook (preview panel in isolation)
bun run storybook
```

### Storybook

View the panel in isolation with mock data:

```bash
bun run storybook
```

This will open http://localhost:6006 with interactive stories:

- **Empty State** - No documents
- **Loading State** - Data loading
- **With Documents** - 5 example documents
- **With Associated Files** - Documents with expandable file trees
- **Many Documents** - 50 documents for scroll testing

## Architecture

### Component Structure

```
src/
├── panels/
│   ├── AlexandriaDocsPanel.tsx           # Main panel component
│   ├── AlexandriaDocsPanel.stories.tsx   # Storybook stories
│   └── components/
│       ├── AlexandriaDocItem.tsx         # Individual doc item with expand/collapse
│       └── AssociatedFilesTree.tsx       # File tree view for associated files
├── types/
│   └── index.ts                          # TypeScript types
└── index.tsx                             # Panel registration
```

### Panel Definition

```typescript
{
  id: 'principal-ade.alexandria-docs',
  name: 'Alexandria Docs',
  icon: '📚',
  version: '0.1.0',
  author: 'Principal AI',
  description: 'View and manage repository documentation with Alexandria',
  component: AlexandriaDocsPanel,
}
```

## Roadmap

### Milestone 2 (In Progress)

- ✅ Associated files tree view
- 🚧 Sort by name/date
- 🚧 Track/untracked status indicators
- 🚧 Git status indicators
- 🚧 Map/visualization integration
- 🚧 Coverage view

### Future Enhancements

- Document creation UI
- Full-text search
- Batch operations
- Document templates

## Bundle Size

- Bundle: ~283KB (gzipped: ~55KB)
- Includes dynamic file tree library for associated files feature

## Dependencies

### Runtime

- `@principal-ade/industry-theme` - Theming and styling
- `@principal-ade/dynamic-file-tree` - File tree visualization component
- `@principal-ai/repository-abstraction` - File tree data structures
- `lucide-react` - Icon library
- `clsx` - Conditional className utility

### Peer Dependencies

- `react` >= 19.0.0
- `react-dom` >= 19.0.0

## License

MIT

## Contributing

See [DESIGN.md](./DESIGN.md) for the full design document and architecture details.

---

**Version**: 0.2.0 (Milestone 2 - In Progress)
**Author**: Principal AI

## Changelog

### v0.2.0 (2025-11-18)

- ✨ Added associated files tree view with expand/collapse functionality
- ✨ Integrated `@principal-ade/dynamic-file-tree` for file tree visualization
- 🔧 Extended MarkdownFile interface to support Alexandria metadata
- 📚 Updated Storybook with "With Associated Files" story
- 📝 Updated documentation

### v0.1.3 (2025-11-15)

- ✨ Added filter bar for searching documents
- 🐛 Fixed production JSX runtime issue

### v0.1.0 (2025-11-14)

- 🎉 Initial MVP release
- ✨ Basic document list display
- ✨ Click to open functionality
- ✨ Industry theme styling
