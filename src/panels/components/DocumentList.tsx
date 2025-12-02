import React from 'react';
import type { PanelEventEmitter } from '../../types';
import type { AlexandriaDocItemData } from './types';
import { AlexandriaDocItem } from './AlexandriaDocItem';

interface DocumentListProps {
  documents: AlexandriaDocItemData[];
  onDocumentClick: (path: string) => void;
  onFileSelect: (filePath: string) => void;
  repositoryPath: string;
  events?: PanelEventEmitter;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentClick,
  onFileSelect,
  repositoryPath,
  events,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {documents.map((doc) => (
        <AlexandriaDocItem
          key={doc.path}
          doc={doc}
          onSelect={() => onDocumentClick(doc.path)}
          onFileSelect={onFileSelect}
          repositoryRoot={repositoryPath}
          events={events}
        />
      ))}
    </div>
  );
};
