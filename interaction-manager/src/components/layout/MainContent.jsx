import React from 'react';
import styles from './MainContent.module.css';
import InteractionManager from '../features/interaction-management/InteractionManager.jsx';
import NodeTypeCreator from '../features/node-system/components/NodeTypeCreator.jsx';
import PersonalityTraitManager from '../features/personality-system/components/PersonalityTraitManager.jsx';
import ConsciousnessManager from '../features/consciousness-system/components/ConsciousnessManager.jsx';
import ConnectionManager from '../features/node-system/components/ConnectionManager.jsx';
import QuestManager from '../features/quest-system/components/QuestManager.jsx';
import CharacterTypeManager from '../features/character-system/CharacterTypeManager.jsx';
import WorldNodeCreator from '../features/node-system/components/WorldNodeCreator.jsx';
import ItemManager from '../features/item-system/components/ItemManager.jsx';
import { InfluenceManager } from '../../systems/interaction/InfluenceSystem.js';
import { PrestigeManager } from '../../systems/interaction/PrestigeSystem.js';
import { AlignmentManager } from '../../systems/interaction/AlignmentSystem.js';
import TemplateManager from '../features/template-system/TemplateManager.jsx';
import WorldHistorySimulator from '../features/historical-simulation/HistoricalSimulator.jsx';

const MainContent = ({ 
  activeTab,
  nodeTypeSystem,
  personalitySystem,
  consciousnessSystem,
  connectionSystem,
  questSystem,
  itemSystem,
  worldNodeSystem,
  influenceSystem,
  influenceDomains,
  setInfluenceDomains,
  prestigeSystem,
  prestigeTracks,
  setPrestigeTracks,
  alignmentSystem,
  alignmentAxes,
  setAlignmentAxes,
  mainContentRef,
  engine,
  characterTypes,
  setCharacterTypes
}) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'interactions':
        return (
          <InteractionManager
            influenceSystem={influenceSystem}
            influenceDomains={influenceDomains}
            setInfluenceDomains={setInfluenceDomains}
            prestigeSystem={prestigeSystem}
            prestigeTracks={prestigeTracks}
            setPrestigeTracks={setPrestigeTracks}
            alignmentSystem={alignmentSystem}
            alignmentAxes={alignmentAxes}
            setAlignmentAxes={setAlignmentAxes}
            personalitySystem={personalitySystem}
          />
        );
      case 'characters':
        return (
          <CharacterTypeManager
            personalitySystem={personalitySystem}
            characterTypes={characterTypes}
            setCharacterTypes={setCharacterTypes}
          />
        );
      case 'nodeTypes':
        return <NodeTypeCreator nodeTypeSystem={nodeTypeSystem} />;
      case 'personalities':
        return <PersonalityTraitManager personalitySystem={personalitySystem} />;
      case 'consciousness':
        return <ConsciousnessManager system={consciousnessSystem} />;
      case 'connections':
        return <ConnectionManager system={connectionSystem} />;
      case 'quests':
        return <QuestManager system={questSystem} />;
      case 'worldNodes':
        return <WorldNodeCreator 
          worldNodeSystem={worldNodeSystem}
          nodeTypeSystem={nodeTypeSystem}
          connectionSystem={connectionSystem}
        />;
      case 'items':
        return <ItemManager itemSystem={itemSystem} />;
      case 'worldHistory':
        return <WorldHistorySimulator />;
      case 'templates':
        return <TemplateManager engine={engine} />;
      default:
        return <div>Select a tab to begin</div>;
    }
  };

  return (
    <main className={styles.mainContent} ref={mainContentRef}>
      {renderContent()}
    </main>
  );
};

export default MainContent; 