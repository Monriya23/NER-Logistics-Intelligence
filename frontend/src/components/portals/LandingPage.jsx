import React, { useState } from 'react';
import { NERRegionalMap } from '../map/NERRegionalMap';
import {
  Truck,
  Navigation,
  Radio,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const LandingPage = ({ onSelectRole }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleSelectRole = (roleId) => {
    if (onSelectRole) {
      onSelectRole(roleId);
    }
  };

  const roleCards = [
    {
      id: 'logistics',
      title: 'LOGISTICS COORDINATOR',
      description: 'Plan and monitor essential-goods movement.',
      icon: Truck,
      color: '#0284C7',
      accentColor: '#38BDF8',
      targetTab: 'logistics'
    },
    {
      id: 'driver',
      title: 'DRIVER',
      description: 'Receive route alerts and report road conditions.',
      icon: Navigation,
      color: '#0D9488',
      accentColor: '#2DD4BF',
      targetTab: 'driver'
    },
    {
      id: 'field_reports',
      title: 'FIELD REPORTER',
      description: 'Capture incidents and road conditions from the ground.',
      icon: Radio,
      color: '#D97706',
      accentColor: '#FBBF24',
      targetTab: 'field_reports'
    },
    {
      id: 'authority',
      title: 'AUTHORITY / VERIFIER',
      description: 'Verify incidents and update operational road status.',
      icon: ShieldCheck,
      color: '#059669',
      accentColor: '#10B981',
      targetTab: 'authority'
    }
  ];

  return (
    <div
      className="landing-page-container animate-fade-in"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 50px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        background: '#F5F7FA',
        padding: '2.5rem 1.5rem 2.5rem 1.5rem',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Background Layer: Subtle North Eastern Region Map (Light Muted Grey Tones) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1,
          opacity: 0.08,
          filter: 'contrast(1.05) brightness(1.0)',
          pointerEvents: 'none'
        }}
      >
        <NERRegionalMap
          height="100%"
          variant="landing"
        />
      </div>

      {/* 2. Light Neutral Scrim Overlay for Clean Content Separation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'radial-gradient(ellipse at 50% 35%, rgba(245, 247, 250, 0.75) 0%, rgba(245, 247, 250, 0.95) 70%, #F5F7FA 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* 3. Hero Section: Exact Master NEVIA Logo Asset + Supporting Statement */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem 0 0.5rem 0'
        }}
      >
        {/* Exact Master Logo Asset — Rendered at High Resolution without any distortion */}
        <div
          style={{
            width: '100%',
            maxWidth: '580px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src="/brand/nevia-master-transparent.png"
            alt="NEVIA — Regional Mobility Intelligence. See the road. Understand the risk. Move what matters."
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '360px',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 24px rgba(2, 132, 199, 0.12))'
            }}
          />
        </div>

        {/* Supporting Platform Statement (Clear, Professional, High Contrast) */}
        <p
          style={{
            marginTop: '1.5rem',
            marginBottom: '0',
            fontSize: '1.12rem',
            color: '#334155',
            fontWeight: 450,
            lineHeight: 1.55,
            maxWidth: '700px',
            textAlign: 'center',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}
        >
          AI-powered road accessibility and logistics intelligence for safer, more resilient movement across the North Eastern Region.
        </p>
      </div>

      {/* 4. Four Primary Role Entry Cards (Solid White #FFFFFF, Clean 2 × 2 Grid on Desktop) */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          maxWidth: '960px',
          margin: '1.75rem auto 0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.35rem'
        }}
      >
        {roleCards.map((card) => {
          const Icon = card.icon;
          const isHovered = hoveredCard === card.id;

          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectRole(card.targetTab)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectRole(card.targetTab);
                }
              }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: '#FFFFFF',
                border: `1px solid ${isHovered ? card.color : '#D7E0E8'}`,
                borderRadius: '14px',
                padding: '1.65rem 1.55rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                justifyContent: 'space-between',
                minHeight: '200px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: isHovered
                  ? '0 12px 28px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(2, 132, 199, 0.08)'
                  : '0 2px 6px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
                outline: 'none'
              }}
            >
              {/* Top Accent Indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: isHovered
                    ? `linear-gradient(90deg, ${card.color}, ${card.accentColor})`
                    : 'transparent',
                  transition: 'background 0.2s ease'
                }}
              />

              {/* Card Top: Role Icon & High-Contrast Typography */}
              <div style={{ width: '100%' }}>
                {/* Role Icon Container */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: `${card.color}14`,
                    border: `1px solid ${card.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                    marginBottom: '1rem'
                  }}
                >
                  <Icon size={22} />
                </div>

                {/* Role Title (High Contrast Dark #0B1220, 22px, Bold) */}
                <div
                  style={{
                    fontSize: '1.38rem',
                    fontWeight: 700,
                    color: '#0B1220',
                    letterSpacing: '0.01em',
                    lineHeight: 1.25,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}
                >
                  {card.title}
                </div>

                {/* Role Description (#475569, 15.5px) */}
                <div
                  style={{
                    fontSize: '0.98rem',
                    color: '#475569',
                    marginTop: '0.5rem',
                    lineHeight: 1.55,
                    fontWeight: 450,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}
                >
                  {card.description}
                </div>
              </div>

              {/* Card Bottom: Divider + Clear "Enter Workspace →" Action */}
              <div
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  paddingTop: '0.95rem',
                  borderTop: '1px solid #EDF2F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: isHovered ? card.color : '#0369A1',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  transition: 'color 0.18s ease'
                }}
              >
                <span>Enter Workspace</span>
                <ArrowRight
                  size={16}
                  style={{
                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 0.18s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
