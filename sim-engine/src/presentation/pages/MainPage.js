/**
 * MainPage - Unified landing page and simulation interface
 * 
 * Combines the landing page experience with the simulation interface.
 * Shows the landing page when no world exists, and simulation when world is complete.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, Users, Layers, Sparkles } from 'lucide-react';
import ConditionalSimulationInterface from '../components/ConditionalSimulationInterface.js';
import { useSimulationContext } from '../contexts/SimulationContext.js';
import Navigation from '../UI/Navigation';

const MainPage = () => {
  const navigate = useNavigate();
  const {
    templateManager,
    worldBuilder,
    simulation
  } = useSimulationContext();

  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([false, false, false]);
  const [heroButtonVisible, setHeroButtonVisible] = useState(false);

  // Animation effects for landing page
  useEffect(() => {
    // Only show animations if no world exists (landing page mode)
    if (!worldBuilder?.isWorldComplete) {
      const timer1 = setTimeout(() => setWelcomeVisible(true), 500);
      const timer2 = setTimeout(() => setSubtitleVisible(true), 1000);
      const timer3 = setTimeout(() => setHeroButtonVisible(true), 1500);
      const timer4 = setTimeout(() => {
        setCardsVisible([true, false, false]);
        setTimeout(() => setCardsVisible([true, true, false]), 200);
        setTimeout(() => setCardsVisible([true, true, true]), 400);
      }, 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [worldBuilder?.isWorldComplete]);

  // Handle world creation
  const handleCreateWorld = () => {
    navigate('/builder');
  };

  // Handle world completion and transition to simulation
  const handleWorldComplete = useCallback(async (worldState) => {
    try {
      console.log('MainPage: World building completed, transitioning to simulation');
      console.log('MainPage: World state:', worldState);
      
      // The simulation hook will automatically initialize when worldBuilder.isWorldComplete becomes true
      // No manual initialization needed here as it's handled by the context
      
    } catch (error) {
      console.error('MainPage: Error handling world completion:', error);
      throw error;
    }
  }, []);

  // Show landing page if no world exists or world building is not complete
  if (!worldBuilder?.isWorldComplete) {
    return (
      <>
        {/* Landing page content */}
        <div className="min-h-screen" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Navigation />
          
          {/* Hero Section */}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className={`text-6xl md:text-8xl font-bold mb-6 transition-all duration-1000 ${
                welcomeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                Welcome to
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  World History Sim
                </span>
              </h1>
              
              <p className={`text-xl md:text-2xl mb-12 opacity-80 transition-all duration-1000 delay-500 ${
                subtitleVisible ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-5'
              }`}>
                Create immersive historical worlds and watch civilizations unfold
              </p>

              <div className={`transition-all duration-1000 delay-1000 ${
                heroButtonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}>
                <button
                  onClick={handleCreateWorld}
                  className="group relative px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white font-bold text-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:from-emerald-400 hover:to-teal-500"
                >
                  <span className="flex items-center gap-3">
                    <Globe className="w-6 h-6" />
                    Create Your World
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
              {[
                {
                  icon: Users,
                  title: "Dynamic Characters",
                  description: "Create rich characters with relationships and motivations"
                },
                {
                  icon: Layers,
                  title: "Layered History",
                  description: "Build complex historical events that shape your world"
                },
                {
                  icon: Sparkles,
                  title: "Living Simulation",
                  description: "Watch your world evolve with emergent storytelling"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transition-all duration-700 delay-${2000 + index * 200} ${
                    cardsVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="opacity-80">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show simulation interface if world is complete
  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <ConditionalSimulationInterface
        worldBuilderState={worldBuilder}
        simulationState={simulation}
        onWorldComplete={handleWorldComplete}
        templateManager={templateManager}
      />
    </div>
  );
};

export default MainPage;