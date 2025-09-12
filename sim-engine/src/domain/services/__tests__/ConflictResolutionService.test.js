/**
 * ConflictResolutionService tests
 * Tests conflict resolution workflow and user decision handling
 */

import ConflictResolutionService from '../ConflictResolutionService.js';
import ConflictDetectionService from '../ConflictDetectionService.js';
import OwnershipValidationService from '../OwnershipValidationService.js';

describe('ConflictResolutionService', () => {
  let conflictResolutionService;
  let conflictDetectionService;
  let ownershipValidationService;

  beforeEach(() => {
    ownershipValidationService = new OwnershipValidationService();
    conflictDetectionService = new ConflictDetectionService(ownershipValidationService);
    conflictResolutionService = new ConflictResolutionService(
      conflictDetectionService,
      ownershipValidationService
    );
  });

  describe('resolveConflict', () => {
    it('should resolve successfully for no conflict', async () => {
      const conflict = { hasConflict: false };

      const result = await conflictResolutionService.resolveConflict(conflict);

      expect(result.success).toBe(true);
      expect(result.state).toBe('resolved');
      expect(result.result).toBe(null);
    });

    it('should handle demo modification conflicts with copy resolution', async () => {
      const conflict = {
        hasConflict: true,
        conflictType: 'demo_modification',
        severity: 'high',
        resolution: {
          type: 'copy_first',
          options: [
            { id: 'copy_and_modify', label: 'Create Copy and Modify' },
            { id: 'cancel', label: 'Cancel' }
          ]
        },
        id: 'conflict-1'
      };

      // Mock the user decision to copy
      conflictResolutionService.submitUserDecision('conflict-1', 'copy_and_modify');

      const result = await conflictResolutionService.resolveConflict(conflict, {
        content: { id: 'demo-1', ownership: 'demo', name: 'Demo Content' }
      });

      expect(result.success).toBe(true);
      expect(result.state).toBe('resolved');
      expect(result.result.action).toBe('copy_created');
      expect(result.result.copiedContent.ownership).toBe('user');
    });

    it('should handle user cancellation', async () => {
      const conflict = {
        hasConflict: true,
        conflictType: 'demo_modification',
        severity: 'high',
        resolution: {
          type: 'copy_first',
          options: [
            { id: 'copy_and_modify', label: 'Create Copy and Modify' },
            { id: 'cancel', label: 'Cancel' }
          ]
        },
        id: 'conflict-2'
      };

      // Start the resolution process
      const resolutionPromise = conflictResolutionService.resolveConflict(conflict, {
        content: { id: 'demo-2', ownership: 'demo', name: 'Demo Content 2' }
      });

      // Submit the cancel decision after a short delay to ensure resolution has started
      setTimeout(() => {
        conflictResolutionService.submitUserDecision('conflict-2', 'cancel');
      }, 10);

      const result = await resolutionPromise;

      expect(result.success).toBe(false);
      expect(result.state).toBe('cancelled');
      expect(result.result.action).toBe('cancelled');
    });

    it('should handle critical conflicts by blocking operation', async () => {
      const conflict = {
        hasConflict: true,
        conflictType: 'permission_violation',
        severity: 'critical',
        resolution: {
          type: 'block_operation',
          reason: 'demo_content_protected'
        }
      };

      const result = await conflictResolutionService.resolveConflict(conflict);

      expect(result.success).toBe(false);
      expect(result.state).toBe('cancelled');
      expect(result.result.action).toBe('operation_blocked');
    });
  });

  describe('getResolutionStatus', () => {
    it('should return resolution status for active resolution', async () => {
      const conflict = {
        hasConflict: true,
        conflictType: 'demo_modification',
        severity: 'high',
        resolution: { type: 'copy_first' },
        id: 'status-test'
      };

      // Start a resolution
      const resolutionPromise = conflictResolutionService.resolveConflict(conflict);

      const status = conflictResolutionService.getResolutionStatus('status-test');

      expect(status).toBeTruthy();
      expect(status.state).toBe('pending');
      expect(status.conflict).toEqual(conflict);

      // Wait for resolution to complete
      await resolutionPromise;
    });

    it('should return null for non-existent resolution', () => {
      const status = conflictResolutionService.getResolutionStatus('non-existent');

      expect(status).toBe(null);
    });
  });

  describe('cancelResolution', () => {
    it('should cancel active resolution', async () => {
      const conflict = {
        hasConflict: true,
        conflictType: 'demo_modification',
        severity: 'high',
        resolution: { type: 'copy_first' },
        id: 'cancel-test'
      };

      // Start resolution but don't wait
      const resolutionPromise = conflictResolutionService.resolveConflict(conflict);

      // Cancel it
      conflictResolutionService.cancelResolution('cancel-test');

      const result = await resolutionPromise;

      expect(result.success).toBe(false);
      expect(result.state).toBe('cancelled');
    });

    it('should handle cancelling non-existent resolution', () => {
      expect(() => {
        conflictResolutionService.cancelResolution('non-existent');
      }).not.toThrow();
    });
  });

  describe('getActiveResolutions', () => {
    it('should return list of active resolutions', async () => {
      const conflict1 = {
        hasConflict: true,
        conflictType: 'demo_modification',
        severity: 'high',
        resolution: { type: 'copy_first' },
        id: 'active-1'
      };

      const conflict2 = {
        hasConflict: true,
        conflictType: 'ownership_change',
        severity: 'medium',
        resolution: { type: 'confirm_permission_loss' },
        id: 'active-2'
      };

      // Start two resolutions
      conflictResolutionService.resolveConflict(conflict1);
      conflictResolutionService.resolveConflict(conflict2);

      const activeResolutions = conflictResolutionService.getActiveResolutions();

      expect(activeResolutions).toHaveLength(2);
      expect(activeResolutions[0].id).toBe('active-1');
      expect(activeResolutions[1].id).toBe('active-2');
    });
  });

  describe('cleanupCompletedResolutions', () => {
    it('should clean up old completed resolutions', async () => {
      const conflict = {
        hasConflict: true,
        conflictType: 'demo_modification',
        severity: 'high',
        resolution: { type: 'copy_first' },
        id: 'cleanup-test'
      };

      // Start and complete resolution
      await conflictResolutionService.resolveConflict(conflict);

      // Manually set completion time to be old
      const resolution = conflictResolutionService.activeResolutions.get('cleanup-test');
      if (resolution) {
        resolution.startedAt = new Date(Date.now() - 6 * 60 * 1000); // 6 minutes ago
        resolution.completedAt = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      }

      const beforeCleanup = conflictResolutionService.getActiveResolutions();
      expect(beforeCleanup).toHaveLength(1);

      conflictResolutionService.cleanupCompletedResolutions();

      const afterCleanup = conflictResolutionService.getActiveResolutions();
      expect(afterCleanup).toHaveLength(0);
    });
  });

  describe('getResolutionStats', () => {
    it('should return resolution statistics', async () => {
      const conflict1 = {
        hasConflict: true,
        conflictType: 'demo_modification',
        severity: 'high',
        resolution: { type: 'copy_first' },
        id: 'stats-1'
      };

      const conflict2 = {
        hasConflict: true,
        conflictType: 'ownership_change',
        severity: 'medium',
        resolution: { type: 'confirm_permission_loss' },
        id: 'stats-2'
      };

      // Start resolutions
      conflictResolutionService.resolveConflict(conflict1);
      conflictResolutionService.resolveConflict(conflict2);

      const stats = conflictResolutionService.getResolutionStats();

      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(2);
      expect(stats.resolved).toBe(0);
      expect(stats.cancelled).toBe(0);
      expect(stats.failed).toBe(0);
    });
  });

  describe('registerResolutionCallback', () => {
    it('should register callback for resolution', () => {
      const callback = jest.fn();
      conflictResolutionService.registerResolutionCallback('test-conflict', callback);

      // The callback should be stored (internal implementation detail)
      expect(conflictResolutionService.resolutionCallbacks.has('test-conflict')).toBe(true);
    });
  });

  describe('submitUserDecision', () => {
    it('should accept valid user decision', () => {
      const options = [
        { id: 'option1', label: 'Option 1' },
        { id: 'option2', label: 'Option 2' }
      ];

      const mockResolve = jest.fn();
      const mockReject = jest.fn();

      conflictResolutionService.resolutionCallbacks.set('decision-test', {
        resolve: mockResolve,
        reject: mockReject,
        options
      });

      conflictResolutionService.submitUserDecision('decision-test', 'option1');

      expect(mockResolve).toHaveBeenCalledWith('option1');
      expect(mockReject).not.toHaveBeenCalled();
    });

    it('should reject invalid user decision', () => {
      const options = [
        { id: 'option1', label: 'Option 1' },
        { id: 'option2', label: 'Option 2' }
      ];

      conflictResolutionService.resolutionCallbacks.set('decision-test', {
        resolve: jest.fn(),
        reject: jest.fn(),
        options
      });

      conflictResolutionService.submitUserDecision('decision-test', 'invalid-option');

      expect(conflictResolutionService.resolutionCallbacks.get('decision-test').reject)
        .toHaveBeenCalled();
    });
  });
});