/**
 * Panel Tools
 *
 * UTCP-compatible tools for the Alexandria Docs panel extension.
 * These tools can be invoked by AI agents and emit events that panels listen for.
 *
 * IMPORTANT: This file should NOT import any React components to ensure
 * it can be imported server-side without pulling in React dependencies.
 * Use the './tools' subpath export for server-safe imports.
 */

import type { PanelTool, PanelToolsMetadata } from '@principal-ade/utcp-panel-event';

/**
 * Tool: Open Document
 */
export const openDocumentTool: PanelTool = {
  name: 'open_document',
  description: 'Opens a markdown document in the Alexandria docs panel',
  inputs: {
    type: 'object',
    properties: {
      documentPath: {
        type: 'string',
        description: 'Path to the markdown document to open',
      },
      scrollToSection: {
        type: 'string',
        description: 'Optional section heading to scroll to',
      },
    },
    required: ['documentPath'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
  tags: ['documentation', 'markdown', 'open'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'industry-theme.alexandria-docs-panel:open-document',
  },
};

/**
 * Tool: Refresh Documents
 */
export const refreshDocumentsTool: PanelTool = {
  name: 'refresh_documents',
  description: 'Refreshes the list of markdown documents in the panel',
  inputs: {
    type: 'object',
    properties: {
      force: {
        type: 'boolean',
        description: 'Force refresh even if data is fresh',
      },
    },
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      documentCount: { type: 'number' },
    },
  },
  tags: ['documentation', 'refresh'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'industry-theme.alexandria-docs-panel:refresh-documents',
  },
};

/**
 * Tool: Show Associated Files
 */
export const showAssociatedFilesTool: PanelTool = {
  name: 'show_associated_files',
  description: 'Expands a document to show its associated source files',
  inputs: {
    type: 'object',
    properties: {
      documentPath: {
        type: 'string',
        description: 'Path to the markdown document',
      },
    },
    required: ['documentPath'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      associatedFiles: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  },
  tags: ['documentation', 'files', 'expand'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'industry-theme.alexandria-docs-panel:show-associated-files',
  },
};

/**
 * All tools exported as an array.
 */
export const alexandriaDocsPanelTools: PanelTool[] = [
  openDocumentTool,
  refreshDocumentsTool,
  showAssociatedFilesTool,
];

/**
 * Panel tools metadata for registration with PanelToolRegistry.
 */
export const alexandriaDocsPanelToolsMetadata: PanelToolsMetadata = {
  id: 'industry-theme.alexandria-docs-panel',
  name: 'Alexandria Docs Panel',
  description: 'Tools provided by the Alexandria documentation panel extension',
  tools: alexandriaDocsPanelTools,
};
