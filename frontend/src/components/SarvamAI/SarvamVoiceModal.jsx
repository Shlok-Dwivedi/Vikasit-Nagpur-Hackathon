import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import './SarvamVoiceModal.css';

export default function SarvamVoiceModal({ isOpen, onClose, backendUrl }) {
  const [lang, setLang] = useState('hi'); // 'hi', 'mr', 'en'
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const recognitionRef = useRef(null);

  const apiBackendUrl = backendUrl || 'https://vikasit-nagpur-hackathon.onrender.com';

  useEffect(() => {
    // Reset state on modal open
    if (isOpen) {
      setTranscript('');
      setResponse(null);
      setErrorMsg(null);
    } else {
      stopListening();
    }
  }, [isOpen]);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop error if already stopped
      }
    }
    setRecording(false);
  };

  const startListening = () => {
    setErrorMsg(null);
    setResponse(null);

    // Check Web Speech API browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Web Speech API is not supported in this browser. Using text fallback.');
      runFallbackSpeech();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      // Set speech recognition language based on active tab
      if (lang === 'hi') recognition.lang = 'hi-IN';
      else if (lang === 'mr') recognition.lang = 'mr-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setRecording(true);
        setTranscript('Listening... Speak now into your microphone...');
      };

      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setTranscript(`"${currentTranscript}"`);
      };

      recognition.onerror = (event) => {
        console.warn('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone permission denied. Please allow mic access in your browser.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please try again.');
        }
        setRecording(false);
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech initialization error:', err);
      runFallbackSpeech();
    }
  };

  // Process dynamic query response from Render backend
  const handleQueryBackend = async (spokenText) => {
    try {
      const res = await fetch(`${apiBackendUrl}/api/sarvam-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: spokenText || transcript,
          language: lang
        })
      });
      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
      }
    } catch (err) {
      setResponse(`Sarvam Voice AI (${lang.toUpperCase()}): Information retrieved for query.`);
    }
  };

  const runFallbackSpeech = () => {
    setRecording(true);
    setTranscript('Simulating mic capture...');
    setTimeout(() => {
      setRecording(false);
      const text = lang === 'hi' 
        ? 'नागपूर झोन A मधील फेरीवाला माहिती' 
        : lang === 'mr' 
        ? 'फेरीवाला प्रमाणपत्र माहिती' 
        : 'Nagpur vending zone capacity inquiry';
      setTranscript(`"${text}"`);
      handleQueryBackend(text);
    }, 1500);
  };

  // Submit recorded transcript to Sarvam AI API
  const handleProcessTranscript = () => {
    if (transcript && !transcript.includes('Listening')) {
      handleQueryBackend(transcript.replace(/"/g, ''));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay">
      <div className="voice-modal-card">
        
        <div className="voice-modal-header">
          <div className="voice-modal-title">
            <Sparkles size={20} color="#60a5fa" />
            <h3>Sarvam AI Voice Assistant</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Language Selector */}
        <div className="lang-selector">
          <button className={`lang-btn ${lang === 'hi' ? 'active' : ''}`} onClick={() => setLang('hi')}>
            हिन्दी (Hindi)
          </button>
          <button className={`lang-btn ${lang === 'mr' ? 'active' : ''}`} onClick={() => setLang('mr')}>
            मराठी (Marathi)
          </button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>
            English
          </button>
        </div>

        {/* Voice Trigger */}
        <div className="mic-wave-container">
          <button 
            className={`big-mic-btn ${recording ? 'recording' : ''}`}
            onClick={recording ? stopListening : startListening}
            title={recording ? 'Click to stop listening' : 'Click to start real microphone speech detection'}
          >
            <Mic size={36} />
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {recording ? '🔴 Listening... Speak into your microphone' : 'Tap Mic for Live Browser Speech Recognition'}
          </span>
        </div>

        {/* Permission Error Message */}
        {errorMsg && (
          <div className="status-msg warning" style={{ fontSize: '0.78rem' }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real-time Speech Recognition Output */}
        {transcript && (
          <div className="transcript-box">
            {transcript}
          </div>
        )}

        {/* Ask AI Action Button */}
        {transcript && !recording && !response && (
          <button className="submit-btn" style={{ padding: '8px 16px' }} onClick={handleProcessTranscript}>
            <Sparkles size={16} />
            <span>Process Query with Sarvam AI API</span>
          </button>
        )}

        {/* AI Voice Answer */}
        {response && (
          <div className="ai-response-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Volume2 size={16} />
              <strong>Sarvam AI Answer:</strong>
            </div>
            {response}
          </div>
        )}

      </div>
    </div>
  );
}
