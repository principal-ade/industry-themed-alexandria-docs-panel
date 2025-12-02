# Proposal: FileTree-based Adapters for Browser Environments

## Problem

Panels and browser-based applications want to use `MemoryPalace` but don't have direct filesystem access. They typically have:

1. A `FileTree` object (from `@principal-ai/repository-abstraction`) containing file metadata
2. A simple `readFile(path: string) => Promise<string>` function provided by the host

Currently, using `MemoryPalace` requires implementing full `FileSystemAdapter` and `GlobAdapter` interfaces, which is complex for browser environments.

## Proposed Solution

Add two new adapters to `@principal-ai/alexandria-core-library` that work with `FileTree` data:

### 1. `FileTreeFileSystemAdapter`

An adapter that implements `FileSystemAdapter` using:
- `FileTree` data for metadata operations (exists, isDirectory, readDir, etc.)
- A host-provided `readFile` function for file contents

```typescript
import type { FileTree } from '@principal-ai/repository-abstraction';
import type { FileSystemAdapter } from '@principal-ai/alexandria-core-library';

export interface FileTreeFileSystemAdapterOptions {
  fileTree: FileTree;
  repositoryPath: string;
  readFile: (path: string) => Promise<string>;
  // Optional: for write operations if needed
  writeFile?: (path: string, content: string) => Promise<void>;
}

export class FileTreeFileSystemAdapter implements FileSystemAdapter {
  constructor(options: FileTreeFileSystemAdapterOptions);

  // Implemented using fileTree.allFiles / fileTree.allDirectories
  exists(path: string): boolean;
  isDirectory(path: string): boolean;
  readDir(path: string): string[];

  // Implemented using host's readFile
  readFile(path: string): Promise<string>;

  // Path utilities (pure functions)
  join(...paths: string[]): string;
  relative(from: string, to: string): string;
  dirname(path: string): string;
  isAbsolute(path: string): boolean;

  // Uses repositoryPath to find .git directory in fileTree
  findProjectRoot(path: string): string;
}
```

### 2. `FileTreeGlobAdapter`

An adapter that implements `GlobAdapter` by pattern-matching against `FileTree.allFiles`:

```typescript
import type { FileTree } from '@principal-ai/repository-abstraction';
import type { GlobAdapter, GlobOptions } from '@principal-ai/alexandria-core-library';

export class FileTreeGlobAdapter implements GlobAdapter {
  constructor(fileTree: FileTree, repositoryPath: string);

  // Pattern matches against fileTree.allFiles paths
  findFiles(patterns: string[], options?: GlobOptions): Promise<string[]>;
}
```

## Usage Example

```typescript
import { MemoryPalace } from '@principal-ai/alexandria-core-library';
import { FileTreeFileSystemAdapter, FileTreeGlobAdapter } from '@principal-ai/alexandria-core-library';
import type { FileTree } from '@principal-ai/repository-abstraction';

// In a panel/browser context
function useAlexandriaData(fileTree: FileTree, repositoryPath: string, readFile: (path: string) => Promise<string>) {
  const fsAdapter = new FileTreeFileSystemAdapter({
    fileTree,
    repositoryPath,
    readFile,
  });

  const globAdapter = new FileTreeGlobAdapter(fileTree, repositoryPath);

  const palace = new MemoryPalace(repositoryPath, fsAdapter);
  const docs = await palace.getDocumentsOverview(globAdapter);

  return docs;
}
```

## Benefits

1. **Single source of truth**: Core library owns adapter implementations, ensuring compatibility with `MemoryPalace`
2. **Minimal host requirements**: Hosts only need to provide `FileTree` (already common) and `readFile` function
3. **Browser-safe**: No Node.js dependencies, works in any JS environment
4. **Testable**: Can use `InMemoryFileSystemAdapter` patterns for testing

## Export Location

These should be exported from the main entry point since they're browser-safe:

```typescript
// @principal-ai/alexandria-core-library
export { FileTreeFileSystemAdapter, FileTreeGlobAdapter } from './adapters/filetree';
```

## Panel Framework Integration

The panel framework can then simplify adapter requirements:

```typescript
// In panel-framework-core
export interface PanelAdapters {
  // Minimal requirement - just need readFile
  readFile?: (path: string) => Promise<string>;

  // Optional: full adapters for advanced use cases
  fileSystem?: FileSystemAdapter;
  glob?: GlobAdapter;
}
```

Panels can then create `FileTreeFileSystemAdapter` internally using the `fileTree` slice + `readFile` adapter.

## Questions for Core Library Team

1. Should `FileTreeFileSystemAdapter.exists()` be sync (using fileTree) or async (for consistency)?
2. Should write operations (`writeFile`, `deleteFile`, `createDir`) be supported or throw "not supported"?
3. Any concerns about glob pattern matching implementation in `FileTreeGlobAdapter`?
