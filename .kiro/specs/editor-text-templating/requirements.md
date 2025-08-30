# Requirements Document

## Introduction

The Editor Text Templating feature integrates dialogue and quest text templating directly into the InteractionEditor and EncounterEditor as contextual features. This eliminates the need for users to navigate to a separate template library for text content, making text templating feel like a native editor feature rather than a separate system. The feature leverages the existing TextTemplateEngine with {{placeholder}} syntax, conditionals, and random selection while providing context-aware suggestions and real-time preview capabilities.

## Requirements

### Requirement 1

**User Story:** As a world builder, I want to add dynamic text with placeholders directly in the InteractionEditor, so that I can create personalized dialogue without leaving the editing context.

#### Acceptance Criteria

1. WHEN editing interaction branch text THEN the system SHALL provide a text templating panel within the editor
2. WHEN typing in branch text fields THEN the system SHALL offer placeholder suggestions based on current context (character, node, world)
3. WHEN a placeholder is inserted THEN the system SHALL use the existing {{placeholder}} syntax from TextTemplateEngine
4. WHEN context data is available THEN the system SHALL show real-time preview of resolved text
5. WHEN no context data exists THEN the system SHALL show placeholder syntax in preview
6. WHEN editing text THEN the system SHALL support all existing TextTemplateEngine features (conditionals {{#if}}, random selection {{random:}})
7. WHEN placeholder suggestions are shown THEN the system SHALL categorize them by type (character, node, world attributes)

### Requirement 2

**User Story:** As a world builder, I want quick access to common dialogue patterns, so that I can rapidly create natural-sounding conversations without typing repetitive text.

#### Acceptance Criteria

1. WHEN editing interaction text THEN the system SHALL provide quick-insert options for common dialogue patterns
2. WHEN selecting greeting patterns THEN the system SHALL offer templates like "{{random:Greetings,Hello,Well met}}, {{character.name}}!"
3. WHEN selecting farewell patterns THEN the system SHALL offer templates like "Safe travels, {{character.name}}."
4. WHEN selecting question patterns THEN the system SHALL offer templates like "What brings you to {{node.name}}, {{character.name}}?"
5. WHEN inserting dialogue patterns THEN the system SHALL place them at cursor position in the text field
6. WHEN patterns are inserted THEN the system SHALL immediately show resolved preview if context is available
7. WHEN dialogue patterns are used THEN the system SHALL maintain existing text and allow further editing

### Requirement 3

**User Story:** As a world builder, I want text templating in the EncounterEditor for descriptions and encounter text, so that I can create dynamic encounters that adapt to the current context.

#### Acceptance Criteria

1. WHEN editing encounter descriptions THEN the system SHALL provide text templating capabilities
2. WHEN creating quest objectives THEN the system SHALL support placeholder text for dynamic quest content
3. WHEN writing completion messages THEN the system SHALL allow templated text that reflects quest outcomes
4. WHEN encounter context includes characters THEN the system SHALL suggest character-related placeholders
5. WHEN encounter context includes locations THEN the system SHALL suggest node-related placeholders
6. WHEN quest text is templated THEN the system SHALL show preview of resolved text when possible
7. WHEN encounter templates are used THEN the system SHALL integrate with existing quest system data structures

### Requirement 4

**User Story:** As a world builder, I want context-aware placeholder suggestions, so that I only see relevant options for my current editing situation.

#### Acceptance Criteria

1. WHEN editing in InteractionEditor with character context THEN the system SHALL suggest character attributes, relationships, and reputation placeholders
2. WHEN editing in EncounterEditor with node context THEN the system SHALL suggest node type, population, and resource placeholders
3. WHEN world data is available THEN the system SHALL suggest world-level placeholders like world name and global properties
4. WHEN no specific context exists THEN the system SHALL show generic placeholders that work in any situation
5. WHEN context changes during editing THEN the system SHALL update placeholder suggestions dynamically
6. WHEN suggestions are displayed THEN the system SHALL show placeholder syntax and brief description
7. WHEN placeholders are context-inappropriate THEN the system SHALL exclude them from suggestions

### Requirement 5

**User Story:** As a world builder, I want real-time preview of templated text, so that I can see how my text will appear with actual data before saving.

#### Acceptance Criteria

1. WHEN templated text contains placeholders THEN the system SHALL show resolved preview alongside the editor
2. WHEN character data is available THEN the system SHALL resolve character placeholders in preview
3. WHEN node data is available THEN the system SHALL resolve node placeholders in preview
4. WHEN world data is available THEN the system SHALL resolve world placeholders in preview
5. WHEN required data is missing THEN the system SHALL show placeholder syntax in preview with indication of missing data
6. WHEN text is edited THEN the system SHALL update preview in real-time
7. WHEN preview is displayed THEN the system SHALL clearly distinguish between editor and preview content

### Requirement 6

**User Story:** As a world builder, I want the text templating to integrate seamlessly with existing D&D attributes and game systems, so that my templated text reflects the rich character and world data.

#### Acceptance Criteria

1. WHEN character context includes D&D attributes THEN the system SHALL suggest placeholders for strength, dexterity, constitution, intelligence, wisdom, charisma
2. WHEN character has consciousness data THEN the system SHALL suggest frequency and coherence placeholders
3. WHEN character has personality traits THEN the system SHALL suggest aggression, curiosity, empathy placeholders
4. WHEN character has relationships THEN the system SHALL suggest relationship status and strength placeholders
5. WHEN node has environmental properties THEN the system SHALL suggest crowded, noisy, prosperous placeholders
6. WHEN node has cultural context THEN the system SHALL suggest language, customs, law placeholders
7. WHEN placeholders reference game systems THEN the system SHALL use existing data structures without modification

### Requirement 7

**User Story:** As a world builder, I want text templating to feel like a native editor feature, so that I can focus on content creation without learning a separate templating system.

#### Acceptance Criteria

1. WHEN using text templating THEN the system SHALL present it as an integrated part of the editor, not a separate tool
2. WHEN templating features are available THEN the system SHALL use progressive disclosure (simple by default, advanced when wanted)
3. WHEN editing normal text THEN the system SHALL not interfere with standard text editing workflows
4. WHEN advanced features are needed THEN the system SHALL make them discoverable but not prominent
5. WHEN templating is used THEN the system SHALL maintain familiar text editing behaviors (undo, copy/paste, etc.)
6. WHEN switching between editors THEN the system SHALL provide consistent templating experience
7. WHEN templating features are unused THEN the system SHALL not clutter the interface

### Requirement 8

**User Story:** As a world builder, I want the existing template library to focus on structural templates, so that I have clear separation between data templates and text templating features.

#### Acceptance Criteria

1. WHEN accessing the template library THEN the system SHALL focus on structural templates (character stats, node properties)
2. WHEN template library shows character templates THEN the system SHALL emphasize attribute configurations, not text content
3. WHEN template library shows node templates THEN the system SHALL emphasize environmental and cultural properties, not descriptions
4. WHEN text templating is needed THEN the system SHALL direct users to editor-based text features, not template library
5. WHEN template library is simplified THEN the system SHALL remove confusing demo templates like "Heroic Warrior"
6. WHEN navigation is updated THEN the system SHALL reflect the clearer separation between structural and text templating
7. WHEN users access templates THEN the system SHALL provide clear guidance on when to use library vs editor features

### Requirement 9

**User Story:** As a world builder, I want to extract and reuse the PlaceholderEditor component, so that text templating works consistently across different editors.

#### Acceptance Criteria

1. WHEN PlaceholderEditor is extracted THEN the system SHALL make it reusable across InteractionEditor and EncounterEditor
2. WHEN PlaceholderEditor is used THEN the system SHALL automatically detect context (character, node, world) without manual selection
3. WHEN PlaceholderEditor receives context THEN the system SHALL provide appropriate placeholder suggestions
4. WHEN PlaceholderEditor shows preview THEN the system SHALL use actual context data when available
5. WHEN PlaceholderEditor is integrated THEN the system SHALL maintain existing TextTemplateEngine functionality
6. WHEN PlaceholderEditor is reused THEN the system SHALL provide consistent interface across all editors
7. WHEN PlaceholderEditor handles different contexts THEN the system SHALL adapt suggestions and preview accordingly

### Requirement 10

**User Story:** As a world builder, I want the text templating system to preserve all existing TextTemplateEngine capabilities, so that I don't lose any functionality while gaining better usability.

#### Acceptance Criteria

1. WHEN text templating is integrated THEN the system SHALL preserve all existing {{placeholder}} syntax
2. WHEN conditional logic is used THEN the system SHALL support existing {{#if}} and {{/if}} syntax
3. WHEN random selection is used THEN the system SHALL support existing {{random:option1,option2}} syntax
4. WHEN complex templates are created THEN the system SHALL handle nested conditionals and multiple placeholders
5. WHEN TextTemplateEngine processes text THEN the system SHALL maintain existing resolution logic without modification
6. WHEN advanced templating features are used THEN the system SHALL provide appropriate editor support
7. WHEN existing template syntax is encountered THEN the system SHALL parse and preview correctly