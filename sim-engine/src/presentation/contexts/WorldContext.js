/**
 * WorldContext - Context for managing multiple worlds with unique IDs
 * 
 * Provides world state management, world switching, and persistence
 * across the application. Supports multiple worlds with unique identifiers.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import TemplateManager from '../../template/TemplateManager';

const WorldContext = createContext();

export const WorldProvider = ({ children }) => {
    // Initialize template manager
    const [templateManager] = useState(() => new TemplateManager());

    // World management state
    const [currentWorldId, setCurrentWorldId] = useState(null);
    const [worlds, setWorlds] = useState(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Template manager for world operations

    // Load worlds from localStorage on mount
    useEffect(() => {
        const loadWorlds = async () => {
            try {
                setIsLoading(true);
                const savedWorlds = localStorage.getItem('worlds');
                const savedCurrentWorldId = localStorage.getItem('currentWorldId');

                if (savedWorlds) {
                    const worldsData = JSON.parse(savedWorlds);
                    const worldsMap = new Map();

                    Object.entries(worldsData).forEach(([id, worldData]) => {
                        worldsMap.set(id, {
                            id,
                            ...worldData,
                            lastModified: new Date(worldData.lastModified || Date.now())
                        });
                    });

                    setWorlds(worldsMap);

                    // Set current world after worlds are loaded
                    if (savedCurrentWorldId && worldsMap.has(savedCurrentWorldId)) {
                        setCurrentWorldId(savedCurrentWorldId);
                    }
                }

                setError(null);
            } catch (err) {
                setError(`Failed to load worlds: ${err.message}`);
                console.error('Error loading worlds:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadWorlds();
    }, []); // Empty dependency array is correct for mount-only effect

    // Optimized persistence with debouncing to reduce localStorage writes
    useEffect(() => {
        if (worlds.size > 0) { // Only save if we have worlds to avoid saving empty state on mount
            // Debounce persistence to avoid excessive localStorage writes
            const timeoutId = setTimeout(() => {
                try {
                    const worldsData = {};
                    worlds.forEach((world, id) => {
                        worldsData[id] = {
                            ...world,
                            lastModified: world.lastModified.toISOString()
                        };
                    });

                    // Batch localStorage operations
                    localStorage.setItem('worlds', JSON.stringify(worldsData));
                    if (currentWorldId) {
                        localStorage.setItem('currentWorldId', currentWorldId);
                    }

                    console.log('Worlds persisted to localStorage');
                } catch (err) {
                    console.error('Error saving worlds:', err);
                    setError(`Failed to save worlds: ${err.message}`);
                }
            }, 100); // 100ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [worlds, currentWorldId]);





    // Create a new world with optimistic updates
    const createWorld = useCallback(async (name, description) => {
        try {
            const worldId = `world_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            const newWorld = {
                id: worldId,
                name: name || `World ${worlds.size + 1}`,
                description: description || 'A new world to explore',
                created: new Date(),
                lastModified: new Date(),
                worldConfig: {
                    name: name || `World ${worlds.size + 1}`,
                    description: description || 'A new world to explore',
                    rules: null,
                    initialConditions: null,
                    nodes: [],
                    interactions: [],
                    characters: [],
                    nodePopulations: {},
                    isComplete: false,
                    isValid: false,
                    stepValidation: {
                        1: false,
                        2: false,
                        3: false,
                        4: false,
                        5: false,
                        6: false
                    }
                }
            };

            // Optimistic update - immediately update UI state
            setWorlds(prev => new Map(prev).set(worldId, newWorld));
            setCurrentWorldId(worldId);
            setError(null);

            // Async persistence happens in background via useEffect
            // No need to await here - the UI is already updated

            return worldId;
        } catch (err) {
            setError(`Failed to create world: ${err.message}`);
            throw err;
        }
    }, [worlds]);

    // Switch to a different world
    const switchToWorld = useCallback((worldId) => {
        if (!worlds.has(worldId)) {
            throw new Error(`World ${worldId} does not exist`);
        }

        setCurrentWorldId(worldId);
        setError(null);
    }, [worlds]);

    // Delete a world
    const deleteWorld = useCallback((worldId) => {
        if (!worlds.has(worldId)) {
            throw new Error(`World ${worldId} does not exist`);
        }

        const newWorlds = new Map(worlds);
        newWorlds.delete(worldId);
        setWorlds(newWorlds);

        // If we deleted the current world, switch to another or clear
        if (currentWorldId === worldId) {
            const remainingWorlds = Array.from(newWorlds.keys());
            setCurrentWorldId(remainingWorlds.length > 0 ? remainingWorlds[0] : null);
        }

        setError(null);
    }, [worlds, currentWorldId]);

    // Update current world's config
    const updateWorldConfig = useCallback((updates) => {
        if (!currentWorldId || !worlds.has(currentWorldId)) {
            throw new Error('No current world to update');
        }

        const currentWorld = worlds.get(currentWorldId);
        const updatedWorld = {
            ...currentWorld,
            worldConfig: {
                ...currentWorld.worldConfig,
                ...updates
            },
            lastModified: new Date()
        };

        setWorlds(prev => new Map(prev).set(currentWorldId, updatedWorld));
        setError(null);
    }, [currentWorldId, worlds]);

    // Import demo world as a regular editable world
    const importDemoWorld = useCallback(async (demoWorldData, demoInfo) => {
        try {
            const worldId = `demo_imported_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            
            // Convert demo world data to regular world config format
            const worldConfig = {
                name: demoWorldData.name || demoInfo?.name || 'Imported Demo World',
                description: demoWorldData.description || demoInfo?.description || 'A demo world imported for editing',
                rules: demoWorldData.rules || null,
                initialConditions: demoWorldData.initialConditions || null,
                nodes: demoWorldData.nodes || [],
                interactions: demoWorldData.interactions || [],
                characters: demoWorldData.characters || [],
                nodePopulations: {},
                isComplete: true, // Demo worlds are complete by definition
                isValid: true,
                stepValidation: {
                    1: true, // Foundation - has name/description/rules
                    2: true, // Locations - has nodes
                    3: true, // Capabilities - has interactions
                    4: true, // Actors - has characters
                    5: true, // Assignments - characters are assigned
                    6: true  // Ready for simulation
                },
                isDemoImport: true,
                originalDemoId: demoInfo?.id || 'unknown_demo'
            };

            const newWorld = {
                id: worldId,
                name: worldConfig.name,
                description: worldConfig.description,
                created: new Date(),
                lastModified: new Date(),
                worldConfig
            };

            // Add to worlds collection
            const newWorlds = new Map(worlds);
            newWorlds.set(worldId, newWorld);
            setWorlds(newWorlds);

            // Switch to the new world
            setCurrentWorldId(worldId);
            setError(null);

            console.log(`Demo world "${newWorld.name}" imported as regular world with ID: ${worldId}`);
            return worldId;
            
        } catch (err) {
            setError(`Failed to import demo world: ${err.message}`);
            throw err;
        }
    }, [worlds]);

    // Get current world
    const getCurrentWorld = useCallback(() => {
        if (!currentWorldId || !worlds.has(currentWorldId)) {
            return null;
        }
        return worlds.get(currentWorldId);
    }, [currentWorldId, worlds]);

    // Get all worlds as array
    const getAllWorlds = useCallback(() => {
        return Array.from(worlds.values()).sort((a, b) =>
            new Date(b.lastModified) - new Date(a.lastModified)
        );
    }, [worlds]);

    // Simple sync - no world builder, just direct world management
    useEffect(() => {
        // Any additional sync logic would go here if needed
        // Currently just managing worlds directly through WorldContext
    }, [currentWorldId]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = React.useMemo(() => ({
        // World management
        currentWorldId,
        worlds: getAllWorlds(),
        currentWorld: getCurrentWorld(),
        isLoading,
        error,

        // World operations
        createWorld,
        switchToWorld,
        deleteWorld,
        updateWorldConfig,
        importDemoWorld,

        // Template management
        templateManager,

        // Computed properties
        hasWorlds: worlds.size > 0,
        worldCount: worlds.size
    }), [
        currentWorldId,
        getAllWorlds,
        getCurrentWorld,
        isLoading,
        error,
        createWorld,
        switchToWorld,
        deleteWorld,
        updateWorldConfig,
        importDemoWorld,
        templateManager,
        worlds.size
    ]);

    return (
        <WorldContext.Provider value={contextValue}>
            {children}
        </WorldContext.Provider>
    );
};

export const useWorldContext = () => {
    const context = useContext(WorldContext);
    if (!context) {
        throw new Error('useWorldContext must be used within a WorldProvider');
    }
    return context;
};

export default WorldContext;