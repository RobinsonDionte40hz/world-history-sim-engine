class WorldNodeSystem {
    constructor(nodeTypeSystem, connectionSystem) {
        this.nodeTypeSystem = nodeTypeSystem;
        this.connectionSystem = connectionSystem;
        this.worlds = new Map();
    }

    createWorld(config) {
        if (!this.validateWorldConfig(config)) {
            throw new Error('Invalid world configuration');
        }

        const world = {
            id: config.id,
            name: config.name,
            description: config.description,
            includedNodes: new Set(config.includedNodes || []),
            nodeConnections: new Map(config.nodeConnections || []),
            metadata: config.metadata || {}
        };

        this.worlds.set(world.id, world);
        return world;
    }

    validateWorldConfig(config) {
        const requiredFields = ['id', 'name', 'description'];
        for (const field of requiredFields) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Validate that all included nodes exist
        if (config.includedNodes) {
            for (const nodeId of config.includedNodes) {
                if (!this.nodeTypeSystem.getNodeType(nodeId)) {
                    console.error(`Invalid node ID: ${nodeId}`);
                    return false;
                }
            }
        }

        return true;
    }

    getWorld(id) {
        return this.worlds.get(id);
    }

    getAllWorlds() {
        return Array.from(this.worlds.values());
    }

    updateWorld(id, updates) {
        const world = this.worlds.get(id);
        if (!world) {
            throw new Error(`World with ID ${id} not found`);
        }

        const updatedWorld = {
            ...world,
            ...updates,
            includedNodes: new Set(updates.includedNodes || world.includedNodes),
            nodeConnections: new Map(updates.nodeConnections || world.nodeConnections)
        };

        this.worlds.set(id, updatedWorld);
        return updatedWorld;
    }

    deleteWorld(id) {
        return this.worlds.delete(id);
    }

    addNodeToWorld(worldId, nodeId) {
        const world = this.worlds.get(worldId);
        if (!world) {
            throw new Error(`World with ID ${worldId} not found`);
        }

        if (!this.nodeTypeSystem.getNodeType(nodeId)) {
            throw new Error(`Node with ID ${nodeId} not found`);
        }

        world.includedNodes.add(nodeId);
        return true;
    }

    removeNodeFromWorld(worldId, nodeId) {
        const world = this.worlds.get(worldId);
        if (!world) {
            throw new Error(`World with ID ${worldId} not found`);
        }

        world.includedNodes.delete(nodeId);
        // Also remove any connections involving this node
        for (const [key, value] of world.nodeConnections) {
            if (key.includes(nodeId)) {
                world.nodeConnections.delete(key);
            }
        }
        return true;
    }

    addConnectionToWorld(worldId, nodeId1, nodeId2) {
        const world = this.worlds.get(worldId);
        if (!world) {
            throw new Error(`World with ID ${worldId} not found`);
        }

        if (!world.includedNodes.has(nodeId1) || !world.includedNodes.has(nodeId2)) {
            throw new Error('Both nodes must be included in the world');
        }

        const connectionKey = `${nodeId1}-${nodeId2}`;
        world.nodeConnections.set(connectionKey, {
            node1: nodeId1,
            node2: nodeId2,
            type: 'default'
        });

        return true;
    }

    removeConnectionFromWorld(worldId, nodeId1, nodeId2) {
        const world = this.worlds.get(worldId);
        if (!world) {
            throw new Error(`World with ID ${worldId} not found`);
        }

        const connectionKey = `${nodeId1}-${nodeId2}`;
        return world.nodeConnections.delete(connectionKey);
    }

    getWorldConnections(worldId) {
        const world = this.worlds.get(worldId);
        if (!world) {
            throw new Error(`World with ID ${worldId} not found`);
        }

        return Array.from(world.nodeConnections.values());
    }

    getWorldNodes(worldId) {
        const world = this.worlds.get(worldId);
        if (!world) {
            throw new Error(`World with ID ${worldId} not found`);
        }

        return Array.from(world.includedNodes).map(nodeId => 
            this.nodeTypeSystem.getNodeType(nodeId)
        );
    }

    toJSON() {
        return {
            worlds: Array.from(this.worlds.values()).map(world => ({
                ...world,
                includedNodes: Array.from(world.includedNodes),
                nodeConnections: Array.from(world.nodeConnections.entries())
            }))
        };
    }

    fromJSON(data) {
        // Clear existing data
        this.worlds.clear();

        // Restore worlds
        if (data.worlds) {
            data.worlds.forEach(worldData => {
                const world = {
                    ...worldData,
                    includedNodes: new Set(worldData.includedNodes),
                    nodeConnections: new Map(worldData.nodeConnections)
                };
                this.worlds.set(world.id, world);
            });
        }

        return this;
    }
}

export default WorldNodeSystem; 