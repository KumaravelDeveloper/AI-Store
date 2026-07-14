import React, { useState, useEffect } from 'react';

interface HomePageProps {
  onNavigateToCatalog: () => void;
  onNavigateToWorkflows: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToCatalog,
  onNavigateToWorkflows,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakExplainer = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support Speech Synthesis.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const explanationText = "Hello! I am your AI Store virtual Robo-Guide. I am designed to help you scan, index, and organize deep learning tools to fit your specific workflow goals. You can customize my tone, pitch, and suggestions on the AI Helper creator page. Let me show you what artificial intelligence can accomplish!";
    
    const utterance = new SpeechSynthesisUtterance(explanationText);
    utterance.pitch = 1.1;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const synthVoice = voices.find((v) => v.name.includes('Google US English') || v.lang.startsWith('en'));
    if (synthVoice) utterance.voice = synthVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Safe release on exit
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="homepage-container animate-fade-in">
      {/* 1. Hero Welcome Banner */}
      <section className="hero-landing glass-panel">
        <h1 className="hero-landing-title">
          Welcome to <span className="logo-highlight">AI Store</span>
        </h1>
        <p className="hero-landing-subtitle">
          The ultimate marketplace registry to discover, compare, and connect artificial intelligence tools for any workflow.
        </p>
        <div className="hero-action-buttons">
          <button className="btn btn-primary btn-lg" onClick={onNavigateToCatalog}>
            Explore AI Catalog ➔
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onNavigateToWorkflows}>
            Browse Workflows ⚙️
          </button>
        </div>
      </section>

      {/* 2. Interactive SVG Robo-Guide Narrator Box */}
      <section className="video-section glass-panel">
        <h3 className="section-title text-center">📺 AI Robo-Guide Narrator</h3>
        <p className="section-subtitle-text text-center" style={{ marginBottom: '24px' }}>
          Meet your virtual assistant. Click play to hear the bot explain its automated indexing registry core.
        </p>

        <div className="robo-guide-simulator-card glass-panel" style={{ display: 'flex', gap: '30px', alignItems: 'center', padding: '30px', maxWidth: '680px', margin: '0 auto', flexWrap: 'wrap' }}>
          {/* Animated SVG Robot Face */}
          <div className="robo-head-viewport" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', position: 'relative' }}>
            <svg className={`robo-head-svg ${isSpeaking ? 'active-speaking' : ''}`} viewBox="0 0 100 100" width="120" height="120" style={{ transition: 'all 0.3s' }}>
              <rect x="20" y="25" width="60" height="50" rx="10" fill="url(#robo-metal)" style={{ stroke: 'var(--border-color)', strokeWidth: 3 }} />
              <rect x="30" y="38" width="40" height="12" rx="4" fill="#0f172a" />
              <circle cx="40" cy="44" r="4" fill="#22d3ee" className="robo-eye-l" />
              <circle cx="60" cy="44" r="4" fill="#22d3ee" className="robo-eye-r" />
              <rect x="40" y="58" width="20" height="5" rx="2" fill="#22d3ee" className="robo-mouth-visualizer" />
              <line x1="50" y1="25" x2="50" y2="10" style={{ stroke: 'var(--border-color)', strokeWidth: 3 }} />
              <circle cx="50" cy="10" r="5" fill="#f43f5e" className="robo-antenna-node" />
              <defs>
                <linearGradient id="robo-metal" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#1e293b" />
                  <stop offset="1" stopColor="#475569" />
                </linearGradient>
              </defs>
            </svg>
            <span className="badge badge-paid" style={{ marginTop: '12px', background: isSpeaking ? 'var(--success)' : 'var(--accent-primary)', color: 'white' }}>
              {isSpeaking ? 'Narrator Speaking 🔊' : 'Guide Online 🟢'}
            </span>
          </div>

          {/* Robo Specs List */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 'bold' }}>Model-Core Specifications</h4>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', padding: '6px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Core Module</span> <strong>Synapse-v2 Registry</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', padding: '6px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Narrator Role</span> <strong>Dynamic TTS Descriptor</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', padding: '6px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Personalization</span> <strong>Custom Tone / Nickname / Archetype</strong>
              </div>
            </div>

            <button
              onClick={handleSpeakExplainer}
              className={`btn ${isSpeaking ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%', marginTop: '20px', padding: '10px' }}
            >
              {isSpeaking ? '⏹️ Mute Robo-Guide' : '🔊 Hear Robo-Guide Explanation'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Interactive CSS Neural Network Synapses Animation */}
      <section className="animation-section glass-panel">
        <h3 className="section-title text-center">🧠 Neural network synapse data flow</h3>
        <div className="neural-network-canvas">
          <div className="neural-node node-left-1"></div>
          <div className="neural-node node-left-2"></div>
          <div className="neural-node node-center-1"></div>
          <div className="neural-node node-center-2"></div>
          <div className="neural-node node-right-1"></div>
          <div className="neural-node node-right-2"></div>

          {/* Connection Lines & Synapse Packets */}
          <div className="neural-line line-l1-c1">
            <span className="synapse-packet packet-fast"></span>
          </div>
          <div className="neural-line line-l2-c1">
            <span className="synapse-packet"></span>
          </div>
          <div className="neural-line line-c1-r1">
            <span className="synapse-packet packet-slow"></span>
          </div>
          <div className="neural-line line-c1-r2">
            <span className="synapse-packet"></span>
          </div>
          <div className="neural-line line-l2-c2">
            <span className="synapse-packet packet-fast"></span>
          </div>
          <div className="neural-line line-c2-r2">
            <span className="synapse-packet"></span>
          </div>
        </div>
        <p className="canvas-description text-center">
          CSS simulation of synthetic data firing across deep neural pathways.
        </p>
      </section>

      {/* 4. Foundations of AI & Growth Passage */}
      <section className="history-section glass-panel">
        <h2 className="history-title">📚 The Foundations of AI & Their Growth</h2>
        <div className="history-divider"></div>
        
        <div className="history-passage">
          <article className="history-block">
            <h4 className="block-subtitle">1950 – 1980: The Seeds of Artificial Intelligence</h4>
            <p>
              The quest for artificial minds was formalized in 1950 when British mathematician <strong>Alan Turing</strong> published his landmark paper, <em>"Computing Machinery and Intelligence,"</em> proposing the famous Turing Test.
              Six years later, in 1956, the term "Artificial Intelligence" was officially coined by <strong>John McCarthy</strong> at the historic Dartmouth Summer Research Project.
              This early era focused on symbolic AI, heuristics, and hand-written rulesets. While it birthed search algorithms and basic logic proof engines, the limited computing hardware of the time could not support the heavy mathematical representations required, leading to the first "AI Winters."
            </p>
          </article>

          <article className="history-block">
            <h4 className="block-subtitle">1980 – 2010: The Connectionist Renaissance</h4>
            <p>
              In the mid-1980s, the connectionist school of thought resurged with the popularization of the <strong>backpropagation algorithm</strong> by David Rumelhart, Geoffrey Hinton, and Ronald Williams. Backpropagation allowed multi-layered artificial neural networks to learn internal representations from training data.
              As the internet grew, providing massive datasets, and silicon developers created high-throughput <strong>Graphical Processing Units (GPUs)</strong>, deep learning emerged. In 2012, the AlexNet convolutional network crushed competitors in the ImageNet challenge, proving that deep neural networks could learn complex visual descriptors far better than human-engineered rules.
            </p>
          </article>

          <article className="history-block">
            <h4 className="block-subtitle">2017 – Present: The Transformer & Generative Era</h4>
            <p>
              The current exponential growth curve of AI began in 2017 when Google researchers published the revolutionary <strong>Transformer architecture</strong> (<em>"Attention Is All You Need"</em>). The attention mechanism allowed models to parallelize training and process sequences across vast text databases, understanding deep semantic relationships.
              This architecture led to the rise of massive Large Language Models (LLMs) like GPT-4 and Claude, as well as diffusion frameworks capable of synthesizing high-fidelity imagery and audio.
              Today, AI is shifting from static chat inputs to autonomous agentic workflows that integrate coding, design, and API automation directly into enterprise pipelines, establishing the basis for a global intelligence economy.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};
