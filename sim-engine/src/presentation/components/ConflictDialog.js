/**
 * ConflictDialog - Component for handling content operation conflicts
 * Presents conflict resolution options to users with clear explanations
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Copy, Info, CheckCircle, XCircle } from 'lucide-react';
import Modal, { ModalBody, ModalFooter } from './Modal';
import Button from '../UI/Button';

const ConflictDialog = ({
  isOpen = false,
  conflict = null,
  onResolve,
  onCancel,
  loading = false
}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Reset selected option when conflict changes
  useEffect(() => {
    if (conflict && conflict.resolution && conflict.resolution.options) {
      setSelectedOption(conflict.resolution.options[0]?.id || null);
    }
  }, [conflict]);

  if (!conflict || !isOpen) {
    return null;
  }

  const getConflictIcon = () => {
    switch (conflict.severity) {
      case 'critical':
        return <XCircle className="w-8 h-8 text-red-400" />;
      case 'high':
        return <AlertTriangle className="w-8 h-8 text-orange-400" />;
      case 'medium':
        return <Info className="w-8 h-8 text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      default:
        return <Info className="w-8 h-8 text-blue-400" />;
    }
  };

  const getSeverityColor = () => {
    switch (conflict.severity) {
      case 'critical':
        return 'border-red-600 bg-red-900/20';
      case 'high':
        return 'border-orange-600 bg-orange-900/20';
      case 'medium':
        return 'border-yellow-600 bg-yellow-900/20';
      case 'low':
        return 'border-green-600 bg-green-900/20';
      default:
        return 'border-blue-600 bg-blue-900/20';
    }
  };

  const getOptionIcon = (optionId) => {
    switch (optionId) {
      case 'copy_and_modify':
        return <Copy className="w-5 h-5" />;
      case 'cancel':
        return <XCircle className="w-5 h-5" />;
      case 'proceed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const handleResolve = () => {
    if (selectedOption && onResolve) {
      onResolve(selectedOption);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const renderConflictDetails = () => {
    if (!conflict.resolution) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            {getConflictIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {conflict.resolution.message || 'Conflict Detected'}
            </h3>
            {conflict.resolution.reason && (
              <p className="text-sm text-gray-400 mb-3">
                Reason: {conflict.resolution.reason}
              </p>
            )}
          </div>
        </div>

        {/* Resolution Options */}
        {conflict.resolution.options && conflict.resolution.options.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Choose an action:</h4>
            <div className="space-y-2">
              {conflict.resolution.options.map((option) => (
                <label
                  key={option.id}
                  className={`
                    flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${selectedOption === option.id
                      ? `${getSeverityColor()} ring-2 ring-opacity-50`
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="conflict-option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 text-gray-400">
                        {getOptionIcon(option.id)}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {option.label}
                      </span>
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {conflict.warnings && conflict.warnings.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-400">Warnings:</h4>
                <ul className="text-sm text-yellow-300 mt-1 space-y-1">
                  {conflict.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {conflict.errors && conflict.errors.length > 0 && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-400">Errors:</h4>
                <ul className="text-sm text-red-300 mt-1 space-y-1">
                  {conflict.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getModalVariant = () => {
    switch (conflict.severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTitle = () => {
    switch (conflict.conflictType) {
      case 'demo_modification':
        return 'Demo Content Protection';
      case 'demo_deletion':
        return 'Demo Content Deletion';
      case 'ownership_change':
        return 'Ownership Change Warning';
      case 'permission_violation':
        return 'Permission Error';
      default:
        return 'Conflict Resolution Required';
    }
  };

  const canProceed = () => {
    return selectedOption && !loading;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={getTitle()}
      size="medium"
      variant={getModalVariant()}
      closeOnBackdrop={false}
      closeOnEscape={!loading}
    >
      <ModalBody>
        {renderConflictDetails()}
      </ModalBody>

      <ModalFooter>
        <Button
          variant="ghost"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleResolve}
          disabled={!canProceed()}
          loading={loading}
        >
          {loading ? 'Resolving...' : 'Continue'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConflictDialog;