import { AlexandriaDocsPanel } from './panels/AlexandriaDocsPanel';
import type { PanelDefinition, PanelContextValue } from './types';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    id: 'principal-ade.alexandria-docs',
    name: 'Alexandria Docs',
    icon: '📚',
    version: '0.1.0',
    author: 'Principal AI',
    description: 'View and manage repository documentation with Alexandria',
    component: AlexandriaDocsPanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('[Alexandria] Panel mounted for repo:', context.repositoryPath);
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('[Alexandria] Panel unmounted');
    },

    // Optional: Called when data slices change
    onDataChange: (slice, data) => {
      if (slice === 'markdown') {
        // eslint-disable-next-line no-console
        console.log('[Alexandria] Markdown data updated:', data);
      }
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
