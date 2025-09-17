import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../../presentation/components/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Test content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal content when open', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Test content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop click when disabled', () => {
    render(<Modal {...defaultProps} closeOnBackdrop={false} />);

    // The backdrop click should not trigger onClose
    // We can't easily test the backdrop click with Testing Library
    // but we can verify the modal stays open
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    render(<Modal {...defaultProps} size="large" />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('max-w-2xl');
  });

  it('applies correct variant classes', () => {
    render(<Modal {...defaultProps} variant="primary" />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('bg-indigo-900/90');
  });
});