import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

type StepItem = {
  label: string;
  image?: string;
  alt?: string;
};

type Props = {
  steps: StepItem[];
};

const GREEN = '#206B31';
const BEIGE_BORDER = '#E5E5D5';
const CARD_WIDTH = 155;
const IMG_MAX_HEIGHT = 280;

// Separate component so useBaseUrl is always called unconditionally (React hook rules)
function StepCard({ step, number, isLast }: { step: StepItem; number: number; isLast: boolean }) {
  const resolvedSrc = useBaseUrl(step.image ?? '');

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Card */}
      <div style={{
        width: CARD_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {/* Number badge */}
        <div style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          backgroundColor: GREEN,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 12,
          flexShrink: 0,
          fontFamily: 'var(--ifm-font-family-base)',
        }}>
          {number}
        </div>

        {/* Screenshot */}
        {step.image ? (
          <img
            src={resolvedSrc}
            alt={step.alt ?? `Step ${number}`}
            style={{
              maxHeight: IMG_MAX_HEIGHT,
              maxWidth: CARD_WIDTH - 10,
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: 8,
              border: `1px solid ${BEIGE_BORDER}`,
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            height: IMG_MAX_HEIGHT,
            width: CARD_WIDTH - 10,
            borderRadius: 8,
            border: `1px dashed ${BEIGE_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#aaa',
            fontSize: 11,
          }}>
            ✓
          </div>
        )}

        {/* Label */}
        <p style={{
          fontSize: '0.78rem',
          color: '#444',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.4,
          padding: '0 4px',
          fontFamily: 'var(--ifm-font-family-base)',
        }}>
          {step.label}
        </p>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          // Vertically center the arrow at badge + half-image height
          paddingTop: `calc(26px + 0.5rem + ${IMG_MAX_HEIGHT / 2}px - 10px)`,
          color: GREEN,
          fontSize: '1.2rem',
          flexShrink: 0,
          width: 24,
          justifyContent: 'center',
          opacity: 0.55,
        }}>
          ›
        </div>
      )}
    </div>
  );
}

export default function StepFlow({ steps }: Props) {
  return (
    <div style={{
      overflowX: 'auto',
      paddingBottom: '0.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        width: 'max-content',
        padding: '0.25rem 0 0.75rem',
      }}>
        {steps.map((step, index) => (
          <StepCard
            key={index}
            step={step}
            number={index + 1}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
