import React, { useState, useEffect } from 'react';

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

interface GreetingBotProps {
  user: {
    email: string;
    subscription_status: 'trial' | 'premium';
    custom_character: Character | null;
  } | null;
  navigateToTab: (tab: string) => void;
}

const ARCHETYPE_NAMES: Record<string, string> = {
  aura: 'Cyber Fox (Aura) 🦊',
  kaelen: 'Mage of Code (Kaelen) 🧙‍♂️',
  steele: 'Iron Titan (Steele) 🦸‍♂️',
  bolt: 'Speedster (Bolt) ⚡',
};

const ARCHETYPE_RECOMMENDATIONS: Record<string, string> = {
  aura: 'Gemini 1.5 Flash for high-speed drafted generations.',
  kaelen: 'Claude 3.5 Sonnet for advanced logical engineering tasks.',
  steele: 'ChatGPT / OpenAI API to configure data workflow automation pipelines.',
  bolt: 'Llama 3.1 70B for rapid text draft iterations.',
};

export const GreetingBot: React.FC<GreetingBotProps> = ({ user, navigateToTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Auto-trigger welcome greeting upon user login
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setTourStep(0); // Initial welcome greeting step
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
      setTourStep(null);
    }
  }, [user]);

  if (!user) return null;

  const botName = user.custom_character?.name || 'Aria';
  const botAvatar = user.custom_character?.avatar || '🤖';
  const userNick = user.custom_character?.nickname || user.email.split('@')[0];
  const userRole = user.custom_character?.role || 'Developer';
  const userArch = user.custom_character?.archetype || 'aura';
  const planType = user.subscription_status === 'premium' ? 'Premium Member 💎' : '7-Day Free Trial ⏱️';

  const recommendation = ARCHETYPE_RECOMMENDATIONS[userArch] || 'our catalog of featured AI solutions.';
  const archetypeTitle = ARCHETYPE_NAMES[userArch] || 'Standard Assistant';

  const tourMessages = [
    `Hello ${userNick}! I am ${botName}, your custom ${archetypeTitle} guide. I see you are a ${userRole} (${planType}). Based on your role, I highly recommend checking out ${recommendation} Ready for a quick tour?`,
    "Click the 🌐 Discover tab in the sidebar to search AI tools using natural-language tasks (e.g. 'design a logo' or 'edit video'), budgets, and platforms.",
    "Click ⚙️ Workflows to view ordered logic pipelines, or manage your playlists on 📂 Collections. You can tweak my voice tone and user preferences on the 🎭 AI Helper page!",
  ];

  const handleNext = () => {
    if (tourStep !== null) {
      if (tourStep === 0) {
        navigateToTab('discover');
        setTourStep(1);
      } else if (tourStep === 1) {
        navigateToTab('stacks');
        setTourStep(2);
      } else {
        setTourStep(null);
        setIsOpen(false);
      }
    }
  };

  const handleSkip = () => {
    setTourStep(null);
    setIsOpen(false);
  };

  return (
    <div className="greeting-bot-wrapper">
      {/* 1. Speech Bubble Overlay */}
      {isOpen && (
        <div className="bot-speech-bubble glass-panel animate-fade-in">
          <div className="speech-bubble-header">
            <strong>{botName} ({archetypeTitle.split(' ')[0]})</strong>
            <button className="close-bubble-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="speech-bubble-content">
            <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: '1.4' }}>
              {tourStep !== null ? tourMessages[tourStep] : `Hi ${userNick}! I am ${botName}. Click me if you want to start the tutorial tour!`}
            </p>
          </div>
          <div className="speech-bubble-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            {tourStep !== null ? (
              <>
                <button className="tour-action-btn-secondary" onClick={handleSkip}>Skip</button>
                <button className="tour-action-btn-primary" onClick={handleNext}>
                  {tourStep === 2 ? 'Finish' : 'Next ➔'}
                </button>
              </>
            ) : (
              <button
                className="tour-action-btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
                onClick={() => setTourStep(0)}
              >
                🎓 Start Tour
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Floating Animated Bot Trigger Avatar */}
      <button
        className="floating-bot-avatar"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && tourStep === null) {
            setTourStep(null); // Just greet generally
          }
        }}
        title={`Chat with ${botName}`}
      >
        <span className="bot-avatar-emoji">{botAvatar}</span>
        <span className="bot-pulse-ring"></span>
      </button>
    </div>
  );
};
