/**
 * UI Components Index - Central export for all reusable UI components
 * 
 * This file provides a single import point for all UI components,
 * making it easy to import and use components throughout the application.
 */

// Layout Components
export { default as PageLayout, GridContainer, FlexContainer, Section, Card as LayoutCard } from './PageLayout';

// Button Components
export { default as Button, ButtonGroup, IconButton } from './Button';

// Card Components
export { 
  default as Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  FeatureCard,
  StatsCard,
  InteractiveCard,
  CardGrid
} from './Card';

// Loading Components
export { 
  default as LoadingSpinner,
  ProgressBar,
  CircularProgress,
  SkeletonLoader,
  CardSkeleton,
  LoadingOverlay,
  InlineLoading,
  LoadingButton,
  DotsLoading
} from './LoadingComponents';

// Modal Components
export { 
  default as Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmDialog,
  AlertDialog,
  FormDialog,
  Drawer
} from './Modal';

// Re-export existing components for consistency
export { default as AppRouter } from './AppRouter';
export { default as CharacterEditor } from './CharacterEditor';
export { default as InteractionEditor } from './InteractionEditor';
export { default as NodeEditor } from './NodeEditor';
export { default as TemplateSelector } from './TemplateSelector';
export { default as TemplateCustomizationForm } from './TemplateCustomizationForm';