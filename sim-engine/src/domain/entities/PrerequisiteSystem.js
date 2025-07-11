export const validatePrerequisites = (interaction, playerState) => {
  if (!interaction.prerequisites || !interaction.prerequisites.groups) {
    return { valid: true, message: '' };
  }

  const groups = interaction.prerequisites.groups;
  if (groups.length === 0) {
    return { valid: true, message: '' };
  }

  // Check if any group is satisfied (OR logic between groups)
  for (const group of groups) {
    const groupResult = validatePrerequisiteGroup(group, playerState);
    if (groupResult.valid) {
      return { valid: true, message: '' };
    }
  }

  return { 
    valid: false, 
    message: interaction.prerequisites.unavailableMessage || 'Prerequisites not met'
  };
};

const validatePrerequisiteGroup = (group, playerState) => {
  if (!group.conditions || group.conditions.length === 0) {
    return { valid: true, message: '' };
  }

  // All conditions in a group must be satisfied (AND logic)
  for (const condition of group.conditions) {
    const conditionResult = validateCondition(condition, playerState);
    if (!conditionResult.valid) {
      return conditionResult;
    }
  }

  return { valid: true, message: '' };
};

const validateCondition = (condition, playerState) => {
  switch (condition.type) {
    case 'level':
      return validateLevelCondition(condition, playerState);
    case 'skill':
      return validateSkillCondition(condition, playerState);
    case 'quest':
      return validateQuestCondition(condition, playerState);
    case 'item':
      return validateItemCondition(condition, playerState);
    case 'influence':
      return validateInfluenceCondition(condition, playerState);
    case 'prestige':
      return validatePrestigeCondition(condition, playerState);
    case 'alignment':
      return validateAlignmentCondition(condition, playerState);
    default:
      return { valid: false, message: `Unknown condition type: ${condition.type}` };
  }
};

const validateLevelCondition = (condition, playerState) => {
  const playerLevel = playerState.level || 0;
  const requiredLevel = condition.value || 0;
  
  return {
    valid: playerLevel >= requiredLevel,
    message: playerLevel >= requiredLevel ? '' : `Requires level ${requiredLevel}`
  };
};

const validateSkillCondition = (condition, playerState) => {
  const playerSkills = playerState.skills || {};
  const skillLevel = playerSkills[condition.skillId] || 0;
  const requiredLevel = condition.value || 0;
  
  return {
    valid: skillLevel >= requiredLevel,
    message: skillLevel >= requiredLevel ? '' : `Requires ${condition.skillId} level ${requiredLevel}`
  };
};

const validateQuestCondition = (condition, playerState) => {
  const completedQuests = playerState.completedQuests || [];
  
  return {
    valid: completedQuests.includes(condition.questId),
    message: completedQuests.includes(condition.questId) ? '' : `Requires quest: ${condition.questId}`
  };
};

const validateItemCondition = (condition, playerState) => {
  const inventory = playerState.inventory || {};
  const itemCount = inventory[condition.itemId] || 0;
  const requiredCount = condition.value || 0;
  
  return {
    valid: itemCount >= requiredCount,
    message: itemCount >= requiredCount ? '' : `Requires ${requiredCount} ${condition.itemId}`
  };
};

const validateInfluenceCondition = (condition, playerState) => {
  const influence = playerState.influence || {};
  const domainInfluence = influence[condition.domainId] || 0;
  const requiredInfluence = condition.value || 0;
  
  return {
    valid: domainInfluence >= requiredInfluence,
    message: domainInfluence >= requiredInfluence ? '' : `Requires ${requiredInfluence} influence in ${condition.domainId}`
  };
};

const validatePrestigeCondition = (condition, playerState) => {
  const prestige = playerState.prestige || {};
  const trackPrestige = prestige[condition.trackId] || 0;
  const requiredPrestige = condition.value || 0;
  
  return {
    valid: trackPrestige >= requiredPrestige,
    message: trackPrestige >= requiredPrestige ? '' : `Requires ${requiredPrestige} prestige in ${condition.trackId}`
  };
};

const validateAlignmentCondition = (condition, playerState) => {
  const alignment = playerState.alignment || {};
  const axisAlignment = alignment[condition.axisId] || 0;
  const requiredAlignment = condition.value || 0;
  
  return {
    valid: axisAlignment >= requiredAlignment,
    message: axisAlignment >= requiredAlignment ? '' : `Requires ${requiredAlignment} alignment in ${condition.axisId}`
  };
}; 