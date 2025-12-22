import React, { memo, useCallback } from 'react';
import type { PanelEventEmitter } from '../../types';
import type { AlexandriaDocItemData } from './types';
import { AlexandriaDocItem } from './AlexandriaDocItem';

interface DocumentListProps {
  documents: AlexandriaDocItemData[];
  onDocumentClick: (path: string) => void;
  onFileSelect: (filePath: string) => void;
  repositoryPath: string;
  events?: PanelEventEmitter;
  /** Currently selected/active file path */
  selectedFile?: string;
}

// Individual item wrapper to memoize the onSelect callback per document
const DocumentItem = memo(
  ({
    doc,
    onDocumentClick,
    onFileSelect,
    repositoryPath,
    events,
    isSelected,
  }: {
    doc: AlexandriaDocItemData;
    onDocumentClick: (path: string) => void;
    onFileSelect: (filePath: string) => void;
    repositoryPath: string;
    events?: PanelEventEmitter;
    isSelected: boolean;
  }) => {
    const handleSelect = useCallback(() => {
      onDocumentClick(doc.relativePath);
    }, [onDocumentClick, doc.relativePath]);

    return (
      <AlexandriaDocItem
        doc={doc}
        onSelect={handleSelect}
        onFileSelect={onFileSelect}
        repositoryRoot={repositoryPath}
        events={events}
        isSelected={isSelected}
      />
    );
  }
);

DocumentItem.displayName = 'DocumentItem';

export const DocumentList: React.FC<DocumentListProps> = memo(
  ({ documents, onDocumentClick, onFileSelect, repositoryPath, events, selectedFile }) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {documents.map((doc) => (
          <DocumentItem
            key={doc.relativePath}
            doc={doc}
            onDocumentClick={onDocumentClick}
            onFileSelect={onFileSelect}
            repositoryPath={repositoryPath}
            events={events}
            isSelected={selectedFile === doc.relativePath}
          />
        ))}
      </div>
    );
  }
);

DocumentList.displayName = 'DocumentList';
