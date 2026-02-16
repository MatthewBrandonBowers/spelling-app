import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { googleSignIn, loading, error } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      await googleSignIn();
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-icon">📝</div>
          <h1>Spelling Master</h1>
          <p className="tagline">Improve your spelling, one word at a time</p>

          <div className="login-description">
            <h2>Welcome!</h2>
            <p>
              Sign in with your Google account to start learning and tracking your spelling progress. 
              Your words and statistics will be saved to the cloud and synced across all your devices.
            </p>

            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">✏️</span>
                <span>Add words you commonly misspell</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span>Take daily audio-based spelling tests</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Track your progress with detailed statistics</span>
              </div>
              <div className="feature">
                <span className="feature-icon">☁️</span>
                <span>Sync across all your devices</span>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={signingIn || loading}
          >
            {signingIn ? 'Signing in...' : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  ></path>
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  ></path>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <p className="privacy-note">
            Your data is securely stored and private. We only access your name and email.
          </p>
        </div>
      </div>
    </div>
  );
}
