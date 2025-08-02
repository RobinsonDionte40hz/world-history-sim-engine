/**
 * Card Component - Consistent content containers with various layouts
 * 
 * Provides flexible card layouts with headers, content, and footer areas.
 * Supports different variants, hover effects, and responsive design.
 * Includes specialized card types for different use cases.
 */

import React from 'react';
import { ChevronRight, MoreVertical } from 'lucide-react';

// Base Card Component
const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'p-6',
  hover = false,
  border = true,
  shadow = true,
  rounded = 'rounded-lg',
  background = 'bg-gray-800',
  onClick,
  ...props
}) => {
  // Variant styles
  const variants = {
    default: 'border-gray-700',
    primary: 'border-indigo-500/30 bg-indigo-900/20',
    secondary: 'border-gray-600',
    success: 'border-green-500/30 bg-green-900/20',
    warning: 'border-yellow-500/30 bg-yellow-900/20',
    danger: 'border-red-500/30 bg-red-900/20',
    ghost: 'border-transparent bg-transparent'
  };

  // Interactive styles
  const interactiveStyles = onClick || hover ? `
    cursor-pointer transition-all duration-200
    hover:bg-gray-700/50 hover:border-gray-600
    hover:shadow-lg hover:shadow-black/20
    active:scale-[0.98]
  ` : '';

  // Combine styles
  const cardClasses = `
    ${background}
    ${border ? `border ${variants[variant]}` : ''}
    ${shadow ? 'shadow-md shadow-black/10' : ''}
    ${rounded}
    ${padding}
    ${interactiveStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const CardComponent = onClick ? 'button' : 'div';

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Card Header Component
export const CardHeader = ({
  children,
  title,
  subtitle,
  action,
  className = ''
}) => {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-white mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-400">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

// Card Content Component
export const CardContent = ({
  children,
  className = ''
}) => {
  return (
    <div className={`text-gray-300 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter = ({
  children,
  className = '',
  justify = 'justify-end'
}) => {
  return (
    <div className={`flex items-center ${justify} mt-6 pt-4 border-t border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

// Specialized Card Components

// Feature Card for showcasing features
export const FeatureCard = ({
  icon,
  title,
  description,
  features = [],
  action,
  className = ''
}) => {
  return (
    <Card className={`h-full ${className}`} hover>
      <div className="flex flex-col h-full">
        {/* Icon and Title */}
        <div className="flex items-center mb-4">
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mr-4">
              {React.cloneElement(icon, { className: 'w-6 h-6 text-indigo-400' })}
            </div>
          )}
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-4 flex-1">{description}</p>

        {/* Features List */}
        {features.length > 0 && (
          <ul className="space-y-2 mb-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-400">
                <ChevronRight className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Action */}
        {action && (
          <div className="mt-auto pt-4">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
};

// Stats Card for displaying metrics
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className = ''
}) => {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-sm ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            {React.cloneElement(icon, { className: 'w-8 h-8 text-gray-400' })}
          </div>
        )}
      </div>
    </Card>
  );
};

// Interactive Card with menu
export const InteractiveCard = ({
  title,
  subtitle,
  content,
  menuItems = [],
  onClick,
  className = ''
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <Card className={`relative ${className}`} onClick={onClick} hover>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          menuItems.length > 0 && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white first:rounded-t-md last:rounded-b-md transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        }
      />
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

// Grid layout for cards
export const CardGrid = ({
  children,
  columns = 'auto',
  gap = 'gap-6',
  className = ''
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export default Card;