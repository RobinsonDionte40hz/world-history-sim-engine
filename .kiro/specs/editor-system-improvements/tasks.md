# Implementation Plan

## Important: Review Steering Documentation First
Before implementing any tasks, **always review the steering documentation** in `.kiro/steering/` to ensure alignment with:
- World History Simulation Engine architecture and principles
- Clean architecture patterns and domain-driven design
- Existing system integration requirements (D&D attributes, quest system, consciousness framework)
- Template system and mappless design principles
- Turn-based simulation compatibility

## Tasks

- [ ] 1. Fix multiple navigation systems and layout alignment (PRIORITY)
  - Remove top navigation from all editor pages (NodeEditorPage, InteractionEditorPage, etc.)
  - Remove editor-specific navigation bars that appear above editor content
  - Fix "Editors" button to navigate to "/builder" (World Foundation) instead of non-functional page
  - Ensure global sidebar is accessible from all editor pages
  - Fix left-aligned editor layouts to be full-width and center-aligned
  - Remove redundant breadcrumb navigation outside of sidebar
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 2.1, 2.6, 9.1, 9.2, 9.3, 9.4_

- [x] 2. Create core infrastructure components







  - Create EditorStateManager for centralized state management across all editors
  - Implement WorldPersistenceService with enhanced save/load functionality for worlds and nodes
  - Build NavigationGuard hook to prevent navigation with unsaved changes
  - Create EditorLayout wrapper component for consistent editor structure
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 8.1, 8.2, 8.3, 8.4_

- [x] 3. Implement unified navigation system within the global sidebar




  - Create EditorNavigation component with consistent navigation between editors
  - Build WorldSelector component for choosing existing worlds or creating new ones
  - Implement breadcrumb if not already implemented, navigation system showing current editor location
  - Create useEditorNavigation and useUnsavedChanges custom hooks
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4. Fix editor layout alignment and button consistency
  - Remove left-aligned sidebar-like constraints from editor pages
  - Implement full-width, center-aligned layouts for all editors
  - Fix editor content to use entire available width instead of appearing as left sidebar
  - Implement consistent button styling, spacing, and hover states across all editors
  - Create ButtonGroup component for standardized button layouts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 5. Implement node save functionality
  - Add save node functionality to NodeEditorPage that persists to world data
  - Integrate node saving with WorldPersistenceService
  - Add save confirmation feedback and error handling for node operations
  - Implement unsaved changes warning when leaving node editor
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Create world and node selection interfaces
  - Add world selection dropdown/modal to World Foundation Editor
  - Implement existing world loading functionality with data population
  - Create node selection interface in Node Editor for editing existing nodes
  - Add "Create New" options alongside selection interfaces
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Enforce world foundation save requirement
  - Add validation to prevent navigation from World Foundation Editor without saving
  - Display blocking messages in other editors when world foundation is incomplete
  - Enable other editors only after world foundation is saved
  - Implement world foundation completion status tracking
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Create encounter system and editor





  - Design Encounter entity model with integration to interaction system and turn-based simulation
  - Build EncounterEditorPage with full editing capabilities for turn-based encounters
  - Implement encounter templates and save/load functionality with turn-based timing
  - Integrate encounter system with existing interaction framework for turn-based resolution
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 9. Implement editor state management
  - Create centralized state management for editor navigation and data with turn-based simulation context
  - Implement auto-save functionality with recovery capabilities for turn-based world states
  - Add save status indicators and validation error display for simulation-ready content
  - Create state persistence across editor navigation with turn-based simulation compatibility
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Add comprehensive testing
  - Write unit tests for all new components and services
  - Create integration tests for editor navigation flow
  - Test save/load functionality with various data scenarios
  - Add user acceptance tests for complete world creation workflow
  - _Requirements: All requirements - validation and quality assurance_

- [x] 11. Update routing and app integration








  - Update AppRouter with new encounter editor route
  - Fix existing route configurations for proper editor access
  - Ensure all navigation paths lead to functional pages
  - Update main navigation components with correct editor links
  - _Requirements: 1.1, 1.2, 6.1, 6.2, 7.1_

- [ ] 12. Polish and optimization
  - Implement loading states and error boundaries for all editors
  - Add keyboard shortcuts for common actions (save, navigate)
  - Optimize performance for large world data handling
  - Add accessibility improvements and screen reader support
  - _Requirements: 2.4, 8.1, 8.2, 8.3, 8.4_

- [ ] 13. Verify navigation and layout fixes
  - Test that only global sidebar navigation is present on editor pages
  - Verify "Editors" button navigates to World Foundation (/builder)
  - Confirm editor content is full-width and center-aligned, not left-aligned like sidebar
  - Test sidebar accessibility from all editor pages
  - Validate removal of redundant navigation elements
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 2.1, 2.6, 9.1, 9.2, 9.3, 9.4_
- [ ] 13
. Ensure turn-based simulation compatibility
  - Validate all editor outputs are compatible with turn-based simulation engine
  - Implement turn-based timing and sequencing for all created content
  - Add turn-based validation to world, node, character, interaction, and encounter creation
  - Ensure all editor-created content integrates properly with existing turn-based simulation hooks
  - _Requirements: All requirements - turn-based simulation integration_