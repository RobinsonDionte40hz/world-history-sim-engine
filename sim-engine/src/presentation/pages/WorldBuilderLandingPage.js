/**
 * WorldBuilderLandingPage - Welcome landing page for world building
 * 
 * Provides a welcoming entry point to the world builder with a single
 * prominent "Create World" button, moving away from the rigid 6-step process.
 */

import React from 'react';
import { Globe, Sparkles, Users, Map } from 'lucide-react';

const WorldBuilderLandingPage = ({ onCreateWorld }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 rounded-2xl shadow-xl">
                <Globe className="w-20 h-20 md:w-24 md:h-24 text-blue-600 dark:text-blue-400" />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl -z-10"></div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              World History
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Simulation Engine
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
            Professional-Grade Procedural World Generation
          </p>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-5xl mx-auto leading-relaxed">
            Create sophisticated worlds with emergent storytelling, consciousness-driven NPCs, 
            and complex historical simulation. Built for game developers, writers, educators, and researchers.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 group">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                <Map className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Flexible Design
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Create nodes, characters, and interactions in any order. No forced progression or rigid workflows.
            </p>
          </div>

          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 group">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Rich Characters
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Design complex characters with D&D-style attributes, consciousness, and unique capabilities.
            </p>
          </div>

          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 group">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 transition-colors">
                <Sparkles className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Template System
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Save any creation as a reusable template or add it directly to your world. Maximum flexibility.
            </p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <button
              onClick={onCreateWorld}
              className="relative inline-flex items-center px-10 md:px-14 py-4 md:py-5 text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 group"
            >
              <Globe className="w-6 h-6 md:w-7 md:h-7 mr-4 group-hover:animate-spin transition-transform duration-500" />
              Create World
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
          
          <p className="mt-6 text-base text-gray-500 dark:text-gray-400 font-medium">
            Start building your world with complete creative freedom
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            No account required • Save locally • Export when ready
          </p>
        </div>

        {/* Additional info */}
        <div className="text-center">
          <div className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full border border-blue-200 dark:border-blue-700 shadow-sm">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <span className="text-sm md:text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              No restrictions • Create at your own pace • Save everything as templates
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldBuilderLandingPage;
