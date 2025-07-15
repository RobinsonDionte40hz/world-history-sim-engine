# Requirements Document

## Introduction

The turn counter system in the World History Simulation Engine is not functioning properly - it remains at zero and never increments when the simulation runs. This critical issue prevents users from tracking simulation progress and breaks the core game loop functionality. The system needs to properly initialize, increment, persist, and display the turn counter across all simulation states.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see the turn counter increment when the simulation is running, so that I can track the progress of the simulation.

#### Acceptance Criteria

1. WHEN the simulation starts THEN the turn counter SHALL be initialized to 0 or the last saved value
2. WHEN each simulation tick occurs THEN the turn counter SHALL increment by 1
3. WHEN the simulation is running THEN the turn counter SHALL be visible in the UI and update in real-time
4. WHEN the simulation is stopped and restarted THEN the turn counter SHALL continue from the last value

### Requirement 2

**User Story:** As a user, I want the turn counter to persist across browser sessions, so that I don't lose simulation progress when I close and reopen the application.

#### Acceptance Criteria

1. WHEN the simulation state is saved THEN the turn counter value SHALL be included in the saved state
2. WHEN the application loads THEN the turn counter SHALL be restored from the saved state
3. WHEN no saved state exists THEN the turn counter SHALL initialize to 0
4. WHEN the turn counter updates THEN the new value SHALL be automatically saved to localStorage

### Requirement 3

**User Story:** As a developer, I want the turn counter to be properly synchronized between the service layer and UI components, so that the display is always accurate.

#### Acceptance Criteria

1. WHEN the SimulationService updates the world state THEN the turn counter SHALL be included in the state update
2. WHEN UI components receive state updates THEN the turn counter SHALL be immediately reflected in the display
3. WHEN multiple UI components display the turn counter THEN they SHALL all show the same synchronized value
4. WHEN the simulation tick callback is triggered THEN the updated turn counter SHALL be passed to all subscribed components

### Requirement 4

**User Story:** As a user, I want to see the turn counter displayed prominently in the simulation controls, so that I can easily monitor simulation progress.

#### Acceptance Criteria

1. WHEN viewing the simulation interface THEN the current turn number SHALL be clearly visible
2. WHEN the simulation is not running THEN the turn counter SHALL still display the current value
3. WHEN the turn counter reaches significant milestones THEN the display SHALL remain readable and functional
4. WHEN the simulation is reset THEN the turn counter SHALL reset to 0 and display the new value

### Requirement 5

**User Story:** As a developer, I want proper error handling for turn counter operations, so that simulation failures don't corrupt the turn state.

#### Acceptance Criteria

1. WHEN a simulation tick fails THEN the turn counter SHALL not increment for that failed tick
2. WHEN state loading fails THEN the turn counter SHALL default to 0 without crashing
3. WHEN state saving fails THEN the system SHALL log the error but continue running
4. WHEN invalid turn counter values are detected THEN the system SHALL reset to a valid state