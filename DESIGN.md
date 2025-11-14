# Alexandria Docs Panel Extension - Design Document

**Version**: 1.0
**Date**: 2025-11-14
**Status**: Draft for Review
**Current Milestone**: 1 (MVP)

---

## 1. Executive Summary

This document outlines the design for converting the built-in Alexandria Docs Panel from the desktop-app electron application into a standalone, NPM-distributable panel extension using the `@principal-ade/panel-framework-core` architecture.

The project is divided into **two milestones** to enable iterative delivery and validation.

### Milestone 1 Goals (MVP - Current)
- Create a simple, portable documentation list panel
- Display markdown documents from the repository
- Support click-to-open functionality
- Follow panel framework best practices
- Use `@a24z/industry-theme` for consistent styling

### Milestone 2 Goals (Future)
- Add search and filtering capabilities
- Add associated files tree view (CodebaseView integration)
- Implement map/visualization integration via events
- Add git status indicators
- Coverage view functionality
- Advanced metadata features

### Non-Goals (Both Milestones)
- Full-text search (beyond file name/path matching)
- Document editing capabilities
- Document creation wizards
- Advanced analytics/metrics

---

## 2. Architecture Overview

### 2.1 Source Codebases

**Reference Implementation**:
- Location: `/Users/griever/Developer/desktop-app/electron-app/src/renderer/repo-manager/shared/AlexandriaDocsPanel.tsx`
- Type: Built-in Electron panel with tight IPC integration
- Dependencies: Electron IPC, AlexandriaDocsService, Code City integration

**Target Template**:
- Location: `/Users/griever/Developer/industry-themed-panel-starter`
- Type: Standalone panel extension starter
- Architecture: NPM package with panel framework integration

### 2.2 Key Architectural Shift

```
BEFORE (Built-in Panel):
┌─────────────────────────────────────┐
│ AlexandriaDocsPanel.tsx             │
│   ↓                                 │
│ AlexandriaDocsService (Renderer)    │
│   ↓                                 │
│ IPC Bridge (Electron)               │
│   ↓                                 │
│ AlexandriaDocsApiEventHandler       │
│   ↓                                 │
│ AlexandriaRegistryService           │
│   ↓                                 │
│ @a24z/core-library                  │
└─────────────────────────────────────┘

AFTER (Panel Extension):
┌─────────────────────────────────────┐
│ AlexandriaDocsPanel.tsx             │
│   ↓                                 │
│ Panel Framework (Props)             │
│   - context (data slices)           │
│   - actions (host interactions)     │
│   - events (inter-panel comms)      │
│   ↓                                 │
│ Host Application                    │
│   - Provides markdown data slice    │
│   - Handles file operations         │
│   - Manages Code City integration   │
└─────────────────────────────────────┘
```

---

## 3. Data Architecture

### 3.1 Data Slice Requirements

The panel will primarily consume the **`markdown`** data slice provided by the host application.

#### Required Data Slice Structure

```typescript
interface MarkdownDataSlice {
  // List of all markdown files in the repository
  files: MarkdownFile[];

  // Optional: Alexandria-specific metadata
  trackedDocuments?: AlexandriaDocument[];
  untrackedDocuments?: AlexandriaDocument[];
  excludedDocuments?: AlexandriaDocument[];
}

interface AlexandriaDocument {
  path: string;              // Full file system path
  name: string;              // Display name (without .md)
  relativePath: string;      // Relative to repo root
  isTracked: boolean;        // In a CodebaseView?
  mtime?: Date;              // Last modification time
  files?: string[];          // Associated files from CodebaseView
  hasUncommittedChanges?: boolean;  // Git status indicator
}
```

#### Fallback Strategy

If the host doesn't provide Alexandria-specific data, the panel will:
1. Use the basic `markdown` slice (list of markdown files)
2. Display all markdown files as "untracked"
3. Disable CodebaseView-specific features (associated files, coverage view)
4. Show a status message: "Connect to Alexandria registry for full features"

### 3.2 Additional Data Needs

The panel may also consume:
- **`git`** slice - For showing uncommitted changes on associated files
- **`fileTree`** slice - For building associated file trees

---

## 4. Panel Actions & Host Integration

### 4.1 Required Actions

The panel will need these standard panel actions:

