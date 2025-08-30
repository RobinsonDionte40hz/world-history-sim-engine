// Minimal test for TemplateService
import TemplateService from '../../../application/use-cases/services/TemplateService.js';

// Mock all dependencies that might cause issues
jest.mock('../../../domain/value-objects/Environment.js', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((config) => ({
      toJSON: jest.fn(() => ({ terrain: 'plains', climate: 'temperate' })),
      getTotalHazardDanger: jest.fn(() => 0.1),
      getComfortLevel: jest.fn(() => 0.7),
      isHospitable: jest.fn(() => true)
    })),
    createDefault: jest.fn(() => ({
      toJSON: jest.fn(() => ({ terrain: 'plains', climate: 'temperate' })),
      getTotalHazardDanger: jest.fn(() => 0.1),
      getComfortLevel: jest.fn(() => 0.7),
      isHospitable: jest.fn(() => true)
    }))
  };
});

jest.mock('../../../domain/services/EnvironmentalValidator.js', () => ({
  __esModule: true,
  default: {
    validateEnvironment: jest.fn(() => ({ isValid: true, errors: [] }))
  }
}));

jest.mock('../../../domain/value-objects/Positions.js', () => {
  return jest.fn().mockImplementation(() => ({ x: 0, y: 0 }));
});

describe('TemplateService Minimal Test', () => {
  test('should create template with mocked dependencies', () => {
    const config = { name: 'Test Template' };
    const template = TemplateService.createNodeTemplate(config);
    
    console.log('Template result:', template);
    expect(template).toBeDefined();
    expect(template.name).toBe('Test Template');
  });
});
