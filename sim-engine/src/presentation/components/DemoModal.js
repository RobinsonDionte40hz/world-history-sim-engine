// src/presentation/components/DemoModal.js

import React, { useState } from 'react';
import { X, Play, Clock, Star, Globe, Rocket, Ship, Edit } from 'lucide-react';
import DemoService from '../../application/services/DemoService';

/**
 * DemoModal - Modal for selecting and launching demo worlds
 * Now supports both importing as editable worlds and direct simulation
 */
const DemoModal = ({ isOpen, onClose, onSelectDemo, onImportDemo }) => {
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

  const handleImportDemo = async (demoId) => {
    setIsLoading(true);
    try {
      const demoWorld = DemoService.generateDemoWorldForImport(demoId);
      const demoInfo = demoWorlds.find(d => d.id === demoId);
      onImportDemo(demoWorld, demoInfo);
      onClose();
    } catch (error) {
      console.error('Error importing demo world:', error);
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
              Demo Worlds
            </h2>
            <p className="text-gray-300">
              Select a demo world from the list to view details and launch options
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Demo World Tabs */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab List */}
          <div className="lg:w-1/3">
            <div className="space-y-2">
              {demoWorlds.map((demo) => (
                <div
                  key={demo.id}
                  onClick={() => setSelectedDemo(demo.id)}
                  className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                    selectedDemo === demo.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                  }`}
                  style={{
                    background: selectedDemo === demo.id
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Demo Icon */}
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0"
                      style={{
                        background: demo.category === 'fantasy'
                          ? 'linear-gradient(135deg, #10b981, #34d399)'
                          : demo.category === 'sci-fi'
                          ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                          : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        color: 'white'
                      }}
                    >
                      {getDemoIcon(demo.category)}
                    </div>

                    {/* Demo Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {demo.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {demo.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{demo.estimatedTime}</span>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {selectedDemo === demo.id && (
                      <div className="w-2 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:w-2/3">
            {selectedDemo ? (
              <div
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {(() => {
                  const demo = demoWorlds.find(d => d.id === selectedDemo);
                  return (
                    <>
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-6">
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                          style={{
                            background: demo.category === 'fantasy'
                              ? 'linear-gradient(135deg, #10b981, #34d399)'
                              : demo.category === 'sci-fi'
                              ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                              : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                            color: 'white'
                          }}
                        >
                          {getDemoIcon(demo.category)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {demo.name}
                          </h3>
                          <p className="text-gray-300 mb-4 leading-relaxed">
                            {demo.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{demo.estimatedTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              <span className="capitalize">{demo.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-3">Features</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {demo.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Import as Editable World Button */}
                        <button
                          onClick={() => handleImportDemo(demo.id)}
                          disabled={isLoading}
                          className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <Edit className="w-4 h-4" />
                              Import & Edit
                            </>
                          )}
                        </button>

                        {/* Direct Launch Button */}
                        <button
                          onClick={() => handleSelectDemo(demo.id)}
                          disabled={isLoading}
                          className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          style={{
                            background: demo.category === 'fantasy'
                              ? 'linear-gradient(135deg, #10b981, #34d399)'
                              : demo.category === 'sci-fi'
                              ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                              : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                            color: 'white'
                          }}
                        >
                          {isLoading ? (
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
                    </>
                  );
                })()}
              </div>
            ) : (
              <div
                className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="text-gray-400 mb-4">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Demo World</h3>
                  <p>Choose a demo from the list to view details and launch options</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              <strong className="text-white">Import & Edit:</strong> Save as your own world to customize and modify
            </p>
            <p className="mb-4">
              <strong className="text-white">Launch Demo:</strong> Jump straight into simulation with the pre-built world
            </p>
            <p className="flex items-center justify-center gap-1">
              <span>Want to start from scratch?</span>
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