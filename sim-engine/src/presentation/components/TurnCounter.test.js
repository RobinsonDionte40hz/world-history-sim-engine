// src/presentation/components/TurnCounter.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TurnCounter from './TurnCounter.js';

describe('TurnCounter Component - Error Handling', () => {
  beforeEach(() => {
    // Reset console mocks
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('fallback display for invalid states', () => {
    test('should display "Turn: --" when currentTurn is null', () => {
      render(<TurnCounter currentTurn={null} />);
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith('TurnCounter: currentTurn is null or undefined, displaying fallback');
    });

    test('should display "Turn: --" when currentTurn is undefined', () => {
      render(<TurnCounter currentTurn={undefined} />);
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith('TurnCounter: currentTurn is null or undefined, displaying fallback');
    });

    test('should display "Turn: --" when currentTurn is not a number', () => {
      render(<TurnCounter currentTurn="invalid" />);
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith('TurnCounter: currentTurn is not a number:', 'string', 'invalid');
    });

    test('should display "Turn: --" when currentTurn is NaN', () => {
      render(<TurnCounter currentTurn={NaN} />);
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith('TurnCounter: currentTurn is not finite:', NaN);
    });

    test('should display "Turn: --" when currentTurn is Infinity', () => {
      render(<TurnCounter currentTurn={Infinity} />);
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith('TurnCounter: currentTurn is not finite:', Infinity);
    });

    test('should display "Turn: --" when currentTurn is negative', () => {
      render(<TurnCounter currentTurn={-5} />);
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith('TurnCounter: currentTurn is negative:', -5);
    });
  });

  describe('valid turn counter display', () => {
    test('should display turn counter for valid number 0', () => {
      render(<TurnCounter currentTurn={0} />);
      expect(screen.getByText('Turn: 0')).toBeInTheDocument();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    test('should display turn counter for positive numbers', () => {
      render(<TurnCounter currentTurn={42} />);
      expect(screen.getByText('Turn: 42')).toBeInTheDocument();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    test('should display turn counter with locale formatting for large numbers', () => {
      render(<TurnCounter currentTurn={1234567} />);
      expect(screen.getByText('Turn: 1,234,567')).toBeInTheDocument();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('custom className support', () => {
    test('should apply custom className', () => {
      render(<TurnCounter currentTurn={10} className="custom-class" />);
      const element = screen.getByText('Turn: 10');
      expect(element).toHaveClass('custom-class');
    });

    test('should apply default className when none provided', () => {
      render(<TurnCounter currentTurn={10} />);
      const element = screen.getByText('Turn: 10');
      expect(element).toHaveClass('text-sm', 'text-gray-500', 'dark:text-gray-400');
    });
  });

  describe('error boundary integration', () => {
    test('should render without crashing when wrapped in error boundary', () => {
      // This test ensures the component can be rendered within the error boundary
      expect(() => {
        render(<TurnCounter currentTurn={42} />);
      }).not.toThrow();
    });

    test('should handle rendering errors gracefully', () => {
      // Create a mock that will pass the initial type checks but fail during rendering
      const mockCurrentTurn = 42;
      
      // Mock toLocaleString to throw an error
      const originalToLocaleString = Number.prototype.toLocaleString;
      Number.prototype.toLocaleString = jest.fn(() => {
        throw new Error('Rendering error');
      });

      render(<TurnCounter currentTurn={mockCurrentTurn} />);
      
      // Should display fallback when rendering fails
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith('TurnCounter: Error rendering turn counter:', expect.any(Error));
      
      // Restore original method
      Number.prototype.toLocaleString = originalToLocaleString;
    });
  });

  describe('edge cases', () => {
    test('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      render(<TurnCounter currentTurn={largeNumber} />);
      expect(screen.getByText(`Turn: ${largeNumber.toLocaleString()}`)).toBeInTheDocument();
    });

    test('should handle decimal numbers by displaying them', () => {
      render(<TurnCounter currentTurn={42.5} />);
      expect(screen.getByText('Turn: 42.5')).toBeInTheDocument();
    });

    test('should handle zero correctly', () => {
      render(<TurnCounter currentTurn={0} />);
      expect(screen.getByText('Turn: 0')).toBeInTheDocument();
    });
  });
});