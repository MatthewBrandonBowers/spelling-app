import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { spellCheck, getRuleForWord, spellingRules } from '../utils/spellCheck';
import './WordInput.css';

export default function WordInput({ onWordAdded }) {
  const [misspelled, setMisspelled] = useState('');
  const [correct, setCorrect] = useState('');
  const [category, setCategory] = useState('General');
  const [rule, setRule] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'General',
    'Silent Letters',
    'Double Consonants',
    'ie vs ei',
    'Suffixes',
    'Prefixes',
    'Common Endings',
    'Homophones',
  ];

  // Get spelling rule options
  const ruleOptions = Object.keys(spellingRules).map(key => ({
    value: key,
    label: spellingRules[key].name,
  }));

  const handleMisspelledChange = async (e) => {
    const value = e.target.value;
    setMisspelled(value);
    setError('');

    if (value.trim().length > 2) {
      setLoading(true);
      try {
        const suggestionList = await spellCheck.getSuggestions(value);
        setSuggestions(suggestionList);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const chooseSuggestion = (suggestion) => {
    setCorrect(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!misspelled.trim()) {
      setError('Please enter a misspelled word');
      return;
    }

    if (!correct.trim()) {
      setError('Please enter or select the correct spelling');
      return;
    }

    if (misspelled.toLowerCase() === correct.toLowerCase()) {
      setError('Misspelled and correct spelling cannot be the same');
      return;
    }

    try {
      const newWord = storage.addWord(misspelled.trim(), correct.trim(), category, rule);
      setSuccess(`Added "${misspelled}" → "${correct}"`);
      setMisspelled('');
      setCorrect('');
      setCategory('General');
      setRule('');
      setSuggestions([]);
      
      if (onWordAdded) {
        onWordAdded(newWord);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error adding word: ' + err.message);
    }
  };

  return (
    <div className="word-input">
      <h2>Add a Misspelled Word</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="misspelled">Misspelled word *</label>
          <input
            id="misspelled"
            type="text"
            value={misspelled}
            onChange={handleMisspelledChange}
            placeholder="e.g., recieve"
            autoComplete="off"
          />
          {loading && <span className="loading">Checking...</span>}
          
          {suggestions.length > 0 && (
            <div className="suggestions">
              <div className="suggestions-label">Suggestions:</div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="suggestion-btn"
                  onClick={() => chooseSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="correct">Correct spelling *</label>
          <input
            id="correct"
            type="text"
            value={correct}
            onChange={(e) => {
              setCorrect(e.target.value);
              setSuggestions([]);
            }}
            placeholder="e.g., receive"
            autoComplete="off"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rule">Spelling Rule (optional)</label>
            <select
              id="rule"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
            >
              <option value="">-- None --</option>
              {ruleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {rule && getRuleForWord(rule) && (
          <div className="rule-info">
            <h4>{getRuleForWord(rule).name}</h4>
            <p>{getRuleForWord(rule).rule}</p>
            <p className="examples">Examples: {getRuleForWord(rule).examples.join(', ')}</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="submit-btn">Add Word</button>
      </form>
    </div>
  );
}
