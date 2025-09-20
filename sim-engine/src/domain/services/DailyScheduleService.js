/**
 * DailyScheduleService
 *
 * Manages time-based scheduling and controls interaction availability
 * based on time of day and character schedules.
 */

class DailyScheduleService {
  constructor() {
    this.ticksPerDay = 24;
    this.ticksPerHour = 1;
    this.timeSlots = this._initializeTimeSlots();
  }

  /**
   * Initialize time slot definitions
   * @private
   * @returns {Map} Time slot mappings
   */
  _initializeTimeSlots() {
    const slots = new Map();

    // Morning: 6 AM - 12 PM (6-12 ticks)
    slots.set('morning', {
      startTick: 6,
      endTick: 12,
      name: 'Morning',
      activities: ['commute_to_work', 'work', 'breakfast'],
      priority: 'work'
    });

    // Midday: 12 PM - 3 PM (12-15 ticks)
    slots.set('midday', {
      startTick: 12,
      endTick: 15,
      name: 'Midday',
      activities: ['work', 'lunch', 'commerce', 'social'],
      priority: 'work'
    });

    // Afternoon: 3 PM - 6 PM (15-18 ticks)
    slots.set('afternoon', {
      startTick: 15,
      endTick: 18,
      name: 'Afternoon',
      activities: ['work', 'commerce', 'meetings'],
      priority: 'work'
    });

    // Evening: 6 PM - 10 PM (18-22 ticks)
    slots.set('evening', {
      startTick: 18,
      endTick: 22,
      name: 'Evening',
      activities: ['commute_home', 'social', 'commerce', 'dinner'],
      priority: 'social'
    });

    // Night: 10 PM - 6 AM (22-6 ticks, wraps around)
    slots.set('night', {
      startTick: 22,
      endTick: 6,
      name: 'Night',
      activities: ['rest', 'sleep'],
      priority: 'rest',
      wrapsAround: true
    });

    return slots;
  }

  /**
   * Get current time of day from world time
   * @param {number} worldTime - Current world time in ticks
   * @returns {string} Time of day: 'morning', 'midday', 'afternoon', 'evening', 'night'
   */
  getTimeOfDay(worldTime) {
    const hourOfDay = worldTime % this.ticksPerDay;

    for (const [timeSlot, config] of this.timeSlots) {
      if (config.wrapsAround) {
        // Night wraps around midnight
        if (hourOfDay >= config.startTick || hourOfDay < config.endTick) {
          return timeSlot;
        }
      } else {
        if (hourOfDay >= config.startTick && hourOfDay < config.endTick) {
          return timeSlot;
        }
      }
    }

    return 'night'; // Default fallback
  }

  /**
   * Get time slot configuration
   * @param {string} timeOfDay - Time of day
   * @returns {Object} Time slot configuration
   */
  getTimeSlotConfig(timeOfDay) {
    return this.timeSlots.get(timeOfDay);
  }

  /**
   * Check if activity is available at current time
   * @param {string} activity - Activity type
   * @param {string} timeOfDay - Current time of day
   * @returns {boolean} True if activity is available
   */
  isActivityAvailable(activity, timeOfDay) {
    const config = this.timeSlots.get(timeOfDay);
    return config ? config.activities.includes(activity) : false;
  }

  /**
   * Get priority activity for time of day
   * @param {string} timeOfDay - Current time of day
   * @returns {string} Priority activity
   */
  getPriorityActivity(timeOfDay) {
    const config = this.timeSlots.get(timeOfDay);
    return config ? config.priority : 'rest';
  }

  /**
   * Get available activities for time of day
   * @param {string} timeOfDay - Current time of day
   * @returns {Array} Available activities
   */
  getAvailableActivities(timeOfDay) {
    const config = this.timeSlots.get(timeOfDay);
    return config ? config.activities : ['rest'];
  }

  /**
   * Check if character should be at work
   * @param {Object} character - Character object
   * @param {string} timeOfDay - Current time of day
   * @returns {boolean} True if character should be at work
   */
  shouldBeAtWork(character, timeOfDay) {
    if (!character.assignments?.workNodeId) return false;

    // Work time slots
    const workTimeSlots = ['morning', 'midday', 'afternoon'];
    return workTimeSlots.includes(timeOfDay);
  }

  /**
   * Check if character should be at home
   * @param {Object} character - Character object
   * @param {string} timeOfDay - Current time of day
   * @returns {boolean} True if character should be at home
   */
  shouldBeAtHome(character, timeOfDay) {
    if (!character.assignments?.homeNodeId) return false;

    // Home time slots
    const homeTimeSlots = ['night'];
    return homeTimeSlots.includes(timeOfDay);
  }

