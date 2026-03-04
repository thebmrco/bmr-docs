import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Scan, LandPlot, AudioLines } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const GREEN = '#206B31';
const GREEN_BG = 'rgba(32, 107, 49, 0.09)';
const BEIGE = '#F1F1E3';
const BEIGE_DARK = '#E5E5D5';

type Activity = {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  imageAlt: string;
};

const activities: Activity[] = [
  {
    icon: Scan,
    title: 'Room Scan',
    description: 'Use your iPhone or iPad (LiDAR) to build a precise 3D model of the space.',
    bullets: [
      'Open the app and tap Start Scan',
      'Move slowly around the room to capture all surfaces',
      'Tap Finish Scanning when complete',
    ],
    image: '/img/scan-guide-images/scan-ongoing.png',
    imageAlt: 'Room scanning in progress',
  },
  {
    icon: LandPlot,
    title: 'Markers',
    description: 'Photograph key elements — power outlets, displays, cameras, cabling — and add notes.',
    bullets: [
      'Tap the camera button during or after scanning',
      'Capture the element and add a description',
      'Markers are saved to the room automatically',
    ],
    image: '/img/lifecycle/markers-app.jpg',
    imageAlt: 'Marker placement in the app',
  },
  {
    icon: AudioLines,
    title: 'Acoustic Measurement',
    description: 'Capture the acoustic profile of the room using a speaker test.',
    bullets: [
      'Select Acoustic Measurement in the app',
      'Choose input and output devices',
      'Keep the room quiet and tap Start Measurement',
    ],
    image: '/img/lifecycle/acoustic-measurement.jpg',
    imageAlt: 'Acoustic measurement screen',
  },
];

function ActivityCard({ activity }: { activity: Activity }) {
  const resolvedSrc = useBaseUrl(activity.image);
  const Icon = activity.icon;

  return (
    <div style={{
      flex: '1 1 0',
      minWidth: 220,
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      borderRadius: 14,
      border: `1px solid ${BEIGE_DARK}`,
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem',
        borderBottom: `1px solid ${BEIGE}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '0.6rem',
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: GREEN_BG,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={20} color={GREEN} strokeWidth={1.75} />
          </div>
          <div style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: GREEN,
            fontFamily: 'var(--ifm-font-family-base)',
          }}>
            {activity.title}
          </div>
        </div>
        <p style={{
          fontSize: '0.82rem',
          color: '#555',
          margin: 0,
          lineHeight: 1.5,
          fontFamily: 'var(--ifm-font-family-base)',
        }}>
          {activity.description}
        </p>
      </div>

      {/* Steps */}
      <div style={{ padding: '0.9rem 1.25rem', flex: '0 0 auto' }}>
        <ol style={{
          margin: 0,
          paddingLeft: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
        }}>
          {activity.bullets.map((b, i) => (
            <li key={i} style={{
              fontSize: '0.8rem',
              color: '#444',
              lineHeight: 1.45,
              fontFamily: 'var(--ifm-font-family-base)',
            }}>
              {b}
            </li>
          ))}
        </ol>
      </div>

      {/* Screenshot */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: BEIGE,
        padding: '1rem 1rem 0',
      }}>
        <img
          src={resolvedSrc}
          alt={activity.imageAlt}
          style={{
            width: '100%',
            maxWidth: 200,
            height: 'auto',
            borderRadius: '16px 16px 0 0',
            display: 'block',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.12)',
          }}
        />
      </div>
    </div>
  );
}

export default function DiscoveryActivities() {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      margin: '1.5rem 0',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      paddingBottom: '0.25rem',
    }}>
      {activities.map((activity) => (
        <ActivityCard key={activity.title} activity={activity} />
      ))}
    </div>
  );
}
