import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Play, BarChart3, Archive, Volume2, Eye, EyeOff, Award, TrendingUp, Calendar, Filter } from 'lucide-react';

const SpellingApp = () => {
  const [view, setView] = useState('library'); // library, test, stats, add
  const [words, setWords] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [testProgress, setTestProgress] = useState({});
  const [stats, setStats] = useState({ totalTests: 0, correctWords: 0, totalWords: 0 });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedWords = localStorage.getItem('spellingWords');
    const savedStats = localStorage.getItem('spellingStats');
    if (savedWords) setWords(JSON.parse(savedWords));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  // Save words to localStorage whenever they change
  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem('spellingWords', JSON.stringify(words));
    }
  }, [words]);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('spellingStats', JSON.stringify(stats));
  }, [stats]);

  const addWord = async (misspelling, correctSpelling, category) => {
    const newWord = {
      id: Date.now(),
      misspelling,
      correct: correctSpelling,
      category,
      attempts: 0,
      successes: 0,
      lastTested: null,
      dateAdded: new Date().toISOString(),
      insight: null
    };

    // Get AI insight about the spelling
    setLoading(true);
    try {
      const insight = await getSpellingInsight(correctSpelling, misspelling, category);
      newWord.insight = insight;
    } catch (error) {
      console.error('Error getting insight:', error);
    }
    setLoading(false);

    setWords([...words, newWord]);
  };

  const getSpellingInsight = async (correct, misspelling, category) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Provide a brief, helpful spelling insight for the word "${correct}". The common misspelling is "${misspelling}". Category: ${category}. 

Include:
1. The key spelling rule or pattern (1-2 sentences)
2. A memory trick or mnemonic (1 sentence)
3. Similar words that follow the same pattern (2-3 examples)

