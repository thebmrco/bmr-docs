import React from 'react';
import { Search, Rotate3d, Wrench, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const GREEN = '#206B31';
const GREEN_BG = 'rgba(32, 107, 49, 0.09)';
const BEIGE = '#F1F1E3';
const BEIGE_DARK = '#E5E5D5';
const GREY_TEXT = '#555';

type Phase = {
  icon: LucideIcon;
  name: string;
  label: string;
};

const phases: Phase[] = [
  { icon: Search,   name: 'Discovery', label: 'Scan, measure & document the space' },
  { icon: Rotate3d, name: 'Design',    label: 'Model, validate & deploy in BMR Studio' },
  { icon: Wrench,   name: 'Maintain',  label: 'Monitor, maintain & improve' },
];

export default function LifecycleFlow() {
  return (
    <div style={{
      margin: '2rem 0',
      padding: '2rem 1.5rem 1.5rem',
      background: BEIGE,
      borderRadius: 16,
      border: `1px solid ${BEIGE_DARK}`,
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontWeight: 700,
        fontSize: '0.75rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: GREEN,
        fontFamily: 'var(--ifm-font-family-base)',
      }}>
        The BMR Lifecycle
      </div>

      {/* Phase row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        flexWrap: 'nowrap',
        overflowX: 'auto',
      }}>
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isLast = index === phases.length - 1;
          return (
            <React.Fragment key={phase.name}>
              {/* Phase card */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'white',
                borderRadius: 12,
                padding: '1.25rem 0.75rem 1rem',
                border: `1px solid ${BEIGE_DARK}`,
                flex: '1 1 0',
                minWidth: 110,
                maxWidth: 165,
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                {/* Icon circle */}
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: GREEN_BG,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={24} color={GREEN} strokeWidth={1.75} />
                </div>

                {/* Phase name */}
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: GREEN,
                  textAlign: 'center',
                  fontFamily: 'var(--ifm-font-family-base)',
                  lineHeight: 1.2,
                }}>
                  {phase.name}
                </div>

                {/* Short label */}
                <div style={{
                  fontSize: '0.72rem',
                  color: GREY_TEXT,
                  textAlign: 'center',
                  lineHeight: 1.35,
                  fontFamily: 'var(--ifm-font-family-base)',
                }}>
                  {phase.label}
                </div>
              </div>

              {/* Arrow connector */}
              {!isLast && (
                <div style={{
                  flexShrink: 0,
                  padding: '0 2px',
                  marginBottom: '1.75rem', /* offset upward to icon-center height */
                  color: GREEN,
                  fontSize: '1.25rem',
                  opacity: 0.45,
                  userSelect: 'none',
                }}>
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Continuous cycle footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '1.1rem',
        gap: '0.5rem',
        color: '#999',
        fontSize: '0.75rem',
        fontFamily: 'var(--ifm-font-family-base)',
        fontStyle: 'italic',
      }}>
        <RefreshCw size={12} color="#aaa" />
        <span>Continuous improvement cycle</span>
      </div>
    </div>
  );
}
