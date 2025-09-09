/**
 * TimelineTooltip Component
 * 
 * Interactive tooltip for displaying detailed event information
 * on timeline hover with rich metadata and formatting
 */

import React, { forwardRef } from 'react';
import { Clock, User, MapPin, Star, TrendingUp, TrendingDown } from 'lucide-react';

const TimelineTooltip = forwardRef(({ event, visible }, ref) => {
  if (!visible || !event) {
    return (
      <div 
        ref={ref} 
        className="pointer-events-none z-50 transition-opacity duration-150 ease-in-out hidden"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    );
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOutcomeIcon = (outcome) => {
    switch (outcome) {
      case 'positive':
        return <TrendingUp size={14} className="text-green-500" />;
      case 'negative':
        return <TrendingDown size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getSignificanceColor = (significance) => {
    if (significance >= 0.8) return 'text-red-500';
    if (significance >= 0.6) return 'text-orange-500';
    if (significance >= 0.4) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const renderStars = (significance) => {
    const stars = Math.ceil(significance * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={12} 
        className={i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
      />
    ));
  };

  return (
    <div 
      ref={ref} 
      className="pointer-events-none z-50 transition-opacity duration-150 ease-in-out"
      style={{ 
        position: 'absolute',
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      <div className="bg-white rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-2px_rgba(0,0,0,0.05)] border border-gray-200 max-w-96 backdrop-blur-[10px] dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200">
        {/* Header */}
        <div className="border-b border-gray-100 pb-2 mb-2 p-4 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 text-sm dark:text-gray-100">
              {event.interactionName || event.type || 'Event'}
            </h4>
            <div className="flex items-center gap-1">
              {getOutcomeIcon(event.outcome)}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {renderStars(event.significance || 0)}
            </div>
            <span className={`text-xs ${getSignificanceColor(event.significance || 0)}`}>
              {((event.significance || 0) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="px-4">
          {/* Timestamp */}
          <div className="py-1 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock size={14} />
              {formatTimestamp(event.timestamp)}
            </div>
          </div>

          {/* Character Information */}
          {event.characterName && (
            <div className="py-1 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-blue-500" />
                <span className="font-medium">{event.characterName}</span>
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && event.location !== 'Unknown' && (
            <div className="py-1 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin size={14} />
                {event.location}
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="py-1 mb-3">
              <p className="text-sm text-gray-700 leading-relaxed dark:text-gray-300">
                {event.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 border-t border-gray-100 mb-3 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
              {event.roll !== undefined && (
                <div>
                  <span className="font-medium">Roll:</span> {event.roll}
                </div>
              )}
              {event.dc !== undefined && (
                <div>
                  <span className="font-medium">DC:</span> {event.dc}
                </div>
              )}
              {event.type && (
                <div>
                  <span className="font-medium">Type:</span> {event.type}
                </div>
              )}
              {event.severity && (
                <div>
                  <span className="font-medium">Severity:</span> {event.severity}
                </div>
              )}
            </div>
          </div>

          {/* Settlement specific data */}
          {event.settlementName && (
            <div className="py-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Settlement:</span>
                <span className="ml-1">{event.settlementName}</span>
              </div>
              {event.metadata?.population && (
                <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  Population: {event.metadata.population.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Need satisfaction data */}
          {event.type === 'need_satisfaction' && event.currentLevel !== undefined && (
            <div className="py-1 mt-3 pt-3 border-t border-gray-100 mb-4 dark:border-gray-600">
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {event.subtype} Satisfaction:
                </span>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                    <div 
                      className={`h-2 rounded-full ${
                        event.currentLevel >= 0.7 ? 'bg-green-500' :
                        event.currentLevel >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(event.currentLevel || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {((event.currentLevel || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Arrow pointer */}
        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45 drop-shadow-[0_-1px_1px_rgba(0,0,0,0.1)] dark:bg-gray-700 dark:border-gray-500" />
      </div>
    </div>
  );
});

TimelineTooltip.displayName = 'TimelineTooltip';

export default TimelineTooltip;
