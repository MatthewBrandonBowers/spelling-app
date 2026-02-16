// Storage utility for localStorage management
const STORAGE_KEY = 'spelling_app_data';

export const storage = {
  getData: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { words: [], stats: {} };
  },

  saveData: (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  addWord: (misspelled, correct, category = 'General', rule = '') => {
    const data = storage.getData();
    const wordId = Date.now().toString();
    
    const newWord = {
      id: wordId,
      misspelled,
      correct,
      category,
      rule,
      attempts: 0,
      correct_count: 0,
      incorrect_count: 0,
      lastTested: null,
      createdAt: new Date().toISOString(),
    };

    data.words.push(newWord);
    storage.saveData(data);
    return newWord;
  },

  updateWord: (wordId, updates) => {
    const data = storage.getData();
    const wordIndex = data.words.findIndex(w => w.id === wordId);
    
    if (wordIndex !== -1) {
      data.words[wordIndex] = { ...data.words[wordIndex], ...updates };
      storage.saveData(data);
    }
    return data.words[wordIndex];
  },

  recordAttempt: (wordId, isCorrect) => {
    const data = storage.getData();
    const word = data.words.find(w => w.id === wordId);
    
    if (word) {
      word.attempts += 1;
      if (isCorrect) {
        word.correct_count += 1;
      } else {
        word.incorrect_count += 1;
      }
      word.lastTested = new Date().toISOString();
      storage.saveData(data);
    }
    return word;
  },

  getStats: () => {
    const data = storage.getData();
    const words = data.words;
    
    if (words.length === 0) {
      return {
        totalWords: 0,
        totalAttempts: 0,
        accuracy: 0,
        categoryBreakdown: {},
        mostMissedWords: [],
      };
    }

    const totalAttempts = words.reduce((sum, w) => sum + w.attempts, 0);
    const correctAttempts = words.reduce((sum, w) => sum + w.correct_count, 0);
    
    const categoryBreakdown = {};
    words.forEach(word => {
      if (!categoryBreakdown[word.category]) {
        categoryBreakdown[word.category] = { total: 0, correct: 0 };
      }
      categoryBreakdown[word.category].total += word.attempts;
      categoryBreakdown[word.category].correct += word.correct_count;
    });

    const mostMissedWords = [...words]
      .sort((a, b) => b.incorrect_count - a.incorrect_count)
      .slice(0, 5);

    return {
      totalWords: words.length,
      totalAttempts,
      accuracy: totalAttempts > 0 ? (correctAttempts / totalAttempts * 100).toFixed(2) : 0,
      categoryBreakdown,
      mostMissedWords,
    };
  },

  deleteWord: (wordId) => {
    const data = storage.getData();
    data.words = data.words.filter(w => w.id !== wordId);
    storage.saveData(data);
  },

  getWordsByCategory: (category) => {
    const data = storage.getData();
    if (category === 'All') return data.words;
    return data.words.filter(w => w.category === category);
  },

  getMostMissedWords: (limit = 5) => {
    const data = storage.getData();
    return data.words
      .filter(w => w.attempts > 0)
      .sort((a, b) => (b.incorrect_count / (b.attempts || 1)) - (a.incorrect_count / (a.attempts || 1)))
      .slice(0, limit);
  },
};
