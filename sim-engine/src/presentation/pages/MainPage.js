// src/presentation/pages/MainPage.js

import React from 'react';
import SimulationControl from '../components/features/SimulationControl.js';
import HistoryTimeline from '../components/features/HistoryTimeline.js';
import NpcViewer from '../components/features/NpcViewer.js';
import WorldMap from '../components/features/WorldMap.js';
import { useSimulationContext } from '../contexts/SimulationContext.js';

const MainPage = () => {
  const { worldState } = useSimulationContext();
  const selectedNpc = worldState?.npcs[0];  // Example selection

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">World History Simulation Engine</h1>
      <SimulationControl />
      <div className="grid grid-cols-2 gap-4">
        <WorldMap />
        <NpcViewer npc={selectedNpc} />
      </div>
      <HistoryTimeline />
    </div>
  );
};

export default MainPage;