Keep it concise and encouraging. Format as JSON with keys: rule, mnemonic, similarWords (array).`
            }
          ]
        })
      });

      const data = await response.json();
      const text = data.content.find(item => item.type === 'text')?.text || '{}';
      
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { rule: 'Spelling insight unavailable', mnemonic: '', similarWords: [] };
    } catch (error) {
      console.error('Error fetching insight:', error);
      return { rule: 'Spelling insight unavailable', mnemonic: '', similarWords: [] };
    }
  };

  const startTest = () => {
    // Select words for test - prioritize missed words, include some new ones
    const missedWords = words.filter(w => w.attempts > 0 && (w.successes / w.attempts) < 0.7);
    const newWords = words.filter(w => w.attempts === 0);
    const recentlyCorrect = words.filter(w => w.attempts > 0 && (w.successes / w.attempts) >= 0.7);

    let testWords = [];
    
    // 60% missed, 30% new, 10% review
    const totalWords = Math.min(words.length, 20);
    const missedCount = Math.floor(totalWords * 0.6);
    const newCount = Math.floor(totalWords * 0.3);
    const reviewCount = totalWords - missedCount - newCount;

    testWords = [
      ...missedWords.slice(0, missedCount),
      ...newWords.slice(0, newCount),
      ...recentlyCorrect.slice(0, reviewCount)
    ];

    // Shuffle
    testWords = testWords.sort(() => Math.random() - 0.5);

    setCurrentTest({
      words: testWords,
      currentIndex: 0,
      results: []
    });

    setTestProgress({});
    setView('test');
  };

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1eb 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #2d2a26 0%, #3d3832 100%)',
        color: '#fdfbf7',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BookOpen size={32} style={{ color: '#e8b17a' }} />
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>SpellMaster</h1>
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            {words.length} words • {stats.totalTests} tests completed
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e1db',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', padding: '0 2rem' }}>
          {[
            { id: 'library', label: 'Library', icon: Archive },
            { id: 'add', label: 'Add Word', icon: Plus },
            { id: 'test', label: 'Practice', icon: Play },
            { id: 'stats', label: 'Statistics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: view === tab.id ? 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)' : 'transparent',
                color: view === tab.id ? 'white' : '#5a5550',
                cursor: 'pointer',
                fontWeight: view === tab.id ? 600 : 400,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: view === tab.id ? 'none' : '3px solid transparent',
                transition: 'all 0.2s',
                borderRadius: view === tab.id ? '8px 8px 0 0' : '0'
              }}
              onMouseEnter={(e) => {
                if (view !== tab.id) e.target.style.background = '#f5f1eb';
              }}
              onMouseLeave={(e) => {
                if (view !== tab.id) e.target.style.background = 'transparent';
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {view === 'add' && <AddWordView onAdd={addWord} loading={loading} />}
        {view === 'library' && <LibraryView words={words} filter={filter} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy} speakWord={speakWord} />}
        {view === 'test' && currentTest && <TestView test={currentTest} setTest={setCurrentTest} words={words} setWords={setWords} stats={stats} setStats={setStats} testProgress={testProgress} setTestProgress={setTestProgress} speakWord={speakWord} setView={setView} />}
        {view === 'test' && !currentTest && <TestIntro onStart={startTest} wordsCount={words.length} />}
        {view === 'stats' && <StatsView stats={stats} words={words} />}
      </main>
    </div>
  );
};

// Add Word View
const AddWordView = ({ onAdd, loading }) => {
  const [misspelling, setMisspelling] = useState('');
  const [correctSpelling, setCorrectSpelling] = useState('');
  const [category, setCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const checkSpelling = async (word) => {
    // Simple spell check using a dictionary API or built-in browser spell check
    // For MVP, we'll use a basic approach
    if (word.length < 3) return;
    
    // This is a placeholder - in production, integrate with a spell check API
    const commonWords = ['receive', 'believe', 'achieve', 'occurrence', 'necessary', 'accommodate'];
    const matches = commonWords.filter(w => w.toLowerCase().includes(word.toLowerCase()));
    setSuggestions(matches.slice(0, 5));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (misspelling) checkSpelling(misspelling);
    }, 300);
    return () => clearTimeout(timer);
  }, [misspelling]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (misspelling && correctSpelling && category) {
      onAdd(misspelling, correctSpelling, category);
      setMisspelling('');
      setCorrectSpelling('');
      setCategory('');
      setSuggestions([]);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '3rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginTop: 0, fontSize: '1.8rem', color: '#2d2a26', marginBottom: '0.5rem' }}>Add a Word</h2>
      <p style={{ color: '#7a7570', marginBottom: '2rem' }}>Enter a word you often misspell to start learning</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2d2a26' }}>
            Your Misspelling
          </label>
          <input
            type="text"
            value={misspelling}
            onChange={(e) => setMisspelling(e.target.value)}
            placeholder="e.g., recieve"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e1db',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#e8b17a'}
            onBlur={(e) => e.target.style.borderColor = '#e5e1db'}
          />
          {suggestions.length > 0 && (
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f5f1eb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', color: '#5a5550', marginBottom: '0.5rem' }}>Did you mean:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {suggestions.map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setCorrectSpelling(sug)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: 'white',
                      border: '1px solid #e5e1db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e8b17a';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = 'inherit';
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2d2a26' }}>
            Correct Spelling
          </label>
          <input
            type="text"
            value={correctSpelling}
            onChange={(e) => setCorrectSpelling(e.target.value)}
            placeholder="e.g., receive"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e1db',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#e8b17a'}
            onBlur={(e) => e.target.style.borderColor = '#e5e1db'}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2d2a26' }}>
            Category / Rule
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e1db',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              background: 'white',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#e8b17a'}
            onBlur={(e) => e.target.style.borderColor = '#e5e1db'}
          >
            <option value="">Select a category...</option>
            <option value="ie/ei rule">ie/ei rule</option>
            <option value="silent letters">Silent letters</option>
            <option value="double consonants">Double consonants</option>
            <option value="suffixes">Suffixes</option>
            <option value="prefixes">Prefixes</option>
            <option value="homophones">Homophones</option>
            <option value="commonly misspelled">Commonly misspelled</option>
            <option value="professional jargon">Professional jargon</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !misspelling || !correctSpelling || !category}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading ? '#7a7570' : 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: (!misspelling || !correctSpelling || !category) ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading && misspelling && correctSpelling && category) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(232, 177, 122, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {loading ? 'Analyzing...' : 'Add Word'}
        </button>
      </form>
    </div>
  );
};

// Library View
const LibraryView = ({ words, filter, setFilter, sortBy, setSortBy, speakWord }) => {
  const categories = [...new Set(words.map(w => w.category))];
  
  const filteredWords = words.filter(w => filter === 'all' || w.category === filter);
  
  const sortedWords = [...filteredWords].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'difficulty':
        return (a.attempts > 0 ? a.successes / a.attempts : 1) - (b.attempts > 0 ? b.successes / b.attempts : 1);
      case 'alphabetical':
        return a.correct.localeCompare(b.correct);
      default:
        return 0;
    }
  });

  return (
    <div>
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: '#7a7570' }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #e5e1db',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#7a7570', fontSize: '0.9rem' }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #e5e1db',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <option value="recent">Recently Added</option>
            <option value="difficulty">Most Difficult</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', color: '#7a7570', fontSize: '0.9rem' }}>
          {sortedWords.length} word{sortedWords.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Word Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {sortedWords.map(word => (
          <WordCard key={word.id} word={word} speakWord={speakWord} />
        ))}
      </div>

      {sortedWords.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          color: '#7a7570'
        }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No words yet. Add your first word to get started!</p>
        </div>
      )}
    </div>
  );
};

const WordCard = ({ word, speakWord }) => {
  const [showInsight, setShowInsight] = useState(false);
  const successRate = word.attempts > 0 ? Math.round((word.successes / word.attempts) * 100) : null;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#2d2a26' }}>{word.correct}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord(word.correct);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                color: '#e8b17a'
              }}
            >
              <Volume2 size={18} />
            </button>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#7a7570' }}>
            Your spelling: <span style={{ textDecoration: 'line-through', color: '#c44536' }}>{word.misspelling}</span>
          </div>
        </div>
        {successRate !== null && (
          <div style={{
            background: successRate >= 70 ? '#e8f5e9' : successRate >= 40 ? '#fff3e0' : '#ffebee',
            color: successRate >= 70 ? '#2e7d32' : successRate >= 40 ? '#f57c00' : '#c44536',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {successRate}%
          </div>
        )}
      </div>

      <div style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        background: '#f5f1eb',
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: '#5a5550',
        marginBottom: '1rem'
      }}>
        {word.category}
      </div>

      {word.attempts > 0 && (
        <div style={{ fontSize: '0.85rem', color: '#7a7570', marginBottom: '1rem' }}>
          Attempted {word.attempts} time{word.attempts !== 1 ? 's' : ''}, correct {word.successes} time{word.successes !== 1 ? 's' : ''}
        </div>
      )}

      {word.insight && (
        <div>
          <button
            onClick={() => setShowInsight(!showInsight)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e8b17a',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {showInsight ? <EyeOff size={14} /> : <Eye size={14} />}
            {showInsight ? 'Hide' : 'Show'} Learning Tips
          </button>
          
          {showInsight && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#fdfbf7',
              borderRadius: '8px',
              fontSize: '0.85rem',
              lineHeight: '1.6'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#2d2a26' }}>Rule:</strong> {word.insight.rule}
              </div>
              {word.insight.mnemonic && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#2d2a26' }}>Remember:</strong> {word.insight.mnemonic}
                </div>
              )}
              {word.insight.similarWords && word.insight.similarWords.length > 0 && (
                <div>
                  <strong style={{ color: '#2d2a26' }}>Similar words:</strong> {word.insight.similarWords.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Test Intro View
const TestIntro = ({ onStart, wordsCount }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '4rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 2rem'
      }}>
        <Play size={36} color="white" />
      </div>
      
      <h2 style={{ marginTop: 0, fontSize: '2rem', color: '#2d2a26', marginBottom: '1rem' }}>Ready to Practice?</h2>
      <p style={{ color: '#7a7570', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
        You have {wordsCount} word{wordsCount !== 1 ? 's' : ''} in your library. Your test will focus on words you've struggled with, mixed with new words to keep you learning.
      </p>
      
      <div style={{
        background: '#f5f1eb',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        textAlign: 'left'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#2d2a26', marginBottom: '1rem' }}>How it works:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#5a5550', lineHeight: '1.8' }}>
          <li>You'll hear each word spoken aloud</li>
          <li>Type the spelling from memory</li>
          <li>Get progressive hints if you need help</li>
          <li>Learn from mistakes with instant feedback</li>
        </ul>
      </div>
      
      <button
        onClick={onStart}
        disabled={wordsCount === 0}
        style={{
          padding: '1rem 3rem',
          background: wordsCount === 0 ? '#7a7570' : 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 600,
          cursor: wordsCount === 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (wordsCount > 0) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(232, 177, 122, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        {wordsCount === 0 ? 'Add Words First' : 'Start Practice Session'}
      </button>
    </div>
  );
};

// Test View
const TestView = ({ test, setTest, words, setWords, stats, setStats, testProgress, setTestProgress, speakWord, setView }) => {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const currentWord = test.words[test.currentIndex];
  const wordProgress = testProgress[currentWord.id] || { attempts: 0, correct: false };
  const inputRef = useRef(null);

  useEffect(() => {
    // Speak the word when the component mounts or currentIndex changes
    if (currentWord) {
      speakWord(currentWord.correct);
    }
  }, [test.currentIndex]);

  const checkSpelling = () => {
    const isCorrect = userInput.trim().toLowerCase() === currentWord.correct.toLowerCase();
    
    if (isCorrect) {
      setFeedback({ type: 'success', message: 'Perfect! Well done!' });
      setTestProgress({
        ...testProgress,
        [currentWord.id]: { attempts: wordProgress.attempts + 1, correct: true }
      });
      
      // Update word stats
      const updatedWords = words.map(w => 
        w.id === currentWord.id 
          ? { ...w, attempts: w.attempts + 1, successes: w.successes + 1, lastTested: new Date().toISOString() }
          : w
      );
      setWords(updatedWords);
      
      // Move to next word after delay
      setTimeout(() => {
        moveToNext();
      }, 1500);
    } else {
      const newAttempts = wordProgress.attempts + 1;
      setTestProgress({
        ...testProgress,
        [currentWord.id]: { attempts: newAttempts, correct: false }
      });
      
      if (newAttempts === 1) {
        setFeedback({ type: 'error', message: 'Not quite. Try again!' });
        setUserInput('');
        inputRef.current?.focus();
      } else if (newAttempts === 2) {
        setFeedback({ 
          type: 'hint', 
          message: `Hint: ${currentWord.insight?.rule || 'Think about similar words you know.'}` 
        });
        setUserInput('');
        inputRef.current?.focus();
      } else if (newAttempts === 3) {
        const masked = maskWord(currentWord.correct);
        setFeedback({ 
          type: 'partial', 
          message: `Try this: ${masked}` 
        });
        setUserInput('');
        inputRef.current?.focus();
      } else {
        setFeedback({ 
          type: 'reveal', 
          message: `The correct spelling is: ${currentWord.correct}` 
        });
      }
      
      // Update word stats
      const updatedWords = words.map(w => 
        w.id === currentWord.id 
          ? { ...w, attempts: w.attempts + 1, lastTested: new Date().toISOString() }
          : w
      );
      setWords(updatedWords);
    }
  };

  const maskWord = (word) => {
    const len = word.length;
    const keepFirst = Math.ceil(len * 0.3);
    const keepLast = Math.floor(len * 0.2);
    return word.slice(0, keepFirst) + '_'.repeat(len - keepFirst - keepLast) + word.slice(-keepLast);
  };

  const moveToNext = () => {
    if (test.currentIndex < test.words.length - 1) {
      setTest({
        ...test,
        currentIndex: test.currentIndex + 1
      });
      setUserInput('');
      setFeedback(null);
    } else {
      finishTest();
    }
  };

  const skipWord = () => {
    setFeedback({ type: 'reveal', message: `The correct spelling is: ${currentWord.correct}` });
  };

  const finishTest = () => {
    const correctCount = Object.values(testProgress).filter(p => p.correct).length;
    const newStats = {
      totalTests: stats.totalTests + 1,
      correctWords: stats.correctWords + correctCount,
      totalWords: stats.totalWords + test.words.length
    };
    setStats(newStats);
    setTest(null);
    setView('stats');
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '3rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      maxWidth: '700px',
      margin: '0 auto'
    }}>
      {/* Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#7a7570' }}>
            Word {test.currentIndex + 1} of {test.words.length}
          </span>
          <span style={{ fontSize: '0.9rem', color: '#7a7570' }}>
            {Object.values(testProgress).filter(p => p.correct).length} correct
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          background: '#f5f1eb', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${((test.currentIndex + 1) / test.words.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* Word Card */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: '#fdfbf7',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: 'white',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#7a7570',
          marginBottom: '2rem'
        }}>
          {currentWord.category}
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => speakWord(currentWord.correct)}
            style={{
              background: 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)',
              border: 'none',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(232, 177, 122, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 8px 24px rgba(232, 177, 122, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 16px rgba(232, 177, 122, 0.3)';
            }}
          >
            <Volume2 size={32} color="white" />
          </button>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7a7570' }}>
            Click to hear the word
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            background: 
              feedback.type === 'success' ? '#e8f5e9' :
              feedback.type === 'error' ? '#ffebee' :
              feedback.type === 'hint' ? '#fff3e0' :
              feedback.type === 'partial' ? '#e3f2fd' :
              '#f5f1eb',
            color:
              feedback.type === 'success' ? '#2e7d32' :
              feedback.type === 'error' ? '#c44536' :
              feedback.type === 'hint' ? '#f57c00' :
              feedback.type === 'partial' ? '#1976d2' :
              '#5a5550',
            fontWeight: feedback.type === 'reveal' ? 600 : 400,
            fontSize: feedback.type === 'reveal' ? '1.2rem' : '0.95rem'
          }}>
            {feedback.message}
          </div>
        )}

        {(!feedback || feedback.type !== 'success') && feedback?.type !== 'reveal' && (
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                checkSpelling();
              }
            }}
            placeholder="Type the spelling..."
            autoFocus
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              border: '2px solid #e5e1db',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontFamily: 'inherit',
              textAlign: 'center',
              marginBottom: '1rem',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#e8b17a'}
            onBlur={(e) => e.target.style.borderColor = '#e5e1db'}
          />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {(!feedback || feedback.type !== 'success') && feedback?.type !== 'reveal' && (
          <>
            <button
              onClick={checkSpelling}
              disabled={!userInput.trim()}
              style={{
                padding: '0.875rem 2rem',
                background: !userInput.trim() ? '#7a7570' : 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: !userInput.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: !userInput.trim() ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (userInput.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(232, 177, 122, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Check
            </button>
            
            {wordProgress.attempts >= 3 && (
              <button
                onClick={skipWord}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'white',
                  color: '#7a7570',
                  border: '2px solid #e5e1db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f5f1eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                Show Answer
              </button>
            )}
          </>
        )}
        
        {(feedback?.type === 'success' || feedback?.type === 'reveal') && (
          <button
            onClick={moveToNext}
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 16px rgba(232, 177, 122, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {test.currentIndex < test.words.length - 1 ? 'Next Word' : 'Finish Test'}
          </button>
        )}
      </div>
    </div>
  );
};

// Stats View
const StatsView = ({ stats, words }) => {
  const successRate = stats.totalWords > 0 ? Math.round((stats.correctWords / stats.totalWords) * 100) : 0;
  
  const difficultWords = [...words]
    .filter(w => w.attempts > 2)
    .sort((a, b) => (a.successes / a.attempts) - (b.successes / b.attempts))
    .slice(0, 5);

  const masteredWords = [...words]
    .filter(w => w.attempts >= 3 && (w.successes / w.attempts) >= 0.8)
    .length;

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: '2rem', color: '#2d2a26', marginBottom: '2rem' }}>Your Progress</h2>
      
      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard 
          icon={<Award size={24} />}
          value={successRate + '%'}
          label="Success Rate"
          color="#e8b17a"
        />
        <StatCard 
          icon={<Calendar size={24} />}
          value={stats.totalTests}
          label="Tests Completed"
          color="#8ab4f8"
        />
        <StatCard 
          icon={<TrendingUp size={24} />}
          value={masteredWords}
          label="Words Mastered"
          color="#81c784"
        />
        <StatCard 
          icon={<BookOpen size={24} />}
          value={words.length}
          label="Total Words"
          color="#ce93d8"
        />
      </div>

      {/* Difficult Words */}
      {difficultWords.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '1.3rem', color: '#2d2a26', marginBottom: '1.5rem' }}>
            Words to Focus On
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {difficultWords.map(word => {
              const rate = Math.round((word.successes / word.attempts) * 100);
              return (
                <div key={word.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#fdfbf7',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#2d2a26', marginBottom: '0.25rem' }}>{word.correct}</div>
                    <div style={{ fontSize: '0.85rem', color: '#7a7570' }}>{word.category}</div>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: rate < 40 ? '#ffebee' : '#fff3e0',
                    color: rate < 40 ? '#c44536' : '#f57c00',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    {rate}% ({word.successes}/{word.attempts})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div style={{
        background: 'linear-gradient(135deg, #e8b17a 0%, #d4a066 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {successRate >= 80 ? '🎉 Excellent Work!' :
           successRate >= 60 ? '💪 Keep It Up!' :
           successRate >= 40 ? '📚 You\'re Learning!' :
           '🌱 Every Expert Was Once a Beginner'}
        </h3>
        <p style={{ margin: 0, opacity: 0.9 }}>
          {successRate >= 80 ? 'You\'re mastering spelling with impressive consistency!' :
           successRate >= 60 ? 'Your spelling skills are steadily improving. Stay consistent!' :
           successRate >= 40 ? 'Practice makes perfect. Keep challenging yourself!' :
           'Stay patient and keep practicing. Progress takes time!'}
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  }}>
    <div style={{ color, opacity: 0.8 }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2d2a26' }}>{value}</div>
    <div style={{ fontSize: '0.9rem', color: '#7a7570' }}>{label}</div>
  </div>
);

export default SpellingApp;
