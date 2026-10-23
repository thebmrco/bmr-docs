/**
 * BMR illustration library — one look for every docs page.
 *
 * Available on every MDX page without an import (see src/theme/MDXComponents):
 *
 *   <Illustration name="scan" />
 *       One named drawing. Names: see the gallery at
 *       /docs/contributing/illustrations or scenes.tsx.
 *
 *   <PageIntro illustration="scan" meta={['BMR Mobile', '5 minutes']}>
 *     The first paragraph of the page.
 *   </PageIntro>
 *       The standard page opening, straight under the H1: lead text on the
 *       left, the illustration on the template's green facets on the right.
 *
 *   <IllustratedSteps steps={[{illustration, title, hint, link}]} done={[...]} />
 *       Numbered step cards for hub pages, each linking to its detail page.
 *
 *   <IconRow items={[{icon: 'Smartphone', label: 'BMR Mobile installed'}]} />
 *       A checklist as one row of icons (names listed in RowIcons below).
 *
 *   <FixList items={[{problem, fix}]} />
 *       Problem → fix, one line each, for "Stuck?" sections.
 */
import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {
  Check, Smartphone, Tablet, Laptop, Mail, Speaker, BatteryCharging, Wifi, DoorClosed,
  KeyRound, Users, Clock, Ruler, Camera, Volume2,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {Facets} from './parts';
import {Scenes} from './scenes';
import styles from './styles.module.css';

export {C, Facets} from './parts';
export {Scenes, illustrationNames} from './scenes';

export function Illustration({name, className}: {name: string; className?: string}) {
  const scene = Scenes[name];
  if (!scene) {
    throw new Error(`Unknown illustration "${name}". See src/components/illustrations/scenes.tsx.`);
  }
  return (
    <svg
      viewBox={scene.wide ? '0 0 320 170' : '0 0 160 110'}
      className={className}
      role="img"
      aria-label={scene.label}
      width="100%"
      height="100%">
      {scene.draw()}
    </svg>
  );
}

export function PageIntro({
  illustration,
  meta,
  children,
}: {
  illustration: string;
  meta?: string[];
  children: ReactNode;
}) {
  return (
    <div className={styles.intro}>
      <div className={styles.introText}>
        {children}
        {meta && meta.length > 0 && (
          <p className={styles.introMeta}>
            {meta.map((m) => <span key={m}>{m}</span>)}
          </p>
        )}
      </div>
      <div className={styles.introArt}>
        <Facets className={styles.facets} />
        <Illustration name={illustration} className={styles.introSvg} />
      </div>
    </div>
  );
}

type Step = {illustration: string; title: string; hint?: string; link?: string};

export function IllustratedSteps({steps, done}: {steps: Step[]; done?: string[]}) {
  return (
    <>
      <ol className={styles.steps} style={{'--step-count': steps.length > 5 ? 3 : steps.length} as React.CSSProperties}>
        {steps.map((s, i) => {
          const body = (
            <>
              <span className={styles.stepNumber}>{i + 1}</span>
              <Illustration name={s.illustration} className={styles.stepArt} />
              <strong>{s.title}</strong>
              {s.hint && <span className={styles.stepHint}>{s.hint}</span>}
            </>
          );
          return (
            <li key={s.title}>
              {s.link ? (
                <Link to={s.link} className={styles.step}>{body}</Link>
              ) : (
                <div className={styles.step}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
      {done && (
        <p className={styles.done}>
          <span>Done when</span>
          {done.map((d) => (
            <span key={d} className={styles.doneItem}><Check size={14} aria-hidden="true" /> {d}</span>
          ))}
        </p>
      )}
    </>
  );
}

/** Icons IconRow accepts. Add here when a page needs another one. */
const RowIcons: Record<string, LucideIcon> = {
  Smartphone, Tablet, Laptop, Mail, Speaker, BatteryCharging, Wifi, DoorClosed,
  KeyRound, Users, Clock, Ruler, Camera, Volume2,
};

export function IconRow({items}: {items: {icon: string; label: string}[]}) {
  return (
    <ul className={styles.iconRow}>
      {items.map(({icon, label}) => {
        const Icon = RowIcons[icon];
        return (
          <li key={label}>
            <span className={styles.iconCircle}>{Icon && <Icon size={22} aria-hidden="true" />}</span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}

/** Every illustration with its name, for the contributor gallery. */
export function IllustrationGallery() {
  return (
    <div className={styles.gallery}>
      {Object.entries(Scenes).map(([name, scene]) => (
        <figure key={name} className={scene.wide ? styles.galleryWide : undefined}>
          <div className={styles.galleryArt}>
            <Illustration name={name} />
          </div>
          <figcaption>
            <code>{name}</code>
            <span>{scene.label}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function FixList({items}: {items: {problem: string; fix: ReactNode}[]}) {
  return (
    <dl className={styles.fixList}>
      {items.map((f) => (
        <div key={f.problem}>
          <dt>{f.problem}</dt>
          <dd>{f.fix}</dd>
        </div>
      ))}
    </dl>
  );
}
