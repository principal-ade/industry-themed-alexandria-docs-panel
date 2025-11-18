# Alexandria Docs Panel - Integration Guide

## Summary

The alexandria-docs-panel is loading correctly (no type errors), but showing no content because the **`markdown` data slice is missing** from the context.

## Quick Answer

**What's Missing:** The panel requires a `markdown` slice in the context, but web-ade currently only provides `git`, `active-file`, and `fileTree` slices.

**Solution:** Add a `markdown` slice provider that scans the repository/file tree for markdown files and provides them in the expected format.

---

## Detailed Answers to Questions

### 1. What data does alexandria-docs-panel expect?

**Required Slice:** `markdown`

The panel looks for this in `src/panels/AlexandriaDocsPanel.tsx:29`:

```typescript
const markdownSlice = context.getSlice<MarkdownFile[]>('markdown');
```

**Expected Data Structure:**

```typescript
interface MarkdownFile {
  path: string; // Full file system path (e.g., "/repo/path/README.md")
  title?: string; // Optional document title (extracted from frontmatter or filename)
  lastModified?: number; // Unix timestamp in milliseconds
}
```

**Example markdown slice:**

```typescript
{
  scope: 'repository',
  name: 'markdown',
  data: [
    {
      path: '/Users/griever/repos/my-project/README.md',
      title: 'Project README',
      lastModified: 1731582719000
    },
    {
      path: '/Users/griever/repos/my-project/docs/architecture.md',
      title: 'Architecture Overview',
      lastModified: 1731496319000
    }
  ],
  loading: false,
  error: null,
  refresh: async () => { /* refresh logic */ }
}
```

### 2. How does it discover documentation?

The panel **does NOT discover documentation itself**. It relies entirely on the host application to:

1. Scan the repository/file tree for markdown files
2. Extract metadata (title, lastModified)
3. Provide them via the `markdown` slice

**What the panel does:**

- Displays whatever markdown files are in the `markdown` slice
- Sorts/filters them (currently just displays in order)
- Opens them when clicked using `actions.openFile()`

**What the host needs to do:**

- Scan for `.md` and `.MD` files (recursively)
- Extract title from frontmatter, first heading, or filename
- Get lastModified timestamp
- Populate the `markdown` slice

### 3. What events should we emit?

**Events the panel listens for:** None currently (Milestone 1 is read-only)

**Events the panel emits:** None currently

**Future (Milestone 2):** May emit events for:

- Document selection
- Search/filter changes
- View mode changes

### 4. Configuration needed?

**No configuration required.** The panel works entirely from:

- The `markdown` slice data
- The `actions.openFile()` callback

**Optional configuration (future):**

- Sort preferences
- Filter settings
- Display options

### 5. Expected workflow?

**Initialization workflow:**

```typescript
// 1. When repository/workspace loads
const repositoryPath = '/path/to/repo';

// 2. Scan for markdown files (you can use your existing fileTree slice!)
const markdownFiles = scanFileTreeForMarkdown(fileTreeSlice.data);

// 3. Extract metadata
const markdownData: MarkdownFile[] = markdownFiles.map((file) => ({
  path: file.path,
  title: extractTitle(file), // from frontmatter or first heading
  lastModified: file.lastModified,
}));

// 4. Create markdown slice
const markdownSlice: DataSlice<MarkdownFile[]> = {
  scope: 'repository',
  name: 'markdown',
  data: markdownData,
  loading: false,
  error: null,
  refresh: async () => {
    // Re-scan file tree
    const updated = await scanFileTreeForMarkdown(fileTreeSlice.data);
    // Update slice
  },
};

// 5. Add to context slices
slices.set('markdown', markdownSlice);
```

---

## Implementation Guide for web-ade

### Option 1: Derive from fileTree Slice (Recommended)

Since you already have a `fileTree` slice, you can derive the `markdown` slice from it:

```typescript
// In your PanelContext provider
function createMarkdownSlice(
  fileTreeSlice: DataSlice<FileNode[]>
): DataSlice<MarkdownFile[]> {
  if (!fileTreeSlice.data) {
    return {
      scope: 'repository',
      name: 'markdown',
      data: [],
      loading: fileTreeSlice.loading,
      error: fileTreeSlice.error,
      refresh: fileTreeSlice.refresh,
    };
  }

  // Recursively find all markdown files
  const findMarkdownFiles = (nodes: FileNode[]): MarkdownFile[] => {
    const results: MarkdownFile[] = [];

    for (const node of nodes) {
      if (node.type === 'file' && /\\.md$/i.test(node.path)) {
        results.push({
          path: node.path,
          title: extractTitleFromPath(node.path), // or fetch content to extract
          lastModified: node.lastModified,
        });
      }
      if (node.children) {
        results.push(...findMarkdownFiles(node.children));
      }
    }

    return results;
  };

  return {
    scope: 'repository',
    name: 'markdown',
    data: findMarkdownFiles(fileTreeSlice.data),
    loading: fileTreeSlice.loading,
    error: fileTreeSlice.error,
    refresh: fileTreeSlice.refresh,
  };
}

// Add to your context
const markdownSlice = createMarkdownSlice(fileTreeSlice);
slices.set('markdown', markdownSlice);
```

### Option 2: Use GitHub API (For Remote Repos)

For GitHub-backed repositories, use your existing API proxy:

