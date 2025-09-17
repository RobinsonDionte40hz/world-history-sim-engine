/**
 * Hooks Index - Central export for all custom React hooks
 * 
 * This file provides a single import point for all custom hooks,
 * making it easy to import and use hooks throughout the application.
 */

// Navigation Hooks
export { default as useEditorNavigation } from './useEditorNavigation';
export { default as useNavigationGuard } from './useNavigationGuard';
export { default as useUnsavedChanges } from './useUnsavedChanges';

// UI Hooks
export { default as useSidebar } from './useSidebar';

// Simulation Hooks
export { default as useSimulation } from './useSimulation';
export { default as useWorldBuilder } from './useWorldBuilder';

// Text Templating Hooks
export { default as useTextTemplating } from './useTextTemplating';
export { default as useTemplates } from './useTemplates';
export { default as useTemplatePerformance } from './useTemplatePerformance';
export { default as useDebouncedTemplating } from './useDebouncedTemplating';
export { default as useCachedSuggestions } from './useCachedSuggestions';

// Existing Text Templating Hooks (for compatibility)
export { default as useContextualSuggestions } from './useContextualSuggestions';
export { default as useTemplatePreview } from './useTemplatePreview';