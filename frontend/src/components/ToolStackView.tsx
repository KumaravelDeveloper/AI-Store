import React from 'react';
import type { Stack } from '../types';

interface ToolStackViewProps {
  stacks: Stack[];
  customStack: Stack | null;
  onViewToolDetailsByName: (name: string) => void;
}

export const ToolStackView: React.FC<ToolStackViewProps> = ({
  stacks,
  customStack,
  onViewToolDetailsByName,
}) => {
  return (
    <div className="stacks-view-container">
      <div className="stacks-hero">
        <h2 className="stacks-title">⚙️ AI Tool Workflows & Stacks</h2>
        <p className="stacks-subtitle">
          Combine multiple specialized AI tools into connected pipelines. Learn how to sequence creation, coding, or data processing.
        </p>
      </div>

      {customStack && (
        <div className="custom-stack-wrapper glass-panel highlight-border animate-fade-in">
          <div className="custom-stack-header">
            <span className="badge badge-primary">Dynamic Recommendation</span>
            <h3 className="stack-card-title">{customStack.name}</h3>
            <p className="stack-card-description">{customStack.description}</p>
          </div>

          <div className="workflow-steps-flow">
            {customStack.steps?.map((step) => (
              <div key={step.step_order} className="workflow-step-card glass-panel">
                <div className="step-badge">Step {step.step_order}</div>
                <div className="step-tool-info" onClick={() => onViewToolDetailsByName(step.tool_name || '')}>
                  <span className="step-tool-logo">{step.tool_logo || '🔧'}</span>
                  <span className="step-tool-name">{step.tool_name}</span>
                </div>
                <div className="step-role-text">{step.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="featured-stacks-list">
        <h3 className="section-title">Curated Tool Stacks</h3>
        <div className="stacks-grid">
          {stacks.map((stack) => (
            <div key={stack.id} className="stack-card glass-panel">
              <div className="stack-card-header">
                <h4 className="stack-card-title">{stack.name}</h4>
                <p className="stack-card-description">{stack.description}</p>
              </div>

              <div className="workflow-steps-flow">
                {stack.steps?.map((step) => (
                  <div key={step.step_order} className="workflow-step-card glass-panel">
                    <div className="step-badge">Step {step.step_order}</div>
                    <div className="step-tool-info" onClick={() => onViewToolDetailsByName(step.tool_name || '')}>
                      <span className="step-tool-logo">{step.tool_logo || '🔧'}</span>
                      <span className="step-tool-name">{step.tool_name}</span>
                    </div>
                    <div className="step-role-text">{step.role}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
