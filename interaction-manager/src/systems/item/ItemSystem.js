class Item {
    constructor({
        id,
        name,
        description,
        category,
        subcategory,
        rarity,
        value,
        weight,
        imageUrl,
        attributes = {},
        prerequisites = {},
        effects = [],
        damage = null,
        stackable = false,
        maxStack = 1,
        consumable = false,
        tradeable = true,
        questItem = false,
        metadata = {}
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.subcategory = subcategory;
        this.rarity = rarity;
        this.value = value;
        this.weight = weight;
        this.imageUrl = imageUrl;
        this.attributes = attributes;
        this.prerequisites = prerequisites;
        this.effects = effects;
        this.damage = damage;
        this.stackable = stackable;
        this.maxStack = maxStack;
        this.consumable = consumable;
        this.tradeable = tradeable;
        this.questItem = questItem;
        this.metadata = metadata;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            subcategory: this.subcategory,
            rarity: this.rarity,
            value: this.value,
            weight: this.weight,
            imageUrl: this.imageUrl,
            attributes: this.attributes,
            prerequisites: this.prerequisites,
            effects: this.effects,
            damage: this.damage,
            stackable: this.stackable,
            maxStack: this.maxStack,
            consumable: this.consumable,
            tradeable: this.tradeable,
            questItem: this.questItem,
            metadata: this.metadata
        };
    }
}

class ItemSystem {
    constructor() {
        this.items = new Map();
        this.categories = new Set();
        this.subcategories = new Map();
        this.attributeTypes = new Set();
        this.effectTypes = new Set();
        this.damageTypes = new Set();
        this.prerequisiteTypes = new Set();
        
        // Initialize default categories
        this.initializeDefaultCategories();
    }

    initializeDefaultCategories() {
        const defaultCategories = [
            'Weapon',
            'Armor',
            'Potion',
            'Food',
            'Tool',
            'Artifact',
            'Material',
            'Quest Item',
            'Currency'
        ];

        defaultCategories.forEach(category => {
            this.categories.add(category);
            this.subcategories.set(category, new Set());
        });

        // Initialize default attribute types
        const defaultAttributes = [
            'strength',
            'dexterity',
            'constitution',
            'intelligence',
            'wisdom',
            'charisma',
            'health',
            'mana',
            'stamina',
            'armor',
            'damage',
            'criticalChance',
            'criticalDamage',
            'dodgeChance',
            'blockChance'
        ];

        defaultAttributes.forEach(attr => this.attributeTypes.add(attr));

        // Initialize default effect types
        const defaultEffects = [
            'healing',
            'manaRestore',
            'staminaRestore',
            'buff',
            'debuff',
            'status',
            'teleport',
            'summon',
            'transform'
        ];

        defaultEffects.forEach(effect => this.effectTypes.add(effect));

        // Initialize default damage types
        const defaultDamageTypes = [
            'physical',
            'fire',
            'ice',
            'lightning',
            'poison',
            'holy',
            'dark',
            'arcane'
        ];

        defaultDamageTypes.forEach(type => this.damageTypes.add(type));

        // Initialize default prerequisite types
        const defaultPrerequisites = [
            'level',
            'class',
            'race',
            'skill',
            'attribute',
            'quest',
            'reputation',
            'faction'
        ];

        defaultPrerequisites.forEach(prereq => this.prerequisiteTypes.add(prereq));
    }

    createItem(itemConfig) {
        if (!this.validateItemConfig(itemConfig)) {
            throw new Error('Invalid item configuration');
        }

        const item = new Item(itemConfig);
        this.items.set(item.id, item);
        return item;
    }

    validateItemConfig(config) {
        // Required fields validation
        const requiredFields = [
            'id', 'name', 'description', 'category',
            'rarity', 'value', 'weight'
        ];

        for (const field of requiredFields) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Category validation
        if (!this.categories.has(config.category)) {
            console.error(`Invalid category: ${config.category}`);
            return false;
        }

        // Subcategory validation
        if (config.subcategory && 
            !this.subcategories.get(config.category).has(config.subcategory)) {
            console.error(`Invalid subcategory: ${config.subcategory}`);
            return false;
        }

        // Attribute validation
        for (const [attr, value] of Object.entries(config.attributes || {})) {
            if (!this.attributeTypes.has(attr)) {
                console.error(`Invalid attribute type: ${attr}`);
                return false;
            }
        }

        // Effect validation
        for (const effect of config.effects || []) {
            if (!this.effectTypes.has(effect.type)) {
                console.error(`Invalid effect type: ${effect.type}`);
                return false;
            }
        }

        // Damage validation
        if (config.damage) {
            if (!this.damageTypes.has(config.damage.type)) {
                console.error(`Invalid damage type: ${config.damage.type}`);
                return false;
            }
        }

        // Prerequisite validation
        for (const [prereq, value] of Object.entries(config.prerequisites || {})) {
            if (!this.prerequisiteTypes.has(prereq)) {
                console.error(`Invalid prerequisite type: ${prereq}`);
                return false;
            }
        }

        return true;
    }

