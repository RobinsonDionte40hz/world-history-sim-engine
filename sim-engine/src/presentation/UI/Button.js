/**
 * Button Component - Flexible button with multiple variants and states
 * 
 * Supports primary, secondary, outline, ghost, and danger variants.
 * Includes loading states, disabled states, and different sizes.
 * Fully accessible with proper ARIA attributes and keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  // Base button styles
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${fullWidth ? 'w-full' : ''}
  `;

  // Variant styles
  const variants = {
    primary: `
      bg-indigo-600 text-white border border-indigo-600
      hover:bg-indigo-700 hover:border-indigo-700
      focus:ring-indigo-500
      active:bg-indigo-800
    `,
    secondary: `
      bg-gray-600 text-white border border-gray-600
      hover:bg-gray-700 hover:border-gray-700
      focus:ring-gray-500
      active:bg-gray-800
    `,
    outline: `
      bg-transparent text-indigo-400 border border-indigo-500
      hover:bg-indigo-500 hover:text-white
      focus:ring-indigo-500
      active:bg-indigo-600
    `,
    ghost: `
      bg-transparent text-gray-300 border border-transparent
      hover:bg-gray-700 hover:text-white
      focus:ring-gray-500
      active:bg-gray-800
    `,
    danger: `
      bg-red-600 text-white border border-red-600
      hover:bg-red-700 hover:border-red-700
      focus:ring-red-500
      active:bg-red-800
    `,
    success: `
      bg-green-600 text-white border border-green-600
      hover:bg-green-700 hover:border-green-700
      focus:ring-green-500
      active:bg-green-800
    `,
    warning: `
      bg-yellow-600 text-white border border-yellow-600
      hover:bg-yellow-700 hover:border-yellow-700
      focus:ring-yellow-500
      active:bg-yellow-800
    `
  };

  // Size styles
  const sizes = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-4 py-2 text-sm gap-2',
    large: 'px-6 py-3 text-base gap-2.5',
    xlarge: 'px-8 py-4 text-lg gap-3'
  };

  // Loading state styles
  const loadingStyles = loading ? 'cursor-wait' : '';

  // Combine all styles
  const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${loadingStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Handle click with loading state
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Left Icon or Loading Spinner */}
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}

      {/* Button Content */}
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>

      {/* Right Icon */}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Button Group Component for related actions
export const ButtonGroup = ({ 
  children, 
  className = '',
  orientation = 'horizontal',
  spacing = 'gap-2'
}) => {
  const orientationClass = orientation === 'vertical' ? 'flex-col' : 'flex-row';
  
  return (
    <div className={`flex ${orientationClass} ${spacing} ${className}`}>
      {children}
    </div>
  );
};

// Icon Button Component for icon-only buttons
export const IconButton = forwardRef(({
  icon,
  'aria-label': ariaLabel,
  size = 'medium',
  variant = 'ghost',
  className = '',
  ...props
}, ref) => {
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const buttonSizes = {
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-3'
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      className={`${buttonSizes[size]} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {React.cloneElement(icon, { className: iconSizes[size] })}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

export default Button;