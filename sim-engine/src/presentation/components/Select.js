import React from 'react';
import styles from './Input.module.css';

const Select = ({
  label,
  error,
  helperText,
  options,
  className = '',
  labelClassName = '',
  selectClassName = '',
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
      
      <select
        className={`${styles.select} ${selectClassName}`}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="bg-white dark:bg-gray-700"
          >
            {option.label}
          </option>
        ))}
      </select>
      
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

export default Select; 