# Requirements Document

## Introduction

The Need Satisfaction Cascades feature introduces a realistic economic and social dynamics system where settlements must manage basic needs (food, water, shelter, goods, services) and face cascading consequences when these needs are unmet. This system creates emergent challenges and realistic population dynamics that drive historical events and character behaviors.

## Requirements

### Requirement 1

**User Story:** As a world builder, I want settlements to have realistic basic needs management, so that my simulated worlds exhibit authentic economic pressures and social dynamics.

#### Acceptance Criteria

1. WHEN a settlement is created THEN the system SHALL initialize basic needs tracking for food, water, shelter, goods, and services
2. WHEN a turn is processed THEN the system SHALL calculate satisfaction levels for all basic needs based on available resources and population
3. WHEN basic needs satisfaction is calculated THEN the system SHALL return values between 0.0 (completely unmet) and 1.0 (fully satisfied)
4. WHEN food satisfaction drops below 0.8 THEN the system SHALL apply a 0.7 multiplier to secondary needs (goods and services)
5. WHEN water satisfaction drops below 0.9 THEN the system SHALL apply a 0.6 multiplier to secondary needs
6. WHEN shelter satisfaction drops below 0.6 THEN the system SHALL apply a 0.8 multiplier to secondary needs

### Requirement 2

**User Story:** As a simulation user, I want to see cascading effects when basic needs are unmet, so that I can understand how shortages create multiplying problems in settlements.

#### Acceptance Criteria

1. WHEN multiple basic needs are unmet THEN the system SHALL compound multiplier effects (multiply individual multipliers together)
2. WHEN cascading effects are calculated THEN the system SHALL apply multipliers to secondary needs before calculating overall satisfaction
3. WHEN overall satisfaction is calculated THEN the system SHALL average all five need satisfaction levels after applying cascading effects
4. WHEN need satisfaction levels change THEN the system SHALL generate appropriate consequences for the settlement
5. WHEN consequences are generated THEN the system SHALL include specific effects based on which needs are unmet

### Requirement 3

**User Story:** As a world simulator, I want need satisfaction to affect character behavior and settlement development, so that economic pressures drive meaningful historical events.

#### Acceptance Criteria

1. WHEN food satisfaction is below 0.5 THEN the system SHALL generate hunger-related consequences (population decline, migration, unrest)
2. WHEN water satisfaction is below 0.7 THEN the system SHALL generate water crisis consequences (disease, conflict over resources)
3. WHEN shelter satisfaction is below 0.4 THEN the system SHALL generate housing crisis consequences (homelessness, social instability)
4. WHEN goods satisfaction is below 0.6 THEN the system SHALL generate economic consequences (trade disruption, craft decline)
5. WHEN services satisfaction is below 0.5 THEN the system SHALL generate social consequences (education decline, healthcare issues)

### Requirement 4

**User Story:** As a settlement manager, I want to understand what resources and infrastructure affect each need type, so that I can make informed decisions about settlement development.

#### Acceptance Criteria

1. WHEN calculating food satisfaction THEN the system SHALL consider farms, hunting grounds, trade routes, and food storage capacity
2. WHEN calculating water satisfaction THEN the system SHALL consider wells, rivers, aqueducts, and water storage infrastructure
3. WHEN calculating shelter satisfaction THEN the system SHALL consider housing units, construction materials, and population density
4. WHEN calculating goods satisfaction THEN the system SHALL consider workshops, markets, trade connections, and resource availability
5. WHEN calculating services satisfaction THEN the system SHALL consider temples, schools, healers, and administrative buildings

### Requirement 5

**User Story:** As a history generator, I want need satisfaction data to influence historical event creation, so that economic and social pressures create authentic historical narratives.

#### Acceptance Criteria

