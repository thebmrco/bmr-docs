/**
 * Short, neutral notices where the docs show results, designs or product
 * data — the same points the product shows (see "BMR Legal Texts & Liability",
 * Proposal D). One line each, never a pop-up.
 *
 * The texts are drafts until agreed with the lawyer. Change them here only,
 * so every page stays in step with the product.
 *
 * Usage on any MDX page (no import needed): <Notice kind="dimensions" />
 * Several on one line: <Notice kind={['design', 'preview']} />
 */
import React from 'react';
import {Info} from 'lucide-react';
import styles from './Notice.module.css';

export const NoticeTexts = {
  dimensions: 'Dimensions are approximate. Verify on site before ordering or installing.',
  acoustics:
    'Acoustic results are indicative, not a certified measurement. They are not proof of compliance with building, workplace or accessibility requirements.',
  simulation: 'Simulation based on the room model and product data.',
  design: 'Designs and equipment lists are planning proposals. Have them checked by qualified installers before implementation.',
  catalog: 'Product data comes from the manufacturer. Check current specifications before purchase.',
  preview: 'Preview feature — it may change and may contain errors.',
} as const;

export type NoticeKind = keyof typeof NoticeTexts;

export default function Notice({kind}: {kind: NoticeKind | NoticeKind[]}) {
  const kinds = Array.isArray(kind) ? kind : [kind];
  const text = kinds
    .map(k => {
      if (!NoticeTexts[k]) {
        throw new Error(`Unknown notice "${k}". See src/components/Notice.tsx.`);
      }
      return NoticeTexts[k];
    })
    .join(' ');
  return (
    <p className={styles.notice} role="note">
      <Info size={15} aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
