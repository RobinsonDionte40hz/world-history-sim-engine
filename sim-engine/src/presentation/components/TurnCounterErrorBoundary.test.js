// src/presentation/components/TurnCounterErrorBoundary.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TurnCounterErrorBoundary from './TurnCounterErrorBoundary.js';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <span>Normal content</span>;
};

describe('TurnCounterErrorBoundary', () => {
  beforeEach(() => {
    // Reset console mocks
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('should render children when no error occurs', () => {
    render(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={false} />
      </TurnCounterErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(console.error).not.toHaveBeenCalled();
  });

  test('should render fallback UI when child component throws error', () => {
    render(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TurnCounterErrorBoundary>
    );

    expect(screen.getByText('Turn: --')).toBeInTheDocument();
    expect(screen.queryByText('Normal content')).not.toBeInTheDocument();
  });

  test('should log error details when error occurs', () => {
    render(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TurnCounterErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'TurnCounterErrorBoundary: Turn counter display error:',
      expect.any(Error)
    );
    expect(console.error).toHaveBeenCalledWith(
      'TurnCounterErrorBoundary: Error info:',
      expect.any(Object)
    );
  });

  test('should log currentTurn context when provided', () => {
    render(
      <TurnCounterErrorBoundary currentTurn={42}>
        <ThrowError shouldThrow={true} />
      </TurnCounterErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'TurnCounterErrorBoundary: Current turn value:',
      42
    );
  });

  test('should not log currentTurn context when not provided', () => {
    render(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TurnCounterErrorBoundary>
    );

    expect(console.error).not.toHaveBeenCalledWith(
      'TurnCounterErrorBoundary: Current turn value:',
      expect.anything()
    );
  });

  test('should apply correct CSS classes to fallback UI', () => {
    render(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TurnCounterErrorBoundary>
    );

    const fallbackElement = screen.getByText('Turn: --');
    expect(fallbackElement).toHaveClass('text-sm', 'text-gray-500', 'dark:text-gray-400');
  });

  test('should handle multiple errors gracefully', () => {
    const { rerender } = render(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TurnCounterErrorBoundary>
    );

    expect(screen.getByText('Turn: --')).toBeInTheDocument();

    // Re-render with different error
    rerender(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TurnCounterErrorBoundary>
    );

    expect(screen.getByText('Turn: --')).toBeInTheDocument();
  });

  test('should recover when error is resolved', () => {
    const { rerender } = render(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TurnCounterErrorBoundary>
    );

    expect(screen.getByText('Turn: --')).toBeInTheDocument();

    // Re-render without error
    rerender(
      <TurnCounterErrorBoundary>
        <ThrowError shouldThrow={false} />
      </TurnCounterErrorBoundary>
    );

    // Error boundary doesn't automatically recover, so fallback should still be shown
    expect(screen.getByText('Turn: --')).toBeInTheDocument();
  });
});