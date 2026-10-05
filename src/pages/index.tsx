import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const APP_STORE_URL = 'https://apps.apple.com/app/bmr-mobile/id6804977641';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const qrSrc = useBaseUrl('/img/bmr-appstore-qr.png');
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <Heading as="h1" className="hero__title">
              BETTERMEETINGROOMS
            </Heading>
            <p className="hero__subtitle">
              Expert-level meeting-room measurement and design — from a phone.
            </p>
            <p className={styles.heroLede}>
              Scan a room in 3D, run a scientifically validated acoustic
              measurement, and design the fit-out in BMR Studio. No specialist
              kit, no consultant on-site — and one connected record for every
              room.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/getting-started/account-setup">
                Get started →
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/release-notes/2026-10-release-2.3">
                See what's new in 2.3
              </Link>
            </div>
          </div>
          <div className={styles.heroDownload} id="download">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroQRLink}
              aria-label="Download BMR Mobile on the Apple App Store">
              <img
                src={qrSrc}
                alt="Scan to download BMR Mobile from the Apple App Store"
                className={styles.heroQR}
              />
            </a>
            <div className={styles.heroDownloadText}>
              <strong>Download BMR Mobile</strong>
              <span>Scan with your iPhone or iPad camera</span>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.appStoreLink}>
                Open in the App Store →
              </a>
              <span className={styles.heroDownloadNote}>
                BMR Mobile Private is no longer supported — delete it and
                install BMR Mobile.
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
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
