/**
 * Modal and Dialog Components - Overlay components for editor interactions
 * 
 * Provides accessible modal dialogs with:
 * - Focus management and keyboard navigation
 * - Backdrop click handling
 * - Animation and transitions
 * - Different sizes and variants
 * - Confirmation dialogs and custom content
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import Button from './Button';

// Base Modal Component
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'medium',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Size configurations
  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Variant configurations
  const variants = {
    default: 'bg-gray-800 border-gray-700',
    primary: 'bg-indigo-900/90 border-indigo-600',
    danger: 'bg-red-900/90 border-red-600',
    success: 'bg-green-900/90 border-green-600',
    warning: 'bg-yellow-900/90 border-yellow-600'
  };

  // Handle escape key
  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape' && closeOnEscape && isOpen) {
      onClose();
    }
  }, [closeOnEscape, isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Add escape key listener
      document.addEventListener('keydown', handleEscape);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Remove escape key listener
      document.removeEventListener('keydown', handleEscape);
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizes[size]} max-h-[90vh] overflow-hidden
          ${variants[variant]} border rounded-lg shadow-xl
          transform transition-all duration-200 ease-out
          ${contentClassName} ${className}
        `}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal Header Component
export const ModalHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-gray-700 ${className}`}>
    {children}
  </div>
);

// Modal Body Component
export const ModalBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Modal Footer Component
export const ModalFooter = ({ 
  children, 
  className = '',
  justify = 'justify-end'
}) => (
  <div className={`flex items-center ${justify} gap-3 p-6 border-t border-gray-700 ${className}`}>
    {children}
  </div>
);

// Confirmation Dialog Component
export const ConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  ...props
}) => {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-red-400" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-400" />,
    info: <Info className="w-6 h-6 text-blue-400" />,
    success: <CheckCircle className="w-6 h-6 text-green-400" />
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      variant={variant}
      showCloseButton={false}
      {...props}
    >
      <ModalBody>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {icons[variant]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Alert Dialog Component
export const AlertDialog = ({
  isOpen = false,
  onClose,
  title = 'Alert',
  message,
  variant = 'info',
  buttonText = 'OK',
  ...props
}) => {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-red-400" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-400" />,
    info: <Info className="w-6 h-6 text-blue-400" />,
    success: <CheckCircle className="w-6 h-6 text-green-400" />
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      variant={variant}
      showCloseButton={false}
      {...props}
    >
      <ModalBody>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {icons[variant]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button
          variant="primary"
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Form Dialog Component
export const FormDialog = ({
  isOpen = false,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  submitDisabled = false,
  ...props
}) => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (onSubmit) {
      await onSubmit(event);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      {...props}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {children}
        </ModalBody>
        
        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={submitDisabled}
          >
            {submitText}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// Drawer Component (Side Modal)
export const Drawer = ({
  isOpen = false,
  onClose,
  title,
  children,
  position = 'right',
  size = 'medium',
  className = '',
  ...props
}) => {
  const positions = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full'
  };

  const sizes = {
    small: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
    medium: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    large: position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]'
  };

  const transforms = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    top: isOpen ? 'translate-y-0' : '-translate-y-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div
        className={`
          absolute ${positions[position]} ${sizes[size]}
          bg-gray-800 border-gray-700 shadow-xl
          transform transition-transform duration-300 ease-out
          ${transforms[position]} ${className}
        `}
        {...props}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;