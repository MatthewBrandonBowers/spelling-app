import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './DailyTest.css';

export default function DailyTest() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [testState, setTestState] = useState('not-started'); // not-started, in-progress, completed
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    initializeTest();
  }, []);

  const initializeTest = () => {
    const data = storage.getData();
    if (data.words.length === 0) {
      setTestState('no-words');
      return;
    }

    // Get mostly missed words, with some new ones mixed in
    const mostMissed = storage.getMostMissedWords(8);
    const untestedWords = data.words.filter(w => w.attempts === 0);
    
    let testWords = [...mostMissed];
    const remaining = Math.min(2, untestedWords.length);
    if (remaining > 0) {
      testWords = testWords.concat(untestedWords.slice(0, remaining));
    }

    // Limit to 20 words max
    testWords = testWords.slice(0, Math.min(20, testWords.length || data.words.length));

    if (testWords.length === 0) {
      testWords = data.words.slice(0, 20);
    }

    // Shuffle
    testWords = testWords.sort(() => Math.random() - 0.5);

    setWords(testWords);
    setCurrentIndex(0);
    setTestState('in-progress');
    setResults([]);
    
    // Auto-speak the first word
    setTimeout(() => speakWord(testWords[0]), 500);
  };

  const getCurrentWord = () => {
    return words[currentIndex];
  };

  const speakWord = (wordObj) => {
    if (typeof wordObj === 'string') {
      // It's already the word string
      const utterance = new SpeechSynthesisUtterance(wordObj);
      utterance.rate = 0.8;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else if (wordObj) {
      const utterance = new SpeechSynthesisUtterance(wordObj.correct);
      utterance.rate = 0.8;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeakClick = () => {
    speakWord(getCurrentWord());
  };

  const getHint = (word) => {
    if (hintLevel === 0) {
      return null;
    } else if (hintLevel === 1) {
      return `First letter: "${word.correct[0]}"`;
    } else if (hintLevel === 2) {
      return `First and last: "${word.correct[0]}...${word.correct[word.correct.length - 1]}"`;
    } else if (hintLevel === 3) {
      const hidden = word.correct
        .split('')
        .map((char, idx) => (idx === 0 || idx === word.correct.length - 1) ? char : '_')
        .join('');
      return `Partially hidden: ${hidden}`;
    }
    return null;
  };

  const handleShowAnswer = () => {
    const current = getCurrentWord();
    setFeedback(`The correct spelling is: <strong>${current.correct}</strong>`);
    setAttempts(0);
    setHintLevel(0);
    storage.recordAttempt(current.id, false);
    setResults([...results, { word: current, correct: false }]);
  };

  const handleHint = () => {
    const current = getCurrentWord();
    const hint = getHint(current);
    
    if (hint) {
      setFeedback(`Hint: ${hint}`);
      setHintLevel(hintLevel + 1);
    } else if (hintLevel >= 3) {
      handleShowAnswer();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userAnswer.trim()) {
      setFeedback('Please type an answer');
      return;
    }

    const current = getCurrentWord();
    const isCorrect = userAnswer.toLowerCase().trim() === current.correct.toLowerCase().trim();

    if (isCorrect) {
      setFeedback(`✓ Correct! The spelling of "${current.correct}" is correct.`);
      storage.recordAttempt(current.id, true);
      setResults([...results, { word: current, correct: true }]);
      
      setTimeout(() => {
        nextWord();
      }, 1500);
    } else {
      if (attempts === 0) {
        setFeedback(`✗ Try again! "${userAnswer}" is not correct.`);
        setAttempts(1);
      } else if (attempts === 1) {
        setFeedback(`Still not right. Would you like a hint?`);
        setAttempts(2);
      }
    }
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setFeedback('');
      setAttempts(0);
      setHintLevel(0);
      
      setTimeout(() => {
        speakWord(words[currentIndex + 1]);
      }, 500);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setTestState('completed');
  };

  const restartTest = () => {
    setUserAnswer('');
    setFeedback('');
    setAttempts(0);
    setHintLevel(0);
    initializeTest();
  };

  // Render states
  if (testState === 'no-words') {
    return (
      <div className="daily-test">
        <div className="no-words-message">
          <h2>No Words to Test</h2>
          <p>Add some misspelled words first to start a spelling test!</p>
        </div>
      </div>
    );
  }

  if (testState === 'not-started') {
    return (
      <div className="daily-test">
        <div className="loading-message">Loading test...</div>
    </div>
    );
  }

  if (testState === 'completed') {
    const total = results.length;
    const correct = results.filter(r => r.correct).length;
    const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;

    return (
      <div className="daily-test">
        <div className="test-completed">
          <h2>Test Complete! 🎉</h2>
          
          <div className="results-summary">
            <div className="result-stat">
              <span className="result-label">Accuracy</span>
              <span className={`result-value ${accuracy >= 80 ? 'excellent' : accuracy >= 60 ? 'good' : 'needs-work'}`}>
                {accuracy}%
              </span>
            </div>
            <div className="result-stat">
              <span className="result-label">Correct</span>
              <span className="result-value correct-count">{correct}/{total}</span>
            </div>
          </div>

          <div className="results-details">
            <h3>Results</h3>
            {results.map((result, idx) => (
              <div key={idx} className={`result-item ${result.correct ? 'correct' : 'incorrect'}`}>
                <span className="result-icon">{result.correct ? '✓' : '✗'}</span>
                <span className="result-word">{result.word.correct}</span>
              </div>
            ))}
          </div>

          <button className="restart-btn" onClick={restartTest}>
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  const current = getCurrentWord();
  const progress = currentIndex + 1;
  const total = words.length;

  return (
    <div className="daily-test">
      <div className="test-progress">
        <span>{progress} of {total}</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(progress / total) * 100}%` }}></div>
        </div>
      </div>

      <div className="test-container">
        <h2>Spelling Test</h2>

        <div className="word-section">
          <div className="word-display">
            <p className="instruction">Listen to the word and spell it:</p>
            
            <button
              className={`speak-btn ${speaking ? 'speaking' : ''}`}
              onClick={handleSpeakClick}
              disabled={speaking}
              title="Listen to the word"
            >
              🔊 {speaking ? 'Speaking...' : 'Speak Word'}
            </button>

            <div className="word-info">
              {current.category && <span className="info-badge">{current.category}</span>}
              {current.rule && <span className="info-badge">{current.rule}</span>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="answer-form">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the spelling here..."
              autoFocus
              autoComplete="off"
            />

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                Submit Answer
              </button>
              <button
                type="button"
                className="hint-btn"
                onClick={handleHint}
              >
                💡 Hint
              </button>
              <button
                type="button"
                className="skip-btn"
                onClick={handleShowAnswer}
              >
                Show Answer
              </button>
            </div>
          </form>

          {feedback && (
            <div className={`feedback ${feedback.includes('✓') ? 'correct-feedback' : feedback.includes('✗') ? 'incorrect-feedback' : ''}`}>
              <p dangerouslySetInnerHTML={{ __html: feedback }}></p>
              
              {attempts === 2 && !feedback.includes('✓') && !feedback.includes('correctly') && (
                <div className="next-actions">
                  <button type="button" className="next-btn" onClick={nextWord}>
                    Next Word
                  </button>
                  <button type="button" className="show-answer-btn" onClick={handleShowAnswer}>
                    Show Answer
                  </button>
                </div>
              )}

              {feedback.includes('✓') && (
                <button type="button" className="next-btn" onClick={nextWord}>
                  Next Word
                </button>
              )}
            </div>
          )}
        </div>

        {current.rule && (
          <div className="learning-tip">
            <h4>💡 Learning Tip</h4>
            <p className="tip-text">This word relates to the <strong>"{current.rule}"</strong> spelling rule. Review the details in the word list to understand the pattern better.</p>
          </div>
        )}
      </div>
    </div>
  );
}
