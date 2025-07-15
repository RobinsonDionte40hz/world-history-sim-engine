// src/domain/entities/AlignmentSystem.js

import { AlignmentTypes } from '../../shared/types/AlignmentTypes.ts';  // New type file

export class AlignmentManager {
  constructor(alignmentAxes = []) {
    this.axes = alignmentAxes;
    this.playerAlignment = {};
    this.history = {};
    
    for (const axis of alignmentAxes) {
      this.playerAlignment[axis.id] = axis.defaultValue || 0;
      this.history[axis.id] = [];
    }
  }
  
  getAlignment(axisId) {
    return this.playerAlignment[axisId] || 0;
  }
  
  getAlignmentZone(axisId) {
    const value = this.getAlignment(axisId);
    const axis = this.axes.find(a => a.id === axisId);
    if (!axis || !axis.zones) return null;
    return axis.zones.find(zone => value >= zone.min && value <= zone.max) || null;
  }
  
  changeAlignment(axisId, amount, reason) {
    const axis = this.axes.find(a => a.id === axisId);
    if (!axis) return false;
    
    let newValue = (this.playerAlignment[axisId] || 0) + amount;
    newValue = Math.max(axis.min, Math.min(axis.max, newValue));
    
    this.history[axisId].push({
      timestamp: new Date(),
      change: amount,
      newValue,
      reason
    });
    
    this.playerAlignment[axisId] = newValue;
    return true;
  }
  
  applyInteractionEffects(interaction) {
    if (!interaction.effects?.alignmentChanges) return;
    for (const change of interaction.effects.alignmentChanges) {
      this.changeAlignment(change.axisId, change.change, change.description || `Completed interaction: ${interaction.title}`);
    }
  }
  
  getPlayerStateWithAlignment(basePlayerState = {}) {
    return {
      ...basePlayerState,
      alignment: Object.keys(this.playerAlignment).reduce((acc, axisId) => {
        acc[axisId] = {
          value: this.playerAlignment[axisId],
          zone: this.getAlignmentZone(axisId)
        };
        return acc;
      }, {})
    };
  }
  
  toJSON() {
    return {
      axes: this.axes,
      playerAlignment: this.playerAlignment,
      history: this.history
    };
  }
  
  static fromJSON(data) {
    const manager = new AlignmentManager(data.axes);
    manager.playerAlignment = data.playerAlignment;
    manager.history = data.history;
    return manager;
  }
}