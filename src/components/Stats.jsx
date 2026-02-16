import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './Stats.css';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [words, setWords] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const statsData = storage.getStats();
    const wordsData = storage.getData().words;
    setStats(statsData);
    setWords(wordsData);
  };

  if (!stats) {
    return <div className="stats">Loading...</div>;
  }

  const categoryStats = Object.entries(stats.categoryBreakdown).map(([name, data]) => ({
    name,
    ...data,
    accuracy: data.total > 0 ? ((data.correct / data.total) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="stats">
      <h2>Your Statistics</h2>

      {stats.totalWords === 0 ? (
        <div className="no-stats">
          <p>No statistics yet. Add words and take tests to see your progress!</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-label">Total Words</div>
                <div className="stat-value">{stats.totalWords}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-label">Overall Accuracy</div>
                <div className={`stat-value ${stats.accuracy >= 80 ? 'excellent' : stats.accuracy >= 60 ? 'good' : 'needs-work'}`}>
                  {stats.accuracy}%
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✏️</div>
              <div className="stat-content">
                <div className="stat-label">Total Attempts</div>
                <div className="stat-value">{stats.totalAttempts}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Avg Attempts/Word</div>
                <div className="stat-value">
                  {(stats.totalAttempts / stats.totalWords).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {categoryStats.length > 0 && (
            <div className="category-stats">
              <h3>Accuracy by Category</h3>
              <div className="category-list">
                {categoryStats.map((cat, idx) => (
                  <div key={idx} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{cat.name}</span>
                      <span className={`category-accuracy ${cat.accuracy >= 80 ? 'excellent' : cat.accuracy >= 60 ? 'good' : 'needs-work'}`}>
                        {cat.accuracy}%
                      </span>
                    </div>
                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${cat.accuracy}%` }}
                      ></div>
                    </div>
                    <div className="category-details">
                      <span>{cat.correct}/{cat.total} correct</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Missed Words */}
          {stats.mostMissedWords && stats.mostMissedWords.length > 0 && (
            <div className="most-missed">
              <h3>Words to Focus On</h3>
              <div className="missed-words-list">
                {stats.mostMissedWords.map((word, idx) => {
                  const errorRate = word.attempts > 0 ? ((word.incorrect_count / word.attempts) * 100).toFixed(0) : 0;
                  return (
                    <div key={idx} className="missed-word-item">
                      <div className="missed-word-info">
                        <div className="missed-word-text">
                          <span className="misspelled">{word.misspelled}</span>
                          <span className="arrow">→</span>
                          <span className="correct">{word.correct}</span>
                        </div>
                        <div className="missed-word-stats">
                          <span className="badge category-badge">{word.category}</span>
                          {word.rule && <span className="badge rule-badge">{word.rule}</span>}
                        </div>
                      </div>
                      <div className="error-rate">
                        <span className={`error-percentage ${errorRate > 60 ? 'high' : errorRate > 30 ? 'medium' : 'low'}`}>
                          {errorRate}% errors
                        </span>
                        <span className="attempts">({word.attempts} attempts)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Word Difficulty Analysis */}
          {words.length > 0 && (
            <div className="difficulty-analysis">
              <h3>Word Difficulty Analysis</h3>
              <div className="difficulty-grid">
                <div className="difficulty-card">
                  <span className="card-label">Mastered</span>
                  <span className="card-count">
                    {words.filter(w => w.attempts > 0 && w.correct_count === w.attempts).length}
                  </span>
                  <span className="card-desc">100% accuracy</span>
                </div>

                <div className="difficulty-card">
                  <span className="card-label">Improving</span>
                  <span className="card-count">
                    {words.filter(w => w.attempts > 0 && w.correct_count > 0 && w.correct_count < w.attempts).length}
                  </span>
                  <span className="card-desc">Partial mastery</span>
                </div>

                <div className="difficulty-card">
                  <span className="card-label">Challenging</span>
                  <span className="card-count">
                    {words.filter(w => w.attempts > 0 && w.correct_count === 0).length}
                  </span>
                  <span className="card-desc">0% accuracy</span>
                </div>

                <div className="difficulty-card">
                  <span className="card-label">Untested</span>
                  <span className="card-count">
                    {words.filter(w => w.attempts === 0).length}
                  </span>
                  <span className="card-desc">No attempts</span>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="insights">
            <h3>💡 Insights</h3>
            <ul className="insights-list">
              {stats.accuracy >= 80 ? (
                <li>✓ Excellent work! Your overall accuracy is great. Focus on the words marked as "Challenging".</li>
              ) : stats.accuracy >= 60 ? (
                <li>✓ Good progress! Keep practicing regularly to improve your accuracy.</li>
              ) : (
                <li>✓ You're building your skills! Consider reviewing the spelling rules and practicing daily.</li>
              )}

              {stats.mostMissedWords.length > 0 && (
                <li>📌 Your most challenging word is "<strong>{stats.mostMissedWords[0].correct}</strong>" - try to focus on this one.</li>
              )}

              {stats.totalAttempts > 20 ? (
                <li>🎯 You've been practicing consistently! Keep it up.</li>
              ) : (
                <li>✏️ Take more tests to see better progress. Try testing daily!</li>
              )}

              {categoryStats.length > 1 && (
                <li>
                  📊 Your strongest category is <strong>{categoryStats.sort((a, b) => b.accuracy - a.accuracy)[0].name}</strong> 
                  ({categoryStats.sort((a, b) => b.accuracy - a.accuracy)[0].accuracy}%).
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