1. WHEN overall satisfaction drops below 0.4 THEN the system SHALL mark the settlement as "in crisis" for historical event generation
2. WHEN satisfaction levels change significantly (>0.2 change) THEN the system SHALL generate historical events describing the change
3. WHEN consequences are applied THEN the system SHALL create historical records of famines, migrations, revolts, or prosperity
4. WHEN multiple settlements have low satisfaction THEN the system SHALL consider regional effects like trade wars or mass migrations
5. WHEN satisfaction improves significantly THEN the system SHALL generate positive historical events like golden ages or population booms

### Requirement 6

**User Story:** As a character in the simulation, I want my behavior and decisions to be influenced by my settlement's need satisfaction levels, so that my actions reflect realistic responses to economic conditions.

#### Acceptance Criteria

1. WHEN a character's home settlement has low food satisfaction THEN the character SHALL prioritize food-related interactions and quests
2. WHEN need satisfaction affects character mood THEN the system SHALL modify personality traits temporarily (increased aggression during shortages)
3. WHEN satisfaction is very low THEN characters SHALL consider migration to other settlements with better conditions
4. WHEN characters have relevant skills THEN they SHALL be more likely to engage in need-fulfilling activities (farmers during food shortages)
5. WHEN satisfaction improves THEN characters SHALL exhibit more positive social behaviors and long-term planning

### Requirement 7

**User Story:** As a template creator, I want to define settlement templates with different need satisfaction profiles, so that I can quickly create settlements with specific economic characteristics.

#### Acceptance Criteria

1. WHEN creating a settlement template THEN the system SHALL allow specification of base resource levels for each need type
2. WHEN instantiating from template THEN the system SHALL apply the template's need satisfaction modifiers
3. WHEN templates include infrastructure THEN the system SHALL automatically calculate appropriate satisfaction levels
4. WHEN saving a settlement as template THEN the system SHALL preserve current need satisfaction configuration
5. WHEN templates are shared THEN they SHALL include all need satisfaction data for accurate reproduction

### Requirement 8

**User Story:** As a character in the simulation, I want to make economic investments that generate passive income and affect settlement development, so that I can build wealth and influence the world through economic activities.

#### Acceptance Criteria

1. WHEN a character has sufficient wealth THEN the system SHALL allow investment in land expansion (farms, property, infrastructure)
2. WHEN a character invests in businesses THEN the system SHALL generate passive income based on settlement need satisfaction and market conditions
3. WHEN a character owns infrastructure THEN the system SHALL provide benefits to settlement need satisfaction calculations
4. WHEN character investments are successful THEN the system SHALL increase character wealth and influence over time
5. WHEN character investments fail THEN the system SHALL create economic consequences and historical events
6. WHEN characters make investments THEN the system SHALL track economic goals and investment portfolio performance

### Requirement 9

**User Story:** As a world builder, I want an editor interface for managing character economic activities, so that I can create rich economic narratives and character development opportunities.

#### Acceptance Criteria

1. WHEN managing a character THEN the system SHALL provide an investment management interface showing available opportunities
2. WHEN viewing investment opportunities THEN the system SHALL display cost, expected returns, and risk factors
3. WHEN characters make investments THEN the system SHALL show passive income streams and their performance over time
4. WHEN setting economic goals THEN the system SHALL track progress and suggest investment strategies
5. WHEN managing multiple characters THEN the system SHALL allow comparison of economic performance and investment strategies

### Requirement 10

**User Story:** As a simulation engine, I want character investments to integrate with need satisfaction calculations, so that economic activities create realistic settlement development and historical events.

#### Acceptance Criteria

1. WHEN a character invests in farms THEN the system SHALL increase settlement food satisfaction and production capacity
2. WHEN a character invests in infrastructure THEN the system SHALL improve settlement water, shelter, or services satisfaction
3. WHEN character investments create economic booms THEN the system SHALL generate positive historical events and population growth
4. WHEN character investments fail THEN the system SHALL create economic crises that affect need satisfaction
5. WHEN multiple characters invest in a settlement THEN the system SHALL calculate combined effects on settlement development
6. WHEN character investments affect settlement needs THEN the system SHALL update building efficiency calculations in BasicNeedsService