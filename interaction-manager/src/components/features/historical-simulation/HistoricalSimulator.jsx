import React, { useState, useEffect } from 'react';
import WorldHistoryEngine from '../../../WorldHistoryEngine.js';
import TemplateManager from '../template-system/TemplateManager.jsx';
import styles from '../WorldHistorySimulator.module.css';
import { Settings, History, Globe, BarChart2, Plus, Info } from 'lucide-react';

const SystemInfo = () => (
  <div className={styles.systemInfo}>
    <h3><Info size={18} /> System Information</h3>
    
    <div className={styles.infoSection}>
      <h4>Core Systems</h4>
      <ul>
        <li><strong>World Generation:</strong> Creates the initial world state with settlements, factions, and resources</li>
        <li><strong>Simulation Engine:</strong> Manages time progression and basic entity interactions</li>
        <li><strong>Complex Events:</strong> Handles wars, trade, politics, and diplomatic relations</li>
        <li><strong>Historical Recording:</strong> Tracks and documents significant events and changes</li>
      </ul>
    </div>

    <div className={styles.infoSection}>
      <h4>Required Templates</h4>
      <p>Before generating a world, you need to provide templates for:</p>
      <ul>
        <li><strong>Characters:</strong> Individual entities with attributes and behaviors</li>
        <li><strong>Nodes:</strong> Locations and points of interest</li>
        <li><strong>Interactions:</strong> Rules for entity interactions</li>
        <li><strong>Groups:</strong> Collections of entities (factions, organizations)</li>
        <li><strong>Historical Records:</strong> Templates for historical events</li>
      </ul>
    </div>

    <div className={styles.infoSection}>
      <h4>World Generation Requirements</h4>
      <ul>
        <li>World dimensions (width and height)</li>
        <li>Seed value for reproducible generation</li>
        <li>Valid templates for all required entity types</li>
        <li>Sufficient system resources for complex calculations</li>
      </ul>
    </div>

    <div className={styles.infoSection}>
      <h4>Complex Event Systems</h4>
      <ul>
        <li><strong>Trade System:</strong> Manages economic interactions and resource distribution</li>
        <li><strong>Political System:</strong> Handles governance, power structures, and political events</li>
        <li><strong>Diplomatic System:</strong> Manages relations between factions and diplomatic events</li>
        <li><strong>War System:</strong> Handles conflicts, military actions, and war-related events</li>
      </ul>
    </div>

    <div className={styles.infoSection}>
      <h4>Simulation Parameters</h4>
      <ul>
        <li><strong>Time Step:</strong> Controls how frequently the world updates</li>
        <li><strong>Event Frequency:</strong> Determines how often complex events occur</li>
        <li><strong>Max Concurrent Events:</strong> Limits simultaneous complex events</li>
        <li><strong>Logging:</strong> Tracks simulation progress and events</li>
      </ul>
    </div>
  </div>
);

