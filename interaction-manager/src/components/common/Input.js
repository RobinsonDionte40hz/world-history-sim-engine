import React from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  error,
  helperText,
  className = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helperTextClassName = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          className={`
            block text-sm font-medium
            text-gray-700 dark:text-gray-200
            ${labelClassName}
          `}
        >
          {label}
        </label>
      )}
      
      <input
        className={`${styles.input} ${inputClassName}`}
        {...props}
      />
      
      {error && (
        <p className={`
          text-sm text-red-600 dark:text-red-400
          ${errorClassName}
        `}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={`
          text-sm text-gray-500 dark:text-gray-400
          ${helperTextClassName}
        `}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 