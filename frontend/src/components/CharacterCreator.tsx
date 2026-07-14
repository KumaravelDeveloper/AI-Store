import React, { useState } from 'react';

interface Character {
  name: string;
  avatar: string;
  tone: string;
  pitch: number;
  rate: number;
  nickname?: string;
  role?: string;
  archetype?: string;
}

interface CharacterCreatorProps {
  token: string | null;
  currentCharacter: Character | null;
  onSaveCharacter: (char: Character) => void;
}

const AVATAR_OPTIONS = ['🤖', '🧠', '👾', '🦄', '🐱', '🧙‍♂️', '🦊', '👩‍🚀'];


const ARCHETYPES = [
  {
    id: 'aura',
    name: 'Cyber Fox (Aura)',
    genre: 'Anime 🦊',
    desc: 'Lightweight draft engines & quick generators optimized for fast-inference loops.',
    suggestion: 'Gemini 1.5 Flash (Category: Productivity / Content Gen)',
  },
  {
    id: 'kaelen',
    name: 'Mage of Code (Kaelen)',
    genre: 'Anime 🧙‍♂️',
    desc: 'Deep reasoning, syntax compilation and complex coding tasks.',
    suggestion: 'Claude 3.5 Sonnet (Category: Coding / Engineering)',
  },
  {
    id: 'steele',
    name: 'Iron Titan (Steele)',
    genre: 'Super Hero 🦸‍♂️',
    desc: 'Heavy pipeline workflows, enterprise integrations and deep data parsing.',
    suggestion: 'OpenAI GPT-4o / API (Category: Automation / Business)',
  },
  {
    id: 'bolt',
    name: 'Speedster (Bolt)',
    genre: 'Super Hero ⚡',
    desc: 'Rapid drafting, copy editing, translation and short-form summaries.',
    suggestion: 'Llama 3.1 70B (Category: Writing / Research)',
  },
];

const ROLE_OPTIONS = [
  'Software Engineer',
  'UI/UX Designer',
  'Content Marketer',
  'Data Analyst',
  'Research Scientist',
  'Student / Hobbyist',
];

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  token,
  currentCharacter,
  onSaveCharacter,
}) => {
  const [name, setName] = useState(currentCharacter?.name || 'Aria');
  const [avatar, setAvatar] = useState(currentCharacter?.avatar || '🤖');
  const [pitch, setPitch] = useState(currentCharacter?.pitch || 1.0);
  const [rate, setRate] = useState(currentCharacter?.rate || 1.0);
  
  // New personalization fields
  const [nickname, setNickname] = useState(currentCharacter?.nickname || '');
  const [role, setRole] = useState(currentCharacter?.role || 'Software Engineer');
  const [archetype, setArchetype] = useState(currentCharacter?.archetype || 'aura');

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const handleTestVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support Speech Synthesis.');
      return;
    }
    
    window.speechSynthesis.cancel();

    const archetypeToneMapping: Record<string, string> = {
      aura: 'Enthusiastic AI Geek',
      kaelen: 'Sarcastic Cyber Hacker',
      steele: 'Direct Data Analyst',
      bolt: 'Empathetic Guide'
    };

    const toneLabel = archetypeToneMapping[archetype] || 'Empathetic Guide';

    const greetingText = `Hello ${nickname || 'there'}! I am ${name}, your custom ${
      ARCHETYPES.find((a) => a.id === archetype)?.name
    } guide. I see you are a ${role}. I will speak with a ${toneLabel} tone. Let's discover some AI models today!`;

    const utterance = new SpeechSynthesisUtterance(greetingText);
    utterance.pitch = pitch;
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const synthVoice = voices.find((v) => v.name.includes('Google US English') || v.lang.startsWith('en'));
    if (synthVoice) utterance.voice = synthVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('You must be logged in to save a custom AI character!');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    const archetypeToneMapping: Record<string, string> = {
      aura: 'geek',
      kaelen: 'hacker',
      steele: 'analyst',
      bolt: 'guide'
    };

    const tone = archetypeToneMapping[archetype] || 'guide';

    const characterData: Character = {
      name,
      avatar,
      tone,
      pitch,
      rate,
      nickname,
      role,
      archetype,
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/character', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ character: characterData }),
      });

      if (res.ok) {
        setSaveStatus('success');
        onSaveCharacter(characterData);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="character-creator-container animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          🎭 Personal Robot Assistant Creator
        </h2>
        <p className="section-subtitle-text" style={{ marginBottom: '32px' }}>
          Personalize user profile details so the AI guide bot greetings match your professional role, and choose archetypes to receive custom suggestions.
        </p>

        {saveStatus === 'success' && (
          <div className="form-success-alert" style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
            🎉 Personal robot configurations saved successfully!
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="form-error-alert" style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
            ⚠️ Failed to save personal robot parameters. Please try again.
          </div>
        )}

        <form onSubmit={handleSave} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: User details */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 16px' }}>👤 User Profile Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Preferred Nickname</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Kumar"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Your Professional Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Robot details */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 16px' }}>🤖 Robot Design</h3>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div className="character-preview-circle" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', boxShadow: '0 8px 24px var(--accent-glow)' }}>
                {avatar}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Robot Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={15}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Avatar Icon</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={`avatar-chip-btn ${avatar === opt ? 'active' : ''}`}
                    onClick={() => setAvatar(opt)}
                    style={{
                      fontSize: '1.4rem',
                      background: avatar === opt ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      border: avatar === opt ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Robot Archetypes (Anime & Super Heroes) */}
          <div className="form-group">
            <label className="form-label">Visual Robot Archetype (Anime & Super Heroes)</label>
            <p className="section-subtitle-text" style={{ fontSize: '0.8rem', marginTop: '2px', marginBottom: '12px' }}>
              Select an archetype style to dynamically receive suggested AI models matching its computational logic.
            </p>
            <div className="archetype-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {ARCHETYPES.map((arch) => (
                <div
                  key={arch.id}
                  className={`archetype-card glass-panel ${archetype === arch.id ? 'active' : ''}`}
                  onClick={() => setArchetype(arch.id)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: archetype === arch.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: archetype === arch.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.94rem' }}>{arch.name}</span>
                    <span className="badge badge-paid" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>{arch.genre}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: '1.4' }}>{arch.desc}</p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '4px', borderLeft: '3px solid var(--accent-primary)' }}>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Suggested AI Model</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>{arch.suggestion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Speech Synthesizer variables */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 16px' }}>🔊 Speech Synthesizer Pitch & Speed</h3>
            <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label">Voice Pitch</label>
                  <span style={{ fontSize: '0.86rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{pitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  className="slider-range"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label">Speaking Rate (Speed)</label>
                  <span style={{ fontSize: '0.86rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  className="slider-range"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTestVoice}
              style={{ flex: 1, padding: '12px' }}
            >
              🔊 Test Speech Greeting
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
              style={{ flex: 1, padding: '12px' }}
            >
              {isSaving ? 'Saving Robot Config...' : '💾 Save Assistant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
