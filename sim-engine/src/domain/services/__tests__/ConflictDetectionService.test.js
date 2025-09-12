/**
 * ConflictDetectionService tests
 * Tests conflict detection for demo content operations
 */

import ConflictDetectionService from '../ConflictDetectionService.js';
import OwnershipValidationService from '../OwnershipValidationService.js';

describe('ConflictDetectionService', () => {
  let conflictDetectionService;
  let ownershipValidationService;

  beforeEach(() => {
    ownershipValidationService = new OwnershipValidationService();
    conflictDetectionService = new ConflictDetectionService(ownershipValidationService);
  });

  describe('detectConflict', () => {
    it('should return no conflict for valid user content operations', () => {
      const content = { id: 'user-content-1', ownership: 'user' };
      const result = conflictDetectionService.detectConflict(content, 'write');

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe(null);
      expect(result.severity).toBe(null);
    });

    it('should detect demo content modification conflict', () => {
      const content = { id: 'demo-content-1', ownership: 'demo' };
      const result = conflictDetectionService.detectConflict(content, 'write');

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('demo_modification');
      expect(result.severity).toBe('high');
      expect(result.resolution.type).toBe('copy_first');
    });

    it('should detect demo content deletion conflict as critical', () => {
      const content = { id: 'demo-content-1', ownership: 'demo' };
      const result = conflictDetectionService.detectConflict(content, 'delete');

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('demo_modification');
      expect(result.severity).toBe('critical');
      expect(result.resolution.type).toBe('block_operation');
    });

    it('should detect ownership change conflicts', () => {
      const content = { id: 'user-content-1', ownership: 'user' };
      const result = conflictDetectionService.detectConflict(content, 'copy', {
        newOwnership: 'demo'
      });

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('ownership_change');
      expect(result.severity).toBe('high');
    });

    it('should detect permission violation conflicts', () => {
      const content = { id: 'demo-content-1', ownership: 'demo' };
      const result = conflictDetectionService.detectConflict(content, 'delete');

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('demo_modification');
      expect(result.severity).toBe('critical');
    });

    it('should handle invalid inputs gracefully', () => {
      const result = conflictDetectionService.detectConflict(null, 'write');

      expect(result.hasConflict).toBe(false);
      expect(result.errors).toContain('Content is required for conflict detection');
    });

    it('should handle content without ownership', () => {
      const content = { id: 'content-1' };
      const result = conflictDetectionService.detectConflict(content, 'write');

      expect(result.hasConflict).toBe(false);
      expect(result.warnings).toContain('Content ownership not specified, assuming user ownership');
    });
  });

  describe('getConflictTypeInfo', () => {
    it('should return conflict type information', () => {
      const info = conflictDetectionService.getConflictTypeInfo('demo_modification');

      expect(info).toEqual({
        title: 'Demo Content Modification',
        description: 'Attempting to modify protected demo content',
        category: 'content_protection'
      });
    });

    it('should return null for unknown conflict types', () => {
      const info = conflictDetectionService.getConflictTypeInfo('unknown_type');

      expect(info).toBe(null);
    });
  });

  describe('getSeverityInfo', () => {
    it('should return severity information for low severity', () => {
      const info = conflictDetectionService.getSeverityInfo('low');

      expect(info).toEqual({
        level: 1,
        color: 'green',
        requiresUserAction: false,
        canAutoResolve: true
      });
    });

    it('should return severity information for critical severity', () => {
      const info = conflictDetectionService.getSeverityInfo('critical');

      expect(info).toEqual({
        level: 4,
        color: 'red',
        requiresUserAction: true,
        canAutoResolve: false,
        blocksOperation: true
      });
    });

    it('should return null for unknown severity levels', () => {
      const info = conflictDetectionService.getSeverityInfo('unknown');

      expect(info).toBe(null);
    });
  });

  describe('analyzeOperations', () => {
    it('should analyze multiple operations for conflicts', () => {
      const operations = [
        { content: { id: 'user-1', ownership: 'user' }, operation: 'write' },
        { content: { id: 'demo-1', ownership: 'demo' }, operation: 'write' },
        { content: { id: 'demo-2', ownership: 'demo' }, operation: 'delete' }
      ];

      const result = conflictDetectionService.analyzeOperations(operations);

      expect(result.hasConflicts).toBe(true);
      expect(result.criticalConflicts).toBe(1);
      expect(result.totalOperations).toBe(3);
      expect(result.results).toHaveLength(3);
      expect(result.summary.conflicts).toBe(2);
      expect(result.summary.critical).toBe(1);
    });

    it('should handle empty operations array', () => {
      const result = conflictDetectionService.analyzeOperations([]);

      expect(result.hasConflicts).toBe(false);
      expect(result.criticalConflicts).toBe(0);
      expect(result.totalOperations).toBe(0);
    });
  });
});