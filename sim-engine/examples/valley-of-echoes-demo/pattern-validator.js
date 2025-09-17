
const PatternValidator = {
  validateBidirectionalAssignments: function(configData) {
    const issues = [];
    
    if (configData.characters) {
      configData.characters.forEach(character => {
        if (!character.assignments || !character.assignments.nodes) {
          issues.push('Character ' + character.id + ': Missing assignments.nodes');
        }
      });
    }
    
    return issues;
  },
  
  validateDnDAttributes: function(attributes) {
    const required = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    return required.every(attr => {
      return attributes[attr] && 
             typeof attributes[attr].score === 'number' && 
             typeof attributes[attr].modifier === 'number';
    });
  },
  
  validateEnvironmentalProperties: function(environment) {
    const required = ['terrain', 'climate', 'lighting'];
    return required.every(prop => environment.hasOwnProperty(prop));
  },
  
  validateCulturalContext: function(culture) {
    return typeof culture.language === 'string' && 
           Array.isArray(culture.traditions);
  }
};

module.exports = PatternValidator;