const WorldHistorySimulator = () => {
  const [engine, setEngine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [worldState, setWorldState] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [viewMode, setViewMode] = useState('world'); // 'world', 'history', 'analysis', 'templates'

  // Initialize engine without world
  useEffect(() => {
    const initEngine = async () => {
      try {
        const newEngine = new WorldHistoryEngine();
        await newEngine.initialize({
          templates: {
            characters: [],
            nodes: [],
            interactions: [],
            groups: [],
            historicalRecords: []
          }
        });
        setEngine(newEngine);
      } catch (error) {
        console.error('Failed to initialize engine:', error);
      }
    };

    initEngine();
  }, []);

  // Generate new world
  const generateWorld = async () => {
    if (!engine) return;

    setIsLoading(true);
    try {
      await engine.generateWorld({
        width: 1000,
        height: 1000,
        seed: Date.now()
      });
      setWorldState(engine.world);
    } catch (error) {
      console.error('Failed to generate world:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run simulation
  const runSimulation = async () => {
    if (!engine || !worldState) return;

    setIsLoading(true);
    setSimulationProgress(0);

    try {
      await engine.simulate({
        years: 100,
        timeStep: 1,
        eventFrequency: 5,
        maxConcurrentEvents: 10,
        enableLogging: true,
        onProgress: (progress) => {
          setSimulationProgress(progress);
        }
      });

      setWorldState(engine.world);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Query history
  const queryHistory = (query) => {
    if (!engine) return [];
    return engine.queryHistory(query);
  };

  // Generate family tree
  const generateFamilyTree = (rootId, options) => {
    if (!engine) return null;
    return engine.generateFamilyTree(rootId, options);
  };

  // Analyze decisions
  const analyzeDecisions = (npcId, options) => {
    if (!engine) return null;
    return engine.analyzeDecisions(npcId, options);
  };

  // Save world
  const saveWorld = () => {
    if (!engine) return;
    engine.saveWorld();
  };

  // Load world
  const loadWorld = async () => {
    if (!engine) return;
    await engine.loadWorld();
    setWorldState(engine.world);
  };

  // Render world view
  const renderWorldView = () => {
    return (
      <div className={styles.worldView}>
        <h2>World State</h2>
        {!worldState ? (
          <div className={styles.noWorld}>
            <p>No world has been generated yet.</p>
            <SystemInfo />
            <button 
              onClick={generateWorld} 
              disabled={isLoading}
              className={styles.generateButton}
            >
              <Plus size={18} />
              Generate New World
            </button>
          </div>
        ) : (
          <>
            <div className={styles.stats}>
              <div>Nodes: {worldState.nodes.size}</div>
              <div>Characters: {worldState.characters.size}</div>
              <div>Groups: {worldState.groups.size}</div>
              <div>Historical Events: {worldState.history.length}</div>
            </div>
            <div className={styles.controls}>
              <button onClick={runSimulation} disabled={isLoading}>
                {isLoading ? 'Simulating...' : 'Run Simulation'}
              </button>
              <button onClick={saveWorld}>Save World</button>
              <button onClick={loadWorld}>Load World</button>
              <button onClick={generateWorld} disabled={isLoading}>
                Generate New World
              </button>
            </div>
            {isLoading && (
              <div className={styles.progress}>
                <div 
                  className={styles.progressBar}
                  style={{ width: `${simulationProgress}%` }}
                />
                <div className={styles.progressText}>
                  {Math.round(simulationProgress)}%
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Render history view
  const renderHistoryView = () => {
    if (!engine) return null;

    const events = queryHistory({
      timeRange: { start: 0, end: 100 },
      includeAttributes: true,
      includeConsciousness: true
    });

    return (
      <div className={styles.historyView}>
        <h2>Historical Events</h2>
        <div className={styles.events}>
          {events.map(event => (
            <div key={event.id} className={styles.event}>
              <div className={styles.eventHeader}>
                <span className={styles.eventType}>{event.eventType}</span>
                <span className={styles.eventTime}>
                  Year {Math.floor(event.timestamp)}
                </span>
              </div>
              <div className={styles.eventDescription}>
                {event.description}
              </div>
              {event.attributes && (
                <div className={styles.eventAttributes}>
                  <h4>Attribute Changes</h4>
                  {event.attributes.map(attr => (
                    <div key={attr.attribute}>
                      {attr.entity}: {attr.attribute} {attr.change > 0 ? '+' : ''}{attr.change}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render analysis view
  const renderAnalysisView = () => {
    if (!engine || !selectedEntity) return null;

    const analysis = analyzeDecisions(selectedEntity, {
      period: { start: 0, end: 100 },
      includeAttributeInfluence: true,
      includePersonalityFactors: true,
      includeConsciousnessStates: true,
      includeQuestMotivations: true
    });

    return (
      <div className={styles.analysisView}>
        <h2>Decision Analysis</h2>
        <div className={styles.analysis}>
          <div className={styles.summary}>
            <h3>Summary</h3>
            <div>Total Decisions: {analysis.summary.totalDecisions}</div>
          </div>
          <div className={styles.attributeInfluence}>
            <h3>Attribute Influence</h3>
            {Object.entries(analysis.summary.attributeInfluence).map(([attr, influence]) => (
              <div key={attr}>
                {attr}: {Math.round(influence * 100)}%
              </div>
            ))}
          </div>
          <div className={styles.personalityPatterns}>
            <h3>Personality Patterns</h3>
            {Object.entries(analysis.summary.personalityPatterns).map(([trait, pattern]) => (
              <div key={trait}>
                {trait}: {Math.round(pattern * 100)}%
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render template management view
  const renderTemplateView = () => {
    return <TemplateManager engine={engine} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>World History Simulator</h1>
        <div className={styles.viewControls}>
          <button
            className={viewMode === 'world' ? styles.active : ''}
            onClick={() => setViewMode('world')}
          >
            <Globe size={18} />
            World
          </button>
          <button
            className={viewMode === 'history' ? styles.active : ''}
            onClick={() => setViewMode('history')}
          >
            <History size={18} />
            History
          </button>
          <button
            className={viewMode === 'analysis' ? styles.active : ''}
            onClick={() => setViewMode('analysis')}
          >
            <BarChart2 size={18} />
            Analysis
          </button>
          <button
            className={viewMode === 'templates' ? styles.active : ''}
            onClick={() => setViewMode('templates')}
          >
            <Settings size={18} />
            Templates
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {viewMode === 'world' && renderWorldView()}
        {viewMode === 'history' && renderHistoryView()}
        {viewMode === 'analysis' && renderAnalysisView()}
        {viewMode === 'templates' && renderTemplateView()}
      </div>
    </div>
  );
};

export default WorldHistorySimulator; 