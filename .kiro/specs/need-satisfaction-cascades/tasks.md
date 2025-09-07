# Implementation Plan

- [x] 1. Create core BasicNeedsService with calculation methods
  -  Implement BasicNeedsService class extending BaseDomainService
  -  Add individual need calculation methods (food, water, shelter, goods, services)
  -  Implement cascading effects calculation logic
  -  Write unit tests for all calculation methods (41 tests passing)
  -  Export service in domain services index
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3_

- [x] 2. Implement need satisfaction data structures and validation
  - Define NeedSatisfactionResult and ConsequenceObject data structures
  - Add validation methods for settlement data requirements
  - Implement error handling and default value fallbacks
  - Create helper methods for resource and infrastructure calculations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3. Create NeedConsequenceService for generating consequences
  - Implement NeedConsequenceService class extending BaseDomainService
  - Add consequence generation methods for each need type (famine, water crisis, housing crisis)
  - Implement severity calculation and effect scaling logic
  - Create consequence resolution trigger system
  - Write unit tests for consequence generation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Enhance Settlement entity with need satisfaction tracking
  - Add needSatisfaction property to Settlement entity schema
  - Implement need satisfaction history tracking
  - Add methods for updating and retrieving need satisfaction data
  - Create settlement validation for need satisfaction requirements
  - Write tests for settlement need satisfaction integration
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Integrate need satisfaction into turn processing
  - Modify SimulationService to call BasicNeedsService during settlement updates
  - Add consequence application logic to settlement update phase
  - Implement historical event generation for need satisfaction changes
  - Ensure proper error handling during turn processing
  - Write integration tests for turn processing with need satisfaction
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Implement character behavior modification system
  -  Create character modifier application system for mood, energy, and health changes
  -  Implement interaction modifier system for need-based behavior changes
  -  Add character priority system for need-related interactions
  -  Create character migration decision logic based on settlement needs
  -  Write tests for character behavior modifications
  -  Implement CharacterBehaviorModifierService with all required methods
  -  Integrate with existing Character entity and GenerateBehavior system
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Create SettlementEconomyService for multi-settlement coordination
  -  Implement SettlementEconomyService in application layer
  -  Add batch processing for multiple settlement need calculations
  -  Implement regional effect detection (multiple settlements in crisis)
  -  Create settlement comparison and migration pressure calculations
  -  Write tests for multi-settlement economic coordination
  - _Requirements: 5.4, 6.3_

- [x] 8. Integrate with template system for settlement need profiles
  -  Add need satisfaction baseline configuration to settlement templates
  -  Implement template instantiation with need satisfaction data
  -  Create preset settlement templates with different economic profiles
  -  Add template validation for need satisfaction requirements
  -  Write tests for template system integration
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Add historical event generation for need satisfaction changes
  - Enhance HistoryGenerator to create need-related historical events
  - Implement event categorization and timeline integration
  - Add regional event detection for widespread need crises
  - Create prosperity and crisis event generation
  - Write tests for historical event generation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Implement consequence resolution and trigger system
  - Create consequence lifecycle management system
  - Implement trigger detection and consequence resolution logic
  - Add automatic consequence cleanup when resolved
  - Create player action tracking for manual trigger resolution
  - Write tests for consequence resolution system
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 11. Add performance optimizations and caching
  - Implement calculation caching for unchanged settlements
  - Add batch processing for multiple settlement updates
  - Create efficient data structures for need satisfaction history
  - Implement memory management for consequence objects
  - Write performance tests for large-scale simulations
  - _Requirements: All requirements - performance optimization_

- [ ] 12. Create comprehensive integration tests and validation
  - Write end-to-end tests for complete need satisfaction workflow
  - Test integration with existing character, settlement, and simulation systems
  - Validate historical event generation and timeline integration
  - Test template system integration with need satisfaction profiles
  - Create stress tests for multiple settlements and long-running simulations
  - _Requirements: All requirements - comprehensive validation_

- [ ] 13. Implement Character Economic Investment System
  - Create CharacterEconomicService extending BaseDomainService for managing investments
  - Create EconomicProfile value object following immutable pattern (wealth, investments, goals)
  - Add economic profile to Character entity following existing value object integration
  - Implement investment types as new assignment types in existing assignment system
  - Create investment validation using existing PrerequisiteValidator patterns
  - Write unit tests for character economic activities following existing test patterns
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 14. Create Character Investment Editor Interface
  - Design investment management UI integrating with existing character editor
  - Implement investment opportunity discovery using existing interaction patterns
  - Add investment cost calculation following existing validation patterns
  - Create passive income management interface using existing UI components
  - Add economic goal setting using existing goal/template systems
  - Write integration tests following existing test architecture
  - _Requirements: 8.7, 8.8, 8.9, 8.10, 8.11_

- [ ] 15. Integrate character investments with need satisfaction system
  - Connect character investments to BasicNeedsService building efficiency calculations
  - Implement investment effects on settlement resources using existing settlement structure
  - Add character investment consequences using existing consequence system
  - Create investment-driven historical events using existing HistoryGenerator
  - Integrate with turn-based processing using existing TurnManager patterns
  - Write tests following existing integration test patterns
  - _Requirements: 8.12, 8.13, 8.14, 8.15, 8.16_