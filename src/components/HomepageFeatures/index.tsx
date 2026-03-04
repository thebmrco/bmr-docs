import type {ReactNode} from 'react';
import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import type { LucideIcon } from 'lucide-react';
import {
  Search, Copy, Rotate3d, Settings, BookMarked, RefreshCcw,
} from 'lucide-react';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: LucideIcon;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Discovery',
    icon: Search,
    description: (
      <>
        Survey and assess your existing meeting rooms. Capture detailed information
        about space, acoustics, and current technology to establish a baseline
        for improvement.
      </>
    ),
  },
  {
    title: 'Digital Twin',
    icon: Copy,
    description: (
      <>
        Create precise 3D models of your spaces. Work from a single source of
        truth and avoid information silos with our digital twin technology.
      </>
    ),
  },
  {
    title: 'Design',
    icon: Rotate3d,
    description: (
      <>
        Plan your meeting room with 3D visualizations. Test layouts virtually,
        identify issues, and optimize your space before any physical changes.
      </>
    ),
  },
  {
    title: 'Maintenance',
    icon: Settings,
    description: (
      <>
        Keep your rooms performing at their best. Monitor equipment health,
        schedule preventive maintenance, and ensure optimal conditions for
        collaboration.
      </>
    ),
  },
  {
    title: 'Expert Guidance',
    icon: BookMarked,
    description: (
      <>
        Access comprehensive guides on acoustics, technology selection,
        deployment strategies, and ongoing maintenance for optimal room performance.
      </>
    ),
  },
  {
    title: 'Continuous Improvement',
    icon: RefreshCcw,
    description: (
      <>
        Analyze room performance, understand usage patterns, and maintain
        optimal conditions with our analytics and maintenance tools.
      </>
    ),
  },
];

function Feature({title, icon: Icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>
          <Icon size={40} color="#206B31" aria-label={title} />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2" className={styles.featuresTitle}>
            Everything You Need to Create Better Meeting Rooms
          </Heading>
          <p className={styles.featuresSubtitle}>
            From initial survey to ongoing maintenance, we've got you covered
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
