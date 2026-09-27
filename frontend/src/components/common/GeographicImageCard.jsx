import React, { useState } from 'react';
import { Camera, MapPin, ShieldCheck, AlertCircle, Info } from 'lucide-react';

export const GeographicImageCard = ({
  image,
  aspectRatio = '16 / 9',
  maxHeight = '220px',
  showMetadata = true,
  badgeType = null, // 'FIELD_EVIDENCE' | 'ACTIVE_PILOT' | 'REPRESENTATIVE'
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [showLicensing, setShowLicensing] = useState(false);

  if (!image) return null;

  const isFieldEvidence = (badgeType || image.type) === 'FIELD_EVIDENCE';
  const isPilot = (badgeType || image.type) === 'ACTIVE_PILOT_CORRIDOR_IMAGERY' || image.state_id === 'sikkim';

  const badgeColor = isFieldEvidence
    ? 'var(--color-critical)'
    : isPilot
    ? 'var(--color-safe)'
    : 'var(--brand-accent)';

  const badgeBg = isFieldEvidence
    ? 'var(--color-critical-bg)'
    : isPilot
    ? 'var(--color-safe-bg)'
    : 'var(--brand-accent-subtle)';

  const badgeBorder = isFieldEvidence
    ? 'var(--color-critical-border)'
    : isPilot
    ? 'var(--color-safe-border)'
    : 'var(--border-default)';

  const badgeLabel = isFieldEvidence
    ? 'FIELD EVIDENCE'
    : isPilot
    ? 'ACTIVE PILOT CORRIDOR'
    : 'REPRESENTATIVE CORRIDOR';

  return (
    <div
      className={`geographic-image-card ${className}`}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-xs)',
        overflow: 'hidden',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Image Container with 16:9 Aspect Ratio and Controlled Height */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: aspectRatio,
          maxHeight: maxHeight,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
        }}
      >
        {!imageError ? (
          <img
            src={image.src}
            alt={image.alt || `${image.location} - ${image.caption}`}
            loading="lazy"
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.3s ease'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <Camera size={24} color="var(--brand-accent)" style={{ marginBottom: '0.4rem', opacity: 0.7 }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {image.location || 'Regional Infrastructure Sector'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {image.corridor_name || 'Geographic Corridor Registry'}
            </span>
          </div>
        )}

        {/* Subtle Dark Gradient Overlay for Text Readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.2) 50%, rgba(15, 23, 42, 0.5) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Floating Badge: Provenance & Classification */}
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: badgeBg,
            color: badgeColor,
            border: `1px solid ${badgeBorder}`,
            padding: '2px 7px',
            borderRadius: '3px',
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(4px)'
          }}
        >
          {isFieldEvidence ? <AlertCircle size={11} /> : isPilot ? <ShieldCheck size={11} /> : <MapPin size={11} />}
          <span>{badgeLabel}</span>
        </div>

        {/* Top Right: Licensing Info Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowLicensing(!showLicensing);
          }}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0
          }}
          title="View geographic and license metadata"
        >
          <Info size={11} />
        </button>

        {/* Bottom Caption Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0.5rem 0.65rem',
            color: '#FFFFFF',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.2, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {image.location}
          </div>
          <div style={{ fontSize: '0.66rem', color: '#CBD5E1', marginTop: '2px', lineHeight: 1.25, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            {image.caption}
          </div>
        </div>
      </div>

      {/* Expandable Provenance & Licensing Metadata Drawer */}
      {showMetadata && showLicensing && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.5rem 0.65rem',
            background: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-default)',
            fontSize: '0.68rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          <div>
            <strong>Source:</strong> {image.source || 'Wikimedia Commons'} • <strong>License:</strong> {image.license || 'CC BY-SA 4.0'}
          </div>
          {image.credit && (
            <div>
              <strong>Credit:</strong> {image.credit}
            </div>
          )}
          <div style={{ color: 'var(--text-muted)', fontSize: '0.64rem', marginTop: '2px' }}>
            {isFieldEvidence
              ? 'Official field verification photography recorded by authorized personnel.'
              : 'Representative geographic photography provided for terrain and elevation reference.'}
          </div>
        </div>
      )}
    </div>
  );
};