  /**
   * Get character's schedule for the day
   * @param {Object} character - Character object
   * @returns {Object} Daily schedule
   */
  getCharacterSchedule(character) {
    const schedule = {};

    // Default schedule based on assignments
    if (character.assignments?.workNodeId) {
      schedule.morning = 'commute_to_work';
      schedule.midday = 'work';
      schedule.afternoon = 'work';
      schedule.evening = 'commute_home';
    }

    if (character.assignments?.homeNodeId) {
      schedule.night = 'rest';
    }

    // Add social/commerce based on LOD tier
    if (character.lodTier === 'hero') {
      schedule.midday = 'work_meetings';
      schedule.evening = 'social_politics';
    } else if (character.lodTier === 'group') {
      schedule.midday = 'work_specialized';
      schedule.evening = 'social_networking';
    } else {
      // Background NPCs have simpler schedules
      schedule.evening = 'social_casual';
    }

    return schedule;
  }

  /**
   * Get recommended activity for character at current time
   * @param {Object} character - Character object
   * @param {string} timeOfDay - Current time of day
   * @param {Object} worldState - Current world state
   * @returns {string} Recommended activity
   */
  getRecommendedActivity(character, timeOfDay, worldState) {
    const schedule = this.getCharacterSchedule(character);
    const scheduledActivity = schedule[timeOfDay];

    if (scheduledActivity) {
      return scheduledActivity;
    }

    // Fallback to priority activity for time slot
    return this.getPriorityActivity(timeOfDay);
  }

  /**
   * Check if character is following their schedule
   * @param {Object} character - Character object
   * @param {string} timeOfDay - Current time of day
   * @param {Object} worldState - Current world state
   * @returns {boolean} True if following schedule
   */
  isFollowingSchedule(character, timeOfDay, worldState) {
    const recommendedActivity = this.getRecommendedActivity(character, timeOfDay, worldState);
    const currentLocation = character.currentNodeId;

    // Check location-based schedule compliance
    if (recommendedActivity === 'commute_to_work' && character.assignments?.workNodeId) {
      return currentLocation === character.assignments.workNodeId;
    }

    if (recommendedActivity === 'commute_home' && character.assignments?.homeNodeId) {
      return currentLocation === character.assignments.homeNodeId;
    }

    if (recommendedActivity.includes('work') && character.assignments?.workNodeId) {
      return currentLocation === character.assignments.workNodeId;
    }

    if (recommendedActivity === 'rest' && character.assignments?.homeNodeId) {
      return currentLocation === character.assignments.homeNodeId;
    }

    return true; // For activities without specific location requirements
  }

  /**
   * Get schedule compliance score (0-1)
   * @param {Object} character - Character object
   * @param {string} timeOfDay - Current time of day
   * @param {Object} worldState - Current world state
   * @returns {number} Compliance score
   */
  getScheduleCompliance(character, timeOfDay, worldState) {
    if (this.isFollowingSchedule(character, timeOfDay, worldState)) {
      return 1.0;
    }

    // Partial compliance for being in the right general area
    const recommendedActivity = this.getRecommendedActivity(character, timeOfDay, worldState);

    if (recommendedActivity.includes('work')) {
      // If they should be working but are at home, give partial credit
      if (character.currentNodeId === character.assignments?.homeNodeId) {
        return 0.3;
      }
    }

    if (recommendedActivity === 'rest') {
      // If they should be resting but are elsewhere, give partial credit
      if (character.currentNodeId !== character.assignments?.homeNodeId) {
        return 0.5;
      }
    }

    return 0.0;
  }

  /**
   * Get time until next schedule change
   * @param {number} worldTime - Current world time
   * @returns {number} Ticks until next time slot
   */
  getTicksUntilNextScheduleChange(worldTime) {
    const currentTimeOfDay = this.getTimeOfDay(worldTime);
    const currentConfig = this.timeSlots.get(currentTimeOfDay);

    if (!currentConfig) return 0;

    const currentHour = worldTime % this.ticksPerDay;
    let nextChangeTick = currentConfig.endTick;

    // Handle wraparound for night
    if (currentConfig.wrapsAround && currentHour >= currentConfig.startTick) {
      nextChangeTick = currentConfig.endTick + this.ticksPerDay;
    }

    const ticksUntilChange = nextChangeTick - currentHour;
    return ticksUntilChange > 0 ? ticksUntilChange : 0;
  }

  /**
   * Format time for display
   * @param {number} worldTime - World time in ticks
   * @returns {string} Formatted time string
   */
  formatTime(worldTime) {
    const hourOfDay = worldTime % this.ticksPerDay;
    const timeOfDay = this.getTimeOfDay(worldTime);
    const timeSlot = this.timeSlots.get(timeOfDay);

    return `${timeSlot.name} (Hour ${hourOfDay})`;
  }
}

module.exports = DailyScheduleService;