    getItem(id) {
        return this.items.get(id);
    }

    getAllItems() {
        return Array.from(this.items.values());
    }

    getItemsByCategory(category) {
        return Array.from(this.items.values())
            .filter(item => item.category === category);
    }

    getItemsBySubcategory(category, subcategory) {
        return Array.from(this.items.values())
            .filter(item => item.category === category && item.subcategory === subcategory);
    }

    updateItem(id, updates) {
        const item = this.items.get(id);
        if (!item) {
            throw new Error(`Item with ID ${id} not found`);
        }

        const updatedItem = new Item({
            ...item.toJSON(),
            ...updates
        });

        if (!this.validateItemConfig(updatedItem.toJSON())) {
            throw new Error('Invalid item configuration');
        }

        this.items.set(id, updatedItem);
        return updatedItem;
    }

    deleteItem(id) {
        return this.items.delete(id);
    }

    addCategory(category) {
        if (typeof category !== 'string' || category.trim() === '') {
            throw new Error('Category must be a non-empty string');
        }
        this.categories.add(category);
        this.subcategories.set(category, new Set());
        return true;
    }

    addSubcategory(category, subcategory) {
        if (!this.categories.has(category)) {
            throw new Error(`Category ${category} does not exist`);
        }
        if (typeof subcategory !== 'string' || subcategory.trim() === '') {
            throw new Error('Subcategory must be a non-empty string');
        }
        this.subcategories.get(category).add(subcategory);
        return true;
    }

    addAttributeType(attributeType) {
        if (typeof attributeType !== 'string' || attributeType.trim() === '') {
            throw new Error('Attribute type must be a non-empty string');
        }
        this.attributeTypes.add(attributeType);
        return true;
    }

    addEffectType(effectType) {
        if (typeof effectType !== 'string' || effectType.trim() === '') {
            throw new Error('Effect type must be a non-empty string');
        }
        this.effectTypes.add(effectType);
        return true;
    }

    addDamageType(damageType) {
        if (typeof damageType !== 'string' || damageType.trim() === '') {
            throw new Error('Damage type must be a non-empty string');
        }
        this.damageTypes.add(damageType);
        return true;
    }

    addPrerequisiteType(prerequisiteType) {
        if (typeof prerequisiteType !== 'string' || prerequisiteType.trim() === '') {
            throw new Error('Prerequisite type must be a non-empty string');
        }
        this.prerequisiteTypes.add(prerequisiteType);
        return true;
    }

    getCategories() {
        return Array.from(this.categories);
    }

    getSubcategories(category) {
        return Array.from(this.subcategories.get(category) || []);
    }

    getAttributeTypes() {
        return Array.from(this.attributeTypes);
    }

    getEffectTypes() {
        return Array.from(this.effectTypes);
    }

    getDamageTypes() {
        return Array.from(this.damageTypes);
    }

    getPrerequisiteTypes() {
        return Array.from(this.prerequisiteTypes);
    }

    toJSON() {
        return {
            items: Array.from(this.items.values()).map(item => item.toJSON()),
            categories: Array.from(this.categories),
            subcategories: Object.fromEntries(
                Array.from(this.subcategories.entries()).map(([category, subcats]) => [
                    category,
                    Array.from(subcats)
                ])
            ),
            attributeTypes: Array.from(this.attributeTypes),
            effectTypes: Array.from(this.effectTypes),
            damageTypes: Array.from(this.damageTypes),
            prerequisiteTypes: Array.from(this.prerequisiteTypes)
        };
    }

    fromJSON(data) {
        // Clear existing data
        this.items.clear();
        this.categories.clear();
        this.subcategories.clear();
        this.attributeTypes.clear();
        this.effectTypes.clear();
        this.damageTypes.clear();
        this.prerequisiteTypes.clear();

        // Restore categories and subcategories
        if (data.categories) {
            data.categories.forEach(category => this.categories.add(category));
        }

        if (data.subcategories) {
            Object.entries(data.subcategories).forEach(([category, subcats]) => {
                this.subcategories.set(category, new Set(subcats));
            });
        }

        // Restore types
        if (data.attributeTypes) {
            data.attributeTypes.forEach(type => this.attributeTypes.add(type));
        }

        if (data.effectTypes) {
            data.effectTypes.forEach(type => this.effectTypes.add(type));
        }

        if (data.damageTypes) {
            data.damageTypes.forEach(type => this.damageTypes.add(type));
        }

        if (data.prerequisiteTypes) {
            data.prerequisiteTypes.forEach(type => this.prerequisiteTypes.add(type));
        }

        // Restore items
        if (data.items) {
            data.items.forEach(itemData => {
                const item = new Item(itemData);
                this.items.set(item.id, item);
            });
        }

        return this;
    }
}

export default ItemSystem; 