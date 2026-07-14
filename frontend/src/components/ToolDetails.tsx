import React, { useState, useEffect, useRef } from 'react';
import type { Tool } from '../types';

interface Character {
  name: string;
  avatar: string;
  tone: string;
  pitch: number;
  rate: number;
}

interface ToolDetailsProps {
  tool: Tool;
  onClose: () => void;
  onSelectAlternative?: (altName: string) => void;
  customCharacter: Character | null;
}

export const ToolDetails: React.FC<ToolDetailsProps> = ({
  tool,
  onClose,
  onSelectAlternative,
  customCharacter,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support Speech Synthesis.');
      return;
    }

    // Toggle speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speakerName = customCharacter?.name || 'Aria';
    const textToSpeak = `Hello, I am ${speakerName}. ${tool.name} is a ${tool.pricing_type} AI solution. ${
      tool.long_description || tool.short_description
    }. Pros include: ${tool.pros.join(', ')}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (customCharacter) {
      utterance.pitch = customCharacter.pitch;
      utterance.rate = customCharacter.rate;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    const voices = window.speechSynthesis.getVoices();
    const synthVoice = voices.find((v) => v.name.includes('Google US English') || v.lang.startsWith('en'));
    if (synthVoice) utterance.voice = synthVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Safe release on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="details-overlay" onClick={onClose}>
      <div className="details-drawer glass-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="close-drawer-btn" onClick={onClose}>
          ✕
        </button>

        <div className="drawer-header">
          <span className="drawer-logo">{tool.logo}</span>
          <div className="drawer-title-group">
            <h2 className="drawer-title">{tool.name}</h2>
            <div className="drawer-meta-badges">
              <span className={`badge badge-${tool.pricing_type}`}>{tool.pricing_type}</span>
              <span className="drawer-rating">⭐ {tool.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="drawer-body">
          <div className="drawer-section">
            <h3 className="section-title">Overview</h3>
            <p className="drawer-long-description">{tool.long_description || tool.short_description}</p>

            {/* Narrator Section */}
            <div className="audio-narrator-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <button
                className={`btn btn-secondary narrator-speak-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleSpeak}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.86rem' }}
              >
                {isSpeaking ? '⏹️ Mute Narrator' : `🔊 Speak Description (${customCharacter?.name || 'Aria'})`}
              </button>

              {isSpeaking && (
                <div className="equalizer-visualizer" style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '16px' }}>
                  <div className="eq-bar bar1"></div>
                  <div className="eq-bar bar2"></div>
                  <div className="eq-bar bar3"></div>
                  <div className="eq-bar bar4"></div>
                </div>
              )}
            </div>
          </div>

          <div className="drawer-section">
            <h3 className="section-title">Supported Use Cases</h3>
            <div className="use-cases-grid">
              {tool.use_cases && tool.use_cases.length > 0 ? (
                tool.use_cases.map((uc, i) => (
                  <span key={i} className="use-case-chip">
                    🔹 {uc}
                  </span>
                ))
              ) : (
                <span className="text-muted">No use cases specified.</span>
              )}
            </div>
          </div>

          <div className="pros-cons-grid">
            <div className="pros-column">
              <h3 className="section-title text-success">Pros</h3>
              <ul className="pros-list">
                {tool.pros.map((pro, i) => (
                  <li key={i}>✅ {pro}</li>
                ))}
              </ul>
            </div>

            <div className="cons-column">
              <h3 className="section-title text-danger">Cons</h3>
              <ul className="cons-list">
                {tool.cons.map((con, i) => (
                  <li key={i}>❌ {con}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="drawer-section">
            <h3 className="section-title">Specifications</h3>
            <div className="specifications-table">
              <div className="spec-row">
                <span className="spec-name">Platform</span>
                <span className="spec-val">{tool.platform}</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Region Restricted</span>
                <span className="spec-val">{tool.region_limited || 'No'}</span>
              </div>
            </div>
          </div>

          {tool.alternatives && tool.alternatives.length > 0 && (
            <div className="drawer-section">
              <h3 className="section-title">Suggested Alternatives</h3>
              <div className="alternatives-list">
                {tool.alternatives.map((alt, i) => (
                  <button
                    key={i}
                    className="alt-chip btn btn-secondary btn-sm"
                    onClick={() => onSelectAlternative && onSelectAlternative(alt)}
                  >
                    🔍 {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <a
            href={tool.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary visit-website-btn"
          >
            Visit Website 🚀
          </a>
        </div>
      </div>
    </div>
  );
};
