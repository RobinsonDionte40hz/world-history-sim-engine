class WorldGenerator {
    constructor(nodeTypeSystem) {
        this.nodeTypeSystem = nodeTypeSystem;
        this.world = new Map(); // Stores the generated world nodes
        this.seed = Math.random() * 1000000; // Random seed for generation
    }

    setSeed(seed) {
        this.seed = seed;
        return this;
    }

    // Generate a new world with specified dimensions
    generateWorld(width, height) {
        this.world.clear();
        
        // Initialize the world with empty nodes
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const nodeId = `${x},${y}`;
                this.world.set(nodeId, null);
            }
        }

        // Generate terrain using noise-based approach
        this.generateTerrain(width, height);
        
        // Apply biome rules and connections
        this.applyBiomeRules();
        
        return this.world;
    }

    // Generate terrain using Perlin-like noise
    generateTerrain(width, height) {
        const nodeTypes = this.nodeTypeSystem.getAllNodeTypes();
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const nodeId = `${x},${y}`;
                
                // Generate noise values for different properties
                const elevation = this.noise(x * 0.1, y * 0.1, this.seed);
                const moisture = this.noise(x * 0.1 + 1000, y * 0.1 + 1000, this.seed);
                const temperature = this.noise(x * 0.1 + 2000, y * 0.1 + 2000, this.seed);

                // Select appropriate node type based on noise values
                const nodeType = this.selectNodeType(elevation, moisture, temperature, nodeTypes);
                
                if (nodeType) {
                    this.world.set(nodeId, {
                        type: nodeType,
                        position: { x, y },
                        properties: {
                            elevation,
                            moisture,
                            temperature
                        }
                    });
                }
            }
        }
    }

    // Apply biome rules and ensure valid connections between nodes
    applyBiomeRules() {
        const nodes = Array.from(this.world.entries());
        
        for (const [nodeId, node] of nodes) {
            if (!node) continue;
            
            const [x, y] = nodeId.split(',').map(Number);
            const neighbors = this.getNeighbors(x, y);
            
            // Check and adjust connections based on biome rules
            for (const neighbor of neighbors) {
                const neighborNode = this.world.get(neighbor);
                if (neighborNode && !this.nodeTypeSystem.canConnect(node.type.id, neighborNode.type.id)) {
                    // Adjust the node type to ensure valid connection
                    this.adjustNodeType(node, neighborNode);
                }
            }
        }
    }

    // Helper method to get neighboring node IDs
    getNeighbors(x, y) {
        return [
            `${x + 1},${y}`,
            `${x - 1},${y}`,
            `${x},${y + 1}`,
            `${x},${y - 1}`
        ];
    }

    // Select appropriate node type based on environmental factors
    selectNodeType(elevation, moisture, temperature, nodeTypes) {
        // Filter node types based on environmental conditions
        const suitableTypes = nodeTypes.filter(type => {
            const biomeProps = type.biomeProperties;
            
            // Convert temperature to a 0-1 scale
            const tempScale = (temperature + 1) / 2;
            const moistureScale = (moisture + 1) / 2;
            const elevationScale = (elevation + 1) / 2;

            // Basic matching logic - can be expanded based on specific requirements
            return this.matchesBiomeConditions(biomeProps, tempScale, moistureScale, elevationScale);
        });

        if (suitableTypes.length === 0) return null;

        // Weight the selection based on generationWeight
        const totalWeight = suitableTypes.reduce((sum, type) => sum + type.generationWeight, 0);
        let random = Math.random() * totalWeight;
        
        for (const type of suitableTypes) {
            random -= type.generationWeight;
            if (random <= 0) return type;
        }

        return suitableTypes[0];
    }

    // Check if a node type matches the given environmental conditions
    matchesBiomeConditions(biomeProps, temperature, moisture, elevation) {
        // This is a simplified matching logic - can be expanded based on specific requirements
        const tempMatch = this.matchesTemperature(biomeProps.temperature, temperature);
        const moistureMatch = this.matchesHumidity(biomeProps.humidity, moisture);
        const elevationMatch = this.matchesElevation(biomeProps.climate, elevation);

        return tempMatch && moistureMatch && elevationMatch;
    }

    // Helper methods for matching environmental conditions
    matchesTemperature(biomeTemp, temperature) {
        const tempRanges = {
            'Hot': [0.7, 1.0],
            'Warm': [0.5, 0.8],
            'Mild': [0.3, 0.6],
            'Cool': [0.2, 0.4],
            'Cold': [0.0, 0.3]
        };
        
        const range = tempRanges[biomeTemp] || [0, 1];
        return temperature >= range[0] && temperature <= range[1];
    }

    matchesHumidity(biomeHumidity, moisture) {
        const humidityRanges = {
            'Arid': [0.0, 0.2],
            'Dry': [0.2, 0.4],
            'Moderate': [0.4, 0.6],
            'Humid': [0.6, 0.8],
            'Wet': [0.8, 1.0]
        };
        
        const range = humidityRanges[biomeHumidity] || [0, 1];
        return moisture >= range[0] && moisture <= range[1];
    }

    matchesElevation(biomeClimate, elevation) {
        const elevationRanges = {
            'Tropical': [0.0, 0.4],
            'Temperate': [0.2, 0.6],
            'Arctic': [0.6, 1.0],
            'Desert': [0.0, 0.3],
            'Mediterranean': [0.3, 0.7]
        };
        
        const range = elevationRanges[biomeClimate] || [0, 1];
        return elevation >= range[0] && elevation <= range[1];
    }

    // Adjust node type to ensure valid connections
    adjustNodeType(node, neighborNode) {
        const nodeTypes = this.nodeTypeSystem.getAllNodeTypes();
        const suitableTypes = nodeTypes.filter(type => 
            this.nodeTypeSystem.canConnect(type.id, neighborNode.type.id)
        );

        if (suitableTypes.length > 0) {
            // Select the most similar type to maintain world consistency
            const newType = this.findMostSimilarType(suitableTypes, node.type);
            node.type = newType;
        }
    }

    // Find the most similar node type to maintain world consistency
    findMostSimilarType(suitableTypes, originalType) {
        return suitableTypes.reduce((mostSimilar, current) => {
            const currentSimilarity = this.calculateTypeSimilarity(current, originalType);
            const mostSimilarSimilarity = this.calculateTypeSimilarity(mostSimilar, originalType);
            return currentSimilarity > mostSimilarSimilarity ? current : mostSimilar;
        });
    }

    // Calculate similarity between two node types
    calculateTypeSimilarity(type1, type2) {
        let similarity = 0;
        
        // Compare terrain categories
        if (type1.terrainCategory === type2.terrainCategory) similarity += 2;
        
        // Compare biome properties
        if (type1.biomeProperties.climate === type2.biomeProperties.climate) similarity += 1;
        if (type1.biomeProperties.temperature === type2.biomeProperties.temperature) similarity += 1;
        if (type1.biomeProperties.humidity === type2.biomeProperties.humidity) similarity += 1;
        
        // Compare danger and civilization levels
        similarity -= Math.abs(type1.dangerLevel - type2.dangerLevel) * 0.5;
        similarity -= Math.abs(type1.civilizationLevel - type2.civilizationLevel) * 0.5;
        
        return similarity;
    }

    // Simple noise function (can be replaced with a proper Perlin noise implementation)
    noise(x, y, seed) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(seed) & 255;
        
        const n = X + Y * 57 + Z * 113;
        return Math.sin(n * 0.01) * 2 - 1;
    }

    // Get the generated world
    getWorld() {
        return this.world;
    }

    // Export the world data
    exportWorld() {
        const worldData = {};
        for (const [nodeId, node] of this.world.entries()) {
            if (node) {
                worldData[nodeId] = {
                    type: node.type.id,
                    position: node.position,
                    properties: node.properties
                };
            }
        }
        return worldData;
    }
}

export default WorldGenerator; 