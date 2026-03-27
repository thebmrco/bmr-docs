import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

type StepItem = {
  label: string;
  image?: string;
  images?: string[];
  alt?: string;
  alts?: string[];
};

type Props = {
  steps: StepItem[];
};

const GREEN = '#206B31';
const BEIGE_BORDER = '#E5E5D5';
const CARD_WIDTH = 155;
const IMG_MAX_HEIGHT = 280;

// One component per image so useBaseUrl is always called unconditionally
function StepImg({ src, alt }: { src: string; alt: string }) {
  const resolved = useBaseUrl(src);
  return (
    <img
      src={resolved}
      alt={alt}
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
  );
}

function StepCard({ step, number, isLast }: { step: StepItem; number: number; isLast: boolean }) {
  const imgList: { src: string; alt: string }[] = step.images
    ? step.images.map((src, i) => ({ src, alt: (step.alts ?? [])[i] ?? `Step ${number}` }))
    : step.image
    ? [{ src: step.image, alt: step.alt ?? `Step ${number}` }]
    : [];

  const cardWidth = imgList.length > 1 ? imgList.length * CARD_WIDTH : CARD_WIDTH;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ width: cardWidth, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        {/* Number badge */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          backgroundColor: GREEN, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 12, flexShrink: 0,
          fontFamily: 'var(--ifm-font-family-base)',
        }}>
          {number}
        </div>

        {/* Screenshot(s) */}
        {imgList.length > 0 ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {imgList.map((img, i) => <StepImg key={i} src={img.src} alt={img.alt} />)}
          </div>
        ) : (
          <div style={{
            height: IMG_MAX_HEIGHT, width: CARD_WIDTH - 10, borderRadius: 8,
            border: `1px dashed ${BEIGE_BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#aaa', fontSize: 11,
          }}>
            ✓
          </div>
        )}

        {/* Label */}
        <p style={{
          fontSize: '0.78rem', color: '#444', textAlign: 'center',
          margin: 0, lineHeight: 1.4, padding: '0 4px',
          fontFamily: 'var(--ifm-font-family-base)',
        }}>
          {step.label}
        </p>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <div style={{
          display: 'flex', alignItems: 'center',
          paddingTop: `calc(26px + 0.5rem + ${IMG_MAX_HEIGHT / 2}px - 10px)`,
          color: GREEN, fontSize: '1.2rem', flexShrink: 0,
          width: 24, justifyContent: 'center', opacity: 0.55,
        }}>
          ›
        </div>
      )}
    </div>
  );
}

export default function StepFlow({ steps }: Props) {
  return (
    <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', width: 'max-content', padding: '0.25rem 0 0.75rem' }}>
        {steps.map((step, index) => (
          <StepCard key={index} step={step} number={index + 1} isLast={index === steps.length - 1} />
        ))}
      </div>
    </div>
  );
}
