import React, { useState, useEffect } from 'react';
import {
  Compass,
  Navigation,
  Radio,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const ROLE_STORAGE_KEY = 'NER_LOGISTICS_SELECTED_ROLE';

export const LandingPage = ({ onSelectRole }) => {
  const [savedRole, setSavedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY);
      if (stored) setSavedRole(stored);
    } catch (e) {
      console.warn('Could not read stored role', e);
    }
  }, []);

  const handleRoleSelect = (roleId) => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, roleId);
    } catch (e) {
      console.warn('Could not persist selected role', e);
    }
    if (onSelectRole) {
      onSelectRole(roleId);
    }
  };

  const getRoleLabel = (roleId) => {
    switch (roleId) {
      case 'control_center':
        return 'Logistics Coordinator';
      case 'driver_hud':
        return 'Driver';
      case 'field_portal':
        return 'Field Reporter';
      case 'admin_verification':
        return 'Authority / Verifier';
      default:
        return 'Logistics Coordinator';
    }
  };

  const roles = [
    {
      id: 'control_center',
      title: 'LOGISTICS COORDINATOR',
      description: 'Plan and monitor essential-goods movement.',
      icon: Compass,
      color: 'var(--brand-accent)'
    },
    {
      id: 'driver_hud',
      title: 'DRIVER',
      description: 'Receive route alerts and report road conditions.',
      icon: Navigation,
      color: 'var(--accent-blue)'
    },
    {
      id: 'field_portal',
      title: 'FIELD REPORTER',
      description: 'Capture incidents and road conditions from the ground.',
      icon: Radio,
      color: 'var(--accent-amber)'
    },
    {
      id: 'admin_verification',
      title: 'AUTHORITY / VERIFIER',
      description: 'Verify incidents and update operational road status.',
      icon: ShieldCheck,
      color: 'var(--accent-green)'
    }
  ];

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '1020px', margin: '1.5rem auto 3.5rem auto', width: '100%' }}>
      {/* Title & Purpose Section */}
      <div
        style={{
          textAlign: 'center',
          padding: '2rem 1.5rem 1rem 1.5rem'
        }}
      >
        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
          Ministry of Development of North Eastern Region (MDoNER)
        </div>
        <h1 style={{ fontSize: '2.1rem', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          NER Logistics Intelligence
        </h1>
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: '750px', margin: '0 auto 0.65rem auto', lineHeight: 1.45 }}>
          AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '620px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
          Operational intelligence for roads, logistics and essential-goods movement across challenging mountain corridors.
        </p>

        {/* Quick Resume Option */}
        {savedRole && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-xs)', boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Previously active as: <strong style={{ color: 'var(--text-main)' }}>{getRoleLabel(savedRole)}</strong>
            </span>
            <button
              onClick={() => handleRoleSelect(savedRole)}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
            >
              <span>Continue as {getRoleLabel(savedRole)}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Role Selection Question */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '1.15rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>
            Who are you?
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Select your operational role to enter the corresponding workspace
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isSaved = savedRole === role.id;
            const isHovered = hoveredRole === role.id;

            return (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                className="panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.35rem 1.15rem',
                  border: isSaved
                    ? '2px solid var(--brand-navy)'
                    : isHovered
                    ? '1px solid var(--brand-accent)'
                    : '1px solid var(--border-default)',
                  background: isHovered ? 'var(--bg-hover)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: role.color,
                      marginBottom: '0.85rem'
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', letterSpacing: '0.01em' }}>
                    {role.title}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    {role.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
                    Enter Workspace
                  </span>
                  <ArrowRight size={13} color="var(--brand-accent)" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
