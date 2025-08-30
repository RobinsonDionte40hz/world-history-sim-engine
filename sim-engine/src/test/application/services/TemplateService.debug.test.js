// Debug test for TemplateService
import TemplateService from '../../../application/use-cases/services/TemplateService.js';

describe('TemplateService Debug', () => {
  test('should debug template creation step by step', () => {
    console.log('1. TemplateService imported:', typeof TemplateService);
    console.log('2. createNodeTemplate method:', typeof TemplateService.createNodeTemplate);
    console.log('3. Templates property:', TemplateService.templates);
    
    // Try a very simple call
    try {
      const result = TemplateService.createNodeTemplate({ name: 'Test' });
      console.log('4. Template creation result:', result);
      expect(result).toBeDefined();
    } catch (error) {
      console.error('4. Error during creation:', error);
      throw error;
    }
  });
});
