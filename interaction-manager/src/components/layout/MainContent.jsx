import React from 'react';
import styles from './MainContent.module.css';
import InteractionManager from '../../InteractionManager.js';
import NodeTypeCreator from '../features/node-system/components/NodeTypeCreator.jsx';
import PersonalityTraitManager from '../features/personality-system/components/PersonalityTraitManager.jsx';
import ConsciousnessManager from '../features/consciousness-system/components/ConsciousnessManager.jsx';
import ConnectionManager from '../features/node-system/components/ConnectionManager.jsx';
import QuestManager from '../features/quest-system/components/QuestManager.jsx';
import PersonalityManager from '../features/personality-system/PersonalityManager.jsx';
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
  engine
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
          />
        );
      case 'characters':
        return (
          <InteractionManager
            initialTab="characters"
            influenceSystem={influenceSystem}
            influenceDomains={influenceDomains}
            setInfluenceDomains={setInfluenceDomains}
            prestigeSystem={prestigeSystem}
            prestigeTracks={prestigeTracks}
            setPrestigeTracks={setPrestigeTracks}
            alignmentSystem={alignmentSystem}
            alignmentAxes={alignmentAxes}
            setAlignmentAxes={setAlignmentAxes}
          />
        );
      case 'nodeTypes':
        return <NodeTypeCreator system={nodeTypeSystem} />;
      case 'personalities':
        return <PersonalityTraitManager system={personalitySystem} />;
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
      case 'templates':
        return <TemplateManager engine={engine} />;
      case 'influence':
        return (
          <>
            <InfluenceManager system={influenceSystem} />
            <InfluenceManager
              domains={influenceDomains}
              setDomains={setInfluenceDomains}
            />
          </>
        );
      case 'prestige':
        return (
          <>
            <PrestigeManager system={prestigeSystem} />
            <PrestigeManager
              tracks={prestigeTracks}
              setTracks={setPrestigeTracks}
            />
          </>
        );
      case 'alignment':
        return (
          <>
            <AlignmentManager system={alignmentSystem} />
            <AlignmentManager
              axes={alignmentAxes}
              setAxes={setAlignmentAxes}
            />
          </>
        );
      case 'worldHistory':
        return <WorldHistorySimulator />;
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