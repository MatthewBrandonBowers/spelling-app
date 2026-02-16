import { db, auth } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Get current user ID safely
const getUserId = () => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  return auth.currentUser.uid;
};

export const storage = {
  // Add a new word to Firestore
  addWord: async (misspelled, correct, category = 'General', rule = '') => {
    try {
      const userId = getUserId();
      const docRef = await addDoc(collection(db, 'users', userId, 'words'), {
        misspelled,
        correct,
        category,
        rule,
        attempts: 0,
        correct_count: 0,
        incorrect_count: 0,
        lastTested: null,
        createdAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        misspelled,
        correct,
        category,
        rule,
        attempts: 0,
        correct_count: 0,
        incorrect_count: 0,
        lastTested: null,
      };
    } catch (error) {
      console.error('Error adding word:', error);
      throw error;
    }
  },

  // Get all words for current user
  getData: async () => {
    try {
      const userId = getUserId();
      const wordsRef = collection(db, 'users', userId, 'words');
      const snapshot = await getDocs(wordsRef);

      const words = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastTested: doc.data().lastTested?.toDate?.()?.toISOString() || null,
      }));

      return { words, stats: {} };
    } catch (error) {
      console.error('Error getting data:', error);
      return { words: [], stats: {} };
    }
  },

  // Update a word
  updateWord: async (wordId, updates) => {
    try {
      const userId = getUserId();
      const wordRef = doc(db, 'users', userId, 'words', wordId);
      await updateDoc(wordRef, updates);
      return { id: wordId, ...updates };
    } catch (error) {
      console.error('Error updating word:', error);
      throw error;
    }
  },

  // Record a test attempt
  recordAttempt: async (wordId, isCorrect) => {
    try {
      const userId = getUserId();
      const wordRef = doc(db, 'users', userId, 'words', wordId);

      const updates = {
        attempts: (await updateDoc(wordRef, {})) ? 0 : 0,
        lastTested: serverTimestamp(),
      };

      if (isCorrect) {
        updates.correct_count = { 'fieldValue': 'increment' };
      } else {
        updates.incorrect_count = { 'fieldValue': 'increment' };
      }

      // For now, use a simpler approach with Firestore increment
      const snapshot = await getDocs(query(collection(db, 'users', userId, 'words'), where(doc(db, 'users', userId, 'words', wordId), '==', wordId)));
      
      if (snapshot.docs.length > 0) {
        const word = snapshot.docs[0].data();
        const updateData = {
          attempts: word.attempts + 1,
          lastTested: serverTimestamp(),
        };

        if (isCorrect) {
          updateData.correct_count = word.correct_count + 1;
        } else {
          updateData.incorrect_count = word.incorrect_count + 1;
        }

        await updateDoc(wordRef, updateData);
        return { id: wordId, ...updateData };
      }

      return null;
    } catch (error) {
      console.error('Error recording attempt:', error);
      throw error;
    }
  },

  // Delete a word
  deleteWord: async (wordId) => {
    try {
      const userId = getUserId();
      const wordRef = doc(db, 'users', userId, 'words', wordId);
      await deleteDoc(wordRef);
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    }
  },

  // Get words by category
  getWordsByCategory: async (category) => {
    try {
      const data = await storage.getData();
      if (category === 'All') return data.words;
      return data.words.filter(w => w.category === category);
    } catch (error) {
      console.error('Error getting words by category:', error);
      return [];
    }
  },

  // Get most missed words
  getMostMissedWords: async (limit = 5) => {
    try {
      const data = await storage.getData();
      return data.words
        .filter(w => w.attempts > 0)
        .sort((a, b) => (b.incorrect_count / (b.attempts || 1)) - (a.incorrect_count / (a.attempts || 1)))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting most missed words:', error);
      return [];
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const data = await storage.getData();
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
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalWords: 0,
        totalAttempts: 0,
        accuracy: 0,
        categoryBreakdown: {},
        mostMissedWords: [],
      };
    }
  },
};

// Fallback localStorage storage for offline use
export const localStorageBackup = {
  getData: () => {
    const data = localStorage.getItem('spelling_app_data');
    return data ? JSON.parse(data) : { words: [], stats: {} };
  },

  saveData: (data) => {
    localStorage.setItem('spelling_app_data', JSON.stringify(data));
  },
};
