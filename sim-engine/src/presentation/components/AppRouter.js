/**
 * AppRouter - Main routing component using React Router v6
 * 
 * Defines all application routes and handles client-side navigation.
 * Integrates with existing pages and new enhanced pages.
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from '../contexts/NavigationContext';

// Existing pages
import HistoryPage from '../pages/HistoryPage';
import WorldBuilderLandingPage from '../pages/WorldBuilderLandingPage';

// New pages (will be created)
import FeaturesPage from '../pages/FeaturesPage';
import DocumentationPage from '../pages/DocumentationPage';
import ExamplesPage from '../pages/ExamplesPage';

// Editor pages (will be created)
import NodeEditorPage from '../pages/NodeEditorPage';
import CharacterEditorPage from '../pages/CharacterEditorPage';
import InteractionEditorPage from '../pages/InteractionEditorPage';
import EncounterEditorPage from '../pages/EncounterEditorPage';
import WorldNodeEditorPage from '../pages/WorldNodeEditorPage';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
  </div>
);

const AppRouter = () => {
  return (
    <Router>
      <NavigationProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<WorldBuilderLandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/docs/*" element={<DocumentationPage />} />
            <Route path="/examples" element={<ExamplesPage />} />
            
            {/* Creation/Editor routes - Always accessible */}
            <Route path="/builder" element={<NodeEditorPage />} />
            <Route path="/editors/nodes" element={<NodeEditorPage />} />
            <Route path="/editors/characters" element={<CharacterEditorPage />} />
            <Route path="/editors/interactions" element={<InteractionEditorPage />} />
            <Route path="/editors/encounters" element={<EncounterEditorPage />} />
            <Route path="/world-editor" element={<WorldNodeEditorPage />} />
            
            {/* Simulation route - Optional, with prerequisites */}
            <Route path="/simulation" element={<HistoryPage />} />
            <Route path="/history" element={<HistoryPage />} />
            
            {/* Fallback route */}
            <Route path="*" element={<WorldBuilderLandingPage />} />
          </Routes>
        </Suspense>
      </NavigationProvider>
    </Router>
  );
};

export default AppRouter;