```typescript
// From PanelActions interface
actions.openFile(filePath: string)           // Open markdown doc or associated file
actions.navigateToPanel(panelId: string)     // Navigate to related panels
actions.notifyPanels(event: PanelEvent)      // Broadcast selection events
```

### 4.2 Custom Actions (Nice-to-Have)

Ideally, the host application would provide Alexandria-specific actions:

```typescript
// Custom actions for enhanced functionality
actions.highlightFilesOnMap?(files: string[], layerId: string, color: string)
actions.clearMapHighlights?(layerId: string)
actions.showCoverageView?(documentPaths: string[])
actions.trackDocument?(documentPath: string)
actions.untrackDocument?(documentPath: string)
```

**Fallback**: If custom actions aren't available, use `actions.notifyPanels()` to broadcast events that other panels (like Code City) can subscribe to.

### 4.3 Event-Driven Map Integration

```typescript
// Panel emits events when documents are selected
events.emit({
  type: 'alexandria:document-selected',
  data: {
    documentPath: string,
    associatedFiles: string[],
    highlightColor: '#9333ea',  // purple
    layerId: 'alexandria-doc-files'
  }
});

// Panel emits events for hover previews
events.emit({
  type: 'alexandria:document-hovered',
  data: {
    documentPath: string,
    associatedFiles: string[],
    opacity: 0.3
  }
});

// Panel emits coverage view events
events.emit({
  type: 'alexandria:coverage-toggled',
  data: {
    enabled: boolean,
    allDocumentedFiles: string[],
    highlightColor: '#22c55e'  // green
  }
});
```

---

## 5. Component Structure

### 5.1 File Organization

#### Milestone 1 Structure (Simplified)

```
src/
├── panels/
│   ├── AlexandriaDocsPanel.tsx           # Main panel component
│   ├── AlexandriaDocsPanel.stories.tsx   # Storybook stories
│   └── components/
│       └── AlexandriaDocItem.tsx         # Individual doc item
│
├── hooks/
│   └── useAlexandriaDocuments.ts         # Data extraction from context
│
├── types/
│   └── index.ts                          # Panel types
│
├── mocks/
│   └── panelContext.tsx                  # Mock panel context for Storybook
│
└── index.tsx                             # Panel registration
```

#### Milestone 2 Additions (Future)

```
src/
├── panels/
│   └── components/
│       ├── CodebaseViewFileTree.tsx      # Associated files tree
│       ├── SearchBar.tsx                 # Search/filter controls
│       ├── SortControls.tsx              # Sorting dropdown
│       └── CoverageButton.tsx            # Coverage view toggle
│
├── hooks/
│   ├── useDocumentSearch.ts              # Search logic
│   ├── useDocumentSort.ts                # Sorting logic
│   └── useMapHighlights.ts               # Map integration logic
│
└── utils/
    ├── documentFilters.ts                # Filter functions
    ├── documentSorters.ts                # Sort functions
    └── fileTreeBuilder.ts                # Build file trees
```

### 5.2 Main Panel Component (Milestone 1)

```typescript
// AlexandriaDocsPanel.tsx
import React from 'react';
import { PanelComponentProps } from '@/types';
import { useAlexandriaDocuments } from '@/hooks/useAlexandriaDocuments';
import { AlexandriaDocItem } from './components/AlexandriaDocItem';
import '@a24z/industry-theme/styles.css';
import './AlexandriaDocsPanel.css';

export const AlexandriaDocsPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
}) => {
  // Extract markdown files from context
  const documents = useAlexandriaDocuments(context);

  // Handler
  const handleDocumentClick = (path: string) => {
    actions.openFile(path);
  };

  return (
    <div className="alexandria-panel">
      <div className="alexandria-panel__header">
        <h2>Documentation</h2>
        <span className="doc-count">{documents.length} documents</span>
      </div>

      <div className="alexandria-panel__list">
        {documents.length === 0 ? (
          <div className="empty-state">
            No markdown documents found in this repository
          </div>
        ) : (
          documents.map((doc) => (
            <AlexandriaDocItem
              key={doc.path}
              document={doc}
              onClick={() => handleDocumentClick(doc.path)}
            />
          ))
        )}
      </div>
    </div>
  );
};
```

---

## 6. Feature Implementation Plan

### 6.1 Milestone 1 Features (MVP)

| Feature | Implementation Notes |
|---------|---------------------|
| Document List Display | Use `context.markdownFiles` |
| Click to Open Document | `actions.openFile(path)` |
| Real-time Updates | Auto-updates via context changes |
| Basic Styling | Use `@a24z/industry-theme` |

