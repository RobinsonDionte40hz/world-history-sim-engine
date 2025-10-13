import React, { useState, useEffect, useCallback } from 'react';
import './SettlementChroniclesViewer.css';

/**
 * SettlementChroniclesViewer Component
 *
 * Displays comprehensive chronicles of settlement history,
 * including development milestones, population changes,
 * economic evolution, and cultural developments.
 *
 * Features:
 * - Chronological settlement history
 * - Development milestone tracking
 * - Population and demographic changes
 * - Economic and cultural evolution
 * - Interactive timeline navigation
 *
 * Requirements: UI-7.2, 5.3, 6.2
 */

const SettlementChroniclesViewer = ({
  settlement,
  historyService,
  populationService,
  economicService,
  culturalService,
  onEventSelect = () => {},
  onMilestoneSelect = () => {},
  className = ''
}) => {
  const [chronicles, setChronicles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [expandedSections, setExpandedSections] = useState(new Set(['development']));
  const [timelineView, setTimelineView] = useState('chronological');

  const generateChronicles = useCallback(async () => {
    if (!settlement) return;

    setLoading(true);
    try {
      // Query settlement history
      const settlementHistory = historyService.getSettlementHistory(settlement.id);

      // Query population data
      const populationData = populationService?.getPopulationHistory(settlement.id) || [];

      // Query economic data
      const economicData = economicService?.getEconomicHistory(settlement.id) || [];

      // Query cultural data
      const culturalData = culturalService?.getCulturalHistory(settlement.id) || [];

      // Generate development milestones
      const developmentMilestones = generateDevelopmentMilestones(settlement, settlementHistory);

      // Generate population chronicles
      const populationChronicles = generatePopulationChronicles(settlement, populationData);

      // Generate economic chronicles
      const economicChronicles = generateEconomicChronicles(settlement, economicData);

      // Generate cultural chronicles
      const culturalChronicles = generateCulturalChronicles(settlement, culturalData);

      // Generate key events
      const keyEvents = generateKeyEvents(settlementHistory);

      // Organize by time periods
      const timePeriods = organizeByTimePeriods([
        ...developmentMilestones,
        ...populationChronicles,
        ...economicChronicles,
        ...culturalChronicles,
        ...keyEvents
      ]);

      setChronicles({
        developmentMilestones,
        populationChronicles,
        economicChronicles,
        culturalChronicles,
        keyEvents,
        timePeriods,
        metadata: {
          generatedAt: new Date(),
          totalEvents: settlementHistory.length,
          timeSpan: calculateTimeSpan(settlementHistory),
          settlementName: settlement.name,
          settlementType: settlement.type
        }
      });

    } catch (error) {
      console.error('Error generating settlement chronicles:', error);
      setChronicles({
        error: 'Failed to generate chronicles',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [settlement, historyService, populationService, economicService, culturalService]);

  // Generate chronicles when settlement changes
  useEffect(() => {
    if (settlement && historyService) {
      generateChronicles();
    }
  }, [settlement, historyService, populationService, economicService, culturalService, generateChronicles]);

  const generateDevelopmentMilestones = (settlement, history) => {
    const milestones = [];

    // Foundation milestone
    if (settlement.founded) {
      milestones.push({
        type: 'development',
        category: 'foundation',
        title: 'Settlement Founded',
        description: `${settlement.name} was established as a ${settlement.type}`,
        date: settlement.founded,
        significance: 1.0,
        details: {
          founder: settlement.founder,
          initialPopulation: settlement.initialPopulation || 0,
          foundingPurpose: settlement.foundingPurpose
        }
      });
    }

    // Building development milestones
    const buildingEvents = history.filter(e => e.type === 'building_constructed');
    buildingEvents.forEach(event => {
      milestones.push({
        type: 'development',
        category: 'infrastructure',
        title: `New Building: ${event.buildingName}`,
        description: `${event.buildingName} was constructed in ${settlement.name}`,
        date: event.timestamp,
        significance: event.significance || 0.6,
        details: {
          buildingType: event.buildingType,
          cost: event.cost,
          benefits: event.benefits
        }
      });
    });

    // Government changes
    const governmentEvents = history.filter(e => e.type === 'government_change');
    governmentEvents.forEach(event => {
      milestones.push({
        type: 'development',
        category: 'governance',
        title: `Government Change: ${event.newGovernment}`,
        description: `${settlement.name} adopted a new form of government`,
        date: event.timestamp,
        significance: event.significance || 0.8,
        details: {
          previousGovernment: event.previousGovernment,
          newGovernment: event.newGovernment,
          reason: event.reason
        }
      });
    });

    return milestones.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const generatePopulationChronicles = (settlement, populationData) => {
    const chronicles = [];

    if (populationData.length === 0) return chronicles;

    // Population growth phases
    let previousPopulation = 0;
    populationData.forEach((data, index) => {
      const growth = data.population - previousPopulation;
      const growthRate = previousPopulation > 0 ? (growth / previousPopulation) * 100 : 0;

      if (Math.abs(growthRate) > 10) { // Significant change
        chronicles.push({
          type: 'population',
          category: growth > 0 ? 'growth' : 'decline',
          title: `Population ${growth > 0 ? 'Growth' : 'Decline'}: ${Math.abs(growth)} ${growth > 0 ? 'new residents' : 'residents left'}`,
          description: `${settlement.name}'s population ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth)} (${growthRate.toFixed(1)}%)`,
          date: data.timestamp,
          significance: Math.min(Math.abs(growthRate) / 50, 1.0),
          details: {
            newPopulation: data.population,
            change: growth,
            growthRate: growthRate,
            demographics: data.demographics
          }
        });
      }

      previousPopulation = data.population;
    });

    return chronicles;
  };

  const generateEconomicChronicles = (settlement, economicData) => {
    const chronicles = [];

    if (economicData.length === 0) return chronicles;

    // Economic development phases
    economicData.forEach((data, index) => {
      if (index === 0) return; // Skip first data point

      const previousData = economicData[index - 1];
      const wealthChange = data.wealth - previousData.wealth;
      const tradeChange = data.tradeVolume - previousData.tradeVolume;

      // Significant economic changes
      if (Math.abs(wealthChange) > 1000) {
        chronicles.push({
          type: 'economic',
          category: wealthChange > 0 ? 'prosperity' : 'recession',
          title: `Economic ${wealthChange > 0 ? 'Boom' : 'Downturn'}`,
          description: `${settlement.name} experienced ${wealthChange > 0 ? 'growing prosperity' : 'economic difficulties'}`,
          date: data.timestamp,
          significance: Math.min(Math.abs(wealthChange) / 5000, 1.0),
          details: {
            wealthChange: wealthChange,
            newWealth: data.wealth,
            tradeVolume: data.tradeVolume,
            tradeChange: tradeChange,
            primaryIndustries: data.primaryIndustries
          }
        });
      }
    });

    return chronicles;
  };

  const generateCulturalChronicles = (settlement, culturalData) => {
    const chronicles = [];

    if (culturalData.length === 0) return chronicles;

    // Cultural development
    culturalData.forEach((data, index) => {
      if (index === 0) return;

      const previousData = culturalData[index - 1];

      // Cultural tradition changes
      if (data.traditions.length !== previousData.traditions.length) {
        const newTraditions = data.traditions.filter(t => !previousData.traditions.includes(t));
        if (newTraditions.length > 0) {
          chronicles.push({
            type: 'cultural',
            category: 'tradition',
            title: `New Cultural Tradition: ${newTraditions[0]}`,
            description: `${settlement.name} developed new cultural traditions`,
            date: data.timestamp,
            significance: 0.7,
            details: {
              newTraditions: newTraditions,
              allTraditions: data.traditions,
              culturalInfluence: data.culturalInfluence
            }
          });
        }
      }

      // Festival or event milestones
      if (data.festivals && data.festivals.length > (previousData.festivals?.length || 0)) {
        chronicles.push({
          type: 'cultural',
          category: 'celebration',
          title: 'New Festival Established',
          description: `${settlement.name} established a new cultural festival`,
          date: data.timestamp,
          significance: 0.6,
          details: {
            festivals: data.festivals,
            culturalEvents: data.culturalEvents
          }
        });
      }
    });

    return chronicles;
  };

  const generateKeyEvents = (history) => {
    return history
      .filter(event => event.significance > 0.7)
      .map(event => ({
        type: 'event',
        category: event.type,
        title: event.name || `${event.type.replace('_', ' ')}`,
        description: event.description,
        date: event.timestamp,
        significance: event.significance,
        details: event.metadata || {}
      }));
  };

  const organizeByTimePeriods = (allEvents) => {
    const periods = {
      early: [],
      development: [],
      mature: [],
      recent: []
    };

    if (allEvents.length === 0) return periods;

    const sortedEvents = allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    const earliest = new Date(sortedEvents[0].date);
    const latest = new Date(sortedEvents[sortedEvents.length - 1].date);
    const totalSpan = latest - earliest;

    sortedEvents.forEach(event => {
      const eventDate = new Date(event.date);
      const progress = (eventDate - earliest) / totalSpan;

      if (progress < 0.25) {
        periods.early.push(event);
      } else if (progress < 0.5) {
        periods.development.push(event);
      } else if (progress < 0.75) {
        periods.mature.push(event);
      } else {
        periods.recent.push(event);
      }
    });

    return periods;
  };

  const calculateTimeSpan = (history) => {
    if (history.length === 0) return 0;

    const dates = history.map(h => new Date(h.timestamp)).sort((a, b) => a - b);
    return dates[dates.length - 1] - dates[0];
  };

  const toggleSectionExpansion = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
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

  const getCategoryIcon = (category) => {
    const icons = {
      foundation: '🏛️',
      infrastructure: '🏗️',
      governance: '⚖️',
      growth: '📈',
      decline: '📉',
      prosperity: '💰',
      recession: '📊',
      tradition: '🎭',
      celebration: '🎉',
      default: '📜'
    };
    return icons[category] || icons.default;
  };

  if (loading) {
    return (
      <div className={`settlement-chronicles loading ${className}`}>
        <div className="loading-spinner">Compiling settlement chronicles...</div>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className={`settlement-chronicles empty ${className}`}>
        <div className="empty-state">
          <h3>No Settlement Selected</h3>
          <p>Select a settlement to view its historical chronicles.</p>
        </div>
      </div>
    );
  }

  if (!chronicles || chronicles.error) {
    return (
      <div className={`settlement-chronicles error ${className}`}>
        <div className="error-state">
          <h3>Chronicles Generation Failed</h3>
          <p>{chronicles?.details || 'Unable to generate chronicles for this settlement.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`settlement-chronicles ${className}`}>
      {/* Header */}
      <div className="chronicles-header">
        <h2>Chronicles of {settlement.name}</h2>
        <div className="settlement-info">
          <span className="settlement-type">{settlement.type}</span>
          <span className="time-span">
            {Math.round(chronicles.metadata.timeSpan / (1000 * 60 * 60 * 24))} days of history
          </span>
          <span className="event-count">
            {chronicles.metadata.totalEvents} historical events
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="chronicles-controls">
        <div className="period-selector">
          <label>Time Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="all">All Periods</option>
            <option value="early">Early History</option>
            <option value="development">Development Phase</option>
            <option value="mature">Mature Period</option>
            <option value="recent">Recent Events</option>
          </select>
        </div>

        <div className="view-selector">
          <label>View:</label>
          <select
            value={timelineView}
            onChange={(e) => setTimelineView(e.target.value)}
          >
            <option value="chronological">Chronological</option>
            <option value="categorical">By Category</option>
            <option value="significance">By Significance</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="chronicles-content">
        {timelineView === 'chronological' && (
          <div className="chronological-view">
            {Object.entries(chronicles.timePeriods).map(([period, events]) => {
              if (selectedPeriod !== 'all' && selectedPeriod !== period) return null;
              if (events.length === 0) return null;

              return (
                <div key={period} className={`period-section period-${period}`}>
                  <h3 className="period-title">
                    {period.charAt(0).toUpperCase() + period.slice(1)} Period
                  </h3>

                  <div className="period-events">
                    {events.map((event, index) => (
                      <div
                        key={index}
                        className={`chronicle-event significance-${getSignificanceColor(event.significance)}`}
                        onClick={() => onEventSelect(event)}
                      >
                        <div className="event-icon">
                          {getCategoryIcon(event.category)}
                        </div>

                        <div className="event-content">
                          <div className="event-header">
                            <h4>{event.title}</h4>
                            <span className="event-date">{formatDate(event.date)}</span>
                          </div>

                          <p className="event-description">{event.description}</p>

                          <div className="event-meta">
                            <span className="event-type">{event.type}</span>
                            <span className="event-significance">
                              Significance: {Math.round(event.significance * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {timelineView === 'categorical' && (
          <div className="categorical-view">
            {['development', 'population', 'economic', 'cultural', 'event'].map(category => {
              const categoryEvents = [
                ...(chronicles.developmentMilestones || []),
                ...(chronicles.populationChronicles || []),
                ...(chronicles.economicChronicles || []),
                ...(chronicles.culturalChronicles || []),
                ...(chronicles.keyEvents || [])
              ].filter(event => event.type === category);

              if (categoryEvents.length === 0) return null;

              const isExpanded = expandedSections.has(category);

              return (
                <div key={category} className={`category-section category-${category}`}>
                  <div
                    className="category-header"
                    onClick={() => toggleSectionExpansion(category)}
                  >
                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)} Chronicles</h3>
                    <span className="event-count">({categoryEvents.length} events)</span>
                    <button className="expand-toggle">
                      {isExpanded ? '−' : '+'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="category-events">
                      {categoryEvents.map((event, index) => (
                        <div
                          key={index}
                          className={`category-event significance-${getSignificanceColor(event.significance)}`}
                          onClick={() => onEventSelect(event)}
                        >
                          <div className="event-icon">
                            {getCategoryIcon(event.category)}
                          </div>

                          <div className="event-content">
                            <h4>{event.title}</h4>
                            <p>{event.description}</p>
                            <div className="event-meta">
                              <span className="event-date">{formatDate(event.date)}</span>
                              <span className="event-significance">
                                {Math.round(event.significance * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {timelineView === 'significance' && (
          <div className="significance-view">
            {['high', 'medium', 'low'].map(significance => {
              const significanceEvents = [
                ...(chronicles.developmentMilestones || []),
                ...(chronicles.populationChronicles || []),
                ...(chronicles.economicChronicles || []),
                ...(chronicles.culturalChronicles || []),
                ...(chronicles.keyEvents || [])
              ].filter(event => getSignificanceColor(event.significance) === significance);

              if (significanceEvents.length === 0) return null;

              return (
                <div key={significance} className={`significance-section significance-${significance}`}>
                  <h3>
                    {significance.charAt(0).toUpperCase() + significance.slice(1)} Significance Events
                  </h3>

                  <div className="significance-events">
                    {significanceEvents.map((event, index) => (
                      <div
                        key={index}
                        className="significance-event"
                        onClick={() => onEventSelect(event)}
                      >
                        <div className="event-icon">
                          {getCategoryIcon(event.category)}
                        </div>

                        <div className="event-content">
                          <h4>{event.title}</h4>
                          <p>{event.description}</p>
                          <div className="event-meta">
                            <span className="event-type">{event.type}</span>
                            <span className="event-date">{formatDate(event.date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementChroniclesViewer;