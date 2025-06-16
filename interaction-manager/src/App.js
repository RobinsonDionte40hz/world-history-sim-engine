import React, { useState, useEffect, useRef } from 'react';
import styles from './App.module.css';
import './App.css'; // Keep App.css for custom styles that are not easily done with Tailwind
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MainContent from './components/layout/MainContent';
import NodeTypeSystem from './systems/node/NodeTypeSystem';
import NodeTypeCreator from './components/features/node-system/components/NodeTypeCreator.jsx';
import { Sun, Moon, Users, Plus, Scale, Crown, ChevronDown, Globe, Smile, Tag, Link, Activity, Target, Package, Menu, X, Upload, Download, Trash2, History } from 'lucide-react';
import PersonalitySystem from './systems/character/PersonalitySystem';
import PersonalityTraitManager from './components/features/personality-system/components/PersonalityTraitManager.jsx';
import ConsciousnessSystem from './systems/character/ConsciousnessSystem';
import ConsciousnessManager from './components/features/consciousness-system/components/ConsciousnessManager.jsx';
import ConnectionSystem from './systems/node/ConnectionSystem';
import QuestSystem from './systems/quest/QuestSystem';
import ConnectionManager from './components/features/node-system/components/ConnectionManager.jsx';
import QuestManager from './components/features/quest-system/components/QuestManager.jsx';
import DataManager from './components/features/data-management/DataManager.jsx';
import PersonalityManager from './components/features/personality-system/PersonalityManager.jsx';
import WorldNodeCreator from './components/features/node-system/components/WorldNodeCreator.jsx';
import WorldNodeSystem from './systems/node/WorldNodeSystem.js';
import ItemManager from './components/features/item-system/components/ItemManager.jsx';
import ItemSystem from './systems/item/ItemSystem.js';
import { InfluenceManager } from './systems/interaction/InfluenceSystem';
import { PrestigeManager } from './systems/interaction/PrestigeSystem';
import { AlignmentManager } from './systems/interaction/AlignmentSystem';
import WorldHistorySimulator from './components/features/historical-simulation/HistoricalSimulator.jsx';
import WorldHistoryEngine from './WorldHistoryEngine.js';
import CharacterTypeManager from './components/features/character-system/CharacterTypeManager';
import { TemplateManager as TemplateSystem } from './systems/template';
import TemplateManager from './components/features/template-system/TemplateManager';

export const sidebarTabs = [
  {
    label: 'World & Nodes',
    key: 'worldNodes',
    items: [
      { key: 'worldNodes', label: 'World Nodes', icon: <Globe size={18} /> },
      { key: 'nodeTypes', label: 'Node Types', icon: <Tag size={18} /> },
    ],
  },
  {
    label: 'Characters',
    key: 'characters',
    items: [
      { key: 'characters', label: 'Character Types', icon: <Users size={18} /> },
      { key: 'personalities', label: 'Personality Types', icon: <Smile size={18} /> },
    ],
  },
  {
    label: 'Core',
    key: 'core',
    items: [
      { key: 'interactions', label: 'Interactions', icon: <Activity size={18} /> },
    ],
  },
  {
    label: 'Systems',
    key: 'systems',
    items: [
      { key: 'consciousness', label: 'Consciousness', icon: <Scale size={18} /> },
      { key: 'connections', label: 'Connections', icon: <Link size={18} /> },
    ],
  },
  {
    label: 'Content',
    key: 'content',
    items: [
      { key: 'quests', label: 'Quests', icon: <Package size={18} /> },
      { key: 'items', label: 'Items', icon: <Package size={18} /> },
    ],
  },
  {
    label: 'Templates',
    key: 'templates',
    items: [
      { key: 'templates', label: 'Template Manager', icon: <Package size={18} /> },
    ],
  },
  {
    label: 'Simulator',
    key: 'simulator',
    items: [
      { key: 'worldHistory', label: 'World History Simulator', icon: <History size={18} /> },
    ],
  },
];

