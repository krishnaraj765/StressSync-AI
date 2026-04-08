import React from 'react';

const VoiceButton = ({ isListening, onStart }) => {
    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            <button 
                onClick={onStart}
                className={`btn btn-lg rounded-circle shadow-lg p-3 ${isListening ? 'btn-danger' : 'btn-primary'}`}
                style={{ width: '70px', height: '70px', transition: 'all 0.3s' }}
            >
                {isListening ? (
                    <span className="spinner-grow spinner-grow-sm" role="status"></span>
                ) : (
                    <i className="bi bi-mic-fill"></i> // Ensure Bootstrap Icons are installed
                )}
            </button>
            {isListening && (
                <div className="badge bg-dark mt-2 d-block animate-pulse">Listening...</div>
            )}
        </div>
    );
};

export default VoiceButton;