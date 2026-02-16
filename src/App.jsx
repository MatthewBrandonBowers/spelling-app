import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import WordInput from './components/WordInput';
import WordList from './components/WordList';
import DailyTest from './components/DailyTest';
import Stats from './components/Stats';
import './App.css';

function App() {
  const { user, loading, logOut } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [wordCount, setWordCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    updateWordCount();
  }, [currentPage]);

  const updateWordCount = async () => {
    // This will be updated to use Firebase storage later
    const data = localStorage.getItem('spelling_app_data');
    if (data) {
      const parsed = JSON.parse(data);
      setWordCount(parsed.words ? parsed.words.length : 0);
    }
  };

  const handleWordAdded = () => {
    updateWordCount();
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading Spelling Master...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="logo">📝</span>
            <h1>Spelling Master</h1>
          </div>

          <div className="nav-menu">
            <button
              className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
              title="Add new misspelled words"
            >
              Add Words
            </button>
            <button
              className={`nav-item ${currentPage === 'list' ? 'active' : ''}`}
              onClick={() => setCurrentPage('list')}
              title="View all words"
            >
              Word List ({wordCount})
            </button>
            <button
              className={`nav-item ${currentPage === 'test' ? 'active' : ''}`}
              onClick={() => setCurrentPage('test')}
              title="Take a daily spelling test"
            >
              Daily Test
            </button>
            <button
              className={`nav-item ${currentPage === 'stats' ? 'active' : ''}`}
              onClick={() => setCurrentPage('stats')}
              title="View your statistics"
            >
              Statistics
            </button>

            <div className="user-menu-wrapper">
              <button
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={user.displayName || user.email}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="user-avatar" />
                ) : (
                  <span className="user-avatar-default">
                    {(user.displayName || user.email)?.[0]?.toUpperCase()}
                  </span>
                )}
                <span className="user-name">
                  {user.displayName ? user.displayName.split(' ')[0] : 'Account'}
                </span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      {user.photoURL && (
                        <img src={user.photoURL} alt="Profile" className="dropdown-avatar" />
                      )}
                      <div>
                        <div className="dropdown-name">{user.displayName || 'User'}</div>
                        <div className="dropdown-email">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="dropdown-signout"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {currentPage === 'home' && (
          <>
            <div className="page-intro">
              <h2>Welcome to Spelling Master! 🎯</h2>
              <p>
                Improve your spelling by learning from your own mistakes. 
                Add the words you commonly misspell, take daily tests with audio, 
                and track your progress.
              </p>
            </div>
            <WordInput onWordAdded={handleWordAdded} />
          </>
        )}

        {currentPage === 'list' && <WordList />}

        {currentPage === 'test' && <DailyTest />}

        {currentPage === 'stats' && <Stats />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Spelling Master • Made for learners • Learn at your own pace
        </p>
      </footer>
    </div>
  );
}

export default App;
