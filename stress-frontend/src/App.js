import React, { useState, useEffect } from 'react';
import StressForm from './components/StressForm';
import Auth from './components/Auth';
import StressHistory from './components/StressHistory';
import VoiceButton from './components/VoiceButton';
import useVoiceAssistant from './hooks/useVoiceAssistant';

function App() {
  // Initializing user as null ensures the Auth component is the default view on startup
  const [user, setUser] = useState(null);
  const [view, setView] = useState('form');
  const [lastResult, setLastResult] = useState(null);

  const { isListening, startListening, speak } = useVoiceAssistant({
    setView: (v) => setView(v),
    readLastResult: () => {
        if (lastResult) {
            speak(`Your last recorded stress level was ${lastResult.stress_level}. ${lastResult.summary}`);
        } else {
            speak("You haven't performed an assessment yet. Switching to the assessment form.");
            setView('form');
        }
    },
    readRecommendations: () => {
        if (lastResult && lastResult.recommendations) {
            const advice = lastResult.recommendations.join(". ");
            speak(`I recommend the following: ${advice}`);
        } else {
            speak("Please complete a stress test first so I can give you recommendations.");
        }
    }
  });

  // Handle session persistence ONLY for refreshes within the same tab
  useEffect(() => {
    // sessionStorage clears automatically when the tab or window is closed
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    setLastResult(null);
    // Optional: Reset view on logout as well to be safe
    setView('form'); 
  };

  return (
    <div className="min-vh-100 bg-light pb-5">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4 shadow-sm">
        <div className="container">
          <div className="d-flex align-items-center">
            <span className="navbar-brand fw-bold">StressSync AI</span>
            {user && (
              <span className="text-white-50 ms-3 border-start ps-3 d-none d-md-inline">
                <span className="text-white fw-medium">Hi, {user.full_name}</span>
              </span>
            )}
          </div>
          
          {user && (
            <div className="navbar-nav ms-auto">
              <button 
                className={`nav-link btn btn-link ${view === 'form' ? 'active fw-bold border-bottom' : ''}`} 
                onClick={() => setView('form')}
              >
                New Assessment
              </button>
              <button 
                className={`nav-link btn btn-link ${view === 'history' ? 'active fw-bold border-bottom' : ''}`} 
                onClick={() => setView('history')}
              >
                My History
              </button>
              <button className="nav-link btn btn-link ms-lg-4" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="container">
        {!user ? (
          <div className="mt-5">
            <Auth onLoginSuccess={(u) => {
              setUser(u);
              // FIX: Force the view back to 'form' (New Assessment) upon login
              setView('form'); 
              // Using sessionStorage instead of localStorage for per-session security
              sessionStorage.setItem('user', JSON.stringify(u));
            }} />
          </div>
        ) : (
          <>
            {view === 'form' ? (
              <StressForm 
                userId={user.user_id}
                onResultReceived={(res) => setLastResult(res)}
              />
            ) : (
              <StressHistory userId={user.user_id} />
            )}
            <VoiceButton isListening={isListening} onStart={startListening} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;