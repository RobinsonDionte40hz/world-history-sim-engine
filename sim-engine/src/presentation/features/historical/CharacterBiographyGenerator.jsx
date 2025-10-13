import React, { useState, useEffect, useCallback } from 'react';
import './CharacterBiographyGenerator.css';

/**
 * CharacterBiographyGenerator Component
 *
 * Generates comprehensive character biographies using memory data,
 * political career information, and significant life events.
 *
 * Features:
 * - Life story narrative generation
 * - Political career timeline
 * - Significant memory highlights
 * - Relationship network visualization
 * - Achievement and milestone tracking
 *
 * Requirements: UI-7.2, 4.5, 6.5
 */

// Helper functions moved outside component to avoid dependency issues
const generateLifeStory = (character, memories, politicalEvents) => {
  const story = {
    earlyLife: '',
    careerDevelopment: '',
    majorAchievements: '',
    currentStatus: '',
    futureOutlook: ''
  };

  // Early life - look for early memories
  const earlyMemories = memories.filter(m => {
    const memoryAge = Date.now() - new Date(m.timestamp);
    const yearsOld = memoryAge / (365 * 24 * 60 * 60 * 1000);
    return yearsOld < 20; // Memories from first 20 years
  });

  if (earlyMemories.length > 0) {
    story.earlyLife = `Born into ${character.background || 'humble circumstances'}, ${character.name} showed early signs of ${character.traits?.join(', ') || 'remarkable character'}. Key early experiences shaped their development, including ${earlyMemories.slice(0, 2).map(m => m.description).join(' and ')}.`;
  }

  // Career development
  const careerEvents = politicalEvents.filter(e => e.type === 'leadership_change');
  if (careerEvents.length > 0) {
    story.careerDevelopment = `${character.name} rose through the ranks through ${careerEvents.length} leadership positions, demonstrating ${character.skills?.join(', ') || 'strong leadership abilities'}.`;
  }

  // Major achievements
  const significantEvents = [...memories, ...politicalEvents]
    .filter(e => (e.significance || 0) > 0.7)
    .sort((a, b) => (b.significance || 0) - (a.significance || 0))
    .slice(0, 3);

  if (significantEvents.length > 0) {
    story.majorAchievements = `Notable achievements include ${significantEvents.map(e => e.name || e.description).join(', ')}.`;
  }

  // Current status
  story.currentStatus = `${character.name} currently serves as ${character.occupation || 'a valued member'} of ${character.settlement || 'their community'}, known for their ${character.personality?.traits?.slice(0, 2).join(' and ') || 'steadfast character'}.`;

  return story;
};

const generatePoliticalCareer = (character, politicalEvents) => {
  const career = {
    positions: [],
    timeline: [],
    influence: 0,
    achievements: []
  };

  // Extract leadership positions
  const leadershipEvents = politicalEvents.filter(e => e.type === 'leadership_change');
  career.positions = leadershipEvents.map(event => ({
    title: 'Leader',
    settlement: event.settlements?.[0]?.name || 'Unknown Settlement',
    startDate: event.timestamp,
    reason: event.metadata?.reason || 'Appointed'
  }));

  // Calculate political influence (simplified)
  career.influence = politicalEvents.length * 10;

  // Political achievements
  career.achievements = politicalEvents
    .filter(e => e.significance > 0.6)
    .map(e => ({
      name: e.name,
      significance: e.significance,
      date: e.timestamp
    }));

  return career;
};

const generatePersonalityInsights = (character, memories) => {
  const insights = {
    dominantTraits: [],
    behavioralPatterns: [],
    decisionMaking: '',
    socialStyle: ''
  };

  // Analyze memory outcomes to determine traits
  const outcomes = memories.reduce((acc, memory) => {
    acc[memory.outcome || 'neutral'] = (acc[memory.outcome || 'neutral'] || 0) + 1;
    return acc;
  }, {});

  const totalMemories = memories.length;
  const successRate = (outcomes.success || 0) / totalMemories;

  if (successRate > 0.7) {
    insights.dominantTraits.push('Highly competent');
    insights.decisionMaking = 'Makes consistently good decisions';
  } else if (successRate < 0.3) {
    insights.dominantTraits.push('Struggles with challenges');
    insights.decisionMaking = 'Often faces difficult choices';
  }

  // Social style based on interaction memories
  const socialMemories = memories.filter(m => m.type === 'social' || m.participants?.length > 1);
  if (socialMemories.length > totalMemories * 0.5) {
    insights.socialStyle = 'Highly social and engaged with others';
  } else {
    insights.socialStyle = 'More reserved and independent';
  }

  return insights;
};

const generateRelationshipNetwork = (character, relationshipMemories) => {
  // This would analyze relationship memories to build network
  // For now, return a placeholder structure
  return {
    closeRelationships: [],
    professionalContacts: [],
    adversaries: [],
    networkStrength: 'Developing'
  };
};

