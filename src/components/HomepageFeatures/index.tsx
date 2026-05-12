import type {ReactNode} from 'react';
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import type { LucideIcon } from 'lucide-react';
import {
  Search, Palette, Wrench,
  UserCheck, AudioLines, Boxes, MapPin, RefreshCw,
} from 'lucide-react';
import styles from './styles.module.css';

/* ================================================================
   Section 1 — The BMR Lifecycle (3 phases)
   ================================================================ */

type LifecycleItem = {
  title: string;
  icon: LucideIcon;
  description: ReactNode;
  link: string;
};

const LifecyclePhases: LifecycleItem[] = [
  {
    title: 'Discovery',
    icon: Search,
    link: '/docs/lifecycle/discovery/',
    description: (
      <>
        Scan rooms with an iPhone, run guided acoustic measurements, capture
        markers and photos, and record compass orientation. All data is stored
        as Room Data — the foundation for every phase that follows.
      </>
    ),
  },
  {
    title: 'Design',
    icon: Palette,
    link: '/docs/lifecycle/design/',
    description: (
      <>
        Model and refine rooms in BMR Studio or place equipment directly using
        AR Design. Browse the Catalog, apply Default Room Configurations, manage
        design versions, and mark the final design as Active.
      </>
    ),
  },
  {
    title: 'Maintain',
    icon: Wrench,
    link: '/docs/lifecycle/maintenance/',
    description: (
      <>
        Keep rooms performing long after installation. The Active Design provides
        a single source of truth for IT, facilities, and support — what is
        installed, where, and how it connects.
      </>
    ),
  },
];

/* ================================================================
   Section 2 — Documentation sections
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

function LifecycleCard({title, icon: Icon, description, link}: LifecycleItem) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={link} className={styles.cardLink}>
        <div className={styles.lifecycleCard}>
          <div className={styles.lifecycleIcon}>
            <Icon size={44} color="#206B31" aria-label={title} />
          </div>
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

function DocSectionCard({title, icon: Icon, description, link}: DocSection) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={link} className={styles.cardLink}>
        <div className={styles.docCard}>
          <div className={styles.docIcon}>
            <Icon size={28} color="#206B31" aria-label={title} />
          </div>
          <div>
            <Heading as="h4">{title}</Heading>
            <p>{description}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <>
      {/* Lifecycle section */}
      <section className={styles.lifecycle}>
        <div className="container">
          <div className="text--center margin-bottom--lg">
            <Heading as="h2" className={styles.sectionTitle}>
              The BMR Solution
            </Heading>
            <p className={styles.sectionSubtitle}>
              Three phases to transform any meeting room — from first scan to long-term performance
            </p>
          </div>
          <div className="row">
            {LifecyclePhases.map((props, idx) => (
              <LifecycleCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>

      {/* Documentation section */}
      <section className={styles.docs}>
        <div className="container">
          <div className="text--center margin-bottom--lg">
            <Heading as="h2" className={styles.sectionTitle}>
              Documentation
            </Heading>
            <p className={styles.sectionSubtitle}>
              Guides, references, and updates
            </p>
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
