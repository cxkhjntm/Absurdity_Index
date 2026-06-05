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
  aiConfig: {
    enabled: false,
    apiKey: '',
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
    return JSON.parse(existingData);
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
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1 - (weeksAgo * 7));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const weekEvents = store.events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  });
  
  const totalEvents = weekEvents.length;
  const totalAbsurdity = weekEvents.reduce((sum, event) => sum + (event.absurdityLevel || 0), 0);
  const averageAbsurdity = totalEvents > 0 ? totalAbsurdity / totalEvents : 0;
  
  const byCategory = weekEvents.reduce((acc, event) => {
    const category = event.category || '未分类';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  const maxAbsurdityEvent = weekEvents.reduce((max, event) => 
    (event.absurdityLevel > (max?.absurdityLevel || 0)) ? event : max, null);
  
  return {
    period: {
      start: startOfWeek.toISOString(),
      end: endOfWeek.toISOString()
    },
    totalEvents,
    totalAbsurdity,
    averageAbsurdity: Math.round(averageAbsurdity * 100) / 100,
    byCategory,
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return { ...defaultData };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export {
  STORAGE_KEY,
  defaultData,
  initStore,
  saveStore,
  getStore,
  addEvent,
  addAchievement,
  updateLevel,
  getWeeklyStats,
  exportData,
  importData,
  clearData,
  generateId
};
