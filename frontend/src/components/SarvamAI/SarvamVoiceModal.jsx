import React, { useState } from 'react';
import { Mic, X, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import './SarvamVoiceModal.css';

export default function SarvamVoiceModal({ isOpen, onClose }) {
  const [lang, setLang] = useState('hi'); // 'hi' (Hindi), 'mr' (Marathi), 'en' (English)
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(null);

  if (!isOpen) return null;

  const sampleQueries = {
    hi: {
      text: "नागपुर जोन A में कितने सत्यापित फल विक्रेता हैं?",
      res: "नागपुर ज़ोन A (मार्केट स्क्वायर) में कुल 142 सत्यापित फल और सब्जी विक्रेता पंजीकृत हैं। 98.2% विक्रेता नियमों का पालन कर रहे हैं।"
    },
    mr: {
      text: "झोन B मधील नवीन फेरीवाला परवानगी कशी मिळवावी?",
      res: "झोन B (VNIT गेट) साठी डिजिटल प्रमाणपत्र अर्ज ऑनलाइन पोर्टलवरून करता येतो. आधार कार्ड आणि फोटो अपलोड करा."
    },
    en: {
      text: "Show me non-vending congestion zones in Nagpur Metro Corridor.",
      res: "Zone C (Metro Corridor) currently has 88% capacity. AI zone optimization recommends shifting 15 stalls to Zone B."
    }
  };

  const handleMicClick = () => {
    if (recording) return;
    setRecording(true);
    setTranscript('Listening... Speak now...');
    setResponse(null);

    setTimeout(() => {
      setRecording(false);
      const query = sampleQueries[lang];
      setTranscript(`"${query.text}"`);
      setResponse(query.res);
    }, 2200);
  };

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
            onClick={handleMicClick}
            title="Click to speak"
          >
            <Mic size={36} />
          </button>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
            {recording ? 'Sarvam Speech AI is listening...' : 'Tap Mic & Ask in your native language'}
          </span>
        </div>

        {/* Speech Recognition Output */}
        {transcript && (
          <div className="transcript-box">
            {transcript}
          </div>
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