### 6.2 Milestone 2 Features (Future)

| Feature | Implementation Notes |
|---------|---------------------|
| Search by Name/Path | Local filtering logic |
| Filter: All vs Tracked | Requires Alexandria metadata |
| Sort: Recent vs Alpha | Use file mtime from context |
| Visual Status Indicators | Green (tracked), Yellow (untracked) |
| Associated Files Tree | Requires CodebaseView data in slice |
| Git Status Indicators | Requires `git` data slice |
| Map Highlighting (Selection) | Emit events for Code City panel |
| Map Highlighting (Hover) | Emit hover events |
| Coverage View | Emit coverage toggle events |
| Tracked Badge Click | Requires associated files data |

### 6.3 Nice-to-Have Features (Post-Milestone 2)

- Document creation UI
- Inline markdown preview
- Full-text search integration
- Batch tracking operations
- Document templates
- Coverage statistics
- Dependency graph visualization

---

## 7. Panel Registration & Metadata

### 7.1 Panel Definition

```typescript
// src/index.tsx
import { AlexandriaDocsPanel } from './panels/AlexandriaDocsPanel';
import { PanelDefinition } from './types';

export const panels: PanelDefinition[] = [
  {
    id: 'principal-ade.alexandria-docs',
    name: 'Alexandria Docs',
    icon: '📚',  // or URL to custom icon
    version: '1.0.0',
    author: 'Principal AI',
    description: 'View and manage repository documentation with Alexandria integration',
    component: AlexandriaDocsPanel,

    // Lifecycle hooks
    onMount: async (context) => {
      console.log('[Alexandria] Panel mounted for repo:', context.repositoryPath);
    },

    onUnmount: async (context) => {
      console.log('[Alexandria] Panel unmounted');
      // Cleanup: clear map highlights
    },

    onDataChange: (slice, data) => {
      if (slice === 'markdown') {
        console.log('[Alexandria] Markdown data updated:', data);
      }
    },
  },
];
```

### 7.2 Package Metadata

```json
// package.json
{
  "name": "@principal-ade/alexandria-docs-panel",
  "version": "1.0.0",
  "description": "Alexandria documentation panel for Principal ADE",
  "keywords": ["panel-extension", "alexandria", "documentation", "markdown"],
  "main": "dist/panels.bundle.js",
  "types": "dist/index.d.ts",
  "author": "Principal AI",
  "license": "MIT",
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "lucide-react": "^0.552.0",
    "clsx": "^2.1.1"
  }
}
```

---

## 8. Styling & Theming

### 8.1 Approach (Milestone 1)

**Decision: Use `@a24z/industry-theme` as a dependency**

- Depend on `@a24z/industry-theme` as a regular dependency
- Import theme CSS in panel component
- Bundle theme into panel output
- Ensures visual consistency with other Principal ADE components
- Simplifies styling implementation

### 8.2 Styling Structure

```typescript
// src/panels/AlexandriaDocsPanel.tsx
import '@a24z/industry-theme/styles.css';
import './AlexandriaDocsPanel.css';

// Component uses industry theme classes + custom classes
<div className="alexandria-panel">
  <div className="alexandria-panel__header">...</div>
  <div className="alexandria-panel__list">...</div>
</div>
```

```css
/* src/panels/AlexandriaDocsPanel.css */
/* Custom layout styles that build on industry theme */
.alexandria-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.alexandria-panel__header {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.alexandria-panel__list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

/* ...etc */
```

---

## 9. Implementation Strategy

### Milestone 1 (MVP) - Current Focus

**Phase 1: Project Setup**
1. Set up project from panel starter template
2. Install `@a24z/industry-theme` dependency
3. Configure build and development tools

**Phase 2: Core Implementation**
1. Create `AlexandriaDocsPanel` component
2. Create `AlexandriaDocItem` component
3. Implement `useAlexandriaDocuments` hook
4. Add basic styling with industry theme

**Phase 3: Testing & Polish**
1. Create Storybook stories (empty, with docs, loading states)
2. Test with mock data
3. Implement error states
4. Add documentation

**Phase 4: Distribution**
1. Build and test locally
2. Publish to NPM (v0.1.0)
3. Integration testing with host application
4. Gather feedback

### Milestone 2 (Future) - Deferred Features

