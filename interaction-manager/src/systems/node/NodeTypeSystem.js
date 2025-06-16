class NodeType {
    constructor({
        id,
        name,
        description,
        color,
        terrainCategory,
        biomeProperties,
        dangerLevel,
        civilizationLevel,
        connectionRules,
        generationWeight,
        specialProperties = {}
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;
        this.terrainCategory = terrainCategory;
        this.biomeProperties = {
            climate: biomeProperties.climate,
            temperature: biomeProperties.temperature,
            humidity: biomeProperties.humidity,
            weather: biomeProperties.weather
        };
        this.dangerLevel = dangerLevel;
        this.civilizationLevel = civilizationLevel;
        this.connectionRules = connectionRules;
        this.generationWeight = generationWeight;
        this.specialProperties = specialProperties;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            color: this.color,
            terrainCategory: this.terrainCategory,
            biomeProperties: this.biomeProperties,
            dangerLevel: this.dangerLevel,
            civilizationLevel: this.civilizationLevel,
            connectionRules: this.connectionRules,
            generationWeight: this.generationWeight,
            specialProperties: this.specialProperties
        };
    }
}

class NodeTypeSystem {
    constructor() {
        this.nodeTypes = new Map();
        this.terrainCategories = new Set([
            'Forest',
            'Mountain',
            'Plains',
            'Desert',
            'Ocean',
            'Swamp',
            'Tundra',
            'Urban',
            'Rural',
            'Coastal'
        ]);
        this.categoryLists = {
            climates: new Set(['Tropical', 'Temperate', 'Arctic', 'Desert', 'Mediterranean']),
            temperatures: new Set(['Hot', 'Warm', 'Mild', 'Cool', 'Cold']),
            humidityLevels: new Set(['Arid', 'Dry', 'Moderate', 'Humid', 'Wet']),
            weatherTypes: new Set(['Clear', 'Cloudy', 'Rainy', 'Stormy', 'Snowy'])
        };
    }

    registerTerrainCategory(category) {
        if (typeof category !== 'string' || category.trim() === '') {
            throw new Error('Terrain category must be a non-empty string');
        }
        this.terrainCategories.add(category);
        return true;
    }

    createNodeType(nodeTypeConfig) {
        if (!this.validateNodeTypeConfig(nodeTypeConfig)) {
            throw new Error('Invalid node type configuration');
        }

        const nodeType = new NodeType(nodeTypeConfig);
        this.nodeTypes.set(nodeType.id, nodeType);
        return nodeType;
    }

    validateNodeTypeConfig(config) {
        // Required fields validation
        const requiredFields = [
            'id', 'name', 'description', 'color', 
            'terrainCategory', 'biomeProperties', 
            'dangerLevel', 'civilizationLevel'
        ];

        for (const field of requiredFields) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Terrain category validation
        if (!this.terrainCategories.has(config.terrainCategory)) {
            console.error(`Invalid terrain category: ${config.terrainCategory}`);
            return false;
        }

        // Biome properties validation
        const requiredBiomeProps = ['climate', 'temperature', 'humidity', 'weather'];
        for (const prop of requiredBiomeProps) {
            if (!config.biomeProperties || !config.biomeProperties[prop]) {
                console.error(`Missing required biome property: ${prop}`);
                return false;
            }
        }

        // Danger and civilization level validation
        if (config.dangerLevel < 1 || config.dangerLevel > 10 ||
            config.civilizationLevel < 1 || config.civilizationLevel > 10) {
            console.error('Danger and civilization levels must be between 1 and 10');
            return false;
        }

        // Add validation for biome properties against centralized lists
        const biomeProps = {
            climate: 'climates',
            temperature: 'temperatures',
            humidity: 'humidityLevels',
            weather: 'weatherTypes'
        };

        for (const [prop, category] of Object.entries(biomeProps)) {
            if (!config.biomeProperties || !config.biomeProperties[prop]) {
                console.error(`Missing required biome property: ${prop}`);
                return false;
            }
            // Automatically add new values to the centralized list
            this.addCategoryValue(category, config.biomeProperties[prop]);
        }

        return true;
    }

    getNodeType(id) {
        return this.nodeTypes.get(id);
    }

    getAllNodeTypes() {
        return Array.from(this.nodeTypes.values());
    }

    canConnect(nodeTypeId1, nodeTypeId2) {
        const node1 = this.getNodeType(nodeTypeId1);
        const node2 = this.getNodeType(nodeTypeId2);

        if (!node1 || !node2) {
            return false;
        }

        // Check connection rules for both nodes
        return node1.connectionRules.includes(node2.terrainCategory) ||
               node2.connectionRules.includes(node1.terrainCategory);
    }

    addSpecialProperty(nodeTypeId, propertyKey, propertyValue) {
        const nodeType = this.getNodeType(nodeTypeId);
        if (!nodeType) {
            throw new Error(`Node type with ID ${nodeTypeId} not found`);
        }

        nodeType.specialProperties[propertyKey] = propertyValue;
        return true;
    }

    removeSpecialProperty(nodeTypeId, propertyKey) {
        const nodeType = this.getNodeType(nodeTypeId);
        if (!nodeType) {
            throw new Error(`Node type with ID ${nodeTypeId} not found`);
        }

        delete nodeType.specialProperties[propertyKey];
        return true;
    }

    getNodesWithSpecialProperty(propertyKey) {
        return Array.from(this.nodeTypes.values())
            .filter(node => propertyKey in node.specialProperties);
    }

    addCategoryValue(category, value) {
        if (!this.categoryLists[category]) {
            throw new Error(`Invalid category: ${category}`);
        }
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error('Category value must be a non-empty string');
        }
        this.categoryLists[category].add(value.trim());
        return true;
    }

    getCategoryValues(category) {
        if (!this.categoryLists[category]) {
            throw new Error(`Invalid category: ${category}`);
        }
        return Array.from(this.categoryLists[category]);
    }

    removeCategoryValue(category, value) {
        if (!this.categoryLists[category]) {
            throw new Error(`Invalid category: ${category}`);
        }
        return this.categoryLists[category].delete(value);
    }

    toJSON() {
        return {
            nodeTypes: Array.from(this.nodeTypes.values()).map(nodeType => nodeType.toJSON()),
            terrainCategories: Array.from(this.terrainCategories),
            categoryLists: Object.fromEntries(
                Object.entries(this.categoryLists).map(([key, set]) => [key, Array.from(set)])
            )
        };
    }

    fromJSON(data) {
        // Clear existing data
        this.nodeTypes.clear();
        this.terrainCategories.clear();
        Object.values(this.categoryLists).forEach(set => set.clear());

        // Restore terrain categories
        if (data.terrainCategories) {
            data.terrainCategories.forEach(category => this.terrainCategories.add(category));
        }

        // Restore category lists
        if (data.categoryLists) {
            Object.entries(data.categoryLists).forEach(([category, values]) => {
                if (this.categoryLists[category]) {
                    values.forEach(value => this.categoryLists[category].add(value));
                }
            });
        }

        // Restore node types
        if (data.nodeTypes) {
            data.nodeTypes.forEach(nodeTypeData => {
                const nodeType = new NodeType(nodeTypeData);
                this.nodeTypes.set(nodeType.id, nodeType);
            });
        }

        return this;
    }
}

export default NodeTypeSystem;