```typescript
async function fetchMarkdownFilesFromGitHub(
  owner: string,
  repo: string
): Promise<MarkdownFile[]> {
  // 1. Get file tree
  const treeResponse = await fetch(
    `/api/github/repo/${owner}/${repo}?action=tree&recursive=true`
  );
  const tree = await treeResponse.json();

  // 2. Filter markdown files
  const markdownPaths = tree.tree
    .filter((item: any) => item.type === 'blob' && /\\.md$/i.test(item.path))
    .map((item: any) => item.path);

  // 3. Fetch metadata for each (optional: could fetch content to extract title)
  const markdownFiles: MarkdownFile[] = markdownPaths.map((path: string) => ({
    path: `/${path}`,
    title: extractTitleFromPath(path),
    lastModified: Date.now(), // GitHub API doesn't provide this in tree
  }));

  return markdownFiles;
}
```

### Helper: Extract Title from Path

```typescript
function extractTitleFromPath(path: string): string {
  const filename = path.split('/').pop() || path;

  // Remove .md extension
  const nameWithoutExt = filename.replace(/\\.md$/i, '');

  // Convert kebab-case and snake_case to Title Case
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\\b\\w/g, (char) => char.toUpperCase());
}

// Examples:
// 'README.md' -> 'README'
// 'getting-started.md' -> 'Getting Started'
// 'api_reference.md' -> 'Api Reference'
```

### Helper: Extract Title from Content (Advanced)

```typescript
async function extractTitleFromMarkdown(
  content: string
): Promise<string | undefined> {
  // Check for frontmatter title
  const frontmatterMatch = content.match(/^---\\s*\\ntitle:\\s*(.+)\\n/);
  if (frontmatterMatch) {
    return frontmatterMatch[1].trim();
  }

  // Check for first heading
  const headingMatch = content.match(/^#\\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  return undefined;
}
```

---

## Complete Example for web-ade

Here's a complete example of how to add the markdown slice to your PanelContext:

```typescript
// In src/contexts/PanelContext.tsx

import { useEffect, useMemo } from 'react';

export function PanelContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fileTreeSlice = useFileTreeSlice(); // your existing slice
  const gitSlice = useGitSlice(); // your existing slice
  const activeFileSlice = useActiveFileSlice(); // your existing slice

  // NEW: Create markdown slice from fileTree
  const markdownSlice = useMemo(() => {
    if (!fileTreeSlice.data) {
      return {
        scope: 'repository' as const,
        name: 'markdown',
        data: [],
        loading: fileTreeSlice.loading,
        error: fileTreeSlice.error,
        refresh: fileTreeSlice.refresh,
      };
    }

    const markdownFiles = extractMarkdownFiles(fileTreeSlice.data);

    return {
      scope: 'repository' as const,
      name: 'markdown',
      data: markdownFiles,
      loading: fileTreeSlice.loading,
      error: fileTreeSlice.error,
      refresh: fileTreeSlice.refresh,
    };
  }, [fileTreeSlice]);

  const slices = useMemo(() => {
    const map = new Map();
    map.set('git', gitSlice);
    map.set('active-file', activeFileSlice);
    map.set('fileTree', fileTreeSlice);
    map.set('markdown', markdownSlice); // ADD THIS
    return map;
  }, [gitSlice, activeFileSlice, fileTreeSlice, markdownSlice]);

  // ... rest of your context setup
}

function extractMarkdownFiles(fileTree: FileNode[]): MarkdownFile[] {
  const results: MarkdownFile[] = [];

  function traverse(nodes: FileNode[]) {
    for (const node of nodes) {
      if (node.type === 'file' && /\\.md$/i.test(node.name)) {
        results.push({
          path: node.path,
          title: node.name.replace(/\\.md$/i, ''),
          lastModified: node.lastModified,
        });
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(fileTree);
  return results;
}
```

---

## Testing the Integration

### 1. Verify the slice is available

In your browser console:

```javascript
// Check if markdown slice exists
window.__PANEL_CONTEXT__.slices.has('markdown');
// Should return: true

// Check markdown data
window.__PANEL_CONTEXT__.getSlice('markdown').data;
// Should return: array of MarkdownFile objects
```

### 2. Expected behavior

Once the `markdown` slice is populated:

- Panel header should show document count (e.g., "5 documents")
- List of documents should appear
- Clicking a document should call `actions.openFile(path)`
- If no markdown files exist, should show "No documents found"

### 3. Common issues

**Panel shows "0 documents":**

- Check if `markdownSlice.data` is an empty array
- Verify file tree is being scanned correctly
- Check if markdown files exist in the repository

**Panel shows loading forever:**

- Check if `markdownSlice.loading` is stuck at `true`
- Verify file tree slice is finishing its load

**Panel crashes:**

- Check browser console for errors
- Verify `markdownSlice.data` is an array (not null/undefined)
- Check that each item has a `path` property

---

## Summary Checklist

- [ ] Create a `markdown` data slice
- [ ] Populate it with array of `MarkdownFile` objects
- [ ] Each file must have `path: string` property
- [ ] Optional: `title?: string` and `lastModified?: number`
- [ ] Add slice to context slices map
- [ ] Verify `context.getSlice('markdown')` returns the slice
- [ ] Ensure `actions.openFile` is provided and functional

Once these are in place, the alexandria-docs-panel will display your documentation!
