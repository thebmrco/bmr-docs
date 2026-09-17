import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
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
  links?: { label: string; href: string }[];
};

const activities: Activity[] = [
  {
    icon: Scan,
    title: 'Room Scan',
    description: 'Use your iPhone or iPad (LiDAR) to build a precise 3D model of the space. Do this first.',
    bullets: [
      'Open the room and tap New Scan',
      'Move slowly to capture walls, corners and ceiling',
      'Review the scan before you leave the room',
    ],
    image: '/img/scan-guide-images/scan-ongoing.png',
    imageAlt: 'Room scanning in progress',
    links: [
      { label: 'Room Scan', href: '/docs/lifecycle/discovery/room-scan' },
      { label: 'Scan + Marker Capture Flow', href: '/docs/lifecycle/discovery/scan-marker-guide' },
      { label: 'Scanning Best Practices', href: '/docs/lifecycle/discovery/scanning-best-practices' },
    ],
  },
  {
    icon: LandPlot,
    title: 'Markers',
    description: 'Photograph key elements — power outlets, displays, cameras, cabling — and add notes.',
    bullets: [
      'Tap the camera button while scanning',
      'Photograph the item and add a short note',
      'Aim for at least 10 across the room',
    ],
    image: '/img/lifecycle/markers-app.jpg',
    imageAlt: 'Marker placement in the app',
    links: [
      { label: 'Markers', href: '/docs/lifecycle/discovery/markers' },
      { label: 'Capturing markers', href: '/docs/lifecycle/discovery/markers-capture' },
    ],
  },
  {
    icon: AudioLines,
    title: 'Acoustic Measurement',
    description: 'Play a test sweep through a speaker to get the room’s RT60 and MOS score.',
    bullets: [
      'Start a measurement from the room',
      'Pick your speaker, then follow the guided steps',
      'Measure at three positions and save',
    ],
    image: '/img/lifecycle/acoustic-measurement.jpg',
    imageAlt: 'Acoustic measurement screen',
    links: [
      { label: 'Acoustics Tutorial', href: '/docs/acoustics/acoustics-guide' },
      { label: 'Recommended speakers', href: '/docs/acoustics/speakers-for-acoustics' },
    ],
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

      {/* Guide links */}
      {activity.links && activity.links.length > 0 && (
        <div style={{
          padding: '0 1.25rem 0.9rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          {activity.links.map((link, i) => (
            <Link key={i} to={link.href} style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: GREEN,
              textDecoration: 'none',
              fontFamily: 'var(--ifm-font-family-base)',
            }}>
              → {link.label}
            </Link>
          ))}
        </div>
      )}

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
