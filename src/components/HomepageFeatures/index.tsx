import type {ReactNode} from 'react';
import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {Illustration, Facets} from '../illustrations';
import Heading from '@theme/Heading';
import {
  ArrowRight, Smartphone, Laptop, Puzzle, ShieldCheck, CircleHelp,
  MessageSquare, Map, Rocket, Scan, AudioLines, Rotate3d, Palette, Users,
  Boxes, Wrench, Check,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import styles from './styles.module.css';

function SectionHead({title, text}: {title: string; text: string}) {
  return (
    <div className={styles.sectionHead}>
      <Heading as="h2" className={styles.blockTitle}>{title}</Heading>
      <p>{text}</p>
    </div>
  );
}

/* ================================================================
   1 — Two doors. Like Microsoft 365, Google Workspace and Calendly, the role
   is named first and the tasks under it say what the path covers. The
   illustration shows the situation (on site with a phone / at a desk
   running the organisation), not product screenshots.
   ================================================================ */

type Door = {
  role: string;
  title: string;
  tasks: string[];
  typical: string;
  device: string;
  cta: string;
  link: string;
  variant: 'field' | 'admin';
};

const Doors: Door[] = [
  {
    role: 'Field',
    title: 'I capture rooms on site',
    tasks: ['Find the room in BMR Mobile', 'Scan it and add markers', 'Measure the acoustics', 'Take the room photo'],
    typical: 'Caretakers, sales, technicians',
    device: 'BMR Mobile on iPhone or iPad',
    cta: 'Open the Field guide',
    link: '/docs/field',
    variant: 'field',
  },
  {
    role: 'Manage & Design',
    title: 'I manage, analyse and design rooms',
    tasks: ['See the state of every room', 'Analyse and compare acoustic results', 'Design improvements in BMR Studio', 'Set up locations, rooms and people'],
    typical: 'IT and AV leads, integrator project managers',
    device: 'Web platform on a laptop',
    cta: 'Open the Manage & Design guide',
    link: '/docs/admin',
    variant: 'admin',
  },
];

function DoorCard({role, title, tasks, typical, device, cta, link, variant}: Door) {
  const isField = variant === 'field';
  const DeviceIcon = isField ? Smartphone : Laptop;
  return (
    <Link to={link} className={clsx(styles.doorCard, isField ? styles.doorField : styles.doorAdmin)}>
      <div className={styles.doorArt}>
        <Facets className={styles.doorFacets} />
        <span className={styles.doorRole}>{role}</span>
        <div className={styles.doorPicture}>
          <Illustration name={isField ? 'field-work' : 'admin-work'} />
        </div>
      </div>
      <div className={styles.doorText}>
        <Heading as="h2">{title}</Heading>
        <p className={styles.doorLearn}>Learn how to</p>
        <ul className={styles.doorTasks}>
          {tasks.map((t) => (
            <li key={t}><Check size={16} aria-hidden="true" /> {t}</li>
          ))}
        </ul>
        <p className={styles.doorTypical}>Typically: {typical}</p>
        <div className={styles.doorFoot}>
          <span className={styles.doorDevice}><DeviceIcon size={15} aria-hidden="true" /> {device}</span>
          <span className={styles.doorButton}>{cta} <ArrowRight size={16} aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  );
}

/* ================================================================
   2 — What's new: the latest release large, the ones before as a dated list
   ================================================================ */

const LatestRelease = {
  date: 'October 2026',
  title: 'Release 2.4: cables by connection, bundles and acoustic proposals',
  text: 'Cable mode rebuilt around a Connections panel, reusable equipment bundles, acoustic optimisation proposals, and a Documents tab with inventory and bill of materials.',
  link: '/docs/release-notes/2026-10-release-2.4',
};

const EarlierReleases = [
  {date: 'Oct 2026', title: '2.3: BMR Mobile 2.3 room photo and clearer acoustics, presentation mode in Studio', link: '/docs/release-notes/2026-10-release-2.3'},
  {date: 'Sep 2026', title: '2.2: room recognition, Basic or Advanced acoustics, in-app guidance', link: '/docs/release-notes/2026-09-release-2.2'},
  {date: 'Sep 2026', title: '2.1: BMR Mobile in the App Store, new acoustics view on the web', link: '/docs/release-notes/2026-09-release-2.1'},
];

function WhatsNew() {
  return (
    <section className={styles.newsSection}>
      <div className="container">
        <SectionHead title="What's new" text="The latest release, and the ones before it." />
        <div className={styles.newsGrid}>
          <Link to={LatestRelease.link} className={styles.newsFeature}>
            <div className={styles.newsFeatureText}>
              <span className={styles.newsBadge}>New · {LatestRelease.date}</span>
              <strong>{LatestRelease.title}</strong>
              <span>{LatestRelease.text}</span>
              <span className={styles.newsReadMore}>Read the release notes →</span>
            </div>
          </Link>
          <div className={styles.newsList}>
            {EarlierReleases.map((r) => (
              <Link key={r.link} to={r.link} className={styles.newsRow}>
                <span className={styles.newsDate}>{r.date}</span>
                <span>{r.title}</span>
              </Link>
            ))}
            <div className={styles.newsMore}>
              <Link to="/docs/release-notes/2026-10-release-2.4">All release notes →</Link>
              <Link to="/docs/roadmap/"><Map size={14} aria-hidden="true" /> Roadmap →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   3 — Browse everything: one illustrated card per area
   ================================================================ */

type Topic = {
  title: string;
  text: string;
  link: string;
  icon: LucideIcon;
  /** The guide whose menu the page opens in */
  guide: 'Field' | 'Admin' | 'General';
};

const Topics: Topic[] = [
  {title: 'Getting started', guide: 'General', text: 'Account, devices, sign-in', link: '/docs/getting-started/account-setup', icon: Rocket},
  {title: 'Discovery', guide: 'Field', text: 'Scan, markers, inventory', link: '/docs/lifecycle/discovery/', icon: Scan},
  {title: 'Acoustics', guide: 'Field', text: 'Measure, read the score', link: '/docs/acoustics/acoustics-guide', icon: AudioLines},
  {title: 'AR Design', guide: 'Field', text: 'Place equipment on site', link: '/docs/lifecycle/design/ar-design-guide', icon: Rotate3d},
  {title: 'BMR Studio', guide: 'Admin', text: 'Design on the real room', link: '/docs/lifecycle/design/bmr-studio', icon: Palette},
  {title: 'Organisation & users', guide: 'Admin', text: 'Locations, rooms, roles', link: '/docs/structure', icon: Users},
  {title: 'Catalog & 3D models', guide: 'Admin', text: 'The equipment library', link: '/docs/catalog/', icon: Boxes},
  {title: 'Maintenance', guide: 'Admin', text: 'Keep every room current', link: '/docs/lifecycle/maintenance', icon: Wrench},
  {title: 'Integrations', guide: 'Admin', text: 'Microsoft 365, Webex, Cisco', link: '/docs/integrations/microsoft-365', icon: Puzzle},
  {title: 'Trust & security', guide: 'Admin', text: 'Hosting, data, access', link: '/docs/trust', icon: ShieldCheck},
];

/** Shown names of the guides; the keys stay short for code and CSS. */
const GuideLabel = {Field: 'Field', Admin: 'Manage & Design', General: 'General'} as const;

function TopicCard({title, text, link, icon: Icon, guide}: Topic) {
  return (
    <Link to={link} className={styles.topicCard}>
      <span className={styles.topicIcon}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className={styles.topicText}>
        <strong>{title}</strong>
        <span>{text}</span>
        <span className={styles[`topicTag${guide}`]}>{GuideLabel[guide]}</span>
      </span>
    </Link>
  );
}

/* ================================================================
   Page
   ================================================================ */

export default function HomepageFeatures(): ReactNode {
  return (
    <>
      <section className={styles.doors}>
        <div className="container">
          <SectionHead title="Start here" text="Which of these describes your work?" />
          <div className={styles.doorGrid}>
            {Doors.map((door) => (
              <DoorCard key={door.link} {...door} />
            ))}
          </div>
        </div>
      </section>

      <WhatsNew />

      <section className={styles.topicsSection}>
        <div className="container">
          <SectionHead title="Browse by topic" text="The tag shows who each topic is for." />
          <div className={styles.topicGrid}>
            {Topics.map((t) => (
              <TopicCard key={t.link} {...t} />
            ))}
          </div>
          <p className={styles.allDocsLink}>
            <Link to="/docs/all">See every page in one list →</Link>
          </p>
        </div>
      </section>

      <section className={styles.helpStrip}>
        <div className="container">
          <div className={styles.helpLinks}>
            <span>Still need help?</span>
            <Link to="/docs/getting-started/faq"><CircleHelp size={16} aria-hidden="true" /> FAQ</Link>
            <Link to="/docs/getting-started/send-feedback"><MessageSquare size={16} aria-hidden="true" /> Send feedback</Link>
          </div>
        </div>
      </section>
    </>
  );
}
