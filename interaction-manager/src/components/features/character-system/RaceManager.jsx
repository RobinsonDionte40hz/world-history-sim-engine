import React, { useState, useEffect } from 'react';
import RaceSystem from '../../../systems/character/RaceSystem';

const RaceManager = ({ onRaceSelect, initialRace = null }) => {
    const [raceSystem] = useState(new RaceSystem());
    const [selectedRace, setSelectedRace] = useState(initialRace);
    const [selectedSubrace, setSelectedSubrace] = useState(null);
    const [showRaceCreator, setShowRaceCreator] = useState(false);
    const [newRace, setNewRace] = useState({
        id: '',
        name: '',
        description: '',
        subraces: [],
        traits: [],
        lifespan: { average: 80, maximum: 100 }
    });

    useEffect(() => {
        if (selectedRace && onRaceSelect) {
            const modifiers = raceSystem.getRacialModifiers(selectedRace, selectedSubrace);
            onRaceSelect({
                race: selectedRace,
                subrace: selectedSubrace,
                modifiers
            });
        }
    }, [selectedRace, selectedSubrace, onRaceSelect]);

    const handleRaceSelect = (raceId) => {
        setSelectedRace(raceId);
        setSelectedSubrace(null);
    };

    const handleSubraceSelect = (subraceName) => {
        setSelectedSubrace(subraceName);
    };

    const handleCreateRace = () => {
        try {
            const race = raceSystem.createRace(newRace);
            setShowRaceCreator(false);
            setNewRace({
                id: '',
                name: '',
                description: '',
                subraces: [],
                traits: [],
                lifespan: { average: 80, maximum: 100 }
            });
            handleRaceSelect(race.id);
        } catch (error) {
            console.error('Error creating race:', error);
        }
    };

    const handleAddSubrace = () => {
        setNewRace(prev => ({
            ...prev,
            subraces: [...prev.subraces, {
                name: '',
                description: '',
                attributeModifiers: {},
                skillModifiers: {},
                features: []
            }]
        }));
    };

    const handleAddTrait = () => {
        setNewRace(prev => ({
            ...prev,
            traits: [...prev.traits, {
                name: '',
                description: '',
                effects: {}
            }]
        }));
    };

    return (
        <div className="race-manager">
            <div className="race-selection">
                <h3>Select Race</h3>
                <div className="race-list">
                    {raceSystem.getAllRaces().map(race => (
                        <div
                            key={race.id}
                            className={`race-option ${selectedRace === race.id ? 'selected' : ''}`}
                            onClick={() => handleRaceSelect(race.id)}
                        >
                            <h4>{race.name}</h4>
                            <p>{race.description}</p>
                        </div>
                    ))}
                </div>

                {selectedRace && (
                    <div className="subrace-selection">
                        <h4>Select Subrace</h4>
                        <div className="subrace-list">
                            {raceSystem.getRace(selectedRace).subraces.map(subrace => (
                                <div
                                    key={subrace.name}
                                    className={`subrace-option ${selectedSubrace === subrace.name ? 'selected' : ''}`}
                                    onClick={() => handleSubraceSelect(subrace.name)}
                                >
                                    <h5>{subrace.name}</h5>
                                    <p>{subrace.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={() => setShowRaceCreator(true)}>
                    Create New Race
                </button>
            </div>

            {showRaceCreator && (
                <div className="race-creator">
                    <h3>Create New Race</h3>
                    <div className="form-group">
                        <label>ID:</label>
                        <input
                            type="text"
                            value={newRace.id}
                            onChange={e => setNewRace(prev => ({ ...prev, id: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            value={newRace.name}
                            onChange={e => setNewRace(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            value={newRace.description}
                            onChange={e => setNewRace(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="subraces-section">
                        <h4>Subraces</h4>
                        <button onClick={handleAddSubrace}>Add Subrace</button>
                        {newRace.subraces.map((subrace, index) => (
                            <div key={index} className="subrace-form">
                                <input
                                    type="text"
                                    placeholder="Subrace Name"
                                    value={subrace.name}
                                    onChange={e => {
                                        const updatedSubraces = [...newRace.subraces];
                                        updatedSubraces[index] = { ...subrace, name: e.target.value };
                                        setNewRace(prev => ({ ...prev, subraces: updatedSubraces }));
                                    }}
                                />
                                <textarea
                                    placeholder="Subrace Description"
                                    value={subrace.description}
                                    onChange={e => {
                                        const updatedSubraces = [...newRace.subraces];
                                        updatedSubraces[index] = { ...subrace, description: e.target.value };
                                        setNewRace(prev => ({ ...prev, subraces: updatedSubraces }));
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="traits-section">
                        <h4>Traits</h4>
                        <button onClick={handleAddTrait}>Add Trait</button>
                        {newRace.traits.map((trait, index) => (
                            <div key={index} className="trait-form">
                                <input
                                    type="text"
                                    placeholder="Trait Name"
                                    value={trait.name}
                                    onChange={e => {
                                        const updatedTraits = [...newRace.traits];
                                        updatedTraits[index] = { ...trait, name: e.target.value };
                                        setNewRace(prev => ({ ...prev, traits: updatedTraits }));
                                    }}
                                />
                                <textarea
                                    placeholder="Trait Description"
                                    value={trait.description}
                                    onChange={e => {
                                        const updatedTraits = [...newRace.traits];
                                        updatedTraits[index] = { ...trait, description: e.target.value };
                                        setNewRace(prev => ({ ...prev, traits: updatedTraits }));
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="lifespan-section">
                        <h4>Lifespan</h4>
                        <div className="form-group">
                            <label>Average:</label>
                            <input
                                type="number"
                                value={newRace.lifespan.average}
                                onChange={e => setNewRace(prev => ({
                                    ...prev,
                                    lifespan: { ...prev.lifespan, average: parseInt(e.target.value) }
                                }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Maximum:</label>
                            <input
                                type="number"
                                value={newRace.lifespan.maximum}
                                onChange={e => setNewRace(prev => ({
                                    ...prev,
                                    lifespan: { ...prev.lifespan, maximum: parseInt(e.target.value) }
                                }))}
                            />
                        </div>
                    </div>

                    <div className="button-group">
                        <button onClick={handleCreateRace}>Create Race</button>
                        <button onClick={() => setShowRaceCreator(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RaceManager; 