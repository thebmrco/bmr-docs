import type {ReactNode} from 'react';
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import type { LucideIcon } from 'lucide-react';
import {
  Search, Palette, Wrench,
  UserCheck, AudioLines, Boxes, MapPin, RefreshCw,
  Smartphone, Globe, Server, ExternalLink,
} from 'lucide-react';
import styles from './styles.module.css';

/* ================================================================
   Section 1 — The BMR Lifecycle (3 phases)
   ================================================================ */

type LifecycleItem = {
  title: string;
  icon: LucideIcon;
  images: string[];
  link: string;
};

const LifecyclePhases: LifecycleItem[] = [
  {
    title: 'Discovery',
    icon: Search,
    images: [
      '/bmr-docs/img/lifecycle/discovery-scan.png',
      '/bmr-docs/img/lifecycle/discovery-acoustics.png',
    ],
    link: '/docs/lifecycle/discovery/',
  },
  {
    title: 'Design',
    icon: Palette,
    images: ['/bmr-docs/img/design/bmr-studio-ui.png'],
    link: '/docs/lifecycle/design/',
  },
  {
    title: 'Maintain',
    icon: Wrench,
    images: ['/bmr-docs/img/release/2026-07-room-overview.png'],
    link: '/docs/lifecycle/maintenance/',
  },
];

/* ================================================================
   Section 2 — Platform components (App, Web, Back-end)
   ================================================================ */

function PlatformCards(): ReactNode {
  return (
    <div className="row">
      <div className="col col--4">
        <div className={styles.platformCard}>
          <div className={styles.platformHeading}>
            <Smartphone size={24} color="#206B31" aria-hidden="true" />
            <Heading as="h3">BMR Mobile</Heading>
          </div>
          <div className={styles.platformAction}>
            <a href="#download" className={styles.platformLink}>
              Scan QR code on top ↑
            </a>
          </div>
        </div>
      </div>
      <div className="col col--4">
        <div className={styles.platformCard}>
          <div className={styles.platformHeading}>
            <Globe size={24} color="#206B31" aria-hidden="true" />
            <Heading as="h3">Web Platform</Heading>
          </div>
          <div className={styles.platformAction}>
            <a
              href="https://app.bettermeetingrooms.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.platformLink}
            >
              app.bettermeetingrooms.com
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <div className="col col--4">
        <div className={styles.platformCard}>
          <div className={styles.platformHeading}>
            <Server size={24} color="#206B31" aria-hidden="true" />
            <Heading as="h3">Secure Back-end</Heading>
          </div>
          <div className={styles.platformAction}>
            <Link to="/docs/security/" className={styles.platformLink}>
              Security &amp; Compliance →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Section 3 — Documentation sections
   ================================================================ */

type DocSection = {
  title: string;
  icon: LucideIcon;
  description: ReactNode;
  link: string;
};

const DocSections: DocSection[] = [
  {
    title: 'Getting Started',
    icon: UserCheck,
    link: '/docs/getting-started/account-setup',
    description: (
      <>
        Account setup, system requirements, and frequently asked questions.
        Everything you need to get up and running.
      </>
    ),
  },
  {
    title: 'Technology & Concepts',
    icon: AudioLines,
    link: '/docs/acoustics/mos-score',
    description: (
      <>
        Understand the science behind BMR — the MOS score, acoustic measurement,
        recommended speakers, and the technology that drives better rooms.
      </>
    ),
  },
  {
    title: 'Product Updates',
    icon: RefreshCw,
    link: '/docs/roadmap/',
    description: (
      <>
        Roadmap and release notes. See what's been delivered, what's coming
        next, and the details of every release.
      </>
    ),
  },
];

/* ================================================================
   Components
   ================================================================ */

function LifecycleCard({title, icon: Icon, images, link}: LifecycleItem) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={link} className={styles.cardLink}>
        <div className={styles.previewCard}>
          <div className={styles.previewImageWrap}>
            {images.map((src) => (
              <img key={src} src={src} alt="" className={styles.previewImage} loading="lazy" />
            ))}
          </div>
          <div className={styles.previewHeading}>
            <Icon size={22} color="#206B31" aria-hidden="true" />
            <Heading as="h3">{title}</Heading>
          </div>
        </div>
      </Link>
    </div>
  );
}

function DocSectionCard({title, icon: Icon, link}: DocSection) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={link} className={styles.cardLink}>
        <div className={styles.docCard}>
          <div className={styles.docIcon}>
            <Icon size={24} color="#206B31" aria-hidden="true" />
          </div>
          <Heading as="h4">{title}</Heading>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <>
      {/* What's new — latest release highlight */}
      <section className={styles.whatsNew}>
        <div className="container">
          <div className={styles.whatsNewInner}>
            <Link className="intro-feature" to="/docs/release-notes/2026-09-release-2.1">
              <span className="intro-feature-badge">Latest release · September 2026</span>
              <span className="intro-feature-title">BMR Mobile 2.1 — now on the App Store</span>
              <span className="intro-feature-desc">
                The first public release of BMR Mobile — the same app as 2.0, now
                available to everyone in the Apple App Store.
              </span>
              <span className="intro-feature-link">Read the release notes →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Lifecycle section */}
      <section className={styles.lifecycle}>
        <div className="container">
          <div className="text--center margin-bottom--lg">
            <Heading as="h2" className={styles.sectionTitle}>
              The BMR Solution
            </Heading>
          </div>
          <div className="row">
            {LifecyclePhases.map((props, idx) => (
              <LifecycleCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>

      {/* Platform section */}
      <section className={styles.platform}>
        <div className="container">
          <div className="text--center margin-bottom--lg">
            <Heading as="h2" className={styles.sectionTitle}>
              How It's Delivered
            </Heading>
          </div>
          <PlatformCards />
        </div>
      </section>

      {/* Documentation section */}
      <section className={styles.docs}>
        <div className="container">
          <div className="text--center margin-bottom--lg">
            <Heading as="h2" className={styles.sectionTitle}>
              Documentation
            </Heading>
          </div>
          <div className="row">
            {DocSections.map((props, idx) => (
              <DocSectionCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
