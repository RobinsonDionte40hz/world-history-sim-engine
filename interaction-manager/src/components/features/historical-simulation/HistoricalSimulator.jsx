import React, { useState, useEffect } from 'react';
import WorldHistoryEngine from '../../../WorldHistoryEngine.js';
import TemplateManager from '../template-system/TemplateManager.jsx';
import styles from './HistoricalSimulator.module.css';
import { 
  Settings, 
  History, 
  Globe, 
  BarChart2, 
  Plus, 
  Info, 
  Play, 
  Pause, 
  Save, 
  Upload, 
  RefreshCw,
  Clock,
  Users,
  Map,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState('world');
  const [simulationSettings, setSimulationSettings] = useState({
    years: 100,
    timeStep: 1,
    eventFrequency: 5,
    maxConcurrentEvents: 10,
    enableLogging: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize engine
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
        addNotification('System initialized successfully', 'success');
      } catch (error) {
        console.error('Failed to initialize engine:', error);
        addNotification('Failed to initialize system', 'error');
      }
    };

    initEngine();
  }, []);

  // Add notification
  const addNotification = (message, type = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Generate new world
  const generateWorld = async () => {
    if (!engine) return;

    setIsLoading(true);
    addNotification('Generating new world...', 'info');
    
    try {
      await engine.generateWorld({
        width: 1000,
        height: 1000,
        seed: Date.now()
      });
      setWorldState(engine.world);
      addNotification('World generated successfully', 'success');
    } catch (error) {
      console.error('Failed to generate world:', error);
      addNotification('Failed to generate world', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Run simulation
  const runSimulation = async () => {
    if (!engine || !worldState) return;

    setIsLoading(true);
    setIsSimulating(true);
    setSimulationProgress(0);
    addNotification('Starting simulation...', 'info');

    try {
      await engine.simulate({
        ...simulationSettings,
        onProgress: (progress) => {
          setSimulationProgress(progress);
        }
      });

      setWorldState(engine.world);
      addNotification('Simulation completed successfully', 'success');
    } catch (error) {
      console.error('Simulation failed:', error);
      addNotification('Simulation failed', 'error');
    } finally {
      setIsLoading(false);
      setIsSimulating(false);
    }
  };

  // Handle simulation settings change
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSimulationSettings(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  // Query history
  const queryHistory = (query) => {
    if (!engine || !engine.historyAnalyzer) return [];
    return engine.historyAnalyzer.queryHistory(query);
  };

  // Generate family tree
  const generateFamilyTree = (rootId, options) => {
    if (!engine || !engine.historyAnalyzer) return null;
    return engine.historyAnalyzer.generateFamilyTree(rootId, options);
  };

  // Analyze decisions
  const analyzeDecisions = (npcId, options) => {
    if (!engine || !engine.historyAnalyzer) return null;
    return engine.historyAnalyzer.analyzeDecisions(npcId, options);
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
        <div className={styles.worldHeader}>
          <h2><Globe size={20} /> World State</h2>
          <div className={styles.worldControls}>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={styles.settingsButton}
            >
              <Settings size={18} />
              Settings
            </button>
            <button 
              onClick={generateWorld} 
              disabled={isLoading}
              className={styles.generateButton}
            >
              <RefreshCw size={18} />
              Generate New World
            </button>
          </div>
        </div>

        {showSettings && (
          <div className={styles.settingsPanel}>
            <h3>Simulation Settings</h3>
            <div className={styles.settingsGrid}>
              <div className={styles.settingGroup}>
                <label>Years to Simulate</label>
                <input
                  type="number"
                  name="years"
                  value={simulationSettings.years}
                  onChange={handleSettingChange}
                  min="1"
                  max="1000"
                />
              </div>
              <div className={styles.settingGroup}>
                <label>Time Step</label>
                <input
                  type="number"
                  name="timeStep"
                  value={simulationSettings.timeStep}
                  onChange={handleSettingChange}
                  min="0.1"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className={styles.settingGroup}>
                <label>Event Frequency</label>
                <input
                  type="number"
                  name="eventFrequency"
                  value={simulationSettings.eventFrequency}
                  onChange={handleSettingChange}
                  min="1"
                  max="20"
                />
              </div>
              <div className={styles.settingGroup}>
                <label>Max Concurrent Events</label>
                <input
                  type="number"
                  name="maxConcurrentEvents"
                  value={simulationSettings.maxConcurrentEvents}
                  onChange={handleSettingChange}
                  min="1"
                  max="50"
                />
              </div>
            </div>
          </div>
        )}

        {!worldState ? (
          <div className={styles.noWorld}>
            <div className={styles.noWorldContent}>
              <Globe size={48} />
              <h3>No World Generated</h3>
              <p>Generate a new world to begin simulation</p>
              <button 
                onClick={generateWorld} 
                disabled={isLoading}
                className={styles.generateButton}
              >
                <Plus size={18} />
                Generate New World
              </button>
            </div>
            <SystemInfo />
          </div>
        ) : (
          <div className={styles.worldContent}>
            <div className={styles.worldStats}>
              <div className={styles.statCard}>
                <Map size={24} />
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{worldState.nodes.size}</span>
                  <span className={styles.statLabel}>Nodes</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <Users size={24} />
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{worldState.characters.size}</span>
                  <span className={styles.statLabel}>Characters</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <BookOpen size={24} />
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{worldState.history.length}</span>
                  <span className={styles.statLabel}>Events</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <Clock size={24} />
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{worldState.currentYear}</span>
                  <span className={styles.statLabel}>Current Year</span>
                </div>
              </div>
            </div>

            <div className={styles.simulationControls}>
              <button 
                onClick={runSimulation} 
                disabled={isLoading || isSimulating}
                className={styles.simulateButton}
              >
                {isSimulating ? (
                  <>
                    <Pause size={18} />
                    Pause Simulation
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Run Simulation
                  </>
                )}
              </button>
              <button 
                onClick={saveWorld}
                className={styles.saveButton}
              >
                <Save size={18} />
                Save World
              </button>
              <button 
                onClick={loadWorld}
                className={styles.loadButton}
              >
                <Upload size={18} />
                Load World
              </button>
            </div>

            {isLoading && (
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                <div 
                    className={styles.progressFill}
                  style={{ width: `${simulationProgress}%` }}
                />
                </div>
                <div className={styles.progressInfo}>
                  <span className={styles.progressText}>
                  {Math.round(simulationProgress)}%
                  </span>
                  <span className={styles.progressStatus}>
                    {isSimulating ? 'Simulating...' : 'Loading...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render history view
  const renderHistoryView = () => {
    if (!engine || !engine.historyAnalyzer) {
      return (
        <div className={styles.noWorld}>
          <div className={styles.noWorldContent}>
            <h3>No History Available</h3>
            <p>Please initialize the system and generate a world to view history.</p>
          </div>
        </div>
      );
    }

    const events = queryHistory({
      timeRange: { start: 0, end: 100 },
      includeAttributes: true,
      includeConsciousness: true
    });

    return (
      <div className={styles.historyView}>
        <div className={styles.historyHeader}>
          <h2>
            <History size={20} />
            World History
          </h2>
          <div className={styles.historyFilters}>
            <select className={styles.filterSelect}>
              <option value="all">All Events</option>
              <option value="births">Births</option>
              <option value="deaths">Deaths</option>
              <option value="marriages">Marriages</option>
              <option value="wars">Wars</option>
              <option value="discoveries">Discoveries</option>
            </select>
          </div>
        </div>

        <div className={styles.eventsTimeline}>
          {events.map(event => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventHeader}>
                <span className={styles.eventType}>{event.type}</span>
                <span className={styles.eventTime}>
                  Year {Math.floor(event.timestamp)}
                </span>
              </div>
              <div className={styles.eventContent}>
                <p className={styles.eventDescription}>{event.description}</p>
                {event.participants && event.participants.length > 0 && (
                  <div className={styles.eventParticipants}>
                    <h4>Participants</h4>
                    <ul>
                      {event.participants.map(participant => (
                        <li key={participant.id}>{participant.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className={styles.eventFooter}>
                <span>Location: {event.location}</span>
                <span>Impact: {event.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render analysis view
  const renderAnalysisView = () => {
    if (!engine || !engine.historyAnalyzer) {
      return (
        <div className={styles.noWorld}>
          <div className={styles.noWorldContent}>
            <h3>No Analysis Available</h3>
            <p>Please initialize the system and generate a world to view analysis.</p>
          </div>
        </div>
      );
    }

    // Get world statistics
    const stats = {
      totalEvents: engine.historyAnalyzer.queryHistory({}).length,
      totalCharacters: engine.world.characters.size,
      totalLocations: engine.world.locations.size,
      totalGroups: engine.world.groups.size
    };

    // Get attribute distribution
    const attributes = Array.from(engine.world.characters.values()).reduce((acc, char) => {
      Object.entries(char.attributes).forEach(([attr, value]) => {
        if (!acc[attr]) acc[attr] = [];
        acc[attr].push(value);
      });
      return acc;
    }, {});

    // Calculate averages
    const attributeAverages = Object.entries(attributes).reduce((acc, [attr, values]) => {
      acc[attr] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {});

    return (
      <div className={styles.analysisView}>
        <h2>
          <BarChart2 size={20} />
          World Analysis
        </h2>

        <div className={styles.analysisContent}>
          <div className={styles.analysisSummary}>
            <h3>World Overview</h3>
            <div className={styles.summaryStats}>
              <div className={styles.summaryStat}>
                <span className={styles.statValue}>{stats.totalEvents}</span>
                <span className={styles.statLabel}>Total Events</span>
              </div>
              <div className={styles.summaryStat}>
                <span className={styles.statValue}>{stats.totalCharacters}</span>
                <span className={styles.statLabel}>Characters</span>
              </div>
              <div className={styles.summaryStat}>
                <span className={styles.statValue}>{stats.totalLocations}</span>
                <span className={styles.statLabel}>Locations</span>
              </div>
              <div className={styles.summaryStat}>
                <span className={styles.statValue}>{stats.totalGroups}</span>
                <span className={styles.statLabel}>Groups</span>
              </div>
            </div>
          </div>

          <div className={styles.analysisDetails}>
            <div className={styles.analysisSection}>
              <h3>Attribute Distribution</h3>
              {Object.entries(attributeAverages).map(([attr, value]) => (
                <div key={attr} className={styles.attributeChart}>
                  <div className={styles.attributeName}>{attr}</div>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.barFill}
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                  <div className={styles.attributeValue}>
                    {value.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.analysisSection}>
              <h3>Event Distribution</h3>
              {Object.entries(
                engine.historyAnalyzer.queryHistory({})
                  .reduce((acc, event) => {
                    acc[event.type] = (acc[event.type] || 0) + 1;
                    return acc;
                  }, {})
              ).map(([type, count]) => (
                <div key={type} className={styles.attributeChart}>
                  <div className={styles.attributeName}>{type}</div>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.barFill}
                      style={{ width: `${(count / stats.totalEvents) * 100}%` }}
                    />
                  </div>
                  <div className={styles.attributeValue}>
                    {count}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.analysisSection}>
              <h3>System Information</h3>
              <div className={styles.infoSection}>
                <h4>World Generation</h4>
                <p>World was generated with the following parameters:</p>
                <ul>
                  <li>Width: {engine.world.width}</li>
                  <li>Height: {engine.world.height}</li>
                  <li>Seed: {engine.world.seed}</li>
                </ul>
              </div>
              <div className={styles.infoSection}>
                <h4>Simulation Settings</h4>
                <ul>
                  <li>Years: <strong>{simulationSettings.years}</strong></li>
                  <li>Time Step: <strong>{simulationSettings.timeStep}</strong></li>
                  <li>Event Frequency: <strong>{simulationSettings.eventFrequency}</strong></li>
                  <li>Max Concurrent Events: <strong>{simulationSettings.maxConcurrentEvents}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>World History Simulator</h1>
        <div className={styles.viewControls}>
          <button
            className={`${styles.viewButton} ${viewMode === 'world' ? styles.active : ''}`}
            onClick={() => setViewMode('world')}
          >
            <Globe size={18} />
            World
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'history' ? styles.active : ''}`}
            onClick={() => setViewMode('history')}
          >
            <History size={18} />
            History
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'analysis' ? styles.active : ''}`}
            onClick={() => setViewMode('analysis')}
          >
            <BarChart2 size={18} />
            Analysis
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'templates' ? styles.active : ''}`}
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
        {viewMode === 'templates' && <TemplateManager engine={engine} />}
      </div>

      <div className={styles.notifications}>
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`${styles.notification} ${styles[notification.type]}`}
          >
            {notification.type === 'success' && <CheckCircle size={18} />}
            {notification.type === 'error' && <XCircle size={18} />}
            {notification.type === 'info' && <Info size={18} />}
            <span>{notification.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldHistorySimulator; 