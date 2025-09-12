/**
 * OwnershipValidationService Tests
 * Tests the ownership validation service functionality
 */

import OwnershipValidationService from '../../domain/services/OwnershipValidationService.js';

describe('OwnershipValidationService', () => {
  let service;

  beforeEach(() => {
    service = new OwnershipValidationService();
  });

  describe('Operation Validation', () => {
    test('should allow user content read operation', () => {
      const content = { id: 'test-1', ownership: 'user' };
      const result = service.validateOperation(content, 'read');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.ownership).toBe('user');
      expect(result.metadata.operation).toBe('read');
    });

    test('should allow user content write operation', () => {
      const content = { id: 'test-1', ownership: 'user' };
      const result = service.validateOperation(content, 'write');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should allow demo content read operation', () => {
      const content = { id: 'demo-1', ownership: 'demo' };
      const result = service.validateOperation(content, 'read');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject demo content write operation', () => {
      const content = { id: 'demo-1', ownership: 'demo' };
      const result = service.validateOperation(content, 'write');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Operation 'write' is not allowed for demo content");
    });

    test('should reject demo content delete operation', () => {
      const content = { id: 'demo-1', ownership: 'demo' };
      const result = service.validateOperation(content, 'delete');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Operation 'delete' is not allowed for demo content");
    });

    test('should allow demo content copy operation', () => {
      const content = { id: 'demo-1', ownership: 'demo' };
      const result = service.validateOperation(content, 'copy');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Copying demo content will create user-owned content that can be modified');
    });

    test('should warn when deleting user content', () => {
      const content = { id: 'user-1', ownership: 'user' };
      const result = service.validateOperation(content, 'delete');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Deleting user content cannot be undone');
    });

    test('should reject invalid content', () => {
      const result = service.validateOperation(null, 'read');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content is required for ownership validation');
    });

    test('should reject invalid operation', () => {
      const content = { id: 'test-1', ownership: 'user' };
      const result = service.validateOperation(content, '');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid operation is required');
    });

    test('should reject invalid ownership type', () => {
      const content = { id: 'test-1', ownership: 'invalid' };
      const result = service.validateOperation(content, 'read');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid ownership type: invalid");
    });
  });

  describe('Ownership Change Validation', () => {
    test('should allow demo to user ownership change', () => {
      const content = { id: 'demo-1', ownership: 'demo' };
      const result = service.validateOwnershipChange(content, 'user');

      expect(result.isValid).toBe(true);
      expect(result.metadata.currentOwnership).toBe('demo');
      expect(result.metadata.newOwnership).toBe('user');
    });

    test('should reject user to demo ownership change', () => {
      const content = { id: 'user-1', ownership: 'user' };
      const result = service.validateOwnershipChange(content, 'demo');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot change ownership from user to demo');
      expect(result.warnings).toContain('Changing ownership to demo will restrict available operations');
    });

    test('should allow same ownership change', () => {
      const content = { id: 'user-1', ownership: 'user' };
      const result = service.validateOwnershipChange(content, 'user');

      expect(result.isValid).toBe(true);
    });

    test('should reject invalid new ownership', () => {
      const content = { id: 'user-1', ownership: 'user' };
      const result = service.validateOwnershipChange(content, 'invalid');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid new ownership type: invalid');
    });
  });

  describe('Permission Checks', () => {
    test('should return correct available operations for user content', () => {
      const content = { id: 'user-1', ownership: 'user' };
      const operations = service.getAvailableOperations(content);

      expect(operations).toContain('read');
      expect(operations).toContain('write');
      expect(operations).toContain('delete');
      expect(operations).toContain('modify');
      expect(operations).toContain('copy');
      expect(operations).toContain('share');
    });

    test('should return correct available operations for demo content', () => {
      const content = { id: 'demo-1', ownership: 'demo' };
      const operations = service.getAvailableOperations(content);

      expect(operations).toContain('read');
      expect(operations).toContain('copy');
      expect(operations).not.toContain('write');
      expect(operations).not.toContain('delete');
      expect(operations).not.toContain('modify');
      expect(operations).not.toContain('share');
    });

    test('should correctly check modification permissions', () => {
      const userContent = { id: 'user-1', ownership: 'user' };
      const demoContent = { id: 'demo-1', ownership: 'demo' };

      expect(service.canModify(userContent)).toBe(true);
      expect(service.canModify(demoContent)).toBe(false);
    });

    test('should correctly check deletion permissions', () => {
      const userContent = { id: 'user-1', ownership: 'user' };
      const demoContent = { id: 'demo-1', ownership: 'demo' };

      expect(service.canDelete(userContent)).toBe(true);
      expect(service.canDelete(demoContent)).toBe(false);
    });

    test('should correctly check copy permissions', () => {
      const userContent = { id: 'user-1', ownership: 'user' };
      const demoContent = { id: 'demo-1', ownership: 'demo' };

      expect(service.canCopy(userContent)).toBe(true);
      expect(service.canCopy(demoContent)).toBe(true);
    });
  });

  describe('Custom Rules', () => {
    test('should allow adding custom ownership rules', () => {
      service.addOwnershipRule('custom', {
        canModify: true,
        canDelete: false,
        allowedOperations: ['read', 'modify']
      });

      const rules = service.getOwnershipRules('custom');
      expect(rules.canModify).toBe(true);
      expect(rules.canDelete).toBe(false);
      expect(rules.allowedOperations).toContain('read');
      expect(rules.allowedOperations).toContain('modify');
    });

    test('should validate operations for custom ownership', () => {
      service.addOwnershipRule('custom', {
        allowedOperations: ['read', 'modify']
      });

      const content = { id: 'custom-1', ownership: 'custom' };

      expect(service.validateOperation(content, 'read').isValid).toBe(true);
      expect(service.validateOperation(content, 'modify').isValid).toBe(true);
      expect(service.validateOperation(content, 'write').isValid).toBe(false);
    });
  });

  describe('Batch Operations', () => {
    test('should validate multiple operations', () => {
      const operations = [
        { content: { id: 'user-1', ownership: 'user' }, operation: 'read' },
        { content: { id: 'demo-1', ownership: 'demo' }, operation: 'write' },
        { content: { id: 'user-2', ownership: 'user' }, operation: 'copy' }
      ];

      const result = service.validateOperations(operations);

      expect(result.isValid).toBe(false); // Because demo write is invalid
      expect(result.results).toHaveLength(3);
      expect(result.summary.total).toBe(3);
      expect(result.summary.valid).toBe(2);
      expect(result.summary.invalid).toBe(1);
    });
  });
});