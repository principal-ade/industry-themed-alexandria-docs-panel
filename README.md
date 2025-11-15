# Alexandria Docs Panel

A panel extension for viewing and managing repository documentation in Principal ADE applications.

## Features (Milestone 1 - MVP)

- ✅ Display list of markdown documents from repository
- ✅ Click to open documents
- ✅ Auto-refresh when data changes
- ✅ Empty state handling
- ✅ Loading state
- ✅ Industry theme styling

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
  path: string;           // Full file system path
  title?: string;         // Optional document title
  lastModified: number;   // Unix timestamp
}
```

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
- **Many Documents** - 50 documents for scroll testing

## Architecture

### Component Structure

```
src/
├── panels/
│   ├── AlexandriaDocsPanel.tsx           # Main panel component
│   ├── AlexandriaDocsPanel.stories.tsx   # Storybook stories
│   └── components/
│       └── AlexandriaDocItem.tsx         # Individual doc item
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

### Milestone 2 (Future)

- Search and filtering
- Sort by name/date
- Track/untracked status indicators
- Associated files tree view
- Map/visualization integration
- Git status indicators
- Coverage view

## Bundle Size

- Bundle: ~20KB (gzipped: ~6KB)
- Well under the 150KB target

## Dependencies

### Runtime

- `@a24z/industry-theme` - Theming and styling
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

**Version**: 0.1.0 (Milestone 1 - MVP)
**Author**: Principal AI
