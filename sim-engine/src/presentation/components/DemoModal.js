// src/presentation/components/DemoModal.js

import React, { useState } from 'react';
import { X, Play, Clock, Star, Globe, Rocket, Ship } from 'lucide-react';
import DemoService from '../../application/services/DemoService';

/**
 * DemoModal - Modal for selecting and launching demo worlds
 */
const DemoModal = ({ isOpen, onClose, onSelectDemo }) => {
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const demoWorlds = DemoService.getDemoWorlds();

  const getDemoIcon = (category) => {
    switch (category) {
      case 'fantasy':
        return <Globe className="w-6 h-6" />;
      case 'sci-fi':
        return <Rocket className="w-6 h-6" />;
      case 'historical':
        return <Ship className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const handleSelectDemo = async (demoId) => {
    setIsLoading(true);
    try {
      const demoWorld = DemoService.generateDemoWorld(demoId);
      onSelectDemo(demoWorld);
      onClose();
    } catch (error) {
      console.error('Error loading demo world:', error);
      // Handle error - maybe show toast notification
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Explore Demo Worlds
            </h2>
            <p className="text-gray-300">
              Jump into pre-built worlds and experience the simulation engine in action
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Demo World Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoWorlds.map((demo) => (
            <div
              key={demo.id}
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedDemo === demo.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedDemo(demo.id)}
            >
              <div
                className="bg-gray-800 rounded-lg p-6 h-full border border-gray-700 hover:border-gray-600"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}
              >
                {/* Demo Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4 mx-auto"
                     style={{
                       background: demo.category === 'fantasy' 
                         ? 'linear-gradient(135deg, #10b981, #34d399)'
                         : demo.category === 'sci-fi'
                         ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                         : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                       color: 'white'
                     }}>
                  {getDemoIcon(demo.category)}
                </div>

                {/* Demo Info */}
                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                  {demo.name}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 text-center leading-relaxed">
                  {demo.description}
                </p>

                {/* Estimated Time */}
                <div className="flex items-center justify-center gap-1 mb-4 text-gray-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{demo.estimatedTime}</span>
                </div>

                {/* Features */}
                <div className="space-y-1 mb-4">
                  {demo.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                  {demo.features.length > 3 && (
                    <div className="text-xs text-gray-400 text-center">
                      +{demo.features.length - 3} more features
                    </div>
                  )}
                </div>

                {/* Launch Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDemo(demo.id);
                  }}
                  disabled={isLoading}
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: demo.category === 'fantasy' 
                      ? 'linear-gradient(135deg, #10b981, #34d399)'
                      : demo.category === 'sci-fi'
                      ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                      : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    color: 'white'
                  }}
                >
                  {isLoading && selectedDemo === demo.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Launch Demo
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              Demo worlds are pre-configured for immediate exploration
            </p>
            <p className="flex items-center justify-center gap-1">
              <span>Want to build your own?</span>
              <button 
                onClick={onClose}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Use the World Builder
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoModal;