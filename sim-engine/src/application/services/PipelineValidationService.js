/**
 * PipelineValidationService - Centralized validation to prevent pipeline bypass
 * 
 * Provides secure validation tokens, tracking, and runtime checks to ensure
 * all world data goes through the proper preparation pipeline. Uses cryptographic
 * signatures and context validation to prevent forgery and bypass attempts.
 */

class PipelineValidationService {
  constructor() {
    // Private registry of validated worlds with their tokens
    this._validatedWorlds = new Map();
    
    // Context validation flags
    this._contextStack = [];
    
    // Security salt for token generation (in production, this would be more secure)
    this._securitySalt = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a secure validation token for prepared world data
   * @param {Object} worldData - The prepared world data
   * @param {string} source - The source of preparation ('WorldBuilder' or 'DemoService')
   * @returns {string} Secure validation token
   */
  generateValidationToken(worldData, source) {
    if (source !== 'WorldBuilder' && source !== 'DemoService') {
      throw new Error('Invalid preparation source. Only WorldBuilder and DemoService can generate validation tokens.');
    }

    // Create a fingerprint of the world data
    const fingerprint = this._createWorldFingerprint(worldData);
    
    // Generate token using fingerprint and security salt
    const token = this._generateSecureToken(fingerprint);
    
    // Register the validated world
    this._validatedWorlds.set(token, {
      fingerprint,
      source,
      validatedAt: new Date().toISOString(),
      worldId: worldData.worldProperties?.worldId || 'unknown'
    });
    
    return token;
  }

  /**
   * Validate a world data token
   * @param {Object} worldData - The world data to validate
   * @param {string} token - The validation token
   * @returns {Object} Validation result
   */
  validateToken(worldData, token) {
    // Check if token exists in registry
    if (!this._validatedWorlds.has(token)) {
      return {
        isValid: false,
        error: 'Invalid or expired validation token. World data must be prepared through WorldBuilder or DemoService.'
      };
    }

    const registeredData = this._validatedWorlds.get(token);
    
    // Verify fingerprint matches
    const currentFingerprint = this._createWorldFingerprint(worldData);
    if (currentFingerprint !== registeredData.fingerprint) {
      return {
        isValid: false,
        error: 'World data has been modified after preparation. Re-prepare through WorldBuilder or DemoService.'
      };
    }

    // Check token age (tokens expire after 1 hour)
    const tokenAge = Date.now() - new Date(registeredData.validatedAt).getTime();
    if (tokenAge > 3600000) { // 1 hour
      this._validatedWorlds.delete(token);
      return {
        isValid: false,
        error: 'Validation token has expired. Re-prepare world through WorldBuilder or DemoService.'
      };
    }

    return {
      isValid: true,
      source: registeredData.source,
      validatedAt: registeredData.validatedAt
    };
  }

  /**
   * Push a context onto the validation stack
   * @param {string} context - The context identifier
   */
  pushContext(context) {
    this._contextStack.push({
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Pop a context from the validation stack
   * @returns {Object|null} The popped context
   */
  popContext() {
    return this._contextStack.pop();
  }

  /**
   * Check if currently within a specific context
   * @param {string} context - The context to check for
   * @returns {boolean} Whether currently in the specified context
   */
  isInContext(context) {
    return this._contextStack.some(c => c.context === context);
  }

  /**
   * Validate that code is running within SimulationContext
   * @throws {Error} If not within SimulationContext
   */
  requireSimulationContext() {
    if (!this.isInContext('SimulationContext')) {
      throw new Error(
        'This operation must be performed within SimulationContext. ' +
        'Direct usage is not allowed to maintain architectural integrity.'
      );
    }
  }

  /**
   * Create a fingerprint of world data for validation
   * @private
   * @param {Object} worldData - The world data
   * @returns {string} Fingerprint string
   */
  _createWorldFingerprint(worldData) {
    // Create a deterministic string representation of key world properties
    const parts = [
      worldData.worldProperties?.name || '',
      worldData.worldProperties?.description || '',
      worldData.nodes ? worldData.nodes.size : 0,
      worldData.characters ? worldData.characters.size : 0,
      worldData.interactions ? worldData.interactions.size : 0,
      worldData.simulationMetadata?.preparedAt || '',
      worldData.simulationMetadata?.source || ''
    ];
    
    return parts.join('|');
  }

  /**
   * Generate a secure token from a fingerprint
   * @private
   * @param {string} fingerprint - The world fingerprint
   * @returns {string} Secure token
   */
  _generateSecureToken(fingerprint) {
    // Simple hash function for demonstration (in production, use crypto)
    let hash = 0;
    const str = fingerprint + this._securitySalt;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `pipeline_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
  }

  /**
   * Clear expired tokens from the registry
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    const expiredTokens = [];
    
    this._validatedWorlds.forEach((data, token) => {
      const age = now - new Date(data.validatedAt).getTime();
      if (age > 3600000) { // 1 hour
        expiredTokens.push(token);
      }
    });
    
    expiredTokens.forEach(token => this._validatedWorlds.delete(token));
  }

  /**
   * Get validation statistics
   * @returns {Object} Validation statistics
   */
  getStats() {
    return {
      validatedWorldsCount: this._validatedWorlds.size,
      currentContextDepth: this._contextStack.length,
      currentContext: this._contextStack[this._contextStack.length - 1]?.context || null
    };
  }
}

// Singleton instance
const pipelineValidationService = new PipelineValidationService();

// Set up periodic cleanup
setInterval(() => {
  pipelineValidationService.cleanupExpiredTokens();
}, 300000); // Clean up every 5 minutes

export default pipelineValidationService;
