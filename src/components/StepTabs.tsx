import React, { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

const GREEN = '#206B31';
const GREEN_LIGHT = 'rgba(32, 107, 49, 0.08)';
const GREY = '#D1D5DB';
const GREY_TEXT = '#9CA3AF';

type StepItem = {
  title: string;
  content: React.ReactNode;
};

type Props = {
  steps: StepItem[];
};

function StepCircle({
  number,
  isActive,
  isCompleted,
  onClick,
}: {
  number: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Step ${number}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: `2px solid ${isActive ? GREEN : GREY}`,
        backgroundColor: isActive ? GREEN : 'white',
        color: isActive ? 'white' : GREY_TEXT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        fontFamily: 'var(--ifm-font-family-base)',
        padding: 0,
        boxShadow: isActive ? `0 0 0 3px rgba(32, 107, 49, 0.2)` : 'none',
      }}
    >
      {number}
    </button>
  );
}

function Connector({ filled }: { filled: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        height: 2,
        backgroundColor: filled ? GREEN : GREY,
        margin: '0 4px',
        transition: 'background-color 0.2s ease',
      }}
    />
  );
}

function StepLabel({
  title,
  isActive,
  onClick,
}: {
  title: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: '4px 0 0',
        margin: 0,
        cursor: 'pointer',
        fontSize: '0.72rem',
        fontWeight: isActive ? 600 : 400,
        color: isActive ? GREEN : '#6B7280',
        textAlign: 'center',
        lineHeight: 1.3,
        fontFamily: 'var(--ifm-font-family-base)',
        maxWidth: 90,
        transition: 'color 0.2s ease',
      }}
    >
      {title}
    </button>
  );
}

export function DocImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const resolved = useBaseUrl(src);
  return <img src={resolved} alt={alt} className={className} />;
}

export default function StepTabs({ steps }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Step indicator bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem 0.5rem',
          overflowX: 'auto',
        }}
      >
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <StepCircle
                number={i + 1}
                isActive={i === active}
                isCompleted={i < active}
                onClick={() => setActive(i)}
              />
              <StepLabel title={step.title} isActive={i === active} onClick={() => setActive(i)} />
            </div>
            {i < steps.length - 1 && <Connector filled={i < active} />}
          </React.Fragment>
        ))}
      </div>

      {/* Content panel */}
      <div
        style={{
          marginTop: '1rem',
          padding: '1.25rem',
          background: GREEN_LIGHT,
          borderRadius: 12,
          border: `1px solid ${GREEN}22`,
          minHeight: 200,
        }}
      >
        {steps[active].content}
      </div>

      {/* Prev / Next buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
        <button
          onClick={() => setActive(Math.max(0, active - 1))}
          disabled={active === 0}
          style={{
            background: 'none',
            border: `1px solid ${active === 0 ? GREY : GREEN}`,
            borderRadius: 8,
            padding: '0.5rem 1.25rem',
            color: active === 0 ? GREY_TEXT : GREEN,
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: active === 0 ? 'default' : 'pointer',
            fontFamily: 'var(--ifm-font-family-base)',
            transition: 'all 0.2s ease',
            opacity: active === 0 ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => setActive(Math.min(steps.length - 1, active + 1))}
          disabled={active === steps.length - 1}
          style={{
            background: active === steps.length - 1 ? GREY : GREEN,
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 1.25rem',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: active === steps.length - 1 ? 'default' : 'pointer',
            fontFamily: 'var(--ifm-font-family-base)',
            transition: 'all 0.2s ease',
            opacity: active === steps.length - 1 ? 0.5 : 1,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
