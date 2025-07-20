/**
 * FeaturesPage - Comprehensive features showcase
 * 
 * Displays detailed information about all system capabilities
 * with interactive demos and visual examples.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe, BookOpen, Zap, Brain, History, Settings, Code } from 'lucide-react';
import Navigation from '../UI/Navigation';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: <Users className="w-12 h-12" />,
      title: "Advanced Character System",
      description: "NPCs with D&D attributes, consciousness simulation, and complex personality traits that drive authentic behavior.",
      details: [
        "D&D-style attribute system (STR, DEX, CON, INT, WIS, CHA)",
        "Consciousness frequency and coherence mechanics",
        "Dynamic personality trait evolution",
        "Memory and relationship systems",
        "Goal-driven autonomous behavior"
      ],
      action: () => navigate('/editors/characters')
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Dynamic World Generation",
      description: "Create living worlds with settlements that grow, civilizations that rise and fall, and emergent historical events.",
      details: [
        "Procedural settlement generation and evolution",
        "Resource-based economic systems",
        "Political dynamics and diplomacy",
        "Natural disaster and event simulation",
        "Cultural development and spread"
      ],
      action: () => navigate('/editors/nodes')
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Emergent Storytelling",
      description: "Watch as characters create their own stories through interactions, relationships, and historical events.",
      details: [
        "Branching narrative generation",
        "Character-driven plot development",
        "Historical event chains",
        "Relationship-based story arcs",
        "Cultural and political narratives"
      ],
      action: () => navigate('/editors/interactions')
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Flexible Template System",
      description: "Rapid content creation with reusable templates for characters, locations, and interactions.",
      details: [
        "Character archetype templates",
        "Location and settlement templates",
        "Interaction and event templates",
        "Scenario and campaign templates",
        "Custom template creation tools"
      ],
      action: () => navigate('/builder')
    }
  ];

  const technicalFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Consciousness Simulation",
      description: "Quantum-inspired consciousness modeling with frequency and coherence calculations for realistic NPC behavior."
    },
    {
      icon: <History className="w-8 h-8" />,
      title: "Historical Tracking",
      description: "Comprehensive historical records with timeline visualization and relationship mapping."
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Modular Architecture",
      description: "Clean architecture with domain-driven design for extensibility and maintainability."
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Developer-Friendly",
      description: "Comprehensive APIs, documentation, and integration points for custom development."
    }
  ];

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
    }}>
      <Navigation />
      
      {/* Hero Section */}
      <section className="px-8 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span style={{ 
              background: 'linear-gradient(to right, #818cf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Dynamic Worlds</span>
          </h1>
          
          <p className="text-xl text-slate-300 leading-relaxed">
            Explore the comprehensive feature set that makes the World History Simulation Engine 
            the most advanced platform for creating dynamic, character-driven historical worlds.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 hover:border-indigo-500/50"
              >
                <div className="flex items-start gap-6">
                  <div className="text-indigo-400 flex-shrink-0">
                    {feature.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <ul className="space-y-2 mb-6">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2 text-slate-400">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={feature.action}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Explore Feature
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="px-8 py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Technical Excellence
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300"
              >
                <div className="text-indigo-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-8 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Start building your world today or explore our comprehensive documentation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/builder')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              Start Building
            </button>
            
            <button
              onClick={() => navigate('/docs')}
              className="px-8 py-4 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-lg transition-colors"
            >
              View Documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;