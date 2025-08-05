/**
 * WorldSaveManager - Integrated world saving orchestrator
 * 
 * Bridges EditorStateManager and WorldPersistenceService to provide
 * smooth, coordinated world saving with proper state management.
 * 
 * This service handles the complete save flow:
 * 1. Get world data from EditorStateManager
 * 2. Save to persistence service
 * 3. Update current world reference
 * 4. Reset unsaved changes flag
 */

import { EventEmitter } from 'events';
import editorStateManager from './EditorStateManager';
import worldPersistenceService from './WorldPersistenceService';

class WorldSaveManager extends EventEmitter {
    constructor() {
        super();

        this.saveInProgress = false;
        this.autoSaveEnabled = false;
        this.autoSaveInterval = null;
        this.autoSaveDelay = 30000; // 30 seconds

        // Bind methods
        this.saveWorld = this.saveWorld.bind(this);
        this.loadWorld = this.loadWorld.bind(this);
        this.enableAutoSave = this.enableAutoSave.bind(this);
        this.disableAutoSave = this.disableAutoSave.bind(this);

        // Listen for editor changes to trigger auto-save
        this._setupAutoSaveListeners();
    }

    /**
     * Save the current world with full state management
     * @param {Object} options - Save options
     * @returns {Promise<Object>} Saved world data
     */
    async saveWorld(options = {}) {
        if (this.saveInProgress) {
            throw new Error('Save already in progress');
        }

        try {
            this.saveInProgress = true;

            // 1. Set saving status
            editorStateManager.setSaveStatus('saving', 'Preparing world data...');
            this.emit('saveStarted');

            // 2. Get world data from EditorStateManager
            const worldData = this._collectWorldData();

            // 3. Validate world data before saving
            const validation = worldPersistenceService.validateWorldData(worldData);
            if (!validation.isValid) {
                throw new Error(`World validation failed: ${validation.errors.join(', ')}`);
            }

            // 4. Save to persistence service
            editorStateManager.setSaveStatus('saving', 'Saving world data...');
            const savedWorld = await worldPersistenceService.saveWorld(worldData);

            // 5. Load the complete world data back (including any auto-generated fields)
            editorStateManager.setSaveStatus('saving', 'Loading complete world data...');
            const completeWorld = await worldPersistenceService.loadWorld(savedWorld.id);

            // 6. Update current world reference with COMPLETE data
            editorStateManager.setCurrentWorld(completeWorld);

            // 7. Force refresh of editor data with complete world data
            editorStateManager.updateEditorData('world', null, completeWorld);

            // 8. Reset unsaved changes flag
            editorStateManager.setUnsavedChanges(false);

            // 9. Set save status to completed
            editorStateManager.setSaveStatus('saved', 'World saved successfully');

            // 10. Emit success event with complete world data
            this.emit('saveCompleted', completeWorld);

            return completeWorld;

        } catch (error) {
            // Handle save error
            editorStateManager.setSaveStatus('error', error.message);
            this.emit('saveError', error);
            throw error;

        } finally {
            this.saveInProgress = false;
        }
    }

    /**
     * Load a world with full state management
     * @param {string} worldId - ID of world to load
     * @returns {Promise<Object>} Loaded world data
     */
    async loadWorld(worldId) {
        try {
            this.emit('loadStarted', worldId);
            editorStateManager.setSaveStatus('saving', 'Loading world...');

            // 1. Load complete world data from persistence service
            const worldData = await worldPersistenceService.loadWorld(worldId);

            // 2. Update editor state with complete loaded world data
            this._populateEditorState(worldData);

            // 3. Set current world reference with complete data
            editorStateManager.setCurrentWorld(worldData);

            // 4. Ensure world data is also set in editor data
            editorStateManager.updateEditorData('world', null, worldData);

            // 5. Reset unsaved changes
            editorStateManager.setUnsavedChanges(false);
            editorStateManager.setSaveStatus('saved', 'World loaded successfully');

            // 6. Emit success event with complete data
            this.emit('loadCompleted', worldData);

            return worldData;

        } catch (error) {
            editorStateManager.setSaveStatus('error', error.message);
            this.emit('loadError', error);
            throw error;
        }
    }