const generateAchievements = (character, memories, politicalEvents) => {
  const achievements = [];

  // Political achievements
  politicalEvents.forEach(event => {
    if (event.significance > 0.7) {
      achievements.push({
        type: 'political',
        name: event.name,
        significance: event.significance,
        date: event.timestamp
      });
    }
  });

  // Personal achievements from memories
  memories.forEach(memory => {
    if (memory.significance > 0.8) {
      achievements.push({
        type: 'personal',
        name: memory.description,
        significance: memory.significance,
        date: memory.timestamp
      });
    }
  });

  return achievements.sort((a, b) => b.significance - a.significance);
};

const CharacterBiographyGenerator = ({
  character,
  memoryQueryService,
  politicalTrackingService,
  onMemorySelect = () => {},
  onRelationshipSelect = () => {},
  className = ''
}) => {
  const [biography, setBiography] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [expandedMemories, setExpandedMemories] = useState(new Set());

  const generateBiography = useCallback(async () => {
    if (!character) return;

    setLoading(true);
    try {
      // Query significant memories
      const significantMemories = memoryQueryService.queryPersonalMemories(character, {
        sortBy: 'significance',
        sortOrder: 'desc',
        limit: 20
      });

      // Query political career events
      const politicalEvents = politicalTrackingService.getPoliticalEvents({
        participantId: character.id
      });

      // Query relationship memories
      const relationshipMemories = [];
      // This would need character relationships data
      // For now, we'll use a placeholder

      // Generate life story narrative
      const lifeStory = generateLifeStory(character, significantMemories, politicalEvents);

      // Generate political career summary
      const politicalCareer = generatePoliticalCareer(character, politicalEvents);

      // Generate personality insights
      const personalityInsights = generatePersonalityInsights(character, significantMemories);

      // Generate relationship network
      const relationshipNetwork = generateRelationshipNetwork(character, relationshipMemories);

      // Generate achievements and milestones
      const achievements = generateAchievements(character, significantMemories, politicalEvents);

      setBiography({
        lifeStory,
        politicalCareer,
        personalityInsights,
        relationshipNetwork,
        achievements,
        significantMemories,
        politicalEvents,
        relationshipMemories,
        metadata: {
          generatedAt: new Date(),
          memoryCount: significantMemories.length,
          politicalEventCount: politicalEvents.length,
          relationshipCount: relationshipMemories.length
        }
      });

    } catch (error) {
      console.error('Error generating biography:', error);
      setBiography({
        error: 'Failed to generate biography',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [character, memoryQueryService, politicalTrackingService]);

  // Generate biography when character changes
  useEffect(() => {
    if (character && memoryQueryService && politicalTrackingService) {
      generateBiography();
    }
  }, [character, memoryQueryService, politicalTrackingService, generateBiography]);

  const toggleMemoryExpansion = (memoryId) => {
    setExpandedMemories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memoryId)) {
        newSet.delete(memoryId);
      } else {
        newSet.add(memoryId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getSignificanceColor = (significance) => {
    if (significance >= 0.8) return 'high';
    if (significance >= 0.5) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className={`character-biography loading ${className}`}>
        <div className="loading-spinner">Generating biography...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className={`character-biography empty ${className}`}>
        <div className="empty-state">
          <h3>No Character Selected</h3>
          <p>Select a character to generate their biography.</p>
        </div>
      </div>
    );
  }

  if (!biography || biography.error) {
    return (
      <div className={`character-biography error ${className}`}>
        <div className="error-state">
          <h3>Biography Generation Failed</h3>
          <p>{biography?.details || 'Unable to generate biography for this character.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`character-biography ${className}`}>
      {/* Header */}
      <div className="biography-header">
        <h2>Biography: {character.name}</h2>
        <div className="character-stats">
          <span className="stat">
            <strong>{biography.metadata.memoryCount}</strong> significant memories
          </span>
          <span className="stat">
            <strong>{biography.metadata.politicalEventCount}</strong> political events
          </span>
          <span className="stat">
            <strong>{biography.metadata.relationshipCount}</strong> relationships
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="biography-nav">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'lifestory', label: 'Life Story' },
          { id: 'political', label: 'Political Career' },
          { id: 'personality', label: 'Personality' },
          { id: 'achievements', label: 'Achievements' },
          { id: 'memories', label: 'Key Memories' }
        ].map(section => (
          <button
            key={section.id}
            className={`nav-button ${selectedSection === section.id ? 'active' : ''}`}
            onClick={() => setSelectedSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="biography-content">
        {selectedSection === 'overview' && (
          <div className="overview-section">
            <div className="overview-card">
              <h3>Life Summary</h3>
              <p>{biography.lifeStory.currentStatus}</p>
              <p>{biography.lifeStory.majorAchievements}</p>
            </div>

            <div className="overview-card">
              <h3>Political Standing</h3>
              <p>Influence Level: {biography.politicalCareer.influence}</p>
              <p>Leadership Positions: {biography.politicalCareer.positions.length}</p>
            </div>

            <div className="overview-card">
              <h3>Personality Traits</h3>
              <ul>
                {biography.personalityInsights.dominantTraits.map(trait => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {selectedSection === 'lifestory' && (
          <div className="lifestory-section">
            <div className="story-chapter">
              <h3>Early Life</h3>
              <p>{biography.lifeStory.earlyLife || 'Early life details are limited.'}</p>
            </div>

            <div className="story-chapter">
              <h3>Career Development</h3>
              <p>{biography.lifeStory.careerDevelopment || 'Career progression details are developing.'}</p>
            </div>

            <div className="story-chapter">
              <h3>Major Achievements</h3>
              <p>{biography.lifeStory.majorAchievements || 'Achievement highlights will be added as they occur.'}</p>
            </div>

            <div className="story-chapter">
              <h3>Current Status</h3>
              <p>{biography.lifeStory.currentStatus}</p>
            </div>
          </div>
        )}

        {selectedSection === 'political' && (
          <div className="political-section">
            <div className="political-summary">
              <h3>Political Career Overview</h3>
              <p><strong>Influence:</strong> {biography.politicalCareer.influence}</p>
              <p><strong>Positions Held:</strong> {biography.politicalCareer.positions.length}</p>
            </div>

            <div className="positions-list">
              <h3>Leadership Positions</h3>
              {biography.politicalCareer.positions.length > 0 ? (
                <ul>
                  {biography.politicalCareer.positions.map((position, index) => (
                    <li key={index} className="position-item">
                      <strong>{position.title}</strong> of {position.settlement}
                      <br />
                      <span className="position-details">
                        Started: {formatDate(position.startDate)} | Reason: {position.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No leadership positions recorded.</p>
              )}
            </div>

            <div className="achievements-list">
              <h3>Political Achievements</h3>
              {biography.politicalCareer.achievements.length > 0 ? (
                <ul>
                  {biography.politicalCareer.achievements.map((achievement, index) => (
                    <li key={index} className={`achievement-item significance-${getSignificanceColor(achievement.significance)}`}>
                      <strong>{achievement.name}</strong>
                      <br />
                      <span className="achievement-details">
                        Significance: {Math.round(achievement.significance * 100)}% | Date: {formatDate(achievement.date)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No significant political achievements recorded.</p>
              )}
            </div>
          </div>
        )}

        {selectedSection === 'personality' && (
          <div className="personality-section">
            <div className="personality-card">
              <h3>Dominant Traits</h3>
              <ul>
                {biography.personalityInsights.dominantTraits.map(trait => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
            </div>

            <div className="personality-card">
              <h3>Decision Making</h3>
              <p>{biography.personalityInsights.decisionMaking}</p>
            </div>

            <div className="personality-card">
              <h3>Social Style</h3>
              <p>{biography.personalityInsights.socialStyle}</p>
            </div>
          </div>
        )}

        {selectedSection === 'achievements' && (
          <div className="achievements-section">
            <h3>Notable Achievements</h3>
            {biography.achievements.length > 0 ? (
              <div className="achievements-grid">
                {biography.achievements.map((achievement, index) => (
                  <div key={index} className={`achievement-card significance-${getSignificanceColor(achievement.significance)}`}>
                    <div className="achievement-header">
                      <span className="achievement-type">{achievement.type}</span>
                      <span className="achievement-significance">
                        {Math.round(achievement.significance * 100)}%
                      </span>
                    </div>
                    <h4>{achievement.name}</h4>
                    <p className="achievement-date">{formatDate(achievement.date)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No notable achievements recorded yet.</p>
            )}
          </div>
        )}

        {selectedSection === 'memories' && (
          <div className="memories-section">
            <h3>Key Memories</h3>
            {biography.significantMemories.length > 0 ? (
              <div className="memories-list">
                {biography.significantMemories.map((memory, index) => (
                  <div key={index} className={`memory-item significance-${getSignificanceColor(memory.significance)}`}>
                    <div className="memory-header" onClick={() => toggleMemoryExpansion(memory.id)}>
                      <div className="memory-title">
                        <h4>{memory.description || 'Unnamed Memory'}</h4>
                        <div className="memory-meta">
                          <span className="memory-date">{formatDate(memory.timestamp)}</span>
                          <span className="memory-significance">
                            Significance: {Math.round(memory.significance * 100)}%
                          </span>
                          <span className={`memory-outcome outcome-${memory.outcome || 'neutral'}`}>
                            {memory.outcome || 'Neutral'}
                          </span>
                        </div>
                      </div>
                      <button className="expand-button">
                        {expandedMemories.has(memory.id) ? '−' : '+'}
                      </button>
                    </div>

                    {expandedMemories.has(memory.id) && (
                      <div className="memory-details">
                        <div className="memory-context">
                          <strong>Type:</strong> {memory.type || 'General'}
                          {memory.participants && memory.participants.length > 0 && (
                            <span> | <strong>Participants:</strong> {memory.participants.join(', ')}</span>
                          )}
                        </div>
                        {memory.emotionalImpact && (
                          <div className="memory-emotion">
                            <strong>Emotional Impact:</strong> {Math.round(memory.emotionalImpact * 100)}%
                          </div>
                        )}
                        {memory.consequences && (
                          <div className="memory-consequences">
                            <strong>Consequences:</strong> {memory.consequences}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No significant memories recorded.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterBiographyGenerator;