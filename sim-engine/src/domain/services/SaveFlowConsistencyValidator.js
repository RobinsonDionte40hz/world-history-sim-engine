/**
 * SaveFlowConsistencyValidator - Domain service for validating save flow consistency
 * Ensures identical behavior for demo and user content operations
 */

export default class SaveFlowConsistencyValidator {
  constructor(options = {}) {
    this.validationResults = new Map();
    this.performanceMetrics = new Map();
    this.consistencyThresholds = {
      responseStructure: 1.0, // 100% structure match required
      performanceVariance: options.performanceVarianceThreshold || 0.15, // 15% maximum variance allowed (more lenient for tests)
      memoryVariance: 0.10, // 10% maximum variance allowed
      timeoutVariance: 0.02 // 2% maximum variance allowed
    };
  }

  /**
   * Validate save operation consistency
   * @param {Object} content - Content being saved
   * @param {Object} context - Operation context
   * @param {Object} result - Operation result
   * @param {Object} metrics - Performance metrics
   * @returns {Object} - Consistency validation result
   */
  validateSaveConsistency(content, context, result, metrics) {
    const operationId = this._generateOperationId('save', content.id);
    const validationResult = {
      operationId,
      operationType: 'save',
      contentOwnership: content.ownership,
      timestamp: new Date().toISOString(),
      responseStructure: this._validateResponseStructure(result, 'save'),
      performanceMetrics: metrics,
      isConsistent: true,
      inconsistencies: []
    };

    // Validate response structure
    if (!validationResult.responseStructure.isValid) {
      validationResult.isConsistent = false;
      validationResult.inconsistencies.push(
        `Response structure invalid: ${validationResult.responseStructure.errors.join(', ')}`
      );
    }

    // Validate performance consistency
    const performanceValidation = this._validatePerformanceConsistency(
      'save',
      content.ownership,
      metrics
    );
    if (!performanceValidation.isConsistent) {
      validationResult.isConsistent = false;
      validationResult.inconsistencies.push(
        `Performance inconsistent: ${performanceValidation.reason}`
      );
    }

    // Store validation result
    this.validationResults.set(operationId, validationResult);
    this._updatePerformanceMetrics('save', content.ownership, metrics);

    return validationResult;
  }

  /**
   * Validate load operation consistency
   * @param {string} contentId - Content ID being loaded
   * @param {Object} context - Operation context
   * @param {Object} result - Operation result
   * @param {Object} metrics - Performance metrics
   * @returns {Object} - Consistency validation result
   */
  validateLoadConsistency(contentId, context, result, metrics) {
    const operationId = this._generateOperationId('load', contentId);
    const validationResult = {
      operationId,
      operationType: 'load',
      contentOwnership: result.ownership,
      timestamp: new Date().toISOString(),
      responseStructure: this._validateResponseStructure(result, 'load'),
      performanceMetrics: metrics,
      isConsistent: true,
      inconsistencies: []
    };

    // Validate response structure
    if (!validationResult.responseStructure.isValid) {
      validationResult.isConsistent = false;
      validationResult.inconsistencies.push(
        `Response structure invalid: ${validationResult.responseStructure.errors.join(', ')}`
      );
    }

    // Validate performance consistency
    const performanceValidation = this._validatePerformanceConsistency(
      'load',
      result.ownership,
      metrics
    );
    if (!performanceValidation.isConsistent) {
      validationResult.isConsistent = false;
      validationResult.inconsistencies.push(
        `Performance inconsistent: ${performanceValidation.reason}`
      );
    }

    // Store validation result
    this.validationResults.set(operationId, validationResult);
    this._updatePerformanceMetrics('load', result.ownership, metrics);

    return validationResult;
  }

  /**
   * Validate delete operation consistency
   * @param {string} contentId - Content ID being deleted
   * @param {Object} context - Operation context
   * @param {Object} result - Operation result
   * @param {Object} metrics - Performance metrics
   * @returns {Object} - Consistency validation result
   */
  validateDeleteConsistency(contentId, context, result, metrics) {
    const operationId = this._generateOperationId('delete', contentId);
    const validationResult = {
      operationId,
      operationType: 'delete',
      contentOwnership: context.contentOwnership || 'unknown',
      timestamp: new Date().toISOString(),
      responseStructure: this._validateResponseStructure(result, 'delete'),
      performanceMetrics: metrics,
      isConsistent: true,
      inconsistencies: []
    };

    // Validate response structure
    if (!validationResult.responseStructure.isValid) {
      validationResult.isConsistent = false;
      validationResult.inconsistencies.push(
        `Response structure invalid: ${validationResult.responseStructure.errors.join(', ')}`
      );
    }

    // Validate performance consistency
    const performanceValidation = this._validatePerformanceConsistency(
      'delete',
      validationResult.contentOwnership,
      metrics
    );
    if (!performanceValidation.isConsistent) {
      validationResult.isConsistent = false;
      validationResult.inconsistencies.push(
        `Performance inconsistent: ${performanceValidation.reason}`
      );
    }

    // Store validation result
    this.validationResults.set(operationId, validationResult);
    this._updatePerformanceMetrics('delete', validationResult.contentOwnership, metrics);

    return validationResult;
  }

  /**
   * Validate copy operation consistency
   * @param {string} contentId - Content ID being copied
   * @param {string} newOwnership - New ownership type
   * @param {Object} context - Operation context
   * @param {Object} result - Operation result
   * @param {Object} metrics - Performance metrics
   * @returns {Object} - Consistency validation result
   */
  validateCopyConsistency(contentId, newOwnership, context, result, metrics) {
    const operationId = this._generateOperationId('copy', contentId);
    const validationResult = {
      operationId,
      operationType: 'copy',
      contentOwnership: context.originalOwnership || 'unknown',
      timestamp: new Date().toISOString(),
      responseStructure: this._validateResponseStructure(result, 'copy'),
      performanceMetrics: metrics,
      isConsistent: true,
      inconsistencies: []
    };

    // Validate response structure
    if (!validationResult.responseStructure.isValid) {
      validationResult.isConsistent = false;
      validationResult.inconsistencies.push(
        `Response structure invalid: ${validationResult.responseStructure.errors.join(', ')}`
      );
    }

    // Validate performance consistency
    const performanceValidation = this._validatePerformanceConsistency(
      'copy',
      validationResult.contentOwnership,
      metrics
    );
    if (!performanceValidation.isConsistent) {
      validationResult.isConsistent = false;
      validationResult.inconsistencies.push(
        `Performance inconsistent: ${performanceValidation.reason}`
      );
    }

    // Store validation result
    this.validationResults.set(operationId, validationResult);
    this._updatePerformanceMetrics('copy', validationResult.contentOwnership, metrics);

    return validationResult;
  }

  /**
   * Get consistency report for recent operations
   * @param {number} limit - Maximum number of results to return
   * @returns {Array} - Array of consistency validation results
   */
  getConsistencyReport(limit = 100) {
    const results = Array.from(this.validationResults.values());
    return results
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get performance metrics summary
   * @returns {Object} - Performance metrics summary
   */
  getPerformanceMetricsSummary() {
    const summary = {
      operations: {},
      overall: {
        totalOperations: this.validationResults.size,
        consistentOperations: 0,
        inconsistentOperations: 0,
        averagePerformance: {}
      }
    };

    // Initialize operation types
    ['save', 'load', 'delete', 'copy'].forEach(op => {
      summary.operations[op] = {
        count: 0,
        consistent: 0,
        inconsistent: 0,
        performance: {
          user: { samples: [], average: 0 },
          demo: { samples: [], average: 0 }
        }
      };
    });

    // Aggregate results
    for (const result of this.validationResults.values()) {
      const op = summary.operations[result.operationType];
      op.count++;

      if (result.isConsistent) {
        op.consistent++;
        summary.overall.consistentOperations++;
      } else {
        op.inconsistent++;
        summary.overall.inconsistentOperations++;
      }

      // Track performance by ownership
      if (result.performanceMetrics && result.performanceMetrics.duration) {
        const perf = op.performance[result.contentOwnership];
        if (perf) {
          perf.samples.push(result.performanceMetrics.duration);
          perf.average = perf.samples.reduce((a, b) => a + b, 0) / perf.samples.length;
        }
      }
    }

    return summary;
  }

  /**
   * Validate response structure consistency
   * @private
   */
  _validateResponseStructure(result, operationType) {
    const requiredFields = this._getRequiredFieldsForOperation(operationType);
    const validation = {
      isValid: true,
      errors: []
    };

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in result)) {
        validation.isValid = false;
        validation.errors.push(`Missing required field: ${field}`);
      }
    }

    // Check field types
    const fieldTypes = this._getFieldTypesForOperation(operationType);
    for (const [field, expectedType] of Object.entries(fieldTypes)) {
      if (field in result) {
        const actualType = typeof result[field];
        if (actualType !== expectedType) {
          validation.isValid = false;
          validation.errors.push(
            `Field ${field} has wrong type: expected ${expectedType}, got ${actualType}`
          );
        }
      }
    }

    return validation;
  }

  /**
   * Validate performance consistency
   * @private
   */
  _validatePerformanceConsistency(operationType, ownership, metrics) {
    const validation = {
      isConsistent: true,
      reason: null
    };

    if (!metrics || !metrics.duration) {
      validation.isConsistent = false;
      validation.reason = 'Missing performance metrics';
      return validation;
    }

    // Get baseline performance for this operation type and ownership
    const baseline = this._getPerformanceBaseline(operationType, ownership);

    if (baseline && baseline.samples.length > 0) {
      const variance = Math.abs(metrics.duration - baseline.average) / baseline.average;

      if (variance > this.consistencyThresholds.performanceVariance) {
        validation.isConsistent = false;
        validation.reason = `Performance variance too high: ${variance.toFixed(2)}% (threshold: ${(this.consistencyThresholds.performanceVariance * 100).toFixed(1)}%)`;
      }
    }

    return validation;
  }

  /**
   * Update performance metrics baseline
   * @private
   */
  _updatePerformanceMetrics(operationType, ownership, metrics) {
    if (!metrics || !metrics.duration) return;

    const key = `${operationType}_${ownership}`;
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, {
        samples: [],
        average: 0,
        min: Infinity,
        max: -Infinity
      });
    }

    const perf = this.performanceMetrics.get(key);
    perf.samples.push(metrics.duration);

    // Keep only last 100 samples
    if (perf.samples.length > 100) {
      perf.samples = perf.samples.slice(-100);
    }

    // Update statistics
    perf.average = perf.samples.reduce((a, b) => a + b, 0) / perf.samples.length;
    perf.min = Math.min(perf.min, metrics.duration);
    perf.max = Math.max(perf.max, metrics.duration);
  }

  /**
   * Get performance baseline for comparison
   * @private
   */
  _getPerformanceBaseline(operationType, ownership) {
    const key = `${operationType}_${ownership}`;
    return this.performanceMetrics.get(key);
  }

  /**
   * Get required fields for operation type
   * @private
   */
  _getRequiredFieldsForOperation(operationType) {
    const fieldMap = {
      save: ['success', 'contentId', 'timestamp'],
      load: ['success', 'content', 'timestamp'],
      delete: ['success', 'contentId', 'timestamp'],
      copy: ['success', 'originalContentId', 'copiedContentId', 'timestamp']
    };

    return fieldMap[operationType] || [];
  }

  /**
   * Get field types for operation type
   * @private
   */
  _getFieldTypesForOperation(operationType) {
    const typeMap = {
      save: {
        success: 'boolean',
        contentId: 'string',
        timestamp: 'string'
      },
      load: {
        success: 'boolean',
        content: 'object',
        timestamp: 'string'
      },
      delete: {
        success: 'boolean',
        contentId: 'string',
        timestamp: 'string'
      },
      copy: {
        success: 'boolean',
        originalContentId: 'string',
        copiedContentId: 'string',
        timestamp: 'string'
      }
    };

    return typeMap[operationType] || {};
  }

  /**
   * Generate unique operation ID
   * @private
   */
  _generateOperationId(operationType, contentId) {
    return `${operationType}_${contentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear validation results (for testing)
   */
  clearResults() {
    this.validationResults.clear();
    this.performanceMetrics.clear();
  }
}