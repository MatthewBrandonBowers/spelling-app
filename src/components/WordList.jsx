import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './WordList.css';

export default function WordList() {
  const [words, setWords] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadWords();
  }, [selectedCategory]);

  const loadWords = () => {
    const wordList = storage.getWordsByCategory(selectedCategory);
    sortWords(wordList, sortBy);
    setWords(wordList);
  };

  const sortWords = (wordList, sortType) => {
    const sorted = [...wordList];
    if (sortType === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortType === 'accuracy') {
      sorted.sort((a, b) => {
        const accA = a.attempts > 0 ? a.correct_count / a.attempts : 0;
        const accB = b.attempts > 0 ? b.correct_count / b.attempts : 0;
        return accB - accA;
      });
    } else if (sortType === 'mostMissed') {
      sorted.sort((a, b) => b.incorrect_count - a.incorrect_count);
    }
    return sorted;
  };

  const handleSort = (type) => {
    setSortBy(type);
    const sorted = sortWords(words, type);
    setWords(sorted);
  };

  const handleDelete = (wordId) => {
    if (confirm('Are you sure you want to delete this word?')) {
      storage.deleteWord(wordId);
      loadWords();
    }
  };

  const categories = [
    'All',
    'General',
    'Silent Letters',
    'Double Consonants',
    'ie vs ei',
    'Suffixes',
    'Prefixes',
    'Common Endings',
    'Homophones',
  ];

  return (
    <div className="word-list">
      <h2>Your Words</h2>

      <div className="controls">
        <div className="category-filter">
          <label>Filter by category:</label>
          <div className="category-buttons">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <button
            className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
            onClick={() => handleSort('newest')}
          >
            Newest
          </button>
          <button
            className={`sort-btn ${sortBy === 'accuracy' ? 'active' : ''}`}
            onClick={() => handleSort('accuracy')}
          >
            Best Accuracy
          </button>
          <button
            className={`sort-btn ${sortBy === 'mostMissed' ? 'active' : ''}`}
            onClick={() => handleSort('mostMissed')}
          >
            Most Missed
          </button>
        </div>
      </div>

      {words.length === 0 ? (
        <div className="no-words">
          <p>No words added yet. Start by adding your first misspelled word!</p>
        </div>
      ) : (
        <div className="words-grid">
          {words.map(word => (
            <div key={word.id} className="word-card">
              <div className="word-header">
                <div>
                  <div className="misspelled">{word.misspelled}</div>
                  <div className="arrow">→</div>
                  <div className="correct">{word.correct}</div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(word.id)}
                  title="Delete word"
                >
                  ✕
                </button>
              </div>

              <div className="word-details">
                {word.category && (
                  <span className="badge category-badge">{word.category}</span>
                )}
                {word.rule && (
                  <span className="badge rule-badge">{word.rule}</span>
                )}
              </div>

              <div className="word-stats">
                <div className="stat">
                  <span className="stat-label">Attempts:</span>
                  <span className="stat-value">{word.attempts}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Correct:</span>
                  <span className="stat-correct">{word.correct_count}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Incorrect:</span>
                  <span className="stat-incorrect">{word.incorrect_count}</span>
                </div>
                {word.attempts > 0 && (
                  <div className="stat">
                    <span className="stat-label">Accuracy:</span>
                    <span className="stat-value">
                      {((word.correct_count / word.attempts) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {word.rule && (
                <div className="rule-note">
                  <strong>Rule:</strong> Related to "{word.rule}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
