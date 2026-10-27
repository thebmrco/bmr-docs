/**
 * Picture-first navigation for hub pages.
 *
 * <PictureSteps> — numbered cards, each a screenshot, a short title and an
 * optional one-line caption. The whole card links to the page that explains
 * the step. Use it where the reader needs the order of things at a glance.
 * Add `tall` for portrait screenshots (BMR Mobile, dialogs): four to a row,
 * in portrait frames. Add `pairs` as well for screenshots with small text
 * (web dialogs): two to a row, so they stay readable.
 *
 * <Slide> — one full-width illustration (for example a page of the Room
 * Capture Guide) with rounded corners and a border, used inside StepTabs.
 *
 * <LinkTiles> — icon + label tiles for "everything else" lists, so a hub page
 * ends in a grid rather than a wall of bullet points.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Icon from './Icon';
import styles from './PictureSteps.module.css';

type PictureStep = {
  title: string;
  caption?: string;
  image: string;
  alt: string;
  link?: string;
};

function StepImage({src, alt}: {src: string; alt: string}) {
  return <img src={useBaseUrl(src)} alt={alt} className={styles.stepImage} loading="lazy" />;
}

function StepCard({step, number}: {step: PictureStep; number: number}) {
  const body = (
    <>
      <div className={styles.stepImageWrap}>
        <StepImage src={step.image} alt={step.alt} />
        <span className={styles.stepNumber}>{number}</span>
      </div>
      <div className={styles.stepText}>
        <strong>{step.title}</strong>
        {step.caption && <span>{step.caption}</span>}
      </div>
    </>
  );
  return step.link ? (
    <Link to={step.link} className={styles.stepCard}>{body}</Link>
  ) : (
    <div className={styles.stepCard}>{body}</div>
  );
}

export default function PictureSteps({
  steps,
  tall = false,
  pairs = false,
}: {
  steps: PictureStep[];
  tall?: boolean;
  pairs?: boolean;
}) {
  const classes = [styles.stepGrid, tall && styles.tall, pairs && styles.pairs].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {steps.map((step, i) => (
        <StepCard key={step.title} step={step} number={i + 1} />
      ))}
    </div>
  );
}

export function Slide({src, alt}: {src: string; alt: string}) {
  return <img src={useBaseUrl(src)} alt={alt} className={styles.slide} loading="lazy" />;
}

type Tile = {label: string; icon: string; link: string};

export function LinkTiles({tiles}: {tiles: Tile[]}) {
  return (
    <div className={styles.tileGrid}>
      {tiles.map((tile) => (
        <Link key={tile.link} to={tile.link} className={styles.tile}>
          <Icon name={tile.icon} size={22} />
          <span>{tile.label}</span>
        </Link>
      ))}
    </div>
  );
}