**Phase 5: Enhanced Features**
1. Add search and filtering UI
2. Implement sorting (recent/alphabetical)
3. Add status indicators (tracked/untracked)
4. Test advanced scenarios

**Phase 6: Advanced Integration**
1. Implement associated files tree
2. Add git status indicators
3. Implement map event emission
4. Test event-driven map integration

**Phase 7: Final Polish**
1. Performance optimization
2. Comprehensive testing
3. Full documentation
4. Publish v1.0.0

---

## 10. Dependencies

### 10.1 Peer Dependencies (Provided by Host)
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### 10.2 Direct Dependencies (Bundled)
```json
{
  "@a24z/industry-theme": "latest",  // Styling and theming
  "lucide-react": "^0.552.0",        // Icons
  "clsx": "^2.1.1"                   // Conditional classNames
}
```

### 10.3 Dev Dependencies
```json
{
  "@principal-ade/panel-framework-core": "latest",  // Type definitions
  "@vitejs/plugin-react": "^4.0.0",
  "vite": "^6.0.7",
  "typescript": "^5.0.4",
  "eslint": "^9.32.0",
  "prettier": "^3.6.2",
  "storybook": "^8.5.0"
}
```

---

## 11. Testing Strategy

### 11.1 Storybook Stories

```typescript
// AlexandriaDocsPanel.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AlexandriaDocsPanel } from './AlexandriaDocsPanel';
import { MockPanelProvider } from '@/mocks/panelContext';

const meta: Meta<typeof AlexandriaDocsPanel> = {
  title: 'Panels/Alexandria Docs Panel',
  component: AlexandriaDocsPanel,
  decorators: [(Story) => <MockPanelProvider><Story /></MockPanelProvider>],
};

export default meta;
type Story = StoryObj<typeof AlexandriaDocsPanel>;

// Story 1: Empty state
export const EmptyState: Story = {
  args: {},
};

// Story 2: With tracked and untracked documents
export const WithDocuments: Story = {
  args: {},
};

// Story 3: Search active
export const WithSearch: Story = {
  args: {},
};

// Story 4: Tracked only filter
export const TrackedOnly: Story = {
  args: {},
};

// Story 5: With git changes
export const WithGitChanges: Story = {
  args: {},
};
```

### 11.2 Mock Data

```typescript
// src/mocks/alexandriaData.ts
export const mockAlexandriaDocuments: AlexandriaDocument[] = [
  {
    path: '/repo/docs/architecture.md',
    name: 'Architecture',
    relativePath: 'docs/architecture.md',
    isTracked: true,
    mtime: new Date('2025-11-10'),
    files: ['src/core/app.ts', 'src/core/config.ts'],
    hasUncommittedChanges: false,
  },
  {
    path: '/repo/README.md',
    name: 'README',
    relativePath: 'README.md',
    isTracked: false,
    mtime: new Date('2025-11-14'),
    files: [],
    hasUncommittedChanges: true,
  },
  // ...more mock documents
];
```

---

## 12. Decisions Made

### 12.1 Theme Strategy ✅
**Decision**: Use `@a24z/industry-theme` as a dependency

The panel will depend on `@a24z/industry-theme` and bundle it into the output. This ensures visual consistency and simplifies development.

### 12.2 Milestone Approach ✅
**Decision**: Two-milestone delivery

- **Milestone 1**: Simple list with click-to-open (current focus)
- **Milestone 2**: Advanced features (search, filters, map integration, etc.)

This allows for faster iteration and early validation.

---

## 13. Open Questions (Milestone 2)

These questions are deferred to Milestone 2:

### 13.1 Data Slice Provisioning
**Question**: Will the host application provide Alexandria-specific data in the markdown slice?

**Options**:
- A) Host provides full Alexandria metadata (tracked/untracked status, associated files)
- B) Panel only receives basic markdown files
- C) Panel makes additional API calls to Alexandria registry

**Recommendation**: Option A - Extend markdown slice with Alexandria metadata

### 13.2 Map Integration Approach
**Question**: How should the panel integrate with Code City visualization?

**Options**:
- A) Custom action: `actions.highlightFilesOnMap(files, config)`
- B) Event-based: Panel emits events, Code City panel subscribes
- C) Shared context: Both panels access highlight state from context

**Recommendation**: Option B (event-based) - Most flexible and decoupled

---

## 14. Success Criteria

