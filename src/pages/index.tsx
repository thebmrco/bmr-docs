import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

// The questions people ask most, one tap away (the Slack / Notion pattern).
const QuickLinks = [
  {label: 'Capture a room', to: '/docs/field'},
  {label: 'Invite a colleague', to: '/docs/getting-started/inviting-users'},
  {label: 'Which speaker works?', to: '/docs/acoustics/loudspeaker-check/'},
  {label: 'Read an acoustic score', to: '/docs/acoustics/reading-acoustic-results'},
  {label: 'Supported devices', to: '/docs/getting-started/system-requirements'},
];

function HomepageHeader() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroText}>
          <Heading as="h1" className="hero__title">
            How can we help?
          </Heading>
          <p className="hero__subtitle">BETTERMEETINGROOMS documentation</p>
          <div className={styles.quickLinks}>
            {QuickLinks.map((q) => (
              <Link key={q.to} to={q.to} className={styles.quickLink}>
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentation"
      description="Scan a room in 3D, run a validated acoustic measurement, and design the fit-out in BMR Studio — one connected record for every room.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
