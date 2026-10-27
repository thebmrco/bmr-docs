/**
 * The BMR Studio modes as a row of cards, styled after the mode bar at the
 * bottom of the Studio. Each card says what the mode lets you change and
 * which sidebar tabs it shows, and links to its section on the page.
 * Icons match the ones the Studio itself uses.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import {Eye, BrickWall, Package, Cable, AudioLines, type LucideIcon} from 'lucide-react';
import {FeatureToggleTag} from './FeatureToggle';
import styles from './StudioModes.module.css';

type Mode = {
  name: string;
  icon: LucideIcon;
  change: string;
  tabs: string;
  link: string;
  beta?: boolean;
  toggle?: boolean;
};

const MODES: Mode[] = [
  {name: 'View', icon: Eye, change: 'Nothing. Look around, present', tabs: 'Properties · Room · Presentation', link: '#view'},
  {name: 'Structurals', icon: BrickWall, change: 'Walls, doors, windows, openings', tabs: 'Build · Guides · Room', link: '#structurals'},
  {name: 'Equipment', icon: Package, change: 'Equipment, furniture, outlets, logos', tabs: 'Equipment · Guidelines · Room', link: '#equipment'},
  {name: 'Cables', icon: Cable, change: 'Cables, outlets, boxes', tabs: 'Cables', link: '#cable-mode', beta: true},
  {name: 'Acoustics', icon: AudioLines, change: 'Absorbers', tabs: 'Acoustics · Based on · Diagnostics', link: '#acoustics', toggle: true},
];

export default function StudioModes() {
  return (
    <div className={styles.wrap}>
      <div className={styles.bar} aria-hidden="true">
        {MODES.map(({name, icon: I}) => (
          <span key={name} className={styles.barItem}>
            <I size={15} /> {name}
          </span>
        ))}
      </div>
      <ul className={styles.grid}>
        {MODES.map(({name, icon: I, change, tabs, link, beta, toggle}) => (
          <li key={name} className={styles.card}>
            <Link to={link} className={styles.cardLink}>
              <span className={styles.head}>
                <span className={styles.icon}><I size={20} aria-hidden="true" /></span>
                <strong>{name}</strong>
                {beta && <span className={styles.beta}>Beta</span>}
              </span>
              {toggle && <FeatureToggleTag />}
              <span className={styles.row}><span className={styles.label}>You change</span>{change}</span>
              <span className={styles.row}><span className={styles.label}>Sidebar</span>{tabs}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
