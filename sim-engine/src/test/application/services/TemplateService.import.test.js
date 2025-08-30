// Quick test to check imports
import TemplateService from '../../../application/use-cases/services/TemplateService.js';

describe('Import Test', () => {
  test('should import TemplateService correctly', () => {
    expect(TemplateService).toBeDefined();
    expect(typeof TemplateService.createNodeTemplate).toBe('function');
  });
});