### 14.1 Milestone 1 (MVP) - Functional Requirements
- ✅ Displays all markdown documents in repository
- ✅ Click to open documents
- ✅ Refreshes automatically on data changes
- ✅ Empty state when no documents
- ✅ Uses industry theme for styling

### 14.2 Milestone 1 (MVP) - Non-Functional Requirements
- Bundle size < 150KB (excluding React, including industry theme)
- Loads in < 100ms on typical repository
- Smooth scrolling with 500+ documents
- Basic accessibility (semantic HTML, keyboard navigation)

### 14.3 Milestone 1 (MVP) - Developer Experience
- Complete TypeScript types
- Basic Storybook stories (empty, with docs)
- README with installation and usage
- Published to NPM as v0.1.0

### 14.4 Milestone 2 - Additional Requirements
- Search by document name or path
- Filter tracked/untracked documents
- Sort by recent edit or alphabetically
- Shows tracked vs untracked status
- Shows associated files tree
- Indicates git changes on associated files
- Emits events for map integration
- Comprehensive Storybook coverage
- Full API documentation
- Published to NPM as v1.0.0

---

## 15. Timeline Estimate

### Milestone 1 (MVP)

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Project Setup | Initialize from template, install dependencies | 1-2 hours |
| Core Components | Panel, DocItem components | 3-4 hours |
| Data Hook | Extract markdown from context | 1-2 hours |
| Styling | Industry theme integration, basic CSS | 2-3 hours |
| Testing | Storybook stories, edge cases | 2-3 hours |
| Documentation | README, basic usage docs | 1-2 hours |
| **Milestone 1 Total** | | **10-16 hours** |

### Milestone 2 (Future)

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Search & Filter | UI components, logic | 4-6 hours |
| Sorting | Implementation and UI | 2-3 hours |
| Status Indicators | Tracked/untracked badges | 2-3 hours |
| File Tree | Associated files component | 4-6 hours |
| Git Integration | Status indicators | 2-3 hours |
| Map Events | Event emission logic | 3-4 hours |
| Testing | Advanced scenarios | 3-4 hours |
| Documentation | Full API docs | 2-3 hours |
| **Milestone 2 Total** | | **22-32 hours** |

### Combined Total: 32-48 hours

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Host doesn't provide Alexandria metadata | High | Implement fallback mode with basic markdown list |
| Map integration events not subscribed | Medium | Document event contract, provide sample Code City integration |
| Bundle size too large | Low | Tree-shake dependencies, lazy load components |
| Performance with many documents | Medium | Implement virtual scrolling if needed |
| Theme inconsistency | Low | Use CSS variables for customization |

---

## 17. Future Enhancements (Post-Milestone 2)

### Post-V1 Features
1. **Document Creation Wizard**
   - Templates for common doc types
   - Auto-populate with repository context
   - CodebaseView generation

2. **Full-Text Search**
   - Search document contents, not just names
   - Integration with document search service

3. **Analytics Dashboard**
   - Documentation coverage metrics
   - Stale document detection
   - Contribution statistics

4. **Batch Operations**
   - Multi-select documents
   - Bulk track/untrack
   - Bulk export

5. **Document Graph**
   - Visualize document relationships
   - Cross-reference detection
   - Dependency mapping

---

## 18. Conclusion

This design provides a comprehensive roadmap for converting the Alexandria Docs Panel into a standalone, reusable panel extension, delivered in two focused milestones.

### Key Takeaways:

**Architecture:**
- **Data-driven**: Panel relies on host-provided data slices
- **Portable**: NPM package, easy to integrate into any panel-framework host
- **Themed**: Uses `@a24z/industry-theme` for consistent styling

**Milestone 1 (MVP):**
- Simple list of markdown documents
- Click to open functionality
- Industry theme styling
- **Estimated effort**: 10-16 hours

**Milestone 2 (Future):**
- Search, filter, and sorting
- Associated files tree
- Map integration via events
- Git status indicators
- **Estimated effort**: 22-32 hours

### Next Steps for Milestone 1:
1. ✅ Review and approve this design
2. Set up project from panel starter template
3. Install `@a24z/industry-theme` dependency
4. Implement core panel component
5. Create Storybook stories
6. Build and publish v0.1.0

---

**Document prepared by**: Claude Code
**Current Milestone**: 1 (MVP)
**Last Updated**: 2025-11-14
