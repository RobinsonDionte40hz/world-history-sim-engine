/**
 * UI Components Test Suite
 * 
 * Tests for the responsive UI component library including:
 * - Button variants and states
 * - Card layouts and interactions
 * - Loading components and animations
 * - Modal dialogs and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Import components to test
import Button, { ButtonGroup, IconButton } from './Button';
import Card, { CardHeader, CardContent, CardFooter, FeatureCard, StatsCard } from './Card';
import { LoadingSpinner, ProgressBar, SkeletonLoader } from './LoadingComponents';
import Modal, { ConfirmDialog, AlertDialog } from './Modal';
import PageLayout from './PageLayout';
import { NavigationProvider } from '../contexts/NavigationContext';
import { Home, Settings } from 'lucide-react';

// Mock store for testing
const mockStore = configureStore({
  reducer: {
    // Add minimal reducers for testing
    test: (state = {}) => state
  }
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <Provider store={mockStore}>
    <BrowserRouter>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </BrowserRouter>
  </Provider>
);

describe('Button Component', () => {
  test('renders primary button correctly', () => {
    render(
      <TestWrapper>
        <Button variant="primary">Click me</Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-indigo-600');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper>
        <Button onClick={handleClick}>Click me</Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state correctly', () => {
    render(
      <TestWrapper>
        <Button loading>Loading button</Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('renders different variants', () => {
    const { rerender } = render(
      <TestWrapper>
        <Button variant="secondary">Secondary</Button>
      </TestWrapper>
    );
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-600');
    
    rerender(
      <TestWrapper>
        <Button variant="danger">Danger</Button>
      </TestWrapper>
    );
    
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  test('renders with icons', () => {
    render(
      <TestWrapper>
        <Button leftIcon={<Home />} rightIcon={<Settings />}>
          With Icons
        </Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});

describe('ButtonGroup Component', () => {
  test('renders button group correctly', () => {
    render(
      <TestWrapper>
        <ButtonGroup>
          <Button>First</Button>
          <Button>Second</Button>
        </ButtonGroup>
      </TestWrapper>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });
});

describe('IconButton Component', () => {
  test('renders icon button with accessibility', () => {
    render(
      <TestWrapper>
        <IconButton icon={<Home />} aria-label="Go home" />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button', { name: /go home/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Go home');
  });
});

describe('Card Component', () => {
  test('renders basic card', () => {
    render(
      <TestWrapper>
        <Card>
          <p>Card content</p>
        </Card>
      </TestWrapper>
    );
    
    const cardContent = screen.getByText('Card content');
    expect(cardContent).toBeInTheDocument();
  });

  test('renders card with header, content, and footer', () => {
    render(
      <TestWrapper>
        <Card>
          <CardHeader title="Card Title" subtitle="Card subtitle" />
          <CardContent>Card body content</CardContent>
          <CardFooter>Footer content</CardFooter>
        </Card>
      </TestWrapper>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card body content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  test('handles click events when clickable', () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper>
        <Card onClick={handleClick}>
          <p>Clickable card</p>
        </Card>
      </TestWrapper>
    );
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('FeatureCard Component', () => {
  test('renders feature card with all elements', () => {
    const features = ['Feature 1', 'Feature 2', 'Feature 3'];
    
    render(
      <TestWrapper>
        <FeatureCard
          icon={<Home />}
          title="Test Feature"
          description="Feature description"
          features={features}
          action={<Button>Learn More</Button>}
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Feature description')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
  });
});

describe('StatsCard Component', () => {
  test('renders stats card with value and change', () => {
    render(
      <TestWrapper>
        <StatsCard
          title="Users"
          value="1,234"
          change="+12%"
          changeType="positive"
          icon={<Home />}
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });
});

describe('LoadingSpinner Component', () => {
  test('renders loading spinner', () => {
    render(
      <TestWrapper>
        <LoadingSpinner message="Loading data..." />
      </TestWrapper>
    );
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  test('renders different sizes', () => {
    const { rerender } = render(
      <TestWrapper>
        <LoadingSpinner size="small" />
      </TestWrapper>
    );
    
    rerender(
      <TestWrapper>
        <LoadingSpinner size="large" />
      </TestWrapper>
    );
    
    // Test passes if no errors are thrown
    expect(true).toBe(true);
  });
});

describe('ProgressBar Component', () => {
  test('renders progress bar with correct percentage', () => {
    render(
      <TestWrapper>
        <ProgressBar value={75} max={100} showLabel label="Progress" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('handles edge cases for progress values', () => {
    const { rerender } = render(
      <TestWrapper>
        <ProgressBar value={-10} max={100} showLabel />
      </TestWrapper>
    );
    
    expect(screen.getByText('0%')).toBeInTheDocument();
    
    rerender(
      <TestWrapper>
        <ProgressBar value={150} max={100} showLabel />
      </TestWrapper>
    );
    
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

describe('SkeletonLoader Component', () => {
  test('renders skeleton loader with correct number of lines', () => {
    const { container } = render(
      <TestWrapper>
        <SkeletonLoader lines={5} />
      </TestWrapper>
    );
    
    const skeletonLines = container.querySelectorAll('.bg-gray-700');
    expect(skeletonLines).toHaveLength(5);
  });
});

describe('Modal Component', () => {
  test('renders modal when open', () => {
    render(
      <TestWrapper>
        <Modal isOpen={true} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      </TestWrapper>
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <TestWrapper>
        <Modal isOpen={false} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      </TestWrapper>
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('calls onClose when close button clicked', () => {
    const handleClose = jest.fn();
    render(
      <TestWrapper>
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      </TestWrapper>
    );
    
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmDialog Component', () => {
  test('renders confirmation dialog', () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();
    
    render(
      <TestWrapper>
        <ConfirmDialog
          isOpen={true}
          onConfirm={handleConfirm}
          onClose={handleClose}
          title="Confirm Delete"
          message="Are you sure you want to delete this item?"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('calls onConfirm when confirm button clicked', async () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();
    
    render(
      <TestWrapper>
        <ConfirmDialog
          isOpen={true}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      </TestWrapper>
    );
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });
});

describe('AlertDialog Component', () => {
  test('renders alert dialog', () => {
    const handleClose = jest.fn();
    
    render(
      <TestWrapper>
        <AlertDialog
          isOpen={true}
          onClose={handleClose}
          title="Success"
          message="Operation completed successfully!"
          variant="success"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
  });
});

describe('PageLayout Component', () => {
  test('renders page layout with title and content', () => {
    render(
      <TestWrapper>
        <PageLayout title="Test Page" subtitle="Page subtitle">
          <p>Page content</p>
        </PageLayout>
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Page subtitle')).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(
      <TestWrapper>
        <PageLayout loading={true} loadingMessage="Loading page...">
          <p>Page content</p>
        </PageLayout>
      </TestWrapper>
    );
    
    expect(screen.getByText('Loading page...')).toBeInTheDocument();
    expect(screen.queryByText('Page content')).not.toBeInTheDocument();
  });

  test('renders error state', () => {
    const error = new Error('Test error');
    render(
      <TestWrapper>
        <PageLayout error={error} errorMessage="Failed to load page">
          <p>Page content</p>
        </PageLayout>
      </TestWrapper>
    );
    
    expect(screen.getByText('Error Loading Page')).toBeInTheDocument();
    expect(screen.getByText('Failed to load page')).toBeInTheDocument();
    expect(screen.queryByText('Page content')).not.toBeInTheDocument();
  });
});

// Integration tests
describe('Component Integration', () => {
  test('button works inside modal', () => {
    const handleClick = jest.fn();
    const handleClose = jest.fn();
    
    render(
      <TestWrapper>
        <Modal isOpen={true} onClose={handleClose} title="Modal with Button">
          <Button onClick={handleClick}>Click me</Button>
        </Modal>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('card with loading spinner', () => {
    render(
      <TestWrapper>
        <Card>
          <CardHeader title="Loading Card" />
          <CardContent>
            <LoadingSpinner message="Loading content..." />
          </CardContent>
        </Card>
      </TestWrapper>
    );
    
    expect(screen.getByText('Loading Card')).toBeInTheDocument();
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });
});

// Accessibility tests
describe('Accessibility', () => {
  test('buttons have proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <Button aria-label="Custom label">Button</Button>
      </TestWrapper>
    );
    
    const button = screen.getByRole('button', { name: /custom label/i });
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  test('modal has proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <Modal isOpen={true} title="Accessible Modal">
          <p>Modal content</p>
        </Modal>
      </TestWrapper>
    );
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  test('progress bar is accessible', () => {
    render(
      <TestWrapper>
        <ProgressBar value={50} max={100} showLabel label="Upload progress" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Upload progress')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});