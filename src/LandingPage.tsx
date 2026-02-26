import React, { useState } from 'react';
import { ReactFlowProvider } from '@reactflow/core';
import { WorkflowBuilder } from './components/WorkflowBuilder';

const FEATURES = [
  {
    icon: '🎨',
    title: 'Visual Design',
    description: 'Drag-and-drop interface. No more XML coding.'
  },
  {
    icon: '⚡',
    title: 'Export to AEM',
    description: 'Generate ready-to-deploy workflow models.'
  },
  {
    icon: '📦',
    title: 'Templates',
    description: 'Start with pre-built approval & translation workflows.'
  },
  {
    icon: '✅',
    title: 'Validate',
    description: 'Catch errors before deploying to AEM.'
  }
];

const USE_CASES = [
  { name: 'Content Approval', nodes: 'Start → Review → Approve → Publish' },
  { name: 'Translation', nodes: 'Start → Translate → Review → Publish' },
  { name: 'DAM Assets', nodes: 'Start → Upload → Process → Approve → Publish' },
];

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <ReactFlowProvider>
      <div style={showDemo ? { height: '100vh', background: '#fff' } : {}} className={showDemo ? '' : 'landing-page'}>
        {!showDemo ? (
          <>
            <nav className="landing-nav">
              <div className="landing-logo"><span>AEM</span>Flow</div>
              <a href="https://github.com" target="_blank" className="landing-nav-link">GitHub</a>
            </nav>
            
            <section className="landing-hero">
              <div className="landing-badge">For AEM Developers & Administrators</div>
              
              <h1>Stop Writing XML.<br /><span>Start Designing Visually.</span></h1>
              
              <p className="landing-subtitle">
                Create Adobe Experience Manager workflows in minutes—not hours. 
                Design visually, export ready-to-deploy XML. No more manual XML editing.
              </p>
              
              <div className="landing-cta">
                <button onClick={() => setShowDemo(true)} className="landing-cta-primary">
                  Try the Demo →
                </button>
                <a href="#features" className="landing-cta-secondary">
                  Learn More
                </a>
              </div>

              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-value">10-15 min</span>
                  <span className="stat-label">vs 2-4 hours</span>
                </div>
                <div className="stat">
                  <span className="stat-value">100%</span>
                  <span className="stat-label">XML Compatible</span>
                </div>
                <div className="stat">
                  <span className="stat-value">0</span>
                  <span className="stat-label">AEM Setup Required</span>
                </div>
              </div>
            </section>

            <section id="features" className="landing-features">
              <h2>Why AEMFlow?</h2>
              <div className="features-grid">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="landing-usecases">
              <h2>Common Use Cases</h2>
              <div className="usecases-grid">
                {USE_CASES.map((useCase, i) => (
                  <div key={i} className="usecase-card">
                    <h3>{useCase.name}</h3>
                    <code>{useCase.nodes}</code>
                  </div>
                ))}
              </div>
            </section>

            <section className="landing-comparison">
              <h2>Traditional XML vs AEMFlow</h2>
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Traditional XML</th>
                      <th>AEMFlow</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Create workflow</td>
                      <td>2-4 hours</td>
                      <td>10-15 minutes</td>
                    </tr>
                    <tr>
                      <td>Edit existing</td>
                      <td>Edit XML manually</td>
                      <td>Visual edit</td>
                    </tr>
                    <tr>
                      <td>Validate</td>
                      <td>Deploy & test</td>
                      <td>Pre-validation</td>
                    </tr>
                    <tr>
                      <td>Learning curve</td>
                      <td>Steep</td>
                      <td>Intuitive</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="landing-cta-section">
              <h2>Ready to streamline your AEM workflows?</h2>
              <button onClick={() => setShowDemo(true)} className="landing-cta-primary landing-cta-large">
                Try the Demo Now →
              </button>
            </section>

            <footer className="landing-footer">
              <p>Built for AEM Developers • Open Source</p>
            </footer>
          </>
        ) : (
          <div style={{ height: '100vh' }}>
            <button 
              onClick={() => setShowDemo(false)}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 1000,
                padding: '8px 16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              ← Back to Home
            </button>
            <WorkflowBuilder />
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