function App() {
  const [activeTab, setActiveTab] = useState('interactions');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dataManager] = useState(new DataManager('interaction-manager-data'));
  const [nodeTypeSystem] = useState(new NodeTypeSystem());
  const [personalitySystem] = useState(new PersonalitySystem());
  const [consciousnessSystem] = useState(new ConsciousnessSystem());
  const [connectionSystem] = useState(new ConnectionSystem(nodeTypeSystem, personalitySystem, consciousnessSystem));
  const [questSystem] = useState(new QuestSystem(consciousnessSystem, connectionSystem));
  const [itemSystem] = useState(new ItemSystem());
  const [worldNodeSystem] = useState(new WorldNodeSystem(nodeTypeSystem, connectionSystem));
  const mainContentRef = useRef(null);

  // New system instances and their states
  const [influenceSystem] = useState(() => new InfluenceManager([]));
  const [influenceDomains, setInfluenceDomains] = useState([]);
  const [prestigeSystem] = useState(() => new PrestigeManager([]));
  const [prestigeTracks, setPrestigeTracks] = useState([]);
  const [alignmentSystem] = useState(() => new AlignmentManager([]));
  const [alignmentAxes, setAlignmentAxes] = useState([]);

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Sidebar section open/close state
  const [openSections, setOpenSections] = useState({
    core: true,
    worldNodes: false,
    systems: false,
    content: false
  });
  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Close mobile menu when changing tabs
  const handleSidebarTabClick = (tabKey) => {
    setActiveTab(tabKey);
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.sidebar-nav') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load data when component mounts
  useEffect(() => {
    const savedData = dataManager.loadData();
    if (savedData) {
      try {
        if (savedData.nodeTypes) {
          nodeTypeSystem.fromJSON(savedData.nodeTypes);
        }
        if (savedData.personalities) {
          personalitySystem.fromJSON(savedData.personalities);
        }
        if (savedData.consciousness) {
          consciousnessSystem.fromJSON(savedData.consciousness);
        }
        if (savedData.connections) {
          connectionSystem.fromJSON(savedData.connections);
        }
        if (savedData.quests) {
          questSystem.fromJSON(savedData.quests);
        }
        if (savedData.items) {
          itemSystem.fromJSON(savedData.items);
        }
        // Load new system data
        if (savedData.influenceDomains) {
          const domains = savedData.influenceDomains;
          setInfluenceDomains(domains);
          influenceSystem.domains = domains;
        }
        if (savedData.prestigeTracks) {
          const tracks = savedData.prestigeTracks;
          setPrestigeTracks(tracks);
          prestigeSystem.tracks = tracks;
        }
        if (savedData.alignmentAxes) {
          const axes = savedData.alignmentAxes;
          setAlignmentAxes(axes);
          alignmentSystem.axes = axes;
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, [dataManager, nodeTypeSystem, personalitySystem, consciousnessSystem, connectionSystem, questSystem, itemSystem, influenceSystem, prestigeSystem, alignmentSystem]);

  // Save data when any system changes
  useEffect(() => {
    const data = {
      nodeTypes: nodeTypeSystem.toJSON(),
      personalities: personalitySystem.toJSON(),
      consciousness: consciousnessSystem.toJSON(),
      connections: connectionSystem.toJSON(),
      quests: questSystem.toJSON(),
      items: itemSystem.toJSON(),
      influenceDomains: influenceSystem.domains,
      prestigeTracks: prestigeSystem.tracks,
      alignmentAxes: alignmentSystem.axes,
    };
    dataManager.saveData(data);
  }, [dataManager, nodeTypeSystem, personalitySystem, consciousnessSystem, connectionSystem, questSystem, itemSystem, influenceSystem, prestigeSystem, alignmentSystem]);

  const handleExport = () => {
    try {
      const data = {
        nodeTypes: nodeTypeSystem.toJSON(),
        personalities: personalitySystem.toJSON(),
        consciousness: consciousnessSystem.toJSON(),
        connections: connectionSystem.toJSON(),
        quests: questSystem.toJSON(),
        items: itemSystem.toJSON(),
        influenceDomains: influenceSystem.domains,
        prestigeTracks: prestigeSystem.tracks,
        alignmentAxes: alignmentSystem.axes,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'interaction-manager-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.nodeTypes) nodeTypeSystem.fromJSON(data.nodeTypes);
          if (data.personalities) personalitySystem.fromJSON(data.personalities);
          if (data.consciousness) consciousnessSystem.fromJSON(data.consciousness);
          if (data.connections) connectionSystem.fromJSON(data.connections);
          if (data.quests) questSystem.fromJSON(data.quests);
          if (data.items) itemSystem.fromJSON(data.items);
          if (data.influenceDomains) {
            setInfluenceDomains(data.influenceDomains);
            influenceSystem.domains = data.influenceDomains;
          }
          if (data.prestigeTracks) {
            setPrestigeTracks(data.prestigeTracks);
            prestigeSystem.tracks = data.prestigeTracks;
          }
          if (data.alignmentAxes) {
            setAlignmentAxes(data.alignmentAxes);
            alignmentSystem.axes = data.alignmentAxes;
          }
        } catch (error) {
          console.error('Error importing data:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      nodeTypeSystem.clear();
      personalitySystem.clear();
      consciousnessSystem.clear();
      connectionSystem.clear();
      questSystem.clear();
      itemSystem.clear();
      setInfluenceDomains([]);
      influenceSystem.domains = [];
      setPrestigeTracks([]);
      prestigeSystem.tracks = [];
      setAlignmentAxes([]);
      alignmentSystem.axes = [];
      dataManager.clearData();
    }
  };

  // Initialize systems
  const [templateSystem] = useState(() => new TemplateSystem());
  const [engine] = useState(() => new WorldHistoryEngine());

  // Initialize engine with template system
  useEffect(() => {
    engine.templateManager = templateSystem;
  }, [engine, templateSystem]);

  const [characterTypes, setCharacterTypes] = useState([]);

  // Load character types from localStorage on mount
  useEffect(() => {
    const savedCharacterTypes = localStorage.getItem('characterTypes');
    if (savedCharacterTypes) {
      setCharacterTypes(JSON.parse(savedCharacterTypes));
    }
  }, []);

  // Save character types to localStorage when they change
  useEffect(() => {
    localStorage.setItem('characterTypes', JSON.stringify(characterTypes));
  }, [characterTypes]);

  const sidebarConfig = [
    ...sidebarTabs,
    {
      title: 'Characters',
      items: [
        { id: 'personality-traits', label: 'Personality Traits', icon: 'users' },
        { id: 'cognitive-traits', label: 'Cognitive Traits', icon: 'brain' },
        { id: 'character-types', label: 'Character Types', icon: 'user' }
      ]
    },
  ];

  return (
    <div className={styles.appContainer}>
      <Header
        theme={theme}
        setTheme={setTheme}
        onExport={handleExport}
        onImport={handleImport}
        onClearData={handleClearData}
      />
      <div className={styles.appContent}>
        <Sidebar
          config={sidebarTabs}
          activeTab={activeTab}
          setActiveTab={handleSidebarTabClick}
          openSections={openSections}
          toggleSection={toggleSection}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          theme={theme}
          setTheme={setTheme}
        />
        <MainContent
          activeTab={activeTab}
          nodeTypeSystem={nodeTypeSystem}
          personalitySystem={personalitySystem}
          consciousnessSystem={consciousnessSystem}
          connectionSystem={connectionSystem}
          questSystem={questSystem}
          itemSystem={itemSystem}
          worldNodeSystem={worldNodeSystem}
          influenceSystem={influenceSystem}
          influenceDomains={influenceDomains}
          setInfluenceDomains={setInfluenceDomains}
          prestigeSystem={prestigeSystem}
          prestigeTracks={prestigeTracks}
          setPrestigeTracks={setPrestigeTracks}
          alignmentSystem={alignmentSystem}
          alignmentAxes={alignmentAxes}
          setAlignmentAxes={setAlignmentAxes}
          mainContentRef={mainContentRef}
          engine={engine}
          characterTypes={characterTypes}
          setCharacterTypes={setCharacterTypes}
        />
      </div>
    </div>
  );
}

export default App;