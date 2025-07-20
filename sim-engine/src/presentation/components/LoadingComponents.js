/**
 * Loading Components - Spinners, progress bars, and loading states
 * 
 * Provides various loading indicators for different use cases:
 * - LoadingSpinner for general loading states
 * - ProgressBar for progress indication
 * - Skeleton loaders for content placeholders
 * - Loading overlays for full-screen loading
 */

import React from 'react';
import { Loader2, RefreshCw, Circle } from 'lucide-react';

// Main Loading Spinner Component
export const LoadingSpinner = ({
  size = 'medium',
  variant = 'default',
  message,
  className = '',
  color = 'text-indigo-400'
}) => {
  // Size configurations
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  // Variant configurations
  const variants = {
    default: Loader2,
    refresh: RefreshCw,
    dots: Circle
  };

  const SpinnerIcon = variants[variant];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <SpinnerIcon 
        className={`${sizes[size]} ${color} animate-spin`}
      />
      {message && (
        <p className="mt-2 text-sm text-gray-400 text-center">
          {message}
        </p>
      )}
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'medium',
  variant = 'default',
  showLabel = false,
  label,
  className = '',
  animated = false
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Size configurations
  const sizes = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
    xlarge: 'h-4'
  };

  // Variant configurations
  const variants = {
    default: 'bg-indigo-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
    gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${sizes[size]} ${variants[variant]} transition-all duration-300 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular Progress Component
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 'medium',
  strokeWidth = 4,
  variant = 'default',
  showLabel = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Size configurations
  const sizes = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 },
    xlarge: { width: 96, height: 96 }
  };

  const { width, height } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Variant colors
  const variants = {
    default: 'stroke-indigo-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-600',
    danger: 'stroke-red-600'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={width}
        height={height}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${variants[variant]} transition-all duration-300 ease-out`}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Skeleton Loader Component
export const SkeletonLoader = ({
  lines = 3,
  className = '',
  animated = true
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-700 rounded ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
        />
      ))}
    </div>
  );
};

// Card Skeleton for loading cards
export const CardSkeleton = ({
  showAvatar = false,
  lines = 3,
  className = '',
  animated = true
}) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className={`w-12 h-12 bg-gray-700 rounded-full ${animated ? 'animate-pulse' : ''}`} />
        )}
        <div className="flex-1 space-y-3">
          <div className={`h-5 bg-gray-700 rounded w-3/4 ${animated ? 'animate-pulse' : ''}`} />
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={`h-4 bg-gray-700 rounded ${animated ? 'animate-pulse' : ''}`}
                style={{
                  width: `${Math.random() * 30 + 50}%`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay Component
export const LoadingOverlay = ({
  visible = false,
  message = 'Loading...',
  backdrop = true,
  className = ''
}) => {
  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {backdrop && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="large" message={message} />
      </div>
    </div>
  );
};

// Inline Loading Component
export const InlineLoading = ({
  size = 'small',
  message,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      {message && (
        <span className="text-sm text-gray-400">{message}</span>
      )}
    </div>
  );
};

// Loading Button State
export const LoadingButton = ({
  loading = false,
  children,
  loadingText = 'Loading...',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${props.className} ${loading ? 'cursor-wait' : ''}`}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Dots Loading Animation
export const DotsLoading = ({
  size = 'medium',
  color = 'bg-indigo-400',
  className = ''
}) => {
  const sizes = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizes[size]} ${color} rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;