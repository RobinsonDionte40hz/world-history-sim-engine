/**
 * DocumentationPage - Comprehensive documentation hub
 * 
 * Structured documentation with search functionality,
 * organized sections, and mobile-friendly layout.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Code, Zap, Users, Settings, ArrowRight } from 'lucide-react';
import Navigation from '../UI/Navigation';

const DocumentationPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const documentationSections = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Getting Started",
      description: "Quick start guide, installation, and your first world tutorial.",
      articles: [
        { title: "Quick Start Guide", description: "Get up and running in 5 minutes" },
        { title: "Installation & Setup", description: "System requirements and installation process" },
        { title: "First World Tutorial", description: "Step-by-step guide to creating your first world" },
        { title: "Understanding the Interface", description: "Navigate the World Builder interface" }
      ],
      action: () => console.log('Navigate to Getting Started')
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User Guide",
      description: "Comprehensive guides for world building, character creation, and interaction design.",
      articles: [
        { title: "World Building Fundamentals", description: "Core concepts and best practices" },
        { title: "Character Creation Guide", description: "Creating complex, believable characters" },
        { title: "Interaction Design", description: "Building engaging character interactions" },
        { title: "Template System", description: "Using and creating templates" }
      ],
      action: () => console.log('Navigate to User Guide')
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "API Reference",
      description: "Complete API documentation for developers and advanced users.",
      articles: [
        { title: "Core APIs", description: "Essential API endpoints and methods" },
        { title: "Character System API", description: "Working with characters programmatically" },
        { title: "World Generation API", description: "Procedural world creation APIs" },
        { title: "Template API", description: "Template creation and management" }
      ],
      action: () => console.log('Navigate to API Reference')
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Advanced Topics",
      description: "Custom templates, scripting, performance optimization, and integration guides.",
      articles: [
        { title: "Custom Template Creation", description: "Building your own template systems" },
        { title: "Scripting & Automation", description: "Automating world building tasks" },
        { title: "Performance Optimization", description: "Optimizing large-scale simulations" },
        { title: "Integration Guide", description: "Integrating with external systems" }
      ],
      action: () => console.log('Navigate to Advanced Topics')
    }
  ];

  const quickLinks = [
    { title: "Character Attributes", description: "D&D attribute system guide" },
    { title: "Consciousness System", description: "Understanding NPC consciousness" },
    { title: "Template Gallery", description: "Pre-built templates and examples" },
    { title: "Troubleshooting", description: "Common issues and solutions" },
    { title: "FAQ", description: "Frequently asked questions" },
    { title: "Community", description: "Join our community forums" }
  ];

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.articles.some(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
    }}>
      <Navigation showSearch={true} />
      
      {/* Hero Section */}
      <section className="px-8 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Documentation
            <span style={{ 
              background: 'linear-gradient(to right, #818cf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Hub</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Everything you need to master the World History Simulation Engine, 
            from quick start guides to advanced integration techniques.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredSections.map((section, index) => (
              <div
                key={index}
                className="p-8 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 hover:border-indigo-500/50"
              >
                <div className="flex items-start gap-6">
                  <div className="text-indigo-400 flex-shrink-0">
                    {section.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {section.title}
                    </h3>
                    
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      {section.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {section.articles.map((article, articleIndex) => (
                        <div
                          key={articleIndex}
                          className="p-3 rounded border border-slate-600 bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer group"
                        >
                          <h4 className="text-white font-medium mb-1 group-hover:text-indigo-400 transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-slate-400 text-sm">
                            {article.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={section.action}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Explore Section
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-8 py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Quick Links
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group"
              >
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {link.title}
                </h3>
                <p className="text-slate-300 text-sm">
                  {link.description}
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
            Need More Help?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Can't find what you're looking for? Check out our examples or start building to learn by doing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/examples')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              View Examples
            </button>
            
            <button
              onClick={() => navigate('/builder')}
              className="px-8 py-4 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-lg transition-colors"
            >
              Start Building
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentationPage;