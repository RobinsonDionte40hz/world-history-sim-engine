// src/shared/utils/QuantumUtils.js

export const calculateResonance = (energy1, energy2, gammaFreq = 40) => {
  const energyDiff = energy1 - energy2;
  return Math.exp(-Math.pow(energyDiff - gammaFreq, 2) / (2 * gammaFreq));
};

export const calculateCoherenceDecay = (coherence, decayRate = 0.01) => {
  return Math.max(0, coherence - decayRate);
};

export const goldenRatioGrowth = (value) => {
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  return value * goldenRatio;
};