/**
 * Marks a feature that is behind a feature toggle: released, but switched on
 * per organisation. Use both parts so readers see it before they open a
 * section and again inside it.
 *
 *   <FeatureToggleTag />   small tag for a heading or <summary>
 *   <FeatureToggle />      one line at the top of the section
 *
 * Available on every MDX page without an import.
 */
import React from 'react';
import {ToggleRight} from 'lucide-react';
import {NoticeTexts} from './Notice';
import styles from './FeatureToggle.module.css';

export function FeatureToggleTag() {
  return <span className={styles.tag}>Feature toggle</span>;
}

export default function FeatureToggle() {
  return (
    <p className={styles.note} role="note">
      <ToggleRight size={16} aria-hidden="true" />
      <span>
        <strong>Feature toggle.</strong> Switched on per organisation — ask your BMR contact to turn it on for yours.{' '}
        {NoticeTexts.preview}
      </span>
    </p>
  );
}