    /**
     * Save world nodes with state coordination
     * @param {string} worldId - ID of world
     * @param {Object} nodeData - Node data to save
     * @returns {Promise<Object>} Saved node data
     */
    async saveNode(worldId, nodeData) {
        try {
            // Save node to persistence
            const savedNode = await worldPersistenceService.saveNode(worldId, nodeData);

            // Update editor state
            editorStateManager.updateEditorData('nodes', savedNode.id, savedNode);

            // Mark as having unsaved changes (for world-level save)
            editorStateManager.setUnsavedChanges(true);

            this.emit('nodeSaved', savedNode);
            return savedNode;

        } catch (error) {
            this.emit('nodeSaveError', error);
            throw error;
        }
    }

    /**
     * Check if world can be saved
     * @returns {boolean} Whether world can be saved
     */
    canSaveWorld() {
        const worldData = editorStateManager.getEditorData('world');
        return !!(worldData && worldData.name && worldData.description);
    }

    /**
     * Get save status information
     * @returns {Object} Current save status
     */
    getSaveStatus() {
        const state = editorStateManager.getState();
        return {
            canSave: this.canSaveWorld(),
            hasUnsavedChanges: state.hasUnsavedChanges,
            saveStatus: state.saveStatus,
            saveInProgress: this.saveInProgress,
            autoSaveEnabled: this.autoSaveEnabled
        };
    }

    /**
     * Enable auto-save functionality
     * @param {number} delay - Auto-save delay in milliseconds
     */
    enableAutoSave(delay = this.autoSaveDelay) {
        this.autoSaveDelay = delay;
        this.autoSaveEnabled = true;

        // Enable auto-save in EditorStateManager as well
        editorStateManager.enableAutoSave(delay);

        this.emit('autoSaveEnabled', delay);
    }

