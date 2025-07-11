// src/shared/utils/SelectionUtils.js

export const weightedSelect = (options, weightFn) => {
  const totalWeight = options.reduce((sum, opt) => sum + weightFn(opt), 0);
  let rand = Math.random() * totalWeight;
  for (const opt of options) {
    rand -= weightFn(opt);
    if (rand <= 0) return opt;
  }
  return options[options.length - 1];  // Fallback
};

export const randomSelect = (options) => {
  return options[Math.floor(Math.random() * options.length)];
};