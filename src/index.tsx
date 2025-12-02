import { AlexandriaDocsPanel } from './panels/AlexandriaDocsPanel';
import type { PanelDefinition, PanelContextValue } from './types';
import { alexandriaDocsPanelTools } from './tools';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'principal-ade.alexandria-docs',
      name: 'Alexandria Docs',
      icon: '📚',
      version: '0.1.1',
      author: 'Principal AI',
      description: 'View and manage repository documentation with Alexandria',
      surfaces: ['manager', 'agent'],
      slices: ['markdown'],
      // UTCP-compatible tools this panel exposes
      tools: alexandriaDocsPanelTools,
    },
    component: AlexandriaDocsPanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        '[Alexandria] Panel mounted:',
        context.currentScope.type,
        context.currentScope.repository?.path ||
          context.currentScope.workspace?.path
      );
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('[Alexandria] Panel unmounted');
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 * Use this for package-level initialization.
 */
export const onPackageLoad = async () => {
  // eslint-disable-next-line no-console
  console.log('[Alexandria] Panel package loaded');
};

/**
 * Optional: Called once when the package is unloaded.
 * Use this for package-level cleanup.
 */
export const onPackageUnload = async () => {
  // eslint-disable-next-line no-console
  console.log('[Alexandria] Panel package unloading');
};

/**
 * Export tools for server-safe imports.
 * Use '@industry-theme/alexandria-docs-panel/tools' to import without React dependencies.
 */
export {
  alexandriaDocsPanelTools,
  alexandriaDocsPanelToolsMetadata,
  openDocumentTool,
  refreshDocumentsTool,
  showAssociatedFilesTool,
} from './tools';
