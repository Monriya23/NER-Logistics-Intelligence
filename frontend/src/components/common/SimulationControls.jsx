import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Sliders, ChevronDown, ChevronUp, X } from 'lucide-react';

export const SimulationControls = () => {
  const { demoMode, toggleDemoMode } = useDemoMode();
  const { simState, loading, goToStep, nextStep, resetSimulation } = useSimulation();
  const [collapsed, setCollapsed] = useState(false);

  // If Demo Mode is not activated by user in header, hide completely
  if (!demoMode) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1050,
        width: '92%',
        maxWidth: '1050px'
      }}
    >
      {collapsed ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--color-monitor-border)',
              borderRadius: '20px',
              padding: '0.4rem 1rem',
              color: 'var(--text-main)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Sliders size={13} color="var(--color-monitor)" />
            <span>Demo Mode (Step {simState.current_step_number}/10)</span>
            <ChevronUp size={13} />
          </button>
        </div>
      ) : (
        <div
          className="card-panel"
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            padding: '0.75rem 1.25rem'
          }}
        >
          {/* Header Controls: Minimize and Close Demo Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                background: 'var(--color-monitor-bg)',
                color: 'var(--color-monitor)',
                border: '1px solid var(--color-monitor-border)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: '4px'
              }}>
                JUDGE DEMO MODE • STEP {simState.current_step_number} OF {simState.total_steps}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Gangtok → Chungthang Emergency Flow
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setCollapsed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
                title="Minimize Demo Controls"
              >
                <ChevronDown size={12} />
                <span>Minimize</span>
              </button>

              <button
                onClick={toggleDemoMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
                title="Exit Demo Mode"
              >
                <X size={12} />
                <span>Exit Demo</span>
              </button>
            </div>
          </div>

          {/* Stepper Main Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Step Title */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {simState.title}
              </div>
            </div>

            {/* Step Buttons (1 to 10) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stepNum) => {
                const isCurrent = simState.current_step_number === stepNum;
                const isPassed = simState.current_step_number > stepNum;
                return (
                  <button
                    key={stepNum}
                    onClick={() => goToStep(stepNum)}
                    disabled={loading}
                    style={{
                      width: isCurrent ? '28px' : '22px',
                      height: '22px',
                      borderRadius: '4px',
                      background: isCurrent ? 'var(--brand-navy)' : isPassed ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      color: isCurrent ? '#FFFFFF' : isPassed ? 'var(--brand-navy)' : 'var(--text-muted)',
                      border: isCurrent ? '1px solid var(--brand-navy)' : '1px solid var(--border-default)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={`Step ${stepNum}`}
                  >
                    {stepNum}
                  </button>
                );
              })}
            </div>

            {/* Step Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={resetSimulation}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.74rem' }}
                title="Reset Scenario to Step 1"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
              <button
                onClick={nextStep}
                disabled={loading || simState.current_step_number >= simState.total_steps}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
