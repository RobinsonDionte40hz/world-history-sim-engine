/**
 * ExamplesPage - Examples gallery and template showcase
 * 
 * Displays practical examples with filtering, detailed descriptions,
 * and template import functionality.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, Filter, Star, Users, Globe, BookOpen, Zap } from 'lucide-react';
import Navigation from '../UI/Navigation';

const ExamplesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Examples', icon: <Globe className="w-4 h-4" /> },
    { id: 'fantasy', label: 'Fantasy', icon: <Zap className="w-4 h-4" /> },
    { id: 'historical', label: 'Historical', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'educational', label: 'Educational', icon: <Users className="w-4 h-4" /> },
    { id: 'game-dev', label: 'Game Development', icon: <Star className="w-4 h-4" /> }
  ];

  const examples = [
    {
      id: 1,
      title: "Medieval Kingdom Simulator",
      category: "fantasy",
      description: "A comprehensive medieval fantasy world with kingdoms, nobles, peasants, and complex political dynamics.",
      features: ["50+ Character Templates", "Political System", "Economic Simulation", "War & Diplomacy"],
      difficulty: "Advanced",
      rating: 4.8,
      downloads: 1250,
      image: "/api/placeholder/400/250",
      tags: ["Medieval", "Politics", "Economics", "War"]
    },
    {
      id: 2,
      title: "Ancient Rome Civilization",
      category: "historical",
      description: "Historically accurate simulation of Ancient Rome with senators, citizens, slaves, and gladiators.",
      features: ["Historical Accuracy", "Social Classes", "Senate Politics", "Gladiator Games"],
      difficulty: "Intermediate",
      rating: 4.6,
      downloads: 890,
      image: "/api/placeholder/400/250",
      tags: ["Rome", "History", "Politics", "Social"]
    },
    {
      id: 3,
      title: "High School Social Dynamics",
      category: "educational",
      description: "Educational simulation exploring social dynamics, peer pressure, and decision-making in a school setting.",
      features: ["Social Psychology", "Peer Relationships", "Academic Pressure", "Character Development"],
      difficulty: "Beginner",
      rating: 4.4,
      downloads: 650,
      image: "/api/placeholder/400/250",
      tags: ["Education", "Psychology", "Social", "Youth"]
    },
    {
      id: 4,
      title: "Cyberpunk City 2087",
      category: "game-dev",
      description: "Futuristic cyberpunk world with corporations, hackers, and underground resistance movements.",
      features: ["Cyberpunk Aesthetic", "Corporate Intrigue", "Hacker Culture", "Dystopian Society"],
      difficulty: "Advanced",
      rating: 4.9,
      downloads: 2100,
      image: "/api/placeholder/400/250",
      tags: ["Cyberpunk", "Future", "Technology", "Corporations"]
    },
    {
      id: 5,
      title: "Viking Age Settlement",
      category: "historical",
      description: "Norse settlement simulation with raiders, traders, and exploration of new lands.",
      features: ["Viking Culture", "Raiding Mechanics", "Trade Routes", "Exploration"],
      difficulty: "Intermediate",
      rating: 4.5,
      downloads: 780,
      image: "/api/placeholder/400/250",
      tags: ["Vikings", "Norse", "Exploration", "Trade"]
    },
    {
      id: 6,
      title: "Magical Academy",
      category: "fantasy",
      description: "Wizarding school with students, professors, magical creatures, and academic competitions.",
      features: ["Magic System", "Student Life", "Academic Competition", "Magical Creatures"],
      difficulty: "Beginner",
      rating: 4.3,
      downloads: 1450,
      image: "/api/placeholder/400/250",
      tags: ["Magic", "School", "Students", "Fantasy"]
    }
  ];

  const filteredExamples = selectedCategory === 'all' 
    ? examples 
    : examples.filter(example => example.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'Advanced': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
    }}>
      <Navigation />
      
      {/* Hero Section */}
      <section className="px-8 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Example
            <span style={{ 
              background: 'linear-gradient(to right, #818cf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Gallery</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Explore practical examples and ready-to-use templates that showcase 
            the full potential of the World History Simulation Engine.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white border border-indigo-500'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-600 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExamples.map((example) => (
              <div
                key={example.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 hover:border-indigo-500/50 overflow-hidden"
              >
                {/* Example Image */}
                <div className="h-48 bg-slate-700 flex items-center justify-center">
                  <Globe className="w-16 h-16 text-slate-500" />
                </div>
                
                {/* Example Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">
                      {example.title}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{example.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    {example.description}
                  </p>
                  
                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {example.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-1 text-slate-400 text-xs">
                          <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {example.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(example.difficulty)}`}>
                      {example.difficulty}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {example.downloads} downloads
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors">
                      <Download className="w-4 h-4" />
                      Import
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-medium rounded transition-colors">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-8 py-16 bg-slate-900/50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Create Your Own?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Use these examples as inspiration or starting points for your own unique worlds.
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
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExamplesPage;