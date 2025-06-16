import React from 'react';
import CharacterTypeManager from './features/character-system/CharacterTypeManager';

const MainContent = ({ 
  activeSection, 
  nodeTypeSystem,
  personalitySystem,
  characterTypes,
  setCharacterTypes,
  onSave
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'character-types':
        return (
          <CharacterTypeManager
            personalitySystem={personalitySystem}
            characterTypes={characterTypes}
            setCharacterTypes={setCharacterTypes}
            onSave={onSave}
          />
        );
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default MainContent; 