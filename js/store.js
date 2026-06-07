const STORAGE_KEY = 'absurdity-index-data';

const defaultData = {
  events: [],
  achievements: [],
  level: {
    current: 1,
    experience: 0,
    title: '新手观察者'
  },
  weeklyReports: [],
  hasReadReport: false,
  aiConfig: {
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
  }
};

function initStore() {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return { ...defaultData };
    }
    const store = JSON.parse(existingData);
    // Auto-cleanup corrupted data from previous bugs
    _cleanupStoreData(store);
    return store;
  } catch (error) {
    console.error('Failed to initialize store:', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return { ...defaultData };
  }
}

function saveStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save store:', error);
    throw new Error('数据保存失败');
  }
}

function getStore() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return initStore();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get store:', error);
    return initStore();
  }
}

function addEvent(event) {
  const store = getStore();
  
  const newEvent = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...event
  };
  
  store.events.push(newEvent);
  saveStore(store);
  
  return newEvent;
}

function addAchievement(achievement) {
  const store = getStore();

  // Prevent duplicate achievements with the same id (for pool achievements)
  if (achievement.id) {
    const exists = (store.achievements || []).some(a => a.id === achievement.id);
    if (exists) {
      console.warn('[Store] Achievement already exists, skipping:', achievement.id);
      return (store.achievements || []).find(a => a.id === achievement.id);
    }
  }

  const newAchievement = {
    id: generateId(),
    unlockedAt: new Date().toISOString(),
    ...achievement
  };
  
  store.achievements.push(newAchievement);
  saveStore(store);
  
  return newAchievement;
}

function updateLevel(levelData) {
  const store = getStore();
  
  if (levelData.experience) {
    store.level.experience += levelData.experience;
    const newLevel = Math.floor(store.level.experience / 100) + 1;
    if (newLevel > store.level.current) {
      store.level.current = newLevel;
    }
  }
  
  if (levelData.title) {
    store.level.title = levelData.title;
  }
  
  saveStore(store);
  
  return store.level;
}

function getWeeklyStats(weeksAgo = 0) {
  const store = getStore();
  const now = new Date();
  
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon - (weeksAgo * 7));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const weekEvents = store.events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  });
  
  const totalEvents = weekEvents.length;
  const totalAbsurdity = weekEvents.reduce((sum, event) => sum + (event.score || 0), 0);
  const averageAbsurdity = totalEvents > 0 ? totalAbsurdity / totalEvents : 0;
  
  const byLevel = weekEvents.reduce((acc, event) => {
    const level = (event.level || 'basic').toLowerCase();
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  
  const maxAbsurdityEvent = weekEvents.reduce((max, event) => 
    ((event.score || 0) > (max?.score || 0)) ? event : max, null);
  
  return {
    period: {
      start: startOfWeek.toISOString(),
      end: endOfWeek.toISOString()
    },
    totalEvents,
    totalAbsurdity,
    averageAbsurdity: Math.round(averageAbsurdity * 100) / 100,
    byLevel,
    maxAbsurdityEvent,
    events: weekEvents
  };
}

function exportData() {
  const store = getStore();
  return JSON.stringify(store, null, 2);
}

function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error('无效的数据格式：缺少 events 数组');
    }
    
    if (!data.achievements || !Array.isArray(data.achievements)) {
      throw new Error('无效的数据格式：缺少 achievements 数组');
    }
    
    if (!data.level || typeof data.level !== 'object') {
      throw new Error('无效的数据格式：缺少 level 对象');
    }
    
    saveStore(data);
    
    return data;
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('数据导入失败: ' + error.message);
  }
}

function clearData() {
  const store = getStore();
  const aiConfig = store.aiConfig || defaultData.aiConfig;
  const resetStore = { ...defaultData, aiConfig };
  saveStore(resetStore);
  return resetStore;
}

function deleteEvent(eventId) {
  const store = getStore();
  const idx = store.events.findIndex(e => e.id === eventId);
  if (idx === -1) return false;

  const event = store.events[idx];
  const score = event.score || 0;

  // Also delete any achievements linked to this event
  store.achievements = (store.achievements || []).filter(a => a.eventId !== eventId);

  store.events.splice(idx, 1);
  
  // Deduct from experience
  store.level.experience = Math.max(0, (store.level.experience || 0) - score);
  // Re-calculate current level
  store.level.current = Math.max(1, Math.floor(store.level.experience / 100) + 1);

  saveStore(store);
  return true;
}

function deleteAchievement(achievementId) {
  const store = getStore();
  const idx = store.achievements.findIndex(a => a.id === achievementId);
  if (idx === -1) return false;
  store.achievements.splice(idx, 1);
  saveStore(store);
  return true;
}

/**
 * Clean up corrupted store data from previous bugs.
 * Removes achievements that have name='未命名成就' and no valid pool id,
 * which were caused by the old bug passing wrong object to _saveAchievement.
 */
function _cleanupStoreData(store) {
  if (!store || !store.achievements) return;

  // Known pool achievement IDs that are valid
  const validPoolIds = new Set([
    'first-record', 'three-records', 'ten-records', 'fifty-records',
    'first-basic', 'first-combo', 'first-rare', 'first-epic',
    'five-combo', 'three-epic', 'five-epic', 'weekly-report',
    'score-50', 'score-200', 'score-500', 'score-1000',
    'level-4', 'all-levels',
  ]);

  const before = store.achievements.length;
  store.achievements = store.achievements.filter(a => {
    // Keep pool achievements (they always have valid names)
    if (validPoolIds.has(a.id)) return true;
    // Remove dynamic achievements named '未命名成就' (corrupted data)
    if (a.name === '未命名成就' && !validPoolIds.has(a.id)) {
      console.warn('[Store] Removing corrupted achievement:', a);
      return false;
    }
    // Keep all other valid achievements
    return true;
  });

  if (store.achievements.length !== before) {
    console.log(`[Store] Cleaned up ${before - store.achievements.length} corrupted achievements`);
    saveStore(store);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