    /**
     * Disable auto-save functionality
     */
    disableAutoSave() {
        this.autoSaveEnabled = false;

        // Disable auto-save in EditorStateManager as well
        editorStateManager.disableAutoSave();

        if (this.autoSaveInterval) {
            clearTimeout(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        this.emit('autoSaveDisabled');
    }

    /**
     * Trigger auto-save if conditions are met
     */
    async triggerAutoSave() {
        if (!this.autoSaveEnabled || this.saveInProgress) {
            return;
        }

        const state = editorStateManager.getState();
        if (state.hasUnsavedChanges && this.canSaveWorld()) {
            try {
                await this.saveWorld({ autoSave: true });
                this.emit('autoSaveCompleted');
            } catch (error) {
                this.emit('autoSaveError', error);
            }
        }
    }

    /**
     * Create a new world with proper initialization
     * @param {Object} worldData - Initial world data
     * @returns {Promise<Object>} Created world data
     */
    async createNewWorld(worldData) {
        try {
            // Reset editor state for new world
            editorStateManager.reset();

            // Set world editor as current
            editorStateManager.setCurrentEditor('world');

            // Update editor data with new world
            editorStateManager.updateEditorData('world', null, worldData);

            // Save the new world
            const savedWorld = await this.saveWorld();

            this.emit('worldCreated', savedWorld);
            return savedWorld;

        } catch (error) {
            this.emit('worldCreateError', error);
            throw error;
        }
    }

    /**
     * Delete world with state cleanup
     * @param {string} worldId - ID of world to delete
     */
    async deleteWorld(worldId) {
        try {
            // Delete from persistence
            await worldPersistenceService.deleteWorld(worldId);

            // If this was the current world, reset editor state
            const currentWorld = editorStateManager.getState().currentWorld;
            if (currentWorld && currentWorld.id === worldId) {
                editorStateManager.reset();
            }

            this.emit('worldDeleted', worldId);

        } catch (error) {
            this.emit('worldDeleteError', error);
            throw error;
        }
    }

    /**
     * Enhanced navigation that maintains world context
     * @param {string} editorType - Target editor type
     * @param {Object} options - Navigation options
     * @returns {Promise<boolean>} Whether navigation was successful
     */
    async navigateToEditor(editorType, options = {}) {
        try {
            const {
                forceSave = false,
                skipSavePrompt = false,
                onNavigationStart = null,
                onNavigationComplete = null
            } = options;

            // Emit navigation start event
            this.emit('navigationStarted', { from: editorStateManager.getState().currentEditor, to: editorType });
            if (onNavigationStart) onNavigationStart();

            // Check if we have unsaved changes
            const state = editorStateManager.getState();
            if (state.hasUnsavedChanges && !skipSavePrompt) {
                if (forceSave || this.canSaveWorld()) {
                    // Auto-save before navigation
                    await this.saveWorld({ autoSave: true, reason: 'navigation' });
                } else {
                    // Emit event for UI to handle save prompt
                    const shouldSave = await new Promise((resolve) => {
                        this.emit('navigationSavePrompt', {
                            from: state.currentEditor,
                            to: editorType,
                            resolve
                        });
                    });

                    if (shouldSave && this.canSaveWorld()) {
                        await this.saveWorld({ reason: 'navigation' });
                    }
                }
            }

            // Validate navigation is allowed
            const availableEditors = editorStateManager.getAvailableEditors();
            if (!availableEditors.includes(editorType)) {
                throw new Error(`Cannot navigate to ${editorType}. Editor not available. Available: ${availableEditors.join(', ')}`);
            }

            // Perform navigation
            const previousEditor = state.currentEditor;
            editorStateManager.setCurrentEditor(editorType);

            // Emit navigation complete event
            this.emit('navigationCompleted', {
                from: previousEditor,
                to: editorType,
                worldId: state.currentWorld?.id
            });
            if (onNavigationComplete) onNavigationComplete();

            return true;

        } catch (error) {
            this.emit('navigationError', {
                from: editorStateManager.getState().currentEditor,
                to: editorType,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get navigation context for current world
     * @returns {Object} Navigation context
     */
    getNavigationContext() {
        const state = editorStateManager.getState();
        return {
            currentEditor: state.currentEditor,
            currentWorld: state.currentWorld,
            availableEditors: editorStateManager.getAvailableEditors(),
            hasUnsavedChanges: state.hasUnsavedChanges,
            canNavigate: this._canNavigateAway(),
            navigationHistory: state.navigationHistory
        };
    }

    /**
     * Save current work before navigation
     * @returns {Promise<Object|null>} Saved world data or null if nothing to save
     */
    async saveCurrentWork() {
        const state = editorStateManager.getState();

        if (state.hasUnsavedChanges && this.canSaveWorld()) {
            return await this.saveWorld({ reason: 'navigation' });
        }

        return null;
    }

    /**
     * Navigate with world context preservation
     * @param {string} path - Navigation path
     * @param {Object} options - Navigation options
     */
    navigateWithContext(path, options = {}) {
        const state = editorStateManager.getState();
        const worldId = state.currentWorld?.id;

        // Construct URL with world context
        const url = new URL(path, window.location.origin);
        if (worldId) {
            url.searchParams.set('worldId', worldId);
        }

        // Add current editor context
        if (state.currentEditor) {
            url.searchParams.set('fromEditor', state.currentEditor);
        }

        this.emit('contextualNavigation', {
            path: url.pathname + url.search,
            worldId,
            fromEditor: state.currentEditor
        });

        // Use provided navigation method or default
        if (options.navigate) {
            options.navigate(url.pathname + url.search);
        } else if (window.history) {
            window.history.pushState({}, '', url.pathname + url.search);
        }
    }

    // Private methods

    /**
     * Check if navigation away from current editor is safe
     * @returns {boolean} Whether navigation is allowed
     */
    _canNavigateAway() {
        const state = editorStateManager.getState();

        // Always allow navigation if no unsaved changes
        if (!state.hasUnsavedChanges) {
            return true;
        }

        // Allow navigation if we can auto-save
        if (this.canSaveWorld()) {
            return true;
        }

        // Otherwise, require user confirmation
        return false;
    }

    /**
     * Collect all world data from editor state
     * @returns {Object} Complete world data
     */
    _collectWorldData() {
        const worldData = editorStateManager.getEditorData('world') || {};
        const nodesData = editorStateManager.getEditorData('nodes') || {};
        const charactersData = editorStateManager.getEditorData('characters') || {};
        const interactionsData = editorStateManager.getEditorData('interactions') || {};
        const encountersData = editorStateManager.getEditorData('encounters') || {};

        // Convert object maps to arrays for persistence
        const nodes = Object.values(nodesData);
        const characters = Object.values(charactersData);
        const interactions = Object.values(interactionsData);
        const encounters = Object.values(encountersData);

        // Get node populations from WorldBuilder
        const worldBuilder = editorStateManager.worldBuilder;
        const nodePopulations = worldBuilder?.worldConfig?.nodePopulations || {};

        // Get current world reference for additional data
        const currentWorld = editorStateManager.getState().currentWorld || {};

        // Merge all data sources, preserving existing fields
        return {
            // Start with current world data (includes id, version, etc.)
            ...currentWorld,
            // Override with editor data
            ...worldData,
            // Add component arrays
            nodes,
            characters,
            interactions,
            encounters,
            nodePopulations,
            // Update timestamp
            lastModified: new Date().toISOString(),
            // Preserve WorldBuilder state
            currentStep: worldBuilder?.currentStep || worldData.currentStep
        };
    }

    /**
     * Populate editor state with loaded world data
     * @param {Object} worldData - World data to populate
     */
    _populateEditorState(worldData) {
        // Set complete world data (preserve all fields from persistence)
        editorStateManager.updateEditorData('world', null, {
            id: worldData.id,
            name: worldData.name,
            description: worldData.description,
            rules: worldData.rules,
            initialConditions: worldData.initialConditions,
            lastModified: worldData.lastModified,
            version: worldData.version,
            currentStep: worldData.currentStep,
            // Include any other fields that might be present
            ...worldData
        });

        // Clear existing data before populating
        editorStateManager.updateEditorData('nodes', null, {});
        editorStateManager.updateEditorData('characters', null, {});
        editorStateManager.updateEditorData('interactions', null, {});
        editorStateManager.updateEditorData('encounters', null, {});

        // Populate nodes
        if (worldData.nodes) {
            worldData.nodes.forEach(node => {
                editorStateManager.updateEditorData('nodes', node.id, node);
            });
        }

        // Populate characters
        if (worldData.characters) {
            worldData.characters.forEach(character => {
                editorStateManager.updateEditorData('characters', character.id, character);
            });
        }

        // Populate interactions
        if (worldData.interactions) {
            worldData.interactions.forEach(interaction => {
                editorStateManager.updateEditorData('interactions', interaction.id, interaction);
            });
        }

        // Populate encounters
        if (worldData.encounters) {
            worldData.encounters.forEach(encounter => {
                editorStateManager.updateEditorData('encounters', encounter.id, encounter);
            });
        }

        // Restore node populations
        if (worldData.nodePopulations) {
            Object.entries(worldData.nodePopulations).forEach(([nodeId, characterIds]) => {
                editorStateManager.assignCharactersToNode(nodeId, characterIds);
            });
        }

        // Update WorldBuilder instance with complete world data
        if (editorStateManager.worldBuilder) {
            editorStateManager.worldBuilder.worldConfig = {
                ...editorStateManager.worldBuilder.worldConfig,
                ...worldData
            };
            
            if (worldData.currentStep) {
                editorStateManager.worldBuilder.currentStep = worldData.currentStep;
            }
        }
    }

    /**
     * Setup auto-save listeners
     */
    _setupAutoSaveListeners() {
        // Listen for editor data changes
        editorStateManager.on('editorDataChanged', () => {
            if (this.autoSaveEnabled && !this.saveInProgress) {
                // Clear existing timeout
                if (this.autoSaveInterval) {
                    clearTimeout(this.autoSaveInterval);
                }

                // Set new timeout for auto-save
                this.autoSaveInterval = setTimeout(() => {
                    this.triggerAutoSave();
                }, this.autoSaveDelay);
            }
        });

        // Listen for unsaved changes
        editorStateManager.on('unsavedChangesChanged', (hasChanges) => {
            if (hasChanges && this.autoSaveEnabled && !this.saveInProgress) {
                // Trigger auto-save after delay
                if (this.autoSaveInterval) {
                    clearTimeout(this.autoSaveInterval);
                }

                this.autoSaveInterval = setTimeout(() => {
                    this.triggerAutoSave();
                }, this.autoSaveDelay);
            }
        });
    }
}

// Create singleton instance
const worldSaveManager = new WorldSaveManager();

export default worldSaveManager;
export { WorldSaveManager };